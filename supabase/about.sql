-- About page CMS
-- Run in Supabase → SQL Editor → New query

create table if not exists public.about_page (
  id text primary key default 'about',
  eyebrow text not null default 'La casa',
  title text not null default 'Quiénes somos',
  paragraph_1 text not null default '',
  paragraph_2 text not null default '',
  paragraph_3 text not null default '',
  image_url text not null default '/fondo-tela.png',
  logo_url text not null default '/logo.png',
  cta_label text not null default 'Pedir por WhatsApp',
  cta_context text not null default 'Quisiera conocer más sobre RBCompany.',
  description text not null default 'Conoce RBCompany: boutique de relojería y accesorios masculinos con atención personalizada.',
  updated_at timestamptz not null default now()
);

create table if not exists public.about_pillars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null default '',
  icon text not null default 'shield',
  sort_order integer not null default 0,
  active boolean not null default true
);

alter table public.about_page enable row level security;
alter table public.about_pillars enable row level security;

drop policy if exists "Public read about_page" on public.about_page;
create policy "Public read about_page"
  on public.about_page for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert about_page" on public.about_page;
create policy "Auth insert about_page"
  on public.about_page for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update about_page" on public.about_page;
create policy "Auth update about_page"
  on public.about_page for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public read about_pillars" on public.about_pillars;
create policy "Public read about_pillars"
  on public.about_pillars for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Auth read about_pillars" on public.about_pillars;
create policy "Auth read about_pillars"
  on public.about_pillars for select
  to authenticated
  using (true);

drop policy if exists "Auth insert about_pillars" on public.about_pillars;
create policy "Auth insert about_pillars"
  on public.about_pillars for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update about_pillars" on public.about_pillars;
create policy "Auth update about_pillars"
  on public.about_pillars for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete about_pillars" on public.about_pillars;
create policy "Auth delete about_pillars"
  on public.about_pillars for delete
  to authenticated
  using (true);

grant select on table public.about_page, public.about_pillars to anon, authenticated;
grant select, insert, update on table public.about_page to authenticated;
grant select, insert, update, delete on table public.about_pillars to authenticated;
grant all on table public.about_page, public.about_pillars to service_role;

insert into public.about_page (id, paragraph_1, paragraph_2, paragraph_3)
values (
  'about',
  '**RBCOMPANY** es una boutique orientada al estilo masculino de alto nivel. Nos enfocamos en relojes y accesorios seleccionados por su presencia, acabado y carácter.',
  'No operamos como un ecommerce tradicional: el catálogo web te permite explorar las piezas disponibles y, cuando encuentres la indicada, inicias una conversación directa por WhatsApp con nuestro equipo.',
  'Así confirmamos stock, resolvemos dudas de medidas o modelos y coordinamos la entrega con la misma atención que esperarías en un mostrador físico.'
)
on conflict (id) do nothing;

insert into public.about_pillars (title, text, icon, sort_order, active)
select seed.title, seed.text, seed.icon, seed.sort_order, true
from (
  values
    ('Curaduría', 'Piezas con identidad, priorizando estética y calidad percibida.', 'star', 0),
    ('Atención humana', 'Asesoría real por WhatsApp, sin formularios fríos ni carritos abandonados.', 'user', 1),
    ('Transparencia', 'Código de producto, precio y disponibilidad visibles en cada ficha.', 'shield', 2)
) as seed(title, text, icon, sort_order)
where not exists (select 1 from public.about_pillars);
