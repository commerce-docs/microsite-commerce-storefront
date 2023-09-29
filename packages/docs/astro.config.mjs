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
          label: 'DROPINS',
          items: [
            { label: 'About DropIns', link: '/dropins/about/' },
            { label: 'Use DropIns', link: '/dropins/use/' },
            { label: 'Customize DropIns', link: '/dropins/customize/' },
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
        {
          label: 'ELSIE SDK',
          items: [
            { label: 'Quick start', link: '/sdk/start/' },
            { label: 'CLI usage', link: '/sdk/cli/', },
            { label: 'Slots', link: '/sdk/slots/', badge: 'New' },
            { label: 'Components', 
              items: [
                { label: 'Overview', link: '/sdk/components/overview/' },
              ],
            },
            {
              label: 'Design',
              items: [
                { label: 'Overview', link: '/sdk/design/base/' },
                { label: 'Colors', link: '/sdk/design/colors/' },
                { label: 'Typography', link: '/sdk/design/typography/' },
                { label: 'Spacing', link: '/sdk/design/spacing/' },
                { label: 'Shapes', link: '/sdk/design/shapes/' },
                { label: 'Grids', link: '/sdk/design/grid/' },
              ],
            },
            {
              label: 'Reference',
              items: [
                { label: 'Events', link: '/sdk/reference/events/' },
                { label: 'Initialize', link: '/sdk/reference/initialize/' },
                { label: 'Render', link: '/sdk/reference/render/' },
              ],
            },
            {
              label: 'Helpers',
              items: [
                { label: 'classList', link: '/sdk/helpers/classlist/' },
                { label: 'debounce', link: '/sdk/helpers/debounce/' },
                { label: 'deepmerge', link: '/sdk/helpers/deepmerge/' },
                { label: 'getFormErrors', link: '/sdk/helpers/getformerrors/' },
                { label: 'getFormValues', link: '/sdk/helpers/getformvalues/' },
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
