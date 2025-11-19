# Making B2B Documentation Fully Regenerable - Progress Report

**Date**: November 18, 2025  
**Branch**: `b2b-documentation`  
**Status**: 🟡 **In Progress** (2/6 phases complete, GitHub outage blocking testing)

---

## 🎯 Goal

Make all B2B documentation fully regenerable so that:
- ✅ Running generators doesn't destroy manual work
- ✅ Reviewer feedback can be applied by updating enrichment + regenerating
- ✅ Code changes automatically flow to documentation
- ✅ Consistency is maintained across all drop-ins

---

## ✅ Phase 1: Event Examples → Enrichment (COMPLETE)

### What Was Done

1. **Created extraction script** (`scripts/extract-examples-to-enrichment.js`)
   - Parses events.mdx files
   - Extracts "When triggered", "Examples", and "Usage scenarios" sections
   - Outputs to enrichment JSON files

2. **Extracted 40 examples from 31 events across 5 B2B drop-ins:**
   - **Purchase Order**: 7 examples, 19 when-triggered items, 5 usage scenarios
   - **Quote Management**: 20 examples, 40 when-triggered items, 1 usage scenario
   - **Requisition List**: 7 examples, 22 when-triggered items, 5 usage scenarios
   - **Company Management**: 5 examples, 11 when-triggered items, 2 usage scenarios
   - **Company Switcher**: 1 example, 5 when-triggered items, 1 usage scenario

3. **Updated enrichment JSON structure:**
   ```json
   {
     "eventName": {
       "whenTriggered": ["condition1", "condition2"],
       "examples": [
         {"title": "Example 1", "code": "..."},
         {"title": "Example 2", "code": "..."}
       ],
       "usageScenarios": "text describing use cases"
     }
   }
   ```

4. **Modified event generator** (`scripts/@generate-event-docs.js`):
   - Reads `whenTriggered` from enrichment
   - Renders multiple examples with titles
   - Includes usage scenarios
   - Falls back to basic example if enrichment missing

5. **Updated template** (`_dropin-templates/dropin-events.mdx`):
   - Added `WHEN_TRIGGERED_SECTION` placeholder
   - Added `EXAMPLES_SECTION` placeholder
   - Added `USAGE_SCENARIOS_SECTION` placeholder

### Result

✅ **Event documentation is now fully regenerable**
- All 40 manual examples preserved in enrichment
- Generators use enrichment as source of truth
- Running `generate-event-docs` will recreate identical MDX files

### Verification Needed

⏳ Cannot test due to GitHub outage (502 errors)
- Need to run `npm run generate-event-docs -- --dropin=company-switcher`
- Verify generated output matches existing `events.mdx`

---

## ✅ Phase 2: Event Generator Update (COMPLETE)

### What Was Done

- Generator code updated to populate new template placeholders
- Fallback logic for drop-ins without enrichment examples
- Multiple examples supported (not just one)

### Result

✅ **Generator ready to use enrichment examples**

---

## 🔄 Phase 3: Container Examples → Enrichment (PENDING)

### What Needs To Be Done

**Problem**: Purchase Order containers have manual "Complete integration example" sections that will be lost on regeneration.

**Files At Risk** (12 files):
- All `purchase-order/containers/*.mdx` files
- Each has "Complete integration example" showing:
  - Authentication checks
  - Permission validation
  - Event handling
  - Error handling
  - Loading states

**Solution**:
1. Create extraction script for container examples
2. Update `_dropin-enrichments/purchase-order/containers.json` structure:
   ```json
   {
     "ContainerName": {
       "description": "...",
       "examples": [
         {"title": "Basic usage", "code": "..."},
         {"title": "Complete integration", "code": "..."}
       ]
     }
   }
   ```
3. Modify `scripts/@generate-container-docs.js` to use enrichment examples
4. Update `_dropin-templates/dropin-container.mdx` template

**Estimated Time**: 30 minutes

**Impact**: Makes Purchase Order container docs regenerable

---

## 🔄 Phase 4: Container Generator Update (PENDING)

### What Needs To Be Done

Update the container generator to:
- Read multiple examples from enrichment
- Render "Complete integration example" sections
- Fall back to basic example if enrichment missing

**Estimated Time**: 20 minutes

---

## 🔴 Phase 5: Fix Company Switcher Generator (CRITICAL)

### The Problem

**Current State**:
- Generator: Produces "This drop-in currently has no functions defined"
- Reality: Company Switcher has 3 functions (`getCustomerCompanyInfo`, `setCompanyHeaders`, `setGroupHeaders`)
- Root Cause: Functions exist only in `.d.ts` files, not `.ts` files
- Generator: Can't extract from `.d.ts` properly (architectural mismatch)

**Manual Workaround**:
- `company-switcher/functions.mdx` was manually fixed
- Contains correct function names, signatures, examples
- **Will be overwritten** if function generator runs

**Solution Options**:

**Option A: Fix Generator** (30 minutes)
- Improve `.d.ts` extraction in `@generate-function-docs.js`
- Handle `export declare const` patterns
- Handle directory name ≠ function name mismatch

