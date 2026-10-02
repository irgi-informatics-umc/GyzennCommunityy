import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://gyzenn-communityy.vercel.app',
  output: 'static',
  build: {
    format: 'directory'
  }
});
