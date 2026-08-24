export type ProductImage = {
  thumb: string;
  full: string;
  alt: string;
};

export type Product = {
  codigo: string;
  slug: string;
  nombre: string;
  descripcion: string;
  imagenPrincipal: ProductImage;
  imagenes: ProductImage[];
  precioOriginal: number;
  descuento: number;
  precioReal: number;
  marca: string;
  categoria: string;
  categoriaSlug: string;
  demografia: string;
  stock: number;
  destacado?: boolean;
};

function img(id: string, alt: string): ProductImage {
  return {
    thumb: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=648&h=544&q=75`,
    full: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1296&h=1088&q=85`,
    alt,
  };
}

export const products: Product[] = [
  {
    codigo: 'RB-W-001',
    slug: 'cronografo-oro-negro',
    nombre: 'Cronógrafo Oro Negro',
    descripcion:
      'Cronógrafo automático con caja de acero y detalles en tono oro. Cristal de zafiro, resistencia al agua y correa de cuero negro. Una pieza diseñada para destacar en cualquier ocasión.',
    imagenPrincipal: img('photo-1523170335258-f5ed11844a49', 'Cronógrafo oro negro de lujo'),
    imagenes: [
      img('photo-1523170335258-f5ed11844a49', 'Cronógrafo vista frontal'),
      img('photo-1524592094714-0f0654e20314', 'Cronógrafo en muñeca'),
      img('photo-1547996160-81dfa63595aa', 'Detalle de bisel y corona'),
    ],
    precioOriginal: 890,
    descuento: 15,
    precioReal: 757,
    marca: 'Aurelia',
    categoria: 'Relojes',
    categoriaSlug: 'relojes',
    demografia: 'Hombres',
    stock: 4,
    destacado: true,
  },
  {
    codigo: 'RB-W-002',
    slug: 'classic-silver-automatic',
    nombre: 'Classic Silver Automatic',
    descripcion:
      'Reloj automático de línea clásica con esfera plateada y manecillas azules. Caja delgada, acabado espejo y correa metálica desmontable.',
    imagenPrincipal: img('photo-1547996160-81dfa63595aa', 'Reloj plateado automático'),
    imagenes: [
      img('photo-1547996160-81dfa63595aa', 'Vista frontal plateada'),
      img('photo-1587836374828-4ceb77eba2b0', 'Detalle de esfera'),
      img('photo-1622434641406-a158123450f9', 'Correa metálica'),
    ],
    precioOriginal: 620,
    descuento: 10,
    precioReal: 558,
    marca: 'Stellion',
    categoria: 'Relojes',
    categoriaSlug: 'relojes',
    demografia: 'Hombres',
    stock: 7,
    destacado: true,
  },
  {
    codigo: 'RB-W-003',
    slug: 'diver-midnight',
    nombre: 'Diver Midnight',
    descripcion:
      'Diver profesional con bisel unidireccional, iluminación de alta visibilidad y resistencia de 200 metros. Ideal para quienes buscan rendimiento y estilo.',
    imagenPrincipal: img('photo-1622434641406-a158123450f9', 'Reloj diver negro'),
    imagenes: [
      img('photo-1622434641406-a158123450f9', 'Diver vista lateral'),
      img('photo-1614164185128-e4ec99c436d7', 'Detalle de bisel'),
      img('photo-1524592094714-0f0654e20314', 'Diver en uso'),
    ],
    precioOriginal: 745,
    descuento: 0,
    precioReal: 745,
    marca: 'Noctis',
    categoria: 'Relojes',
    categoriaSlug: 'relojes',
    demografia: 'Hombres',
    stock: 3,
    destacado: true,
  },
  {
    codigo: 'RB-W-004',
    slug: 'skeleton-royal',
    nombre: 'Skeleton Royal',
    descripcion:
      'Edición skeleton con mecanismo a la vista y acabados dorados artesanales. Pieza de colección para amantes de la mecánica fina.',
    imagenPrincipal: img('photo-1614164185128-e4ec99c436d7', 'Reloj skeleton dorado'),
    imagenes: [
      img('photo-1614164185128-e4ec99c436d7', 'Skeleton frontal'),
      img('photo-1523170335258-f5ed11844a49', 'Detalle del mecanismo'),
    ],
    precioOriginal: 1250,
    descuento: 20,
    precioReal: 1000,
    marca: 'Regalis',
    categoria: 'Relojes',
    categoriaSlug: 'relojes',
    demografia: 'Hombres',
    stock: 2,
    destacado: true,
  },
  {
    codigo: 'RB-B-001',
    slug: 'cadena-eslabon-oro',
    nombre: 'Cadena Eslabón Oro',
    descripcion:
      'Pulsera de eslabones ensanchados con baño en tono oro. Cierre seguro y peso equilibrado para uso diario o eventos.',
    imagenPrincipal: img('photo-1611591437281-460bfbe1220a', 'Pulsera de oro para hombre'),
    imagenes: [
      img('photo-1611591437281-460bfbe1220a', 'Pulsera eslabón'),
      img('photo-1602173574767-37ac01994b2a', 'Detalle de cierre'),
    ],
    precioOriginal: 180,
    descuento: 10,
    precioReal: 162,
    marca: 'RB Essentials',
    categoria: 'Pulseras',
    categoriaSlug: 'pulseras',
    demografia: 'Hombres',
    stock: 12,
  },
  {
    codigo: 'RB-B-002',
    slug: 'pulsera-cuero-negro',
    nombre: 'Pulsera Cuero Negro',
    descripcion:
      'Cuero genuino con herraje metálico plateado. Diseño minimalista que combina con relojes y ropa formal.',
    imagenPrincipal: img('photo-1602173574767-37ac01994b2a', 'Pulsera de cuero negra'),
    imagenes: [
      img('photo-1602173574767-37ac01994b2a', 'Pulsera cuero'),
      img('photo-1611591437281-460bfbe1220a', 'Accesorios de muñeca'),
    ],
    precioOriginal: 65,
    descuento: 0,
    precioReal: 65,
    marca: 'RB Essentials',
    categoria: 'Pulseras',
    categoriaSlug: 'pulseras',
    demografia: 'Hombres',
    stock: 20,
  },
  {
    codigo: 'RB-L-001',
    slug: 'billetera-italia-negra',
    nombre: 'Billetera Italia Negra',
    descripcion:
      'Billetera de cuero italiano con compartimentos para tarjetas y billetes. Costuras precisas y silueta delgada.',
    imagenPrincipal: img('photo-1627123424574-724758594e93', 'Billetera de cuero negra'),
    imagenes: [
      img('photo-1627123424574-724758594e93', 'Billetera cerrada'),
      img('photo-1553062407-98eeb64c6a62', 'Billetera abierta'),
    ],
    precioOriginal: 95,
    descuento: 5,
    precioReal: 90,
    marca: 'RB Leather',
    categoria: 'Billeteras',
    categoriaSlug: 'billeteras',
    demografia: 'Hombres',
    stock: 9,
  },
  {
    codigo: 'RB-C-001',
    slug: 'eau-de-noir',
    nombre: 'Eau de Noir',
    descripcion:
      'Fragancia amaderada con notas de cedro, ámbar y pimienta negra. Intensidad nocturna y duración prolongada.',
    imagenPrincipal: img('photo-1594035910387-fea47794261f', 'Perfume masculino de lujo'),
    imagenes: [
      img('photo-1594035910387-fea47794261f', 'Frasco Eau de Noir'),
      img('photo-1541643600914-78b084683601', 'Detalle de empaque'),
    ],
    precioOriginal: 120,
    descuento: 0,
    precioReal: 120,
    marca: 'Nocturne',
    categoria: 'Cuidado personal',
    categoriaSlug: 'cuidado-personal',
    demografia: 'Hombres',
    stock: 15,
  },
];

export function getProductBySlug(categorySlug: string, slug: string): Product | undefined {
  return products.find((p) => p.categoriaSlug === categorySlug && p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categoriaSlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.destacado);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.categoriaSlug === product.categoriaSlug && p.codigo !== product.codigo)
    .slice(0, limit);
}
