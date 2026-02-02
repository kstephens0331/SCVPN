import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateKeyRequest {
  device_id: string;
}

/**
 * Generate WireGuard keypair using x25519
 */
async function generateWireGuardKeypair(): Promise<{ privateKey: string; publicKey: string }> {
  // Generate random private key (32 bytes)
  const privateKeyBytes = new Uint8Array(32);
  crypto.getRandomValues(privateKeyBytes);

  // Clamp the private key (WireGuard requirement)
  privateKeyBytes[0] &= 248;
  privateKeyBytes[31] &= 127;
  privateKeyBytes[31] |= 64;

  // Convert to base64
  const privateKey = encode(privateKeyBytes);

  // For public key generation, we'd need to use x25519
  // Since Deno doesn't have native x25519, we'll use SubtleCrypto
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "X25519",
      namedCurve: "X25519",
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKey = encode(new Uint8Array(publicKeyRaw));

  return { privateKey, publicKey };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: GenerateKeyRequest = await req.json();
    const { device_id } = body;

    if (!device_id) {
      return new Response(
        JSON.stringify({ error: "device_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify device belongs to user
    const { data: device, error: deviceError } = await supabase
      .from("devices")
      .select("id, user_id")
      .eq("id", device_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: "Device not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if key already exists
    const { data: existingKey } = await supabase
      .from("wireguard_keys")
      .select("public_key")
      .eq("device_id", device_id)
      .maybeSingle();

    if (existingKey) {
      return new Response(
        JSON.stringify({
          success: true,
          public_key: existingKey.public_key,
          message: "WireGuard key already exists",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new keypair
    const { privateKey, publicKey } = await generateWireGuardKeypair();

    // Store public key in database (private key is returned to client and never stored)
    const { error: keyError } = await supabase
      .from("wireguard_keys")
      .insert({
        device_id: device_id,
        public_key: publicKey,
        created_at: new Date().toISOString(),
      });

    if (keyError) {
      console.error("Error storing WireGuard key:", keyError);
      return new Response(
        JSON.stringify({ error: "Failed to store WireGuard key", details: keyError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Assign IP address from available pool
    // Simple implementation: Get next available IP from 10.8.0.0/24 range
    const { data: existingIPs } = await supabase
      .from("wireguard_keys")
      .select("client_ip")
      .not("client_ip", "is", null);

    const usedIPs = new Set((existingIPs || []).map(k => k.client_ip));
    let clientIP = "";

    // Find first available IP (10.8.0.2 - 10.8.0.254)
    for (let i = 2; i < 255; i++) {
      const ip = `10.8.0.${i}`;
      if (!usedIPs.has(ip)) {
        clientIP = ip;
        break;
      }
    }

    if (!clientIP) {
      return new Response(
        JSON.stringify({ error: "No available IP addresses" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update with assigned IP
    await supabase
      .from("wireguard_keys")
      .update({ client_ip: clientIP })
      .eq("device_id", device_id);

    return new Response(
      JSON.stringify({
        success: true,
        private_key: privateKey,
        public_key: publicKey,
        client_ip: clientIP,
        message: "WireGuard keypair generated successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
