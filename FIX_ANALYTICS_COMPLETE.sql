-- ============================================================================
-- COMPLETE ANALYTICS FIX
-- 1. Update subscription to correct plan (gaming)
-- 2. Fix MRR/ARR functions with correct pricing
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Update the subscription to reflect the correct plan
UPDATE subscriptions
SET plan = 'gaming'
WHERE stripe_customer_id = 'cus_THgwBfHm86wmIx'
  AND plan = 'personal';

-- Step 2: Drop old functions
DROP FUNCTION IF EXISTS mrr_total_cents();
DROP FUNCTION IF EXISTS arr_total_cents();

-- Step 3: Create MRR function with correct Gaming pricing
CREATE FUNCTION mrr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      -- Personal monthly: $9.99
      WHEN plan = 'personal' AND billing_period = 'monthly' THEN 999
      -- Personal annual: $99/year = $8.25/month
      WHEN plan = 'personal' AND billing_period = 'annual' THEN 9900 / 12

      -- Gaming monthly: $14.99
      WHEN plan = 'gaming' AND billing_period = 'monthly' THEN 1499
      -- Gaming annual: $149/year = $12.42/month
      WHEN plan = 'gaming' AND billing_period = 'annual' THEN 14900 / 12

      -- Business monthly: $19.99
      WHEN plan = 'business' AND billing_period = 'monthly' THEN 1999
      -- Business annual: $199/year = $16.58/month
      WHEN plan = 'business' AND billing_period = 'annual' THEN 19900 / 12

      -- Fallback
      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions
  WHERE status = 'active';
$$;

-- Step 4: Create ARR function
CREATE FUNCTION arr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      -- Personal monthly: $9.99 * 12 = $119.88/year
      WHEN plan = 'personal' AND billing_period = 'monthly' THEN 999 * 12
      -- Personal annual: $99/year
      WHEN plan = 'personal' AND billing_period = 'annual' THEN 9900

      -- Gaming monthly: $14.99 * 12 = $179.88/year
      WHEN plan = 'gaming' AND billing_period = 'monthly' THEN 1499 * 12
      -- Gaming annual: $149/year
      WHEN plan = 'gaming' AND billing_period = 'annual' THEN 14900

      -- Business monthly: $19.99 * 12 = $239.88/year
      WHEN plan = 'business' AND billing_period = 'monthly' THEN 1999 * 12
      -- Business annual: $199/year
      WHEN plan = 'business' AND billing_period = 'annual' THEN 19900

      -- Fallback
      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions
  WHERE status = 'active';
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated, anon;

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ Subscription updated to Gaming plan';
  RAISE NOTICE '✅ Analytics functions created with correct pricing';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected results:';
  RAISE NOTICE '  MRR: $14.99 (Gaming monthly)';
  RAISE NOTICE '  ARR: $179.88 (Gaming monthly * 12)';
END $$;
