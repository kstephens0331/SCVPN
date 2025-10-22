-- Update VPN nodes with ACTUAL server configuration
-- Run this in Supabase SQL Editor
-- Created: 2025-10-21

-- Update VA Primary with correct keys and subnet
UPDATE vpn_nodes
SET
  public_key = 'sOLMr7g/py3AeqbG+4kYv3DgrL4Duo1//K8Mv1JrNwM=',
  subnet = '10.70.0.0/24',
  public_ip = '135.148.121.237',
  port = 51820,
  is_active = true,
  is_healthy = true,
  region = 'us-east',
  location = 'Virginia',
  gaming_optimized = true,
  performance_tier = 'premium',
  priority = 1,
  updated_at = NOW()
WHERE name = 'SACVPN-VA-Primary';

-- Update Dallas Central with correct keys and subnet
UPDATE vpn_nodes
SET
  public_key = 'QiEacNqmDhBpIcGCBFsYlZwo39pkqNMTiCiyYTgma34=',
  subnet = '10.71.0.0/24',
  public_ip = '45.79.8.145',
  port = 51820,
  is_active = true,
  is_healthy = true,
  region = 'us-central',
  location = 'Dallas',
  gaming_optimized = false,
  performance_tier = 'standard',
  priority = 2,
  updated_at = NOW()
WHERE name = 'SACVPN-Dallas-Central';

-- Verify the update
SELECT
  name,
  public_key,
  subnet,
  public_ip,
  port,
  priority,
  gaming_optimized,
  is_active,
  is_healthy
FROM vpn_nodes
ORDER BY priority;
