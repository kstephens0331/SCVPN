# SACVPN Stripe Products & Prices Setup Guide

This guide contains **all plan details and descriptions** for creating products and prices in Stripe.

---

## 📋 STRIPE PRODUCTS TO CREATE

Create these **5 products** in Stripe Dashboard → Products:

### Product 1: Personal Plan
- **Name:** SACVPN Personal
- **Description:** Unlimited devices for personal use with secure browsing and streaming
- **Statement Descriptor:** SACVPN Personal
- **Features:**
  - Protect all your personal devices at home
  - Stream and browse privately without ISP throttling
  - Simple QR setup for non-technical users
  - Unlimited devices
  - 24/7 customer support

### Product 2: Gaming Plan
- **Name:** SACVPN Gaming
- **Description:** Low-latency gaming-optimized VPN with DDoS protection
- **Statement Descriptor:** SACVPN Gaming
- **Features:**
  - Low-latency gaming-optimized routes
  - DDoS protection for competitive play
  - Unlimited devices so all consoles & PCs are covered
  - Priority routing for gaming traffic
  - 24/7 priority support

### Product 3: Business 10 Plan
- **Name:** SACVPN Business 10
- **Description:** Secure up to 10 work devices with centralized management
- **Statement Descriptor:** SACVPN Business10
- **Features:**
  - Secure up to 10 work devices
  - Centralized management dashboard
  - Affordable entry tier for small teams
  - Role-based access control
  - Email support with 24-hour response time

### Product 4: Business 50 Plan
- **Name:** SACVPN Business 50
- **Description:** Cover 50 devices with priority support and advanced management
- **Statement Descriptor:** SACVPN Business50
- **Features:**
  - Cover 50 devices across your organization
  - Role-based device management
  - Priority support response times
  - Advanced analytics and reporting
  - Dedicated onboarding assistance

### Product 5: Business 250 Plan
- **Name:** SACVPN Business 250+
- **Description:** Enterprise coverage for 250+ devices with dedicated account manager
- **Statement Descriptor:** SACVPN Business250
- **Features:**
  - Enterprise coverage for 250+ devices
  - Custom SLAs and onboarding support
  - Dedicated account manager & tailored routing
  - White-glove deployment assistance
  - Custom reporting and compliance support

---

## 💰 STRIPE PRICES TO CREATE

Create **25 total prices** (5 plans × 5 billing periods each)

### PERSONAL PLAN PRICES (5 prices)

**Product:** SACVPN Personal

1. **Monthly**
   - Price: **$9.99/month**
   - Billing Interval: Monthly (recurring every 1 month)
   - Price Lookup Key: `personal_monthly`

2. **6 Months** (10% discount)
   - Price: **$53.94 every 6 months**
   - Billing Interval: Every 6 months (recurring every 6 months)
   - Price Lookup Key: `personal_6month`
   - Display: $8.99/month (billed $53.94 every 6 months)

3. **1 Year** (20% discount)
   - Price: **$95.88/year**
   - Billing Interval: Yearly (recurring every 12 months)
   - Price Lookup Key: `personal_yearly`
   - Display: $7.99/month (billed $95.88 annually)

4. **2 Years** (30% discount)
   - Price: **$167.76 every 2 years**
   - Billing Interval: Every 24 months (recurring every 24 months)
   - Price Lookup Key: `personal_2year`
   - Display: $6.99/month (billed $167.76 every 2 years)

5. **3 Years** (45% discount - BEST VALUE)
   - Price: **$197.64 every 3 years**
   - Billing Interval: Every 36 months (recurring every 36 months)
   - Price Lookup Key: `personal_3year`
   - Display: $5.49/month (billed $197.64 every 3 years)

---

### GAMING PLAN PRICES (5 prices)

**Product:** SACVPN Gaming

1. **Monthly**
   - Price: **$14.99/month**
   - Billing Interval: Monthly (recurring every 1 month)
   - Price Lookup Key: `gaming_monthly`

2. **6 Months** (10% discount)
   - Price: **$80.94 every 6 months**
   - Billing Interval: Every 6 months (recurring every 6 months)
   - Price Lookup Key: `gaming_6month`
   - Display: $13.49/month (billed $80.94 every 6 months)

3. **1 Year** (20% discount)
   - Price: **$143.88/year**
   - Billing Interval: Yearly (recurring every 12 months)
   - Price Lookup Key: `gaming_yearly`
   - Display: $11.99/month (billed $143.88 annually)

