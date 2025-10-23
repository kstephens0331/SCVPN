#!/bin/bash
# WireGuard Telemetry Collector
# Collects stats from WireGuard and sends to Supabase
# Run this script every minute via cron on each VPN node

# Configuration
SUPABASE_URL="${SUPABASE_URL:-https://ltwuqjmncldopkutiyak.supabase.co}"
SUPABASE_KEY="${SUPABASE_SERVICE_KEY}"
NODE_ID="${VPN_NODE_ID}"  # Set this in environment or pass as argument
INTERFACE="${WG_INTERFACE:-wg0}"

# Get node ID from database if not set
if [ -z "$NODE_ID" ]; then
  echo "ERROR: VPN_NODE_ID environment variable not set"
  exit 1
fi

# Parse WireGuard output and send to Supabase
wg show "$INTERFACE" dump | tail -n +2 | while IFS=$'\t' read -r public_key preshared_key endpoint allowed_ips latest_handshake transfer_rx transfer_tx persistent_keepalive; do

  # Skip if no handshake ever happened
  if [ "$latest_handshake" = "0" ]; then
    continue
  fi

  # Extract client IP from allowed_ips (e.g., "10.70.0.101/32" -> "10.70.0.101")
  client_vpn_ip=$(echo "$allowed_ips" | cut -d'/' -f1 | cut -d',' -f1)

  # Extract endpoint IP (e.g., "172.56.24.57:18019" -> "172.56.24.57")
  endpoint_ip=$(echo "$endpoint" | cut -d':' -f1)

  # Calculate if connected (handshake within last 3 minutes = 180 seconds)
  current_time=$(date +%s)
  time_since_handshake=$((current_time - latest_handshake))
  if [ "$time_since_handshake" -lt 180 ]; then
    is_connected="true"
  else
    is_connected="false"
  fi

  # Convert handshake timestamp to ISO 8601
  if [ "$latest_handshake" != "0" ]; then
    last_handshake_iso=$(date -u -d "@$latest_handshake" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -r "$latest_handshake" +"%Y-%m-%dT%H:%M:%S.000Z")
  else
    last_handshake_iso="null"
  fi

  # Look up device_id from public key
  device_id=$(curl -s "$SUPABASE_URL/rest/v1/device_configs?select=device_id&public_key=eq.$public_key" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" | grep -o '"device_id":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$device_id" ]; then
    echo "WARN: No device found for public key $public_key"
    continue
  fi

  # Prepare JSON payload
  json_payload=$(cat <<EOF
{
  "device_id": "$device_id",
  "node_id": "$NODE_ID",
  "is_connected": $is_connected,
  "client_ip": "$endpoint_ip",
  "client_vpn_ip": "$client_vpn_ip",
  "last_handshake": $last_handshake_iso,
  "bytes_received": $transfer_rx,
  "bytes_sent": $transfer_tx,
  "recorded_at": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
}
EOF
)

  # Upsert to Supabase (will update if exists, insert if not)
  curl -s -X POST "$SUPABASE_URL/rest/v1/device_latest_telemetry" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    -d "$json_payload" > /dev/null

  echo "Sent telemetry for device $device_id (connected: $is_connected)"
done

echo "Telemetry collection complete"
