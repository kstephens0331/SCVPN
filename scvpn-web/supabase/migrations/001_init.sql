-- === SCVPN Base Schema ===

-- EXTENSIONS (usually enabled already)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  account_type text check (account_type in ('personal','business','admin')) default 'personal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORGANIZATIONS
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  owner_id uuid references public.profiles(id) on delete set null,
  plan text check (plan in ('free','pro','enterprise')) default 'free',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEMBERS
create table if not exists public.org_members (
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner','admin','member','viewer')) default 'member',
  primary key (org_id, user_id),
  created_at timestamptz default now()
);

-- DEVICES
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  platform text check (platform in ('ios','android','macos','windows','linux','router','other')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WIREGUARD KEYS
create table if not exists public.wg_keys (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(id) on delete cascade,
  public_key text not null,
  private_key text not null,
  address cidr not null,
  preshared_key text,
  dns text[],
  allowed_ips text[] default array[''0.0.0.0/0'',''::/0''],
  endpoint text,
  persistent_keepalive int default 25,
  is_revoked boolean default false,
  created_at timestamptz default now()
);

-- QR CODES
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  device_id uuid references public.devices(id) on delete cascade,
  image_url text,
  config_text text not null,
  created_at timestamptz default now()
);

-- TELEMETRY
create table if not exists public.telemetry (
  id bigserial primary key,
  device_id uuid references public.devices(id) on delete cascade,
  ts timestamptz default now(),
  rx_bytes bigint default 0,
  tx_bytes bigint default 0,
  rx_packets bigint default 0,
  tx_packets bigint default 0,
  latency_ms int,
  endpoint text,
  is_connected boolean
);

-- BILLING (stub)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  plan text check (plan in ('free','pro','business','enterprise')) default 'free',
  status text check (status in ('active','past_due','canceled','trialing')) default 'trialing',
  quantity int default 1,
  renews_at timestamptz,
  created_at timestamptz default now()
);

-- Latest telemetry per device
create or replace view public.device_latest_telemetry as
select distinct on (t.device_id)
  t.device_id, t.ts, t.rx_bytes, t.tx_bytes, t.rx_packets, t.tx_packets, t.latency_ms, t.endpoint, t.is_connected
from public.telemetry t
order by t.device_id, t.ts desc;

-- Profile sync trigger from auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin allowlist (used by Edge Function)
create table if not exists public.admin_emails (
  email text primary key
);

-- === RLS ===
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.devices enable row level security;
alter table public.wg_keys enable row level security;
alter table public.qr_codes enable row level security;
alter table public.telemetry enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles
create policy if not exists "read_own_profile" on public.profiles for select
  using (auth.uid() = id);
create policy if not exists "update_own_profile" on public.profiles for update
  using (auth.uid() = id);

-- Orgs
create policy if not exists "org_read_members" on public.organizations for select
  using (exists(select 1 from public.org_members m where m.org_id = id and m.user_id = auth.uid()));
create policy if not exists "org_write_admin" on public.organizations for update
  using (exists(select 1 from public.org_members m where m.org_id = id and m.user_id = auth.uid() and m.role in ('owner','admin')));

-- Members
create policy if not exists "members_read_self_orgs" on public.org_members for select
  using (user_id = auth.uid());
create policy if not exists "members_write_owner_admin" on public.org_members for all
  using (exists(select 1 from public.org_members m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','admin')));

-- Devices
create policy if not exists "devices_read" on public.devices for select
  using (user_id = auth.uid() or exists(select 1 from public.org_members m where m.org_id = org_id and m.user_id = auth.uid()));
create policy if not exists "devices_write_admin_or_owner" on public.devices for all
  using (user_id = auth.uid() or exists(select 1 from public.org_members m where m.org_id = org_id and m.user_id = auth.uid() and m.role in ('owner','admin')));

-- Keys
create policy if not exists "wg_keys_read" on public.wg_keys for select
  using (exists(select 1 from public.devices d where d.id = device_id and (d.user_id = auth.uid() or exists(select 1 from public.org_members m where m.org_id = d.org_id and m.user_id = auth.uid()))));
create policy if not exists "wg_keys_write" on public.wg_keys for all
  using (exists(select 1 from public.devices d where d.id = device_id and (d.user_id = auth.uid() or exists(select 1 from public.org_members m where m.org_id = d.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')))));

-- QRs
create policy if not exists "qr_read" on public.qr_codes for select
  using (exists(select 1 from public.devices d where d.id = device_id and (d.user_id = auth.uid() or exists(select 1 from public.org_members m where m.org_id = d.org_id and m.user_id = auth.uid()))));
create policy if not exists "qr_write" on public.qr_codes for all
  using (exists(select 1 from public.devices d where d.id = device_id and (d.user_id = auth.uid() or exists(select 1 from public.org_members m where m.org_id = d.org_id and m.user_id = auth.uid() and m.role in ('owner','admin')))));

-- Telemetry
create policy if not exists "telemetry_read" on public.telemetry for select
  using (exists(select 1 from public.devices d where d.id = device_id and (d.user_id = auth.uid() or exists(select 1 from public.org_members m where m.org_id = d.org_id and m.user_id = auth.uid()))));
