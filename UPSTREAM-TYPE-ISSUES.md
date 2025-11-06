# Incomplete TypeScript Definitions - Action Required

**Generated**: 10/30/2025, 8:39:20 PM  
**Total Issues**: 20 (20 functions, 0 events)

> **Note**: These are issues in the source code repositories, not in the documentation generator.
> The generator correctly extracts what exists in the source.

---

## Summary by Drop-in

- **cart (B2C)**: 2 issues (2 functions, 0 events)
- **checkout (B2C)**: 8 issues (8 functions, 0 events)
- **company-management (B2B)**: 3 issues (3 functions, 0 events)
- **order (B2C)**: 2 issues (2 functions, 0 events)
- **product-details (B2C)**: 3 issues (3 functions, 0 events)
- **recommendations (B2C)**: 1 issue (1 functions, 0 events)
- **user-auth (B2C)**: 1 issue (1 functions, 0 events)

---

## Functions with Incomplete Types

### cart (B2C)

- **`createGuestCart`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const createGuestCart = async (): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`publishShoppingCartViewEvent`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const publishShoppingCartViewEvent = async (): any`
  - **Action**: Replace `any` with specific TypeScript type

### checkout (B2C)

- **`getCart`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const getCart = async (): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`getNegotiableQuote`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const getNegotiableQuote = async ( input: GetNegotiableQuoteInput = {} ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`getStoreConfig`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const getStoreConfig = async (): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`setBillingAddress`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setBillingAddress = async ( input: BillingAddressInputModel ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`setGuestEmailOnCart`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setGuestEmailOnCart = async ( email: string ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`setPaymentMethod`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setPaymentMethod = async ( input: PaymentMethodInputModel ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`setShippingAddress`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setShippingAddress = async ( input: ShippingAddressInputModel ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`setShippingMethods`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setShippingMethods = async ( input: Array<ShippingMethodInputModel> ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

### company-management (B2B)

- **`createCompany`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `export const createCompany = async ( formData: any ): Promise<{ success: boolean; company?: CompanyR...`
  - **Action**: Replace `any` with specific TypeScript type

- **`fetchUserPermissions`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `export const fetchUserPermissions = async ( ): Promise<{ allowedIds: Set<string>; roleResponse: any ...`
  - **Action**: Replace `any` with specific TypeScript type

- **`initialize`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `initialize(config?: { langDefinitions?: Record<string, Record<string, string>>; models?: Record<stri...`
  - **Action**: Replace `any` with specific TypeScript type

### order (B2C)

- **`confirmCancelOrder`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const confirmCancelOrder = async ( orderId: string, confirmationKey: string ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`setPaymentMethodAndPlaceOrder`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setPaymentMethodAndPlaceOrder = async ( cartId: string, paymentMethod: any ): Promise<OrderDat...`
  - **Action**: Replace `any` with specific TypeScript type

### product-details (B2C)

- **`fetchProductData`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const fetchProductData = async ( sku: string, options?: Options ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

- **`setProductConfigurationValid`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setProductConfigurationValid = async ( callback: (prev: boolean ): any`
  - **Action**: Replace `any` with specific TypeScript type

- **`setProductConfigurationValues`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const setProductConfigurationValues = async ( callback: (prev: ValuesModel ): any`
  - **Action**: Replace `any` with specific TypeScript type

### recommendations (B2C)

- **`publishRecsItemAddToCartClick`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const publishRecsItemAddToCartClick = async ( params: PublishParams ): any`
  - **Action**: Replace `any` with specific TypeScript type

### user-auth (B2C)

- **`verifyToken`**
  - **Issue**: Function signature contains generic "any" type
  - **Signature**: `const verifyToken = async ( authType = 'Authorization', type = 'Bearer' ): Promise<any>`
  - **Action**: Replace `any` with specific TypeScript type

---

## Events with Incomplete Types

✅ All events have proper TypeScript definitions.

---

## How to Fix

### For Functions

1. Locate the function in `src/api/[function-name]/[function-name].ts`
2. Replace `any` types with specific TypeScript interfaces
3. Add JSDoc comments if needed
4. Run tests to ensure no breaking changes

### For Events

1. Locate the event definition in `src/types/events.d.ts` or `src/types/event-bus.d.ts`
2. Replace `any` with a proper interface (e.g., `CartUpdatedPayload`)
3. Define the interface if it doesn't exist
4. Update all `events.emit()` calls to match the new type

---

## Repository Links

- [cart](https://github.com/adobe-commerce/cart)
- [checkout](https://github.com/adobe-commerce/checkout)
- [company-management](https://github.com/adobe-commerce/company-management)
- [order](https://github.com/adobe-commerce/order)
- [product-details](https://github.com/adobe-commerce/product-details)
- [recommendations](https://github.com/adobe-commerce/recommendations)
- [user-auth](https://github.com/adobe-commerce/user-auth)

---

*This report was automatically generated by scanning the documentation.*
