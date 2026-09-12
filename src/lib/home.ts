import { getSupabase } from './supabase';

export type HeroSlide = {
  src: string;
  alt: string;
};

const fallbackSlides: HeroSlide[] = [
  {
    src: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=75',
    alt: 'Reloj de lujo sobre fondo oscuro',
  },
  {
    src: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1800&q=75',
    alt: 'Reloj en muñeca con luz cálida',
  },
  {
    src: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1800&q=75',
    alt: 'Reloj clásico de esfera clara',
  },
];

const storagePaths: { path: string; alt: string }[] = [
  { path: 'hero/01.jpg', alt: 'Reloj de lujo sobre fondo oscuro' },
  { path: 'hero/02.jpg', alt: 'Reloj en muñeca con luz cálida' },
  { path: 'hero/03.jpg', alt: 'Reloj clásico de esfera clara' },
];

function slidesFromStorage(): HeroSlide[] {
  const supabase = getSupabase();
  return storagePaths.map((slide) => ({
    src: supabase.storage.from('site').getPublicUrl(slide.path).data.publicUrl,
    alt: slide.alt,
  }));
}

export type HeroCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  ctaLabel: string;
  ctaHref: string;
};

export const defaultHeroCopy: HeroCopy = {
  eyebrow: 'Estilo, precisión, distinción.',
  title: 'BRCompany',
  lead: 'Relojes y accesorios masculinos. Consulta el catálogo y pide por WhatsApp.',
  ctaLabel: 'Ver catálogo',
  ctaHref: '/catalogo',
};

export function safeHeroHref(value: string): string {
  const href = value.trim() || defaultHeroCopy.ctaHref;
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (/^https?:\/\//i.test(href)) return href;
  return defaultHeroCopy.ctaHref;
}

export function safeImageSrc(value: string, fallback: string): string {
  const src = value.trim() || fallback;
  if (src.startsWith('/') && !src.startsWith('//')) return src;
  if (/^https?:\/\//i.test(src)) return src;
  return fallback;
}

export function splitHeroTitle(title: string): { prefix: string; rest: string } {
  const trimmed = title.trim() || defaultHeroCopy.title;
  const match = trimmed.match(/^(RB)(.+)$/i);
  if (match) return { prefix: match[1], rest: match[2] };
  return { prefix: '', rest: trimmed };
}

export async function getHeroCopy(): Promise<HeroCopy> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('home_hero')
      .select('eyebrow, title, lead, cta_label, cta_href')
      .eq('id', 'home')
      .maybeSingle();

    if (error || !data) return defaultHeroCopy;

    return {
      eyebrow: data.eyebrow?.trim() || defaultHeroCopy.eyebrow,
      title: data.title?.trim() || defaultHeroCopy.title,
      lead: data.lead?.trim() || defaultHeroCopy.lead,
      ctaLabel: data.cta_label?.trim() || defaultHeroCopy.ctaLabel,
      ctaHref: safeHeroHref(data.cta_href || defaultHeroCopy.ctaHref),
    };
  } catch {
    return defaultHeroCopy;
  }
}

export const defaultHomeMarks = ['Aurelia', 'Stellion', 'Noctis', 'Regalis'];

export async function getHomeMarks(): Promise<string[] | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('home_marks')
      .select('name, sort_order')
      .eq('active', true)
      .order('sort_order');

    if (error) return null;
    return (data ?? []).map((row) => String(row.name ?? '').trim()).filter(Boolean);
  } catch {
    return null;
  }
}

export type HomeBenefit = {
  title: string;
  text: string;
  icon: string;
};

export const benefitIconOptions = [
  { value: 'shield', label: 'Escudo' },
  { value: 'truck', label: 'Envío' },
  { value: 'badge', label: 'Insignia' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'gear', label: 'Engranaje' },
  { value: 'diamond', label: 'Diamante' },
  { value: 'water', label: 'Agua' },
  { value: 'star', label: 'Estrella' },
  { value: 'user', label: 'Persona' },
] as const;

