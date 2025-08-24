import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 })

  const url = Deno.env.get("SUPABASE_URL")!
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const client = createClient(url, service)

  const { action, deviceId } = await req.json().catch(() => ({}))
  if (!action || !deviceId) return new Response("Bad Request", { status: 400 })

  // Simple admin allowlist check via header email
  const authEmail = req.headers.get("x-admin-email")?.toLowerCase()
  if (!authEmail) return new Response("Unauthorized", { status: 401 })
  const { data: admin } = await client.from("admin_emails").select("email").eq("email", authEmail).maybeSingle()
  if (!admin) return new Response("Forbidden", { status: 403 })

  if (action === "suspend") {
    await client.from("devices").update({ is_active: false }).eq("id", deviceId)
  } else if (action === "activate") {
    await client.from("devices").update({ is_active: true }).eq("id", deviceId)
  } else if (action === "revoke_keys") {
    await client.from("wg_keys").update({ is_revoked: true }).eq("device_id", deviceId)
  } else {
    return new Response("Unknown action", { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } })
})
