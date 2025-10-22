-- Create a function to insert/update subscriptions that bypasses RLS
-- Run this in Supabase SQL Editor BEFORE testing checkout

CREATE OR REPLACE FUNCTION insert_subscription(
  p_stripe_subscription_id TEXT,
  p_stripe_customer_id TEXT,
  p_user_id UUID,
  p_plan TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_renews_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with elevated privileges, bypassing RLS
AS $$
DECLARE
  v_subscription_id UUID;
  v_result JSON;
BEGIN
  -- Check if subscription already exists
  SELECT id INTO v_subscription_id
  FROM subscriptions
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  IF v_subscription_id IS NOT NULL THEN
    -- Update existing subscription
    UPDATE subscriptions
    SET
      stripe_customer_id = p_stripe_customer_id,
      user_id = p_user_id,
      plan = p_plan,
      status = p_status,
      current_period_start = p_current_period_start,
      current_period_end = p_current_period_end,
      renews_at = p_renews_at,
      updated_at = NOW()
    WHERE id = v_subscription_id
    RETURNING json_build_object(
      'id', id,
      'stripe_subscription_id', stripe_subscription_id,
      'user_id', user_id,
      'plan', plan,
      'status', status
    ) INTO v_result;

    RETURN json_build_object(
      'success', true,
      'action', 'updated',
      'data', v_result
    );
  ELSE
    -- Insert new subscription
    INSERT INTO subscriptions (
      stripe_subscription_id,
      stripe_customer_id,
      user_id,
      plan,
      status,
      current_period_start,
      current_period_end,
      renews_at,
      created_at,
      updated_at
    ) VALUES (
      p_stripe_subscription_id,
      p_stripe_customer_id,
      p_user_id,
      p_plan,
      p_status,
      p_current_period_start,
      p_current_period_end,
      p_renews_at,
      NOW(),
      NOW()
    )
    RETURNING json_build_object(
      'id', id,
      'stripe_subscription_id', stripe_subscription_id,
      'user_id', user_id,
      'plan', plan,
      'status', status
    ) INTO v_result;

    RETURN json_build_object(
      'success', true,
      'action', 'inserted',
      'data', v_result
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permission to authenticated and service_role
GRANT EXECUTE ON FUNCTION insert_subscription TO authenticated, service_role, anon;

-- Test the function
SELECT insert_subscription(
  'test_sub_' || gen_random_uuid()::TEXT,
  'test_cus_123',
  (SELECT id FROM profiles LIMIT 1),
  'personal',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
);

-- Clean up test data
DELETE FROM subscriptions WHERE stripe_customer_id = 'test_cus_123';
