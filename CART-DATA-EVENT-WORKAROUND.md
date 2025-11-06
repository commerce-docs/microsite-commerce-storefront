# Cart `cart/data` Event - Documentation Workaround

## Issue Summary

The `cart/data` event is emitted in the Cart drop-in source code but its TypeScript type definition is missing from `src/types/events.d.ts`.

## Current State

### In Generated Documentation

**Location:** `/dropins/cart/events`

**Description:**
> Emitted when cart data is available or changes. This event is triggered during cart initialization and updates to provide the current cart state. **Note:** The TypeScript type definition for this event is missing from `events.d.ts` in the source repository. Based on implementation analysis, this event emits `CartModel | null`. See [`CartModel`](#cartmodel) in the Data Models section for the complete structure.

**Payload Section:**
> This event's payload structure is not documented in the source code.

## What We Did

### 1. Enrichment File Update

**File:** `_dropin-enrichments/cart/events.json`

Added enrichment for `cart/data` event:
```json
{
  "cart/data": {
    "description": "Emitted when cart data is available or changes. This event is triggered during cart initialization and updates to provide the current cart state. **Note:** The TypeScript type definition for this event is missing from `events.d.ts` in the source repository. Based on implementation analysis, this event emits `CartModel | null`. See [`CartModel`](#cartmodel) in the Data Models section for the complete structure."
  }
}
```

### 2. Source Issue Tracking

**File:** `DROPIN-SOURCE-ISSUES.md`

Created a comprehensive tracking document for reporting to drop-in teams with:
- Detailed evidence of the issue
- Code locations where the event is emitted and listened to
- Inferred type based on implementation
- Required fix with code example
- Impact assessment

## Evidence from Source Code

### Emitted In:
1. `src/api/initializeCart/initializeCart.ts`:
   ```typescript
   const payload = state.authenticated
     ? await getCustomerCartPayload()
     : await getGuestCartPayload();
   
   events.emit('cart/initialized', payload);
   events.emit('cart/data', payload);  // Same payload as cart/initialized
   ```

2. `src/api/updateProductsFromCart/updateProductsFromCart.ts`:
   ```typescript
   events.emit('cart/data', payload);
   ```

### Listened To In:
- `src/api/initialize/initialize.ts`:
  ```typescript
  events.on('cart/data', (payload) => { ... });
  ```

### Inferred Type:
Based on the code analysis, `cart/data` emits the same payload as `cart/initialized`, which is `CartModel | null`.

## Required Fix in Source Repository

**File:** `@dropins/storefront-cart/src/types/events.d.ts`

**Add:**
```typescript
declare module '@adobe-commerce/event-bus' {
  interface Events {
    'cart/data': CartModel | null;  // ← Add this line
    'cart/initialized': CartModel | null;
    'cart/updated': CartModel | null;
    'cart/reset': void;
    // ... rest
  }
}
```

## For Cart Drop-in Team

**Priority:** Medium  
**Impact:** TypeScript consumers cannot get proper type checking for this event

**Action Items:**
1. Add `'cart/data': CartModel | null;` to `src/types/events.d.ts`
2. Verify TypeScript compilation still works
3. Add test coverage for the event type
4. Release in next version
5. Notify documentation team when fixed

## When Fixed

Once the Cart drop-in team adds the type definition:

1. **Automatic:** The next documentation generation will automatically extract the type from source
2. **Update:** Remove the workaround note from the enrichment file
3. **Verify:** Payload section will show proper type instead of "not documented"

## Related Files

- `_dropin-enrichments/cart/events.json` - Enrichment with workaround
- `DROPIN-SOURCE-ISSUES.md` - Issue tracking for all drop-ins
- `src/content/docs/dropins/cart/events.mdx` - Generated documentation

---

**Created:** October 30, 2025  
**Issue Status:** Documented, awaiting fix from Cart team  
**Documentation Workaround:** ✅ Complete

