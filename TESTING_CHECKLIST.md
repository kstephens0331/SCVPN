# 🧪 SACVPN COMPLETE TESTING CHECKLIST

**Testing Phase:** Pre-Production → Production Validation
**Required Before:** System can be declared "100% operational"
**Owner:** Claude Agent
**Status:** NOT STARTED

---

## 🎯 TESTING PHILOSOPHY

**Nothing goes to production without:**
1. Unit/Integration testing of each component
2. End-to-end testing in staging
3. Live production testing with real money (test mode first)
4. Load and stress testing
5. Security penetration testing
6. User acceptance testing (UAT)

---

## 📋 PHASE 1: COMPONENT TESTING

### 1.1 Database Layer
- [ ] All tables exist and have correct schema
- [ ] RLS policies prevent unauthorized access
- [ ] Indexes created for performance
- [ ] Views return correct data
- [ ] RPC functions execute without errors
- [ ] Foreign key constraints enforced
- [ ] Test data seeded successfully

**Test Script:**
```sql
-- Test RLS on vpn_nodes
SELECT * FROM vpn_nodes; -- Should return active nodes only

-- Test RPC function
SELECT request_wg_key('test-device-id');

-- Test subscription query
SELECT * FROM subscriptions WHERE status = 'active';
```

### 1.2 API Endpoints
- [ ] `/api/healthz` returns 200
- [ ] `/api/wireguard/health` shows correct stats
- [ ] `/api/wireguard/nodes` returns active nodes
- [ ] `/api/checkout` creates Stripe session
- [ ] `/api/checkout/verify` retrieves session data
- [ ] `/api/stripe/webhook` processes events
- [ ] `/api/wireguard/process-requests` generates keys
- [ ] `/api/device/:id/config` downloads config file

**Test Commands:**
```bash
# Health checks
curl https://scvpn-production.up.railway.app/api/healthz
curl https://scvpn-production.up.railway.app/api/wireguard/health

# Node list
curl https://scvpn-production.up.railway.app/api/wireguard/nodes

# Process keys (should process pending requests)
curl -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests
```

### 1.3 VPN Nodes
- [ ] WireGuard service running on VA
- [ ] WireGuard service running on Dallas
- [ ] Can ping both nodes
- [ ] Port 51820/udp open on both
- [ ] IP forwarding enabled
- [ ] iptables rules correct
- [ ] Nodes registered in database

**Test Commands:**
```bash
# SSH into VA
ssh ubuntu@135.148.121.237
sudo systemctl status wg-quick@wg0
sudo wg show
ping -c 4 8.8.8.8

# SSH into Dallas
ssh root@45.79.8.145
systemctl status wg-quick@wg0
wg show
ping -c 4 8.8.8.8
```

### 1.4 WireGuard Manager
- [ ] Can generate private keys
- [ ] Can derive public keys
- [ ] IP allocation works (no conflicts)
- [ ] Node selection logic picks correct node
- [ ] SSH commands execute successfully
- [ ] Peer addition works
- [ ] Config generation produces valid WG config

---

## 📋 PHASE 2: INTEGRATION TESTING

### 2.1 Payment Flow (Stripe Test Mode)
- [ ] User clicks "Get Personal" on pricing page
- [ ] Redirected to Stripe checkout
- [ ] Test card (4242 4242 4242 4242) processes
- [ ] Redirected to /post-checkout with session_id
- [ ] Session verified successfully
- [ ] pending_signups row created
- [ ] User can create account
- [ ] Subscription created in database
- [ ] User redirected to dashboard

**Test Data:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### 2.2 Stripe Webhooks
- [ ] checkout.session.completed received
- [ ] pending_signups updated with email
- [ ] customer.subscription.created received
- [ ] subscriptions table updated
- [ ] customer.subscription.updated handled
- [ ] customer.subscription.deleted handled
- [ ] Webhook signature verified
- [ ] All events logged

