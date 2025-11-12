# Installation Enrichment Schema

This document describes the schema for installation enrichment files (`installation.json`) that allow preservation of manually created content while benefiting from automated generation.

## Schema Overview

```json
{
  "override_template": false,
  "intro": null,
  "sections": {
    "before_steps": [],
    "after_steps": []
  }
}
```

## Fields

### `override_template` (boolean)

When `true`, the generator will skip this drop-in entirely, preserving the manually created installation documentation as-is. Use this for drop-ins with highly customized installation processes that cannot be templated.

**Default:** `false`

**Example:**
```json
{
  "override_template": true
}
```

### `intro` (string | null)

Custom introductory content to prepend before the standard "Step-by-step" section. Supports full MDX syntax including components, links, and formatting.

**Default:** `null` (uses standard intro)

**Example:**
```json
{
  "intro": "The Cart drop-in component, like our other drop-in components, is designed for the browser's JavaScript runtime without the need for a bundler. You can also install and execute drop-in components in a build-time environment with bundlers like Vite."
}
```

### `sections` (object)

Container for custom sections to inject at specific points in the documentation.

#### `sections.before_steps` (array)

Array of custom sections to insert before the "Step-by-step" installation instructions. Useful for prerequisites, configuration requirements, or important notices.

Each section object has:
- `title` (string): Section heading
- `content` (string): Section content in MDX format

**Example:**
```json
{
  "sections": {
    "before_steps": [
      {
        "title": "Admin configuration",
        "content": "Before you can use the checkout component on your storefront, you must enable and configure [payment providers](https://example.com) in the Adobe Commerce Admin."
      }
    ]
  }
}
```

#### `sections.after_steps` (array)

Array of custom sections to insert after the installation steps but before the "Next steps" section. Useful for additional configuration, troubleshooting, or related information.

Each section object has:
- `title` (string): Section heading
- `content` (string): Section content in MDX format

**Example:**
```json
{
  "sections": {
    "after_steps": [
      {
        "title": "Summary",
        "content": "The installation of all drop-in components follows the same pattern demonstrated by installing the Cart: Install, Map, Import, Connect, Register, and Render."
      }
    ]
  }
}
```

## Examples

### Minimal Enrichment (Standard Generation)

```json
{
  "intro": null,
  "sections": {
    "before_steps": [],
    "after_steps": []
  },
  "override_template": false
}
```

### Custom Intro

```json
{
  "intro": "The Checkout drop-in provides a customizable UI for the checkout process. It relies on containers from several other drop-in components.",
  "sections": {
    "before_steps": [],
    "after_steps": []
  },
  "override_template": false
}
```

### Custom Sections

```json
{
  "intro": null,
  "sections": {
    "before_steps": [
      {
        "title": "Prerequisites",
        "content": "Before installing the Payment Services drop-in, you must [onboard to Payment Services](https://example.com) in the Adobe Commerce Admin."
      }
    ],
    "after_steps": [
      {
        "title": "Apple Pay Setup",
        "content": "For Apple Pay functionality, additional domain registration is required. Contact your sales representative for assistance."
      }
    ]
  },
  "override_template": false
}
```

### Full Override

```json
{
  "override_template": true
}
```

## Migration Guide

When migrating existing manually created installation docs to use enrichments:

1. **Identify custom content:** Review the existing installation.mdx file and identify sections that differ from the standard template
2. **Extract intro:** If the file has a custom introduction before "Step-by-step", copy it to the `intro` field
3. **Extract sections:** If the file has custom sections before or after the standard steps, add them to the appropriate `sections` array
4. **Consider override:** If the installation process is highly unique and cannot be templated, set `override_template: true`
5. **Test generation:** Run the generator and verify the output matches the original manual content

