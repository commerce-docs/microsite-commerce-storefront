# Enrichment Preservation System

## Overview

The enrichment preservation system ensures that **100% of manual editorial content** is preserved across all documentation regenerations. This document explains how the system works and the required workflow.

## How It Works

### The Two-Layer System

1. **Source Code Extraction** (automated)
   - Generators extract technical definitions from TypeScript/JavaScript source code
   - Type definitions, function signatures, parameter types, events
   - This is the **technical truth** and changes when code changes

2. **Enrichment Files** (manual editorial content)
   - JSON files in `_dropin-enrichments/`
   - Human-written descriptions, usage guidance, examples
   - This is the **editorial truth** and must be preserved

### File Structure

```
_dropin-enrichments/
├── cart/
│   ├── functions.json
│   ├── events.json
│   ├── containers.json
│   ├── slots.json
│   ├── initialization.json
│   ├── dictionary.json
│   ├── quick-start.json
│   └── overview.json
├── checkout/
│   ├── functions.json
│   ├── ...
└── [other-dropins]/
```

### What Goes in Enrichment Files

**DO include:**
- ✅ Function/container/event descriptions (WHAT and WHY)
- ✅ Parameter descriptions explaining behavior and usage
- ✅ Slot descriptions with context
- ✅ Usage guidance ("Use to...", "Use for...")
- ✅ Examples and code snippets
- ✅ External links (GitHub, npm, MDN, etc.)
- ✅ Behavioral explanations
- ✅ Best practices

**DO NOT include (extracted from source):**
- ❌ Parameter `type` field (extracted from TypeScript)
- ❌ Parameter `required` field (extracted from TypeScript)
- ❌ Event emissions list (extracted from `events.emit()` calls)
- ❌ Function signatures (extracted from code)
- ❌ Type definitions (extracted from `.d.ts` files)

### Example Enrichment Structure

```json
{
  "functionName": {
    "description": "Human-written explanation of what this does and why you'd use it.",
    "parameters": {
      "paramName": {
        "description": "Detailed explanation of this parameter's behavior and usage."
      }
    },
    "returns": "Description of what this returns and how to use it.",
    "events": "Additional context about events this function emits (appended after auto-extracted events)."
  }
}
```

## The Critical Workflow

### BEFORE Running Any Generator

This is **MANDATORY** before regenerating documentation:

1. **Extract Manual Content to Enrichments**
   ```bash
   # Verify current MDX files have detailed descriptions
   grep -A 5 "description" src/content/docs/dropins-b2b/*/containers/*.mdx
   
   # If descriptions are better than enrichments, update the JSON:
   # Extract the detailed descriptions from MDX files
   # Update _dropin-enrichments/[dropin]/containers.json
   ```

2. **Run the Generator**
   ```bash
   npm run generate-docs -- --dropin [dropin-name]
   ```

3. **IMMEDIATELY Verify with Diff**
   ```bash
   git diff src/content/docs/dropins-b2b/[dropin]/ | less
   ```

4. **Check for Content Loss**
   Look for:
   - ⚠️ Shortened descriptions (e.g., "API function for the drop-in" = LOSS)
   - ⚠️ Missing "Use to..." or "Use for..." clauses
   - ⚠️ Removed articles (a, an, the)
   - ⚠️ Missing external links
   - ⚠️ Lost slot descriptions
   - ⚠️ Lost parameter context

5. **If ANY Content Lost**
   ```bash
   # STOP IMMEDIATELY
   git restore src/content/docs/dropins-b2b/[dropin]/
   
   # Fix the enrichment files
   # Add the missing content to _dropin-enrichments/[dropin]/[type].json
   
   # Re-run generator
   # Verify again
   ```

## Enrichment File Types

### 1. `functions.json`
- Function descriptions (what it does, why use it)
- Parameter descriptions (behavior, usage context)
- Return value explanations
- Event context (appended after auto-extracted events)

### 2. `containers.json`
- Top-level `description` for the container
- Parameter descriptions
- Slot descriptions with usage context
- Provider configuration examples

### 3. `events.json`
- Event descriptions (when emitted, payload details)
- Additional context about conditional emissions
- Data structure explanations

### 4. `initialization.json`
- `intro` field (overview paragraph)
- Config option descriptions
- Feature flag explanations
- Model transformer examples

