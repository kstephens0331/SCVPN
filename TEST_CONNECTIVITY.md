# Connectivity Tests from Your Home Windows PC

## Critical Diagnostic Steps

Run these tests from your Windows computer (home WiFi, not cellular):

### Test 1: Can you reach Dallas at all?
```powershell
ping 45.79.8.145
```

**Expected:**
- ✅ If replies received → Your HOME network can reach Dallas (T-Mobile is the problem)
- ❌ If timeout → Your HOME network ALSO blocks Dallas (bigger problem)

---

### Test 2: Can you reach Dallas on HTTP port?
```powershell
curl http://45.79.8.145
```

**Expected:**
- Should show some response (even an error is OK - proves TCP works)
- If timeout → TCP is also blocked

---

### Test 3: Can you reach Dallas on HTTPS port?
```powershell
curl https://45.79.8.145
```

**Expected:**
- Should show SSL/certificate error (that's OK - proves HTTPS works)
- If timeout → HTTPS is also blocked

---

### Test 4: Can you traceroute to Dallas?
```powershell
tracert 45.79.8.145
```

**Expected:**
- Shows route hops to Dallas
- Identifies where packets are being dropped

---

## What These Tests Tell Us

### Scenario A: HOME WiFi CAN reach Dallas, but T-Mobile CANNOT
**Diagnosis:** T-Mobile blocks Linode/Akamai IPs (common for VPN providers)

**Solutions:**
1. Use Cloudflare Tunnel to proxy connections
2. Switch to different cloud provider (AWS, Google Cloud, Azure)
3. Use residential IP proxy service
4. Accept T-Mobile users won't work (not recommended)

---

### Scenario B: NEITHER HOME nor T-Mobile can reach Dallas
**Diagnosis:** Your ISP (Comcast/Spectrum/etc) blocks cloud VPN IPs too

**Solutions:**
1. This is actually GOOD - means it's YOUR ISP, not T-Mobile
2. Your customers likely won't have same ISP restrictions
3. But YOU need to test from different network

---

### Scenario C: Can reach Dallas on TCP (443) but NOT UDP (80)
**Diagnosis:** UDP is blocked, but TCP works

**Solutions:**
1. ✅ Use stunnel (TCP tunnel for WireGuard)
2. Switch to OpenVPN (supports TCP natively)
3. Use obfuscation tools

---

## Next Steps Based on Results

**Please run ALL FOUR tests above and paste results.**

Then we'll know EXACTLY what the issue is and how to fix it.
