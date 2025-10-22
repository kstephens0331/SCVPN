-- Check and fix servers not showing in admin panel

-- 1. Check if vps_hosts table exists and has data
SELECT * FROM vps_hosts;

-- If the query above fails or returns no rows, run this:

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS vps_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip INET NOT NULL,
  ssh_user TEXT DEFAULT 'root',
  ssh_port INTEGER DEFAULT 22,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vps_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES vps_hosts(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ DEFAULT now(),
  cpu NUMERIC(5,2),
  mem_used BIGINT,
  mem_total BIGINT,
  disk_used BIGINT,
  disk_total BIGINT,
  load1 NUMERIC(10,2),
  load5 NUMERIC(10,2),
  load15 NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert VPN servers
INSERT INTO vps_hosts (name, ip, ssh_user, ssh_port)
VALUES
  ('VA Primary', '135.148.121.237', 'ubuntu', 22),
  ('Dallas Central', '45.79.8.145', 'root', 22)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE vps_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_metrics ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Admins can view all vps_hosts" ON vps_hosts;
DROP POLICY IF EXISTS "Admins can view all vps_metrics" ON vps_metrics;

-- Create proper admin policies using is_admin function
CREATE POLICY "Admins can view all vps_hosts"
  ON vps_hosts FOR SELECT
  USING (is_admin(auth.jwt()->>'email'));

CREATE POLICY "Admins can view all vps_metrics"
  ON vps_metrics FOR SELECT
  USING (is_admin(auth.jwt()->>'email'));

-- Create indexes
CREATE INDEX IF NOT EXISTS vps_metrics_host_id_ts_idx ON vps_metrics(host_id, ts DESC);
CREATE INDEX IF NOT EXISTS vps_metrics_ts_idx ON vps_metrics(ts DESC);

-- 2. Verify servers are now visible
SELECT * FROM vps_hosts;

-- Expected result: Should see VA Primary and Dallas Central
