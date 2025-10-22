# Verify WireGuard Peer Registration on VPN Servers

**Critical Issue:** Keys are generated in database, but need to be registered on actual VPN servers for handshake to work.

**Status Update:**
- ✅ Dockerfile created with sshpass and openssh-client
- ✅ Committed and pushed to GitHub (commit cc2aa7e)
- ⏳ Waiting for Railway to detect and redeploy with new Dockerfile
- ⏳ Need to verify SSH commands are succeeding in Railway logs

---

## Quick Test After Railway Deploys

Once Railway finishes deploying (2-3 minutes):

1. **Go to SACVPN dashboard** → Devices page
2. **Click "Request Key"** on a device
3. **Immediately check Railway logs** - Should see:
   ```
   Executing SSH command
   {
     "node": "SACVPN-Dallas-Central",
     "host": "root@45.79.8.145",
     "command": "wg set wg0 peer ABC123... allowed-ips 10.71.0.2/32"
   }
   SSH command successful
   {
     "node": "SACVPN-Dallas-Central"
   }
   ```

4. **If you see "sshpass: command not found"** → Dockerfile didn't deploy, check Railway build logs
5. **If you see "SSH command successful"** → ✅ Peer registration is working!
6. **If you see "Permission denied"** → Check VPN_NODE_SSH_PASSWORD environment variable

---

## How It Should Work

When a user requests a WireGuard key:

1. ✅ Backend generates private/public key pair
2. ✅ Backend saves to `device_configs` table
3. ⚠️ **Backend SSH's into VPN server** (VA or Dallas)
4. ⚠️ **Backend runs:** `wg set wg0 peer <PUBLIC_KEY> allowed-ips <CLIENT_IP>/32`
5. ⚠️ **Server adds peer** to WireGuard interface
6. ✅ Client can now connect and handshake succeeds

**Steps 3-5 are critical and might be failing!**

---

## Check Railway Logs for SSH Commands

Search Railway logs for these keywords (in order):

### 1. "Executing SSH command"

Look for logs like:
```json
{
  "node": "SACVPN-Dallas-Central",
  "host": "root@45.79.8.145",
  "command": "wg set wg0 peer ABC123... allowed-ips 10.71.0.2/32"
}
```

**If you see this:** SSH command was attempted ✅

**If you DON'T see this:** SSH command never ran ❌

---

### 2. "SSH command successful"

Look for:
```json
{
  "node": "SACVPN-Dallas-Central",
  "message": "SSH command successful"
}
```

**If you see this:** Peer was registered on server ✅✅✅

**If you DON'T see this:** SSH failed ❌

---

### 3. "SSH command failed" or "SSH command timed out"

Look for errors like:
```json
{
  "node": "SACVPN-Dallas-Central",
  "code": 255,
  "stderr": "Permission denied",
  "message": "SSH command failed"
}
```

**Common errors:**
- `Permission denied` - SSH password/key is wrong
- `Connection timed out` - Can't reach server
- `Host key verification failed` - SSH strict host checking
- `sshpass: command not found` - sshpass not installed in Railway container

---

## Manual Verification on VPN Servers

### Check Dallas Central (45.79.8.145)

SSH into the server:

```bash
ssh root@45.79.8.145
```

Then run:

```bash
# Show all WireGuard peers
wg show wg0

# Count how many peers are registered
wg show wg0 peers | wc -l

# Show full configuration
wg showconf wg0
```

**Expected output:**
```
interface: wg0
  public key: QiEacNqmDhBpIcGCBFsYlZwo39pkqNMTiCiyYTgma34=
  private key: (hidden)
  listening port: 51820

peer: <CLIENT_PUBLIC_KEY>
  allowed ips: 10.71.0.2/32

peer: <ANOTHER_CLIENT_PUBLIC_KEY>
  allowed ips: 10.71.0.3/32
```

**If you see your client's public key listed:** Peer is registered ✅

**If you DON'T see any peers:** SSH command is failing ❌

---

### Check VA Primary (135.148.121.237)

```bash
ssh ubuntu@135.148.121.237
sudo wg show wg0
```

Same expected output but with `10.70.0.x` IPs.

---

## Most Likely Issues

### Issue 1: sshpass Not Installed in Railway ✅ FIXED

Railway's base image doesn't have `sshpass` installed.

**Fix:** ✅ Dockerfile created and committed (cc2aa7e)

**Status:** Railway should now automatically detect and use the Dockerfile:

```dockerfile
FROM node:20-slim

# Install sshpass for SSH password authentication
RUN apt-get update && apt-get install -y sshpass openssh-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

CMD ["node", "server.js"]
```

**Next Steps:**
1. Wait for Railway to redeploy (usually takes 2-3 minutes)
2. Watch Railway build logs for "Installing system dependencies"
3. Once deployed, test key generation
4. Check Railway logs for "SSH command successful"

---

### Issue 2: VPN_NODE_SSH_PASSWORD Not Set

Check Railway variables for:
```
VPN_NODE_SSH_PASSWORD=78410889Ks!
```

**If missing:** SSH will fail

---

### Issue 3: Server Firewall Blocking SSH

If Railway can't reach port 22 on the VPN servers:

**Test from Railway:**
```bash
# In Railway shell
nc -zv 45.79.8.145 22
nc -zv 135.148.121.237 22
```

Should show: `Connection to 45.79.8.145 22 port [tcp/ssh] succeeded!`

---

### Issue 4: Wrong SSH User/Host

Check database has correct values:

```sql
SELECT name, ssh_host, ssh_user, ssh_port FROM vpn_nodes;
```

**Should be:**
- Dallas: `root@45.79.8.145:22`
- VA: `ubuntu@135.148.121.237:22`

---

## Quick Test: Manually Add a Peer

SSH into Dallas server:

```bash
ssh root@45.79.8.145
```

Manually add a test peer:

```bash
wg set wg0 peer TEST_PUBLIC_KEY_HERE allowed-ips 10.71.0.99/32
```

Then check:

```bash
wg show wg0
```

**If you see the peer:** WireGuard server is working fine, issue is with SSH automation

**If command fails:** WireGuard might not be configured properly

---

## Next Steps Based on Findings

### If SSH commands are succeeding in logs:
✅ Everything is working! Client just needs to connect.

### If SSH commands are failing:
1. Check Railway logs for exact error
2. Verify VPN_NODE_SSH_PASSWORD is set
3. Test SSH manually from your machine
4. Add sshpass to Railway container (Dockerfile)

### If SSH commands aren't even running:
1. Check if generateDeviceConfig is being called
2. Check if addPeerToNode is being called
3. Look for errors in key generation

---

## Testing End-to-End

1. **Request a key** via dashboard
2. **Check Railway logs** for "SSH command successful"
3. **SSH into VPN server** and run `wg show`
4. **Verify peer is listed** with correct public key
5. **Import .conf file** into WireGuard client
6. **Connect** and check for handshake

If steps 1-4 work but step 6 fails, the issue is client-side config.

---

**Status:** Need to verify SSH commands are actually registering peers on servers
**Priority:** CRITICAL - Without this, VPN won't work at all
