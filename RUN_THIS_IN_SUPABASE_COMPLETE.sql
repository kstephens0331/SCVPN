-- ============================================================================
-- SACVPN COMPLETE DATABASE SETUP
-- This file creates both telemetry and analytics systems
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
-- ============================================================================

-- ============================================================================
-- PART 1: DEVICE TELEMETRY SYSTEM - COMPLETE REBUILD
-- ============================================================================

-- Step 1: Drop everything that might exist
DROP VIEW IF EXISTS device_latest_telemetry CASCADE;
DROP TABLE IF EXISTS device_telemetry CASCADE;

-- Step 2: Create the device_telemetry table (stores latest connection status for each device)
CREATE TABLE device_telemetry (
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES vpn_nodes(id) ON DELETE CASCADE,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  client_ip INET,
  client_vpn_ip INET,
  last_handshake TIMESTAMPTZ,
  bytes_received BIGINT DEFAULT 0,
  bytes_sent BIGINT DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX device_telemetry_node_id_idx ON device_telemetry(node_id);
CREATE INDEX device_telemetry_is_connected_idx ON device_telemetry(is_connected);
CREATE INDEX device_telemetry_recorded_at_idx ON device_telemetry(recorded_at DESC);

-- Step 4: Enable RLS
ALTER TABLE device_telemetry ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
CREATE POLICY "Admins can view all device_telemetry"
  ON device_telemetry
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage device_telemetry"
  ON device_telemetry
  FOR ALL
  USING (true);

-- Step 6: Create the view
CREATE VIEW device_latest_telemetry AS
SELECT
  device_id,
  node_id,
  is_connected,
  client_ip,
  client_vpn_ip,
  last_handshake,
  bytes_received,
  bytes_sent,
  recorded_at
FROM device_telemetry
ORDER BY recorded_at DESC;

COMMENT ON TABLE device_telemetry IS 'Latest WireGuard connection status for each device';
COMMENT ON VIEW device_latest_telemetry IS 'Read-only view of latest device telemetry';

-- ============================================================================
-- PART 2: ANALYTICS RPC FUNCTIONS
-- ============================================================================

-- Drop existing functions if they have wrong return types
DROP FUNCTION IF EXISTS revenue_window(INTEGER);
DROP FUNCTION IF EXISTS new_subscriptions_window(INTEGER);
DROP FUNCTION IF EXISTS cancels_window(INTEGER);
DROP FUNCTION IF EXISTS mrr_total_cents();
DROP FUNCTION IF EXISTS arr_total_cents();
DROP FUNCTION IF EXISTS arpu_cents(INTEGER);

-- 1. Revenue in time window (returns total cents)
CREATE FUNCTION revenue_window(days INTEGER)
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
CREATE FUNCTION new_subscriptions_window(days INTEGER)
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::BIGINT
  FROM subscriptions
  WHERE created_at >= NOW() - (days || ' days')::INTERVAL;
$$;

-- 3. Cancellations in time window
CREATE FUNCTION cancels_window(days INTEGER)
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
CREATE FUNCTION mrr_total_cents()
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
CREATE FUNCTION arr_total_cents()
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
CREATE FUNCTION arpu_cents(days INTEGER)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION revenue_window(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION new_subscriptions_window(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cancels_window(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mrr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arr_total_cents() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION arpu_cents(INTEGER) TO authenticated, anon;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Device telemetry table created successfully!';
  RAISE NOTICE '✅ Analytics functions created successfully!';
  RAISE NOTICE '✅ Your admin dashboard is now ready to use!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Telemetry data will start populating automatically from your VPN servers';
  RAISE NOTICE '2. Analytics dashboard will show new subscriptions and revenue';
  RAISE NOTICE '3. Check /admin/telemetry to see live device connections';
  RAISE NOTICE '4. Check /admin/analytics to see business metrics';
END $$;
