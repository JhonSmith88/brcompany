import { getSupabase } from './supabase';

export type CatalogPageCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  description: string;
  categoryEyebrow: string;
  emptyCategory: string;
  emptyFilter: string;
  relatedEyebrow: string;
  relatedTitle: string;
};

export const defaultCatalogPageCopy: CatalogPageCopy = {
  eyebrow: 'Colecciones',
  title: 'Catálogo',
  lead: 'Explora nuestras categorías de relojes y accesorios seleccionados para complementar tu estilo con distinción.',
  description: 'Explora las categorías de relojes y accesorios masculinos de BRCompany.',
  categoryEyebrow: 'Categoría',
  emptyCategory: 'Pronto añadiremos piezas a esta categoría.',
  emptyFilter: 'No hay piezas con esos filtros.',
  relatedEyebrow: 'También te puede interesar',
  relatedTitle: 'Relacionados',
};

export async function getCatalogPageCopy(): Promise<CatalogPageCopy> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('catalog_page')
      .select(
        'eyebrow, title, lead, description, category_eyebrow, empty_category, empty_filter, related_eyebrow, related_title',
      )
      .eq('id', 'catalog')
      .maybeSingle();

    if (error || !data) return defaultCatalogPageCopy;

    return {
      eyebrow: data.eyebrow?.trim() || defaultCatalogPageCopy.eyebrow,
      title: data.title?.trim() || defaultCatalogPageCopy.title,
      lead: data.lead?.trim() || defaultCatalogPageCopy.lead,
      description: data.description?.trim() || defaultCatalogPageCopy.description,
      categoryEyebrow: data.category_eyebrow?.trim() || defaultCatalogPageCopy.categoryEyebrow,
      emptyCategory: data.empty_category?.trim() || defaultCatalogPageCopy.emptyCategory,
      emptyFilter: data.empty_filter?.trim() || defaultCatalogPageCopy.emptyFilter,
      relatedEyebrow: data.related_eyebrow?.trim() || defaultCatalogPageCopy.relatedEyebrow,
      relatedTitle: data.related_title?.trim() || defaultCatalogPageCopy.relatedTitle,
    };
  } catch {
    return defaultCatalogPageCopy;
  }
}
