# Merchant Blocks Split Verification Checklist

## Original Commit Details
- **Branch**: `feature/merchant-block-enhancements`
- **Backup Tag**: `merchant-blocks-backup-2025-12-07`
- **Commit SHA**: `2562764b`
- **Patch File**: `merchant-blocks-complete.patch`
- **Total Files Changed**: 84 files
- **Total Changes**: +7,098 insertions, -1,220 deletions

## File Categories and Destinations

### Infrastructure (→ releases/b2b-nov-release)
**Scripts (8 files)**:
- [ ] scripts/@check-for-updates.js (NEW)
- [ ] scripts/@generate-merchant-block-docs.js (MODIFIED)
- [ ] scripts/@generate-merchant-block-docs.js.bak (NEW)
- [ ] scripts/@verify-block-configs-source-code.js (NEW)
- [ ] scripts/@verify-merchant-block-descriptions.js (NEW)

**Enrichments (13 files)**:
- [ ] _dropin-enrichments/merchant-blocks/AUTOMATED-UPDATE-WORKFLOW.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/ENHANCEMENTS-SUMMARY.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/EXPANDED-ENHANCEMENTS-REPORT.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/IMPLEMENTATION-SUMMARY.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/INTEGRATION-CONFIRMATION.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/MERCHANT-INFORMATION-GAPS.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/QUICK-REFERENCE.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/README.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/SYSTEM-DIAGRAM.md (NEW)
- [ ] _dropin-enrichments/merchant-blocks/descriptions.json (NEW)

**Configuration & Sidebar (2 files)**:
- [ ] astro.config.mjs (MODIFIED)
- [ ] package.json (MODIFIED)

**Link Fixes (3 files)**:
- [ ] src/content/docs/get-started/architecture.mdx (MODIFIED)
- [ ] src/content/docs/releases/changelog.mdx (MODIFIED)
- [ ] src/content/docs/releases/index.mdx (MODIFIED)

**Cleanup (3 files)**:
- [ ] src/content/docs/merchants/commerce-blocks/personalization.mdx (DELETED)
- [ ] src/content/docs/merchants/commerce-blocks/product-recommendations.mdx (DELETED)
- [ ] src/content/docs/dropins-b2b/company-switcher/ (MOVED to _drafts/)

**B2C Block Enhancements (33 files)**:
- [ ] src/content/docs/merchants/blocks/commerce-account-header.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-account-sidebar.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-addresses.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-cart.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-checkout.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-confirm-account.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-create-account.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-create-password.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-create-return.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-customer-details.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-customer-information.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-forgot-password.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-gift-options.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-login.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-mini-cart.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-order-cost-summary.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-order-header.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-order-product-list.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-order-returns.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-order-status.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-orders-list.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-return-header.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-returns-list.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-search-order.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-shipping-status.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/commerce-wishlist.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/product-details.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/product-list-page.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/product-recommendations.mdx (MODIFIED)
- [ ] src/content/docs/merchants/blocks/targeted-block.mdx (NEW)
- [ ] src/content/docs/merchants/commerce-blocks/index.mdx (MODIFIED)

**TOTAL INFRASTRUCTURE**: 57 files

---

### Company Management (→ feature/merchant-blocks-company-management)
- [ ] src/content/docs/merchants/blocks/commerce-company-accept-invitation.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-company-create.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-company-credit.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-company-profile.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-company-roles-permissions.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-company-structure.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-company-users.mdx (NEW)

**TOTAL**: 7 files

---

### Purchase Order (→ feature/merchant-blocks-purchase-order)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-approval-flow.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-approval-rule-details.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-approval-rule-form.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-approval-rules-list.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-checkout-success.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-comment-form.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-comments-list.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-company-purchase-orders.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-customer-purchase-orders.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-header.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-history-log.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-require-approval-purchase-orders.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-po-status.mdx (NEW)

**TOTAL**: 13 files

---

### Quote Management (→ feature/merchant-blocks-quote-management)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-negotiable-quote-template.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-negotiable-quote.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-quote-checkout.mdx (NEW)

**TOTAL**: 3 files

---

### Requisition List (→ feature/merchant-blocks-requisition-list)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-requisition-list-view.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-b2b-requisition-list.mdx (NEW)

**TOTAL**: 2 files

---

### Checkout & Account (→ feature/merchant-blocks-checkout-account)
- [ ] src/content/docs/merchants/blocks/commerce-checkout-success.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-account-nav.mdx (NEW)
- [ ] src/content/docs/merchants/blocks/commerce-customer-company.mdx (NEW)

**TOTAL**: 3 files

---

## Verification Steps

### After Infrastructure Commit
- [ ] Verify releases/b2b-nov-release has all 57 infrastructure files
- [ ] Run build and confirm it passes
- [ ] Check git log shows proper commit message
- [ ] Verify total insertions: ~5,000+ lines

### After Each Feature Branch
- [ ] Verify feature branch has correct file count
- [ ] Run build and confirm it passes
- [ ] Check sidebar shows new blocks
- [ ] Verify content matches backup tag

### Final Verification
- [ ] Sum all new branches = 84 total files
- [ ] Compare line counts: should total +7,098 insertions
- [ ] Test patch can be reapplied if needed: `git apply --check merchant-blocks-complete.patch`
- [ ] All 5 PRs created and pointing to releases/b2b-nov-release
- [ ] b2b-documentation preview branch has everything

### Recovery Commands (if needed)
```bash
# Restore from tag
git checkout merchant-blocks-backup-2025-12-07

# Apply patch file
git apply merchant-blocks-complete.patch

# View backup
git show merchant-blocks-backup-2025-12-07
```

## Sign-off
- [ ] All files accounted for
- [ ] All builds passing
- [ ] All PRs created
- [ ] Backup can be deleted

