> **Total gaps: 95**

# Documentation Gaps — Storefront Drop-ins
> Generated: 2026-09-28
> Source: dropins-mcp registry vs microsite MDX files

## storefront-account (40 gaps)

### Missing Props
Props present in the registry but absent from the container MDX file.

| Container | Prop | Type |
|---|---|---|
| `AddressForm` | `hasDefaultShippingAddress` | `boolean (optional)` |
| `AddressForm` | `hasDefaultBillingAddress` | `boolean (optional)` |
| `AddressForm` | `isB2BFlow` | `boolean (optional)` |
| `AddressForm` | `enforceB2BPermissions` | `boolean (optional)` |
| `AddressForm` | `permissions` | `CompanyAddressPermissions (optional)` |
| `Addresses` | `b2bEnabled` | `boolean (optional)` |
| `Addresses` | `contextMode` | `AddressContextMode (optional)` |

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `createCompanyAddress` |
| `updateCompanyAddress` |
| `deleteCompanyAddress` |
| `setDefaultCompanyAddress` |
| `getCompanyAddressBook` |
| `getCompanyAddressBookConfig` |
| `getCustomerCompanyContext` |
| `getCustomerRolePermissions` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Account.minifiedView.CustomerInformation.customerInformationCard.buttonSecondaryAriaLabel` | Change password for account |
| `Account.minifiedView.CustomerInformation.customerInformationCard.buttonPrimaryAriaLabel` | Edit account details |
| `Account.minifiedView.Addresses.addressCard.cardLabelDefaultShipping` | Default Shipping |
| `Account.minifiedView.Addresses.addressCard.cardLabelDefaultBilling` | Default Billing |
| `Account.fullSizeView.Addresses.addressCard.cardLabelDefaultShipping` | Default Shipping |
| `Account.fullSizeView.Addresses.addressCard.cardLabelDefaultBilling` | Default Billing |
| `Account.fullSizeView.OrdersList.OrdersListSearch.label` | Search by order number, product name, or SKU |
| `Account.fullSizeView.OrdersList.OrdersListSearch.placeholder` | Search orders |
| `Account.fullSizeView.OrdersList.OrdersListSearch.action` | Search orders |
| `Account.fullSizeView.OrdersList.OrdersListSearch.minimumLength` | Enter at least 3 characters. |
| `Account.fullSizeView.OrdersList.OrdersListSearch.error` | We couldn't load your orders. Please try again. |
| `Account.fullSizeView.OrdersList.OrdersListSearch.clear` | Clear search |
| `Account.AddressForm.formText.b2bShippingTypeLabel` | Shipping Address |
| `Account.AddressForm.formText.b2bBillingTypeLabel` | Billing Address |
| `Account.AddressForm.formText.b2bIsDefaultLabel` | Set as default address |
| `Account.AddressForm.formText.b2bIsDefaultShippingLabel` | Set as default shipping address |
| `Account.AddressForm.formText.b2bIsDefaultBillingLabel` | Set as default billing address |
| `Account.AddressForm.notifications.noPermissionEditAddresses` | You don't have permission to edit addresses |
| `Account.AddressForm.notifications.noPermissionCreateAddresses` | You don't have permission to create addresses |
| `Account.AddressForm.notifications.firstCompanyAddressDefaultRequired` | For the first company address, choose one default type: shipping or billing. |
| `Account.AddressForm.notifications.companyAddressSingleDefaultType` | A company address cannot be default for both billing and shipping at the same time. Please select only one default type. |
| `Account.OrdersList.loading` | Loading orders |
| `Account.OrdersList.loaded` | Orders loaded |
| `Account.Addresses.loading` | Loading addresses |
| `Account.Addresses.loaded` | Addresses loaded |

## storefront-auth (1 gaps)

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Auth.Button.loadingLabel` | Loading |

## storefront-cart (21 gaps)

### Missing Container Pages
Containers present in the registry but with no corresponding MDX documentation page.

