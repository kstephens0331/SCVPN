-- Optimize VPN nodes for gaming plan users
-- Run this in Supabase SQL Editor after nodes are deployed

-- Mark VA Primary as gaming-optimized (lowest latency)
UPDATE vpn_nodes
SET
  gaming_optimized = true,
  performance_tier = 'premium',
  priority = 1
WHERE name = 'SACVPN-VA-Primary';

-- Mark Dallas as standard tier
UPDATE vpn_nodes
SET
  gaming_optimized = false,
  performance_tier = 'standard',
  priority = 2
WHERE name = 'SACVPN-Dallas-Central';

-- Verify the update
SELECT
  name,
  region,
  public_ip,
  priority,
  performance_tier,
  gaming_optimized,
  max_clients,
  is_active
FROM vpn_nodes
ORDER BY priority;
