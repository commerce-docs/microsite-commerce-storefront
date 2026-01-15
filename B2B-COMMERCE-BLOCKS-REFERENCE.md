# B2B Commerce Blocks Reference

This document provides the definitive reference for identifying and verifying B2B commerce blocks across all branches.

## Block Counts

- **B2C Commerce blocks**: 24 files
- **B2B Commerce blocks**: 30 files
- **Total Commerce blocks**: 54 files

## File Locations

All commerce block documentation files are located in:
```
src/content/docs/merchants/blocks/
```

## B2B Block Identification Patterns

B2B commerce blocks follow these naming patterns:

### 1. Purchase Order blocks (18 files)
Prefix: `commerce-b2b-po-*` and `commerce-b2b-negotiable-quote*` and related
- `commerce-b2b-negotiable-quote.mdx`
- `commerce-b2b-negotiable-quote-template.mdx`
- `commerce-b2b-po-approval-flow.mdx`
- `commerce-b2b-po-approval-rule-details.mdx`
- `commerce-b2b-po-approval-rule-form.mdx`
- `commerce-b2b-po-approval-rules-list.mdx`
- `commerce-b2b-po-checkout-success.mdx`
- `commerce-b2b-po-comment-form.mdx`
- `commerce-b2b-po-comments-list.mdx`
- `commerce-b2b-po-company-purchase-orders.mdx`
- `commerce-b2b-po-customer-purchase-orders.mdx`
- `commerce-b2b-po-header.mdx`
- `commerce-b2b-po-history-log.mdx`
- `commerce-b2b-po-require-approval-purchase-orders.mdx`
- `commerce-b2b-po-status.mdx`
- `commerce-b2b-quote-checkout.mdx`
- `commerce-b2b-requisition-list.mdx`
- `commerce-b2b-requisition-list-view.mdx`

### 2. Company Management blocks (7 files)
Prefix: `commerce-company-*`
- `commerce-company-accept-invitation.mdx`
- `commerce-company-create.mdx`
- `commerce-company-credit.mdx`
- `commerce-company-profile.mdx`
- `commerce-company-roles-permissions.mdx`
- `commerce-company-structure.mdx`
- `commerce-company-users.mdx`

### 3. Customer Company blocks (1 file)
- `commerce-customer-company.mdx`

### 4. Shared B2B blocks (4 files)
These blocks are used by both B2B and B2C contexts but documented as B2B:
- `commerce-account-header.mdx`
- `commerce-account-nav.mdx`
- `commerce-account-sidebar.mdx`
- `commerce-checkout-success.mdx`

## Verification Commands

### Count all B2B commerce blocks
```bash
ls -1 src/content/docs/merchants/blocks/ | \
  grep -E "commerce-b2b-|commerce-company-|commerce-customer-company|commerce-checkout-success|commerce-account-header|commerce-account-nav|commerce-account-sidebar" | \
  wc -l
```
Expected output: `30`

### List all B2B commerce blocks (sorted)
```bash
ls -1 src/content/docs/merchants/blocks/ | \
  grep -E "commerce-b2b-|commerce-company-|commerce-customer-company|commerce-checkout-success|commerce-account-header|commerce-account-nav|commerce-account-sidebar" | \
  sed 's/.mdx$//' | sort
```

### Count all B2C commerce blocks
```bash
ls -1 src/content/docs/merchants/blocks/*.mdx | \
  grep -v "commerce-b2b-\|commerce-company-\|commerce-customer-company\|commerce-checkout-success\|commerce-account-header\|commerce-account-nav\|commerce-account-sidebar" | \
  wc -l
```
Expected output: `24`

### Verify sidebar matches files
```bash
# Extract B2B blocks from sidebar
sed -n '/label: .B2B Commerce blocks.,$/,/^        },$/p' astro.sidebar.mjs | \
  grep "link: '/merchants/blocks/" | \
  sed "s/.*'\/merchants\/blocks\/\(.*\)\/'.*/\1/" | \
  sort > /tmp/sidebar-b2b.txt

# List B2B files
ls -1 src/content/docs/merchants/blocks/ | \
  grep -E "commerce-b2b-|commerce-company-|commerce-customer-company|commerce-checkout-success|commerce-account-header|commerce-account-nav|commerce-account-sidebar" | \
  sed 's/.mdx$//' | sort > /tmp/files-b2b.txt

# Compare
diff /tmp/sidebar-b2b.txt /tmp/files-b2b.txt
```
Expected output: No differences (empty output)

## Sidebar Structure