4. **2 Years** (30% discount)
   - Price: **$251.76 every 2 years**
   - Billing Interval: Every 24 months (recurring every 24 months)
   - Price Lookup Key: `gaming_2year`
   - Display: $10.49/month (billed $251.76 every 2 years)

5. **3 Years** (45% discount - BEST VALUE)
   - Price: **$296.64 every 3 years**
   - Billing Interval: Every 36 months (recurring every 36 months)
   - Price Lookup Key: `gaming_3year`
   - Display: $8.24/month (billed $296.64 every 3 years)

---

### BUSINESS 10 PLAN PRICES (5 prices)

**Product:** SACVPN Business 10

1. **Monthly**
   - Price: **$59.99/month**
   - Billing Interval: Monthly (recurring every 1 month)
   - Price Lookup Key: `business10_monthly`

2. **6 Months** (10% discount)
   - Price: **$323.94 every 6 months**
   - Billing Interval: Every 6 months (recurring every 6 months)
   - Price Lookup Key: `business10_6month`
   - Display: $53.99/month (billed $323.94 every 6 months)

3. **1 Year** (20% discount)
   - Price: **$575.88/year**
   - Billing Interval: Yearly (recurring every 12 months)
   - Price Lookup Key: `business10_yearly`
   - Display: $47.99/month (billed $575.88 annually)

4. **2 Years** (30% discount)
   - Price: **$1,007.76 every 2 years**
   - Billing Interval: Every 24 months (recurring every 24 months)
   - Price Lookup Key: `business10_2year`
   - Display: $41.99/month (billed $1,007.76 every 2 years)

5. **3 Years** (45% discount - BEST VALUE)
   - Price: **$1,187.64 every 3 years**
   - Billing Interval: Every 36 months (recurring every 36 months)
   - Price Lookup Key: `business10_3year`
   - Display: $32.99/month (billed $1,187.64 every 3 years)

---

### BUSINESS 50 PLAN PRICES (5 prices)

**Product:** SACVPN Business 50

1. **Monthly**
   - Price: **$179.99/month**
   - Billing Interval: Monthly (recurring every 1 month)
   - Price Lookup Key: `business50_monthly`

2. **6 Months** (10% discount)
   - Price: **$971.94 every 6 months**
   - Billing Interval: Every 6 months (recurring every 6 months)
   - Price Lookup Key: `business50_6month`
   - Display: $161.99/month (billed $971.94 every 6 months)

3. **1 Year** (20% discount)
   - Price: **$1,727.88/year**
   - Billing Interval: Yearly (recurring every 12 months)
   - Price Lookup Key: `business50_yearly`
   - Display: $143.99/month (billed $1,727.88 annually)

4. **2 Years** (30% discount)
   - Price: **$3,023.76 every 2 years**
   - Billing Interval: Every 24 months (recurring every 24 months)
   - Price Lookup Key: `business50_2year`
   - Display: $125.99/month (billed $3,023.76 every 2 years)

5. **3 Years** (45% discount - BEST VALUE)
   - Price: **$3,563.64 every 3 years**
   - Billing Interval: Every 36 months (recurring every 36 months)
   - Price Lookup Key: `business50_3year`
   - Display: $98.99/month (billed $3,563.64 every 3 years)

---

### BUSINESS 250 PLAN PRICES (5 prices)

**Product:** SACVPN Business 250+

1. **Monthly**
   - Price: **$999.99/month**
   - Billing Interval: Monthly (recurring every 1 month)
   - Price Lookup Key: `business250_monthly`

2. **6 Months** (10% discount)
   - Price: **$5,399.94 every 6 months**
   - Billing Interval: Every 6 months (recurring every 6 months)
   - Price Lookup Key: `business250_6month`
   - Display: $899.99/month (billed $5,399.94 every 6 months)

3. **1 Year** (20% discount)
   - Price: **$9,599.88/year**
   - Billing Interval: Yearly (recurring every 12 months)
   - Price Lookup Key: `business250_yearly`
   - Display: $799.99/month (billed $9,599.88 annually)

4. **2 Years** (30% discount)
   - Price: **$16,799.76 every 2 years**
   - Billing Interval: Every 24 months (recurring every 24 months)
   - Price Lookup Key: `business250_2year`
   - Display: $699.99/month (billed $16,799.76 every 2 years)

