# Drop-in TypeScript Type Fixes Needed

Simple list of missing or incomplete TypeScript type definitions across all drop-ins.

## Cart

- `cart/data` event - missing type definition
- `cart/product/removed` event - missing type definition
- `checkout/initialized` event - missing type definition (listening)
- `companyContext/changed` event - missing type definition (listening)
- `createGuestCart` function - returns `Promise<any>`
- `publishShoppingCartViewEvent` function - returns `any`

## Checkout

- `cart/data` event - missing type definition (listening)
- `cart/initialized` event - missing type definition (listening)
- `cart/merged` event - missing type definition (listening)
- `cart/reset` event - missing type definition (listening)
- `checkout/error` event - missing type definition
- `checkout/initialized` event - missing type definition
- `checkout/updated` event - missing type definition
- `checkout/values` event - missing type definition
- `shipping/estimate` event - missing type definition (listening)
- `getCart` function - returns `Promise<any>`
- `getNegotiableQuote` function - returns `Promise<any>`
- `getStoreConfig` function - returns `Promise<any>`
- `setBillingAddress` function - returns `Promise<any>`
- `setGuestEmailOnCart` function - returns `Promise<any>`
- `setPaymentMethod` function - returns `Promise<any>`
- `setShippingAddress` function - returns `Promise<any>`
- `setShippingMethods` function - returns `Promise<any>`

## Order

- `confirmCancelOrder` function - returns `Promise<any>`

## Product Details

- `pdp/setValues` event - missing type definition
- `fetchProductData` function - returns `Promise<any>`
- `setProductConfigurationValid` function - returns `any`
- `setProductConfigurationValues` function - returns `any`

## Recommendations

- `publishRecsItemAddToCartClick` function - returns `any`

## User Auth

- `verifyToken` function - returns `Promise<any>`

## Product Discovery

- No issues found

## User Account

- No issues found

## Wishlist

- No issues found

## Payment Services

- No issues found

## Personalization

- No issues found

---

**Total Issues:** 37  
**Events Missing Types:** 14  
**Functions with `any` Types:** 23  

**Last Updated:** October 30, 2025

