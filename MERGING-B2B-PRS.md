# Merging B2B Merchant Block PRs

## Overview

This guide explains how to merge the 5 B2B merchant block feature branch PRs into `releases/b2b-nov-release`.

## The Challenge

Each feature branch adds a few blocks to the sidebar:
- PR #636: Checkout Account (3 blocks)
- PR #637: Quote Management (3 blocks)
- PR #638: Purchase Order (13 blocks)
- PR #639: Company Management (7 blocks)
- PR #640: Requisition List (2 blocks)

When merging, `astro.config.mjs` will have conflicts because each branch adds its blocks to the same location.

## The Solution

**Use the provided helper script** to automatically resolve sidebar conflicts by combining all entries.

## Step-by-Step Process

### For Each PR (repeat 5 times):

1. **Merge the PR on GitHub** or locally:
   ```bash
   git checkout releases/b2b-nov-release
   git merge feature/merchant-blocks-purchase-order
   ```

2. **Conflict appears in `astro.config.mjs`** (expected):
   ```
   CONFLICT (content): Merge conflict in astro.config.mjs
   Automatic merge failed; fix conflicts and then commit the result.
   ```

3. **Run the helper script**:
   ```bash
   node merge-b2b-sidebar.js
   ```

4. **Review the automatic resolution**:
   ```bash
   git diff astro.config.mjs
   ```

5. **Complete the merge**:
   ```bash
   git add astro.config.mjs
   git commit --no-edit
   git push origin releases/b2b-nov-release
   ```

### The Script Does This Automatically:

✅ Extracts ALL B2B blocks from both sides of the conflict  
✅ Removes duplicates  
✅ Organizes by category (Account, Company, PO, Quote, Requisition)  
✅ Resolves conflict markers  
✅ Writes clean, organized sidebar  

## Recommended Merge Order

Merge PRs from largest to smallest to minimize conflicts:

1. **First**: PR #638 (Purchase Order - 13 blocks)
2. **Second**: PR #639 (Company Management - 7 blocks)
3. **Third**: PR #636 (Checkout Account - 3 blocks)
4. **Fourth**: PR #637 (Quote Management - 3 blocks)
5. **Last**: PR #640 (Requisition List - 2 blocks)

## What If Something Goes Wrong?

### Manual Resolution

If the script fails, manually resolve the conflict:

1. Open `astro.config.mjs`
2. Find the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Keep ALL B2B block entries from BOTH sides
4. Remove conflict markers
5. Organize alphabetically or by category
6. Save and commit

### Verify After Each Merge

```bash
# Count B2B blocks in sidebar
grep -c "commerce-b2b-\|commerce-company-\|commerce-customer-company\|commerce-account-nav\|commerce-checkout-success" astro.config.mjs

# Should increase with each merge:
# After PR 1: 13 blocks
# After PR 2: 20 blocks
# After PR 3: 23 blocks
# After PR 4: 26 blocks
# After PR 5: 28 blocks (complete!)
```

## Final Verification

After all 5 PRs are merged:

```bash
# Should have all 28 B2B blocks
ls src/content/docs/merchants/blocks/commerce-b2b-*.mdx src/content/docs/merchants/blocks/commerce-company-*.mdx src/content/docs/merchants/blocks/commerce-customer-company.mdx src/content/docs/merchants/blocks/commerce-account-nav.mdx src/content/docs/merchants/blocks/commerce-checkout-success.mdx | wc -l

# Should show: 28
```

## Why This Approach?

✅ **Base branch stays stable** - No broken builds during the process  
✅ **Each PR independently reviewable** - Teams review their specific blocks  
✅ **Predictable conflicts** - Always in the same place  
✅ **Automated resolution** - Helper script does the work  
✅ **No risk to developer docs** - They continue working throughout  

## Need Help?

If you encounter issues with the merge helper script, you can always:
1. Abort the merge: `git merge --abort`
2. Manually resolve conflicts in `astro.config.mjs`
3. Or ask for assistance

