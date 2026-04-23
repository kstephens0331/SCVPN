#!/bin/bash
# Deploy WireGuard to Dallas Central (45.79.8.145)
# Run this script locally: ./deploy-dallas-central.sh

set -e  # Exit on error

echo "🚀 Deploying WireGuard to Dallas Central..."
echo "==========================================="

# Server details
SERVER_IP="45.79.8.145"
SERVER_USER="root"
SERVER_PASSWORD="<REDACTED-SERVER-PASSWORD>"

# WireGuard config
PRIVATE_KEY="a3YWIHKfwF+ksp7WET7K/YJbAPAFJj6t4nLpeMJcPmM="
PUBLIC_KEY="A4LFpt5GYs18JUdbxo4MOCz6y+dsrXhELmcEL6gPw/k="

echo "📡 Connecting to $SERVER_IP..."

# Create the configuration file locally
cat > /tmp/wg0-dallas.conf << 'EOF'
[Interface]
PrivateKey = a3YWIHKfwF+ksp7WET7K/YJbAPAFJj6t4nLpeMJcPmM=
Address = 10.9.0.1/24
ListenPort = 51820
SaveConfig = false

# Enable IP forwarding and masquerading
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# SECONDARY NODE: Optimized for throughput
# Expected capacity: 1000 clients
EOF

echo "📦 Installing WireGuard and dependencies..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Update system
apt update

# Install WireGuard
apt install -y wireguard wireguard-tools ufw

# Enable IP forwarding
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding=1' >> /etc/sysctl.conf
sysctl -p

# Configure firewall
ufw --force enable
ufw allow 22/tcp
ufw allow 51820/udp
ufw reload

echo "✅ WireGuard installed"
ENDSSH

echo "📝 Deploying WireGuard configuration..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no /tmp/wg0-dallas.conf $SERVER_USER@$SERVER_IP:/tmp/wg0.conf

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Move config to proper location
mv /tmp/wg0.conf /etc/wireguard/wg0.conf
chmod 600 /etc/wireguard/wg0.conf
chown root:root /etc/wireguard/wg0.conf

echo "✅ Config deployed"
ENDSSH

echo "🚀 Starting WireGuard service..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Enable and start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# Wait a moment for startup
sleep 2

# Check status
systemctl status wg-quick@wg0 --no-pager
echo ""
echo "📊 WireGuard Interface Status:"
wg show

echo "✅ WireGuard is running!"
ENDSSH

echo ""
echo "✅ Dallas Central deployment complete!"
echo "🔒 Server Public Key: $PUBLIC_KEY"
echo "📡 Endpoint: $SERVER_IP:51820"
echo "🌐 Subnet: 10.9.0.0/24"
echo ""
echo "🎉 Both nodes are now configured!"
