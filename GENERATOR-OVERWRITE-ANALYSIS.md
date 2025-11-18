# Generator Overwrite Risk Analysis

**Date**: November 18, 2025  
**Command**: `npm run generate-b2b-docs`  
**Status**: ⚠️ **DO NOT RUN** - Multiple critical files will be overwritten

## Executive Summary

Running `generate-b2b-docs` will execute 8 generators that will **completely overwrite** many files containing manual fixes and examples. The generators do NOT preserve:
- ❌ Manual code examples in events.mdx files
- ❌ Manual integration patterns in container pages
- ❌ Manual fixes to function signatures
- ❌ Expanded documentation sections

## Files At Risk (Detailed)

### 🔴 CRITICAL - Will Break Documentation

#### 1. Company Switcher functions.mdx
- **Generator**: `@generate-function-docs.js --type=B2B`
- **Risk**: HIGH - Will produce incorrect/incomplete output
- **Why**: Generator can't extract functions from `.d.ts` files properly for Company Switcher
- **Manual Content**: 
  - Corrected function name: `getCustomerCompanyInfo()` (not `customerCompanyContext`)
  - Corrected signatures with `| null` types
  - Detailed parameter tables
  - Complete usage examples
  - Usage scenarios
- **Generator Output**: "This drop-in currently has no functions defined." OR wrong function names
- **Recommendation**: **EXCLUDE Company Switcher from regeneration**

#### 2. Company Switcher events.mdx
- **Generator**: `@generate-event-docs.js --type=B2B`
- **Risk**: HIGH - Will produce incorrect event payload
- **Manual Content**:
  - Corrected event payload: `string | null | undefined` (not a complex object)
  - Updated event handler examples reflecting simple payload
  - Explanations of `null` behavior
- **Generator Output**: May use wrong payload structure from source code
- **Recommendation**: **EXCLUDE Company Switcher from regeneration**

### 🟡 MODERATE - Will Lose Manual Examples

#### 3. All Events.mdx Files (5 files)
**Files**:
- `purchase-order/events.mdx` - 5 events with 3 workflow examples each
- `quote-management/events.mdx` - 19 events with template patterns
- `requisition-list/events.mdx` - 5 events with cart integration examples
- `company-management/events.mdx` - 2 events with examples
- `company-switcher/events.mdx` - 1 event (see Critical section above)

**Manual Content**:
- Extensive code examples for each event
- Integration patterns (e.g., "Purchase order placed workflow")
- Best practices sections
- Multiple example variations per event
- Error handling patterns

**Generator Behavior**:
- Generates event descriptions from source code
- Does NOT extract or preserve manual examples
- Enrichment files (`events.json`) only store `overview` text, not examples

**Impact**: Loss of 50+ carefully crafted integration examples

**Recommendation**: 
- **Option A**: DO NOT regenerate events
- **Option B**: Add example preservation to event generator first
- **Option C**: Move examples to enrichment files (major refactor)

#### 4. Purchase Order Container Pages (12 files)
**Files**: All container MDX files in `purchase-order/containers/`

**Manual Content**:
- Fixed `await` keywords in all examples (29 instances)
- Added "Complete integration example" sections showing:
  - Authentication checks
  - Permission validation
  - Event handling
  - Error handling
  - Loading states

**Generator Behavior**:
- Generates basic container examples
- Uses enrichment files for descriptions
- Does NOT preserve manual "Complete integration example" sections

**Impact**: Loss of production-ready integration patterns

**Recommendation**:
- **Option A**: DO NOT regenerate Purchase Order containers
- **Option B**: Add these examples to enrichment files first

#### 5. Company Management slots.mdx
**Manual Content**:
- CompanyData slot for CompanyProfile
- Detailed TypeScript interface
- Complete usage example

**Generator Behavior**:
- Extracts slots from TypeScript source
- Should re-generate the same content IF source is correct

**Risk**: MODERATE - Depends on whether generator correctly finds the slot

**Recommendation**: TEST regeneration on Company Management only, check slots.mdx

### 🟢 LOW RISK - Safe to Regenerate

#### 6. Container Overview Pages (index.mdx) - 5 files
**Status**: ✅ **SAFE**
- Enrichment files now contain all descriptions
- Generator will produce identical output

#### 7. Styles, Dictionary, Quick Start, Initialization
**Status**: ✅ **SAFE**
- These files are typically fully auto-generated
- No manual customizations

#### 8. integration-examples.mdx
**Status**: ✅ **SAFE**
- Never touched by generators
- Completely manual file

## Safe Regeneration Strategy

### Strategy 1: Selective Regeneration (Recommended)
Run individual generators for safe files only:

```bash
# Safe to regenerate:
npm run generate-styles-docs -- --type=B2B
npm run generate-dictionary-docs -- --type=B2B  
npm run generate-quick-start-docs -- --type=B2B
npm run generate-initialization-docs -- --type=B2B

# Safe only if you want to lose manual examples:
npm run generate-container-docs -- --type=B2B --dropin=requisition-list
npm run generate-container-docs -- --type=B2B --dropin=company-management
npm run generate-container-docs -- --type=B2B --dropin=quote-management
npm run generate-container-docs -- --type=B2B --dropin=company-switcher

# DO NOT RUN (will break):
# npm run generate-function-docs -- --type=B2B  
# npm run generate-event-docs -- --type=B2B
# npm run generate-container-docs -- --type=B2B --dropin=purchase-order
```

### Strategy 2: Fix Generators First
Before running `generate-b2b-docs`, fix:

1. **Function generator** - Better `.d.ts` extraction for Company Switcher
2. **Event generator** - Preserve manual examples from enrichment files
3. **Container generator** - Preserve "Complete integration example" sections

### Strategy 3: Move Content to Enrichment
Move all manual examples to enrichment files:

1. Create example storage in `events.json`
2. Create example storage in `containers.json`
3. Update generators to use enrichment examples
4. Then regeneration becomes safe

## Current Recommendation

**DO NOT run `npm run generate-b2b-docs`** until one of these is done:

1. ✅ You're okay with losing all manual examples (NOT RECOMMENDED)
2. ✅ Generators are fixed to preserve manual content
3. ✅ Manual content is moved to enrichment files
4. ✅ You run only safe generators selectively

## Questions for User

1. **Do you want to keep the manual examples?** (Almost certainly yes)
2. **Is the current documentation ready for PR as-is?** (If yes, don't regenerate)
3. **Do you need to update any generated sections?** (If no, don't regenerate)

## Safe Commands Right Now

```bash
# Check what would be generated (dry run):
npm run generate-b2b-docs -- --dry-run

# ONLY regenerate completely safe files:
npm run generate-styles-docs -- --type=B2B
npm run generate-dictionary-docs -- --type=B2B

# Test one drop-in to see impact:
npm run generate-function-docs -- --dropin=requisition-list
```

## Recommendation

**Don't regenerate anything right now.** The documentation is complete, verified, and ready for PR. Regeneration would:
- ❌ Break Company Switcher
- ❌ Lose 50+ manual examples
- ❌ Lose integration patterns
- ✅ No benefit (enrichment files already match MDX files)

**Just push to GitHub when server is back up and submit the PR!**

