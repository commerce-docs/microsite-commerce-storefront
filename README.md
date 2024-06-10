# Adobe Commerce Storefront documentation

Welcome to the storefront documentation site! To contribute documentation to this site follow the instructions below to install the prerequisites, configure your local environment, create new pages, submit PRs . 

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

1. Fork the repository.
1. Create a new branch for your changes.
1. Make your changes.
1. Push your changes to your fork.
1. Create a pull request to the `develop` branch of the `commerce-docs/microsite-commerce-storefront` repository.
1. Wait for the PR to be reviewed and merged.

## How to create a new docs page

1. Create a new `.mdx` file in the `src/content/docs/<docs-directory>`.
1. Add the frontmatter to the top of the file. The frontmatter should include the title of the page and the description. The `title` will render as an `<h1>` on the page. The `description` will be used for SEO and social sharing. For example:

   ```mdx
   ---
   title: Slots
   description: Learn about slots and how to use them to customize dropins.
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
   description: Learn about slots and how to use them to customize dropins.
   sidebar:
   label: Slots
   order: 4
   ---

   import Diagram from '@components/Diagram.astro';
   import Vocabulary from '@components/Vocabulary.astro';
   import Aside from '@components/Aside.astro';
   import Callouts from '@components/Callouts.astro';
   ```

