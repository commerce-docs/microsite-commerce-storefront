> **Total gaps: 37**

# Documentation Gaps — Storefront Drop-ins
> Generated: 2026-10-19
> Source: Dropins AI Tools registry vs microsite MDX files

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

## storefront-requisition-list (26 gaps)

### Phantom Props
Props documented in MDX but not found in the registry. Verify whether these are valid props or should be removed.

| Container | Prop |
|---|---|
| `ShareRequisitionListContent` | `isPublic` |
| `SharedRequisitionList` | `isPublic` |
| `SharedRequisitionList` | `getCartId` |
| `SharedRequisitionList` | `onCartUpdated` |
| `SharedRequisitionList` | `routeProduct` |

### Phantom Functions
Functions documented in MDX but not found in the registry.

| Function |
|---|
| `getPublicRequisitionList` |
| `getPublicRequisitionListToken` |
| `sharePublicRequisitionList` |
| `addPublicRequisitionListItemsToCart` |

### Phantom Dictionary Keys
i18n keys documented in dictionary.mdx but not found in the registry.

| Key |
|---|
| `RequisitionList.RequisitionListForm.markPublicLabel` |
| `RequisitionList.SharedRequisitionList.addToCart` |
| `RequisitionList.SharedRequisitionList.addSelectedToCart` |
| `RequisitionList.SharedRequisitionList.addingToCart` |
| `RequisitionList.SharedRequisitionList.cartSuccess` |
| `RequisitionList.SharedRequisitionList.cartError` |
| `RequisitionList.SharedRequisitionList.selectItem` |
| `RequisitionList.SharedRequisitionList.previousPage` |
| `RequisitionList.SharedRequisitionList.nextPage` |
| `RequisitionList.RequisitionListView.actionMakePublic` |
| `RequisitionList.RequisitionListView.actionMakePrivate` |
| `RequisitionList.RequisitionListView.statusPublic` |
| `RequisitionList.ShareRequisitionListContent.publicEmailPlaceholder` |
| `RequisitionList.ShareRequisitionListContent.publicEmailInstruction` |
| `RequisitionList.ShareRequisitionListContent.publicLinkInstruction` |
| `RequisitionList.ShareRequisitionListContent.invalidEmail` |
| `RequisitionList.ShareRequisitionListContent.sharingInProgress` |
