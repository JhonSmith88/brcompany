-- RBCompany catalog
-- Run in Supabase → SQL Editor → New query

create table if not exists public.categories (
  slug text primary key,
  nombre text not null,
  descripcion text not null,
  imagen text not null,
  orden integer not null default 0
);

create table if not exists public.products (
  codigo text primary key,
  slug text not null,
  nombre text not null,
  descripcion text not null,
  precio_original integer not null,
  descuento integer not null default 0,
  precio_real integer not null,
  marca text not null,
  categoria_slug text not null references public.categories (slug) on delete restrict,
  demografia text not null default 'Hombres',
  stock integer not null default 0,
  destacado boolean not null default false,
  caracteristicas jsonb not null default '[]'::jsonb,
  unique (categoria_slug, slug)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_codigo text not null references public.products (codigo) on delete cascade,
  thumb text not null,
  full_url text not null,
  alt text not null,
  sort_order integer not null default 0,
  is_principal boolean not null default false
);

create index if not exists product_images_product_idx
  on public.product_images (product_codigo, sort_order);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read product_images" on public.product_images;
create policy "Public read product_images"
  on public.product_images for select
  to anon, authenticated
  using (true);

grant usage on schema public to anon, authenticated, service_role;
grant select on table public.categories, public.products, public.product_images to anon, authenticated;
grant all on table public.categories, public.products, public.product_images to service_role;

insert into public.categories (slug, nombre, descripcion, imagen, orden) values
  ('relojes', 'Relojes', 'Piezas de alta gama con acabados impecables y presencia imponente.', '/categories/relojes.png', 1),
  ('pulseras', 'Pulseras', 'Accesorios metálicos y de cuero que completan un look sofisticado.', '/categories/pulseras.png', 2),
  ('billeteras', 'Billeteras', 'Cuero premium y detalles discretos para el día a día.', '/categories/billeteras.png', 3),
  ('cuidado-personal', 'Cuidado personal', 'Fragancias y essentials masculinos de carácter atemporal.', '/categories/cuidado-personal.png', 4)
on conflict (slug) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  imagen = excluded.imagen,
  orden = excluded.orden;

insert into public.products (
  codigo, slug, nombre, descripcion, precio_original, descuento, precio_real,
  marca, categoria_slug, demografia, stock, destacado
) values
  ('RB-W-001', 'cronografo-oro-negro', 'Cronógrafo Oro Negro', 'Cronógrafo automático con caja de acero y detalles en tono oro. Cristal de zafiro, resistencia al agua y correa de cuero negro. Una pieza diseñada para destacar en cualquier ocasión.', 890, 15, 757, 'Aurelia', 'relojes', 'Hombres', 4, true),
  ('RB-W-002', 'classic-silver-automatic', 'Classic Silver Automatic', 'Reloj automático de línea clásica con esfera plateada y manecillas azules. Caja delgada, acabado espejo y correa metálica desmontable.', 620, 10, 558, 'Stellion', 'relojes', 'Hombres', 7, true),
  ('RB-W-003', 'diver-midnight', 'Diver Midnight', 'Diver profesional con bisel unidireccional, iluminación de alta visibilidad y resistencia de 200 metros. Ideal para quienes buscan rendimiento y estilo.', 745, 0, 745, 'Noctis', 'relojes', 'Hombres', 3, true),
  ('RB-W-004', 'skeleton-royal', 'Skeleton Royal', 'Edición skeleton con mecanismo a la vista y acabados dorados artesanales. Pieza de colección para amantes de la mecánica fina.', 1250, 20, 1000, 'Regalis', 'relojes', 'Hombres', 2, true),
  ('RB-B-001', 'cadena-eslabon-oro', 'Cadena Eslabón Oro', 'Pulsera de eslabones ensanchados con baño en tono oro. Cierre seguro y peso equilibrado para uso diario o eventos.', 180, 10, 162, 'RB Essentials', 'pulseras', 'Hombres', 12, false),
  ('RB-B-002', 'pulsera-cuero-negro', 'Pulsera Cuero Negro', 'Cuero genuino con herraje metálico plateado. Diseño minimalista que combina con relojes y ropa formal.', 65, 0, 65, 'RB Essentials', 'pulseras', 'Hombres', 20, false),
  ('RB-L-001', 'billetera-italia-negra', 'Billetera Italia Negra', 'Billetera de cuero italiano con compartimentos para tarjetas y billetes. Costuras precisas y silueta delgada.', 95, 5, 90, 'RB Leather', 'billeteras', 'Hombres', 9, false),
  ('RB-C-001', 'eau-de-noir', 'Eau de Noir', 'Fragancia amaderada con notas de cedro, ámbar y pimienta negra. Intensidad nocturna y duración prolongada.', 120, 0, 120, 'Nocturne', 'cuidado-personal', 'Hombres', 15, false)
