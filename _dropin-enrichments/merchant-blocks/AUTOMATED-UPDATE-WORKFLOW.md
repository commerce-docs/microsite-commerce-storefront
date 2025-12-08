# Automated Update Detection Workflow

## Overview

The merchant block documentation system now automatically tracks changes in the boilerplate repository and warns when enrichment files need review.

## How It Works

### 1. **Commit Hash Tracking**

The enrichment file (`descriptions.json`) stores metadata about the last verification:

```json
{
  "metadata": {
    "last_verified_commit": "8e45ef4df347aef8fe89ac6e626e4d0222df319c",
    "last_verified_date": "2025-12-07",
    "boilerplate_branch": "b2b-suite-release1",
    "total_blocks": 57,
    "verified_blocks": 56,
    "verification_method": "source-code-first"
  }
}
```

### 2. **Automatic Change Detection**

Every time you run the generator, it:
1. Compares current boilerplate commit vs. last verified commit
2. Identifies which files changed (source code vs README)
3. Warns if updates are needed
4. Continues with generation using current enrichments
5. Updates metadata after successful generation

### 3. **Separate Changes Tracked**

The system tracks three types of changes:

| Change Type | Impact | Priority | Verification Required |
|-------------|--------|----------|----------------------|
| **Source code (.js)** | Configuration changes | HIGH | Run config verification |
| **README files** | Description changes | MEDIUM | Run description verification |
| **Other files** | Likely no impact | LOW | Optional review |

## Workflow Commands

### Check for Updates (Standalone)

```bash
node scripts/@check-for-updates.js
```

**Output when no changes:**
```
✅ NO CHANGES DETECTED
   Enrichment files are up-to-date
   No action required
```

**Output when changes found:**
```
⚠️  CHANGES DETECTED

📊 Change Summary:
   Commits behind: 5
   Source code changes: 3
   README changes: 2
   Other changes: 12

📝 SOURCE CODE CHANGES:
   • commerce-cart
   • commerce-mini-cart
   • commerce-company-credit

📖 README CHANGES:
   • commerce-addresses
   • commerce-wishlist

💡 RECOMMENDED ACTIONS:
1. [HIGH] Verify configurations against source code
   Reason: Source code changes may add/remove/modify configurations
   Command: node scripts/@verify-block-configs-source-code.js

2. [MEDIUM] Review description changes
   Reason: README Overview changes may require description updates
   Command: node scripts/@verify-merchant-block-descriptions.js
```

### Integrated with Generation

The generator automatically checks for updates:

```bash
node scripts/@generate-merchant-block-docs.js
```

**With changes detected:**
```
⚠️  CHANGES DETECTED - Review recommended before generation

   📝 Source code changes may affect configurations
   📖 README changes may affect descriptions

   💡 Run verification after generation:
      node scripts/@verify-block-configs-source-code.js
      node scripts/@verify-merchant-block-descriptions.js

   ⚠️  Continuing with generation using current enrichments...
```

**Without changes:**
```
✅ No changes detected since last verification (2025-12-07)
```

## Complete Update Workflow

### When Changes Are Detected:

```bash
# Step 1: Check what changed
node scripts/@check-for-updates.js

# Step 2: Verify configurations (if source code changed)
node scripts/@verify-block-configs-source-code.js

# Step 3: Verify descriptions (if README changed)
node scripts/@verify-merchant-block-descriptions.js

# Step 4: Update enrichment file if needed
nano _dropin-enrichments/merchant-blocks/descriptions.json

# Step 5: Regenerate documentation
node scripts/@generate-merchant-block-docs.js

# Step 6: Spot-check generated pages
cat src/content/docs/merchants/blocks/commerce-cart.mdx | head -20
```

### When No Changes Detected:

```bash
# Just regenerate (will skip change warnings)
node scripts/@generate-merchant-block-docs.js
```

## What Gets Updated Automatically

