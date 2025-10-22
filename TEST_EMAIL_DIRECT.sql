-- Test if there are pending key requests
SELECT
  'Pending key requests:' AS info,
  kr.id,
  kr.device_id,
  kr.user_id,
  kr.status,
  kr.requested_at,
  d.name AS device_name,
  p.email AS user_email
FROM key_requests kr
JOIN devices d ON d.id = kr.device_id
JOIN profiles p ON p.id = kr.user_id
WHERE kr.status = 'pending'
ORDER BY kr.requested_at DESC;

-- Check if any were processed
SELECT
  'Processed key requests:' AS info,
  kr.id,
  kr.status,
  kr.processed_at,
  kr.completed_at,
  d.name AS device_name
FROM key_requests kr
JOIN devices d ON d.id = kr.device_id
WHERE kr.status IN ('processing', 'completed')
ORDER BY kr.requested_at DESC
LIMIT 5;

-- Check if device configs were created
SELECT
  'Device configs created:' AS info,
  dc.id,
  dc.device_id,
  dc.is_active,
  dc.created_at,
  d.name AS device_name
FROM device_configs dc
JOIN devices d ON d.id = dc.device_id
ORDER BY dc.created_at DESC
LIMIT 5;
