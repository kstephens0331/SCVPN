# SCVPN - San Antonio Cybersecurity VPN

## Overview

SCVPN is a full-featured VPN management dashboard and subscription service. Users can subscribe to tiered plans, manage WireGuard connections across multiple server nodes, and monitor device telemetry in real time. The platform includes Stripe-powered billing, an admin runbook for operations, and a comprehensive analytics dashboard with row-level security throughout.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| State Management | Zustand |
| Charts | Recharts |
| Backend / Auth | Supabase (PostgreSQL + RLS) |
| Payments | Stripe (subscriptions & billing) |
| VPN Protocol | WireGuard |
| Email | SendGrid (transactional emails) |
| Deployment | Vercel |

## Features

- **Subscription Plans** - Multiple tiers with Stripe-managed billing cycles
- **Stripe Integration** - Checkout sessions, webhooks, customer portal, and invoice management
- **WireGuard Node Deployment** - Server nodes in Dallas and Virginia with automated provisioning
- **Device Telemetry** - Real-time bandwidth, latency, and connection health monitoring
- **Analytics Dashboard** - Visual insights via Recharts for traffic, usage, and subscriber metrics
- **Admin Runbook** - Step-by-step operational procedures for node management and incident response
- **Row-Level Security** - Supabase RLS policies ensure data isolation between users
- **SendGrid Emails** - Welcome emails, billing receipts, and security alerts

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (or self-hosted Supabase)
- Stripe account
- SendGrid API key

### Installation

```bash
git clone https://github.com/kstephens0331/SCVPN.git
cd SCVPN
npm install
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
SENDGRID_API_KEY=your_sendgrid_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
SCVPN/
├── src/
│   ├── components/         # UI components (dashboard, billing, telemetry)
│   ├── pages/              # Route pages
│   ├── store/              # Zustand state management
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Supabase client, Stripe helpers
│   └── utils/              # Shared utilities
├── supabase/
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions (webhooks, provisioning)
├── docs/
│   └── runbook.md          # Admin operations runbook
├── public/                 # Static assets
└── vite.config.ts          # Vite configuration
```

## License

MIT License

---

**Built by StephensCode LLC**
