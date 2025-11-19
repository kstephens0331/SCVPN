-- ============================================================================
-- FIX ANALYTICS TO READ FROM SUBSCRIPTIONS (NOT INVOICES)
-- Since invoices don't have user_id, calculate MRR/ARR from active subscriptions
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop the invoice-based functions
DROP FUNCTION IF EXISTS mrr_total_cents();
DROP FUNCTION IF EXISTS arr_total_cents();

-- NEW: MRR from active subscriptions with proper pricing
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

-- NEW: ARR from active subscriptions
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated, anon;

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics functions updated!';
  RAISE NOTICE 'MRR and ARR now read from subscriptions table.';
  RAISE NOTICE '';
  RAISE NOTICE 'Pricing:';
  RAISE NOTICE '  Personal: $9.99/mo or $99/yr';
  RAISE NOTICE '  Gaming: $14.99/mo or $149/yr';
  RAISE NOTICE '  Business: $19.99/mo or $199/yr';
END $$;
