# Overview Page Generator

Auto-generates overview pages by scanning directories for `index.mdx` files and extracting their content.

## Features

- ✅ **Auto-discovery**: Automatically finds all subdirectories with `index.mdx` files
- ✅ **Nested folders**: Supports multi-level directory structures
- ✅ **Configurable**: Use command-line args or config files
- ✅ **Smart descriptions**: Extracts first paragraph and intelligently shortens it
- ✅ **Flexible ordering**: Alphabetical, custom, or discovery order
- ✅ **Include/exclude**: Filter which directories to include

## Quick Start

### Basic Usage

Generate overview for the default directory (drop-ins):

```bash
pnpm run generate-dropins-overview
```

### Custom Directory

Generate overview for any directory:

```bash
# Generate overview for blocks
pnpm run generate-dropins-overview -- src/content/docs/blocks

# Generate overview for merchants
pnpm run generate-dropins-overview -- src/content/docs/merchants
```

### With Config File

For complex scenarios, create a config file:

```bash
pnpm run generate-dropins-overview -- --config scripts/custom-config.js
```

## Configuration

### Config File Format

Create a JavaScript file that exports a configuration object:

```javascript
// scripts/custom-config.js
export default {
  // Directory to scan (required)
  targetDir: 'src/content/docs/dropins',
  
  // Output filename (default: 'index.mdx')
  outputFile: 'index.mdx',
  
  // Only include these subdirectories (optional)
  // null = include all
  include: ['cart', 'checkout', 'order'],
  
  // Exclude patterns (optional, supports wildcards)
  exclude: ['all', 'deprecated-*', 'test-*'],
  
  // Ordering strategy (default: 'alphabetical')
  // Options: 'alphabetical' | 'custom' | 'discovery'
  order: 'alphabetical',
  
  // Custom order array (only used if order: 'custom')
  customOrder: [
    'cart',
    'checkout',
    'product-details',
    'order'
  ],
  
  // Page metadata
  title: 'Overview',
  description: 'Explore drop-in components for building storefronts',
  introText: 'Introduction paragraph that appears before the table.'
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetDir` | string | `'src/content/docs/dropins'` | Directory to scan for subdirectories |
| `outputFile` | string | `'index.mdx'` | Name of the generated overview file |
| `include` | array\|null | `null` | Whitelist of subdirectories to include (null = all) |
| `exclude` | array | `['all']` | Patterns to exclude from discovery |
| `order` | string | `'alphabetical'` | How to sort items: `alphabetical`, `custom`, or `discovery` |
| `customOrder` | array | `[]` | Custom sort order (only if `order: 'custom'`) |
| `title` | string | `'Overview'` | Page title in frontmatter |
| `description` | string | Auto-generated | Page description in frontmatter |
| `introText` | string | Auto-generated | Introduction paragraph |

### Ordering Strategies

#### Alphabetical (default)
Sorts all items alphabetically:

```javascript
order: 'alphabetical'
```

#### Discovery Order
Keeps items in the order they were discovered (filesystem order):

```javascript
order: 'discovery'
```

#### Custom Order
Define exact order. Items not in the list appear at the end alphabetically:

```javascript
order: 'custom',
customOrder: [
  'cart',
  'checkout',
  'product-details',
  'order',
  'user-account'
]
```

## Examples

### Example 1: Generate overview for blocks

```bash
pnpm run generate-dropins-overview -- src/content/docs/blocks
```

Creates `src/content/docs/blocks/index.mdx` with all block subdirectories.

### Example 2: Only include specific drop-ins

```javascript
// scripts/b2c-dropins-config.js
export default {
  targetDir: 'src/content/docs/dropins',
  include: ['cart', 'checkout', 'product-details', 'user-auth'],
  title: 'B2C Drop-ins',
  description: 'Essential drop-ins for B2C storefronts'
};
```

Run:
```bash
pnpm run generate-dropins-overview -- --config scripts/b2c-dropins-config.js
```

### Example 3: Exclude deprecated items

```javascript
export default {
  targetDir: 'src/content/docs/dropins',
  exclude: ['deprecated-*', 'test-*', 'all'],
  order: 'alphabetical'
};
```

### Example 4: Custom order with specific categories first

