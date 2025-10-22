# Google SMTP Setup for SACVPN Email Service

The email service now uses Google SMTP with **info@stephenscode.dev** instead of Resend API.

---

## Step 1: Generate Google App Password

**IMPORTANT:** You cannot use your regular Google password for SMTP. You must create an App Password.

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Sign in with info@stephenscode.dev

2. **Enable 2-Step Verification (if not already enabled)**
   - Go to Security → 2-Step Verification
   - Follow the prompts to enable it (required for App Passwords)

3. **Create App Password**
   - Go to Security → 2-Step Verification → App passwords
   - Or direct link: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **SACVPN Railway**
   - Click **Generate**
   - Google will show a 16-character password (e.g., `abcd efgh ijkl mnop`)
   - **Copy this password** - you won't see it again!

---

## Step 2: Add to Railway Environment Variables

1. **Go to Railway Dashboard**
   - Open your SCVPN API service
   - Go to **Variables** tab

2. **Add these two variables:**

```bash
SMTP_USER=info@stephenscode.dev
SMTP_PASS=rgbf gvld tovq ruhf
```

**IMPORTANT:**
- Remove any spaces from the App Password (should be 16 characters)
- Example: `abcd efgh ijkl mnop` becomes `abcdefghijklmnop`

3. **Save and Redeploy**
   - Railway will automatically redeploy with the new variables

---

## Step 3: Verify Email Service is Working

After Railway redeploys, check the logs:

```
Email service initialized with Google SMTP
```

If you see this, the email service is ready!

---

## Testing Email Delivery

1. **Request a WireGuard key** from the user dashboard
2. **Check Railway logs** for:
   ```
   VPN setup email sent
   ```
3. **Check inbox** for the VPN setup email with .conf attachment

---

## Troubleshooting

### "Email service not configured"
- Check that SMTP_USER and SMTP_PASS are set in Railway
- Verify no spaces in App Password

### "Authentication failed"
- Make sure you're using an App Password, not your regular password
- Verify 2-Step Verification is enabled on the Google account
- Try generating a new App Password

### "Connection timeout"
- Railway may be blocking port 587
- Check Railway networking settings
- Try port 465 with `secure: true` (see alternative config below)

---

## Alternative Configuration (Port 465)

If port 587 doesn't work, edit `email-service.js`:

```javascript
this.transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: smtpConfig.user,
    pass: smtpConfig.pass,
  },
});
```

---

## Email Features

**From:** SACVPN <info@stephenscode.dev>

**Includes:**
- Professional HTML email templates
- QR code for mobile devices (embedded in email)
- .conf file attachment for desktop/manual setup
- Step-by-step setup instructions
- Platform-specific guidance (Windows/Mac/Linux/iOS/Android)

**Email Types:**
1. **Mobile Setup** - Shows QR code prominently, App Store/Play Store links
2. **Desktop Setup** - Download links for WireGuard, manual import instructions

---

## Security Notes

- App Passwords are safer than regular passwords (scoped access)
- If compromised, revoke in Google Account settings
- Each app can have its own password for easy revocation
- Google logs all login attempts - monitor for suspicious activity

---

**Status:** Ready to configure
**Priority:** HIGH - Required for WireGuard key delivery
