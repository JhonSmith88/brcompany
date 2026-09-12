-- Dashboard: hero table + write access for authenticated users
-- Run in Supabase → SQL Editor → New query

insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do update set public = true;

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  image_url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true
);

alter table public.hero_slides enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Public read hero_slides" on public.hero_slides;
create policy "Public read hero_slides"
  on public.hero_slides for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Auth read hero_slides" on public.hero_slides;
create policy "Auth read hero_slides"
  on public.hero_slides for select
  to authenticated
  using (true);

drop policy if exists "Auth insert hero_slides" on public.hero_slides;
create policy "Auth insert hero_slides"
  on public.hero_slides for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update hero_slides" on public.hero_slides;
create policy "Auth update hero_slides"
  on public.hero_slides for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete hero_slides" on public.hero_slides;
create policy "Auth delete hero_slides"
  on public.hero_slides for delete
  to authenticated
  using (true);

drop policy if exists "Auth insert categories" on public.categories;
create policy "Auth insert categories"
  on public.categories for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update categories" on public.categories;
create policy "Auth update categories"
  on public.categories for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete categories" on public.categories;
create policy "Auth delete categories"
  on public.categories for delete
  to authenticated
  using (true);

drop policy if exists "Auth insert products" on public.products;
create policy "Auth insert products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update products" on public.products;
create policy "Auth update products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete products" on public.products;
create policy "Auth delete products"
  on public.products for delete
  to authenticated
  using (true);

drop policy if exists "Auth insert product_images" on public.product_images;
create policy "Auth insert product_images"
  on public.product_images for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update product_images" on public.product_images;
create policy "Auth update product_images"
  on public.product_images for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete product_images" on public.product_images;
create policy "Auth delete product_images"
  on public.product_images for delete
  to authenticated
  using (true);

grant select, insert, update, delete on table public.hero_slides to authenticated;
grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update, delete on table public.product_images to authenticated;
grant all on table public.hero_slides to service_role;

drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site');

drop policy if exists "Auth upload site media" on storage.objects;
create policy "Auth upload site media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site');

drop policy if exists "Auth update site media" on storage.objects;
create policy "Auth update site media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site')
  with check (bucket_id = 'site');

drop policy if exists "Auth delete site media" on storage.objects;
create policy "Auth delete site media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site');

create table if not exists public.home_hero (
  id text primary key default 'home',
  eyebrow text not null default 'Estilo, precisión, distinción.',
  title text not null default 'BRCompany',
  lead text not null default 'Relojes y accesorios masculinos. Consulta el catálogo y pide por WhatsApp.',
  cta_label text not null default 'Ver catálogo',
  cta_href text not null default '/catalogo',
  updated_at timestamptz not null default now()
);

alter table public.home_hero enable row level security;

drop policy if exists "Public read home_hero" on public.home_hero;
create policy "Public read home_hero"
  on public.home_hero for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert home_hero" on public.home_hero;
create policy "Auth insert home_hero"
  on public.home_hero for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update home_hero" on public.home_hero;
create policy "Auth update home_hero"
  on public.home_hero for update
  to authenticated
  using (true)
  with check (true);

grant select on table public.home_hero to anon, authenticated;
grant select, insert, update, delete on table public.home_hero to authenticated;
grant all on table public.home_hero to service_role;

insert into public.home_hero (id)
values ('home')
on conflict (id) do nothing;

create table if not exists public.home_marks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

alter table public.home_marks enable row level security;

drop policy if exists "Public read home_marks" on public.home_marks;
create policy "Public read home_marks"
  on public.home_marks for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Auth read home_marks" on public.home_marks;
create policy "Auth read home_marks"
  on public.home_marks for select
  to authenticated
  using (true);

drop policy if exists "Auth insert home_marks" on public.home_marks;
create policy "Auth insert home_marks"
  on public.home_marks for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update home_marks" on public.home_marks;
create policy "Auth update home_marks"
  on public.home_marks for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete home_marks" on public.home_marks;
create policy "Auth delete home_marks"
  on public.home_marks for delete
  to authenticated
  using (true);

grant select on table public.home_marks to anon, authenticated;
grant select, insert, update, delete on table public.home_marks to authenticated;
grant all on table public.home_marks to service_role;

