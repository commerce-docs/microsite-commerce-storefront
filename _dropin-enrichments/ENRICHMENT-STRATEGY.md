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

### 🎯 Core Principle: Descriptions Only

**Enrichment files should ONLY contain:**
- ✅ **Descriptions** - Contextual explanations, usage guidance, GraphQL/REST API links
- ✅ **Events** - Event names and payloads (not extracted from code)
- ✅ **Examples/Usage** - Supplemental examples not found in source code

**Enrichment files should NEVER contain:**
- ❌ **Signatures** - Always extracted from TypeScript source
- ❌ **Parameters** - Always extracted from TypeScript types
- ❌ **Returns** - Always extracted from TypeScript return types

### Why This Matters

**The Problem:**
When enrichment files duplicate technical data (signatures, parameters, returns), they can become stale and inaccurate as source code evolves. This creates:
- ❌ Outdated parameter types in docs
- ❌ Incorrect return types 
- ❌ Mismatched function signatures
- ❌ Documentation drift from actual code

**The Solution:**
By extracting technical details directly from TypeScript source code, we guarantee:
- ✅ Documentation always matches actual code
- ✅ Type changes automatically reflected in docs
- ✅ No manual synchronization needed
- ✅ Single source of truth = the code

### Always Enrich

- **Description**: When auto-generated is generic or has errors
  - Replace "A function that adds products to cart"." 
  - With: "The `addProductsToCart` function adds products to a cart. You must supply a `sku` and `quantity` for each product. The other parameters are specified for complex product types. The function calls the [`addProductsToCart`](https://developer.adobe.com/commerce/webapi/graphql/schema/cart/mutations/add-products/) mutation."

- **Events**: When function emits events
  - List which events are emitted
  - Explain when they're emitted
  - Mention data payloads
  - Example: "Emits the `cart/updated` and `cart/data` events."

- **Usage Examples**: When source examples are insufficient
  - Add realistic, copy-paste ready examples
  - Multiple examples for different scenarios
  - Use real-looking data (not "foo", "bar")
  - Each example should be self-contained

### Sometimes Enrich

- **Simple getters** with obvious behavior → May not need enrichment
- **Internal functions** not meant for end users → Skip
- **Well-documented in source** → May be fine as-is

## Reference Documentation System

The project includes a reference documentation system for linking to external docs (e.g., AEM.live documentation).

### Available Reference Docs

- **AEM.live Documentation** - Official Adobe Experience Manager Edge Delivery Services documentation covering authoring, blocks, architecture, and more.
- **Adobe Commerce Documentation** - Official Adobe Commerce merchant and developer documentation from Experience League, covering APIs, services, merchant guides, and system management.

### Using Reference Links in Enrichment

You can reference AEM.live documentation topics in your enrichment descriptions:

```json
{
  "functionName": {
    "description": "This function works with [AEM blocks](https://www.aem.live/developer/block-collection) to render content and integrates with [GraphQL APIs](https://developer.adobe.com/commerce/webapi/graphql/) for data fetching."
  }
}
```

### Finding Reference URLs

```bash
# List all available reference documentation
npm run list-reference-docs

# Search for specific topics
npm run list-reference-docs -- search authoring
npm run list-reference-docs -- search blocks

# List all topics in a source
npm run list-reference-docs -- list aem-live
```

### Programmatic Access

In generator scripts, you can use the reference-docs helper:

```javascript
import { getReferenceUrl, createReferenceLink } from './lib/reference-docs.js';

// Get a URL
const url = getReferenceUrl('aem-live', 'block-collection');

// Create a markdown link
const link = createReferenceLink('aem-live', 'authoring', 'Learn about authoring');
```

**Available Topics:**
- **AEM.live**: `authoring`, `block-collection`, `spreadsheets`, `indexing`, `sidekick`, `architecture`, `security`, and more
- **Adobe Commerce**: `graphql`, `rest-api`, `payment-services`, `live-search`, `b2b`, `catalog`, `security`, `performance`, and more

See `reference-docs.json` for the complete list of topics across all sources.

## Enrichment File Format

### Complete Example

