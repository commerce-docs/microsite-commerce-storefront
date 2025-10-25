# Generator Framework Migration - Merge Plan

## Current Situation

All generator branches were created sequentially, each building on the previous:
- Each branch contains all previous generators + its own
- They cannot be merged independently without conflicts

## Recommended Strategy: Sequential Merges

Merge branches in the order they were created, with each PR depending on the previous being merged first.

### Merge Order

```
1. feature/generator-containers
   └─> Adds: Containers generator + ALL shared lib/ modules
   
2. feature/generator-slots
   └─> Adds: Slots generator (builds on #1)
   
3. feature/generator-dictionary
   └─> Adds: Dictionary generator (builds on #2)
   
4. feature/generator-installation
   └─> Adds: Installation generator (builds on #3)
   
5. feature/generator-initialization
   └─> Adds: Initialization generator (builds on #4)
   
6. feature/generator-boilerplate
   └─> Adds: Boilerplate generator + content-transforms.js (builds on #5)
   
7. feature/generator-merchant-blocks
   └─> Adds: Merchant blocks generator + master command (builds on #6)
```

### PR Descriptions

#### PR #1: Containers Generator + Shared Framework
**Base**: `main` (or current branch: `cors-docs`)  
**Branch**: `feature/generator-containers`

**Title**: `feat: add containers generator and shared framework library`

**Description**:
```markdown
## Overview
Introduces the shared framework library and migrates the containers generator.

## What's New
- **Shared Library** (9 modules in `scripts/lib/`):
  - `generator-core.js` - Main execution framework
  - `logger.js` - Standardized logging
  - `dropin-config.js` - Repository configuration
  - `enrichment.js` - Enrichment data loading
  - `repository.js` - Git operations
  - `markdown.js` - Template processing
  - `sidebar.js` - Navigation updates
  - `utils.js` - General utilities
  
- **Containers Generator**:
  - Refactored from 759 → 557 lines (-26.6%)
  - Uses shared framework
  - Multi-file output (one per container + overview)
  
## Benefits
- 60% less boilerplate code
- Consistent patterns across all generators
- Easy to add new generators (~100 lines)
- Centralized bug fixes

## Testing
- ✅ Generated documentation for all 10 drop-ins
- ✅ Multi-file output working correctly
- ✅ No linter errors

## Dependencies
None - this is the foundation PR

## Follow-up PRs
- Slots generator
- Dictionary generator
- Installation generator
- Initialization generator
- Boilerplate generator
- Merchant blocks generator
```

#### PR #2: Slots Generator
**Base**: `feature/generator-containers` (after PR #1 is merged)  
**Branch**: `feature/generator-slots`

**Title**: `feat: add slots generator using shared framework`

**Description**:
```markdown
## Overview
Migrates the slots generator to use the shared framework.

## What's New
- **Slots Generator**:
  - Refactored from 450 → 271 lines (-39.8%)
  - Uses shared framework from PR #1
  - Single consolidated page per drop-in

## Changes
- Added `loadSlotEnrichments()` to `lib/enrichment.js`
- Added `updateSidebarForSlots()` to `lib/sidebar.js`
- Updated template with consistent placeholders

## Testing
- ✅ Generated documentation for all 10 drop-ins
- ✅ TypeScript interface parsing working
- ✅ No linter errors

## Dependencies
- Requires PR #1 (Shared Framework) to be merged first

## Follow-up PRs
- Dictionary generator
- Installation generator
- Initialization generator
- Boilerplate generator
- Merchant blocks generator
```

#### PR #3: Dictionary Generator
**Base**: `feature/generator-slots` (after PR #2 is merged)  
**Branch**: `feature/generator-dictionary`

**Title**: `feat: add dictionary generator using shared framework`

**Description**:
```markdown
## Overview
Migrates the dictionary generator to use the shared framework.

## What's New
- **Dictionary Generator**:
  - Refactored from 194 → 143 lines (-26.3%)
  - Pure data extraction (simplest generator)
  - Documented 977 i18n keys across 10 drop-ins

## Generated Documentation
- Cart: 216 keys
- Order: 307 keys (most!)
- User Account: 169 keys
- [Full list in commit message]

## Testing
- ✅ Generated documentation for all 10 drop-ins
- ✅ JSON parsing working correctly
- ✅ No linter errors

## Dependencies
- Requires PR #2 (Slots) to be merged first

## Follow-up PRs
- Installation generator
- Initialization generator
- Boilerplate generator
- Merchant blocks generator
```

#### PR #4: Installation Generator
**Base**: `feature/generator-dictionary` (after PR #3 is merged)  
**Branch**: `feature/generator-installation`

**Description**: Similar pattern...

#### PR #5: Initialization Generator
**Base**: `feature/generator-installation` (after PR #4 is merged)  
**Branch**: `feature/generator-initialization`

**Description**: Similar pattern...

#### PR #6: Boilerplate Generator
**Base**: `feature/generator-initialization` (after PR #5 is merged)  
**Branch**: `feature/generator-boilerplate`

**Description**: Similar pattern + content-transforms.js...

#### PR #7: Merchant Blocks + Master Command
**Base**: `feature/generator-boilerplate` (after PR #6 is merged)  
**Branch**: `feature/generator-merchant-blocks`

**Title**: `feat: add merchant blocks generator and master command - FINAL`

**Description**:
```markdown
## Overview
Completes the generator framework migration with the final generator and master orchestration command.

## What's New
- **Merchant Blocks Generator**:
  - Business-focused documentation (non-technical)
  - 352 lines (refactored from 367)
  - Generated 29 merchant documentation pages
  
- **Master Command** (`generate-all-docs.js`):
  - Runs all 9 generators in sequence
  - Progress tracking and timing
  - Error handling with continue/abort
  - Dry-run mode for testing
  - Regenerates 500+ pages in 15-20 minutes

## Complete Framework
This PR completes the migration of all 9 generators:
1. ✅ Functions
2. ✅ Events
3. ✅ Containers
4. ✅ Slots
5. ✅ Dictionary
6. ✅ Installation
7. ✅ Initialization
8. ✅ Boilerplate
9. ✅ Merchant Blocks

## Total Impact
- **1,351+ lines of boilerplate eliminated**
- **9 shared library modules created**
- **500+ documentation pages generated**
- **Single command to regenerate everything**

## Testing
- ✅ All 9 generators tested individually
- ✅ Master command dry-run tested
- ✅ No linter errors

## Dependencies
- Requires PR #6 (Boilerplate) to be merged first

## Result
Complete, production-ready documentation generation system!
```

### Merge Process

**For each PR:**

1. **Create PR** from current branch to base branch
2. **Review** (code review, test locally)
3. **Merge** PR
4. **Update base** for next PR
5. **Repeat** for next PR

### Timeline

If merging one PR per day: **~1-2 weeks**  
If fast-tracking: **2-3 days** (with quick reviews)

## Benefits of Sequential Approach

✅ **Clear progression** - Each PR builds on previous  
✅ **Easier to review** - Smaller, focused changes  
✅ **Safer** - Can stop/rollback at any point  
✅ **Logical** - Mirrors development order  
✅ **No conflicts** - Each PR is already compatible  

## Alternative: Single Mega PR (Not Recommended)

Could merge all branches into one massive PR, but:
- ❌ Too large to review effectively (~7,000+ lines changed)
- ❌ All-or-nothing approach
- ❌ Hard to identify issues
- ❌ Risky

## Recommendation

**Use Sequential PRs** - It's the safest, clearest path forward given how the branches were created.

