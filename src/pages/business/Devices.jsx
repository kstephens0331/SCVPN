import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase"; // adjust if your client is elsewhere
const PLATFORMS = ["ios","android","macos","windows","linux","router","other"];

export default function BusinessDevices(){
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [rows, setRows] = useState([]);
  const [conn, setConn] = useState({});
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("linux");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [me, setMe] = useState(null);
  const [myRole, setMyRole] = useState("");
  const isAdmin = useMemo(()=> myRole==="owner" || myRole==="admin", [myRole]);

  const [users, setUsers] = useState([]);     // org users for admin
  const [assignee, setAssignee] = useState("");     // selected user id
  const [assigneeCount, setAssigneeCount] = useState(0); // business device count for that user

  useEffect(()=>{ (async()=>{
    const { data: os } = await supabase.from("organizations").select("id,name").order("name");
    setOrgs(os || []);
    const { data:{ user } } = await supabase.auth.getUser();
    setMe(user || null);
    if (os && os[0]) setOrgId(os[0].id);
  })(); },[]);

  useEffect(()=>{ (async()=>{
    if (!orgId) return;
    setErr("");

    // devices in this org (RLS restricts visibility)
    const { data:d1, error:e1 } = await supabase
      .from("devices")
      .select("id,name,platform,is_active,org_id,user_id")
      .eq("org_id", orgId)
      .order("created_at", { ascending:false });
    if (e1) { setErr(e1.message); return; }
    setRows(d1 || []);

    // latest connectivity snapshot
    const { data:d2 } = await supabase.from("device_latest_telemetry").select("device_id,is_connected");
    setConn(Object.fromEntries((d2||[]).map(x=>[x.device_id, x.is_connected])));

    // my role in this org
    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) { setMyRole(""); setUsers([]); setAssignee(""); setAssigneeCount(0); return; }

    const { data:roleRow } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();

    const role = (roleRow && roleRow.role) || "";
    setMyRole(role);
    setAssignee(user.id); // default to me

    if (role==="owner" || role==="admin") {
      // list org users via RPC (security definer; admins/owners only)
      const { data: us, error: rpcErr } = await supabase.rpc("list_org_users", { p_org_id: orgId });
      if (rpcErr) { setErr(rpcErr.message); setUsers([]); }
      else { setUsers(us || []); }
    } else {
      setUsers([]);
    }
  })(); },[orgId]);

  // track assignee's business device count (across orgs)
  useEffect(()=>{ (async()=>{
    if (!assignee) { setAssigneeCount(0); return; }
    const { count, error } = await supabase
      .from("devices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", assignee)
      .not("org_id","is", null); // business devices only
    if (error) { setErr(error.message); setAssigneeCount(0); }
    else { setAssigneeCount(count || 0); }
  })(); },[assignee]);

  const canAdd = useMemo(()=>{
    if (!name || !orgId || busy) return false;
    if (isAdmin) return assigneeCount < 5;          // admin adding for selected user
    if (!me) return false;
    return (assignee === me.id) && assigneeCount < 5; // member adds for self only
  },[name, orgId, busy, isAdmin, assigneeCount, assignee, me]);

  async function addDevice(){
    try {
      setBusy(true); setErr("");
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) { setErr("Not signed in"); return; }
      const userId = isAdmin ? (assignee || user.id) : user.id;

      const { error } = await supabase.from("devices").insert({
        org_id: orgId, user_id: userId, name, platform, is_active: true
      });
      if (error) { setErr(error.message); return; }

      setName(""); setPlatform("linux");

      // refresh list
      const { data:d1 } = await supabase
        .from("devices")
        .select("id,name,platform,is_active,org_id,user_id")
        .eq("org_id", orgId)
        .order("created_at", { ascending:false });
      setRows(d1 || []);

      const { count } = await supabase
        .from("devices")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("org_id","is", null);
      setAssigneeCount(count || 0);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id, isActive){
    setBusy(true); setErr("");
    const { error } = await supabase.from("devices").update({ is_active: !isActive }).eq("id", id);
    if (error) setErr(error.message);
    setBusy(false);
  }

  async function removeDevice(id){
    setBusy(true); setErr("");
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) setErr(error.message);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-sm text-lime-400/90">Organization</label>
          <select value={orgId} onChange={e=>setOrgId(e.target.value)} className="ml-2 rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
            {(orgs ?? []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div className="text-lime-300 text-sm">
          Assignee devices: {assigneeCount}/5 {isAdmin ? "" : "(you)"}
        </div>
      </div>

      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Device name" className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"/>
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {isAdmin ? (
            <select value={assignee} onChange={e=>setAssignee(e.target.value)} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
              {me && <option key={me.id} value={me.id}>Assign to: Me</option>}
              <optgroup label="Organization users">
                {(users||[]).map(u => <option key={u.user_id} value={u.user_id}>{u.full_name || u.email} ({u.role})</option>)}
              </optgroup>
            </select>
          ) : (
            <input disabled className="rounded px-3 py-2 bg-black/20 ring-1 ring-gray-800 opacity-60" value="Assign to: Me" />
          )}

          <button disabled={!canAdd} onClick={addDevice} className="rounded px-4 py-2 bg-lime-400 text-black font-semibold disabled:opacity-50">Add</button>
        </div>
        {err && <div className="text-red-400 text-sm mt-2">{err}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-800 text-lime-400/90">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Platform</th>
              <th className="py-2 pr-3">Active</th>
              <th className="py-2 pr-3">Connected</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map(d=>(
              <tr key={d.id} className="border-b border-gray-800">
                <td className="py-2 pr-3">{d.name}</td>
                <td className="py-2 pr-3">{d.platform}</td>
                <td className="py-2 pr-3">{d.is_active ? "Yes":"No"}</td>
                <td className="py-2 pr-3">{conn[d.id] ? "?" : "—"}</td>
                <td className="py-2 pr-3 flex gap-3">
                  <a className="underline" href={`/api/device/${d.id}/config`} target="_blank" rel="noreferrer">Config</a>
                  <button className="underline" onClick={()=>toggle(d.id, d.is_active)}>{d.is_active? "Suspend":"Activate"}</button>
                  <button className="underline text-red-300" onClick={()=>removeDevice(d.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
