-- Quick fix for duplicate servers

-- 1. See current duplicates
SELECT * FROM vps_hosts ORDER BY ip, created_at;

-- 2. Delete duplicates (keep the oldest entry for each IP)
DELETE FROM vps_hosts
WHERE id NOT IN (
  SELECT MIN(id)
  FROM vps_hosts
  GROUP BY ip
);

-- 3. Verify only 2 servers remain
SELECT * FROM vps_hosts ORDER BY name;

-- 4. Check if there are any metrics
SELECT COUNT(*) as metric_count FROM vps_metrics;

-- 5. Check latest metrics
SELECT
  h.name,
  m.ts,
  m.cpu,
  m.mem_used,
  m.mem_total,
  m.load1
FROM vps_metrics m
JOIN vps_hosts h ON m.host_id = h.id
ORDER BY m.ts DESC
LIMIT 10;

-- If metrics count is 0, you need to deploy the monitoring scripts to your servers
-- See DEPLOY_MONITORING.md for instructions
