# Feature Tables in Drop-in Overview Pages

## Overview

All drop-in overview pages (`index.mdx`) include a **Supported Commerce features** table that lists which Adobe Commerce features the drop-in supports. This table is automatically generated from enrichment JSON files.

## How It Works

### 1. Enrichment File Structure

Create or edit the enrichment file: `_dropin-enrichments/{dropin-name}/overview.json`

```json
{
  "introduction": "Short description of what the drop-in does...",
  "supported_features": [
    {
      "feature": "Feature name here",
      "status": "Supported"
    },
    {
      "feature": "Another feature",
      "status": "Roadmap"
    }
  ],
  "section_topics": {
    "intro": "The topics in this section...",
    "sections": [...]
  }
}
```

### 2. Status Values

The `status` field determines the badge variant and color:

| Status Value | Badge Variant | Appearance | Use Case |
|--------------|---------------|------------|----------|
| `"Supported"` | `tip` | ✅ Green | Feature is fully implemented and production-ready |
| `"Roadmap"` | `caution` | 🔶 Yellow | Feature is planned for future release |
| `"Planned"` | `caution` | 🔶 Yellow | Feature is planned (same as Roadmap) |
| `"Not Supported"` | `danger` | ❌ Red | Feature is not available |
| `"Deprecated"` | `danger` | ❌ Red | Feature is being phased out |
| `"In Progress"` | `note` | 🔄 Blue | Feature is under active development |
| `"Beta"` | `note` | 🔄 Blue | Feature is available but experimental |

### 3. Generated Output

The generator creates a table like this in the MDX file:

```markdown
## Supported Commerce features

The following table provides an overview of the Adobe Commerce features that the Quote Management drop-in supports:

| Feature | Status |
| ------- | ------ |
| Request negotiable quotes | <Badge text="Supported" variant="tip" /> |
| Quote templates | <Badge text="Roadmap" variant="caution" /> |
| Offline quotes | <Badge text="Not Supported" variant="danger" /> |
```

## Usage

### Generate Overview for a Single Drop-in

```bash
node scripts/@generate-overview-docs.js quote-management
```

### Generate All B2B Overviews

```bash
npm run generate-b2b-overviews
```

Or manually:

```bash
node scripts/@generate-overview-docs.js purchase-order
node scripts/@generate-overview-docs.js company-management
node scripts/@generate-overview-docs.js quote-management
node scripts/@generate-overview-docs.js requisition-list
node scripts/@generate-overview-docs.js company-switcher
```

## Examples

### Example 1: B2B Purchase Order

File: `_dropin-enrichments/purchase-order/overview.json`

```json
{
  "supported_features": [
    {
      "feature": "Purchase order creation",
      "status": "Supported"
    },
    {
      "feature": "Purchase order approval rules",
      "status": "Supported"
    },
    {
      "feature": "Multi-level approval workflows",
      "status": "Roadmap"
    }
  ]
}
```

Generates:

| Feature | Status |
|---------|--------|
| Purchase order creation | ✅ Supported |
| Purchase order approval rules | ✅ Supported |
| Multi-level approval workflows | 🔶 Roadmap |

### Example 2: B2C Cart

File: `_dropin-enrichments/cart/overview.json`

```json
{
  "supported_features": [
    {
      "feature": "Shopping cart management",
      "status": "Supported"
    },
    {
      "feature": "Guest checkout",
      "status": "Supported"
    },
    {
      "feature": "Subscription products",
      "status": "In Progress"
    },
    {
      "feature": "Virtual gift cards",
      "status": "Planned"
    }
  ]
}
```

Generates:

| Feature | Status |
|---------|--------|
| Shopping cart management | ✅ Supported |
| Guest checkout | ✅ Supported |
| Subscription products | 🔄 In Progress |
| Virtual gift cards | 🔶 Planned |

## Best Practices

### 1. Feature Naming

- **Be specific**: "Request negotiable quotes" not "Quotes"
- **Use action verbs**: "Create purchase orders" not "Purchase orders"
- **Consistent terminology**: Use the same terms across all drop-ins

### 2. Status Selection

- **Supported**: Only use when the feature is fully implemented, tested, and documented
- **In Progress**: Use when actively developing (remove when complete)
- **Roadmap**: Use for planned features (update regularly)
- **Not Supported**: Only list if customers frequently ask about it

### 3. Feature Organization

Order features by:
1. Core functionality (most important features first)
2. Secondary features
3. Integration features
4. API/Technical features

### 4. Feature Granularity

Strike a balance:
- ✅ **Good**: "Quote lifecycle management", "Quote comments and history"
- ❌ **Too broad**: "Quote management"
- ❌ **Too granular**: "Add comment button on quote", "Edit comment button"

## Verification

After generating the overview, verify:

1. **All features are accurate**: Each "Supported" feature should exist in the codebase
2. **Status is correct**: Don't mark incomplete features as "Supported"
3. **Table renders**: Check the generated MDX file
4. **Badges display**: Preview the page in the documentation site

Use the verification documents:
- `COMPLETE-B2B-PROOF-WITH-SOURCES.md`
- `{DROPIN}-OVERVIEW-VERIFICATION.md`

## Workflow

### Adding a New Feature to a Drop-in

1. **Implement the feature** in the drop-in source code
2. **Document the feature** in functions.mdx, containers/*, etc.
3. **Add to enrichment**:
   ```json
   {
     "feature": "New feature name",
     "status": "Supported"
   }
   ```
4. **Regenerate overview**:
   ```bash
   node scripts/@generate-overview-docs.js {dropin-name}
   ```
5. **Verify** the feature is listed correctly
6. **Commit** both the enrichment JSON and generated MDX

### Updating Feature Status

1. **Edit enrichment file**: Change status from "In Progress" to "Supported"
2. **Regenerate**: Run the generator
3. **Verify**: Check the badge changed color
4. **Commit**: Both files

## Troubleshooting

### Generator Not Finding Enrichment File

**Error**: `No overview.json found`

**Solution**: Create the enrichment file:
```bash
mkdir -p _dropin-enrichments/{dropin-name}
touch _dropin-enrichments/{dropin-name}/overview.json
```

### Table Not Rendering

**Issue**: Table markdown is broken

**Check**:
- Pipe characters `|` are properly escaped in feature names
- No line breaks in feature names
- JSON is valid (use `jq` or JSON validator)

### Wrong Badge Color

**Issue**: All badges are green even though status is "Roadmap"

**Check**:
- Status value exactly matches (case-sensitive): `"Roadmap"` not `"roadmap"`
- Generator is using latest code with `getStatusVariant()` function

## Files Modified

- ✅ `scripts/@generate-overview-docs.js` - Main generator with status variant logic
- ✅ `_dropin-templates/dropin-overview-minimal.mdx` - Template with updated instructions
- ✅ `_dropin-enrichments/{dropin}/overview.json` - Data source for each drop-in

## Related Documentation

- `scripts/README-generate-overview.md` - Overview generator documentation
- `_dropin-enrichments/README.md` - Enrichment file guidelines
- `templates/review-checklist.md` - Review checklist for documentation

