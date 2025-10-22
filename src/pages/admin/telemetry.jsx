import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Telemetry(){
  const [rows, setRows] = useState([])

  useEffect(()=>{
    supabase.from("device_latest_telemetry")
      .select("device_id, node_id, is_connected, client_ip, last_handshake, bytes_received, bytes_sent, recorded_at")
      .then(({data})=> setRows(data||[]))
  },[])

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-3">Device</th>
            <th className="py-2 pr-3">Node</th>
            <th className="py-2 pr-3">Connected</th>
            <th className="py-2 pr-3">Client IP</th>
            <th className="py-2 pr-3">Bytes Received</th>
            <th className="py-2 pr-3">Bytes Sent</th>
            <th className="py-2 pr-3">Last Handshake</th>
            <th className="py-2 pr-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map(r=> (
            <tr key={r.device_id} className="border-b">
              <td className="py-2 pr-3">{r.device_id}</td>
              <td className="py-2 pr-3">{r.node_id}</td>
              <td className="py-2 pr-3">{r.is_connected?'Yes':'No'}</td>
              <td className="py-2 pr-3">{r.client_ip ?? "—"}</td>
              <td className="py-2 pr-3">{r.bytes_received?.toLocaleString()}</td>
              <td className="py-2 pr-3">{r.bytes_sent?.toLocaleString()}</td>
              <td className="py-2 pr-3">{r.last_handshake ? new Date(r.last_handshake).toLocaleString() : "—"}</td>
              <td className="py-2 pr-3">{new Date(r.recorded_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
