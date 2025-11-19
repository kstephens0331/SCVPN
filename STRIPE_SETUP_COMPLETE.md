# Stripe Product & Price Setup Guide - Device-Based Pricing

Complete guide for creating all Stripe products and prices for SACVPN's new device-based pricing structure.

## Overview

**Total Products:** 8 plans (Personal, Gaming, Business 100, Business 500, Business 1K, Business 2.5K, Business 5K, Business 10K)
**Billing Periods per Product:** 5 (Monthly, 6-Month, Yearly, 2-Year, 3-Year)
**Total Prices to Create:** 40 price IDs

**Discount Structure:**
- Monthly: No discount
- 6-Month: 5% off
- Yearly: 15% off
- 2-Year: 25% off
- 3-Year: 35% off

**Server Specs:** 75% max load for stability and performance

---

## Quick Pricing Reference

| Plan | Monthly | 6-Month (5% off) | Yearly (15% off) | 2-Year (25% off) | 3-Year (35% off) |
|------|---------|------------------|------------------|------------------|------------------|
| **Personal** | $9.99 | $56.94 | $101.90 | $179.82 | $233.68 |
| **Gaming** | $14.99 | $85.44 | $152.90 | $269.82 | $350.68 |
| **Business 100** | $199.00 | $1,134.30 | $2,031.50 | $3,582.00 | $4,656.60 |
| **Business 500** | $899.00 | $5,124.30 | $9,171.50 | $16,182.00 | $21,044.40 |
| **Business 1K** | $1,699.00 | $9,684.30 | $17,331.50 | $30,582.00 | $39,756.60 |
| **Business 2.5K** | $3,999.00 | $22,794.30 | $40,791.50 | $71,982.00 | $93,576.60 |
| **Business 5K** | $7,499.00 | $42,744.30 | $76,491.50 | $134,982.00 | $175,494.60 |
| **Business 10K** | $14,999.00 | $85,494.30 | $152,991.50 | $269,982.00 | $350,976.60 |

---

## Option 1: Stripe CLI (Recommended - Fastest)

### Prerequisites
```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login
stripe login
```

### Create All Products & Prices

