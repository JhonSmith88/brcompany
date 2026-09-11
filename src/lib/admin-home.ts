export const homeAdminSections = [
  {
    href: '/admin/inicio/hero',
    title: 'Hero',
    text: 'Texto sobre las fotos y el carrusel de imágenes.',
  },
  {
    href: '/admin/inicio/marcas',
    title: 'Marcas',
    text: 'Nombres que recorren la cinta bajo el hero.',
  },
  {
    href: '/admin/inicio/beneficios',
    title: 'Beneficios',
    text: 'Mensajes de la barra. Los tres primeros también van al catálogo.',
  },
  {
    href: '/admin/inicio/vitrina',
    title: 'Vitrina',
    text: 'Texto de colecciones y tarjetas del coverflow.',
  },
  {
    href: '/admin/inicio/destacada',
    title: 'Pieza destacada',
    text: 'El bloque grande con un producto y su botón.',
  },
  {
    href: '/admin/inicio/carrusel',
    title: 'Carrusel',
    text: 'La tira de productos bajo la pieza destacada.',
  },
  {
    href: '/admin/inicio/cierre',
    title: 'Cierre WhatsApp',
    text: 'Foto, título y botón del bloque final.',
  },
] as const;

export function showAdminAlert(el: Element | null, message: string, error = false) {
  if (!el) return;
  el.removeAttribute('hidden');
  el.textContent = message;
  el.classList.toggle('is-error', error);
}
