# 🎫 STRIPE PRICE SETUP GUIDE

**Purpose:** Step-by-step guide to create all 25 Stripe Price IDs for SACVPN
**Time Required:** 30-45 minutes

---

## 📋 OVERVIEW

You need to create:
- **5 Plans** × **5 Billing Periods** = **25 Total Prices**

### Plans
1. Personal
2. Gaming
3. Business 10
4. Business 50
5. Business 250

### Billing Periods
1. Monthly
2. Every 6 Months
3. Yearly (12 months)
4. Every 2 Years (24 months)
5. Every 3 Years (36 months)

---

## 🔧 STRIPE DASHBOARD SETUP

### Step 1: Login to Stripe
1. Go to https://dashboard.stripe.com
2. Make sure you're in **LIVE MODE** (toggle in top-right)
3. Click **Products** in the left sidebar

---

## 📦 PRODUCT 1: SACVPN PERSONAL

### Create Product
1. Click **+ Add product**
2. Name: `SACVPN Personal`
3. Description: `Unlimited devices, all regions, standard VPN service`
4. Leave product ID blank (auto-generated)
5. **Do NOT click "Save product" yet - add all prices first**

### Add 5 Prices to Personal Product

#### Price 1: Monthly
- **Recurring:** Checked
- **Interval:** Monthly
- **Price:** $7.99
- **Price description:** Monthly billing
- **Click:** Add price

#### Price 2: 6 Months
- **Recurring:** Checked
- **Interval:** Custom → Every 6 months
- **Price:** $40.74 (billed every 6 months)
- **Price description:** 6-month billing - Save 15%
- **Click:** Add price

#### Price 3: 1 Year
- **Recurring:** Checked
- **Interval:** Yearly
- **Price:** $47.88 (billed annually)
- **Price description:** Annual billing - Save 50%
- **Click:** Add price

#### Price 4: 2 Years
- **Recurring:** Checked
- **Interval:** Custom → Every 24 months
- **Price:** $59.76 (billed every 2 years)
- **Price description:** 2-year billing - Save 69%
- **Click:** Add price

#### Price 5: 3 Years
- **Recurring:** Checked
- **Interval:** Custom → Every 36 months
- **Price:** $53.64 (billed every 3 years)
- **Price description:** 3-year billing - Save 81%
- **Click:** Add price

### Save Product
- Click **Save product**
- **Copy all 5 Price IDs** (they start with `price_...`)

---

## 📦 PRODUCT 2: SACVPN GAMING

### Create Product
1. Click **+ Add product**
2. Name: `SACVPN Gaming`
3. Description: `Gaming-optimized routes, low latency, unlimited devices`
4. **Add all 5 prices:**

#### Price 1: Monthly
- Interval: Monthly
- Price: $11.99
- Description: Monthly billing

#### Price 2: 6 Months
- Interval: Every 6 months
- Price: $59.94
- Description: 6-month billing - Save 17%

#### Price 3: 1 Year
- Interval: Yearly
- Price: $71.88
- Description: Annual billing - Save 50%

#### Price 4: 2 Years
- Interval: Every 24 months
- Price: $83.76
- Description: 2-year billing - Save 71%

#### Price 5: 3 Years
- Interval: Every 36 months
- Price: $71.64
- Description: 3-year billing - Save 83%

### Save and Copy Price IDs

---

## 📦 PRODUCT 3: SACVPN BUSINESS 10

### Create Product
1. Click **+ Add product**
2. Name: `SACVPN Business 10`
3. Description: `Team VPN for up to 10 users with management dashboard`
4. **Add all 5 prices:**

#### Price 1: Monthly
- Interval: Monthly
- Price: $50.00
- Description: Monthly billing

#### Price 2: 6 Months
- Interval: Every 6 months
- Price: $255.00
- Description: 6-month billing - Save 15%

#### Price 3: 1 Year
- Interval: Yearly
- Price: $300.00
- Description: Annual billing - Save 50%

#### Price 4: 2 Years
- Interval: Every 24 months
- Price: $360.00
- Description: 2-year billing - Save 70%

#### Price 5: 3 Years
- Interval: Every 36 months
- Price: $360.00
- Description: 3-year billing - Save 80%

### Save and Copy Price IDs

---

## 📦 PRODUCT 4: SACVPN BUSINESS 50

### Create Product
1. Click **+ Add product**
2. Name: `SACVPN Business 50`
3. Description: `Team VPN for up to 50 users with priority support`
4. **Add all 5 prices:**

#### Price 1: Monthly
- Interval: Monthly
- Price: $150.00
- Description: Monthly billing

#### Price 2: 6 Months
- Interval: Every 6 months
- Price: $765.00
- Description: 6-month billing - Save 15%

#### Price 3: 1 Year
- Interval: Yearly
- Price: $900.00
- Description: Annual billing - Save 50%

#### Price 4: 2 Years
- Interval: Every 24 months
- Price: $1,080.00
- Description: 2-year billing - Save 70%

#### Price 5: 3 Years
- Interval: Every 36 months
- Price: $1,080.00
- Description: 3-year billing - Save 80%

### Save and Copy Price IDs

---

## 📦 PRODUCT 5: SACVPN BUSINESS 250

