# Dual-Branch Architecture for B2B Drop-ins

## Problem We're Solving

The single release branch (`releases/b2b-nov-release`) contains:
- ❌ Infrastructure (scripts, generators, templates)
- ❌ Merged documentation (Purchase Order - approved)
- ❌ Unmerged documentation (other drop-ins - in review)
- ❌ ALL enrichments (polluted)

This causes:
- Feature branches get polluted with other drop-ins' content
- Infrastructure syncs pull in unwanted documentation
- Enrichment pollution spreads across branches
- Complex merge conflicts

## Solution: Dual-Branch Architecture

### Two Release Branches

#### `releases/b2b-infrastructure` (Infrastructure ONLY)
**Purpose**: Source of truth for generators, scripts, and shared templates

**Contains**:
- ✅ `scripts/` - All generators, validators, utilities
- ✅ `_dropin-templates/` - Shared templates used by generators
- ✅ `templates/` - General documentation templates
- ✅ `package.json` - npm scripts

**Does NOT Contain**:
- ❌ `src/content/docs/` - No documentation
- ❌ `_dropin-enrichments/` - No enrichment files
- ❌ `astro.config.mjs` - No sidebar config

#### `releases/b2b-docs-only` (Merged Documentation ONLY)
**Purpose**: Base branch for feature branches, contains only reviewed & merged drop-ins

**Contains**:
- ✅ `src/content/docs/dropins-b2b/purchase-order/` - Merged docs
- ✅ `_dropin-enrichments/purchase-order/` - Merged enrichments
- ✅ (Future merged drop-ins will be added here)

**Does NOT Contain**:
- ❌ `scripts/` - No infrastructure
- ❌ `package.json` - No build config
- ❌ `astro.config.mjs` - No sidebar
- ❌ Unmerged drop-ins' content

### Feature Branches
**Base**: `releases/b2b-docs-only`  
**Merges from**: `releases/b2b-infrastructure` (for tooling updates)

**Contains**:
- ✅ `src/content/docs/dropins-b2b/[their-dropin]/` - Their documentation
- ✅ `_dropin-enrichments/[their-dropin]/` - Their enrichments ONLY
- ✅ `scripts/` - From infrastructure branch
- ✅ `_dropin-templates/` - From infrastructure branch
- ✅ `package.json` - From infrastructure branch

**Does NOT Contain**:
- ❌ Other drop-ins' documentation
- ❌ Other drop-ins' enrichments
- ❌ `astro.config.mjs` - Can't build locally (by design)

**Examples**:
- `b2b-docs-requisition-list-v3`
- `b2b-docs-company-management-v2`
- `b2b-docs-company-switcher-v2`
- `b2b-docs-quote-management-v2`

### Preview Branch
**Purpose**: Consolidated preview for reviewers to see ALL drop-ins together

**Contains**:
- ✅ All merged content from `b2b-docs-only`
- ✅ All unmerged content from feature branches (manual merges)
- ✅ `astro.config.mjs` - Complete sidebar with all drop-ins

**Updates**:
- Merge from `b2b-docs-only` when new drop-ins are merged
- Merge from feature branches when documentation is updated
- NEVER used as source for feature branches

## File Ownership Matrix

| File/Directory | Infrastructure Branch | Docs-Only Branch | Feature Branches | Preview Branch |
|----------------|----------------------|------------------|------------------|----------------|
| `scripts/` | ✅ Owner | ❌ | ✅ From infra | ❌ |
| `_dropin-templates/` | ✅ Owner | ❌ | ✅ From infra | ❌ |
| `templates/` | ✅ Owner | ❌ | ✅ From infra | ❌ |
| `package.json` | ✅ Owner | ❌ | ✅ From infra | ❌ |
| `src/content/docs/dropins-b2b/purchase-order/` | ❌ | ✅ Owner | ❌ | ✅ From docs-only |
| `_dropin-enrichments/purchase-order/` | ❌ | ✅ Owner | ❌ | ✅ From docs-only |
| `src/content/docs/dropins-b2b/[feature-dropin]/` | ❌ | ❌ | ✅ Owner | ✅ From feature |
| `_dropin-enrichments/[feature-dropin]/` | ❌ | ❌ | ✅ Owner | ✅ From feature |
| `astro.config.mjs` | ❌ | ❌ | ❌ | ✅ Owner |

## Workflows

### 1. Infrastructure Changes

```bash
# Make changes to generators, scripts, templates
git checkout releases/b2b-infrastructure
# ... edit scripts, templates, package.json ...
git commit -m "feat: Add new validation logic"
git push origin releases/b2b-infrastructure

# Sync to ALL feature branches
for branch in requisition-list-v3 company-management-v2 company-switcher-v2 quote-management-v2; do
  git checkout b2b-docs-$branch
  git merge releases/b2b-infrastructure  # Clean merge - no doc conflicts!
  git push origin b2b-docs-$branch
done
```

