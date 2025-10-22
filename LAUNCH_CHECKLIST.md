# 🚀 SACVPN LAUNCH CHECKLIST

**Goal:** Get SACVPN fully operational and ready to accept customers
**Estimated Time:** 2-4 hours

---

## ✅ PRE-LAUNCH CHECKLIST

### Step 1: Deploy VPN Nodes (2 hours) 🔴 CRITICAL

#### VA Primary Node (135.148.121.237)
```bash
# SSH into the server
ssh ubuntu@135.148.121.237
# Password: 78410889Ks!

# Install WireGuard
sudo apt-get update
sudo apt-get install -y wireguard wireguard-tools

# Create config directory
sudo mkdir -p /etc/wireguard

# Create server config (copy from MANUAL_DEPLOYMENT_STEPS.md)
sudo nano /etc/wireguard/wg0.conf
```

**Paste this config:**
```ini
[Interface]
PrivateKey = nMPOwCtInSfDUIl7RQc8WM4+gBy88Cq7dghvAH3LVSs=
Address = 10.66.0.1/24
ListenPort = 51820
SaveConfig = false

PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```

```bash
# Set permissions
sudo chmod 600 /etc/wireguard/wg0.conf

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Start WireGuard
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# Verify it's running
sudo wg show
# Should show interface wg0 with public key
```

#### Dallas Central Node (45.79.8.145)
```bash
# SSH into the server
ssh root@45.79.8.145
# Password: 78410889Ks!

# Install WireGuard
apt-get update
apt-get install -y wireguard wireguard-tools

# Create config directory
mkdir -p /etc/wireguard

# Create server config
nano /etc/wireguard/wg0.conf
```

**Paste this config:**
```ini
[Interface]
PrivateKey = a3YWIHKfwF+ksp7WET7K/YJbAPAFJj6t4nLpeMJcPmM=
Address = 10.77.0.1/24
ListenPort = 51820
SaveConfig = false

PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```

```bash
# Set permissions
chmod 600 /etc/wireguard/wg0.conf

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" | tee -a /etc/sysctl.conf
sysctl -p

# Start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# Verify it's running
wg show
# Should show interface wg0 with public key
```

**✅ Verification:**
- [ ] VA Primary shows `wg show` with public key starting with `pQEfl7P/`
- [ ] Dallas Central shows `wg show` with public key starting with `A4LFpt5GY`

---

### Step 2: Set Up Resend Email Service (15 minutes) 🟡 RECOMMENDED

1. **Create Resend Account:**
   - Go to https://resend.com
   - Sign up with your email
   - Verify your email address

2. **Add Domain:**
   - Click "Domains" in sidebar
   - Click "Add Domain"
   - Enter: `sacvpn.com`
   - Follow DNS verification steps
   - Add the DKIM, SPF, and DMARC records to your domain's DNS

3. **Get API Key:**
   - Click "API Keys" in sidebar
   - Click "Create API Key"
   - Name it: "SACVPN Production"
   - Copy the key (starts with `re_`)
   - **SAVE THIS KEY** - you'll add it to Railway next

**✅ Verification:**
- [ ] Domain shows "Verified" status in Resend dashboard
- [ ] API key copied and saved securely

---

### Step 3: Configure Railway Environment Variables (10 minutes) 🔴 CRITICAL

1. **Go to Railway:**
   - Visit https://railway.app
   - Open your `scvpn-production` project
   - Click on your API service
   - Click "Variables" tab

2. **Add/Verify These Variables:**

**Add if missing:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
VPN_NODE_SSH_PASSWORD=78410889Ks!
```

**Verify these exist:**
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
SCVPN_SUPABASE_URL=https://ltwuqjmncldopkutiyak.supabase.co
SCVPN_SUPABASE_SERVICE_KEY=eyJhbGc... (long key)
SITE_URL=https://www.sacvpn.com
```

3. **Click "Deploy" to restart with new variables**

**✅ Verification:**
- [ ] All environment variables present
- [ ] Service redeployed successfully
- [ ] Check logs for "Email service initialized" message

---

### Step 4: Run Gaming Optimization SQL (5 minutes) 🟢 OPTIONAL

1. **Open Supabase:**
   - Go to https://supabase.com
   - Open SACVPN project
   - Click "SQL Editor" in sidebar

2. **Run This SQL:**
```sql
UPDATE vpn_nodes
SET
  gaming_optimized = true,
  performance_tier = 'premium',
  priority = 1
WHERE name = 'SACVPN-VA-Primary';

UPDATE vpn_nodes
SET
  gaming_optimized = false,
  performance_tier = 'standard',
  priority = 2
WHERE name = 'SACVPN-Dallas-Central';
```

3. **Click "Run"**

