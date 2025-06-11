# Adobe Commerce Storefront documentation

Welcome to the storefront documentation site! To contribute documentation to this site follow the instructions below to install the prerequisites, configure your local environment, create new pages, submit PRs.

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

## 🔄 Automated Redirect Management

**✨ Redirects are completely automated! No manual work required.**

This project includes a fully automated redirect management system that eliminates the need for manual redirect creation. When you move or rename files, redirects are automatically generated and managed for you.

### How It Works

The system uses a **Git pre-commit hook** that automatically:
1. **Detects** when you move, rename, or delete content files
2. **Generates** appropriate redirects in `astro.config.mjs`
3. **Updates** the configuration file as part of your commit
4. **Ensures** no broken links occur

### Your Workflow Stays the Same

You don't need to learn new commands or change your workflow:

```bash
# 1. Move/rename files (normal operation)
mv src/content/docs/old-name.mdx src/content/docs/new-name.mdx

# 2. Commit changes (normal operation)
git add .
git commit -m "Rename file for clarity"

# 3. Push (normal operation) 
git push
```

**That's it!** The Git hook automatically:
- Detects the file was moved from `old-name.mdx` to `new-name.mdx`
- Adds redirect: `'/old-name': '${basePath}/new-name'` to `astro.config.mjs`
- Includes the updated config in your commit
- Shows you what redirects were added

### Environment-Aware Redirects

All redirects work correctly across environments:
- **Development**: `http://localhost:4321/microsite-commerce-storefront/new-name`
- **Production**: `https://experienceleague.adobe.com/developer/commerce/storefront/new-name`
- **GitHub Pages**: Uses `VITE_GITHUB_BASE_PATH` environment variable

### What Gets Automated

- ✅ **File moves**: `old-path/file.mdx` → `new-path/file.mdx`
- ✅ **File renames**: `old-name.mdx` → `new-name.mdx`
- ✅ **Directory restructuring**: Entire folder moves
- ✅ **Redirect validation**: Ensures no broken targets or loops
- ✅ **Environment compatibility**: Works in dev, production, and GitHub

### Manual Override Available

If you need to customize redirects or run commands manually, all the tools are available:

```bash
# Generate redirects manually
pnpm redirects:generate

# Test all redirects
pnpm redirects:test

# Build with redirect generation
pnpm build:with-redirects
```

But for 99% of use cases, **just commit your changes normally** and redirects are handled automatically.

## Available scripts

The available scripts for running the project are defined in the `package.json` file:

### 🚀 Development & Build Scripts

- **`dev`**: Starts the development server and auto-opens the site in the browser.
  ```bash
  pnpm dev
  ```

- **`build:prod`**: Builds the production site with the `/developer/commerce/storefront` base path.
  ```bash
  pnpm build:prod
  ```

- **`preview:prod`**: Previews the production site.
  ```bash
  pnpm preview:prod
  ```

- **`build`**: Builds a static, optimized development site **without** the production base path.
  ```bash
  pnpm build
  ```

- **`preview`**: Previews the static development site.
  ```bash
  pnpm preview
  ```

### 🧹 Maintenance & Cleanup Scripts

- **`dev:clean`**: Clears the Astro cache and starts a fresh development server.
  ```bash
  pnpm dev:clean
  ```
  Use when you encounter filesystem errors or need a completely fresh development environment.

- **`build:clean`**: Clears both cache and dist directories, then builds production.
  ```bash
  pnpm build:clean
  ```
  Use when you want a completely clean production build from scratch.

- **`clean`**: Removes the dist, .astro, and node_modules directories and reinstalls the dependencies.
  ```bash
  pnpm clean
  ```

- **`scrub`**: Nuclear option - removes everything including pnpm-lock.yaml and pnpm store, then reinstalls.
  ```bash
  pnpm scrub
  ```

- **`lint`**: Runs prettier formatting on all the project files.
  ```bash
  pnpm lint
  ```

### 🔄 Redirect Management Scripts

- **`redirects:generate`**: Automatically generates redirects based on file structure changes.
  ```bash
  pnpm redirects:generate
  ```
  Detects moved/renamed files and creates appropriate redirects in `astro.config.mjs`.