**Benefits**:
- ✅ No documentation conflicts
- ✅ No enrichment pollution
- ✅ Fast, clean merges
- ✅ All branches get same tools

### 2. Feature Branch Development

```bash
# Work on documentation
git checkout b2b-docs-requisition-list-v3

# Base already has Purchase Order (merged)
# Base has NO other drop-ins (clean)

# Edit docs, run generators
npm run generate-b2b-docs requisition-list

# Validate enrichments
npm run validate-b2b-enrichments  # Should pass!

git commit -m "docs: Add container examples"
git push origin b2b-docs-requisition-list-v3
```

**Benefits**:
- ✅ Only see merged content (Purchase Order)
- ✅ Can't accidentally pull other drop-ins
- ✅ Enrichments stay isolated
- ✅ Validation prevents pollution

### 3. PR Review & Merge

```bash
# After PR approved and merged
git checkout releases/b2b-docs-only
git merge --squash b2b-docs-requisition-list-v3 -- src/content/docs/dropins-b2b/requisition-list/
git merge --squash b2b-docs-requisition-list-v3 -- _dropin-enrichments/requisition-list/

git commit -m "docs: Add Requisition List drop-in (PR #681)

- Add containers, functions, events documentation
- Add enrichment files
- Reviewed by: @keharper, @svera"

git push origin releases/b2b-docs-only
```

**Benefits**:
- ✅ Only drop-in-specific files merged
- ✅ No infrastructure in docs branch
- ✅ Clean history
- ✅ Future feature branches get this as base

### 4. Preview Branch Update

```bash
# Update preview with merged content
git checkout b2b-documentation
git merge releases/b2b-docs-only

# Preview now has ALL merged drop-ins
git push origin b2b-documentation
```

**Benefits**:
- ✅ One merge for all merged content
- ✅ No individual feature branch merges needed
- ✅ Clean, simple update

## Why This Works

### Infrastructure Isolation
- Infrastructure changes don't pull documentation
- Documentation changes don't affect infrastructure
- Clean separation of concerns

### Enrichment Ownership
- Each feature branch OWNS its enrichments
- Enrichments never cross-pollinate
- Validation catches any pollution

### Clean Base Branch
- Feature branches base on docs-only
- Only contains merged, approved content
- No pollution risk

### Scalable
- Works for 5 drop-ins or 50
- No complex sync logic needed
- Git-native workflows

## Migration Path

See `scripts/migrate-to-dual-branch.sh` for:
1. Comprehensive audit of current state
2. Enrichment ownership decisions
3. Step-by-step migration plan
4. Validation at each step

## Testing Strategy

### Infrastructure Branch
```bash
git checkout releases/b2b-infrastructure
npm run validate-b2b-enrichments  # Should find no enrichments (good!)
node scripts/@generate-container-docs.js --help  # Should work
```

### Docs-Only Branch
```bash
git checkout releases/b2b-docs-only
ls src/content/docs/dropins-b2b/  # Should show only: purchase-order
ls _dropin-enrichments/  # Should show only: purchase-order
# Can't run generators (no scripts - good!)
```

### Feature Branch
```bash
git checkout b2b-docs-requisition-list-v3
ls src/content/docs/dropins-b2b/  # Should show only: requisition-list
ls _dropin-enrichments/  # Should show only: requisition-list
npm run validate-b2b-enrichments  # Should pass
npm run generate-b2b-docs requisition-list  # Should work
```

### Preview Branch
```bash
git checkout b2b-documentation
ls src/content/docs/dropins-b2b/  # Shows all drop-ins
npm run build:prod-fast  # Should build successfully
```

## Benefits Summary

✅ **No Pollution** - Feature branches can't get other drop-ins  
✅ **Clean Merges** - Infrastructure syncs have no conflicts  
✅ **Simple Previews** - One merge gets all merged content  
✅ **Clear Ownership** - Each file has one owner  
✅ **Scalable** - Works for any number of drop-ins  
✅ **Git-Native** - Standard Git workflows  
✅ **Auditable** - Every decision is documented  
✅ **Safe** - Validation catches issues  

---

## Publication Strategy: Preserving All Developer Work

### The Critical Risk

