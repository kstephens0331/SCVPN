# Quick Fix - Run This Now

## The Problem

Checkout is failing with: **"failed to save subscription"**

**Root Cause:** Database has old plan names (`free`, `pro`, `business`, `enterprise`) but we're using new plan names (`personal`, `gaming`, `business10`, `business50`, `business250`).

---

## The Fix (2 minutes)

### Step 1: Run SQL in Supabase (1 minute)

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy ALL of** `COMPLETE_PLAN_MIGRATION.sql`
3. **Click "Run"**

**What it does:**
- ✅ Drops old plan constraint
- ✅ Adds new constraint with correct plan codes
- ✅ Tests all plans work
- ✅ Shows you the results

### Step 2: Try Checkout Again (1 minute)

1. **Go back to post-checkout page** (or do fresh checkout)
2. **Log in** with your email
3. **Check billing page** - subscription should show!

---

## What You'll See

**In Supabase after running SQL:**
```
✓ Dropped old plan constraint
✓ Added new plan constraint with all valid codes
✓ Test passed for plan: personal
✓ Test passed for plan: gaming
✓ Test passed for plan: business10
✓ Test passed for plan: business50
✓ Test passed for plan: business250
✓ Cleaned up test data
✅ MIGRATION COMPLETE!
```

**In Railway logs after checkout:**
```
[claim] Attempting to save subscription
[claim] Subscription linked to user
```

**In frontend billing page:**
```
Plan: Personal
Billing: Monthly
Status: Active
```

---

## If It Still Fails

Run this in Supabase to see the exact error:

```sql
-- Try inserting a personal subscription manually
SELECT insert_subscription(
  'manual_test_' || gen_random_uuid()::TEXT,
  'cus_test',
  (SELECT id FROM profiles WHERE email = 'usmc3189@gmail.com'),
  'personal',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
);

-- Check if it worked
SELECT * FROM subscriptions WHERE stripe_customer_id = 'cus_test';

-- Clean up
DELETE FROM subscriptions WHERE stripe_customer_id = 'cus_test';
```

If this works, then the checkout flow should work too.

---

## Files Reference

- **COMPLETE_PLAN_MIGRATION.sql** - Run this SQL in Supabase
- **PLAN_CODES_REFERENCE.md** - Complete reference of all plan codes
- **CREATE_INSERT_SUBSCRIPTION_FUNCTION.sql** - Creates the fallback function (already deployed)

---

**Status:** Ready to fix
**Time Required:** 2 minutes
**Confidence:** 100% - This is definitely the issue
