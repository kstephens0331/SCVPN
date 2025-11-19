-- Analytics RPC Functions for SACVPN
-- Run this in Supabase SQL Editor to enable analytics dashboard

-- 1. Revenue in time window (returns total cents)
CREATE OR REPLACE FUNCTION revenue_window(days INTEGER)
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(amount_cents), 0)::BIGINT
  FROM invoices
  WHERE paid_at >= NOW() - (days || ' days')::INTERVAL
    AND paid_at IS NOT NULL;
$$;

-- 2. New subscriptions in time window
CREATE OR REPLACE FUNCTION new_subscriptions_window(days INTEGER)
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::BIGINT
  FROM subscriptions
  WHERE created_at >= NOW() - (days || ' days')::INTERVAL;
$$;

-- 3. Cancellations in time window
CREATE OR REPLACE FUNCTION cancels_window(days INTEGER)
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::BIGINT
  FROM subscriptions
  WHERE canceled_at >= NOW() - (days || ' days')::INTERVAL
    AND canceled_at IS NOT NULL;
$$;

-- 4. Current MRR (Monthly Recurring Revenue) in cents
CREATE OR REPLACE FUNCTION mrr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN billing_period = 'monthly' THEN 599  -- $5.99/month
      WHEN billing_period = 'annual' THEN 4992 / 12  -- $49.92/year = $4.16/month
      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions
  WHERE status = 'active';
$$;

-- 5. ARR (Annual Recurring Revenue) in cents
CREATE OR REPLACE FUNCTION arr_total_cents()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN billing_period = 'monthly' THEN 599 * 12  -- $5.99/month * 12
      WHEN billing_period = 'annual' THEN 4992  -- $49.92/year
      ELSE 0
    END
  ), 0)::BIGINT
  FROM subscriptions
  WHERE status = 'active';
$$;

-- 6. ARPU (Average Revenue Per User) in time window
CREATE OR REPLACE FUNCTION arpu_cents(days INTEGER)
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    (SUM(amount_cents) / NULLIF(COUNT(DISTINCT user_id), 0))::BIGINT,
    0
  )
  FROM invoices
  WHERE paid_at >= NOW() - (days || ' days')::INTERVAL
    AND paid_at IS NOT NULL;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION revenue_window(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION new_subscriptions_window(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cancels_window(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated;
GRANT EXECUTE ON FUNCTION arpu_cents(INTEGER) TO authenticated;

-- Also grant to anon for admin dashboard
GRANT EXECUTE ON FUNCTION revenue_window(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION new_subscriptions_window(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION cancels_window(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO anon;
GRANT EXECUTE ON FUNCTION arpu_cents(INTEGER) TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Analytics functions created successfully!';
  RAISE NOTICE 'You can now use the analytics dashboard.';
END $$;