```bash
# ============================================================================
# PERSONAL PLAN ($9.99/mo base)
# ============================================================================
stripe products create \
  --name="SACVPN Personal" \
  --description="Unlimited devices for personal use"

# Copy the product ID (prod_XXXX) from output, then:
PERSONAL_ID="prod_XXXX"  # Replace with actual ID

stripe prices create --product=$PERSONAL_ID --unit-amount=999 --currency=usd --recurring[interval]=month --lookup-key=personal_monthly
stripe prices create --product=$PERSONAL_ID --unit-amount=5694 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=personal_6month
stripe prices create --product=$PERSONAL_ID --unit-amount=10190 --currency=usd --recurring[interval]=year --lookup-key=personal_yearly
stripe prices create --product=$PERSONAL_ID --unit-amount=17982 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=personal_2year
stripe prices create --product=$PERSONAL_ID --unit-amount=23368 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=personal_3year

# ============================================================================
# GAMING PLAN ($14.99/mo base)
# ============================================================================
stripe products create \
  --name="SACVPN Gaming" \
  --description="Low-latency gaming VPN with DDoS protection"

GAMING_ID="prod_XXXX"  # Replace

stripe prices create --product=$GAMING_ID --unit-amount=1499 --currency=usd --recurring[interval]=month --lookup-key=gaming_monthly
stripe prices create --product=$GAMING_ID --unit-amount=8544 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=gaming_6month
stripe prices create --product=$GAMING_ID --unit-amount=15290 --currency=usd --recurring[interval]=year --lookup-key=gaming_yearly
stripe prices create --product=$GAMING_ID --unit-amount=26982 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=gaming_2year
stripe prices create --product=$GAMING_ID --unit-amount=35068 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=gaming_3year

# ============================================================================
# BUSINESS 100 ($199/mo, 100 devices @ $1.99/device)
# ============================================================================
stripe products create \
  --name="SACVPN Business 100" \
  --description="Up to 100 devices with priority support"

BUSINESS100_ID="prod_XXXX"  # Replace

stripe prices create --product=$BUSINESS100_ID --unit-amount=19900 --currency=usd --recurring[interval]=month --lookup-key=business100_monthly
stripe prices create --product=$BUSINESS100_ID --unit-amount=113430 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=business100_6month
stripe prices create --product=$BUSINESS100_ID --unit-amount=203150 --currency=usd --recurring[interval]=year --lookup-key=business100_yearly
stripe prices create --product=$BUSINESS100_ID --unit-amount=358200 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=business100_2year
stripe prices create --product=$BUSINESS100_ID --unit-amount=465660 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=business100_3year

# ============================================================================
# BUSINESS 500 ($899/mo, 500 devices @ $1.80/device)
# ============================================================================
stripe products create \
  --name="SACVPN Business 500" \
  --description="Up to 500 devices with advanced analytics"

BUSINESS500_ID="prod_XXXX"  # Replace

stripe prices create --product=$BUSINESS500_ID --unit-amount=89900 --currency=usd --recurring[interval]=month --lookup-key=business500_monthly
stripe prices create --product=$BUSINESS500_ID --unit-amount=512430 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=business500_6month
stripe prices create --product=$BUSINESS500_ID --unit-amount=917150 --currency=usd --recurring[interval]=year --lookup-key=business500_yearly
stripe prices create --product=$BUSINESS500_ID --unit-amount=1618200 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=business500_2year
stripe prices create --product=$BUSINESS500_ID --unit-amount=2104440 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=business500_3year

# ============================================================================
# BUSINESS 1K ($1,699/mo, 1,000 devices @ $1.70/device)
# ============================================================================
stripe products create \
  --name="SACVPN Business 1,000" \
  --description="Up to 1,000 devices with dedicated account manager"

BUSINESS1K_ID="prod_XXXX"  # Replace

stripe prices create --product=$BUSINESS1K_ID --unit-amount=169900 --currency=usd --recurring[interval]=month --lookup-key=business1k_monthly
stripe prices create --product=$BUSINESS1K_ID --unit-amount=968430 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=business1k_6month
stripe prices create --product=$BUSINESS1K_ID --unit-amount=1733150 --currency=usd --recurring[interval]=year --lookup-key=business1k_yearly
stripe prices create --product=$BUSINESS1K_ID --unit-amount=3058200 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=business1k_2year
stripe prices create --product=$BUSINESS1K_ID --unit-amount=3975660 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=business1k_3year

# ============================================================================
# BUSINESS 2.5K ($3,999/mo, 2,500 devices @ $1.60/device)
# ============================================================================
stripe products create \
  --name="SACVPN Business 2,500" \
  --description="Up to 2,500 devices with custom SLA"

BUSINESS2500_ID="prod_XXXX"  # Replace

stripe prices create --product=$BUSINESS2500_ID --unit-amount=399900 --currency=usd --recurring[interval]=month --lookup-key=business2500_monthly
stripe prices create --product=$BUSINESS2500_ID --unit-amount=2279430 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=business2500_6month
stripe prices create --product=$BUSINESS2500_ID --unit-amount=4079150 --currency=usd --recurring[interval]=year --lookup-key=business2500_yearly
stripe prices create --product=$BUSINESS2500_ID --unit-amount=7198200 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=business2500_2year
stripe prices create --product=$BUSINESS2500_ID --unit-amount=9357660 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=business2500_3year

# ============================================================================
# BUSINESS 5K ($7,499/mo, 5,000 devices @ $1.50/device)
# ============================================================================
stripe products create \
  --name="SACVPN Business 5,000" \
  --description="Up to 5,000 devices with 24/7 phone support"

BUSINESS5K_ID="prod_XXXX"  # Replace

stripe prices create --product=$BUSINESS5K_ID --unit-amount=749900 --currency=usd --recurring[interval]=month --lookup-key=business5k_monthly
stripe prices create --product=$BUSINESS5K_ID --unit-amount=4274430 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=business5k_6month
stripe prices create --product=$BUSINESS5K_ID --unit-amount=7649150 --currency=usd --recurring[interval]=year --lookup-key=business5k_yearly
stripe prices create --product=$BUSINESS5K_ID --unit-amount=13498200 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=business5k_2year
stripe prices create --product=$BUSINESS5K_ID --unit-amount=17549460 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=business5k_3year

# ============================================================================
# BUSINESS 10K ($14,999/mo, 10,000 devices @ $1.50/device)
# ============================================================================
stripe products create \
  --name="SACVPN Business 10,000" \
  --description="Up to 10,000 devices with custom integrations"

BUSINESS10K_ID="prod_XXXX"  # Replace

stripe prices create --product=$BUSINESS10K_ID --unit-amount=1499900 --currency=usd --recurring[interval]=month --lookup-key=business10k_monthly
stripe prices create --product=$BUSINESS10K_ID --unit-amount=8549430 --currency=usd --recurring[interval]=month --recurring[interval_count]=6 --lookup-key=business10k_6month
stripe prices create --product=$BUSINESS10K_ID --unit-amount=15299150 --currency=usd --recurring[interval]=year --lookup-key=business10k_yearly
stripe prices create --product=$BUSINESS10K_ID --unit-amount=26998200 --currency=usd --recurring[interval]=month --recurring[interval_count]=24 --lookup-key=business10k_2year
stripe prices create --product=$BUSINESS10K_ID --unit-amount=35097660 --currency=usd --recurring[interval]=month --recurring[interval_count]=36 --lookup-key=business10k_3year
```

