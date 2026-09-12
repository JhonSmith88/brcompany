// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://brcompany.vercel.app',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
