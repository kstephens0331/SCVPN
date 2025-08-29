// api/server.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ---- Env ----
const {
  PORT = "8080",
  NODE_ENV = "production",
  SITE_URL = "https://www.sacvpn.com",

  // CORS
  ALLOWED_ORIGINS = "https://www.sacvpn.com,https://sacvpn.com,http://localhost:5173,https://scvpn-production.up.railway.app",

  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS250,

  // Supabase (optional here)
  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,
} = process.env;

// ---- Clients ----
const app = Fastify({ logger: true });
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const supabase =
  SCVPN_SUPABASE_URL && SCVPN_SUPABASE_SERVICE_KEY
    ? createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
    : null;

// ---- CORS allow-list ----
const ALLOW = new Set(
  ALLOWED_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

// ---- Early preflight handler (handles ANY /api/* OPTIONS) ----
app.addHook("onRequest", async (req, reply) => {
  // Only guard /api/* paths
  if (!req.url.startsWith("/api/")) return;

  const origin = req.headers.origin;
  const allowOrigin = origin && ALLOW.has(origin) ? origin : undefined;

  // Always reflect allowed origin + vary for cache correctness
  if (allowOrigin) {
    reply.header("Access-Control-Allow-Origin", allowOrigin);
    reply.header("Vary", "Origin");
  }

  // Short-circuit preflight so Railway never 502s OPTIONS
  if (req.method === "OPTIONS") {
    reply
      .header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
      .header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-email")
      // .header("Access-Control-Allow-Credentials", "true") // only if sending cookies
      .code(204)
      .send();
    return reply; // stop pipeline
  }
});

// ---- Normal CORS for non-OPTIONS requests ----
await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin or curl
    if (ALLOW.has(origin)) return cb(null, true);
    cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-email"],
  credentials: false,
});

// ---- Helpers ----
const PRICE_MAP = {
  personal: STRIPE_PRICE_PERSONAL,
  gaming: STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS10,
  business50: STRIPE_PRICE_BUSINESS50,
  business250: STRIPE_PRICE_BUSINESS250,
};

function requireStripe(reply) {
  if (!stripe) {
    reply.code(500).send({ error: "server not configured (stripe key missing)" });
    return false;
  }
  return true;
}

// ---- Routes ----
app.get("/api/healthz", async () => ({ ok: true, env: NODE_ENV, ts: new Date().toISOString() }));

// Simple echo for smoke tests
app.all("/api/echo", async (req) => ({
  ok: true,
  method: req.method,
  origin: req.headers.origin || null,
}));

// Stripe Checkout
app.post("/api/checkout", async (req, reply) => {
  try {
    if (!requireStripe(reply)) return;

    const body = req.body || {};
    const { plan_code, account_type = "personal", quantity = 1, customer_email } = body;

    const price = PRICE_MAP[plan_code];
    if (!price) return reply.code(400).send({ error: "Unknown plan_code" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity }],
      success_url: `${SITE_URL}/post-checkout?status=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?status=cancel`,
      customer_email: customer_email || undefined,
      allow_promotion_codes: true,
      metadata: { plan_code, account_type },
    });

    reply.send({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "[checkout] error");
    reply.code(500).send({ error: "checkout failed" });
  }
});

// ---- Start ----
const port = Number(PORT) || 8080;
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`✅ API listening on 0.0.0.0:${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
