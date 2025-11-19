import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Telemetry(){
  const [rows, setRows] = useState([])
  const [devices, setDevices] = useState({})
  const [nodes, setNodes] = useState({})
  const [autoRefresh, setAutoRefresh] = useState(true)

  async function load() {
    console.log("[Telemetry] Loading telemetry data...");

    // Load telemetry with device names
    const { data: telemetryData, error: telemetryError } = await supabase
      .from("device_latest_telemetry")
      .select("device_id, node_id, is_connected, client_ip, client_vpn_ip, last_handshake, bytes_received, bytes_sent, recorded_at")
      .order("recorded_at", { ascending: false });

    if (telemetryError) {
      console.error("[Telemetry] Error:", telemetryError);
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
            className="rounded px-3 py-1 bg-lime-400 text-black font-semibold text-sm"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No telemetry data available yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-800 text-lime-400/90">
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
                  <tr key={r.device_id} className="border-b border-gray-800">
                    <td className="py-2 pr-3 font-medium">
                      {device?.name || r.device_id.slice(0, 8)}
                    </td>
                    <td className="py-2 pr-3 text-gray-400">
                      {device?.platform || "—"}
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
      )}
    </div>
  )
}
