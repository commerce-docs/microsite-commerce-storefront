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
            { label: 'About DropIns', link: '/about/' },
            { label: 'Using DropIns', link: '/use/' },
            { label: 'Customizing DropIns', link: '/customize/' },
          ],
        },
        {
          label: 'Product Details',
          items: [
            { label: 'How it works', link: '/pdp/how_it_works/' },
            { label: 'How to add it', link: '/pdp/how_to_add/' },
            { label: 'Add an action button', link: '/pdp/add_action_button/' },
            { label: 'Hide the quantity input', link: '/pdp/hide_quantity_input/' },
          ],
        },
        {
          label: 'Checkout',
          items: [
            { label: 'How it works', link: '/checkout/how_it_works/' },
            { label: 'How to add it', link: '/checkout/how_to_add/' },
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
