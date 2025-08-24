import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function BusinessAccount(){
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [org, setOrg] = useState(null);
  const [counts, setCounts] = useState({ users: 0, cap: null });
  const [err, setErr] = useState("");

  // Load orgs the current user belongs to
  useEffect(()=>{ (async()=>{
    setErr("");
    // Get orgs visible via RLS (owner/member)
    const { data: os, error } = await supabase
      .from("organizations")
      .select("id,name,plan,created_at")
      .order("name");
    if (error) { setErr(error.message); return; }
    setOrgs(os || []);
    if (os && os[0]) setOrgId(os[0].id);
  })(); },[]);

  // Load selected org details + user counts
  useEffect(()=>{ (async()=>{
    if (!orgId) { setOrg(null); setCounts({users:0, cap:null}); return; }
    setErr("");

    const { data: o, error: e1 } = await supabase
      .from("organizations")
      .select("id,name,plan,created_at")
      .eq("id", orgId)
      .maybeSingle();
    if (e1) { setErr(e1.message); return; }
    setOrg(o);

    // users in org
    const { count: userCount, error: e2 } = await supabase
      .from("org_members")
      .select("user_id", { count: "exact", head: true })
      .eq("org_id", orgId);
    if (e2) { setErr(e2.message); return; }

    // plan user cap
    let cap = null;
    if (o?.plan === "business10") cap = 10;
    if (o?.plan === "business50") cap = 50;
    if (o?.plan === "business250") cap = 250;

    setCounts({ users: userCount || 0, cap });
  })(); },[orgId]);

  const planLabel = useMemo(()=>{
    if (!org?.plan) return "—";
    const map = { free:"Free", pro:"Pro", enterprise:"Enterprise", personal:"Personal", gaming:"Gaming", business10:"Business 10", business50:"Business 50", business250:"Business 250" };
    return map[org.plan] || org.plan;
  },[org]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm text-lime-400/90">Organization</label>
          <select value={orgId} onChange={e=>setOrgId(e.target.value)} className="ml-2 rounded px-3 py-2 bg-black/40 ring-1 ring-gray-800">
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-gray-900 ring-1 ring-gray-800 p-5 grid gap-4 max-w-3xl">
        <div className="text-xl font-bold text-lime-400">Business Account</div>
        {err && <div className="text-red-400 text-sm">{err}</div>}
        {!org ? (
          <div className="text-sm text-gray-300">No organization found.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-black/30 p-4 ring-1 ring-gray-800">
                <div className="text-xs text-gray-400">Organization</div>
                <div className="text-base">{org.name}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-4 ring-1 ring-gray-800">
                <div className="text-xs text-gray-400">Plan</div>
                <div className="text-base">{planLabel}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-4 ring-1 ring-gray-800">
                <div className="text-xs text-gray-400">Users</div>
                <div className="text-base">
                  {counts.users}{counts.cap ? <> / {counts.cap}</> : null}
                  <span className="text-gray-400 text-xs ml-2">(each user can have up to 5 devices)</span>
                </div>
              </div>
              <div className="rounded-lg bg-black/30 p-4 ring-1 ring-gray-800">
                <div className="text-xs text-gray-400">Created</div>
                <div className="text-base">{org.created_at ? new Date(org.created_at).toLocaleDateString() : "—"}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="rounded px-4 py-2 bg-lime-400 text-black font-semibold" to="/app/business/users">Manage Users</Link>
              <Link className="rounded px-4 py-2 bg-lime-400 text-black font-semibold" to="/app/business/devices">Manage Devices</Link>
              <Link className="rounded px-4 py-2 bg-white/10 ring-1 ring-gray-700" to="/app/business/billing">Billing</Link>
              <Link className="rounded px-4 py-2 bg-white/10 ring-1 ring-gray-700" to="/support">Support</Link>
            </div>

            <div className="text-xs text-gray-400">
              Note: Personal accounts have unlimited devices. Business users are limited to 5 devices each.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
