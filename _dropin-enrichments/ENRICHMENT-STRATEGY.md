# Function Documentation Enrichment Strategy

## Quick Reference

### Common Commands

```bash
# Reset all generated docs to last commit (for testing)
npm run rollback-docs

# Extract enrichment from existing manual documentation
npm run extract-enrichments cart

# Generate function documentation (uses enrichment automatically)
npm run generate-function-docs cart

# Generate all documentation at once
npm run generate-all-docs
```

### Typical Testing Workflow

```bash
# 1. Start with clean slate
npm run rollback-docs

# 2. Make changes to generator or enrichment
# Edit scripts/@generate-function-docs.js or _dropin-enrichments/cart/functions.json

# 3. Test generation
npm run generate-function-docs cart

# 4. Review output
# Check src/content/docs/dropins/cart/functions.mdx

# 5. If needed, rollback and iterate
npm run rollback-docs
```

## Overview

The enrichment system allows you to preserve high-quality, manually-written documentation while still benefiting from automated generation. This document explains **when** to use enrichment, **how** to create it, and **best practices** for maintaining it.

## The Problem Enrichment Solves

Auto-generated documentation from source repositories often has:
- ❌ Placeholder descriptions ("A function that...")
- ❌ Missing parameter descriptions
- ❌ No usage examples or overly simple ones
- ❌ Missing context about when/why to use functions
- ❌ No links to GraphQL schema or related docs

Enrichment files preserve your manual improvements while:
- ✅ Keeping function signatures synced with source code
- ✅ Maintaining consistent structure across all drop-ins
- ✅ Enabling bulk regeneration when templates change

## Two Workflows

### Workflow 1: Start Fresh (New Drop-ins)

**Use when:** Drop-in has never had manual documentation

1. Generate initial docs: `npm run generate-function-docs my-dropin`
2. Review output - identify functions needing enhancement
3. Create enrichment file: `_dropin-enrichments/my-dropin/functions.json`
4. Add enrichment data for specific functions (see format below)
5. Regenerate: `npm run generate-function-docs my-dropin`

**Pro:** Clean, structured from the start  
**Con:** More upfront work

### Workflow 2: Extract from Existing (Mature Drop-ins)

**Use when:** Drop-in already has manually-enhanced functions.mdx

1. **Extract enrichment** from current manual docs:
   ```bash
   node scripts/extract-enrichments.js cart
   ```

2. **Review extracted JSON** in `_dropin-enrichments/cart/functions.json`
   - Fix any parsing errors
   - Clean up descriptions
   - Verify parameters and examples

3. **Regenerate documentation:**
   ```bash
   npm run generate-function-docs cart
   ```

4. **Compare output** with original - verify nothing was lost

**Pro:** Preserves existing work  
**Con:** May need manual cleanup of extracted data

## What to Enrich

### Always Enrich

- **Description**: When auto-generated is generic or has errors
  - Replace "A function that adds products to cart"." 
  - With: "The `addProductsToCart` function adds products to a cart. You must supply a `sku` and `quantity` for each product. The other parameters are specified for complex product types. The function calls the [`addProductsToCart`](https://developer.adobe.com/commerce/webapi/graphql/schema/cart/mutations/add-products/) mutation."

- **Parameters**: When function has multiple parameters
  - Provide table with: Parameter | Type | Required? | Description
  - Helps developers understand each parameter's purpose

- **Returns**: When return type is complex
  - Explain what the promise resolves to
  - Show structure of returned objects

- **Usage Examples**: Always add realistic examples
  - Multiple examples for different scenarios
  - Use real-looking data (not "foo", "bar")
  - Each example should be self-contained

- **Events**: When function emits events
  - List which events are emitted
  - Explain when they're emitted
  - Mention data payloads

### Sometimes Enrich

- **Simple getters** with obvious behavior → May not need enrichment
- **Internal functions** not meant for end users → Skip
- **Well-documented in source** → May be fine as-is

## Enrichment File Format

### Complete Example

```json
{
  "functionName": {
    "description": "Detailed description with [links](https://example.com) and context.",
    "parameters": [
      ["Parameter", "Type", "Req?", "Description"],
      ["sku", "string", "Yes", "The SKU of the product."],
      ["quantity", "number", "Yes", "The amount to add."]
    ],
    "returns": "Returns a promise that resolves to a `CartModel` object or null.",
    "events": "The event bus emits the `cart/updated` and `cart/data` events.",
    "examples": [
      {
        "title": "To add a simple product",
        "code": "functionName({ sku: 'ABC123', quantity: 1 });"
      },
      {
        "title": "To add multiple products",
        "code": "functionName([\n  { sku: 'ABC123', quantity: 1 },\n  { sku: 'XYZ789', quantity: 2 }\n]);"
      }
    ]
  }
}
```

### Field Details

| Field | Type | Purpose | Auto-Generated? |
|-------|------|---------|-----------------|
| `description` | string | Main function description with context | ✅ Yes, but adds import automatically |
| `parameters` | array | Table of parameters (markdown table format) | ❌ No |
| `returns` | string | Return value description (can include code blocks) | ❌ No |
| `events` | string | Events emitted by function | ❌ No |
| `examples` | array | Usage examples with titles | ❌ No |

