# Debug Subscription Insert Issue

## Test in Supabase SQL Editor

Run this to test if a direct insert works:

```sql
-- Test insert with all fields
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
  'test_sub_123',
  'test_cus_123',
  (SELECT id FROM profiles LIMIT 1), -- Use a real user ID
  'personal',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
);

-- Check if it was inserted
SELECT * FROM subscriptions WHERE stripe_subscription_id = 'test_sub_123';

-- Clean up
DELETE FROM subscriptions WHERE stripe_subscription_id = 'test_sub_123';
```

## If that works, test via API

The issue is likely:
1. **RLS Policy blocking insert** - Service role should bypass this
2. **Missing NOT NULL constraints** - Table allows nulls but API expects them
3. **Trigger or function preventing insert** - Check for triggers

## Check RLS Policies

```sql
-- View all policies on subscriptions table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'subscriptions';
```

## Check for Triggers

```sql
-- Check if there are any triggers that might be blocking
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'subscriptions';
```

## Most Likely Issue: RLS Policy

Even with service_role, if the policy is restrictive, it might block. Run this:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Try your checkout flow now

-- Re-enable RLS after testing
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- If that works, fix the policy:
DROP POLICY IF EXISTS "Service role full access" ON subscriptions;

CREATE POLICY "Service role full access"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```