insert into public.home_marks (name, sort_order, active)
select seed.name, seed.sort_order, true
from (
  values
    ('Aurelia', 0),
    ('Stellion', 1),
    ('Noctis', 2),
    ('Regalis', 3)
) as seed(name, sort_order)
where not exists (select 1 from public.home_marks);

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

create table if not exists public.home_vitrina (
  id text primary key default 'home',
  eyebrow text not null default 'Colecciones',
  title text not null default 'Explora nuestro',
  title_em text not null default 'catálogo',
  cta_label text not null default 'Ver todo el catálogo',
  cta_href text not null default '/catalogo',
  card_label text not null default 'Ver colección',
  hint text not null default 'Desliza o haz clic en una categoría para descubrir más',
  hint_tablet text not null default 'Desliza para ver las colecciones',
  updated_at timestamptz not null default now()
);

alter table public.home_vitrina enable row level security;

drop policy if exists "Public read home_vitrina" on public.home_vitrina;
create policy "Public read home_vitrina"
  on public.home_vitrina for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert home_vitrina" on public.home_vitrina;
create policy "Auth insert home_vitrina"
  on public.home_vitrina for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update home_vitrina" on public.home_vitrina;
create policy "Auth update home_vitrina"
  on public.home_vitrina for update
  to authenticated
  using (true)
  with check (true);

grant select on table public.home_vitrina to anon, authenticated;
grant select, insert, update on table public.home_vitrina to authenticated;
grant all on table public.home_vitrina to service_role;

insert into public.home_vitrina (id)
values ('home')
on conflict (id) do nothing;

alter table public.categories add column if not exists en_vitrina boolean not null default true;
alter table public.categories add column if not exists icono text not null default 'watch';
alter table public.categories add column if not exists enlace text;

update public.categories
set enlace = '/catalogo/' || slug
where enlace is null or btrim(enlace) = '';

update public.categories
set icono = case slug
  when 'relojes' then 'watch'
  when 'pulseras' then 'bracelet'
  when 'billeteras' then 'wallet'
  when 'cuidado-personal' then 'scent'
  else icono
end;

alter table public.products
  add column if not exists caracteristicas jsonb not null default '[]'::jsonb;

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

create table if not exists public.home_carousel (
  id uuid primary key default gen_random_uuid(),
  product_codigo text not null references public.products (codigo) on delete cascade,
  sort_order integer not null default 0,
  unique (product_codigo)
);

create index if not exists home_carousel_product_codigo_idx
  on public.home_carousel (product_codigo);

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
  cta_context text not null default 'Quisiera conocer más sobre BRCompany.',
  description text not null default 'Conoce BRCompany: boutique de relojería y accesorios masculinos con atención personalizada.',
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
create policy "Auth select customers" on public.customers for select to authenticated using (true);
drop policy if exists "Auth insert customers" on public.customers;
create policy "Auth insert customers" on public.customers for insert to authenticated with check (true);
drop policy if exists "Auth update customers" on public.customers;
create policy "Auth update customers" on public.customers for update to authenticated using (true) with check (true);
drop policy if exists "Auth delete customers" on public.customers;
create policy "Auth delete customers" on public.customers for delete to authenticated using (true);

drop policy if exists "Auth select sales" on public.sales;
create policy "Auth select sales" on public.sales for select to authenticated using (true);
drop policy if exists "Auth insert sales" on public.sales;
create policy "Auth insert sales" on public.sales for insert to authenticated with check (true);
drop policy if exists "Auth update sales" on public.sales;
create policy "Auth update sales" on public.sales for update to authenticated using (true) with check (true);
drop policy if exists "Auth delete sales" on public.sales;
create policy "Auth delete sales" on public.sales for delete to authenticated using (true);

drop policy if exists "Auth select sale_items" on public.sale_items;
create policy "Auth select sale_items" on public.sale_items for select to authenticated using (true);
drop policy if exists "Auth insert sale_items" on public.sale_items;
create policy "Auth insert sale_items" on public.sale_items for insert to authenticated with check (true);
drop policy if exists "Auth update sale_items" on public.sale_items;
create policy "Auth update sale_items" on public.sale_items for update to authenticated using (true) with check (true);
drop policy if exists "Auth delete sale_items" on public.sale_items;
create policy "Auth delete sale_items" on public.sale_items for delete to authenticated using (true);

grant select, insert, update, delete on table public.customers, public.sales, public.sale_items to authenticated;
grant all on table public.customers, public.sales, public.sale_items to service_role;
