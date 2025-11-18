# B2B Drop-in Documentation Gaps Analysis

Generated: November 18, 2025

## Executive Summary

Comprehensive analysis of all B2B drop-ins to identify missing or incomplete documentation for:
- Container slots
- API functions  
- Events
- Configuration options

---

## Company Management

### Status: ✅ Containers Complete, ⚠️ Incomplete API/Events

#### Containers
- **Source**: 7 containers
- **Documented**: 7 containers ✅
- All containers properly documented

#### Slots
- **Found**: 3 slots (2 container slots + CompanyFormSlots)
- **Documented**: 1 slot (StructureData)
- **Missing Documentation**:
  1. **CompanyProfile** - `CompanyData` slot
     - Location: `src/types/companyProfile.types.ts`
     - Context: `CompanyDataContext` with `companyData: CompanyDataProps[]`
  2. **CompanyRegistration** - `CompanyFormSlots`
     - Location: `src/types/form.types.ts`
     - Needs better documentation - current description is confusing
     - Allows customizing individual form fields using pattern: `CompanyFormInput_{fieldCode}`

#### API Functions
- **Found**: 40+ exported functions
- **Currently**: Not systematically documented
- **Key Functions to Document**:
  - `createCompanyTeam(input)` - Create a new team
  - `createCompanyUser(input)` - Create a new user
  - `deleteCompanyTeam(teamId)` - Delete a team
  - `deleteCompanyUser(userId)` - Delete a user
  - `getCompany()` - Retrieve company data
  - `getCompanyStructure()` - Retrieve company structure
  - `getCompanyTeam(teamId)` - Retrieve team details
  - `getCompanyUser(userId)` - Retrieve user details
  - `getCustomerCompany()` - Retrieve customer's company
  - `isCompanyUserEmailAvailable(email)` - Check email availability
  - `updateCompanyStructure(input)` - Update company structure
  - `updateCompanyTeam(input)` - Update team
  - `updateCompanyUser(input)` - Update user
  - `checkCompanyCreditEnabled()` - Check if credit is enabled
  - `companyEnabled()` - Check if company features are enabled
  - `createCompany(input)` - Create a new company
  - `createCompanyRole(input)` - Create a new role
  - `deleteCompanyRole(roleId)` - Delete a role
  - `getCompanyAclResources()` - Get ACL resources
  - `getCompanyCredit()` - Get company credit info
  - `getCompanyCreditHistory(params)` - Get credit history
  - `getCompanyRole(roleId)` - Get role details
  - `getCompanyRoles()` - Get all roles
  - `getCompanyUsers()` - Get all users
  - `getCountries()` - Get countries for addresses
  - `getStoreConfig()` - Get store configuration
  - `isCompanyAdmin()` - Check if user is admin
  - `isCompanyRoleNameAvailable(name)` - Check role name availability
  - `isCompanyUser()` - Check if user belongs to company
  - `updateCompany(input)` - Update company details
  - `updateCompanyRole(input)` - Update role
  - `updateCompanyUserStatus(userId, status)` - Update user status
  - `validateCompanyEmail(email)` - Validate company email
  - `allowCompanyRegistration()` - Check if registration is allowed
  - `buildPermissionTree(permissions)` - Build permission tree structure
  - `fetchUserPermissions()` - Fetch user permissions

#### Events
- **Found**: 2 events
- **Currently**: Not documented
- **Events to Document**:
  1. `company/updated` - Emitted when company data is updated
  2. `companyStructure/updated` - Emitted when company structure is updated

---

## Purchase Order

### Status: ✅ Containers Complete, ⚠️ Missing API/Events Documentation

#### Containers
- **Source**: 12 containers
- **Documented**: 12 containers ✅
- All containers properly documented

#### Slots
- **Found**: 1 slot
- **Documented**: 1 slot ✅
- `PurchaseOrderStatus` - `PurchaseOrderActions` slot properly documented

