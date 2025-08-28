// server.js — SCVPN API (Express + Stripe)
import express from "express";
import cors from "cors";
import Stripe from "stripe";

// ───────────────────────────────────────────────────────────────────────────────
// ENV
// ───────────────────────────────────────────────────────────────────────────────
const {
  PORT = 8080,
  NODE_ENV,
  // Frontend origin(s)
  SITE_URL,                   // e.g. https://sacvpn.com (preferred)
  ALLOWED_ORIGINS,            // optional CSV of additional origins

  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,      // only needed if you enable the webhook route

  // Optional explicit success/cancel URLs. If unset we build from SITE_URL.
  SCVPN_SUCCESS_URL,
  SCVPN_CANCEL_URL,
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.warn("[boot] STRIPE_SECRET_KEY is not set. /api/checkout will 500.");
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Where we send users after checkout
const siteUrl = SITE_URL || "http://localhost:5173";
const successUrl =
  SCVPN_SUCCESS_URL || `${siteUrl}/post-checkout?status=success&session_id={CHECKOUT_SESSION_ID}`;
const cancelUrl =
  SCVPN_CANCEL_URL || `${siteUrl}/pricing?status=canceled`;

// CORS allowlist
const allowlist = new Set(
  [
    siteUrl,
    "https://sacvpn.com",
    "https://www.sacvpn.com",
    ...(ALLOWED_ORIGINS ? ALLOWED_ORIGINS.split(",").map(s => s.trim()) : []),
  ].filter(Boolean)
);

// ───────────────────────────────────────────────────────────────────────────────
// (Optional) server-side plan map → Stripe Price IDs
// Keep these in sync with your Stripe dashboard (recurring $/mo prices).
// If you prefer sending a priceId directly from the client, this is still useful
// as a safe fallback / validation layer.
// ───────────────────────────────────────────────────────────────────────────────
const PRICE_MAP = {
  personal:        process.env.STRIPE_PRICE_PERSONAL      || "price_xxx_personal",
  gaming:          process.env.STRIPE_PRICE_GAMING        || "price_xxx_gaming",
  business10:      process.env.STRIPE_PRICE_BUSINESS_10   || "price_xxx_b10",
  business50:      process.env.STRIPE_PRICE_BUSINESS_50   || "price_xxx_b50",
  business250:     process.env.STRIPE_PRICE_BUSINESS_250  || "price_xxx_b250",
};

// ───────────────────────────────────────────────────────────────────────────────
// APP
// ───────────────────────────────────────────────────────────────────────────────
const app = express();

// CORS (allow cookies if you ever need them; otherwise leave credentials false)
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / curl / health checks (no Origin header)
      if (!origin) return cb(null, true);
      return cb(null, allowlist.has(origin));
    },
    credentials: false,
  })
);

// JSON for all routes *except* Stripe webhook (that one uses raw)
app.use((req, res, next) => {
  if (req.path === "/api/stripe/webhook") return next();
  express.json()(req, res, next);
});

// Basic liveness routes (prevents “Cannot GET /”)
app.get("/", (_req, res) => {
  res.status(200).type("text/plain").send("SCVPN API is running");
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true, env: NODE_ENV || "development" });
});

// ───────────────────────────────────────────────────────────────────────────────
// POST /api/checkout  →  creates a Stripe Checkout Session
// Request body (JSON):
//   { planId?: string, priceId?: string, quantity?: number, customerEmail?: string }
// - If priceId is provided, it is used directly.
// - Else we look up price via PRICE_MAP[planId].
// ───────────────────────────────────────────────────────────────────────────────
app.post("/api/checkout", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const { planId, priceId, quantity = 1, customerEmail } = req.body || {};

    const resolvedPrice =
      priceId ||
      (planId && PRICE_MAP[planId]);

    if (!resolvedPrice) {
      return res.status(400).json({
        error: "Missing or unknown plan. Provide priceId or a valid planId.",
        received: { planId, priceId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      line_items: [
        { price: resolvedPrice, quantity: Number(quantity) || 1 }
      ],
      // Optional: collect tax, address, etc.
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[/api/checkout] error:", err);
    // Stripe sometimes returns non-JSON bodies; keep the error readable
    return res.status(500).json({ error: "Checkout failed", detail: err?.message || String(err) });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Stripe webhook (optional)
// Keep this *raw* or signature verification will fail.
// Configure endpoint in Stripe dashboard to point to /api/stripe/webhook
// ───────────────────────────────────────────────────────────────────────────────
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.error("[webhook] Stripe not configured");
      return res.status(500).send("Stripe not configured");
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("[webhook] signature verify failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle events you care about
      switch (event.type) {
        case "checkout.session.completed":
          // const session = event.data.object;
          // TODO: provision subscription, record in DB, etc.
          console.log("[webhook] checkout.session.completed");
          break;
        case "invoice.payment_succeeded":
          console.log("[webhook] invoice.payment_succeeded");
          break;
        case "customer.subscription.deleted":
          console.log("[webhook] customer.subscription.deleted");
          break;
        default:
          console.log("[webhook] unhandled event:", event.type);
      }
      return res.status(200).send("ok");
    } catch (err) {
      console.error("[webhook] handler error:", err);
      return res.status(500).send("Webhook handler error");
    }
  }
);

// ───────────────────────────────────────────────────────────────────────────────
// START
// ───────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[scvpn-api] listening on :${PORT}`);
  console.log(`[scvpn-api] Allowed origins:`, [...allowlist].join(", "));
  console.log(`[scvpn-api] Success URL: ${successUrl}`);
  console.log(`[scvpn-api] Cancel URL:  ${cancelUrl}`);
});