5. **3 Years** (45% discount - BEST VALUE)
   - Price: **$19,799.64 every 3 years**
   - Billing Interval: Every 36 months (recurring every 36 months)
   - Price Lookup Key: `business250_3year`
   - Display: $549.99/month (billed $19,799.64 every 3 years)

---

## 🎯 HOW TO CREATE IN STRIPE

### Step 1: Create Products

1. Go to Stripe Dashboard → **Products**
2. Click **+ Add Product**
3. Fill in details for each of the 5 products above
4. Save each product

### Step 2: Create Prices for Each Product

For each product:

1. Click on the product name
2. Click **+ Add another price**
3. Enter the price amount (e.g., $9.99)
4. Select billing interval:
   - **Monthly:** Recurring every 1 month
   - **6 Months:** Recurring every 6 months
   - **Yearly:** Recurring every 12 months
   - **2 Years:** Recurring every 24 months (custom)
   - **3 Years:** Recurring every 36 months (custom)
5. Add **Price Lookup Key** (e.g., `personal_monthly`)
6. Save the price
7. Copy the **Price ID** (starts with `price_`)

### Step 3: Save All Price IDs

After creating all 25 prices, you'll have Price IDs like:

```
STRIPE_PRICE_PERSONAL_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_PERSONAL_3YEAR=price_xxxxxxxxxxxxx

STRIPE_PRICE_GAMING_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_GAMING_3YEAR=price_xxxxxxxxxxxxx

STRIPE_PRICE_BUSINESS10_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS10_3YEAR=price_xxxxxxxxxxxxx

STRIPE_PRICE_BUSINESS50_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS50_3YEAR=price_xxxxxxxxxxxxx

STRIPE_PRICE_BUSINESS250_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_6MONTH=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_2YEAR=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS250_3YEAR=price_xxxxxxxxxxxxx
```

---

## 📊 PRICING SUMMARY TABLE

| Plan | Monthly | 6 Months | 1 Year | 2 Years | 3 Years |
|------|---------|----------|--------|---------|---------|
| **Personal** | $9.99 | $53.94 (save 10%) | $95.88 (save 20%) | $167.76 (save 30%) | $197.64 (save 45%) |
| **Gaming** | $14.99 | $80.94 (save 10%) | $143.88 (save 20%) | $251.76 (save 30%) | $296.64 (save 45%) |
| **Business 10** | $59.99 | $323.94 (save 10%) | $575.88 (save 20%) | $1,007.76 (save 30%) | $1,187.64 (save 45%) |
| **Business 50** | $179.99 | $971.94 (save 10%) | $1,727.88 (save 20%) | $3,023.76 (save 30%) | $3,563.64 (save 45%) |
| **Business 250** | $999.99 | $5,399.94 (save 10%) | $9,599.88 (save 20%) | $16,799.76 (save 30%) | $19,799.64 (save 45%) |

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Create 5 products in Stripe Dashboard
- [ ] Create 25 prices (5 per product) with correct billing intervals
- [ ] Copy all 25 Price IDs
- [ ] Add all Price IDs to Railway environment variables
- [ ] Update checkout page to support billing period selection
- [ ] Test checkout flow for each price
- [ ] Verify subscription creation in database
- [ ] Test webhook handling for all billing periods

---

## 💡 MARKETING COPY FOR CHECKOUT

### Personal Plan
**Headline:** Unlimited Devices for Your Whole Family
**Subheadline:** Stream, browse, and work privately without ISP throttling
**Call to Action:** Get Started - 30-Day Money-Back Guarantee

### Gaming Plan
**Headline:** Low-Latency Gaming VPN with DDoS Protection
**Subheadline:** Protect all your consoles and PCs with unlimited devices
**Call to Action:** Level Up Your Security - 30-Day Money-Back Guarantee

### Business Plans
**Headline:** Enterprise-Grade VPN for Your Team
**Subheadline:** Centralized management, priority support, and scalable pricing
**Call to Action:** Secure Your Business - Contact for Custom Enterprise Plans

---

## 🔒 RECOMMENDED STRIPE SETTINGS

- **Payment Methods:** Card, Google Pay, Apple Pay
- **Tax Collection:** Enable automatic tax calculation
- **Customer Portal:** Enable for self-service billing management
- **Invoice Settings:** Send invoices automatically
- **Retry Logic:** Enable Smart Retries for failed payments
- **Customer Emails:** Send receipts and invoice reminders

---

**Ready to create these products and prices in Stripe!**