export const defaultHomeBenefits: HomeBenefit[] = [
  { title: 'Productos originales', text: 'Garantía de autenticidad.', icon: 'shield' },
  { title: 'Envíos seguros', text: 'A todo el país.', icon: 'truck' },
  { title: 'Calidad premium', text: 'Solo lo mejor para ti.', icon: 'badge' },
  { title: 'Atención personalizada', text: 'Escríbenos por WhatsApp.', icon: 'whatsapp' },
];

const allowedIcons = new Set(benefitIconOptions.map((item) => item.value));

export function sanitizeBenefitIcon(icon: string): string {
  return allowedIcons.has(icon as never) ? icon : 'shield';
}

export type VitrinaCopy = {
  eyebrow: string;
  title: string;
  titleEm: string;
  ctaLabel: string;
  ctaHref: string;
  cardLabel: string;
  hint: string;
  hintTablet: string;
};

export type VitrinaItem = {
  slug: string;
  nombre: string;
  imagen: string;
  icono: string;
  href: string;
};

export function categoryHref(slug: string, enlace?: string | null): string {
  return safeHeroHref(enlace?.trim() || `/catalogo/${slug}`);
}

export const vitrinaIconOptions = [
  { value: 'watch', label: 'Reloj' },
  { value: 'bracelet', label: 'Pulsera' },
  { value: 'wallet', label: 'Billetera' },
  { value: 'scent', label: 'Fragancia' },
] as const;

export const defaultVitrinaCopy: VitrinaCopy = {
  eyebrow: 'Colecciones',
  title: 'Explora nuestro',
  titleEm: 'catálogo',
  ctaLabel: 'Ver todo el catálogo',
  ctaHref: '/catalogo',
  cardLabel: 'Ver colección',
  hint: 'Desliza o haz clic en una categoría para descubrir más',
  hintTablet: 'Desliza para ver las colecciones',
};

const allowedVitrinaIcons = new Set(vitrinaIconOptions.map((item) => item.value));

export function sanitizeVitrinaIcon(icon: string, slug = ''): string {
  if (allowedVitrinaIcons.has(icon as never)) return icon;
  if (slug === 'pulseras') return 'bracelet';
  if (slug === 'billeteras') return 'wallet';
  if (slug === 'cuidado-personal') return 'scent';
  return 'watch';
}

export async function getVitrinaCopy(): Promise<VitrinaCopy> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('home_vitrina')
      .select('eyebrow, title, title_em, cta_label, cta_href, card_label, hint, hint_tablet')
      .eq('id', 'home')
      .maybeSingle();

    if (error || !data) return defaultVitrinaCopy;

    return {
      eyebrow: data.eyebrow?.trim() || defaultVitrinaCopy.eyebrow,
      title: data.title?.trim() || defaultVitrinaCopy.title,
      titleEm: data.title_em?.trim() ?? defaultVitrinaCopy.titleEm,
      ctaLabel: data.cta_label?.trim() || defaultVitrinaCopy.ctaLabel,
      ctaHref: safeHeroHref(data.cta_href || defaultVitrinaCopy.ctaHref),
      cardLabel: data.card_label?.trim() || defaultVitrinaCopy.cardLabel,
      hint: data.hint?.trim() || defaultVitrinaCopy.hint,
      hintTablet: data.hint_tablet?.trim() || defaultVitrinaCopy.hintTablet,
    };
  } catch {
    return defaultVitrinaCopy;
  }
}

export async function getVitrinaItems(): Promise<VitrinaItem[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('slug, nombre, imagen, icono, en_vitrina, enlace')
      .eq('en_vitrina', true)
      .order('orden');

    if (error) {
      const { data: fallback } = await supabase.from('categories').select('slug, nombre, imagen').order('orden');
      return (fallback ?? []).map((row) => ({
        slug: String(row.slug ?? ''),
        nombre: String(row.nombre ?? ''),
        imagen: String(row.imagen ?? ''),
        icono: sanitizeVitrinaIcon('', String(row.slug ?? '')),
        href: categoryHref(String(row.slug ?? '')),
      }));
    }

    if (!data) return [];

    return data.map((row) => ({
      slug: String(row.slug ?? ''),
      nombre: String(row.nombre ?? ''),
      imagen: String(row.imagen ?? ''),
      icono: sanitizeVitrinaIcon(String(row.icono ?? ''), String(row.slug ?? '')),
      href: categoryHref(String(row.slug ?? ''), row.enlace),
    }));
  } catch {
    return [];
  }
}

