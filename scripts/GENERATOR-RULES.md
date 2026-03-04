# Generator Rules

Rules that all documentation generators must follow. See also `.cursor/rules/` for AI guidance.

## Source Code is Source of Truth for Parameters

**TypeScript and source code define what exists. Enrichment files enhance descriptions—they never add parameters.**

| What | Source | Enrichment |
|------|--------|------------|
| **Parameters** (names, types, required) | TypeScript / source | None—only document what exists |
| **Descriptions** | JSDoc (fallback) | Richer text when available |

### Implementation

1. Extract parameters from source (Props interfaces, function signatures).
2. Use enrichment for descriptions: `enrichment?.parameters?.[name]?.description || prop.description`.
3. **Never** add parameters from enrichment that are not in the source.
4. **Never** override types or required status from enrichment.

### Rationale

Enrichment files contain curated, human-written descriptions that are often richer than JSDoc. But parameter existence, types, and required status must come from the actual API—otherwise docs can drift from reality.

### Exception: Elsie Container Base Props

Elsie `Container<Props, Data>` adds `initialData?: Data` at runtime—it is not in the Props interface. The props extractor detects `Container<` in the component file and adds `initialData` when `includeContainerBaseProps: true`. Skips adding if the Props interface already declares `initialData` (e.g. ProductList).

## Context-Appropriate Example Values

**Example values should be inferred from prop/parameter names and types to guide developers.**

Avoid generic placeholders when a more specific example would help. Use the name and type to choose an appropriate value.

### Patterns

| Name/Type pattern | Example value | Rationale |
|-------------------|---------------|------------|
| `reference`, `referenceNumber` | `"REF-12345"` | Suggests reference-number format |
| `sku`, `uid`, `id` | `"PRODUCT-SKU-123"`, `"abc-123"` | Identifier formats |
| `email` | `"user@example.com"` | Valid email format |
| `url`, `href` | `"https://example.com"` | Valid URL |
| `onXChange`, `onXBlur` | `(x) => console.log('X', x)` | Include the value param in callbacks |
| `quantity`, `count`, `size` | `1`, `10` | Numeric context |

### Implementation

- **example-generator.js**: `inferExampleValue(type, propName)` and `inferCallbackParamName(propName)` implement these patterns.
- When adding new prop types or names, add a matching pattern if a more guiding example exists.
- If the format varies by system (e.g. PO numbers), use a generic-but-recognizable format (e.g. `"REF-12345"`).

## Richer Description Rule

**Prefer existing (human-edited) descriptions over generated ones, unless the existing is known junk.** Use enrichment for the source of truth; when no enrichment exists, generators preserve existing content by default. Only overwrite when existing matches a short list of known-bad patterns (empty, placeholder, generic template phrases).

### Definition

A description is **richer** when it:

- Is more specific to the domain (e.g. "query execution or facet loading" vs "an error occurs")
- Includes concrete examples or use cases (e.g. "user behavior, cart contents, or product associations")
- Explains *when* or *why* the thing happens, not just *what* it is
- Uses developer-relevant terminology (e.g. "Emitted when" for events, "Callback when" for handlers)

A description is **generic** when it:

- Could apply to many similar items (e.g. "data is available or changes", "an error occurs")
- Lacks domain context or examples
- Is purely structural (e.g. "form or configuration values change")

### Workflow

| Scenario | Action |
|----------|--------|
| **Original is richer** | Add the original description to enrichment. The generator will use it and produce consistent output. |
| **Generated is richer** | Add the generated description to the generator (pattern, fallback, or enrichment) so it is **perfectly repeated** for every generation. Do not rely on manual edits—they will be overwritten. |

### Implementation

- **Event descriptions**: `generateEventDescription()` patterns + `_dropin-enrichments/{dropin}/events.json`. Add specific patterns (e.g. `search/error`, `recommendations/data`) before generic ones.
- **Container/parameter descriptions**: `_dropin-enrichments/{dropin}/containers.json` for params; `generatePropertyDescription()` for fallbacks.
- **Consistency**: When the generator produces a good description, it must produce it every run. Use enrichment or generator patterns—never rely on one-off manual edits in generated files.

