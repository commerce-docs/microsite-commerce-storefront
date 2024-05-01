import { z as zod } from 'astro/zod';
import { defineCollection } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

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

const heroSchema = zod
  .object({
    subtitle: zod.string(),
    actions: zod
      .object({
        variant: zod
          .enum(['primary', 'secondary', 'minimal', 'discord'])
          .default('primary')
          .optional(),
      })
      .array()
      .optional(),
  })
  .optional();

const iframeSchema = zod.boolean().default(false).optional();

const i18n = defineCollection({ type: 'data', schema: i18nSchema() });
const docs = defineCollection({
  type: 'content',
  schema: docsSchema({
    extend: zod.object({
      iframe: iframeSchema,
      hero: heroSchema,
      prerequisites: prerequisiteSchema.optional(),
      time: zod.string().optional(),
    }),
  }),
});

export const collections = { docs, i18n };
