// scvpn-api/user-routes.js — User data API endpoints (replaces frontend supabase.from() queries)
import { authenticateRequest } from "./auth-routes.js";

/**
 * Register all /api/user/* and /api/admin/data/* routes
 */
export default function registerUserRoutes(app, { db, JWT_SECRET, ADMIN_EMAILS }) {
  // Helper: require auth and return decoded token
  function requireAuth(req, reply) {
    const decoded = authenticateRequest(req, JWT_SECRET);
    if (!decoded) {
      reply.code(401).send({ error: "Unauthorized" });
      return null;
    }
    return decoded;
  }

  // Helper: require admin
  async function requireAdmin(req, reply) {
    const decoded = requireAuth(req, reply);
    if (!decoded) return null;
    if (!decoded.is_admin && !ADMIN_EMAILS.has(decoded.email)) {
      reply.code(403).send({ error: "Admin access required" });
      return null;
    }
    return decoded;
  }

  // ---- GET /api/user/profile ----
  app.get("/api/user/profile", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { rows: [profile] } = await db.query(
      "SELECT id, email, full_name, avatar_url, role, account_type, email_verified, created_at, updated_at FROM profiles WHERE id = $1 LIMIT 1",
      [decoded.sub]
    );

    if (!profile) return reply.code(404).send({ error: "Profile not found" });
    return reply.send(profile);
  });

  // ---- PUT /api/user/profile ----
  app.put("/api/user/profile", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { full_name, avatar_url } = req.body || {};
    const { rows: [updated] } = await db.query(
      `UPDATE profiles SET full_name = COALESCE($1, full_name), avatar_url = COALESCE($2, avatar_url), updated_at = NOW()
       WHERE id = $3 RETURNING id, email, full_name, avatar_url, role, account_type`,
      [full_name, avatar_url, decoded.sub]
    );

    if (!updated) return reply.code(404).send({ error: "Profile not found" });
    return reply.send(updated);
  });

  // ---- GET /api/user/devices ----
  app.get("/api/user/devices", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { rows: devices } = await db.query(
      `SELECT d.*, dt.connected, dt.last_handshake, dt.rx_bytes, dt.tx_bytes, dt.endpoint_ip
       FROM devices d
       LEFT JOIN LATERAL (
         SELECT connected, last_handshake, rx_bytes, tx_bytes, endpoint_ip
         FROM device_telemetry WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1
       ) dt ON true
       WHERE d.user_id = $1
       ORDER BY d.created_at DESC`,
      [decoded.sub]
    );

    return reply.send({ devices });
  });

  // ---- POST /api/user/devices ----
  app.post("/api/user/devices", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { name, platform } = req.body || {};
    if (!name || !platform) return reply.code(400).send({ error: "Name and platform required" });

    const { rows: [device] } = await db.query(
      `INSERT INTO devices (id, user_id, name, platform, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
       RETURNING *`,
      [decoded.sub, name, platform]
    );

    return reply.code(201).send(device);
  });

  // ---- PUT /api/user/devices/:id ----
  app.put("/api/user/devices/:id", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { id } = req.params;
    const { name, is_active } = req.body || {};

    const sets = [];
    const vals = [];
    let idx = 1;

    if (name !== undefined) { sets.push(`name = $${idx++}`); vals.push(name); }
    if (is_active !== undefined) { sets.push(`is_active = $${idx++}`); vals.push(is_active); }
    sets.push(`updated_at = NOW()`);

    vals.push(id, decoded.sub);
    const { rows: [device] } = await db.query(
      `UPDATE devices SET ${sets.join(", ")} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      vals
    );

    if (!device) return reply.code(404).send({ error: "Device not found" });
    return reply.send(device);
  });

  // ---- DELETE /api/user/devices/:id ----
  app.delete("/api/user/devices/:id", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { id } = req.params;
    const { rowCount } = await db.query(
      "DELETE FROM devices WHERE id = $1 AND user_id = $2",
      [id, decoded.sub]
    );

    if (rowCount === 0) return reply.code(404).send({ error: "Device not found" });
    return reply.send({ ok: true });
  });

  // ---- GET /api/user/subscription ----
  app.get("/api/user/subscription", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { rows: [sub] } = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [decoded.sub]
    );

    return reply.send({ subscription: sub || null });
  });

  // ---- GET /api/user/invoices ----
  app.get("/api/user/invoices", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    // Try to get invoices if the table exists
    try {
      const { rows: invoices } = await db.query(
        `SELECT * FROM invoices WHERE user_id = $1 ORDER BY period_start DESC`,
        [decoded.sub]
      );
      return reply.send({ invoices });
    } catch {
      // invoices table may not exist yet
      return reply.send({ invoices: [] });
    }
  });

  // ---- GET /api/user/organizations ----
  app.get("/api/user/organizations", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    try {
      const { rows: orgs } = await db.query(
        `SELECT o.* FROM organizations o
         INNER JOIN org_members om ON o.id = om.org_id
         WHERE om.user_id = $1
         ORDER BY o.name`,
        [decoded.sub]
      );
      return reply.send({ organizations: orgs });
    } catch {
      return reply.send({ organizations: [] });
    }
  });

  // ---- GET /api/user/org/:orgId/devices ----
  app.get("/api/user/org/:orgId/devices", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { orgId } = req.params;

    try {
      const { rows: devices } = await db.query(
        `SELECT d.*, dt.connected, dt.last_handshake, dt.rx_bytes, dt.tx_bytes, dt.endpoint_ip
         FROM devices d
         LEFT JOIN LATERAL (
           SELECT connected, last_handshake, rx_bytes, tx_bytes, endpoint_ip
           FROM device_telemetry WHERE device_id = d.id ORDER BY recorded_at DESC LIMIT 1
         ) dt ON true
         WHERE d.org_id = $1
         ORDER BY d.created_at DESC`,
        [orgId]
      );
      return reply.send({ devices });
    } catch {
      return reply.send({ devices: [] });
    }
  });

  // ---- GET /api/user/org/:orgId/members ----
  app.get("/api/user/org/:orgId/members", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;

    const { orgId } = req.params;

    try {
      const { rows: members } = await db.query(
        `SELECT om.*, p.email, p.full_name FROM org_members om
         JOIN profiles p ON om.user_id = p.id
         WHERE om.org_id = $1`,
        [orgId]
      );
      return reply.send({ members });
    } catch {
      return reply.send({ members: [] });
    }
  });

  // ======= ADMIN DATA ENDPOINTS =======

  // ---- GET /api/admin/users ----
  app.get("/api/admin/users", async (req, reply) => {
    const decoded = await requireAdmin(req, reply);
    if (!decoded) return;

    const { rows: users } = await db.query(
      "SELECT id, email, full_name, role, account_type, email_verified, created_at FROM profiles ORDER BY created_at DESC"
    );
    return reply.send({ users });
  });

  // ---- GET /api/admin/organizations ----
  app.get("/api/admin/organizations", async (req, reply) => {
    const decoded = await requireAdmin(req, reply);
    if (!decoded) return;

    try {
      const { rows: orgs } = await db.query(
        `SELECT o.*, (SELECT COUNT(*)::int FROM org_members WHERE org_id = o.id) AS member_count
         FROM organizations o ORDER BY o.name`
      );
      return reply.send({ organizations: orgs });
    } catch {
      return reply.send({ organizations: [] });
    }
  });

  // ---- GET /api/admin/stats ----
  app.get("/api/admin/stats", async (req, reply) => {
    const decoded = await requireAdmin(req, reply);
    if (!decoded) return;

    const [users, devices, activeDevices] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM profiles"),
      db.query("SELECT COUNT(*)::int AS count FROM devices"),
      db.query("SELECT COUNT(*)::int AS count FROM devices WHERE is_active = true"),
    ]);

    let orgCount = 0;
    try {
      const { rows: [r] } = await db.query("SELECT COUNT(*)::int AS count FROM organizations");
      orgCount = r?.count || 0;
    } catch { /* table may not exist */ }

    return reply.send({
      users: users.rows[0]?.count || 0,
      organizations: orgCount,
      devices: devices.rows[0]?.count || 0,
      active_devices: activeDevices.rows[0]?.count || 0,
    });
  });

  // ---- GET /api/admin/telemetry ----
  app.get("/api/admin/telemetry", async (req, reply) => {
    const decoded = await requireAdmin(req, reply);
    if (!decoded) return;

    try {
      const { rows } = await db.query(
        `SELECT date_trunc('hour', recorded_at) AS hour,
                SUM(rx_bytes)::bigint AS rx, SUM(tx_bytes)::bigint AS tx
         FROM device_telemetry
         WHERE recorded_at > NOW() - INTERVAL '24 hours'
         GROUP BY hour ORDER BY hour`
      );
      return reply.send({ telemetry: rows });
    } catch {
      return reply.send({ telemetry: [] });
    }
  });

  // ---- GET /api/admin/servers ----
  app.get("/api/admin/servers", async (req, reply) => {
    const decoded = await requireAdmin(req, reply);
    if (!decoded) return;

    try {
      const { rows: hosts } = await db.query("SELECT * FROM vps_hosts ORDER BY name");
      // Get latest metrics for each host
      for (const host of hosts) {
        const { rows: [metrics] } = await db.query(
          `SELECT * FROM vps_metrics WHERE host_id = $1 AND recorded_at > NOW() - INTERVAL '5 minutes' ORDER BY recorded_at DESC LIMIT 1`,
          [host.id]
        );
        host.latest_metrics = metrics || null;
      }
      return reply.send({ servers: hosts });
    } catch {
      return reply.send({ servers: [] });
    }
  });

  // ---- GET /api/admin/analytics ----
  app.get("/api/admin/analytics", async (req, reply) => {
    const decoded = await requireAdmin(req, reply);
    if (!decoded) return;

    const analytics = {};

    // Revenue KPIs via simple queries
    try {
      const windows = [
        { key: "today", interval: "1 day" },
        { key: "7d", interval: "7 days" },
        { key: "30d", interval: "30 days" },
        { key: "60d", interval: "60 days" },
      ];

      analytics.revenue = {};
      for (const w of windows) {
        try {
          const { rows: [r] } = await db.query(
            `SELECT COALESCE(SUM(amount_cents), 0)::int AS total FROM invoices WHERE paid_at > NOW() - INTERVAL '${w.interval}'`
          );
          analytics.revenue[w.key] = r?.total || 0;
        } catch { analytics.revenue[w.key] = 0; }
      }

      // New subscriptions
      analytics.new_subscriptions = {};
      for (const w of windows) {
        try {
          const { rows: [r] } = await db.query(
            `SELECT COUNT(*)::int AS count FROM subscriptions WHERE created_at > NOW() - INTERVAL '${w.interval}'`
          );
          analytics.new_subscriptions[w.key] = r?.count || 0;
        } catch { analytics.new_subscriptions[w.key] = 0; }
      }

      // Active subscriptions (MRR)
      try {
        const { rows: [r] } = await db.query(
          "SELECT COUNT(*)::int AS count FROM subscriptions WHERE status = 'active'"
        );
        analytics.active_subscriptions = r?.count || 0;
      } catch { analytics.active_subscriptions = 0; }

    } catch (err) {
      app.log.warn({ error: err.message }, "[admin/analytics] Error fetching analytics");
    }

    return reply.send(analytics);
  });

  // ---- GET /api/admin/check ----
  app.get("/api/admin/check", async (req, reply) => {
    const decoded = requireAuth(req, reply);
    if (!decoded) return;
    const isAdmin = decoded.is_admin || ADMIN_EMAILS.has(decoded.email);
    return reply.send({ is_admin: isAdmin });
  });

  app.log.info("User data routes registered");
}
