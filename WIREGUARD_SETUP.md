# 🔒 SACVPN WireGuard Integration Setup

This guide will help you connect your frontend to your WireGuard VPN nodes for automatic key generation and provisioning.

## 📋 **What We've Built**

### **Components:**
- **WireGuard Manager** - Handles key generation, node communication, IP assignment
- **API Endpoints** - Process key requests, download configs, manage nodes
- **Database Schema** - Stores device configs, node status, telemetry
- **Setup Scripts** - Automated node configuration

### **Flow:**
1. User clicks "Request Key" in frontend
2. `request_wg_key()` function creates database request
3. Background job processes request and generates WireGuard config
4. User downloads `.conf` file via `/api/device/{id}/config`
5. User imports config into WireGuard client

## 🚀 **Setup Instructions**

### **Step 1: Database Setup**
Run the SQL schema in your Supabase SQL editor:

```bash
# Copy content from scvpn-api/database-schema.sql
# Paste into Supabase -> SQL Editor -> New Query
```

### **Step 2: Configure Your Nodes**
Edit `scvpn-api/setup-nodes.js` with your server details:

```javascript
const nodeConfigs = [
  {
    name: "Node-US-East-1",
    region: "us-east", 
    public_ip: "YOUR_FIRST_SERVER_IP",  // ← Change this
    port: 51820,
    client_subnet: "10.8.0.0/24",
    // ... other config
  },
  {
    name: "Node-EU-West-1",
    region: "eu-west",
    public_ip: "YOUR_SECOND_SERVER_IP", // ← Change this
    port: 51820,
    client_subnet: "10.9.0.0/24",
    // ... other config  
  }
];
```

### **Step 3: Run Node Setup**
```bash
cd scvpn-api/
export SCVPN_SUPABASE_URL="your-supabase-url"
export SCVPN_SUPABASE_SERVICE_KEY="your-service-role-key"

# Install WireGuard tools (needed for key generation)
# On Ubuntu/Debian:
sudo apt install wireguard-tools

# Run setup
npm run setup-nodes
```

This will:
- Generate WireGuard server keys
- Insert node configs into database
- Output server configuration files

### **Step 4: Configure Your VPN Servers**

On each VPN server:

1. **Install WireGuard:**
```bash
sudo apt update
sudo apt install wireguard
```

2. **Enable IP Forwarding:**
```bash
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. **Create WireGuard Config:**
```bash
# Copy the config output from setup script
sudo nano /etc/wireguard/wg0.conf
# Paste the generated config

# Set permissions
sudo chmod 600 /etc/wireguard/wg0.conf
```

4. **Start WireGuard:**
```bash
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
sudo systemctl status wg-quick@wg0  # Check status
```

5. **Setup SSH Access (for API management):**
```bash
# Generate SSH key for API server to connect
ssh-keygen -t ed25519 -f ~/.ssh/vpn_nodes -N ""

# Copy public key to each VPN server
ssh-copy-id -i ~/.ssh/vpn_nodes.pub root@YOUR_SERVER_IP

# Test SSH access
ssh -i ~/.ssh/vpn_nodes root@YOUR_SERVER_IP "wg show"
```

### **Step 5: Deploy API with Environment Variables**

Add to your Railway/hosting environment:

```bash
# Existing vars
SCVPN_SUPABASE_URL=your-supabase-url
SCVPN_SUPABASE_SERVICE_KEY=your-service-key

# New WireGuard vars
VPN_NODE_SSH_KEY_PATH=/app/.ssh/vpn_nodes
```

Upload your SSH private key to your API server.

### **Step 6: Test the Integration**

1. **Check API Health:**
```bash
curl https://scvpn-production.up.railway.app/api/wireguard/health
```

2. **Test Frontend Flow:**
- Login to your app
- Add a device
- Click "Request Key"
- Should see "Key generation request queued"

3. **Process Key Requests:**
```bash
# Manual trigger (or set up cron job)
curl -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests
```

4. **Download Config:**
- Click "Config" link for device
- Should download `.conf` file

## 🔄 **Production Setup**

### **Automated Key Processing**
Set up a cron job or background worker:

```bash
# Add to crontab (process every 5 minutes)
*/5 * * * * curl -s -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests > /dev/null
```

### **Monitoring**
- Monitor `/api/wireguard/health` endpoint
- Check node status in Supabase `vpn_nodes` table
- Review logs for failed key generations

### **Security**
- Rotate SSH keys regularly
- Use strong passwords for VPN servers
- Monitor for unauthorized access
- Keep WireGuard and server OS updated

## 🛠 **API Endpoints Reference**

### **Public Endpoints:**
- `GET /api/wireguard/nodes` - List available VPN nodes
- `GET /api/device/{id}/config` - Download device config (authenticated)

### **Processing:**  
- `POST /api/wireguard/process-requests` - Process pending key requests
- `GET /api/wireguard/health` - System health check

### **Admin Endpoints:**
- `POST /api/admin/wireguard/generate-key` - Manual key generation (requires admin)

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"No available VPN nodes"**
   - Check nodes are marked `is_active=true` in database
   - Verify node health status

2. **SSH connection fails**
   - Test SSH key: `ssh -i ~/.ssh/vpn_nodes root@SERVER_IP`
   - Check SSH key path in environment variables

3. **WireGuard commands fail**
   - Ensure `wg` tools installed on API server
   - Check WireGuard is running on VPN nodes

4. **Key generation fails**
   - Check API server logs
   - Verify Supabase connection
   - Check node capacity (current_clients < max_clients)

### **Logs to Check:**
- Railway/API server logs
- VPN server: `journalctl -u wg-quick@wg0`
- Supabase logs for RLS policy issues

## 📊 **Database Tables**

- `vpn_nodes` - VPN server configurations  
- `device_configs` - Generated WireGuard configs
- `key_requests` - Processing queue
- `device_telemetry` - Connection status (optional)

## 🎯 **Next Steps After Setup**

1. **Add monitoring dashboard** for node health
2. **Implement telemetry collection** from nodes  
3. **Add load balancing** based on node performance
4. **Set up alerting** for node failures
5. **Add config regeneration** for key rotation

Your VPN system should now automatically generate and provision WireGuard keys when customers request them! 🚀