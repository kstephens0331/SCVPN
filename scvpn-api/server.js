// api/server.js
import Fastify from "fastify";
import cors from "@fastify/cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import fastifyRawBody from "fastify-raw-body";
import QRCode from "qrcode";
import { WireGuardManager } from "./wireguard-manager.js";
import { EmailService } from "./email-service.js";

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
  STRIPE_WEBHOOK_SECRET,

  // Email
  RESEND_API_KEY
} = process.env;

// ---- Helpers / constants used later ----
const PRICE_MAP = {
  personal: STRIPE_PRICE_PERSONAL,
  gaming: STRIPE_PRICE_GAMING,
  business10: STRIPE_PRICE_BUSINESS10,
  business50: STRIPE_PRICE_BUSINESS50,
  business250: STRIPE_PRICE_BUSINESS250,
};
const mask = (v) => (typeof v === "string" ? v.replace(/^(.{6}).+(.{4})$/, "$1…$2") : v);

async function init() {
  // ---- Clients ----
  const app = Fastify({ logger: true });

  const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
    : null;

  const supabase =
    SCVPN_SUPABASE_URL && SCVPN_SUPABASE_SERVICE_KEY
      ? createClient(SCVPN_SUPABASE_URL, SCVPN_SUPABASE_SERVICE_KEY, {
          auth: { persistSession: false },
        })
      : null;

  // Initialize WireGuard Manager
  const wgManager = supabase ? new WireGuardManager(supabase, app.log) : null;

  // Initialize Email Service
  const emailService = new EmailService(RESEND_API_KEY, app.log);

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
        billing_period = "monthly", // NEW: billing period support
        stripe_price_id, // NEW: direct price ID from frontend
        account_type = "personal",
        quantity = 1,
        customer_email,
      } = body;

      // Log the inputs (safe)
      req.log.info(
        { plan_code, billing_period, account_type, quantity, has_email: !!customer_email },
        "[checkout] incoming"
      );

      // Use direct price ID if provided (new pricing system)
      // Otherwise fall back to legacy PRICE_MAP
      let price = stripe_price_id;
      if (!price) {
        price = PRICE_MAP[plan_code];
        if (!price) {
          req.log.warn({ plan_code }, "[checkout] unknown plan_code");
          return reply.code(400).send({ error: "Unknown plan_code" });
        }
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
          billing_period, // NEW: track billing period in metadata
          account_type,
          quantity: String(quantity),
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
      if (!supabase) return reply.code(500).send({ error: "supabase service not configured" });

      const {
        session_id,
        email,
        plan_code,
        account_type = "personal",
        quantity = 1,
      } = req.body || {};

      if (!session_id) return reply.code(400).send({ error: "missing session_id" });
      if (!email)      return reply.code(400).send({ error: "missing email" });

      // 1) Try to claim an existing row
      const upd = await supabase
        .from("checkout_sessions")
        .update({ claimed_email: email, claimed_at: new Date().toISOString() })
        .eq("id", session_id)
        .is("claimed_email", null)
        .select("*")
        .maybeSingle();

      if (upd.error) return reply.code(400).send({ error: upd.error.message });
      if (upd.data) return reply.send({ ok: true, data: upd.data });

      // 2) If not found, create it (webhook might be late) then claim
      const ins = await supabase
        .from("checkout_sessions")
        .upsert({
          id: session_id,
          email,
          plan_code: plan_code || null,
          account_type,
          quantity: Number(quantity || 1),
          created_at: new Date().toISOString(),
          claimed_email: email,
          claimed_at: new Date().toISOString(),
        }, { onConflict: "id" })
        .select("*")
        .maybeSingle();

      if (ins.error) return reply.code(400).send({ error: ins.error.message });
      if (!ins.data) return reply.code(404).send({ error: "session not found or already claimed" });

      return reply.send({ ok: true, data: ins.data });
    } catch (err) {
      reply.code(500).send({ error: "claim failed" });
    }
  });

  // Billing management - redirect to Stripe Customer Portal
  app.get("/api/billing/manage", async (req, reply) => {
    try {
      if (!requireStripe(reply)) return;
      if (!supabase) return reply.code(500).send({ error: "supabase service not configured" });

      // Get current user from session
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return reply.code(401).send({ error: "Invalid token" });
      }

      // Find customer's Stripe customer ID from subscriptions table
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

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
        case "checkout.session.completed": {
          if (supabase) {
            const s = event.data.object;
            const qty = Number(s.metadata?.quantity) || s?.line_items?.data?.[0]?.quantity || 1;
            const { error } = await supabase
              .from("checkout_sessions")
              .upsert({
                id: s.id,
                email: s.customer_details?.email || null,
                plan_code: s.metadata?.plan_code || null,
                billing_period: s.metadata?.billing_period || "monthly", // NEW: save billing period
                account_type: s.metadata?.account_type || "personal",
                quantity: qty,
                created_at: new Date().toISOString(),
              }, { onConflict: "id" });
            if (error) app.log.error({ error }, "[webhook] upsert checkout_sessions failed");
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
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

  // ---- WireGuard API Endpoints ----

  // Process key requests (background job or manual trigger)
  app.post("/api/wireguard/process-requests", async (req, reply) => {
    try {
      if (!wgManager) {
        return reply.code(500).send({ error: "WireGuard manager not initialized" });
      }

      const { data: requests, error } = await supabase
        .from("key_requests")
        .select("*, devices(*)")
        .eq("status", "pending")
        .order("requested_at", { ascending: true })
        .limit(10); // Process in batches

      if (error) {
        return reply.code(500).send({ error: error.message });
      }

      const results = [];

      for (const request of requests || []) {
        try {
          // Mark as processing
          await supabase
            .from("key_requests")
            .update({
              status: "processing",
              processed_at: new Date().toISOString()
            })
            .eq("id", request.id);

          // Generate device config
          const result = await wgManager.generateDeviceConfig(
            request.device_id,
            request.user_id,
            request.preferred_node_id
          );

          // Mark as completed
          await supabase
            .from("key_requests")
            .update({
              status: "completed",
              completed_at: new Date().toISOString()
            })
            .eq("id", request.id);

          // Send email notification with QR code
          try {
            // Generate QR code from config
            const qrCodeDataURL = await QRCode.toDataURL(result.wgConfig, {
              errorCorrectionLevel: 'M',
              type: 'image/png',
              width: 400,
              margin: 2
            });

            // Get user email from profiles
            const { data: profile } = await supabase
              .from("profiles")
              .select("email, full_name")
              .eq("id", request.user_id)
              .single();

            if (profile?.email) {
              await emailService.sendVPNSetupEmail({
                userEmail: profile.email,
                userName: profile.full_name,
                deviceName: request.devices?.name || 'Your Device',
                wgConfig: result.wgConfig,
                qrCodeDataURL
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
          await supabase
            .from("key_requests")
            .update({
              status: "failed",
              error_message: error.message,
              processed_at: new Date().toISOString()
            })
            .eq("id", request.id);

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

  // Download device config (RLS-protected via RPC and join)
  app.get("/api/device/:deviceId/config", async (req, reply) => {
    try {
      if (!wgManager) {
        return reply.code(500).send({ error: "WireGuard manager not initialized" });
      }

      const { deviceId } = req.params;

      // Get device config from database (with RLS protection)
      const { data: configResult, error } = await supabase.rpc(
        "get_device_config",
        { p_device_id: deviceId }
      );

      if (error || configResult?.error) {
        return reply.code(404).send({
          error: configResult?.error || error.message
        });
      }

      // Get full config for generating WireGuard file
      const { data: fullConfig } = await supabase
        .from("device_configs")
        .select(`
          *,
          devices(name, platform),
          vpn_nodes(name, public_ip, port, public_key)
        `)
        .eq("device_id", deviceId)
        .eq("is_active", true)
        .single();

      if (!fullConfig) {
        return reply.code(404).send({ error: "Configuration not found" });
      }

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

      // Get full config from database
      const { data: fullConfig } = await supabase
        .from("device_configs")
        .select(`
          *,
          devices(name, platform),
          vpn_nodes(name, public_ip, port, public_key, region)
        `)
        .eq("device_id", deviceId)
        .eq("is_active", true)
        .single();

      if (!fullConfig) {
        return reply.code(404).send({ error: "Configuration not found" });
      }

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
      if (!supabase) {
        return reply.code(500).send({ error: "Database not available" });
      }

      const { data: nodes, error } = await supabase
        .from("vpn_nodes")
        .select("id, name, region, public_ip, current_clients, max_clients, is_active, is_healthy")
        .eq("is_active", true)
        .order("name");

      if (error) {
        return reply.code(500).send({ error: error.message });
      }

      return reply.send({ nodes: nodes || [] });

    } catch (error) {
      req.log.error({ error }, "Error getting VPN nodes");
      return reply.code(500).send({ error: "Failed to get VPN nodes" });
    }
  });

  // Admin endpoint: Manual key generation
  app.post("/api/admin/wireguard/generate-key", async (req, reply) => {
    try {
      if (!supabase) return reply.code(500).send({ error: "Database not available" });

      // Check admin authentication
      const adminEmail = req.headers['x-admin-email'];
      if (!adminEmail) {
        return reply.code(401).send({ error: "Admin authentication required" });
      }

      const { data: isAdmin } = await supabase
        .from("admin_emails")
        .select("is_admin")
        .eq("email", adminEmail)
        .eq("is_admin", true)
        .single();

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
      if (!supabase) return reply.code(500).send({ error: "Database not available" });

      // Check admin authentication
      const adminEmail = req.headers['x-admin-email'];
      if (!adminEmail) {
        return reply.code(401).send({ error: "Admin authentication required" });
      }

      const { data: isAdmin } = await supabase
        .from("admin_emails")
        .select("is_admin")
        .eq("email", adminEmail)
        .eq("is_admin", true)
        .single();

      if (!isAdmin) {
        return reply.code(403).send({ error: "Admin access required" });
      }

      const { action, deviceId } = req.body || {};

      if (!action || !deviceId) {
        return reply.code(400).send({ error: "action and deviceId required" });
      }

      // Get device details
      const { data: device, error: deviceError } = await supabase
        .from("devices")
        .select("id, user_id, org_id, is_active")
        .eq("id", deviceId)
        .single();

      if (deviceError || !device) {
        return reply.code(404).send({ error: "Device not found" });
      }

      if (action === "activate") {
        // Generate new WireGuard keys for this device
        if (!wgManager) {
          return reply.code(500).send({ error: "WireGuard manager not initialized" });
        }

        // First check if device already has active config
        const { data: existingConfig } = await supabase
          .from("device_configs")
          .select("id, is_active")
          .eq("device_id", deviceId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingConfig?.is_active) {
          // Deactivate old config first
          await wgManager.removeDeviceConfig(deviceId);
        }

        // Generate new config
        const result = await wgManager.generateDeviceConfig(deviceId, device.user_id);

        // Activate the device
        await supabase
          .from("devices")
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq("id", deviceId);

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
        await supabase
          .from("devices")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", deviceId);

        // Deactivate all device configs
        await supabase
          .from("device_configs")
          .update({ is_active: false, deactivated_at: new Date().toISOString() })
          .eq("device_id", deviceId);

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
        await supabase
          .from("device_configs")
          .delete()
          .eq("device_id", deviceId);

        // Deactivate device
        await supabase
          .from("devices")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", deviceId);

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
        database: !!supabase,
        timestamp: new Date().toISOString()
      };

      if (wgManager && supabase) {
        // Get basic stats
        const { count: totalDevices } = await supabase
          .from("device_configs")
          .select("id", { count: "exact" })
          .eq("is_active", true);

        const { count: totalNodes } = await supabase
          .from("vpn_nodes")
          .select("id", { count: "exact" })
          .eq("is_active", true);

        health.stats = {
          active_devices: totalDevices || 0,
          active_nodes: totalNodes || 0
        };
      }

      return reply.send(health);

    } catch (error) {
      req.log.error({ error }, "Error checking WireGuard health");
      return reply.code(500).send({ error: "Health check failed" });
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

  // ---- Start ----
  const port = Number(PORT || 8080);

  // Initialize WireGuard manager if available
  if (wgManager) {
    try {
      await wgManager.initialize();
      app.log.info("🔒 WireGuard manager initialized");
    } catch (err) {
      app.log.error({ error: err }, "Failed to initialize WireGuard manager");
    }
  }

  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`✅ API listening on 0.0.0.0:${port}`);
}

// Kick off
init().catch((err) => {
  console.error(err);
  process.exit(1);
});
