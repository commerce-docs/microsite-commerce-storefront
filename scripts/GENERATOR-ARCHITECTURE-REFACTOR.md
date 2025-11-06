# Generator Architecture Refactoring Plan

## Problem Statement

Features and fixes are being added to individual generators (1,366-1,741 lines each) rather than shared libraries. This creates:

- **Duplication**: Same logic implemented multiple times
- **Inconsistency**: Features exist in some generators but not others
- **Maintenance burden**: Bug fixes must be applied to each generator
- **Synchronization hell**: New features require updating 9 generators

## Current State Analysis

### Generators (5,581 total lines):
```
@generate-event-docs.js        1,366 lines
@generate-function-docs.js     1,741 lines
@generate-boilerplate-docs.js    723 lines
@generate-container-docs.js      568 lines
@generate-merchant-block-docs.js 352 lines
@generate-slot-docs.js           292 lines
@generate-initialization-docs.js 234 lines
@generate-installation-docs.js   166 lines
@generate-dictionary-docs.js     139 lines
```

### Shared Libraries (Already Exist):
```
✅ scripts/lib/dropin-config.js       - Repository configuration
✅ scripts/lib/enrichment.js          - Enrichment loading
✅ scripts/lib/event-enrichment.js    - Event-specific enrichment
✅ scripts/lib/parameter-patterns.js  - Parameter description patterns
✅ scripts/lib/type-inference.js      - Type inference (events only!)
✅ scripts/lib/repository.js          - Git operations
✅ scripts/lib/sidebar.js             - Sidebar navigation
✅ scripts/lib/logger.js              - Logging utilities
```

### Recently Added (Event Generator Only):
```
⚠️  Cross-dropin type resolution      - Only in events
⚠️  Generic type detection            - Only in events
⚠️  Automatic validation              - Only in events
⚠️  Data Models section generation    - Only in events
⚠️  Multiple TypeScript file support  - Only in events
```

## What Should Be Shared

### 1. **Type System Libraries** (HIGH PRIORITY)

#### `scripts/lib/type-extractor.js` (NEW)
Extract TypeScript types from source code.

```javascript
// Should work for ANY generator
export class TypeExtractor {
    constructor(dropinPath) {}
    
    // Extract from TypeScript definitions
    extractFromDefinitionFile(filePath, typeName)
    
    // Extract from multiple possible locations
    findTypeDefinition(typeName, searchPaths)
    
    // Handle multiple naming conventions
    findEventTypeFile()  // events.d.ts or event-bus.d.ts
    
    // Extract model definitions
    extractModelDefinition(modelName)
    
    // Extract referenced types
    extractReferencedTypes(typeDefinition)
}
```

**Used by:** Events, Functions, Containers (all need type extraction)

---

#### `scripts/lib/generic-type-handler.js` (NEW)
Detect and replace generic types.

```javascript
export class GenericTypeHandler {
    // Detect generic types
    isGenericType(typeString)  // any, unknown, object, Object
    
    // Check for legitimate uses
    isLegitimateAnyUsage(typeString)  // { [key: string]: any }
    
    // Try to find better type
    findBetterType(eventOrFunction, currentType, enrichments)
    
    // Filter out generic types
    shouldDisplayType(typeString)
}
```

**Used by:** Events, Functions, potentially Containers

---

#### `scripts/lib/cross-dropin-resolver.js` (NEW)
Resolve types across drop-ins.

```javascript
export class CrossDropinResolver {
    // Detect if event/type is from another dropin
    detectSourceDropin(eventName, emits, currentDropin)
    
    // Load enrichment from source dropin
    loadSourceEnrichment(sourceDropin, type)
    
    // Generate external links
    generateExternalLink(sourceDropin, typeName, section)
}
```

**Used by:** Events (currently), potentially Functions, Containers

---

### 2. **Data Models Section Generator** (MEDIUM PRIORITY)

#### `scripts/lib/data-models-generator.js` (NEW)
Generate Data Models sections for any documentation.

```javascript
export class DataModelsGenerator {
    constructor(dropinName, modelDefinitions, enrichments) {}
    
    // Generate Data Models section
    generateDataModelsSection()
    
    // Track model usage
    trackModelUsage(modelName, context)
    
    // Extract model from source
    extractAndTrackModel(modelName)
    
    // Generate model documentation
    generateModelDoc(modelName, definition, description, usedBy)
}
```

