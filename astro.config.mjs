import { defineConfig } from 'astro/config';

// Fully static site — Vercel auto-detects Astro and serves the `dist/` output.
// https://astro.build/config
export default defineConfig({
  output: 'static'
});
