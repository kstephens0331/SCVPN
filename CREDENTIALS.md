# 🔐 SACVPN CREDENTIALS INVENTORY

**CONFIDENTIAL - DO NOT COMMIT TO GIT**

Last Updated: 2025-10-21
Status: ✅ ALL CREDENTIALS VERIFIED

---

## ✅ CONFIRMED CREDENTIALS

### Supabase
```
SCVPN_SUPABASE_URL=https://ltwuqjmncldopkutiyak.supabase.co
SCVPN_SUPABASE_SERVICE_KEY=<REDACTED-SUPABASE-SERVICE-KEY>
VITE_SUPABASE_ANON_KEY=<REDACTED-SUPABASE-ANON-KEY>
```

### Stripe (LIVE MODE - Production)
```
STRIPE_SECRET_KEY=<see Railway environment variables>
STRIPE_PUBLISHABLE_KEY=<REDACTED-STRIPE-PUBLISHABLE-KEY>
STRIPE_WEBHOOK_SECRET=<see Railway environment variables>
```

### Stripe Price IDs
```
STRIPE_PRICE_PERSONAL=price_1RM6MTDcTrtfdJcSxlsRLpiX
STRIPE_PRICE_GAMING=price_1RM6NaDcTrtfdJcSZk0j6ZSJ
STRIPE_PRICE_BUSINESS10=price_1RzVk3IDJGv9IedB6J7wSbMP
STRIPE_PRICE_BUSINESS50=price_1RzVkMIDJGv9IedBN74h6VlE
STRIPE_PRICE_BUSINESS250=price_1RzVkZIDJGv9IedBJHbDKHyx
```

### Deployment
```
VITE_API_URL=https://scvpn-production.up.railway.app
ALLOWED_ORIGINS=https://www.sacvpn.com,https://sacvpn.com,http://localhost:5173,https://scvpn-production.up.railway.app
SITE_URL=https://www.sacvpn.com
```

### VPN Servers
```
VA_PRIMARY_IP=135.148.121.237
VA_PRIMARY_USER=ubuntu
VA_PRIMARY_PASSWORD=<REDACTED-SERVER-PASSWORD>

DALLAS_CENTRAL_IP=45.79.8.145
DALLAS_CENTRAL_USER=root
DALLAS_CENTRAL_PASSWORD=<REDACTED-SERVER-PASSWORD>

VPN_NODE_SSH_PASSWORD=<REDACTED-SERVER-PASSWORD>
```

### Agent/Portal Certificates (Already in Railway)
```
AGENT_KEY_PATH=/app/secrets/portal.key
AGENT_CERT_PATH=/app/secrets/portal.crt
AGENT_CA_PATH=/app/secrets/root.crt
```

---

## ✅ WHAT I NEED TO ADD TO RAILWAY

Based on the credentials above, I need to add these NEW environment variables to Railway:

```bash
# WireGuard/VPN specific
SCVPN_SUPABASE_SERVICE_KEY=<REDACTED-SUPABASE-SERVICE-KEY>
VPN_NODE_SSH_PASSWORD=<REDACTED-SERVER-PASSWORD>

# For email notifications (if using Resend)
RESEND_API_KEY=<TO BE CREATED>
```

---

## 🎯 NEXT STEPS

1. ✅ All Stripe credentials confirmed (LIVE MODE)
2. ✅ Supabase credentials confirmed
3. ✅ Server access credentials confirmed
4. ⏳ Add missing env vars to Railway
5. ⏳ Set up email service (Resend)
6. ⏳ Begin server configuration

---

## ⚠️ SECURITY NOTES

- **DO NOT** commit this file to git
- Already in .gitignore
- Stripe keys are LIVE MODE (real money!)
- Server passwords should be changed after SSH key setup
- Service role key has full database access

---

## 📊 CREDENTIAL STATUS

| Service | Status | Notes |
|---------|--------|-------|
| Supabase URL | ✅ | Working |
| Supabase Service Key | ✅ | Verified |
| Stripe Secret Key | ✅ | LIVE MODE |
| Stripe Webhook Secret | ✅ | Configured |
| All Price IDs | ✅ | 5 plans |
| Railway Deployment | ✅ | scvpn-production.up.railway.app |
| VA Server Access | ✅ | ubuntu@135.148.121.237 |
| Dallas Server Access | ✅ | root@45.79.8.145 |
| Email Service | ⏳ | Need to set up Resend |

---

**ALL CORE CREDENTIALS VERIFIED - READY TO PROCEED** ✅
