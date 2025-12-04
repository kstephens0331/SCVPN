import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VPNServer {
  id: string;
  name: string;
  region: string;
  country: string;
  city: string;
  load: number;
  latency: number | null;
  is_premium: boolean;
  is_gaming_optimized: boolean;
  is_streaming_optimized: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    const SUPABASE_URL = Deno.env.get("SCVPN_SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has active subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("status, plan_code")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    const hasPremium = subscription?.plan_code?.includes("pro") ||
                       subscription?.plan_code?.includes("business");

    // Get active VPN nodes
    const { data: nodes, error: nodesError } = await supabase
      .from("vpn_nodes")
      .select(`
        id,
        name,
        region,
        country,
        city,
        max_clients,
        current_clients,
        is_premium,
        is_gaming_optimized,
        is_streaming_optimized,
        is_active,
        priority
      `)
      .eq("is_active", true)
      .eq("is_healthy", true)
      .order("priority", { ascending: true });

    if (nodesError) {
      console.error("Error fetching nodes:", nodesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch servers" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Transform nodes to server list with load percentage
    const servers: VPNServer[] = (nodes || []).map(node => ({
      id: node.id,
      name: node.name,
      region: node.region,
      country: node.country || getCountryFromRegion(node.region),
      city: node.city || getCityFromName(node.name),
      load: Math.round((node.current_clients / node.max_clients) * 100),
      latency: null, // Client will calculate this
      is_premium: node.is_premium || false,
      is_gaming_optimized: node.is_gaming_optimized || false,
      is_streaming_optimized: node.is_streaming_optimized || false,
      // Filter premium servers if user doesn't have premium
      available: node.is_premium ? hasPremium : true,
    })).filter(server => !server.is_premium || hasPremium);

    // Group by country for client UI
    const groupedServers = servers.reduce((acc, server) => {
      const country = server.country;
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(server);
      return acc;
    }, {} as Record<string, VPNServer[]>);

    return new Response(
      JSON.stringify({
        servers,
        grouped: groupedServers,
        has_premium: hasPremium,
        total_count: servers.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

// Helper functions to extract location info
function getCountryFromRegion(region: string): string {
  const regionMap: Record<string, string> = {
    "us-east": "United States",
    "us-west": "United States",
    "us-central": "United States",
    "eu-west": "United Kingdom",
    "eu-central": "Germany",
    "eu-north": "Sweden",
    "asia-east": "Japan",
    "asia-south": "Singapore",
    "au-east": "Australia",
    "ca-central": "Canada",
  };
  return regionMap[region] || "Unknown";
}

function getCityFromName(name: string): string {
  // Extract city from node names like "SACVPN-VA-Primary" or "SACVPN-Dallas-Central"
  const parts = name.split("-");
  if (parts.length >= 2) {
    const location = parts[1];
    const cityMap: Record<string, string> = {
      "VA": "Virginia",
      "Dallas": "Dallas",
      "NYC": "New York",
      "LA": "Los Angeles",
      "Chicago": "Chicago",
      "London": "London",
      "Frankfurt": "Frankfurt",
      "Tokyo": "Tokyo",
      "Singapore": "Singapore",
      "Sydney": "Sydney",
    };
    return cityMap[location] || location;
  }
  return "Unknown";
}
