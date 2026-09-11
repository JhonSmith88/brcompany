import { getSupabase } from '../supabase';

export const SITE_BUCKET = 'site';
export const DEFAULT_MEDIA_FOLDERS = ['hero', 'categories', 'products', 'order', 'about', 'uploads'];

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif|svg)$/i;

export type MediaItem = {
  path: string;
  name: string;
  url: string;
  updatedAt: string | null;
};

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export function isImagePath(name: string): boolean {
  return IMAGE_RE.test(name);
}

export function publicUrlForPath(path: string): string {
  const { data } = getSupabase().storage.from(SITE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${SITE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}

/** Sube un archivo al bucket público `site` y devuelve la URL pública. */
export async function uploadSiteMedia(file: File, folder = 'uploads'): Promise<string> {
  const supabase = getSupabase();
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const base = sanitizeFilename(file.name.replace(/\.[^.]+$/, '')) || 'file';
  const path = `${folder.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${base}.${ext}`;

  const { error } = await supabase.storage.from(SITE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  return publicUrlForPath(path);
}

/**
 * Lista imágenes del bucket (recorre carpetas).
 * `prefix` vacío = raíz completa.
 */
export async function listSiteMedia(prefix = ''): Promise<MediaItem[]> {
  const supabase = getSupabase();
  const items: MediaItem[] = [];
  const root = prefix.replace(/^\/+|\/+$/g, '');

  async function walk(folder: string) {
    const { data, error } = await supabase.storage.from(SITE_BUCKET).list(folder || '', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;

    for (const entry of data ?? []) {
      if (entry.name === '.emptyFolderPlaceholder') continue;
      const path = folder ? `${folder}/${entry.name}` : entry.name;
      const isFolder = entry.id === null;
      if (isFolder) {
        await walk(path);
        continue;
      }
      if (!isImagePath(entry.name)) continue;
      items.push({
        path,
        name: entry.name,
        url: publicUrlForPath(path),
        updatedAt: entry.updated_at ?? null,
      });
    }
  }

  await walk(root);
  items.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  return items;
}

/** Carpetas de primer nivel en el bucket (para filtrar). */
export async function listSiteFolders(): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(SITE_BUCKET).list('', {
    limit: 200,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw error;
  return (data ?? [])
    .filter((entry) => entry.id === null && entry.name !== '.emptyFolderPlaceholder')
    .map((entry) => entry.name);
}
