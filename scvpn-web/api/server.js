// server.js (Fastify)
import Fastify from "fastify";
import cors from "@fastify/cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const {
  PORT = 8000,
  NODE_ENV = "production",
  SITE_URL = "https://www.sacvpn.com",

  ALLOWED_ORIGINS = "https://www.sacvpn.com,https://sacvpn.com,http://localhost:5173",

  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS250,

  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,
} = process.env;

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allow = new Set(ALLOWED_ORIGINS.split(",").map(s => s.trim()).filter(Boolean));
    cb(null, allow.has(origin));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-admin-email"],
  // credentials: true, // only if using cookies across sites
});

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const supabase = (SCVPN_SUPABASE_URL && SCVPN_SUPABASE_SERVICE_KEY)
  ? createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
  : null;

const PRICE_MAP = {
  personal: STRIPE_PRICE_PERSONAL,
  gaming: STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS10,
  business50: STRIPE_PRICE_BUSINESS50,
  business250: STRIPE_PRICE_BUSINESS250,
};

app.get("/api/healthz", async () => ({ ok: true, env: NODE_ENV, ts: new Date().toISOString() }));

app.post("/api/checkout", async (req, reply) => {
  try {
    if (!stripe) return reply.code(500).send({ error: "server not configured (stripe)" });
    const { plan, plan_code, account_type, quantity = 1, customer_email } = req.body || {};
    const code = plan_code || plan;
    const price = PRICE_MAP[code];
    if (!price) return reply.code(400).send({ error: "Unknown plan_code" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity }],
      success_url: `${SITE_URL}/post-checkout?status=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?status=cancel`,
      customer_email: customer_email || undefined,
      allow_promotion_codes: true,
      metadata: { plan_code: code, account_type: account_type || "personal" },
    });
    return { url: session.url };
  } catch (err) {
    req.log.error({ err }, "[checkout] error");
    return reply.code(500).send({ error: "checkout failed" });
  }
});

app.get("/api/device/:id/config", async (req, reply) => {
  try {
    if (!supabase) return reply.code(500).send("server not configured (supabase)");
    const id = req.params.id;
    const { data, error } = await supabase
      .from("device_configs").select("config_text, filename")
      .eq("device_id", id).maybeSingle();
    if (error) return reply.code(500).send("db error");
    if (!data) return reply.code(404).send("not found");

    reply.header("Content-Type", "text/plain; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="${data.filename || `device-${id}.conf`}"`);
    return data.config_text || "";
  } catch (err) {
    req.log.error({ err }, "[device config] error");
    return reply.code(500).send("failed");
  }
});

app.post("/api/admin-device", async (req, reply) => {
  try {
    if (!supabase) return reply.code(500).send({ error: "server not configured (supabase)" });
    const adminEmail = req.headers["x-admin-email"];
    if (!adminEmail) return reply.code(401).send({ error: "missing admin email" });

    const { action, deviceId } = req.body || {};
    if (!action || !deviceId) return reply.code(400).send({ error: "missing action/deviceId" });

    const { data: adminRow } = await supabase.from("profiles")
      .select("email,role").eq("email", adminEmail).maybeSingle();
    const role = adminRow?.role || "user";
    if (!["owner","admin"].includes(role)) return reply.code(403).send({ error: "forbidden" });

    if (action === "activate" || action === "suspend") {
      const is_active = action === "activate";
      const { error } = await supabase.from("devices").update({ is_active }).eq("id", deviceId);
      if (error) throw error;
      return { ok: true };
    }

    if (action === "revoke_keys") {
      const { error: e1 } = await supabase.from("device_keys").delete().eq("device_id", deviceId);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("devices").update({ is_active: false }).eq("id", deviceId);
      if (e2) throw e2;
      return { ok: true };
    }

    return reply.code(400).send({ error: "unknown action" });
  } catch (err) {
    req.log.error({ err }, "[admin-device] error");
    return reply.code(500).send({ error: "failed" });
  }
});

// test helper
app.all("/api/echo", async (req) => ({ ok: true, method: req.method, headers: req.headers }));

app.listen({ port: Number(PORT), host: "0.0.0.0" });
