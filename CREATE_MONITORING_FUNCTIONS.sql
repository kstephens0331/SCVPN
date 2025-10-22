-- Create helper functions for monitoring scripts

-- Function to get node ID by name
CREATE OR REPLACE FUNCTION get_node_id_by_name(node_name TEXT)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT vpn_nodes.id
  FROM vpn_nodes
  WHERE vpn_nodes.name = node_name
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get device ID by public key
CREATE OR REPLACE FUNCTION get_device_by_pubkey(pub_key TEXT)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT device_configs.device_id as id
  FROM device_configs
  WHERE device_configs.public_key = pub_key
  AND device_configs.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get VPS host ID by IP address
CREATE OR REPLACE FUNCTION get_host_id_by_ip(host_ip TEXT)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT vps_hosts.id
  FROM vps_hosts
  WHERE vps_hosts.ip::text = host_ip
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION get_node_id_by_name(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_device_by_pubkey(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_host_id_by_ip(TEXT) TO service_role;

-- Allow service role to insert telemetry and metrics
GRANT INSERT ON device_telemetry TO service_role;
GRANT INSERT ON vps_metrics TO service_role;
