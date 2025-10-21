# 📝 MANUAL VPN NODE DEPLOYMENT STEPS

**For when automated scripts don't work - copy/paste these commands**

---

## 🔷 VA PRIMARY (135.148.121.237)

### Step 1: SSH into VA Primary
```bash
ssh ubuntu@135.148.121.237
# Password: 78410889Ks!
```

### Step 2: Install WireGuard
```bash
sudo apt update
sudo apt install -y wireguard wireguard-tools ufw
```

### Step 3: Enable IP Forwarding
```bash
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding=1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Step 4: Configure Firewall
```bash
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 51820/udp
sudo ufw reload
```

### Step 5: Create WireGuard Config
```bash
sudo nano /etc/wireguard/wg0.conf
```

**Paste this (CTRL+SHIFT+V):**
```ini
[Interface]
PrivateKey = nMPOwCtInSfDUIl7RQc8WM4+gBy88Cq7dghvAH3LVSs=
Address = 10.8.0.1/24
ListenPort = 51820
SaveConfig = false

PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ens3 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o ens3 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ens3 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o ens3 -j MASQUERADE
```

**Save:** CTRL+X, then Y, then ENTER

### Step 6: Set Permissions
```bash
sudo chmod 600 /etc/wireguard/wg0.conf
```

### Step 7: Start WireGuard
```bash
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

### Step 8: Verify It's Running
```bash
sudo systemctl status wg-quick@wg0
sudo wg show
```

**Expected output:**
```
interface: wg0
  public key: pQEfl7P/221LurZf/mJPHKOpjt894inUWpLde/3P7gk=
  private key: (hidden)
  listening port: 51820
```

✅ **VA Primary is ready!**

---

## 🔶 DALLAS CENTRAL (45.79.8.145)

### Step 1: SSH into Dallas
```bash
ssh root@45.79.8.145
# Password: 78410889Ks!
```

### Step 2: Install WireGuard
```bash
apt update
apt install -y wireguard wireguard-tools ufw
```

### Step 3: Enable IP Forwarding
```bash
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding=1' >> /etc/sysctl.conf
sysctl -p
```

### Step 4: Configure Firewall
```bash
ufw --force enable
ufw allow 22/tcp
ufw allow 51820/udp
ufw reload
```

### Step 5: Create WireGuard Config
```bash
nano /etc/wireguard/wg0.conf
```

**Paste this:**
```ini
[Interface]
PrivateKey = a3YWIHKfwF+ksp7WET7K/YJbAPAFJj6t4nLpeMJcPmM=
Address = 10.9.0.1/24
ListenPort = 51820
SaveConfig = false

PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```

**Save:** CTRL+X, then Y, then ENTER

### Step 6: Set Permissions
```bash
chmod 600 /etc/wireguard/wg0.conf
```

### Step 7: Start WireGuard
```bash
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
```

### Step 8: Verify It's Running
```bash
systemctl status wg-quick@wg0
wg show
```

**Expected output:**
```
interface: wg0
  public key: A4LFpt5GYs18JUdbxo4MOCz6y+dsrXhELmcEL6gPw/k=
  private key: (hidden)
  listening port: 51820
```

✅ **Dallas Central is ready!**

---

## ✅ VERIFICATION

Test both nodes are reachable:

```bash
# From your local machine
ping 135.148.121.237
ping 45.79.8.145

# Test UDP port (requires nmap)
nmap -sU -p 51820 135.148.121.237
nmap -sU -p 51820 45.79.8.145
```

---

## 🚨 TROUBLESHOOTING

### If WireGuard won't start:

```bash
# Check config syntax
sudo wg-quick up wg0

# Check system logs
sudo journalctl -u wg-quick@wg0 -f

# Verify IP forwarding
sysctl net.ipv4.ip_forward
# Should return: net.ipv4.ip_forward = 1
```

### If network interface name is wrong:

```bash
# Find your actual interface name
ip addr show

# Common names: eth0, ens3, ens5, enp0s3
# Update PostUp/PostDown lines in /etc/wireguard/wg0.conf
# Replace "ens3" or "eth0" with your actual interface
```

### If firewall blocks connections:

```bash
# Check firewall status
sudo ufw status

# Temporarily disable for testing
sudo ufw disable

# Re-enable after testing
sudo ufw enable
```

---

## 📊 NEXT STEPS AFTER DEPLOYMENT

1. ✅ Both nodes installed and running
2. ⏳ Add to Railway: `VPN_NODE_SSH_PASSWORD=78410889Ks!`
3. ⏳ Test key generation from dashboard
4. ⏳ Download config and test VPN connection
5. ⏳ Set up email notifications
6. ⏳ Enable automated cron processing

---

## 🔐 POST-DEPLOYMENT SECURITY

**IMMEDIATELY after testing works:**

```bash
# Generate SSH key (on your local machine)
ssh-keygen -t ed25519 -f ~/.ssh/sacvpn_nodes -N ""

# Copy to VA Primary
ssh-copy-id -i ~/.ssh/sacvpn_nodes.pub ubuntu@135.148.121.237

# Copy to Dallas
ssh-copy-id -i ~/.ssh/sacvpn_nodes.pub root@45.79.8.145

# Disable password auth (ONLY after SSH keys work!)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

---

**Status:** Ready for manual deployment
**Time Required:** ~10 minutes per server
**Difficulty:** Easy (copy/paste commands)
