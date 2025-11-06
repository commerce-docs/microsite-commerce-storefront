# Event Data Models Implementation Summary

## Overview

Successfully added a **Data Models** section to all event documentation pages, matching the functionality already present on function pages. This provides comprehensive TypeScript type documentation for all event payload models.

**Key change:** Event payloads now show only the TypeScript type definition inline, with links to the Data Models section at the bottom of the page. Parameter tables have been removed from inline payload sections to match the functions page format.

## Implementation Details

### 1. Event Generator Updates (`scripts/@generate-event-docs.js`)

**Added Functions:**
- `extractModelDefinition(modelName, dropinName)` - Extracts full TypeScript interface/type/enum definitions from source files
- `extractReferencedTypes(typeDefinition)` - Parses type strings to identify model references (e.g., `CartModel`, `Item[]`)

**Modified Logic:**
- Added `modelDefinitions` Map to track models used across all events
- During event payload processing, extracts referenced types and their definitions
- Generates Data Models section at the end with:
  - Model name as heading
  - Editorial description (from enrichment)
  - List of events that use the model (with links)
  - Full TypeScript definition in code block

### 2. Enrichment File Format (`_dropin-enrichments/{dropin}/events.json`)

**New Structure:**
```json
{
  "models": {
    "ModelName": {
      "description": "Editorial description of the data model"
    }
  },
  "event/name": {
    "description": "Event description",
    "payload": {
      "property": {
        "description": "Property description"
      }
    }
  }
}
```

**Example Implementation** (cart/events.json):
- Added descriptions for `CartModel`, `Item`, `PartialAddress`, `ShippingMethod`
- Descriptions explain what each model represents and its purpose

### 3. Template Updates (`_dropin-templates/dropin-events.mdx`)

Added documentation comment explaining:
- Data Models section is auto-generated and appended
- How to add/edit model descriptions via enrichment files

### 4. Documentation Updates (`_dropin-enrichments/README.md`)

Updated Event Enrichment section:
- Documented the new `models` section in enrichment structure
- Added complete example showing models + events
- Added Data Models benefit to the benefits list

## Results

### Generated Content

**7 out of 11 drop-ins** now have Data Models sections:
- ✅ `cart/events.mdx` - 4 models (CartModel, Item, PartialAddress, ShippingMethod)
- ✅ `order/events.mdx` - OrderDataModel
- ✅ `personalization/events.mdx` - Has models
- ✅ `product-details/events.mdx` - Has models
- ✅ `product-discovery/events.mdx` - Has models
- ✅ `recommendations/events.mdx` - Has models
- ✅ `wishlist/events.mdx` - 2 models (Wishlist, WishlistActionPayload)

**4 drop-ins without Data Models sections** (as expected):
- checkout, user-account, user-auth, payment-services
- These don't have typed events with model references in their payloads

### Sample Output Structure

**Inline Event Payload** (simplified, no tables):
```markdown
#### Event payload

\```typescript
CartModel | null
\```

See [`CartModel`](#cartmodel) for full type definition.
```

**Data Models Section** (at bottom of page):
```markdown
## Data Models

The following data models are used in event payloads for this drop-in.

### CartModel

The `CartModel` represents the complete state of a shopping cart, including items, pricing, discounts, shipping estimates, and gift options.

Used in: [`cart/initialized`](#cartinitialized-emits), [`cart/merged`](#cartmerged-emits-and-listens), [`cart/updated`](#cartupdated-emits-and-listens).

\```ts
interface CartModel {
  id: string;
  totalQuantity: number;
  items: Item[];
  // ... full definition
}
\```
```

## Code-First Extraction Strategy

Following the established pattern:

1. **Type definitions extracted from source** - All `interface`, `type`, and `enum` definitions come from TypeScript source files
2. **Descriptions from enrichment** - Editorial context added via `models` section in enrichment files
3. **Automatic linking** - Events that use each model are automatically linked
4. **Consistent with functions** - Same format and structure as function Data Models sections

## Files Modified

### Core Implementation
- `scripts/@generate-event-docs.js` - Main generator logic
- `_dropin-templates/dropin-events.mdx` - Added documentation comment

### Documentation
- `_dropin-enrichments/README.md` - Updated with models section documentation
- `_dropin-enrichments/cart/events.json` - Added model descriptions example

### Generated Files (All Regenerated)
- `src/content/docs/dropins/cart/events.mdx`
- `src/content/docs/dropins/checkout/events.mdx`
- `src/content/docs/dropins/order/events.mdx`
- `src/content/docs/dropins/personalization/events.mdx`
- `src/content/docs/dropins/product-details/events.mdx`
- `src/content/docs/dropins/product-discovery/events.mdx`
- `src/content/docs/dropins/recommendations/events.mdx`
- `src/content/docs/dropins/user-account/events.mdx`
- `src/content/docs/dropins/user-auth/events.mdx`
- `src/content/docs/dropins/wishlist/events.mdx`
- `src/content/docs/dropins/payment-services/events.mdx`

## Benefits

✅ **Consistent Documentation** - Events and functions now have identical Data Models sections and payload format
✅ **Simplified Inline Content** - Event payloads show only type references with links, no redundant parameter tables
✅ **Type Discovery** - Developers can see full TypeScript definitions for event payloads in Data Models section
✅ **Automatic Extraction** - No manual maintenance of type definitions
✅ **Cross-Referencing** - Easy navigation between events and their data models
✅ **Editorial Context** - Enrichment descriptions explain what each model represents
✅ **No Duplication** - Type definitions shown once in Data Models section, not repeated in inline tables

## Next Steps

To add model descriptions for other drop-ins:
1. Edit `_dropin-enrichments/{dropin}/events.json`
2. Add `models` section with descriptions
3. Regenerate: `npm run generate-event-docs {dropin}`

Example:
```json
{
  "models": {
    "YourModel": {
      "description": "What this model represents and why it matters"
    }
  }
}
```

