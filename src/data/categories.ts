export type Category = {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
};

export const categories: Category[] = [
  {
    slug: 'relojes',
    nombre: 'Relojes',
    descripcion: 'Piezas de alta gama con acabados impecables y presencia imponente.',
    imagen: '/categories/relojes.png',
  },
  {
    slug: 'pulseras',
    nombre: 'Pulseras',
    descripcion: 'Accesorios metálicos y de cuero que completan un look sofisticado.',
    imagen: '/categories/pulseras.png',
  },
  {
    slug: 'billeteras',
    nombre: 'Billeteras',
    descripcion: 'Cuero premium y detalles discretos para el día a día.',
    imagen: '/categories/billeteras.png',
  },
  {
    slug: 'cuidado-personal',
    nombre: 'Cuidado personal',
    descripcion: 'Fragancias y essentials masculinos de carácter atemporal.',
    imagen: '/categories/cuidado-personal.png',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
