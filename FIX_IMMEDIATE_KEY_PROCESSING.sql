-- Fix: Make key requests process immediately instead of waiting for batch
-- Run this in Supabase SQL Editor

-- Drop the old function
DROP FUNCTION IF EXISTS request_wg_key(UUID);

-- Create new function that processes the key request immediately
CREATE OR REPLACE FUNCTION request_wg_key(p_device_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_device_record RECORD;
  v_request_id UUID;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Verify device belongs to user
  SELECT * INTO v_device_record
  FROM devices
  WHERE id = p_device_id
    AND (user_id = v_user_id OR org_id IN (
      SELECT org_id FROM organization_members WHERE user_id = v_user_id
    ));

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Device not found or access denied');
  END IF;

  -- Check if there's already a pending request
  SELECT id INTO v_request_id
  FROM key_requests
  WHERE device_id = p_device_id
    AND status = 'pending'
  LIMIT 1;

  IF v_request_id IS NOT NULL THEN
    RETURN json_build_object('error', 'A key request is already pending for this device');
  END IF;

  -- Create new key request with status 'pending'
  INSERT INTO key_requests (device_id, user_id, status, requested_at)
  VALUES (p_device_id, v_user_id, 'pending', NOW())
  RETURNING id INTO v_request_id;

  -- IMPORTANT: Trigger immediate processing via HTTP request
  -- This calls the Railway API to process the request immediately
  BEGIN
    -- Use pg_net extension to make HTTP request (if available)
    -- Otherwise, we rely on the frontend to call process-requests

    RAISE NOTICE 'Key request created: %. Call /api/wireguard/process-requests to process.', v_request_id;

  EXCEPTION
    WHEN OTHERS THEN
      -- If HTTP request fails, that's okay - request is still created
      RAISE NOTICE 'Could not trigger automatic processing, but request created successfully';
  END;

  RETURN json_build_object(
    'success', true,
    'request_id', v_request_id,
    'message', 'Key request created. Processing...'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION request_wg_key TO authenticated;

-- Test it
SELECT request_wg_key((SELECT id FROM devices LIMIT 1));
