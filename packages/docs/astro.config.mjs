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
            { label: 'About', link: '/about/' },
            { label: 'Setup', link: '/setup/' },
            { label: 'Style', link: '/style/' },
            { label: 'Extend', link: '/extend/' },
          ],
        },
        {
          label: 'Product Details',
          items: [
            { label: 'About', link: '/pdp/about/' },
            { label: 'Install', link: '/pdp/install/' },
            { label: 'Containers', link: '/pdp/containers/' },
            { label: 'Slots', link: '/pdp/slots/' },
            { label: 'API', link: '/pdp/api/' },
          ],
        },
        {
          label: 'Checkout',
          items: [
            { label: 'About', link: '/checkout/about/' },
            { label: 'Install', link: '/checkout/install/' },
            { label: 'Containers', link: '/checkout/containers/' },
            { label: 'Slots', link: '/checkout/slots/' },
            { label: 'API', link: '/checkout/api/' },
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
