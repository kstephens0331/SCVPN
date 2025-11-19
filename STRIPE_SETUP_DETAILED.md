# 🎫 SACVPN STRIPE SETUP - COMPLETE GUIDE

**Created:** October 25, 2025
**Status:** APPROVED - Ready for Implementation
**Total Products:** 9
**Total Prices:** 45 (9 products × 5 billing periods)

---

## 📋 QUICK REFERENCE

### Billing Periods
- **Monthly:** No discount, 55% margin
- **6-Month:** 10% discount, 50% margin
- **Yearly:** 18.2% discount, 45% margin
- **2-Year:** 25% discount, 40% margin
- **3-Year:** 30.8% discount, 35% margin

### Products to Create
1. SACVPN Personal (2 consumer plans)
2. SACVPN Gaming
3. SACVPN Business 50 (7 business plans)
4. SACVPN Business 100
5. SACVPN Business 500
6. SACVPN Business 1K
7. SACVPN Business 2.5K
8. SACVPN Business 5K
9. SACVPN Business 10K

---

## 🔧 STRIPE DASHBOARD SETUP

### Before You Start
1. Go to https://dashboard.stripe.com
2. **IMPORTANT:** Switch to **LIVE MODE** (toggle in top-right)
3. Click **Products** in the left sidebar
4. Have a text editor ready to copy all Price IDs

---

## 📦 PRODUCT 1: SACVPN PERSONAL

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Personal`
3. **Description:** `Unlimited devices, all regions, standard VPN service for home users`
4. **Statement Descriptor:** `SACVPN Personal` (shows on credit card)

### Add 5 Prices

#### Price 1: Monthly
- **Recurring:** ✅ Checked
- **Billing Period:** Monthly
- **Price:** `$9.99` (or 999 cents)
- **Price Description:** `Monthly billing`
- **Lookup Key:** `personal_monthly`

#### Price 2: 6-Month
- **Recurring:** ✅ Checked
- **Billing Period:** Custom → `Every 6 months`
- **Price:** `$53.95` (or 5395 cents)
- **Price Description:** `6-month billing - Save 10%`
- **Lookup Key:** `personal_6month`

#### Price 3: Yearly
- **Recurring:** ✅ Checked
- **Billing Period:** Yearly (12 months)
- **Price:** `$98.06` (or 9806 cents)
- **Price Description:** `Annual billing - Save 18.2%`
- **Lookup Key:** `personal_yearly`

#### Price 4: 2-Year
- **Recurring:** ✅ Checked
- **Billing Period:** Custom → `Every 24 months`
- **Price:** `$179.82` (or 17982 cents)
- **Price Description:** `2-year billing - Save 25%`
- **Lookup Key:** `personal_2year`

#### Price 5: 3-Year
- **Recurring:** ✅ Checked
- **Billing Period:** Custom → `Every 36 months`
- **Price:** `$248.87` (or 24887 cents)
- **Price Description:** `3-year billing - Save 30.8%`
- **Lookup Key:** `personal_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs (format: `price_xxxxxxxxxxxxx`)

---

