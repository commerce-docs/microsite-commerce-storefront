# Phase 2: React & Markdown Patterns - Implementation Plan

**Start Date**: October 31, 2025  
**Estimated Duration**: 6-8 hours  
**Status**: Planning

## Overview

Phase 2 focuses on creating shared libraries for the remaining 4 duplication patterns found in generators that don't deal with TypeScript type extraction.

## Pattern Analysis

### Pattern 1: React Props Extraction 🎯

**Found In**: Container Generator (19K), Slot Generator (9.9K)

**Common Code** (duplicated across both):
```javascript
// Finding Props interface in external type files
function findPropsInTypeFiles(repoPath, containerName) {
    const possiblePaths = [
        join(repoPath, 'src', 'containers', containerName, 'types.ts'),
        join(repoPath, 'src', 'containers', containerName, `${containerName}.types.ts`),
        join(repoPath, 'src', 'types', 'containers.ts'),
        join(repoPath, 'src', 'types', `${containerName}.ts`)
    ];
    // ... search logic
}

// Extracting JSDoc comments
function extractJSDocDescription(text, propertyName) {
    // ... JSDoc parsing logic
}

// Parsing Props interface
function parsePropsInterface(interfaceContent, fullText) {
    // ... property extraction
}
```

**Estimated Duplication**: 80-100 lines

**New Library**: `scripts/lib/react/props-extractor.js`
- Extract Props interfaces from `.tsx` files
- Find Props in external type files
- Parse JSDoc comments
- Extract property types and required status

---

### Pattern 2: Markdown Table Generation 🎯

**Found In**: Container (19K), Function (71K), Initialization (8K)

