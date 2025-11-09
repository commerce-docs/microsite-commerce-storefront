# Generator Branch Coordination Strategy

This document defines the workflow for coordinating generator infrastructure changes across multiple branches to prevent workflow mistakes.

## Branch Types

### 1. Feature Branches (`feature/*`)
- **Purpose**: Single feature or bug fix
- **Should NOT include**: Generator infrastructure changes
- **Workflow**: Merge to `develop` when complete
- **Example**: `feature/merchant-block-config`

### 2. Generator Infrastructure Branches (`fix/generator-*` or `feature/generator-*`)
- **Purpose**: Shared generator improvements and bug fixes
- **Contains**: Changes to `scripts/lib/`, generator scripts, shared utilities
- **Workflow**: 
  1. Create PR from feature branch
  2. Review and merge to `develop` (protected branch - requires approval)
  3. Other branches pull from `develop` to get fixes
- **Example**: `fix/generator-sidebar-installation`

### 3. Documentation Branches (`*-documentation`)
- **Purpose**: Generated documentation only
- **Should**: Pull generator infrastructure from `develop`
- **Should NOT**: Modify generator code directly
- **Workflow**: Merge `develop` regularly to get latest generator fixes
- **Example**: `merchant-documentation`, `boilerplate-documentation`

## Critical Workflow Rules

### Rule 1: Generator Infrastructure Fixes Go to `develop` First

**❌ WRONG:**
```
merchant-documentation branch
  └─ Fix sidebar.js bug
  └─ Merge directly to merchant-documentation
```

**✅ CORRECT:**
```
fix/generator-sidebar-installation branch (from develop)
  └─ Fix sidebar.js bug
  └─ Create PR → Review → Merge to develop
  └─ merchant-documentation pulls from develop
```

### Rule 2: Never Fix Generator Bugs in Feature Branches

Generator bugs affect ALL branches. Fix them once in `develop`, then all branches benefit.

**Why**: Prevents duplicate work and ensures consistency.

### Rule 3: Manual Fixes Stay in Feature Branches

Sidebar entries, generated content fixes, etc. are branch-specific and stay in their branches.

**Example**: 
- Generator bug fix → `develop` (shared infrastructure)
- Missing sidebar entries → `merchant-documentation` (manual fix for that branch)

### Rule 4: Protected Branch = Review Required

`develop` is protected and requires PR review before merging. This prevents accidental public publishing.

**Workflow**:
1. Create feature branch from `develop`
2. Make changes
3. Create PR
4. Get review/approval
5. Merge to `develop`
6. Other branches pull from `develop`

## Workflow Examples

### Example 1: Fixing a Generator Bug

**Scenario**: Installation generator doesn't update sidebar

1. **Create bug fix branch from `develop`**:
   ```bash
   git checkout develop
   git checkout -b fix/generator-sidebar-installation
   ```

2. **Fix the bug**:
   - Edit `scripts/lib/sidebar.js`
   - Add test case
   - Document in `scripts/GENERATOR-BUGS.md`

3. **Create PR**:
   - PR: `fix/generator-sidebar-installation` → `develop`
   - Description: Fixes installation generator sidebar update bug
   - Reviewer merges after approval

4. **Update affected branches**:
   ```bash
   # After PR is merged to develop
   git checkout merchant-documentation
   git merge develop  # Gets the bug fix
   # Apply manual sidebar fixes for this branch
   ```

### Example 2: Adding New Generator Feature

**Scenario**: Add sidebar validation to test suite

1. **Create feature branch from `develop`**:
   ```bash
   git checkout develop
   git checkout -b feature/generator-sidebar-validation
   ```

2. **Implement feature**:
   - Add validation script
   - Integrate into test suite
   - Update documentation

3. **Create PR**:
   - PR: `feature/generator-sidebar-validation` → `develop`
   - Review and merge

4. **Branches automatically benefit**:
   - All branches can pull from `develop` when ready
   - No need to manually merge to each branch

### Example 3: Working on Merchant Documentation

**Scenario**: Adding new merchant docs pages

1. **Create feature branch from `develop`**:
   ```bash
   git checkout develop
   git checkout -b feature/merchant-docs-gaps
   ```

2. **Pull latest generator infrastructure**:
   ```bash
   git merge develop  # Ensures latest generator fixes
   ```

3. **Add merchant-specific content**:
   - Create new MDX files
   - Update sidebar for merchant section
   - Do NOT modify generator code

4. **Create PR**:
   - PR: `feature/merchant-docs-gaps` → `develop`
   - Review and merge

## Branch Coordination Checklist

When working on generator infrastructure:

- [ ] Create branch from `develop` (not from feature branch)
- [ ] Fix bug in shared library (`scripts/lib/`)
- [ ] Add test case to prevent regression
- [ ] Document bug in `scripts/GENERATOR-BUGS.md`
- [ ] Create PR for review (required for `develop`)
- [ ] After merge, update affected branches by merging `develop`

When working on feature/documentation:

- [ ] Create branch from `develop` (ensures latest generator fixes)
- [ ] Merge `develop` regularly to get generator updates
- [ ] Do NOT modify generator code in feature branches
- [ ] Apply manual fixes (sidebar entries, etc.) in feature branch
- [ ] Create PR when ready

## Common Mistakes to Avoid

### ❌ Mistake 1: Fixing Generator Bugs in Feature Branches
```bash
# WRONG: Fixing sidebar.js in merchant-documentation branch
git checkout merchant-documentation
# Edit scripts/lib/sidebar.js
git commit -m "Fix sidebar bug"
```

**Problem**: Other branches don't get the fix, duplicate work needed.

### ❌ Mistake 2: Not Pulling Latest Generator Fixes
```bash
# WRONG: Working on stale generator code
git checkout merchant-documentation
# Work on docs without merging develop first
```

**Problem**: Missing bug fixes, working with outdated code.

### ❌ Mistake 3: Modifying Generator Code in Documentation Branches
```bash
# WRONG: Fixing generator in merchant-documentation branch
git checkout merchant-documentation
# Edit scripts/@generate-installation-docs.js
```

**Problem**: Changes lost when branch is merged, inconsistent codebase.

## Quick Reference

| Change Type | Branch Type | Merge To |
|------------|-------------|----------|
| Generator bug fix | `fix/generator-*` | `develop` (via PR) |
| Generator feature | `feature/generator-*` | `develop` (via PR) |
| Documentation content | `feature/*-docs` | `develop` (via PR) |
| Manual sidebar fixes | Any feature branch | Same branch |

## Questions?

- **"Where do I fix a generator bug?"** → `fix/generator-*` branch from `develop`
- **"How do I get latest generator fixes?"** → Merge `develop` into your branch
- **"Can I modify generator code in my feature branch?"** → No, create separate PR for generator changes
- **"What if develop is protected?"** → Create PR, get review, then merge (prevents accidental publishing)

