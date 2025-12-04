import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterDeviceRequest {
  device_name: string;
  device_type: "windows" | "macos" | "linux" | "ios" | "android";
  hardware_id?: string;
  preferred_server_id?: string;
}

// Generate WireGuard key pair using Curve25519
function generateWireGuardKeyPair(): { privateKey: string; publicKey: string } {
  // Generate random 32-byte private key
  const privateKeyBytes = nacl.randomBytes(32);

  // Clamp the private key (WireGuard requirement)
  privateKeyBytes[0] &= 248;
  privateKeyBytes[31] &= 127;
  privateKeyBytes[31] |= 64;

  // Derive public key using Curve25519
  const publicKeyBytes = nacl.scalarMult.base(privateKeyBytes);

  // Convert to base64
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

    // Create client with user's JWT for auth check
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role for database operations
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

    // Check if device already exists by hardware_id
    if (hardware_id) {
      const { data: existingDevice } = await supabase
        .from("devices")
        .select("id, device_configs(*)")
        .eq("hardware_id", hardware_id)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (existingDevice) {
        // Return existing config if device is already registered
        if (existingDevice.device_configs?.length > 0) {
          const config = existingDevice.device_configs[0];
          const { data: node } = await supabase
            .from("vpn_nodes")
            .select("*")
            .eq("id", config.node_id)
            .single();

          return new Response(
            JSON.stringify({
              success: true,
              message: "Device already registered",
              device_id: existingDevice.id,
              config: generateWireGuardConfigFile(config, node)
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    }

    // Select best available server
    let node;
    if (preferred_server_id) {
      const { data: preferredNode } = await supabase
        .from("vpn_nodes")
        .select("*")
        .eq("id", preferred_server_id)
        .eq("is_active", true)
        .single();

      if (preferredNode && preferredNode.current_clients < preferredNode.max_clients) {
        node = preferredNode;
      }
    }

    if (!node) {
      // Get best available node by priority and load
      const { data: nodes, error: nodesError } = await supabase
        .from("vpn_nodes")
        .select("*")
        .eq("is_active", true)
        .eq("is_healthy", true)
        .order("priority", { ascending: true })
        .order("current_clients", { ascending: true });

      if (nodesError || !nodes?.length) {
        return new Response(
          JSON.stringify({ error: "No VPN servers available. Please try again later." }),
          { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Find first node with capacity
      node = nodes.find(n => n.current_clients < n.max_clients);
      if (!node) {
        return new Response(
          JSON.stringify({ error: "All servers are at capacity. Please try again later." }),
          { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
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

    // Get next available client IP
    const clientIP = await getNextClientIP(supabase, node.id, node.client_subnet);

    // Create device config
    const { data: config, error: configError } = await supabase
      .from("device_configs")
      .insert({
        device_id: device.id,
        user_id: user.id,
        node_id: node.id,
        private_key: privateKey,
        public_key: publicKey,
        client_ip: clientIP,
        dns_servers: node.dns_servers || "1.1.1.1,8.8.8.8",
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (configError) {
      console.error("Error creating config:", configError);
      // Rollback device creation
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
        current_clients: node.current_clients + 1,
        last_updated: new Date().toISOString()
      })
      .eq("id", node.id);

    // Generate WireGuard config file content
    const wgConfig = generateWireGuardConfigFile(config, node);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Device registered successfully",
        device_id: device.id,
        server: {
          id: node.id,
          name: node.name,
          region: node.region,
          city: node.city
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
  // Get existing IPs for this node
  const { data: existingConfigs } = await supabase
    .from("device_configs")
    .select("client_ip")
    .eq("node_id", nodeId)
    .eq("is_active", true);

  const usedIPs = new Set((existingConfigs || []).map((c: any) => c.client_ip));

  // Parse subnet (e.g., "10.8.0.0/24")
  const [subnet] = clientSubnet.split("/");
  const parts = subnet.split(".");
  const [a, b, c] = parts;

  // Find first available IP (skip .1 which is gateway)
  for (let i = 2; i < 254; i++) {
    const ip = `${a}.${b}.${c}.${i}`;
    if (!usedIPs.has(ip)) {
      return ip;
    }
  }

  throw new Error("No available IP addresses in subnet");
}