**Common Code**:
```javascript
// Sanitizing text for markdown tables
function sanitizeForMarkdown(text) {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|')
        .replace(/\*/g, '\\*')
        // ... more escaping
}

// Generating tables with proper formatting
function generateConfigurationsTable(configurations) {
    return configurations.map(prop => {
        const required = prop.required ? 'Yes' : 'No';
        const type = sanitizeForMarkdown(prop.type);
        return `| \`${prop.name}\` | \`${type}\` | ${required} | ... |`;
    }).join('\n');
}
```

**Estimated Duplication**: 60-80 lines

**New Library**: `scripts/lib/markdown/table-generator.js`
- Sanitize text for markdown tables
- Generate property/parameter tables
- Handle TableWrapper component integration
- Consistent column formatting

---

### Pattern 3: Usage Example Generation 🎯

**Found In**: Container (19K), Function (71K), possibly others

**Common Code**:
```javascript
// Generating code examples
function generateUsageExample(componentName, props, config) {
    let example = `\`\`\`jsx
import { ${componentName} } from '${config.packageName}';

export default function MyComponent() {
  return (
    <${componentName}`;
    
    // Add example props based on types
    if (props.length > 0) {
        props.forEach(prop => {
            if (prop.type.includes('string')) {
                example += `      ${prop.name}="example"\n`;
            } else if (prop.type.includes('boolean')) {
                example += `      ${prop.name}={true}\n`;
            }
            // ... more type handling
        });
    }
    
    example += '/>\n  );\n}\n\`\`\`';
    return example;
}
```

**Estimated Duplication**: 40-60 lines

**New Library**: `scripts/lib/markdown/example-generator.js`
- Generate React component examples
- Generate function call examples
- Infer example values from types
- Format code blocks consistently

---

### Pattern 4: Property Description Generation 🎯

**Found In**: Container (19K), Initialization (8K)

**Common Code**:
```javascript
// Auto-generating property descriptions from names
function generatePropertyDescription(propertyName, propertyType) {
    // Common patterns
    if (propertyName === 'className') {
        return 'Additional CSS classes to apply';
    }
    if (propertyName.startsWith('on')) {
        const action = propertyName.substring(2);
        return `Callback function triggered when ${action}...`;
    }
    if (propertyType.includes('boolean')) {
        if (propertyName.startsWith('is')) {
            return `Whether the ${state} is active`;
        }
    }
    // ... many more patterns
}
```

**Estimated Duplication**: 50-70 lines

**New Library**: `scripts/lib/description-generator.js`
- Generate property descriptions from names
- Handle common prop patterns (className, onClick, etc.)
- Infer from type information
- Fallback to generic descriptions

---

## Implementation Order

### Stage 1: Markdown Utilities (Highest ROI)
**Time**: 2-3 hours

1. **`lib/markdown/table-generator.js`**
   - Used by 3+ generators
   - Clear duplication
   - Easy to extract

2. **`lib/markdown/example-generator.js`**
   - Used by 2 generators
   - Medium complexity
   - High value

**Refactor**: Function generator (replace existing table logic)

---

### Stage 2: React Extraction (Medium ROI)
**Time**: 2-3 hours

3. **`lib/react/props-extractor.js`**
   - Used by Container + Slot
   - 80-100 lines to save
   - Specialized but clear

**Refactor**: Container generator, then Slot generator

---

### Stage 3: Description Generation (Lower ROI)
**Time**: 1-2 hours

4. **`lib/description-generator.js`**
   - Used by 2 generators
   - 50-70 lines to save
   - Nice-to-have

**Refactor**: Container generator, Initialization generator

---

## Expected Outcomes

### Code Reduction

| Generator | Current Lines | Est. After | Savings | % Reduction |
|-----------|---------------|------------|---------|-------------|
| Container | ~600 | ~520 | 80 | 13% |
| Slot | ~300 | ~250 | 50 | 17% |
| Initialization | ~235 | ~210 | 25 | 11% |
| Function | 1,664 | 1,630 | 34 | 2% |
| **TOTAL** | **2,799** | **2,610** | **189** | **7%** |

### New Shared Libraries

1. `lib/markdown/table-generator.js` (~100 lines)
2. `lib/markdown/example-generator.js` (~80 lines)
3. `lib/react/props-extractor.js` (~120 lines)
4. `lib/description-generator.js` (~90 lines)

**Total New Shared Code**: ~390 lines

### Combined Impact (Phase 1 + Phase 2)

**Total Lines Saved**: 290 + 189 = **479 lines**  
**Total Shared Libraries**: 5 + 4 = **9 libraries**  
**Total Shared Code**: 1,032 + 390 = **1,422 lines**

## Testing Strategy

### Per-Library Testing
- Unit tests for each new library
- Test edge cases (empty data, malformed input, etc.)
- Verify markdown escaping

### Per-Generator Testing
- Test before/after refactor
- Compare generated output
- No regressions in functionality

### Integration Testing
- Run all generators on all drop-ins
- Verify documentation builds
- Check for broken links

## Success Criteria

✅ All 4 new libraries created and tested  
✅ Container generator refactored  
✅ Slot generator refactored  
✅ Initialization generator refactored  
✅ Function generator uses new table-generator  
✅ Zero linter errors  
✅ No regressions in generated docs  
✅ Comprehensive documentation

## Risk Mitigation

### Risk: React extraction is more complex than TypeScript
**Mitigation**: Start with clear examples, iterate based on failures

### Risk: Markdown sanitization breaks existing formatting
**Mitigation**: Compare before/after output, verify with builds

### Risk: Generated descriptions are worse than existing
**Mitigation**: Keep existing descriptions in enrichment files as override

## Next Steps

1. ✅ Declare Phase 1 complete
2. Create `lib/markdown/table-generator.js`
3. Create `lib/markdown/example-generator.js`
4. Refactor Function generator to use new table generator (proof of concept)
5. Create `lib/react/props-extractor.js`
6. Refactor Container generator
7. Refactor Slot generator
8. Create `lib/description-generator.js`
9. Refactor Initialization generator
10. Final testing and documentation

---

**Estimated Completion**: November 1-2, 2025  
**Total Time Investment (Both Phases)**: 12-14 hours  
**Total Value**: 479 lines saved + 1,422 lines of reusable shared code

