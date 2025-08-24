import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { price_id, plan_code, account_type, quantity = 1 } = await req.json();
    if (!price_id || !plan_code || !account_type) {
      return new Response(JSON.stringify({ error: "Missing price_id/plan_code/account_type" }), { status: 400, headers: corsHeaders });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
    const SITE_URL = Deno.env.get("SITE_URL")!;
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${SITE_URL}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_creation: "always",
      line_items: [{ price: price_id, quantity }],
      metadata: { plan_code, account_type, quantity: String(quantity) },
    });

    // Record pending signup keyed by session id
    const SUPABASE_URL = Deno.env.get("SCVPN_SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SCVPN_SERVICE_ROLE_JWT")!;
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    await sb.from("pending_signups").upsert({
      checkout_session_id: session.id,
      plan_code,
      account_type,
      quantity,
    }, { onConflict: "checkout_session_id" });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});

