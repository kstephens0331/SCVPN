import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
export default function PersonalBilling(){
  const [sub, setSub] = useState(null); const [invoices, setInvoices] = useState([]);
  useEffect(()=>{ (async()=>{
    const { data:{ user } } = await supabase.auth.getUser();
    const { data:s } = await supabase.from("subscriptions").select("id,plan,status,renews_at").eq("user_id", user.id).maybeSingle();
    setSub(s||null);
    const { data:i } = await supabase.from("invoices").select("id,amount_cents,currency,status,period_start,period_end,paid_at").eq("user_id", user.id).order("period_start",{ascending:false});
    setInvoices(i||[]);
  })(); },[]);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-lime-400">Billing</h2>
      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5">
        <div className="text-lime-400 font-semibold">Current plan</div>
        <div className="text-lime-300 text-sm">{sub? `${sub.plan} · ${sub.status}` : "—"}</div>
        <a href="/api/billing/manage" className="inline-block mt-3 rounded px-3 py-2 bg-lime-400 text-black font-semibold">Manage Billing</a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b border-gray-800 text-lime-400/90"><th className="py-2 pr-3">Period</th><th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Status</th></tr></thead>
          <tbody>{invoices.map(iv=>(
            <tr key={iv.id} className="border-b border-gray-800">
              <td className="py-2 pr-3">{new Date(iv.period_start).toLocaleDateString()} – {new Date(iv.period_end).toLocaleDateString()}</td>
              <td className="py-2 pr-3">{(iv.amount_cents/100).toFixed(2)} {iv.currency||"USD"}</td>
              <td className="py-2 pr-3">{iv.status}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
