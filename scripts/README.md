# Dropin Generator CLI

Generate new dropin components for the Commerce Storefront documentation.

## Quick Start

```bash
pnpm create-dropin
```

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

## Features

- ✅ **Auto-generates** folder structure and template files
- ✅ **Replaces placeholders** (`DROPIN_NAME`, `DROPIN_PACKAGE`)
- ✅ **Updates sidebar** (B2C: manual, B2B: autogenerate)
- ✅ **Creates containers** folder with container docs

## Example

```bash
$ pnpm create-dropin

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

## Next Steps

1. Review and customize the generated files
2. Add specific containers to the `containers/` folder
3. Update content to match your dropin's functionality