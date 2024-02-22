import { defineCollection, z as zod } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { text } from 'darkmatter';

const prerequisiteSchema = zod
  .object({
    html: zod.boolean().default(false).optional(),
    css: zod.boolean().default(false).optional(),
    js: zod.boolean().default(false).optional(),
    github: zod.boolean().default(false).optional(),
    sharepoint: zod.boolean().default(false).optional(),
    googledrive: zod.boolean().default(false).optional(),
    node: zod.boolean().default(false).optional(),
    sidekick: zod.boolean().default(false).optional(),
    codesync: zod.boolean().default(false).optional(),
    commerce: zod.boolean().default(false).optional(),
    graphql: zod.boolean().default(false).optional(),
  })
  .optional();

const heroSchema = zod.object({ subtitle: zod.string() }).optional();
const iframeSchema = zod.boolean().default(false).optional();

const i18n = defineCollection({ type: 'data', schema: i18nSchema() });
const docs = defineCollection({
  type: 'content',
  schema: docsSchema({
    extend: zod.object({
      description: text(),
      iframe: iframeSchema,
      hero: heroSchema,
      prerequisites: prerequisiteSchema.optional(),
    }),
  }),
});

export const collections = { docs, i18n };
