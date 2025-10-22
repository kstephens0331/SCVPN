-- Complete VPN Node Setup with SSH Information
-- This configures VA Primary and Dallas Central with proper priorities and SSH access

-- Step 1: Add priority column if it doesn't exist
ALTER TABLE vpn_nodes ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 100;

-- Step 2: Check current nodes
SELECT
  id,
  name,
  public_ip,
  ssh_host,
  ssh_user,
  priority,
  current_clients,
  max_clients,
  is_active
FROM vpn_nodes
ORDER BY priority;

-- Step 3: Update or Insert VA Primary (Priority 1)
INSERT INTO vpn_nodes (
  name,
  region,
  public_ip,
  port,
  interface_name,
  public_key,
  client_subnet,
  dns_servers,
  max_clients,
  current_clients,
  priority,
  management_type,
  ssh_host,
  ssh_user,
  ssh_port,
  is_active
) VALUES (
  'SACVPN-VA-Primary',
  'us-east',
  '135.148.121.237',
  51820,
  'wg0',
  'sOLMr7g/py3AeqbG+4kYv3DgrL4Duo1//K8Mv1JrNwM=',
  '10.70.0.0/24',
  '1.1.1.1,8.8.8.8',
  1000,
  0,
  1,  -- Highest priority
  'ssh',
  '135.148.121.237',
  'ubuntu',
  22,
  true
)
ON CONFLICT (public_ip) DO UPDATE SET
  name = 'SACVPN-VA-Primary',
  priority = 1,
  ssh_host = '135.148.121.237',
  ssh_user = 'ubuntu',
  ssh_port = 22,
  management_type = 'ssh',
  is_active = true;

-- Step 4: Update or Insert Dallas Central (Priority 2)
INSERT INTO vpn_nodes (
  name,
  region,
  public_ip,
  port,
  interface_name,
  public_key,
  client_subnet,
  dns_servers,
  max_clients,
  current_clients,
  priority,
  management_type,
  ssh_host,
  ssh_user,
  ssh_port,
  is_active
) VALUES (
  'SACVPN-Dallas-Central',
  'us-central',
  '45.79.8.145',
  51820,
  'wg0',
  'QiEacNqmDhBpIcGCBFsYlZwo39pkqNMTiCiyYTgma34=',
  '10.71.0.0/24',
  '1.1.1.1,8.8.8.8',
  1000,
  0,
  2,  -- Second priority (overflow)
  'ssh',
  '45.79.8.145',
  'root',
  22,
  true
)
ON CONFLICT (public_ip) DO UPDATE SET
  name = 'SACVPN-Dallas-Central',
  priority = 2,
  ssh_host = '45.79.8.145',
  ssh_user = 'root',
  ssh_port = 22,
  management_type = 'ssh',
  is_active = true;

-- Step 5: Clean up any duplicate or old nodes
-- Delete any nodes that aren't VA Primary or Dallas Central
-- DELETE FROM vpn_nodes WHERE public_ip NOT IN ('135.148.121.237', '45.79.8.145');
-- (Commented out for safety - uncomment if you want to clean up)

-- Step 6: Verify configuration
SELECT
  name,
  priority,
  public_ip,
  ssh_user || '@' || ssh_host || ':' || ssh_port as ssh_connection,
  client_subnet,
  max_clients,
  current_clients,
  ROUND((current_clients::numeric / max_clients::numeric) * 100, 1) as capacity_percent,
  is_active,
  management_type
FROM vpn_nodes
ORDER BY priority;

-- Expected Result:
-- SACVPN-VA-Primary      | priority=1 | ubuntu@135.148.121.237:22 | 10.70.0.0/24
-- SACVPN-Dallas-Central  | priority=2 | root@45.79.8.145:22       | 10.71.0.0/24

-- Node Selection Logic:
-- 1. Dallas Central handles ALL connections until it reaches 80% capacity (800/1000 clients)
-- 2. Once Dallas hits 80%, ALL NEW connections go to VA Primary
-- 3. VA Primary becomes the main node for all traffic after Dallas overflow
-- 4. If both nodes are unavailable, fallback to lowest priority available node

COMMENT ON COLUMN vpn_nodes.priority IS 'Node selection priority: 1=VA Primary (main), 2=Dallas Central (overflow at 80%)';
