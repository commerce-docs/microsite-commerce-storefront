# B2B Documentation Infrastructure Workflow

## Overview

This document describes the workflow for managing **infrastructure changes** (generators, templates, core scripts) separately from **content changes** (enrichments, generated docs) across multiple B2B dropin documentation branches.

## Problem Statement

When working on 5 parallel B2B dropin PRs, infrastructure changes (like generator fixes) made in one dropin branch need to be available to all other dropin branches. Without a proper workflow, these changes remain siloed, causing:

- **Duplication**: Same fix applied manually to each branch
- **Inconsistency**: Different branches may have different generator versions
- **Merge conflicts**: When branches eventually merge, conflicting changes must be resolved
- **Wasted time**: Regenerating docs with outdated generators

## Solution: Two-Track Workflow

### Track 1: Infrastructure (Shared)
**Branch**: `releases/b2b-nov-release`  
**Contents**: Generators, templates, core scripts, shared utilities

### Track 2: Content (Per-Dropin)
**Branches**: Individual dropin branches  
**Contents**: Enrichments, generated documentation, dropin-specific files

## Branch Structure

```
releases/b2b-nov-release (infrastructure)
    ├── scripts/@generate-*.js (generators)
    ├── scripts/lib/*.js (shared utilities)
    ├── _dropin-templates/*.mdx (templates)
    └── Other shared infrastructure
    
b2b-docs-company-management (content)
    ├── _dropin-enrichments/company-management/*.json
    └── src/content/docs/dropins-b2b/company-management/*.mdx
    
b2b-docs-company-switcher (content)
    ├── _dropin-enrichments/company-switcher/*.json
    └── src/content/docs/dropins-b2b/company-switcher/*.mdx
    
b2b-docs-purchase-order (content)
    ├── _dropin-enrichments/purchase-order/*.json
    └── src/content/docs/dropins-b2b/purchase-order/*.mdx
    
b2b-docs-quote-management (content)
    ├── _dropin-enrichments/quote-management/*.json
    └── src/content/docs/dropins-b2b/quote-management/*.mdx
    
b2b-docs-requisition-list (content)
    ├── _dropin-enrichments/requisition-list/*.json
    └── src/content/docs/dropins-b2b/requisition-list/*.mdx
```

## Workflow: Making Changes

### When You Discover an Infrastructure Bug

**Example**: Generator creating broken anchor links

1. **Fix in your current dropin branch** (work locally first)
   ```bash
   # You're on b2b-docs-quote-management
   git add scripts/@generate-function-docs.js
   git commit -m "Fix bidirectional event anchor links in function generator"
   ```

2. **Cherry-pick to release branch** (promote to shared)
   ```bash
   git log --oneline -1  # Get commit hash (e.g., 86784d9a)
   git checkout releases/b2b-nov-release
   git cherry-pick 86784d9a
   git push origin releases/b2b-nov-release
   ```

3. **Propagate to all dropin branches** (sync shared changes)
   ```bash
   # Return to any branch
   git checkout b2b-docs-quote-management
   
   # Run the sync script
   ./scripts/sync-release-to-dropins.sh
   
   # Or manually merge into each branch:
   git checkout b2b-docs-company-management
   git merge releases/b2b-nov-release
   git push origin b2b-docs-company-management
   
   # Repeat for other branches...
   ```

### When You Make Content Changes

**Example**: Adding enrichments for quote-management

1. **Commit only to your dropin branch** (stay local)
   ```bash
   # You're on b2b-docs-quote-management
   git add _dropin-enrichments/quote-management/*.json
   git add src/content/docs/dropins-b2b/quote-management/*.mdx
   git commit -m "Add quote-management enrichments with rich content"
   git push origin b2b-docs-quote-management
   ```

2. **No propagation needed** ✅ (content is dropin-specific)

## Automation Script

### Usage

```bash
# Preview what would be merged (safe, no changes)
./scripts/sync-release-to-dropins.sh --dry-run

# Merge release into all dropin branches
./scripts/sync-release-to-dropins.sh

# Merge and automatically push to remote
./scripts/sync-release-to-dropins.sh --push

# Sync only one dropin branch
./scripts/sync-release-to-dropins.sh --dropin quote-management
```

### What It Does

