# Current Issues To Fix

**Date:** 2025-10-22
**Status:** Multiple issues after successful checkout

---

## ✅ FIXED

1. **Checkout Price IDs** - All 25 real Stripe Price IDs deployed
2. **Subscription Webhook** - Now saves subscriptions to database
3. **SSH Timeouts** - Added 15-second timeout to prevent container crashes

---

## 🔴 ACTIVE ISSUES

### 1. Subscription Not Showing in Billing Page

**Problem:** After successful checkout, billing page shows "No active plan"

**Root Cause:** Subscription webhook needs `user_id` in metadata to link subscription to user

**What Happens:**
- User completes checkout → Stripe creates subscription
- Webhook receives `customer.subscription.created` event
- Webhook saves subscription BUT can't link it to user (no user_id in metadata)
- Billing page queries subscriptions by user_id → finds nothing

**Fix Needed:**
1. Update `/api/checkout/claim` endpoint to update Stripe subscription metadata with user_id after user logs in
2. Or: Create subscription directly in database during claim process

**File:** `scvpn-api/server.js` lines 280-329 (claim endpoint)

---

### 2. WireGuard Key Request Emails Not Sending

**Problem:** User clicks "Request Key" but no email is sent

**Possible Causes:**
1. No email service configured (Resend API key missing?)
2. Email sending function not implemented
3. Key request not triggering email

**What to Check:**
- Is `RESEND_API_KEY` in Railway environment?
- Is there an email sending function in the codebase?
- Are key_requests being inserted into database?

**Files to Check:**
- `scvpn-api/server.js` - Look for email sending
- Check if Resend is configured

---

### 3. Device Config 404 Error

**Problem:** After checkout, viewing device config shows "Failed to fetch configuration" (404)

**Root Cause:** Device exists in `devices` table but has no WireGuard config in `device_configs` table

**What Happens:**
- User completes checkout → Profile and device created
- User goes to personal dashboard → Sees device
- User clicks to view config → 404 because no WireGuard keys generated yet

**Expected Flow:**
1. User requests key (clicks "Request Key" button)
2. System generates WireGuard keys via `/api/wireguard/process-requests`
3. Keys saved to `device_configs` table
4. User can view config

**Fix Needed:**
- Implement automatic key generation after device creation
- OR: Add clear "Request Key" button flow with proper feedback
- OR: Generate keys immediately during device creation

**File:** `scvpn-api/server.js` lines 659-710 (config-data endpoint)

---

## 📋 RECOMMENDED FIX ORDER

### Priority 1: Fix Subscription Display
This blocks users from seeing their active plan after successful payment.

**Steps:**
1. Update claim endpoint to add user_id to Stripe subscription metadata
2. OR: Directly insert subscription to database during claim
3. Test: Complete checkout → Log in → Check billing page

### Priority 2: Fix WireGuard Key Generation
Users can't get VPN configs after paying.

**Steps:**
1. Check if Resend API key is configured
2. Implement automatic key generation after device creation
3. Add email notification when keys are ready
4. Test: Create device → Request key → Receive email → View config

### Priority 3: Improve Error Messages
Better user feedback when things go wrong.

**Steps:**
1. Show "Keys pending - request key to generate" instead of 404
2. Show "Waiting for key generation..." during request
3. Show "Check your email for setup instructions" after request

---

## 🧪 TESTING CHECKLIST

Once fixes are deployed:

- [ ] Complete new checkout as fresh user
- [ ] Verify subscription appears in billing page
- [ ] Verify subscription shows correct plan and renewal date
- [ ] Click "Request Key" on device
- [ ] Verify email is received with setup instructions
- [ ] View device config - should show WireGuard config and QR code
- [ ] Test WireGuard connection with generated config

---

## 🔍 DEBUG QUERIES

**Check if subscription was created:**
```sql
SELECT * FROM subscriptions WHERE stripe_customer_id = '<customer_id>';
```

**Check if device has config:**
```sql
SELECT * FROM device_configs WHERE device_id = '<device_id>';
```

**Check key requests:**
```sql
SELECT * FROM key_requests ORDER BY requested_at DESC LIMIT 10;
```

**Check checkout sessions:**
```sql
SELECT * FROM checkout_sessions ORDER BY created_at DESC LIMIT 5;
```

---

**Next Step:** Fix subscription display issue first, then tackle key generation.