**✅ Verification:**
- [ ] Query returns "Success: 2 rows affected"
- [ ] Gaming users will route to VA Primary node

---

### Step 5: Deploy Code to Production (5 minutes) 🔴 CRITICAL

**If code is already pushed to GitHub:**
- Railway should auto-deploy
- Check deployment status in Railway dashboard

**If code needs to be pushed:**
```bash
# Check current status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Launch: Complete VPN infrastructure with email and QR code support"

# Push to GitHub
git push origin main
```

**✅ Verification:**
- [ ] GitHub shows latest commit
- [ ] Railway shows "Deploying..." then "Active"
- [ ] Check Railway logs for any errors

---

### Step 6: Activate GitHub Actions Cron (5 minutes) 🟡 RECOMMENDED

**The cron job will automatically activate when code is pushed to GitHub.**

**Verify it's working:**
1. Go to GitHub repository
2. Click "Actions" tab
3. Click "Process VPN Key Requests" workflow
4. Click "Enable workflow" if disabled
5. Click "Run workflow" → "Run workflow" to test manually

**✅ Verification:**
- [ ] Workflow runs successfully
- [ ] Shows "Successfully processed X key requests"
- [ ] Will run automatically every 5 minutes

---

## 🧪 TESTING CHECKLIST

### Test 1: New User Signup (15 minutes)

1. **Create Test Account:**
   - Go to https://www.sacvpn.com
   - Click "Sign Up"
   - Use a real email you can check
   - Choose "Personal" plan ($7.99)
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

2. **Verify Checkout:**
   - [ ] Redirected to /post-checkout page
   - [ ] Can create account with email
   - [ ] Redirected to personal dashboard

3. **Check Database:**
   - Open Supabase → Table Editor → subscriptions
   - [ ] Your subscription exists
   - [ ] Status is "active"
   - [ ] Stripe customer ID present

**✅ Test 1 Result:** PASS / FAIL

---

### Test 2: Add Device & Get VPN Config (20 minutes)

1. **Add Device:**
   - In dashboard, click "Add New Device"
   - Name it "iPhone Test"
   - Platform: iOS
   - Click "Request Access"

2. **Wait for Processing:**
   - GitHub Actions cron runs every 5 minutes
   - OR manually trigger the workflow
   - Check Railway logs: `Processed 1 key request`

3. **Check Email:**
   - [ ] Received email from "SACVPN <noreply@sacvpn.com>"
   - [ ] Email subject: "Your iPhone Test VPN is Ready! 🔒"
   - [ ] Email contains QR code image
   - [ ] Email contains setup instructions
   - [ ] Email has .conf file attachment

4. **View Config in Dashboard:**
   - Click "View Config" button
   - [ ] Modal opens with QR code
   - [ ] QR code displays correctly
   - [ ] Can download .conf file
   - [ ] Can copy config to clipboard

**✅ Test 2 Result:** PASS / FAIL

---

### Test 3: Connect to VPN (15 minutes)

1. **Install WireGuard:**
   - iOS: Download from App Store
   - Android: Download from Play Store
   - Windows/Mac: Download from wireguard.com

2. **Import Config:**
   - **Mobile:** Scan QR code from email or dashboard
   - **Desktop:** Download .conf file and import

3. **Connect:**
   - Toggle VPN on in WireGuard app
   - [ ] Connection established
   - [ ] Shows "Active" status

4. **Verify VPN Works:**
   - Go to https://whatismyip.com
   - [ ] IP address is **135.148.121.237** (VA Primary) or **45.79.8.145** (Dallas)
   - [ ] Location shows Virginia or Texas

5. **Test Internet:**
   - [ ] Can browse websites normally
   - [ ] Can stream videos
   - [ ] No DNS issues

**✅ Test 3 Result:** PASS / FAIL

---

### Test 4: Multiple Devices (10 minutes)

1. **Add Second Device:**
   - Name it "Laptop Test"
   - Platform: Windows
   - Click "Request Access"

2. **Wait 5 minutes or trigger cron manually**

