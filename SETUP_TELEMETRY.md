# Setup Telemetry Collection

This will enable the live telemetry feed in the admin dashboard.

## What It Does

Collects WireGuard connection stats every minute and sends to Supabase:
- Connection status (connected/disconnected)
- Client IP addresses
- Traffic stats (bytes sent/received)
- Last handshake time
- Node information

## Installation on VA Server

### 1. Upload the telemetry script

```bash
# Copy the script to VA server
scp telemetry-collector.sh ubuntu@135.148.121.237:/tmp/

# SSH to VA server
ssh ubuntu@135.148.121.237

# Move and set permissions
sudo mv /tmp/telemetry-collector.sh /usr/local/bin/telemetry-collector.sh
sudo chmod +x /usr/local/bin/telemetry-collector.sh
```

### 2. Set environment variables

```bash
sudo nano /etc/environment
```

Add these lines (get values from Railway/Supabase):
```
SUPABASE_URL="https://ltwuqjmncldopkutiyak.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key-here"
VPN_NODE_ID="<va-node-id-from-database>"
```

To get the node ID:
```sql
-- Run in Supabase SQL Editor
SELECT id, name FROM vpn_nodes WHERE name = 'SACVPN-VA-Primary';
```

### 3. Set up cron job (runs every minute)

```bash
sudo crontab -e
```

Add this line:
```
* * * * * /usr/local/bin/telemetry-collector.sh >> /var/log/telemetry.log 2>&1
```

### 4. Test it manually

```bash
# Set environment for current session
export SUPABASE_URL="https://ltwuqjmncldopkutiyak.supabase.co"
export SUPABASE_SERVICE_KEY="your-key"
export VPN_NODE_ID="your-node-id"

# Run collector
sudo -E /usr/local/bin/telemetry-collector.sh
```

You should see output like:
```
Sent telemetry for device abc-123 (connected: true)
Sent telemetry for device def-456 (connected: false)
Telemetry collection complete
```

### 5. Check logs

```bash
sudo tail -f /var/log/telemetry.log
```

## Installation on Dallas Server

Same steps but:
- SSH to `root@45.79.8.145` instead
- Use `VPN_NODE_ID` for Dallas node
- No `sudo` needed (already root)

## Quick Test (Without Installing)

Want to test if it works? Run this one-liner on VA:

```bash
ssh ubuntu@135.148.121.237 'sudo wg show wg0 dump'
```

This shows the raw data the collector parses. You should see connected peers.

## Verify in Supabase

After running the collector, check the data:

```sql
SELECT * FROM device_latest_telemetry ORDER BY recorded_at DESC;
```

You should see rows with:
- device_id
- node_id
- is_connected
- client_ip
- bytes_received, bytes_sent
- last_handshake
- recorded_at

## Troubleshooting

### "No device found for public key"
The device_configs table doesn't have this peer registered. This happens if:
- Keys were generated but not saved to database
- Peer was added manually without database entry

**Fix**: Generate keys through the web UI instead of manually adding peers.

### "ERROR: VPN_NODE_ID environment variable not set"
The environment variable isn't set.

**Fix**: Make sure `/etc/environment` has the variables and reboot, OR export them in the cron job:
```
* * * * * VPN_NODE_ID=xxx SUPABASE_SERVICE_KEY=yyy /usr/local/bin/telemetry-collector.sh >> /var/log/telemetry.log 2>&1
```

### No data appearing in admin dashboard
1. Check cron is running: `sudo systemctl status cron`
2. Check logs: `sudo tail /var/log/telemetry.log`
3. Verify Supabase key has permissions
4. Check table exists: `SELECT * FROM device_latest_telemetry LIMIT 1;`

## Table Schema

The `device_latest_telemetry` table should have:

```sql
CREATE TABLE device_latest_telemetry (
  device_id UUID PRIMARY KEY REFERENCES devices(id),
  node_id UUID REFERENCES vpn_nodes(id),
  is_connected BOOLEAN,
  client_ip TEXT,
  client_vpn_ip TEXT,
  last_handshake TIMESTAMPTZ,
  bytes_received BIGINT,
  bytes_sent BIGINT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

If it doesn't exist, create it in Supabase SQL Editor.

## Performance

- Runs every 60 seconds
- Takes < 1 second to execute
- Minimal CPU/network usage
- Upserts data (updates existing rows, no duplicates)

## After Setup

Your admin dashboard telemetry feed will show:
- ✅ Live connection status
- ✅ Device names and platforms
- ✅ Traffic stats
- ✅ Last seen/handshake times
- ✅ Auto-refreshes every 10 seconds

Perfect for monitoring your VPN network!
