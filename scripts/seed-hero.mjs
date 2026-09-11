import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const slides = [
  {
    path: 'hero/01.jpg',
    alt: 'Reloj de lujo sobre fondo oscuro',
    source:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=75',
  },
  {
    path: 'hero/02.jpg',
    alt: 'Reloj en muñeca con luz cálida',
    source:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1800&q=75',
  },
  {
    path: 'hero/03.jpg',
    alt: 'Reloj clásico de esfera clara',
    source:
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1800&q=75',
  },
];

function loadEnv() {
  const file = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  /** @type {Record<string, string>} */
  const env = {};
  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 0) continue;
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('Faltan PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env');
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.id === 'site');
  if (!exists) {
    const { error } = await supabase.storage.createBucket('site', {
      public: true,
      fileSizeLimit: '8mb',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
    if (error && !error.message.toLowerCase().includes('already')) {
      throw new Error(`No se pudo crear el bucket: ${error.message}`);
    }
    console.log('Bucket site listo');
  } else {
    console.log('Bucket site ya existía');
  }

  let tableError = '';

  for (const [index, slide] of slides.entries()) {
    const response = await fetch(slide.source);
    if (!response.ok) {
      throw new Error(`No se pudo descargar ${slide.path} (${response.status})`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from('site').upload(slide.path, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (uploadError) {
      throw new Error(`No se pudo subir ${slide.path}: ${uploadError.message}`);
    }

    const imageUrl = supabase.storage.from('site').getPublicUrl(slide.path).data.publicUrl;
    const { error: rowError } = await supabase.from('hero_slides').upsert(
      {
        storage_path: slide.path,
        image_url: imageUrl,
        alt: slide.alt,
        sort_order: index,
        active: true,
      },
      { onConflict: 'storage_path' },
    );
    if (rowError) {
      tableError = rowError.message;
    }
    console.log(`Archivo ${slide.path} subido`);
  }

  if (tableError) {
    throw new Error(
      `Las imágenes están en Storage, pero falta la tabla hero_slides. Corre supabase/hero.sql en el SQL Editor. (${tableError})`,
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
