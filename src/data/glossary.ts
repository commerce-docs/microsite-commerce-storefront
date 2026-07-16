export interface GlossaryEntry {
  term: string;
  definition: string;
  aliases?: string[];
}

const glossaryEntries: GlossaryEntry[] = [
  {
    term: 'Boilerplate template',
    definition: 'Pre-configured storefront with the components and services you need to get started.',
    aliases: ['Commerce boilerplate', 'boilerplate'],
  },
  {
    term: 'Edge Delivery Services',
    definition:
      "Adobe's hosting and delivery infrastructure that turns authored documents into fast HTML pages served from servers close to the shopper. You push code to GitHub; Edge Delivery Services builds and publishes automatically.",
    aliases: ['EDS'],
  },
  {
    term: 'Document Authoring',
    definition:
      'The tooling for creating storefront pages as documents in Google Docs, SharePoint, or DA.live without writing code. Tables in documents define the blocks that appear on each page.',
    aliases: ['DA.live', 'Document Author'],
  },
  {
    term: 'GraphQL',
    definition:
      'A query language that drop-in components use to request and update data from Adobe Commerce APIs. Catalog Service, Live Search, and the core Commerce API all expose GraphQL endpoints.',
  },
  {
    term: 'npm',
    definition:
      "Node's package manager. You use it to install drop-in packages — for example, `npm install @dropins/storefront-cart` — in your storefront repository.",
  },
  {
    term: 'event bus',
    definition:
      'A shared in-memory channel that lets drop-in components on the same page publish and subscribe to events without depending directly on each other.',
    aliases: ['Event Bus'],
  },
  {
    term: 'Luma',
    definition:
      "Adobe Commerce's classic server-side storefront theme, built with PHP. If you run a Luma storefront today, Luma Bridge can help share cart and sign-in sessions with EDS drop-ins while you migrate.",
  },
  {
    term: 'Luma Bridge',
    definition:
      'A PHP module on your Commerce instance that reads session cookies from EDS drop-ins, letting Luma pages share the same shopper cart and sign-in session during a phased migration to Edge Delivery Services.',
  },
  {
    term: 'Catalog Service',
    definition:
      "Adobe's fast, read-only GraphQL API for product data. Drop-ins call it instead of core Commerce GraphQL for product pages, search results, and category listings — up to ten times faster.",
  },
  {
    term: 'Live Search',
    definition:
      "Adobe's AI-powered search service. It returns results instantly as shoppers type and adjusts rankings and facets based on browsing and click signals in the current session.",
  },
  {
    term: 'Data Connection',
    definition:
      'An optional Commerce extension that sends storefront and order event data to Adobe Experience Platform for use in personalization, segmentation, and cross-channel campaigns.',
  },
  {
    term: 'Storefront Compatibility package',
    definition:
      'A PHP package you install on Commerce PaaS that extends the GraphQL schema so cart, checkout, account, and order drop-ins can communicate with your backend as expected.',
    aliases: ['Compatibility package', 'Storefront Compatibility Package'],
  },
  {
    term: 'Code Sync app',
    definition:
      "Syncs your repository with the Edge Delivery code bus and purges CDN caches when you push. Installing it on a repository also configures your site's content pointer in helix configuration.",
    aliases: ['AEM Code Sync app', 'Code Sync'],
  },
  {
    term: 'Content folder',
    definition:
      'Folder for storefront content such as images, text, and assets. Edge Delivery Services uses it for document-based authoring, previewing, and publishing.',
  },
  {
    term: 'Sidekick',
    definition:
      'Browser extension that helps creators edit, preview, and publish content from a content folder, and helps developers open source documents from published pages.',
  },
  {
    term: 'Site Creator',
    definition:
      'App in Document Author (DA.live) that creates and initializes a storefront by setting up content, optional code, theme choice, and storefront configuration values.',
    aliases: ['Site Creator tool'],
  },
  {
    term: 'Drop-in components',
    definition:
      'NPM packages that provide core Commerce storefront features such as cart, checkout, product details, and account flows.',
    aliases: ['Commerce drop-in components', 'drop-ins', 'drop-in'],
  },
  {
    term: 'Commerce blocks',
    definition:
      'JavaScript blocks that integrate drop-in components into Edge Delivery Services pages to power storefront commerce experiences.',
  },
  {
    term: 'Content blocks',
    definition:
      'Edge Delivery Services blocks used for non-commerce page content and layout, such as cards, columns, headers, and footers.',
  },
  {
    term: 'Integration layer',
    definition:
      'Storefront-level files that connect drop-ins to your site, including block implementations and initialization scripts.',
    aliases: ['Boilerplate Integration Layer', 'Commerce Integration Layer'],
  },
  {
    term: 'Upstream',
    definition:
      'The original source repository your project forks from, used as the canonical source when reviewing and pulling updates.',
    aliases: ['upstream boilerplate'],
  },
  {
    term: 'Selective updates',
    definition:
      'A workflow where you review upstream changes and merge only the files or commits that are relevant to your project.',
  },
  {
    term: 'Breaking changes',
    definition:
      'Updates that require code or configuration changes in your project before everything works correctly again.',
  },
  {
    term: 'Post-install scripts',
    definition:
      'Scripts that run automatically after package installation to copy and prepare required Commerce integration files.',
    aliases: ['post-install script'],
  },
  {
    term: 'Initializer',
    definition:
      'A JavaScript module that configures a drop-in when imported, such as setting endpoints, registering dictionaries, and preparing runtime behavior.',
  },
  {
    term: 'Container',
    definition:
      'A pre-built UI module that renders drop-in functionality and manages logic, state, and data for a feature.',
  },
  {
    term: 'Provider',
    definition:
      'The render function exported by a drop-in package that mounts containers into a storefront block.',
  },
  {
    term: 'Decorate function',
    definition:
      'The JavaScript module that runs for a block after the page loads. It imports the initializer, then calls provider.render() to mount the drop-in UI into the block region of the page.',
    aliases: ['block decorator', 'block decorators', 'decorate'],
  },
  {
    term: 'Slot',
    definition:
      'An extension point inside a drop-in where custom UI or behavior can be added, replaced, or removed.',
    aliases: ['Slots'],
  },
  {
    term: 'Component',
    definition:
      'A reusable UI building block. In storefront docs, this can refer to drop-in components, containers, or slot-level pieces depending on context.',
  },
  {
    term: 'Placeholder files',
    definition:
      'JSON files that store storefront UI labels by drop-in and locale so merchants can change text without changing code.',
    aliases: ['Placeholders file', 'placeholders files'],
  },
  {
    term: 'Language objects',
    definition:
      'Objects such as `langDefinitions` that map translation keys to localized UI text values.',
  },
  {
    term: 'Labeling',
    definition:
      'Customizing UI text labels for tone, branding, or clarity while staying in the same language.',
    aliases: ['Labeling (Customizing Text)', 'UI label changes'],
  },
  {
    term: 'Localizing',
    definition:
      'Adapting UI text and formatting for specific languages and regions, including translated labels and locale-specific conventions.',
    aliases: ['Localizing (Translating for Different Languages)'],
  },
  {
    term: 'Enrichment',
    definition:
      'Additional contextual content shown around commerce experiences to improve a shopper’s page experience.',
  },
  {
    term: 'Enrichment blocks',
    definition:
      'Blocks that inject enrichment content above or below commerce blocks based on product or category conditions.',
  },
  {
    term: 'Content positioning',
    definition:
      'The placement order of content blocks and commerce blocks on a page, including above/below relationships.',
  },
  {
    term: 'A/B experiment',
    definition:
      'A controlled test that compares two or more page versions to measure which performs better.',
  },
  {
    term: 'Variant',
    definition:
      'An alternative page or experience used in an experiment to compare against a control version.',
  },
  {
    term: 'Control',
    definition:
      'The original baseline experience in an experiment used for comparison.',
  },
  {
    term: 'Challenger',
    definition:
      'The competing variant in an experiment that is measured against the control.',
  },
  {
    term: 'Experimentation Plugin',
    definition:
      'The optional AEM experimentation integration used to run A/B experiments, route audiences, and track outcomes.',
  },
  {
    term: 'Storefront configuration',
    definition:
      'The JSON configuration object used by storefront code to resolve endpoints, headers, analytics, and plugin behavior.',
  },
  {
    term: 'Default values',
    definition:
      'Starter values in a sample configuration that must be replaced with environment-specific values for your project.',
    aliases: ['default values'],
  },
  {
    term: 'getConfigValue function',
    definition:
      'Helper function that reads a configuration value by dot-notation path from storefront config data.',
  },
  {
    term: 'getHeaders function',
    definition:
      'Helper function that returns a header map for a given storefront scope based on configured header entries.',
  },
  {
    term: 'Extend',
    definition:
      'Customize existing drop-ins through supported extension points such as slots, events, styling, transformers, and configuration.',
  },
  {
    term: 'Substitute',
    definition:
      'Replace an Adobe drop-in with a third-party implementation and own compatibility and maintenance responsibility.',
  },
  {
    term: 'Create',
    definition:
      'Build a new drop-in from scratch when extension and substitution are not suitable for the required experience.',
  },
  {
    term: 'Configuration',
    definition:
      'Settings used to change behavior without rewriting core implementation logic.',
  },
  {
    term: 'Styling',
    definition:
      'Visual customization of drop-ins through CSS overrides, token changes, and layout adjustments.',
    aliases: ['style'],
  },
  {
    term: 'Events',
    definition:
      'Data or lifecycle signals emitted by drop-ins that custom code can listen to in order to run additional behavior.',
  },
  {
    term: 'Transformers',
    definition:
      'Functions that modify or shape data before a drop-in displays it.',
  },
  {
    term: 'SDK',
    definition:
      'The Drop-in SDK used to build custom drop-ins and related integration logic.',
    aliases: ['SDK (Drop-in SDK)', 'Drop-in SDK'],
  },
  {
    term: 'Third-party solution',
    definition:
      'An external service or component used in place of a native Adobe drop-in implementation.',
  },
  {
    term: 'Design tokens',
    definition:
      'CSS custom properties that define reusable design values such as color, type scale, spacing, shape, and layout.',
    aliases: ['design tokens'],
  },
  {
    term: 'Library components',
    definition:
      'Foundational UI pieces such as buttons and inputs that are composed into larger drop-in experiences.',
    aliases: ['library components'],
  },
  {
    term: 'Adobe Commerce design system',
    definition:
      'The set of design tokens, base components, and conventions used to style Commerce storefront drop-ins.',
  },
  {
    term: 'Brand',
    definition:
      'Your storefront’s visual identity, including colors, typography, spacing, and shape choices.',
    aliases: ['brand'],
  },
  {
    term: 'Targeted Block',
    definition:
      'A block configuration that conditionally shows content for selected customer groups, segments, or cart rule contexts.',
  },
  {
    term: 'Group',
    definition:
      'A Commerce customer group used to segment shoppers for pricing, permissions, or targeted content.',
  },
  {
    term: 'Segment',
    definition:
      'A rule-based customer segment used to target experiences to qualifying shopper cohorts.',
  },
  {
    term: 'Cart Rule',
    definition:
      'A Commerce cart price rule that can be used as a condition for targeting content or promotions.',
  },
  {
    term: 'Fragment path',
    definition:
      'An optional `TargetedBlock` setting that points to a separate content document. When set, the block loads content from that document; when omitted, the content is authored in the last merged full-width row of the `targeted-block` table.',
    aliases: ['Fragment', 'fragment'],
  },
  {
    term: 'Type of block',
    definition:
      'A grouping key for `TargetedBlock` entries. When multiple blocks share this value, only the first matching block of that type renders, which enables fallback-chain behavior.',
    aliases: ['Type', 'type'],
  },
  {
    term: 'progressive enhancement',
    definition:
      'An approach where a page starts as complete, readable HTML and JavaScript upgrades it to an interactive experience when it runs. Shoppers with JavaScript get live prices, stock, and add-to-cart. Crawlers and shoppers without JavaScript still see all the product information from the prerendered HTML.',
  },
  {
    term: 'App Builder',
    definition:
      "Adobe's serverless platform for building and deploying cloud-native apps. The AEM Commerce Prerender app runs on App Builder — it polls your catalog on a schedule, generates product page HTML, and publishes it to Edge Delivery Services.",
    aliases: ['Adobe App Builder'],
  },
  {
    term: 'blob store',
    definition:
      'A file storage area that Adobe App Builder provides so serverless actions can save and retrieve files between runs. The prerender app saves generated HTML files here so Edge Delivery Services can serve them at product page URLs.',
    aliases: ['blob storage', 'App Builder blob store'],
  },
  {
    term: 'overlay',
    definition:
      'A complete HTML file that Edge Delivery Services serves at a specific page URL before any JavaScript runs. The prerender app generates one HTML file per product and registers it with Edge Delivery Services, so crawlers and shoppers receive full page content instantly.',
    aliases: ['overlay content', 'overlay link'],
  },
  {
    term: 'Block table',
    definition:
      'A table in a document that begins with a block name row, followed by configuration rows. Edge Delivery uses the name row to map the table to a storefront block implementation.',
    aliases: ['block table'],
  },
  {
    term: 'Block name row',
    definition:
      "The first row in a block table. It usually contains a single `kebab-case` block identifier (for example, `commerce-cart` or `targeted-block`) that tells the system which block to render.",
  },
  {
    term: 'Key-value row',
    definition:
      "A two-column table row in a block table. The first cell is a setting name (a key) and the second cell is the value, such as `true`, `10`, or a text label.",
    aliases: ['key-value rows'],
  },
  {
    term: 'BYOM',
    definition:
      "Bring Your Own Markup. Edge Delivery Services protocol for supplying page HTML from an external source instead of a document.",
    aliases: ['Bring Your Own Markup'],
  },
  {
    term: 'overlay content',
    definition:
      'A secondary BYOM content source layered over the primary one; EDS serves overlay HTML for a URL when available, falling back to the primary source otherwise.',
    aliases: ['overlay', 'BYOM overlay'],
  },
  {
    term: 'Merged full-width row',
    definition:
      "A table row where one cell spans the full table width, so you can add rich page content in one large cell. Some blocks (like `targeted-block`) use this for inline content or layout when a separate fragment document is not used.",
    aliases: [
      'Merged full width row',
      'full-width row',
      'full width row',
      'merged full-width',
      'merged row',
    ],
  },
];

function normalizeTerm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const glossaryIndex = new Map<string, GlossaryEntry>();

for (const entry of glossaryEntries) {
  glossaryIndex.set(normalizeTerm(entry.term), entry);
  for (const alias of entry.aliases ?? []) {
    glossaryIndex.set(normalizeTerm(alias), entry);
  }
}

export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  return glossaryIndex.get(normalizeTerm(term));
}
