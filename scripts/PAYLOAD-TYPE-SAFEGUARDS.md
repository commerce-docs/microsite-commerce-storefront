# Type Quality Safeguards

This document explains the automatic safeguards that prevent generic/useless types (like `any`, `unknown`, `object`) from appearing in generated event and function documentation.

## Automatic Protection Layers

### 1. **Generation-Time Logic** (`@generate-event-docs.js`)

The event generator has built-in logic that automatically handles generic types:

#### Line 1042-1043: Detect Generic Types
```javascript
const hasGenericType = currentType === 'any' || (currentType && currentType.includes('any'));
if (!hasPayloadOverride && (!typedEvents.has(eventName) || hasGenericType)) {
```

**What it does:**
- Detects when a type is `any` or contains `any` (like `{ oldCartItems: any[] }`)
- When found, checks if a cross-dropin event has a proper type override in its source drop-in's enrichment

#### Line 1105-1108: Skip Displaying Generic Types
```javascript
const hasGenericType = typeDefinition === 'any' || typeDefinition.includes('any');
if (hasGenericType) {
    // Don't display generic types - leave payload section empty
}
```

**What it does:**
- If a generic type can't be replaced with a proper type, it leaves the payload section empty
- This prevents `any` from being shown to users

#### Line 186-197: Multiple Event Type File Names
```javascript
const possibleEventsPaths = [
    join(repoPath, 'src/types/events.d.ts'),
    join(repoPath, 'src/types/event-bus.d.ts')
];
```

**What it does:**
- Checks for both common event type file naming conventions
- Ensures TypeScript definitions are found regardless of naming

### 2. **Post-Generation Validation** (`payload-type-validator.js`)

After all documentation is generated, an automatic validator scans every event page.

#### Forbidden Types Detected:
- `any` (standalone)
- `unknown` (standalone)
- `object` (standalone)
- `Object` (standalone)
- Types containing `any` (excluding legitimate uses like `{ [key: string]: any }`)

#### Legitimate Exceptions:
The validator allows `any` in these specific cases:
- Index signatures: `{ [key: string]: any }`
- Record types: `Record<string, any>`

These represent dynamic structures where `any` is the appropriate type from the source code.

#### Validation Runs Automatically:
```javascript
// In @generate-event-docs.js at end of main()
const validationSuccess = validateAllEventDocs(projectRoot);
if (!validationSuccess) {
    process.exit(1); // Fails the build
}
```

**Result:** If generic types are detected, the generator **fails with exit code 1**, preventing bad documentation from being committed.

### 3. **Manual Validation Scripts**

#### Event Payloads Only:
```bash
npm run validate-event-payloads
```

#### Function Signatures Only:
```bash
npm run validate-function-types
```

#### All Documentation:
```bash
npm run validate-all-types
```

Use these to:
- Check documentation quality after manual edits
- Verify fixes before committing
- Run in CI/CD pipelines
- Audit documentation quality without regenerating

## How to Fix Detected Issues

When validation fails, you'll see output like:
```
❌ Found generic type issues:

  dropins/checkout/events.mdx
    Event: cart/merged
    Issue: Type contains generic "any"
    Type: { oldCartItems: any[] }
```

### Solution: Add Enrichment Override

1. Open the **source drop-in's** enrichment file (where the event is emitted):
   ```
   _dropin-enrichments/cart/events.json
   ```

2. Add a `payload` field with the proper type:
   ```json
   {
     "cart/merged": {
       "description": "...",
       "payload": "{\n  oldCartItems: Item[] | null;\n  newCart: CartModel | null;\n}"
     }
   }
   ```

3. Regenerate documentation:
   ```bash
   npm run generate-event-docs
   ```

The generator will now use your enrichment override instead of the generic type.

## Type Resolution Hierarchy

The generator follows this priority order for event payload types:

1. **Enrichment override** (string `payload` field in enrichment file)
2. **Cross-dropin enrichment** (if listening to another drop-in's event)
3. **TypeScript definition** (from `events.d.ts` or `event-bus.d.ts`)
4. **Type inference** (10-strategy checklist from source code)
5. **Empty payload section** (if nothing found)

Generic types trigger cross-dropin checks, which often find proper types from the source drop-in.

## What Gets Checked

### ✅ Automatically Validated:
- All event payload types in generated MDX files
- Types extracted from TypeScript definitions
- Types from enrichment overrides
- Cross-dropin event types

### ❌ NOT Validated (Intentionally):
- Descriptive text containing words like "any" ("any existing items")
- Legitimate dynamic types from source: `{ [key: string]: any }`
- Model definitions in Data Models section (validated separately)

## Integration Points

These safeguards are integrated into:

1. **Event Generator** (`@generate-event-docs.js`)
   - Runs validation automatically after generation
   - Fails on validation errors

2. **Package Scripts** (`package.json`)
   ```json
   "generate-event-docs": "node scripts/@generate-event-docs.js",
   "validate-event-payloads": "node scripts/validate-event-payloads.js"
   ```

3. **Generate All Docs** (`generate-all-docs.js`)
   - Can be integrated to run validation after all generation

## Adding to CI/CD

To ensure documentation quality in pull requests:

```yaml
# .github/workflows/docs-validation.yml
- name: Validate Event Documentation
  run: npm run validate-event-payloads
```

This prevents PRs with generic types from being merged.

## Function Documentation Validation

While event documentation has **automatic validation** integrated into the generator, function documentation currently has **manual validation only**.

### Current State (Functions)

Run `npm run validate-function-types` to check for:
- Generic `any` types in function signatures
- Generic `unknown`, `object`, or `Object` types
- Parameters typed as `any` without proper definitions

### Known Issues (To Fix)

As of now, there are 5 known issues with generic types in function documentation:
1. `publishShoppingCartViewEvent` (Cart) - return type `any` should be `void`
2. `setPaymentMethodAndPlaceOrder` (Order) - parameter `paymentMethod: any`
3. `setProductConfigurationValid` (Product Details) - callback return type `any`
4. `setProductConfigurationValues` (Product Details) - callback return type `any`
5. `publishRecsItemAddToCartClick` (Recommendations) - return type `any`

These should be fixed in the function generator's type extraction logic.

### Future Enhancement

Once these issues are fixed, function validation can be integrated into `@generate-function-docs.js` (like events) to automatically fail builds when generic types are introduced.

## Summary

**Your documentation is protected by:**

1. ✅ **Event Documentation**: Fully protected with automatic validation
   - Smart generation logic that replaces generic types with proper types from enrichments
   - Automatic validation that fails builds if generic types slip through
   - Cross-dropin resolution that finds proper types even when listening to other drop-ins' events
   - Manual validation script for checking anytime

2. ⚠️  **Function Documentation**: Protected with manual validation
   - Validation scripts available to run manually
   - 5 known issues to be fixed in generator
   - Can be integrated into generator after fixes are complete

**Result:** Event documentation is automatically protected. Function documentation has validation tools ready but requires manual checks until generator issues are fixed.