| Container |
|---|
| `FreeGiftSelection` |

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `selectFreeGiftForCart` |
| `getAvailableFreeGiftsForCart` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Cart.Cart.loadingLabel` | Loading cart |
| `Cart.MiniCart.loadingLabel` | Loading cart |
| `Cart.MiniCart.cartUpdated` | Cart updated, {count} items |
| `Cart.PriceSummary.loadingLabel` | Loading order summary |
| `Cart.EstimateShipping.loadingLabel` | Loading shipping estimate |
| `Cart.FreeGiftSelection.title` | Choose your free gift |
| `Cart.FreeGiftSelection.loading` | Loading choices… |
| `Cart.FreeGiftSelection.empty` | No gift options are available right now. |
| `Cart.FreeGiftSelection.error` | We could not load gift choices. Try again. |
| `Cart.FreeGiftSelection.ariaModal` | Free gift selection |
| `Cart.FreeGiftSelection.openTrigger` | Choose your free gift |
| `Cart.FreeGiftSelection.openTriggerHint` | You have free gifts to choose from. |
| `Cart.FreeGiftSelection.addedMessagePrefix` | Free gift added to your cart: {names} |
| `Cart.FreeGiftSelection.chooseOption` | Choose an option |
| `Cart.FreeGiftSelection.configureRequired` | Choose all required options for your free gift. |
| `Cart.FreeGiftSelection.ruleLabelFallback` | Free gift offer |
| `Cart.FreeGiftSelection.selectProduct` | Select Options |
| `Cart.FreeGiftSelection.addToCart` | Add to Cart |

## storefront-order (1 gaps)

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Order.ShippingStatusCard.shipmentNumber` | Shipment number: |

## storefront-payment-services (10 gaps)

### Missing Container Pages
Containers present in the registry but with no corresponding MDX documentation page.

| Container |
|---|
| `VaultedCreditCard` |

### Missing Props
Props present in the registry but absent from the container MDX file.

| Container | Prop | Type |
|---|---|---|
| `GooglePay` | `location` | `PaymentLocation` |

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `submitCreditCard` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `PaymentServices.CreditCard.saveCard.label` | Save this card for future purchases |
| `PaymentServices.VaultedCreditCard.cardTypeLabel.credit` | Credit card |
| `PaymentServices.VaultedCreditCard.cardTypeLabel.debit` | Debit card |
| `PaymentServices.VaultedCreditCard.cardTypeLabel.fsa` | FSA Debit card |
| `PaymentServices.VaultedCreditCard.cardTypeLabel.prepaid` | Prepaid card |
| `PaymentServices.VaultedCreditCard.cardTypeLabel.store` | Store card |
| `PaymentServices.CardIcon.generic.title` | Card |

## storefront-pdp (1 gaps)

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `isCustomOptionUID` |

## storefront-recommendations (2 gaps)

### Missing Props
Props present in the registry but absent from the container MDX file.

| Container | Prop | Type |
|---|---|---|
| `ProductList` | `label` | `string (optional)` |

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `getRecommendationsByUnits` |

## storefront-wishlist (8 gaps)

### Missing Slots
Slots present in the registry but absent from slots.mdx.

| Container | Slot |
|---|---|
| `WishlistItem` | `actions` |
| `Wishlist` | `actions` |

### Missing Props
Props present in the registry but absent from the container MDX file.

| Container | Prop | Type |
|---|---|---|
| `WishlistItem` | `wishlistId` | `string (optional)` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `ProductItem.CartActionButtonAriaLabel` | Move {productName} to cart |
| `ProductItem.CustomizeActionButtonAriaLabel` | Customize {productName} |
| `ProductItem.InStock` | In stock |
| `ProductItem.OutOfStock` | Out of stock |
| `ImageCarousel.slideLabel` | Product images |

## storefront-company-management (9 gaps)

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `updateCompanyConfig` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Company.CompanyProfile.editCompanyProfile.addressBook.sectionTitle` | Address Book Configuration |
| `Company.CompanyProfile.editCompanyProfile.addressBook.addressBookEnabled` | Enable Company Address Book |
| `Company.CompanyProfile.editCompanyProfile.addressBook.customAddressEnabled` | Allow Custom Company Address |
| `Company.CompanyProfile.companyProfileCard.addressBookConfiguration` | Address Book Configuration |
| `Company.CompanyProfile.companyProfileCard.addressBookEnabled` | Enable Company Address Book |
| `Company.CompanyProfile.companyProfileCard.customShippingAddressEnabled` | Allow Custom Company Address |
| `Company.CompanyProfile.companyProfileCard.enabledValue` | Enabled |
| `Company.CompanyProfile.companyProfileCard.disabledValue` | Disabled |

## storefront-company-switcher (2 gaps)

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `getCatalogViewContext` |
| `getCatalogViewHeaderManager` |