## 📦 PRODUCT 2: SACVPN GAMING

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Gaming`
3. **Description:** `Gaming-optimized routes, low latency, DDoS protection, unlimited devices`
4. **Statement Descriptor:** `SACVPN Gaming`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$14.99` (1499 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing`
- **Lookup Key:** `gaming_monthly`

#### Price 2: 6-Month
- **Price:** `$80.95` (8095 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - Save 10%`
- **Lookup Key:** `gaming_6month`

#### Price 3: Yearly
- **Price:** `$147.14` (14714 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - Save 18.2%`
- **Lookup Key:** `gaming_yearly`

#### Price 4: 2-Year
- **Price:** `$269.82` (26982 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - Save 25%`
- **Lookup Key:** `gaming_2year`

#### Price 5: 3-Year
- **Price:** `$373.43` (37343 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - Save 30.8%`
- **Lookup Key:** `gaming_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📦 PRODUCT 3: SACVPN BUSINESS 50

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Business 50`
3. **Description:** `Team VPN for up to 50 devices with management dashboard and priority support`
4. **Statement Descriptor:** `SACVPN Biz 50`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$933.33` (93333 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing - $18.67 per device`
- **Lookup Key:** `business50_monthly`

#### Price 2: 6-Month
- **Price:** `$5,040.00` (504000 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - $16.80 per device - Save 10%`
- **Lookup Key:** `business50_6month`

#### Price 3: Yearly
- **Price:** `$9,163.64` (916364 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - $15.27 per device - Save 18.2%`
- **Lookup Key:** `business50_yearly`

#### Price 4: 2-Year
- **Price:** `$16,800.00` (1680000 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - $14.00 per device - Save 25%`
- **Lookup Key:** `business50_2year`

#### Price 5: 3-Year
- **Price:** `$23,261.54` (2326154 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - $12.92 per device - Save 30.8%`
- **Lookup Key:** `business50_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📦 PRODUCT 4: SACVPN BUSINESS 100

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Business 100`
3. **Description:** `Team VPN for up to 100 devices with management dashboard and priority support`
4. **Statement Descriptor:** `SACVPN Biz 100`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$933.33` (93333 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing - $9.33 per device`
- **Lookup Key:** `business100_monthly`

#### Price 2: 6-Month
- **Price:** `$5,040.00` (504000 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - $8.40 per device - Save 10%`
- **Lookup Key:** `business100_6month`

#### Price 3: Yearly
- **Price:** `$9,163.64` (916364 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - $7.64 per device - Save 18.2%`
- **Lookup Key:** `business100_yearly`

#### Price 4: 2-Year
- **Price:** `$16,800.00` (1680000 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - $7.00 per device - Save 25%`
- **Lookup Key:** `business100_2year`

#### Price 5: 3-Year
- **Price:** `$23,261.54` (2326154 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - $6.46 per device - Save 30.8%`
- **Lookup Key:** `business100_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📦 PRODUCT 5: SACVPN BUSINESS 500

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Business 500`
3. **Description:** `Team VPN for up to 500 devices with advanced analytics and priority support`
4. **Statement Descriptor:** `SACVPN Biz 500`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$2,800.00` (280000 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing - $5.60 per device`
- **Lookup Key:** `business500_monthly`

#### Price 2: 6-Month
- **Price:** `$15,120.00` (1512000 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - $5.04 per device - Save 10%`
- **Lookup Key:** `business500_6month`

#### Price 3: Yearly
- **Price:** `$27,490.91` (2749091 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - $4.58 per device - Save 18.2%`
- **Lookup Key:** `business500_yearly`

#### Price 4: 2-Year
- **Price:** `$50,400.00` (5040000 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - $4.20 per device - Save 25%`
- **Lookup Key:** `business500_2year`

#### Price 5: 3-Year
- **Price:** `$69,784.62` (6978462 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - $3.88 per device - Save 30.8%`
- **Lookup Key:** `business500_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📦 PRODUCT 6: SACVPN BUSINESS 1K

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Business 1K`
3. **Description:** `Team VPN for up to 1,000 devices with dedicated account manager`
4. **Statement Descriptor:** `SACVPN Biz 1K`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$5,600.00` (560000 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing - $5.60 per device`
- **Lookup Key:** `business1k_monthly`

#### Price 2: 6-Month
- **Price:** `$30,240.00` (3024000 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - $5.04 per device - Save 10%`
- **Lookup Key:** `business1k_6month`

#### Price 3: Yearly
- **Price:** `$54,981.82` (5498182 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - $4.58 per device - Save 18.2%`
- **Lookup Key:** `business1k_yearly`

#### Price 4: 2-Year
- **Price:** `$100,800.00` (10080000 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - $4.20 per device - Save 25%`
- **Lookup Key:** `business1k_2year`

#### Price 5: 3-Year
- **Price:** `$139,569.23` (13956923 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - $3.88 per device - Save 30.8%`
- **Lookup Key:** `business1k_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📦 PRODUCT 7: SACVPN BUSINESS 2.5K

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Business 2.5K`
3. **Description:** `Team VPN for up to 2,500 devices with custom SLA and dedicated account manager`
4. **Statement Descriptor:** `SACVPN Biz 2.5K`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$13,066.67` (1306667 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing - $5.23 per device`
- **Lookup Key:** `business2500_monthly`

#### Price 2: 6-Month
- **Price:** `$70,560.00` (7056000 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - $4.70 per device - Save 10%`
- **Lookup Key:** `business2500_6month`

#### Price 3: Yearly
- **Price:** `$128,290.91` (12829091 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - $4.28 per device - Save 18.2%`
- **Lookup Key:** `business2500_yearly`

#### Price 4: 2-Year
- **Price:** `$235,200.00` (23520000 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - $3.92 per device - Save 25%`
- **Lookup Key:** `business2500_2year`

#### Price 5: 3-Year
- **Price:** `$325,661.54` (32566154 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - $3.62 per device - Save 30.8%`
- **Lookup Key:** `business2500_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📦 PRODUCT 8: SACVPN BUSINESS 5K

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Business 5K`
3. **Description:** `Team VPN for up to 5,000 devices with 24/7 phone support and custom SLA`
4. **Statement Descriptor:** `SACVPN Biz 5K`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$25,200.00` (2520000 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing - $5.04 per device`
- **Lookup Key:** `business5k_monthly`

#### Price 2: 6-Month
- **Price:** `$136,080.00` (13608000 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - $4.54 per device - Save 10%`
- **Lookup Key:** `business5k_6month`

#### Price 3: Yearly
- **Price:** `$247,418.18` (24741818 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - $4.12 per device - Save 18.2%`
- **Lookup Key:** `business5k_yearly`

#### Price 4: 2-Year
- **Price:** `$453,600.00` (45360000 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - $3.78 per device - Save 25%`
- **Lookup Key:** `business5k_2year`

#### Price 5: 3-Year
- **Price:** `$628,061.54` (62806154 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - $3.49 per device - Save 30.8%`
- **Lookup Key:** `business5k_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📦 PRODUCT 9: SACVPN BUSINESS 10K

### Create Product
1. Click **+ Add product**
2. **Name:** `SACVPN Business 10K`
3. **Description:** `Team VPN for up to 10,000 devices with 24/7 phone support, custom integrations, and custom SLA`
4. **Statement Descriptor:** `SACVPN Biz 10K`

### Add 5 Prices

#### Price 1: Monthly
- **Price:** `$50,400.00` (5040000 cents)
- **Billing Period:** Monthly
- **Description:** `Monthly billing - $5.04 per device`
- **Lookup Key:** `business10k_monthly`

#### Price 2: 6-Month
- **Price:** `$272,160.00` (27216000 cents)
- **Billing Period:** Every 6 months
- **Description:** `6-month billing - $4.54 per device - Save 10%`
- **Lookup Key:** `business10k_6month`

#### Price 3: Yearly
- **Price:** `$494,836.36` (49483636 cents)
- **Billing Period:** Yearly
- **Description:** `Annual billing - $4.12 per device - Save 18.2%`
- **Lookup Key:** `business10k_yearly`

#### Price 4: 2-Year
- **Price:** `$907,200.00` (90720000 cents)
- **Billing Period:** Every 24 months
- **Description:** `2-year billing - $3.78 per device - Save 25%`
- **Lookup Key:** `business10k_2year`

#### Price 5: 3-Year
- **Price:** `$1,256,123.08` (125612308 cents)
- **Billing Period:** Every 36 months
- **Description:** `3-year billing - $3.49 per device - Save 30.8%`
- **Lookup Key:** `business10k_3year`

### Save and Record
✅ Click **Save product**
📝 Copy all 5 Price IDs

---

## 📝 PRICE ID COLLECTION TEMPLATE

After creating all products and prices, copy this template and fill in your actual Price IDs:

```javascript
// SACVPN Stripe Price IDs - Created October 25, 2025

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

// BUSINESS 50 PLAN
export const STRIPE_PRICE_BUSINESS50_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS50_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 100 PLAN
export const STRIPE_PRICE_BUSINESS100_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS100_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS100_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS100_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS100_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 500 PLAN
export const STRIPE_PRICE_BUSINESS500_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS500_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS500_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS500_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS500_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 1K PLAN
export const STRIPE_PRICE_BUSINESS1K_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS1K_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS1K_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS1K_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS1K_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 2.5K PLAN
export const STRIPE_PRICE_BUSINESS2500_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS2500_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS2500_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS2500_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS2500_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 5K PLAN
export const STRIPE_PRICE_BUSINESS5K_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS5K_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS5K_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS5K_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS5K_3YEAR = "price_xxxxxxxxxxxxx";

// BUSINESS 10K PLAN
export const STRIPE_PRICE_BUSINESS10K_MONTHLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10K_6MONTH = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10K_YEARLY = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10K_2YEAR = "price_xxxxxxxxxxxxx";
export const STRIPE_PRICE_BUSINESS10K_3YEAR = "price_xxxxxxxxxxxxx";
```

---

## 🔍 VERIFICATION CHECKLIST

After creating all products and prices in Stripe:

- [ ] 9 products created (Personal, Gaming, Business 50, 100, 500, 1K, 2.5K, 5K, 10K)
- [ ] Each product has exactly 5 prices
- [ ] Total of 45 prices created
- [ ] All prices are **RECURRING** (not one-time)
- [ ] Billing intervals are correct:
  - [ ] Monthly prices use "Monthly" interval
  - [ ] 6-Month prices use "Every 6 months" custom interval
  - [ ] Yearly prices use "Yearly" interval
  - [ ] 2-Year prices use "Every 24 months" custom interval
  - [ ] 3-Year prices use "Every 36 months" custom interval
- [ ] All amounts match the pricing tables exactly
- [ ] Lookup keys are set for all prices
- [ ] All 45 Price IDs copied to template
- [ ] Products are in **LIVE MODE** (not test mode)

---

## 🚨 COMMON MISTAKES TO AVOID

1. **Wrong Interval Type:** 6-month must be "Every 6 months" (custom), not "Monthly"
2. **One-Time vs Recurring:** ALL prices must be recurring subscriptions
3. **Test Mode:** Create in LIVE mode, not test mode
4. **Wrong Amount:** Double-check cents (e.g., $9.99 = 999 cents, not 99)
5. **Missing Lookup Keys:** Add lookup keys for easier integration
6. **Wrong Total Amount:** 2-year price is total for 24 months, not monthly × 24
7. **Decimal Precision:** Use exact cents from tables (e.g., 2749091 cents = $27,490.91)

---

## 📧 AFTER COMPLETION

Once all 45 prices are created:

1. **Fill in the Price ID template** above with actual IDs from Stripe
2. **Update `src/lib/pricing.js`** with the new Price IDs
3. **Run the SQL migration** `FINAL_PRICING_WITH_MARGINS.sql` in Supabase
4. **Test checkout flow** with test mode prices first
5. **Deploy to production**

---

## 💰 PRICING SUMMARY (Quick Reference)

### Consumer Plans
| Plan | Monthly | 6-Month | Yearly | 2-Year | 3-Year |
|------|---------|---------|--------|--------|--------|
| Personal | $9.99 | $53.95 | $98.06 | $179.82 | $248.87 |
| Gaming | $14.99 | $80.95 | $147.14 | $269.82 | $373.43 |

### Business Plans
| Plan | Monthly | 6-Month | Yearly | 2-Year | 3-Year |
|------|---------|---------|--------|--------|--------|
| Business 50 | $933.33 | $5,040.00 | $9,163.64 | $16,800.00 | $23,261.54 |
| Business 100 | $933.33 | $5,040.00 | $9,163.64 | $16,800.00 | $23,261.54 |
| Business 500 | $2,800.00 | $15,120.00 | $27,490.91 | $50,400.00 | $69,784.62 |
| Business 1K | $5,600.00 | $30,240.00 | $54,981.82 | $100,800.00 | $139,569.23 |
| Business 2.5K | $13,066.67 | $70,560.00 | $128,290.91 | $235,200.00 | $325,661.54 |
| Business 5K | $25,200.00 | $136,080.00 | $247,418.18 | $453,600.00 | $628,061.54 |
| Business 10K | $50,400.00 | $272,160.00 | $494,836.36 | $907,200.00 | $1,256,123.08 |

---

## ⏱️ TIME ESTIMATE

**Total Time:** 45-60 minutes
- Product 1-2 (Consumer): 10-15 min
- Products 3-9 (Business): 35-45 min

**Pro Tip:** Have this guide open on one screen and Stripe dashboard on another for fastest setup.

---

**Ready to start? Go to https://dashboard.stripe.com/products and create your first product!** 🚀

✅ **APPROVED PRICING - READY FOR IMPLEMENTATION**
