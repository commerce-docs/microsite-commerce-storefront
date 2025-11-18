# Generator Bug Fix Summary

## Executive Summary

Attempted to fix 3 critical generator bugs affecting B2B drop-in documentation:
- ✅ **Bug 1 (Company Switcher)**: PARTIALLY RESOLVED - Manual documentation restored
- ⏸️ **Bug 2 (Company Management)**: BLOCKED - Root cause identified but control flow issue prevents fix
- ⏸️ **Bug 3 (Return Types)**: NOT STARTED - Depends on Bug 2 resolution

## Bug 1: Company Switcher - No Functions Documented

### Problem
Generator produced "This drop-in currently has no functions defined" despite Company Switcher having 3 exported functions:
- `getCustomerCompanyInfo()`
- `setCompanyHeaders()`
- `setGroupHeaders()`

### Root Cause
**Architectural Mismatch**: Generator assumes `directory name = function name`, but Company Switcher violates this:
- Directory: `setCompanyHeaders/` → Function: `getCompanyHeaderManager()`
- Directory: `setGroupHeaders/` → Function: `getGroupHeaderManager()`
- Directory: `customerCompanyContext/` → Function: `getCustomerCompanyInfo()`

### Generator Improvements Made
1. Added `.d.ts` file support (lines 389-390)
2. Added `export declare const` pattern matching (line 465)
3. Added null check for `mdxContent` (line 1228)
4. Added TypeScript-only function extraction (lines 417-438)

### Resolution
**MANUAL DOCUMENTATION KEPT** - Attempting to fix the generator would require a major architectural redesign. Since manual documentation already exists and is verified against source TypeScript definitions, keeping manual docs is the correct solution.

**Files Restored**: 
- `src/content/docs/dropins-b2b/company-switcher/functions.mdx` (272 lines, 3 functions)
- `src/content/docs/dropins-b2b/company-switcher/events.mdx` (405 lines, 1 event)

### Verification
✅ All function signatures verified against:
- `.temp-repos/boilerplate/scripts/__dropins__/storefront-company-switcher/api/`
- TypeScript definition files (`.d.ts`)
- Boilerplate integration examples

## Bug 2: Company Management - Duplicate Functions

### Problem
All 27 functions documented TWICE:
- File size: 1724 lines (should be ~862)
- Functions appear at lines 54-883 AND lines 919+
- Template comment block appears in output with replaced placeholders

### Root Cause IDENTIFIED ✅
The template file (`_dropin-templates/dropin-functions.mdx`) contains a comment block with placeholder names as **documentation examples**:

```markdown
{/*
  Placeholders used in this template:
  - DROPIN_NAME → Display name (e.g., "Cart", "Checkout")
  - DROPIN_DISPLAY_NAME → Display name for use in text
  - DROPIN_VERSION → Version number (e.g., "1.5.1")
  - FUNCTIONS_TABLE → Table listing all functions with brief descriptions
  - FUNCTIONS_CONTENT → All function documentation
*/}
```

When `replacePlaceholders()` executes, it replaces these placeholders **everywhere** in the template, including inside the comment block, causing the entire comment block to become part of the generated documentation.

### Attempted Fix
Added code to remove template comment block BEFORE placeholder replacement:

```javascript
// scripts/@generate-function-docs.js lines 1887-1908
const commentStart = template.indexOf('{/*');
const commentEnd = template.indexOf('*/}');

if (commentStart !== -1 && commentEnd !== -1) {
    const commentBlock = template.substring(commentStart, commentEnd + 3);
    if (commentBlock.includes('TEMPLATE USAGE GUIDE')) {
        template = template.substring(0, commentStart) + 
                  template.substring(commentEnd + 3);
    }
}
```

### Why Fix Didn't Work ❌

**Control Flow Mystery**: Debug logging never appeared, revealing that `generateFunctionsMDX()` is NOT being called for Company Management.

Evidence:
```
Scanner: "✓ Found 29 API functions"
Generator: [no debug output, suggests empty function list]
Result: 1724-line file with duplication (unchanged)
```

