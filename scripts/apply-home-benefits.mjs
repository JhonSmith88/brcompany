import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  const env = {};
  for (const line of readFileSync(resolve(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
  return env;
}

const sql = readFileSync(resolve(process.cwd(), 'supabase/home-benefits.sql'), 'utf8');

async function main() {
  const env = loadEnv();
  const url = env.PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Faltan PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY');

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: existing } = await supabase.from('home_benefits').select('id').limit(1);
  if (!existing) {
    console.log('Tabla home_benefits ya existe. Semilla omitida si hay filas.');
    return;
  }

  const endpoints = [`${url}/pg/query`, `${url}/pg-meta/default/query`];
  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    if (response.ok) {
      console.log(`SQL aplicado vía ${new URL(endpoint).pathname}`);
      return;
    }
  }

  throw new Error(
    'No hay endpoint de SQL en este proyecto. Hay que correr supabase/home-benefits.sql en el SQL Editor.',
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
