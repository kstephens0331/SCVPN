# SACVPN VA Primary Deployment Steps

## ✅ Completed
- [x] Updated wireguard-manager.js to prioritize VA over Dallas
- [x] Added sudo support for ubuntu user SSH
- [x] Committed and pushed changes to GitHub
- [x] Verified handshake working on VA server from T-Mobile

## 🔄 To Complete

### Step 1: Run SQL Migration in Supabase

1. Go to https://supabase.com/dashboard
2. Open your SACVPN project
3. Go to **SQL Editor**
4. Run the migration from `UPDATE_VA_PRIMARY.sql`:

```sql
-- Update VA Primary node to priority 1 and set SSH user to 'ubuntu'
UPDATE vpn_nodes
SET
  priority = 1,
  ssh_user = 'ubuntu',
  description = 'Primary client connection point - VA datacenter'
WHERE name = 'SACVPN-VA-Primary' OR public_ip = '135.148.121.237';

-- Update Dallas Central to priority 2 (fallback only)
UPDATE vpn_nodes
SET
  priority = 2,
  ssh_user = 'root',
  description = 'Backend relay and fallback - Dallas datacenter (may be blocked by some ISPs)'
WHERE name = 'SACVPN-Dallas-Central' OR public_ip = '45.79.8.145';

-- Verify the updates
SELECT
  name,
  public_ip,
  port,
  priority,
  ssh_user,
  current_clients,
  max_clients,
  is_active,
  description
FROM vpn_nodes
ORDER BY priority ASC;
```

5. **Verify the output** shows:
   - VA Primary: priority=1, ssh_user='ubuntu'
   - Dallas Central: priority=2, ssh_user='root'

### Step 2: Wait for Railway Deployment

Railway should automatically deploy the new code from GitHub.

1. Go to https://railway.app/dashboard
2. Check your scvpn-api service
3. Wait for deployment to complete (look for "Deployed" status)
4. Check logs for: "WireGuard manager initialized"

### Step 3: Test Key Generation from Web UI

1. Go to https://www.sacvpn.com (or your Vercel URL)
2. Log in with your account
3. Go to **Devices** page
4. Click **"Request Key"** on a device (create a new test device if needed)
5. Check Railway logs for: "Selected VA Primary for client connection"
6. You should receive an email with the WireGuard config (once SendGrid is configured)

### Step 4: Verify Peer Registration on VA

After requesting a key from the UI:

```bash
ssh ubuntu@135.148.121.237 "sudo wg show wg0"
```

You should see your new peer listed with:
- Public key
- Allowed IPs (10.70.0.x/32)
- Latest handshake (once connected)

## 🔍 Troubleshooting

### If key generation selects Dallas instead of VA:
- Check Supabase migration ran successfully
- Check Railway logs show correct priority
- Restart Railway service to reload node configs

### If SSH peer registration fails:
- Verify `VPN_NODE_SSH_PASSWORD` is set in Railway environment
- Test SSH manually: `ssh ubuntu@135.148.121.237`
- Check VA server allows sudo without password for wg commands

### If handshake fails:
- Generate fresh keys (each tunnel needs unique keys)
- Verify peer is registered on VA server
- Check firewall allows port 51820/udp

## 📊 Current Architecture

```
Client (Phone/Computer)
    ↓ WireGuard (port 51820/udp)
VA Primary (135.148.121.237)
    ↓ WireGuard Tunnel
Dallas Central (45.79.8.145)
    ↓ NAT
Internet
```

**Note**: Dallas IP is blocked by T-Mobile and some ISPs, so all clients connect to VA. Dallas remains peered with VA as a backend relay.

## 🎯 Success Criteria

- [  ] SQL migration shows VA as priority 1
- [  ] Railway deployment completes successfully
- [  ] New key requests log "Selected VA Primary"
- [  ] Peers are automatically added to VA server
- [  ] Handshake successful from T-Mobile cellular
- [  ] Internet browsing works through VPN

## 🚀 Future: Add Dallas Replacement Node

Once you have a new Dallas node:
1. Add to vpn_nodes table with priority=3
2. Set up VA-to-NewNode peering
3. Test connectivity from various ISPs
4. Update priority if it's more accessible than VA
