import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Telemetry(){
  const [rows, setRows] = useState([])
  const [devices, setDevices] = useState({})
  const [nodes, setNodes] = useState({})
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    console.log("[Telemetry] Loading telemetry data...");
    setLoading(true);
    setError(null);

    // Load telemetry with device names
    const { data: telemetryData, error: telemetryError } = await supabase
      .from("device_latest_telemetry")
      .select("device_id, node_id, is_connected, client_ip, client_vpn_ip, last_handshake, bytes_received, bytes_sent, recorded_at, user_id, device_name, platform, user_email")
      .order("recorded_at", { ascending: false });

    if (telemetryError) {
      console.error("[Telemetry] Error:", telemetryError);
      setError(`Telemetry error: ${telemetryError.message}`);
      setLoading(false);
      return;
    } else {
      console.log("[Telemetry] Loaded", telemetryData?.length || 0, "entries");

      // Sort: connected first, then by most recent activity
      const sorted = (telemetryData || []).sort((a, b) => {
        // Connected devices first
        if (a.is_connected && !b.is_connected) return -1;
        if (!a.is_connected && b.is_connected) return 1;

        // Then by most recent recorded_at
        return new Date(b.recorded_at) - new Date(a.recorded_at);
      });

      setRows(sorted);
    }

    setLoading(false);

    // Load device names
    const { data: devicesData } = await supabase
      .from("devices")
      .select("id, name, platform");

    const deviceMap = {};
    (devicesData || []).forEach(d => {
      deviceMap[d.id] = { name: d.name, platform: d.platform };
    });
    setDevices(deviceMap);

    // Load node names
    const { data: nodesData } = await supabase
      .from("vpn_nodes")
      .select("id, name");

    const nodeMap = {};
    (nodesData || []).forEach(n => {
      nodeMap[n.id] = n.name;
    });
    setNodes(nodeMap);
  }

  async function loadUserDetails(row) {
    setSelectedDevice(row);
    setLoadingDetails(true);

    try {
      // Get user profile and subscription info
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", row.user_id)
        .single();

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", row.user_id)
        .single();

      const { data: userDevices } = await supabase
        .from("devices")
        .select("id, name, platform, created_at")
        .eq("user_id", row.user_id);

      setUserDetails({
        email: row.user_email,
        profile,
        subscription,
        devices: userDevices || []
      });
    } catch (err) {
      console.error("Error loading user details:", err);
    }

    setLoadingDetails(false);
  }

  useEffect(() => {
    load();

    // Auto-refresh every 10 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(load, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return date.toLocaleString();
  };

  // Calculate stats
  const connectedCount = rows.filter(r => r.is_connected).length;
  const totalCount = rows.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-lime-400">Live Telemetry Feed</h2>
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-lime-400 font-semibold">{connectedCount}</span> connected
            {' • '}
            <span className="text-gray-300">{totalCount}</span> total devices
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh (10s)</span>
          </label>
          <button
            onClick={load}
            disabled={loading}
            className="rounded px-3 py-1 bg-lime-400 text-black font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Now"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300">
          <p className="font-semibold">Error loading telemetry:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {rows.length === 0 && !error ? (
        <div className="text-center py-8 text-gray-400">
          No telemetry data available yet. Run the SQL migration or wait for devices to connect.
        </div>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-800 text-lime-400/90">
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Device</th>
                <th className="py-2 pr-3">Platform</th>
                <th className="py-2 pr-3">Node</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Public IP</th>
                <th className="py-2 pr-3">VPN IP</th>
                <th className="py-2 pr-3">Traffic (↓/↑)</th>
                <th className="py-2 pr-3">Last Handshake</th>
                <th className="py-2 pr-3">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const device = devices[r.device_id];
                const nodeName = nodes[r.node_id];

                return (
                  <tr
                    key={r.device_id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => loadUserDetails(r)}
                  >
                    <td className="py-2 pr-3 text-blue-400 hover:text-blue-300">
                      {r.user_email || "—"}
                    </td>
                    <td className="py-2 pr-3 font-medium">
                      {r.device_name || device?.name || r.device_id.slice(0, 8)}
                    </td>
                    <td className="py-2 pr-3 text-gray-400">
                      {r.platform || device?.platform || "—"}
                    </td>
                    <td className="py-2 pr-3 text-gray-400">
                      {nodeName || r.node_id?.slice(0, 8) || "—"}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center gap-1 ${r.is_connected ? 'text-lime-400' : 'text-gray-500'}`}>
                        <span className={`h-2 w-2 rounded-full ${r.is_connected ? 'bg-lime-400 animate-pulse' : 'bg-gray-500'}`}></span>
                        {r.is_connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">
                      {r.client_ip || "—"}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-gray-400">
                      {r.client_vpn_ip || "—"}
                    </td>
                    <td className="py-2 pr-3 text-gray-400">
                      {formatBytes(r.bytes_received)} / {formatBytes(r.bytes_sent)}
                    </td>
                    <td className="py-2 pr-3 text-gray-400">
                      {formatTime(r.last_handshake)}
                    </td>
                    <td className="py-2 pr-3 text-gray-400">
                      {formatTime(r.recorded_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* User Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedDevice(null)}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-lime-400">User Details</h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : userDetails ? (
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lime-400 font-semibold mb-3">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white font-mono">{userDetails.email || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">User ID:</span>
                      <p className="text-white font-mono text-xs">{selectedDevice.user_id || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Role:</span>
                      <p className="text-white">{userDetails.profile?.role || "user"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Plan:</span>
                      <p className="text-white">{userDetails.profile?.plan || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lime-400 font-semibold mb-3">Subscription</h4>
                  {userDetails.subscription ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <p className={`font-semibold ${userDetails.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                          {userDetails.subscription.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Plan:</span>
                        <p className="text-white">{userDetails.subscription.plan}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Device Limit:</span>
                        <p className="text-white">{userDetails.subscription.device_limit || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Expires:</span>
                        <p className="text-white">
                          {userDetails.subscription.current_period_end
                            ? new Date(userDetails.subscription.current_period_end).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">No active subscription</p>
                  )}
                </div>

                {/* Current Device */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lime-400 font-semibold mb-3">Selected Device</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <p className="text-white">{selectedDevice.device_name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Platform:</span>
                      <p className="text-white">{selectedDevice.platform || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className={selectedDevice.is_connected ? 'text-green-400' : 'text-gray-400'}>
                        {selectedDevice.is_connected ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Public IP:</span>
                      <p className="text-white font-mono text-xs">{selectedDevice.client_ip || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* All User Devices */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lime-400 font-semibold mb-3">All Devices ({userDetails.devices.length})</h4>
                  {userDetails.devices.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.devices.map(d => (
                        <div key={d.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-700 last:border-0">
                          <div>
                            <span className="text-white">{d.name}</span>
                            <span className="text-gray-400 ml-2">({d.platform})</span>
                          </div>
                          <span className="text-gray-500 text-xs">
                            Added {new Date(d.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No devices registered</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <a
                    href={`mailto:${userDetails.email}`}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-medium"
                  >
                    Email User
                  </a>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No details available</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
