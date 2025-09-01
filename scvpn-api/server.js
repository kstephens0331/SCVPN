// api/server.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import fastifyRawBody from "fastify-raw-body";

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

// Pin a recent stable API version (optional but helps with consistency)
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

const supabase =
  SCVPN_SUPABASE_URL && SCVPN_SUPABASE_SERVICE_KEY
    ? createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false },
      })
    : null;

// ---- CORS allow-list ----
const ALLOW = new Set(
  (ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

function corsHeaders(origin) {
  const allowOrigin = origin && ALLOW.has(origin) ? origin : null;
  const h = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-email",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
  if (allowOrigin) h["Access-Control-Allow-Origin"] = allowOrigin;
  return { h, allowOrigin };
}

// Preflight for any /api/* (prevents 502 at the edge)
app.options("/api/*", async (req, reply) => {
  const { h, allowOrigin } = corsHeaders(req.headers.origin);
  app.log.info(
    { origin: req.headers.origin, allow: [...ALLOW], matched: !!allowOrigin },
    "preflight"
  );
  reply.headers(h).code(204).send();
});

// Early hook to reflect ACAO on real requests too
app.addHook("onRequest", async (req, reply) => {
  if (!req.url.startsWith("/api/")) return;
  const origin = req.headers.origin;
  if (origin && ALLOW.has(origin)) {
    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    reply
      .header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
      .header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-email")
      .code(204)
      .send();
    return reply;
  }
});

// Normal CORS for non-OPTIONS
await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin/curl
    return cb(null, ALLOW.has(origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-email"],
  credentials: false,
  preflight: true,
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

// mask helper for logs
const mask = (v) => (typeof v === "string" ? v.replace(/^(.{6}).+(.{4})$/, "$1…$2") : v);


 await app.register(fastifyRawBody, {
   field: "rawBody",          // req.rawBody (string)
   global: false,             // only on selected routes
   runFirst: true,            // grab body before any parsers
   encoding: "utf8",
   routes: ["/api/stripe/webhook"],  // enable for this path
 });

// ---- Routes ----
app.get("/api/healthz", async () => ({
  ok: true,
  ts: new Date().toISOString(),
  env: NODE_ENV,
}));

// Config sanity check (SAFE: no secrets leaked)
app.get("/api/debug/config", async () => {
  return {
    ok: true,
    site_url: SITE_URL,
    has_stripe_secret: !!STRIPE_SECRET_KEY,
    stripe_mode: STRIPE_SECRET_KEY?.startsWith("sk_live_")
      ? "live"
      : STRIPE_SECRET_KEY?.startsWith("sk_test_")
      ? "test"
      : "unknown",
    prices: {
      personal: mask(STRIPE_PRICE_PERSONAL || null),
      gaming: mask(STRIPE_PRICE_GAMING || null),
      business10: mask(STRIPE_PRICE_BUSINESS10 || null),
      business50: mask(STRIPE_PRICE_BUSINESS50 || null),
      business250: mask(STRIPE_PRICE_BUSINESS250 || null),
    },
  };
});

// Simple echo for smoke tests
app.all("/api/echo", async (req) => ({ ok: true, method: req.method }));

// Stripe Checkout
app.post("/api/checkout", async (req, reply) => {
  try {
    if (!requireStripe(reply)) return;

    const body = req.body || {};
    const {
      plan_code,
      account_type = "personal",
      quantity = 1,
      customer_email,
    } = body;

    // Log the inputs (safe)
    req.log.info(
      { plan_code, account_type, quantity, has_email: !!customer_email },
      "[checkout] incoming"
    );

    const price = PRICE_MAP[plan_code];
    if (!price) {
      req.log.warn({ plan_code }, "[checkout] unknown plan_code");
      return reply.code(400).send({ error: "Unknown plan_code" });
    }

    // Label used only for metadata / UI
    const PLAN_LABELS = {
      personal: "Personal",
      gaming: "Gaming",
      business10: "Business 10",
      business50: "Business 50",
      business250: "Business 250",
    };
    const plan_label = PLAN_LABELS[plan_code] || plan_code;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity }],
      success_url: `${SITE_URL}/post-checkout?status=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?status=cancel`,
      customer_email: customer_email || undefined,
      allow_promotion_codes: true,
      metadata: {
        plan_code,
        plan_label,
        account_type,
        quantity: String(quantity),
      },
    });

    return reply.send({ url: session.url });
  } catch (err) {
    // This is the key: surface what Stripe is mad about.
    app.log.error(
      {
        message: err?.message,
        type: err?.type,
        code: err?.code,
        param: err?.param,
        raw: err?.raw?.message,
      },
      "[checkout] error"
    );
    return reply.code(500).send({
      error: "checkout failed",
      // Temporary: include a tiny hint to speed us up. Remove later if you prefer.
      hint: err?.message || "stripe error",
    });
  }
});

// ---- Start ----

 app.get("/api/checkout/verify", async (req, reply) => {
  try {
    if (!requireStripe(reply)) return;
    const session_id = req.query.session_id || req.query.sid;
    if (!session_id) return reply.code(400).send({ error: "missing session_id" });

    const s = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["customer", "line_items.data.price.product"]
    });

    const li = s.line_items?.data?.[0];
    reply.send({
      email: s.customer_details?.email || s.customer?.email || null,
      plan_code: s.metadata?.plan_code || null,
      account_type: s.metadata?.account_type || "personal",
      quantity: li?.quantity || 1
    });
  } catch (err) {
    req.log.error({ err }, "[verify] error");
    reply.code(500).send({ error: "verify failed" });
  }
});

app.post("/api/checkout/claim", async (req, reply) => {
  try {
    if (!supabase) return reply.code(500).send({ error: "supabase service not configured" });
    const { session_id } = req.body || {};
    if (!session_id) return reply.code(400).send({ error: "missing session_id" });

    const { data, error } = await supabase.rpc("claim_signup", { session_id });
    if (error) {
      req.log.error({ message: error.message }, "[claim] rpc error");
      return reply.code(400).send({ error: error.message });
    }
    reply.send({ ok: true, data });
  } catch (err) {
    req.log.error({ message: err?.message }, "[claim] error");
    reply.code(500).send({ error: "claim failed" });
  }
});

app.post("/api/stripe/webhook", { config: { rawBody: true } }, async (req, reply) => {
  try {
    if (!requireStripe(reply)) return;

    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      app.log.error("[webhook] STRIPE_WEBHOOK_SECRET missing");
      return reply.code(500).send("Server misconfigured");
    }

    let event;
    try {
      // IMPORTANT: use the raw *string* body for verification
      event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
    } catch (err) {
      app.log.error({ message: err?.message }, "[webhook] verify failed");
      return reply.code(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the events you care about
    switch (event.type) {
      case "checkout.session.completed":
        // TODO: mark user as paid, record plan_code from event.data.object.metadata.plan_code
        app.log.info({ id: event.id }, "[webhook] checkout.session.completed");
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // TODO: sync subscription status to your DB
        app.log.info({ id: event.id, type: event.type }, "[webhook] subscription change");
        break;

      default:
        app.log.info({ type: event.type }, "[webhook] unhandled");
    }

    // Must return 200 quickly so Stripe stops retrying
    return reply.code(200).send({ received: true });
  } catch (err) {
    app.log.error({ message: err?.message }, "[webhook] error");
    return reply.code(500).send("Webhook handler error");
  }
});


// ---- Start ----
const port = Number(process.env.PORT || 8080);
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`✅ API listening on 0.0.0.0:${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
