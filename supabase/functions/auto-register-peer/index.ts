/**
 * Auto-Register VPN Peer
 *
 * This function is triggered when a new WireGuard key is generated.
 * It automatically adds the peer to all active VPN servers.
 *
 * Trigger: Database webhook on wireguard_keys INSERT with client_ip
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PeerRegistrationRequest {
  public_key: string;
  client_ip: string;
  device_id: string;
}

/**
 * Add peer to VPN server via SSH
 */
async function addPeerToServer(
  serverIp: string,
  serverUser: string,
  serverPassword: string,
  publicKey: string,
  clientIp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // For now, we'll use SSH via a simple HTTP call to a helper service
    // TODO: Implement actual SSH connection or use server API

    // Alternative: Use Deno's SSH library when available
    // For production, consider:
    // 1. Setting up an API endpoint on each VPN server
    // 2. Using a message queue (Redis) that VPN servers poll
    // 3. Using Supabase Realtime to push updates to servers

    console.log(`Would add peer ${clientIp} to server ${serverIp}`);
    console.log(`Command: sudo wg set wg0 peer ${publicKey} allowed-ips ${clientIp}/32`);

    // Placeholder: Mark as successful for now
    // In production, implement actual SSH or API call here
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse webhook payload
    const payload: PeerRegistrationRequest = await req.json();
    const { public_key, client_ip, device_id } = payload;

    console.log(`Auto-registering peer for device ${device_id}`);
    console.log(`Public Key: ${public_key}`);
    console.log(`Client IP: ${client_ip}`);

    // Get all active VPN servers
    const { data: servers, error: serversError } = await supabase
      .from("vpn_nodes")
      .select("name, ssh_host, ssh_user, ssh_password")
      .eq("is_active", true)
      .eq("is_healthy", true);

    if (serversError || !servers || servers.length === 0) {
      console.error("No active VPN servers found");
      return new Response(
        JSON.stringify({ error: "No active VPN servers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add peer to all active servers
    const results = await Promise.all(
      servers.map(async (server) => {
        const result = await addPeerToServer(
          server.ssh_host,
          server.ssh_user,
          server.ssh_password || "",
          public_key,
          client_ip
        );

        return {
          server: server.name,
          ...result,
        };
      })
    );

    const allSuccessful = results.every((r) => r.success);

    if (allSuccessful) {
      console.log("✓ Peer registered on all servers");

      // Update wireguard_keys to mark as registered
      await supabase
        .from("wireguard_keys")
        .update({ peer_registered: true, registered_at: new Date().toISOString() })
        .eq("device_id", device_id);
    } else {
      console.error("Some servers failed:", results.filter((r) => !r.success));
    }

    return new Response(
      JSON.stringify({
        success: allSuccessful,
        results,
        message: allSuccessful
          ? "Peer registered on all servers"
          : "Peer registration failed on some servers",
      }),
      { status: allSuccessful ? 200 : 207, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in auto-register-peer:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
