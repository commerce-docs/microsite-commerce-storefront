# Dropin Management CLI

Create and remove drop-in components for the Commerce Storefront documentation.

## Quick Start

```bash
pnpm dropins
```

The CLI will ask what you want to do:

1. **Create a new dropin**
2. **Remove an existing dropin or page**

### Creating drop-ins

The CLI follows this sequence:

1. **Main menu**: Choose to create or remove a dropin
2. **Dropin name**: Enter the dropin name (e.g., "Product Search")
3. **Type selection**: Choose B2B or B2C
4. **Confirmation**: Confirm the dropin details before creation

The CLI then automatically handles all the setup and configuration for you.

## What it creates

**B2C drop-ins**: `src/content/docs/dropins/[name]/`  
**B2B drop-ins**: `src/content/docs/_dropins-b2b/[name]/`

```
[dropin-folder]/
├── overview.mdx
├── installation.mdx
├── initialization.mdx
├── containers/
│   ├── index.mdx              ← Container overview
│   ├── container-one.mdx      ← ContainerOne template
│   └── container-two.mdx      ← ContainerTwo template
├── data-events.mdx
├── functions.mdx
└── dictionary.mdx
```

### Removing drop-ins

The CLI can remove:

1. **Entire drop-ins** (all files, folders, and sidebar entries)
2. **Individual pages** (single files within a dropin)

## Features

- ✅ **Auto-generates** folder structure and template files
- ✅ **Automatic placeholder resolution** (`DROPIN_NAME`, `DROPIN_PACKAGE`, `DROPINS_BASE_PATH`)
- ✅ **Smart path handling** (B2C: `/dropins/`, B2B: `/_dropins-b2b/`)
- ✅ **Updates sidebar** (both B2C and B2B drop-ins)
- ✅ **Two-container system** (ContainerOne + ContainerTwo templates)
- ✅ **Container overview** with card-based navigation
- ✅ **Removes drop-ins** and their sidebar entries completely
- ✅ **Removes individual pages** from drop-ins
- ✅ **Alphabetical insertion** - new drop-ins are placed in alphabetical order
- ✅ **Robust removal** - completely removes dropin objects from sidebar
- ✅ **No merge conflicts** - registry is auto-generated from file system

## Placeholder Resolution

The CLI automatically resolves placeholders in dropin templates, providing a hybrid approach that handles mechanical replacements while preserving placeholders that require developer customization.

### Automatic Resolution

The CLI automatically resolves these placeholders when creating a dropin:

| Placeholder | Resolved Value | Example |
|-------------|----------------|---------|
| `DROPIN_NAME` | Actual component name | `Quote Management` |
| `DROPIN_PACKAGE` | Package name (kebab-case) | `quote-management` |
| `DROPINS_BASE_PATH` | Base path (`dropins` or `_dropins-b2b`) | `_dropins-b2b` |

### Template Processing Example

**Before (Template):**
```markdown
---
title: DROPIN_NAME overview
description: Learn about the features and functions of the DROPIN_NAME drop-in component.
---

{/* DESCRIBE the main functionality and purpose of the DROPIN_NAME drop-in component. */}

Visit the [DROPIN_NAME installation](/DROPINS_BASE_PATH/DROPIN_PACKAGE/installation/) page to get started.

## Available slots

| Slot | Purpose | Required |
|------|---------|----------|
| SLOT_NAME | DESCRIPTION of what this slot does | Yes/No |
```

**After (CLI Processing):**
```markdown
---
title: Quote Management overview
description: Learn about the features and functions of the Quote Management drop-in component.
---

{/* DESCRIBE the main functionality and purpose of the Quote Management drop-in component. */}

Visit the [Quote Management installation](/_dropins-b2b/quote-management/installation/) page to get started.

## Available slots

| Slot | Purpose | Required |
|------|---------|----------|
| SLOT_NAME | DESCRIPTION of what this slot does | Yes/No |
```

### Manual Customization Required

Developers still need to customize these placeholders:

1. **`{/* DESCRIBE ... */}`** → Actual descriptive content
2. **`SLOT_NAME`** → Specific slot names (e.g., "Header", "QuoteDetails")
3. **`FUNCTION_NAME`** → Specific function names (e.g., "createQuote", "updateQuote")
4. **`COMMERCE_FEATURE_NAME`** → Specific Commerce features
5. **`DESCRIPTION`** → Specific descriptions and explanations
6. **`ISSUE_NAME`** → Specific troubleshooting issues
7. **`PRACTICE_NAME`** → Specific best practices
8. **`FEATURE_NAME`** → Specific features

### Benefits

1. **Efficiency**: CLI handles repetitive, mechanical replacements
2. **Accuracy**: No typos in component names, package names, or paths
3. **Consistency**: All instances are replaced uniformly
4. **Flexibility**: Developers still customize content-specific placeholders
5. **Quality**: Forces developers to think about actual functionality

## Examples

### Creating a drop-in

```bash
$ pnpm dropins

🚀 Dropin Management CLI
========================

What would you like to do?
  1. Create a new dropin
  2. Remove an existing dropin or page

Select option (1 or 2): 1

Enter the dropin name: Quotes Management

Is this a B2B or B2C dropin?
  1. B2B
  2. B2C

Select option (1 or 2): 1

📝 Dropin will be created as:
   Name: Quotes Management
   Package: quotes-management
   Type: B2B
   Location: src/content/docs/dropins/quotes-management/

Create B2C dropin "Quotes Management"? (Y/n): [Press Enter]

✅ Dropin creation completed successfully!
```

### Removing a drop-in

```bash
$ pnpm dropins

🚀 Dropin Management CLI
========================

What would you like to do?
  1. Create a new dropin
  2. Remove an existing dropin or page

Select option (1 or 2): 2

Available dropins:
  1. quote-management (B2B)

Select a dropin to remove (number) or "cancel": 1

What would you like to remove for "quotes-management"?
  1. Entire dropin (all files and folders)
  2. Individual pages

Select option (1 or 2): 1

⚠️  Are you sure you want to remove the entire "quotes-management" dropin? (Y/n): [Press Enter]

✅ Removed dropin folder: src/content/docs/dropins/quotes-management
✅ Removed sidebar entry for "quotes-management"
✅ Successfully removed "quotes-management" dropin!
```

## Reliability

The CLI has been extensively tested and improved to ensure:

- **Complete removal** - no leftover sidebar entries or fragments
- **Alphabetical ordering** - new drop-ins are inserted in the correct position
- **No merge conflicts** - registry is generated dynamically from the file system
- **Debugging output** - detailed output shows exactly what's happening

## Next Steps

1. Review and customize the generated files
2. Add specific containers to the `containers/` folder
3. Update content to match your dropin's functionality