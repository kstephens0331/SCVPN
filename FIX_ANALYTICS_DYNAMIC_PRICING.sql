-- ============================================================================
-- FIX ANALYTICS TO USE DYNAMIC PRICING
-- This replaces hardcoded prices with actual data from invoices and Stripe
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop the old hardcoded functions
DROP FUNCTION IF EXISTS mrr_total_cents();
DROP FUNCTION IF EXISTS arr_total_cents();

-- NEW: MRR calculated from actual invoice data
-- Get the most recent monthly charge for each active subscription
CREATE FUNCTION mrr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  WITH latest_charges AS (
    SELECT DISTINCT ON (s.id)
      s.id as subscription_id,
      s.billing_period,
      i.amount_cents
    FROM subscriptions s
    LEFT JOIN invoices i ON i.user_id = s.user_id
    WHERE s.status = 'active'
      AND i.paid_at IS NOT NULL
    ORDER BY s.id, i.paid_at DESC
  )
  SELECT COALESCE(SUM(
    CASE
      WHEN billing_period = 'monthly' THEN amount_cents
      WHEN billing_period = 'annual' THEN amount_cents / 12  -- Convert annual to monthly
      ELSE amount_cents  -- Fallback to actual charge
    END
  ), 0)::BIGINT
  FROM latest_charges;
$$;

-- NEW: ARR calculated from actual invoice data
CREATE FUNCTION arr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  WITH latest_charges AS (
    SELECT DISTINCT ON (s.id)
      s.id as subscription_id,
      s.billing_period,
      i.amount_cents
    FROM subscriptions s
    LEFT JOIN invoices i ON i.user_id = s.user_id
    WHERE s.status = 'active'
      AND i.paid_at IS NOT NULL
    ORDER BY s.id, i.paid_at DESC
  )
  SELECT COALESCE(SUM(
    CASE
      WHEN billing_period = 'monthly' THEN amount_cents * 12  -- Convert monthly to annual
      WHEN billing_period = 'annual' THEN amount_cents
      ELSE amount_cents * 12  -- Fallback assuming monthly
    END
  ), 0)::BIGINT
  FROM latest_charges;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated, anon;

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics functions updated to use dynamic pricing!';
  RAISE NOTICE 'MRR and ARR now calculated from actual invoice data.';
END $$;
