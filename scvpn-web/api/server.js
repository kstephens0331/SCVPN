// server.js
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const {
  PORT = 8000,
  NODE_ENV = "production",

  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,   // e.g. price_...
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS250,
  STRIPE_WEBHOOK_SECRET,   // from Stripe dashboard

  // Supabase (service role)
  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,

  // Frontend URLs
  SCVPN_SUCCESS_URL = "https://your-site/pricing?status=success",
  SCVPN_CANCEL_URL  = "https://your-site/pricing?status=cancel",
} = process.env;

if (!STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
if (!SCVPN_SUPABASE_URL || !SCVPN_SUPABASE_SERVICE_KEY) {
  throw new Error("Missing SCVPN_SUPABASE_URL or SCVPN_SUPABASE_SERVICE_KEY");
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const supa   = createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY);

const app = express();

// CORS for your Vercel site
app.use(cors({ origin: true, credentials: true }));

// JSON for normal routes
app.use("/api", express.json());

// 1) Create Checkout session
app.post("/api/checkout", async (req, res) => {
  try {
    const { plan_code, customer_email } = req.body || {};
    const priceMap = {
      personal:  STRIPE_PRICE_PERSONAL,
      gaming:    STRIPE_PRICE_GAMING,
      business10: STRIPE_PRICE_BUSINESS10,
      business50: STRIPE_PRICE_BUSINESS50,
      business250: STRIPE_PRICE_BUSINESS250,
    };
    const price = priceMap[plan_code];
    if (!price) return res.status(400).json({ error: "Unknown plan_code" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price, quantity: 1 }],
      customer_email: customer_email || undefined,
      success_url: SCVPN_SUCCESS_URL,
      cancel_url:  SCVPN_CANCEL_URL,
      metadata: { plan_code },
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// 2) Stripe webhook (RAW body)
app.post("/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle subscription lifecycle
      if (event.type === "checkout.session.completed") {
        const s = event.data.object;
        const plan_code = s.metadata?.plan_code;
        const email = s.customer_details?.email || s.customer_email;
        // Example: mark user’s plan active in Supabase
        if (email && plan_code) {
          await supa
            .from("profiles")
            .update({ plan: plan_code, plan_active: true })
            .eq("email", email);
        }
      }
      if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object;
        const email = sub?.metadata?.email; // set metadata on create if you want to track
        if (email) {
          await supa.from("profiles").update({ plan_active: false }).eq("email", email);
        }
      }
      // Add more events as needed

      res.json({ received: true });
    } catch (e) {
      console.error("Webhook handler error", e);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  }
);

// 3) Device config (download)
app.get("/api/device/:id/config", async (req, res) => {
  try {
    const id = req.params.id;
    // You can store config text either in `qr_codes.config_text` or `devices.config_text`
    const { data, error } = await supa
      .from("qr_codes")
      .select("config_text")
      .eq("device_id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data?.config_text) return res.status(404).send("Not found");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="device-${id}.conf"`);
    res.send(data.config_text);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to fetch config");
  }
});

// 4) Admin device actions (replaces Edge Function)
// expects: { action: "activate"|"suspend"|"revoke_keys", deviceId: string }
app.post("/api/admin/device", async (req, res) => {
  try {
    const { action, deviceId } = req.body || {};
    if (!action || !deviceId) return res.status(400).json({ error: "Missing action or deviceId" });

    if (action === "activate") {
      await supa.from("devices").update({ is_active: true }).eq("id", deviceId);
    } else if (action === "suspend") {
      await supa.from("devices").update({ is_active: false }).eq("id", deviceId);
    } else if (action === "revoke_keys") {
      // Example: clear keys or rotate fields you use for WG config generation
      await supa.from("devices").update({ is_active: false, wg_public_key: null, wg_private_key: null }).eq("id", deviceId);
      await supa.from("qr_codes").delete().eq("device_id", deviceId);
    } else {
      return res.status(400).json({ error: "Unknown action" });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Admin action failed" });
  }
});

// Health
app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
