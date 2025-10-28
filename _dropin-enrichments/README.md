# Drop-in Enrichment System

This directory contains enrichment data for auto-generated drop-in documentation. Enrichment files allow you to preserve manually written, high-quality documentation while still benefiting from automated generation.

## How It Works

The functions generator (`scripts/@generate-function-docs.js`) automatically looks for enrichment files in this directory. If found, it merges the enriched content with auto-generated content, giving priority to the enriched versions.

## Directory Structure

```
_dropin-enrichments/
  {dropin-name}/
    functions.json
```

Example:
```
_dropin-enrichments/
  user-auth/
    functions.json
  cart/
    functions.json
```

## Enrichment File Format

Each `functions.json` file is a JSON object where:
- **Keys** = function names (must match exactly)
- **Values** = enrichment objects with optional `description` and `usage` fields

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
  - Supports Markdown formatting
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

