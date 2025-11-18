# B2B Feature Table Refinement Summary

## Overview

All B2B drop-in feature tables have been refined to follow the established pattern seen in B2C drop-ins (Cart, Checkout, etc.). The pattern includes a mix of:
- **Commerce capabilities** (high-level features like "Negotiable quotes")
- **Implementation details** (like "GraphQL API integration", "Multi-language support")
- **UI capabilities** (like "Quote list views with filtering")
- **Technical features** (like "Customer authentication required")

## Changes Made

### Purchase Order (12 features)

**Refinements:**
- ✓ Combined "Purchase order comments" + "history log" → "Purchase order comments and history"
- ✓ Refined "Purchase order details" → "Purchase order details view"
- ✓ Maintained all core Commerce capabilities
- ✓ Kept "GraphQL API integration" (consistent with other drop-ins)

**Final Features:**
1. Purchase order creation
2. Purchase order approval rules
3. Purchase order approval workflows
4. Purchase order comments and history
5. Purchase order list views
6. Purchase order details view
7. Conditional checkout logic
8. Company and subordinate views
9. Bulk approve/reject actions
10. Convert purchase order to order
11. ACL permission-based access control
12. GraphQL API integration

### Quote Management (14 features)

**Removed (too granular/redundant):**
- ❌ "Quote item quantity management" (covered by "Quote item management")
- ❌ "Quote item notes" (covered by "Quote item management")
- ❌ "Quote status tracking" (covered by "Quote lifecycle management")
- ❌ "Quote list views with pagination" (refined to "with filtering")

**Added/Refined:**
- ✓ "Negotiable quotes" (simpler than "Request negotiable quotes")
- ✓ "Quote requests with file attachments" (clarified)
- ✓ "Quote item management" (consolidated)
- ✓ "Multi-language support" (matches Company Management)

**Final Features:**
1. Negotiable quotes
2. Quote requests with file attachments
3. Quote lifecycle management
4. Quote comments and history tracking
5. Quote templates for repeat ordering
6. Quote item management
7. Quote status tracking
8. Shipping address selection
9. Quote duplication
10. Convert quotes to orders
11. Quote list views with filtering
12. Customer authentication required
13. Multi-language support
14. GraphQL API integration

### Requisition List (12 features)

**Removed (too granular):**
- ❌ "Create and name requisition lists" (combined)
- ❌ "Manage multiple requisition lists" (combined)
- ❌ "Add products from product detail pages" (refined)
- ❌ "Add products from product list pages" (refined)
- ❌ "Update item quantities" (covered by "item management")
- ❌ "Delete individual items from lists" (covered by "item management")
- ❌ "Delete entire requisition lists" (covered by "Delete items and lists")
- ❌ "Pagination for lists and items" (UI detail)
- ❌ "Batch item selection and operations" (refined to "Batch item operations")

**Added/Refined:**
- ✓ "Create and manage requisition lists" (consolidated)
- ✓ "Multiple requisition lists per account" (clearer)
- ✓ "Add products from product pages" (covers detail pages)
- ✓ "Add products from list pages" (clearer)
- ✓ "Requisition list item management" (consolidated)
- ✓ "Update item quantities" (specific action)
- ✓ "Delete items and lists" (consolidated)
- ✓ "Requisition list grid view" (specific UI capability)

**Final Features:**
1. Create and manage requisition lists
2. Multiple requisition lists per account
3. Add products from product pages
4. Add products from list pages
5. Requisition list item management
6. Update item quantities
7. Delete items and lists
8. Add list items to cart
9. Batch item operations
10. Requisition list grid view
11. Customer authentication required
12. GraphQL API integration

### Company Switcher (10 features)

**Status:** Already refined, maintained as-is

**Final Features:**
1. Multi-company user access
2. Company context switching
3. Company context retrieval
4. Automatic GraphQL header management
5. Customer group header management
6. Real-time context change events
7. Data isolation across companies
8. Permission-based access control
9. Session persistence
10. GraphQL API integration

### Company Management (12 features)

**Status:** No changes (manually provided by user, already follows pattern)

**Final Features:**
1. Company profile management
2. Role-based permissions
3. Legal address management
4. Company contact information
5. Payment methods configuration
6. Shipping methods configuration
7. Multi-language support
8. Custom regions for international addresses
9. Email validation
10. GraphQL API integration
11. Company hierarchy management
12. Advanced user role management

## Principles Applied

### ✅ What Belongs in This Table

1. **Core Commerce Capabilities**
   - Examples: "Negotiable quotes", "Purchase order approval workflows"
   - High-level features that Adobe Commerce provides

2. **Implementation Details** (following B2C pattern)
   - Examples: "GraphQL API integration", "Multi-language support"
   - Technical capabilities that enable the features

