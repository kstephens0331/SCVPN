import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
const PLATFORMS = ["ios","android","macos","windows","linux","router","other"];

export default function BusinessDevices(){
  const [orgs, setOrgs] = useState([]); const [orgId, setOrgId] = useState("");
  const [rows, setRows] = useState([]); const [conn, setConn] = useState({});
  const [name, setName] = useState(""); const [platform, setPlatform] = useState("linux");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState(null); const [editName, setEditName] = useState("");

  useEffect(()=>{ (async()=>{
    const { data: os } = await supabase.from("organizations").select("id,name").order("name");
    setOrgs(os || []);
    if (os && os[0]) setOrgId(os[0].id);
  })(); },[]);

  const load = async ()=>{
    if (!orgId) return;
    setErr("");
    const { data: d1, error: e1 } = await supabase
      .from("devices")
      .select("id,name,platform,is_active,org_id")
      .eq("org_id", orgId)
      .order("created_at",{ascending:false});
    if (e1) return setErr(e1.message);
    setRows(d1 || []);
    const { data: d2 } = await supabase.from("device_latest_telemetry").select("device_id,is_connected");
    setConn(Object.fromEntries((d2||[]).map(x=>[x.device_id,x.is_connected])));
  };

  useEffect(()=>{ load(); },[orgId]);

  async function addDevice(){
    setBusy(true); setErr("");
    const { error } = await supabase.from("devices").insert({ org_id: orgId, name, platform, is_active: true });
    if (error) setErr(error.message); else { setName(""); setPlatform("linux"); await load(); }
    setBusy(false);
  }
  async function toggle(id,isActive){ setBusy(true); const { error } = await supabase.from("devices").update({ is_active: !isActive }).eq("id", id); if (error) setErr(error.message); await load(); setBusy(false); }
  async function removeDevice(id){ setBusy(true); const { error } = await supabase.from("devices").delete().eq("id", id); if (error) setErr(error.message); await load(); setBusy(false); }
  async function rename(){ if(!editId) return; setBusy(true); const { error } = await supabase.from("devices").update({ name: editName }).eq("id", editId); if (error) setErr(error.message); else { setEditId(null); setEditName(""); } await load(); setBusy(false); }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-lime-400/90">Organization</label>
        <select value={orgId} onChange={e=>setOrgId(e.target.value)} className="ml-2 rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Device name" className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"/>
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">{PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}</select>
          <button disabled={busy || !name || !orgId} onClick={addDevice} className="rounded px-4 py-2 bg-lime-400 text-black font-semibold disabled:opacity-50">Add</button>
        </div>
        {err && <div className="text-red-400 text-sm mt-2">{err}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b border-gray-800 text-lime-400/90"><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Platform</th><th className="py-2 pr-3">Active</th><th className="py-2 pr-3">Connected</th><th className="py-2 pr-3">Actions</th></tr></thead>
          <tbody>{rows.map(d=>(
            <tr key={d.id} className="border-b border-gray-800">
              <td className="py-2 pr-3">{editId===d.id ? (<input value={editName} onChange={e=>setEditName(e.target.value)} className="rounded px-2 py-1 bg-black/40 ring-1 ring-gray-800"/>) : d.name}</td>
              <td className="py-2 pr-3">{d.platform}</td>
              <td className="py-2 pr-3">{d.is_active ? "Yes":"No"}</td>
              <td className="py-2 pr-3">{conn[d.id] ? "✔" : "—"}</td>
              <td className="py-2 pr-3 flex gap-3">
                <a className="underline" href={`/api/device/${d.id}/config`} target="_blank" rel="noreferrer">Config</a>
                <button className="underline" onClick={()=>toggle(d.id, d.is_active)}>{d.is_active? "Suspend":"Activate"}</button>
                {editId===d.id ? (<><button className="underline" onClick={rename}>Save</button><button className="underline" onClick={()=>{setEditId(null);setEditName("");}}>Cancel</button></>) : (<button className="underline" onClick={()=>{setEditId(d.id);setEditName(d.name);}}>Rename</button>)}
                <button className="underline text-red-300" onClick={()=>removeDevice(d.id)}>Remove</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
