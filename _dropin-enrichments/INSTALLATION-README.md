# Installation Documentation System

The installation documentation system uses a **DRY (Don't Repeat Yourself)** approach with a shared installation guide that all drop-ins reference, combined with drop-in-specific package details.

## Architecture

### 1. Shared Installation Guide

**Location**: `src/content/docs/dropins/all/quick-start.mdx`

Contains the complete 6-step installation process that applies to all drop-ins:
1. Install the packages
2. Map the packages  
3. Import the required files
4. Connect to the endpoint
5. Register and load the drop-in
6. Render the drop-in

This guide uses placeholders and examples that work for any drop-in.

### 2. Drop-In Specific Pages

**Template**: `_dropin-templates/dropin-quick-start.mdx`

Each drop-in has a simplified installation page that:
- Links to the shared guide for standard steps
- Provides drop-in-specific details (package name, version, example container)
- Shows quick-reference installation command and import map
- Supports enrichment-based customization for special cases

### 3. Automated Generation

The generator (`scripts/@generate-quick-start-docs.js`) automatically extracts:
- Package names and versions from source repositories
- Available containers for import examples
- Accurate package names and import statements

## Enrichment Schema

Each drop-in can have a `quick-start.json` file with the following structure:

### Important: External Links
**Always use the Link component for external URLs:**
```jsx
<Link href="https://example.com" text="Link Text" />
```
Do NOT use markdown syntax `[text](url)` for external links. The Link component automatically adds an external icon and opens in a new tab.

```json
{
  "override_template": false,
  "intro": "Custom introduction text",
  "sections": {
    "before_steps": [
      {
        "title": "Section Title",
        "content": "Section content in MDX format"
      }
    ],
    "after_steps": [
      {
        "title": "Another Section",
        "content": "More content"
      }
    ]
  }
}
```

## Current Drop-in Configuration

### Standard Drop-ins (Link to Shared Guide)
These drop-ins use the simplified template that links to the shared installation guide:
- **Order**: Standard with link to shared guide
- **User Account**: Standard with link to shared guide
- **Personalization**: Standard with link to shared guide
- **Product Details**: Standard with link to shared guide
- **Product Discovery**: Standard with link to shared guide
- **Recommendations**: Standard with link to shared guide
- **User Auth**: Standard with link to shared guide
- **Wishlist**: Standard with link to shared guide

### Enriched Drop-ins
- **Cart**: Custom intro about runtime vs. build-time + "Summary" section
- **Checkout**: Custom intro + "Installation" and "Admin configuration" sections

### Fully Custom
- **Payment Services**: Completely custom (`override_template: true`) with unique Apple Pay registration content

## Usage

### Generate All Quick Start Pages
```bash
npm run generate-quick-start-docs
```

### Generate Single Drop-in
```bash
npm run generate-quick-start-docs cart
```

### Available Drop-ins
- cart
- checkout
- order
- product-details
- product-discovery
- recommendations
- user-account
- user-auth
- wishlist
- payment-services
- personalization

## Adding Custom Content

### Option 1: Custom Introduction

Add a custom intro that appears before the standard "Step-by-step" section:

```json
{
  "intro": "Your custom introduction text here. Supports full MDX syntax.",
  "sections": {
    "before_steps": [],
    "after_steps": []
  },
  "override_template": false
}
```

### Option 2: Additional Sections

Add custom sections before or after the installation steps:

```json
{
  "intro": null,
  "sections": {
    "before_steps": [
      {
        "title": "Prerequisites",
        "content": "Content about what's needed before installation."
      }
    ],
    "after_steps": [
      {
        "title": "Next Steps",
        "content": "Additional configuration or setup instructions."
      }
    ]
  },
  "override_template": false
}
```

### Option 3: Full Override

Skip generation entirely and maintain a fully custom installation doc:

```json
{
  "override_template": true
}
```

## Benefits

1. **DRY Principle**: Installation steps written once, referenced everywhere
2. **Consistency**: Guaranteed identical instructions across all drop-ins
3. **Easy Maintenance**: Update installation steps in one place
4. **Better UX**: Users learn the pattern once, apply to all drop-ins
5. **Smaller Pages**: Individual pages are concise and focused on drop-in specifics
6. **Accuracy**: Package details generated from actual source code
7. **Version Tracking**: Versions automatically extracted from boilerplate

## Files

- `src/content/docs/dropins/all/quick-start.mdx` - Shared "Using drop-ins" guide (manually maintained)
- `scripts/@generate-quick-start-docs.js` - Quick start generator
- `_dropin-templates/dropin-quick-start.mdx` - Quick start template (links to shared guide)
- `_dropin-enrichments/{dropin}/quick-start.json` - Per-drop-in enrichments
- `src/content/docs/dropins/{dropin}/quick-start.mdx` - Generated output files

## Maintaining the Shared Guide

When updating installation steps that affect all drop-ins:

1. **Edit the shared guide**: `src/content/docs/dropins/all/quick-start.mdx`
2. **Changes propagate automatically**: All drop-in pages link to this guide
3. **No regeneration needed**: Updates appear immediately across all drop-ins

When updating drop-in-specific details:

1. **Regenerate specific drop-in**: `npm run generate-quick-start-docs {dropin-name}`
2. **Or regenerate all**: `npm run generate-quick-start-docs`

