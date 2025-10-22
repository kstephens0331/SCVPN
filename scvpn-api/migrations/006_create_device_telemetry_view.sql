-- Create device_latest_telemetry view
-- This view shows the most recent telemetry data for each device
CREATE OR REPLACE VIEW device_latest_telemetry AS
SELECT DISTINCT ON (device_id)
  device_id,
  ts,
  rx_packets,
  tx_packets,
  rx_bytes,
  tx_bytes,
  latency_ms,
  endpoint,
  is_connected
FROM telemetry
ORDER BY device_id, ts DESC;

COMMENT ON VIEW device_latest_telemetry IS 'Latest telemetry snapshot for each device';

-- Grant access to authenticated users (admin will see via RLS)
GRANT SELECT ON device_latest_telemetry TO authenticated;
