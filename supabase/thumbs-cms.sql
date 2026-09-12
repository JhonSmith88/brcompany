-- Miniaturas del dashboard (mismo flujo que productos / Miju)
-- categories.imagen y hero_slides.image_url siguen siendo la imagen completa.
-- Las listas del admin y las tarjetas de catálogo usan la miniatura.

alter table public.categories
  add column if not exists imagen_thumb text;

update public.categories
  set imagen_thumb = imagen
  where imagen_thumb is null;

alter table public.hero_slides
  add column if not exists thumb_url text;

update public.hero_slides
  set thumb_url = image_url
  where thumb_url is null;
