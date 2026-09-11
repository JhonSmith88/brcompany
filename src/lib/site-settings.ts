import { site } from '../data/site';
import { getSupabase } from './supabase';

export type SiteSettings = {
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
};

export const defaultSiteSettings: SiteSettings = {
  whatsappNumber: site.whatsapp.number,
  whatsappDisplay: site.whatsapp.display,
  email: site.email,
  instagramUrl: site.social.instagram === '#' ? '' : site.social.instagram,
  facebookUrl: site.social.facebook === '#' ? '' : site.social.facebook,
};

export function sanitizeWhatsAppNumber(value: string, fallback = defaultSiteSettings.whatsappNumber): string {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : fallback;
}

export function sanitizeWhatsAppDisplay(value: string, number: string): string {
  const display = value.trim();
  return display || `+${number}`;
}

export function sanitizeEmail(value: string, fallback = defaultSiteSettings.email): string {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : fallback;
}

export function sanitizeSocialUrl(value: string): string {
  const href = value.trim();
  if (!href || href === '#') return '';
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (/^https?:\/\//i.test(href)) return href;
  return '';
}

export function mapSiteSettings(row: {
  whatsapp_number?: string | null;
  whatsapp_display?: string | null;
  email?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
}): SiteSettings {
  const whatsappNumber = sanitizeWhatsAppNumber(row.whatsapp_number ?? '');
  return {
    whatsappNumber,
    whatsappDisplay: sanitizeWhatsAppDisplay(row.whatsapp_display ?? '', whatsappNumber),
    email: sanitizeEmail(row.email ?? ''),
    instagramUrl: sanitizeSocialUrl(row.instagram_url ?? ''),
    facebookUrl: sanitizeSocialUrl(row.facebook_url ?? ''),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('site_settings')
      .select('whatsapp_number, whatsapp_display, email, instagram_url, facebook_url')
      .eq('id', 'site')
      .maybeSingle();

    if (error || !data) return defaultSiteSettings;
    return mapSiteSettings(data);
  } catch {
    return defaultSiteSettings;
  }
}
