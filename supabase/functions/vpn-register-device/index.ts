import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-forwarded-for, x-real-ip",
};

interface RegisterDeviceRequest {
  device_name: string;
  device_type: "windows" | "macos" | "linux" | "ios" | "android";
  hardware_id?: string;
  preferred_server_id?: string;
}

// Node coordinates for geo-routing (Haversine distance)
const NODE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "SACVPN-Texas-Primary": { lat: 29.76, lng: -95.37 },    // Houston, TX
  "SACVPN-VA-Secondary": { lat: 39.04, lng: -77.49 },     // Ashburn, VA
  "SACVPN-Dallas-Central": { lat: 32.78, lng: -96.80 },   // Dallas, TX
};

// Nodes that should NOT receive client traffic (redirect to Texas)
const REDIRECT_TO_TEXAS = new Set(["SACVPN-Dallas-Central"]);

// Haversine formula: distance in miles between two lat/lng points
function haversineDistance(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geo-locate client IP using HTTPS API (works from Deno Deploy)
async function geolocateIP(ip: string): Promise<{ lat: number; lng: number } | null> {
  // Try ipapi.co (HTTPS, 30k/month free, no key needed)
  try {
    const resp = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "SACVPN/1.0" },
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.latitude && data.longitude) {
        return { lat: data.latitude, lng: data.longitude };
      }
    }
  } catch { /* first attempt failed */ }

  // Fallback: ip-api.com over HTTPS (pro) or ipinfo.io
  try {
    const resp = await fetch(`https://ipinfo.io/${ip}/json?token=`, {
      signal: AbortSignal.timeout(3000),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.loc) {
        const [lat, lng] = data.loc.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
  } catch { /* geo lookup is best-effort */ }

  return null;
}

// Select the best node for the client based on geo-location
// Only considers nodes NOT in the REDIRECT_TO_TEXAS set
function selectBestNode(
  nodes: any[],
  clientLat: number,
  clientLng: number
): { node: any; distance: number } {
  // Filter out nodes that should redirect to Texas
  const eligibleNodes = nodes.filter(n => !REDIRECT_TO_TEXAS.has(n.name));

  let bestNode = eligibleNodes[0] || nodes[0]; // fallback to first available
  let minDist = Infinity;

  for (const node of eligibleNodes) {
    const coords = NODE_COORDINATES[node.name];
    if (!coords) continue;
    const dist = haversineDistance(clientLat, clientLng, coords.lat, coords.lng);
    if (dist < minDist) {
      minDist = dist;
      bestNode = node;
    }
  }

  return { node: bestNode, distance: Math.round(minDist) };
}

// Generate WireGuard key pair using Curve25519
function generateWireGuardKeyPair(): { privateKey: string; publicKey: string } {
  const privateKeyBytes = nacl.randomBytes(32);
  privateKeyBytes[0] &= 248;
  privateKeyBytes[31] &= 127;
  privateKeyBytes[31] |= 64;
  const publicKeyBytes = nacl.scalarMult.base(privateKeyBytes);
  const privateKey = btoa(String.fromCharCode(...privateKeyBytes));
  const publicKey = btoa(String.fromCharCode(...publicKeyBytes));
  return { privateKey, publicKey };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: RegisterDeviceRequest = await req.json();
    const { device_name, device_type, hardware_id, preferred_server_id } = body;

    if (!device_name || !device_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: device_name, device_type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SCVPN_SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SCVPN_SERVICE_ROLE_JWT")!;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Check subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, plan_code, device_limit")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: "No active subscription found. Please subscribe first." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check device limit
    const { count: deviceCount } = await supabase
      .from("devices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);

    const deviceLimit = subscription.device_limit || 5;
    if ((deviceCount || 0) >= deviceLimit) {
      return new Response(
        JSON.stringify({
          error: `Device limit reached (${deviceLimit}). Please remove a device or upgrade your plan.`,
          device_count: deviceCount,
          device_limit: deviceLimit
        }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get client IP for geo-routing
    const clientIPRaw =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") || "";

    // Geo-locate client (used for both existing and new device routing)
    const clientGeo = clientIPRaw ? await geolocateIP(clientIPRaw) : null;
    console.log(`Client IP: ${clientIPRaw}, Geo: ${clientGeo ? `${clientGeo.lat},${clientGeo.lng}` : "failed"}`);

    // Get all available nodes upfront (needed for both paths)
    const { data: allNodes } = await supabase
      .from("vpn_nodes")
      .select("*")
      .eq("is_active", true)
      .eq("is_healthy", true)
      .order("priority", { ascending: true });

    if (!allNodes?.length) {
      return new Response(
        JSON.stringify({ error: "No VPN servers available. Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const availableNodes = allNodes.filter(n => n.current_clients < n.max_clients);
    if (!availableNodes.length) {
      return new Response(
        JSON.stringify({ error: "All servers are at capacity. Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Determine the optimal node for this client
    let optimalNode: any;
    let routingReason = "";

    if (clientGeo) {
      const result = selectBestNode(availableNodes, clientGeo.lat, clientGeo.lng);
      optimalNode = result.node;
      routingReason = `geo-routed (${result.distance}mi to ${optimalNode.name})`;
    } else {
      // Fallback: use highest priority node that isn't in the redirect set
      optimalNode = availableNodes.find(n => !REDIRECT_TO_TEXAS.has(n.name)) || availableNodes[0];
      routingReason = `priority-fallback to ${optimalNode.name}`;
    }

    console.log(`Optimal node: ${optimalNode.name} (${routingReason})`);

    // =========================================================================
    // EXISTING DEVICE: Check if device needs to be moved to a better node
    // =========================================================================
    if (hardware_id) {
      const { data: existingDevice } = await supabase
        .from("devices")
        .select("id, device_configs(*)")
        .eq("hardware_id", hardware_id)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (existingDevice) {
        const activeConfig = existingDevice.device_configs?.find((c: any) => c.is_active);

        if (activeConfig) {
          const { data: currentNode } = await supabase
            .from("vpn_nodes")
            .select("*")
            .eq("id", activeConfig.node_id)
            .single();

          // Check if device needs to be moved:
          // 1. On Dallas → always move to Texas
          // 2. On a node that isn't the optimal one → move
          const needsMove =
            (currentNode && REDIRECT_TO_TEXAS.has(currentNode.name)) ||
            (currentNode && optimalNode && currentNode.id !== optimalNode.id);

          if (needsMove && optimalNode.current_clients < optimalNode.max_clients) {
            console.log(`Moving device ${existingDevice.id}: ${currentNode?.name} → ${optimalNode.name} (${routingReason})`);

            // Deactivate old config
            await supabase
              .from("device_configs")
              .update({ is_active: false, deactivated_at: new Date().toISOString() })
              .eq("id", activeConfig.id);

            // Decrement old node
            if (currentNode) {
              await supabase
                .from("vpn_nodes")
                .update({ current_clients: Math.max(0, currentNode.current_clients - 1) })
                .eq("id", currentNode.id);
            }

            // Generate new keys for the optimal node
            const { privateKey: newPrivKey, publicKey: newPubKey } = generateWireGuardKeyPair();
            const newClientIP = await getNextClientIP(supabase, optimalNode.id, optimalNode.client_subnet);

            const { data: newConfig } = await supabase
              .from("device_configs")
              .insert({
                device_id: existingDevice.id,
                user_id: user.id,
                node_id: optimalNode.id,
                private_key: newPrivKey,
                public_key: newPubKey,
                client_ip: newClientIP,
                dns_servers: optimalNode.dns_servers || "1.1.1.1,8.8.8.8",
                is_active: true,
                created_at: new Date().toISOString(),
              })
              .select()
              .single();

            // Increment new node
            await supabase
              .from("vpn_nodes")
              .update({ current_clients: optimalNode.current_clients + 1 })
              .eq("id", optimalNode.id);

            if (newConfig) {
              return new Response(
                JSON.stringify({
                  success: true,
                  message: `Optimized: moved to ${optimalNode.name}`,
                  device_id: existingDevice.id,
                  routing: routingReason,
                  server: { id: optimalNode.id, name: optimalNode.name, region: optimalNode.region, city: optimalNode.city },
                  config: generateWireGuardConfigFile(newConfig, optimalNode),
                }),
                { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
              );
            }
          }

          // Already on the optimal node — return existing config
          return new Response(
            JSON.stringify({
              success: true,
              message: "Device already registered",
              device_id: existingDevice.id,
              routing: `already on optimal node (${currentNode?.name})`,
              config: generateWireGuardConfigFile(activeConfig, currentNode)
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Device exists but no active config — fall through to create one below
        // We'll reuse the existing device record
        const { privateKey, publicKey } = generateWireGuardKeyPair();
        const clientIP = await getNextClientIP(supabase, optimalNode.id, optimalNode.client_subnet);

        const { data: config, error: configError } = await supabase
          .from("device_configs")
          .insert({
            device_id: existingDevice.id,
            user_id: user.id,
            node_id: optimalNode.id,
            private_key: privateKey,
            public_key: publicKey,
            client_ip: clientIP,
            dns_servers: optimalNode.dns_servers || "1.1.1.1,8.8.8.8",
            is_active: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (configError) {
          return new Response(
            JSON.stringify({ error: "Failed to generate VPN configuration" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        await supabase
          .from("vpn_nodes")
          .update({ current_clients: optimalNode.current_clients + 1 })
          .eq("id", optimalNode.id);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Config created on ${optimalNode.name}`,
            device_id: existingDevice.id,
            routing: routingReason,
            server: { id: optimalNode.id, name: optimalNode.name, region: optimalNode.region, city: optimalNode.city },
            config: generateWireGuardConfigFile(config, optimalNode),
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // =========================================================================
    // NEW DEVICE: Register and assign to optimal node
    // =========================================================================

    // Override with preferred server if specified and available
    if (preferred_server_id) {
      const preferred = availableNodes.find(n => n.id === preferred_server_id);
      if (preferred && !REDIRECT_TO_TEXAS.has(preferred.name)) {
        optimalNode = preferred;
        routingReason = `user-preferred: ${preferred.name}`;
      }
    }

    // Create device record
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .insert({
        user_id: user.id,
        name: device_name,
        type: device_type,
        hardware_id,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (deviceError) {
      console.error("Error creating device:", deviceError);
      return new Response(
        JSON.stringify({ error: "Failed to register device" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate WireGuard keys
    const { privateKey, publicKey } = generateWireGuardKeyPair();
    const clientIP = await getNextClientIP(supabase, optimalNode.id, optimalNode.client_subnet);

    // Create device config
    const { data: config, error: configError } = await supabase
      .from("device_configs")
      .insert({
        device_id: device.id,
        user_id: user.id,
        node_id: optimalNode.id,
        private_key: privateKey,
        public_key: publicKey,
        client_ip: clientIP,
        dns_servers: optimalNode.dns_servers || "1.1.1.1,8.8.8.8",
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (configError) {
      console.error("Error creating config:", configError);
      await supabase.from("devices").delete().eq("id", device.id);
      return new Response(
        JSON.stringify({ error: "Failed to generate VPN configuration" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update node client count
    await supabase
      .from("vpn_nodes")
      .update({
        current_clients: optimalNode.current_clients + 1,
        last_updated: new Date().toISOString()
      })
      .eq("id", optimalNode.id);

    const wgConfig = generateWireGuardConfigFile(config, optimalNode);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Device registered successfully",
        device_id: device.id,
        routing: routingReason,
        server: {
          id: optimalNode.id,
          name: optimalNode.name,
          region: optimalNode.region,
          city: optimalNode.city
        },
        config: wgConfig
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// Generate WireGuard config file content
function generateWireGuardConfigFile(config: any, node: any): string {
  return `[Interface]
# SACVPN Configuration
# Generated: ${new Date().toISOString()}
PrivateKey = ${config.private_key}
Address = ${config.client_ip}/24
DNS = ${config.dns_servers}

[Peer]
# Server: ${node.name}
PublicKey = ${node.public_key}
Endpoint = ${node.public_ip}:${node.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;
}

// Get next available client IP in subnet
async function getNextClientIP(supabase: any, nodeId: string, clientSubnet: string): Promise<string> {
  const { data: existingConfigs } = await supabase
    .from("device_configs")
    .select("client_ip")
    .eq("node_id", nodeId)
    .eq("is_active", true);

  const usedIPs = new Set((existingConfigs || []).map((c: any) => c.client_ip));
  const [subnet] = clientSubnet.split("/");
  const [a, b, c] = subnet.split(".");

  for (let i = 2; i < 254; i++) {
    const ip = `${a}.${b}.${c}.${i}`;
    if (!usedIPs.has(ip)) {
      return ip;
    }
  }

  throw new Error("No available IP addresses in subnet");
}