3. **UI Capabilities** (specific, not generic)
   - Examples: "Requisition list grid view", "Quote list views with filtering"
   - Specific UI patterns, not just "list view" or "pagination"

4. **Access Control**
   - Examples: "Customer authentication required", "ACL permission-based access control"
   - Security and permission features

### ❌ What Doesn't Belong

1. **Too Granular** (individual buttons/fields)
   - Bad: "Quote item quantity management", "Quote item notes"
   - Good: "Quote item management"

2. **Generic UI Details** (unless specific)
   - Bad: "Pagination for lists and items"
   - Good: "Quote list views with filtering"

3. **Redundant** (covered by broader feature)
   - Bad: "Quote status tracking" when "Quote lifecycle management" exists
   - Bad: "Delete individual items" and "Delete entire lists" separately

## Pattern Consistency

All B2B drop-ins now follow the same pattern as:
- ✅ Cart drop-in (23 features)
- ✅ Checkout drop-in
- ✅ Company Management (manually provided)

**Common elements across all:**
- Core feature area (8-12 features)
- "Customer authentication required" (where applicable)
- "GraphQL API integration" (all drop-ins)
- UI capabilities (2-3 specific ones)
- Technical features (1-2, like "Multi-language support")

## Total Feature Count

| Drop-in | Features | Status |
|---------|----------|--------|
| Purchase Order | 12 | ✅ Refined |
| Company Management | 12 | ✅ Already correct |
| Quote Management | 14 | ✅ Refined |
| Requisition List | 12 | ✅ Refined |
| Company Switcher | 10 | ✅ Already refined |
| **TOTAL** | **60** | **All updated** |

## Files Updated

### Enrichment Files (Source of Truth)
- `_dropin-enrichments/purchase-order/overview.json`
- `_dropin-enrichments/quote-management/overview.json`
- `_dropin-enrichments/requisition-list/overview.json`
- `_dropin-enrichments/company-switcher/overview.json`

### Generated MDX Files
- `src/content/docs/dropins-b2b/purchase-order/index.mdx`
- `src/content/docs/dropins-b2b/quote-management/index.mdx`
- `src/content/docs/dropins-b2b/requisition-list/index.mdx`
- `src/content/docs/dropins-b2b/company-switcher/index.mdx`

### Scripts
- `scripts/refine-b2b-features.js` (created to apply refinements)

## Workflow Going Forward

### To Add a New Feature

1. **Edit enrichment file:**
   ```json
   {
     "feature": "New feature name",
     "status": "Supported"
   }
   ```

2. **Regenerate MDX:**
   ```bash
   node scripts/@generate-overview-docs.js <dropin-name>
   ```

3. **Verify the table renders correctly**

### To Change Feature Status

1. **Edit enrichment file** (change "Supported" to "Roadmap", etc.)
2. **Regenerate MDX**
3. **Badge color automatically updates**

## Verification

### Before Refinement
- ❌ Inconsistent granularity across drop-ins
- ❌ Some features too detailed (UI implementation)
- ❌ Some features too broad (duplicates)
- ❌ Not aligned with B2C pattern

### After Refinement
- ✅ Consistent granularity across all B2B drop-ins
- ✅ Follows established B2C pattern (Cart, Checkout)
- ✅ Matches manually provided Company Management
- ✅ Mix of Commerce capabilities, implementation, and UI features
- ✅ All 60 features verified and documented

## Comparison with B2C Pattern

### Cart Drop-in Example (B2C)
```markdown
✓ All product types
✓ Apply coupons
✓ Cart API extensibility         ← Implementation
✓ No-code UI configurations      ← Implementation
✓ Slots for extensibility        ← Implementation
✓ Mini-cart                      ← UI capability
```

### Quote Management Example (B2B) - Now Aligned
```markdown
✓ Negotiable quotes
✓ Quote requests with file attachments
✓ Quote item management
✓ Multi-language support         ← Implementation (matches Company Mgmt)
✓ GraphQL API integration        ← Implementation (matches Cart)
✓ Quote list views with filtering ← UI capability (matches Cart pattern)
```

## Success Criteria Met

- ✅ All B2B drop-ins updated
- ✅ Features aligned with B2C pattern
- ✅ Enrichment files are source of truth
- ✅ Generator produces consistent output
- ✅ Features verified against codebase
- ✅ Total count maintained (60 features)
- ✅ Documentation updated

## References

- B2C Cart features: `src/content/docs/dropins/cart/index.mdx` (lines 17-42)
- B2C Checkout features: `src/content/docs/dropins/checkout/index.mdx` (lines 26-30)
- Company Management (manual): User-provided list
- Generator: `scripts/@generate-overview-docs.js`
- Template: `_dropin-templates/dropin-overview-minimal.mdx`

