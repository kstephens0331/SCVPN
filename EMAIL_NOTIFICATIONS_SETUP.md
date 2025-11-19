# Email Notifications Setup Guide

**Purpose:** Send email notifications to info@stephenscode.dev when customers purchase plans or create accounts.

**Email Service:** Resend API (https://resend.com)

---

## 📧 What Gets Notified

### 1. Purchase Notifications
When a customer purchases a subscription:
- Customer email and name
- Plan purchased (e.g., "Business 500 (Yearly)")
- Amount charged
- Stripe customer and subscription IDs
- Link to Stripe dashboard

### 2. Signup Notifications
When a new user creates an account:
- User email and name
- User ID
- Signup method (email, Google, etc.)
- Link to Supabase dashboard

---

## 🚀 Setup Instructions

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address
4. Add your sending domain: `stephenscode.dev`
   - Go to **Domains** → **Add Domain**
   - Add DNS records to your domain provider:
     ```
     Type: TXT
     Name: @
     Value: [Resend verification code]

     Type: MX
     Name: @
     Value: feedback-smtp.us-east-1.amazonses.com
     Priority: 10
     ```
5. Wait for domain verification (usually 5-10 minutes)

### Step 2: Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name: `SACVPN Production`
4. Permission: **Full Access**
5. Copy the API key (starts with `re_`)

**IMPORTANT:** Save this key securely - you won't see it again!

---

## 🔧 Deployment Steps

### Step 3: Set Environment Variables

#### In Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/settings/functions
2. Add new secret:
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxxxxxxxxxx` (your Resend API key)
3. Click **Save**

#### Verify Environment Variable

```bash
# Test that the Edge Function can access the key
supabase functions invoke auth-signup-notify --env-file .env.local
```

### Step 4: Deploy Edge Functions

Deploy both notification functions to Supabase:

```bash
# Deploy the signup notification function
supabase functions deploy auth-signup-notify

# Deploy the updated stripe webhook (already has purchase notifications)
supabase functions deploy stripe-webhook
```

**Expected output:**
```
Deploying auth-signup-notify (project ref: ltwuqjmncldopkutiyak)
✓ Function deployed successfully
Function URL: https://ltwuqjmncldopkutiyak.supabase.co/functions/v1/auth-signup-notify
```

### Step 5: Set Up Signup Notifications

You have two options:

#### Option A: Database Webhook (Recommended)

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/database/webhooks
2. Click **Create a new hook**
3. Configure:
   - **Name:** Auth Signup Notification
   - **Table:** `auth.users`
   - **Events:** ✅ INSERT
   - **Type:** HTTP Request
   - **Method:** POST
   - **URL:** `https://ltwuqjmncldopkutiyak.supabase.co/functions/v1/auth-signup-notify`
   - **HTTP Headers:**
     ```
     Authorization: Bearer YOUR_SUPABASE_ANON_KEY
     Content-Type: application/json
     ```
4. Click **Create Webhook**

#### Option B: Database Trigger (Alternative)

If webhooks don't work, run the SQL file:

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
2. Copy contents of `SETUP_AUTH_WEBHOOK.sql`
3. Click **RUN**

**Note:** This requires the `pg_net` extension to be enabled.

---

## 📋 Verification Checklist

### Test Purchase Notification

1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Select your webhook endpoint
3. Click **Send test webhook**
4. Select event: `customer.subscription.created`
5. Click **Send test webhook**
6. Check inbox at info@stephenscode.dev for notification email

### Test Signup Notification

1. Create a test account on your site
2. Check inbox at info@stephenscode.dev for notification email
3. Verify email contains:
   - User email
   - User ID
   - Signup timestamp
   - Link to Supabase dashboard

### Check Logs

```bash
# View Edge Function logs for signup notifications
supabase functions logs auth-signup-notify

# View Edge Function logs for Stripe webhook
supabase functions logs stripe-webhook
```

---

## 🔒 Environment Variables Required

Add these to your Supabase project:

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `RESEND_API_KEY` | `re_xxxxx...` | Resend Dashboard → API Keys |
| `STRIPE_SECRET_KEY` | `sk_live_xxx...` | Already configured |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxx...` | Already configured |
| `SCVPN_SUPABASE_URL` | `https://ltwuqjmncldopkutiyak.supabase.co` | Already configured |
| `SCVPN_SERVICE_ROLE_JWT` | `eyJhbGc...` | Already configured |

---

## 📧 Email Templates

### Purchase Notification Preview

```
Subject: 🎉 New SACVPN Purchase - Business 500 (Yearly)

Amount: $27,490.91

Plan: Business 500 (Yearly)
Customer Email: john@example.com
Customer Name: John Doe
Stripe Customer ID: cus_xxxxx
Stripe Subscription ID: sub_xxxxx
Timestamp: Monday, October 25, 2025 at 3:45:00 PM PDT

[View in Stripe Dashboard]
```

### Signup Notification Preview

```
Subject: 👤 New SACVPN Account Created - john@example.com

Email: john@example.com
Name: John Doe
User ID: uuid-xxxxx
Signup Method: email
Timestamp: Monday, October 25, 2025 at 3:45:00 PM PDT

[View in Supabase Dashboard]
```

---

## 🐛 Troubleshooting

### Email Not Sent

1. **Check Resend API Key:**
   ```bash
   # Test Resend API manually
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer re_xxxxx" \
     -H "Content-Type: application/json" \
     -d '{"from":"noreply@stephenscode.dev","to":"info@stephenscode.dev","subject":"Test","html":"Test"}'
   ```

2. **Check Edge Function Logs:**
   ```bash
   supabase functions logs auth-signup-notify --limit 50
   supabase functions logs stripe-webhook --limit 50
   ```

3. **Check Environment Variable:**
   - Go to Supabase Dashboard → Settings → Edge Functions
   - Verify `RESEND_API_KEY` is set
   - Redeploy functions after adding env vars

### Domain Not Verified

1. Check DNS records in your domain provider
2. Wait 5-10 minutes for propagation
3. Click **Verify** in Resend dashboard
4. Use Resend's sandbox domain temporarily: `onboarding@resend.dev`

### Webhook Not Firing

1. Check Supabase webhook logs
2. Verify webhook URL is correct
3. Check HTTP headers include Authorization
4. Try Option B (database trigger) instead

---

## 📊 Monitoring

### View Email Logs in Resend

1. Go to https://resend.com/emails
2. See all sent emails, delivery status, opens, clicks
3. Filter by date, recipient, status

### View Function Invocations

1. Go to Supabase Dashboard → Edge Functions
2. Click on `auth-signup-notify` or `stripe-webhook`
3. View invocation count, errors, execution time

---

## 🔄 Updates After Initial Setup

### Change Notification Email

Edit `supabase/functions/_shared/email.ts`:

```typescript
const NOTIFICATION_EMAIL = "your-new-email@example.com";
```

Then redeploy:

```bash
supabase functions deploy auth-signup-notify
supabase functions deploy stripe-webhook
```

### Add More Notification Types

Add new functions to `_shared/email.ts`:

```typescript
export async function sendCancellationNotification(data: CancellationData) {
  // Implementation
}
```

Then import and use in webhook:

```typescript
import { sendCancellationNotification } from "../_shared/email.ts";

case "customer.subscription.deleted": {
  await sendCancellationNotification({ ... });
  break;
}
```

---

## 💰 Resend Pricing

- **Free Tier:** 100 emails/day, 3,000 emails/month
- **Pro Plan:** $20/month for 50,000 emails/month
- **Business Plan:** Custom pricing for higher volumes

For SACVPN:
- Signups: ~10-50/day = ~1,500/month
- Purchases: ~5-20/day = ~600/month
- **Total:** ~2,100 emails/month = **FREE TIER** ✅

---

## ✅ Implementation Complete Checklist

- [ ] Resend account created
- [ ] Domain `stephenscode.dev` verified
- [ ] Resend API key obtained
- [ ] `RESEND_API_KEY` set in Supabase
- [ ] `auth-signup-notify` function deployed
- [ ] `stripe-webhook` function deployed
- [ ] Signup webhook/trigger configured
- [ ] Test purchase notification sent successfully
- [ ] Test signup notification sent successfully
- [ ] Email logs visible in Resend dashboard
- [ ] Function logs show successful execution

---

## 📁 Files Created

1. **supabase/functions/_shared/email.ts** - Email notification helper
2. **supabase/functions/auth-signup-notify/index.ts** - Signup notification function
3. **supabase/functions/stripe-webhook/index.ts** - Updated with purchase notifications
4. **SETUP_AUTH_WEBHOOK.sql** - SQL for database trigger setup
5. **EMAIL_NOTIFICATIONS_SETUP.md** - This guide

---

## 🔗 Quick Links

- Resend Dashboard: https://resend.com/emails
- Supabase Edge Functions: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/functions
- Supabase Webhooks: https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/database/webhooks
- Stripe Webhooks: https://dashboard.stripe.com/webhooks

---

**Setup Time:** 15-20 minutes
**Difficulty:** Easy
**Status:** Ready to Deploy

✅ **All code is ready - just need to deploy and configure environment variables!**
