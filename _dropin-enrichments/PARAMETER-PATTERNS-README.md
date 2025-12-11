# Parameter Patterns Reference

## Overview

The `parameter-patterns.json` file provides reusable templates for generating consistent, developer-friendly parameter descriptions across all drop-in documentation. This ensures that common parameters like `sku`, `quantity`, `optionsUIDs`, etc., have the same high-quality descriptions everywhere they appear.

## Why This Exists

**Problem:** Previously, parameter descriptions were either:
- Generic and unhelpful ("See function signature above")
- Inconsistent across different drop-ins
- Missing important context and examples

**Solution:** Centralized, context-aware templates that can be automatically applied by the documentation generator.

## File Structure

```json
{
  "patterns": {
    "parameterName": {
      "description_template": "Template with {variables}",
      "contexts": {
        "cart": "cart-specific description",
        "wishlist": "wishlist-specific description",
        "default": "fallback description"
      },
      "examples": {
        "configurable": "example for configurable products",
        "simple": "example for simple products"
      },
      "see_also": ["reference-docs.json keys"]
    }
  }
}
```

## How to Use

### For Documentation Generators

When generating parameter documentation:

1. **Check if a pattern exists** for the parameter name
2. **Select the appropriate context** (e.g., "cart", "wishlist", "update")
3. **Replace template variables** with context-specific values
4. **Add "See also" links** if referenced in the pattern

**Example:**

```javascript
// For addProductsToCart function
const pattern = patterns.sku;
const context = "cart"; // because it's the cart drop-in
const example = pattern.examples.configurable;

// Replace variables in template
const description = pattern.description_template
  .replace("{context}", pattern.contexts[context])
  .replace("{example}", example);

// Result:
// "The product identifier (SKU) to add to the cart. For configurable 
// products (like a shirt available in multiple colors and sizes), use 
// the child product SKU that represents the specific variant selected 
// by the customer (e.g., MS09-M-Blue for a medium blue shirt)."
```

### For Manual Enrichment

When writing enrichment files, you can reference these patterns to ensure consistency:

```json
{
  "addProductsToCart": {
    "parameters": {
      "sku": {
        "description": "Use pattern: sku with context=cart"
      }
    }
  }
}
```

## Available Patterns

### Product Parameters
- **`sku`** - Product identifier with configurable product guidance
- **`parentSku`** - Parent product SKU for configurable products
- **`quantity`** - Number of items (cart, wishlist, update contexts)
- **`optionsUIDs`** - Selected product option UIDs
- **`selectedOptions`** - Option UIDs for updates
- **`enteredOptions`** - Custom text options

### Cart/Wishlist Parameters
- **`customFields`** - Additional metadata fields
- **`wishlistItemId`** - Wishlist item identifier
- **`description`** - Notes/comments on items

### User Parameters
- **`email`** - Email addresses (various contexts)
- **`password`** - Passwords (current, new, login)
- **`address`** - Address fields (shipping, billing)

## Extending Patterns

To add a new pattern:

1. **Identify common parameter names** across multiple drop-ins
2. **Create context-specific variations** 
3. **Include real-world examples**
4. **Add see_also references** to relevant documentation

```json
{
  "newParameter": {
    "description_template": "Description with {context} and {example}",
    "contexts": {
      "cart": "cart context description",
      "order": "order context description",
      "default": "fallback description"
    },
    "examples": {
      "scenario1": "Example for scenario 1",
      "default": "General example"
    },
    "see_also": ["relevant-doc-key"]
  }
}
```

## Benefits

✅ **Consistency** - Same parameters described the same way everywhere  
✅ **Quality** - Every description includes context, examples, and guidance  
✅ **Maintainability** - Update once, apply everywhere  
✅ **Developer-Friendly** - Real examples developers can copy/paste  
✅ **Discoverability** - Linked to relevant documentation via see_also

## Integration with reference-docs.json

The `see_also` arrays reference keys from `reference-docs.json`, which provides verified URLs to Adobe Commerce documentation:

```json
{
  "see_also": [
    "product-options",      // → Customizable Options guide
    "graphql-reference",    // → GraphQL schema reference
    "catalog-management"    // → Catalog management guide
  ]
}
```

## Future Enhancements

Potential improvements:

1. **Auto-generation from GraphQL schemas** - Extract descriptions from Adobe Commerce GraphQL schema comments
2. **Multi-language support** - Templates for different languages
3. **Validation rules** - Parameter constraints and validation patterns
4. **Code examples** - Actual code snippets showing parameter usage
5. **Version tracking** - Pattern versions aligned with Commerce versions

## Related Files

- **`parameter-patterns.json`** - The pattern definitions (this file's subject)
- **`reference-docs.json`** - External documentation URLs
- **`ENRICHMENT-STRATEGY.md`** - Overall enrichment strategy
- **`functions.json`** (per drop-in) - Manual enrichment data

---

**Last Updated:** 2025-01-30  
**Version:** 1.0.0