The B2B commerce blocks are organized in `astro.sidebar.mjs` under:
```
Merchants
  └── B2B Commerce blocks (collapsed)
      ├── Account Header
      ├── Account Nav
      ├── Account Sidebar
      ├── Checkout Success
      ├── Company Accept Invitation
      ├── Company Create
      ├── Company Credit
      ├── Company Profile
      ├── Company Roles & Permissions
      ├── Company Structure
      ├── Company Users
      ├── Customer Company
      ├── Negotiable Quote
      ├── Negotiable Quote Template
      ├── Purchase Order Approval Flow
      ├── Purchase Order Approval Rule Details
      ├── Purchase Order Approval Rule Form
      ├── Purchase Order Approval Rules List
      ├── Purchase Order Checkout Success
      ├── Purchase Order Comment Form
      ├── Purchase Order Comments List
      ├── Purchase Order Company List
      ├── Purchase Order Customer List
      ├── Purchase Order Header
      ├── Purchase Order History Log
      ├── Purchase Order Require Approval List
      ├── Purchase Order Status
      ├── Quote Checkout
      ├── Requisition List
      └── Requisition List View
```

## Branch Consistency

These 30 B2B commerce blocks must be present and correctly linked in the sidebar across all B2B branches:

### Release Branches
- `releases/b2b-nov-release`
- `releases/b2b-infrastructure`
- `releases/b2b-docs-only`

### Feature Branches
- `b2b-docs-company-management-v2`
- `b2b-docs-company-switcher-v2`
- `b2b-docs-purchase-order` (merged to release)
- `b2b-docs-quote-management-v2`
- `b2b-docs-requisition-list-v3`

### Preview Branch
- `b2b-preview` (GitHub Pages deployment)

## Common Issues and Solutions

### Issue: Missing blocks in sidebar
**Symptom**: Build fails with "Failed to find the topic for" errors  
**Solution**: Verify all 30 blocks are listed in the "B2B Commerce blocks" section of `astro.sidebar.mjs`

### Issue: Incorrect block count
**Symptom**: Verification commands show count ≠ 30  
**Solution**: Run the verification commands above to identify missing or extra files

### Issue: Orphaned block pages
**Symptom**: Build fails with "Failed to find the topic" for a specific block  
**Solution**: Either add the block to the sidebar or delete the file if it shouldn't exist

### Issue: Invalid links to blocks
**Symptom**: Build fails with "invalid links" errors  
**Solution**: Ensure all sidebar links follow the pattern `/merchants/blocks/[block-name]/`

## Regeneration Workflow

When regenerating documentation for B2B branches:

1. **Verify B2B blocks are present**:
   ```bash
   ls -1 src/content/docs/merchants/blocks/ | grep -E "commerce-b2b-|commerce-company-|commerce-customer-company|commerce-checkout-success|commerce-account-header|commerce-account-nav|commerce-account-sidebar" | wc -l
   ```
   Should return: `30`

2. **Verify sidebar entries**:
   ```bash
   sed -n '/label: .B2B Commerce blocks.,$/,/^        },$/p' astro.sidebar.mjs | grep "label:" | grep -v "B2B Commerce blocks" | wc -l
   ```
   Should return: `30`

3. **Run build test**:
   ```bash
   pnpm run build:prod-fast
   ```
   Should complete with zero errors.

## Architecture Notes

### Why These Patterns?

The B2B block identification patterns are based on:
1. **Source repository structure**: Blocks are organized by feature area (Purchase Order, Company Management, etc.)
2. **Naming conventions**: Adobe Commerce uses prefixes to indicate feature scope
3. **Historical context**: Some blocks (`commerce-account-*`, `commerce-checkout-success`) are shared between B2B and B2C but documented in the B2B section

### B2B vs B2C Separation

- **B2C blocks** (24): Core commerce functionality for all customers
- **B2B blocks** (30): Business-specific features (Purchase Orders, Company Management, Requisition Lists)
- **Sidebar separation**: Two distinct sections prevent confusion and improve navigation

### File Restoration

The 30 B2B commerce blocks were restored from git history (`45dd67bb~1`) on 2024-12-19 after being inadvertently removed during a merge from the `develop` branch. The restoration ensures:
- Complete B2B feature documentation
- Proper sidebar navigation structure
- Zero build errors on `b2b-preview` branch
- Consistent documentation across all B2B branches

## Last Verified

- **Date**: 2024-12-19
- **Branch**: `b2b-preview`
- **Files**: 30 B2B blocks present and correctly linked
- **Build**: Passed with zero errors
- **Command**: `pnpm run build:prod-fast`

## Related Documentation

- `B2B-SIDEBAR-AND-BLOCKS-FIXED.md` - Complete fix documentation
- `B2B-PREVIEW-WORKFLOW.md` - Branch workflow and merge strategy
- `B2B-WORKFLOW-GUIDE.md` - Overall B2B documentation workflow
- `astro.sidebar.mjs` - Sidebar configuration (lines 723-757)