### 5. `overview.json`
- `introduction` field (main overview text)
- Architecture explanations
- Integration guidance

### 6. `slots.json`
- Slot descriptions with context
- Usage patterns
- Styling guidance

### 7. `dictionary.json`
- Translation key descriptions
- Usage context

### 8. `quick-start.json`
- Additional setup steps
- Prerequisites
- Environment-specific guidance

## Generator Scripts

All generators use the enrichment system:

1. `scripts/@generate-quick-start-docs.js`
2. `scripts/@generate-initialization-docs.js`
3. `scripts/@generate-event-docs.js`
4. `scripts/@generate-function-docs.js`
5. `scripts/@generate-container-docs.js`
6. `scripts/@generate-styles-docs.js`
7. `scripts/@generate-dictionary-docs.js`
8. `scripts/@generate-slot-docs.js`

All import from `scripts/lib/enrichment.js`

## Version Control Strategy

### Master Source: `releases/b2b-nov-release`

The `releases/b2b-nov-release` branch contains:
- ✅ All 89+ enrichment JSON files (master source)
- ✅ All generator scripts
- ✅ All templates (`_dropin-templates/`)
- ✅ Sidebar configuration
- ❌ No B2B dropin documentation (except merged Purchase Order)
- ❌ No merchant block documentation

### PR Branches

Each B2B dropin PR branch contains:
- ✅ Its specific dropin's generated documentation
- ✅ All enrichment files (copied from release branch, allows independent regeneration)

### Preview Branch: `b2b-documentation`

Contains everything for live preview:
- ✅ All 5 B2B dropin documentation sets
- ✅ All enrichment files
- ✅ All merchant blocks
- ✅ Complete sidebar

## Regeneration Checklist

- [ ] Verify enrichments match current documentation quality
- [ ] Update enrichments from MDX if needed
- [ ] Run generator with appropriate flags
- [ ] Immediately run `git diff` on generated files
- [ ] Verify NO content loss (compare line by line)
- [ ] Check for shortened descriptions
- [ ] Check for removed "Use to..." clauses
- [ ] Check for missing articles (a, an, the)
- [ ] Check for lost external links
- [ ] If loss detected: STOP, restore, fix enrichments, retry
- [ ] Commit enrichment updates separately from generated docs
- [ ] Push to both release branch and relevant PR branches

## Common Pitfalls

### ❌ BAD: Generic Descriptions

```json
{
  "addProductsToCart": {
    "description": "API function for the drop-in to add products to cart."
  }
}
```

### ✅ GOOD: Detailed, Action-Oriented Descriptions

```json
{
  "addProductsToCart": {
    "description": "Adds one or more products to the shopping cart. Use to add products when a customer clicks an 'Add to Cart' button. The function validates product availability, applies quantity limits, and updates the cart's totals.",
    "parameters": {
      "products": {
        "description": "Array of products to add. Each product must include a SKU and quantity. Optional fields include selected options, custom attributes, and gift message text."
      }
    }
  }
}
```

## Testing the System

Run a dry-run test before regenerating production docs:

```bash
# 1. Make a test branch
git checkout -b test-regeneration

# 2. Run generator
npm run generate-docs -- --dropin company-management

# 3. Check for content loss
git diff src/content/docs/dropins-b2b/company-management/ | grep "^-" | grep -v "^---" | less

# 4. If clean, proceed with production
# If loss detected, fix enrichments and retry
```

## Emergency Recovery

If content was lost during regeneration:

```bash
# 1. Immediately restore files
git restore src/content/docs/dropins-b2b/[dropin]/

# 2. Extract lost content to enrichments
# Manually copy descriptions from git history to enrichment JSON files

# 3. Commit enrichment updates
git add _dropin-enrichments/
git commit -m "CRITICAL: Restore lost editorial content to enrichments"

# 4. Regenerate with corrected enrichments
npm run generate-docs -- --dropin [dropin-name]

# 5. Verify again
git diff
```

## Questions?

If unsure whether content will be preserved:
1. Always run a dry-run test first
2. Always diff before committing
3. When in doubt, check enrichment files first
4. Never trust that "it should work" - always verify

## Related Documentation

- Memory ID 12094551: B2B documentation preservation workflow
- Memory ID 10499446: Code-first extraction strategy
- Memory ID 11326595: Generator system thinking
- `scripts/lib/enrichment.js`: Core enrichment loading module

