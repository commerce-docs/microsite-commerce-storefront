# Generator Infrastructure

This directory contains the complete documentation generation system for Adobe Commerce Drop-ins.

## Architecture

The generator infrastructure is organized into:

### Core Generators (`scripts/@generate-*.js`)
- `@generate-event-docs.js` - Event documentation
- `@generate-function-docs.js` - Function documentation  
- `@generate-container-docs.js` - React container documentation
- `@generate-slot-docs.js` - Slot documentation
- `@generate-dictionary-docs.js` - Dictionary/i18n documentation
- `@generate-initialization-docs.js` - Initialization documentation

### Shared Libraries (`scripts/lib/`)

**Phase 1: TypeScript Type Handling**
- `core/generic-type-handler.js` - Identifies and validates generic types
- `core/enrichment-loader.js` - Loads enrichment files
- `core/type-extractor.js` - Extracts TypeScript definitions
- `core/cross-dropin-resolver.js` - Resolves cross-dropin types
- `core/data-models-generator.js` - Generates Data Models sections

**Phase 2: React & Markdown**
- `react/props-extractor.js` - Extracts React component props
- `markdown/table-generator.js` - Generates markdown tables
- `markdown/example-generator.js` - Generates code examples
- `markdown/empty-state-generator.js` - Generates empty state pages
- `description-generator.js` - Auto-generates descriptions

**Supporting Libraries**
- `event-enrichment.js` - Event-specific enrichment handling
- `function-type-validator.js` - Function signature validation
- `payload-type-validator.js` - Event payload validation
- `type-inference.js` - 10-strategy type inference system
- `dictionary-processor.js` - Dictionary processing utilities
- And more...

### Templates (`_dropin-templates/`)
- MDX templates for all documentation types
- Consistent structure and formatting
- Placeholder-based content injection

### Enrichments (`_dropin-enrichments/`)
- Editorial descriptions for events, functions, etc.
- Parameter patterns and descriptions
- Organized by drop-in

### Validation Scripts
- `validate-all-types.js` - Master validation runner
- `validate-event-payloads.js` - Event payload validation
- `validate-function-types.js` - Function type validation
- `validate-parameter-patterns.js` - Parameter naming validation

## Key Features

### 1. Code-First Documentation
- Extracts types from source TypeScript files
- Infers types when explicit definitions missing
- Generates documentation from code structure

### 2. Quality Gates
- Automated detection of generic types (`any`, `unknown`, etc.)
- Build fails if type quality issues detected
- Ensures complete type documentation

### 3. DRY Architecture
- Shared libraries eliminate duplication
- Update logic once, affects all generators
- Consistent output across all documentation

### 4. Cross-Dropin Support
- Handles events that span multiple drop-ins
- Resolves types from source drop-ins
- Generates proper cross-references

### 5. Enrichment System
- Editorial descriptions complement code extraction
- Pattern-based parameter documentation
- Maintainer-friendly JSON format

## Testing

### Run Test Suite

```bash
npm run test:generators
```

This will:
1. Test all generators with sample drop-in (cart)
2. Verify validation scripts work
3. Report success/failure for each generator
4. Count generated documentation files as proof

### Run Individual Generators

```bash
# Generate event documentation for cart
node scripts/@generate-event-docs.js cart

# Generate function documentation for all drop-ins
node scripts/@generate-function-docs.js

# Generate all documentation
node scripts/generate-all-docs.js
```

### Run Validation

```bash
# Validate all types
npm run validate:types

# Validate specific types
node scripts/validate-event-payloads.js
node scripts/validate-function-types.js
```

## Adding New Generators

1. Create generator script in `scripts/@generate-*.js`
2. Import shared libraries from `scripts/lib/`
3. Use existing templates or create new ones in `_dropin-templates/`
4. Add enrichment support via `_dropin-enrichments/`
5. Add validation if needed
6. Add to `scripts/generate-all-docs.js`
7. Add test to `scripts/test-generators.js`

## Package.json Scripts

```json
{
  "generate:events": "node scripts/@generate-event-docs.js",
  "generate:functions": "node scripts/@generate-function-docs.js",
  "generate:all": "node scripts/generate-all-docs.js",
  "validate:types": "node scripts/validate-all-types.js",
  "test:generators": "node scripts/test-generators.js",
  "upstream:issues": "node scripts/generate-upstream-issues.js"
}
```

## Metrics

**Code Reuse:**
- Phase 1: 5 shared libraries → Event & Function generators
- Phase 2: 4 shared libraries → Container, Slot, Init generators  
- ~70% code reduction in generators

**Type Coverage:**
- 10-strategy type inference system
- 90%+ type coverage across all drop-ins
- Automated validation prevents regression

**Documentation Generated:**
- 11 drop-ins × ~8 doc types = ~88 pages
- All from TypeScript source + enrichments
- Fully automated regeneration

## Benefits

✅ **Maintainability**: Update logic once in shared libraries  
✅ **Consistency**: Same formatting and quality across all docs  
✅ **Quality**: Automated validation prevents generic types  
✅ **Speed**: Generate all docs in seconds  
✅ **Accuracy**: Code-first approach stays in sync with source  
✅ **Scalability**: Easy to add new drop-ins or doc types  

## Architecture Decisions

### Why Shared Libraries?
Before refactoring, each generator had duplicate logic for:
- Type extraction
- Enrichment loading
- Markdown generation
- Validation

Now: Extract once, use everywhere.

### Why Code-First?
TypeScript source is the source of truth. Extracting from code ensures:
- Documentation stays in sync with implementation
- Type information is always accurate
- Less manual maintenance required

### Why Enrichments?
While code provides structure, humans provide clarity:
- Editorial descriptions explain "why" not just "what"
- Usage examples show best practices
- Parameter patterns provide consistency

### Why Validation?
Automated quality gates prevent:
- Generic types leaking into documentation
- Missing type information
- Inconsistent parameter naming
- Documentation gaps

## Future Enhancements

- [ ] Generate JSDoc comments in source from enrichments
- [ ] Auto-generate enrichments from AI analysis
- [ ] Visual diff tool for doc changes
- [ ] Performance optimization for large-scale generation
- [ ] Plugin system for custom generators

## Questions?

For technical questions about the generator infrastructure, see:
- Individual generator source files (well-commented)
- Shared library documentation (JSDoc)
- Test suite for usage examples

---

**This infrastructure represents a complete, production-ready documentation generation system built for scale, quality, and maintainability.**

