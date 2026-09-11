import type { SupabaseClient } from '@supabase/supabase-js';
import { buildWhatsAppUrl, generalWhatsAppMessage } from '../data/site';
import { escapeHtml } from './media/ui';
import { sanitizeWhatsAppNumber } from './site-settings';

export type SiteRoute = {
  href: string;
  label: string;
  group: string;
};

export const EXTERNAL_ROUTE = '__external__';

const pageRoutes: SiteRoute[] = [
  { href: '/', label: 'Inicio', group: 'Páginas' },
  { href: '/catalogo', label: 'Catálogo', group: 'Páginas' },
  { href: '/quienes-somos', label: 'Quiénes somos', group: 'Páginas' },
  { href: '/contacto', label: 'Contacto', group: 'Páginas' },
];

export async function loadSiteRoutes(supabase: SupabaseClient): Promise<SiteRoute[]> {
  const [{ data: categories }, { data: products }, { data: settings }] = await Promise.all([
    supabase.from('categories').select('slug, nombre').order('orden'),
    supabase.from('products').select('nombre, slug, categoria_slug').order('nombre'),
    supabase.from('site_settings').select('whatsapp_number').eq('id', 'site').maybeSingle(),
  ]);

  const collectionRoutes = (categories ?? []).map((row) => ({
    href: `/catalogo/${row.slug}`,
    label: row.nombre,
    group: 'Colecciones',
  }));

  const productRoutes = (products ?? []).map((row) => ({
    href: `/catalogo/${row.categoria_slug}/${row.slug}`,
    label: row.nombre,
    group: 'Productos',
  }));

  return [
    ...pageRoutes,
    ...collectionRoutes,
    ...productRoutes,
    {
      href: buildWhatsAppUrl(generalWhatsAppMessage(), sanitizeWhatsAppNumber(settings?.whatsapp_number ?? '')),
      label: 'WhatsApp general',
      group: 'Acciones',
    },
  ];
}

function groupedOptions(routes: SiteRoute[], current: string): string {
  const groups = new Map<string, SiteRoute[]>();
  for (const route of routes) {
    const list = groups.get(route.group) ?? [];
    list.push(route);
    groups.set(route.group, list);
  }

  const known = routes.some((route) => route.href === current);
  const options = [...groups.entries()]
    .map(([group, items]) => {
      const rows = items
        .map(
          (item) =>
            `<option value="${escapeHtml(item.href)}" ${item.href === current ? 'selected' : ''}>${escapeHtml(item.label)} — ${escapeHtml(item.href)}</option>`,
        )
        .join('');
      return `<optgroup label="${escapeHtml(group)}">${rows}</optgroup>`;
    })
    .join('');

  return `${options}<option value="${EXTERNAL_ROUTE}" ${known ? '' : 'selected'}>Enlace externo o ruta personalizada…</option>`;
}

export function routePickerHtml(opts: {
  label: string;
  value: string;
  routes: SiteRoute[];
  name?: string;
  valueAttr?: string;
}): string {
  return `
    <div class="route-picker" data-route-picker>
      <span class="route-picker__label">${escapeHtml(opts.label)}</span>
      <select data-route-preset aria-label="${escapeHtml(opts.label)}">${groupedOptions(opts.routes, opts.value)}</select>
      <input
        type="text"
        data-route-custom
        value="${escapeHtml(opts.value)}"
        placeholder="https://… o /ruta-interna"
        autocomplete="off"
        spellcheck="false"
      >
      <p class="route-picker__hint">Elige una página, colección o producto del sitio, o escribe un enlace externo.</p>
      <input type="hidden" ${opts.name ? `name="${escapeHtml(opts.name)}"` : ''} ${opts.valueAttr ? escapeHtml(opts.valueAttr) : ''} data-route-value value="${escapeHtml(opts.value)}">
    </div>
  `;
}

function pickerParts(picker: HTMLElement) {
  return {
    preset: picker.querySelector<HTMLSelectElement>('[data-route-preset]'),
    custom: picker.querySelector<HTMLInputElement>('[data-route-custom]'),
    value: picker.querySelector<HTMLInputElement>('[data-route-value]'),
  };
}

function knownPreset(preset: HTMLSelectElement, href: string) {
  return [...preset.options].some((option) => option.value === href && option.value !== EXTERNAL_ROUTE);
}

function applyPickerValue(picker: HTMLElement, href: string) {
  const { preset, custom, value } = pickerParts(picker);
  if (!preset || !custom || !value) return;
  preset.value = knownPreset(preset, href) ? href : EXTERNAL_ROUTE;
  custom.value = href;
  value.value = href;
}

function syncPicker(picker: HTMLElement, source: 'preset' | 'custom') {
  const { preset, custom, value } = pickerParts(picker);
  if (!preset || !custom || !value) return;

  if (source === 'preset' && preset.value !== EXTERNAL_ROUTE) {
    custom.value = preset.value;
  } else if (source === 'custom') {
    const typed = custom.value.trim();
    preset.value = knownPreset(preset, typed) ? typed : EXTERNAL_ROUTE;
  }

  value.value = custom.value.trim() || (preset.value === EXTERNAL_ROUTE ? '' : preset.value);
}

export function bindRoutePickers(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-route-picker]').forEach((picker) => {
    if (picker.dataset.routeBound === 'true') return;
    picker.dataset.routeBound = 'true';
    picker.querySelector('[data-route-preset]')?.addEventListener('change', () => syncPicker(picker, 'preset'));
    picker.querySelector('[data-route-custom]')?.addEventListener('input', () => syncPicker(picker, 'custom'));
    syncPicker(picker, 'custom');
  });
}

export function pickerHref(root: ParentNode, fallback = ''): string {
  const value = root.querySelector<HTMLInputElement>('[data-route-value]')?.value.trim();
  return value || fallback;
}

export function setPickerHref(root: ParentNode, href: string): void {
  const picker = root.querySelector<HTMLElement>('[data-route-picker]');
  if (!picker) return;
  applyPickerValue(picker, href);
}
