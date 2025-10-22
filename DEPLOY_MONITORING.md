# SACVPN Monitoring Deployment Guide

This guide will set up server metrics and WireGuard telemetry collection for your admin dashboard.

## Issue Summary

Currently, the admin dashboard is missing:
1. **Servers page showing no data** - VPS hosts exist in database but RLS policies blocking access
2. **Telemetry page showing no data** - No agents collecting WireGuard connection statistics
3. **WireGuard connections failing** - Peers not being registered on actual WireGuard servers

## Step 1: Fix Database Policies

Run these SQL files in Supabase SQL Editor (in order):

### 1.1 Fix VPS RLS Policies
```sql
-- File: FIX_VPS_RLS_POLICIES.sql
-- This fixes the servers page by allowing admin access to vps_hosts table
```

**Expected Result:** Admin servers page should now show VA Primary and Dallas Central

### 1.2 Create Monitoring Functions
```sql
-- File: CREATE_MONITORING_FUNCTIONS.sql
-- This creates helper functions for the monitoring scripts
```

## Step 2: Deploy Monitoring Scripts to Servers

### 2.1 Prerequisites

On **both** VPN servers (VA Primary and Dallas Central), install required packages:

```bash
sudo apt update
sudo apt install -y curl jq
```

### 2.2 Create Scripts Directory

On **both** servers:

```bash
sudo mkdir -p /opt/sacvpn
sudo chmod 755 /opt/sacvpn
```

### 2.3 Copy Monitoring Scripts

**On VA Primary (135.148.121.237):**

```bash
# SSH into VA Primary
ssh ubuntu@135.148.121.237

# Create VPS metrics collector
sudo tee /opt/sacvpn/collect-vps-metrics.sh > /dev/null <<'EOF'
[PASTE CONTENTS OF scvpn-api/collect-vps-metrics.sh HERE]
EOF

# Create WireGuard telemetry collector
sudo tee /opt/sacvpn/collect-wg-telemetry.sh > /dev/null <<'EOF'
[PASTE CONTENTS OF scvpn-api/collect-wg-telemetry.sh HERE]
EOF

# Make scripts executable
sudo chmod +x /opt/sacvpn/*.sh

# Set environment variables
echo 'export SCVPN_SUPABASE_URL="https://ltwuqjmncldopkutiyak.supabase.co"' | sudo tee -a /etc/environment
echo 'export SCVPN_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0d3Vxam1uY2xkb3BrdXRpeWFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyOTk0NCwiZXhwIjoyMDcxNDA1OTQ0fQ.J0GjiUMfB5dtO6QItZvtQiSduNRLWZDcW5gDZL91fIc"' | sudo tee -a /etc/environment
echo 'export HOST_NAME="VA Primary"' | sudo tee -a /etc/environment
echo 'export NODE_NAME="SACVPN-VA-Primary"' | sudo tee -a /etc/environment
echo 'export WG_INTERFACE="wg0"' | sudo tee -a /etc/environment
```

**On Dallas Central (45.79.8.145):**

```bash
# SSH into Dallas Central
ssh root@45.79.8.145

# Create VPS metrics collector
tee /opt/sacvpn/collect-vps-metrics.sh > /dev/null <<'EOF'
[PASTE CONTENTS OF scvpn-api/collect-vps-metrics.sh HERE]
EOF

# Create WireGuard telemetry collector
tee /opt/sacvpn/collect-wg-telemetry.sh > /dev/null <<'EOF'
[PASTE CONTENTS OF scvpn-api/collect-wg-telemetry.sh HERE]
EOF

# Make scripts executable
chmod +x /opt/sacvpn/*.sh

# Set environment variables
echo 'export SCVPN_SUPABASE_URL="https://ltwuqjmncldopkutiyak.supabase.co"' | tee -a /etc/environment
echo 'export SCVPN_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0d3Vxam1uY2xkb3BrdXRpeWFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyOTk0NCwiZXhwIjoyMDcxNDA1OTQ0fQ.J0GjiUMfB5dtO6QItZvtQiSduNRLWZDcW5gDZL91fIc"' | tee -a /etc/environment
echo 'export HOST_NAME="Dallas Central"' | tee -a /etc/environment
echo 'export NODE_NAME="SACVPN-Dallas-Central"' | tee -a /etc/environment
echo 'export WG_INTERFACE="wg0"' | tee -a /etc/environment
```

