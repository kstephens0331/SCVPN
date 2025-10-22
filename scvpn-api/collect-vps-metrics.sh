#!/bin/bash
# VPS Metrics Collection Script
# Deploy to each VPN node and run via cron every minute
# Example crontab: * * * * * /opt/sacvpn/collect-vps-metrics.sh

set -e

# Configuration
SUPABASE_URL="${SCVPN_SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SCVPN_SUPABASE_SERVICE_KEY}"
HOST_NAME="${HOST_NAME:-$(hostname)}"

# Get host IP address (first non-localhost IPv4)
HOST_IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '^127\.' | head -1)

# Get this host's ID from database
HOST_ID=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_host_id_by_ip" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"host_ip\": \"$HOST_IP\"}" | jq -r '.id // empty')

if [ -z "$HOST_ID" ]; then
  echo "Could not find host ID for $HOST_IP"
  exit 1
fi

# Collect system metrics

# CPU usage (average over last second)
CPU=$(top -bn2 -d 1 | grep "Cpu(s)" | tail -1 | awk '{print $2}' | cut -d'%' -f1)

# Memory info (in bytes)
MEM_TOTAL=$(free -b | awk '/^Mem:/ {print $2}')
MEM_USED=$(free -b | awk '/^Mem:/ {print $3}')

# Disk info (in bytes) for root partition
DISK_TOTAL=$(df -B1 / | awk 'NR==2 {print $2}')
DISK_USED=$(df -B1 / | awk 'NR==2 {print $3}')

# Load averages
LOAD=$(uptime | awk -F'load average:' '{print $2}' | sed 's/,//g')
LOAD1=$(echo "$LOAD" | awk '{print $1}')
LOAD5=$(echo "$LOAD" | awk '{print $2}')
LOAD15=$(echo "$LOAD" | awk '{print $3}')

# Insert metrics into database
curl -s -X POST "$SUPABASE_URL/rest/v1/vps_metrics" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{
    \"host_id\": \"$HOST_ID\",
    \"ts\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
    \"cpu\": $CPU,
    \"mem_used\": $MEM_USED,
    \"mem_total\": $MEM_TOTAL,
    \"disk_used\": $DISK_USED,
    \"disk_total\": $DISK_TOTAL,
    \"load1\": $LOAD1,
    \"load5\": $LOAD5,
    \"load15\": $LOAD15
  }"

echo "VPS metrics collected: CPU=$CPU% MEM=$((MEM_USED*100/MEM_TOTAL))% DISK=$((DISK_USED*100/DISK_TOTAL))% LOAD=$LOAD1,$LOAD5,$LOAD15"
