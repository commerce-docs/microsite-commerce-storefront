# Jira Tickets for Incomplete TypeScript Definitions

**Generated**: 10/30/2025, 8:39:20 PM  
**Recommended Tickets**: 7

Copy each section below into a new Jira ticket.

---

## Ticket 1: [cart] Add Proper TypeScript Definitions

```
Summary: Add proper TypeScript definitions to cart drop-in

Type: Technical Debt
Priority: Medium
Component: cart
Labels: typescript, type-definitions, documentation, b2c

Description:

The cart drop-in has 2 item(s) with incomplete TypeScript definitions (using 'any' type).

Items to Fix:

Functions:
* createGuestCart - Function signature contains generic "any" type
* publishShoppingCartViewEvent - Function signature contains generic "any" type

Acceptance Criteria:

* All 'any' types replaced with specific TypeScript interfaces
* Type definitions added to .d.ts files where needed
* No breaking changes to existing API
* Tests passing
* Documentation automatically reflects new types

Repository: https://github.com/adobe-commerce/cart
```

---

## Ticket 2: [checkout] Add Proper TypeScript Definitions

```
Summary: Add proper TypeScript definitions to checkout drop-in

Type: Technical Debt
Priority: Medium
Component: checkout
Labels: typescript, type-definitions, documentation, b2c

Description:

The checkout drop-in has 8 item(s) with incomplete TypeScript definitions (using 'any' type).

Items to Fix:

Functions:
* getCart - Function signature contains generic "any" type
* getNegotiableQuote - Function signature contains generic "any" type
* getStoreConfig - Function signature contains generic "any" type
* setBillingAddress - Function signature contains generic "any" type
* setGuestEmailOnCart - Function signature contains generic "any" type
* setPaymentMethod - Function signature contains generic "any" type
* setShippingAddress - Function signature contains generic "any" type
* setShippingMethods - Function signature contains generic "any" type

Acceptance Criteria:

* All 'any' types replaced with specific TypeScript interfaces
* Type definitions added to .d.ts files where needed
* No breaking changes to existing API
* Tests passing
* Documentation automatically reflects new types

Repository: https://github.com/adobe-commerce/checkout
```

---

## Ticket 3: [company-management] Add Proper TypeScript Definitions

```
Summary: Add proper TypeScript definitions to company-management drop-in

Type: Technical Debt
Priority: Medium
Component: company-management
Labels: typescript, type-definitions, documentation, b2b

Description:

The company-management drop-in has 3 item(s) with incomplete TypeScript definitions (using 'any' type).

Items to Fix:

Functions:
* createCompany - Function signature contains generic "any" type
* fetchUserPermissions - Function signature contains generic "any" type
* initialize - Function signature contains generic "any" type

Acceptance Criteria:

* All 'any' types replaced with specific TypeScript interfaces
* Type definitions added to .d.ts files where needed
* No breaking changes to existing API
* Tests passing
* Documentation automatically reflects new types

Repository: https://github.com/adobe-commerce/company-management
```

---

## Ticket 4: [order] Add Proper TypeScript Definitions

```
Summary: Add proper TypeScript definitions to order drop-in

Type: Technical Debt
Priority: Medium
Component: order
Labels: typescript, type-definitions, documentation, b2c

Description:

The order drop-in has 2 item(s) with incomplete TypeScript definitions (using 'any' type).

Items to Fix:

Functions:
* confirmCancelOrder - Function signature contains generic "any" type
* setPaymentMethodAndPlaceOrder - Function signature contains generic "any" type

Acceptance Criteria:

* All 'any' types replaced with specific TypeScript interfaces
* Type definitions added to .d.ts files where needed
* No breaking changes to existing API
* Tests passing
* Documentation automatically reflects new types

Repository: https://github.com/adobe-commerce/order
```

---

## Ticket 5: [product-details] Add Proper TypeScript Definitions

```
Summary: Add proper TypeScript definitions to product-details drop-in

Type: Technical Debt
Priority: Medium
Component: product-details
Labels: typescript, type-definitions, documentation, b2c

Description:

The product-details drop-in has 3 item(s) with incomplete TypeScript definitions (using 'any' type).

Items to Fix:

Functions:
* fetchProductData - Function signature contains generic "any" type
* setProductConfigurationValid - Function signature contains generic "any" type
* setProductConfigurationValues - Function signature contains generic "any" type

Acceptance Criteria:

* All 'any' types replaced with specific TypeScript interfaces
* Type definitions added to .d.ts files where needed
* No breaking changes to existing API
* Tests passing
* Documentation automatically reflects new types

Repository: https://github.com/adobe-commerce/product-details
```

---

## Ticket 6: [recommendations] Add Proper TypeScript Definitions

```
Summary: Add proper TypeScript definitions to recommendations drop-in

Type: Technical Debt
Priority: Medium
Component: recommendations
Labels: typescript, type-definitions, documentation, b2c

Description:

The recommendations drop-in has 1 item(s) with incomplete TypeScript definitions (using 'any' type).

Items to Fix:

Functions:
* publishRecsItemAddToCartClick - Function signature contains generic "any" type

Acceptance Criteria:

* All 'any' types replaced with specific TypeScript interfaces
* Type definitions added to .d.ts files where needed
* No breaking changes to existing API
* Tests passing
* Documentation automatically reflects new types

Repository: https://github.com/adobe-commerce/recommendations
```

---

## Ticket 7: [user-auth] Add Proper TypeScript Definitions

```
Summary: Add proper TypeScript definitions to user-auth drop-in

Type: Technical Debt
Priority: Medium
Component: user-auth
Labels: typescript, type-definitions, documentation, b2c

Description:

The user-auth drop-in has 1 item(s) with incomplete TypeScript definitions (using 'any' type).

Items to Fix:

Functions:
* verifyToken - Function signature contains generic "any" type

Acceptance Criteria:

* All 'any' types replaced with specific TypeScript interfaces
* Type definitions added to .d.ts files where needed
* No breaking changes to existing API
* Tests passing
* Documentation automatically reflects new types

Repository: https://github.com/adobe-commerce/user-auth
```

---