**Test with Stripe CLI:**
```bash
stripe listen --forward-to https://scvpn-production.up.railway.app/api/stripe/webhook
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

### 2.3 Device Key Request Flow
- [ ] User adds device in dashboard
- [ ] Device saved to database
- [ ] User clicks "Request Key"
- [ ] key_requests row created (status: pending)
- [ ] Background job processes request
- [ ] WireGuard keys generated
- [ ] IP allocated from correct subnet
- [ ] device_configs row created
- [ ] Peer added to node via SSH
- [ ] Node current_clients incremented
- [ ] Email sent to user (if implemented)

### 2.4 Config Download
- [ ] User clicks "Download Config"
- [ ] .conf file downloads
- [ ] File contains correct private key
- [ ] Server public key correct
- [ ] Endpoint IP matches node
- [ ] DNS servers set to 1.1.1.1
- [ ] AllowedIPs = 0.0.0.0/0
- [ ] PersistentKeepalive = 25

**Sample Config Validation:**
```ini
[Interface]
PrivateKey = [GENERATED_KEY]
Address = 10.8.0.X/24
DNS = 1.1.1.1,1.0.0.1

[Peer]
PublicKey = [SERVER_PUBLIC_KEY]
Endpoint = 135.148.121.237:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
```

### 2.5 Email Notifications
- [ ] Email sent on key generation
- [ ] Email contains setup instructions
- [ ] QR code embedded (for mobile)
- [ ] Download link works
- [ ] Email deliverability > 99%
- [ ] No emails in spam folder
- [ ] Unsubscribe link works

---

## 📋 PHASE 3: END-TO-END TESTING (STAGING)

### 3.1 Personal Plan User Journey
**Scenario:** New user signs up for Personal plan ($7.99/mo)

1. [ ] Visit www.sacvpn.com
2. [ ] Navigate to /pricing
3. [ ] Click "Get Personal"
4. [ ] Enter email and payment info (test card)
5. [ ] Complete checkout
6. [ ] Redirected to /post-checkout
7. [ ] Create account with email + password
8. [ ] Verify email (if required)
9. [ ] Login to dashboard
10. [ ] See subscription status: Active
11. [ ] Go to Devices page
12. [ ] Add device: "My Laptop"
13. [ ] Click "Request Key"
14. [ ] Wait for key generation (< 30 seconds)
15. [ ] Receive email with instructions
16. [ ] Download config file
17. [ ] Import into WireGuard app
18. [ ] Connect to VPN
19. [ ] Verify IP changed: curl ifconfig.me
20. [ ] Browse internet (test speed/latency)
21. [ ] Disconnect
22. [ ] Reconnect (should work)

**Expected Results:**
- Total time < 5 minutes
- All steps complete without errors
- VPN connection stable
- Speed > 50 Mbps
- Latency < 100ms

### 3.2 Gaming Plan User Journey
**Scenario:** User upgrades to Gaming plan ($11.99/mo)

1. [ ] Login as existing user
2. [ ] Go to Billing
3. [ ] Click "Upgrade to Gaming"
4. [ ] Complete Stripe checkout
5. [ ] Subscription updated in database
6. [ ] Existing devices reassigned to gaming node (if applicable)
7. [ ] New devices prefer gaming-optimized node
8. [ ] Test latency improvement (VA primary)

**Expected Results:**
- Latency < 50ms on gaming node
- Consistent routing to VA Primary

### 3.3 Business Plan User Journey
**Scenario:** Business account with 10 device quota

1. [ ] Sign up for Business 10 plan ($50/mo)
2. [ ] Create organization
3. [ ] Add device within quota
4. [ ] Try to add 11th device → blocked
5. [ ] Invite team member
6. [ ] Team member adds device (counts toward quota)
7. [ ] Admin can view all org devices
8. [ ] Member can only view own devices

**Expected Results:**
- Quota enforcement works
- RLS policies prevent cross-user access
- Org management functional

### 3.4 Mobile Device Testing
**iOS Testing:**
- [ ] Download WireGuard app from App Store
- [ ] Scan QR code from email
- [ ] Tunnel imported successfully
- [ ] Activate tunnel
- [ ] Internet works
- [ ] IP changed
- [ ] Test on cellular and WiFi

**Android Testing:**
- [ ] Download WireGuard app from Play Store
- [ ] Scan QR code
- [ ] Import successful
- [ ] Connection works
- [ ] Test on mobile data and WiFi

### 3.5 Desktop Testing
**Windows Testing:**
- [ ] Download WireGuard for Windows
- [ ] Import .conf file
- [ ] Activate tunnel
- [ ] Browse internet
- [ ] Check IP: ifconfig.me
- [ ] Test speed: speedtest.net

**macOS Testing:**
- [ ] Download WireGuard for Mac
- [ ] Import config
- [ ] Connect
- [ ] Verify connection

**Linux Testing:**
- [ ] Install wireguard-tools
- [ ] `sudo wg-quick up /path/to/config.conf`
- [ ] Verify with `ip addr`
- [ ] Test connectivity

---

## 📋 PHASE 4: PRODUCTION TESTING (LIVE)

### 4.1 Real Transaction Test
**Critical:** Use real credit card in live mode

1. [ ] Sign up with real email
2. [ ] Use real credit card (will charge $7.99)
3. [ ] Complete entire flow
4. [ ] Verify charge appears in Stripe dashboard
5. [ ] Verify subscription created
6. [ ] Connect to VPN
7. [ ] Refund the charge (for testing)
8. [ ] Verify subscription canceled

### 4.2 Webhook Verification (Production)
- [ ] Real Stripe events trigger webhooks
- [ ] No 400/500 errors in webhook logs
- [ ] Database updated within 5 seconds
- [ ] All event types handled

### 4.3 Node Failover Testing
**Scenario:** Simulate VA Primary failure

1. [ ] SSH into VA Primary
2. [ ] Stop WireGuard: `sudo systemctl stop wg-quick@wg0`
3. [ ] Mark node unhealthy in database
4. [ ] New device requests key
5. [ ] Should route to Dallas Central
6. [ ] Existing VA clients should failover (if implemented)
7. [ ] Restart VA Primary
8. [ ] Mark healthy
9. [ ] New requests route back to VA

### 4.4 Load Testing
**Tool:** Apache Bench or k6

**Test 1: Concurrent Signups**
- [ ] 50 users sign up simultaneously
- [ ] All succeed
- [ ] Database handles load
- [ ] No deadlocks or conflicts

**Test 2: Concurrent Connections**
- [ ] 100 devices connect to VPN simultaneously
- [ ] All establish tunnels
- [ ] No IP conflicts
- [ ] Nodes remain stable

**Test 3: Key Generation Backlog**
- [ ] Queue 200 key requests
- [ ] Cron job processes all within 10 minutes
- [ ] No failures
- [ ] All configs valid

### 4.5 Performance Benchmarks

**VA Primary Node:**
- [ ] Latency to node: < 50ms (ping)
- [ ] Download speed: > 100 Mbps
- [ ] Upload speed: > 100 Mbps
- [ ] Packet loss: < 0.1%
- [ ] Jitter: < 10ms

**Dallas Central Node:**
- [ ] Latency: < 80ms
- [ ] Download: > 100 Mbps
- [ ] Upload: > 100 Mbps
- [ ] Packet loss: < 0.1%

**Database Queries:**
- [ ] Node selection: < 50ms
- [ ] IP allocation: < 100ms
- [ ] Config retrieval: < 200ms

**API Response Times:**
- [ ] /api/healthz: < 100ms
- [ ] /api/wireguard/nodes: < 200ms
- [ ] Key generation: < 30 seconds

---

## 📋 PHASE 5: SECURITY TESTING

### 5.1 Authentication & Authorization
- [ ] Unauthenticated users blocked from dashboard
- [ ] Users can only see own devices
- [ ] Business users can't see other org's devices
- [ ] Admin verification works
- [ ] Session hijacking prevented
- [ ] CSRF protection enabled

### 5.2 API Security
- [ ] CORS configured correctly
- [ ] Rate limiting prevents abuse
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] No sensitive data in error messages
- [ ] API keys not exposed in logs

### 5.3 VPN Node Security
- [ ] SSH password auth disabled
- [ ] Only SSH keys work
- [ ] fail2ban active
- [ ] Unused ports closed
- [ ] OS packages up to date
- [ ] No root login
- [ ] WireGuard configs 600 permissions

### 5.4 Data Security
- [ ] Private keys encrypted at rest
- [ ] No keys in logs
- [ ] SSL/TLS for all connections
- [ ] Database backups encrypted
- [ ] PII handling compliant

### 5.5 Penetration Testing
- [ ] Port scan shows only 22, 51820 open
- [ ] Brute force attempts fail
- [ ] DDoS mitigation tested
- [ ] No known CVEs in dependencies

---

## 📋 PHASE 6: OPERATIONAL TESTING

### 6.1 Monitoring & Alerts
- [ ] Health checks run every 5 minutes
- [ ] Alerts trigger on node failure
- [ ] Dashboard shows real-time stats
- [ ] Telemetry data collecting
- [ ] Logs centralized and searchable

### 6.2 Backup & Recovery
- [ ] Database backup successful
- [ ] Can restore from backup
- [ ] Node configs backed up
- [ ] Recovery time < 15 minutes

### 6.3 Documentation Accuracy
- [ ] Admin runbook tested
- [ ] Support docs accurate
- [ ] Setup instructions work
- [ ] Troubleshooting guide helpful

---

## ✅ FINAL SIGN-OFF CHECKLIST

### Before Declaring "100% Complete"

**Infrastructure:**
- [ ] Both nodes operational for 24 hours straight
- [ ] Zero downtime
- [ ] Automated monitoring working
- [ ] Alerts configured and tested

**Functionality:**
- [ ] 10 successful test signups (real payments)
- [ ] All 10 users connected to VPN
- [ ] Zero errors in logs
- [ ] All features documented

**Performance:**
- [ ] Load test passed (100+ concurrent)
- [ ] Latency targets met
- [ ] Speed tests passed
- [ ] No memory leaks

**Security:**
- [ ] Security audit passed
- [ ] No critical vulnerabilities
- [ ] SSL valid
- [ ] Data encrypted

**User Experience:**
- [ ] Setup time < 5 minutes
- [ ] Email delivery 100%
- [ ] QR codes work on mobile
- [ ] Support docs complete

**Operational:**
- [ ] Cron jobs running
- [ ] Backups automated
- [ ] Monitoring 24/7
- [ ] On-call rotation set

---

## 🚨 FAILURE CRITERIA

**Testing FAILS if ANY of these occur:**

- Payment completes but user can't access VPN
- Config file doesn't work in WireGuard app
- Node goes down and doesn't recover
- IP conflict between users
- Data leak or security breach
- API returns 500 errors
- Webhook doesn't process within 30 seconds
- Email never arrives
- QR code doesn't scan
- Performance below targets

---

## 📊 TEST RESULTS LOG

### Test Run 1: [DATE]
- Tester:
- Environment: Staging
- Results:
- Issues Found:
- Status: PASS / FAIL

### Test Run 2: [DATE]
- Tester:
- Environment: Production
- Results:
- Issues Found:
- Status: PASS / FAIL

---

## 🎉 PRODUCTION READINESS APPROVAL

**I certify that:**
- [ ] All tests passed
- [ ] All issues resolved
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitoring active
- [ ] Backup plan ready

**Approved By:** _______________
**Date:** _______________
**Production Launch:** GO / NO-GO

---

**THIS TESTING CHECKLIST IS MANDATORY.**
**NO SHORTCUTS. NO EXCEPTIONS.**
**100% MEANS 100%.**
