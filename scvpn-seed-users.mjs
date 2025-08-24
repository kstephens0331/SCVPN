import { createClient } from "@supabase/supabase-js";

const url = process.env.SCVPN_SUPABASE_URL;
const service = process.env.SCVPN_SUPABASE_SERVICE_KEY;
if (!url || !service) { console.error("Missing envs"); process.exit(1); }
const supa = createClient(url, service);

// Create an auth user + ensure profile row with account_type
async function ensureUser(email, password, full_name, account_type){
  const { data, error } = await supa.auth.admin.listUsers({ page: 1, perPage: 1, email });
  let userId;
  if (!error && data?.users?.length) {
    userId = data.users[0].id;
  } else {
    const { data: created, error: e1 } = await supa.auth.admin.createUser({
      email, password, email_confirm: true
    });
    if (e1) throw e1;
    userId = created.user.id;
  }
  const { error: e2 } = await supa.from("profiles")
    .upsert({ id: userId, email, full_name, account_type }, { onConflict: "id" });
  if (e2) throw e2;
  return userId;
}

async function ensureOrg(name, plan, slug){
  const { data, error } = await supa
    .from("organizations")
    .insert({ name, plan, is_active: true, slug })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function addMember(org_id, user_id, role="owner"){
  const { error } = await supa.from("org_members").insert({ org_id, user_id, role });
  if (error && !String(error.message||"").includes("duplicate")) throw error;
}

(async ()=>{
  // Personal user
  const personalId = await ensureUser("personal.test@sacvpn.dev","Test1234!","Personal Tester","personal");

  // Business user
  const bizId = await ensureUser("biz.test@sacvpn.dev","Test1234!","Biz Tester","business");

  // Business org using your allowed plan values
  const orgId = await ensureOrg("Acme Test Co","business10","acme-test-co");
  await addMember(orgId, bizId, "owner");

  console.log("Seed OK:",
    { personalId, bizId, orgId }
  );
})().catch(e=>{ console.error("FAILED", e); process.exit(1); });
