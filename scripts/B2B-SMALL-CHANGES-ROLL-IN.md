# B2B Small Changes – Roll-In Tracking

**Purpose:** Track all fixes and improvements made during b2b-small-changes testing so they can be verified and rolled into the main generators. When testing is complete, every item below should be committed as part of the generator improvements.

**Process:** Run `npm run b2b-small-changes` (or `npm run run-dropin-generators`) → review output → fix generators/enrichments → re-run → repeat until output is correct. Document each fix here. For diff review: `npm run diff-b2b-generated`.

---

## Generator & Script Changes

| Fix | File(s) | Status |
|-----|---------|--------|
| TypeScript source of truth for parameters (no enrichment-only params) | `@generate-container-docs.js` | ✅ |
| Remove incorrect quoteData from enrichment (QuoteTemplateHistoryLog, QuoteTemplateCommentsList) | `_dropin-enrichments/quote-management/containers.json` | ✅ |
| Dictionary: trim trailing newlines to avoid extra blank line before ``` | `@generate-dictionary-docs.js` | ✅ |
| Dictionary: expanded JSON formatting for readability | `@generate-dictionary-docs.js` | ✅ |
| Example generator: infer callback param names (onXChange → (x) => ...) | `lib/markdown/example-generator.js` | ✅ |
| Example generator: context-appropriate values (reference → "REF-12345") | `lib/markdown/example-generator.js` | ✅ |
| Fix generate-all-docs script name (generate-merchant-block-docs → generate-merchant-docs) | `generate-all-docs.js` | ✅ |
| Prefer project package.json versions over boilerplate (fixes 3.0.0→3.0.1 for payment-services) | `lib/generator-core.js` | ✅ |
| Sync version in preserved preamble to match generated body | `lib/preserve-preamble.js` | ✅ |
| Anchor-heading merge: preserve custom sections (Prerequisites, Admin config) before ## Quick example | `lib/preserve-preamble.js`, `@generate-quick-start-docs.js`, `lib/generator-core.js` | ✅ |
| Example scanner: variable tracing for `render(Component, params)` (merge `params.getCartId`, `params.createCart` into base config) | `lib/example-scanner.js` | ✅ |
| Example generator: config sanitization (replace bare identifiers with doc-friendly values: location→PaymentLocation.CHECKOUT, getCartId, onSuccess, onError) | `lib/markdown/example-generator.js` | ✅ |
| Example generator: format config object (one property per line, proper indentation) | `lib/markdown/example-generator.js` | ✅ |
| Example accuracy: getCartData import path (api.js not functions.js) | `lib/markdown/example-generator.js`, `lib/example-scanner.js` | ✅ |
| Example accuracy: null-safe getCartData (optional chaining `?.id`) | `lib/markdown/example-generator.js`, `lib/example-scanner.js` | ✅ |
| Example verification script (verify:examples) | `scripts/verify-examples.js`, `GENERATOR-RULES.md` | ✅ |
| getCartId: throw when null (not optional chaining) for `Promise<string>` | `lib/markdown/example-generator.js`, `lib/example-scanner.js` | ✅ |
| Example runtime test (test:example-runtime, jsdom) | `scripts/test-example-runtime.mjs`, `package.json` | ✅ |
| Example typecheck (typecheck:examples) | `scripts/typecheck-examples.mjs`, `package.json` | ✅ |
| Import validation against node_modules in verify-examples | `scripts/verify-examples.js` | ✅ |
| Container index: use description from existing MDX when no enrichment/JSDoc | `@generate-container-docs.js` | ✅ |
| Event docs: git checkout main before pull (handles detached HEAD from other generators) | `@generate-event-docs.js` | ✅ |
| Payload validator: match `any` as type token only, not substring (e.g. companyName) | `lib/payload-type-validator.js` | ✅ |
| Event description: richer `search/error` (query execution, facet loading) | `@generate-event-docs.js` | ✅ |
| Event description: richer `recommendations/data` (user behavior, cart, associations) | `@generate-event-docs.js` | ✅ |
| Event description: bidirectional events use "Emitted when" (not "Triggered when") | `@generate-event-docs.js` | ✅ |
| Container: Elsie `initialData` for `Container<Props, Data>` components | `lib/react/props-extractor.js`, `lib/description-generator.js`, `@generate-container-docs.js` | ✅ |
| Container: `usageIntro` enrichment override for Usage section | `_dropin-templates/dropin-container.mdx`, `@generate-container-docs.js` | ✅ |
| Initialization: richer-description for intro paragraph and Drop-in config intro | `lib/content-extractor.js`, `@generate-initialization-docs.js` | ✅ |
| Slots: richer-description for slot descriptions | `lib/content-extractor.js`, `@generate-slot-docs.js` | ✅ |
| Styles: richer-description for customization intro and container classes | `lib/content-extractor.js`, `@generate-styles-docs.js` | ✅ |
| Merchant blocks: richer-description for block descriptions | `lib/content-extractor.js`, `@generate-merchant-block-docs.js` | ✅ |
| Initialization: richer-description for config options (was outputting empty when no enrichment) | `lib/content-extractor.js` (extractExistingConfigOptionDescriptions), `@generate-initialization-docs.js` | ✅ |
| Extractors: fix table parsing for types containing \| (was capturing wrong column) | `lib/content-extractor.js` (config, container, function param extractors) | ✅ |
| **Systemic**: Pattern-based config descriptions in `generateConfigDescription()` | `lib/description-generator.js` | ✅ |
| **Systemic**: Init generator uses generateConfigDescription fallback (never empty for known config options) | `@generate-initialization-docs.js` | ✅ |
| **Systemic**: Enrichment for user-account, user-auth (authHeaderConfig), payment-services (apiUrl, getCustomerToken, storeViewCode) | `_dropin-enrichments/*/initialization.json` | ✅ |
| **Systemic**: Container prop patterns in generatePropertyDescription (productData, orderData, hide*, route*, status, carousel, etc.) | `lib/description-generator.js` | ✅ |
| Fix: basePath used before initialization in container generator | `@generate-container-docs.js` | ✅ |
| Container index: Richer Description Rule for index row descriptions | `lib/content-extractor.js` (extractExistingContainerIndexDescriptions), `@generate-container-docs.js` (generateOverviewPage) | ✅ |
| **apply-b2b-small-changes: restore from backup not git** (was reverting 6+ change files to git, undoing good generator output) | `apply-b2b-small-changes.js` | ✅ |
| **apply-b2b-small-changes: diff backup vs generator** (was diffing git vs generator; now compares pre-run state vs generator output) | `apply-b2b-small-changes.js` | ✅ |
| **Integrate into generators; new run-dropin-generators script** (generators overwrite junk; b2b-small-changes now just runs generators, no backup/restore) | `@generate-container-docs.js`, `run-dropin-generators.js`, `package.json` | ✅ |
| **Container: sync first body paragraph with enrichment** (not just frontmatter; overwrites junk in preamble) | `@generate-container-docs.js` | ✅ |
| **Preserve paths** (preserve-paths.json + CLI; generators skip files in list) | `lib/preserve-paths.js`, `preserve-paths.js`, `@generate-*.js` | ✅ |

---

## Enrichment Additions

| Fix | File(s) | Status |
|-----|---------|--------|
| Payment Services: rich intro paragraph | `_dropin-enrichments/payment-services/initialization.json` | ✅ |
| Cart: disableGuestCart config description | `_dropin-enrichments/cart/initialization.json` | ✅ |
| Event bus doc link: /dropins/all/events/ (not /sdk/reference/events/) for "Learn more about the event system" | `_dropin-enrichments/purchase-order/events.json`, `_dropin-enrichments/company-management/events.json` | ✅ |
| Company Management: payload type override for company/updated (replace unknown with concrete type) | `_dropin-enrichments/company-management/events.json` | ✅ |
| Product Discovery: search/error description (query execution, facet loading) | `_dropin-enrichments/product-discovery/events.json` | ✅ |
| Recommendations: recommendations/data description (user behavior, cart, associations) | `_dropin-enrichments/recommendations/events.json`, `@generate-event-docs.js` | ✅ |
| Cart: CartSummaryGrid parameters, slots, usageIntro, example | `_dropin-enrichments/cart/containers.json` | ✅ |
| Cart: CartSummaryList override_template (preserve manual doc) | `_dropin-enrichments/cart/containers.json` | ✅ |
| Cart: intro paragraph (richer Cart initializer description) | `_dropin-enrichments/cart/initialization.json` | ✅ |
| Recommendations: RecommendationUnitModel description (Adobe Sensei, product suggestions, etc.) | `_dropin-enrichments/recommendations/initialization.json` | ✅ |

---

## Rules & Documentation

| Fix | File(s) | Status |
|-----|---------|--------|
| Source-of-truth rule (TypeScript for params, enrichment for descriptions) | `GENERATOR-RULES.md`, `.cursor/rules/source-code-parameters-truth.mdc` | ✅ |
| Context-appropriate example values rule | `GENERATOR-RULES.md`, `.cursor/rules/context-appropriate-examples.mdc` | ✅ |
| Preserve rich intro paragraphs via enrichment rule | `GENERATOR-RULES.md` | ✅ |
| Preserve rich content via enrichment (all drop-ins) | `GENERATOR-RULES.md`, `.cursor/rules/preserve-rich-content-enrichment.mdc` | ✅ |
| Rule references in generator headers | `@generate-container-docs.js`, `@generate-function-docs.js`, `@generate-slot-docs.js` | ✅ |
| Example generator rule comment | `lib/markdown/example-generator.js` | ✅ |
| Elsie Container base props exception (initialData) | `GENERATOR-RULES.md` | ✅ |
| Richer Description Rule (original vs generated; enrichment vs generator) | `GENERATOR-RULES.md` | ✅ |

---

## Roll-In Checklist

Before considering b2b-small-changes testing complete:

- [ ] All generator changes above are committed
- [ ] All enrichment files are committed
- [ ] All rules/docs are committed
- [ ] `npm run b2b-small-changes` produces acceptable output
- [ ] No regressions: run full `npm run generate-all-docs` (or key generators) and spot-check
- [ ] Delete or archive this tracking doc if no longer needed (or keep for future reference)

---

## Adding New Fixes

When you fix something during b2b-small-changes testing:

1. Add a row to the appropriate table above (Generator, Enrichment, or Rules)
2. Set Status to ✅ when done
3. Before final commit, run through the Roll-In Checklist
