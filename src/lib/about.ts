import { site } from '../data/site';
import { safeImageSrc, sanitizeBenefitIcon } from './home';
import { getSupabase } from './supabase';

export type AboutCopy = {
  eyebrow: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  imageUrl: string;
  logoUrl: string;
  ctaLabel: string;
  ctaContext: string;
  description: string;
};

export type AboutPillar = {
  title: string;
  text: string;
  icon: string;
};

export const defaultAboutCopy: AboutCopy = {
  eyebrow: 'La casa',
  title: 'Quiénes somos',
  paragraph1:
    '**RBCOMPANY** es una boutique orientada al estilo masculino de alto nivel. Nos enfocamos en relojes y accesorios seleccionados por su presencia, acabado y carácter.',
  paragraph2:
    'No operamos como un ecommerce tradicional: el catálogo web te permite explorar las piezas disponibles y, cuando encuentres la indicada, inicias una conversación directa por WhatsApp con nuestro equipo.',
  paragraph3:
    'Así confirmamos stock, resolvemos dudas de medidas o modelos y coordinamos la entrega con la misma atención que esperarías en un mostrador físico.',
  imageUrl: '/fondo-tela.png',
  logoUrl: '/logo.png',
  ctaLabel: 'Pedir por WhatsApp',
  ctaContext: `Quisiera conocer más sobre ${site.name}.`,
  description: `Conoce ${site.name}: boutique de relojería y accesorios masculinos con atención personalizada.`,
};

export const defaultAboutPillars: AboutPillar[] = [
  { title: 'Curaduría', text: 'Piezas con identidad, priorizando estética y calidad percibida.', icon: 'star' },
  { title: 'Atención humana', text: 'Asesoría real por WhatsApp, sin formularios fríos ni carritos abandonados.', icon: 'user' },
  { title: 'Transparencia', text: 'Código de producto, precio y disponibilidad visibles en cada ficha.', icon: 'shield' },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatAboutRichText(value: string): string {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export async function getAboutCopy(): Promise<AboutCopy> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('about_page')
      .select('eyebrow, title, paragraph_1, paragraph_2, paragraph_3, image_url, logo_url, cta_label, cta_context, description')
      .eq('id', 'about')
      .maybeSingle();

    if (error || !data) return defaultAboutCopy;

    return {
      eyebrow: data.eyebrow?.trim() || defaultAboutCopy.eyebrow,
      title: data.title?.trim() || defaultAboutCopy.title,
      paragraph1: data.paragraph_1?.trim() || defaultAboutCopy.paragraph1,
      paragraph2: data.paragraph_2?.trim() ?? defaultAboutCopy.paragraph2,
      paragraph3: data.paragraph_3?.trim() ?? defaultAboutCopy.paragraph3,
      imageUrl: safeImageSrc(data.image_url || defaultAboutCopy.imageUrl, defaultAboutCopy.imageUrl),
      logoUrl: safeImageSrc(data.logo_url || defaultAboutCopy.logoUrl, defaultAboutCopy.logoUrl),
      ctaLabel: data.cta_label?.trim() || defaultAboutCopy.ctaLabel,
      ctaContext: data.cta_context?.trim() || defaultAboutCopy.ctaContext,
      description: data.description?.trim() || defaultAboutCopy.description,
    };
  } catch {
    return defaultAboutCopy;
  }
}

export async function getAboutPillars(): Promise<AboutPillar[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('about_pillars')
      .select('title, text, icon, sort_order')
      .eq('active', true)
      .order('sort_order');

    if (error) return defaultAboutPillars;

    return (data ?? []).map((row) => ({
      title: String(row.title ?? '').trim() || 'Pilar',
      text: String(row.text ?? '').trim(),
      icon: sanitizeBenefitIcon(String(row.icon ?? 'shield')),
    }));
  } catch {
    return defaultAboutPillars;
  }
}