---

## Option 2: Stripe Dashboard (Manual)

### Step 1: Navigate to Products
1. Go to: https://dashboard.stripe.com/products
2. Make sure you're in **LIVE MODE** (toggle top-right)

### Step 2: Create Each Product

For each of the 8 plans below, click **"+ New"** and:
1. Enter product name
2. Enter description
3. Add all 5 prices (see tables below)
4. Save product
5. **Copy all 5 Price IDs** (starts with `price_`)

---

### Personal Plan - $9.99/mo base

**Product Name:** SACVPN Personal
**Description:** Unlimited devices for personal use

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $9.99 | Monthly billing |
| 6-Month | Every 6 months | $56.94 | Save 5% |
| Yearly | Every 1 year | $101.90 | Save 15% |
| 2-Year | Every 24 months | $179.82 | Save 25% |
| 3-Year | Every 36 months | $233.68 | Save 35% |

---

### Gaming Plan - $14.99/mo base

**Product Name:** SACVPN Gaming
**Description:** Low-latency gaming VPN with DDoS protection

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $14.99 | Monthly billing |
| 6-Month | Every 6 months | $85.44 | Save 5% |
| Yearly | Every 1 year | $152.90 | Save 15% |
| 2-Year | Every 24 months | $269.82 | Save 25% |
| 3-Year | Every 36 months | $350.68 | Save 35% |

---

### Business 100 - $199/mo (100 devices @ $1.99/device)

**Product Name:** SACVPN Business 100
**Description:** Up to 100 devices with priority support

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $199.00 | Monthly billing |
| 6-Month | Every 6 months | $1,134.30 | Save 5% - $59.70 |
| Yearly | Every 1 year | $2,031.50 | Save 15% - $358.85 |
| 2-Year | Every 24 months | $3,582.00 | Save 25% - $1,194 |
| 3-Year | Every 36 months | $4,656.60 | Save 35% - $2,509 |

---

### Business 500 - $899/mo (500 devices @ $1.80/device)

**Product Name:** SACVPN Business 500
**Description:** Up to 500 devices with advanced analytics

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $899.00 | Monthly billing |
| 6-Month | Every 6 months | $5,124.30 | Save 5% |
| Yearly | Every 1 year | $9,171.50 | Save 15% |
| 2-Year | Every 24 months | $16,182.00 | Save 25% |
| 3-Year | Every 36 months | $21,044.40 | Save 35% |

---

### Business 1K - $1,699/mo (1,000 devices @ $1.70/device)

