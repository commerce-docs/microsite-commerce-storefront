# Adobe Commerce Storefront documentation

Welcome to the storefront documentation site! This site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). To contribute documentation, follow the instructions below to install the prerequisites, configure your local environment, create new pages, and submit PRs.

- [Prerequisites](#prerequisites)
- [Set up your local environment](#set-up-your-local-environment)
- [Development commands](#development-commands)
- [Content structure](#content-structure)
- [How to add a page](#how-to-add-a-page)
- [How to add images](#how-to-add-images)
- [How to add a diagram](#how-to-add-a-diagram)
- [How to link between docs](#how-to-link-between-docs)
- [How to add a PR](#how-to-add-a-pr)
- [How to add release notes](#how-to-add-release-notes)

## Prerequisites

Install Node.js and pnpm:

- `Node.js 20.13.1` or later.
- `pnpm 9.x` or later. See the [pnpm installation instructions](https://pnpm.io/installation).

## Set up your local environment

1. Clone the repository and install dependencies:

   ```bash
   git clone git@github.com:commerce-docs/microsite-commerce-storefront.git
   cd microsite-commerce-storefront
   pnpm install
   ```

2. Run the docs site locally:

   ```bash
   pnpm dev
   ```

   This starts the development server, builds the site, and opens a browser at [http://localhost:4321/](http://localhost:4321/). The site auto-reloads when you save changes.

## Development commands

- `pnpm dev` — Start the local dev server and open a browser. The site auto-reloads when you save.
- `pnpm build`, `pnpm build:prod`, and `pnpm build:prod-fast` — Run the Astro build. `build:prod-fast` skips compression for a faster production check (handy before opening a PR).
- `pnpm clean` — Reinstall dependencies (removes `node_modules`, `dist`, `.astro`).
- `pnpm scrub` — Nuclear option: same as clean but also removes `pnpm-lock.yaml`.

## Content structure

Docs live in `src/content/docs/`. Use `dropins/` for B2C (cart, checkout, wishlist), `dropins-b2b/` for B2B (requisition list, quote management). Folder structure maps to the sidebar, mostly.

## How to add a page

- Docs pages are `.mdx` files in `src/content/docs/<section>/` (e.g. `dropins/cart`, `dropins-b2b/requisition-list`).
- Add frontmatter: `title`, `description`, and a `sidebar` entry so the page appears in the nav.
- Use `sidebar.label` and `sidebar.order` to control placement within the navigation sidebar on the left of a page.

```mdx
---
title: Page Title
description: Brief description for SEO and social sharing.
sidebar:
  label: Sidebar Label
  order: 4
---

import Aside from '@components/Aside.astro';

Your content here. Use components like:

<Aside type="tip" title="Pro Tip">
  Helpful information for the reader.
</Aside>
```

## How to add images

- **Shared images:** Put files in `public/images/` (optionally in subfolders like `dropins/cart/`). Reference with `![Alt text](@images/path/to/image.png)`.
- **Colocated images:** Put an `images/` folder next to your docs (e.g. `src/content/docs/how-tos/images/`). Reference with `![Alt text](images/filename.png)` from pages in that section.
- For images inside a diagram with a caption, wrap in the Diagram component, below.

## How to add a diagram

Import the Diagram component and wrap images or Mermaid code:

```mdx
import Diagram from '@components/Diagram.astro';

<Diagram caption="Optional caption for the image.">![Alt text](@images/path/to/image.png)</Diagram>

<Diagram type="mermaid" code={`graph LR; A --> B`} />
```

Use `caption` for images; use `type="mermaid"` and `code` for flowcharts and sequence diagrams. Example pages of each:

- Images `src/content/docs/dropins/all/slots.mdx`
- Mermaid `src/content/docs/setup/configuration/aem-prerender.mdx`

## How to link between docs

Links outside the storefront site must use the Link component. Internal links use standard markdown.

- **Internal links** (within the storefront docs): Use standard markdown with a path starting with `/`. For example, `[SEO metadata](/setup/seo/metadata/)`.
- **External links** (outside the storefront site): Use the Link component so they open in a new tab with proper styling:

```mdx
import Link from '@components/Link.astro';

See the <Link href="https://example.com/docs" text="external documentation" /> for details.
```

## How to add a PR

If you don't have write access to the repo, [fork the repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) first. Clone your fork instead of the repo, push to your fork, then open a PR from your fork to `release`.

1. Create a new branch for your changes, based on `release`:

   ```bash
   git checkout release
   git pull origin release
   git checkout -b your-branch-name
   ```

2. Make your changes to the docs (edit or add `.mdx` files in `src/content/docs/`).

3. Run `pnpm build:prod-fast` to verify your changes build, then commit, push, and open a PR against `release`. The `release` branch is the main branch used for publishing the site.

4. After your PR is merged into `release`, content is published to the [Commerce Storefront](https://experienceleague.adobe.com/developer/commerce/storefront/) site by the nightly build.

## How to add release notes

1. Run `gh auth login` (required for Cursor to access private repos).
2. In Cursor, prompt the agent with the release month and PR merge links. Example:

   > Add the [Month] 2026 release. Use the release merge PRs to generate the release notes and all the code changes:
   > B2C: https://github.com/hlxsites/aem-boilerplate-commerce/pull/1152
   > B2B: https://github.com/hlxsites/aem-boilerplate-commerce/pull/1156

See the [release-notes skill](.cursor/skills/release-notes/SKILL.md) for full details.