#### API Functions
- **Found**: 20+ exported functions
- **Currently**: Not systematically documented
- **Key Functions to Document**:
  - `addPurchaseOrderComment(purchaseOrderId, comment)` - Add comment to PO
  - `addPurchaseOrderItemsToCart(purchaseOrderId)` - Add PO items to cart
  - `approvePurchaseOrders(purchaseOrderIds)` - Approve one or more POs
  - `cancelPurchaseOrders(purchaseOrderIds)` - Cancel one or more POs
  - `createPurchaseOrderApprovalRule(input)` - Create approval rule
  - `deletePurchaseOrderApprovalRule(ruleId)` - Delete approval rule
  - `getPurchaseOrder(purchaseOrderId)` - Get single PO details
  - `getPurchaseOrderApprovalRule(ruleId)` - Get approval rule
  - `getPurchaseOrderApprovalRuleMetadata()` - Get rule metadata
  - `getPurchaseOrderApprovalRules(params)` - Get all approval rules
  - `getPurchaseOrders(params)` - Get purchase orders list
  - `placeOrderForPurchaseOrder(purchaseOrderId)` - Place order from PO
  - `placePurchaseOrder(cartId)` - Create PO from cart
  - `rejectPurchaseOrders(purchaseOrderIds, comment)` - Reject POs
  - `updatePurchaseOrderApprovalRule(ruleId, input)` - Update approval rule
  - `validatePurchaseOrders(purchaseOrderIds)` - Validate POs
  - `currencyInfo()` - Get currency information

#### Events
- **Found**: 5 events
- **Currently**: Not documented
- **Events to Document**:
  1. `auth/permissions` - Emitted when permissions are updated
  2. `order/data` - Emitted when order data changes
  3. `purchase-order/data` - Emitted when PO data changes
  4. `purchase-order/placed` - Emitted when a PO is successfully placed
  5. `purchase-order/refresh` - Emitted when PO data should be refreshed

---

## Quote Management

### Status: ✅ Containers & Slots Complete, ⚠️ Missing API/Events Documentation

#### Containers
- **Source**: 15 containers
- **Documented**: 15 containers ✅
- All containers properly documented

#### Slots
- **Found**: 79 slots across 8 containers
- **Documented**: 79 slots ✅
- All slots properly documented (defined inline in container files)

#### API Functions
- **Found**: 30+ exported functions
- **Currently**: Not systematically documented
- **Key Functions to Document**:
  - `acceptQuoteTemplate(templateId)` - Accept a quote template
  - `addQuoteTemplateLineItemNote(templateId, itemId, note)` - Add note to template item
  - `addQuoteTemplateShippingAddress(templateId, address)` - Add shipping address to template
  - `cancelQuoteTemplate(templateId)` - Cancel a quote template
  - `closeNegotiableQuote(quoteId)` - Close a negotiable quote
  - `createQuoteTemplate(input)` - Create a new quote template
  - `deleteQuote(quoteId)` - Delete a quote
  - `deleteQuoteTemplate(templateId)` - Delete a quote template
  - `duplicateQuote(quoteId)` - Duplicate an existing quote
  - `generateQuoteFromTemplate(templateId)` - Generate quote from template
  - `getQuoteData(quoteId)` - Get quote details
  - `getQuoteTemplateData(templateId)` - Get quote template details
  - `getQuoteTemplates(params)` - Get quote templates list
  - `getStoreConfig()` - Get store configuration
  - `negotiableQuotes(params)` - Get negotiable quotes list
  - `openQuoteTemplate(templateId)` - Open a quote template
  - `removeNegotiableQuoteItems(quoteId, itemIds)` - Remove items from quote
  - `removeQuoteTemplateItems(templateId, itemIds)` - Remove items from template
  - `renameNegotiableQuote(quoteId, name)` - Rename a quote
  - `requestNegotiableQuote(input)` - Request a new negotiable quote
  - `sendForReview(quoteId, comment)` - Send quote for review
  - `sendQuoteTemplateForReview(templateId, comment)` - Send template for review
  - `setLineItemNote(quoteId, itemId, note)` - Set note on quote line item
  - `setShippingAddress(quoteId, address)` - Set shipping address on quote
  - `updateQuantities(quoteId, items)` - Update item quantities in quote
  - `updateQuoteTemplateItemQuantities(templateId, items)` - Update template item quantities
  - `uploadFile(file, params)` - Upload file attachment