**Used by:** Events (currently), should be used by Functions, Containers

---

### 3. **Validation Framework** (HIGH PRIORITY)

#### `scripts/lib/doc-validator.js` (NEW - CONSOLIDATE EXISTING)
Unified validation framework.

```javascript
export class DocValidator {
    constructor(validatorType, projectRoot) {}
    
    // Register validators
    addValidator(name, validatorFn)
    
    // Run all validators
    validateAll()
    
    // Common validators
    validatePayloadTypes()
    validateFunctionSignatures()
    validateParameterTables()
    validateLinks()
    validateExamples()
}
```

**Consolidates:**
- `payload-type-validator.js`
- `function-type-validator.js`
- Future validators

---

### 4. **Template Renderer** (MEDIUM PRIORITY)

#### `scripts/lib/template-renderer.js` (NEW)
Unified template rendering.

```javascript
export class TemplateRenderer {
    constructor(templatePath) {}
    
    // Replace placeholders
    render(replacements)
    
    // Handle repeating sections
    repeatSection(sectionName, items, itemRenderer)
    
    // Handle conditional sections
    conditionalSection(condition, content)
}
```

**Used by:** All generators (currently each has custom logic)

---

### 5. **Enrichment System** (REFACTOR EXISTING)

#### Consolidate enrichment loaders:
```
❌ event-enrichment.js       - Events only
❌ enrichment.js              - Functions?
✅ enrichment-loader.js (NEW) - Unified loader for all generators
```

```javascript
export class EnrichmentLoader {
    load(dropinName, type)  // type: 'events', 'functions', 'containers', etc.
    
    getDescription(item)
    getPayloadOverride(item)
    getParameters(item)
    getModels(item)
}
```

---

## Refactoring Strategy

### Phase 1: Extract Shared Libraries (Week 1)
**Priority: Critical - Prevents further duplication**

1. Create `type-extractor.js` - Extract common type extraction logic
2. Create `generic-type-handler.js` - Extract generic type handling
3. Create `cross-dropin-resolver.js` - Extract cross-dropin logic
4. Create `data-models-generator.js` - Extract Data Models generation
5. Consolidate validation into `doc-validator.js`

**Success Criteria:**
- Event generator uses new libraries (no duplication)
- Libraries have unit tests
- Documentation for each library

---

### Phase 2: Refactor Event Generator (Week 1-2)
**Priority: High - Prove the pattern works**

1. Refactor `@generate-event-docs.js` to use new libraries
2. Reduce from 1,366 lines to ~500 lines (generator logic only)
3. Verify all tests pass
4. Verify validation still works

**Success Criteria:**
- Event generator is simpler
- All existing features work
- Passes all validations

---

### Phase 3: Refactor Function Generator (Week 2)
**Priority: High - Second largest generator**

1. Refactor `@generate-function-docs.js` to use new libraries
2. Add missing features (Data Models, validation)
3. Fix 5 known type issues
4. Reduce from 1,741 lines to ~600 lines

**Success Criteria:**
- Function generator uses shared libraries
- Automatic validation integrated
- Zero generic types in output

---

### Phase 4: Refactor Remaining Generators (Week 3)
**Priority: Medium - Complete the migration**

1. Container generator
2. Slot generator
3. Boilerplate generator
4. Dictionary generator
5. Installation/Initialization generators
6. Merchant block generator

**Success Criteria:**
- All generators use shared libraries
- Consistent patterns across all
- Each generator < 500 lines

---

### Phase 5: Add New Features Once (Ongoing)
**Priority: High - The whole point**

Now when adding features:
1. Add to shared library
2. All generators get it automatically
3. No synchronization needed

**Example:** Want to add GraphQL schema validation?
- Add to `type-extractor.js`
- All generators that extract types get it

---

## Benefits of Refactoring

### Before:
```
Add feature to events:     1,366 lines to modify
Add to functions:         +1,741 lines to modify
Add to containers:        +  568 lines to modify
Add to 6 more generators: +2,906 lines to modify
Total:                    6,581 lines touched
Time:                     2-3 weeks
Bugs:                     High risk (9 implementations)
```

