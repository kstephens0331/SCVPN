# SACVPN Testing Guide - Complete Flow

**Updated:** 2025-10-22 (Post-Deployment)
**Deployments:** Railway + Vercel automatically deploying

---

## ✅ What Was Just Deployed

### 1. Subscription Display Fix
- `/api/checkout/claim` now creates subscriptions in database
- Billing page will show active plan immediately after login

### 2. Immediate Key Generation
- New `/api/wireguard/generate-key` endpoint
- Keys generated instantly when user clicks "Request Key"
- Email sent immediately (no batch processing needed)

### 3. Google SMTP Email Service
- Replaced Resend with nodemailer
- Sends from: SACVPN <info@stephenscode.dev>
- Professional HTML templates with QR codes

---

## 🧪 TEST 1: Complete User Signup to VPN Flow

**Goal:** Verify entire system works end-to-end

### Step 1: Clean Slate (2 minutes)

1. Go to Supabase Dashboard → SQL Editor
2. Delete test user data:
   ```sql
   DELETE FROM device_configs WHERE device_id IN (
     SELECT id FROM devices WHERE user_id IN (
       SELECT id FROM profiles WHERE email = 'usmc3189@gmail.com'
     )
   );

   DELETE FROM devices WHERE user_id IN (
     SELECT id FROM profiles WHERE email = 'usmc3189@gmail.com'
   );

   DELETE FROM subscriptions WHERE user_id IN (
     SELECT id FROM profiles WHERE email = 'usmc3189@gmail.com'
   );

   DELETE FROM checkout_sessions WHERE email = 'usmc3189@gmail.com';

   DELETE FROM profiles WHERE email = 'usmc3189@gmail.com';

   -- Also delete from auth.users
   DELETE FROM auth.users WHERE email = 'usmc3189@gmail.com';
   ```

### Step 2: Checkout Flow (3 minutes)

1. **Go to SACVPN Website**
   - Navigate to pricing page
   - Click "Get Started" on **Personal Monthly** plan

2. **Complete Stripe Checkout**
   - Email: `usmc3189@gmail.com`
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Name: Test User
   - Click "Subscribe"

3. **Expected Result:**
   - Redirected to post-checkout page
   - Stripe shows payment successful ✅

### Step 3: Sign Up / Login (2 minutes)

1. **On Post-Checkout Page**
   - If new user: Sign up with `usmc3189@gmail.com`
   - If returning: Log in with `usmc3189@gmail.com`
   - Check email for verification link (if sign up)
   - Verify email and log in

2. **Expected Result:**
   - Logged into SACVPN dashboard ✅

### Step 4: Verify Subscription Display (1 minute)

1. **Check Billing Page**
   - Click "Billing" in sidebar
   - Look for subscription details

2. **Expected Result:**
   - Plan: "Personal"
   - Billing Period: "Monthly"
   - Status: "Active" (green badge)
   - Next Billing Date: ~30 days from now
   - Stripe Customer Portal button visible ✅

3. **Check Railway Logs:**
   ```
   [claim] Subscription linked to user { userId: '...', subId: 'sub_...', plan: 'personal' }
   ```

4. **If Subscription NOT Showing:**
   - Check Railway logs for errors
   - Verify Stripe dashboard shows active subscription
   - Check Supabase subscriptions table

---

## 🧪 TEST 2: WireGuard Key Generation & Email

**Goal:** Verify immediate key generation and email delivery

### Step 1: Create Device (1 minute)

1. **Go to Devices Page**
   - Click "Devices" in sidebar
   - Enter device name: "Test iPhone"
   - Select platform: "iOS"
   - Click "Add Device"

2. **Expected Result:**
   - New device appears in list ✅
   - Status shows no active config yet

### Step 2: Request WireGuard Key (2 minutes)

1. **Click "Request Key"**
   - Find your device in the list
   - Click "Request Key" button
   - Wait 5-10 seconds

