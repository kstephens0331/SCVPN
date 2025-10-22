import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Accounts(){
  const [users, setUsers] = useState([])
  const [orgs, setOrgs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(()=>{
    // Fetch all users - personal users won't have org_members
    supabase.from("profiles")
      .select("id, email, full_name, account_type")
      .then(async ({data: profilesData, error: profilesError})=>{
        console.log("[Accounts] Profiles:", profilesData, "error:", profilesError);

        if (profilesData) {
          // Get org memberships separately
          const { data: memberships } = await supabase
            .from("org_members")
            .select("user_id, organizations(name)");

          const orgMap = {};
          (memberships || []).forEach(m => {
            orgMap[m.user_id] = m.organizations?.name;
          });

          const usersWithOrgs = profilesData.map(u => ({
            ...u,
            org_name: orgMap[u.id] || null
          }));
          setUsers(usersWithOrgs);
        }
      });

    // Fetch organizations with member count
    supabase.from("organizations")
      .select("id, name, plan, is_active")
      .then(async ({data, error})=>{
        console.log("[Accounts] Organizations:", data, "error:", error);

        if (data) {
          // Get member counts
          const orgsWithCounts = await Promise.all(
            data.map(async (org) => {
              const { count } = await supabase
                .from("org_members")
                .select("*", { count: "exact", head: true })
                .eq("organization_id", org.id);
              return { ...org, member_count: count || 0 };
            })
          );
          setOrgs(orgsWithCounts);
        }
      });
  },[])

  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(search) ||
      u.full_name?.toLowerCase().includes(search) ||
      u.org_name?.toLowerCase().includes(search)
    );
  });

  const filteredOrgs = orgs.filter(o => {
    if (!searchTerm) return true;
    return o.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          placeholder="Search by email, name, or organization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded bg-gray-900 border border-gray-700 text-lime-400 placeholder-gray-500 focus:outline-none focus:border-lime-400"
        />
      </div>

      <section>
        <h3 className="text-lg font-semibold text-lime-400 mb-3">
          Organizations ({filteredOrgs.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700 text-lime-400/90">
                <th className="py-2 pr-4">Organization Name</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Members</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map(o => (
                <tr key={o.id} className="border-b border-gray-800 text-lime-300">
                  <td className="py-2 pr-4 font-medium">{o.name}</td>
                  <td className="py-2 pr-4">{o.plan || 'N/A'}</td>
                  <td className="py-2 pr-4">{o.member_count}</td>
                  <td className="py-2 pr-4">
                    <span className={o.is_active ? "text-lime-400" : "text-red-400"}>
                      {o.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrgs.length === 0 && (
            <div className="text-center py-8 text-gray-500">No organizations found</div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-lime-400 mb-3">
          All Users ({filteredUsers.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-700 text-lime-400/90">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Organization</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-gray-800 text-lime-300">
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.full_name || '—'}</td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">
                      {u.account_type || 'personal'}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {u.org_name ? (
                      <span className="text-lime-400">{u.org_name}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No users found</div>
          )}
        </div>
      </section>
    </div>
  )
}