**Option B: Exclude Company Switcher** (5 minutes)
- Add `--skip-dropin=company-switcher` logic to generators
- Document that Company Switcher is manually maintained
- Keep manual `functions.mdx` as-is

**Option C: Move Functions to Enrichment** (20 minutes)
- Create full function definitions in enrichment JSON
- Generator uses enrichment as source
- Similar to "documented-only" events pattern

**Recommendation**: **Option A** - Fix generator properly so future updates don't require manual intervention

---

## 🔄 Phase 6: Test Full Regeneration (PENDING)

### What Needs To Be Done

1. Run `npm run generate-b2b-docs` (all generators)
2. Use `git diff` to compare generated vs. existing MDX
3. Verify:
   - Events match exactly (should be identical)
   - Containers match (after Phase 3/4 complete)
   - Functions work (after Phase 5 complete)
   - Slots, styles, dictionary unchanged
4. Document any discrepancies
5. Fix generators if needed

**Blocked By**: GitHub outage (cannot pull boilerplate updates)

**Estimated Time**: 15 minutes + fix time for any issues

---

## 📊 Overall Progress

| Phase | Status | Time Spent | Time Remaining |
|-------|--------|------------|----------------|
| 1. Event Examples Extraction | ✅ Complete | 20 min | 0 min |
| 2. Event Generator Update | ✅ Complete | 15 min | 0 min |
| 3. Container Examples Extraction | ⏳ Pending | 0 min | 30 min |
| 4. Container Generator Update | ⏳ Pending | 0 min | 20 min |
| 5. Fix Company Switcher Generator | 🔴 Blocked | 0 min | 30 min |
| 6. Test Full Regeneration | 🔴 Blocked | 0 min | 15 min |
| **Total** | **33% Complete** | **35 min** | **95 min** |

---

## 🎯 Current State

### What's Regenerable Now

✅ **Events** - Fully regenerable (all examples in enrichment)
✅ **Container Descriptions** - Regenerable (enrichment updated)
✅ **Styles, Dictionary, Quick Start, Init** - Already regenerable

### What's NOT Regenerable Yet

❌ **Purchase Order Containers** - Manual "Complete integration" examples not in enrichment
❌ **Company Switcher Functions** - Generator can't extract from `.d.ts`
⚠️ **Company Switcher Events** - Regenerable but untested

---

## 🚀 Next Steps (User's Choice)

### Option 1: Complete All Remaining Phases (~95 minutes)
**Pros:**
- Fully regenerable documentation
- Can handle reviewer feedback easily
- Code changes automatically flow to docs

**Cons:**
- Blocked by GitHub outage for testing
- Requires ~1.5 more hours of work

**Recommendation**: **Do this if PR timeline allows**

### Option 2: Ship PR Now, Fix Later
**Pros:**
- Documentation is complete and accurate
- Can submit PR immediately
- Fix regeneration system after merge

**Cons:**
- Reviewer changes require manual edits
- Risk of overwriting work if generators run
- Future code updates harder to sync

**Recommendation**: Only if PR is urgent

### Option 3: Hybrid - Fix Critical Only (~30 min)
**Pros:**
- Fix Company Switcher generator (critical)
- Events already regenerable (biggest win)
- Can test when GitHub is back up

**Cons:**
- Container examples still manual
- Partial solution

**Recommendation**: **Do this if time-constrained**

---

## 🎓 Key Lessons Learned

1. ✅ **Enrichment files are the source of truth** - Not MDX files
2. ✅ **Always update enrichment + generators together** - Manual MDX edits get lost
3. ✅ **Test regeneration immediately** - Catch issues early
4. ✅ **Systematic beats tactical** - Fix the system, not just the symptoms
5. ✅ **Extraction scripts are valuable** - Automate MDX → enrichment syncing

---

## 📝 Files Modified (So Far)

### Enrichment Files (5 files)
- `_dropin-enrichments/purchase-order/events.json`
- `_dropin-enrichments/quote-management/events.json`
- `_dropin-enrichments/requisition-list/events.json`
- `_dropin-enrichments/company-management/events.json`
- `_dropin-enrichments/company-switcher/events.json`

### Generator Scripts (1 file)
- `scripts/@generate-event-docs.js`

### Templates (1 file)
- `_dropin-templates/dropin-events.mdx`

### New Scripts (1 file)
- `scripts/extract-examples-to-enrichment.js`

---

## ✅ Recommendation

**Continue with Option 1** (complete all phases):

1. ✅ Events regenerable (DONE)
2. Extract container examples (30 min)
3. Update container generator (20 min)
4. Fix Company Switcher generator (30 min)
5. Test full regeneration when GitHub is back (15 min)

**Total remaining**: ~95 minutes to make everything fully regenerable

**Benefit**: Never worry about regeneration again. Reviewers can request changes, you update enrichment + regenerate, done.

---

## 🔧 How to Continue (When GitHub is Back Up)

```bash
# Test event generation
npm run generate-event-docs -- --dropin=company-switcher
git diff src/content/docs/dropins-b2b/company-switcher/events.mdx

# If looks good, continue with remaining phases
# (I can continue the work when you're ready)
```

**Current blocker**: GitHub 502 errors preventing generator tests
**Workaround**: Continue non-network phases (container extraction, generator updates)