on conflict (codigo) do update set
  slug = excluded.slug,
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  precio_original = excluded.precio_original,
  descuento = excluded.descuento,
  precio_real = excluded.precio_real,
  marca = excluded.marca,
  categoria_slug = excluded.categoria_slug,
  demografia = excluded.demografia,
  stock = excluded.stock,
  destacado = excluded.destacado;

delete from public.product_images;

insert into public.product_images (product_codigo, thumb, full_url, alt, sort_order, is_principal) values
  ('RB-W-001', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1296&h=1088&q=85', 'Cronógrafo oro negro de lujo', 0, true),
  ('RB-W-001', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1296&h=1088&q=85', 'Cronógrafo vista frontal', 1, false),
  ('RB-W-001', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1296&h=1088&q=85', 'Cronógrafo en muñeca', 2, false),
  ('RB-W-001', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1296&h=1088&q=85', 'Detalle de bisel y corona', 3, false),
  ('RB-W-002', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1296&h=1088&q=85', 'Reloj plateado automático', 0, true),
  ('RB-W-002', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1296&h=1088&q=85', 'Vista frontal plateada', 1, false),
  ('RB-W-002', 'https://images.unsplash.com/photo-1587836374828-4ceb77eba2b0?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1587836374828-4ceb77eba2b0?auto=format&fit=crop&w=1296&h=1088&q=85', 'Detalle de esfera', 2, false),
  ('RB-W-002', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1296&h=1088&q=85', 'Correa metálica', 3, false),
  ('RB-W-003', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1296&h=1088&q=85', 'Reloj diver negro', 0, true),
  ('RB-W-003', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1296&h=1088&q=85', 'Diver vista lateral', 1, false),
  ('RB-W-003', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1296&h=1088&q=85', 'Detalle de bisel', 2, false),
  ('RB-W-003', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1296&h=1088&q=85', 'Diver en uso', 3, false),
  ('RB-W-004', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1296&h=1088&q=85', 'Reloj skeleton dorado', 0, true),
  ('RB-W-004', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1296&h=1088&q=85', 'Skeleton frontal', 1, false),
  ('RB-W-004', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1296&h=1088&q=85', 'Detalle del mecanismo', 2, false),
  ('RB-B-001', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1296&h=1088&q=85', 'Pulsera de oro para hombre', 0, true),
  ('RB-B-001', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1296&h=1088&q=85', 'Pulsera eslabón', 1, false),
  ('RB-B-001', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1296&h=1088&q=85', 'Detalle de cierre', 2, false),
  ('RB-B-002', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1296&h=1088&q=85', 'Pulsera de cuero negra', 0, true),
  ('RB-B-002', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1296&h=1088&q=85', 'Pulsera cuero', 1, false),
  ('RB-B-002', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1296&h=1088&q=85', 'Accesorios de muñeca', 2, false),
  ('RB-L-001', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1296&h=1088&q=85', 'Billetera de cuero negra', 0, true),
  ('RB-L-001', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1296&h=1088&q=85', 'Billetera cerrada', 1, false),
  ('RB-L-001', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1296&h=1088&q=85', 'Billetera abierta', 2, false),
  ('RB-C-001', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1296&h=1088&q=85', 'Perfume masculino de lujo', 0, true),
  ('RB-C-001', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1296&h=1088&q=85', 'Frasco Eau de Noir', 1, false),
  ('RB-C-001', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=648&h=544&q=75', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1296&h=1088&q=85', 'Detalle de empaque', 2, false);

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

drop policy if exists "Public read hero_slides" on public.hero_slides;
create policy "Public read hero_slides"
  on public.hero_slides for select
  to anon, authenticated
  using (active = true);

grant select on table public.hero_slides to anon, authenticated;
grant all on table public.hero_slides to service_role;

create table if not exists public.home_hero (
  id text primary key default 'home',
  eyebrow text not null default 'Estilo, precisión, distinción.',
  title text not null default 'RBCompany',
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

grant select on table public.home_hero to anon, authenticated;
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

grant select on table public.home_marks to anon, authenticated;
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

grant select on table public.home_benefits to anon, authenticated;
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

grant select on table public.home_vitrina to anon, authenticated;
grant all on table public.home_vitrina to service_role;

insert into public.home_vitrina (id)
values ('home')
on conflict (id) do nothing;

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

alter table public.home_spotlight enable row level security;

drop policy if exists "Public read home_spotlight" on public.home_spotlight;
create policy "Public read home_spotlight"
  on public.home_spotlight for select
  to anon, authenticated
  using (true);

grant select on table public.home_spotlight to anon, authenticated;
grant all on table public.home_spotlight to service_role;

insert into public.home_spotlight (id, product_codigo)
values ('home', 'RB-W-001')
on conflict (id) do nothing;

update public.products
set caracteristicas = '[
  {"title":"Maquinaria automática","text":"Alta precisión.","icon":"gear"},
  {"title":"Cristal de zafiro","text":"Resistente a rayaduras.","icon":"diamond"},
  {"title":"Resistencia al agua","text":"Hasta 100 metros.","icon":"water"},
  {"title":"Garantía","text":"2 años de garantía.","icon":"shield"}
]'::jsonb
where codigo = 'RB-W-001'
  and caracteristicas = '[]'::jsonb;

create table if not exists public.home_carousel (
  id uuid primary key default gen_random_uuid(),
  product_codigo text not null references public.products (codigo) on delete cascade,
  sort_order integer not null default 0,
  unique (product_codigo)
);

alter table public.home_carousel enable row level security;

drop policy if exists "Public read home_carousel" on public.home_carousel;
create policy "Public read home_carousel"
  on public.home_carousel for select
  to anon, authenticated
  using (true);

grant select on table public.home_carousel to anon, authenticated;
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

grant select on table public.home_order to anon, authenticated;
grant all on table public.home_order to service_role;

insert into public.home_order (id)
values ('home')
on conflict (id) do nothing;

create table if not exists public.site_settings (
  id text primary key default 'site',
  whatsapp_number text not null default '593988743194',
  whatsapp_display text not null default '+593 98 874 3194',
  email text not null default 'contacto@rbcompany.com',
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

grant select on table public.site_settings to anon, authenticated;
grant all on table public.site_settings to service_role;

insert into public.site_settings (id)
values ('site')
on conflict (id) do nothing;

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

drop policy if exists "Public read about_pillars" on public.about_pillars;
create policy "Public read about_pillars"
  on public.about_pillars for select
  to anon, authenticated
  using (active = true);

grant select on table public.about_page, public.about_pillars to anon, authenticated;
grant all on table public.about_page, public.about_pillars to service_role;

insert into public.about_page (id)
values ('about')
on conflict (id) do nothing;

create table if not exists public.catalog_page (
  id text primary key default 'catalog',
  eyebrow text not null default 'Colecciones',
  title text not null default 'Catálogo',
  lead text not null default 'Explora nuestras categorías de relojes y accesorios seleccionados para complementar tu estilo con distinción.',
  description text not null default 'Explora las categorías de relojes y accesorios masculinos de RBCompany.',
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

grant select on table public.catalog_page to anon, authenticated;
grant all on table public.catalog_page to service_role;

insert into public.catalog_page (id)
values ('catalog')
on conflict (id) do nothing;

create table if not exists public.contact_page (
  id text primary key default 'contact',
  eyebrow text not null default 'Atención',
  title text not null default 'Contacto',
  lead text not null default 'Todos los pedidos se gestionan por WhatsApp. Escríbenos y te respondemos con disponibilidad y opciones de entrega.',
  description text not null default 'Contacta a RBCompany por WhatsApp para pedidos, disponibilidad y asesoría.',
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

grant select on table public.contact_page to anon, authenticated;
grant all on table public.contact_page to service_role;

insert into public.contact_page (id)
values ('contact')
on conflict (id) do nothing;

alter table public.categories add column if not exists en_vitrina boolean not null default true;
alter table public.categories add column if not exists icono text not null default 'watch';
alter table public.categories add column if not exists enlace text;

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

grant all on table public.customers, public.sales, public.sale_items to service_role;

drop policy if exists "Public read site media" on storage.objects;
create policy "Public read site media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site');
