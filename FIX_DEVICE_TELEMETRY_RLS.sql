-- ============================================================================
-- FIX DEVICE TELEMETRY RLS - Allow users to view their own device status
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add policy to allow users to view their OWN device telemetry
-- (Currently only admins can see device_telemetry, but users need to see their own devices' status)

-- First, check if the policy exists and drop it if it does
DROP POLICY IF EXISTS "Users can view own device telemetry" ON device_telemetry;

-- Create policy to allow users to view telemetry for devices they own
CREATE POLICY "Users can view own device telemetry"
  ON device_telemetry
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_telemetry.device_id
      AND (
        -- Personal device (user owns it directly)
        devices.user_id = auth.uid()
        OR
        -- Business device (user is member of the org)
        EXISTS (
          SELECT 1 FROM org_members
          WHERE org_members.org_id = devices.org_id
          AND org_members.user_id = auth.uid()
        )
      )
    )
  );

-- Step 2: Also add policy for business admins to see all org device telemetry
DROP POLICY IF EXISTS "Org admins can view org device telemetry" ON device_telemetry;

CREATE POLICY "Org admins can view org device telemetry"
  ON device_telemetry
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM devices
      JOIN org_members ON org_members.org_id = devices.org_id
      WHERE devices.id = device_telemetry.device_id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- SUCCESS!
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Device telemetry RLS policies updated successfully!';
  RAISE NOTICE 'Users can now see the online status of their own devices.';
  RAISE NOTICE 'Org admins can see the online status of all org devices.';
END $$;
