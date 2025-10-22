# 🏗️ SACVPN SYSTEM ARCHITECTURE

**Last Updated:** 2025-10-21
**Purpose:** Complete technical architecture documentation

---

## 📊 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  (Browsers, Mobile Apps, WireGuard Clients)                     │
└────────────┬────────────────────────────────────┬───────────────┘
             │                                    │
             │ HTTPS                              │ WireGuard VPN
             │                                    │ (UDP 51820)
             ▼                                    ▼
┌────────────────────────┐            ┌──────────────────────────┐
│   FRONTEND (Vite/React) │            │    VPN NODES             │
│   www.sacvpn.com        │            │                          │
│   - Marketing Pages     │            │  ┌──────────────────┐   │
│   - User Dashboards     │            │  │ VA Primary       │   │
│   - Admin Portal        │            │  │ 135.148.121.237  │   │
│   - Authentication UI   │            │  │ Priority: 1      │   │
└────────────┬────────────┘            │  │ Gaming Optimized │   │
             │                         │  └──────────────────┘   │
             │ REST API                │                          │
             ▼                         │  ┌──────────────────┐   │
┌────────────────────────┐             │  │ Dallas Central   │   │
│   API SERVER (Fastify)  │             │  │ 45.79.8.145      │   │
│   Railway Hosted        │             │  │ Priority: 2      │   │
│                         │             │  │ Standard Tier    │   │
│  ┌──────────────────┐  │             │  └──────────────────┘   │
│  │ WireGuard Manager│  │─────SSH────▶│                          │
│  ├──────────────────┤  │             └──────────────────────────┘
│  │ Email Service    │  │
│  ├──────────────────┤  │
│  │ Stripe Webhooks  │  │◀────────┐
│  ├──────────────────┤  │         │
│  │ Auth Middleware  │  │         │
│  └──────────────────┘  │         │
└────────┬───────┬───────┘         │
         │       │                 │
         │       └─────────────┐   │
         ▼                     ▼   │
┌────────────────────┐  ┌──────────────────┐
│   SUPABASE         │  │  STRIPE          │
│   (PostgreSQL)     │  │  (Payments)      │
│                    │  │                  │
│  - Users/Profiles  │  │  - Checkouts     │
│  - Subscriptions   │  │  - Subscriptions │
│  - Devices         │  │  - Webhooks      │
│  - VPN Nodes       │  │  - Invoices      │
│  - Configs         │  │                  │
│  - Telemetry       │  └──────────────────┘
└────────────────────┘
         │
         │
         ▼
