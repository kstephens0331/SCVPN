# Pricing Implementation Checklist

**Quick list of what needs to be done to implement the new pricing.**

---

## 📋 TO DO

### 1. Create Stripe Products & Prices (45 total)
**Time:** 45-60 minutes

**What to do:**
1. Go to https://dashboard.stripe.com/products
2. Switch to **LIVE MODE**
3. Create 9 products × 5 prices each = 45 prices

**Products to create:**
- SACVPN Personal
- SACVPN Gaming
- SACVPN Business 50
- SACVPN Business 100
- SACVPN Business 500
- SACVPN Business 1K
- SACVPN Business 2.5K
- SACVPN Business 5K
- SACVPN Business 10K

**For each product, create 5 prices:**
- Monthly
- 6-Month (every 6 months)
- Yearly
- 2-Year (every 24 months)
- 3-Year (every 36 months)

**Guide:** Follow `STRIPE_SETUP_DETAILED.md` for exact amounts and step-by-step instructions

---

### 2. Update Code with Stripe Price IDs
**Time:** 10 minutes

**File to edit:** `src/lib/pricing.js`

**What to do:**
Replace all the `"price_TBD_xxx"` placeholders with actual Stripe Price IDs

**Example:**
```javascript
// BEFORE
stripePriceIds: {
  monthly: "price_TBD_personal_monthly",
  sixMonth: "price_TBD_personal_6mo",
  // ...
}

// AFTER (with your actual IDs from Stripe)
stripePriceIds: {
  monthly: "price_1AbCdEfGhIjKlMnO",
  sixMonth: "price_2XyZaBcDeFgHiJkL",
  // ...
}
```

---

### 3. Run Database Migration
**Time:** 2 minutes

**What to do:**
1. Go to https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
2. Copy entire contents of `UPDATE_ANALYTICS_FINAL_PRICING.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. Verify success message appears

**This updates:** MRR/ARR analytics functions with new pricing

---

### 4. Deploy Email Notifications (Optional but Recommended)
**Time:** 30 minutes

**What to do:**
1. Create Resend account at https://resend.com
2. Verify domain: `stephenscode.dev`
3. Get API key from Resend
4. Add `RESEND_API_KEY` to Supabase environment variables
5. Deploy functions:
   ```bash
   supabase functions deploy auth-signup-notify
   supabase functions deploy stripe-webhook
   ```
6. Configure Supabase webhook for auth.users

**Guide:** Follow `EMAIL_NOTIFICATIONS_SETUP.md`

**This enables:** Email notifications to info@stephenscode.dev when:
- Customers purchase plans
- Users create accounts

---

## ✅ ALREADY DONE

✅ Pricing calculated with correct profit margins (35-55%)
✅ `src/lib/pricing.js` updated with new prices
✅ Database migration SQL file created
✅ Email notification code written
✅ Documentation created
✅ Logo updated in header and favicon

---

## 📊 PRICING REFERENCE

### Consumer Plans
- Personal: $9.99/month (to $6.91/month on 3-year)
- Gaming: $14.99/month (to $10.37/month on 3-year)

### Business Plans (Monthly pricing)
- Business 50: $933.33/month (50 devices)
- Business 100: $933.33/month (100 devices)
- Business 500: $2,800/month (500 devices)
- Business 1K: $5,600/month (1,000 devices)
- Business 2.5K: $13,066.67/month (2,500 devices)
- Business 5K: $25,200/month (5,000 devices)
- Business 10K: $50,400/month (10,000 devices)

**Discounts:** 6-mo (10%), yearly (18.2%), 2-year (25%), 3-year (30.8%)

---

## 🔗 QUICK LINKS

- **Stripe Dashboard:** https://dashboard.stripe.com/products
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/ltwuqjmncldopkutiyak/sql/new
- **Resend:** https://resend.com

---

## 📚 DETAILED GUIDES

- **STRIPE_SETUP_DETAILED.md** - Step-by-step Stripe setup (45 prices)
- **EMAIL_NOTIFICATIONS_SETUP.md** - Email notification deployment
- **PRICING_APPROVAL_EMAIL.md** - Complete pricing breakdown
- **IMPLEMENTATION_STATUS.md** - Full project status

---

## ⏱️ TOTAL TIME ESTIMATE

- Stripe setup: 45-60 min
- Update code: 10 min
- Database migration: 2 min
- Email notifications: 30 min (optional)

**Total:** ~1.5 - 2 hours to go live with new pricing

---

## 🚨 CRITICAL

**Must complete steps 1-3 before pricing goes live:**
1. Create Stripe prices
2. Update code with Price IDs
3. Run database migration

**Step 4 (email notifications) can be done later if needed.**
