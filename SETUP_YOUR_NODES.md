# 🚀 Setup Your SACVPN Nodes

## Your Server Details:
- **Server 1**: `135.148.121.237` (ubuntu user)
- **Server 2**: `45.79.8.145` (root user)
- **Password**: `78410889Ks!`

## Step 1: Run Database Setup ✅

You already ran the SQL schema. Next steps:

## Step 2: Install WireGuard on Both Servers

SSH into each server and install WireGuard:

### Server 1 (135.148.121.237):
```bash
ssh ubuntu@135.148.121.237
# Enter password: 78410889Ks!

# Install WireGuard
sudo apt update
sudo apt install wireguard wireguard-tools -y

# Enable IP forwarding
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Create WireGuard directory
sudo mkdir -p /etc/wireguard
```

### Server 2 (45.79.8.145):
```bash
ssh root@45.79.8.145
# Enter password: 78410889Ks!

# Install WireGuard
apt update
apt install wireguard wireguard-tools -y

# Enable IP forwarding
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
sysctl -p

# Create WireGuard directory
mkdir -p /etc/wireguard
```

## Step 3: Run Node Setup Script

On your local machine (in scvpn-api folder):

```bash
cd scvpn-api/

# Set environment variables
export SCVPN_SUPABASE_URL="your-supabase-url"
export SCVPN_SUPABASE_SERVICE_KEY="your-service-role-key"

# Install WireGuard tools locally (for key generation)
# On Windows WSL/Linux:
sudo apt install wireguard-tools

# On macOS:
brew install wireguard-tools

# Run the setup
node setup-nodes.js
```

This will generate WireGuard keys and output server configs.

## Step 4: Configure WireGuard on Servers

The setup script will output something like:

```
--- Node-US-East-1 ---
[Interface]
PrivateKey = GENERATED_PRIVATE_KEY_HERE
Address = 10.8.0.1/24
ListenPort = 51820
SaveConfig = false

PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```

### Copy configs to servers:

**Server 1:**
```bash
ssh ubuntu@135.148.121.237
sudo nano /etc/wireguard/wg0.conf
# Paste the Node-US-East-1 config from setup script

# Set permissions
sudo chmod 600 /etc/wireguard/wg0.conf

# Start WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
sudo systemctl status wg-quick@wg0

# Check it's working
sudo wg show
```

**Server 2:**
```bash
ssh root@45.79.8.145
nano /etc/wireguard/wg0.conf
# Paste the Node-US-West-1 config from setup script

# Set permissions
chmod 600 /etc/wireguard/wg0.conf

# Start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
systemctl status wg-quick@wg0

# Check it's working
wg show
```

## Step 5: Update Railway Environment Variables

Add these to your Railway deployment:

```bash
# Your existing vars:
SCVPN_SUPABASE_URL=your-supabase-url
SCVPN_SUPABASE_SERVICE_KEY=your-service-key

# New WireGuard vars:
VPN_NODE_SSH_PASSWORD=78410889Ks!
```

## Step 6: Deploy Updated API

Your Railway deployment should now include:
- `wireguard-manager.js`
- Updated `server.js` with WireGuard endpoints
- All the new database tables

## Step 7: Test the System

1. **Check API Health:**
```bash
curl https://scvpn-production.up.railway.app/api/wireguard/health
```

2. **Check Nodes:**
```bash
curl https://scvpn-production.up.railway.app/api/wireguard/nodes
```

3. **Test Frontend:**
- Login to your app
- Add a device 
- Click "Request Key"
- Should see: "Key generation request queued"

4. **Process Keys:**
```bash
curl -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests
```

5. **Download Config:**
- Click "Config" link
- Should download `.conf` file

## Step 8: Firewall Configuration

Make sure both servers allow WireGuard traffic:

**Server 1 (Ubuntu):**
```bash
sudo ufw allow 51820/udp
sudo ufw reload
```

**Server 2 (Root):**
```bash
ufw allow 51820/udp
ufw reload
```

## 🚨 Important Security Notes:

1. **Change SSH passwords** after setup
2. **Set up SSH key authentication** (disable password auth)
3. **Enable fail2ban** on both servers
4. **Keep WireGuard and OS updated**

## Troubleshooting:

### If key generation fails:
- Check Railway logs for SSH errors
- Verify servers can be reached from Railway
- Test SSH manually: `ssh ubuntu@135.148.121.237`

### If WireGuard won't start:
- Check config syntax: `sudo wg-quick up wg0`
- Check logs: `journalctl -u wg-quick@wg0`
- Verify IP forwarding: `sysctl net.ipv4.ip_forward`

### If clients can't connect:
- Check firewall: `sudo ufw status`
- Verify WireGuard is running: `sudo wg show`
- Check server logs: `sudo journalctl -f`

## Next Steps After Setup:

1. Set up automated key processing (cron job)
2. Monitor node health
3. Set up SSH key authentication
4. Add node monitoring/alerting
5. Test with actual WireGuard clients

Your VPN infrastructure is ready to serve customers! 🎉