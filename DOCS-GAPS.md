> **Total gaps: 17**

# Documentation Gaps — Storefront Drop-ins
> Generated: 2026-06-12
> Source: dropins-mcp registry vs microsite MDX files

## storefront-auth (2 gaps)

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Auth.SignUpForm.shoppingAssistanceCheckboxTitle` | Allow remote shopping assistance |
| `Auth.SignUpForm.shoppingAssistanceCheckboxTooltip` | This allows merchants to "see what you see" and take actions on your behalf in order to provide better assistance. |

## storefront-cart (3 gaps)

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Cart.CartItem.confirmDeleteHeading` | Remove "{product}" from your cart? |
| `Cart.CartItem.confirmAction` | Remove |
| `Cart.CartItem.cancelAction` | Cancel |

## storefront-company-management (11 gaps)

### Missing Slots
Slots present in the registry but absent from slots.mdx.

| Container | Slot |
|---|---|
| `CompanyHierarchy` | `Actions` |

### Missing Functions
Functions present in the registry but absent from functions.mdx.

| Function |
|---|
| `assignChildCompany` |
| `getCompanyHierarchy` |
| `unassignChildCompany` |

### Missing Dictionary Keys
i18n keys present in the registry but absent from dictionary.mdx.

| Key | Default Value |
|---|---|
| `Company.CompanyHierarchy.containerTitle` | Company Hierarchy |
| `Company.CompanyHierarchy.messages.noCompaniesData` | No companies data available. |
| `Company.CompanyHierarchy.messages.loading` | Loading company hierarchy... |
| `Company.CompanyHierarchy.messages.loadError` | Failed to load company hierarchy. Please try again. |
| `Company.CompanyHierarchy.messages.moveError` | Failed to update company hierarchy. Your changes were not saved. |
| `Company.CompanyHierarchy.noAccess.title` | Access Denied |
| `Company.CompanyHierarchy.noAccess.message` | You do not have permission to view company hierarchy. |

## storefront-company-switcher (1 gaps)

### Missing Props
Props present in the registry but absent from the container MDX file.

| Container | Prop | Type |
|---|---|---|
| `CompanySwitcher` | `size` | `number (optional)` |
