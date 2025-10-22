-- VPS Hosts table for server management
CREATE TABLE IF NOT EXISTS vps_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip INET NOT NULL,
  ssh_user TEXT DEFAULT 'root',
  ssh_port INTEGER DEFAULT 22,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- VPS Metrics table for server monitoring
CREATE TABLE IF NOT EXISTS vps_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES vps_hosts(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ DEFAULT now(),
  cpu NUMERIC(5,2), -- CPU usage percentage
  mem_used BIGINT,   -- Memory used in bytes
  mem_total BIGINT,  -- Total memory in bytes
  disk_used BIGINT,  -- Disk used in bytes
  disk_total BIGINT, -- Total disk in bytes
  load1 NUMERIC(10,2),  -- 1-minute load average
  load5 NUMERIC(10,2),  -- 5-minute load average
  load15 NUMERIC(10,2), -- 15-minute load average
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS vps_metrics_host_id_ts_idx ON vps_metrics(host_id, ts DESC);
CREATE INDEX IF NOT EXISTS vps_metrics_ts_idx ON vps_metrics(ts DESC);

-- Insert VPN servers as VPS hosts
INSERT INTO vps_hosts (name, ip, ssh_user, ssh_port)
VALUES
  ('VA Primary', '135.148.121.237', 'ubuntu', 22),
  ('Dallas Central', '45.79.8.145', 'root', 22)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE vps_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_metrics ENABLE ROW LEVEL SECURITY;

-- Admin can see everything
CREATE POLICY "Admins can view all vps_hosts" ON vps_hosts FOR SELECT USING (true);
CREATE POLICY "Admins can view all vps_metrics" ON vps_metrics FOR SELECT USING (true);

COMMENT ON TABLE vps_hosts IS 'VPS server inventory for admin monitoring';
COMMENT ON TABLE vps_metrics IS 'Server metrics collected from VPS hosts';