1. **Fetches** latest changes from remote
2. **Checks out** each dropin branch
3. **Merges** `releases/b2b-nov-release` into the branch
4. **Reports** success, conflicts, or failures
5. **Returns** you to your original branch

### Handling Conflicts

If the script reports conflicts:

```bash
# Manually resolve
git checkout b2b-docs-company-management
git merge releases/b2b-nov-release

# Git will show conflicted files
git status

# Edit conflicted files, then:
git add .
git commit -m "Merge release branch with conflict resolution"
git push origin b2b-docs-company-management
```

## Decision Tree: Where Does This Change Go?

```
┌─────────────────────────────────┐
│ What type of change is this?    │
└────────────┬────────────────────┘
             │
        ┌────┴────┐
        │         │
    ┌───▼───┐ ┌──▼───────┐
    │ CODE  │ │ CONTENT  │
    └───┬───┘ └──┬───────┘
        │        │
        │        └──► Dropin branch only
        │            • Enrichment files (*.json)
        │            • Generated docs (*.mdx)
        │            • Dropin-specific images/assets
        │            • Summary/verification docs
        │
        │
    ┌───▼──────────────────────────┐
    │ Does it affect ALL dropins?  │
    └────┬──────────────────┬──────┘
         │ YES              │ NO
         │                  │
    ┌────▼────┐        ┌────▼────┐
    │ RELEASE │        │ DROPIN  │
    │ BRANCH  │        │ BRANCH  │
    └─────────┘        └─────────┘
    • Generators        • Dropin-specific generator logic
    • Templates         • Dropin-specific fixes
    • Core scripts      • Temporary workarounds
    • Shared utils      
    • Config files      
```

## File Type Reference

### → Release Branch (Infrastructure)

| Path | Type | Examples |
|------|------|----------|
| `scripts/@generate-*.js` | Generators | `@generate-function-docs.js`, `@generate-event-docs.js` |
| `scripts/lib/*.js` | Shared utilities | `generator-core.js`, `event-enrichment.js`, `type-inference.js` |
| `_dropin-templates/*.mdx` | Templates | `dropin-functions.mdx`, `dropin-events.mdx` |
| `scripts/generate-b2b-docs.js` | Master scripts | Main orchestration scripts |
| Config patterns | Shared configs | Changes to `DROPIN_REPOS` structure |

### → Dropin Branch (Content)

| Path | Type | Examples |
|------|------|----------|
| `_dropin-enrichments/{dropin}/*.json` | Enrichments | `functions.json`, `events.json`, `containers.json` |
| `src/content/docs/dropins-b2b/{dropin}/*.mdx` | Generated docs | `functions.mdx`, `events.mdx`, `index.mdx` |
| `*-SUMMARY.md`, `*-VERIFICATION.md` | Documentation | Integration notes, verification reports |
| Dropin-specific assets | Images/files | Container screenshots, dropin-specific diagrams |

## Common Scenarios

### Scenario 1: Generator Bug Fix (like anchor links)

```bash
# 1. Fix in current branch
git add scripts/@generate-function-docs.js
git commit -m "Fix: event anchor links"

# 2. Get commit hash
COMMIT=$(git log --oneline -1 | cut -d' ' -f1)

# 3. Cherry-pick to release
git checkout releases/b2b-nov-release
git cherry-pick $COMMIT
git push origin releases/b2b-nov-release

# 4. Sync all dropin branches
git checkout b2b-docs-quote-management
./scripts/sync-release-to-dropins.sh --push
```

### Scenario 2: Template Update

```bash
# 1. Update template in release branch
git checkout releases/b2b-nov-release
# Edit _dropin-templates/dropin-functions.mdx
git add _dropin-templates/dropin-functions.mdx
git commit -m "Update functions template with new section"
git push origin releases/b2b-nov-release

# 2. Sync to all dropins
./scripts/sync-release-to-dropins.sh --push

# 3. Regenerate docs in each dropin branch
for dropin in company-management company-switcher purchase-order quote-management requisition-list; do
    git checkout b2b-docs-$dropin
    node scripts/@generate-function-docs.js $dropin
    git add src/content/docs/dropins-b2b/$dropin/functions.mdx
    git commit -m "Regenerate functions docs with updated template"
    git push origin b2b-docs-$dropin
done
```

### Scenario 3: Enrichment Addition (Content Only)

