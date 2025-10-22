-- Fix the plan check constraint issue
-- Run this in Supabase SQL Editor NOW

-- First, see what the current constraint expects
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'subscriptions_plan_check';

-- Drop the restrictive check constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- Optionally, add a more permissive constraint that allows all our plan codes
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('personal', 'gaming', 'business10', 'business50', 'business250', 'free', 'unknown'));

-- Verify the constraint was updated
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'subscriptions_plan_check';

-- Test that 'personal' now works
SELECT insert_subscription(
  'test_sub_' || gen_random_uuid()::TEXT,
  'test_cus_123',
  (SELECT id FROM profiles LIMIT 1),
  'personal',  -- This should work now
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
);

-- Clean up test
DELETE FROM subscriptions WHERE stripe_customer_id = 'test_cus_123';
