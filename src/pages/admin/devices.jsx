import { useEffect, useState } from "react"
import { apiJson, apiFetch } from "../../lib/api"

async function adminAction(action, deviceId){
  const res = await apiFetch("/api/admin-device", {
    method: "POST",
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
    try {
      const data = await apiJson("/api/admin/telemetry");
      // The telemetry endpoint returns { telemetry, devices, nodes }
      // Reconstruct device rows from telemetry data + devices map
      const deviceMap = data.devices || {};
      const telemetry = data.telemetry || [];

      // Get unique device info - combine telemetry and device info
      const deviceRows = [];
      const seen = new Set();
      for (const t of telemetry) {
        if (!seen.has(t.device_id)) {
          seen.add(t.device_id);
          const dev = deviceMap[t.device_id] || {};
          deviceRows.push({
            id: t.device_id,
            name: dev.name || t.device_name || "Unknown",
            platform: dev.platform || t.platform || "\u2014",
            is_active: t.is_connected ?? true,
            user_id: t.user_id,
            user_email: t.user_email || null,
            org_name: null,
            created_at: null,
          });
        }
      }
      setRows(deviceRows);
    } catch (e) {
      setError(e.message);
      setRows([]);
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
