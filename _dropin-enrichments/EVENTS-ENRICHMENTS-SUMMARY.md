# Events Enrichments Summary

## Overview

All drop-ins now have `events.json` enrichment files to provide high-quality descriptions for events and their payloads. These enrichments work alongside the new nested property expansion system to create comprehensive event documentation.

## ✅ Created Events Enrichments for All Drop-ins

The following 11 drop-ins now have complete `events.json` files:

| Drop-in | Events Enriched | Status |
|---------|----------------|--------|
| **cart** | `cart/merged`, `cart/product/added`, `cart/product/updated`, `shipping/estimate` | ✅ Complete with detailed payload descriptions |
| **checkout** | `checkout/values`, `cart/data`, `checkout/error`, `checkout/initialized`, `checkout/updated`, `shipping/estimate` | ✅ Complete |
| **order** | `order/data`, `order/error`, `order/initialized` | ✅ Complete |
| **payment-services** | `payment/data`, `payment/error`, `payment/initialized`, `payment/method-selected`, `payment/authorization-success`, `payment/authorization-failed` | ✅ Complete |
| **personalization** | `personalization/data`, `personalization/error`, `personalization/initialized`, `segment/updated` | ✅ Complete |
| **product-details** | `product/data`, `product/error`, `product/initialized`, `product/options-selected` | ✅ Complete |
| **product-discovery** | `search/results`, `search/error`, `search/initialized`, `facets/updated` | ✅ Complete |
| **recommendations** | `recommendations/data`, `recommendations/error`, `recommendations/initialized` | ✅ Complete |
| **user-account** | `user-account/data`, `user-account/error`, `user-account/initialized` | ✅ Complete |
| **user-auth** | `authenticated`, `user-auth/error`, `user-auth/initialized` | ✅ Complete |
| **wishlist** | `wishlist/data`, `wishlist/error`, `wishlist/initialized` | ✅ Complete |

## Structure of Events Enrichments

Each `events.json` file follows this structure:

```json
{
  "event/name": {
    "description": "Detailed description of when and why this event is emitted",
    "payload": {
      "propertyName": {
        "description": "Detailed description of this payload property"
      }
    }
  }
}
```

## Example: Cart Events

```json
{
  "cart/merged": {
    "description": "Emitted when a guest cart is merged with a customer cart after login. This typically happens when an unauthenticated user adds items to their cart, then signs in, and their guest cart items are combined with any existing items in their customer cart.",
    "payload": {
      "oldCartItems": {
        "description": "The items from the guest cart before merging. Returns `null` if the guest cart was empty. This allows you to track which items came from the guest session."
      },
      "newCart": {
        "description": "The merged cart containing all items from both the guest cart and the existing customer cart. This is the complete cart state after the merge operation. Returns `null` if the merge operation failed."
      }
    }
  }
}
```

## How Enrichments Work with Type Resolution

The events enrichment system works alongside the automatic type resolution:

1. **Type Resolution** → Automatically expands interfaces like `Item[]` and `CartModel` into 50+ properties
2. **Enrichments** → Provide human-written descriptions for specific properties that need clarification
3. **Pattern Matching** → Falls back to intelligent patterns for common property names
4. **Type Inference** → Uses TypeScript types to generate basic descriptions

### Example Output

For an event with payload `{ oldCartItems: Item[] | null }`:

- **Type resolution** expands `Item` into all its properties (quantity, sku, name, price, etc.)
- **Enrichment** provides the context: "The items from the guest cart before merging..."
- **Pattern matching** adds descriptions like "Numeric quantity value" for `quantity`
- **Type inference** generates "Array of Item objects" for array types

## Benefits

✅ **Comprehensive Documentation** - Every event payload is fully documented with property tables  
✅ **Developer-Friendly** - Clear, actionable descriptions explain when and why to use events  
✅ **Maintainable** - Type resolution auto-updates when source types change  
✅ **Consistent** - All drop-ins follow the same enrichment structure  
✅ **Searchable** - All property names are indexed and searchable in documentation  

## Next Steps

To enhance event enrichments further:

1. **Add more payload property descriptions** for complex nested objects
2. **Document event sequences** (which events fire in what order)
3. **Add usage examples** for common event handling patterns
4. **Cross-reference related events** across drop-ins

## Related Documentation

- [Event Enrichment System](./README.md#event-enrichments) - Main enrichment documentation
- [Event Generator Improvements](../scripts/EVENT-GENERATOR-IMPROVEMENTS.md) - Technical implementation details
- [Parameter Patterns](./PARAMETER-PATTERNS-README.md) - Reusable description patterns


