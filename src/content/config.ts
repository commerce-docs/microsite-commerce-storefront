import { defineCollection, z as zod } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { text } from 'darkmatter';

const i18n = defineCollection({ type: 'data', schema: i18nSchema() });
const docs = defineCollection({
  type: 'content',
  schema: docsSchema({
    extend: zod.object({
      description: text(),
      iframe: zod.boolean().default(false),
      hero: zod.object({
        subtitle: zod.string(),
      }).optional(),
    }),
  }),
});

export const collections = { docs, i18n };
