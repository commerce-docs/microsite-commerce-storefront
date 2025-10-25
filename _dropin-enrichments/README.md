# Drop-in Enrichment System

This directory contains enrichment data for auto-generated drop-in documentation. Enrichment files allow you to preserve manually written, high-quality documentation while still benefiting from automated generation.

## How It Works

The documentation generators (`scripts/@generate-function-docs.js` and `scripts/@generate-event-docs.js`) automatically look for enrichment files in this directory. If found, they merge the enriched content with auto-generated content, giving priority to the enriched versions.

## Directory Structure

```
_dropin-enrichments/
  {dropin-name}/
    functions.json   # Enriched function documentation
    events.json      # Enriched event documentation
```

Example:
```
_dropin-enrichments/
  user-auth/
    functions.json
    events.json
  cart/
    functions.json
    events.json
```

## Enrichment File Formats

### functions.json

Each `functions.json` file is a JSON object where:
- **Keys** = function names (must match exactly)
- **Values** = enrichment objects with optional fields like `description`, `usage`, `parameters`, `returns`, `events`, etc.

### Basic Structure

```json
{
  "functionName": {
    "description": "Detailed description with context, links, and explanation",
    "parameters": [
      ["Parameter", "Type", "Req?", "Description"],
      ["param1", "string", "Yes", "Description of parameter"]
    ],
    "returns": "Description of what the function returns",
    "events": "Description of events emitted by this function",
    "examples": [
      {
        "title": "Example title",
        "code": "functionName(param: value);"
      }
    ]
  },
  "simpleFunction": {
    "description": "You can enrich just description"
  },
  "anotherFunction": {
    "description": "Or combine any fields you want",
    "usage": "functionName();" 
  }
}
```

**Note**: All enrichment fields are optional. Use only the fields you need.

### Complete Example

```json
{
  "getCustomerToken": {
    "description": "The `getCustomerToken` function handles the sign-in operation. It requires `userName` and `password` parameters and performs the following actions under the hood:\n\n1. Retrieves the customer token.\n2. Fetches customer data using the token.\n3. Sets the `auth_dropin_firstname` and `auth_dropin_user_token` cookies.\n4. Publishes an [Adobe Client Data Layer (ACDL)](https://github.com/adobe/adobe-client-data-layer) event.\n5. Emits an \"authenticated\" event.\n\nYou can use the `getCustomerToken` function to build a custom authentication flow that remains fully integrated with other drop-in components. The function calls the [`generateCustomerToken` mutation](https://developer.adobe.com/commerce/webapi/graphql/schema/customer/mutations/generate-token/).",
    "usage": "import { getCustomerToken } from '@/auth/api/getCustomerToken';\n\ngetCustomerToken(email: \"user@example.com\", password: \"SecurePassword123\");"
  },
  "getStoreConfig": {
    "description": "The `getStoreConfig` function uses the [`storeConfig` query](https://developer.adobe.com/commerce/webapi/graphql/schema/store/queries/store-config/) to retrieve store configuration data.",
    "usage": "import { getStoreConfig } from '@/auth/api/getStoreConfig';\n\ngetStoreConfig();"
  }
}
```

### Fields

All fields are **optional** - use only what you need:

> **⚠️ Important:** Do NOT use JSX components (like `<CodeInclude>`, `<Aside>`, etc.) with variable references in enrichment data. Use plain Markdown/text instead. See examples below for recommended approaches.

- **description** (string): Enhanced function description
  - Provide context, explain behavior, link to GraphQL docs
  - Supports Markdown formatting including links
  - Use `\n\n` for paragraph breaks in JSON
  - Escape quotes with `\"`
  - If omitted, auto-generated description is used

- **parameters** (array): Parameter documentation for OptionsTable component
  - First array element is header: `["Parameter", "Type", "Req?", "Description"]`
  - Each subsequent array is a parameter: `["name", "type", "Yes/No", "description"]`
  - Generates formatted OptionsTable in output
  - If omitted, no parameters table is shown

- **returns** (string): Return value documentation
  - Describe what the function returns
  - Can include type information and structure
  - Supports Markdown formatting (including code blocks)
  - **Do NOT use JSX components** (like `<CodeInclude>`) with variable references
  - **Recommended approaches:**
    - Simple reference: `"Returns a CartModel object. See [types](link) for details."`
    - Inline code block: Use `\n\n\`\`\`typescript\ninterface Type {...}\n\`\`\``
    - Structured description: List key fields with descriptions
  - If omitted, no returns section is shown

- **events** (string): Events emitted by this function
  - Describe which events are emitted and when
  - Can mention data payloads
  - Supports Markdown formatting
  - If omitted, no events section is shown

