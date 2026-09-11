-- Home order / WhatsApp close
-- Run in Supabase → SQL Editor → New query

create table if not exists public.home_order (
  id text primary key default 'home',
  title text not null default 'Elige la pieza.',
  title_em text not null default 'Escríbenos por WhatsApp.',
  lead text not null default 'Sin carrito ni pasarela. Confirmamos stock, envío y forma de pago en la conversación.',
  cta_label text not null default 'Escribir ahora',
  cta_context text not null default 'Quiero asesoría para elegir un producto.',
  image_url text not null default '/footer-hero.webp',
  updated_at timestamptz not null default now()
);

alter table public.home_order enable row level security;

drop policy if exists "Public read home_order" on public.home_order;
create policy "Public read home_order"
  on public.home_order for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert home_order" on public.home_order;
create policy "Auth insert home_order"
  on public.home_order for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update home_order" on public.home_order;
create policy "Auth update home_order"
  on public.home_order for update
  to authenticated
  using (true)
  with check (true);

grant select on table public.home_order to anon, authenticated;
grant select, insert, update on table public.home_order to authenticated;
grant all on table public.home_order to service_role;

insert into public.home_order (id)
values ('home')
on conflict (id) do nothing;
