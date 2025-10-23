# SendGrid Setup Guide for SACVPN

**Status:** Code deployed to Railway, waiting for SendGrid API key

---

## Step 1: Create SendGrid Account (2 minutes)

1. **Go to:** https://sendgrid.com/
2. **Click:** "Start for free" or "Sign Up"
3. **Fill in:**
   - Email: usmc3189@gmail.com (or your preferred email)
   - Password: (create a strong password)
   - Company: SACVPN
   - Website: https://www.sacvpn.com

4. **Verify your email** (check inbox for verification link)

**Free Tier:** 100 emails/day forever (perfect for VPN setup emails)

---

## Step 2: Create API Key (1 minute)

1. **Log in to SendGrid dashboard**

2. **Go to:** Settings → API Keys
   - URL: https://app.sendgrid.com/settings/api_keys

3. **Click:** "Create API Key"

4. **Configure:**
   - Name: `SACVPN Production`
   - Permissions: **Full Access** (or "Restricted Access" with Mail Send enabled)

5. **Click:** "Create & View"

6. **COPY THE API KEY** - It looks like:
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   ⚠️ **IMPORTANT:** Copy it now! You won't see it again.

---

## Step 3: Verify Sender Identity (Required - 3 minutes)

SendGrid requires you to verify you own the email address you're sending from.

### Option A: Single Sender Verification (Easiest)

1. **Go to:** Settings → Sender Authentication → Single Sender Verification
   - URL: https://app.sendgrid.com/settings/sender_auth/senders

2. **Click:** "Create New Sender"

3. **Fill in:**
   - From Name: `SACVPN`
   - From Email: `info@stephenscode.dev`
   - Reply To: `info@stephenscode.dev`
   - Company Address: (your business address)
   - City: (your city)
   - State: (your state)
   - Zip: (your zip)
   - Country: United States

4. **Click:** "Create"

5. **Check your email** (info@stephenscode.dev)
   - You'll receive a verification link
   - Click it to verify

6. **Wait for approval** - Usually instant, sometimes takes a few minutes

### Option B: Domain Authentication (Advanced - Better for production)

If you want better deliverability and can add DNS records:

1. **Go to:** Settings → Sender Authentication → Domain Authentication
2. **Follow the wizard** to add DNS records to stephenscode.dev
3. This gives you better email reputation

**For now, Single Sender is fine!**

---

## Step 4: Add API Key to Railway (1 minute)

1. **Go to Railway dashboard** → SCVPN API service

2. **Click:** Variables tab

3. **Add new variable:**
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Remove old SMTP variables** (no longer needed):
   - Delete: `SMTP_USER`
   - Delete: `SMTP_PASS`

5. **Click:** Save (or Railway auto-saves)

6. **Railway will auto-redeploy** - Wait 1-2 minutes

---

## Step 5: Test Email Delivery (1 minute)

Once Railway redeploys:

1. **Go to SACVPN Devices page**

2. **Click:** "Request Key" on your device

3. **Check Railway logs** for:
   ```
   Email service initialized with SendGrid { from: 'SACVPN <info@stephenscode.dev>' }
   VPN setup email sent { messageId: '...', to: 'usmc3189@gmail.com' }
   ```

4. **Check your inbox** - Email should arrive within 10 seconds!

---

## Expected Email

**From:** SACVPN <info@stephenscode.dev>
**Subject:** Your Kyles Iphone VPN is Ready! 🔒

**Contains:**
- Professional HTML email
- QR code (for iPhone)
- .conf file attachment
- Step-by-step setup instructions

---

## Troubleshooting

### "Sender not verified"

**Error:** SendGrid won't send until you verify info@stephenscode.dev

**Fix:**
1. Go to Settings → Sender Authentication → Single Sender Verification
2. Check verification status
3. If pending, check email for verification link
4. Click link to verify

---

### "API key not valid"

**Error:** API key is wrong or has wrong permissions

**Fix:**
1. Go to Settings → API Keys
2. Check the key exists and is enabled
3. If needed, create a new key with Full Access
4. Update Railway with new key

---

### "From email doesn't match verified sender"

**Error:** Code is using a different email than what's verified

**Current code uses:** `info@stephenscode.dev`

**Make sure that's verified in SendGrid!**

---

## SendGrid Dashboard - What to Monitor

### Activity Feed
- URL: https://app.sendgrid.com/email_activity
- Shows all sent emails in real-time
- See delivery status, opens, clicks

### Stats
- URL: https://app.sendgrid.com/statistics
- Daily/weekly email volume
- Delivery rates
- Bounce rates

---

## Free Tier Limits

- **100 emails/day** - More than enough for VPN setup emails
- **Unlimited contacts**
- **Email validation**
- **Basic templates**

If you need more than 100 emails/day, upgrade to Essentials ($19.95/month for 50,000 emails).

---

## Summary Checklist

- [ ] Create SendGrid account
- [ ] Create API key (copy it!)
- [ ] Verify sender (info@stephenscode.dev)
- [ ] Add SENDGRID_API_KEY to Railway
- [ ] Remove SMTP_USER and SMTP_PASS from Railway
- [ ] Wait for Railway to redeploy
- [ ] Test by clicking "Request Key"
- [ ] Check inbox for email

---

**Time Required:** ~10 minutes total
**Difficulty:** Easy
**Cost:** Free (100 emails/day)

Once set up, emails will send reliably every time! 🎉
