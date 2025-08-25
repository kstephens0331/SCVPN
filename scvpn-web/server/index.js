// server/index.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 8000,
  NODE_ENV,
  // Supabase (service role for server-side actions)
  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,
  SCVPN_ADMIN_EMAIL,
  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS250,
  STRIPE_WEBHOOK_SECRET,
  // Frontend URL for success/cancel
  PUBLIC_SITE_URL,
} = process.env;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

// ---------- Stripe ----------
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Create checkout session
app.post("/api/stripe/checkout", async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    const { planCode, customerEmail } = req.body || {};
    const priceMap = {
      personal: STRIPE_PRICE_PERSONAL,
      gaming: STRIPE_PRICE_GAMING,
      business10: STRIPE_PRICE_BUSINESS10,
      business50: STRIPE_PRICE_BUSINESS50,
      business250: STRIPE_PRICE_BUSINESS250,
    };
    const price = priceMap[planCode];
    if (!price) return res.status(400).json({ error: "Unknown planCode" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [{ price, quantity: 1 }],
      success_url: `${PUBLIC_SITE_URL || "http://localhost:5173"}/?checkout=success`,
      cancel_url: `${PUBLIC_SITE_URL || "http://localhost:5173"}/pricing?checkout=cancel`,
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Webhook (optional now; wire this after Stripe dashboard is set)
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  try {
    if (!STRIPE_WEBHOOK_SECRET || !stripe) return res.sendStatus(200);
    const sig = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    // TODO: handle events (checkout.session.completed, invoice.paid, customer.subscription.*)
    res.sendStatus(200);
  } catch (e) {
    console.error("Webhook error:", e.message);
    res.status(400).send(`Webhook Error: ${e.message}`);
  }
});

// ---------- Admin/device actions (migrated off Supabase Edge) ----------
app.post("/api/admin/device", async (req, res) => {
  try {
    const { action, deviceId } = req.body || {};
    const adminEmail = req.get("x-admin-email") || SCVPN_ADMIN_EMAIL;

    if (!SCVPN_SUPABASE_URL || !SCVPN_SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ error: "Supabase env missing" });
    }
    if (!adminEmail) return res.status(403).json({ error: "Missing admin email" });

    // Example: simple “allowlist” check and action fan-out (replace with your SQL or service logic)
    if (!["activate", "suspend", "revoke_keys"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Example placeholder: do your DB updates or call an internal worker.
    // Here’s a trivial success response to unblock the UI:
    return res.json({ ok: true, deviceId, action });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Admin action failed" });
  }
});

// Device config download (what your Personal dashboard links to)
app.get("/api/device/:id/config", async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: fetch config text from Supabase (qr_codes or wherever you store it) using SERVICE KEY
    const config = `[Interface]
PrivateKey = ...
Address = 10.7.0.2/32
DNS = 1.1.1.1

[Peer]
PublicKey = ...
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="device-${id}.conf"`);
    res.send(config);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to fetch config");
  }
});

// ---------- Static frontend (after build) ----------
const distDir = path.resolve(__dirname, "../dist");
app.use(express.static(distDir));
app.get("*", (_, res) => res.sendFile(path.join(distDir, "index.html")));

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`SCVPN server listening on http://localhost:${PORT}/`);
});
