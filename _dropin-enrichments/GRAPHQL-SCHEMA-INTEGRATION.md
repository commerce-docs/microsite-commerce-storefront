# GraphQL Schema Integration Guide

This guide explains how to add GraphQL schema files to improve automatic parameter description generation.

## Overview

The documentation generator can extract parameter types and descriptions from GraphQL schema files. This provides:
- **Accurate type information** for parameters
- **Field-level descriptions** from GraphQL schema documentation
- **Enum values and descriptions** for type parameters
- **Required field information** from GraphQL schema

## Directory Structure

```
.temp-repos/
├── commerce-graphql-schemas/
│   ├── cart/
│   │   ├── addProductsToCart.graphql
│   │   ├── applyCoupons.graphql
│   │   └── ...
│   ├── customer/
│   │   ├── createCustomer.graphql
│   │   ├── customerAddress.graphql
│   │   └── ...
│   └── ...
```

## Obtaining GraphQL Schemas

### Method 1: Introspection Query

Use GraphQL introspection to export your Commerce schema:

```bash
# Using curl
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name kind description fields { name description type { name kind ofType { name kind } } } } } }"}' \
  https://your-commerce-instance.com/graphql > schema.json

# Using graphql-cli (if installed)
graphql get-schema --endpoint https://your-commerce-instance.com/graphql
```

### Method 2: From Adobe Commerce Documentation

Extract schema definitions from the [Adobe Commerce GraphQL API Reference](https://developer.adobe.com/commerce/webapi/graphql/reference/).

### Method 3: From Commerce Codebase

If you have access to the Commerce codebase, schema files are located in:
```
app/code/Magento/*/etc/schema.graphqls
```

## Schema File Format

### Option 1: GraphQL Schema Definition Language (SDL)

```graphql
# addProductsToCart.graphql

"""
Defines a single product to add to the cart
"""
input CartItemInput {
  """
  The product SKU. For configurable products, use the child product SKU.
  """
  sku: String!
  
  """
  The SKU of the parent configurable product (if applicable)
  """
  parent_sku: String
  
  """
  The quantity to add to the cart
  """
  quantity: Float!
  
  """
  An array of selected configurable option UIDs
  """
  selected_options: [String!]
  
  """
  An array of entered options for customizable products
  """
  entered_options: [EnteredOptionInput!]
}

"""
Defines entered option values for customizable products
"""
input EnteredOptionInput {
  """
  The unique identifier of the custom option field
  """
  uid: ID!
  
  """
  The text the customer entered
  """
  value: String!
}
```

### Option 2: JSON Schema Format

```json
{
  "CartItemInput": {
    "description": "Defines a single product to add to the cart",
    "fields": {
      "sku": {
        "type": "String!",
        "description": "The product SKU. For configurable products, use the child product SKU."
      },
      "parent_sku": {
        "type": "String",
        "description": "The SKU of the parent configurable product (if applicable)"
      },
      "quantity": {
        "type": "Float!",
        "description": "The quantity to add to the cart"
      },
      "selected_options": {
        "type": "[String!]",
        "description": "An array of selected configurable option UIDs"
      },
      "entered_options": {
        "type": "[EnteredOptionInput!]",
        "description": "An array of entered options for customizable products"
      }
    }
  }
}
```

## Integration with Parameter Patterns

The schema integration works alongside parameter patterns:

1. **Schema provides**: Type information, required status, and technical descriptions from GraphQL
2. **Patterns provide**: Developer-friendly context, examples, and best practices
3. **Enrichments provide**: Drop-in-specific customizations and additional context

### Priority Order

When generating parameter descriptions, the system uses this priority:

```
Enrichment (manual) → Schema (GraphQL) → Pattern (template) → Default
```

## Example: Enhanced Parameter Table

With GraphQL schema integration, the parameter table becomes more detailed:

**Before (patterns only):**
| Parameter | Type | Req? | Description |
|-----------|------|------|-------------|
| sku | string | Yes | The product identifier (SKU). |

**After (schema + patterns):**
| Parameter | Type | Req? | Description |
|-----------|------|------|-------------|
| sku | String! | Yes | The product identifier (SKU). For configurable products (like a shirt available in multiple colors and sizes), use the child product SKU that represents the specific variant selected by the customer (e.g., `MS09-M-Blue` for a medium blue shirt). See the [products query](https://developer.adobe.com/commerce/webapi/graphql/schema/catalog-service/queries/products/) to retrieve product information. |

Notice how the schema provides the exact type (`String!`), while the pattern provides the developer-friendly explanation.

## Adding Schema Support to Generators

To add schema support to a documentation generator:

```javascript
import { loadGraphQLSchema, getParameterFromSchema } from './lib/graphql-schema.js';

// Load schema for a specific mutation/query
const schema = loadGraphQLSchema('addProductsToCart');

// Extract parameter info
const paramInfo = getParameterFromSchema(schema, 'CartItemInput', 'sku');

console.log(paramInfo);
// {
//   type: 'String!',
//   required: true,
//   description: 'The product SKU. For configurable products, use the child product SKU.',
//   defaultValue: null
// }
```

## Creating New Schema Files

When adding a new GraphQL schema file:

1. **Name it after the mutation/query**: `addProductsToCart.graphql`
2. **Include all input types**: Document the full hierarchy
3. **Add descriptions**: Use triple-quote comments for all types and fields
4. **Mark required fields**: Use `!` for required fields
5. **Document enums**: Include all possible values with descriptions

### Example: Complete Schema File

```graphql
"""
Strategy for applying coupon codes to the cart
"""
enum ApplyCouponsStrategy {
  """
  Append new coupons to existing ones
  """
  APPEND
  
  """
  Replace all existing coupons with new ones
  """
  REPLACE
}

"""
Input for applying coupons to a cart
"""
input ApplyCouponsInput {
  """
  Array of coupon codes to apply
  """
  cart_id: String!
  
  """
  The coupon codes to apply
  """
  coupon_codes: [String!]!
  
  """
  How to apply the coupons (APPEND or REPLACE)
  """
  type: ApplyCouponsStrategy!
}
```

## Benefits

Adding GraphQL schemas provides:

- ✅ **Accurate type information** (String, Int, Float, Boolean, etc.)
- ✅ **Required field detection** (GraphQL `!` suffix)
- ✅ **Enum value documentation** (all possible values listed)
- ✅ **Nested type structure** (object hierarchies)
- ✅ **Reduced enrichment maintenance** (less manual documentation needed)
- ✅ **Single source of truth** (schema matches Commerce backend)

## Maintenance

### When to Update Schemas

Update schema files when:
- Adobe Commerce adds new fields to existing types
- New mutations/queries are introduced
- Field descriptions change in Commerce
- New enum values are added

### Version Control

Consider organizing schemas by Commerce version:

```
.temp-repos/
├── commerce-graphql-schemas/
│   ├── 2.4.6/
│   ├── 2.4.7/
│   └── latest/ (symlink to current version)
```

## Resources

- [Adobe Commerce GraphQL API Reference](https://developer.adobe.com/commerce/webapi/graphql/reference/)
- [GraphQL Schema Definition Language Spec](https://spec.graphql.org/October2021/#sec-Type-System)
- [GraphQL Introspection Guide](https://graphql.org/learn/introspection/)

## Next Steps

1. Extract schemas from your Commerce instance using introspection
2. Organize schemas by mutation/query name
3. Add descriptions to all types and fields
4. Update the generator to use the new schema files
5. Run validation to ensure consistency

For questions or issues, refer to the [Parameter Patterns README](./PARAMETER-PATTERNS-README.md).

