-- VPN Desktop Client API Schema
-- Run this in your Supabase SQL Editor

-- Connection Sessions table (for tracking VPN sessions)
CREATE TABLE IF NOT EXISTS connection_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES vpn_nodes(id),
  client_ip INET,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  disconnect_reason VARCHAR(50) -- 'user_initiated', 'server_restart', 'connection_lost', 'session_expired'
);

-- Device Logins table (for security auditing)
CREATE TABLE IF NOT EXISTS device_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  os_version VARCHAR(100),
  client_version VARCHAR(50),
  ip_address INET,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_successful BOOLEAN DEFAULT true
);

-- Add missing columns to devices table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'devices' AND column_name = 'hardware_id') THEN
    ALTER TABLE devices ADD COLUMN hardware_id VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'devices' AND column_name = 'is_connected') THEN
    ALTER TABLE devices ADD COLUMN is_connected BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'devices' AND column_name = 'last_seen') THEN
    ALTER TABLE devices ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'devices' AND column_name = 'client_version') THEN
    ALTER TABLE devices ADD COLUMN client_version VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'devices' AND column_name = 'os_version') THEN
    ALTER TABLE devices ADD COLUMN os_version VARCHAR(100);
  END IF;
END $$;

-- Add missing columns to vpn_nodes table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vpn_nodes' AND column_name = 'country') THEN
    ALTER TABLE vpn_nodes ADD COLUMN country VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vpn_nodes' AND column_name = 'city') THEN
    ALTER TABLE vpn_nodes ADD COLUMN city VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vpn_nodes' AND column_name = 'is_premium') THEN
    ALTER TABLE vpn_nodes ADD COLUMN is_premium BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vpn_nodes' AND column_name = 'is_gaming_optimized') THEN
    ALTER TABLE vpn_nodes ADD COLUMN is_gaming_optimized BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vpn_nodes' AND column_name = 'is_streaming_optimized') THEN
    ALTER TABLE vpn_nodes ADD COLUMN is_streaming_optimized BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add trial_ends_at to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'trial_ends_at') THEN
    ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connection_sessions_device_id ON connection_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_connection_sessions_user_id ON connection_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_sessions_connected_at ON connection_sessions(connected_at);
CREATE INDEX IF NOT EXISTS idx_device_logins_user_id ON device_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_device_logins_logged_in_at ON device_logins(logged_in_at);
CREATE INDEX IF NOT EXISTS idx_devices_hardware_id ON devices(hardware_id);
CREATE INDEX IF NOT EXISTS idx_devices_user_id_active ON devices(user_id, is_active);

-- Enable RLS
ALTER TABLE connection_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_logins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connection_sessions
CREATE POLICY "Users can view own connection sessions" ON connection_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role full access to connection_sessions" ON connection_sessions
  FOR ALL USING (
    (SELECT auth.jwt() ->> 'role') = 'service_role'
  );

-- RLS Policies for device_logins
CREATE POLICY "Users can view own device logins" ON device_logins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role full access to device_logins" ON device_logins
  FOR ALL USING (
    (SELECT auth.jwt() ->> 'role') = 'service_role'
  );

-- Update existing VPN nodes with location info
UPDATE vpn_nodes SET
  country = 'United States',
  city = CASE
    WHEN name LIKE '%VA%' THEN 'Virginia'
    WHEN name LIKE '%Dallas%' THEN 'Dallas'
    WHEN name LIKE '%NYC%' THEN 'New York'
    WHEN name LIKE '%LA%' THEN 'Los Angeles'
    ELSE 'Unknown'
  END
WHERE country IS NULL;

-- Function to calculate user's total bandwidth usage this month
CREATE OR REPLACE FUNCTION get_user_monthly_bandwidth(p_user_id UUID)
RETURNS TABLE(bytes_sent BIGINT, bytes_received BIGINT, total_bytes BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(cs.bytes_sent), 0)::BIGINT as bytes_sent,
    COALESCE(SUM(cs.bytes_received), 0)::BIGINT as bytes_received,
    COALESCE(SUM(cs.bytes_sent + cs.bytes_received), 0)::BIGINT as total_bytes
  FROM connection_sessions cs
  WHERE cs.user_id = p_user_id
    AND cs.connected_at >= date_trunc('month', CURRENT_DATE);
END;
$$;

-- Function to get user's active devices count
CREATE OR REPLACE FUNCTION get_user_device_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM devices
  WHERE user_id = p_user_id AND is_active = true;

  RETURN v_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_monthly_bandwidth(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_device_count(UUID) TO authenticated;
