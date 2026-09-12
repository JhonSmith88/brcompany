import type { Category } from '../data/categories';
import { categories as localCategories, getCategoryBySlug as getLocalCategory } from '../data/categories';
import type { Product, ProductImage } from '../data/products';
import {
  getFeaturedProducts as getLocalFeatured,
  getProductBySlug as getLocalProduct,
  getProductsByCategory as getLocalByCategory,
  getRelatedProducts as getLocalRelated,
  products as localProducts,
} from '../data/products';
import { sanitizeProductSpecs } from './product-specs';
import { getSupabase } from './supabase';

type CategoryRow = {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  imagen_thumb?: string | null;
};

type ProductRow = {
  codigo: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio_original: number;
  descuento: number;
  precio_real: number;
  marca: string;
  categoria_slug: string;
  demografia: string;
  stock: number;
  destacado: boolean;
  caracteristicas?: unknown;
  categories?: { nombre: string } | { nombre: string }[] | null;
};

type ImageRow = {
  product_codigo: string;
  thumb: string;
  full_url: string;
  alt: string;
  sort_order: number;
  is_principal: boolean;
};

function categoryName(row: ProductRow): string {
  const related = row.categories;
  if (Array.isArray(related)) return related[0]?.nombre ?? '';
  return related?.nombre ?? '';
}

function mapProduct(row: ProductRow, images: ImageRow[]): Product {
  const ordered = images
    .filter((image) => image.product_codigo === row.codigo)
    .sort((a, b) => a.sort_order - b.sort_order);

  const principalRow = ordered.find((image) => image.is_principal) ?? ordered[0];
  const imagenPrincipal: ProductImage = principalRow
    ? { thumb: principalRow.thumb, full: principalRow.full_url, alt: principalRow.alt }
    : { thumb: '', full: '', alt: row.nombre };

  const imagenes: ProductImage[] = ordered
    .filter((image) => image !== principalRow)
    .map((image) => ({ thumb: image.thumb, full: image.full_url, alt: image.alt }));

  return {
    codigo: row.codigo,
    slug: row.slug,
    nombre: row.nombre,
    descripcion: row.descripcion,
    imagenPrincipal,
    imagenes,
    precioOriginal: row.precio_original,
    descuento: row.descuento,
    precioReal: row.precio_real,
    marca: row.marca,
    categoria: categoryName(row),
    categoriaSlug: row.categoria_slug,
    demografia: row.demografia,
    stock: row.stock,
    destacado: row.destacado,
    caracteristicas: sanitizeProductSpecs(row.caracteristicas),
  };
}

async function fetchRemoteCatalog(): Promise<{ categories: Category[]; products: Product[] } | null> {
  try {
    const supabase = getSupabase();
    const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }, { data: imageRows, error: imageError }] =
      await Promise.all([
        supabase.from('categories').select('slug, nombre, descripcion, imagen, imagen_thumb').order('orden'),
        supabase.from('products').select('*, categories(nombre)'),
        supabase.from('product_images').select('product_codigo, thumb, full_url, alt, sort_order, is_principal').order('sort_order'),
      ]);

    if (categoryError || productError || imageError) return null;
    if (!categoryRows?.length || !productRows?.length) return null;

    return {
      categories: (categoryRows as CategoryRow[]).map((row) => ({
        slug: row.slug,
        nombre: row.nombre,
        descripcion: row.descripcion,
        imagen: row.imagen,
        imagenThumb: row.imagen_thumb || row.imagen,
      })),
      products: (productRows as ProductRow[]).map((row) => mapProduct(row, (imageRows ?? []) as ImageRow[])),
    };
  } catch {
    return null;
  }
}

let cache: Promise<{ categories: Category[]; products: Product[] }> | null = null;

async function loadCatalog() {
  if (!cache) {
    cache = fetchRemoteCatalog().then((remote) =>
      remote ?? {
        categories: localCategories,
        products: localProducts.map((product) => ({
          ...product,
          caracteristicas: sanitizeProductSpecs(product.caracteristicas),
        })),
      },
    );
  }
  return cache;
}

export async function getCategories(): Promise<Category[]> {
  return (await loadCatalog()).categories;
}

export async function getAllProducts(): Promise<Product[]> {
  return (await loadCatalog()).products;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const remote = (await loadCatalog()).categories.find((category) => category.slug === slug);
  return remote ?? getLocalCategory(slug);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getAllProducts();
  if (products === localProducts) return getLocalByCategory(categorySlug);
  return products.filter((product) => product.categoriaSlug === categorySlug);
}

export async function getProductBySlug(categorySlug: string, slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  if (products === localProducts) return getLocalProduct(categorySlug, slug);
  return products.find((product) => product.categoriaSlug === categorySlug && product.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  if (products === localProducts) return getLocalFeatured();
  return products.filter((product) => product.destacado);
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const products = await getAllProducts();
  if (products === localProducts) return getLocalRelated(product, limit);
  return products
    .filter((item) => item.categoriaSlug === product.categoriaSlug && item.codigo !== product.codigo)
    .slice(0, limit);
}
