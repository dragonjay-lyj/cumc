import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://edge.dragonjay.top',
    integrations: [tailwind(),sitemap()],
    output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
});
