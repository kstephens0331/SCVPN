// api/server.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import fastifyRawBody from "fastify-raw-body";
import QRCode from "qrcode";
import { WireGuardManager } from "./wireguard-manager.js";
import { EmailService } from "./email-service.js";
import db from "./db.js";
import registerAuthRoutes, { authenticateRequest } from "./auth-routes.js";
import registerUserRoutes from "./user-routes.js";

// ---- Env ----
const {
  PORT = "3000",
  NODE_ENV = "production",
  SITE_URL = "https://www.sacvpn.com",

  // CORS
  ALLOWED_ORIGINS = "https://www.sacvpn.com,https://sacvpn.com,http://localhost:5173,http://localhost:1420,tauri://localhost,https://tauri.localhost,http://tauri.localhost",

  // Stripe
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_PERSONAL,
  STRIPE_PRICE_GAMING,
  STRIPE_PRICE_BUSINESS10,
  STRIPE_PRICE_BUSINESS50,
  STRIPE_PRICE_BUSINESS100,

  // Supabase (kept temporarily for lazy password migration)
  SCVPN_SUPABASE_URL,
  SCVPN_SUPABASE_SERVICE_KEY,
  STRIPE_WEBHOOK_SECRET,

  // JWT Auth
  JWT_SECRET,

  // Email (SendGrid)
  SENDGRID_API_KEY,

  // Admin emails (comma-separated)
  ADMIN_EMAILS: ADMIN_EMAILS_ENV = "info@stephenscode.dev",
} = process.env;

