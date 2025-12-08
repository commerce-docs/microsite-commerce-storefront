# Merchant Block Descriptions - Maintenance Workflow

This directory contains merchant-friendly descriptions for commerce blocks that are used to generate documentation pages.

## Overview

The merchant block documentation system uses a **3-tier priority system** to ensure 100% accuracy:

1. **Priority 1**: Verified enrichment descriptions (from `descriptions.json`)
2. **Priority 2**: Auto-extracted descriptions from README files in the boilerplate repository
3. **Priority 3**: Fallback to generic descriptions

## 🆕 Automated Update Detection

The system now **automatically tracks changes** in the boilerplate repository and warns when enrichment files need review.

**See:** [`AUTOMATED-UPDATE-WORKFLOW.md`](AUTOMATED-UPDATE-WORKFLOW.md) for complete details.

**Quick check for updates:**
```bash
node scripts/@check-for-updates.js
```

Every generation now compares the current boilerplate commit against the last verified commit and shows warnings when changes are detected.

## Files in This Directory

- **`descriptions.json`**: Merchant-friendly descriptions extracted from boilerplate README files
  - Contains descriptions for all commerce blocks
  - Tracks verification status for each block
  - Includes source attribution from README Overview sections
  - Documents corrections and special cases
  - **NEW**: Contains metadata tracking last verified boilerplate commit

- **`README.md`**: This maintenance workflow guide (you are here)

- **`AUTOMATED-UPDATE-WORKFLOW.md`**: Complete guide to automated update detection

- **`QUICK-REFERENCE.md`**: Quick reference card for maintenance tasks

- **`change-report.json`**: Auto-generated report of recent boilerplate changes (when detected)

## Maintenance Workflow

Follow these steps to maintain 100% accuracy of merchant block descriptions:

### Step 1: Run the Verification Script

```bash
node scripts/@verify-merchant-block-descriptions.js
```

This script will:
- Compare enrichment descriptions against README files in the boilerplate repository
- Show verification status for each block
- List blocks that need review
- Display the actual README Overview text for comparison

### Step 2: Review the Output

The script produces a report showing:

```
✅ Verified: 56/58 (97%)
⚠️  Needs Review: 0/58
❌ Missing README/Overview: 2/58
```

For each block, you'll see:
- **📖 README Overview**: First 200 characters from the boilerplate README
- **📝 Enrichment Description**: Current description in `descriptions.json`
- **✓ Status**: ✅ VERIFIED or ⚠️ NEEDS REVIEW

### Step 3: Update Descriptions (If Needed)

If blocks are marked "NEEDS REVIEW":

1. Read the complete README Overview from the boilerplate repository:
   ```
   .temp-repos/boilerplate/blocks/[block-name]/README.md
   ```

2. Update the description in `descriptions.json`:
   ```json
   "block-name": {
     "description": "Your merchant-friendly description here.",
     "verified": true,
     "source": "README: brief note about what the README says"
   }
   ```

3. Make descriptions **merchant-friendly** by:
   - Starting with action verbs (Display, Manage, Provide, Handle, etc.)
   - Removing technical jargon
   - Focusing on what merchants need to know
   - Keeping descriptions concise (under 100 characters when possible)

### Step 4: Set Verified Status

After reviewing and confirming a description is accurate, set:

```json
"verified": true
```

This ensures the generator uses your verified description as Priority 1.

### Step 5: Regenerate Documentation

```bash
node scripts/@generate-merchant-block-docs.js
```

This regenerates all merchant block documentation pages with the updated descriptions.

### Step 6: Verify Generated Pages

Spot-check a few generated pages to confirm descriptions are correct:

```bash
# Example: Check a few blocks
cat src/content/docs/merchants/blocks/commerce-cart.mdx | head -10
cat src/content/docs/merchants/blocks/commerce-b2b-po-status.mdx | head -10
```

## When to Update

Run this maintenance workflow when:

1. **New blocks are added** to the boilerplate repository
2. **Existing blocks change** functionality (check boilerplate release notes)
3. **Boilerplate branch updates** (e.g., when b2b-suite-release1 merges to main)
4. **Before major documentation releases** (quarterly reviews recommended)
5. **When users report inaccurate descriptions**

## Source of Truth

All descriptions are verified against:

- **Repository**: `aem-boilerplate-commerce` (https://github.com/hlxsites/aem-boilerplate-commerce)
- **Branch**: `b2b-suite-release1` (currently - will change when merged to main)
- **Location**: `.temp-repos/boilerplate/blocks/[block-name]/README.md`
- **Section**: `## Overview` (first paragraph)

## Description Guidelines

When writing or updating descriptions:

### Do:
- ✅ Start with action verbs (Display, Manage, Provide, Handle, Create, etc.)
- ✅ Focus on merchant benefits and capabilities
- ✅ Be specific about what the block does
- ✅ Use simple, clear language
- ✅ Keep descriptions under 100 characters when possible
- ✅ Match the actual README functionality

### Don't:
- ❌ Include technical implementation details (dropin names, container names)
- ❌ Use developer jargon or acronyms
- ❌ Make assumptions about functionality
- ❌ Write vague descriptions like "Configure the block"
- ❌ Copy the README verbatim (simplify for merchants)

### Examples:

**Good:**
- "Display a compact cart dropdown with product management and checkout options."
- "Manage product wishlist with authentication and cart integration."
- "Display purchase order status with approval actions and real-time updates."

**Bad:**
- "Configure the cart block for your store." (too vague)
- "The Commerce Cart block renders a comprehensive shopping cart interface using the @dropins/storefront-cart Cart container." (too technical)
- "Set up cart functionality." (not specific enough)

## Special Cases

### Blocks Without README Files

Two blocks may not have README files:
- `product-list-page` - No Overview section in README
- `targeted-block` - No README file exists

For these, use reasonable inference based on block name and purpose, and mark with:

```json
"note": "No README file - using reasonable inference based on block name and purpose"
```

### Blocks With Incorrect Original Descriptions

When you find and correct an error, document it:

```json
"note": "CORRECTED: Was 'old description' - changed to reflect actual functionality"
```

Example: The `gift-options` block was originally described as checkout input, but it's actually read-only display for completed orders.

## Generator Integration

The merchant block documentation generator (`scripts/@generate-merchant-block-docs.js`) automatically:

1. Loads `descriptions.json` on each run
2. Uses verified descriptions (Priority 1)
3. Falls back to README extraction (Priority 2) if not verified
4. Falls back to generic template (Priority 3) if no README

You don't need to manually update the generator - just maintain `descriptions.json`.

## Troubleshooting

### Problem: Generator uses wrong description

**Solution**: Check that `"verified": true` is set in `descriptions.json`. If true, the generator uses that description.

### Problem: Block not found by verification script

**Solution**: Ensure the boilerplate repository is cloned and updated:
```bash
cd .temp-repos/boilerplate
git fetch origin
git checkout b2b-suite-release1
git pull origin b2b-suite-release1
```

### Problem: README has no Overview section

**Solution**: Either:
1. Add an Overview section to the boilerplate README (preferred)
2. Use reasonable inference and document in `descriptions.json` with a note

### Problem: Technical description in generated docs

**Solution**: The description may be auto-extracted from README. Add a verified description to `descriptions.json` to override it.

## Questions?

For questions about merchant block descriptions or this workflow, refer to:
- The verification script: `scripts/@verify-merchant-block-descriptions.js`
- The generator script: `scripts/@generate-merchant-block-docs.js`
- The boilerplate repository: https://github.com/hlxsites/aem-boilerplate-commerce