### Automatic richness detection (all generators)

**Every generator** that produces descriptions now applies the Richer Description Rule when no enrichment exists:

1. Reads the existing output file (if present)
2. Extracts descriptions using content-specific extractors (`lib/content-extractor.js`, `lib/event-extractor.js`)
3. Prefers existing over generated unless existing is known junk (`isRicherDescription()` in `lib/richer-description.js`)
4. Uses existing when it exists and is not junk; otherwise uses generated

**Strategy: Prefer existing unless junk.** No scoring—only a short list of known-bad patterns (empty, placeholder text, "Configuration object for X."). This avoids overwriting good human content. Add new junk patterns sparingly when a clear case is found.

| Generator | Extractor | Content type |
|-----------|-----------|--------------|
| Events | `extractExistingEventDescriptions` | Event descriptions per `### \`eventName\`` section |
| Initialization | `extractExistingModelDescriptions`, `extractExistingIntroParagraph`, `extractExistingDropinConfigIntro`, `extractExistingConfigOptionDescriptions` | Model descriptions, main intro paragraph, Drop-in configuration section intro, config option descriptions |
| Containers | `extractExistingParameterDescriptions` | Parameter descriptions per container file |
| Functions | `extractExistingFunctionDescriptions` | Function description (intro paragraph) per ## section |
| Functions | `extractExistingFunctionParameterDescriptions` | Parameter descriptions per `## functionName` section |
| Slots | `extractExistingSlotDescriptions` | Slot descriptions per `### SlotName slot` section |
| Styles | `extractExistingStylesContent` | Customization intro, container classes section |
| Merchant blocks | `extractExistingBlockDescription` | Block description (first paragraph) |
| Quick Start | `extractQuickExampleIntro` + `preserveRicherQuickExampleIntro` | Intro paragraph in ## Quick example section |

This preserves manually improved descriptions until they can be added to enrichment.

### Quick Start: preserve richer intro in ## Quick example

The quick-start generator uses `mergeOptions: { preserveRicherQuickExampleIntro: true }`. When merging, it extracts the intro paragraph (between `## Quick example` and the first code block) from both the existing file and the generated content. If the existing paragraph is not junk (per `isRicherDescription`), it is preserved. This prevents generators from removing manually added helpful context (e.g. domain-specific setup notes, prerequisites) in the Quick example section.

## Preserve Rich Content via Enrichment (All Drop-Ins)

**When the generator produces empty or generic content where richer descriptions exist, add them to the correct enrichment file. This applies to ALL drop-ins—not just one.**

### Intro paragraphs

The initialization generator uses `enrichmentData?.intro` for the first paragraph. Add domain-specific intros to `_dropin-enrichments/{dropin}/initialization.json`.

### Config/parameter descriptions

The initialization generator uses `generateConfigDescription()` for pattern-based fallbacks (authHeaderConfig, apiUrl, getCustomerToken, storeViewCode, etc.). Add new patterns there for config options that appear across multiple drop-ins. Use enrichment for drop-in-specific nuance.

When the generator outputs an empty description cell (e.g. `| \`disableGuestCart\` | \`boolean\` | No |  |`) but the original had a richer description, add it to enrichment:

- **Initialization config**: `_dropin-enrichments/{dropin}/initialization.json` → `config.{paramName}.description`
- **Container params**: `_dropin-enrichments/{dropin}/containers.json` → `{ContainerName}.parameters.{paramName}.description`
- **Functions, events, etc.**: Use the corresponding enrichment file for that doc type.

### Implementation

- Apply this rule for every drop-in: cart, checkout, order, wishlist, payment-services, quote-management, etc.
- Create the enrichment file if it doesn't exist (e.g. `cart/initialization.json`).
- **mergePreservingPreamble** preserves existing content when the file exists, but after reset-to-HEAD the file may have generic content. Enrichment ensures the generator produces the rich content from the start.

## Example Accuracy (Essential for Developers)

**Code examples must be accurate and copy-pasteable. Developers rely on them to learn.**

