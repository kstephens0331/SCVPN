import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { sendPurchaseNotification } from "../_shared/email.ts";

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
    const event = await stripe.webhooks.constructEventAsync(
      raw,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    const sb = createClient(Deno.env.get("SCVPN_SUPABASE_URL")!, Deno.env.get("SCVPN_SERVICE_ROLE_JWT")!);

    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session;
        // ensure pending_signups has the latest customer/email
        await sb.from("pending_signups").update({
          email: sess.customer_details?.email ?? null,
          stripe_customer_id: typeof sess.customer === "string" ? sess.customer : null
        }).eq("checkout_session_id", sess.id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = typeof sub.items.data[0]?.price?.id === "string" ? sub.items.data[0].price.id : null;

        // Update subscription in database
        await sb.from("subscriptions").upsert({
          stripe_subscription_id: sub.id,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
          stripe_price_id: priceId,
          status: sub.status === "active" ? "active"
               : sub.status === "trialing" ? "trialing"
               : sub.status === "past_due" ? "past_due"
               : sub.status === "canceled" ? "canceled"
               : "active",
          quantity: sub.items.data[0]?.quantity ?? 1,
          updated_at: new Date().toISOString()
        }, { onConflict: "stripe_subscription_id" });

        // Send email notification on new subscription creation
        if (event.type === "customer.subscription.created") {
          try {
            // Get customer details from Stripe
            const customerId = typeof sub.customer === "string" ? sub.customer : null;
            let customerEmail = "";
            let customerName = "";

            if (customerId) {
              const customer = await stripe.customers.retrieve(customerId);
              if (customer && !customer.deleted) {
                customerEmail = customer.email || "";
                customerName = customer.name || "";
              }
            }

            // Get plan and billing period from metadata or price
            const plan = sub.metadata?.plan_code || "unknown";
            const billingPeriod = sub.metadata?.billing_period || "monthly";
            const amount = sub.items.data[0]?.price?.unit_amount || 0;
            const currency = sub.items.data[0]?.price?.currency || "usd";

            // Send notification email
            await sendPurchaseNotification({
              customerEmail,
              customerName,
              plan,
              billingPeriod,
              amount,
              currency,
              stripeCustomerId: customerId || "",
              stripeSubscriptionId: sub.id,
              timestamp: new Date().toISOString(),
            });
          } catch (emailError) {
            console.error("Failed to send purchase notification email:", emailError);
            // Don't fail the webhook if email fails
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await sb.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        // Get user_id from subscription
        const { data: subscription } = await sb
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", invoice.subscription)
          .single();

        if (subscription?.user_id) {
          await sb.from("invoices").upsert({
            subscription_id: typeof invoice.subscription === "string" ? invoice.subscription : null,
            user_id: subscription.user_id,
            amount_cents: invoice.amount_paid || 0,
            currency: invoice.currency?.toUpperCase() || "USD",
            status: "paid",
            period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
            period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
            paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : new Date().toISOString(),
          });
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
});

