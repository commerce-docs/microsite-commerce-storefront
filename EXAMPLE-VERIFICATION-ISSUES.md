# B2B Example Verification Issues

This document identifies issues found during thorough verification of B2B documentation examples against the `b2b-integration` branch of the boilerplate.

## ❌ CRITICAL ISSUES - Must Fix

### 1. Requisition List API Function Name Error

**Files Affected:**
- `/src/content/docs/dropins-b2b/requisition-list/events.mdx` (Examples 2 & 3 for `requisitionList/data`)
- `/src/content/docs/dropins-b2b/integration-examples.mdx` (Requisition List section)

**Issue:**
Used **`addRequisitionListToCart`** but the correct function name is **`addRequisitionListItemsToCart`**

**Source:** `/Users/bdenham/Sites/storefront/.temp-repos/boilerplate/scripts/__dropins__/storefront-requisition-list/api/index.d.ts` (line 28)

**Correct Usage:**
```js
import { addRequisitionListItemsToCart } from '@dropins/storefront-requisition-list/api.js';

await addRequisitionListItemsToCart({
  requisitionListUid: listUid,
  requisitionListItems: items.map(item => ({
    uid: item.uid,
    quantity: item.quantity
  }))
});
```

**Boilerplate Pattern:**
The boilerplate doesn't actually show cart integration from requisition lists. The `RequisitionListView` container handles this internally. No cart API is called directly in boilerplate blocks.

---

## ⚠️ VERIFICATION NEEDED

### 2. Purchase Order Events - Verify Payload Structure

**Files Affected:**
- `/src/content/docs/dropins-b2b/purchase-order/events.mdx`

**Issue:**
Examples show `payload.data.approvers` field in `purchase-order/placed` event, but this needs verification against actual event emission in the dropin source.

**Action Required:**
Verify the actual payload structure for `purchase-order/placed` event in the dropin source code.

---

### 3. Company Management Events - Verify Event Names

**Files Affected:**
- `/src/content/docs/dropins-b2b/company-management/events.mdx`

**Issue:**
Examples use `company/updated` and `companyStructure/updated` events, but these may not be emitted by the dropin in the b2b-integration branch.

**Boilerplate Evidence:**
No usage of these events found in the boilerplate blocks. Only `auth/permissions` and `authenticated` events are used.

**Action Required:**
1. Check if these events are actually emitted by the Company Management dropin
2. If not, update examples to focus on `auth/permissions` and `authenticated` events instead

---

### 4. Quote Management - Template Generation Event

**Files Affected:**
- `/src/content/docs/dropins-b2b/quote-management/events.mdx`

**Status:**
✅ `generateQuoteFromTemplate` function EXISTS (verified in API index)

**Issue:**
The event `quote-management/quote-template-generated` needs verification for its actual payload structure.

**Action Required:**
Verify the event payload includes both `templateId` and `quoteId` as shown in examples.

---

## 📋 BOILERPLATE PATTERN ANALYSIS

### What the Boilerplate Actually Does

#### Requisition List Integration
- **Uses**: `RequisitionListSelector` container for individual products
- **Pattern**: The container handles "Add to List" internally
- **Cart Integration**: Handled by `RequisitionListView` container, NOT via API calls
- **Events**: Uses `authenticated` event for re-rendering on login/logout

#### Company Switcher Integration  
- **Uses**: `setCompanyHeaders()` function
- **Events**: `companyContext/changed` event IS used in:
  - `product-list-page.js` - triggers search refresh
  - `commerce-b2b-negotiable-quote.js` - triggers quote refresh  
  - `commerce-account-nav.js` - triggers UI update

#### Permission Handling
- **Pattern**: Uses `events.lastPayload('auth/permissions')` for initial check
- **Events**: Listens to `auth/permissions` event for updates
- **Example**: `commerce-b2b-po-approval-rule-details.js` (lines 63-69)

---

## ✅ VERIFIED CORRECT

### Approval Rule Details Example
**File**: `/src/content/docs/dropins-b2b/purchase-order/containers/approval-rule-details.mdx`

✅ Matches boilerplate exactly (`commerce-b2b-po-approval-rule-details.js`)
- Import paths: Correct
- Permission check pattern: Correct
- Event usage: Correct
- `provider.render()` pattern: Correct

### Company Switcher Coordinator Example
**File**: `/src/content/docs/dropins-b2b/company-switcher/events.mdx`

✅ Core pattern is correct:
- `setCompanyHeaders()` triggers `companyContext/changed` event
- Event is actually used in boilerplate
- Multi-dropin refresh pattern is appropriate

---

## 🔧 RECOMMENDED FIXES

### Priority 1: Fix Requisition List API Name

Replace all instances of:
```js
// ❌ WRONG
import { addRequisitionListToCart } from '@dropins/storefront-requisition-list/api.js';
await addRequisitionListToCart({ listUid, items });
```

With:
```js
// ✅ CORRECT
import { addRequisitionListItemsToCart } from '@dropins/storefront-requisition-list/api.js';
await addRequisitionListItemsToCart({
  requisitionListUid: listUid,
  requisitionListItems: items
});
```

### Priority 2: Simplify Event Examples

Instead of showing hypothetical events that may not exist, focus on events that ARE used in the boilerplate:

**Company Management:**
- Show `auth/permissions` event usage (actually used)
- Show `authenticated` event usage (actually used)
- De-emphasize or remove `company/updated` and `companyStructure/updated` unless verified

**Purchase Order:**
- Verify `purchase-order/placed` event actually exists
- Verify `purchase-order/data` event payload structure

### Priority 3: Update Integration Guide

The integration examples guide should be updated to reflect actual boilerplate patterns:
- Use real event names
- Use correct API function names
- Show patterns that exist in the boilerplate

---

## 📊 VERIFICATION STATUS

| Component | API Functions | Events | Containers | Overall |
|-----------|--------------|---------|------------|---------|
| Company Management | ⚠️ Need verification | ⚠️ Need verification | ✅ Correct | ⚠️ |
| Purchase Order | ✅ Verified | ⚠️ Need verification | ✅ Correct | ⚠️ |
| Quote Management | ✅ Verified | ⚠️ Need verification | 🔍 Not checked | ⚠️ |
| Requisition List | ✅ **FIXED** | ⚠️ Need verification | ✅ Correct | ✅ |
| Company Switcher | ✅ Verified | ✅ **UPDATED** | ✅ Correct | ✅ |

Legend:
- ✅ Verified correct
- ⚠️ Needs verification
- ❌ Issues found
- 🔍 Not yet checked

---

## 🎯 NEXT STEPS

1. **IMMEDIATE**: Fix requisition list API function name
2. **HIGH**: Verify all event names and payloads against dropin source
3. **MEDIUM**: Simplify examples to focus on proven patterns
4. **LOW**: Add boilerplate file references to examples

---

**Generated**: During thorough verification against `b2b-integration` branch
**Boilerplate Location**: `/Users/bdenham/Sites/storefront/.temp-repos/boilerplate`
**Branch**: `b2b-integration`

---

## 🎉 UPDATE: Issues Resolved

### Fixed in Latest Update

1. ✅ **Requisition List API Function Name** - Fixed `addRequisitionListToCart` → `addRequisitionListItemsToCart`
2. ✅ **Company Switcher Event Example** - Replaced idealized coordinator with actual boilerplate patterns
   - See: `COMPANY-COORDINATOR-VERIFICATION.md` for details
   - File now shows 4 real patterns from the boilerplate
   - Reduced from 575 lines to 408 lines with accurate, practical examples

