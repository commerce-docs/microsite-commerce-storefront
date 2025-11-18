# Generator Bugs Found During Verification

## Date
November 18, 2025

## Context
During systematic verification of B2B drop-in documentation, multiple generator bugs were discovered that prevent accurate documentation generation.

---

## Bug 1: Company Switcher - No TypeScript-Only Function Extraction

### Severity
**CRITICAL** - Blocks all documentation generation for drop-ins without .mdx files

### Status
The generator produced: "This drop-in currently has no functions defined."

### Root Cause
**Location**: `scripts/@generate-function-docs.js` lines 387-409

```javascript
// Look for function MDX file
const mdxPath = join(entryPath, `${entry}.mdx`);
const tsPath = join(entryPath, `${entry}.ts`);

if (existsSync(mdxPath)) {
    // ... process MDX file...
    // ONLY processes if MDX exists!
}
// NO ELSE CLAUSE for TypeScript-only functions
```

### The Problem
1. Generator scans `src/api` directory for subdirectories
2. For each subdirectory, it looks for `{name}.mdx`
3. **If no .mdx file exists, function is completely skipped**
4. There is NO fallback to extract from TypeScript-only exports

### Impact on Company Switcher
- ✅ **Source has 3 exported functions**: `getCustomerCompanyInfo`, `setCompanyHeaders`, `setGroupHeaders`
- ❌ **No .mdx files exist** in Company Switcher source
- ❌ **Generator finds 0 functions**
- ❌ **Produces empty documentation page**

### Evidence
```bash
# Company Switcher exports (verified in TypeScript):
.temp-repos/boilerplate/scripts/__dropins__/storefront-company-switcher/api/index.d.ts:
  export * from './customerCompanyContext';  // exports getCustomerCompanyInfo
  export * from './setCompanyHeaders';
  export * from './setGroupHeaders';

# But source has no .mdx files:
$ find .temp-repos -path "*storefront-company-switcher/src/api/*" -name "*.mdx"
  (no results)

# Generator output:
"This drop-in currently has no functions defined."
```

### Resolution
✅ **RESOLVED (PARTIAL)** - Manual documentation restored and verified.

Generator improvements made:
- Added `.d.ts` file support
- Added `export declare const` pattern matching  
- Added null check for `mdxContent`

**However**: Company Switcher's architecture (directory name ≠ function name) requires a major generator redesign. Since manual documentation is already verified against source, keeping manual docs is the correct solution.

### Recommendation ~~(Original)~~
~~Add TypeScript-only function extraction as a fallback:~~

```javascript
// Current logic (lines 387-417)
if (existsSync(mdxPath)) {
    // ... process MDX file...
} 
// ADD THIS:
else if (existsSync(tsPath)) {
    // Extract function from TypeScript only
    const tsContent = readFileSync(tsPath, 'utf8');
    const signature = extractFunctionSignature(tsContent, entry);
    
    if (signature) {
        functions.push({
            name: entry,
            mdxContent: null,  // No MDX content
            signature,
            mdxPath: null
        });
    }
}
```

---

## Bug 2: Company Management - Data Models Duplication

### Severity
**CRITICAL** - Produces corrupt documentation with duplicated content

### Status
ALL 27 functions documented TWICE with template fragments mixed in - **BLOCKED**

### Root Cause ✅ IDENTIFIED
**Location**: `scripts/@generate-function-docs.js` + `_dropin-templates/dropin-functions.mdx`

The template comment block contains placeholder names as documentation examples. When `replacePlaceholders()` runs, it replaces these EVERYWHERE in the template, including inside the comment block, causing complete duplication.

### The Problem
```
File structure:
  Lines 1-707: First complete set (functions + data models)
  Lines 708-857: Data Models AGAIN + template comment fragment
  Lines 858-871: Template comment tail  <-- THIS SHOULDN'T BE HERE
  Lines 872-918: Full header/intro/table AGAIN
  Lines 919-1569: All functions AGAIN
  Lines 1573-1724: Data Models AGAIN
```

### Evidence
```bash
$ grep "^## Data Models$" functions.mdx
708:## Data Models      # First occurrence (correct)
1573:## Data Models     # Second occurrence (BUG)

$ grep "^## allowCompanyRegistration$" functions.mdx  
72:## allowCompanyRegistration     # First (inside initial template expansion)
919:## allowCompanyRegistration    # Second (after duplicate template injection)

$ wc -l functions.mdx
1724 functions.mdx    # Should be ~862 lines (half the current size)
```

### Visual Evidence
Lines 857-871 show template comment fragment appearing AFTER data models:

