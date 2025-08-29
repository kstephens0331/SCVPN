// app/api/checkout/route.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { plan_code, account_type = "personal", quantity = 1, customer_email } = body || {};

    const PRICE_MAP = {
      personal: process.env.STRIPE_PRICE_PERSONAL,
      gaming: process.env.STRIPE_PRICE_GAMING,
      business10: process.env.STRIPE_PRICE_BUSINESS10,
      business50: process.env.STRIPE_PRICE_BUSINESS50,
      business250: process.env.STRIPE_PRICE_BUSINESS250,
    };

    const price = PRICE_MAP[plan_code];
    if (!price) return Response.json({ error: "Unknown plan_code" }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity }],
      success_url: `${process.env.SITE_URL}/post-checkout?status=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/pricing?status=cancel`,
      customer_email: customer_email || undefined,
      allow_promotion_codes: true,
      metadata: { plan_code, account_type },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error", err);
    return Response.json({ error: "checkout failed" }, { status: 500 });
  }
}
