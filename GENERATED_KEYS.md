# 🔑 GENERATED WIREGUARD SERVER KEYS

**CONFIDENTIAL - DO NOT COMMIT**
**Generated:** 2025-10-21

---

## VA Primary (135.148.121.237)

```
Server Private Key: fOnBpeOHKcHSXWj+rqNVOizROWhKEJsLgWlab7YaP3g=
Server Public Key:  Yk9Jey09CwrywSS7j5rO84DhmvhjbxR8xHoLdgZ/gic=
```

**WireGuard Config for VA Primary:**
```ini
[Interface]
PrivateKey = fOnBpeOHKcHSXWj+rqNVOizROWhKEJsLgWlab7YaP3g=
Address = 10.8.0.1/24
ListenPort = 51820
SaveConfig = false

# Enable IP forwarding and masquerading
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ens3 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o ens3 -j MASQUERADE

PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ens3 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o ens3 -j MASQUERADE

# PRIMARY NODE: Optimized for low latency
# Expected capacity: 2000 clients
```

---

## Dallas Central (45.79.8.145)

```
Server Private Key: TE67jUpmwjznnEdUhy8RE1UNQfziJKiSRo5hLSO8N7A=
Server Public Key:  8i4UehSzS883ek7l2y0s+QR4qsSBQAjmWm38vuqaOWk=
```

**WireGuard Config for Dallas Central:**
```ini
[Interface]
PrivateKey = TE67jUpmwjznnEdUhy8RE1UNQfziJKiSRo5hLSO8N7A=
Address = 10.9.0.1/24
ListenPort = 51820
SaveConfig = false

# Enable IP forwarding and masquerading
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# SECONDARY NODE: Optimized for throughput
# Expected capacity: 1000 clients
```

---

## ⚠️ SECURITY NOTES

- **KEEP THESE KEYS SECURE** - They control access to your VPN infrastructure
- Private keys should NEVER be shared or committed to git
- These keys are already added to `.gitignore`
- If compromised, regenerate immediately

---

## 📋 NEXT STEPS

1. ✅ Keys generated successfully
2. ⏳ Run SQL migration in Supabase
3. ⏳ Re-run setup-nodes.js to register in database
4. ⏳ SSH to VA server and deploy config
5. ⏳ SSH to Dallas server and deploy config
6. ⏳ Start WireGuard on both
7. ⏳ Test connectivity

---

**Status:** Keys generated, awaiting database migration