**Product Name:** SACVPN Business 1,000
**Description:** Up to 1,000 devices with dedicated account manager

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $1,699.00 | Monthly billing |
| 6-Month | Every 6 months | $9,684.30 | Save 5% |
| Yearly | Every 1 year | $17,331.50 | Save 15% |
| 2-Year | Every 24 months | $30,582.00 | Save 25% |
| 3-Year | Every 36 months | $39,756.60 | Save 35% |

---

### Business 2.5K - $3,999/mo (2,500 devices @ $1.60/device)

**Product Name:** SACVPN Business 2,500
**Description:** Up to 2,500 devices with custom SLA

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $3,999.00 | Monthly billing |
| 6-Month | Every 6 months | $22,794.30 | Save 5% |
| Yearly | Every 1 year | $40,791.50 | Save 15% |
| 2-Year | Every 24 months | $71,982.00 | Save 25% |
| 3-Year | Every 36 months | $93,576.60 | Save 35% |

---

### Business 5K - $7,499/mo (5,000 devices @ $1.50/device)

**Product Name:** SACVPN Business 5,000
**Description:** Up to 5,000 devices with 24/7 phone support

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $7,499.00 | Monthly billing |
| 6-Month | Every 6 months | $42,744.30 | Save 5% |
| Yearly | Every 1 year | $76,491.50 | Save 15% |
| 2-Year | Every 24 months | $134,982.00 | Save 25% |
| 3-Year | Every 36 months | $175,494.60 | Save 35% |

---

### Business 10K - $14,999/mo (10,000 devices @ $1.50/device)

**Product Name:** SACVPN Business 10,000
**Description:** Up to 10,000 devices with custom integrations

| Billing Period | Interval | Amount | Description |
|----------------|----------|--------|-------------|
| Monthly | Every 1 month | $14,999.00 | Monthly billing |
| 6-Month | Every 6 months | $85,494.30 | Save 5% |
| Yearly | Every 1 year | $152,991.50 | Save 15% |
| 2-Year | Every 24 months | $269,982.00 | Save 25% |
| 3-Year | Every 36 months | $350,976.60 | Save 35% |

---

## Step 3: Update pricing.js with Price IDs

After creating all products/prices in Stripe, update `src/lib/pricing.js`:

```javascript
// Example for Personal plan:
stripePriceIds: {
  monthly: "price_1ABC...",      // Copy from Stripe dashboard
  sixMonth: "price_1DEF...",     // Copy from Stripe dashboard
  yearly: "price_1GHI...",       // Copy from Stripe dashboard
  twoYear: "price_1JKL...",      // Copy from Stripe dashboard
  threeYear: "price_1MNO...",    // Copy from Stripe dashboard
}
```

Repeat for all 8 plans = 40 total price IDs to update.

---

## Verification Checklist

- [ ] 8 products created in Stripe
- [ ] Each product has 5 prices (40 total)
- [ ] All prices are **recurring** (not one-time)
- [ ] Intervals correct (1mo, 6mo, 12mo, 24mo, 36mo)
- [ ] Amounts match pricing tables exactly
- [ ] All 40 Price IDs copied
- [ ] Working in **LIVE MODE**
- [ ] Price IDs updated in `src/lib/pricing.js`

---

## Common Mistakes to Avoid

1. **Wrong interval:** 6-month must be "Every 6 months", NOT "Monthly"
2. **One-time payment:** All must be RECURRING subscriptions
3. **Test mode:** Create in LIVE mode
4. **Wrong amounts:** 2-year price is the TOTAL for 2 years, not per month
5. **Currency:** All prices in USD
6. **Cents vs Dollars:** Stripe API uses cents (multiply by 100)

---

## Next Steps

1. ✅ Create all 40 Stripe prices
2. ✅ Copy all Price IDs into `src/lib/pricing.js`
3. Run SQL file: `UPDATE_PRICING_MULTI_PERIOD.sql` in Supabase
4. Update frontend pricing page to show billing period selector
5. Test checkout flow with all billing periods
6. Deploy to production

**Estimated Time:** 45-60 minutes via dashboard, 10-15 minutes via CLI
