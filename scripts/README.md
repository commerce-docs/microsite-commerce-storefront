# Dropin Generator CLI

A command-line tool to generate new dropin components for the Commerce Storefront documentation.

## Usage

Run the CLI script using pnpm (recommended for this project):

```bash
pnpm run create-dropin
```

Or run it directly:

```bash
node scripts/create-dropin.js
```

Or make it executable and run directly:

```bash
./scripts/create-dropin.js
```

## What it does

The CLI will:

1. **Prompt for dropin name** - Enter a descriptive name like "Product Search" or "Inventory Management"
2. **Ask for dropin type** - Choose between B2B or B2C dropin
3. **Show conversion** - Displays how the name will be converted to kebab-case for the package name
4. **Create folder structure** - Creates the main dropin folder and containers subfolder in the appropriate location:
   - B2C dropins: `src/content/docs/dropins/`
   - B2B dropins: `src/content/docs/dropins-b2b/`
5. **Copy and customize templates** - Copies all template files from `_dropin-templates/` and replaces placeholders:
   - `DROPIN_NAME` → Your dropin name (e.g., "Product Search")
   - `DROPIN_PACKAGE` → Kebab-case version (e.g., "product-search")
6. **Update sidebar navigation** - Automatically adds B2C dropins to the sidebar in `astro.config.mjs` (B2B dropins use autogenerate)

## Generated Structure

### B2C Dropins
```
src/content/docs/dropins/[dropin-name]/
├── containers/           # Subfolder for container-specific documentation
│   ├── container.mdx   # Container documentation (from dropin-containers.mdx)
│   └── container-slots.mdx   # Container slots documentation (from dropin-slots.mdx)
├── overview.mdx         # Main overview page (from dropin-overview.mdx)
├── installation.mdx     # Installation instructions (from dropin-installation.mdx)
├── initialization.mdx   # Initialization guide (from dropin-initialization.mdx)
├── styles.mdx          # Styling guide (from dropin-styles.mdx)
├── data-events.mdx     # Data events documentation (from dropin-data-events.mdx)
├── functions.mdx       # API functions (from dropin-functions.mdx)
└── dictionary.mdx      # Dictionary/glossary (from dropin-dictionary.mdx)
```

### B2B Dropins
```
src/content/docs/dropins-b2b/[dropin-name]/
├── containers/           # Subfolder for container-specific documentation
│   ├── container.mdx   # Container documentation (from dropin-containers.mdx)
│   └── container-slots.mdx   # Container slots documentation (from dropin-slots.mdx)
├── overview.mdx         # Main overview page (from dropin-overview.mdx)
├── installation.mdx     # Installation instructions (from dropin-installation.mdx)
├── initialization.mdx   # Initialization guide (from dropin-initialization.mdx)
├── styles.mdx          # Styling guide (from dropin-styles.mdx)
├── data-events.mdx     # Data events documentation (from dropin-data-events.mdx)
├── functions.mdx       # API functions (from dropin-functions.mdx)
└── dictionary.mdx      # Dictionary/glossary (from dropin-dictionary.mdx)
```

## Example

```bash
$ pnpm run create-dropin

🚀 Dropin Generator CLI
======================

Enter the dropin name (e.g., "Product Search"): Product Search
Is this a B2B or B2C dropin? (b2b/b2c): b2c

📝 Dropin will be created as:
   Name: Product Search
   Package: product-search
   Type: B2C
   Location: src/content/docs/dropins/product-search/

Create B2C dropin "Product Search" with package name "product-search"? (y/N): y

📁 Creating directory structure...
✓ Created directory: src/content/docs/dropins/product-search
✓ Created directory: src/content/docs/dropins/product-search/containers

📄 Copying and customizing template files...
✓ Created file: src/content/docs/dropins/product-search/overview.mdx
✓ Created file: src/content/docs/dropins/product-search/installation.mdx
✓ Created file: src/content/docs/dropins/product-search/initialization.mdx
✓ Created file: src/content/docs/dropins/product-search/containers/container.mdx
✓ Created file: src/content/docs/dropins/product-search/containers/container-slots.mdx
✓ Created file: src/content/docs/dropins/product-search/styles.mdx
✓ Created file: src/content/docs/dropins/product-search/data-events.mdx
✓ Created file: src/content/docs/dropins/product-search/functions.mdx
✓ Created file: src/content/docs/dropins/product-search/dictionary.mdx

📝 Updating sidebar configuration...
✓ Updated astro.config.mjs sidebar with Product Search dropin

✅ Dropin creation completed successfully!

📂 Created dropin structure:
   src/content/docs/dropins/product-search/
   src/content/docs/dropins/product-search/containers/

📋 Next steps:
   1. Review and customize the generated files
   2. Add specific containers to the containers/ folder
   3. Update the content to match your dropin's functionality
   4. Test the dropin integration
   5. The sidebar navigation has been automatically updated in astro.config.mjs
```

### B2B Example

```bash
$ pnpm run create-dropin

🚀 Dropin Generator CLI
======================

Enter the dropin name (e.g., "Product Search"): Company Management
Is this a B2B or B2C dropin? (b2b/b2c): b2b

📝 Dropin will be created as:
   Name: Company Management
   Package: company-management
   Type: B2B
   Location: src/content/docs/dropins-b2b/company-management/

Create B2B dropin "Company Management" with package name "company-management"? (y/N): y

📁 Creating directory structure...
✓ Created directory: src/content/docs/dropins-b2b/company-management
✓ Created directory: src/content/docs/dropins-b2b/company-management/containers

📄 Copying and customizing template files...
✓ Created file: src/content/docs/dropins-b2b/company-management/overview.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/installation.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/initialization.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/containers/container.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/containers/container-slots.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/styles.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/data-events.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/functions.mdx
✓ Created file: src/content/docs/dropins-b2b/company-management/dictionary.mdx

📝 B2B dropin will be automatically included in sidebar via autogenerate

✅ Dropin creation completed successfully!

📂 Created dropin structure:
   src/content/docs/dropins-b2b/company-management/
   src/content/docs/dropins-b2b/company-management/containers/

📋 Next steps:
   1. Review and customize the generated files
   2. Add specific containers to the containers/ folder
   3. Update the content to match your dropin's functionality
   4. Test the dropin integration
   5. The B2B dropin will be automatically included in the sidebar navigation
```

## Next Steps

After running the CLI:

1. **Review generated files** - Check all the `.mdx` files and customize the content
2. **Add containers** - Create specific container documentation files in the `containers/` folder
3. **Update content** - Replace placeholder content with actual dropin-specific information
4. **Test integration** - Verify the dropin works correctly in your documentation site

## Template Files

The CLI uses template files from `_dropin-templates/`:

- `dropin-overview.mdx` → `overview.mdx`
- `dropin-installation.mdx` → `installation.mdx`
- `dropin-initialization.mdx` → `initialization.mdx`
- `dropin-containers.mdx` → `containers/container.mdx`
- `dropin-styles.mdx` → `styles.mdx`
- `dropin-data-events.mdx` → `data-events.mdx`
- `dropin-functions.mdx` → `functions.mdx`
- `dropin-dictionary.mdx` → `dictionary.mdx`
- `dropin-slots.mdx` → `containers/container-slots.mdx`

Each template contains placeholders that are automatically replaced with your dropin name and package name.
