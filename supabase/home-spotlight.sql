-- Product specs + home spotlight
-- Run in Supabase → SQL Editor → New query

alter table public.products
  add column if not exists caracteristicas jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_caracteristicas_is_array'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_caracteristicas_is_array
      check (jsonb_typeof(caracteristicas) = 'array');
  end if;
end $$;

create table if not exists public.home_spotlight (
  id text primary key default 'home',
  eyebrow text not null default 'Selección',
  title text not null default 'Piezas destacadas',
  product_codigo text references public.products (codigo) on delete set null,
  cta_label text not null default 'Ver pieza',
  updated_at timestamptz not null default now()
);

create index if not exists home_spotlight_product_codigo_idx
  on public.home_spotlight (product_codigo);

alter table public.home_spotlight enable row level security;

drop policy if exists "Public read home_spotlight" on public.home_spotlight;
create policy "Public read home_spotlight"
  on public.home_spotlight for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert home_spotlight" on public.home_spotlight;
create policy "Auth insert home_spotlight"
  on public.home_spotlight for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update home_spotlight" on public.home_spotlight;
create policy "Auth update home_spotlight"
  on public.home_spotlight for update
  to authenticated
  using (true)
  with check (true);

grant select on table public.home_spotlight to anon, authenticated;
grant select, insert, update on table public.home_spotlight to authenticated;
grant all on table public.home_spotlight to service_role;

update public.products
set caracteristicas = '[
  {"title":"Maquinaria automática","text":"Alta precisión.","icon":"gear"},
  {"title":"Cristal de zafiro","text":"Resistente a rayaduras.","icon":"diamond"},
  {"title":"Resistencia al agua","text":"Hasta 100 metros.","icon":"water"},
  {"title":"Garantía","text":"2 años de garantía.","icon":"shield"}
]'::jsonb
where codigo = 'RB-W-001'
  and caracteristicas = '[]'::jsonb;

insert into public.home_spotlight (id, product_codigo)
values ('home', 'RB-W-001')
on conflict (id) do nothing;
