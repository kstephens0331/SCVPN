# SACVPN Migration: Railway + Supabase DB → Texas Server

> **Status:** Scheduled for next week (after SaaS Hub Weekly launch)
> **Date Created:** 2026-02-26
> **Zero-downtime strategy:** Run Texas in parallel with Railway, cut over once verified.

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Target Architecture](#target-architecture)
3. [Environment Variables — Complete List](#environment-variables--complete-list)
4. [Database Tables — Full Schema](#database-tables--full-schema)
5. [Every Supabase Query to Convert](#every-supabase-query-to-convert)
6. [Frontend Files to Update](#frontend-files-to-update)
7. [Phase 1: Texas Infrastructure Setup](#phase-1-texas-infrastructure-setup)
8. [Phase 2: Database Migration](#phase-2-database-migration)
9. [Phase 3: API Code Changes](#phase-3-api-code-changes)
10. [Phase 4: Frontend + DNS + Stripe](#phase-4-frontend--dns--stripe)
11. [Phase 5: Cutover & Verification](#phase-5-cutover--verification)
12. [Rollback Plan](#rollback-plan)

---

## Current Architecture

```
[Vercel]                    [Railway]                      [Supabase]
www.sacvpn.com  ──────►  scvpn-production.up.railway.app  ──────►  ltwuqjmncldopkutiyak.supabase.co
React 19 + Vite            Fastify API (Node 20)                    PostgreSQL + Auth
                           Port 8080                                Service Role Key
                           Dockerfile + nixpacks.toml               RLS Policies
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              [Texas VPN]  [VA VPN]    [Dallas VPN]
              98.96.14.4   135.148.121.237  45.79.8.145
              wg0 + wg1    wg0             wg0
              SSH broken   SSH OK          SSH OK
              from Railway
```

### What Moves
- **API** → Docker container on Texas server (98.96.14.4)
- **Database tables** → Self-hosted PostgreSQL on Texas server

### What Stays
- **Frontend** → Vercel (unchanged)
- **Supabase Auth** → Free tier (login, signup, JWT verification)
- **Stripe** → Same keys, update webhook URL only
- **SendGrid** → Same API key
- **VPN Nodes** → Same 3 nodes (but Texas SSH issue is fixed since API is local)

---

## Target Architecture

```
[Vercel]                    [Texas Server 98.96.14.4]
www.sacvpn.com  ──────►  api.sacvpn.com (Caddy reverse proxy)
React 19 + Vite            │
                           ├── sacvpn-api (Docker, port 8090→3000)
                           ├── sacvpn-db (Docker PostgreSQL, port 5438→5432, 127.0.0.1 only)
                           │
                           ├── SSH to localhost (Texas VPN node — no SSH needed!)
                           ├── SSH to 135.148.121.237 (VA node, key-based)
                           └── SSH to 45.79.8.145 (Dallas node, password)

[Supabase Free Tier]
Auth only (login/signup/JWT)
```

---

## Environment Variables — Complete List

### Currently on Railway (must be copied to Texas)

| Variable | Description | Example/Notes |
|----------|-------------|---------------|
| `PORT` | API listen port | `8080` (change to `3000` on Texas) |
| `NODE_ENV` | Environment | `production` |
| `SITE_URL` | Frontend URL for redirects | `https://www.sacvpn.com` |
| `ALLOWED_ORIGINS` | CORS whitelist (comma-separated) | `https://www.sacvpn.com,https://sacvpn.com,http://localhost:5173,http://localhost:1420,tauri://localhost,https://tauri.localhost,http://tauri.localhost` |
| `STRIPE_SECRET_KEY` | Stripe LIVE secret key | `sk_live_...` — **get from Railway** |
| `STRIPE_PRICE_PERSONAL` | Stripe price ID for Personal plan | `price_...` — **get from Railway** |
| `STRIPE_PRICE_GAMING` | Stripe price ID for Gaming plan | `price_...` — **get from Railway** |
| `STRIPE_PRICE_BUSINESS10` | Stripe price ID for Business 10 | `price_...` — **get from Railway** |
| `STRIPE_PRICE_BUSINESS50` | Stripe price ID for Business 50 | `price_...` — **get from Railway** |
| `STRIPE_PRICE_BUSINESS100` | Stripe price ID for Business 100 | `price_...` — **get from Railway** |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | **NEW value** — after creating Texas webhook endpoint in Stripe |
| `SCVPN_SUPABASE_URL` | Supabase project URL (auth only) | `https://ltwuqjmncldopkutiyak.supabase.co` |
| `SCVPN_SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0d3Vxam1uY2xkb3BrdXRpeWFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyOTk0NCwiZXhwIjoyMDcxNDA1OTQ0fQ.J0GjiUMfB5dtO6QItZvtQiSduNRLWZDcW5gDZL91fIc` |
| `SENDGRID_API_KEY` | SendGrid email API key | **get from Railway** |
| `VPN_NODE_SSH_PASSWORD` | Global SSH password for VA/Dallas nodes | **get from Railway** |

### New Variables for Texas (not on Railway)

| Variable | Description | Value |
|----------|-------------|-------|
| `DATABASE_URL` | Local PostgreSQL connection | `postgresql://sacvpn:<password>@sacvpn-db:5432/sacvpn` |
| `VPN_NODE_SSH_KEY_PATH` | SSH private key for Texas node | `/app/ssh/vpn_deploy_key` (persistent volume) |

### Variables to REMOVE on Texas (no longer needed)

| Variable | Why |
|----------|-----|
| `VPN_NODE_SSH_KEY` | API is now ON Texas — no need for env var key hack |
| `VPN_NODE_SSH_KEY_PATH` may change | Can use file on disk instead of Railway's ephemeral FS |

### How to Export from Railway

```bash
# Login to Railway CLI
railway login

# Link to SACVPN project
cd sacvpn-web && railway link

# Export all variables
railway variables

# Or export to .env file
railway variables --format env > texas-env-vars.env
```

---

## Database Tables — Full Schema

### Table 1: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,              -- matches auth.users.id
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current data (6 rows):**
- `info@stephenscode.dev`
- `thathalokidd@gmail.com`
- `usmc3189@gmail.com`
- `kyle@stephenscode.dev`
- `kyle_stephens31@icloud.com`
- + 2 others

---

### Table 2: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  user_id UUID NOT NULL,            -- references profiles(id)
  org_id UUID,
  plan TEXT NOT NULL,
  plan_code TEXT,
  status TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  billing_period TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  renews_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
```

**Current data (6 rows):**
| user | plan | status | stripe_subscription_id |
|------|------|--------|----------------------|
| kyle@stephenscode.dev | personal | active | sub_1SVAPFDcTrtfdJcSq4PYPjQW |
| usmc3189@gmail.com | gaming | active | sub_1SL7YQDcTrtfdJcSWclyhVR4 |
| thathalokidd@gmail.com | gaming | active | NULL (needs Stripe sync) |
| 3 others | free | active | NULL |

---

### Table 3: `devices`

```sql
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,            -- references profiles(id)
  org_id UUID,
  name TEXT NOT NULL,
  platform TEXT,                    -- 'windows', 'macos', 'ios', 'android', 'linux', 'router'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current data: 13 devices**

---

### Table 4: `device_configs`

```sql
CREATE TABLE device_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,          -- references devices(id) ON DELETE CASCADE
  user_id UUID NOT NULL,            -- references profiles(id)
  node_id UUID NOT NULL,            -- references vpn_nodes(id)
  private_key TEXT NOT NULL,        -- WireGuard private key (base64)
  public_key TEXT NOT NULL,         -- WireGuard public key (base64)
  client_ip INET NOT NULL,          -- Assigned VPN IP (e.g., 10.8.0.2)
  dns_servers TEXT DEFAULT '1.1.1.1,8.8.8.8',
  allowed_ips TEXT DEFAULT '0.0.0.0/0,::/0',
  persistent_keepalive INTEGER DEFAULT 25,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,

  UNIQUE(device_id),
  UNIQUE(node_id, client_ip)
);

CREATE INDEX idx_device_configs_device_id ON device_configs(device_id);
CREATE INDEX idx_device_configs_user_id ON device_configs(user_id);
CREATE INDEX idx_device_configs_node_id ON device_configs(node_id);
```

**Current data: 12 configs** (all on VA and Dallas nodes, none on Texas)

---

### Table 5: `vpn_nodes`

```sql
CREATE TABLE vpn_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  public_ip INET NOT NULL,
  port INTEGER DEFAULT 51820,
  interface_name VARCHAR(20) DEFAULT 'wg0',
  public_key TEXT NOT NULL,
  client_subnet CIDR NOT NULL,
  dns_servers TEXT DEFAULT '1.1.1.1,8.8.8.8',
  max_clients INTEGER DEFAULT 1000,
  current_clients INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 100,
  management_type VARCHAR(20) DEFAULT 'ssh',
  ssh_host TEXT,
  ssh_user VARCHAR(50) DEFAULT 'root',
  ssh_port INTEGER DEFAULT 22,
  ssh_password TEXT,               -- per-node SSH password (optional)
  api_endpoint TEXT,
  api_token TEXT,
  is_active BOOLEAN DEFAULT true,
  is_healthy BOOLEAN DEFAULT false,
  last_health_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vpn_nodes ADD CONSTRAINT vpn_nodes_public_ip_interface_unique
  UNIQUE (public_ip, interface_name);
```

**Current data (3 nodes):**
| name | public_ip | ssh_user | priority | max_clients |
|------|-----------|----------|----------|-------------|
| Texas Primary | 98.96.14.4 | stephens-code2 | 1 | 2500 |
| VA Secondary | 135.148.121.237 | ubuntu | 2 | 1000 |
| Dallas Central | 45.79.8.145 | root | 3 | 1000 |

---

### Table 6: `device_telemetry`

```sql
CREATE TABLE device_telemetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,          -- references devices(id) ON DELETE CASCADE
  node_id UUID NOT NULL,            -- references vpn_nodes(id)
  is_connected BOOLEAN NOT NULL,
  client_ip INET,
  last_handshake TIMESTAMPTZ,
  bytes_received BIGINT DEFAULT 0,
  bytes_sent BIGINT DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_device_telemetry_device_id ON device_telemetry(device_id);

CREATE OR REPLACE VIEW device_latest_telemetry AS
SELECT DISTINCT ON (device_id)
  device_id, node_id, is_connected, client_ip,
  last_handshake, bytes_received, bytes_sent, recorded_at
FROM device_telemetry
ORDER BY device_id, recorded_at DESC;
```

---

### Table 7: `key_requests`

```sql
CREATE TABLE key_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,          -- references devices(id) ON DELETE CASCADE
  user_id UUID NOT NULL,
  preferred_node_id UUID,           -- references vpn_nodes(id)
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_key_requests_status ON key_requests(status);
CREATE INDEX idx_key_requests_user_id ON key_requests(user_id);
```

---

### Table 8: `checkout_sessions`

```sql
CREATE TABLE checkout_sessions (
  id TEXT PRIMARY KEY,              -- Stripe session ID (cs_...)
  email TEXT,
  plan_code TEXT,
  billing_period TEXT DEFAULT 'monthly',
  account_type TEXT DEFAULT 'personal',
  quantity INTEGER DEFAULT 1,
  claimed_email TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Table 9: `admin_emails`

```sql
CREATE TABLE admin_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current data:** `info@stephenscode.dev`

---

### PL/pgSQL Function: `insert_subscription`

```sql
-- KEEP THIS — used as fallback when RLS blocks direct insert
CREATE OR REPLACE FUNCTION insert_subscription(
  p_stripe_subscription_id TEXT,
  p_stripe_customer_id TEXT,
  p_user_id UUID,
  p_plan TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_renews_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_subscription_id UUID;
  v_result JSON;
BEGIN
  SELECT id INTO v_subscription_id
  FROM subscriptions
  WHERE stripe_subscription_id = p_stripe_subscription_id;

  IF v_subscription_id IS NOT NULL THEN
    UPDATE subscriptions
    SET stripe_customer_id = p_stripe_customer_id,
        user_id = p_user_id, plan = p_plan, status = p_status,
        current_period_start = p_current_period_start,
        current_period_end = p_current_period_end,
        renews_at = p_renews_at, updated_at = NOW()
    WHERE id = v_subscription_id
    RETURNING json_build_object('id', id, 'stripe_subscription_id', stripe_subscription_id,
      'user_id', user_id, 'plan', plan, 'status', status) INTO v_result;
    RETURN json_build_object('success', true, 'action', 'updated', 'data', v_result);
  ELSE
    INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id,
      plan, status, current_period_start, current_period_end, renews_at, created_at, updated_at)
    VALUES (p_stripe_subscription_id, p_stripe_customer_id, p_user_id,
      p_plan, p_status, p_current_period_start, p_current_period_end, p_renews_at, NOW(), NOW())
    RETURNING json_build_object('id', id, 'stripe_subscription_id', stripe_subscription_id,
      'user_id', user_id, 'plan', plan, 'status', status) INTO v_result;
    RETURN json_build_object('success', true, 'action', 'inserted', 'data', v_result);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;
```

> **Note for Texas:** Remove `SECURITY DEFINER` — no RLS to bypass on self-hosted PG. Can keep function as-is for the `rpc()` fallback or convert to direct SQL in server.js.

---

### PL/pgSQL Functions to REMOVE (depend on `auth.uid()`)

These won't work without Supabase auth context. Reimplement as API logic:

- `request_wg_key(p_device_id)` — move to POST `/api/device/:id/request-key`
- `get_device_config(p_device_id)` — move to GET `/api/device/:id/config`

### RLS Policies to REMOVE

All RLS policies reference `auth.uid()` or `auth.jwt()` which won't exist on self-hosted PG. **Disable RLS entirely** on all tables since the API (using service role equivalent) is the only client:

```sql
ALTER TABLE vpn_nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE device_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE device_telemetry DISABLE ROW LEVEL SECURITY;
ALTER TABLE key_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails DISABLE ROW LEVEL SECURITY;
```

> Authorization checks move into API code (verify `user_id` matches authenticated user).

---

## Every Supabase Query to Convert

### server.js — 31 database queries + 2 auth calls + 1 RPC call

#### Auth Calls (KEEP — Supabase Auth stays)

| Line | Code | Keep? |
|------|------|-------|
| 521 | `supabase.auth.getUser(token)` | **YES** — billing/manage endpoint |
| 717 | `supabase.auth.getUser(token)` | **YES** — generate-key endpoint |

#### RPC Calls (CONVERT to direct SQL)

| Line | Code | Endpoint | Equivalent SQL |
|------|------|----------|---------------|
| 425 | `supabase.rpc('insert_subscription', {...})` | POST /api/checkout/claim | Keep function in PG or inline the INSERT/UPDATE |
| 954 | `supabase.rpc('get_device_config', { p_device_id })` | GET /api/device/:id/config | `SELECT dc.*, vn.public_ip, vn.port, vn.public_key FROM device_configs dc JOIN vpn_nodes vn ON dc.node_id = vn.id JOIN devices d ON dc.device_id = d.id WHERE dc.device_id = $1 AND dc.is_active = true AND d.user_id = $2` |

#### Query #1 — profiles SELECT (checkout/claim)
**Line 307 | Endpoint: POST /api/checkout/claim**
```js
// BEFORE (Supabase)
const { data: profile } = await supabase
  .from("profiles").select("id").eq("email", email).maybeSingle();

// AFTER (pg)
const { rows: [profile] } = await db.query(
  'SELECT id FROM profiles WHERE email = $1 LIMIT 1', [email]
);
```

#### Query #2 — checkout_sessions UPDATE (checkout/claim)
**Line 320 | Endpoint: POST /api/checkout/claim**
```js
// BEFORE
const upd = await supabase
  .from("checkout_sessions")
  .update({ claimed_email: email, claimed_at: new Date().toISOString() })
  .eq("id", session_id).is("claimed_email", null)
  .select("*").maybeSingle();

// AFTER
const { rows: [upd] } = await db.query(
  `UPDATE checkout_sessions SET claimed_email = $1, claimed_at = $2
   WHERE id = $3 AND claimed_email IS NULL RETURNING *`,
  [email, new Date().toISOString(), session_id]
);
```

#### Query #3 — checkout_sessions UPSERT (checkout/claim fallback)
**Line 334 | Endpoint: POST /api/checkout/claim**
```js
// BEFORE
const ins = await supabase
  .from("checkout_sessions")
  .upsert({ id: session_id, email, plan_code, account_type, quantity, ... }, { onConflict: "id" })
  .select("*").maybeSingle();

// AFTER
const { rows: [ins] } = await db.query(
  `INSERT INTO checkout_sessions (id, email, plan_code, account_type, quantity, created_at, claimed_email, claimed_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   ON CONFLICT (id) DO UPDATE SET claimed_email = $7, claimed_at = $8
   RETURNING *`,
  [session_id, email, plan_code, account_type, quantity, new Date().toISOString(), email, new Date().toISOString()]
);
```

#### Query #4 — subscriptions SELECT (checkout/claim)
**Line 388 | Endpoint: POST /api/checkout/claim**
```js
// BEFORE
const { data: existingSub } = await supabase
  .from("subscriptions").select("id")
  .eq("stripe_subscription_id", subscription.id).maybeSingle();

// AFTER
const { rows: [existingSub] } = await db.query(
  'SELECT id FROM subscriptions WHERE stripe_subscription_id = $1 LIMIT 1',
  [subscription.id]
);
```

#### Query #5 — subscriptions UPDATE (checkout/claim)
**Line 398 | Endpoint: POST /api/checkout/claim**
```js
// BEFORE
const result = await supabase
  .from("subscriptions").update(subscriptionData)
  .eq("stripe_subscription_id", subscription.id).select();

// AFTER
const { rows } = await db.query(
  `UPDATE subscriptions SET stripe_customer_id=$1, user_id=$2, plan=$3,
   status=$4, current_period_start=$5, current_period_end=$6,
   renews_at=$7, updated_at=$8
   WHERE stripe_subscription_id = $9 RETURNING *`,
  [subscriptionData.stripe_customer_id, subscriptionData.user_id, ...]
);
```

#### Query #6 — subscriptions INSERT (checkout/claim)
**Line 407 | Endpoint: POST /api/checkout/claim**
```js
// BEFORE
const result = await supabase
  .from("subscriptions").insert(subscriptionData).select();

// AFTER
const { rows } = await db.query(
  `INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id,
   plan, status, current_period_start, current_period_end, renews_at, created_at, updated_at)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
  [...]
);
```

#### Query #7 — subscriptions SELECT (billing/manage)
**Line 529 | Endpoint: GET /api/billing/manage**
```js
// BEFORE
const { data: sub } = await supabase
  .from("subscriptions").select("stripe_customer_id")
  .eq("user_id", user.id).maybeSingle();

// AFTER
const { rows: [sub] } = await db.query(
  'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 LIMIT 1',
  [user.id]
);
```

#### Query #8 — checkout_sessions UPSERT (webhook: checkout.session.completed)
**Line 602 | Endpoint: POST /api/stripe/webhook**
```js
// BEFORE
await supabase.from("checkout_sessions").upsert({
  id: s.id, email: s.customer_details?.email, plan_code: s.metadata?.plan_code,
  billing_period: s.metadata?.billing_period || "monthly",
  account_type: s.metadata?.account_type || "personal",
  quantity: qty, created_at: new Date().toISOString()
}, { onConflict: "id" });

// AFTER
await db.query(
  `INSERT INTO checkout_sessions (id, email, plan_code, billing_period, account_type, quantity, created_at)
   VALUES ($1,$2,$3,$4,$5,$6,$7)
   ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, plan_code=EXCLUDED.plan_code`,
  [s.id, s.customer_details?.email, s.metadata?.plan_code, ...]
);
```

#### Query #9 — subscriptions UPSERT (webhook: subscription.created/updated)
**Line 634 | Endpoint: POST /api/stripe/webhook**
```js
// BEFORE
await supabase.from("subscriptions").upsert({
  stripe_subscription_id: sub.id, stripe_customer_id: sub.customer,
  user_id: userId, plan: sub.metadata?.plan_code || "unknown",
  status: sub.status, current_period_start, current_period_end,
  renews_at, updated_at
}, { onConflict: "stripe_subscription_id" });

// AFTER
await db.query(
  `INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id,
   plan, status, current_period_start, current_period_end, renews_at, updated_at)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
   ON CONFLICT (stripe_subscription_id) DO UPDATE SET
   stripe_customer_id=EXCLUDED.stripe_customer_id, user_id=EXCLUDED.user_id,
   plan=EXCLUDED.plan, status=EXCLUDED.status,
   current_period_start=EXCLUDED.current_period_start,
   current_period_end=EXCLUDED.current_period_end,
   renews_at=EXCLUDED.renews_at, updated_at=EXCLUDED.updated_at`,
  [sub.id, sub.customer, userId, ...]
);
```

#### Query #10 — subscriptions UPDATE (webhook: subscription.deleted)
**Line 659 | Endpoint: POST /api/stripe/webhook**
```js
// BEFORE
await supabase.from("subscriptions")
  .update({ status: "canceled", renews_at: null, updated_at: new Date().toISOString() })
  .eq("stripe_subscription_id", sub.id);

// AFTER
await db.query(
  'UPDATE subscriptions SET status=$1, renews_at=$2, updated_at=$3 WHERE stripe_subscription_id=$4',
  ['canceled', null, new Date().toISOString(), sub.id]
);
```

#### Query #11 — devices SELECT (generate-key)
**Line 728 | Endpoint: POST /api/wireguard/generate-key**
```js
// BEFORE
const { data: device } = await supabase
  .from("devices").select("id, name, platform, user_id")
  .eq("id", device_id).eq("user_id", user.id).single();

// AFTER
const { rows: [device] } = await db.query(
  'SELECT id, name, platform, user_id FROM devices WHERE id = $1 AND user_id = $2',
  [device_id, user.id]
);
```

#### Query #12 — profiles SELECT (generate-key, email)
**Line 762 | Endpoint: POST /api/wireguard/generate-key**
```js
// BEFORE
const { data: profile } = await supabase
  .from("profiles").select("email, full_name").eq("id", user.id).single();

// AFTER
const { rows: [profile] } = await db.query(
  'SELECT email, full_name FROM profiles WHERE id = $1', [user.id]
);
```

#### Query #13 — key_requests SELECT (process-requests)
**Line 832 | Endpoint: POST /api/wireguard/process-requests**
```js
// BEFORE
const { data: requests } = await supabase
  .from("key_requests").select("*, devices(*)")
  .eq("status", "pending").order("requested_at", { ascending: true }).limit(10);

// AFTER
const { rows: requests } = await db.query(
  `SELECT kr.*, d.name as device_name, d.platform as device_platform
   FROM key_requests kr LEFT JOIN devices d ON kr.device_id = d.id
   WHERE kr.status = 'pending' ORDER BY kr.requested_at ASC LIMIT 10`
);
```

#### Query #14 — key_requests UPDATE (process-requests, mark processing)
**Line 848 | Endpoint: POST /api/wireguard/process-requests**
```js
// AFTER
await db.query(
  "UPDATE key_requests SET status='processing', processed_at=$1 WHERE id=$2",
  [new Date().toISOString(), request.id]
);
```

#### Query #15 — key_requests UPDATE (process-requests, mark completed)
**Line 864 | Endpoint: POST /api/wireguard/process-requests**
```js
// AFTER
await db.query(
  "UPDATE key_requests SET status='completed', completed_at=$1 WHERE id=$2",
  [new Date().toISOString(), request.id]
);
```

#### Query #16 — profiles SELECT (process-requests, email)
**Line 883 | Endpoint: POST /api/wireguard/process-requests**
```js
// AFTER
const { rows: [profile] } = await db.query(
  'SELECT email, full_name FROM profiles WHERE id = $1', [request.user_id]
);
```

#### Query #17 — key_requests UPDATE (process-requests, mark failed)
**Line 913 | Endpoint: POST /api/wireguard/process-requests**
```js
// AFTER
await db.query(
  "UPDATE key_requests SET status='failed', error_message=$1, processed_at=$2 WHERE id=$3",
  [error.message, new Date().toISOString(), request.id]
);
```

#### Query #18 — device_configs SELECT+JOIN (device config download)
**Line 967 | Endpoint: GET /api/device/:id/config**
```js
// BEFORE
const { data: fullConfig } = await supabase
  .from("device_configs")
  .select("*, devices(name, platform), vpn_nodes(name, public_ip, port, public_key)")
  .eq("device_id", deviceId).eq("is_active", true).single();

// AFTER
const { rows: [fullConfig] } = await db.query(
  `SELECT dc.*, d.name as device_name, d.platform as device_platform,
   vn.name as node_name, vn.public_ip as node_public_ip, vn.port as node_port,
   vn.public_key as node_public_key, vn.region as node_region
   FROM device_configs dc
   JOIN devices d ON dc.device_id = d.id
   JOIN vpn_nodes vn ON dc.node_id = vn.id
   WHERE dc.device_id = $1 AND dc.is_active = true`,
  [deviceId]
);
```

> Note: Need to restructure the response object since Supabase nests joins as `fullConfig.vpn_nodes.public_ip` but pg returns flat `fullConfig.node_public_ip`.

#### Query #19 — device_configs SELECT+JOIN (config-data with QR)
**Line 1010 | Endpoint: GET /api/device/:id/config-data**
Same as Query #18 (add `region` to vpn_nodes select).

#### Query #20 — vpn_nodes SELECT (public node list)
**Line 1061 | Endpoint: GET /api/wireguard/nodes**
```js
// AFTER
const { rows: nodes } = await db.query(
  `SELECT id, name, region, public_ip, current_clients, max_clients, is_active, is_healthy
   FROM vpn_nodes WHERE is_active = true ORDER BY name`
);
```

#### Query #21 — admin_emails SELECT (admin generate-key)
**Line 1090 | Endpoint: POST /api/admin/wireguard/generate-key**
```js
// AFTER
const { rows: [isAdmin] } = await db.query(
  'SELECT email FROM admin_emails WHERE email = $1', [adminEmail]
);
```

#### Query #22 — admin_emails SELECT (admin-device)
**Line 1136 | Endpoint: POST /api/admin-device**
Same as Query #21.

#### Query #23 — devices SELECT (admin-device)
**Line 1153 | Endpoint: POST /api/admin-device**
```js
// AFTER
const { rows: [device] } = await db.query(
  'SELECT id, user_id, org_id, is_active FROM devices WHERE id = $1', [deviceId]
);
```

#### Query #24 — device_configs SELECT (admin-device: activate check)
**Line 1170 | Endpoint: POST /api/admin-device**
```js
// AFTER
const { rows: [existingConfig] } = await db.query(
  `SELECT id, is_active FROM device_configs WHERE device_id = $1
   ORDER BY created_at DESC LIMIT 1`, [deviceId]
);
```

#### Query #25 — devices UPDATE (admin-device: activate)
**Line 1187 | Endpoint: POST /api/admin-device**
```js
// AFTER
await db.query(
  'UPDATE devices SET is_active = true, updated_at = $1 WHERE id = $2',
  [new Date().toISOString(), deviceId]
);
```

#### Query #26 — devices UPDATE (admin-device: suspend)
**Line 1204 | Endpoint: POST /api/admin-device**
```js
// AFTER
await db.query(
  'UPDATE devices SET is_active = false, updated_at = $1 WHERE id = $2',
  [new Date().toISOString(), deviceId]
);
```

#### Query #27 — device_configs UPDATE (admin-device: suspend configs)
**Line 1210 | Endpoint: POST /api/admin-device**
```js
// AFTER
await db.query(
  'UPDATE device_configs SET is_active = false, deactivated_at = $1 WHERE device_id = $2',
  [new Date().toISOString(), deviceId]
);
```

#### Query #28 — device_configs DELETE (admin-device: revoke_keys)
**Line 1236 | Endpoint: POST /api/admin-device**
```js
// AFTER
await db.query('DELETE FROM device_configs WHERE device_id = $1', [deviceId]);
```

#### Query #29 — devices UPDATE (admin-device: revoke_keys deactivate)
**Line 1242 | Endpoint: POST /api/admin-device**
```js
// AFTER
await db.query(
  'UPDATE devices SET is_active = false, updated_at = $1 WHERE id = $2',
  [new Date().toISOString(), deviceId]
);
```

#### Query #30 — device_configs SELECT COUNT (health check)
**Line 1275 | Endpoint: GET /api/wireguard/health**
```js
// AFTER
const { rows: [{ count: totalDevices }] } = await db.query(
  "SELECT COUNT(*) FROM device_configs WHERE is_active = true"
);
```

#### Query #31 — vpn_nodes SELECT COUNT (health check)
**Line 1280 | Endpoint: GET /api/wireguard/health**
```js
// AFTER
const { rows: [{ count: totalNodes }] } = await db.query(
  "SELECT COUNT(*) FROM vpn_nodes WHERE is_active = true"
);
```

#### Query #32 — vpn_nodes SELECT (diagnose-ssh)
**Line 1314 | Endpoint: GET /api/wireguard/diagnose-ssh**
```js
// AFTER
const { rows: nodes } = await db.query(
  `SELECT id, name, public_ip, ssh_host, ssh_user, ssh_port,
   management_type, interface_name FROM vpn_nodes WHERE is_active = true`
);
```

---

### wireguard-manager.js — 7 database queries

#### WG Query #1 — vpn_nodes SELECT (initialize)
**Line 17**
```js
// AFTER
const { rows: nodes } = await this.db.query(
  'SELECT * FROM vpn_nodes WHERE is_active = true'
);
```

#### WG Query #2 — device_configs SELECT (getNextClientIP)
**Line 140**
```js
// AFTER
const { rows: existingDevices } = await this.db.query(
  'SELECT client_ip FROM device_configs WHERE node_id = $1 AND client_ip IS NOT NULL',
  [nodeId]
);
```

#### WG Query #3 — device_configs INSERT (generateDeviceConfig)
**Line 188**
```js
// AFTER
const { rows: [config] } = await this.db.query(
  `INSERT INTO device_configs (device_id, user_id, node_id, private_key, public_key,
   client_ip, dns_servers, created_at, is_active)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING *`,
  [deviceId, userId, node.id, privateKey, publicKey, clientIP, node.dns_servers || '1.1.1.1,8.8.8.8', new Date().toISOString()]
);
```

#### WG Query #4 — vpn_nodes UPDATE (generateDeviceConfig, client count)
**Line 204**
```js
// AFTER
await this.db.query(
  'UPDATE vpn_nodes SET current_clients = current_clients + 1, last_updated = $1 WHERE id = $2',
  [new Date().toISOString(), node.id]
);
```

#### WG Query #5 — device_configs SELECT+JOIN (removeDeviceConfig)
**Line 386**
```js
// AFTER
const { rows: [config] } = await this.db.query(
  `SELECT dc.*, vn.* FROM device_configs dc
   JOIN vpn_nodes vn ON dc.node_id = vn.id
   WHERE dc.device_id = $1`, [deviceId]
);
```

#### WG Query #6 — device_configs UPDATE (removeDeviceConfig, deactivate)
**Line 402**
```js
// AFTER
await this.db.query(
  'UPDATE device_configs SET is_active = false, deactivated_at = $1 WHERE device_id = $2',
  [new Date().toISOString(), deviceId]
);
```

#### WG Query #7 — vpn_nodes UPDATE (removeDeviceConfig + healthCheck)
**Lines 411 + 446**
```js
// removeDeviceConfig
await this.db.query(
  'UPDATE vpn_nodes SET current_clients = GREATEST(0, current_clients - 1), last_updated = $1 WHERE id = $2',
  [new Date().toISOString(), node.id]
);

// performHealthCheck
await this.db.query(
  'UPDATE vpn_nodes SET is_healthy = $1, last_health_check = $2 WHERE id = $3',
  [isHealthy, node.lastHealthCheck, nodeId]
);
```

---

## Frontend Files to Update

### Files with hardcoded Railway fallback URL

| File | Line | Current | Change to |
|------|------|---------|-----------|
| `src/lib/apiBase.js` | 9 | `'https://scvpn-production.up.railway.app'` | `'https://api.sacvpn.com'` |
| `src/pages/Pricing.jsx` | 8 | `"https://scvpn-production.up.railway.app"` | `"https://api.sacvpn.com"` |
| `src/pages/Pricing-new.jsx` | 15 | `"https://scvpn-production.up.railway.app"` | `"https://api.sacvpn.com"` |
| `src/pages/PricingFinal.jsx` | 33 | `"https://scvpn-production.up.railway.app"` | `"https://api.sacvpn.com"` |
| `src/pages/PostCheckout.jsx` | 36 | `"https://scvpn-production.up.railway.app"` | `"https://api.sacvpn.com"` |
| `src/pages/PostCheckout.jsx` | 81 | `"https://scvpn-production.up.railway.app"` | `"https://api.sacvpn.com"` |

### Environment files

| File | Variable | Current | Change to |
|------|----------|---------|-----------|
| `.env.local` | `VITE_API_URL` | `https://scvpn-production.up.railway.app` | `https://api.sacvpn.com` |
| Vercel Dashboard | `VITE_API_URL` | `https://scvpn-production.up.railway.app` | `https://api.sacvpn.com` |

---

## Phase 1: Texas Infrastructure Setup

### 1A. Create directory structure

```bash
ssh stephens-code2@98.96.14.4
mkdir -p ~/docker/sacvpn/api
mkdir -p ~/docker/sacvpn/ssh
```

### 1B. Create docker-compose.yml

```yaml
# ~/docker/sacvpn/docker-compose.yml
version: '3.8'

services:
  sacvpn-db:
    image: postgres:16-alpine
    container_name: sacvpn-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: sacvpn
      POSTGRES_USER: sacvpn
      POSTGRES_PASSWORD: ${SACVPN_DB_PASSWORD}
    volumes:
      - sacvpn_pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5438:5432"
    networks:
      - sacvpn-internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sacvpn"]
      interval: 10s
      timeout: 5s
      retries: 5

  sacvpn-api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: sacvpn-api
    restart: unless-stopped
    env_file: .env
    ports:
      - "127.0.0.1:8090:3000"
    depends_on:
      sacvpn-db:
        condition: service_healthy
    volumes:
      - ./ssh:/app/ssh:ro
    networks:
      - sacvpn-internal
    security_opt:
      - no-new-privileges:true

networks:
  sacvpn-internal:
    driver: bridge

volumes:
  sacvpn_pgdata:
```

### 1C. Create .env file

```bash
# ~/docker/sacvpn/.env
# Copy all vars from Railway (see "Environment Variables" section above)
# + add DATABASE_URL=postgresql://sacvpn:<password>@sacvpn-db:5432/sacvpn
```

### 1D. Copy SSH deploy key

```bash
# Copy the private key to ~/docker/sacvpn/ssh/vpn_deploy_key
# This is the ED25519 key already added to Texas server's authorized_keys
chmod 600 ~/docker/sacvpn/ssh/vpn_deploy_key
```

### 1E. DNS record

Add `api.sacvpn.com` → A record → `98.96.14.4` in Cloudflare/DNS provider.

### 1F. Caddy reverse proxy

```bash
# Add to existing Caddyfile
api.sacvpn.com {
    reverse_proxy localhost:8090
}

# Reload Caddy
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## Phase 2: Database Migration

### 2A. Get Supabase connection string

Go to Supabase Dashboard → Settings → Database → Connection string (URI).
Format: `postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### 2B. pg_dump from Supabase

```bash
pg_dump "<supabase-connection-string>" \
  --no-owner --no-acl --no-comments \
  --data-only \
  -t profiles -t devices -t subscriptions -t checkout_sessions \
  -t vpn_nodes -t device_configs -t device_telemetry \
  -t key_requests -t admin_emails \
  > sacvpn_data.sql
```

### 2C. Create schema on Texas (use cleaned schema from this doc)

```bash
# Create all tables (from the schema definitions above, WITHOUT RLS)
psql -h 127.0.0.1 -p 5438 -U sacvpn -d sacvpn < sacvpn_schema_clean.sql
```

### 2D. Import data

```bash
psql -h 127.0.0.1 -p 5438 -U sacvpn -d sacvpn < sacvpn_data.sql
```

### 2E. Verify

```bash
psql -h 127.0.0.1 -p 5438 -U sacvpn -d sacvpn -c "
  SELECT 'profiles' as tbl, count(*) FROM profiles
  UNION ALL SELECT 'subscriptions', count(*) FROM subscriptions
  UNION ALL SELECT 'devices', count(*) FROM devices
  UNION ALL SELECT 'device_configs', count(*) FROM device_configs
  UNION ALL SELECT 'vpn_nodes', count(*) FROM vpn_nodes
  UNION ALL SELECT 'admin_emails', count(*) FROM admin_emails;
"
```

---

## Phase 3: API Code Changes

### 3A. Add `pg` to package.json

```bash
cd scvpn-api && npm install pg
```

### 3B. Create `db.js`

```js
// scvpn-api/db.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});

export default pool;
```

### 3C. Update server.js

1. `import db from './db.js'`
2. Keep `createClient` import for auth only
3. Convert all 31 `.from()` queries per the conversion table above
4. Keep both `supabase.auth.getUser()` calls
5. Replace `supabase.rpc()` calls with direct SQL
6. Add user ownership checks where RLS previously enforced them

### 3D. Update wireguard-manager.js

1. Change constructor: `constructor(db, logger)` instead of `constructor(supabase, logger)`
2. Replace `this.supabase` with `this.db`
3. Convert all 7 `.from()` queries per the conversion table above

### 3E. Update server.js initialization

```js
// BEFORE
const wgManager = supabase ? new WireGuardManager(supabase, app.log) : null;

// AFTER
import db from './db.js';
const wgManager = new WireGuardManager(db, app.log);
```

### 3F. Update Dockerfile

```dockerfile
FROM node:20-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends sshpass openssh-client wireguard-tools && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Phase 4: Frontend + DNS + Stripe

### 4A. Update all frontend files

Replace `scvpn-production.up.railway.app` with `api.sacvpn.com` in all 6 locations listed above.

### 4B. Update Vercel env var

Set `VITE_API_URL=https://api.sacvpn.com` in Vercel dashboard.

### 4C. Update Stripe webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.sacvpn.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret → set as `STRIPE_WEBHOOK_SECRET` in Texas `.env`
5. **Keep old Railway webhook active** during transition

---

## Phase 5: Cutover & Verification

### Test sequence

```bash
# 1. Health check
curl https://api.sacvpn.com/api/healthz

# 2. Config check
curl https://api.sacvpn.com/api/debug/config

# 3. Node list
curl https://api.sacvpn.com/api/wireguard/nodes

# 4. SSH diagnostics
curl https://api.sacvpn.com/api/wireguard/diagnose-ssh

# 5. WireGuard health
curl https://api.sacvpn.com/api/wireguard/health
```

### Full verification checklist

- [ ] `GET /api/healthz` → `{ ok: true }`
- [ ] `GET /api/debug/config` → shows Stripe live mode
- [ ] `GET /api/wireguard/nodes` → returns 3 nodes
- [ ] `GET /api/wireguard/diagnose-ssh` → SSH OK for all 3 nodes
- [ ] Login on sacvpn.com works (Supabase Auth → API → Texas DB)
- [ ] Pricing page loads plans correctly
- [ ] Checkout creates Stripe session
- [ ] Webhook fires and creates subscription in Texas DB
- [ ] WireGuard key generation works
- [ ] Device config download works
- [ ] QR code generation works
- [ ] Admin panel works
- [ ] Email notifications work (welcome + admin)
- [ ] Billing portal redirect works

### After 48 hours stable

1. Delete Railway webhook endpoint in Stripe
2. Shut down Railway service
3. Update ALLOWED_ORIGINS to remove Railway URL
4. Add sacvpn DB to Texas backup script: `/home/stephens-code2/backups/backup.sh`

---

## Rollback Plan

If Texas fails after cutover:

1. Change `VITE_API_URL` back to `https://scvpn-production.up.railway.app` in Vercel
2. Re-enable Railway webhook in Stripe
3. Railway service should still be running (don't shut it down for 48 hours)
4. Frontend redeploys in ~60 seconds on Vercel

**Zero data loss:** During parallel operation, both Railway and Texas receive webhook events. If rollback needed, Railway's Supabase DB still has all data.

---

## New Dependency

```json
{
  "dependencies": {
    "pg": "^8.13.0"
  }
}
```

All other dependencies remain unchanged:
- `fastify` ^5.5.0
- `@fastify/cors` ^11.1.0
- `fastify-raw-body` ^5.0.0
- `stripe` ^18.5.0
- `@supabase/supabase-js` ^2.56.0 (KEEP — auth only)
- `@sendgrid/mail` ^8.1.6
- `qrcode` ^1.5.3
- `tweetnacl` ^1.0.3
