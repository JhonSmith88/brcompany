-- Home product carousel
-- Run in Supabase → SQL Editor → New query

create table if not exists public.home_carousel (
  id uuid primary key default gen_random_uuid(),
  product_codigo text not null references public.products (codigo) on delete cascade,
  sort_order integer not null default 0,
  unique (product_codigo)
);

create index if not exists home_carousel_product_codigo_idx
  on public.home_carousel (product_codigo);

create index if not exists home_carousel_sort_order_idx
  on public.home_carousel (sort_order);

alter table public.home_carousel enable row level security;

drop policy if exists "Public read home_carousel" on public.home_carousel;
create policy "Public read home_carousel"
  on public.home_carousel for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert home_carousel" on public.home_carousel;
create policy "Auth insert home_carousel"
  on public.home_carousel for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update home_carousel" on public.home_carousel;
create policy "Auth update home_carousel"
  on public.home_carousel for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete home_carousel" on public.home_carousel;
create policy "Auth delete home_carousel"
  on public.home_carousel for delete
  to authenticated
  using (true);

grant select on table public.home_carousel to anon, authenticated;
grant select, insert, update, delete on table public.home_carousel to authenticated;
grant all on table public.home_carousel to service_role;

insert into public.home_carousel (product_codigo, sort_order)
select seed.codigo, seed.sort_order
from (
  values
    ('RB-W-002', 0),
    ('RB-W-003', 1),
    ('RB-W-004', 2)
) as seed(codigo, sort_order)
join public.products on products.codigo = seed.codigo
where not exists (select 1 from public.home_carousel);
