-- URGENT FIX: Update plan constraint to allow our actual plan codes
-- Run this NOW in Supabase SQL Editor

-- Drop the old constraint that only allows free/pro/business/enterprise
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_plan_check;

-- Add new constraint with our actual plan codes
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN (
    'personal',      -- Our actual plans
    'gaming',
    'business10',
    'business50',
    'business250',
    'free',         -- Keep these for backwards compatibility
    'pro',
    'business',
    'enterprise',
    'unknown'       -- Fallback value
  ));

-- Verify it worked
SELECT
  'Constraint updated successfully' AS status,
  pg_get_constraintdef(oid) AS new_definition
FROM pg_constraint
WHERE conname = 'subscriptions_plan_check';

-- Test that 'personal' now works
SELECT 'Testing personal plan...' AS step;

SELECT insert_subscription(
  'test_personal_' || gen_random_uuid()::TEXT,
  'test_cus_personal',
  (SELECT id FROM profiles LIMIT 1),
  'personal',  -- This should work now!
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
);

-- Clean up test
DELETE FROM subscriptions WHERE stripe_customer_id = 'test_cus_personal';

SELECT '✅ Done! Try checkout again.' AS result;
