-- Global contact settings
-- Run in Supabase → SQL Editor → New query

create table if not exists public.site_settings (
  id text primary key default 'site',
  whatsapp_number text not null default '593988743194',
  whatsapp_display text not null default '+593 98 874 3194',
  email text not null default 'contacto@brcompany.com',
  instagram_url text not null default '',
  facebook_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert site_settings" on public.site_settings;
create policy "Auth insert site_settings"
  on public.site_settings for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update site_settings" on public.site_settings;
create policy "Auth update site_settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

grant select on table public.site_settings to anon, authenticated;
grant select, insert, update on table public.site_settings to authenticated;
grant all on table public.site_settings to service_role;

insert into public.site_settings (id)
values ('site')
on conflict (id) do nothing;
