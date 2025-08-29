import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { planId } = req.body || {};
    if (!planId) {
      return res.status(400).json({ error: "Missing planId" });
    }

    // Map planId to your actual Stripe Price IDs from env
    const PRICE_MAP = {
      personal: process.env.STRIPE_PRICE_PERSONAL,
      gaming: process.env.STRIPE_PRICE_GAMING,
      business10: process.env.STRIPE_PRICE_BUSINESS10,
      business50: process.env.STRIPE_PRICE_BUSINESS50,
      business250: process.env.STRIPE_PRICE_BUSINESS250,
    };

    const price = PRICE_MAP[planId];
    if (!price) {
      return res.status(400).json({ error: "Invalid planId" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${process.env.SITE_URL}/post-checkout?status=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/pricing?status=cancel`,
      allow_promotion_codes: true,
      metadata: { planId },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error", err);
    return res.status(500).json({ error: "Checkout error" });
  }
}
