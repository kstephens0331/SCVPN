import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

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
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await sb.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
});