### After:
```
Add feature once:         Modify 1 library (~100 lines)
All generators get it:    Automatically
Total:                    100 lines touched
Time:                     1-2 days
Bugs:                     Low risk (1 implementation)
```

---

## Quick Wins (Can Do Today)

### 1. Create Type Extractor Shell
Extract the type extraction logic from event generator into a library that function generator can also use.

### 2. Create Generic Type Handler
Extract the `hasGenericType` and `isLegitimateAnyUsage` logic into a library.

### 3. Add Validation to Function Generator
Use the existing `function-type-validator.js` to add automatic validation (like events).

### 4. Document the Pattern
Create a "How to Add Features" guide showing how to add features to libraries, not generators.

---

## Recommended Action Plan

### Immediate (This Week):
1. ✅ Acknowledge the problem (done - this document)
2. Create `type-extractor.js` with basics
3. Create `generic-type-handler.js`
4. Refactor event generator to use them (prove it works)

### Short Term (Next 2 Weeks):
1. Create remaining shared libraries
2. Refactor function generator
3. Add validation to function generator
4. Document the new architecture

### Medium Term (Month 1-2):
1. Refactor all remaining generators
2. Create "Add Feature" guide
3. Add unit tests for shared libraries
4. Remove duplicate code

### Long Term (Ongoing):
1. All new features go in libraries
2. Generators become thin wrappers
3. Easy to maintain and extend

---

## File Structure (Proposed)

```
scripts/
├── lib/
│   ├── core/                           # Core generator infrastructure
│   │   ├── type-extractor.js          # NEW: Extract types from source
│   │   ├── generic-type-handler.js    # NEW: Handle generic types
│   │   ├── cross-dropin-resolver.js   # NEW: Cross-dropin resolution
│   │   ├── data-models-generator.js   # NEW: Generate Data Models sections
│   │   ├── enrichment-loader.js       # NEW: Unified enrichment loading
│   │   ├── template-renderer.js       # NEW: Template rendering
│   │   └── doc-validator.js           # NEW: Unified validation
│   │
│   ├── validators/                     # Validation libraries
│   │   ├── payload-type-validator.js  # EXISTS: Event validation
│   │   ├── function-type-validator.js # EXISTS: Function validation
│   │   └── index.js                   # NEW: Export all validators
│   │
│   ├── utilities/                      # Utilities (existing)
│   │   ├── dropin-config.js
│   │   ├── repository.js
│   │   ├── sidebar.js
│   │   ├── logger.js
│   │   └── markdown.js
│   │
│   └── legacy/                         # Old files (to be refactored)
│       ├── event-enrichment.js        # MOVE to core/enrichment-loader.js
│       └── enrichment.js              # MOVE to core/enrichment-loader.js
│
├── @generate-event-docs.js            # REFACTOR: Use lib/core/*
├── @generate-function-docs.js         # REFACTOR: Use lib/core/*
└── ...
```

---

## Measuring Success

### Metrics:
1. **Lines of code in generators**: Should drop by 50-70%
2. **Shared library usage**: All generators use core libraries
3. **Time to add feature**: Hours instead of weeks
4. **Bug rate**: Lower (one implementation, many users)
5. **Test coverage**: Shared libraries have 80%+ coverage

### Red Flags:
- ⚠️ Generator still > 800 lines → Extract more
- ⚠️ Duplicate logic between generators → Needs library
- ⚠️ Feature only in one generator → Needs sharing

---

## Next Steps

**Decision Required:**

1. **Do Nothing**: Continue adding features per-generator (not recommended)
2. **Quick Wins**: Extract 2-3 critical libraries this week
3. **Full Refactor**: Commit to full refactoring plan (recommended)

**Recommendation**: Start with Quick Wins (#2) to prove the pattern, then commit to full refactor.

---

## Questions for Discussion

1. **Timeline**: Can we dedicate 2-3 weeks to this refactoring?
2. **Scope**: Should we refactor all 9 generators or just events + functions?
3. **Testing**: What test coverage do we want for shared libraries?
4. **Breaking Changes**: Are we OK with temporary disruption during refactoring?

---

**Bottom Line**: You're right to be concerned. We need to extract shared infrastructure NOW before the problem gets worse. The sooner we refactor, the less painful it will be.

