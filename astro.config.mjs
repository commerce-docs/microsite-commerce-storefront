import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import overrideIntegration from "./src/overrideIntegration.mjs"; // import the integration

// https://astro.build/config
export default defineConfig({
  integrations: [overrideIntegration(), react(), starlight({
    title: 'DropIn Kit',
    logo: {
      src: './src/assets/logo.svg',
      replacesTitle: true,
    },
    social: {
      github: 'https://github.com/commerce-docs/dropins.dev'
    },
    sidebar: [{
      label: 'Quick start',
      link: '/start/'
    }, {
      label: 'CLI usage',
      link: '/cli-usage/'
    }, {
      label: 'Slots',
      link: '/slots/'
    }, {
      label: 'Components',
      autogenerate: {
        directory: 'components'
      }
    }, {
      label: 'Design',
      autogenerate: {
        directory: 'design'
      }
    }, {
      label: 'API',
      autogenerate: {
        directory: 'reference'
      }
    }]
  }), tailwind()],
  customCSS: './src/tailwind.css',
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});