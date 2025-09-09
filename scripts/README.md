# Dropin Management CLI

Create and remove dropin components for the Commerce Storefront documentation.

## Quick Start

```bash
pnpm dropins
```

The CLI will ask what you want to do:
1. **Create a new dropin**
2. **Remove an existing dropin or page**

### Creating Dropins

The CLI will ask for:
1. **Dropin name** (e.g., "Product Search")
2. **Type** (B2B or B2C)

## What it creates

**B2C dropins**: `src/content/docs/dropins/[name]/`  
**B2B dropins**: `src/content/docs/dropins-b2b/[name]/`

```
[dropin-folder]/
├── containers/
│   ├── container.mdx
│   └── container-slots.mdx
├── overview.mdx
├── installation.mdx
├── initialization.mdx
├── styles.mdx
├── data-events.mdx
├── functions.mdx
└── dictionary.mdx
```

### Removing Dropins

The CLI can remove:
1. **Entire dropins** (all files, folders, and sidebar entries)
2. **Individual pages** (single files within a dropin)

## Features

- ✅ **Auto-generates** folder structure and template files
- ✅ **Replaces placeholders** (`DROPIN_NAME`, `DROPIN_PACKAGE`)
- ✅ **Updates sidebar** (both B2C and B2B dropins)
- ✅ **Creates containers** folder with container docs
- ✅ **Removes dropins** and their sidebar entries
- ✅ **Removes individual pages** from dropins

## Examples

### Creating a Dropin

```bash
$ pnpm dropins

🚀 Dropin Management CLI
========================

What would you like to do?
  1. Create a new dropin
  2. Remove an existing dropin or page

Select option (1 or 2): 1

🚀 Dropin Generator CLI
======================

Enter the dropin name: Product Search
Is this a B2B or B2C dropin? (b2b/b2c): b2c

📝 Dropin will be created as:
   Name: Product Search
   Package: product-search
   Type: B2C
   Location: src/content/docs/dropins/product-search/

Create B2C dropin "Product Search"? (y/N): y

✅ Dropin creation completed successfully!
```

### Removing a Dropin

```bash
$ pnpm dropins

🚀 Dropin Management CLI
========================

What would you like to do?
  1. Create a new dropin
  2. Remove an existing dropin or page

Select option (1 or 2): 2

🗑️  Dropin Removal Tool
======================

Available dropins:
  1. company-management (B2B)
  2. quote-management (B2B)
  3. product-search (B2C)

Select a dropin to remove (number) or "cancel": 1

What would you like to remove for "company-management"?
  1. Entire dropin (all files and folders)
  2. Individual pages

Select option (1 or 2): 1

⚠️  Are you sure you want to remove the entire "company-management" dropin? (y/N): y

✅ Removed dropin folder: src/content/docs/dropins-b2b/company-management
✅ Removed sidebar entry for "company-management"
✅ Successfully removed "company-management" dropin!
```

## Next Steps

1. Review and customize the generated files
2. Add specific containers to the `containers/` folder
3. Update content to match your dropin's functionality