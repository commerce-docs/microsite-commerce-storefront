# Generator Bug Registry

This file tracks bugs found in documentation generators, their fixes, and any manual work required across branches.

## Active Bugs

*None currently - all known bugs have been fixed.*

## Resolved Bugs

### [BUG-001] Installation generator doesn't update sidebar
- **Status**: FIXED
- **Date Found**: 2025-11-09
- **Date Fixed**: 2025-11-09
- **Affected Generators**: `@generate-installation-docs.js`
- **Root Cause**: `updateSidebarForInstallation()` in `scripts/lib/sidebar.js` passed `null` as the reference label, causing `insertSidebarEntry()` to skip insertion silently
- **Fix**: Updated `scripts/lib/sidebar.js` line 142 to pass `'Overview'` instead of `null`
- **Branches Affected**: 
  - `merchant-documentation` (needs manual sidebar fixes)
  - `merchant-documentation-gaps` (sidebar fixes applied)
  - `develop` (needs verification)
- **Manual Fix Required**: 
  - Add missing sidebar entries to `astro.config.mjs`:
    - Order → Installation
    - Personalization → Installation, Events, Dictionary
    - User Account → Installation
  - Fix container sidebar entries:
    - Cart Containers → MiniCart (fix typo: `minicart` → `mini-cart`)
    - Order Containers → OrderHeader, OrderStatus
    - Product Details Containers → ProductDetails, ProductGiftCardOptions (fix typo: `product-giftcard-options` → `product-gift-card-options`)
- **Prevention**: 
  - ✅ Added sidebar validation script (`scripts/validate-sidebar-updates.js`)
  - ✅ Integrated validation into test suite
  - ✅ Documented in workflow improvements
- **Verification**: Run `npm run validate:sidebar /dropins/order/installation/` to verify fix

## Prevention Checklist

When fixing generator bugs:
- [ ] Fix the root cause in shared library (`scripts/lib/`)
- [ ] Document the bug in this registry
- [ ] Add test case to prevent regression
- [ ] List all affected branches
- [ ] Create checklist for manual fixes needed
- [ ] Update all affected branches
- [ ] Verify fix with validation script
- [ ] Update test suite if needed

## Bug Severity Levels

- **CRITICAL**: Breaks builds, affects all branches
- **HIGH**: Breaks builds, affects specific branches
- **MEDIUM**: Causes incorrect output, doesn't break builds
- **LOW**: Minor issues, cosmetic problems

## How to Report a Bug

1. Create a new entry in "Active Bugs" section
2. Include:
   - Bug ID (auto-increment from last bug)
   - Status (ACTIVE/FIXED)
   - Date found/fixed
   - Affected generators
   - Root cause analysis
   - Fix details
   - Affected branches
   - Manual fixes required
   - Prevention measures

