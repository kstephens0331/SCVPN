#!/bin/bash
# WireGuard Telemetry Collection Script
# Deploy to each VPN node and run via cron every 30 seconds
# Example crontab: * * * * * /opt/sacvpn/collect-wg-telemetry.sh
# Example crontab: * * * * * sleep 30; /opt/sacvpn/collect-wg-telemetry.sh

set -e

# Configuration
SUPABASE_URL="${SCVPN_SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SCVPN_SUPABASE_SERVICE_KEY}"
WG_INTERFACE="${WG_INTERFACE:-wg0}"
NODE_NAME="${NODE_NAME:-$(hostname)}"

# Check if WireGuard interface exists
if ! ip link show "$WG_INTERFACE" &>/dev/null; then
  echo "WireGuard interface $WG_INTERFACE not found"
  exit 1
fi

# Get this node's ID from database
NODE_ID=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_node_id_by_name" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"node_name\": \"$NODE_NAME\"}" | jq -r '.id // empty')

if [ -z "$NODE_ID" ]; then
  echo "Could not find node ID for $NODE_NAME"
  exit 1
fi

# Parse WireGuard status
# Format: public-key\tpreshared-key\tendpoint\tallowed-ips\tlatest-handshake\ttransfer-rx\ttransfer-tx\tpersistent-keepalive
wg show "$WG_INTERFACE" dump | tail -n +2 | while IFS=$'\t' read -r pubkey psk endpoint allowed_ips handshake rx tx keepalive; do
  # Skip if no public key
  [ -z "$pubkey" ] && continue

  # Find device by public key
  DEVICE_ID=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_device_by_pubkey" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"pub_key\": \"$pubkey\"}" | jq -r '.id // empty')

  if [ -z "$DEVICE_ID" ]; then
    echo "Unknown peer: $pubkey"
    continue
  fi

  # Extract client IP from allowed_ips (format: "10.8.0.2/32")
  CLIENT_IP=$(echo "$allowed_ips" | cut -d',' -f1 | cut -d'/' -f1)

  # Determine if connected (handshake within last 3 minutes)
  NOW=$(date +%s)
  IS_CONNECTED=false
  if [ -n "$handshake" ] && [ "$handshake" -gt 0 ]; then
    AGE=$((NOW - handshake))
    if [ $AGE -lt 180 ]; then
      IS_CONNECTED=true
    fi
  fi

  # Convert handshake timestamp to ISO format
  LAST_HANDSHAKE=""
  if [ -n "$handshake" ] && [ "$handshake" -gt 0 ]; then
    LAST_HANDSHAKE=$(date -u -d "@$handshake" +"%Y-%m-%dT%H:%M:%SZ")
  fi

  # Insert telemetry into database
  curl -s -X POST "$SUPABASE_URL/rest/v1/device_telemetry" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{
      \"device_id\": \"$DEVICE_ID\",
      \"node_id\": \"$NODE_ID\",
      \"is_connected\": $IS_CONNECTED,
      \"client_ip\": \"$CLIENT_IP\",
      \"last_handshake\": $([ -n "$LAST_HANDSHAKE" ] && echo "\"$LAST_HANDSHAKE\"" || echo "null"),
      \"bytes_received\": $rx,
      \"bytes_sent\": $tx,
      \"recorded_at\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
    }"

  echo "Recorded telemetry for device $DEVICE_ID: rx=$rx tx=$tx connected=$IS_CONNECTED"
done

echo "Telemetry collection complete"
