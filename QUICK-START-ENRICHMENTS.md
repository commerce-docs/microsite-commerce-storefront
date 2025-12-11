# Quick Start: Enrichment Preservation

## TL;DR - How to Preserve Manual Edits Forever

**Before regenerating ANY documentation:**

```bash
# 1. Verify enrichments are complete
npm run verify-enrichments [dropin-name]

# 2. If issues found, update enrichment JSON files
# Edit: _dropin-enrichments/[dropin]/[type].json

# 3. Run generator
npm run generate-docs -- --dropin [dropin-name]

# 4. IMMEDIATELY verify no content was lost
git diff src/content/docs/dropins-b2b/[dropin]/

# 5. If ANY loss: STOP, restore, fix enrichments, retry
git restore src/content/docs/dropins-b2b/[dropin]/
```

## The System in 3 Sentences

1. **Enrichment files** (`_dropin-enrichments/*.json`) store all manual editorial content
2. **Generators** merge enrichments with code-extracted technical data to create MDX docs
3. **Before regenerating**, ensure enrichments contain ALL manual content to prevent loss

## Key Files

```
_dropin-enrichments/
├── [dropin]/
│   ├── functions.json       ← Function descriptions, parameter descriptions
│   ├── containers.json      ← Container descriptions, slot descriptions  
│   ├── events.json          ← Event context, payload details
│   ├── initialization.json  ← Config explanations, intro text
│   ├── overview.json        ← Overview introduction, architecture notes
│   ├── slots.json           ← Slot usage patterns
│   ├── dictionary.json      ← Translation key context
│   └── quick-start.json     ← Setup guidance
```

## What Goes in Enrichments?

### ✅ DO Include (Manual Content):
- Descriptions explaining WHAT and WHY
- "Use to..." or "Use for..." guidance
- Usage context and behavioral explanations
- External links (GitHub, npm, documentation)
- Examples and code snippets
- Best practices

### ❌ DON'T Include (Auto-Extracted from Source):
- Parameter `type` or `required` fields
- Function signatures
- Type definitions
- Event emissions (auto-extracted from `events.emit()`)

## Example Enrichment

```json
{
  "addProductsToCart": {
    "description": "Adds one or more products to the shopping cart. Use to add products when a customer clicks an 'Add to Cart' button.",
    "parameters": {
      "products": {
        "description": "Array of products to add. Each product must include a SKU and quantity."
      }
    },
    "returns": "A promise that resolves to the updated cart data with new items included."
  }
}
```

## Verification Tool

```bash
# Check all dropins
npm run verify-enrichments

# Check specific dropin
npm run verify-enrichments company-management

# Check multiple dropins
npm run verify-enrichments cart checkout order
```

**Exit codes:**
- `0` = All good (or only warnings)
- `1` = Issues found, must fix before regenerating

## Common Issues Detected

- ❌ Missing descriptions
- ❌ Generic/placeholder content ("API function for the drop-in...")
- ❌ Short descriptions (< 50 chars)
- ⚠️  Missing articles (a, an, the)
- ⚠️  Not starting with action verbs (functions/containers)
- ⚠️  Missing punctuation
- ❌ Parameter `type` or `required` in enrichments (should be code-extracted)

## Emergency Recovery

If content was lost during regeneration:

```bash
# 1. Restore files immediately
git restore src/content/docs/dropins-b2b/[dropin]/

# 2. Extract lost content from git history
git show HEAD~1:src/content/docs/dropins-b2b/[dropin]/[file].mdx | less

# 3. Copy descriptions to enrichment files
# Edit: _dropin-enrichments/[dropin]/[type].json

# 4. Commit enrichment fixes
git add _dropin-enrichments/
git commit -m "CRITICAL: Restore lost editorial content to enrichments"

# 5. Regenerate with corrected enrichments
npm run generate-docs -- --dropin [dropin-name]

# 6. Verify again
git diff
```

## See Also

- `ENRICHMENT-PRESERVATION.md` - Complete guide with examples
- `scripts/lib/enrichment.js` - Core enrichment loading system
- `scripts/verify-enrichments.js` - Verification tool source

## Questions?

Always prefer running `npm run verify-enrichments` before regenerating.
When in doubt, check the enrichment files first.
Never trust that "it should work" - always verify with `git diff`.

