// server.js
import express from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const {
  PORT = 8000,
  SITE_URL = "https://www.sacvpn.com",
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS250,
  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,
} = process.env;

const app = express();

// --- CORS middleware (runs before JSON parser) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [
    "https://sacvpn.com",
    "https://www.sacvpn.com",
    "http://localhost:5173",
    "http://localhost:3000"
  ];

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Stripe-Signature");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

// --- Stripe setup ---
const stripe = new Stripe(STRIPE_SECRET_KEY);
const PRICE_MAP = {
  personal: STRIPE_PRICE_PERSONAL,
  gaming: STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS10,
  business50: STRIPE_PRICE_BUSINESS50,
  business250: STRIPE_PRICE_BUSINESS250,
};

// --- Routes ---
app.get("/api/healthz", (req, res) => res.json({ ok: true }));

app.post("/api/checkout", async (req, res) => {
  try {
    const { plan_code, customer_email } = req.body;
    const price = PRICE_MAP[plan_code];
    if (!price) return res.status(400).json({ error: "Unknown plan" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${SITE_URL}/pricing?status=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?status=cancel`,
      customer_email: customer_email || undefined,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error", err);
    res.status(500).json({ error: "checkout failed" });
  }
});

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API listening on :${PORT}`);
});
