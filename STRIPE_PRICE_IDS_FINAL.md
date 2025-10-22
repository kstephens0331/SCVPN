# 🎫 STRIPE PRICE IDS - FINAL SETUP GUIDE

**Purpose:** Create all 25 Stripe Price IDs with final approved pricing
**Maximum Discount:** 45% on 3-year plans
**Time Required:** 30-45 minutes

---

## 📋 PRICING SUMMARY

**Discount Structure:**
- Monthly: 0% (base price)
- 6 Months: 10% off
- 1 Year: 20% off
- 2 Years: 30% off (**Most Popular**)
- 3 Years: 45% off (**Best Value**)

---

## 📦 PRODUCT 1: SACVPN PERSONAL

**Create Product in Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/products
2. Click **+ Add product**
3. Name: `SACVPN Personal`
4. Description: `Unlimited devices, all regions, standard VPN service`

### Add 5 Prices:

#### Price 1: Monthly
- Billing period: **Monthly**
- Price: **$9.99**
- Description: `Monthly billing`

#### Price 2: 6 Months
- Billing period: **Custom** → Every **6 months**
- Price: **$53.94** (billed every 6 months)
- Description: `6-month billing - Save 10%`

#### Price 3: 1 Year
- Billing period: **Yearly**
- Price: **$95.88** (billed annually)
- Description: `Annual billing - Save 20%`

#### Price 4: 2 Years
- Billing period: **Custom** → Every **24 months**
- Price: **$167.76** (billed every 2 years)
- Description: `2-year billing - Save 30% (Most Popular)`

#### Price 5: 3 Years
- Billing period: **Custom** → Every **36 months**
- Price: **$197.64** (billed every 3 years)
- Description: `3-year billing - Save 45% (Best Value)`

**Save Product** and copy all 5 Price IDs

---

## 📦 PRODUCT 2: SACVPN GAMING

**Create Product:**
1. Name: `SACVPN Gaming`
2. Description: `Gaming-optimized routes, low latency, unlimited devices`

### Add 5 Prices:

| Period | Interval | Price | Description |
|--------|----------|-------|-------------|
| Monthly | Monthly | $14.99 | Monthly billing |
| 6 Months | Every 6 months | $80.94 | 6-month billing - Save 10% |
| 1 Year | Yearly | $143.88 | Annual billing - Save 20% |
| 2 Years | Every 24 months | $251.76 | 2-year billing - Save 30% (Most Popular) |
| 3 Years | Every 36 months | $296.64 | 3-year billing - Save 45% (Best Value) |

---

## 📦 PRODUCT 3: SACVPN BUSINESS 10

**Create Product:**
1. Name: `SACVPN Business 10`
2. Description: `Team VPN for up to 10 users with management dashboard`

### Add 5 Prices:

| Period | Interval | Price | Description |
|--------|----------|-------|-------------|
| Monthly | Monthly | $59.99 | Monthly billing |
| 6 Months | Every 6 months | $323.94 | 6-month billing - Save 10% |
| 1 Year | Yearly | $575.88 | Annual billing - Save 20% |
| 2 Years | Every 24 months | $1,007.76 | 2-year billing - Save 30% |
| 3 Years | Every 36 months | $1,187.64 | 3-year billing - Save 45% |

---

## 📦 PRODUCT 4: SACVPN BUSINESS 50

**Create Product:**
1. Name: `SACVPN Business 50`
2. Description: `Team VPN for up to 50 users with priority support`

### Add 5 Prices:

| Period | Interval | Price | Description |
|--------|----------|-------|-------------|
| Monthly | Monthly | $179.99 | Monthly billing |
| 6 Months | Every 6 months | $971.94 | 6-month billing - Save 10% |
| 1 Year | Yearly | $1,727.88 | Annual billing - Save 20% |
| 2 Years | Every 24 months | $3,023.76 | 2-year billing - Save 30% |
| 3 Years | Every 36 months | $3,563.64 | 3-year billing - Save 45% |

---

## 📦 PRODUCT 5: SACVPN BUSINESS 250

**Create Product:**
1. Name: `SACVPN Business 250`
2. Description: `Enterprise VPN for up to 250 users with dedicated support`

