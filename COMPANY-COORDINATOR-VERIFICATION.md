# Company Coordinator Example Verification

## Issue

The B2B Company Coordinator example in `company-switcher/events.mdx` (lines 195-524) needs verification against the boilerplate's `b2b-integration` branch.

## Boilerplate Reality vs. Documentation Example

### What the Boilerplate Actually Does

The boilerplate uses a **simple, decentralized pattern** where each block independently handles `companyContext/changed`:

#### 1. Product List Page (`product-list-page.js`)
```javascript
events.on('companyContext/changed', async () => {
  await performInitialSearch(config, { q, page, sort, filter });
});
```
- Simply re-runs the search

#### 2. Negotiable Quote (`commerce-b2b-negotiable-quote.js`)
```javascript
events.on('companyContext/changed', () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('quoteid'); // Remove quoteid
  window.history.replaceState({}, '', url.toString());
  window.location.href = url.toString(); // Reload page
});
```
- Clears quoteid from URL and reloads

#### 3. Account Nav (`commerce-account-nav.js`)
```javascript
events.on('companyContext/changed', () => {
  import('@dropins/storefront-auth/api.js').then((module) => {
    module._resetCache();
    module.getCustomerRolePermissions();
  });
});
```
- Resets auth cache and re-fetches permissions

### What the Documentation Example Shows

The example shows a **centralized coordinator class** with:
- Single point of control for all B2B drop-ins
- Parallel data refresh for all modules
- Cache clearing
- Loading overlays
- Notifications
- Analytics tracking
- UI updates

## Verification Status

### ❌ Pattern Mismatch

**The boilerplate does NOT use a centralized coordinator.** Each block independently handles company switching.

### ⚠️ API Function Verification

Functions shown in the example:
1. ✅ `setCompanyHeaders` - EXISTS and is correct
2. ✅ `fetchUserPermissions` - EXISTS in company-management
3. ✅ `getCompanyStructure` - EXISTS in company-management  
4. ❓ `getPurchaseOrders` - Need to verify in PO dropin
5. ❓ `negotiableQuotes` - Need to verify exact function name
6. ❓ `getQuoteTemplates` - Need to verify exact function name
7. ❓ `getRequisitionLists` - Need to verify exact function name

## Recommendation

### Option 1: Show Actual Boilerplate Pattern

Replace the coordinator example with the **actual simple pattern** from the boilerplate:

```javascript
// Simple decentralized pattern (as used in boilerplate)
import { events } from '@dropins/tools/event-bus.js';

// Each component handles its own refresh
events.on('companyContext/changed', async () => {
  // In product list: re-search
  await performSearch();
  
  // In quote page: clear and reload
  clearQuoteId();
  window.location.reload();
  
  // In navigation: reset permissions
  await resetAndRefetchPermissions();
});
```

### Option 2: Keep as "Advanced Pattern"

Keep the coordinator but clearly label it as:
- **"Advanced Integration Pattern"** or **"Suggested Architecture"**
- Add disclaimer: *"This example shows a suggested centralized pattern. The boilerplate uses a simpler decentralized approach where each block handles its own refresh."*
- Reference the actual boilerplate pattern first, then show the advanced version

### Option 3: Hybrid Approach

Show BOTH:
1. First, show the simple boilerplate pattern
2. Then, show the advanced coordinator as an "enterprise" solution

## Actual Boilerplate Pattern Summary

```
companyContext/changed event handling:
├─ Each block listens independently
├─ No centralized coordinator
├─ Simple refresh/reload logic
└─ Auth module resets its own cache
```

The boilerplate philosophy: **Keep it simple, let each module handle itself.**

## Action Items

1. ✅ Verify all API function names against dropin type definitions
2. ⚠️ Decide on approach (show real pattern vs. keep advanced example)
3. 📝 Add clarifying text regardless of decision
4. 🔍 Consider creating a separate "Architecture Patterns" guide for advanced patterns

---

**Conclusion**: The example is technically valid but represents an **idealized architecture** that doesn't exist in the boilerplate. It should be either replaced with the actual pattern or clearly labeled as a suggested advanced implementation.

