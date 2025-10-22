-- Check what columns exist in device_configs table
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'device_configs'
ORDER BY ordinal_position;

-- Then check if config was created (without the JOIN)
SELECT
  'Device config:' AS info,
  id,
  device_id,
  client_ip,
  is_active,
  created_at
FROM device_configs
WHERE device_id = '968d8246-409e-4a7e-a406-916878cb3a35'
ORDER BY created_at DESC
LIMIT 1;

-- Check key request status
SELECT
  'Key request:' AS info,
  status,
  processed_at,
  completed_at
FROM key_requests
WHERE id = '15e03d9e-17c8-44bc-aa6a-207846fe57c9';