### Add 5 Prices:

| Period | Interval | Price | Description |
|--------|----------|-------|-------------|
| Monthly | Monthly | $999.99 | Monthly billing |
| 6 Months | Every 6 months | $5,399.94 | 6-month billing - Save 10% |
| 1 Year | Yearly | $9,599.88 | Annual billing - Save 20% |
| 2 Years | Every 24 months | $16,799.76 | 2-year billing - Save 30% |
| 3 Years | Every 36 months | $19,799.64 | 3-year billing - Save 45% |

---

## 📝 PRICE ID TRACKING SHEET

After creating all prices, fill this out and add to Railway:

```env
# PERSONAL PLAN
STRIPE_PRICE_PERSONAL_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_3YEAR=price_xxxxxxxxxxxxx

# GAMING PLAN
STRIPE_PRICE_GAMING_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_3YEAR=price_xxxxxxxxxxxxx

# BUSINESS 10 PLAN
STRIPE_PRICE_BUSINESS10_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_3YEAR=price_xxxxxxxxxxxxx

# BUSINESS 50 PLAN
STRIPE_PRICE_BUSINESS50_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_3YEAR=price_xxxxxxxxxxxxx

# BUSINESS 250 PLAN
STRIPE_PRICE_BUSINESS250_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_3YEAR=price_xxxxxxxxxxxxx
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] All 5 products created in Stripe
- [ ] Each product has exactly 5 prices (25 total)
- [ ] All prices are **recurring subscriptions** (not one-time)
- [ ] Billing intervals match the table (monthly, 6mo, 12mo, 24mo, 36mo)
- [ ] Price amounts match exactly (down to the cent)
- [ ] All prices created in **LIVE MODE** (not test)
- [ ] All 25 Price IDs copied to tracking sheet
- [ ] Price IDs added to `pricing-new.js`
- [ ] Price IDs added to Railway environment variables (optional)

---

## 🚨 COMMON MISTAKES

1. **Wrong Total Amount:**
   - 6-month: Total for 6 months, NOT per month
   - 2-year: Total for 24 months, NOT per month
   - Example: Personal 2-year should be $167.76 total, not $6.99

2. **Wrong Interval:**
   - 6 months = "Every 6 months" (not "Every month" × 6)
   - 2 years = "Every 24 months" (not "Every 12 months" × 2)

3. **One-Time vs Recurring:**
   - ALL prices must be **recurring subscriptions**
   - Do NOT create one-time payments

4. **Test vs Live Mode:**
   - Create these in **LIVE MODE**
   - Toggle is in top-right corner of Stripe dashboard

---

## 📊 PRICING VERIFICATION

**Personal Plan Check:**
- Monthly: $9.99/mo
- 3-Year: $197.64 total ÷ 36 months = $5.49/mo ✅ (45% off)

**Gaming Plan Check:**
- Monthly: $14.99/mo
- 3-Year: $296.64 total ÷ 36 months = $8.24/mo ✅ (45% off)

**Business 10 Check:**
- Monthly: $59.99/mo
- 3-Year: $1,187.64 total ÷ 36 months = $32.99/mo ✅ (45% off)

---

## 🔧 UPDATING pricing-new.js

Once you have all Price IDs, update `src/lib/pricing-new.js`:

```javascript
// Replace placeholder Price IDs with your actual ones
pricing: {
  monthly: {
    monthlyPrice: 9.99,
    totalPrice: 9.99,
    stripePriceId: 'price_ACTUAL_PRICE_ID_HERE', // ← Replace this
  },
  // ... etc
}
```

---

## 🚀 DEPLOYMENT STEPS

1. **Create all 25 prices in Stripe** (30-45 min)
2. **Update `pricing-new.js`** with real Price IDs
3. **Run database migrations** (003 and 004)
4. **Update routing** to use `PricingFinal.jsx`
5. **Test checkout** with Stripe test cards
6. **Deploy to production**

---

## 📞 NEED HELP?

**Stripe Documentation:**
- Creating products: https://stripe.com/docs/products-prices
- Recurring prices: https://stripe.com/docs/billing/subscriptions/overview

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com

---

**Ready to create the prices? Go to https://dashboard.stripe.com/products!** 🎯