```json
{
  "functionName": {
    "description": "Detailed description with [links](https://example.com) and context about when/why to use this function.",
    "events": "Emits the `cart/updated` and `cart/data` events.",
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

| Field | Type | Purpose | Extracted from Source? |
|-------|------|---------|------------------------|
| `description` | string | Main function description with context | ❌ No - enrichment only |
| `events` | string | Events emitted by function | ❌ No - not in TypeScript |
| `returns` | string | Return value description (optional) | ⚠️ Only when TypeScript type is `any` or `unknown` |
| `returns_source` | string | Hint for extracting return type (`state.field`, `model.Type`, `graphql.mutation`) | ⚠️ Source-first type extraction |
| `examples` or `usage` | array/string | Usage examples with titles | ⚠️ Partially - enrichment as fallback |

### Fields Extracted from Source Code

| Field | Extracted From | Why Source? |
|-------|---------------|-------------|
| **Signature** | TypeScript function declaration | Guaranteed accuracy, auto-updates with code changes |
| **Parameters** | TypeScript parameter types | Type-safe, always current with actual implementation |
| **Returns** | TypeScript return type annotation | Reflects actual return values, can't drift from code |

**Notes:**
- **Usage examples are automatically extracted from source code** (HTML examples, boilerplate blocks, JSDoc). Manual enrichment examples are used only as fallback.
- Generator automatically adds imports to examples. You don't need to include `import` statements in enrichment.
- **Do NOT add parameters or signature fields** - they will be ignored in favor of source code extraction
- **Exception for `returns`**: Only add a `returns` field when TypeScript shows `any` or `unknown`. This provides clarity when source types are unhelpful.

### Source-First Type Extraction for `returns` Field

**🎯 NEW APPROACH:** The generator automatically extracts return types from source code. Enrichment provides only human context.

When a function has unhelpful return types (`any`, `unknown`), use the `returns_source` field to tell the generator where to find the actual type:

**Format:**
```json
{
  "functionName": {
    "returns": "Human-readable description of what's returned",
    "returns_source": "source_type.field_name"
  }
}
```

**Supported Source Types:**

1. **`state.fieldName`** - Extract from state definition
   - Generator looks in `src/lib/state.ts`
   - Finds `fieldName: Type`
   - Auto-generates: "Returns [description]: `fieldName: Type`"

2. **`graphql.mutationName`** - Extract from GraphQL file
   - Generator looks in `src/api/[function]/graphql/`
   - Extracts structure from GraphQL query/mutation
   - Auto-generates verification with structure

**Benefits:**
- ✅ Types always stay current with source code
- ✅ No manual sync needed when types change
- ✅ Enrichment only contains human context
- ✅ Generator fails if source file changes/moves (forcing update)

**Example 1: State definition auto-extraction:**
```json
{
  "createGuestCart": {
    "returns": "the cart ID for the newly created guest cart",
    "returns_source": "state.cartId"
  }
}
```
*Generator output:* "Returns the cart ID for the newly created guest cart: `cartId: string | null`"

**Example 2: GraphQL type auto-extraction:**
```json
{
  "getEstimateShipping": {
    "returns": "A raw shipping method object from GraphQL, or null if no valid shipping method is available.",
    "returns_source": "graphql.estimateShippingMethodsMutation"
  }
}
```
*Generator output:* "Returns `object` - A raw shipping method object from GraphQL, or null if no valid shipping method is available. \*GraphQL definition: [structure]\*"

## Event Validation

**🎯 Keeping Events Current with Automated Validation**

While events are manually documented in enrichment files (for developer-friendly, linkable documentation), the audit script automatically validates them against source code to prevent staleness.

### How Event Validation Works

The `audit-enrichments` script:

1. **Extracts events from source code** - Scans for `events.emit()`, `eventBus.emit()`, `publish()`, `.emit()` patterns
2. **Extracts events from enrichment** - Parses event names from enrichment `events` field
3. **Compares both ways**:
   - ❌ **Events in enrichment but NOT in source** → Stale/removed from code
   - ⚠️ **Events in source but NOT in enrichment** → Missing documentation

### Example Output

```bash
npm run audit-enrichments cart

🔍 initializeCart
   ⚠️  [Events] Emitted in source but NOT documented: `cart/merged`
      💡 Add to enrichment `events` field
```

### When to Update Events

**Always update enrichment when:**
- ✅ Adding new event emissions to function code
- ✅ Removing event emissions from function code
- ✅ Renaming event names
- ✅ During code review if events changed

**How to Verify:**
```bash
# Check specific drop-in
npm run audit-enrichments cart

# Check all drop-ins
npm run audit-enrichments
```

### Best Practices

1. **Run audit before committing** enrichment changes
2. **Fix warnings immediately** - they indicate documentation/code mismatch
3. **Update enrichment first**, then verify with audit
4. **Include event context** - explain payload data, special behaviors, side effects

This approach gives you the **best of both worlds**:
- ✅ Developer-friendly, linkable event documentation
- ✅ Automated validation against source code
- ✅ Immediate feedback on staleness
- ✅ No silent drift between code and docs

## Source-First Principle

**🎯 Core Rule: Source Code is the Single Source of Truth**

The generator **always** extracts technical data directly from TypeScript source code:

### Automatically Extracted from Source

1. **Function Signatures** (from drop-in repos)
   - Extracted from `.ts` files in `src/api/{functionName}/`
   - Parameter names and types
   - Return types
   - Async/Promise patterns
   - Optional parameters

2. **Usage Examples** (from multiple repositories)
   - **JSDoc comments** - from drop-in repo TypeScript files
   - **HTML examples** - from drop-in repo (`examples/html-host/index.html`)
   - **Boilerplate blocks** - from boilerplate repo (`blocks/*/*.js`)
   - **Reference repos** - from dropin-template, StorefrontSDK, storefront-tools

### Example Extraction Priority Order

**🚨 CRITICAL:** Examples are **NEVER** stored in enrichment files. They are **ALWAYS** extracted from live source code to prevent staleness.

```
1. JSDoc Examples (highest priority)
   ↳ Source: Drop-in repo (src/api/{functionName}/*.ts)
   ↳ Why: Developer-documented, always current with code
   
2. HTML Example Files
   ↳ Source: Drop-in repo (examples/html-host/index.html)
   ↳ Why: Real integration examples
   
3. Boilerplate Blocks
   ↳ Source: Boilerplate repo (blocks/*/*.js)
   ↳ Why: Production usage patterns
   
