#!/bin/bash
# WireGuard Telemetry Collector - Enhanced Version
# Shows ALL issued devices (connected and disconnected)
# Run this script every minute via cron on each VPN node

# Configuration
SUPABASE_URL="${SUPABASE_URL:-https://ltwuqjmncldopkutiyak.supabase.co}"
SUPABASE_KEY="${SUPABASE_SERVICE_KEY}"
NODE_ID="${VPN_NODE_ID}"
INTERFACE="${WG_INTERFACE:-wg0}"

if [ -z "$NODE_ID" ]; then
  echo "ERROR: VPN_NODE_ID environment variable not set"
  exit 1
fi

if [ -z "$SUPABASE_KEY" ]; then
  echo "ERROR: SUPABASE_SERVICE_KEY not set"
  exit 1
fi

# Step 1: Get all device configs for this node from database
echo "Fetching all device configs for node $NODE_ID..."
all_devices=$(curl -s "$SUPABASE_URL/rest/v1/device_configs?select=device_id,public_key&node_id=eq.$NODE_ID" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

echo "Device configs: $all_devices"

# Step 2: Get current WireGuard stats
declare -A wg_stats
while IFS=$'\t' read -r public_key preshared_key endpoint allowed_ips latest_handshake transfer_rx transfer_tx persistent_keepalive; do
  wg_stats["$public_key"]="$endpoint|$allowed_ips|$latest_handshake|$transfer_rx|$transfer_tx"
done < <(wg show "$INTERFACE" dump | tail -n +2)

# Step 3: Process each device config
echo "$all_devices" | grep -o '"device_id":"[^"]*","public_key":"[^"]*"' | while read line; do
  device_id=$(echo "$line" | grep -o '"device_id":"[^"]*"' | cut -d'"' -f4)
  public_key=$(echo "$line" | grep -o '"public_key":"[^"]*"' | cut -d'"' -f4)

  echo "Processing device $device_id with key ${public_key:0:20}..."

  # Check if this device is in WireGuard
  if [ -n "${wg_stats[$public_key]}" ]; then
    # Device is in WireGuard - parse stats
    IFS='|' read -r endpoint allowed_ips latest_handshake transfer_rx transfer_tx <<< "${wg_stats[$public_key]}"

    client_vpn_ip=$(echo "$allowed_ips" | cut -d'/' -f1 | cut -d',' -f1)
    endpoint_ip=$(echo "$endpoint" | cut -d':' -f1)

    # Calculate connection status (handshake within last 3 minutes)
    current_time=$(date +%s)
    time_since_handshake=$((current_time - latest_handshake))

    if [ "$latest_handshake" = "0" ]; then
      is_connected="false"
      last_handshake_iso="null"
    elif [ "$time_since_handshake" -lt 180 ]; then
      is_connected="true"
      last_handshake_iso=$(date -u -d "@$latest_handshake" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -r "$latest_handshake" +"%Y-%m-%dT%H:%M:%S.000Z")
    else
      is_connected="false"
      last_handshake_iso=$(date -u -d "@$latest_handshake" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -r "$latest_handshake" +"%Y-%m-%dT%H:%M:%S.000Z")
    fi

    # Create payload with stats
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
  else
    # Device NOT in WireGuard - mark as disconnected with no stats
    json_payload=$(cat <<EOF
{
  "device_id": "$device_id",
  "node_id": "$NODE_ID",
  "is_connected": false,
  "client_ip": null,
  "client_vpn_ip": null,
  "last_handshake": null,
  "bytes_received": 0,
  "bytes_sent": 0,
  "recorded_at": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
}
EOF
)
  fi

  # Upsert to Supabase (use device_telemetry table, not the view)
  response=$(curl -s -X POST "$SUPABASE_URL/rest/v1/device_telemetry" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    -d "$json_payload")

  if [ -n "${wg_stats[$public_key]}" ]; then
    echo "✓ Updated device $device_id (connected: $is_connected)"
  else
    echo "○ Updated device $device_id (disconnected - not in WireGuard)"
  fi
done

echo "Telemetry collection complete at $(date)"