```javascript
export default {
  targetDir: 'src/content/docs/dropins',
  order: 'custom',
  customOrder: [
    // Core commerce
    'cart',
    'checkout',
    'order',
    // Product browsing
    'product-details',
    'product-discovery',
    // User management
    'user-account',
    'user-auth',
    // Optional features
    'wishlist',
    'recommendations'
    // payment-services and personalization will appear at end (alphabetically)
  ]
};
```

## How It Works

### Auto-Discovery Process

1. **Scan target directory** recursively for subdirectories
2. **Check for `index.mdx`** in each subdirectory
3. **Apply filters** (include/exclude patterns)
4. **Extract content**:
   - Title from frontmatter
   - First paragraph as description
5. **Intelligent shortening**:
   - Removes redundant phrases ("The X drop-in component")
   - Removes markdown formatting
   - Truncates to 150 characters at natural boundaries
6. **Sort items** according to ordering strategy
7. **Generate MDX file** with table of all items

### Description Extraction

The script intelligently extracts and shortens descriptions:

**Original:**
> The cart drop-in component provides a variety of fully-editable controls to help you view, update, and merge the products in your cart and mini-cart in your storefront.

**Generated:**
> Provides editable controls to help you view, update, and merge the products in your cart and mini-cart.

### Nested Folder Support

The script supports nested structures:

```
dropins/
├── b2c/
│   ├── cart/
│   │   └── index.mdx      ← Discovered as "b2c/cart"
│   └── checkout/
│       └── index.mdx      ← Discovered as "b2c/checkout"
└── b2b/
    └── requisition-lists/
        └── index.mdx      ← Discovered as "b2b/requisition-lists"
```

## Troubleshooting

### Issue: No subdirectories discovered

**Solution:** Ensure each subdirectory has an `index.mdx` file. The script only includes directories with index files.

### Issue: Some directories not included

**Solution:** Check your `include` and `exclude` filters. Remember that `exclude` patterns support wildcards.

### Issue: Wrong order

**Solution:** 
- Verify `order` setting in config
- If using `custom`, ensure all items are in `customOrder` array
- Items not in `customOrder` appear at the end alphabetically

### Issue: Descriptions are cut off

**Solution:** Descriptions are automatically shortened to 150 characters. This is intentional for table readability. To change this, modify the `maxLength` parameter in the `intelligentShorten()` function.

### Issue: Missing frontmatter warning

**Solution:** Ensure each `index.mdx` has:
```yaml
---
title: Your Title
---
```
And at least one paragraph of content after the imports.

## Integration with Documentation Pipeline

The script is automatically integrated into the master documentation generator:

```bash
# Regenerates ALL documentation including overview pages
pnpm run generate-all-docs
```

The drop-ins overview is regenerated as part of the complete documentation build.

## Advanced Use Cases

### Creating Multiple Overview Pages

Generate overviews for different sections:

```bash
# Generate all overviews
pnpm run generate-dropins-overview
pnpm run generate-dropins-overview -- src/content/docs/blocks
pnpm run generate-dropins-overview -- src/content/docs/merchants
```

Or create a wrapper script:

```javascript
// scripts/generate-all-overviews.js
import { execSync } from 'child_process';

const directories = [
  'src/content/docs/dropins',
  'src/content/docs/blocks',
  'src/content/docs/merchants/tutorials'
];

for (const dir of directories) {
  console.log(`\nGenerating overview for ${dir}...`);
  execSync(`node scripts/generate-dropins-overview.js ${dir}`, { stdio: 'inherit' });
}
```

### Dynamic Grouping

For complex taxonomies, use config files per section:

```javascript
// scripts/config-b2c.js
export default {
  targetDir: 'src/content/docs/dropins',
  include: ['cart', 'checkout', 'wishlist'],
  outputFile: 'b2c-overview.mdx',
  title: 'B2C Drop-ins',
  description: 'Core drop-ins for B2C commerce'
};

// scripts/config-b2b.js
export default {
  targetDir: 'src/content/docs/dropins',
  include: ['requisition-lists', 'company-account'],
  outputFile: 'b2b-overview.mdx',
  title: 'B2B Drop-ins',
  description: 'Drop-ins for B2B commerce'
};
```

## Related Scripts

- `generate-all-docs.js` - Master documentation generator
- `generate-container-docs.js` - Generates container documentation
- `generate-function-docs.js` - Generates API function documentation

## Support

For issues or questions about the overview generator:
1. Check this documentation
2. Review the script comments in `scripts/generate-dropins-overview.js`
3. Check existing config examples in the `scripts/` directory

