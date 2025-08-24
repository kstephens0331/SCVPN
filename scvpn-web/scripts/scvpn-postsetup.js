import { createClient } from '@supabase/supabase-js';

const url = process.env.SCVPN_SUPABASE_URL;
const service = process.env.SCVPN_SUPABASE_SERVICE_KEY;
const adminEmail = process.env.SCVPN_ADMIN_EMAIL || 'info@stephenscode.dev';

if (!url || !service) {
  console.error('[SCVPN] Missing SCVPN_SUPABASE_URL or SCVPN_SUPABASE_SERVICE_KEY envs.');
  process.exit(1);
}

const supa = createClient(url, service);

async function ensureBucket() {
  try {
    // Create 'qr' bucket if not exists
    const { data: list } = await supa.storage.listBuckets();
    const exists = (list || []).some(b => b.name === 'qr');
    if (!exists) {
      const { error } = await supa.storage.createBucket('qr', { public: false, fileSizeLimit: '10485760' });
      if (error) throw error;
      console.log('[SCVPN] Created storage bucket: qr');
    } else {
      console.log('[SCVPN] Bucket qr already exists');
    }
  } catch (e) {
    console.error('[SCVPN] Bucket create/list failed:', e.message || e);
  }
}

async function seedAdminEmail() {
  try {
    // table is created by the SQL migration; this will upsert safely
    await supa.from('admin_emails').upsert({ email: adminEmail });
    console.log('[SCVPN] Seeded admin_emails with', adminEmail);
  } catch (e) {
    console.error('[SCVPN] admin_emails upsert failed (did you run the SQL migration yet?)', e.message || e);
  }
}

await ensureBucket();
await seedAdminEmail();
