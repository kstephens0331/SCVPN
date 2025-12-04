import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SwitchServerRequest {
  device_id: string;
  new_server_id: string;
}

// Generate WireGuard key pair
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

    const body: SwitchServerRequest = await req.json();
    const { device_id, new_server_id } = body;

    if (!device_id || !new_server_id) {
      return new Response(
        JSON.stringify({ error: "device_id and new_server_id are required" }),
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

    // Verify device ownership
    const { data: device } = await supabase
      .from("devices")
      .select("id, name, type")
      .eq("id", device_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!device) {
      return new Response(
        JSON.stringify({ error: "Device not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get new server
    const { data: newNode, error: nodeError } = await supabase
      .from("vpn_nodes")
      .select("*")
      .eq("id", new_server_id)
      .eq("is_active", true)
      .single();

    if (nodeError || !newNode) {
      return new Response(
        JSON.stringify({ error: "Server not found or unavailable" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (newNode.current_clients >= newNode.max_clients) {
      return new Response(
        JSON.stringify({ error: "Server is at capacity. Please try another server." }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check subscription for premium servers
    if (newNode.is_premium) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_code")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      const hasPremium = subscription?.plan_code?.includes("pro") ||
                         subscription?.plan_code?.includes("business");

      if (!hasPremium) {
        return new Response(
          JSON.stringify({ error: "Premium subscription required for this server" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Get current config
    const { data: currentConfig } = await supabase
      .from("device_configs")
      .select("*, vpn_nodes(*)")
      .eq("device_id", device_id)
      .eq("is_active", true)
      .single();

    const oldNodeId = currentConfig?.node_id;

    // Deactivate old config
    if (currentConfig) {
      await supabase
        .from("device_configs")
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq("id", currentConfig.id);

      // Decrement old node's client count
      if (oldNodeId && currentConfig.vpn_nodes) {
        await supabase
          .from("vpn_nodes")
          .update({
            current_clients: Math.max(0, currentConfig.vpn_nodes.current_clients - 1)
          })
          .eq("id", oldNodeId);
      }
    }

    // Generate new keys
    const { privateKey, publicKey } = generateWireGuardKeyPair();

    // Get next available IP on new node
    const clientIP = await getNextClientIP(supabase, newNode.id, newNode.client_subnet);

    // Create new config
    const { data: newConfig, error: configError } = await supabase
      .from("device_configs")
      .insert({
        device_id: device.id,
        user_id: user.id,
        node_id: newNode.id,
        private_key: privateKey,
        public_key: publicKey,
        client_ip: clientIP,
        dns_servers: newNode.dns_servers || "1.1.1.1,8.8.8.8",
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (configError) {
      console.error("Error creating config:", configError);
      return new Response(
        JSON.stringify({ error: "Failed to create new configuration" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update new node's client count
    await supabase
      .from("vpn_nodes")
      .update({
        current_clients: newNode.current_clients + 1,
        last_updated: new Date().toISOString()
      })
      .eq("id", newNode.id);

    // Generate WireGuard config
    const wgConfig = `[Interface]
# SACVPN Configuration
# Device: ${device.name}
# Server: ${newNode.name}
PrivateKey = ${privateKey}
Address = ${clientIP}/24
DNS = ${newConfig.dns_servers}

[Peer]
# Server: ${newNode.name}
PublicKey = ${newNode.public_key}
Endpoint = ${newNode.public_ip}:${newNode.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Server switched successfully",
        server: {
          id: newNode.id,
          name: newNode.name,
          region: newNode.region,
          country: newNode.country,
          city: newNode.city,
          endpoint: `${newNode.public_ip}:${newNode.port || 51820}`
        },
        config: wgConfig,
        client_ip: clientIP
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

  throw new Error("No available IP addresses");
}
