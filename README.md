# Adobe Commerce Storefront documentation

Welcome to the storefront documentation site! To contribute documentation to this site follow the instructions below to install the prerequisites, configure your local environment, create new pages, submit PRs.

## Release notes

To generate release notes and changelog for a new release (e.g. March 2026), the AI uses the [release-notes skill](.cursor/skills/release-notes/SKILL.md). The skill uses the **previous** release as a structural template only, analyzes **code changes** (Files changed) between release versions for boilerplate, drop-ins, SDK, and tools, and updates both `index.mdx` and `changelog.mdx`.

### How to run it

1. **Authenticate** (required for private repos): run `gh auth login` in your terminal.
2. **In Cursor**, ask the AI to add the new release. For example:
   - *"Add the March 2026 release. Use B2C PR https://github.com/hlxsites/aem-boilerplate-commerce/pull/XXXX and B2B PR https://github.com/hlxsites/aem-boilerplate-commerce/pull/YYYY."*
3. **Optionally** supply a **code comparison URL** so the AI knows exactly which changes to analyze (especially for boilerplate). For example:
   - *"Use this comparison for the boilerplate: https://github.com/hlxsites/aem-boilerplate-commerce/compare/january-2026...b2c-february-2026"*
   If you don't supply comparison URLs, the AI will derive version ranges from the previous release and the PRs' package.json; if it can't find a comparison for a repo, it will ask you to supply the URL or refs.
4. The AI runs the skill, analyzes code changes, and adds a new suite section and changelog entries in `src/content/docs/releases/`.

**Optional:** To update only one file, say so (e.g. *"Update only the changelog for March 2026"* or *"Update only the release index for March 2026"*). The same analysis runs but only the requested file is written.

**Example PRs** (February 2026):

- B2C: https://github.com/hlxsites/aem-boilerplate-commerce/pull/1096  
- B2B: https://github.com/hlxsites/aem-boilerplate-commerce/pull/1107

### Manual updates required

These sections are **not** filled from code and must be updated manually before publishing:

| Section | Where it appears | What to do |
|---------|------------------|------------|
| **Known issues** | Each suite’s `### Known issues` | Add bullets from release notes or your team, or use: “There are no known issues for this release suite.” |
| **Adobe Commerce version(s)** | Component compatibility → first table, left column (e.g. `2.4.7`, `2.4.8`) | Confirm supported versions from release/product spec or team; add one row per version. |
| **Adobe Commerce B2B version** | Component compatibility → second table, left column (e.g. `1.5.2`) | Confirm supported B2B version from release/product spec or team; add the single row. |

See the [release-notes skill](.cursor/skills/release-notes/SKILL.md) for full details (including “Sections that cannot be confirmed from code”).

## Custom components

This documentation site includes a collection of custom Astro components that enhance content presentation and interactivity. Below is a complete list of available components with links to examples of their usage:

