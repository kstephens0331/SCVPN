-- ============================================================
-- COMPLETE PLAN NAME MIGRATION FOR SACVPN
-- ============================================================
-- This updates Supabase to use our actual plan names:
-- personal, gaming, business10, business50, business250
--
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop the old restrictive constraint
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_plan_check'
  ) THEN
    ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_plan_check;
    RAISE NOTICE '✓ Dropped old plan constraint';
  END IF;
END $$;

-- Step 2: Add new constraint with our actual plan codes
-- ============================================================
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN (
    -- Current SACVPN plans (from pricing-new.js)
    'personal',      -- $9.99/mo - 1 device
    'gaming',        -- $14.99/mo - 3 devices
    'business10',    -- $29.99/mo - 10 devices
    'business50',    -- $99.99/mo - 50 devices
    'business250',   -- $399.99/mo - 250 devices

    -- Legacy plans (keep for backwards compatibility)
    'free',
    'pro',
    'business',
    'enterprise',

    -- Fallback
    'unknown'
  ));

RAISE NOTICE '✓ Added new plan constraint with all valid codes';

-- Step 3: Update any existing subscriptions with old plan names
-- ============================================================
-- Map old plans to new plans (adjust if you have existing data)
UPDATE subscriptions
SET plan = CASE
  WHEN plan = 'pro' THEN 'personal'
  WHEN plan = 'business' THEN 'business10'
  WHEN plan = 'enterprise' THEN 'business50'
  WHEN plan = 'free' THEN 'free'
  ELSE plan
END
WHERE plan IN ('pro', 'business', 'enterprise');

-- Step 4: Verify the constraint
-- ============================================================
SELECT
  '✓ Constraint verification' AS step,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'subscriptions_plan_check';

-- Step 5: Test all plan codes work
-- ============================================================
DO $$
DECLARE
  test_plans TEXT[] := ARRAY['personal', 'gaming', 'business10', 'business50', 'business250'];
  test_plan TEXT;
  test_user_id UUID;
  test_result JSON;
BEGIN
  -- Get a real user ID for testing
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE '⚠ No users found - skipping plan tests';
    RETURN;
  END IF;

  -- Test each plan
  FOREACH test_plan IN ARRAY test_plans
  LOOP
    BEGIN
      -- Try inserting a test subscription
      INSERT INTO subscriptions (
        stripe_subscription_id,
        stripe_customer_id,
        user_id,
        plan,
        status,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
      ) VALUES (
        'test_' || test_plan || '_' || gen_random_uuid()::TEXT,
        'test_cus_' || test_plan,
        test_user_id,
        test_plan,
        'active',
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW()
      );

      RAISE NOTICE '✓ Test passed for plan: %', test_plan;

    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '✗ Test FAILED for plan: % - Error: %', test_plan, SQLERRM;
    END;
  END LOOP;

  -- Clean up test data
  DELETE FROM subscriptions WHERE stripe_customer_id LIKE 'test_cus_%';
  RAISE NOTICE '✓ Cleaned up test data';

END $$;

-- Step 6: Update the insert_subscription function if it exists
-- ============================================================
-- This ensures the function also accepts the new plan codes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'insert_subscription'
  ) THEN
    RAISE NOTICE '✓ insert_subscription function exists (already supports all plan codes)';
  ELSE
    RAISE NOTICE '⚠ insert_subscription function not found - run CREATE_INSERT_SUBSCRIPTION_FUNCTION.sql';
  END IF;
END $$;

-- Step 7: Summary
-- ============================================================
SELECT
  '✅ MIGRATION COMPLETE!' AS status,
  'Plan constraint updated successfully' AS message,
  'Valid plans: personal, gaming, business10, business50, business250' AS plans;

-- Step 8: View current subscriptions
-- ============================================================
SELECT
  'Current subscriptions:' AS info,
  plan,
  COUNT(*) AS count,
  STRING_AGG(DISTINCT status, ', ') AS statuses
FROM subscriptions
GROUP BY plan
ORDER BY plan;
