# Drop-in Source Repository Issues

This document tracks issues found in drop-in source repositories that need to be fixed by the respective drop-in teams. These issues were discovered during documentation generation.

## Issue Types

- **Missing Type Definitions**: Events that are emitted in code but not declared in TypeScript type definitions
- **Incomplete Type Definitions**: Events with partial or incorrect type declarations
- **Undocumented Events**: Events emitted in code without any documentation

---

## Cart Drop-in Issues

**Repository:** `@dropins/storefront-cart`  
**Version Checked:** 1.5.1  
**Source File:** `src/types/events.d.ts`

### 1. Missing Type Definition for `cart/data` Event

**Issue:** The `cart/data` event is emitted in the source code but is not declared in the TypeScript event type definitions.

**Evidence:**
- **Emitted in:** `src/api/initializeCart/initializeCart.ts` (line ~XX)
  ```typescript
  events.emit('cart/data', payload);
  ```
- **Emitted in:** `src/api/updateProductsFromCart/updateProductsFromCart.ts`
  ```typescript
  events.emit('cart/data', payload);
  ```
- **Listened to in:** `src/api/initialize/initialize.ts`
  ```typescript
  events.on('cart/data', (payload) => { ... });
  ```

**Inferred Type:** Based on implementation analysis, the payload is `CartModel | null`

**Required Fix:**
Add to `src/types/events.d.ts`:
```typescript
declare module '@adobe-commerce/event-bus' {
  interface Events {
    'cart/data': CartModel | null;  // Add this line
    'cart/initialized': CartModel | null;
    'cart/updated': CartModel | null;
    // ... rest of events
  }
}
```

**Impact:**
- TypeScript consumers cannot get proper type checking for this event
- IDE autocomplete doesn't work for this event
- Documentation generators cannot extract the type automatically

**Workaround:**
Documented in enrichment file with manual type inference from source code.

---

## Checkout Drop-in Issues

**Repository:** `@dropins/storefront-checkout`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## Order Drop-in Issues

**Repository:** `@dropins/storefront-order`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## Product Details Drop-in Issues

**Repository:** `@dropins/storefront-product-details`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## Product Discovery Drop-in Issues

**Repository:** `@dropins/storefront-product-discovery`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## Recommendations Drop-in Issues

**Repository:** `@dropins/storefront-recommendations`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## User Account Drop-in Issues

**Repository:** `@dropins/storefront-user-account`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## User Auth Drop-in Issues

**Repository:** `@dropins/storefront-user-auth`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## Wishlist Drop-in Issues

**Repository:** `@dropins/storefront-wishlist`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## Payment Services Drop-in Issues

**Repository:** `@dropins/storefront-payment-services`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## Personalization Drop-in Issues

**Repository:** `@dropins/storefront-personalization`  
**Version Checked:** [version]  
**Status:** ⏳ Pending investigation

---

## How to Use This Document

### For Documentation Team
- When an event shows "This event's payload structure is not documented in the source code", check if it's emitted in the code
- If it is emitted but not typed, add an entry here with evidence
- Document the inferred type in the enrichment file with a note

### For Drop-in Teams
- Review the issues listed for your drop-in
- Add the missing type definitions to `src/types/events.d.ts`
- Test that TypeScript compilation still works
- Submit a PR with the fix
- Notify the documentation team when fixed

### For QA/Testing
- After a drop-in version update, verify if reported issues are fixed
- Update this document with the fix status
- Regenerate documentation to verify types are now auto-extracted

---

## Investigation Script

To find similar issues in other drop-ins, run:

```bash
# Find all emitted events
grep -r "events.emit" .temp-repos/{dropin}/src --include="*.ts" | grep -v test | grep -v ".d.ts"

# Find all typed events
grep -A 50 "interface Events" .temp-repos/{dropin}/src/types/events.d.ts

# Compare to find missing types
```

---

**Last Updated:** October 30, 2025  
**Maintained By:** Documentation Team  
**Contact:** [Add contact info]

