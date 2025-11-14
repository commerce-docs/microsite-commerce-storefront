# Overview Generator - Quick Reference

## 🚀 Common Commands

```bash
# Default: Generate drop-ins overview
pnpm run generate-dropins-overview

# Custom directory
pnpm run generate-dropins-overview -- src/content/docs/blocks

# With config file
pnpm run generate-dropins-overview -- --config scripts/my-config.js
```

## 📋 Config File Template

```javascript
export default {
  targetDir: 'src/content/docs/your-folder',
  outputFile: 'index.mdx',
  include: null,                    // or ['item1', 'item2']
  exclude: ['all', 'deprecated-*'], // patterns with *
  order: 'alphabetical',            // or 'custom' or 'discovery'
  customOrder: [],                  // if order: 'custom'
  title: 'Overview',
  description: 'Your description',
  introText: 'Your intro paragraph'
};
```

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Auto-discovery** | Finds all folders with `index.mdx` |
| **Nested folders** | Supports `b2c/cart`, `b2b/company` |
| **Smart descriptions** | Extracts & shortens first paragraph |
| **Flexible ordering** | Alphabetical, custom, or discovery |
| **Filtering** | Include/exclude with wildcards |
| **Zero maintenance** | Automatically picks up new folders |

## 📚 Full Documentation

- **Comprehensive Guide**: `scripts/README-generate-overview.md`
- **Config Example**: `scripts/overview-config.example.js`
- **Script Source**: `scripts/generate-dropins-overview.js`

## 💡 Quick Examples

### Only include specific items
```javascript
export default {
  targetDir: 'src/content/docs/dropins',
  include: ['cart', 'checkout', 'order']
};
```

### Custom order
```javascript
export default {
  targetDir: 'src/content/docs/dropins',
  order: 'custom',
  customOrder: ['cart', 'checkout', 'order']
};
```

### Exclude patterns
```javascript
export default {
  targetDir: 'src/content/docs/dropins',
  exclude: ['deprecated-*', 'test-*', 'all']
};
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| No items discovered | Ensure each folder has `index.mdx` |
| Wrong order | Check `order` and `customOrder` in config |
| Missing items | Check `include`/`exclude` filters |
| Descriptions cut off | Max 150 chars (intentional for tables) |

## 🎓 Need Help?

1. Read the full guide: `scripts/README-generate-overview.md`
2. Check the example config: `scripts/overview-config.example.js`
3. Look at script comments in `scripts/generate-dropins-overview.js`