### ✅ Automatically Updated:
- **Metadata commit hash** - Updated after every successful generation
- **Metadata date** - Updated after every successful generation
- **Total blocks count** - Counted from actual blocks directory
- **Verified blocks count** - Counted from enrichment entries

### ⚠️ Requires Manual Review:
- **Block descriptions** - Review README Overview changes
- **Configuration descriptions** - Review README config table changes
- **New blocks** - Add descriptions to enrichment file
- **Removed blocks** - Remove from enrichment file (or mark as deprecated)

## Change Detection Logic

### Source Code Changes Detected When:
- Any `.js` file in `blocks/commerce-*` changed
- May indicate new/removed/modified configurations
- **Action**: Run `@verify-block-configs-source-code.js`

### README Changes Detected When:
- Any `README.md` file in `blocks/commerce-*` changed
- May indicate description or configuration documentation updates
- **Action**: Run `@verify-merchant-block-descriptions.js`

### Both Changed:
- Run both verification scripts
- Review in order: configs first, then descriptions

## Example Scenarios

### Scenario 1: Source Code Added New Config

```
⚠️  CHANGES DETECTED
   📝 Source code changes: commerce-cart

Action:
1. Run: node scripts/@verify-block-configs-source-code.js
2. Review output: "In source but NOT in README: new-config"
3. Source code is truth - description will say "No description available"
4. Optionally: Add description to README (upstream)
5. Optionally: Add override to enrichment file (local)
6. Regenerate: node scripts/@generate-merchant-block-docs.js
```

### Scenario 2: README Description Changed

```
⚠️  CHANGES DETECTED
   📖 README changes: commerce-addresses

Action:
1. Run: node scripts/@verify-merchant-block-descriptions.js
2. Review new README Overview
3. Update descriptions.json if merchant description needs updating
4. Set "verified": true
5. Regenerate: node scripts/@generate-merchant-block-docs.js
```

### Scenario 3: New Block Added

```
⚠️  CHANGES DETECTED
   📝 Source code changes: commerce-new-feature

Action:
1. Verify configurations: node scripts/@verify-block-configs-source-code.js
2. Add to descriptions.json:
   "new-feature": {
     "description": "Merchant-friendly description here",
     "verified": true,
     "source": "README: ..."
   }
3. Regenerate: node scripts/@generate-merchant-block-docs.js
```

## Metadata Auto-Update

After successful generation, metadata automatically updates:

**Before:**
```json
{
  "metadata": {
    "last_verified_commit": "abc123def",
    "last_verified_date": "2025-12-01"
  }
}
```

**After:**
```json
{
  "metadata": {
    "last_verified_commit": "8e45ef4df347aef8fe89ac6e626e4d0222df319c",
    "last_verified_date": "2025-12-07"
  }
}
```

## Git Integration

The system relies on git for versioning:

- **Enrichment file changes**: Committed to your repository
- **Metadata updates**: Committed with each generation
- **Change detection**: Uses git diff between commits
- **History**: Review `git log descriptions.json` to see verification history

## Safety Features

### ✅ Generator Never Fails
- Warnings are shown but generation continues
- Uses current enrichments even if outdated
- Better to have slightly stale docs than no docs

### ✅ Source Code is Truth
- Configurations always come from `.js` files
- README errors don't affect configuration accuracy
- Only descriptions may be stale

### ✅ Manual Control
- Changes require manual review (Option B)
- You decide when to update enrichments
- No automatic overwrites

## Quick Commands

```bash
# Check for updates
node scripts/@check-for-updates.js

# Verify everything
node scripts/@verify-block-configs-source-code.js
node scripts/@verify-merchant-block-descriptions.js

# Generate docs (with auto-update check)
node scripts/@generate-merchant-block-docs.js
```

## Files Modified

| File | Purpose | Auto-Updated |
|------|---------|--------------|
| `descriptions.json` | Block descriptions | Metadata only |
| `change-report.json` | Latest change report | Yes (by update checker) |
| Generated `.mdx` files | Merchant documentation | Yes (every generation) |

---

**This workflow ensures enrichment files stay current while maintaining manual control over changes.**