// Admin email set for fast lookups
const ADMIN_EMAILS = new Set(
  (ADMIN_EMAILS_ENV || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
);

// ---- Helpers / constants used later ----
const PRICE_MAP = {
  personal: STRIPE_PRICE_PERSONAL,
  gaming: STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS10,
  business50: STRIPE_PRICE_BUSINESS50,
  business100: STRIPE_PRICE_BUSINESS100,
};
const mask = (v) => (typeof v === "string" ? v.replace(/^(.{6}).+(.{4})$/, "$1…$2") : v);

async function init() {
  // ---- Clients ----
  const app = Fastify({ logger: true });

  const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
    : null;

  // Supabase client — auth only (JWT verification)
  const supabase =
    SCVPN_SUPABASE_URL && SCVPN_SUPABASE_SERVICE_KEY
      ? createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY, {
          auth: { persistSession: false },
        })
      : null;

  // Initialize WireGuard Manager with pg pool
  const wgManager = new WireGuardManager(db, app.log);

  // Initialize Email Service with SendGrid
  const emailService = new EmailService(SENDGRID_API_KEY, app.log);

  // ---- CORS allow-list ----
  const ALLOW = new Set(
    (ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  app.log.info({
    allowedOrigins: Array.from(ALLOW),
    rawEnvVar: ALLOWED_ORIGINS
  }, "CORS configuration initialized");

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
      const isAllowed = ALLOW.has(origin);
      if (!isAllowed) {
        app.log.warn({ origin, allowedOrigins: Array.from(ALLOW) }, "CORS: Origin not allowed");
      }
      return cb(null, isAllowed);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-email"],
    credentials: false,
    preflight: true,
  });

  // raw body for Stripe webhook verification
  await app.register(fastifyRawBody, { field: "rawBody", global: false, routes: ["/api/stripe/webhook"] });

  function requireStripe(reply) {
    if (!stripe) {
      reply.code(500).send({ error: "server not configured (stripe key missing)" });
      return false;
    }
    return true;
  }

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
        business100: mask(STRIPE_PRICE_BUSINESS100 || null),
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
        billing_period = "monthly",
        stripe_price_id,
        account_type = "personal",
        quantity = 1,
        customer_email,
      } = body;

      req.log.info(
        { plan_code, billing_period, account_type, quantity, has_email: !!customer_email },
        "[checkout] incoming"
      );

      let price = stripe_price_id;
      if (!price) {
        price = PRICE_MAP[plan_code];
        if (!price) {
          req.log.warn({ plan_code }, "[checkout] unknown plan_code");
          return reply.code(400).send({ error: "Unknown plan_code" });
        }
      }

      const PLAN_LABELS = {
        personal: "Personal",
        gaming: "Gaming",
        business10: "Business 10",
        business50: "Business 50",
        business100: "Business 100",
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
          billing_period,
          account_type,
          quantity: String(quantity),
        },
        subscription_data: {
          metadata: {
            plan_code,
            plan_label,
            billing_period,
            account_type,
            quantity: String(quantity),
          },
        },
      });

      return reply.send({ url: session.url });
    } catch (err) {
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
        hint: err?.message || "stripe error",
      });
    }
  });

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
      if (!requireStripe(reply)) return;

      const {
        session_id,
        email,
        plan_code,
        account_type = "personal",
        quantity = 1,
      } = req.body || {};

      if (!session_id) return reply.code(400).send({ error: "missing session_id" });
      if (!email)      return reply.code(400).send({ error: "missing email" });

      // 1) Get user ID from email
      const { rows: [profile] } = await db.query(
        'SELECT id FROM profiles WHERE email = $1 LIMIT 1',
        [email]
      );

      if (!profile) {
        return reply.code(404).send({ error: "User not found. Please sign up first." });
      }

      const userId = profile.id;

      // 2) Claim checkout session
      const { rows: [updatedSession] } = await db.query(
        'UPDATE checkout_sessions SET claimed_email = $1, claimed_at = $2 WHERE id = $3 AND claimed_email IS NULL RETURNING *',
        [email, new Date().toISOString(), session_id]
      );

      // If not found, create it
      if (!updatedSession) {
        await db.query(
          `INSERT INTO checkout_sessions (id, email, plan_code, account_type, quantity, created_at, claimed_email, claimed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET claimed_email = $7, claimed_at = $8`,
          [session_id, email, plan_code || null, account_type, Number(quantity || 1),
           new Date().toISOString(), email, new Date().toISOString()]
        );
      }

      // 3) Get Stripe checkout session to find subscription
      const stripeSession = await stripe.checkout.sessions.retrieve(session_id);

      if (!stripeSession.subscription) {
        app.log.warn({ session_id }, "[claim] No subscription found in Stripe session");
        return reply.send({ ok: true, warning: "No subscription found" });
      }

      // 4) Get subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(stripeSession.subscription);

      // 5) Update Stripe subscription metadata with user_id
      await stripe.subscriptions.update(subscription.id, {
        metadata: {
          ...subscription.metadata,
          user_id: userId,
        }
      });

      // 6) Create/update subscription in our database
      const now = new Date().toISOString();
      const subscriptionData = {
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        user_id: userId,
        plan: plan_code || "unknown",
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        renews_at: subscription.cancel_at_period_end ? null : new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: now,
        updated_at: now,
      };

      app.log.info({ subscriptionData }, "[claim] Attempting to save subscription");

      // Check if subscription already exists
      const { rows: [existingSub] } = await db.query(
        'SELECT id FROM subscriptions WHERE stripe_subscription_id = $1 LIMIT 1',
        [subscription.id]
      );

      let subData;

      try {
        if (existingSub) {
          // Update existing subscription
          const { rows } = await db.query(
            `UPDATE subscriptions SET stripe_customer_id = $1, user_id = $2, plan = $3, status = $4,
             current_period_start = $5, current_period_end = $6, renews_at = $7, updated_at = $8
             WHERE stripe_subscription_id = $9 RETURNING *`,
            [subscriptionData.stripe_customer_id, subscriptionData.user_id, subscriptionData.plan,
             subscriptionData.status, subscriptionData.current_period_start, subscriptionData.current_period_end,
             subscriptionData.renews_at, subscriptionData.updated_at, subscription.id]
          );
          subData = rows;
        } else {
          // Insert new subscription
          const { rows } = await db.query(
            `INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id, plan, status,
             current_period_start, current_period_end, renews_at, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [subscriptionData.stripe_subscription_id, subscriptionData.stripe_customer_id,
             subscriptionData.user_id, subscriptionData.plan, subscriptionData.status,
             subscriptionData.current_period_start, subscriptionData.current_period_end,
             subscriptionData.renews_at, subscriptionData.created_at, subscriptionData.updated_at]
          );
          subData = rows;
        }
      } catch (dbErr) {
        app.log.error({ error: dbErr.message }, "[claim] Failed to save subscription");
        return reply.code(500).send({
          error: "Failed to save subscription",
          details: dbErr.message
        });
      }

      app.log.info({ userId, subId: subscription.id, plan: plan_code, subData }, "[claim] Subscription linked to user");

      // Resolve plan display name
      const planNames = {
        personal: 'Personal',
        gaming: 'Gaming',
        business10: 'Business 10',
        business50: 'Business 50',
        business100: 'Business 100',
        business500: 'Business 500',
        business1k: 'Business 1K',
        business2500: 'Business 2.5K',
        business5k: 'Business 5K',
        business10k: 'Business 10K',
        enterprise: 'Enterprise Custom'
      };
      const planName = planNames[plan_code] || plan_code || 'VPN';

      // Send welcome email with download link
      try {
        await emailService.sendWelcomeEmail({
          userEmail: email,
          userName: email.split('@')[0],
          planCode: plan_code,
          planName: planName
        });
        app.log.info({ email, plan: plan_code }, "[claim] Welcome email sent");
      } catch (emailErr) {
        app.log.error({ emailErr }, "[claim] Failed to send welcome email");
      }

      // Send admin notification about new signup
      try {
        await emailService.sendAdminNotification({
          userEmail: email,
          planCode: plan_code,
          planName: planName
        });
        app.log.info({ email, plan: plan_code }, "[claim] Admin notification sent");
      } catch (notifyErr) {
        app.log.error({ notifyErr }, "[claim] Failed to send admin notification");
      }

      return reply.send({ ok: true, subscription_id: subscription.id });
    } catch (err) {
      app.log.error({ err }, "[claim] error");
      reply.code(500).send({ error: "claim failed" });
    }
  });

  // Billing management - redirect to Stripe Customer Portal
  app.get("/api/billing/manage", async (req, reply) => {
    try {
      if (!requireStripe(reply)) return;

      // Verify JWT token
      const decoded = authenticateRequest(req, JWT_SECRET);
      if (!decoded) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const user = { id: decoded.sub, email: decoded.email };

      // Find customer's Stripe customer ID from subscriptions table
      const { rows: [sub] } = await db.query(
        'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 LIMIT 1',
        [user.id]
      );

      if (!sub?.stripe_customer_id) {
        return reply.code(404).send({ error: "No active subscription found" });
      }

      // Create Stripe Customer Portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: `${SITE_URL}/app/personal/billing`,
      });

      // Redirect to Stripe Portal
      return reply.redirect(303, session.url);
    } catch (err) {
      req.log.error({ err }, "[billing/manage] error");
      return reply.code(500).send({ error: "Failed to create billing portal session" });
    }
  });

  app.post("/api/stripe/webhook", { config: { rawBody: true } }, async (req, reply) => {
    try {
      if (!requireStripe(reply)) return;

      const sig = req.headers["stripe-signature"];
      const secret = STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        app.log.error("[webhook] STRIPE_WEBHOOK_SECRET missing");
        return reply.code(500).send("Server misconfigured");
      }

      app.log.info({
        hasRawBody: !!req.rawBody,
        rawBodyType: typeof req.rawBody,
        rawBodyLength: req.rawBody?.length || 0,
        hasSig: !!sig,
        sigLength: sig?.length || 0,
        hasSecret: !!secret,
        secretLength: secret?.length || 0,
      }, "[webhook] Debug: raw body info");

      let event;
      try {
        const rawBody = req.rawBody;

        if (!rawBody) {
          app.log.error("[webhook] rawBody is missing - check fastifyRawBody plugin");
          return reply.code(400).send("Webhook Error: Raw body not captured");
        }

        event = stripe.webhooks.constructEvent(rawBody, sig, secret);
      } catch (err) {
        app.log.error({
          message: err?.message,
          rawBodyType: typeof req.rawBody,
          rawBodyIsBuffer: Buffer.isBuffer(req.rawBody),
        }, "[webhook] verify failed");
        return reply.code(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the events you care about
      switch (event.type) {
        case "checkout.session.completed": {
          const s = event.data.object;
          const qty = Number(s.metadata?.quantity) || s?.line_items?.data?.[0]?.quantity || 1;
          try {
            await db.query(
              `INSERT INTO checkout_sessions (id, email, plan_code, billing_period, account_type, quantity, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (id) DO UPDATE SET email = $2, plan_code = $3, billing_period = $4, account_type = $5, quantity = $6`,
              [s.id, s.customer_details?.email || null, s.metadata?.plan_code || null,
               s.metadata?.billing_period || "monthly", s.metadata?.account_type || "personal",
               qty, new Date().toISOString()]
            );
          } catch (dbErr) {
            app.log.error({ error: dbErr.message }, "[webhook] upsert checkout_sessions failed");
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object;
          const userId = sub.metadata?.user_id;

          if (!userId) {
            app.log.warn({ subId: sub.id }, "[webhook] subscription missing user_id metadata");
            break;
          }

          if (!sub.current_period_start || !sub.current_period_end) {
            app.log.warn({ subId: sub.id }, "[webhook] subscription missing period timestamps");
            break;
          }

          try {
            await db.query(
              `INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id, plan, status,
               current_period_start, current_period_end, renews_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (stripe_subscription_id) DO UPDATE SET
               stripe_customer_id = $2, user_id = $3, plan = $4, status = $5,
               current_period_start = $6, current_period_end = $7, renews_at = $8, updated_at = $9`,
              [sub.id, sub.customer, userId, sub.metadata?.plan_code || "unknown", sub.status,
               new Date(sub.current_period_start * 1000).toISOString(),
               new Date(sub.current_period_end * 1000).toISOString(),
               sub.cancel_at_period_end ? null : new Date(sub.current_period_end * 1000).toISOString(),
               new Date().toISOString()]
            );
            app.log.info({ subId: sub.id, userId, status: sub.status }, "[webhook] subscription saved");
          } catch (dbErr) {
            app.log.error({ error: dbErr.message, subId: sub.id }, "[webhook] upsert subscription failed");
          }
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object;
          try {
            await db.query(
              'UPDATE subscriptions SET status = $1, renews_at = $2, updated_at = $3 WHERE stripe_subscription_id = $4',
              ["canceled", null, new Date().toISOString(), sub.id]
            );
            app.log.info({ subId: sub.id }, "[webhook] subscription canceled");
          } catch (dbErr) {
            app.log.error({ error: dbErr.message, subId: sub.id }, "[webhook] cancel subscription failed");
          }
          break;
        }
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

  // ---- WireGuard API Endpoints ----

  // Generate WireGuard key immediately for a device (called from frontend)
  app.post("/api/wireguard/generate-key", async (req, reply) => {
    try {
      app.log.info({ body: req.body }, "[generate-key] ENDPOINT HIT - Request received");

      if (!wgManager) {
        app.log.error("[generate-key] WireGuard manager not initialized");
        return reply.code(500).send({ error: "WireGuard manager not initialized" });
      }

      const { device_id } = req.body || {};
      if (!device_id) {
        app.log.warn("[generate-key] Missing device_id in request");
        return reply.code(400).send({ error: "Missing device_id" });
      }

      // Verify JWT token
      const decoded = authenticateRequest(req, JWT_SECRET);
      if (!decoded) {
        app.log.warn("[generate-key] Unauthorized - invalid token");
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const user = { id: decoded.sub, email: decoded.email };

      app.log.info({ userId: user.id, deviceId: device_id }, "[generate-key] User authenticated");

      // Verify device belongs to user
      const { rows: [device] } = await db.query(
        'SELECT id, name, platform, user_id FROM devices WHERE id = $1 AND user_id = $2 LIMIT 1',
        [device_id, user.id]
      );

      if (!device) {
        app.log.warn({ device_id }, "[generate-key] Device not found");
        return reply.code(404).send({ error: "Device not found or access denied" });
      }

      // Generate WireGuard config
      app.log.info({ deviceId: device_id, userId: user.id, deviceName: device.name }, "[generate-key] Starting WireGuard key generation");

      const result = await wgManager.generateDeviceConfig(
        device_id,
        user.id,
        null // Let system choose best node
      );

      app.log.info({ configId: result.config.id, nodeId: result.config.node_id }, "[generate-key] Key generation completed successfully");

      // Send email with config and QR code
      try {
        const QRCode = (await import('qrcode')).default;
        const qrCodeDataURL = await QRCode.toDataURL(result.wgConfig, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 400,
          margin: 2
        });

        // Get user profile for email
        const { rows: [profile] } = await db.query(
          'SELECT email, full_name FROM profiles WHERE id = $1 LIMIT 1',
          [user.id]
        );

        if (profile?.email && emailService) {
          const emailResult = await emailService.sendVPNSetupEmail({
            userEmail: profile.email,
            userName: profile.full_name || profile.email.split('@')[0],
            deviceName: device.name || 'Your Device',
            wgConfig: result.wgConfig,
            qrCodeDataURL,
            platform: device.platform
          });

          if (emailResult.success) {
            req.log.info({ userId: user.id, email: profile.email, messageId: emailResult.messageId }, "VPN setup email sent");
          } else {
            req.log.warn({ userId: user.id, error: emailResult.error }, "Failed to send email");
          }
        }
      } catch (emailError) {
        req.log.warn({ error: emailError.message }, "Email send failed, but keys generated successfully");
      }

      return reply.send({
        success: true,
        message: "WireGuard keys generated successfully. Check your email for setup instructions.",
        config_id: result.config.id
      });

    } catch (error) {
      const errorDetails = {
        error: error.message,
        stack: error.stack,
        deviceId: req.body?.device_id,
        errorName: error.name,
        errorCode: error.code,
        sshPasswordConfigured: !!process.env.VPN_NODE_SSH_PASSWORD,
        sshKeyPathConfigured: !!process.env.VPN_NODE_SSH_KEY_PATH
      };

      app.log.error(errorDetails, "[generate-key] FAILED to generate WireGuard key");

      return reply.code(500).send({
        error: error.message || "Failed to generate keys",
        details: {
          type: error.name,
          sshConfigured: !!process.env.VPN_NODE_SSH_PASSWORD || !!process.env.VPN_NODE_SSH_KEY_PATH,
          hint: error.message?.includes('SSH') || error.message?.includes('timeout')
            ? 'SSH connection to VPN node failed. Check SSH settings.'
            : error.message?.includes('No available')
            ? 'All VPN nodes are at capacity or offline.'
            : 'Check server logs for detailed error information.'
        }
      });
    }
  });

  // Process key requests (background job or manual trigger)
  app.post("/api/wireguard/process-requests", async (req, reply) => {
    try {
      if (!wgManager) {
        return reply.code(500).send({ error: "WireGuard manager not initialized" });
      }

      const { rows: requests } = await db.query(
        `SELECT kr.*, d.id AS device_db_id, d.name AS device_name, d.platform AS device_platform, d.user_id AS device_user_id
         FROM key_requests kr
         LEFT JOIN devices d ON kr.device_id = d.id
         WHERE kr.status = 'pending'
         ORDER BY kr.requested_at ASC
         LIMIT 10`
      );

      // Reshape to match nested format the code expects
      for (const r of requests) {
        r.devices = { id: r.device_db_id, name: r.device_name, platform: r.device_platform, user_id: r.device_user_id };
      }

      const results = [];

      for (const request of requests || []) {
        try {
          // Mark as processing
          await db.query(
            'UPDATE key_requests SET status = $1, processed_at = $2 WHERE id = $3',
            ["processing", new Date().toISOString(), request.id]
          );

          // Generate device config
          const result = await wgManager.generateDeviceConfig(
            request.device_id,
            request.user_id,
            request.preferred_node_id
          );

          // Mark as completed
          await db.query(
            'UPDATE key_requests SET status = $1, completed_at = $2 WHERE id = $3',
            ["completed", new Date().toISOString(), request.id]
          );

          // Send email notification with QR code
          try {
            const qrCodeDataURL = await QRCode.toDataURL(result.wgConfig, {
              errorCorrectionLevel: 'M',
              type: 'image/png',
              width: 400,
              margin: 2
            });

            // Get user email from profiles
            const { rows: [profile] } = await db.query(
              'SELECT email, full_name FROM profiles WHERE id = $1 LIMIT 1',
              [request.user_id]
            );

            if (profile?.email) {
              await emailService.sendVPNSetupEmail({
                userEmail: profile.email,
                userName: profile.full_name,
                deviceName: request.devices?.name || 'Your Device',
                wgConfig: result.wgConfig,
                qrCodeDataURL,
                platform: request.devices?.platform
              });
              req.log.info({ userId: request.user_id, email: profile.email }, "Setup email sent");
            }
          } catch (emailError) {
            req.log.warn({ error: emailError }, "Failed to send email, but key generation succeeded");
          }

          results.push({
            request_id: request.id,
            device_id: request.device_id,
            status: "completed"
          });

          req.log.info({ requestId: request.id, deviceId: request.device_id }, "Key request processed");
        } catch (error) {
          // Mark as failed
          await db.query(
            'UPDATE key_requests SET status = $1, error_message = $2, processed_at = $3 WHERE id = $4',
            ["failed", error.message, new Date().toISOString(), request.id]
          );

          results.push({
            request_id: request.id,
            device_id: request.device_id,
            status: "failed",
            error: error.message
          });

          req.log.error({ error, requestId: request.id }, "Failed to process key request");
        }
      }

      return reply.send({
        success: true,
        processed: results.length,
        results
      });

    } catch (error) {
      req.log.error({ error }, "Error processing key requests");
      return reply.code(500).send({ error: "Failed to process key requests" });
    }
  });

  // Download device config
  app.get("/api/device/:deviceId/config", async (req, reply) => {
    try {
      if (!wgManager) {
        return reply.code(500).send({ error: "WireGuard manager not initialized" });
      }

      const { deviceId } = req.params;

      // Get full config with node details via JOIN (replaces Supabase RPC + nested select)
      const { rows: [row] } = await db.query(
        `SELECT dc.*, d.name AS device_name, d.platform AS device_platform,
                vn.name AS node_name, vn.public_ip AS node_public_ip, vn.port AS node_port, vn.public_key AS node_public_key
         FROM device_configs dc
         LEFT JOIN devices d ON dc.device_id = d.id
         LEFT JOIN vpn_nodes vn ON dc.node_id = vn.id
         WHERE dc.device_id = $1 AND dc.is_active = true
         LIMIT 1`,
        [deviceId]
      );

      if (!row) {
        return reply.code(404).send({ error: "Configuration not found" });
      }

      // Reshape to match nested format
      const fullConfig = row;
      fullConfig.devices = { name: row.device_name, platform: row.device_platform };
      fullConfig.vpn_nodes = { name: row.node_name, public_ip: row.node_public_ip, port: row.node_port, public_key: row.node_public_key };

      // Generate WireGuard config file content
      const wgConfig = wgManager.generateWireGuardConfig(fullConfig, fullConfig.vpn_nodes);

      // Return as downloadable file
      const deviceName = (fullConfig.devices?.name || `device-${deviceId}`).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${deviceName}_sacvpn.conf`;

      return reply
        .header('Content-Type', 'text/plain')
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(wgConfig);

    } catch (error) {
      req.log.error({ error, deviceId: req.params.deviceId }, "Error getting device config");
      return reply.code(500).send({ error: "Failed to get device config" });
    }
  });

  // Get device config data with QR code (for frontend display)
  app.get("/api/device/:deviceId/config-data", async (req, reply) => {
    try {
      if (!wgManager) {
        return reply.code(500).send({ error: "WireGuard manager not initialized" });
      }

      const { deviceId } = req.params;

      // Get full config from database with joins
      const { rows: [row] } = await db.query(
        `SELECT dc.*, d.name AS device_name, d.platform AS device_platform,
                vn.name AS node_name, vn.public_ip AS node_public_ip, vn.port AS node_port,
                vn.public_key AS node_public_key, vn.region AS node_region
         FROM device_configs dc
         LEFT JOIN devices d ON dc.device_id = d.id
         LEFT JOIN vpn_nodes vn ON dc.node_id = vn.id
         WHERE dc.device_id = $1 AND dc.is_active = true
         LIMIT 1`,
        [deviceId]
      );

      if (!row) {
        return reply.code(404).send({ error: "Configuration not found" });
      }

      // Reshape to match nested format
      const fullConfig = row;
      fullConfig.devices = { name: row.device_name, platform: row.device_platform };
      fullConfig.vpn_nodes = { name: row.node_name, public_ip: row.node_public_ip, port: row.node_port, public_key: row.node_public_key, region: row.node_region };

      // Generate WireGuard config text
      const wgConfig = wgManager.generateWireGuardConfig(fullConfig, fullConfig.vpn_nodes);

      // Generate QR code
      const qrCode = await QRCode.toDataURL(wgConfig, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 400,
        margin: 2
      });

      return reply.send({
        deviceName: fullConfig.devices?.name || 'Device',
        platform: fullConfig.devices?.platform || 'unknown',
        nodeName: fullConfig.vpn_nodes?.name || 'VPN Node',
        nodeRegion: fullConfig.vpn_nodes?.region || 'unknown',
        clientIp: fullConfig.client_ip,
        serverIp: fullConfig.vpn_nodes?.public_ip,
        configText: wgConfig,
        qrCode: qrCode,
        createdAt: fullConfig.created_at
      });

    } catch (error) {
      req.log.error({ error, deviceId: req.params.deviceId }, "Error getting config data");
      return reply.code(500).send({ error: "Failed to get config data" });
    }
  });

  // Public node status for frontend
  app.get("/api/wireguard/nodes", async (req, reply) => {
    try {
      const { rows: nodes } = await db.query(
        'SELECT id, name, region, public_ip, current_clients, max_clients, is_active, is_healthy FROM vpn_nodes WHERE is_active = true ORDER BY name'
      );

      return reply.send({ nodes: nodes || [] });

    } catch (error) {
      req.log.error({ error }, "Error getting VPN nodes");
      return reply.code(500).send({ error: "Failed to get VPN nodes" });
    }
  });

  // Admin endpoint: Manual key generation
  app.post("/api/admin/wireguard/generate-key", async (req, reply) => {
    try {
      // Check admin authentication
      const adminEmail = req.headers['x-admin-email'];
      if (!adminEmail) {
        return reply.code(401).send({ error: "Admin authentication required" });
      }

      const { rows: [isAdmin] } = await db.query(
        'SELECT email FROM admin_emails WHERE email = $1 LIMIT 1',
        [adminEmail]
      );

      if (!isAdmin) {
        return reply.code(403).send({ error: "Admin access required" });
      }

      if (!wgManager) {
        return reply.code(500).send({ error: "WireGuard manager not initialized" });
      }

      const { deviceId, userId, nodeId } = req.body || {};

      if (!deviceId || !userId) {
        return reply.code(400).send({ error: "deviceId and userId required" });
        }

      const result = await wgManager.generateDeviceConfig(deviceId, userId, nodeId);

      return reply.send({
        success: true,
        config_id: result.config.id,
        node_id: result.config.node_id,
        client_ip: result.config.client_ip
      });

    } catch (error) {
      req.log.error({ error }, "Error generating admin key");
      return reply.code(500).send({ error: error.message });
    }
  });

  // Admin endpoint: Device actions (activate, suspend, revoke_keys)
  app.post("/api/admin-device", async (req, reply) => {
    try {
      // Check admin authentication
      const adminEmail = req.headers['x-admin-email'];
      if (!adminEmail) {
        return reply.code(401).send({ error: "Admin authentication required" });
      }

      const { rows: [isAdmin] } = await db.query(
        'SELECT email FROM admin_emails WHERE email = $1 LIMIT 1',
        [adminEmail]
      );

      if (!isAdmin) {
        return reply.code(403).send({ error: "Admin access required" });
      }

      const { action, deviceId } = req.body || {};

      if (!action || !deviceId) {
        return reply.code(400).send({ error: "action and deviceId required" });
      }

      // Get device details
      const { rows: [device] } = await db.query(
        'SELECT id, user_id, org_id, is_active FROM devices WHERE id = $1 LIMIT 1',
        [deviceId]
      );

      if (!device) {
        return reply.code(404).send({ error: "Device not found" });
      }

      if (action === "activate") {
        // Generate new WireGuard keys for this device
        if (!wgManager) {
          return reply.code(500).send({ error: "WireGuard manager not initialized" });
        }

        // First check if device already has active config
        const { rows: [existingConfig] } = await db.query(
          'SELECT id, is_active FROM device_configs WHERE device_id = $1 ORDER BY created_at DESC LIMIT 1',
          [deviceId]
        );

        if (existingConfig?.is_active) {
          // Deactivate old config first
          await wgManager.removeDeviceConfig(deviceId);
        }

        // Generate new config
        const result = await wgManager.generateDeviceConfig(deviceId, device.user_id);

        // Activate the device
        await db.query(
          'UPDATE devices SET is_active = true, updated_at = $1 WHERE id = $2',
          [new Date().toISOString(), deviceId]
        );

        req.log.info({ deviceId, adminEmail }, "Device activated with new keys");

        return reply.send({
          success: true,
          message: "Device activated with new keys",
          config_id: result.config.id,
          node_id: result.config.node_id,
          client_ip: result.config.client_ip
        });

      } else if (action === "suspend") {
        // Suspend device access (deactivate but keep configs)
        await db.query(
          'UPDATE devices SET is_active = false, updated_at = $1 WHERE id = $2',
          [new Date().toISOString(), deviceId]
        );

        // Deactivate all device configs
        await db.query(
          'UPDATE device_configs SET is_active = false, deactivated_at = $1 WHERE device_id = $2',
          [new Date().toISOString(), deviceId]
        );

        req.log.info({ deviceId, adminEmail }, "Device suspended");

        return reply.send({
          success: true,
          message: "Device suspended"
        });

      } else if (action === "revoke_keys") {
        // Revoke all keys and remove from WireGuard nodes
        if (!wgManager) {
          return reply.code(500).send({ error: "WireGuard manager not initialized" });
        }

        // Remove device config from WireGuard
        try {
          await wgManager.removeDeviceConfig(deviceId);
        } catch (err) {
          req.log.warn({ err, deviceId }, "Failed to remove device from WireGuard node (may already be removed)");
        }

        // Delete all device configs
        await db.query('DELETE FROM device_configs WHERE device_id = $1', [deviceId]);

        // Deactivate device
        await db.query(
          'UPDATE devices SET is_active = false, updated_at = $1 WHERE id = $2',
          [new Date().toISOString(), deviceId]
        );

        req.log.info({ deviceId, adminEmail }, "Device keys revoked");

        return reply.send({
          success: true,
          message: "All keys revoked and device deactivated"
        });

      } else {
        return reply.code(400).send({ error: "Invalid action. Use: activate, suspend, or revoke_keys" });
      }

    } catch (error) {
      req.log.error({ error }, "Error in admin device action");
      return reply.code(500).send({ error: error.message });
    }
  });

  // Health check endpoint that includes WireGuard status
  app.get("/api/wireguard/health", async (req, reply) => {
    try {
      const health = {
        wg_manager: !!wgManager,
        database: !!db,
        timestamp: new Date().toISOString()
      };

      if (wgManager && db) {
        const { rows: [deviceCount] } = await db.query(
          'SELECT COUNT(*)::int AS count FROM device_configs WHERE is_active = true'
        );

        const { rows: [nodeCount] } = await db.query(
          'SELECT COUNT(*)::int AS count FROM vpn_nodes WHERE is_active = true'
        );

        health.stats = {
          active_devices: deviceCount?.count || 0,
          active_nodes: nodeCount?.count || 0
        };
      }

      return reply.send(health);

    } catch (error) {
      req.log.error({ error }, "Error checking WireGuard health");
      return reply.code(500).send({ error: "Health check failed" });
    }
  });

  // SSH diagnostic endpoint - tests SSH connectivity to VPN nodes
  app.get("/api/wireguard/diagnose-ssh", async (req, reply) => {
    try {
      const sshKeyEnv = process.env.VPN_NODE_SSH_KEY;
      const results = {
        timestamp: new Date().toISOString(),
        ssh_password_configured: !!process.env.VPN_NODE_SSH_PASSWORD,
        ssh_key_path_configured: !!process.env.VPN_NODE_SSH_KEY_PATH,
        ssh_key_env_configured: !!sshKeyEnv,
        ssh_key_env_length: sshKeyEnv?.length || 0,
        ssh_key_env_starts_with: sshKeyEnv?.substring(0, 30) || null,
        ssh_key_env_has_newlines: sshKeyEnv?.includes('\n') || false,
        ssh_key_env_has_literal_newlines: sshKeyEnv?.includes('\\n') || false,
        nodes: []
      };

      // Get all active nodes
      const { rows: nodes } = await db.query(
        'SELECT id, name, public_ip, ssh_host, ssh_user, ssh_port, ssh_password, management_type, interface_name FROM vpn_nodes WHERE is_active = true'
      );

      for (const node of nodes || []) {
        const nodeResult = {
          name: node.name,
          ssh_connection: `${node.ssh_user || 'root'}@${node.ssh_host || node.public_ip}:${node.ssh_port || 22}`,
          management_type: node.management_type,
          interface_name: node.interface_name,
          has_ssh_host: !!node.ssh_host,
          has_ssh_user: !!node.ssh_user,
          ssh_test: null,
          wg_show_test: null
        };

        // Test SSH connectivity with a simple command
        if (wgManager && node.management_type === 'ssh') {
          try {
            const sshResult = await wgManager.executeSSHCommand(node, 'echo SSH_OK');
            nodeResult.ssh_test = {
              success: true,
              output: sshResult.trim()
            };

            // Test WireGuard show command
            try {
              const useSudo = node.ssh_user && node.ssh_user !== 'root';
              const wgCmd = useSudo ? 'sudo wg show' : 'wg show';
              const wgResult = await wgManager.executeSSHCommand(node, wgCmd);
              nodeResult.wg_show_test = {
                success: true,
                output: wgResult.substring(0, 500)
              };
            } catch (wgErr) {
              nodeResult.wg_show_test = {
                success: false,
                error: wgErr.message
              };
            }
          } catch (sshErr) {
            nodeResult.ssh_test = {
              success: false,
              error: sshErr.message
            };
          }
        }

        results.nodes.push(nodeResult);
      }

      return reply.send(results);

    } catch (error) {
      req.log.error({ error }, "Error diagnosing SSH");
      return reply.code(500).send({ error: error.message });
    }
  });

  // Device requests a key (keep: unique route)
  app.post("/api/device/:id/request-key", async (req, reply) => {
    try {
      if (!wgManager) return reply.code(500).send({ error: "wireguard not configured" });
      const deviceId = req.params.id;
      const { user_id, node_id } = req.body || {};
      if (!user_id) return reply.code(400).send({ error: "missing user_id" });

      const { config, wgConfig } = await wgManager.generateDeviceConfig(deviceId, user_id, node_id || null);
      return reply.send({ ok: true, config, wgConfig });
    } catch (err) {
      req.log.error({ err }, "[device/request-key] failed");
      return reply.code(500).send({ error: "provisioning failed" });
    }
  });

  // ---- Register auth & user data routes ----
  registerAuthRoutes(app, { db, emailService, supabase, JWT_SECRET, ADMIN_EMAILS, SITE_URL });
  registerUserRoutes(app, { db, JWT_SECRET, ADMIN_EMAILS });

  // ---- Start ----
  const port = Number(PORT || 3000);

  // Initialize WireGuard manager
  try {
    await wgManager.initialize();
    app.log.info("WireGuard manager initialized");
  } catch (err) {
    app.log.error({ error: err }, "Failed to initialize WireGuard manager");
  }

  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API listening on 0.0.0.0:${port}`);
}

// Kick off
init().catch((err) => {
  console.error(err);
  process.exit(1);
});
