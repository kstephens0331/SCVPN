import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Building2,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Wifi,
  Plus,
  Trash2,
  Eye,
  Power,
  PowerOff,
  XCircle,
  Loader2,
  ChevronDown,
  Users,
  UserPlus,
  Shield,
  ExternalLink,
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

export default function BusinessDevices() {
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [rows, setRows] = useState([]);
  const [conn, setConn] = useState({});
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("windows");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [me, setMe] = useState(null);
  const [myRole, setMyRole] = useState("");
  const isAdmin = useMemo(() => myRole === "owner" || myRole === "admin", [myRole]);

  const [users, setUsers] = useState([]);
  const [assignee, setAssignee] = useState("");
  const [assigneeCount, setAssigneeCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: os } = await supabase.from("organizations").select("id,name").order("name");
      setOrgs(os || []);
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user || null);
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
      setErr("");

      const { data: d1, error: e1 } = await supabase
        .from("devices")
        .select("id,name,platform,is_active,org_id,user_id")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (e1) {
        setErr(e1.message);
        setLoading(false);
        return;
      }
      setRows(d1 || []);

      const { data: d2 } = await supabase.from("device_latest_telemetry").select("device_id,is_connected");
      setConn(Object.fromEntries((d2 || []).map((x) => [x.device_id, x.is_connected])));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMyRole("");
        setUsers([]);
        setAssignee("");
        setAssigneeCount(0);
        setLoading(false);
        return;
      }

      const { data: roleRow } = await supabase
        .from("org_members")
        .select("role")
        .eq("org_id", orgId)
        .eq("user_id", user.id)
        .maybeSingle();

      const role = (roleRow && roleRow.role) || "";
      setMyRole(role);
      setAssignee(user.id);

      if (role === "owner" || role === "admin") {
        const { data: us, error: rpcErr } = await supabase.rpc("list_org_users", { p_org_id: orgId });
        if (rpcErr) {
          setErr(rpcErr.message);
          setUsers([]);
        } else {
          setUsers(us || []);
        }
      } else {
        setUsers([]);
      }
      setLoading(false);
    })();
  }, [orgId]);

  useEffect(() => {
    (async () => {
      if (!assignee) {
        setAssigneeCount(0);
        return;
      }
      const { count, error } = await supabase
        .from("devices")
        .select("id", { count: "exact", head: true })
        .eq("user_id", assignee)
        .not("org_id", "is", null);
      if (error) {
        setErr(error.message);
        setAssigneeCount(0);
      } else {
        setAssigneeCount(count || 0);
      }
    })();
  }, [assignee]);

  const canAdd = useMemo(() => {
    if (!name.trim() || !orgId || busy) return false;
    if (isAdmin) return assigneeCount < 5;
    if (!me) return false;
    return assignee === me.id && assigneeCount < 5;
  }, [name, orgId, busy, isAdmin, assigneeCount, assignee, me]);

  async function addDevice() {
    try {
      setBusy(true);
      setErr("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErr("Not signed in");
        return;
      }
      const userId = isAdmin ? assignee || user.id : user.id;

      const { error } = await supabase.from("devices").insert({
        org_id: orgId,
        user_id: userId,
        name: name.trim(),
        platform,
        is_active: true,
      });
      if (error) {
        setErr(error.message);
        return;
      }

      setName("");
      setPlatform("windows");

      const { data: d1 } = await supabase
        .from("devices")
        .select("id,name,platform,is_active,org_id,user_id")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      setRows(d1 || []);

      const { count } = await supabase
        .from("devices")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("org_id", "is", null);
      setAssigneeCount(count || 0);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id, isActive) {
    setActionLoading(id);
    setErr("");
    const { error } = await supabase.from("devices").update({ is_active: !isActive }).eq("id", id);
    if (error) setErr(error.message);
    const { data: d1 } = await supabase
      .from("devices")
      .select("id,name,platform,is_active,org_id,user_id")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    setRows(d1 || []);
    setActionLoading(null);
  }

  async function removeDevice(id) {
    if (!confirm("Are you sure you want to remove this device?")) return;
    setActionLoading(id);
    setErr("");
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) setErr(error.message);
    const { data: d1 } = await supabase
      .from("devices")
      .select("id,name,platform,is_active,org_id,user_id")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    setRows(d1 || []);
    setActionLoading(null);
  }

  const handleOrgChange = (e) => {
    const selectedId = e.target.value;
    setOrgId(selectedId);
    const org = orgs.find((o) => o.id === selectedId);
    setOrgName(org?.name || "");
  };

  const connectedCount = rows.filter((d) => conn[d.id]).length;
  const activeCount = rows.filter((d) => d.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Business Devices</h2>
          <p className="text-gray-400 text-sm mt-1">Manage devices for your organization</p>
        </div>

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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
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
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent-purple/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Users className="w-4 h-4 text-accent-purple" />
              Your Devices
            </div>
            <div className="text-3xl font-bold text-accent-purple">{assigneeCount}/5</div>
          </div>
        </div>
      </div>

      {/* Add Device Form */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-brand-400" />
          Add New Device
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Device Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Office Laptop"
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
          <div>
            <label className="block text-sm text-gray-400 mb-2">Assign To</label>
            <div className="relative">
              {isAdmin ? (
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-black/30 border border-white/10 text-white appearance-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
                >
                  {me && <option value={me.id}>Me</option>}
                  {(users || []).map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name || u.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  disabled
                  className="w-full rounded-xl px-4 py-3 bg-black/20 border border-white/10 text-gray-400 cursor-not-allowed"
                  value="Me"
                />
              )}
              {isAdmin && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
            </div>
          </div>
          <div className="flex items-end">
            <button
              disabled={!canAdd}
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
        {!canAdd && name.trim() && assigneeCount >= 5 && (
          <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Device limit reached (5 per user). Remove a device to add more.
          </div>
        )}
      </div>

      {/* Devices List */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Organization Devices</h3>
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
                        <span className="text-white font-medium">{d.name}</span>
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
                      <a
                        href={`/api/device/${d.id}/config`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        title="View Config"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
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
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : d.is_active ? (
                          <PowerOff className="w-5 h-5" />
                        ) : (
                          <Power className="w-5 h-5" />
                        )}
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
    </div>
  );
}
