> **Total gaps: 10**

# Documentation Gaps — Storefront Drop-ins
> Generated: 2026-07-20
> Source: dropins-mcp registry vs microsite MDX files

## storefront-payment-services (8 gaps)

### Version Mismatch
The documented version does not match the registry version. Update `initialization.mdx` to `3.0.1`.

| Documented | Registry |
|---|---|
| `4.0.0` | `3.0.1` |

### Phantom Events
Events documented in MDX but not found in the registry.

| Event |
|---|
| `cart/data` |
| `checkout/initialized` |
| `checkout/updated` |
| `payment-services/initialized/checkout` |
| `payment-services/initialized/product-detail` |

### Phantom Dictionary Keys
i18n keys documented in dictionary.mdx but not found in the registry.

| Key |
|---|
| `PaymentServices.GooglePay.errors.default.name` |
| `PaymentServices.GooglePay.errors.default.message` |

## storefront-pdp (1 gaps)

### Version Mismatch
The documented version does not match the registry version. Update `initialization.mdx` to `3.1.0`.

| Documented | Registry |
|---|---|
| `3.2.0` | `3.1.0` |

## storefront-recommendations (1 gaps)

### Version Mismatch
The documented version does not match the registry version. Update `initialization.mdx` to `4.0.0`.

| Documented | Registry |
|---|---|
| `4.0.4` | `4.0.0` |
