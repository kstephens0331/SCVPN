import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function BusinessOverview(){
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [rows, setRows] = useState([]);
  const [conn, setConn] = useState({});

  useEffect(()=>{ (async()=>{
    const { data: os } = await supabase.from("organizations").select("id,name").order("name");
    setOrgs(os || []);
    if (os && os[0]) setOrgId(os[0].id);
  })(); },[]);

  useEffect(()=>{ (async()=>{
    if (!orgId) return;
    const { data: d1 } = await supabase.from("devices").select("id").eq("org_id", orgId);
    setRows(d1 || []);
    const { data: d2 } = await supabase.from("device_latest_telemetry").select("device_id,is_connected");
    setConn(Object.fromEntries((d2||[]).map(x=>[x.device_id,x.is_connected])));
  })(); },[orgId]);

  const connected = useMemo(()=> rows.filter(d=>conn[d.id]).length, [rows,conn]);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-lime-400/90">Organization</label>
        <select value={orgId} onChange={e=>setOrgId(e.target.value)} className="ml-2 rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-2xl bg-gray-900 ring-1 ring-gray-800"><div className="text-lime-400/90 text-sm">Devices</div><div className="text-3xl font-bold text-lime-400">{rows.length}</div></div>
        <div className="p-5 rounded-2xl bg-gray-900 ring-1 ring-gray-800"><div className="text-lime-400/90 text-sm">Connected</div><div className="text-3xl font-bold text-lime-400">{connected}</div></div>
        <div className="p-5 rounded-2xl bg-gray-900 ring-1 ring-gray-800"><div className="text-lime-400/90 text-sm">VPN Status</div><div className="text-3xl font-bold text-lime-400">{connected>0?"Online":"Idle"}</div></div>
      </div>
    </div>
  );
}