- **[Aside](/src/content/docs/dropins/all/labeling.mdx)** - Callout boxes for tips, warnings, notes, and other highlighted content
- **[Callouts](/src/content/docs/dropins/all/extend-or-create.mdx)** - Visual callout elements for emphasizing important information
- **[Card](/src/content/docs/dropins/all/branding.mdx)** - Content card component for displaying information in a contained format
- **[CardGrid](/src/content/docs/dropins/all/branding.mdx)** - Grid layout for displaying multiple cards
- **[Checklist](/src/content/docs/setup/launch/index.mdx)** - Interactive checklist component for tracking tasks
- **[CodeExample](/src/content/docs/dropins/all/branding.mdx)** - Code snippet display with syntax highlighting
- **[CodeImport](/src/content/docs/dropins/all/_eventbus.mdx)** - Imports code from external files
- **[CodeInclude](/src/content/docs/dropins/all/labeling.mdx)** - Includes code snippets from repositories
- **[Diagram](/src/content/docs/dropins/all/branding.mdx)** - Visual diagrams and flowcharts
- **[Embed](/src/content/docs/get-started/create-storefront.mdx)** - Embeds external content like videos
- **[ExternalLink](/src/content/docs/dropins/all/creating.mdx)** - External link component with custom styling
- **[FileTree](/src/content/docs/dropins/all/branding.mdx)** - Displays file and folder structures
- **[Flex](/src/content/docs/sdk/components/overview.mdx)** - Flexbox layout container
- **[FullWidthContainer](/src/content/docs/playgrounds/commerce-optimizer.mdx)** - Full-width content container
- **[GraphiQLEditor](/src/content/docs/playgrounds/commerce-optimizer.mdx)** - Interactive GraphQL query editor
- **[IFrame](/src/content/docs/sdk/components/accordion.mdx)** - Embeds external content in an iframe
- **[Link](/src/content/docs/get-started/browser-compatibility.mdx)** - Internal link component
- **[LinkCard](/src/content/docs/dropins/all/introduction.mdx)** - Card component with link functionality
- **[List](/src/content/docs/dropins/product-details/index.mdx)** - Styled list component
- **[Option](/src/content/docs/dropins/all/extend-or-create.mdx)** - Individual option element for Options component
- **[Options](/src/content/docs/dropins/all/extend-or-create.mdx)** - Options selector component
- **[OptionsTable](/src/content/docs/dropins/all/labeling.mdx)** - Table displaying configuration options
- **[Panel](/src/content/docs/sdk/components/overview.mdx)** - Content panel with optional header and styling
- **[PDFViewer](/src/content/docs/merchants/storefront-builder/create-content.mdx)** - Embeds PDF documents
- **[Prerequisites](/src/content/docs/dropins/all/branding.mdx)** - Lists prerequisites for a feature or tutorial
- **[Screenshot](/src/content/docs/dropins/user-auth/recaptcha.mdx)** - Displays screenshots with captions
- **[Summary](/src/content/docs/dropins/all/branding.mdx)** - Summary or overview section
- **[TableWrapper](/src/content/docs/dropins/all/events.mdx)** - Wrapper for responsive table displays
- **[Task](/src/content/docs/dropins/wishlist/quick-start.mdx)** - Individual task item for Tasks component
- **[Tasks](/src/content/docs/dropins/wishlist/quick-start.mdx)** - Task list component
- **[Vocabulary](/src/content/docs/dropins/cart/quick-start.mdx)** - Defines and explains technical terms

### Using custom components

To use a custom component in your documentation page:

1. Import the component in your MDX file after the frontmatter:

   ```mdx
   ---
   title: Your Page Title
   description: Your page description
   ---

   import Aside from '@components/Aside.astro';
   import Diagram from '@components/Diagram.astro';
   ```

2. Use the component in your content:

   ```mdx
   <Aside type="tip" title="Pro Tip">
   This is helpful information for the reader.
   </Aside>
   ```

## Prerequisites

Install node and pnpm:

