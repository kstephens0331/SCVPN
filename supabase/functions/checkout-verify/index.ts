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
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");
    if (!session_id) return new Response(JSON.stringify({ error: "Missing session_id" }), { status: 400, headers: corsHeaders });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Upsert email / customer into pending_signups
    const sb = createClient(Deno.env.get("SCVPN_SUPABASE_URL")!, Deno.env.get("SCVPN_SERVICE_ROLE_JWT")!);
    await sb.from("pending_signups").update({
      email: session.customer_details?.email ?? null,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null
    }).eq("checkout_session_id", session_id);

    const { data } = await sb.from("pending_signups").select("*").eq("checkout_session_id", session_id).single();

    return new Response(JSON.stringify({
      email: session.customer_details?.email ?? null,
      plan_code: data?.plan_code ?? session.metadata?.plan_code ?? null,
      account_type: data?.account_type ?? session.metadata?.account_type ?? null,
      quantity: Number(data?.quantity ?? session.metadata?.quantity ?? 1),
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});

