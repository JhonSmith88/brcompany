-- Hero carousel: table + public storage
-- Run in Supabase → SQL Editor → New query

insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do update set public = true;

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  image_url text not null,
  thumb_url text,
  alt text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true
);

alter table public.hero_slides enable row level security;

drop policy if exists "Public read hero_slides" on public.hero_slides;
create policy "Public read hero_slides"
  on public.hero_slides for select
  to anon, authenticated
  using (active = true);

grant select on table public.hero_slides to anon, authenticated;
grant all on table public.hero_slides to service_role;

drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site');