### Create Product
1. Click **+ Add product**
2. Name: `SACVPN Business 250`
3. Description: `Enterprise VPN for up to 250 users with dedicated support`
4. **Add all 5 prices:**

#### Price 1: Monthly
- Interval: Monthly
- Price: $850.00
- Description: Monthly billing

#### Price 2: 6 Months
- Interval: Every 6 months
- Price: $4,335.00
- Description: 6-month billing - Save 15%

#### Price 3: 1 Year
- Interval: Yearly
- Price: $5,100.00
- Description: Annual billing - Save 50%

#### Price 4: 2 Years
- Interval: Every 24 months
- Price: $6,120.00
- Description: 2-year billing - Save 70%

#### Price 5: 3 Years
- Interval: Every 36 months
- Price: $6,120.00
- Description: 3-year billing - Save 80%

### Save and Copy Price IDs

---

## 📝 TRACKING YOUR PRICE IDs

Create a file with all your Price IDs in this format:

```javascript
// PERSONAL PLAN
export const STRIPE_PRICE_PERSONAL_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_PERSONAL_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_PERSONAL_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_PERSONAL_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_PERSONAL_3YEAR = "price_xxxxxxxxxxxxx";

// GAMING PLAN
export const STRIPE_PRICE_GAMING_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_GAMING_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_GAMING_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_GAMING_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_GAMING_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 10 PLAN
export const STRIPE_PRICE_BUSINESS10_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 50 PLAN
export const STRIPE_PRICE_BUSINESS50_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 250 PLAN
export const STRIPE_PRICE_BUSINESS250_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS250_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS250_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS250_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS250_3YEAR = "price_xxxxxxxxxxxxx";
```

---

## 🔍 VERIFICATION CHECKLIST

After creating all products/prices:

- [ ] 5 products created in Stripe
- [ ] Each product has 5 prices (25 total)
- [ ] All prices are **recurring** (not one-time)
- [ ] Intervals are correct (monthly, 6mo, 12mo, 24mo, 36mo)
- [ ] Amounts match the pricing table exactly
- [ ] All Price IDs copied and saved
- [ ] Products are in **LIVE MODE** (not test mode)

---

## 🚨 COMMON MISTAKES TO AVOID

1. **Wrong Interval:** Make sure 6-month is "Every 6 months" not "Monthly"
2. **One-Time vs Recurring:** All prices must be RECURRING subscriptions
3. **Test Mode:** Create these in LIVE mode, not test mode
4. **Wrong Amount:** Double-check the total amounts (e.g., 2-year is total for 2 years, not per month)
5. **Missing Description:** Add descriptions so you can identify prices later

---

## 📧 WHAT TO SEND ME

Once you've created all the prices, send me (or add to Railway environment variables):

```env
# PERSONAL
STRIPE_PRICE_PERSONAL_MONTHLY=price_xxxxx
STRIPE_PRICE_PERSONAL_6MONTH=price_xxxxx
STRIPE_PRICE_PERSONAL_YEARLY=price_xxxxx
STRIPE_PRICE_PERSONAL_2YEAR=price_xxxxx
STRIPE_PRICE_PERSONAL_3YEAR=price_xxxxx

# GAMING
STRIPE_PRICE_GAMING_MONTHLY=price_xxxxx
STRIPE_PRICE_GAMING_6MONTH=price_xxxxx
STRIPE_PRICE_GAMING_YEARLY=price_xxxxx
STRIPE_PRICE_GAMING_2YEAR=price_xxxxx
STRIPE_PRICE_GAMING_3YEAR=price_xxxxx

# BUSINESS 10
STRIPE_PRICE_BUSINESS10_MONTHLY=price_xxxxx
STRIPE_PRICE_BUSINESS10_6MONTH=price_xxxxx
STRIPE_PRICE_BUSINESS10_YEARLY=price_xxxxx
STRIPE_PRICE_BUSINESS10_2YEAR=price_xxxxx
STRIPE_PRICE_BUSINESS10_3YEAR=price_xxxxx

# BUSINESS 50
STRIPE_PRICE_BUSINESS50_MONTHLY=price_xxxxx
STRIPE_PRICE_BUSINESS50_6MONTH=price_xxxxx
STRIPE_PRICE_BUSINESS50_YEARLY=price_xxxxx
STRIPE_PRICE_BUSINESS50_2YEAR=price_xxxxx
STRIPE_PRICE_BUSINESS50_3YEAR=price_xxxxx

# BUSINESS 250
STRIPE_PRICE_BUSINESS250_MONTHLY=price_xxxxx
STRIPE_PRICE_BUSINESS250_6MONTH=price_xxxxx
STRIPE_PRICE_BUSINESS250_YEARLY=price_xxxxx
STRIPE_PRICE_BUSINESS250_2YEAR=price_xxxxx
STRIPE_PRICE_BUSINESS250_3YEAR=price_xxxxx
```

---

## ✅ NEXT STEPS

After you've created all Stripe prices:

1. Send me all 25 Price IDs
2. I'll update the backend code to use them
3. I'll update the frontend pricing page with billing period toggle
4. I'll update the checkout flow
5. We'll test in Stripe test mode
6. Deploy to production

**Estimated Time:** 30-45 minutes to create all prices

---

**Ready to start? Go to https://dashboard.stripe.com/products and start creating! 🚀**
