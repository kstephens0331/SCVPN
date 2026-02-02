import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

// NOTE: call Edge Function via full Supabase URL (no proxy needed)
async function adminAction(action, deviceId){
  const { data: { user } } = await supabase.auth.getUser()
  const url = `${import.meta.env.VITE_API_URL}/api/admin-device`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-email": user.email },
    body: JSON.stringify({ action, deviceId })
  })
  if(!res.ok) throw new Error("Action failed")
}

export default function Devices(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true);
    setError(null);

    // Query the view that joins devices with auth.users
    const { data, error: queryError } = await supabase
      .from("devices_with_users")
      .select("id, name, platform, is_active, user_id, org_id, created_at, user_email, org_name")
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("[Devices] Error:", queryError);
      setError(queryError.message);

      // Fallback to direct devices query if view doesn't exist
      const { data: fallbackData } = await supabase
        .from("devices")
        .select("id, name, platform, is_active, user_id, org_id, created_at")
        .order("created_at", { ascending: false });

      setRows(fallbackData || []);
    } else {
      console.log("[Devices] Loaded", data?.length || 0, "devices");
      setRows(data || []);
    }

    setLoading(false);
  };

  useEffect(() => { load() }, [])
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-lime-400">All Devices</h2>
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-gray-300">{rows.length}</span> devices registered
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded px-3 py-1 bg-lime-400 text-black font-semibold text-sm disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300">
          <p className="font-semibold">Error loading devices:</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2 text-gray-400">Run CREATE_DEVICES_VIEW.sql in Supabase to enable email display.</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-800 text-lime-400/90">
              <th className="py-2 pr-3">User Email</th>
              <th className="py-2 pr-3">Device Name</th>
              <th className="py-2 pr-3">Platform</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Created</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map(d => (
              <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-2 pr-3">
                  {d.org_name ? (
                    <span className="text-lime-300">{d.org_name} <span className="text-gray-500">(Business)</span></span>
                  ) : d.user_email ? (
                    <span className="text-blue-400">{d.user_email}</span>
                  ) : (
                    <span className="text-gray-500">Unknown</span>
                  )}
                </td>
                <td className="py-2 pr-3 font-medium">{d.name || "—"}</td>
                <td className="py-2 pr-3 text-gray-400">{d.platform || "—"}</td>
                <td className="py-2 pr-3">
                  <span className={`inline-flex items-center gap-1 ${d.is_active ? 'text-lime-400' : 'text-red-400'}`}>
                    <span className={`h-2 w-2 rounded-full ${d.is_active ? 'bg-lime-400' : 'bg-red-400'}`}></span>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 pr-3 text-gray-400 text-xs">
                  {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="py-2 pr-3 flex gap-2">
                  <button
                    className="text-lime-400 hover:text-lime-300 underline text-xs"
                    onClick={async () => { await adminAction("activate", d.id); load() }}
                  >
                    Activate
                  </button>
                  <button
                    className="text-yellow-400 hover:text-yellow-300 underline text-xs"
                    onClick={async () => { await adminAction("suspend", d.id); load() }}
                  >
                    Suspend
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300 underline text-xs"
                    onClick={async () => { await adminAction("revoke_keys", d.id); load() }}
                  >
                    Revoke Keys
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-400">
          No devices registered yet.
        </div>
      )}
    </div>
  )
}