- `Node.js 20.13.1` or later.
- `Pnpm 9.x` or later. See the [pnpm installation instructions](https://pnpm.io/installation).

## Set up your local environment

1. Clone the GitHub repository:

   ```bash
   git clone git@github.com:commerce-docs/microsite-commerce-storefront.git
   ```

1. Navigate to the root of your local repository:

   ```bash
   cd microsite-commerce-storefront
   ```

1. Install the dependencies using `pnpm`:

   ```bash
   pnpm install
   ```

1. Run the docs site

   ```bash
   pnpm dev
   ```

   The site should open a broswer window at [http://localhost:4321/](http://localhost:4321/).

## Available scripts

The available scripts for running the project are defined in the `package.json` file:

- `build:prod`: Builds the production site with the `/developer/commerce/storefront` base path.
- `preview:prod`: Previews the production site.
- `build`: Builds a static, optimized development site **without** the production base path.
- `preview`: Previews the static development site.

- `dev`: Starts the development server and auto-opens the site in the browser.
- `lint`: Runs prettier formatting on all the project files.
- `clean`: Removes the dist, .astro, and node_modules directories and reinstalls the dependencies.
- `scrub`: Does the same as clean but also removes the pnpm-lock.yaml file and the ~./.pnpm-store directory.

## Development commands

- `pnpm dev` to start the local dev server and preview your changes during development. Site auto-reloads when you save changes.
- `pnpm lint` to batch format all your files with the `prettier` module.
- `pnpm clean` to resolve dependency issues by deleting the `node_modules` and `dist` directories, then reinstalling dependencies.
- `pnpm scrub` to remove everything and reinstall dependencies. The nuclear option.

## How to contribute PRs

1. Clone the repository.
1. Create a new branch for your changes.
1. Make your changes.
1. Push your changes to your branch.
1. Create a pull request to the `develop` branch of the `commerce-docs/microsite-commerce-storefront` repository.
1. Wait for the PR to be reviewed and merged.

### Publishing to production

Content updates from merged PRs are published to the [Commerce Storefront](https://experienceleague.adobe.com/developer/commerce/storefront/) production site automatically by the nightly build job that runs daily between 19:00 and 20:00 CDT.

## How to create a new docs page

1. Create a new `.mdx` file in the `src/content/docs/<docs-directory>`.
1. Add the frontmatter to the top of the file. The frontmatter should include the title of the page and the description. The `title` will render as an `<h1>` on the page. The `description` will be used for SEO and social sharing. For example:

   ```mdx
   ---
   title: Slots
   description: Learn about slots and how to use them to customize drop-in components.
   sidebar:
     label: Awesome Slots!   // Overrides the title in the sidebar
     order: 4                // Use order for auto-generated sidebar links. See src/content/docs/customize files for example.
   ---
   ```

1. Write the content of the page using the markdow/MDX syntax.

1. Add imports for any Astro components you want to use below the frontmatter fence. For example:

   ```mdx
   ---
   title: Slots
   description: Learn about slots and how to use them to customize drop-in components.
   sidebar:
   label: Slots
   order: 4
   ---

   import Diagram from '@components/Diagram.astro';
   import Vocabulary from '@components/Vocabulary.astro';
   import Aside from '@components/Aside.astro';
   import Callouts from '@components/Callouts.astro';
   ```

## How to create and use content fragments

Content fragments allow you to write reusable content once and include it across multiple pages. This is perfect for maintaining consistency and reducing duplication.

### Step 1: Create a content fragment

1. Create a new `.mdx` file in the `src/content/fragments/` directory
2. Add any imports you need (like Starlight components)
3. Write your reusable content using standard MDX/Markdown syntax

**Example fragment file** (`src/content/fragments/my-note.mdx`):

```mdx
import { Aside } from '@astrojs/starlight/components';

<Aside type="tip" title="Pro Tip">
This content will appear exactly the same on every page where it's imported.
You can use **markdown formatting**, lists, and Starlight components.
</Aside>
```

### Step 2: Use the fragment in your pages

Import and use the fragment in any MDX page:

```mdx
---
title: My Documentation Page
description: Example page using a content fragment
---

import MyNote from 'src/content/fragments/my-note.mdx';

<MyNote />  

More content...
```

The name `MyNote` import is an example name/variable specific in the fragments directory: src/content/fragments. You can use any name you want to save the fragment. For example, `EDSNote`.

### Best Practices

- **Naming**: Use descriptive names like `prerequisites.mdx` or `api-warning.mdx`
- **Organization**: Keep fragments in `src/content/fragments/` for easy discovery
- **Import paths**: Use the same path `src/content/fragments/<your-file.mdx>` so you don't have to worry about deciphering relative paths from your file's location in the project.
- **Content scope**: Use fragments for content that appears on multiple pages (obviously).
- **Updates**: Edit the fragment file once to update all instances.

### Common Fragment Use Cases

- Prerequisites and requirements
- Warning messages and cautions
- Legal disclaimers
- Contact information
- Version compatibility notes
- Troubleshooting tips