3. **Check Email:**
   - [ ] Received different email (desktop version)
   - [ ] No QR code (desktop doesn't need it)
   - [ ] Has download instructions
   - [ ] Has .conf attachment

4. **Connect Both Devices:**
   - [ ] Both devices connected simultaneously
   - [ ] Both show same external IP
   - [ ] Both work independently

**✅ Test 4 Result:** PASS / FAIL

---

### Test 5: Admin Portal (10 minutes)

1. **Access Admin Panel:**
   - Go to https://www.sacvpn.com/admin
   - Login with admin credentials

2. **Verify Admin Views:**
   - [ ] See all users
   - [ ] See all subscriptions
   - [ ] See all devices
   - [ ] See all key requests
   - [ ] Can view device configs

3. **Check Node Status:**
   - [ ] Both nodes show as registered
   - [ ] VA Primary priority = 1
   - [ ] Dallas Central priority = 2

**✅ Test 5 Result:** PASS / FAIL

---

### Test 6: Stripe Webhooks (10 minutes)

**Test in Stripe Dashboard:**
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Click "Send test webhook"

**Check Results:**
- [ ] Webhook shows "200 OK" response
- [ ] Railway logs show webhook received
- [ ] Database updated (if applicable)

**Test Real Transaction:**
1. Create another account
2. Use real payment method OR test card
3. Complete checkout
4. [ ] Subscription created in database
5. [ ] User can access dashboard

**✅ Test 6 Result:** PASS / FAIL

---

## 🎉 LAUNCH DECISION

### Launch Criteria (All Must Pass):
- [ ] ✅ VA Primary VPN node running
- [ ] ✅ Dallas Central VPN node running
- [ ] ✅ Railway environment variables configured
- [ ] ✅ Code deployed to production
- [ ] ✅ GitHub Actions cron activated
- [ ] ✅ Test 1: User signup PASSED
- [ ] ✅ Test 2: Device config PASSED
- [ ] ✅ Test 3: VPN connection PASSED
- [ ] ✅ Test 4: Multiple devices PASSED
- [ ] ✅ Test 5: Admin portal PASSED
- [ ] ✅ Test 6: Stripe webhooks PASSED

### Optional (Recommended):
- [ ] 🟡 Resend email service configured
- [ ] 🟡 Gaming optimization SQL run
- [ ] 🟡 Domain verified in Resend

---

## ✅ POST-LAUNCH TASKS

### Week 1: Monitor & Stabilize
- [ ] Check Railway logs daily for errors
- [ ] Monitor Stripe webhook success rate
- [ ] Set up UptimeRobot (https://uptimerobot.com)
  - Monitor: https://scvpn-production.up.railway.app/health
  - Alert if down for > 5 minutes
- [ ] Set up Sentry for error tracking (optional)
- [ ] Create real admin account (not test account)

### Week 2: Enhance
- [ ] Collect telemetry data (bandwidth usage)
- [ ] Implement node health monitoring
- [ ] Add more trust badges to website
- [ ] Fix contact form (currently non-functional)

### Month 1: Grow
- [ ] Add annual billing option (30-40% revenue boost)
- [ ] Create use-case landing pages (For Gamers, For Streamers)
- [ ] Launch referral program
- [ ] Add customer testimonials

---

## 🆘 TROUBLESHOOTING

### Issue: VPN node won't start
**Solution:**
```bash
# Check status
sudo systemctl status wg-quick@wg0

# View detailed logs
sudo journalctl -u wg-quick@wg0 -n 50

# Restart service
sudo systemctl restart wg-quick@wg0
```

### Issue: No email received
**Checks:**
- [ ] RESEND_API_KEY in Railway variables?
- [ ] Domain verified in Resend dashboard?
- [ ] Check spam folder
- [ ] Check Railway logs for email errors

### Issue: Key not generated
**Checks:**
- [ ] GitHub Actions cron running?
- [ ] Check "Actions" tab in GitHub
- [ ] Manually trigger workflow
- [ ] Check Railway logs: `/api/wireguard/process-requests`

### Issue: Can't connect to VPN
**Checks:**
- [ ] VPN node running? (`sudo wg show`)
- [ ] Firewall allows UDP 51820?
- [ ] Config has correct server IP?
- [ ] Public key matches node registration?

### Issue: Railway deployment failed
**Checks:**
- [ ] Check build logs in Railway
- [ ] Verify all environment variables present
- [ ] Check for npm package errors
- [ ] Verify nixpacks.toml syntax

---

## 📞 EMERGENCY CONTACTS

### Services:
- **Railway Support:** https://railway.app/help
- **Stripe Support:** https://support.stripe.com
- **Supabase Support:** https://supabase.com/dashboard/support
- **Resend Support:** https://resend.com/support

### Dashboards:
- **Railway:** https://railway.app/
- **Stripe:** https://dashboard.stripe.com
- **Supabase:** https://supabase.com/dashboard
- **Resend:** https://resend.com/emails

---

## 🚀 YOU'RE READY TO LAUNCH!

**Once all tests pass, you're officially LIVE!**

Start small:
1. Soft launch to friends & family
2. Monitor for 1 week
3. Fix any issues
4. Public launch with marketing

**Good luck! 🎉**

---

**Questions? Review these docs:**
- `CURRENT_STATUS_REPORT.md` - Complete system status
- `MANUAL_DEPLOYMENT_STEPS.md` - Detailed VPN deployment
- `IMPROVEMENT_ROADMAP.md` - Future enhancements
- `TESTING_CHECKLIST.md` - Comprehensive testing guide
