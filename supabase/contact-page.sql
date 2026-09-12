-- Contact page copy
-- Run in Supabase → SQL Editor → New query

create table if not exists public.contact_page (
  id text primary key default 'contact',
  eyebrow text not null default 'Atención',
  title text not null default 'Contacto',
  lead text not null default 'Todos los pedidos se gestionan por WhatsApp. Escríbenos y te respondemos con disponibilidad y opciones de entrega.',
  description text not null default 'Contacta a BRCompany por WhatsApp para pedidos, disponibilidad y asesoría.',
  whatsapp_title text not null default 'WhatsApp',
  whatsapp_text text not null default 'Ideal para consultas de stock, medidas, comparación entre modelos y seguimiento de tu pedido.',
  whatsapp_cta text not null default 'Pedir por WhatsApp',
  whatsapp_context text not null default 'Quiero hacer una consulta.',
  info_title text not null default 'Correo y ubicación',
  email_label text not null default 'Email',
  location_label text not null default 'Ubicación',
  location text not null default 'Ecuador',
  hours_label text not null default 'Horario orientativo',
  hours text not null default 'Lunes a sábado · 10:00 – 19:00',
  info_cta text not null default 'Preferimos WhatsApp',
  updated_at timestamptz not null default now()
);

alter table public.contact_page enable row level security;

drop policy if exists "Public read contact_page" on public.contact_page;
create policy "Public read contact_page"
  on public.contact_page for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert contact_page" on public.contact_page;
create policy "Auth insert contact_page"
  on public.contact_page for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update contact_page" on public.contact_page;
create policy "Auth update contact_page"
  on public.contact_page for update
  to authenticated
  using (true)
  with check (true);

grant select on table public.contact_page to anon, authenticated;
grant select, insert, update on table public.contact_page to authenticated;
grant all on table public.contact_page to service_role;

insert into public.contact_page (id)
values ('contact')
on conflict (id) do nothing;
