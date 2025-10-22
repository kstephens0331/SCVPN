-- Fix VPS RLS policies to allow admin access

-- First, remove duplicate vps_hosts entries (keep newest)
DELETE FROM vps_hosts
WHERE id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY ip ORDER BY created_at ASC) as rn
    FROM vps_hosts
  ) t
  WHERE rn > 1
);

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all vps_hosts" ON vps_hosts;
DROP POLICY IF EXISTS "Admins can view all vps_metrics" ON vps_metrics;
DROP POLICY IF EXISTS "Service role can insert vps_metrics" ON vps_metrics;
DROP POLICY IF EXISTS "Service role can insert device_telemetry" ON device_telemetry;

-- Create admin view policies using is_admin function
CREATE POLICY "Admins can view all vps_hosts"
  ON vps_hosts FOR SELECT
  USING (is_admin(auth.jwt()->>'email'));

CREATE POLICY "Admins can view all vps_metrics"
  ON vps_metrics FOR SELECT
  USING (is_admin(auth.jwt()->>'email'));

-- Allow service role to insert metrics (for monitoring scripts)
CREATE POLICY "Service role can insert vps_metrics"
  ON vps_metrics FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert device_telemetry"
  ON device_telemetry FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Verify policies
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('vps_hosts', 'vps_metrics', 'device_telemetry')
ORDER BY tablename, policyname;

-- Verify hosts are visible
SELECT * FROM vps_hosts;
