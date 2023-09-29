import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
//import overrideIntegration from './src/overrideIntegration.mjs'; // import the integration

// https://astro.build/config
export default defineConfig({
  site: 'https://dropins.dev',
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    starlight({
      title: 'DropIn Kit',
      customCss: [
        './src/styles/tailwind.css',
				'./src/styles/custom.css',
			],
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/commerce-docs/dropins.dev',
      },
      sidebar: [
        {
          label: 'DropIns',
          items: [
            { label: 'About DropIns', link: '/dropins/about/' },
            { label: 'Using DropIns', link: '/dropins/use/' },
            { label: 'Customizing DropIns', link: '/dropins/customize/' },
            {
              label: 'Product Details DropIn',
              items: [
                { label: 'About', link: '/dropins/pdp/about/' },
                { label: 'API', link: '/dropins/pdp/api/' },
              ],
            },
            {
              label: 'Checkout DropIn',
              items: [
                { label: 'About', link: '/dropins/checkout/about/' },
                { label: 'API', link: '/dropins/checkout/api/' },
              ],
            },
          ],
        },
      ],
    }),
    tailwind(),
    react()
  ],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
