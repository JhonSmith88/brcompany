import { benefitIconOptions, sanitizeBenefitIcon } from './home';

export type ProductSpec = {
  title: string;
  text: string;
  icon: string;
};

export const specIconOptions = benefitIconOptions;
export const MAX_PRODUCT_SPECS = 6;

export const defaultWatchSpecs: ProductSpec[] = [
  { title: 'Maquinaria automática', text: 'Alta precisión.', icon: 'gear' },
  { title: 'Cristal de zafiro', text: 'Resistente a rayaduras.', icon: 'diamond' },
  { title: 'Resistencia al agua', text: 'Hasta 100 metros.', icon: 'water' },
  { title: 'Garantía', text: '2 años de garantía.', icon: 'shield' },
];

export function sanitizeProductSpecs(raw: unknown): ProductSpec[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const row = item as Record<string, unknown>;
      const title = String(row.title ?? '').trim();
      if (!title) return [];
      return [
        {
          title,
          text: String(row.text ?? '').trim(),
          icon: sanitizeBenefitIcon(String(row.icon ?? 'shield')),
        },
      ];
    })
    .slice(0, MAX_PRODUCT_SPECS);
}
