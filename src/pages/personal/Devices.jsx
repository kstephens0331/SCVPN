import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DeviceConfig from "../../components/DeviceConfig";
import { API_BASE } from "../../lib/apiBase";
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Wifi,
  WifiOff,
  Plus,
  Settings,
  Trash2,
  Key,
  Eye,
  Power,
  PowerOff,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";

const PLATFORMS = [
  { id: "ios", name: "iOS", icon: Smartphone },
  { id: "android", name: "Android", icon: Smartphone },
  { id: "macos", name: "macOS", icon: Laptop },
  { id: "windows", name: "Windows", icon: Monitor },
  { id: "linux", name: "Linux", icon: Monitor },
  { id: "router", name: "Router", icon: Server },
  { id: "other", name: "Other", icon: Tablet },
];

const getPlatformIcon = (platform) => {
  const p = PLATFORMS.find((x) => x.id === platform);
  return p?.icon || Monitor;
};

export default function PersonalDevices() {
  const [showConfig, setShowConfig] = useState(null);
  const [rows, setRows] = useState([]);
  const [conn, setConn] = useState({});
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("android");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  async function requestKey(id) {
    setActionLoading(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to request a key");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/wireguard/generate-key`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ device_id: id }),
        });

        if (response.ok || response.status !== 405) {
          const result = await response.json();
          if (!response.ok) {
            alert("Failed: " + (result.error || "Unknown error"));
            return;
          }
          alert("WireGuard keys generated! Check your email for setup instructions.");
          await load();
          return;
        }
      } catch (fetchError) {
        console.warn("New endpoint not available, falling back to RPC:", fetchError);
      }

      const { error } = await supabase.rpc("request_wg_key", { p_device_id: id });
      if (error) {
        alert("Failed: " + error.message);
        return;
      }

      try {
        const processResponse = await fetch(`${API_BASE}/api/wireguard/process-requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (processResponse.ok) {
          alert("WireGuard keys generated! Check your email for setup instructions.");
        } else {
          alert("Key request submitted. Check your email in a few moments.");
        }
      } catch (processError) {
        alert("Key request submitted. Check your email in a few moments.");
      }

      await load();
    } catch (e) {
      alert("Error: " + (e?.message ?? e));
    } finally {
      setActionLoading(null);
    }
  }

  async function load() {
    setLoading(true);
    try {
      setErr("");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setErr("Please log in to view devices");
        return;
      }

      const { data, error } = await supabase
        .from("devices")
        .select("id,name,platform,is_active")
        .is("org_id", null)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErr(error.message);
        return;
      }

      setRows(data || []);

      const { data: t } = await supabase
        .from("device_latest_telemetry")
        .select("device_id,is_connected");

      setConn(Object.fromEntries((t || []).map((x) => [x.device_id, x.is_connected])));
    } catch (e) {
      setErr("Failed to load devices: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addDevice() {
    setBusy(true);
    setErr("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setErr("Not signed in");
        return;
      }
      if (!name.trim()) {
        setErr("Please enter a device name.");
        return;
      }

      const { data: newDevice, error } = await supabase
        .from("devices")
        .insert({
          user_id: user.id,
          org_id: null,
          name: name.trim(),
          platform,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        setErr(error.message);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/wireguard/generate-key`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ device_id: newDevice.id }),
        });

        if (response.ok) {
          alert("Device added and WireGuard keys generated! Check your email for setup instructions.");
        } else {
          const result = await response.json();
          alert('Device added. Click "Generate Key" to create WireGuard configuration.');
        }
      } catch (keyError) {
        alert('Device added. Click "Generate Key" to create WireGuard configuration.');
      }

      setName("");
      setPlatform("android");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function renameDevice(id, newName) {
    const { error } = await supabase.from("devices").update({ name: newName }).eq("id", id);
    if (error) setErr(error.message);
    await load();
  }

  async function toggle(id, isActive) {
    setActionLoading(id);
    const { error } = await supabase.from("devices").update({ is_active: !isActive }).eq("id", id);
    if (error) setErr(error.message);
    await load();
    setActionLoading(null);
  }

  async function removeDevice(id) {
    if (!confirm("Are you sure you want to remove this device? This action cannot be undone.")) return;
    setActionLoading(id);
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) setErr(error.message);
    await load();
    setActionLoading(null);
  }

  const connectedCount = rows.filter((d) => conn[d.id]).length;
  const activeCount = rows.filter((d) => d.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Devices</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your VPN-protected devices</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Monitor className="w-4 h-4" />
              Total Devices
            </div>
            <div className="text-3xl font-bold text-white">{rows.length}</div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Wifi className="w-4 h-4 text-green-400" />
              Connected
            </div>
            <div className="text-3xl font-bold text-green-400">{connectedCount}</div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent-cyan/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Power className="w-4 h-4 text-accent-cyan" />
              Active
            </div>
            <div className="text-3xl font-bold text-accent-cyan">{activeCount}</div>
          </div>
        </div>
      </div>

      {/* Add Device Form */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-brand-400" />
          Add New Device
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Device Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My iPhone"
              className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Platform</label>
            <div className="relative">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white appearance-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              disabled={busy || !name.trim()}
              onClick={addDevice}
              className="w-full rounded-xl px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-cyan text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Device
                </>
              )}
            </button>
          </div>
        </div>
        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {err}
          </div>
        )}
      </div>

      {/* Devices List */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Your Devices</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading devices...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">
            <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No devices yet. Add your first device above.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {rows.map((d) => {
              const PlatformIcon = getPlatformIcon(d.platform);
              const isConnected = conn[d.id];
              const isLoading = actionLoading === d.id;

              return (
                <div
                  key={d.id}
                  className={`p-4 hover:bg-white/5 transition-colors ${!d.is_active ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Platform Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isConnected
                          ? "bg-green-500/20 text-green-400"
                          : d.is_active
                          ? "bg-brand-500/20 text-brand-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      <PlatformIcon className="w-6 h-6" />
                    </div>

                    {/* Device Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          defaultValue={d.name}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (val && val !== d.name) renameDevice(d.id, val);
                          }}
                          className="bg-transparent text-white font-medium focus:outline-none focus:bg-white/10 px-2 py-1 -ml-2 rounded-lg transition-colors"
                        />
                        {isConnected && (
                          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <span className="capitalize">{d.platform}</span>
                        <span>•</span>
                        <span className={d.is_active ? "text-green-400" : "text-gray-500"}>
                          {d.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowConfig(d)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        title="View Config"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => requestKey(d.id)}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-brand-500/20 text-gray-400 hover:text-brand-400 transition-all disabled:opacity-50"
                        title="Generate Key"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => toggle(d.id, d.is_active)}
                        disabled={isLoading}
                        className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                          d.is_active
                            ? "bg-white/5 hover:bg-orange-500/20 text-gray-400 hover:text-orange-400"
                            : "bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-400"
                        }`}
                        title={d.is_active ? "Suspend" : "Activate"}
                      >
                        {d.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => removeDevice(d.id)}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Config Modal */}
      {showConfig && (
        <DeviceConfig deviceId={showConfig.id} deviceName={showConfig.name} onClose={() => setShowConfig(null)} />
      )}
    </div>
  );
}
