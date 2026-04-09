# Adobe Commerce Storefront documentation

Welcome to the storefront documentation site! This site is built with [Astro](https://astro.build) (a web framework for content sites) and [Starlight](https://starlight.astro.build) (a documentation theme for Astro). This readme helps you install tools, run the site on your computer, add doc pages, and open pull requests. Reading and following the setup section takes about **10 minutes**. When you finish **Set up your local environment**, you'll have the docs running in your browser at [http://localhost:4321/](http://localhost:4321/).

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

You'll use **Node.js** (the JavaScript runtime) and **pnpm** (a package manager for Node projects). Install these before you clone the repo:

- `Node.js 20.13.1` or later.
- `pnpm 9.x` or later. See the [pnpm installation instructions](https://pnpm.io/installation).

## Set up your local environment

The following steps copy the project to your machine and start the local preview.

1. Clone the repository:

   ```bash
   git clone git@github.com:commerce-docs/microsite-commerce-storefront.git
   cd microsite-commerce-storefront
   ```

1. Install dependencies:

   ```bash
   pnpm install
   ```

1. Start the local docs site:

   ```bash
   pnpm dev
   ```

   You should see the dev server start. Your browser should open [http://localhost:4321/](http://localhost:4321/). When you save a file, the page reloads.

## Development commands

- `pnpm dev` — Start the local dev server and open a browser. The site reloads when you save.
- `pnpm build`, `pnpm build:prod`, and `pnpm build:prod-fast` — Run the Astro build. `build:prod-fast` skips compression for a faster production check (useful before you open a pull request).
- `pnpm build:stage` — Build for a staging environment. Set the site URL in an environment variable named `STAGE_URL`. For example: `STAGE_URL=https://my-stage.example.com pnpm build:stage`.
- `pnpm clean` — Reinstall dependencies (removes `node_modules`, `dist`, `.astro`).
- `pnpm scrub` — Same as `pnpm clean`, but also deletes `pnpm-lock.yaml`. Use only if you intend to regenerate the lockfile.

## Content structure

Documentation source files live in `src/content/docs/`.

- Use `dropins/` for **business-to-consumer (B2C)** topics (cart, checkout, wishlist).
- Use `dropins-b2b/` for **business-to-business (B2B)** topics (requisition list, quote management).

The folder layout controls the left sidebar navigation for most pages.

## How to add a page

Doc pages are **MDX** files (Markdown plus optional components). Put each page in `src/content/docs/<section>/`. Examples: `dropins/cart`, `dropins-b2b/requisition-list`.

Add **frontmatter** at the top of the file: `title`, `description`, and a `sidebar` entry so the page appears in the nav. Use `sidebar.label` and `sidebar.order` to control the label and order in the sidebar.

Add this to your new `.mdx` file (adjust the values):

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

- **Shared images:** Put files in `public/images/` (you can use subfolders like `dropins/cart/`). Reference them with `![Alt text](@images/path/to/image.png)`.
- **Colocated images:** Put an `images/` folder next to your docs (for example `src/content/docs/how-tos/images/`). Reference with `![Alt text](images/filename.png)` from pages in that section.
- For an image with a caption inside a diagram, use the Diagram component in [How to add a diagram](#how-to-add-a-diagram).

## How to add a diagram

Add this pattern to your `.mdx` file: import the Diagram component, then wrap an image or Mermaid chart.

```mdx
import Diagram from '@components/Diagram.astro';

<Diagram caption="Optional caption for the image.">![Alt text](@images/path/to/image.png)</Diagram>

<Diagram type="mermaid" code={`graph LR; A --> B`} />
```

Use `caption` for still images. Use `type="mermaid"` and `code` for flowcharts and sequence diagrams.

Example pages:

- Images: `src/content/docs/dropins/all/slots.mdx`
- Mermaid: `src/content/docs/setup/configuration/aem-prerender.mdx`

## How to link between docs

**Internal links** (to another page in this docs site) use normal Markdown with a path that starts with `/`. Example: `[SEO metadata](/setup/seo/metadata/)`.

**External links** (to any other site) use the Link component so they open in a new tab with the right styling. Add this to your `.mdx` file:

```mdx
import Link from '@components/Link.astro';

See the <Link href="https://example.com/docs" text="external documentation" /> for details.
```

## How to add a PR

A **pull request (PR)** is how you propose changes for review. The team publishes from the `release` branch.

If you don't have write access to the repo, [fork the repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) first. Clone your fork, push to your fork, then open a PR from your fork to `release`.

1. Create a new branch from `release`:

   ```bash
   git checkout release
   git pull origin release
   git checkout -b your-branch-name
   ```

1. Edit or add `.mdx` files under `src/content/docs/`.

1. Check that the site builds:

   ```bash
   pnpm build:prod-fast
   ```

   If the command finishes without errors, your changes are ready to share.

1. Commit your changes on your branch.

1. Push your branch to GitHub.

1. Open a pull request against the `release` branch. That branch is what the site uses for publishing.

1. After your PR merges into `release`, the nightly build publishes updates to the [Commerce Storefront](https://experienceleague.adobe.com/developer/commerce/storefront/) site.

## How to prepare for a new release

Use this when you are starting a coordinated release branch for the team.

1. Create a new branch from `release`.

1. Name the branch for the release (for example, `april-release`).

1. Push that branch to GitHub so other contributors can use it.

## How to add release notes

You'll add a new release section to the docs and matching changelog entries. The steps below get you started; the [release-notes skill](.cursor/skills/release-notes/SKILL.md) covers the full workflow (boilerplate drill-down, benefit-first copy, and how Jira text is checked against pull request diffs).

The skill reads **GitHub** (the code hosting service) using the [GitHub CLI](https://cli.github.com/) tool, called `gh` in the terminal. Install `gh` if you don't have it. Run `gh auth login` once on your machine so Cursor can reach private repositories when it generates notes.

1. Create a local branch for release notes (for example `april-release-notes`).

1. **Jira (optional):** GitHub pull requests sometimes link **Jira** tickets (Adobe's issue tracker). The skill can pull ticket text to improve release wording. To use that feature, you need network access to Adobe corporate Jira and a token stored on your Mac. If you skip this block, you can still write release notes from GitHub only.

   - Stay on the **Adobe corporate VPN**.
   - Confirm your Jira account can **read** the projects those tickets belong to.
   - Create a **Personal Access Token** on your Jira profile.
   - Store the token in **macOS Keychain** using the command in the [release-notes skill README](.cursor/skills/release-notes/README.md). The skill reads the token from Keychain. Tokens expire; renew the token and update Keychain when needed.

1. In Cursor, ask the agent to draft the release. Include the month and the **merge PR** links for the B2C and B2B boilerplate suites. Example:

   > Add the [Month] 2026 release. Use the release merge PRs to generate the release notes and all the code changes:
   > B2C: https://github.com/hlxsites/aem-boilerplate-commerce/pull/1152
   > B2B: https://github.com/hlxsites/aem-boilerplate-commerce/pull/1156

1. Commit the updated docs on your release-notes branch.

1. Push your release-notes branch to GitHub.

1. Open a pull request for the release notes. Set the base branch to your release integration branch (for example `april-release`).
