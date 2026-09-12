export const site = {
  name: 'BRCompany',
  tagline: 'Watches & Boutique',
  description:
    'Boutique de relojería de lujo y accesorios para hombres. Catálogo exclusivo con atención personalizada por WhatsApp.',
  whatsapp: {
    number: '593988743194',
    display: '+593 98 874 3194',
  },
  email: 'contacto@brcompany.com',
  location: 'Ecuador',
  social: {
    instagram: '#',
    facebook: '#',
  },
} as const;

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildWhatsAppUrl(message: string, number = site.whatsapp.number): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function productWhatsAppMessage(product: {
  codigo: string;
  nombre: string;
  precioReal: number;
  slug: string;
  categoriaSlug: string;
  imagenPrincipal: { full: string };
}, origin = ''): string {
  const productUrl = origin
    ? `${origin}/catalogo/${product.categoriaSlug}/${product.slug}`
    : `/catalogo/${product.categoriaSlug}/${product.slug}`;

  return [
    `Hola, me interesa este producto de ${site.name}:`,
    '',
    `*${product.nombre}*`,
    `Código: ${product.codigo}`,
    `Precio: ${formatPrice(product.precioReal)}`,
    '',
    `Ver en catálogo: ${productUrl}`,
    `Imagen: ${product.imagenPrincipal.full}`,
  ].join('\n');
}

export function generalWhatsAppMessage(context?: string): string {
  if (context) {
    return `Hola, escribo desde la web de ${site.name}. ${context}`;
  }
  return `Hola, escribo desde la web de ${site.name}. Me gustaría recibir más información.`;
}
