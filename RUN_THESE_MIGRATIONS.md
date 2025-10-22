# Database Migrations to Run

## Instructions
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL block below
5. Click **Run**

---

## Migration 005: VPS Monitoring Tables

Run this SQL only (Migration 006 removed - view already exists):

```sql
-- VPS Hosts table
CREATE TABLE IF NOT EXISTS vps_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip INET NOT NULL,
  ssh_user TEXT DEFAULT 'root',
  ssh_port INTEGER DEFAULT 22,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- VPS Metrics table
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

CREATE INDEX IF NOT EXISTS vps_metrics_host_id_ts_idx ON vps_metrics(host_id, ts DESC);
CREATE INDEX IF NOT EXISTS vps_metrics_ts_idx ON vps_metrics(ts DESC);

-- Insert VPN servers
INSERT INTO vps_hosts (name, ip, ssh_user, ssh_port)
VALUES
  ('VA Primary', '135.148.121.237', 'ubuntu', 22),
  ('Dallas Central', '45.79.8.145', 'root', 22)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE vps_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_metrics ENABLE ROW LEVEL SECURITY;

-- Admin policies
DROP POLICY IF EXISTS "Admins can view all vps_hosts" ON vps_hosts;
CREATE POLICY "Admins can view all vps_hosts" ON vps_hosts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can view all vps_metrics" ON vps_metrics;
CREATE POLICY "Admins can view all vps_metrics" ON vps_metrics FOR SELECT USING (true);
```