4. Reference Repository Examples
   ↳ Source: dropin-template, StorefrontSDK, storefront-tools repos
   ↳ Searched in: examples/, src/, docs/ directories
   ↳ Why: Additional context and patterns

⚠️  If no examples found: Docs generate WITHOUT examples rather than using static code

❌ Test files are NEVER used as example sources because:
   • Tests focus on edge cases and error scenarios ("should not", "throws error")
   • Tests use mock data (mockItemUid, testData) instead of real values
   • Tests include test assertions (.rejects.toThrow(), expect())
   • Test titles are often misleading for documentation purposes
```

### Reference Repositories

The documentation system uses four additional repositories as reference sources:

- **[dropin-template](https://github.com/adobe-commerce/dropin-template)** - Official template for creating custom drop-ins with Elsie CLI. Contains working examples of components, containers, and API usage patterns.
- **[StorefrontSDK](https://github.com/adobe-commerce/StorefrontSDK)** - Core SDK for storefront functionality with shared utilities and type definitions.
- **[storefront-tools](https://github.com/adobe-commerce/storefront-tools)** - Development tools and utilities with build configurations and testing examples.
- **[da-live](https://github.com/adobe/da-live)** - Edge Delivery Authoring experience with merchant-facing UI patterns, blocks, and authoring workflows. Useful for merchant documentation and UI examples.

These repositories are automatically searched for usage examples during documentation generation.

### Enrichment as Supplement, Not Replacement

Enrichment files **supplement** source code with:
- ✅ Human-readable descriptions
- ✅ Business context and usage guidance
- ✅ Links to GraphQL/REST API documentation
- ✅ Event bus information

Enrichment files **never contain**:
- ❌ Function signatures (always from source)
- ❌ Parameter types (always from source)
- ❌ Return types (always from source)
- ❌ **Code examples** (always from source - see priority order above)

### What If No Examples Are Found?

**Do NOT add examples to enrichment files!**

Instead:
1. **Add JSDoc @example** to the source code (contributes upstream!)
2. **Add test cases** with real usage (improves code quality!)
3. **Accept missing examples** - better than stale code

**Philosophy:** Missing examples → Contribute upstream. Static examples → Technical debt.

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

**Problem:** Auto-generated description has typo: `A function that adds products to cart".`  
**Solution:** Add corrected description to enrichment file

### Issue: Parameters not showing in generated docs

**Problem:** No parameters table in output  
**Diagnosis:** Generator extracts parameters from TypeScript signature  
**Solution:** Verify the TypeScript source file exists and has proper type annotations. Do NOT add parameters to enrichment.

### Issue: Return type is missing or wrong

**Problem:** Generated docs show incorrect or missing return type  
**Diagnosis:** Generator extracts return type from TypeScript  
**Solution:** Check TypeScript source has explicit return type annotation (`: Promise<CartModel>`). Do NOT add returns to enrichment.

### Issue: Examples don't have imports

**Problem:** Examples missing import statements  
**Solution:** Generator auto-adds imports - don't include in enrichment

### Issue: Old enrichment fields not working

**Problem:** Added `parameters`, `returns`, or `signature` to enrichment but they're not showing  
**Solution:** These fields are now ignored. The generator only uses source code for technical data. Remove these fields from enrichment.

## Summary

**Golden Rule:** Enrichment is for human context, not technical data. Source code is always the source of truth.

**✅ DO Enrich:**
- Function descriptions with business context
- Links to GraphQL mutations/queries or REST APIs
- Event bus information
- Supplemental usage examples

**❌ DON'T Enrich:**
- Function signatures (use TypeScript source)
- Parameter types (use TypeScript source)
- Return types (use TypeScript source)
- Any technical data that exists in code

**When to Extract:**
- Mature drop-ins with existing manual docs
- Want to preserve contextual descriptions
- Want to move to automated system

**When to Write Fresh:**
- New drop-ins with minimal docs
- Want clean, structured approach from start

**Always Remember:**
- Source code is the single source of truth for technical data
- Enrichment adds human context, not duplicates code
- Focus on high-value descriptions and examples
- Link to related documentation (GraphQL, REST, events)
- Test after every change
- Remove any old `parameters`, `returns`, `signature` fields from enrichment

