> **Total gaps: 14**

# Documentation Gaps — Storefront Drop-ins
> Generated: 2026-11-09
> Source: Dropins AI Tools registry vs microsite MDX files

## storefront-checkout (4 gaps)

### Missing Slots
Slots present in the registry but absent from slots.mdx.

| Container | Slot |
|---|---|
| `PaymentMethods` | `StoredMethods` |

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `getStoredPaymentMethods` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Checkout.PaymentMethods.chooseMethod` | Choose a payment method |
| `Checkout.PaymentMethods.payAnotherWay` | Pay another way |

## storefront-payment-services (3 gaps)

### Missing Props
Props present in the registry but absent from the container MDX file.

| Container | Prop | Type |
|---|---|---|
| `GooglePay` | `location` | `PaymentLocation` |
| `PayPalButtons` | `location` | `PaymentLocation` |

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `submitCreditCard` |

## storefront-pdp (3 gaps)

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `isCustomOptionUID` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `PDP.CustomizableOptions.Required.label` | Required |
| `PDP.CustomizableOptions.FileUnsupported.label` | File upload is not supported. |

## storefront-recommendations (2 gaps)

### Missing Slots
Slots present in the registry but absent from slots.mdx.

| Container | Slot |
|---|---|
| `ProductList` | `Rating` |

### Missing Props
Props present in the registry but absent from the container MDX file.

| Container | Prop | Type |
|---|---|---|
| `ProductList` | `showRatings` | `boolean (optional)` |

## storefront-wishlist (1 gaps)

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Wishlist.Wishlist.ariaLabelWithVisibleLabel` | {LABEL} for {PRODUCT_NAME} |

## storefront-company-management (1 gaps)

### Phantom Functions
Functions documented in MDX but not found in the registry.

| Function |
|---|
| `getStoreConfig` |
