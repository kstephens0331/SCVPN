# ❗ MISSING ITEMS & ADDITIONAL WORK REQUIRED

**Last Updated:** 2025-10-21
**Purpose:** Comprehensive list of ALL remaining work beyond basic VPN setup

---

## 🔴 CRITICAL MISSING ITEMS (Must Have for Launch)

### 1. QR Code Generation in API
**Status:** Code written, not integrated
**Location:** `email-service.js` created, but not imported into `server.js`
**What's Needed:**
- [ ] Install `qrcode` npm package in scvpn-api
- [ ] Import QR generator into server.js
- [ ] Modify `/api/device/:id/config` endpoint to generate QR
- [ ] Return QR as base64 data URL
- [ ] Frontend needs to display QR code

**Code to Add:**
```bash
cd scvpn-api
npm install qrcode
```

**Files to Modify:**
- `scvpn-api/server.js` - Import qrcode, generate in config endpoint
- `scvpn-api/package.json` - Add qrcode dependency

---

### 2. Email Notifications
**Status:** Service class written, not integrated
**What's Needed:**
- [ ] Create Resend.com account (https://resend.com)
- [ ] Verify sending domain (sacvpn.com)
- [ ] Get Resend API key
- [ ] Add RESEND_API_KEY to Railway
- [ ] Import EmailService into server.js
- [ ] Call sendVPNSetupEmail() after key generation
- [ ] Add `resend` npm package

**Code to Add:**
```bash
cd scvpn-api
npm install resend
```

**Files to Modify:**
- `scvpn-api/server.js` - Import and use EmailService
- `scvpn-api/package.json` - Add resend dependency

---

### 3. Frontend QR Code Display
**Status:** Not implemented at all
**What's Needed:**
- [ ] Add QR code display to device page
- [ ] Show QR for mobile devices
- [ ] Show download button for desktop
- [ ] Auto-detect device type
- [ ] Add `qrcode.react` package to frontend

**Files to Create/Modify:**
- `src/components/DeviceQRCode.jsx` - New component
- `src/pages/personal/Devices.jsx` - Add QR display
- `package.json` - Add qrcode.react dependency

---

### 4. Automated Key Processing (Cron Job)
**Status:** Manual trigger only, no automation
**What's Needed:**
- [ ] Create GitHub Actions workflow
- [ ] Set up cron schedule (every 5 minutes)
- [ ] Add Railway API URL to GitHub secrets
- [ ] Test automated processing

**File to Create:**
`.github/workflows/process-vpn-keys.yml`
```yaml
name: Process VPN Keys
on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Process pending key requests
        run: |
          curl -f -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests
```

---

### 5. Stripe Webhook Debugging
**Status:** Partially working, needs verification
**What's Needed:**
- [ ] Test webhook signature validation
- [ ] Verify subscription.created updates database
- [ ] Verify subscription.updated works
- [ ] Verify subscription.deleted works
- [ ] Test refund handling
- [ ] Add comprehensive logging

**How to Test:**
```bash
# Install Stripe CLI
stripe listen --forward-to https://scvpn-production.up.railway.app/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
```

---

### 6. Post-Checkout Account Creation
**Status:** Code exists, needs testing
**What's Needed:**
- [ ] Test /post-checkout page
- [ ] Verify session claiming works
- [ ] Verify user can create account
- [ ] Verify subscription links to user
- [ ] Test edge cases (expired session, already claimed)

---

## 🟡 IMPORTANT MISSING ITEMS (Should Have)

### 7. Device Config Download Endpoint Auth
**Status:** RPC function exists, may need RLS testing
**What's Needed:**
- [ ] Verify RLS allows users to download own configs
- [ ] Test that users can't download others' configs
- [ ] Add admin override for support

---

### 8. Telemetry Collection
**Status:** Database schema exists, collection not implemented
**What's Needed:**
- [ ] Create script to SSH to nodes and collect `wg show` data
- [ ] Parse WireGuard output
- [ ] Insert into device_telemetry table
- [ ] Update device_latest_telemetry view
- [ ] Run every 5 minutes via cron

**File to Create:**
`scvpn-api/collect-telemetry.js`

---

### 9. Node Health Monitoring
**Status:** Database columns exist, monitoring not active
**What's Needed:**
- [ ] Ping nodes every 5 minutes
- [ ] Update is_healthy column
- [ ] Update last_health_check timestamp
- [ ] Send alerts if node goes down
- [ ] Automatically disable unhealthy nodes

**Add to WireGuardManager:**
```javascript
async performHealthCheck() {
  // Already stubbed in wireguard-manager.js
  // Need to actually call this periodically
}
```

---

### 10. Node Failover Logic
**Status:** Selection logic exists, no active failover
**What's Needed:**
- [ ] Detect when primary node is unhealthy
- [ ] Route new requests to secondary
- [ ] (Optional) Migrate existing clients to healthy node
- [ ] Send admin alert on failover

---

### 11. Gaming Plan Optimization
**Status:** Node priority exists, gaming flag not used
**What's Needed:**
- [ ] Update vpn_nodes to mark VA as gaming_optimized
- [ ] Modify selectBestNode() to prefer gaming nodes for gaming users
- [ ] Pass user plan to node selection
- [ ] Test gaming users get VA Primary

**SQL to Run:**
```sql
UPDATE vpn_nodes
SET gaming_optimized = true,
    performance_tier = 'premium'
WHERE name = 'SACVPN-VA-Primary';
```

---

### 12. Admin Device Management
**Status:** Frontend shows devices, limited actions
**What's Needed:**
- [ ] Add admin action: Revoke key
- [ ] Add admin action: Regenerate key
- [ ] Add admin action: Force disconnect
- [ ] Add admin action: View device config
- [ ] Add bulk actions

---

### 13. Business Account Team Management
**Status:** Database supports it, UI incomplete
**What's Needed:**
- [ ] Add "Manage Team" page for business users
- [ ] Invite team members
- [ ] Assign roles (admin/member)
- [ ] View team members
- [ ] Remove team members
- [ ] Track device quotas per user

---

### 14. Subscription Management UI
**Status:** Billing page shows subscription, no actions
**What's Needed:**
- [ ] Add "Upgrade Plan" button
- [ ] Add "Downgrade Plan" flow
- [ ] Add "Cancel Subscription" button
- [ ] Show upcoming invoice
- [ ] Show payment method
- [ ] Link to Stripe billing portal

---

## 🟢 NICE-TO-HAVE ITEMS (Can Defer)

### 15. Multi-Region Node Support
**Status:** Architecture supports it, only 2 nodes active
**What's Needed:**
- [ ] Add EU node (future)
- [ ] Add Asia node (future)
- [ ] Geographic routing based on user location
- [ ] Let users manually select region

---

### 16. Connection Analytics
**Status:** No analytics yet
**What's Needed:**
- [ ] Track connection duration
- [ ] Track bandwidth usage per user
- [ ] Show usage graphs in dashboard
- [ ] Alert on unusual usage patterns

---

### 17. Speed Test Integration
**Status:** Not implemented
**What's Needed:**
- [ ] Add speed test button in dashboard
- [ ] Run speedtest from VPN node
- [ ] Display results to user
- [ ] Track speed over time

---

### 18. Kill Switch Feature
**Status:** Client-side only (WireGuard app handles)
**What's Needed:**
- Document how to enable in WireGuard app
- No server-side work needed

---

### 19. Split Tunneling Configuration
**Status:** Not supported
**What's Needed:**
- [ ] Allow users to configure AllowedIPs
- [ ] Provide presets (All Traffic, Specific Apps, etc.)
- [ ] Generate custom configs

---

### 20. 2FA for Accounts
**Status:** Not implemented
**What's Needed:**
- [ ] Use Supabase Auth MFA
- [ ] Add 2FA enrollment flow
- [ ] Require for admin accounts
- [ ] Require for business accounts

---

### 21. Audit Logging
**Status:** Basic API logging only
**What's Needed:**
- [ ] Log all admin actions
- [ ] Log all device additions/removals
- [ ] Log all key generations
- [ ] Log all subscription changes
- [ ] Provide audit log viewer for business accounts

---

### 22. IP Whitelisting (Business Feature)
**Status:** Not implemented
**What's Needed:**
- [ ] Allow business accounts to whitelist IPs
- [ ] Only allow VPN access from whitelisted IPs
- [ ] Add whitelist management UI

---

### 23. Custom DNS Settings
**Status:** Hardcoded to 1.1.1.1
**What's Needed:**
- [ ] Allow users to set custom DNS
- [ ] Provide presets (Cloudflare, Google, Quad9, AdBlock)
- [ ] Regenerate config with new DNS

---

### 24. Device Naming/Icons
**Status:** Basic text name only
**What's Needed:**
- [ ] Add device type selection (laptop, phone, tablet, etc.)
- [ ] Show icons instead of/with text
- [ ] Auto-detect device type from user agent

---

### 25. Referral Program
**Status:** Not implemented
**What's Needed:**
- [ ] Generate referral links
- [ ] Track referrals
- [ ] Give credit to referrer
- [ ] Show referral stats in dashboard

---

## 🔧 INFRASTRUCTURE ITEMS

### 26. Database Backups
**Status:** Supabase handles automatically
**What's Needed:**
- [ ] Verify backup schedule
- [ ] Test restore process
- [ ] Document recovery procedure

---

### 27. Monitoring & Alerting
**Status:** Basic Railway monitoring only
**What's Needed:**
- [ ] Set up Sentry for error tracking
- [ ] Set up Uptime monitoring (UptimeRobot)
- [ ] Alert on API downtime
- [ ] Alert on node downtime
- [ ] Alert on high error rates

---

### 28. Rate Limiting
**Status:** Not implemented
**What's Needed:**
- [ ] Add rate limiting to API endpoints
- [ ] Prevent abuse of key generation
- [ ] Prevent DDoS on checkout
- [ ] Add CAPTCHA if needed

---

### 29. CDN for Frontend
**Status:** Likely already handled by Vercel/Railway
**What's Needed:**
- [ ] Verify CDN is active
- [ ] Optimize asset delivery
- [ ] Set proper cache headers

---

### 30. SSL Certificate Management
**Status:** Railway/Vercel handles
**What's Needed:**
- [ ] Verify SSL is active
- [ ] Set up auto-renewal
- [ ] Monitor expiration

---

## 📚 DOCUMENTATION ITEMS

### 31. User Documentation
**Status:** Not created
**What's Needed:**
- [ ] Setup guide for each platform
- [ ] Troubleshooting guide
- [ ] FAQ page (expand existing)
- [ ] Video tutorials

---

### 32. API Documentation
**Status:** No public docs
**What's Needed:**
- [ ] Document all API endpoints
- [ ] Create OpenAPI/Swagger spec
- [ ] Publish API docs (if making public API)

---

### 33. Admin Runbook
**Status:** Mentioned in plan, not created
**What's Needed:**
- [ ] How to add new node
- [ ] How to debug failed key generation
- [ ] How to handle customer issues
- [ ] Emergency procedures
- [ ] Contact escalation

---

### 34. Security Documentation
**Status:** Not created
**What's Needed:**
- [ ] Security best practices
- [ ] Incident response plan
- [ ] Data retention policy
- [ ] Privacy policy
- [ ] Terms of service

---

## 🧪 TESTING ITEMS

### 35. Unit Tests
**Status:** None
**What's Needed:**
- [ ] Set up Jest
- [ ] Test WireGuardManager functions
- [ ] Test API endpoints
- [ ] Test email service
- [ ] Aim for >80% coverage

---

### 36. Integration Tests
**Status:** None
**What's Needed:**
- [ ] Test full signup flow
- [ ] Test payment flow
- [ ] Test key generation flow
- [ ] Test webhook handling

---

### 37. Load Testing
**Status:** Not done
**What's Needed:**
- [ ] Use k6 or Artillery
- [ ] Test 100+ concurrent signups
- [ ] Test 500+ concurrent VPN connections
- [ ] Test API under load

---

### 38. Security Testing
**Status:** Not done
**What's Needed:**
- [ ] Pen testing
- [ ] Vulnerability scanning
- [ ] Dependency audit
- [ ] SQL injection testing
- [ ] XSS testing

---

## 📊 PRIORITY MATRIX

### MUST DO BEFORE LAUNCH (Week 1):
1. ✅ VPN node deployment
2. ✅ Railway env vars
3. ❌ QR code generation (#1)
4. ❌ Email notifications (#2)
5. ❌ Automated cron (#4)
6. ❌ Stripe webhook testing (#5)
7. ❌ End-to-end testing
8. ❌ Basic monitoring (#27)

### SHOULD DO WEEK 2:
9. Node health monitoring (#9)
10. Telemetry collection (#8)
11. Gaming optimization (#11)
12. Admin device actions (#12)
13. Subscription management UI (#14)

### CAN DO LATER:
- Everything else (15-38)

---

## 🎯 IMMEDIATE NEXT STEPS AFTER VPN DEPLOYMENT

1. **Install npm packages** (5 min)
   ```bash
   cd scvpn-api
   npm install qrcode resend
   ```

2. **Integrate QR generation** (30 min)
   - Modify `/api/device/:id/config` endpoint
   - Generate QR code from WireGuard config
   - Return in response

3. **Integrate email service** (45 min)
   - Set up Resend account
   - Import EmailService
   - Call after key generation
   - Test email delivery

4. **Create cron job** (15 min)
   - Create GitHub Actions workflow
   - Test automated processing

5. **Test Stripe webhooks** (1 hour)
   - Install Stripe CLI
   - Trigger test events
   - Verify database updates
   - Fix any issues

**Total Time:** ~3 hours of focused work

---

## 📋 SUMMARY

**Total Items Identified:** 38
**Critical (Must Have):** 6
**Important (Should Have):** 14
**Nice-to-Have (Can Defer):** 18

**Estimated Work Remaining:**
- Critical Items: ~1-2 days
- Important Items: ~2-3 days
- Nice-to-Have: ~2-4 weeks

**Can Launch With:** Just the 6 critical items completed

---

**Next:** Complete VPN deployment, then tackle items #1-6 in order
