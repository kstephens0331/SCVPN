# 🚂 Railway Environment Variables - Complete List

**Project:** sacvpn-production.up.railway.app
**Project ID:** 2b5f8eee-06d2-4e7f-b344-cf29580514e5

---

## ✅ ALREADY CONFIGURED (No action needed)

```bash
# Supabase
VITE_SUPABASE_URL=https://ltwuqjmncldopkutiyak.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0d3Vxam1uY2xkb3BrdXRpeWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4Mjk5NDQsImV4cCI6MjA3MTQwNTk0NH0.JdboTA0XjFLbr_xG7fi9GKa2QiS0hqFpzr-FD1Q6f0Q

# Stripe
STRIPE_SECRET_KEY=<configured in Railway dashboard>
STRIPE_PUBLISHABLE_KEY=pk_live_51RK1KrDcTrtfdJcSaB7uKNkMTbfnC7i2DzKglQBpLEUnIOhBU1q6i6Dxj2ZNu6Ju4UwxxaGa4iaOhWj5t4Mq7HRt00dbwgDNue
STRIPE_WEBHOOK_SECRET=<configured in Railway dashboard>
STRIPE_PRICE_PERSONAL=price_1RM6MTDcTrtfdJcSxlsRLpiX
STRIPE_PRICE_GAMING=price_1RM6NaDcTrtfdJcSZk0j6ZSJ
STRIPE_PRICE_BUSINESS10=price_1RzVk3IDJGv9IedB6J7wSbMP
STRIPE_PRICE_BUSINESS50=price_1RzVkMIDJGv9IedBN74h6VlE
STRIPE_PRICE_BUSINESS250=price_1RzVkZIDJGv9IedBJHbDKHyx

# API
VITE_API_URL=https://scvpn-production.up.railway.app
ALLOWED_ORIGINS=https://www.sacvpn.com,https://sacvpn.com,http://localhost:5173,https://scvpn-production.up.railway.app

# Agent/Portal (already configured)
AGENT_KEY_PATH=/app/secrets/portal.key
AGENT_CERT_PATH=/app/secrets/portal.crt
AGENT_CA_PATH=/app/secrets/root.crt
```

---

## ❌ MISSING - NEED TO ADD THESE

Go to Railway Dashboard → Your Project → Variables → Add these:

### **1. Supabase Service Role Key (CRITICAL)**
```bash
SCVPN_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0d3Vxam1uY2xkb3BrdXRpeWFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyOTk0NCwiZXhwIjoyMDcxNDA1OTQ0fQ.J0GjiUMfB5dtO6QItZvtQiSduNRLWZDcW5gDZL91fIc
```

### **2. VPN Node SSH Password (CRITICAL)**
```bash
VPN_NODE_SSH_PASSWORD=78410889Ks!
```

### **3. Site URL (if missing)**
```bash
SITE_URL=https://www.sacvpn.com
```

### **4. Email Service (OPTIONAL - for later)**
```bash
# Create account at resend.com first, then add:
RESEND_API_KEY=re_YourKeyHere
```

---

## 📋 HOW TO ADD TO RAILWAY

### Method 1: Web Dashboard
1. Go to: https://railway.app/project/2b5f8eee-06d2-4e7f-b344-cf29580514e5
2. Click on your **scvpn-api** service
3. Click **Variables** tab
4. Click **New Variable**
5. Add each variable name and value
6. Railway will auto-redeploy

### Method 2: Railway CLI (if installed)
```bash
railway variables set SCVPN_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0d3Vxam1uY2xkb3BrdXRpeWFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyOTk0NCwiZXhwIjoyMDcxNDA1OTQ0fQ.J0GjiUMfB5dtO6QItZvtQiSduNRLWZDcW5gDZL91fIc"

railway variables set VPN_NODE_SSH_PASSWORD="78410889Ks!"
railway variables set SITE_URL="https://www.sacvpn.com"
```

---

## ⚙️ NIXPACKS CONFIG (For sshpass installation)

Railway needs `sshpass` and `wireguard-tools` installed. Create this file:

**File:** `scvpn-api/nixpacks.toml`
```toml
[phases.setup]
aptPkgs = ['sshpass', 'wireguard-tools', 'openssh-client']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = []

[start]
cmd = 'npm start'
```

---

## 🧪 VERIFY ENVIRONMENT VARIABLES WORK

After adding to Railway, test:

```bash
# Should show WireGuard manager initialized
curl https://scvpn-production.up.railway.app/api/wireguard/health

# Should show both nodes
curl https://scvpn-production.up.railway.app/api/wireguard/nodes
```

---

## 🚨 CRITICAL NOTES

1. **SCVPN_SUPABASE_SERVICE_KEY** is required for all database operations
2. **VPN_NODE_SSH_PASSWORD** is required for adding peers to WireGuard nodes
3. After adding variables, Railway will automatically redeploy
4. Wait ~2 minutes for deployment to complete
5. Test health endpoint after deployment

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] SCVPN_SUPABASE_SERVICE_KEY added
- [ ] VPN_NODE_SSH_PASSWORD added
- [ ] SITE_URL verified
- [ ] nixpacks.toml created in scvpn-api/
- [ ] Committed and pushed to GitHub
- [ ] Railway auto-deployed
- [ ] Health check passes
- [ ] Both nodes visible in /api/wireguard/nodes

---

**Status:** Environment variables documented
**Next:** Add to Railway after VPN nodes are deployed