┌────────────────────┐
│   RESEND           │
│   (Email Service)  │
│                    │
│  - Setup Emails    │
│  - QR Codes        │
│  - Notifications   │
└────────────────────┘
```

---

## 🔄 USER JOURNEY FLOWS

### 1. New User Signup & VPN Setup

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: SIGNUP & PAYMENT                                         │
└──────────────────────────────────────────────────────────────────┘

User → www.sacvpn.com/signup
   ↓
Select Plan (Personal/Gaming/Business)
   ↓
Redirected to Stripe Checkout
   ↓
Enter Payment Info
   ↓
Stripe processes payment
   ↓
Stripe sends webhook → API Server
   ↓
API creates subscription record in Supabase
   ↓
User redirected to /post-checkout
   ↓
User creates account (email + password)
   ↓
Account linked to subscription via session_id
   ↓
User lands on Personal/Gaming/Business Dashboard

┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: ADD DEVICE                                               │
└──────────────────────────────────────────────────────────────────┘

User clicks "Add New Device"
   ↓
Enters device name and selects platform
   ↓
Clicks "Request Access"
   ↓
Frontend → POST /api/device (creates device record)
   ↓
Frontend → POST /api/vpn/request (creates key_requests record)
   ↓
Database stores request with status = 'pending'
   ↓
User sees "Processing... check back in 5 minutes"

┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: AUTOMATED KEY GENERATION (GitHub Actions Cron)          │
└──────────────────────────────────────────────────────────────────┘

GitHub Actions runs every 5 minutes
   ↓
Calls POST /api/wireguard/process-requests
   ↓
API fetches all pending requests from Supabase
   ↓
For each request:
   ├─ Select best VPN node (priority-based)
   ├─ Generate client private/public key pair
   ├─ SSH into VPN node
   ├─ Add peer to WireGuard config
   ├─ Reload WireGuard service
   ├─ Create device_configs record in database
   ├─ Generate QR code from config
   ├─ Send email with QR code and .conf file
   └─ Update key_requests status = 'completed'

┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: USER RECEIVES CONFIG                                    │
└──────────────────────────────────────────────────────────────────┘

User receives email from SACVPN
   ↓
Email contains:
   ├─ QR code (for mobile)
   ├─ Setup instructions (platform-specific)
   └─ .conf file attachment
   ↓
User can also:
   ├─ View config in dashboard (click "View Config")
   ├─ Download .conf file
   └─ Copy config to clipboard

┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: CONNECT TO VPN                                          │
└──────────────────────────────────────────────────────────────────┘

User installs WireGuard app
   ↓
Imports config:
   ├─ Mobile: Scan QR code
   └─ Desktop: Import .conf file
   ↓
Toggles VPN on
   ↓
WireGuard connects to VPN node
   ↓
User's traffic routes through VPN
   ↓
User's IP = VPN node's IP
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

#### **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** User account information
**RLS:** Users can only read/update their own profile

---

#### **subscriptions**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL, -- 'personal', 'gaming', 'business10', etc.
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  device_limit INTEGER,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Links users to Stripe subscriptions
**Device Limits:**
- Personal: 999 (unlimited)
- Gaming: 999 (unlimited)
- Business10: 10
- Business50: 50
- Business250: 250

---

#### **devices**
```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  name TEXT NOT NULL,
  platform TEXT, -- 'ios', 'android', 'windows', 'macos', 'linux'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Track all user devices
**RLS:** Users can only access their own devices

---

