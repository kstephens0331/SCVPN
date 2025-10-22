# SACVPN Plan Codes Reference

**Last Updated:** 2025-10-22

---

## Official Plan Codes

These are the **ONLY** valid plan codes in the SACVPN system:

| Plan Code | Display Name | Price/Month | Devices | Stripe Price IDs |
|-----------|-------------|-------------|---------|------------------|
| `personal` | Personal | $9.99 | 1 | 5 Price IDs (monthly to 3-year) |
| `gaming` | Gaming | $14.99 | 3 | 5 Price IDs (monthly to 3-year) |
| `business10` | Business 10 | $29.99 | 10 | 5 Price IDs (monthly to 3-year) |
| `business50` | Business 50 | $99.99 | 50 | 5 Price IDs (monthly to 3-year) |
| `business250` | Business 250+ | $399.99 | 250 | 5 Price IDs (monthly to 3-year) |

---

## Legacy Plan Codes (Deprecated)

These were in the old schema but should be migrated:

| Old Code | Migrate To | Status |
|----------|------------|--------|
| `free` | Keep as-is | Legacy, keep for trial accounts |
| `pro` | `personal` | Deprecated |
| `business` | `business10` | Deprecated |
| `enterprise` | `business50` | Deprecated |

---

## Where Plan Codes Are Used

### 1. Frontend (React)
**File:** `src/lib/pricing-new.js`

```javascript
{
  code: 'personal',    // ← Plan code used in checkout
  name: 'Personal',
  ...
}
```

### 2. Backend (Fastify API)
**File:** `scvpn-api/server.js`

```javascript
// Checkout endpoint
plan_code: req.body.plan_code  // ← Must match frontend codes

// Subscription claim
plan: plan_code || "unknown"  // ← Saved to subscriptions table
```

### 3. Database (Supabase)
**Table:** `subscriptions`

```sql
-- CHECK constraint (UPDATED BY COMPLETE_PLAN_MIGRATION.sql)
CHECK (plan IN (
  'personal', 'gaming', 'business10', 'business50', 'business250',
  'free', 'pro', 'business', 'enterprise', 'unknown'
))
```

### 4. Stripe
**Metadata:** Each Stripe subscription includes:

```json
{
  "metadata": {
    "plan_code": "personal",
    "plan_label": "Personal",
    "account_type": "personal",
    "billing_period": "monthly"
  }
}
```

---

## Common Issues

### ❌ "Value violates check constraint subscriptions_plan_check"

**Cause:** Database constraint doesn't allow the plan code

**Fix:** Run `COMPLETE_PLAN_MIGRATION.sql` in Supabase

---

### ❌ Billing page shows wrong plan name

**Cause:** Plan code doesn't match display name mapping

**Fix:** Update display name mapping in frontend billing component

---

### ❌ Stripe webhook has wrong plan

**Cause:** Checkout didn't pass `plan_code` to Stripe metadata

**Fix:** Verify `/api/checkout` includes plan_code in metadata

---

## Testing Plan Codes

### Test in Supabase

```sql
-- Test all plan codes work
SELECT insert_subscription(
  'test_' || gen_random_uuid()::TEXT,
  'test_customer',
  (SELECT id FROM profiles LIMIT 1),
  'personal',  -- Change to test different plans
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
);

-- Clean up
DELETE FROM subscriptions WHERE stripe_customer_id = 'test_customer';
```

### Test in Frontend

1. Go to pricing page
2. Click "Get Started" on any plan
3. Check browser console for `plan_code` in API request
4. Complete checkout
5. Verify billing page shows correct plan name

---

## Migration Checklist

- [x] Update database CHECK constraint (`COMPLETE_PLAN_MIGRATION.sql`)
- [x] Update backend API to use new codes
- [x] Frontend already uses correct codes
- [x] Stripe metadata already includes plan_code
- [ ] Run migration in Supabase ← **DO THIS NOW**
- [ ] Test checkout with each plan
- [ ] Verify billing page displays correctly

---

## After Migration

Once you run `COMPLETE_PLAN_MIGRATION.sql`:

1. ✅ Database accepts: `personal`, `gaming`, `business10`, `business50`, `business250`
2. ✅ Checkout flow works with all plans
3. ✅ Billing page shows correct plan names
4. ✅ Subscriptions save successfully
5. ✅ Stripe metadata matches database

---

**Action Required:** Run `COMPLETE_PLAN_MIGRATION.sql` in Supabase SQL Editor NOW