2. **Expected Alert:**
   ```
   ✅ WireGuard keys generated! Check your email for setup instructions.
   ```

3. **Check Railway Logs (CRITICAL - Verify Email Sent):**
   ```
   Generating WireGuard keys { deviceId: '...', userId: '...' }
   Email service initialized with Google SMTP { user: 'info@stephenscode.dev' }
   VPN setup email sent { userId: '...', email: 'usmc3189@gmail.com', messageId: '...' }
   ```

4. **If Email Fails:**
   - Check logs for: "Email service not configured"
   - Verify SMTP_USER and SMTP_PASS in Railway variables
   - Check Gmail didn't block the login (go to myaccount.google.com/security)
   - Try port 465 with secure: true (see GOOGLE_SMTP_SETUP.md)

### Step 3: Verify Email Received (2 minutes)

1. **Check Inbox** (usmc3189@gmail.com)
   - Look for email from "SACVPN <info@stephenscode.dev>"
   - Subject: "Your Test iPhone VPN is Ready! 🔒"

2. **Email Should Contain:**
   - ✅ Professional HTML layout with SACVPN branding
   - ✅ QR code (large, scannable image) - for iOS device
   - ✅ Attached file: `test_iphone_sacvpn.conf`
   - ✅ Step-by-step setup instructions
   - ✅ App Store link for WireGuard app
   - ✅ Alternative manual import instructions

3. **Check Attachment:**
   - Download `test_iphone_sacvpn.conf`
   - Open in text editor
   - Should contain:
     ```ini
     [Interface]
     PrivateKey = [base64 key]
     Address = 10.70.0.X/32 or 10.71.0.X/32
     DNS = 1.1.1.1, 8.8.8.8

     [Peer]
     PublicKey = [server public key]
     Endpoint = 135.148.121.237:51820 or 45.79.8.145:51820
     AllowedIPs = 0.0.0.0/0
     PersistentKeepalive = 25
     ```

### Step 4: Download Config from Dashboard (1 minute)

1. **View Config in Browser**
   - Device should now show "Config Available"
   - Click "View Config" or download button
   - Config file should download

2. **Expected Result:**
   - Same .conf file downloads ✅
   - Matches email attachment ✅

---

## 🧪 TEST 3: VPN Node Selection (Advanced)

**Goal:** Verify Dallas-to-VA overflow routing works

### Check Which Node Was Selected

1. **Look at .conf file Endpoint:**
   - `Endpoint = 45.79.8.145:51820` → Dallas Central
   - `Endpoint = 135.148.121.237:51820` → VA Primary

2. **Check Railway Logs:**
   ```
   Selected Dallas Central for quick connect (under 80% capacity) { node: 'SACVPN-Dallas-Central', load: '0/1000', capacity: '0.0%' }
   ```

3. **Expected Behavior:**
   - First ~800 users → Dallas Central (45.79.8.145)
   - After 800 users → VA Primary (135.148.121.237)

---

## 🧪 TEST 4: Mobile vs Desktop Email Templates

**Goal:** Verify correct template is sent based on device type

### Test Mobile Template (iOS/Android)

1. Create device with platform: **iOS** or **Android**
2. Request key
3. Check email contains:
   - ✅ Large QR code prominently displayed
   - ✅ "Scan this code with your camera" instruction
   - ✅ App Store / Play Store badges
   - ✅ Alternative manual import section

### Test Desktop Template (Windows/Mac/Linux)