export type SpotlightCopy = {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  productCodigo: string | null;
};

export const defaultSpotlightCopy: SpotlightCopy = {
  eyebrow: 'Selección',
  title: 'Piezas destacadas',
  ctaLabel: 'Ver pieza',
  productCodigo: null,
};

export async function getSpotlightCopy(): Promise<SpotlightCopy> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('home_spotlight')
      .select('eyebrow, title, cta_label, product_codigo')
      .eq('id', 'home')
      .maybeSingle();

    if (error || !data) return defaultSpotlightCopy;

    return {
      eyebrow: data.eyebrow?.trim() || defaultSpotlightCopy.eyebrow,
      title: data.title?.trim() || defaultSpotlightCopy.title,
      ctaLabel: data.cta_label?.trim() || defaultSpotlightCopy.ctaLabel,
      productCodigo: data.product_codigo?.trim() || null,
    };
  } catch {
    return defaultSpotlightCopy;
  }
}

export function resolveSpotlightProduct<T extends { codigo: string; destacado?: boolean }>(
  products: T[],
  productCodigo: string | null,
): T | null {
  if (productCodigo) {
    const picked = products.find((item) => item.codigo === productCodigo);
    if (picked) return picked;
  }
  return products.find((item) => item.destacado) ?? products[0] ?? null;
}

export async function getHomeCarousel<T extends { codigo: string }>(products: T[]): Promise<T[] | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('home_carousel')
      .select('product_codigo, sort_order')
      .order('sort_order');

    if (error) return null;

    const byCodigo = new Map(products.map((product) => [product.codigo, product]));
    return (data ?? [])
      .map((row) => byCodigo.get(String(row.product_codigo ?? '')))
      .filter((product): product is T => Boolean(product));
  } catch {
    return null;
  }
}

export async function getHomeBenefits(): Promise<HomeBenefit[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('home_benefits')
      .select('title, text, icon, sort_order')
      .eq('active', true)
      .order('sort_order');

    if (error) return defaultHomeBenefits;

    return (data ?? []).map((row) => ({
      title: String(row.title ?? '').trim() || 'Beneficio',
      text: String(row.text ?? '').trim(),
      icon: sanitizeBenefitIcon(String(row.icon ?? 'shield')),
    }));
  } catch {
    return defaultHomeBenefits;
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('hero_slides')
      .select('image_url, alt, sort_order')
      .eq('active', true)
      .order('sort_order');

    if (!error && data?.length) {
      return data.map((row) => ({
        src: row.image_url,
        alt: row.alt ?? '',
      }));
    }

    return slidesFromStorage();
  } catch {
    try {
      return slidesFromStorage();
    } catch {
      return fallbackSlides;
    }
  }
}

export type OrderCopy = {
  title: string;
  titleEm: string;
  lead: string;
  ctaLabel: string;
  ctaContext: string;
  imageUrl: string;
};

export const defaultOrderCopy: OrderCopy = {
  title: 'Elige la pieza.',
  titleEm: 'Escríbenos por WhatsApp.',
  lead: 'Sin carrito ni pasarela. Confirmamos stock, envío y forma de pago en la conversación.',
  ctaLabel: 'Escribir ahora',
  ctaContext: 'Quiero asesoría para elegir un producto.',
  imageUrl: '/footer-hero.webp',
};

export async function getOrderCopy(): Promise<OrderCopy> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('home_order')
      .select('title, title_em, lead, cta_label, cta_context, image_url')
      .eq('id', 'home')
      .maybeSingle();

    if (error || !data) return defaultOrderCopy;

    return {
      title: data.title?.trim() || defaultOrderCopy.title,
      titleEm: data.title_em?.trim() ?? defaultOrderCopy.titleEm,
      lead: data.lead?.trim() || defaultOrderCopy.lead,
      ctaLabel: data.cta_label?.trim() || defaultOrderCopy.ctaLabel,
      ctaContext: data.cta_context?.trim() || defaultOrderCopy.ctaContext,
      imageUrl: safeImageSrc(data.image_url || defaultOrderCopy.imageUrl, defaultOrderCopy.imageUrl),
    };
  } catch {
    return defaultOrderCopy;
  }
}
