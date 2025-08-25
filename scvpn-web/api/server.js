// server.js
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import fetch from "node-fetch"; // if you need to call webhooks later
import { createClient } from "@supabase/supabase-js";

const {
  PORT = 8000,
  NODE_ENV = "production",
  SITE_URL, // e.g. https://scvpn-rh8aagoa8-...vercel.app
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL, // price_xxx for Personal
  STRIPE_PRICE_GAMING,   // price_xxx for Gaming
  STRIPE_PRICE_BUS10,    // price_xxx for Business 10
  STRIPE_PRICE_BUS50,    // price_xxx for Business 50
  STRIPE_PRICE_BUS250,   // price_xxx for Business 250
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,   // service role for server-side ops
  STRIPE_WEBHOOK_SECRET,  // for webhook verification
} = process.env;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ---- wiring
const stripe = new Stripe(STRIPE_SECRET_KEY);
const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// plan map used by /api/checkout
const PRICE_BY_CODE = {
  personal:  STRIPE_PRICE_PERSONAL,
  gaming:    STRIPE_PRICE_GAMING,
  business10:STRIPE_PRICE_BUS10,
  business50:STRIPE_PRICE_BUS50,
  business250:STRIPE_PRICE_BUS250,
};

// 1) Stripe Checkout
app.post("/api/checkout", async (req, res) => {
  try {
    const { plan_code, customer_email } = req.body || {};
    const price = PRICE_BY_CODE[plan_code];
    if (!price) return res.status(400).json({ error: "Unknown plan_code" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer_email: customer_email || undefined,
      success_url: `${SITE_URL}/?checkout=success`,
      cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: { trial_period_days: 0 },
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message || "Checkout failed" });
  }
});

// 2) Download a device’s config as a file
app.get("/api/device/:id/config", async (req, res) => {
  try {
    const deviceId = req.params.id;
    const { data, error } = await supa
      .from("qr_codes")
      .select("config_text")
      .eq("device_id", deviceId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.config_text) return res.status(404).send("Config not found");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="wg-${deviceId}.conf"`);
    res.send(data.config_text);
  } catch (e) {
    res.status(500).send(e.message || "Failed to fetch config");
  }
});

// 3) Admin device actions (activate/suspend/revoke_keys)
app.post("/api/admin-device", async (req, res) => {
  try {
    const adminEmail = req.header("x-admin-email");
    const { action, deviceId } = req.body || {};
    if (!adminEmail) return res.status(401).json({ error: "Missing x-admin-email" });

    // allow only seeded admins
    const { data: adminRow } = await supa.from("admin_emails").select("email").eq("email", adminEmail).maybeSingle();
    if (!adminRow) return res.status(403).json({ error: "Not an admin" });

    if (!deviceId) return res.status(400).json({ error: "deviceId required" });

    if (action === "activate") {
      const { error } = await supa.from("devices").update({ is_active: true }).eq("id", deviceId);
      if (error) throw error;
    } else if (action === "suspend") {
      const { error } = await supa.from("devices").update({ is_active: false }).eq("id", deviceId);
      if (error) throw error;
    } else if (action === "revoke_keys") {
      // Minimal example: mark inactive and clear any server-assigned keys/endpoint columns you use.
      const { error } = await supa.from("devices").update({ is_active: false }).eq("id", deviceId);
      if (error) throw error;
      // If you store keys/endpoints in other tables, clear them here as well.
    } else {
      return res.status(400).json({ error: "Unknown action" });
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Admin action failed" });
  }
});

// 4) Stripe webhook (recommended)
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), (req, res) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // TODO: handle events (checkout.session.completed, customer.subscription.updated, etc.)
  // Example (pseudocode):
  // if (event.type === "checkout.session.completed") { upsert subscription in Supabase }
  res.json({ received: true });
});

app.get("/healthz", (_, res) => res.send("ok"));

app.listen(PORT, () => {
  console.log(`[scvpn-api] listening on :${PORT}`);
});