#### **vpn_nodes**
```sql
CREATE TABLE vpn_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  region TEXT, -- 'us-east', 'us-central'
  public_ip TEXT UNIQUE NOT NULL,
  port INTEGER DEFAULT 51820,
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT, -- Not used (keys stored on nodes)
  subnet TEXT NOT NULL, -- '10.66.0.0/24', '10.77.0.0/24'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 999, -- Lower = preferred
  gaming_optimized BOOLEAN DEFAULT false,
  performance_tier TEXT DEFAULT 'standard', -- 'standard', 'premium'
  location TEXT, -- 'Virginia', 'Dallas'
  max_clients INTEGER DEFAULT 1000,
  current_clients INTEGER DEFAULT 0,
  is_healthy BOOLEAN DEFAULT true,
  last_health_check TIMESTAMPTZ,
  ssh_user TEXT,
  ssh_host TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** VPN server inventory
**Current Nodes:**
1. SACVPN-VA-Primary (135.148.121.237) - Gaming optimized, Priority 1
2. SACVPN-Dallas-Central (45.79.8.145) - Standard, Priority 2

---

#### **key_requests**
```sql
CREATE TABLE key_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  device_id UUID REFERENCES devices(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```
**Purpose:** Queue for VPN key generation
**Workflow:**
1. User adds device → Creates 'pending' request
2. Cron job picks up pending requests
3. Generates keys → Updates to 'completed'

---

#### **device_configs**
```sql
CREATE TABLE device_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  node_id UUID REFERENCES vpn_nodes(id) NOT NULL,
  client_ip TEXT NOT NULL, -- '10.66.0.2', '10.77.0.5', etc.
  client_public_key TEXT NOT NULL,
  client_private_key_encrypted TEXT,
  wg_config TEXT, -- Full WireGuard config
  qr_code_data TEXT, -- Base64 QR code image
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Stores generated VPN configurations
**Note:** Private keys encrypted at rest

---

#### **device_telemetry**
```sql
CREATE TABLE device_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id) NOT NULL,
  node_id UUID REFERENCES vpn_nodes(id),
  bytes_sent BIGINT,
  bytes_received BIGINT,
  last_handshake TIMESTAMPTZ,
  is_connected BOOLEAN,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Purpose:** Track VPN usage statistics
**Status:** Schema ready, collection not yet implemented

---

## 🔐 AUTHENTICATION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│ SUPABASE AUTH (JWT-based)                                       │
└─────────────────────────────────────────────────────────────────┘

User logs in → Supabase Auth
   ↓
Supabase generates JWT token
   ↓
Frontend stores token in localStorage
   ↓
All API requests include Authorization header:
   Authorization: Bearer <jwt_token>
   ↓
API verifies token with Supabase
   ↓
Token contains user_id → Used for RLS policies
   ↓
Database enforces Row Level Security:
   - Users only see their own data
   - Admins see all data (via admin check)
```

### Admin Access
```sql
-- Admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND email IN ('admin@sacvpn.com', 'stephen@sacvpn.com')
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

---

## 💳 STRIPE PAYMENT FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│ CHECKOUT FLOW                                                    │
└─────────────────────────────────────────────────────────────────┘

Frontend → POST /api/create-checkout-session
   {
     plan: 'personal', // or 'gaming', 'business10', etc.
     successUrl: 'https://www.sacvpn.com/post-checkout',
     cancelUrl: 'https://www.sacvpn.com/pricing'
   }
   ↓
API creates Stripe Checkout Session
   ↓
Returns { url: 'https://checkout.stripe.com/...' }
   ↓
User redirected to Stripe checkout page
   ↓
User enters payment info
   ↓
Stripe processes payment
   ↓
User redirected to successUrl with ?session_id=...

┌─────────────────────────────────────────────────────────────────┐
│ WEBHOOK PROCESSING                                               │
└─────────────────────────────────────────────────────────────────┘

Stripe → POST /api/stripe/webhook
   Event: checkout.session.completed
   ↓
API validates webhook signature
   ↓
API retrieves full session from Stripe
   ↓
API stores in checkout_sessions table:
   - session_id
   - stripe_customer_id
   - stripe_subscription_id
   - plan_type
   - amount_paid
   ↓
User claims session on /post-checkout:
   - Creates account
   - Links subscription to user_id
```

### Webhook Events Handled
1. **checkout.session.completed** → Create session record
2. **customer.subscription.created** → Create subscription record
3. **customer.subscription.updated** → Update subscription (plan change, cancellation)
4. **customer.subscription.deleted** → Mark subscription inactive
5. **invoice.payment_failed** → Mark subscription past_due

---

## 🌐 VPN NODE ARCHITECTURE

### Node Selection Logic
```javascript
// In WireGuardManager.selectBestNode()

1. Filter nodes:
   - is_active = true
   - current_clients < max_clients
   - is_healthy = true

2. For Gaming users:
   - Prefer gaming_optimized = true nodes
   - Prefer performance_tier = 'premium'

3. Sort by priority (ascending)
   - Priority 1 = VA Primary
   - Priority 2 = Dallas Central

4. Return first available node
```

### WireGuard Configuration

#### VA Primary (135.148.121.237)
```ini
[Interface]
PrivateKey = nMPOwCtInSfDUIl7RQc8WM4+gBy88Cq7dghvAH3LVSs=
Address = 10.66.0.1/24
ListenPort = 51820

PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```

#### Dallas Central (45.79.8.145)
```ini
[Interface]
PrivateKey = a3YWIHKfwF+ksp7WET7K/YJbAPAFJj6t4nLpeMJcPmM=
Address = 10.77.0.1/24
ListenPort = 51820

PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
```

### Client Configuration Template
```ini
[Interface]
PrivateKey = <client_private_key>
Address = <assigned_ip>/32
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = <node_public_key>
Endpoint = <node_ip>:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
```

---

## 📧 EMAIL SYSTEM

### Email Service Architecture
```javascript
// scvpn-api/email-service.js

EmailService
  ├─ constructor(resendApiKey, logger)
  ├─ sendVPNSetupEmail()
  │   ├─ detectMobileFromDeviceName()
  │   ├─ getMobileSetupEmail() → Returns HTML with QR
  │   └─ getDesktopSetupEmail() → Returns HTML with download link
  └─ sanitizeFilename()
```

### Email Templates

#### Mobile Email (includes QR code)
- Large QR code image embedded
- "Scan with WireGuard app" instructions
- Platform-specific app download links
- Fallback: Download .conf file
- Attachment: .conf file

#### Desktop Email (no QR code)
- Download .conf file instructions
- Platform-specific setup guides
- WireGuard app download links
- Troubleshooting tips
- Attachment: .conf file

---

## 🔄 AUTOMATED PROCESSING (GitHub Actions)

### Cron Job Configuration
```yaml
# .github/workflows/process-vpn-keys.yml

name: Process VPN Key Requests
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:        # Allow manual trigger

jobs:
  process-keys:
    runs-on: ubuntu-latest
    steps:
      - name: Process pending VPN key requests
        run: |
          curl -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests
```

### Processing Logic
1. Fetch all `key_requests` with status = 'pending'
2. For each request:
   - Get user subscription and plan
   - Select best VPN node
   - Generate WireGuard key pair
   - Assign client IP from node's subnet
   - SSH to node and add peer
   - Store config in `device_configs`
   - Generate QR code
   - Send email
   - Update request status to 'completed'

---

## 🔧 API ENDPOINTS

### Public Endpoints (No Auth)
```
POST   /api/create-checkout-session   # Create Stripe checkout
POST   /api/stripe/webhook             # Stripe webhook handler
GET    /health                         # Health check
```

### Authenticated Endpoints (Require JWT)
```
# Device Management
POST   /api/device                     # Create device
GET    /api/device/:id/config          # Download .conf file
GET    /api/device/:deviceId/config-data # Get config + QR (JSON)

# VPN Management
POST   /api/vpn/request                # Request VPN key
POST   /api/wireguard/process-requests # Process pending requests (cron)

# User Management
GET    /api/user/subscription          # Get user subscription
GET    /api/user/devices               # Get user devices
```

### Admin Endpoints (Require Admin)
```
GET    /api/admin/users                # List all users
GET    /api/admin/subscriptions        # List all subscriptions
GET    /api/admin/devices              # List all devices
GET    /api/admin/nodes                # List all VPN nodes
GET    /api/admin/telemetry            # Get telemetry data
```

---

## 🖥️ FRONTEND ARCHITECTURE

### Tech Stack
- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.3
- **Styling:** Tailwind CSS 3.4.17
- **Animations:** Framer Motion 12.23.12
- **State:** Zustand 5.0.8 (auth only)
- **Routing:** React Router DOM 6.30.1
- **Charts:** Recharts 3.1.2
- **Icons:** Lucide React 0.540.0

### Page Structure
```
/
├─ / (Home)
├─ /pricing
├─ /features
├─ /about
├─ /contact
├─ /faq
├─ /signup
├─ /login
├─ /post-checkout
├─ /personal (Personal Dashboard)
│   ├─ /personal/overview
│   ├─ /personal/devices
│   ├─ /personal/billing
│   └─ /personal/settings
├─ /gaming (Gaming Dashboard)
│   ├─ /gaming/overview
│   ├─ /gaming/devices
│   ├─ /gaming/servers
│   ├─ /gaming/billing
│   └─ /gaming/settings
├─ /business (Business Dashboard)
│   ├─ /business/overview
│   ├─ /business/devices
│   ├─ /business/team
│   ├─ /business/billing
│   └─ /business/settings
└─ /admin (Admin Portal)
    ├─ /admin/users
    ├─ /admin/subscriptions
    ├─ /admin/devices
    └─ /admin/nodes
```

### Key Components
```
src/components/
├─ DeviceConfig.jsx          # QR code modal ✅ NEW
├─ Navigation.jsx            # Main nav bar
├─ Footer.jsx                # Footer
├─ DashboardLayout.jsx       # Dashboard wrapper
└─ ui/
    ├─ Button.jsx
    ├─ Input.jsx
    ├─ Card.jsx
    └─ Modal.jsx
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Frontend (www.sacvpn.com)
- **Platform:** Railway or Vercel
- **Build:** `npm run build` → Vite production build
- **Output:** `dist/` folder with static assets
- **CDN:** Automatic via platform
- **SSL:** Auto-managed

### API (scvpn-production.up.railway.app)
- **Platform:** Railway
- **Runtime:** Node 20.x
- **Build:** nixpacks.toml configuration
- **Process:** `npm start` → `node server.js`
- **Port:** 8080 (Railway auto-assigns)
- **Health Check:** `/health` endpoint

### Database (Supabase)
- **Host:** ltwuqjmncldopkutiyak.supabase.co
- **Type:** PostgreSQL 15
- **Backups:** Automatic daily
- **Connection:** Pooler for API (port 6543)

### VPN Nodes (Linode/DigitalOcean)
- **VA Primary:** 135.148.121.237 (ubuntu user)
- **Dallas Central:** 45.79.8.145 (root user)
- **OS:** Ubuntu 22.04 LTS
- **Software:** WireGuard, sshpass
- **Firewall:** Allow UDP 51820, SSH 22

---

## 🔒 SECURITY ARCHITECTURE

### Layer 1: Network Security
- HTTPS enforced (301 redirect)
- CORS with allowed origins only
- Rate limiting (to be implemented)
- DDoS protection via platform

### Layer 2: Authentication
- JWT tokens via Supabase Auth
- Secure token storage (httpOnly cookies recommended)
- Token expiry and refresh
- Admin role checks

### Layer 3: Database Security
- Row Level Security (RLS) on all tables
- Users only access own data
- Encrypted connections (SSL)
- Service key for API only
- Regular backups

### Layer 4: Payment Security
- Stripe handles all card data (PCI compliant)
- Webhook signature validation
- No card data stored locally
- HTTPS for all payment flows

### Layer 5: VPN Security
- WireGuard protocol (modern crypto)
- Unique keys per device
- Keys rotated on revocation
- Private keys encrypted at rest
- No logging policy (future documentation)

---

## 📊 MONITORING & OBSERVABILITY

### Current Monitoring
- Railway built-in logs
- Supabase dashboard
- Stripe dashboard
- GitHub Actions workflow logs

### Recommended Additions
1. **Sentry** - Error tracking
2. **UptimeRobot** - Uptime monitoring
3. **Grafana** - VPN node metrics
4. **Datadog** - APM and logs
5. **PostHog** - User analytics

---

## 🔄 FUTURE ENHANCEMENTS

### Phase 1 (Week 1-2)
- [ ] Telemetry collection (bandwidth tracking)
- [ ] Node health monitoring
- [ ] Annual billing option
- [ ] Contact form fixes

### Phase 2 (Week 3-8)
- [ ] Multi-region expansion (EU, Asia)
- [ ] Speed test integration
- [ ] Referral program
- [ ] 2FA implementation

### Phase 3 (Month 3+)
- [ ] Mobile apps (native)
- [ ] Browser extensions
- [ ] Split tunneling
- [ ] Custom DNS settings
- [ ] IP whitelisting (business)
- [ ] SOC 2 compliance

---

## 📚 RELATED DOCUMENTATION

- **CURRENT_STATUS_REPORT.md** - System readiness status
- **LAUNCH_CHECKLIST.md** - Step-by-step launch guide
- **MANUAL_DEPLOYMENT_STEPS.md** - VPN node deployment
- **IMPROVEMENT_ROADMAP.md** - 90-day enhancement plan
- **TESTING_CHECKLIST.md** - Comprehensive testing
- **MISSING_ITEMS_CHECKLIST.md** - Feature tracking

---

**This architecture supports:**
- ✅ Unlimited devices per subscription
- ✅ Multi-node VPN infrastructure
- ✅ Automated key generation
- ✅ Email notifications with QR codes
- ✅ Stripe payment processing
- ✅ Admin portal
- ✅ Three-tier pricing (Personal, Gaming, Business)

**Ready for:**
- 🚀 Production launch
- 📈 Scaling to thousands of users
- 🌍 Global expansion

---

**Last Updated:** 2025-10-21