1. Create device with platform: **Windows**, **macOS**, or **Linux**
2. Request key
3. Check email contains:
   - ✅ WireGuard download links for each OS
   - ✅ "Import tunnel from file" instructions
   - ✅ Command line examples (for Linux)
   - ✅ No QR code section (desktop doesn't need it)

---

## 📊 Expected Success Metrics

### Railway Logs Should Show:

```bash
# Successful startup
Email service initialized with Google SMTP { user: 'info@stephenscode.dev' }

# Successful subscription claim
[claim] Subscription linked to user { userId: '...', subId: 'sub_...', plan: 'personal' }

# Successful key generation
Generating WireGuard keys { deviceId: '...', userId: '...' }
Selected Dallas Central for quick connect { node: 'SACVPN-Dallas-Central', ... }

# Successful email delivery
VPN setup email sent { userId: '...', email: 'usmc3189@gmail.com', messageId: '<...@smtp.gmail.com>' }
```

### Stripe Dashboard Should Show:

- ✅ New customer created
- ✅ Active subscription for Personal plan
- ✅ Subscription metadata includes user_id
- ✅ Payment successful

### Supabase Tables Should Show:

**profiles:**
- ✅ User exists with email usmc3189@gmail.com

**subscriptions:**
- ✅ Entry with stripe_subscription_id
- ✅ user_id matches profile
- ✅ status = 'active'
- ✅ plan = 'personal'

**devices:**
- ✅ Device exists with name "Test iPhone"
- ✅ user_id matches profile

**device_configs:**
- ✅ Config exists for device
- ✅ Has vpn_node_id (Dallas or VA)
- ✅ Has client_public_key, client_private_key, client_ip
- ✅ is_active = true

---

## ⚠️ Troubleshooting Common Issues

### Issue: "No active plan" in billing page

**Check:**
1. Railway logs for `[claim] Subscription linked to user`
2. Stripe dashboard → Customers → Find by email → Check subscription exists
3. Supabase subscriptions table → Check user_id matches

**Fix:**
- Call `/api/checkout/claim` manually with session_id
- Check STRIPE_SECRET_KEY is correct in Railway

---

### Issue: "Email not received"

**Check:**
1. Railway logs for `VPN setup email sent`
2. Check spam folder
3. Verify SMTP credentials in Railway
4. Check Gmail security at myaccount.google.com/security

**Fix:**
- Verify SMTP_USER and SMTP_PASS are set correctly
- Try regenerating App Password
- Check Gmail hasn't blocked the login
- Try port 465 instead of 587 (see GOOGLE_SMTP_SETUP.md)

---

### Issue: "Device config 404 error"

**Check:**
1. Railway logs for "Generating WireGuard keys"
2. Supabase device_configs table
3. SSH connectivity to VPN nodes

**Fix:**
- Click "Request Key" again
- Check VPN_NODE_SSH_PASSWORD in Railway
- Verify VPN nodes are accessible

---

### Issue: "WireGuard connection fails"

**Check:**
1. .conf file has valid keys
2. Endpoint IP is reachable (ping 135.148.121.237 or 45.79.8.145)
3. Port 51820 is open
4. WireGuard app is installed

**Fix:**
- Regenerate keys
- Check VPN server is running
- Try different VPN node

---

## 🎯 Success Criteria Summary

You'll know everything is working perfectly when:

1. ✅ User completes checkout → logs in → sees "Personal - Active" in billing
2. ✅ User adds device → clicks "Request Key" → receives email within 10 seconds
3. ✅ Email contains QR code (mobile) or download links (desktop)
4. ✅ Email has .conf file attachment
5. ✅ Config can be downloaded from dashboard
6. ✅ WireGuard connects successfully using the config
7. ✅ Railway logs show all steps completing without errors

---

## 📞 Quick Reference

**Test Stripe Card:** 4242 4242 4242 4242
**Test Email:** usmc3189@gmail.com
**Railway URL:** https://railway.app (check logs)
**Stripe Dashboard:** https://dashboard.stripe.com/test/customers
**Supabase Dashboard:** https://supabase.com/dashboard

**Key Endpoints:**
- POST /api/checkout → Create checkout session
- POST /api/checkout/claim → Link subscription to user
- POST /api/wireguard/generate-key → Generate keys + send email
- GET /api/device/:id/config → Download config file

---

**Test Duration:** ~15 minutes total
**Confidence Level:** 🟢 HIGH - All critical fixes deployed
**Ready to Test:** ✅ YES - Railway and Vercel deployed