### 2.4 Test Scripts Manually

**On each server:**

```bash
# Load environment variables
source /etc/environment

# Test VPS metrics collection
sudo -E /opt/sacvpn/collect-vps-metrics.sh

# Test WireGuard telemetry collection
sudo -E /opt/sacvpn/collect-wg-telemetry.sh
```

**Expected Output:**
- VPS metrics: "VPS metrics collected: CPU=X% MEM=Y% DISK=Z% LOAD=..."
- WireGuard telemetry: "Recorded telemetry for device XXX: rx=YYY tx=ZZZ connected=true"

Check admin dashboard - Servers page should now show metrics!

### 2.5 Setup Cron Jobs

**On each server:**

```bash
# Edit root crontab
sudo crontab -e

# Add these lines:
# Collect VPS metrics every minute
* * * * * source /etc/environment && /opt/sacvpn/collect-vps-metrics.sh >> /var/log/sacvpn-metrics.log 2>&1

# Collect WireGuard telemetry every 30 seconds
* * * * * source /etc/environment && /opt/sacvpn/collect-wg-telemetry.sh >> /var/log/sacvpn-telemetry.log 2>&1
* * * * * sleep 30 && source /etc/environment && /opt/sacvpn/collect-wg-telemetry.sh >> /var/log/sacvpn-telemetry.log 2>&1
```

### 2.6 Verify Cron Logs

```bash
# Watch metrics log
sudo tail -f /var/log/sacvpn-metrics.log

# Watch telemetry log
sudo tail -f /var/log/sacvpn-telemetry.log
```

## Step 3: Fix WireGuard Peer Registration

The current issue is that when a device config is generated, it's saved to the database but the peer isn't actually added to the WireGuard server.

### 3.1 Add Railway Environment Variable

In Railway, add this environment variable:

```
VPN_NODE_SSH_PASSWORD=78410889Ks!
```

This allows the backend to SSH into VPN servers and run `wg set` commands.

### 3.2 Verify SSH Access

From your Railway backend, you should be able to SSH:

```bash
# Test SSH to VA Primary
sshpass -p "78410889Ks!" ssh -o StrictHostKeyChecking=no ubuntu@135.148.121.237 "wg show"

# Test SSH to Dallas Central
sshpass -p "78410889Ks!" ssh -o StrictHostKeyChecking=no root@45.79.8.145 "wg show"
```

### 3.3 Install sshpass in Railway

The WireGuard manager uses `sshpass` to SSH into servers. Make sure your Railway deployment has it installed.

Add to your Railway startup command or Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y sshpass wireguard-tools
```

## Step 4: Verification

After deployment:

1. **Servers Page** - Should show VA Primary and Dallas Central with live CPU, memory, disk, and load metrics
2. **Telemetry Page** - Should show connected devices with bytes sent/received and last handshake times
3. **Admin Device Actions** - Activate button should generate keys AND register peer on WireGuard server
4. **WireGuard Connection** - Devices should successfully connect to VPN and route traffic

## Troubleshooting

### Servers page still empty

```bash
# Check if data is being inserted
SELECT * FROM vps_metrics ORDER BY ts DESC LIMIT 5;
```

### Telemetry page still empty

```bash
# Check if telemetry is being recorded
SELECT * FROM device_telemetry ORDER BY recorded_at DESC LIMIT 5;
```

### Cron jobs not running

```bash
# Check cron status
sudo systemctl status cron

# Check cron logs
sudo grep CRON /var/log/syslog
```

### Environment variables not loading

```bash
# Check if vars are set
echo $SCVPN_SUPABASE_URL

# If empty, manually export in cron:
sudo crontab -e
# Add before each line:
# export SCVPN_SUPABASE_URL=... && ...
```

## Security Notes

- The Supabase service key in these scripts has full database access
- Protect `/opt/sacvpn/` directory permissions
- Consider using SSH keys instead of passwords for production
- Monitor script logs for unauthorized access attempts
- Rotate service keys periodically
