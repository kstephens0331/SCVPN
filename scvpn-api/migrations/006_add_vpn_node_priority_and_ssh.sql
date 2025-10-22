-- Add priority field and update SSH credentials for VPN nodes

-- Add priority column (lower number = higher priority)
ALTER TABLE vpn_nodes ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 100;

-- Update existing nodes with proper configuration

-- VA Primary: Priority 1 (highest), main production node
UPDATE vpn_nodes
SET
  priority = 1,
  ssh_host = '135.148.121.237',
  ssh_user = 'ubuntu',
  ssh_port = 22,
  management_type = 'ssh',
  max_clients = 1000,
  is_active = true
WHERE public_ip = '135.148.121.237';

-- Dallas Central: Priority 2, overflow/quick-connect node
UPDATE vpn_nodes
SET
  priority = 2,
  ssh_host = '45.79.8.145',
  ssh_user = 'root',
  ssh_port = 22,
  management_type = 'ssh',
  max_clients = 1000,
  is_active = true
WHERE public_ip = '45.79.8.145';

-- Verify configuration
SELECT
  name,
  priority,
  public_ip,
  ssh_user || '@' || ssh_host as ssh_connection,
  max_clients,
  current_clients,
  is_active
FROM vpn_nodes
ORDER BY priority;

COMMENT ON COLUMN vpn_nodes.priority IS 'Node selection priority (lower = higher priority). VA=1 (primary), Dallas=2 (overflow at 80%)';
