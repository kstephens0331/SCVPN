// server/index.js
import express from "express";
import Stripe from "stripe";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const {
  PORT = 8000,
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS_10,
  STRIPE_PRICE_BUSINESS_50,
  STRIPE_PRICE_BUSINESS_250,
  STRIPE_WEBHOOK_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  ADMIN_EMAIL_ALLOWLIST
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("[SCVPN] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

async function isAdmin(email){
  if (!email) return false;
  try {
    const { data } = await supa.from("admin_emails").select("email").eq("email", email).maybeSingle();
    if (data) return true;
  } catch {}
  if (ADMIN_EMAIL_ALLOWLIST) {
    return ADMIN_EMAIL_ALLOWLIST.split(",").map(x=>x.trim().toLowerCase()).includes(email.toLowerCase());
  }
  return false;
}

app.get("/api/health", (_req,res)=>res.json({ ok:true, service:"scvpn-api", time:new Date().toISOString() }));

// ---------- Stripe ----------
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null;
const PRICE_MAP = {
  personal:   STRIPE_PRICE_PERSONAL,
  gaming:     STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS_10,
  business50: STRIPE_PRICE_BUSINESS_50,
  business250:STRIPE_PRICE_BUSINESS_250,
};

app.post("/api/checkout/session", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    const { planCode, customerEmail, successUrl, cancelUrl } = req.body || {};
    const price = PRICE_MAP[planCode];
    if (!price) return res.status(400).json({ error: "Unknown plan code" });
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: successUrl || "https://scvpn.app/login?checkout=success",
      cancel_url: cancelUrl || "https://scvpn.app/pricing?checkout=cancel",
      customer_email: customerEmail,
      line_items: [{ price, quantity: 1 }],
      metadata: { planCode },
    });
    res.json({ id: session.id, url: session.url });
  } catch (e) {
    console.error("[checkout/session]", e);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(500).end();
  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // TODO: mark the user/org paid in Supabase:
      // session.customer_details.email and session.metadata.planCode
      console.log("[stripe] checkout.session.completed", session.id);
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook verify failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ---------- Admin device actions (migrated from Edge Function) ----------
app.post("/api/admin/device", async (req, res) => {
  try {
    const adminEmail = req.headers["x-admin-email"];
    if (!(await isAdmin(adminEmail))) return res.status(403).json({ error: "not admin" });
    const { action, deviceId } = req.body || {};
    if (!deviceId || !action) return res.status(400).json({ error: "missing fields" });

    if (action === "activate") {
      const { error } = await supa.from("devices").update({ is_active: true }).eq("id", deviceId);
      if (error) throw error;
    } else if (action === "suspend") {
      const { error } = await supa.from("devices").update({ is_active: false }).eq("id", deviceId);
      if (error) throw error;
    } else if (action === "revoke_keys") {
      const { error } = await supa.from("devices").update({ is_active: false, revoked_at: new Date().toISOString() }).eq("id", deviceId);
      if (error) throw error;
      await supa.from("qr_codes").delete().eq("device_id", deviceId);
    } else {
      return res.status(400).json({ error: "unknown action" });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("[admin/device]", e);
    res.status(500).json({ error: "failed" });
  }
});

// ---------- Device config download (used by /app/personal) ----------
app.get("/api/device/:id/config", async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supa.from("qr_codes").select("config_text").eq("device_id", id).maybeSingle();
    if (error) throw error;
    if (!data?.config_text) return res.status(404).send("Not found");
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="device-${id}.conf"`);
    res.send(data.config_text);
  } catch (e) {
    console.error("[device/config]", e);
    res.status(500).send("Error");
  }
});

app.listen(PORT, () => {
  console.log(`SCVPN API listening on http://0.0.0.0:${PORT}`);
});