- **examples** (array): Multiple usage examples
  - Array of objects with `title` (optional) and `code` (required)
  - Each example can have a descriptive title
  - Code is automatically wrapped in TypeScript blocks
  - Use `\n` for line breaks in code
  - If omitted, auto-generated example is used (if available)

- **usage** (string): Single usage example (backward compatible)
  - Simple alternative to `examples` array
  - Automatically wrapped in TypeScript code block
  - Use `\n` for line breaks
  - If omitted, auto-generated example is used

### Documenting Return Types - Best Practices

There are three recommended ways to document complex return types without using JSX components:

#### Approach 1: Simple Reference with Link (Recommended)

```json
{
  "returns": "Returns a promise that resolves to an `OrderDataModel` object. See the [Order types](https://github.com/adobe-commerce/storefront-order/blob/main/src/types/index.ts) for the complete type definition."
}
```

**Pros:** Clean, maintainable, links to source of truth  
**Cons:** Requires external navigation

#### Approach 2: Inline TypeScript Code Block

```json
{
  "returns": "Returns a promise that resolves to an `OrderDataModel` object with the following structure:\n\n```typescript\ninterface OrderDataModel {\n  id: string;\n  status: string;\n  items: OrderItem[];\n  total: number;\n}\n```"
}
```

**Pros:** Complete information in one place  
**Cons:** Verbose, needs manual updates if types change

#### Approach 3: Structured Field Description

```json
{
  "returns": "Returns a promise that resolves to an `OrderDataModel` object containing:\n- `id` (string) - The order identifier\n- `status` (string) - Current order status\n- `items` (array) - Array of order items\n- `total` (number) - Order total amount"
}
```

**Pros:** Readable, highlights important fields  
**Cons:** May not show complete structure

#### ❌ What NOT to Do

```json
{
  "returns": "Returns CartModel:\n\n<CodeInclude code={cartModel} lang=\"ts\" />"
}
```

**Why it fails:** The `{cartModel}` variable is not defined in the MDX scope, causing runtime errors.

### events.json

Each `events.json` file is a JSON object where:
- **Keys** = event names (must match exactly, including slashes like `cart/updated`)
- **Values** = enrichment objects with `description` field

#### Basic Structure

```json
{
  "eventName": {
    "description": "Detailed description explaining when the event is emitted/listened, what data it carries, and common use cases"
  }
}
```

#### Complete Example

```json
{
  "cart/data": {
    "description": "Triggered when cart data is available or changes. This event carries the full cart state including items, totals, and applied discounts. External code can emit this event to update the cart programmatically or subscribe to it to react to cart changes."
  },
  "cart/initialized": {
    "description": "Emitted after the Cart drop-in completes its initialization sequence. This event signals that the cart is ready to accept user interactions and process cart operations."
  }
}
```

#### Fields

- **description** (string): Enhanced event description
  - Explain when the event fires and what triggers it
  - Describe the data payload and its purpose
  - Provide use cases for listening/emitting
  - Supports Markdown formatting
  - If omitted, auto-generated description is used

## Benefits

✅ **Preserved Improvements** - Manual enhancements survive regeneration  
✅ **Optional** - Drop-ins without enrichment files work fine  
✅ **Incremental** - Enrich just a few functions or all of them  
✅ **Version Controlled** - Easy to review changes  
✅ **Selective** - Pick which fields to enrich (description, usage, or both)

## Example: User Auth

See `user-auth/functions.json` for a complete example with 11 enriched functions including:

- GraphQL mutation/query links
- Behavioral explanations (e.g., what `getCustomerToken` does internally)
- Realistic usage examples with actual data
- Business context (e.g., building custom auth flows)

## Workflow

1. **Create enrichment directory** for your drop-in
   ```bash
   mkdir -p _dropin-enrichments/my-dropin
   ```

2. **Create functions.json** with enriched content
   ```bash
   touch _dropin-enrichments/my-dropin/functions.json
   ```

3. **Run generator** - it automatically picks up enrichment
   ```bash
   npm run generate-function-docs my-dropin
   ```

4. **Verify output** - check that enriched content appears in generated file
   ```
   src/content/docs/dropins/my-dropin/functions.mdx
   ```

## When to Enrich

Consider enriching when:

- Auto-generated descriptions are too generic
- Functions have complex behavior that needs explanation
- GraphQL schema links would help developers
- Usage examples need realistic data instead of placeholders
- Business context is important (e.g., "use this to build custom flows")

## Notes

- Enrichment files are **not** required - the generator works fine without them
- You can enrich **some** functions and leave others auto-generated
- Enrichment data is **merged** with generated data (enriched takes precedence)
- Function signatures are **always** extracted from source code (not enriched)
- Changes to enrichment files require **regeneration** to take effect

