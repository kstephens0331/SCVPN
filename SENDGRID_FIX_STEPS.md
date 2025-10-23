# Fix SendGrid Email Delivery

## Current Status
- ✅ Email service code is correctly configured in `email-service.js`
- ✅ Sender email: `SACVPN <info@stephenscode.dev>`
- ❓ SendGrid API key needs to be verified in Railway
- ❓ Sender email needs to be verified in SendGrid

## Step 1: Verify Sender Email in SendGrid

1. Go to https://app.sendgrid.com/settings/sender_auth/senders
2. Check if `info@stephenscode.dev` is verified
   - ✅ **If verified**: Proceed to Step 2
   - ❌ **If NOT verified**: Click "Create New Sender" or "Verify" and follow steps

### To Verify a Sender:
1. Click "Create New Sender"
2. Fill in:
   - **From Name**: SACVPN
   - **From Email Address**: info@stephenscode.dev
   - **Reply To**: info@stephenscode.dev (or your support email)
   - **Company Address**: Your business address
   - **City, State, ZIP, Country**: Your location
3. Click "Create"
4. **Check your email** (info@stephenscode.dev inbox)
5. Click the verification link
6. Wait for "Verified" status

## Step 2: Create Fresh SendGrid API Key

1. Go to https://app.sendgrid.com/settings/api_keys
2. Click **"Create API Key"**
3. Fill in:
   - **API Key Name**: `SACVPN-Production-2025`
   - **API Key Permissions**: **Full Access** (or at minimum "Mail Send")
4. Click **"Create & View"**
5. **COPY THE KEY IMMEDIATELY** (you can't see it again!)
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 3: Update Railway Environment Variable

1. Go to https://railway.app/dashboard
2. Select your **scvpn-api** service
3. Go to **Variables** tab
4. Find or create `SENDGRID_API_KEY`
5. **Paste the new API key** from Step 2
6. Click **"Update"** or **"Add"**
7. Railway will automatically redeploy

## Step 4: Test Email Delivery

### Option A: Test from Web UI
1. Go to https://www.sacvpn.com
2. Log in with your account
3. Go to **Devices** page
4. Create a test device (name it "Test-Phone" or similar)
5. Click **"Request Key"**
6. **Check your email** (usmc3189@gmail.com)
   - Should receive email with subject: "Your Test-Phone VPN is Ready! 🔒"
   - Should have .conf file attachment
   - Should have QR code (if device name contains "phone" or "mobile")

### Option B: Test from Railway Console
Check Railway logs after requesting a key:
```
✅ Success: "VPN setup email sent"
❌ Failure: "Email sending failed" (with error details)
```

## Troubleshooting

### Error: "Unauthorized"
**Cause**: Invalid or expired API key
**Fix**: Create new API key (Step 2) and update Railway (Step 3)

### Error: "The from address does not match a verified Sender Identity"
**Cause**: Sender email not verified
**Fix**: Verify `info@stephenscode.dev` in SendGrid (Step 1)

### Error: "Email service not configured"
**Cause**: `SENDGRID_API_KEY` not set in Railway
**Fix**: Add environment variable in Railway (Step 3)

### Emails not arriving
**Possible causes**:
1. Check spam/junk folder
2. Verify recipient email is correct in database
3. Check SendGrid Activity Feed: https://app.sendgrid.com/email_activity
4. Check Railway logs for email sending confirmation

## Verification Checklist

- [ ] Sender email `info@stephenscode.dev` verified in SendGrid
- [ ] New API key created with "Mail Send" permission
- [ ] `SENDGRID_API_KEY` set in Railway environment variables
- [ ] Railway redeployed with new environment variable
- [ ] Test email sent from web UI
- [ ] Email received successfully with attachment

## SendGrid Activity Monitoring

View all email activity:
https://app.sendgrid.com/email_activity

Filter by:
- **To Email**: `usmc3189@gmail.com` (or customer email)
- **Status**: Delivered, Bounced, Dropped, etc.
- **Date Range**: Last 7 days

## Current Configuration

**Sender**: `SACVPN <info@stephenscode.dev>`
**Subject**: `Your {deviceName} VPN is Ready! 🔒`
**Attachment**: `{devicename}_sacvpn.conf`
**Features**:
- ✅ QR code for mobile devices
- ✅ Step-by-step setup instructions
- ✅ Platform-specific download links
- ✅ Beautiful HTML email template

## Next Steps After Email Works

1. **Test with different device names**:
   - Mobile: "iPhone", "Android" (gets QR code email)
   - Desktop: "Windows PC", "MacBook" (gets file-based email)

2. **Update email template** (optional):
   - Customize branding
   - Add support links
   - Add social media links

3. **Set up email monitoring**:
   - Track delivery rates
   - Monitor bounce rates
   - Set up alerts for failures
