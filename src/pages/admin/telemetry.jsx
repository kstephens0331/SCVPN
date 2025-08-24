import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
export default function Telemetry(){
  const [rows, setRows] = useState([])
  useEffect(()=>{
    supabase.from("device_latest_telemetry")
      .select("device_id, ts, rx_packets, tx_packets, rx_bytes, tx_bytes, latency_ms, endpoint, is_connected")
      .then(({data})=> setRows(data||[]))
  },[])
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-3">Device</th>
            <th className="py-2 pr-3">Connected</th>
            <th className="py-2 pr-3">Rx Packets</th>
            <th className="py-2 pr-3">Tx Packets</th>
            <th className="py-2 pr-3">Rx Bytes</th>
            <th className="py-2 pr-3">Tx Bytes</th>
            <th className="py-2 pr-3">Latency (ms)</th>
            <th className="py-2 pr-3">Endpoint</th>
            <th className="py-2 pr-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.device_id} className="border-b">
              <td className="py-2 pr-3">{r.device_id}</td>
              <td className="py-2 pr-3">{r.is_connected?'Yes':'No'}</td>
              <td className="py-2 pr-3">{r.rx_packets}</td>
              <td className="py-2 pr-3">{r.tx_packets}</td>
              <td className="py-2 pr-3">{r.rx_bytes}</td>
              <td className="py-2 pr-3">{r.tx_bytes}</td>
              <td className="py-2 pr-3">{r.latency_ms ?? "—"}</td>
              <td className="py-2 pr-3">{r.endpoint ?? "—"}</td>
              <td className="py-2 pr-3">{new Date(r.ts).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
