# RBCompany

Catálogo web elegante de relojería y boutique masculina. Los pedidos se atienden por WhatsApp (sin pasarela de pago).

## Stack

- [Astro](https://astro.build) (despliegue en Vercel)
- Datos mock locales (próximo: Supabase + dashboard con login)

## Desarrollo

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — servidor local
- `npm run build` — build de producción
- `npm run preview` — previsualizar el build

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Home |
| `/quienes-somos` | Quiénes somos |
| `/catalogo` | Categorías |
| `/catalogo/[categoria]` | Productos de la categoría |
| `/catalogo/[categoria]/[slug]` | Detalle del producto |
| `/contacto` | Contacto / WhatsApp |

## WhatsApp

Número configurado en `src/data/site.ts`. Los botones de producto envían un mensaje con código, precio, enlace al catálogo e URL de la imagen.
