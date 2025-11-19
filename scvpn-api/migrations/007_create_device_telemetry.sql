-- Device Telemetry Table
-- Stores real-time WireGuard connection status for all devices
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

  -- Primary key on device_id (one record per device - latest status)
  PRIMARY KEY (device_id)
);

-- Index for querying by node
CREATE INDEX IF NOT EXISTS device_telemetry_node_id_idx ON device_telemetry(node_id);

-- Index for querying by connection status
CREATE INDEX IF NOT EXISTS device_telemetry_is_connected_idx ON device_telemetry(is_connected);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS device_telemetry_recorded_at_idx ON device_telemetry(recorded_at DESC);

-- Enable RLS
ALTER TABLE device_telemetry ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all telemetry
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

-- Policy: Service role can insert/update (for telemetry collector)
CREATE POLICY "Service role can manage device_telemetry"
  ON device_telemetry
  FOR ALL
  USING (true);

-- Create or replace the view (if it exists, recreate it)
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

COMMENT ON TABLE device_telemetry IS 'Latest WireGuard connection status for each device';
COMMENT ON VIEW device_latest_telemetry IS 'Read-only view of latest device telemetry (for backward compatibility)';