- **`redirects:test`**: Tests all redirects to ensure they're working correctly.
  ```bash
  pnpm redirects:test
  ```
  Validates that redirect sources return proper 308 status and correct target URLs.

- **`build:with-redirects`**: Generates redirects then builds production site.
  ```bash
  pnpm build:with-redirects
  ```
  Combines redirect generation with production build for deployment.

#### 📋 **Manual Override (Advanced Users Only)**

**⚠️ Note: These commands are for advanced troubleshooting only. Most users should rely on the automated Git hook system described above.**

If you need to manually generate or test redirects for debugging purposes:

```bash
# Generate redirects manually (normally done by Git hook)
pnpm redirects:generate

# Test all redirects
pnpm redirects:test

# Build with redirect generation
pnpm build:with-redirects
```

**When to use manual commands:**
- 🔧 Debugging redirect issues
- 🧪 Testing redirect logic during development
- 🚀 CI/CD pipeline integration
- 📊 Generating redirect reports

**For normal file moves/renames, just use your regular Git workflow - no manual commands needed!**

#### 🚨 **Troubleshooting: "My redirect wasn't generated!"**

If you moved/renamed a file but don't see a redirect added to `astro.config.mjs`:

**1. Check if the redirect was actually added:**
```bash
# Look for your old filename in the redirects
grep "old-filename" astro.config.mjs
```

**2. If missing, try manual generation:**
```bash
# Reset the cache and regenerate
pnpm redirects:reset-cache
pnpm redirects:generate
```

**3. Check the Git hooks are working:**
```bash
# Verify hooks are configured
git config core.hooksPath
# Should show: .githooks

# Test the pre-commit hook
.githooks/pre-commit
```

**4. Common causes:**
- **Cache timing**: File was renamed before cache was established
- **Very different names**: `boilerplate-project` → `boilerplate-anatomy` might not auto-detect
- **Manual file operations**: Changes made outside Git workflow
- **Hook not running**: Git hooks not configured or executable

**5. Manual fix:**
```bash
# Add the redirect manually to astro.config.mjs
# In the redirects section, add:
'/old-path': `${basePath}/new-path`,
```

**6. Verify it works:**
```bash
pnpm redirects:test
curl -I http://localhost:4321/old-path
```

### 📄 PDF Generation Scripts

- **`pdf`**: Generates PDF documentation from the live production site.
  ```bash
  pnpm pdf
  ```

- **`pdf-local`**: Generates PDF from a local production build.
  ```bash
  pnpm pdf-local
  ```

- **`pdf-single-page`**: Generates a single-page PDF version.
  ```bash
  pnpm pdf-single-page
  ```

### 🔧 Script Usage Tips

**For Development:**
```bash
# Standard development workflow
pnpm dev

# When you encounter errors or need fresh start
pnpm dev:clean

# Test redirects while developing
pnpm redirects:test
```

**For Production:**
```bash
# Build with automatic redirect generation
pnpm build:with-redirects

# Preview production build
pnpm preview:prod

# Clean production build
pnpm build:clean
```

**For Maintenance:**
```bash
# Format all files
pnpm lint

# Resolve dependency issues
pnpm clean

# Nuclear option (complete reset)
pnpm scrub
```

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

# Page Title

Regular page content before the fragment...

<MyNote />

More content after the fragment...
```

The name `MyNote` is an example name/variable specific to the page to which you are importing the fragment. You can use any name you want. For example, `AcoVersionNote`.

### Best Practices

- **Naming**: Use descriptive names like `prerequisites.mdx` or `api-warning.mdx`
- **Organization**: Keep fragments in `src/content/fragments/` for easy discovery
- **Import paths**: Use the same path `src/content/fragments/<your-file.mdx>` so you don't have to worry about deciphering relative paths from your file's location in the project.
- **Content scope**: Use fragments for content that appears on multiple pages (obviously).
- **Updates**: Edit the fragment file once to update all instances.

### Common Use Cases

- Prerequisites and requirements
- Warning messages and cautions
- Legal disclaimers
- Contact information
- Version compatibility notes
- Troubleshooting tips