**Hypothesis**: 
- `scannedData.functions` is populated correctly by scanner
- Something in `generator-core.js` control flow causes functions to be lost/empty when passed to `generateContent()`
- Company Management hits a different code path than other drop-ins
- OR: Old generated file is being cached/preserved

### Investigation Needed
1. Add debug logging throughout `generator-core.js` control flow
2. Trace `scannedData` from scanner return through to `generateContent()` call
3. Check for caching mechanisms or file preservation logic
4. Determine why Company Management behaves differently from other drop-ins

**Estimated Time**: 2-3 hours of deep investigation

### Status
**BLOCKED** - Cannot apply fix until control flow issue is resolved.

## Bug 3: Wrong Return Types

### Problem
Many Company Management functions show `void` return type when they should return specific types:
- `createCompanyTeam()`: Shows `void`, should be specific type
- `createCompanyUser()`: Shows `void`, should be specific type
- `deleteCompanyTeam()`: Shows `void`, should be specific type
- etc. (10+ functions affected)

### Root Cause
**UNKNOWN** - Likely related to Bug 2 duplication issue. Type inference fallback logic in `generateFunctionsMDX()` may be broken by the same control flow problem.

### Status
**NOT STARTED** - Blocked by Bug 2. Must fix duplication first to determine if return type issues persist.

## Files Modified

### Generator Scripts
- `scripts/@generate-function-docs.js` - Added TypeScript-only extraction, template comment removal
- `scripts/lib/generator-core.js` - No changes (investigation needed here)
- `_dropin-templates/dropin-functions.mdx` - No changes (template intact)

### Documentation Files
- `src/content/docs/dropins-b2b/company-switcher/functions.mdx` - Restored manual documentation (272 lines)
- `src/content/docs/dropins-b2b/company-switcher/events.mdx` - Restored manual documentation (405 lines)
- `src/content/docs/dropins-b2b/company-management/functions.mdx` - UNCHANGED (1724 lines, still has duplication)

### Status Files
- `GENERATOR-BUGS-FOUND.md` - Updated with detailed findings
- `GENERATOR-FIX-SUMMARY.md` - This file
- `BUG-2-STATUS.md` - Detailed Bug 2 analysis

## Recommendations

### Immediate Actions

1. **Company Switcher** ✅ COMPLETE
   - Keep manual documentation (already restored and verified)
   - No further action needed

2. **Company Management** - Choose one:
   - **Option A**: Deep investigation (2-3 hours) to fix control flow and generator
   - **Option B**: Extract manual documentation from source (1 hour) - 29 `.mdx` files already exist in source repository with good quality
   - **Option C**: Live with duplication until higher priority items are complete

3. **Return Types** - Wait for Bug 2 resolution

### Long-term Improvements

1. **Template Design**: Remove placeholder names from template comment blocks to prevent future replacement issues
2. **Generator Architecture**: Consider redesigning to not assume directory name = function name
3. **Debug Logging**: Add comprehensive logging throughout `generator-core.js` for troubleshooting
4. **Validation**: Add post-generation checks for file size anomalies (e.g., >2x expected size)

## Testing Checklist

When Bug 2 is fixed, verify:
- [ ] Company Management functions.mdx is ~862 lines (not 1724)
- [ ] No template comment block appears in generated output
- [ ] Each function appears exactly once
- [ ] Return types are accurate (not defaulting to `void`)
- [ ] Table of contents links work correctly
- [ ] Data Models section appears only once at the end

## Contact Points

If continuing investigation:
1. Start with `scripts/lib/generator-core.js` lines 150-170 (where `generateContent()` is called)
2. Add logging to track `scannedData.functions` value at each step
3. Compare Company Management flow vs. working drop-ins (Cart, Checkout)
4. Check for any special handling of B2B drop-ins vs. B2C

---

**Generated**: 2025-11-18
**Author**: AI Assistant (Claude Sonnet 4.5)
**Status**: Investigation Paused - Awaiting Direction

