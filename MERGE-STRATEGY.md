# PR Merge Strategy & Conflict Resolution

## PR Overview

| PR | Branch | Size | Latest | Focus |
|---|---|---|---|---|
| #569 | slots-infrastructure | +4557/-1996 | Nov 5 | Slots docs + infrastructure |
| #557 | functions-documentation | +3013/-2351 | Nov 6 | Functions docs + **critical bug fixes** |
| #555 | events-documentation | +1556/-563 | Nov 6 | Events docs (mostly content) |
| #552 | dictionaries-documentation | +2043/-71 | Nov 6 | Dictionary docs (mostly content) |

## Critical Infrastructure Changes

### PR #557 (functions-documentation) - **MOST CRITICAL**
**Has the latest bug fixes that MUST be preserved:**

1. **`scripts/lib/utils.js`** - Robust `cleanVersion()` function:
   ```javascript
   // Handle non-string inputs gracefully
   if (!version || typeof version !== 'string') {
       return 'unknown';
   }
   ```

2. **`scripts/lib/generator-core.js`** - Safe version handling:
   ```javascript
   const cleanRequestedVersion = (version && typeof version === 'string') 
       ? version.replace(/^[\^~]/, '') : 'unknown';
   ```

3. **`scripts/lib/repository.js`** - Version safety checks:
   ```javascript
   const cleanVersion = (version && typeof version === 'string') 
       ? version.replace(/^[\^~]/, '') : 'unknown';
   ```

4. **`scripts/@generate-function-docs.js`** - `normalizeDescriptionToVerb()` function for parallel structure

### PR #569 (slots-infrastructure) - **NEEDS MERGE**
**Has important improvements that complement #557:**

1. **`scripts/lib/repository.js`** - Git optimization (checking if already at correct version)
2. **`scripts/@generate-function-docs.js`** - `versionInfo` object handling:
   ```javascript
   function generateFunctionsMDX(..., versionInfo, ...) {
       const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
   ```

## Conflict Resolution Strategy

### Priority Order (Most Robust → Least Robust)

1. **PR #557 (functions-documentation)** - Base for infrastructure fixes
   - Has latest bug fixes (Nov 6)
   - Has GraphQL link additions
   - Has link validation fixes
   - Has `normalizeDescriptionToVerb()` function

2. **PR #569 (slots-infrastructure)** - Merge on top of #557
   - Add `versionInfo` object handling to function generator
   - Add git optimization to repository.js
   - Add slots documentation improvements

3. **PR #555 (events-documentation)** - Content only
   - Mostly generated content files
   - Minimal infrastructure changes
   - Easy to merge after #557 + #569

4. **PR #552 (dictionaries-documentation)** - Content only
   - Mostly generated content files
   - Minimal infrastructure changes
   - Easy to merge after #557 + #569

## File-by-File Resolution

### `scripts/lib/utils.js`
**Use: PR #557** (has robust `cleanVersion()` function)

### `scripts/lib/generator-core.js`
**Use: PR #557** (has version safety checks)

### `scripts/lib/repository.js`
**Merge: PR #557 base + PR #569 git optimization**
- Take version safety from #557
- Add git optimization check from #569

### `scripts/@generate-function-docs.js`
**Merge: PR #557 base + PR #569 versionInfo handling**
- Take `normalizeDescriptionToVerb()` from #557
- Take `versionInfo` object handling from #569
- Ensure both features work together

### `astro.config.mjs`
**Merge: All PRs** (each adds different sidebar entries)
- Slots PR: Slots sidebar entries
- Events PR: Events sidebar entries
- Dictionaries PR: Dictionary sidebar entries
- Functions PR: May have function sidebar entries

### Generated Content Files
**Use: Latest from each PR** (they're independent)
- Slots: Use from #569
- Functions: Use from #557
- Events: Use from #555
- Dictionaries: Use from #552

## Recommended Merge Order

1. **Start with PR #557** (functions-documentation) - Most recent bug fixes
2. **Merge PR #569** (slots-infrastructure) on top - Add versionInfo handling
3. **Merge PR #555** (events-documentation) - Content only, minimal conflicts
4. **Merge PR #552** (dictionaries-documentation) - Content only, minimal conflicts

## Key Points

✅ **PR #557 has critical bug fixes** that prevent `version.replace is not a function` errors
✅ **PR #569 has versionInfo object handling** needed for generator-core integration
✅ **Both must be combined** - they complement each other
✅ **PRs #555 and #552 are mostly content** - easy to merge after infrastructure is sorted

## Testing After Merge

After merging all PRs, verify:
1. All generators run without `version.replace` errors
2. `versionInfo` object is handled correctly in all generators
3. All sidebar links work
4. All generated content is present