#### Events
- **Found**: 19 events
- **Currently**: Not documented
- **Events to Document**:
  1. `quote-management/initialized` - Drop-in initialization complete
  2. `quote-management/line-item-note-set` - Line item note was set
  3. `quote-management/negotiable-quote-closed` - Quote was closed
  4. `quote-management/negotiable-quote-deleted` - Quote was deleted
  5. `quote-management/negotiable-quote-requested` - New quote requested
  6. `quote-management/permissions` - Permissions updated
  7. `quote-management/quantities-updated` - Item quantities updated
  8. `quote-management/quote-data` - Quote data changed
  9. `quote-management/quote-data/initialized` - Quote data initialized
  10. `quote-management/quote-duplicated` - Quote was duplicated
  11. `quote-management/quote-items-removed` - Items removed from quote
  12. `quote-management/quote-renamed` - Quote was renamed
  13. `quote-management/quote-sent-for-review` - Quote sent for review
  14. `quote-management/quote-template-data` - Template data changed
  15. `quote-management/quote-template-deleted` - Template was deleted
  16. `quote-management/quote-template-generated` - Quote generated from template
  17. `quote-management/quote-templates-data` - Templates list data changed
  18. `quote-management/shipping-address-set` - Shipping address was set

---

## Requisition List

### Status: ✅ Containers Complete, ⚠️ Missing API/Events Documentation

#### Containers
- **Source**: 5 containers
- **Documented**: 5 containers ✅
- All containers properly documented

#### Slots
- **Found**: 1 slot
- **Documented**: 1 slot ✅
- Properly documented

#### API Functions
- **Found**: 10+ exported functions
- **Currently**: Not systematically documented
- **Key Functions to Document**:
  - `addProductsToRequisitionList(listId, products)` - Add products to list
  - `addRequisitionListItemsToCart(listId, itemIds)` - Add list items to cart
  - `createRequisitionList(input)` - Create a new requisition list
  - `deleteRequisitionList(listId)` - Delete a requisition list
  - `deleteRequisitionListItems(listId, itemIds)` - Delete items from list
  - `getProductData(sku)` - Get product data
  - `getRequisitionList(listId)` - Get single list details
  - `getRequisitionLists(params)` - Get all requisition lists
  - `getStoreConfig()` - Get store configuration
  - `refineProduct(product)` - Refine product data
  - `updateRequisitionList(listId, input)` - Update list details
  - `updateRequisitionListItems(listId, items)` - Update items in list

#### Events
- **Found**: 5 events
- **Currently**: Not documented
- **Events to Document**:
  1. `requisitionList/alert` - Alert message to display
  2. `requisitionList/data` - Requisition list data changed
  3. `requisitionList/initialized` - Drop-in initialization complete
  4. `requisitionList/redirect` - Redirect to another page
  5. `requisitionLists/data` - Lists collection data changed

---

## Company Switcher

### Status: ✅ Complete

#### Containers
- **Source**: 1 container
- **Documented**: 1 container ✅

#### Slots
- **Found**: 0 slots
- **Documented**: 0 slots ✅

#### API Functions
- **Found**: 3 functions
- **Currently**: Not systematically documented
- **Key Functions to Document**:
  - `customerCompanyContext()` - Get customer company context
  - `setCompanyHeaders(companyId)` - Set company headers for requests
  - `setGroupHeaders(groupId)` - Set group headers for requests

