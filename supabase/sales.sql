-- Customers and WhatsApp sales
-- Run in Supabase → SQL Editor → New query

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete restrict,
  status text not null default 'pendiente',
  note text not null default '',
  stock_applied boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_status_check check (status in ('pendiente', 'vendido', 'cancelado'))
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  product_codigo text not null references public.products (codigo) on delete restrict,
  qty integer not null default 1,
  unit_price integer not null default 0,
  product_nombre text not null default '',
  constraint sale_items_qty_check check (qty > 0),
  constraint sale_items_price_check check (unit_price >= 0)
);

alter table public.sales add column if not exists city text not null default '';
alter table public.sales add column if not exists shipping text not null default '';
alter table public.sales add column if not exists payment_method text not null default '';
alter table public.sales add column if not exists amount_paid integer not null default 0;
alter table public.sales add column if not exists delivery_date date;
alter table public.sales add column if not exists chat_url text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sales_payment_method_check'
      and conrelid = 'public.sales'::regclass
  ) then
    alter table public.sales
      add constraint sales_payment_method_check
      check (payment_method in ('', 'transferencia', 'efectivo', 'deposito'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sales_amount_paid_check'
      and conrelid = 'public.sales'::regclass
  ) then
    alter table public.sales
      add constraint sales_amount_paid_check
      check (amount_paid >= 0);
  end if;
end $$;

create unique index if not exists customers_phone_unique_idx
  on public.customers (phone)
  where phone <> '';

create index if not exists customers_phone_idx on public.customers (phone);
create index if not exists customers_name_idx on public.customers (name);
create index if not exists sales_customer_id_idx on public.sales (customer_id);
create index if not exists sales_created_at_idx on public.sales (created_at desc);
create index if not exists sales_status_idx on public.sales (status);
create index if not exists sale_items_sale_id_idx on public.sale_items (sale_id);
create index if not exists sale_items_product_codigo_idx on public.sale_items (product_codigo);

alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "Auth select customers" on public.customers;
create policy "Auth select customers"
  on public.customers for select
  to authenticated
  using (true);

drop policy if exists "Auth insert customers" on public.customers;
create policy "Auth insert customers"
  on public.customers for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update customers" on public.customers;
create policy "Auth update customers"
  on public.customers for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete customers" on public.customers;
create policy "Auth delete customers"
  on public.customers for delete
  to authenticated
  using (true);

drop policy if exists "Auth select sales" on public.sales;
create policy "Auth select sales"
  on public.sales for select
  to authenticated
  using (true);

drop policy if exists "Auth insert sales" on public.sales;
create policy "Auth insert sales"
  on public.sales for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update sales" on public.sales;
create policy "Auth update sales"
  on public.sales for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete sales" on public.sales;
create policy "Auth delete sales"
  on public.sales for delete
  to authenticated
  using (true);

drop policy if exists "Auth select sale_items" on public.sale_items;
create policy "Auth select sale_items"
  on public.sale_items for select
  to authenticated
  using (true);

drop policy if exists "Auth insert sale_items" on public.sale_items;
create policy "Auth insert sale_items"
  on public.sale_items for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update sale_items" on public.sale_items;
create policy "Auth update sale_items"
  on public.sale_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete sale_items" on public.sale_items;
create policy "Auth delete sale_items"
  on public.sale_items for delete
  to authenticated
  using (true);

grant select, insert, update, delete on table public.customers, public.sales, public.sale_items to authenticated;
grant all on table public.customers, public.sales, public.sale_items to service_role;
