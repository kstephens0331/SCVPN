# Manual Key Generation - Immediate Fix

Since the API endpoint isn't processing key requests, let's generate the keys manually.

---

## Option 1: Generate Keys Directly via SQL Function

**This is the fastest way to get keys and send email.**

Run this in Supabase SQL Editor:

```sql
-- Generate WireGuard keys for the pending request
DO $$
DECLARE
  v_device_id UUID := '968d8246-409e-4a7e-a406-916878cb3a35';
  v_user_id UUID := '467e4d7b-421d-45f3-a839-cb0076d26320';
  v_vpn_node_id UUID;
  v_client_ip TEXT;
  v_client_private_key TEXT;
  v_client_public_key TEXT;
  v_config_id UUID;
BEGIN
  -- Get best available VPN node (Dallas Central if under 80%, otherwise VA)
  SELECT id INTO v_vpn_node_id
  FROM vpn_nodes
  WHERE is_active = true
    AND current_clients < max_clients
  ORDER BY priority DESC, current_clients ASC
  LIMIT 1;

  IF v_vpn_node_id IS NULL THEN
    RAISE EXCEPTION 'No available VPN nodes';
  END IF;

  -- Generate IP address (get next available IP from node's subnet)
  -- For now, use a simple incrementing IP
  SELECT
    CASE
      WHEN priority = 2 THEN '10.71.0.' || (COALESCE(MAX(CAST(SPLIT_PART(client_ip, '.', 4) AS INTEGER)), 1) + 1)::TEXT
      ELSE '10.70.0.' || (COALESCE(MAX(CAST(SPLIT_PART(client_ip, '.', 4) AS INTEGER)), 1) + 1)::TEXT
    END INTO v_client_ip
  FROM device_configs dc
  JOIN vpn_nodes vn ON vn.id = dc.vpn_node_id
  WHERE dc.vpn_node_id = v_vpn_node_id;

  -- Generate WireGuard keys (simplified - you'll need to generate these externally)
  -- For now, create placeholder entries
  v_client_private_key := 'PRIVATE_KEY_' || gen_random_uuid()::TEXT;
  v_client_public_key := 'PUBLIC_KEY_' || gen_random_uuid()::TEXT;

  -- Insert device config
  INSERT INTO device_configs (
    device_id,
    vpn_node_id,
    client_private_key,
    client_public_key,
    client_ip,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    v_device_id,
    v_vpn_node_id,
    v_client_private_key,
    v_client_public_key,
    v_client_ip,
    true,
    NOW(),
    NOW()
  ) RETURNING id INTO v_config_id;

  -- Mark key request as completed
  UPDATE key_requests
  SET
    status = 'completed',
    processed_at = NOW(),
    completed_at = NOW()
  WHERE id = '15e03d9e-17c8-44bc-aa6a-207846fe57c9';

  RAISE NOTICE 'Config created: %, IP: %', v_config_id, v_client_ip;
END $$;
```

**PROBLEM:** SQL can't generate real WireGuard keys. We need the API.

---

## Option 2: Force Railway to Process (RECOMMENDED)

The issue is Railway isn't responding to the curl command. Let's try:

### A. Check Railway is Running

```bash
railway status
```

### B. Call the endpoint with verbose logging

```bash
curl -v -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests
```

Look for the response. Should see:
```json
{
  "processed": 1,
  "results": [...]
}
```

### C. If that doesn't work, use Railway CLI

```bash
railway run -- curl -X POST http://localhost:3000/api/wireguard/process-requests
```

---

## Option 3: Check Why Railway Isn't Processing

The most likely issues:

### Issue 1: Railway Not Deployed
- Go to Railway dashboard
- Check deployment status
- Look for errors in deployment logs

### Issue 2: SMTP Not Configured
- Check Railway variables:
  - `SMTP_USER`
  - `SMTP_PASS`
- If missing, emails won't send

### Issue 3: WireGuard Manager Not Initialized
- Check Railway startup logs for:
  ```
  WireGuard manager not initialized
  ```

---

## Quick Test: Call Process Endpoint Directly

Try this in your browser console (on sacvpn.com):

```javascript
fetch('https://scvpn-production.up.railway.app/api/wireguard/process-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

This will show you the exact response or error.

---

## What to Check Next

1. **Railway deployment status** - Is it actually running?
2. **Railway logs** - Any errors on startup?
3. **Railway variables** - SMTP credentials set?
4. **Network** - Can you reach Railway from your machine?

Let me know what you find!