#### Events
- **Found**: 1 event
- **Currently**: Not documented
- **Event to Document**:
  1. `companyContext/changed` - Emitted when company context changes

---

## Recommendations

### Priority 1: Critical Gaps

1. **Company Management - Missing Slots Documentation**
   - Add documentation for `CompanyProfile` `CompanyData` slot
   - Improve `CompanyRegistration` `CompanyFormSlots` documentation with examples

2. **All B2B Drop-ins - Events Documentation**
   - Create events documentation pages for all 5 B2B drop-ins
   - Total of 32 events need documentation

### Priority 2: Important Additions

3. **All B2B Drop-ins - API Functions Documentation**
   - Create functions documentation pages for all 5 B2B drop-ins
   - Total of 100+ functions need documentation
   - Follow same pattern as B2C drop-ins (Cart, Order, etc.)

### Priority 3: Enhancements

4. **Improve Container Documentation**
   - Add more real-world usage examples
   - Document common integration patterns from boilerplate

5. **Cross-Reference Documentation**
   - Link events to functions that emit them
   - Link functions to containers that use them
   - Add "See Also" sections

---

## Implementation Notes

### For Generators

The documentation generators should be enhanced to:

1. **Extract and document API functions**
   - Scan `src/api` directory for exported functions
   - Extract function signatures and JSDoc comments
   - Generate functions.mdx files similar to B2C drop-ins

2. **Extract and document events**
   - Scan source files for `events.emit()` calls
   - Extract event names and contexts
   - Generate events.mdx files with event details

3. **Improve slot documentation**
   - Check for slots in both type files and inline definitions
   - Extract slot context types and properties
   - Generate comprehensive slot examples

### For Manual Documentation

Some documentation requires manual writing:

1. **Event payloads and data structures**
2. **Function parameter validation rules**
3. **Common usage patterns and best practices**
4. **Integration examples from boilerplate**

---

## Files Requiring Updates

### New Files Needed

#### Company Management
- `src/content/docs/dropins-b2b/company-management/functions.mdx` (needs API functions)
- `src/content/docs/dropins-b2b/company-management/events.mdx` (needs 2 events)
- Slots documentation needs 2 additional slots

#### Purchase Order
- `src/content/docs/dropins-b2b/purchase-order/functions.mdx` (needs API functions)
- `src/content/docs/dropins-b2b/purchase-order/events.mdx` (needs 5 events)

#### Quote Management
- `src/content/docs/dropins-b2b/quote-management/functions.mdx` (needs API functions)
- `src/content/docs/dropins-b2b/quote-management/events.mdx` (needs 19 events)

#### Requisition List
- `src/content/docs/dropins-b2b/requisition-list/functions.mdx` (needs API functions)
- `src/content/docs/dropins-b2b/requisition-list/events.mdx` (needs 5 events)

#### Company Switcher
- `src/content/docs/dropins-b2b/company-switcher/functions.mdx` (needs API functions)
- `src/content/docs/dropins-b2b/company-switcher/events.mdx` (needs 1 event)

### Existing Files to Update

- `/Users/bdenham/Sites/storefront/src/content/docs/dropins-b2b/company-management/slots.mdx` - Add CompanyProfile slot
- `/Users/bdenham/Sites/storefront/src/content/docs/dropins-b2b/company-management/containers/company-registration.mdx` - Improve CompanyFormSlots documentation

---

## Verification Commands

To verify this analysis, use these commands:

```bash
# Check for API functions
find .temp-repos/DROPIN-NAME/src/api -name "*.ts" -exec grep "export.*function\|export const" {} \;

# Check for events
find .temp-repos/DROPIN-NAME/src -name "*.ts" -o -name "*.tsx" | xargs grep "events.emit("

# Check for slots
grep -r "slots?:" .temp-repos/DROPIN-NAME/src/types
grep -r "slots?:" .temp-repos/DROPIN-NAME/src/containers
```

