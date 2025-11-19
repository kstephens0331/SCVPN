import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DeviceConfig from "../../components/DeviceConfig";
import { API_BASE } from "../../lib/apiBase";

const PLATFORMS = ["ios","android","macos","windows","linux","router","other"];

export default function PersonalDevices(){
  const [showConfig, setShowConfig] = useState(null);

  async function requestKey(id){
    try{
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to request a key');
        return;
      }

      // Try new immediate key generation endpoint
      try {
        const response = await fetch(`${API_BASE}/api/wireguard/generate-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ device_id: id })
        });

        // If endpoint exists and returns JSON
        if (response.ok || response.status !== 405) {
          const result = await response.json();

          if (!response.ok) {
            alert('Failed: ' + (result.error || 'Unknown error'));
            return;
          }

          alert('✅ WireGuard keys generated! Check your email for setup instructions.');
          await load();
          return;
        }
      } catch (fetchError) {
        console.warn('New endpoint not available, falling back to RPC:', fetchError);
      }

      // Fallback: Use old RPC method if new endpoint doesn't exist
      const { error } = await supabase.rpc('request_wg_key', { p_device_id: id });
      if (error) {
        alert('Failed: ' + error.message);
        return;
      }

      // Immediately trigger batch processing
      console.log('Triggering immediate key processing...');
      try {
        const processResponse = await fetch(`${API_BASE}/api/wireguard/process-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (processResponse.ok) {
          console.log('Key processing triggered successfully');
          alert('✅ WireGuard keys generated! Check your email for setup instructions.');
        } else {
          console.warn('Key processing failed, but request created');
          alert('Key request submitted. Processing... Check your email in a few moments.');
        }
      } catch (processError) {
        console.error('Failed to trigger processing:', processError);
        alert('Key request submitted. Processing... Check your email in a few moments.');
      }

      await load();
    }catch(e){
      alert('Error: ' + (e?.message ?? e));
    }
  }
  const [rows, setRows] = useState([]);
  const [conn, setConn] = useState({});
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("android");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(){
    try {
      setErr("");
      console.log("[Devices] Loading devices...");

      // Get user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("[Devices] User error:", userError);
        setErr("Failed to get user: " + userError.message);
        return;
      }

      if (!user) {
        console.error("[Devices] No user found");
        setErr("Not logged in");
        return;
      }

      console.log("[Devices] User:", user.email, "ID:", user.id);

      // personal devices: org_id IS NULL
      const { data, error } = await supabase
        .from("devices")
        .select("id,name,platform,is_active")
        .is("org_id", null)
        .eq("user_id", user.id)
        .order("created_at", { ascending:false });

      if (error) {
        console.error("[Devices] Query error:", error);
        setErr(error.message);
        return;
      }

      console.log("[Devices] Loaded", data?.length || 0, "devices");
      setRows(data || []);

      // connectivity snapshot (optional)
      const { data: t, error: telemetryError } = await supabase
        .from("device_latest_telemetry")
        .select("device_id,is_connected");

      if (telemetryError) {
        console.warn("[Devices] Telemetry error:", telemetryError);
        // Don't show error for telemetry, it's optional
      }

      setConn(Object.fromEntries((t||[]).map(x=>[x.device_id, x.is_connected])));
    } catch (e) {
      console.error("[Devices] Load error:", e);
      setErr("Failed to load devices: " + (e.message || e));
    }
  }

  useEffect(()=>{ load(); },[]);

  async function addDevice(){
    setBusy(true); setErr("");
    try {
      const { data:{ session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setErr("Not signed in"); return; }
      if (!name) { setErr("Please enter a device name."); return; }
      if (!PLATFORMS.includes(platform)) { setErr("Invalid platform."); return; }

      // Insert device
      const { data: newDevice, error } = await supabase.from("devices").insert({
        user_id: user.id,
        org_id: null,                   // PERSONAL
        name,
        platform,
        is_active: true,
      }).select().single();

      if (error) { setErr(error.message); return; }

      // Auto-generate WireGuard keys for the new device
      try {
        const response = await fetch(`${API_BASE}/api/wireguard/generate-key`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ device_id: newDevice.id })
        });

        if (response.ok) {
          alert('✅ Device added and WireGuard keys generated! Check your email for setup instructions.');
        } else {
          const result = await response.json();
          console.warn('Key generation failed:', result.error);
          alert('Device added, but key generation failed: ' + (result.error || 'Unknown error') + '. Try clicking "Request Key" later.');
        }
      } catch (keyError) {
        console.warn('Key generation error:', keyError);
        alert('Device added, but key generation failed. Try clicking "Request Key" later.');
      }

      setName(""); setPlatform("android");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function renameDevice(id, newName){
    setBusy(true); setErr("");
    const { error } = await supabase.from("devices").update({ name: newName }).eq("id", id);
    if (error) setErr(error.message);
    await load(); setBusy(false);
  }

  async function toggle(id, isActive){
    setBusy(true); setErr("");
    const { error } = await supabase.from("devices").update({ is_active: !isActive }).eq("id", id);
    if (error) setErr(error.message);
    await load(); setBusy(false);
  }

  async function removeDevice(id){
    setBusy(true); setErr("");
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) setErr(error.message);
    await load(); setBusy(false);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-lime-400">Devices</h2>

      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5">
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            placeholder="Device name"
            className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"
          />
          <select
            value={platform}
            onChange={e=>setPlatform(e.target.value)}
            className="rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800"
          >
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            disabled={busy || !name}
            onClick={addDevice}
            className="rounded px-4 py-2 bg-lime-400 text-black font-semibold disabled:opacity-50"
          >
            Add
          </button>
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
                <td className="py-2 pr-3">
                  <input
                    defaultValue={d.name}
                    onBlur={e => {
                      const val = e.target.value.trim();
                      if (val && val !== d.name) renameDevice(d.id, val);
                    }}
                    className="rounded px-2 py-1 bg-black/30 ring-1 ring-gray-800"
                  />
                </td>
                <td className="py-2 pr-3">{d.platform}</td>
                <td className="py-2 pr-3">{d.is_active ? "Yes" : "No"}</td>
                <td className="py-2 pr-3">{conn[d.id] ? "?" : "�"}</td>
                <td className="py-2 pr-3 flex gap-3">
                  <button className="underline text-lime-400" onClick={() => setShowConfig(d)}>View Config</button>
                  <button className="underline" onClick={()=>toggle(d.id, d.is_active)}>{d.is_active? "Suspend" : "Activate"}</button>
                  <button className="underline text-red-300" onClick={()=>removeDevice(d.id)}>Remove</button>
                  <button className="underline" onClick={() => requestKey(d.id)}>Request Key</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showConfig && (
        <DeviceConfig
          deviceId={showConfig.id}
          deviceName={showConfig.name}
          onClose={() => setShowConfig(null)}
        />
      )}
    </div>
  );
}

