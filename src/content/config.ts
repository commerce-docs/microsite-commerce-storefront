import { defineCollection, z as zod } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { text } from 'darkmatter';

const prerequisiteSchema = zod.boolean().default(false).optional();
const heroSchema = zod.object({ subtitle: zod.string() }).optional();
const iframeSchema = zod.object({ src: zod.string() }).optional();

const i18n = defineCollection({ type: 'data', schema: i18nSchema() });
const docs = defineCollection({
  type: 'content',
  schema: docsSchema({
    extend: zod.object({
      description: text(),
      iframe: iframeSchema,
      hero: heroSchema,
      prerequisites: zod
        .object({
          html: prerequisiteSchema,
          css: prerequisiteSchema,
          js: prerequisiteSchema,
          github: prerequisiteSchema,
          sharepoint: prerequisiteSchema,
          googledrive: prerequisiteSchema,
          node: prerequisiteSchema,
          sidekick: prerequisiteSchema,
          commerce: prerequisiteSchema,
          graphql: prerequisiteSchema,
        })
        .optional(),
    }),
  }),
});

export const collections = { docs, i18n };
