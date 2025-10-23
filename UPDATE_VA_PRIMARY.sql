-- Update VPN nodes to make VA Primary the default connection point
-- Dallas will remain as backend relay only (blocked by some ISPs)

-- Update VA Primary node to priority 1 and set SSH user to 'ubuntu'
UPDATE vpn_nodes
SET
  priority = 1,
  ssh_user = 'ubuntu',
  description = 'Primary client connection point - VA datacenter'
WHERE name = 'SACVPN-VA-Primary' OR public_ip = '135.148.121.237';

-- Update Dallas Central to priority 2 (fallback only)
UPDATE vpn_nodes
SET
  priority = 2,
  ssh_user = 'root',
  description = 'Backend relay and fallback - Dallas datacenter (may be blocked by some ISPs)'
WHERE name = 'SACVPN-Dallas-Central' OR public_ip = '45.79.8.145';

-- Verify the updates
SELECT
  name,
  public_ip,
  port,
  priority,
  ssh_user,
  current_clients,
  max_clients,
  is_active,
  description
FROM vpn_nodes
ORDER BY priority ASC;
