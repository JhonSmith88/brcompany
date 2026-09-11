import { getSupabase } from './supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { SITE_BUCKET } from './media/upload';

export { storagePathFromUrl } from './media/upload';

export async function requireAdminSession(): Promise<{
  supabase: SupabaseClient;
  session: Session;
} | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.replace('/admin');
    return null;
  }
  return { supabase, session: data.session };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function fileExt(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  return 'jpg';
}

export async function uploadSiteFile(path: string, file: File): Promise<string> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(SITE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
  });
  if (error) throw error;
  const publicUrl = supabase.storage.from(SITE_BUCKET).getPublicUrl(path).data.publicUrl;
  return `${publicUrl}?t=${Date.now()}`;
}

export async function removeSiteFile(path: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.storage.from(SITE_BUCKET).remove([path]);
}
