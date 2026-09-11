-- Barra de beneficios del inicio. Se puede correr solo este archivo.
create table if not exists public.home_benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null default '',
  icon text not null default 'shield',
  sort_order integer not null default 0,
  active boolean not null default true
);

alter table public.home_benefits enable row level security;

drop policy if exists "Public read home_benefits" on public.home_benefits;
create policy "Public read home_benefits"
  on public.home_benefits for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Auth read home_benefits" on public.home_benefits;
create policy "Auth read home_benefits"
  on public.home_benefits for select
  to authenticated
  using (true);

drop policy if exists "Auth insert home_benefits" on public.home_benefits;
create policy "Auth insert home_benefits"
  on public.home_benefits for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update home_benefits" on public.home_benefits;
create policy "Auth update home_benefits"
  on public.home_benefits for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete home_benefits" on public.home_benefits;
create policy "Auth delete home_benefits"
  on public.home_benefits for delete
  to authenticated
  using (true);

grant select on table public.home_benefits to anon, authenticated;
grant select, insert, update, delete on table public.home_benefits to authenticated;
grant all on table public.home_benefits to service_role;

insert into public.home_benefits (title, text, icon, sort_order, active)
select seed.title, seed.text, seed.icon, seed.sort_order, true
from (
  values
    ('Productos originales', 'Garantía de autenticidad.', 'shield', 0),
    ('Envíos seguros', 'A todo el país.', 'truck', 1),
    ('Calidad premium', 'Solo lo mejor para ti.', 'badge', 2),
    ('Atención personalizada', 'Escríbenos por WhatsApp.', 'whatsapp', 3)
) as seed(title, text, icon, sort_order)
where not exists (select 1 from public.home_benefits);
