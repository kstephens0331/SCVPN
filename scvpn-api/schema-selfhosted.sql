-- SACVPN Self-Hosted PostgreSQL Schema
-- No Supabase-specific features (no auth.uid(), no RLS)
-- Authorization is handled in API code

-- Profiles (synced from Supabase Auth on login)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin emails
CREATE TABLE IF NOT EXISTS admin_emails (
  email TEXT PRIMARY KEY,
  is_admin BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  billing_period TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  renews_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID,
  name TEXT,
  platform TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VPN Nodes
CREATE TABLE IF NOT EXISTS vpn_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  public_ip INET NOT NULL,
  port INTEGER DEFAULT 51820,
  interface_name VARCHAR(20) DEFAULT 'wg0',
  public_key TEXT NOT NULL,
  client_subnet CIDR NOT NULL,
  dns_servers TEXT DEFAULT '1.1.1.1,8.8.8.8',
  max_clients INTEGER DEFAULT 1000,
  current_clients INTEGER DEFAULT 0,
  management_type VARCHAR(20) DEFAULT 'ssh',
  ssh_host TEXT,
  ssh_user VARCHAR(50) DEFAULT 'root',
  ssh_port INTEGER DEFAULT 22,
  ssh_password TEXT,
  api_endpoint TEXT,
  api_token TEXT,
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  is_healthy BOOLEAN DEFAULT false,
  last_health_check TIMESTAMPTZ,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device WireGuard configurations
CREATE TABLE IF NOT EXISTS device_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  node_id UUID NOT NULL REFERENCES vpn_nodes(id),
  private_key TEXT NOT NULL,
  public_key TEXT NOT NULL,
  client_ip INET NOT NULL,
  dns_servers TEXT DEFAULT '1.1.1.1,8.8.8.8',
  allowed_ips TEXT DEFAULT '0.0.0.0/0,::/0',
  persistent_keepalive INTEGER DEFAULT 25,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  UNIQUE(device_id),
  UNIQUE(node_id, client_ip)
);

-- Device telemetry (connection status)
CREATE TABLE IF NOT EXISTS device_telemetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES vpn_nodes(id),
  is_connected BOOLEAN NOT NULL,
  client_ip INET,
  last_handshake TIMESTAMPTZ,
  bytes_received BIGINT DEFAULT 0,
  bytes_sent BIGINT DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key request queue
CREATE TABLE IF NOT EXISTS key_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  preferred_node_id UUID REFERENCES vpn_nodes(id),
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Checkout sessions (from Stripe)
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id TEXT PRIMARY KEY,
  email TEXT,
  plan_code TEXT,
  billing_period TEXT DEFAULT 'monthly',
  account_type TEXT DEFAULT 'personal',
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_email TEXT,
  claimed_at TIMESTAMPTZ
);

-- Latest telemetry view
CREATE OR REPLACE VIEW device_latest_telemetry AS
SELECT DISTINCT ON (device_id)
  device_id, node_id, is_connected, client_ip,
  last_handshake, bytes_received, bytes_sent, recorded_at
FROM device_telemetry
ORDER BY device_id, recorded_at DESC;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_device_configs_device_id ON device_configs(device_id);
CREATE INDEX IF NOT EXISTS idx_device_configs_user_id ON device_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_device_configs_node_id ON device_configs(node_id);
CREATE INDEX IF NOT EXISTS idx_device_telemetry_device_id ON device_telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_key_requests_status ON key_requests(status);
CREATE INDEX IF NOT EXISTS idx_key_requests_user_id ON key_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_email ON checkout_sessions(email);
