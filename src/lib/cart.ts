import { buildWhatsAppUrl, formatPrice, site } from '../data/site';

export type CartItem = {
  codigo: string;
  slug: string;
  categoriaSlug: string;
  nombre: string;
  marca: string;
  precioReal: number;
  imagen: string;
  qty: number;
  stock: number;
};

export type CartPayload = Omit<CartItem, 'qty'>;

export function toCartPayload(product: {
  codigo: string;
  slug: string;
  categoriaSlug: string;
  nombre: string;
  marca: string;
  precioReal: number;
  imagenPrincipal: { thumb: string };
  stock: number;
}): CartPayload {
  return {
    codigo: product.codigo,
    slug: product.slug,
    categoriaSlug: product.categoriaSlug,
    nombre: product.nombre,
    marca: product.marca,
    precioReal: product.precioReal,
    imagen: product.imagenPrincipal.thumb,
    stock: product.stock,
  };
}

const KEY = 'rbcompany-cart';
export const CART_EVENT = 'rb-cart-change';
export const CART_OPEN_EVENT = 'rb-cart-open';

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(item: CartPayload, qty = 1) {
  if (item.stock <= 0) return;
  const cart = read();
  const existing = cart.find((entry) => entry.codigo === item.codigo);
  if (existing) {
    existing.qty = Math.min(item.stock, existing.qty + qty);
  } else {
    cart.push({ ...item, qty: Math.min(item.stock, qty) });
  }
  write(cart);
}

export function setQty(codigo: string, qty: number) {
  const cart = read();
  const item = cart.find((entry) => entry.codigo === codigo);
  if (!item) return;
  const next = Math.max(1, Math.min(item.stock || 99, qty));
  item.qty = next;
  write(cart);
}

export function removeFromCart(codigo: string) {
  write(read().filter((entry) => entry.codigo !== codigo));
}

export function cartCount(): number {
  return read().reduce((sum, item) => sum + item.qty, 0);
}

export function cartTotal(): number {
  return read().reduce((sum, item) => sum + item.precioReal * item.qty, 0);
}

export function cartWhatsAppUrl(number?: string): string {
  const items = read();
  const lines = [
    `Hola, quiero pedir estos productos de ${site.name}:`,
    '',
    ...items.map(
      (item, index) =>
        `${index + 1}. *${item.nombre}* (${item.codigo}) × ${item.qty} — ${formatPrice(item.precioReal * item.qty)}`,
    ),
    '',
    `*Total: ${formatPrice(cartTotal())}*`,
  ];
  return buildWhatsAppUrl(lines.join('\n'), number);
}

export function openCart() {
  window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
}
