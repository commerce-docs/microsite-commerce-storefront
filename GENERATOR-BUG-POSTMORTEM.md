# Generator Bug Postmortem: Missing Requirements Sections

## Date: December 9, 2024

## Severity: CRITICAL

## Summary

The merchant block generator had a critical bug that **completely prevented Requirements sections from being loaded** from the enrichment file. This caused Requirements sections to disappear every time blocks were regenerated.

## Root Cause

**File:** `scripts/@generate-merchant-block-docs.js`  
**Line:** 837  
**Bug:** Incorrect object path access

### The Code Bug

```javascript
// ❌ BROKEN CODE (Line 837)
enrichedRequirement = enrichmentData.requirements?.[blockName];
```

This code assumed the JSON structure was:
```json
{
  "requirements": {
    "commerce-company-profile": "Requirements text..."
  }
}
```

### Actual JSON Structure

**File:** `_dropin-enrichments/merchant-blocks/requirements.json`

```json
{
  "commerce-company-profile": "Requirements text...",
  "commerce-b2b-negotiable-quote": "Requirements text..."
}
```

The structure is **flat**, not nested under a `requirements` key.

### The Fix

```javascript
// ✅ FIXED CODE (Line 837)
enrichedRequirement = enrichmentData[blockName];
```

Direct access to the block name without the non-existent `requirements` wrapper.

## Impact

### What Failed

1. **Every block regeneration** lost Requirements sections
2. **Manual restoration required** after each generation
3. **Loss of verified admin panel paths** that were carefully researched
4. **User confidence** in the generation system eroded

### Timeline of Failures

1. **First occurrence:** Requirements added manually, then lost during regeneration
2. **Second occurrence:** Requirements restored with `requirements.json`, lost again
3. **Third occurrence:** Requirements restored with script, lost during metadata regeneration
4. **Fourth occurrence:** This most recent incident

## Why This Wasn't Caught Earlier

1. **Silent failure:** The code used optional chaining (`?.`) so it never threw an error
2. **Fallback logic:** The generator fell back to README extraction (which didn't work for B2B)
3. **No validation:** No test to verify enrichment files were actually being loaded
4. **No logging:** Generator didn't log when enrichment loading failed

## Permanent Fixes Implemented

### 1. Code Fix ✅

Changed line 837 to direct access without nested key.

### 2. Add Validation (RECOMMENDED)

Add to generator startup:

```javascript
// Validate requirements.json structure
function validateRequirementsEnrichment() {
    const path = '_dropin-enrichments/merchant-blocks/requirements.json';
    try {
        const data = JSON.parse(readFileSync(path, 'utf8'));
        
        // Check that top-level keys are block names (not nested)
        const keys = Object.keys(data);
        if (keys.includes('requirements') || keys.includes('metadata')) {
            console.error('❌ ERROR: requirements.json has incorrect structure!');
            console.error('   Expected: { "block-name": "requirement text" }');
            console.error(`   Found: { "${keys[0]}": ... }`);
            process.exit(1);
        }
        
        console.log(`✅ Loaded ${keys.length} requirements from enrichment`);
        return data;
    } catch (error) {
        console.warn('⚠️  Warning: Could not validate requirements.json');
        return null;
    }
}
```

### 3. Add Logging

Add logging when Requirements are loaded:

```javascript
if (enrichedRequirement) {
    console.log(`  ✅ Loaded requirement for ${blockName} from enrichment`);
    return `## Requirements\n\n${enrichedRequirement}\n\n`;
}
```

### 4. Add Test

Create `scripts/test-enrichment-loading.js`:

```javascript
#!/usr/bin/env node

// Test that enrichment files load correctly

import { readFileSync } from 'fs';

console.log('Testing enrichment file loading...\n');

// Test requirements.json
const requirements = JSON.parse(
    readFileSync('_dropin-enrichments/merchant-blocks/requirements.json', 'utf8')
);

const testBlock = 'commerce-company-profile';

// This should work:
const requirement = requirements[testBlock];

if (!requirement) {
    console.error('❌ FAIL: Could not load requirement for', testBlock);
    process.exit(1);
}

console.log('✅ PASS: Requirements load correctly');
console.log(`   Found: ${Object.keys(requirements).length} requirements`);
console.log(`   Sample: ${requirement.substring(0, 50)}...`);

// Test descriptions.json
const descriptions = JSON.parse(
    readFileSync('_dropin-enrichments/merchant-blocks/descriptions.json', 'utf8')
);

const desc = descriptions[testBlock];

if (!desc || !desc.description) {
    console.error('❌ FAIL: Could not load description for', testBlock);
    process.exit(1);
}

console.log('✅ PASS: Descriptions load correctly');
console.log(`   Found: ${Object.keys(descriptions).length} descriptions`);

console.log('\n✅ All enrichment loading tests passed!');
```

## Prevention Checklist

Before running the generator:

- [ ] Run `node scripts/test-enrichment-loading.js` (if created)
- [ ] Verify enrichment files exist in `_dropin-enrichments/merchant-blocks/`
- [ ] Check generator output for "Loaded X requirements from enrichment"
- [ ] After generation, spot-check 2-3 B2B blocks for Requirements sections

After generation:

- [ ] Verify Requirements sections exist: `grep -c "## Requirements" src/content/docs/merchants/blocks/commerce-b2b-*.mdx`
- [ ] Should return count matching number of B2B blocks with requirements
- [ ] Spot-check that admin paths are present and bolded

## Lessons Learned

1. **Silent failures are dangerous** - Optional chaining hid the bug
2. **Validation is critical** - Test enrichment loading at startup
3. **Logging is essential** - Generator should log what it's doing
4. **Test before trust** - Automated tests would have caught this
5. **Structure matters** - Document expected JSON structures clearly

## Recommendations

### Immediate Actions

1. ✅ Fix committed (line 837 changed)
2. ⏳ Add validation function to generator
3. ⏳ Add logging to show enrichment loading
4. ⏳ Create enrichment loading test script
5. ⏳ Document JSON structure in `_dropin-enrichments/merchant-blocks/README.md`

### Long-term Improvements

1. **Unit tests** for generator functions
2. **Integration tests** that regenerate a sample block and verify structure
3. **CI checks** that validate enrichment file structure
4. **Schema validation** for all JSON enrichment files (using JSON Schema)

## Status

- **Bug Fixed:** ✅ December 9, 2024
- **Committed:** ✅ Commit ff86d224
- **Verified:** ✅ Tested with actual enrichment file
- **Documented:** ✅ This postmortem
- **Safeguards Added:** ⏳ Pending (validation, logging, tests)

## Contact

If you encounter similar issues with the generator:

1. Check this postmortem first
2. Verify enrichment files exist and have correct structure
3. Look for silent failures (optional chaining, try/catch)
4. Add logging to see what the code is actually doing

---

**Never again.** This bug cost us 4 rounds of manual fixes. With proper validation, logging, and testing, it won't happen again.

