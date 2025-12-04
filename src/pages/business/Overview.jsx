import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Building2,
  Users,
  Monitor,
  Wifi,
  WifiOff,
  Shield,
  Zap,
  Activity,
  ChevronRight,
  TrendingUp,
  Clock,
  Settings,
  UserPlus,
  ChevronDown,
  Loader2,
} from "lucide-react";

export default function BusinessOverview() {
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [rows, setRows] = useState([]);
  const [conn, setConn] = useState({});
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: os } = await supabase.from("organizations").select("id,name").order("name");
      setOrgs(os || []);
      if (os && os[0]) {
        setOrgId(os[0].id);
        setOrgName(os[0].name);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      setLoading(true);
      // Get devices
      const { data: d1 } = await supabase.from("devices").select("id,name,platform,is_active").eq("org_id", orgId);
      setRows(d1 || []);

      // Get connection status
      const { data: d2 } = await supabase.from("device_latest_telemetry").select("device_id,is_connected");
      setConn(Object.fromEntries((d2 || []).map((x) => [x.device_id, x.is_connected])));

      // Get subscription info
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("org_id", orgId)
        .maybeSingle();
      setSubscription(sub);

      setLoading(false);
    })();
  }, [orgId]);

  const connected = useMemo(() => rows.filter((d) => conn[d.id]).length, [rows, conn]);
  const activeDevices = useMemo(() => rows.filter((d) => d.is_active).length, [rows]);

  const handleOrgChange = (e) => {
    const selectedId = e.target.value;
    setOrgId(selectedId);
    const org = orgs.find((o) => o.id === selectedId);
    setOrgName(org?.name || "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your organization's VPN infrastructure</p>
        </div>

        {/* Organization Selector */}
        {orgs.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              <select
                value={orgId}
                onChange={handleOrgChange}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white font-medium focus:outline-none focus:border-brand-500 cursor-pointer min-w-[200px]"
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id} className="bg-gray-900">
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Organizations Found</h3>
          <p className="text-gray-400 mb-6">You don't have any business organizations yet.</p>
          <Link
            to="/pricing#business"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all"
          >
            <Building2 className="w-5 h-5" />
            Get a Business Plan
          </Link>
        </div>
      ) : (
        <>
          {/* Organization Header Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/10 via-accent-purple/10 to-accent-cyan/10 border border-white/10 p-6">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{orgName}</h3>
                  <p className="text-gray-400 text-sm">
                    {subscription?.plan || "Business Plan"} • {rows.length} devices registered
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/business/devices"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Device
                </Link>
                <Link
                  to="/business/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Devices */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-brand-500/20">
                    <Monitor className="w-5 h-5 text-brand-400" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Total Devices</span>
                </div>
                <div className="text-4xl font-bold text-white">{rows.length}</div>
                <p className="text-gray-500 text-sm mt-1">Registered in organization</p>
              </div>
            </div>

            {/* Connected */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Wifi className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Connected</span>
                </div>
                <div className="text-4xl font-bold text-green-400">{connected}</div>
                <p className="text-gray-500 text-sm mt-1">Active connections</p>
              </div>
            </div>

            {/* Active Devices */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-cyan/10 rounded-full blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/20">
                    <Activity className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Active</span>
                </div>
                <div className="text-4xl font-bold text-accent-cyan">{activeDevices}</div>
                <p className="text-gray-500 text-sm mt-1">Enabled devices</p>
              </div>
            </div>

            {/* VPN Status */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
              <div className={`absolute top-0 right-0 w-20 h-20 ${connected > 0 ? "bg-green-500/10" : "bg-gray-500/10"} rounded-full blur-xl`} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${connected > 0 ? "bg-green-500/20" : "bg-gray-500/20"}`}>
                    {connected > 0 ? (
                      <Shield className="w-5 h-5 text-green-400" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span className="text-gray-400 text-sm font-medium">Network Status</span>
                </div>
                <div className={`text-4xl font-bold ${connected > 0 ? "text-green-400" : "text-gray-400"}`}>
                  {connected > 0 ? "Online" : "Idle"}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {connected > 0 ? "Traffic encrypted" : "No active connections"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Devices */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Monitor className="w-5 h-5 text-brand-400" />
                Recent Devices
              </h3>
              <Link to="/business/devices" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {rows.length === 0 ? (
              <div className="p-8 text-center">
                <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No devices registered yet</p>
                <Link
                  to="/business/devices"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Add your first device
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {rows.slice(0, 5).map((d) => {
                  const isConnected = conn[d.id];
                  return (
                    <div key={d.id} className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isConnected
                            ? "bg-green-500/20 text-green-400"
                            : d.is_active
                            ? "bg-brand-500/20 text-brand-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{d.name}</p>
                        <p className="text-gray-400 text-sm capitalize">{d.platform}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected && (
                          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Connected
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${d.is_active ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
                          {d.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/business/devices"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Manage Devices</h4>
                  <p className="text-gray-400 text-sm">Add, remove, or configure team devices</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/business/billing"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Billing & Plans</h4>
                  <p className="text-gray-400 text-sm">Manage subscription and invoices</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              to="/business/settings"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Organization Settings</h4>
                  <p className="text-gray-400 text-sm">Team members and preferences</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
