-- Catalog page copy
-- Run in Supabase → SQL Editor → New query

create table if not exists public.catalog_page (
  id text primary key default 'catalog',
  eyebrow text not null default 'Colecciones',
  title text not null default 'Catálogo',
  lead text not null default 'Explora nuestras categorías de relojes y accesorios seleccionados para complementar tu estilo con distinción.',
  description text not null default 'Explora las categorías de relojes y accesorios masculinos de BRCompany.',
  category_eyebrow text not null default 'Categoría',
  empty_category text not null default 'Pronto añadiremos piezas a esta categoría.',
  empty_filter text not null default 'No hay piezas con esos filtros.',
  related_eyebrow text not null default 'También te puede interesar',
  related_title text not null default 'Relacionados',
  updated_at timestamptz not null default now()
);

alter table public.catalog_page enable row level security;

drop policy if exists "Public read catalog_page" on public.catalog_page;
create policy "Public read catalog_page"
  on public.catalog_page for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert catalog_page" on public.catalog_page;
create policy "Auth insert catalog_page"
  on public.catalog_page for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update catalog_page" on public.catalog_page;
create policy "Auth update catalog_page"
  on public.catalog_page for update
  to authenticated
  using (true)
  with check (true);

grant select on table public.catalog_page to anon, authenticated;
grant select, insert, update on table public.catalog_page to authenticated;
grant all on table public.catalog_page to service_role;

insert into public.catalog_page (id)
values ('catalog')
on conflict (id) do nothing;