### Import paths

- **Cart**: Use `@dropins/storefront-cart/api.js` for `getCartData`, `addProductsToCart`, etc. — **not** `functions.js`.
- Other drop-ins: Use `api.js`, `render.js`, `containers/` as documented.

### Null safety

- `getCartData()` returns `Promise<CartModel | null>`. Use explicit throw: `async () => { const cart = await getCartData(); if (!cart) throw new Error('Cart not initialized'); return cart.id; }` — never `(await getCartData()).id` (throws when cart is null). This ensures `getCartId` returns `Promise<string>` as required.

### Verification

Run all three after generating docs:

- `npm run verify:examples` — anti-patterns, import validation against node_modules
- `npm run typecheck:examples` — TypeScript check on provider.render examples
- `npm run test:example-runtime` — run example with imports (requires `pnpm add -D jsdom`)

### Implementation

- **example-generator.js**: `sanitizeDiscoveredConfig()` and `inferExampleValue()` use correct paths and null-safe patterns.
- **example-scanner.js**: `docFriendlyConfig()` replaces test mocks with null-safe equivalents.

## Code-Discovered Examples (Experiment)

**lib/example-scanner.js** scans boilerplate, checkout examples, and drop-in source for `provider.render(ContainerName, { ... })` patterns and extracts the actual config objects used. When a discovered example exists, the container generator uses it instead of heuristics—producing code-accurate examples from real usage.

- **CreditCard**: Discovered from boilerplate checkout → `getCartId: () => ctx.cartId, creditCardFormRef`
- **ApplePay**: Discovered from payment-services html-host → `location`, `getCartId`, `onSuccess`, `onError` (sanitized to doc-friendly values)

## Preserve Custom Sections (Anchor Heading)

**Generators must never delete custom sections (e.g. Prerequisites, Admin configuration) that appear before the template's main content.**

### Problem

The default merge logic treats "preamble" as everything before the first `##` heading. Any custom `##` sections (Prerequisites, Admin config, etc.) that sit before the template's first heading were considered "body" and got replaced—causing dangerous deletions.

### Solution

Use `mergeOptions: { anchorHeading: 'Quick example' }` (or the appropriate anchor for that doc type). This tells `mergePreservingPreamble` to:

- **Preserve** everything before `## Quick example` in the existing file—including custom `##` sections
- **Replace** only from `## Quick example` onward with generated content

### Implementation

- Quick-start generator: `mergeOptions: { anchorHeading: 'Quick example' }` (already set)
- Other generators that have a known "anchor" heading before which custom content may exist: add `mergeOptions: { anchorHeading: '...' }` to their config

### Fallback (anchor not found)

If the anchor heading does not exist in the existing file or generated content, the merge falls back to the first `##` behavior: preamble = before first ##, body = from first ##. No data loss or empty body.

## Normalize Excessive Blank Lines

**Generators must never add blank lines.** All MDX output is normalized to collapse 2+ consecutive blank lines to 1 (at most one blank line between blocks). This happens in `mergePreservingPreamble()` before writing. Templates should avoid blank lines around empty placeholders; the generator adds only the newlines needed when placeholders have content.

## Preserve TableWrapper nowrap Values

**Generators must never change `TableWrapper nowrap={...}` values.** When a file exists, `mergePreservingPreamble` extracts all nowrap values from the existing content and applies them to the merged output by position. This preserves manually curated wrapping behavior (e.g. `[0]` for function index vs `[0,1]` for param tables). Generators should not hardcode or compute nowrap—existing values always win.

## Verify Generated Descriptions Against Source

**Generated descriptions should be checked against the source (JSDoc, docs, implementation) before being treated as accurate.**

When adding or changing auto-generated descriptions (e.g. in `description-generator.js`, `inferExampleValue`, or enrichment fallbacks), verify against:

- JSDoc comments in the source
- Drop-in documentation (e.g. `src/docs/intro.mdx`, API docs in the source repo)
- Implementation usage (how the parameter is used in code)

Do not infer descriptions from other docs or assume accuracy—verify first.
