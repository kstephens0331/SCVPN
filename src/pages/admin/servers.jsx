// server.js — SCVPN API (Express + Stripe + Supabase)
import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/* ========= ENV ========= */
const {
  PORT = process.env.PORT || 8000,

  // Frontend URL(s)
  SITE_URL,                 // e.g. https://www.sacvpn.com
  SCVPN_SUCCESS_URL,
  SCVPN_CANCEL_URL,

  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS250,

  // Supabase (service role)
  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,

  // CORS allowlist (comma-separated). Example:
  // "https://www.sacvpn.com,https://sacvpn.com,http://localhost:5173"
  ALLOWED_ORIGINS,
} = process.env;

/* ========= WIRING ========= */
const app = express();

// Build CORS allowlist
const rawAllow = (ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const defaults = [
  SITE_URL,
  "https://www.sacvpn.com",
  "https://sacvpn.com",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);
const ALLOW_SET = new Set([...rawAllow, ...defaults]);

// Minimal root + health for platform checks
app.get("/", (_req, res) => {
  res.type("text/plain").send("SCVPN API OK");
});
app.get("/api/healthz", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// CORS (do NOT apply to the webhook raw body route)
const allowHeaders = "Content-Type, Authorization, Stripe-Signature";
const allowMethods = "GET,POST,OPTIONS";
app.use((req, res, next) => {
  if (req.path === "/api/stripe/webhook") return next(); // leave raw

  const origin = req.headers.origin;
  if (origin && ALLOW_SET.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", allowHeaders);
    res.setHeader("Access-Control-Allow-Methods", allowMethods);
    if (req.method === "OPTIONS") return res.sendStatus(204);
  } else if (req.method === "OPTIONS") {
    // For unknown origins, still answer preflight safely (no credentials)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", allowHeaders);
    res.setHeader("Access-Control-Allow-Methods", allowMethods);
    return res.sendStatus(204);
  }
  next();
});

/* ========= STRIPE / SUPABASE ========= */
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const supabase =
  SCVPN_SUPABASE_URL && SCVPN_SUPABASE_SERVICE_KEY
    ? createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY)
    : null;

const PRICE_MAP = {
  personal: STRIPE_PRICE_PERSONAL,
  gaming: STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS10,
  business50: STRIPE_PRICE_BUSINESS50,
  business250: STRIPE_PRICE_BUSINESS250,
};

const successUrl =
  SCVPN_SUCCESS_URL ||
  (SITE_URL
    ? `${SITE_URL}/pricing?status=success&sid={CHECKOUT_SESSION_ID}`
    : "http://localhost:5173/pricing?status=success&sid={CHECKOUT_SESSION_ID}");

const cancelUrl =
  SCVPN_CANCEL_URL ||
  (SITE_URL
    ? `${SITE_URL}/pricing?status=cancel`
    : "http://localhost:5173/pricing?status=cancel");

/* ========= WEBHOOK (raw body) ========= */
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.error("[webhook] Stripe not configured");
      return res.status(500).send("Stripe not configured");
    }
    const sig = req.headers["stripe-signature"];
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
      switch (event.type) {
        case "checkout.session.completed":
          console.log("[webhook] checkout.session.completed");
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          console.log(`[webhook] ${event.type}`);
          break;
        default:
          break;
      }
      res.json({ received: true });
    } catch (err) {
      console.error("[webhook] signature error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

/* ========= JSON BODY FOR OTHER /api ROUTES ========= */
app.use("/api", express.json());

/* ========= ROUTES ========= */
app.post("/api/checkout", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const { plan_code, customer_email } = req.body || {};
    const price = PRICE_MAP[plan_code];
    if (!price) return res.status(400).json({ error: `Unknown plan_code: ${plan_code}` });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customer_email || undefined,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Example: download a WireGuard config (optional)
app.get("/api/device/:id/config", async (req, res) => {
  try {
    if (!supabase) return res.status(500).send("Supabase not configured");
    const id = req.params.id;

    const { data, error } = await supabase
      .from("devices")
      .select("name, config_text")
      .eq("id", id)
      .single();

    if (error) return res.status(404).send("Device not found");
    if (!data?.config_text) return res.status(404).send("No config available");

    const filename = `wg-${(data.name || id).toString().replace(/[^a-zA-Z0-9_-]/g, "")}.conf`;
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data.config_text);
  } catch (err) {
    console.error("[config] error:", err);
    res.status(500).send("Failed to fetch config");
  }
});

/* ========= ERRORS ========= */
app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ========= START ========= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[scvpn-api] listening on :${PORT}`);
  console.log("Allowed origins:", Array.from(ALLOW_SET));
});
