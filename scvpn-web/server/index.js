import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

/* 1. Admin Device Actions */
app.post("/api/admin/device", async (req, res) => {
  const { action, deviceId } = req.body || {};
  const adminEmail = req.get("x-admin-email");
  if (!adminEmail) return res.status(403).json({ error: "Missing admin email" });

  // TODO: hook into Supabase tables with SERVICE_KEY
  // Right now just echoing back:
  res.json({ ok: true, action, deviceId });
});

/* 2. Stripe Checkout */
app.post("/api/stripe/checkout", async (req, res) => {
  try {
    const { planCode, customerEmail } = req.body;
    const priceMap = {
      personal: process.env.STRIPE_PRICE_PERSONAL,
      gaming: process.env.STRIPE_PRICE_GAMING,
      business10: process.env.STRIPE_PRICE_BUSINESS10,
      business50: process.env.STRIPE_PRICE_BUSINESS50,
      business250: process.env.STRIPE_PRICE_BUSINESS250,
    };
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: customerEmail,
      line_items: [{ price: priceMap[planCode], quantity: 1 }],
      success_url: `${process.env.PUBLIC_SITE_URL}/?checkout=success`,
      cancel_url: `${process.env.PUBLIC_SITE_URL}/pricing?checkout=cancel`,
      metadata: { planCode },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/* 3. Device Config Download */
app.get("/api/device/:id/config", async (req, res) => {
  const { id } = req.params;
  // TODO: fetch config from Supabase qr_codes table with SERVICE_KEY
  res.setHeader("Content-Type", "text/plain");
  res.send(`[Interface]\nPrivateKey = ...\n# Device ${id}`);
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API listening on http://0.0.0.0:${port}`));
