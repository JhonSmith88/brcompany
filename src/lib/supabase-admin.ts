import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Solo servidor. Ignora RLS. No importar en componentes del navegador. */
export function getSupabaseAdmin(): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('Faltan PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env');
  }

  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}
