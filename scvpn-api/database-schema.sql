-- Database schema for WireGuard VPN management
-- Run these in your Supabase SQL editor

-- VPN Nodes table
CREATE TABLE IF NOT EXISTS vpn_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL, -- e.g., 'us-east', 'eu-west'
  public_ip INET NOT NULL,
  port INTEGER DEFAULT 51820,
  interface_name VARCHAR(20) DEFAULT 'wg0',
  public_key TEXT NOT NULL, -- WireGuard public key of the server
  client_subnet CIDR NOT NULL, -- e.g., '10.8.0.0/24'
  dns_servers TEXT DEFAULT '1.1.1.1,8.8.8.8',
  max_clients INTEGER DEFAULT 1000,
  current_clients INTEGER DEFAULT 0,
  management_type VARCHAR(20) DEFAULT 'ssh', -- 'ssh' or 'api'
  ssh_host TEXT,
  ssh_user VARCHAR(50) DEFAULT 'root',
  ssh_port INTEGER DEFAULT 22,
  api_endpoint TEXT,
  api_token TEXT,
  is_active BOOLEAN DEFAULT true,
  is_healthy BOOLEAN DEFAULT false,
  last_health_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device WireGuard configurations
CREATE TABLE IF NOT EXISTS device_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES vpn_nodes(id),
  private_key TEXT NOT NULL, -- WireGuard private key (encrypted)
  public_key TEXT NOT NULL, -- WireGuard public key
  client_ip INET NOT NULL, -- Assigned VPN IP
  dns_servers TEXT DEFAULT '1.1.1.1,8.8.8.8',
  allowed_ips TEXT DEFAULT '0.0.0.0/0,::/0',
  persistent_keepalive INTEGER DEFAULT 25,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(device_id), -- One config per device
  UNIQUE(node_id, client_ip) -- No IP conflicts per node
);

-- Device telemetry (connection status)
CREATE TABLE IF NOT EXISTS device_telemetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES vpn_nodes(id),
  is_connected BOOLEAN NOT NULL,
  client_ip INET,
  last_handshake TIMESTAMP WITH TIME ZONE,
  bytes_received BIGINT DEFAULT 0,
  bytes_sent BIGINT DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Latest telemetry view for quick lookups
CREATE OR REPLACE VIEW device_latest_telemetry AS
SELECT DISTINCT ON (device_id)
  device_id,
  node_id,
  is_connected,
  client_ip,
  last_handshake,
  bytes_received,
  bytes_sent,
  recorded_at
FROM device_telemetry
ORDER BY device_id, recorded_at DESC;

-- Key request queue (for async processing)
CREATE TABLE IF NOT EXISTS key_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_node_id UUID REFERENCES vpn_nodes(id),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_configs_device_id ON device_configs(device_id);
CREATE INDEX IF NOT EXISTS idx_device_configs_user_id ON device_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_device_configs_node_id ON device_configs(node_id);
CREATE INDEX IF NOT EXISTS idx_device_telemetry_device_id ON device_telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_key_requests_status ON key_requests(status);
CREATE INDEX IF NOT EXISTS idx_key_requests_user_id ON key_requests(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE vpn_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- VPN Nodes: Admins can see all, users can see basic info only
CREATE POLICY "Admin full access to vpn_nodes" ON vpn_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_emails 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

CREATE POLICY "Users can view basic node info" ON vpn_nodes
  FOR SELECT USING (is_active = true);

-- Device Configs: Users can only see their own
CREATE POLICY "Users can view own device configs" ON device_configs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own device configs" ON device_configs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin full access to device_configs" ON device_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_emails 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- Device Telemetry: Users can see their own devices
CREATE POLICY "Users can view own device telemetry" ON device_telemetry
  FOR SELECT USING (
    device_id IN (
      SELECT id FROM devices WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to device_telemetry" ON device_telemetry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_emails 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- Key Requests: Users can see their own requests
CREATE POLICY "Users can view own key requests" ON key_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own key requests" ON key_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Supabase Functions

-- Function to request WireGuard key (called from frontend)
CREATE OR REPLACE FUNCTION request_wg_key(p_device_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_device_record RECORD;
  v_request_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;
  
  -- Verify device belongs to user
  SELECT * INTO v_device_record
  FROM devices 
  WHERE id = p_device_id 
    AND (user_id = v_user_id OR org_id IN (
      SELECT org_id FROM org_members WHERE user_id = v_user_id
    ));
    
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Device not found or access denied');
  END IF;
  
  -- Check if device already has an active config
  IF EXISTS (
    SELECT 1 FROM device_configs 
    WHERE device_id = p_device_id AND is_active = true
  ) THEN
    RETURN json_build_object('error', 'Device already has an active configuration');
  END IF;
  
  -- Create key request
  INSERT INTO key_requests (device_id, user_id, requested_at)
  VALUES (p_device_id, v_user_id, NOW())
  RETURNING id INTO v_request_id;
  
  RETURN json_build_object(
    'success', true,
    'request_id', v_request_id,
    'message', 'Key generation request queued'
  );
END;
$$;

-- Function to get device config (returns downloadable config)
CREATE OR REPLACE FUNCTION get_device_config(p_device_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_config_record RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;
  
  SELECT dc.*, vn.public_ip, vn.port, vn.public_key as server_public_key
  INTO v_config_record
  FROM device_configs dc
  JOIN vpn_nodes vn ON dc.node_id = vn.id
  JOIN devices d ON dc.device_id = d.id
  WHERE dc.device_id = p_device_id 
    AND dc.is_active = true
    AND (d.user_id = v_user_id OR d.org_id IN (
      SELECT org_id FROM org_members WHERE user_id = v_user_id
    ));
    
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Config not found or access denied');
  END IF;
  
  RETURN json_build_object(
    'client_ip', v_config_record.client_ip,
    'dns_servers', v_config_record.dns_servers,
    'server_ip', v_config_record.public_ip,
    'server_port', v_config_record.port,
    'server_public_key', v_config_record.server_public_key,
    'created_at', v_config_record.created_at
  );
END;
$$;

-- Insert sample VPN nodes (modify with your actual node details)
INSERT INTO vpn_nodes (
  name, region, public_ip, client_subnet, public_key, max_clients
) VALUES 
  (
    'Node-US-East-1', 
    'us-east', 
    '45.76.123.45', 
    '10.8.0.0/24', 
    'YOUR_NODE_1_PUBLIC_KEY_HERE',
    1000
  ),
  (
    'Node-EU-West-1', 
    'eu-west', 
    '95.179.156.78', 
    '10.9.0.0/24', 
    'YOUR_NODE_2_PUBLIC_KEY_HERE',
    1000
  )
ON CONFLICT DO NOTHING;