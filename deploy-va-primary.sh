#!/bin/bash
# Deploy WireGuard to VA Primary (135.148.121.237)
# Run this script locally: ./deploy-va-primary.sh

set -e  # Exit on error

echo "🚀 Deploying WireGuard to VA Primary..."
echo "========================================"

# Server details
SERVER_IP="135.148.121.237"
SERVER_USER="ubuntu"
SERVER_PASSWORD="78410889Ks!"

# WireGuard config
PRIVATE_KEY="nMPOwCtInSfDUIl7RQc8WM4+gBy88Cq7dghvAH3LVSs="
PUBLIC_KEY="pQEfl7P/221LurZf/mJPHKOpjt894inUWpLde/3P7gk="

echo "📡 Connecting to $SERVER_IP..."

# Create the configuration file locally
cat > /tmp/wg0.conf << 'EOF'
[Interface]
PrivateKey = nMPOwCtInSfDUIl7RQc8WM4+gBy88Cq7dghvAH3LVSs=
Address = 10.8.0.1/24
ListenPort = 51820
SaveConfig = false

# Enable IP forwarding and masquerading
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ens3 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o ens3 -j MASQUERADE

PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ens3 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o ens3 -j MASQUERADE

# PRIMARY NODE: Optimized for low latency
# Expected capacity: 2000 clients
EOF

echo "📦 Installing WireGuard and dependencies..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Update system
sudo apt update

# Install WireGuard
sudo apt install -y wireguard wireguard-tools ufw

# Enable IP forwarding
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure firewall
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 51820/udp
sudo ufw reload

echo "✅ WireGuard installed"
ENDSSH

echo "📝 Deploying WireGuard configuration..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no /tmp/wg0.conf $SERVER_USER@$SERVER_IP:/tmp/wg0.conf

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Move config to proper location
sudo mv /tmp/wg0.conf /etc/wireguard/wg0.conf
sudo chmod 600 /etc/wireguard/wg0.conf
sudo chown root:root /etc/wireguard/wg0.conf

echo "✅ Config deployed"
ENDSSH

echo "🚀 Starting WireGuard service..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
# Enable and start WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# Wait a moment for startup
sleep 2

# Check status
sudo systemctl status wg-quick@wg0 --no-pager
echo ""
echo "📊 WireGuard Interface Status:"
sudo wg show

echo "✅ WireGuard is running!"
ENDSSH

echo ""
echo "✅ VA Primary deployment complete!"
echo "🔒 Server Public Key: $PUBLIC_KEY"
echo "📡 Endpoint: $SERVER_IP:51820"
echo "🌐 Subnet: 10.8.0.0/24"
echo ""
echo "Next: Run deploy-dallas-central.sh"
