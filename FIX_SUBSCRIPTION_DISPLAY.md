# Fix Subscription Not Showing in Billing Page

## Problem
After successful checkout, the billing page shows "No active plan" even though payment succeeded.

## Root Cause
The Stripe webhook receives `customer.subscription.created` event but can't link it to a user because:
1. Checkout happens before user logs in
2. Subscription metadata doesn't have `user_id`
3. Webhook can't insert subscription into database without `user_id`

## Solution
Update the `/api/checkout/claim` endpoint to create the subscription in the database after user logs in.

---

## Code Changes Needed

### File: `scvpn-api/server.js` - Update claim endpoint (lines 280-329)

**Add this code AFTER the user is authenticated and session is claimed:**

```javascript
app.post("/api/checkout/claim", async (req, reply) => {
  try {
    if (!supabase) return reply.code(500).send({ error: "supabase service not configured" });
    if (!requireStripe(reply)) return;

    const {
      session_id,
      email,
      plan_code,
      account_type = "personal",
      quantity = 1,
    } = req.body || {};

    if (!session_id) return reply.code(400).send({ error: "missing session_id" });
    if (!email)      return reply.code(400).send({ error: "missing email" });

    // 1) Get user ID from email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      return reply.code(404).send({ error: "User not found. Please sign up first." });
    }

    const userId = profile.id;

    // 2) Claim checkout session
    const upd = await supabase
      .from("checkout_sessions")
      .update({ claimed_email: email, claimed_at: new Date().toISOString() })
      .eq("id", session_id)
      .is("claimed_email", null)
      .select("*")
      .maybeSingle();

    if (upd.error && upd.error.code !== 'PGRST116') {
      return reply.code(400).send({ error: upd.error.message });
    }

    // If not found, create it
    if (!upd.data) {
      const ins = await supabase
        .from("checkout_sessions")
        .upsert({
          id: session_id,
          email,
          plan_code: plan_code || null,
          account_type,
          quantity: Number(quantity || 1),
          created_at: new Date().toISOString(),
          claimed_email: email,
          claimed_at: new Date().toISOString(),
        }, { onConflict: "id" })
        .select("*")
        .maybeSingle();

      if (ins.error) return reply.code(400).send({ error: ins.error.message });
    }

    // 3) Get Stripe checkout session to find subscription
    const stripeSession = await stripe.checkout.sessions.retrieve(session_id);

    if (!stripeSession.subscription) {
      app.log.warn({ session_id }, "[claim] No subscription found in Stripe session");
      return reply.send({ ok: true, warning: "No subscription found" });
    }

    // 4) Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(stripeSession.subscription);

    // 5) Update Stripe subscription metadata with user_id
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        ...subscription.metadata,
        user_id: userId,
      }
    });

    // 6) Create/update subscription in our database
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        user_id: userId,
        plan: plan_code || "unknown",
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        renews_at: subscription.cancel_at_period_end ? null : new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_subscription_id" });

    if (subError) {
      app.log.error({ error: subError }, "[claim] Failed to save subscription");
      return reply.code(500).send({ error: "Failed to save subscription" });
    }

    app.log.info({ userId, subId: subscription.id, plan: plan_code }, "[claim] Subscription linked to user");

    return reply.send({ ok: true, subscription_id: subscription.id });
  } catch (err) {
    app.log.error({ err }, "[claim] error");
    reply.code(500).send({ error: "claim failed" });
  }
});
```

---

## Testing Steps

1. **Delete test user completely** (all tables)
2. **Go to pricing page** and click "Get Started" on Personal plan
3. **Complete Stripe checkout** with test card `4242 4242 4242 4242`
4. **Sign up / Log in** on post-checkout page
5. **Check billing page** - should now show "Personal - active"
6. **Check Railway logs** - should see `[claim] Subscription linked to user`

---

## What This Fix Does

1. ✅ Gets user ID from email after they log in
2. ✅ Retrieves Stripe subscription from checkout session
3. ✅ Updates Stripe subscription metadata with user_id
4. ✅ Saves subscription to database with user link
5. ✅ Billing page can now find subscription by user_id

---

## Alternative: Simpler Fix (If Above is Too Complex)

If you want a simpler fix, just create the subscription directly in the database during claim:

```javascript
// After getting userId and before returning...

// Get the checkout session from Stripe to find subscription ID
const stripeSession = await stripe.checkout.sessions.retrieve(session_id);

if (stripeSession.subscription) {
  // Insert subscription directly
  await supabase.from("subscriptions").upsert({
    stripe_subscription_id: stripeSession.subscription,
    stripe_customer_id: stripeSession.customer,
    user_id: userId,
    plan: plan_code,
    status: "active", // Assume active since checkout just completed
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });
}
```

This is simpler but less robust (doesn't get actual subscription details from Stripe).

---

## Deployment

1. Update `server.js` with the new claim endpoint code
2. Commit and push to trigger Railway deployment
3. Wait for Railway to deploy
4. Test with fresh checkout

---

**Status:** Ready to implement
**Estimated Time:** 15 minutes
**Priority:** HIGH - Blocks users from seeing their plan after payment
