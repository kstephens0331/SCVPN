# Railway Environment Variables - Add These Now

**Action Required:** Add these two environment variables to Railway

---

## SMTP Credentials for Email Service

Go to Railway Dashboard → SCVPN API Service → Variables tab

Add these two variables:

```bash
SMTP_USER=info@stephenscode.dev
SMTP_PASS=rgbfgvldtovqruhf
```

**Note:** The App Password above has spaces removed (16 characters total)

---

## After Adding Variables

1. Railway will automatically redeploy
2. Check logs for: `Email service initialized with Google SMTP`
3. Email service is ready to send WireGuard setup emails

---

## All Current Environment Variables

Your Railway service should have these configured:

### Stripe
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_PUBLISHABLE_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ✅
- All Price IDs (25 total) ✅

### Supabase
- `SCVPN_SUPABASE_URL` ✅
- `SCVPN_SUPABASE_SERVICE_KEY` ✅

### VPN Management
- `VPN_NODE_SSH_PASSWORD` ✅

### Email (NEW - Add Now)
- `SMTP_USER=info@stephenscode.dev` ⚠️ ADD NOW
- `SMTP_PASS=rgbfgvldtovqruhf` ⚠️ ADD NOW

### Site Configuration
- `ALLOWED_ORIGINS` ✅
- `SITE_URL` ✅

---

## Testing After Deployment

Once Railway redeploys with SMTP credentials:

1. **Check Logs:**
   ```
   Email service initialized with Google SMTP { user: 'info@stephenscode.dev' }
   ```

2. **Test Email Delivery:**
   - Log in to SACVPN dashboard
   - Create/select a device
   - Click "Request WireGuard Key"
   - Check inbox for setup email with .conf attachment

3. **Expected Log Output:**
   ```
   VPN setup email sent { messageId: '...', to: 'user@example.com' }
   ```

---

**Status:** Ready to add to Railway
**Priority:** HIGH - Required for WireGuard key delivery emails
