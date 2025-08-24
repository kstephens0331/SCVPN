import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
export default function PersonalOverview(){
  const [devices, setDevices] = useState([]);
  const [conn, setConn] = useState({});
  useEffect(()=>{ (async()=>{
    const { data:d1 } = await supabase.from("devices").select("id");
    setDevices(d1||[]);
    const { data:d2 } = await supabase.from("device_latest_telemetry").select("device_id,is_connected");
    const map = Object.fromEntries((d2||[]).map(x=>[x.device_id, x.is_connected]));
    setConn(map);
  })(); },[]);
  const connected = useMemo(()=> devices.filter(d=>conn[d.id]).length, [devices,conn]);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-lime-400">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-2xl bg-gray-900 ring-1 ring-gray-800"><div className="text-lime-400/90 text-sm">Devices</div><div className="text-3xl font-bold text-lime-400">{devices.length}</div></div>
        <div className="p-5 rounded-2xl bg-gray-900 ring-1 ring-gray-800"><div className="text-lime-400/90 text-sm">Connected</div><div className="text-3xl font-bold text-lime-400">{connected}</div></div>
        <div className="p-5 rounded-2xl bg-gray-900 ring-1 ring-gray-800"><div className="text-lime-400/90 text-sm">VPN Status</div><div className="text-3xl font-bold text-lime-400">{connected>0?"Online":"Idle"}</div></div>
      </div>
    </div>
  );
}