```markdown
856:}
857:```
858:
859| → All function documentation (generated from source .mdx files)
860|  
861|  The script handles:
862|  - Reading function .mdx files from src/api directories...
863|  
864|  HEADING HIERARCHY:
865:  H1: "Company Management functions" (from title)
866|  ...
867|*/}
868|
869|import TableWrapper from '@components/TableWrapper.astro';
870|import Link from '@components/Link.astro';
871|import { Aside } from '@astrojs/starlight/components';
```

This is the TAIL END of the template comment block that should only appear at the top!

### Attempted Fix
Code added at `scripts/@generate-function-docs.js` lines 1887-1908 to remove template comment block BEFORE placeholder replacement.

### Why Fix Didn't Work ❌
Debug logging never appeared, revealing that `generateFunctionsMDX()` is NOT being called for Company Management. Control flow investigation needed.

### Recommendation
**Option A (2-3 hours)**: Deep investigation of `generator-core.js` control flow to find where `scannedData.functions` is lost between scanner and content generator.

**Option B (1 hour)**: Extract manual documentation from Company Management source repository (29 well-documented `.mdx` files already exist).

**Option C**: Document findings and deprioritize until higher priority work is complete.

---

## Bug 3: Wrong Return Types

### Severity
**MAJOR** - Many functions document incorrect return types

### Status
10+ Company Management functions show `Returns void` when they return specific types

### Examples

| Function | Documented | Actual | Impact |
|----------|-----------|--------|---------|
| `getCompanyUser` | `void` | `CompanyUserModel \| null` | ❌ Wrong |
| `getCompany` | `void` | `CompanyModel \| null` | ❌ Wrong |
| `getCompanyStructure` | `void` | `CompanyStructureNode[]` | ❌ Wrong |
| `updateCompanyStructure` | `void` | `boolean` | ❌ Wrong |
| `updateCompanyTeam` | `void` | `boolean` | ❌ Wrong |
| `updateCompanyUser` | `void` | `boolean` | ❌ Wrong |
| `createCompanyUser` | `void` | `CreateCompanyUserResult \| null` | ❌ Wrong |
| `deleteCompanyTeam` | `void` | `boolean` | ❌ Wrong |
| `createCompanyTeam` | `void` | ??? | ❌ Wrong |
| `fetchUserPermissions` | `void` | ??? | ❌ Wrong |

### Root Cause
**Hypothesis**: Type inference is falling back to `void` when it cannot extract return types from TypeScript definitions.

**Location**: Likely in `extractFunctionSignature()` or return type analysis

### Evidence
```typescript
// TypeScript definition shows specific types:
export declare function getCompanyUser(id: string): Promise<CompanyUserModel | null>;
export declare function updateCompanyTeam(input: UpdateCompanyTeamInput): Promise<boolean>;

// But documentation shows:
Returns `void`.
```

### Recommendation
1. Check TypeScript extraction in `extractFunctionSignature()`
2. Verify return type analyzer is working for these functions
3. Add fallback that preserves `Promise<any>` instead of defaulting to `void`

---

## Impact Summary

### Drop-ins Affected
- ❌ **Company Switcher**: 0/3 functions documented (0%)
- ❌ **Company Management**: 0/27 functions accurate (0%)
- ✅ **Requisition List**: 9/9 functions accurate (100%)
- ❓ **Purchase Order**: Not yet verified
- ❓ **Quote Management**: Not yet verified

### Blocker Status
**Cannot continue verification** until generators are fixed:
- Company Switcher needs TypeScript-only extraction
- Company Management needs duplication bug fix
- All B2B drop-ins may have wrong return types

---

## Next Steps

### Priority 1: Fix Company Switcher Generator
Add TypeScript-only function extraction fallback

### Priority 2: Fix Company Management Duplication
Debug `dataModelsSection` template leakage

### Priority 3: Fix Return Type Inference
Ensure proper TypeScript return type extraction

### Priority 4: Regenerate and Verify
After fixes, regenerate all B2B drop-ins and re-verify

---

## Verification Status

| Drop-in | Functions | Events | Generator Status | Verification Status |
|---------|-----------|--------|------------------|---------------------|
| Company Switcher | 3 | 1 | ❌ Broken | ⏸️ Paused |
| Requisition List | 9 | 5 | ✅ Working | ✅ Complete (100%) |
| Company Management | 27 | 2 | ❌ Broken | ⏸️ Paused |
| Purchase Order | 30+ | 5 | ❓ Unknown | ⏸️ Not started |
| Quote Management | 40+ | 19 | ❓ Unknown | ⏸️ Not started |

---

## Conclusion

Three critical generator bugs prevent accurate B2B documentation:
1. No TypeScript-only function extraction
2. Data models duplication with template leakage
3. Wrong return type inference

**Recommendation**: Fix generators before continuing verification.

