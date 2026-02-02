-- Fix telemetry view to include user info for admin dashboard
-- This enables admins to see ALL clients, not just their own devices

-- Step 1: Drop existing policies and recreate
DROP POLICY IF EXISTS "Admins can view all device_telemetry" ON device_telemetry;
DROP POLICY IF EXISTS "Service role can manage device_telemetry" ON device_telemetry;
DROP POLICY IF EXISTS "Users can view own device telemetry" ON device_telemetry;
DROP POLICY IF EXISTS "admin_view_all_telemetry" ON device_telemetry;
DROP POLICY IF EXISTS "service_role_manage_telemetry" ON device_telemetry;
DROP POLICY IF EXISTS "users_view_own_telemetry" ON device_telemetry;

-- Step 2: Create admin policy - admins see ALL telemetry
CREATE POLICY "admin_view_all_telemetry"
  ON device_telemetry
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR auth.jwt() ->> 'email' = 'info@stephenscode.dev'
  );

-- Step 3: Service role full access (for edge functions)
CREATE POLICY "service_role_manage_telemetry"
  ON device_telemetry
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 4: Users can view their own telemetry
CREATE POLICY "users_view_own_telemetry"
  ON device_telemetry
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM devices
      WHERE devices.id = device_telemetry.device_id
      AND devices.user_id = auth.uid()
    )
  );

-- Step 5: Recreate view with user info (JOINs devices and auth.users)
DROP VIEW IF EXISTS device_latest_telemetry;

CREATE VIEW device_latest_telemetry AS
SELECT
  dt.device_id,
  dt.node_id,
  dt.is_connected,
  dt.client_ip,
  dc.client_ip as client_vpn_ip,
  dt.last_handshake,
  dt.bytes_received,
  dt.bytes_sent,
  dt.recorded_at,
  d.user_id,
  d.name as device_name,
  d.platform,
  au.email as user_email
FROM device_telemetry dt
LEFT JOIN device_configs dc ON dc.device_id = dt.device_id
LEFT JOIN devices d ON d.id = dt.device_id
LEFT JOIN auth.users au ON au.id = d.user_id
ORDER BY dt.recorded_at DESC;

-- Step 6: Grant access
GRANT SELECT ON device_latest_telemetry TO authenticated;
GRANT SELECT ON device_latest_telemetry TO anon;

-- Step 7: Seed telemetry for devices without entries
DO $$
DECLARE
  first_node_id UUID;
BEGIN
  SELECT id INTO first_node_id FROM vpn_nodes WHERE is_active = true LIMIT 1;
  IF first_node_id IS NULL THEN
    SELECT id INTO first_node_id FROM vpn_nodes LIMIT 1;
  END IF;

  IF first_node_id IS NOT NULL THEN
    INSERT INTO device_telemetry (device_id, node_id, is_connected, recorded_at)
    SELECT
      d.id as device_id,
      COALESCE(dc.node_id, first_node_id),
      false as is_connected,
      now()
    FROM devices d
    LEFT JOIN device_configs dc ON dc.device_id = d.id
    WHERE NOT EXISTS (
      SELECT 1 FROM device_telemetry dt WHERE dt.device_id = d.id
    )
    ON CONFLICT (device_id) DO NOTHING;
  END IF;
END $$;
