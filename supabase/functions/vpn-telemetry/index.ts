import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelemetryData {
  device_id: string;
  is_connected: boolean;
  bytes_sent?: number;
  bytes_received?: number;
  last_handshake?: string;
  client_version?: string;
  os_version?: string;
  connection_duration?: number; // seconds
  disconnect_reason?: string;
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

    const body: TelemetryData = await req.json();
    const {
      device_id,
      is_connected,
      bytes_sent,
      bytes_received,
      last_handshake,
      client_version,
      os_version,
      connection_duration,
      disconnect_reason
    } = body;

    if (!device_id || is_connected === undefined) {
      return new Response(
        JSON.stringify({ error: "device_id and is_connected are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SCVPN_SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE = Deno.env.get("SCVPN_SERVICE_ROLE_JWT")!;

    // Verify user
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
      .select("id, device_configs(node_id, client_ip)")
      .eq("id", device_id)
      .eq("user_id", user.id)
      .single();

    if (!device) {
      return new Response(
        JSON.stringify({ error: "Device not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const config = device.device_configs?.[0];
    if (!config) {
      return new Response(
        JSON.stringify({ error: "No configuration found for device" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert telemetry record
    const { error: telemetryError } = await supabase
      .from("device_telemetry")
      .insert({
        device_id,
        node_id: config.node_id,
        is_connected,
        client_ip: config.client_ip,
        bytes_sent: bytes_sent || 0,
        bytes_received: bytes_received || 0,
        last_handshake: last_handshake ? new Date(last_handshake).toISOString() : null,
        recorded_at: new Date().toISOString()
      });

    if (telemetryError) {
      console.error("Telemetry insert error:", telemetryError);
      // Don't fail on telemetry errors - just log them
    }

    // Update device last_seen
    await supabase
      .from("devices")
      .update({
        last_seen: new Date().toISOString(),
        is_connected,
        client_version: client_version || null,
        os_version: os_version || null
      })
      .eq("id", device_id);

    // Track connection sessions
    if (is_connected) {
      // Check if there's an active session
      const { data: activeSession } = await supabase
        .from("connection_sessions")
        .select("id")
        .eq("device_id", device_id)
        .is("disconnected_at", null)
        .single();

      if (!activeSession) {
        // Start new session
        await supabase
          .from("connection_sessions")
          .insert({
            device_id,
            user_id: user.id,
            node_id: config.node_id,
            connected_at: new Date().toISOString(),
            client_ip: config.client_ip
          });
      }
    } else {
      // End active session
      const { data: activeSession } = await supabase
        .from("connection_sessions")
        .select("id, connected_at")
        .eq("device_id", device_id)
        .is("disconnected_at", null)
        .single();

      if (activeSession) {
        const connectedAt = new Date(activeSession.connected_at);
        const duration = Math.floor((Date.now() - connectedAt.getTime()) / 1000);

        await supabase
          .from("connection_sessions")
          .update({
            disconnected_at: new Date().toISOString(),
            duration_seconds: connection_duration || duration,
            bytes_sent: bytes_sent || 0,
            bytes_received: bytes_received || 0,
            disconnect_reason: disconnect_reason || "user_initiated"
          })
          .eq("id", activeSession.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Telemetry recorded"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error:", error);
    // Return success anyway - don't let telemetry errors affect client
    return new Response(
      JSON.stringify({ success: true, message: "Telemetry recorded" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
