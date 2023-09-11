import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import overrideIntegration from "./src/overrideIntegration.mjs"; // import the integration

// https://astro.build/config
export default defineConfig({
   integrations: [
    overrideIntegration(),
    react(),
    starlight({
      title: 'Elsie SDK Docs',
      social: {
        github: 'https://github.com/commerce-docs/elsie.dev',
      },
      sidebar: [
        { label: 'Quick start', link: '/start/start/' },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
        {
          label: 'Design',
          autogenerate: { directory: 'design' },
        },

        {
          label: 'API',
          autogenerate: { directory: 'reference' },
        },
      ],
      customCss: ['./src/tailwind.css'],
    }),
    tailwind({ applyBaseStyles: true }),
  ],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
