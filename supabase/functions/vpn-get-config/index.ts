import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GetConfigRequest {
  device_id?: string;
  hardware_id?: string;
  server_id?: string; // Optional: get config for a specific server (server switching)
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

    const body: GetConfigRequest = await req.json().catch(() => ({}));
    const { device_id, hardware_id, server_id } = body;

    if (!device_id && !hardware_id) {
      return new Response(
        JSON.stringify({ error: "Either device_id or hardware_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SCVPN_SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SCVPN_SERVICE_ROLE_JWT")!;

    // Create client with user's JWT for auth
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

    // Use service role for queries
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Find device
    let deviceQuery = supabase
      .from("devices")
      .select("id, name, type, hardware_id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (device_id) {
      deviceQuery = deviceQuery.eq("id", device_id);
    } else if (hardware_id) {
      deviceQuery = deviceQuery.eq("hardware_id", hardware_id);
    }

    const { data: device, error: deviceError } = await deviceQuery.single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: "Device not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get config with server details
    let configQuery = supabase
      .from("device_configs")
      .select(`
        id,
        private_key,
        public_key,
        client_ip,
        dns_servers,
        created_at,
        vpn_nodes (
          id,
          name,
          region,
          country,
          city,
          public_ip,
          port,
          public_key
        )
      `)
      .eq("device_id", device.id)
      .eq("is_active", true);

    if (server_id) {
      configQuery = configQuery.eq("node_id", server_id);
    }

    const { data: config, error: configError } = await configQuery.single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({
          error: "No configuration found for this device",
          needs_registration: true
        }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const node = config.vpn_nodes;

    // Generate WireGuard config file content
    const wgConfig = `[Interface]
# SACVPN Configuration
# Device: ${device.name}
# Generated: ${config.created_at}
PrivateKey = ${config.private_key}
Address = ${config.client_ip}/24
DNS = ${config.dns_servers}

[Peer]
# Server: ${node.name}
PublicKey = ${node.public_key}
Endpoint = ${node.public_ip}:${node.port || 51820}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

    return new Response(
      JSON.stringify({
        success: true,
        device: {
          id: device.id,
          name: device.name,
          type: device.type
        },
        server: {
          id: node.id,
          name: node.name,
          region: node.region,
          country: node.country,
          city: node.city,
          endpoint: `${node.public_ip}:${node.port || 51820}`
        },
        config: wgConfig,
        client_ip: config.client_ip,
        created_at: config.created_at
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
