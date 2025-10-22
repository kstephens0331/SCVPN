-- Update VPN nodes with ACTUAL server configuration (NO SUBNET COLUMN)
-- Run this in Supabase SQL Editor
-- Created: 2025-10-21

-- First, let's see what columns exist
-- Copy the output and show me
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vpn_nodes'
ORDER BY ordinal_position;

-- Then run this update (commenting out subnet since it doesn't exist):

-- Update VA Primary with correct public key
UPDATE vpn_nodes
SET
  public_key = 'sOLMr7g/py3AeqbG+4kYv3DgrL4Duo1//K8Mv1JrNwM=',
  public_ip = '135.148.121.237',
  port = 51820,
  is_active = true,
  is_healthy = true,
  updated_at = NOW()
WHERE name = 'SACVPN-VA-Primary';

-- Update Dallas Central with correct public key
UPDATE vpn_nodes
SET
  public_key = 'QiEacNqmDhBpIcGCBFsYlZwo39pkqNMTiCiyYTgma34=',
  public_ip = '45.79.8.145',
  port = 51820,
  is_active = true,
  is_healthy = true,
  updated_at = NOW()
WHERE name = 'SACVPN-Dallas-Central';

-- Verify the update
SELECT
  name,
  public_key,
  public_ip,
  port,
  priority,
  is_active,
  is_healthy
FROM vpn_nodes
ORDER BY priority;
