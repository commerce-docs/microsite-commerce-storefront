import { defineCollection, z as zod } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { text } from 'darkmatter';

const i18n = defineCollection({ type: 'data', schema: i18nSchema() });
const docs = defineCollection({
  type: 'content',
  schema: docsSchema({
    extend: zod.object({
      description: text(),
      iframe: zod.boolean().default(false).optional(),
      hero: zod.object({ subtitle: zod.string() }).optional(),
      prerequisites: zod
        .object({
          html: zod.boolean().default(false).optional(),
          css: zod.boolean().default(false).optional(),
          js: zod.boolean().default(false).optional(),
          github: zod.boolean().default(false).optional(),
        })
        .optional(),
    }),
  }),
});

export const collections = { docs, i18n };