```bash
# Stay on your dropin branch
git checkout b2b-docs-quote-management

# Make changes
# Edit _dropin-enrichments/quote-management/functions.json
git add _dropin-enrichments/quote-management/functions.json
git commit -m "Add function enrichments"
git push origin b2b-docs-quote-management

# No sync needed! ✅
```

## Best Practices

### 1. **Commit Separation**

Always separate infrastructure and content changes into different commits:

```bash
# ❌ BAD: Mixed commit
git add scripts/@generate-function-docs.js
git add _dropin-enrichments/quote-management/functions.json
git commit -m "Updates"

# ✅ GOOD: Separate commits
git add scripts/@generate-function-docs.js
git commit -m "Fix generator anchor links"

git add _dropin-enrichments/quote-management/functions.json
git commit -m "Add quote-management function enrichments"
```

### 2. **Cherry-Pick Infrastructure ASAP**

When you fix a generator bug, cherry-pick it to release immediately:

```bash
# Don't wait until PR review
# Other branches need the fix NOW
git checkout releases/b2b-nov-release
git cherry-pick <commit-hash>
git push origin releases/b2b-nov-release
```

### 3. **Sync Before Major Work**

Before starting work on a new dropin, sync from release:

```bash
git checkout b2b-docs-company-switcher
git merge releases/b2b-nov-release
# Now you have the latest generators
node scripts/generate-b2b-docs.js company-switcher
```

### 4. **Test Sync Before Push**

Use `--dry-run` to preview changes:

```bash
./scripts/sync-release-to-dropins.sh --dry-run
# Review what would be merged
./scripts/sync-release-to-dropins.sh --push
```

### 5. **Document Infrastructure Changes**

When adding to release branch, update this document:

```bash
# Example commit message
git commit -m "Add event payload validation to generators

Updated @generate-event-docs.js to validate payload types against
source TypeScript definitions. This affects all dropins.

Related: B2B-INFRASTRUCTURE-WORKFLOW.md"
```

## Troubleshooting

### "Merge conflicts in dropin branch"

**Cause**: Release branch changed the same file as your dropin branch

**Solution**:
```bash
git checkout b2b-docs-quote-management
git merge releases/b2b-nov-release
# Resolve conflicts
git add .
git commit -m "Merge release with conflict resolution"
```

### "Cherry-pick creates empty commit"

**Cause**: The change already exists in the release branch

**Solution**:
```bash
git cherry-pick --skip
# Or if you want to record it anyway:
git commit --allow-empty
```

### "Script reports failures"

**Cause**: Branch doesn't exist locally or remotely

**Solution**:
```bash
# Check if branch exists on remote
git fetch origin
git branch -r | grep b2b-docs

# Create branch if missing
git checkout -b b2b-docs-new-dropin
git push -u origin b2b-docs-new-dropin

# Update script with new branch name
# Edit scripts/sync-release-to-dropins.sh
```

## Maintenance

### Adding a New B2B Dropin

1. **Create the branch**:
   ```bash
   git checkout releases/b2b-nov-release
   git checkout -b b2b-docs-new-dropin
   git push -u origin b2b-docs-new-dropin
   ```

2. **Update sync script**:
   ```bash
   # Edit scripts/sync-release-to-dropins.sh
   # Add "b2b-docs-new-dropin" to DROPIN_BRANCHES array
   ```

3. **Run initial sync**:
   ```bash
   ./scripts/sync-release-to-dropins.sh --dropin new-dropin
   ```

### Archiving Completed Dropins

When a dropin PR merges to main:

1. **Remove from sync script**: Delete from `DROPIN_BRANCHES` array
2. **Keep release branch**: Other dropins still need it
3. **Delete local branch**: `git branch -d b2b-docs-completed-dropin`

## Summary

- **Infrastructure** → `releases/b2b-nov-release` → cherry-pick → sync all branches
- **Content** → individual dropin branches → commit → push (no sync)
- **Use the script**: `./scripts/sync-release-to-dropins.sh`
- **Separate commits**: Never mix infrastructure and content
- **Sync frequently**: Keep dropin branches up to date with release

This workflow ensures:
- ✅ All branches have the latest generators
- ✅ No duplicate work across PRs
- ✅ Clean separation of concerns
- ✅ Easy conflict resolution
- ✅ Maintainable codebase