The `releases/b2b-nov-release` branch contains:
- **3,230+ commits** from **50+ contributors**
- **Months of irreplaceable work**: Purchase Order (PR #665), generator improvements, merchant blocks, enrichments
- **Major contributors**: Bruce Denham (1,688 commits), Jeff Matthews (375), Kevin Harper (314), and 47 others

**These commits are NOT in `develop`. Losing them when publishing would be catastrophic.**

### The Solution: Three-Branch Publication Model

**Keep `releases/b2b-nov-release` as the publication consolidation point:**

```
Working Branches (Daily Development):
├── releases/b2b-infrastructure    (Scripts, generators, templates)
└── releases/b2b-docs-only         (Approved, merged drop-in docs)

Consolidation Branch (Merge Target):
└── releases/b2b-nov-release       (ALL work flows here → develop)

Production:
└── develop → main                  (Published to the world)
```

### Publication Workflow

**Before publishing to production:**

```bash
# 1. Consolidate infrastructure updates
git checkout releases/b2b-nov-release
git merge releases/b2b-infrastructure --no-ff \
  -m "Merge infrastructure updates for publication"

# 2. Consolidate approved documentation
git merge releases/b2b-docs-only --no-ff \
  -m "Merge approved documentation for publication"

# 3. Verify readiness (automated checks)
./scripts/verify-publication-readiness.sh

# 4. Publish to production (100% safe - all history preserved)
git checkout develop
git merge releases/b2b-nov-release --no-ff \
  -m "Publish B2B documentation to production"
git push origin develop
```

### Why This Guarantees 100% Safety

✅ **All commit history preserved** - Every PR, every change, every author  
✅ **All attributions intact** - Git blame shows original contributors  
✅ **Auditable** - Can diff `b2b-nov-release` vs `develop` before merge  
✅ **Rollback-safe** - Can revert the single merge commit if needed  
✅ **No data loss** - Merge brings ALL commits from b2b-nov-release  

### Branch Flow Diagram

```
┌───────────────────────────────────────────────────────────────┐
│  DAILY WORKFLOW (Working Branches)                            │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  releases/b2b-infrastructure                                  │
│    • Scripts, generators, templates                           │
│    • package.json                                             │
│    • Merge TO: feature branches                               │
│                                                                │
│  releases/b2b-docs-only                                       │
│    • Purchase Order (merged)                                  │
│    • Future merged drop-ins                                   │
│    • Merge FROM: approved feature branch PRs                  │
│                                                                │
│  b2b-docs-[dropin]-vN (Feature Branches)                     │
│    • One drop-in's content                                    │
│    • Merge TO: b2b-documentation (preview)                    │
│    • Merge TO: b2b-docs-only (after PR approval)             │
│                                                                │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│  PUBLICATION WORKFLOW (Before Going Live)                     │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  releases/b2b-infrastructure ──┐                              │
│                                 │                              │
│  releases/b2b-docs-only ────────┼──> releases/b2b-nov-release │
│                                 │      (Consolidation)         │
│  Feature PRs (ongoing) ─────────┘         ↓                   │
│                                                                │
│                                        develop ──> main        │
│                                      (Production)              │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### When to Merge to b2b-nov-release

**Continuous (as work progresses):**
- Feature branch PRs can merge directly to `b2b-nov-release` (current workflow continues)
- Preserves all commit history and attributions

**Periodic (when infrastructure stabilizes):**
- Merge `b2b-infrastructure` → `b2b-nov-release` (monthly or as needed)
- Merge `b2b-docs-only` → `b2b-nov-release` (when drop-ins are approved)

**Before production publish:**
- Final consolidation merge
- Run verification script
- Merge `b2b-nov-release` → `develop`

### Migration Strategy

During the migration to dual-branch architecture:
1. Create `releases/b2b-infrastructure` (scripts only)
2. Create `releases/b2b-docs-only` (Purchase Order only)
3. **Keep `releases/b2b-nov-release` INTACT** (all 3,230+ commits preserved)
4. Feature branches base on `b2b-docs-only` + merge from `b2b-infrastructure`
5. All approved work flows through `b2b-nov-release` before `develop`

**Result**: Zero risk of losing any developer work.

---

## Questions & Answers

**Q: Why can't feature branches build locally?**  
A: They don't have `astro.config.mjs` (which would have broken links to other drop-ins). For local testing, use the preview branch or temporarily copy the config.

**Q: What about `_dropin-templates/`?**  
A: These are SHARED templates used by ALL generators, so they're infrastructure. Individual drop-ins don't customize them.

**Q: What if a feature branch needs a different generator version?**  
A: Merge from infrastructure branch to get updates. All branches should use the same generator version.

**Q: How do we handle `astro.config.mjs` updates?**  
A: Only update in preview branch. It contains the complete sidebar for all drop-ins.

**Q: What about image assets?**  
A: Images go in `public/images/dropins-b2b/[dropin]/` and stay with their feature branch, just like documentation.

**Q: Can we test generators on feature branches?**  
A: Yes! Feature branches have infrastructure merged, so generators work. They just can't build the full site.