**Notes:**
- **Usage examples are automatically extracted from source code** (HTML examples, boilerplate blocks, JSDoc). Manual enrichment examples are used only as fallback.
- Generator automatically adds imports to examples. You don't need to include `import` statements in enrichment.
- For `returns` field, use standard markdown code blocks: \`\`\`ts\ntype MyModel = {...}\n\`\`\`
- If multiple functions return the same model, the generator will automatically extract it to a "Data Models" section

## Source-First Principle

**ALL generators prioritize data from source repositories over manual enrichment files.**

### Automatic Example Extraction

Usage examples are automatically extracted from:

1. **Drop-in HTML Examples** (`examples/html-host/index.html`)
   - Real working demonstrations
   - Multiple product type examples
   - Edge cases and advanced usage

2. **Boilerplate Project Blocks** (`.temp-repos/boilerplate/blocks/`)
   - Real-world production usage
   - Integration patterns
   - Best practices

3. **JSDoc Comments** (function source files)
   - Developer-documented examples
   - Inline code documentation

### Priority Order

```
JSDoc Examples (highest priority)
  ↓
HTML Example Files
  ↓
Boilerplate Blocks
  ↓
Enrichment Examples (fallback only)
```

### When to Add Manual Examples

Only add examples to enrichment files when:
- **No source examples exist** for the function
- **Source examples are inadequate** (too complex, missing key use cases)
- **Specific business context** is needed that doesn't exist in source

**Important:** Even when adding manual examples, they should be verified against working code, not invented.

## Best Practices

### 1. Be Selective

Don't enrich everything. Focus on:
- Complex functions with multiple parameters
- Functions with non-obvious behavior
- Functions requiring business context
- Functions with poor auto-generated descriptions

### 2. Use Markdown Formatting

- **Inline code**: Use backticks for function names, parameters, types
- **Links**: Link to GraphQL schema, related functions, external docs
- **Bold**: Emphasize important points sparingly

### 3. Write for Copy-Paste

- Examples should be immediately usable
- Use realistic data (real-looking SKUs, names, etc.)
- Don't use "foo", "bar", "example" in examples

### 4. Keep in Sync

When source code changes:
1. Regenerate docs
2. Check if enrichment needs updates
3. Update enrichment if parameter types or behavior changed

### 5. Document Why, Not Just What

Good:
> "The `addProductsToCart` function adds products to a cart. You must supply a `sku` and `quantity` for each product. The other parameters are specified for complex product types."

Bad:
> "A function that adds products to cart."

### 6. Link to Related Documentation

- GraphQL schema docs
- Related functions in same drop-in
- Commerce admin settings if relevant

## Maintenance Workflow

### Testing Generators with a Clean Slate

To reset all generated documentation to the last committed state:

```bash
npm run rollback-docs
```

This is useful when:
- Testing generator changes
- You want to start fresh before regenerating
- Comparing before/after of generator improvements

**What it does:**
- Restores all files in `src/content/docs/dropins/` to last commit
- Restores all files in `src/content/docs/dropins-b2b/` to last commit
- Shows which files were restored
- Safe: only affects tracked files, doesn't delete anything

### When Regenerating All Docs

```bash
npm run generate-all-docs
```

This regenerates all drop-in documentation. Your enrichment files are automatically applied.

### When Source Code Changes

1. Pull latest source repositories
2. Regenerate affected drop-in: `npm run generate-function-docs cart`
3. Review output for:
   - New functions (may need enrichment)
   - Changed signatures (verify enrichment still valid)
   - Removed functions (remove from enrichment)

### When Adding New Functions

1. Regenerate to pick up new function
2. Evaluate if new function needs enrichment
3. Add to enrichment file if needed
4. Regenerate

## Extraction Tool Tips

The extraction tool (`scripts/extract-enrichments.js`) is helpful but not perfect:

### It Handles Well
- ✅ Simple descriptions
- ✅ Basic OptionsTable parameters
- ✅ Single-paragraph Returns/Events sections
- ✅ Simple usage examples

### Manual Cleanup Needed For
- ⚠️ Complex nested arrays in parameters
- ⚠️ Multi-paragraph Returns sections with code blocks
- ⚠️ Special characters in descriptions

### After Extraction

1. **Open the generated JSON file**
2. **Validate JSON syntax** (use a linter)
3. **Review each function's enrichment**:
   - Are descriptions complete?
   - Are parameters correctly formatted?
   - Do examples have proper line breaks?
4. **Test regeneration** to verify output

## Common Issues

### Issue: Description has extra quote

**Problem:** Source MDX has: `A function that adds products to cart".`  
**Solution:** Add to enrichment with fixed description

### Issue: Parameters not showing

**Problem:** Parameters array not formatted correctly  
**Solution:** Verify array structure matches OptionsTable format:
```json
[
  ["Parameter", "Type", "Req?", "Description"],
  ["param1", "type1", "Yes", "Description"]
]
```

### Issue: Examples don't have imports

**Problem:** Examples missing import statements  
**Solution:** Generator auto-adds imports - don't include in enrichment

## Summary

**Golden Rule:** Use enrichment for content that adds value beyond auto-generation. Don't enrich just to enrich.

**When to Extract:**
- Mature drop-ins with existing manual docs
- Want to preserve work but move to automated system

**When to Write Fresh:**
- New drop-ins with minimal docs
- Want clean, structured approach from start

**Always Remember:**
- Enrichment is optional but powerful
- Focus on high-value functions
- Keep descriptions concise but informative
- Link to related documentation
- Test after every change

