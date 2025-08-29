// server.js
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ---- Environment ----
const {
  PORT = 8000,
  NODE_ENV = "production",
  SITE_URL = "https://www.sacvpn.com",

  // Frontend origins allowed to call this API
  ALLOWED_ORIGINS = "https://www.sacvpn.com,http://localhost:5173",

  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS250,

  // Supabase (service role key required for server-side mutations)
  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,
} = process.env;

// ---- Basic validation ----
if (!SCVPN_SUPABASE_URL || !SCVPN_SUPABASE_SERVICE_KEY) {
  console.warn("[boot] Missing Supabase env (SCVPN_SUPABASE_URL / SCVPN_SUPABASE_SERVICE_KEY)");
}
if (!STRIPE_SECRET_KEY) {
  console.warn("[boot] Missing STRIPE_SECRET_KEY (checkout/portal will fail until set).");
}

// ---- Clients ----
const app = express();
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const supabase = (SCVPN_SUPABASE_URL && SCVPN_SUPABASE_SERVICE_KEY)
  ? createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
  : null;

// ---- CORS ----
const allowedOrigins = ALLOWED_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow server-to-server / curl
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET","POST","OPTIONS","PUT","PATCH","DELETE"],
  allowedHeaders: ["Content-Type","Authorization","x-admin-email"],
  credentials: false, // set to true only if you need to exchange cookies across origins
}));
app.options("*", cors()); // preflight

// ---- Body parsing ----
app.use(express.json());

// ---- Helpers ----
const PRICE_MAP = {
  personal: STRIPE_PRICE_PERSONAL,
  gaming: STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS10,
  business50: STRIPE_PRICE_BUSINESS50,
  business250: STRIPE_PRICE_BUSINESS250,
};

function requireSupabase(res) {
  if (!supabase) {
    res.status(500).json({ error: "server not configured (supabase)" });
    return false;
  }
  return true;
}

function requireStripe(res) {
  if (!stripe) {
    res.status(500).json({ error: "server not configured (stripe)" });
    return false;
  }
  return true;
}

// ---- Routes ----
app.get("/api/healthz", (req, res) => {
  res.json({ ok: true, env: NODE_ENV, ts: new Date().toISOString() });
});

// Create a Stripe Checkout Session (subscriptions)
app.post("/api/checkout", async (req, res) => {
  try {
    if (!requireStripe(res)) return;
    const { plan, plan_code, account_type, quantity = 1, customer_email } = req.body || {};
    const code = plan_code || plan; // support either name
    const price = PRICE_MAP[code];
    if (!price) return res.status(400).json({ error: "Unknown plan_code" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity }],
      success_url: `${SITE_URL}/post-checkout?status=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?status=cancel`,
      customer_email: customer_email || undefined,
      allow_promotion_codes: true,
      metadata: { plan_code: code, account_type: account_type || "personal" },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error", err);
    res.status(500).json({ error: "checkout failed" });
  }
});

// Stripe Billing Portal for managing a subscription
app.get("/api/billing/manage", async (req, res) => {
  try {
    if (!requireStripe(res)) return;
    // TODO: Resolve the Stripe customer id for the signed-in user.
    // For a minimal flow, you can pass ?customer_id= on the URL.
    const customerId = req.query.customer_id;
    if (!customerId) return res.status(400).send("customer_id required");

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: SITE_URL + "/app",
    });
    res.redirect(303, portal.url);
  } catch (err) {
    console.error("[billing/manage] error", err);
    res.status(500).send("portal failed");
  }
});

// Download WireGuard config for a device
app.get("/api/device/:id/config", async (req, res) => {
  try {
    if (!requireSupabase(res)) return;
    const id = req.params.id;
    const { data, error } = await supabase
      .from("device_configs")
      .select("config_text, filename")
      .eq("device_id", id)
      .maybeSingle();

    if (error) {
      console.error("[device config] supabase error", error);
      return res.status(500).send("db error");
    }
    if (!data) return res.status(404).send("not found");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${data.filename || `device-${id}.conf`}"`);
    res.send(data.config_text || "");
  } catch (err) {
    console.error("[device config] error", err);
    res.status(500).send("failed");
  }
});

// Admin device actions (activate / suspend / revoke_keys)
app.post("/api/admin-device", async (req, res) => {
  try {
    if (!requireSupabase(res)) return;
    const adminEmail = req.header("x-admin-email");
    if (!adminEmail) return res.status(401).json({ error: "missing admin email" });

    const { action, deviceId } = req.body || {};
    if (!action || !deviceId) return res.status(400).json({ error: "missing action/deviceId" });

    // Minimal authorization example (replace with RLS or role check as needed)
    const { data: adminRow } = await supabase.from("profiles").select("email,role").eq("email", adminEmail).maybeSingle();
    const role = adminRow?.role || "user";
    if (!["owner","admin"].includes(role)) return res.status(403).json({ error: "forbidden" });

    if (action === "activate" || action === "suspend") {
      const is_active = action === "activate";
      const { error } = await supabase.from("devices").update({ is_active }).eq("id", deviceId);
      if (error) throw error;
      return res.json({ ok: true });
    }

    if (action === "revoke_keys") {
      // example: delete keys and mark stale
      const { error: e1 } = await supabase.from("device_keys").delete().eq("device_id", deviceId);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("devices").update({ is_active: false }).eq("id", deviceId);
      if (e2) throw e2;
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "unknown action" });
  } catch (err) {
    console.error("[admin-device] error", err);
    res.status(500).json({ error: "failed" });
  }
});

// ---- Start server ----
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API listening on :${PORT}`);
});
