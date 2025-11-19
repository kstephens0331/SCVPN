-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- This creates the device_telemetry table needed for the telemetry system

-- Step 1: Create the device_telemetry table
CREATE TABLE IF NOT EXISTS device_telemetry (
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS device_telemetry_node_id_idx ON device_telemetry(node_id);
CREATE INDEX IF NOT EXISTS device_telemetry_is_connected_idx ON device_telemetry(is_connected);
CREATE INDEX IF NOT EXISTS device_telemetry_recorded_at_idx ON device_telemetry(recorded_at DESC);

-- Step 3: Enable RLS
ALTER TABLE device_telemetry ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DROP POLICY IF EXISTS "Admins can view all device_telemetry" ON device_telemetry;
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

DROP POLICY IF EXISTS "Service role can manage device_telemetry" ON device_telemetry;
CREATE POLICY "Service role can manage device_telemetry"
  ON device_telemetry
  FOR ALL
  USING (true);

-- Step 5: Recreate the view
DROP VIEW IF EXISTS device_latest_telemetry;
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

-- Done! You should see a success message.
