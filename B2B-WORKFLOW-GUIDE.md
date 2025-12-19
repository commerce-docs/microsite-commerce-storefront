# B2B Dual-Branch Workflow Guide

## Quick Reference

| I want to... | Branch | Command |
|--------------|--------|---------|
| Update a generator | `releases/b2b-infrastructure` | Direct commit or PR |
| Update a template | `releases/b2b-infrastructure` | Direct commit or PR |
| Add/update drop-in docs | Feature branch (`b2b-docs-[dropin]-v#`) | Work in feature branch |
| Update enrichments | Feature branch | Work in feature branch |
| Merge approved drop-in | `releases/b2b-docs-only` | Squash merge from feature |
| Update preview | `b2b-documentation` | Merge from docs-only |
| Sync infrastructure to features | Feature branches | Merge from infrastructure |

## Daily Workflows

### Workflow 1: Infrastructure Changes (Generators, Scripts, Templates)

```bash
# 1. Create branch from infrastructure
git checkout releases/b2b-infrastructure
git pull origin releases/b2b-infrastructure
git checkout -b fix/update-validator

# 2. Make changes
vim scripts/validate-b2b-enrichments.js
vim _dropin-templates/dropin-container.mdx

# 3. Test changes
npm run validate-b2b-enrichments

# 4. Validate before commit
./scripts/validate-branch-content.sh --pre-commit

# 5. Commit and push
git add scripts/ _dropin-templates/
git commit -m "fix: Update validation logic for new parameter types"
git push origin fix/update-validator

# 6. Create PR → releases/b2b-infrastructure
# GitHub Actions will validate

# 7. After merge, sync to ALL feature branches
for branch in requisition-list-v3 company-management-v2 company-switcher-v2 quote-management-v2; do
  git checkout b2b-docs-$branch
  git pull origin b2b-docs-$branch
  git merge releases/b2b-infrastructure
  git push origin b2b-docs-$branch
done
```

**Validation**: CI checks that ONLY infrastructure files are modified

### Workflow 2: Feature Branch Development (Documentation)

```bash
# 1. Ensure infrastructure is up-to-date
git checkout b2b-docs-requisition-list-v3
git pull origin b2b-docs-requisition-list-v3
git merge releases/b2b-infrastructure  # Get latest tools

# 2. Make documentation changes
vim src/content/docs/dropins-b2b/requisition-list/containers/requisition-list-view.mdx
vim _dropin-enrichments/requisition-list/containers.json

# 3. Run generators
npm run generate-b2b-docs requisition-list

# 4. Validate enrichments
npm run validate-b2b-enrichments
# Must show: ✅ All B2B enrichment files are clean!

# 5. Validate branch content
./scripts/validate-branch-content.sh
# Must show: ✅ VALIDATION PASSED

# 6. Commit and push
git add src/content/docs/dropins-b2b/requisition-list/
git add _dropin-enrichments/requisition-list/
git commit -m "docs: Update RequisitionListView container examples"
git push origin b2b-docs-requisition-list-v3

# 7. Update preview (optional, for review)
git checkout b2b-documentation
git merge b2b-docs-requisition-list-v3
git push origin b2b-documentation
```

**Validation**: CI checks that ONLY this drop-in's files are modified

### Workflow 3: Merge Approved Drop-in

```bash
# After PR is approved and merged
git checkout releases/b2b-docs-only
git pull origin releases/b2b-docs-only

# Option A: Squash merge (recommended)
git merge --squash b2b-docs-requisition-list-v3

# Keep only drop-in-specific files
git reset HEAD
git add src/content/docs/dropins-b2b/requisition-list/
git add _dropin-enrichments/requisition-list/
git add public/images/dropins-b2b/requisition-list/

git commit -m "docs: Add Requisition List drop-in (PR #681)

- Complete documentation for 5 containers
- Enrichment files with parameter descriptions
- 8 diagram images

Reviewed-by: @keharper, @svera"

# Option B: Cherry-pick specific commits
git cherry-pick <commit-sha> --no-commit
git reset HEAD
git add src/content/docs/dropins-b2b/requisition-list/
git add _dropin-enrichments/requisition-list/
git commit

git push origin releases/b2b-docs-only

# Update preview
git checkout b2b-documentation
git merge releases/b2b-docs-only
git push origin b2b-documentation
```

**Validation**: CI checks that ONLY approved drop-in's files are added

### Workflow 4: Update Merged Drop-in (Post-Merge Changes)

```bash
# Bug found in merged drop-in's enrichments

# 1. Update in feature branch (if still exists)
git checkout b2b-docs-requisition-list-v3
vim _dropin-enrichments/requisition-list/containers.json
git commit -m "fix: Correct parameter description"
git push

# 2. Cherry-pick to docs-only branch
git checkout releases/b2b-docs-only
git cherry-pick <commit-sha> -- _dropin-enrichments/requisition-list/
git push origin releases/b2b-docs-only

# 3. Update preview
git checkout b2b-documentation
git merge releases/b2b-docs-only
git push
```

---

## Workflow 4: Publish to Production

**🚨 CRITICAL WORKFLOW**: Preserves all 3,230+ commits from 50+ contributors on `releases/b2b-nov-release`.

### Prerequisites

- [ ] All feature branch PRs reviewed and approved
- [ ] Infrastructure branch has latest generators
- [ ] Docs-only branch has all merged drop-ins  
- [ ] Stakeholders notified
- [ ] Production deployment window scheduled

### Publication Steps

```bash
# 1. Consolidate all work to b2b-nov-release
git checkout releases/b2b-nov-release
git pull origin releases/b2b-nov-release

# 2. Merge infrastructure updates
git merge releases/b2b-infrastructure --no-ff \
  -m "chore: Consolidate infrastructure for publication

- Latest generators and validation scripts
- Updated templates
- Package dependencies"

# 3. Merge approved documentation
git merge releases/b2b-docs-only --no-ff \
  -m "docs: Consolidate approved documentation for publication

- Purchase Order drop-in (merged)
- Requisition List drop-in (merged)
- Company Management drop-in (merged)
- [Add other approved drop-ins]"

# 4. Verify readiness (automated checks)
./scripts/verify-publication-readiness.sh

# If verification passes:

# 5. Merge to develop
git checkout develop
git pull origin develop

git merge releases/b2b-nov-release --no-ff \
  -m "feat: Publish B2B documentation to production

This merge brings 3,230+ commits from 50+ contributors including:
- Purchase Order drop-in (complete)
- Requisition List drop-in (complete)
- Company Management, Company Switcher, Quote Management
- Generator improvements and enrichment refinements
- Infrastructure updates and validation tools

All commit history and attributions preserved."

# 6. Push to production
git push origin develop

# 7. Tag the release (recommended)
git tag -a b2b-release-$(date +%Y%m%d) \
  -m "B2B documentation release $(date +%Y-%m-%d)"
git push origin --tags
```

### Why This is 100% Safe

✅ **All 3,230+ commits preserved** - Every change included  
✅ **All 50+ contributors credited** - Git history intact  
✅ **Full audit trail** - Merge commit shows what was published  
✅ **Rollback-safe** - Can revert the single merge commit  
✅ **Automated verification** - Script catches issues before push  

### When to Publish

- **Major milestones**: When core drop-ins are complete
- **Product releases**: Before major Adobe Commerce releases
- **Quarterly**: Regular publication schedule
- **On-demand**: Critical fixes or updates

### Verification Script Checks

The `verify-publication-readiness.sh` script validates:

- Branch is up to date with remote
- Expected content present (Purchase Order, scripts, templates)
- No unexpected in-progress drop-ins
- No uncommitted changes
- Commit and contributor counts

**If verification fails**: Fix issues before proceeding.

### Rollback Procedure (if needed)

```bash
# If something goes wrong after merge to develop:

# 1. Find the merge commit
git log --oneline --graph develop | head -20

# 2. Revert the merge
git revert -m 1 <merge-commit-sha>

# 3. Push the revert
git push origin develop

# The revert preserves history while undoing the publication
```

---

## All Potential Issues & Solutions

### Issue 1: Wrong Branch Commits ❌
**Problem**: Committing infrastructure changes to feature branch

**Detection**:
- ✅ Pre-commit hook: `./scripts/validate-branch-content.sh --pre-commit`
- ✅ CI validation on push
- ✅ PR validation

**Prevention**:
```bash
# Set up pre-commit hook (one-time)
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
./scripts/validate-branch-content.sh --pre-commit
EOF
chmod +x .git/hooks/pre-commit
```

**Fix**:
```bash
# Undo last commit
git reset HEAD~1

# Move changes to correct branch
git stash
git checkout releases/b2b-infrastructure
git stash pop
git commit -m "fix: Update generator"
```

### Issue 2: Reverse Merge Direction ❌
**Problem**: Merging feature → infrastructure (should be infrastructure → feature)

**Detection**:
- ✅ GitHub Actions checks merge direction in PRs
- ✅ Branch protection rules

**Prevention**:
- ✅ Require PRs for release branches
- ✅ CI validation fails on wrong direction

**Fix**:
```bash
# Close wrong PR
# Create new PR in correct direction
```

### Issue 3: Stale Infrastructure in Features ⚠️
**Problem**: Feature branch doesn't have latest generator updates

**Detection**:
```bash
# Check if behind
git checkout b2b-docs-requisition-list-v3
git fetch origin
git log HEAD..origin/releases/b2b-infrastructure --oneline
```

**Prevention**:
- ✅ Regular syncs (weekly or after infrastructure changes)
- ✅ CI warning if more than X commits behind

**Fix**:
```bash
git checkout b2b-docs-requisition-list-v3
git merge releases/b2b-infrastructure
git push
```

### Issue 4: Enrichment Pollution Returns ❌
**Problem**: Parameters from other drop-ins leak into enrichments

**Detection**:
```bash
npm run validate-b2b-enrichments
# Will show: ❌ N polluted parameter(s) found
```

**Prevention**:
- ✅ Pre-commit validation
- ✅ CI validation on every push
- ✅ PR validation

**Fix**:
```bash
npm run validate-b2b-enrichments -- --fix
git add _dropin-enrichments/
git commit --amend
```

### Issue 5: Multiple Drop-ins in One Branch ❌
**Problem**: Developer works on multiple drop-ins in one feature branch

**Detection**:
- ✅ Branch content validation fails
- ✅ CI rejects commit

**Prevention**:
- ✅ Clear branch naming convention
- ✅ Validation enforces single drop-in per branch

**Fix**:
```bash
# Split into separate branches
git checkout -b b2b-docs-company-management-v3
git checkout b2b-docs-requisition-list-v3 -- src/content/docs/dropins-b2b/company-management/
# ... separate the changes
```

### Issue 6: Orphaned Files ⚠️
**Problem**: Enrichment exists without docs, or vice versa

**Detection**:
```bash
# Check for orphans
ls _dropin-enrichments/
ls src/content/docs/dropins-b2b/
# Should match
```

**Prevention**:
- ✅ Validation script checks for matching directories
- ✅ CI warning if mismatch

**Fix**: Add missing files or remove orphans

### Issue 7: Template Changes Break Generation ❌
**Problem**: Template update causes generator failures

**Detection**:
```bash
# Test generators after template change
npm run generate-b2b-docs requisition-list -- --dry-run
```

**Prevention**:
- ✅ Test all generators before merging template changes
- ✅ CI runs generator tests

**Fix**: Revert template or fix generator

### Issue 8: Config Drift in Preview ⚠️
**Problem**: `astro.config.mjs` sidebar doesn't match actual content

**Detection**:
```bash
# Check sidebar vs actual files
# Manual review for now
```

**Prevention**:
- ✅ Only update config in preview branch
- ✅ Review config in PRs to preview

**Fix**: Update `astro.config.mjs` to match reality

### Issue 9: Lost Local Changes ❌
**Problem**: Forgot to commit before switching branches

**Prevention**:
```bash
# Always stash before switching
git stash
git checkout other-branch
git stash pop
```

**Fix**:
```bash
git reflog  # Find lost commits
git cherry-pick <commit-sha>
```

### Issue 10: Merge Conflicts ❌
**Problem**: Conflicts when merging infrastructure to feature

**Detection**: Git reports conflicts

**Prevention**:
- ✅ Sync frequently
- ✅ Don't modify infrastructure files in feature branches

**Fix**:
```bash
git merge releases/b2b-infrastructure
# If conflicts in infrastructure files (scripts/):
git checkout --theirs scripts/
git add scripts/
git commit
```

## Validation Checklist

### Before Every Commit
- [ ] Run: `./scripts/validate-branch-content.sh --pre-commit`
- [ ] If enrichments changed: `npm run validate-b2b-enrichments`
- [ ] Review staged files: `git status`

### Before Every Push
- [ ] Run: `./scripts/validate-branch-content.sh`
- [ ] Run: `npm run validate-b2b-enrichments` (if applicable)
- [ ] Check branch is up-to-date: `git pull`

### Before Every PR
- [ ] CI validations pass
- [ ] Branch content validation passes
- [ ] Enrichment validation passes
- [ ] No files from other drop-ins

### Before Merging Infrastructure
- [ ] Test generators work
- [ ] Test validation scripts work
- [ ] Plan sync to feature branches

### Before Merging Drop-in to Docs-Only
- [ ] PR approved by reviewers
- [ ] All CI checks pass
- [ ] Only drop-in-specific files included
- [ ] Enrichments validated

## Emergency Procedures

### Rollback Bad Infrastructure Merge
```bash
git checkout releases/b2b-infrastructure
git revert <bad-commit-sha>
git push origin releases/b2b-infrastructure

# Rollback from feature branches
for branch in requisition-list-v3 company-management-v2 company-switcher-v2 quote-management-v2; do
  git checkout b2b-docs-$branch
  git revert <merge-commit-sha>
  git push origin b2b-docs-$branch
done
```

### Fix Polluted Branch
```bash
# Nuclear option: recreate from clean base
git checkout releases/b2b-docs-only
git checkout -b b2b-docs-requisition-list-v4-clean

# Add only requisition-list files from old branch
git checkout b2b-docs-requisition-list-v3 -- src/content/docs/dropins-b2b/requisition-list/
git checkout b2b-docs-requisition-list-v3 -- _dropin-enrichments/requisition-list/

# Merge infrastructure
git merge releases/b2b-infrastructure

# Validate
npm run validate-b2b-enrichments
./scripts/validate-branch-content.sh

# Push and create new PR
git push origin b2b-docs-requisition-list-v4-clean
```

## Branch Protection Rules (GitHub)

### `releases/b2b-infrastructure`
- Require PR for changes
- Require CI validation to pass
- Require 1 reviewer
- Don't allow force push

### `releases/b2b-docs-only`
- Require PR for changes
- Require CI validation to pass
- Require 2 reviewers (documentation quality)
- Don't allow force push

### `b2b-docs-*` (Feature branches)
- Require CI validation to pass
- Allow force push (for cleanup)
- Require 2 reviewers before merge to docs-only

### `b2b-documentation` (Preview)
- Allow direct pushes (for quick previews)
- Require CI validation
- Used for review, not source of truth

## Success Metrics

✅ **Zero Pollution**: No cross-drop-in file contamination  
✅ **Clean Merges**: Infrastructure syncs have zero conflicts  
✅ **Fast Reviews**: Preview branch always up-to-date  
✅ **Validated Commits**: 100% of commits pass validation  
✅ **Clear Ownership**: Every file has one owner  

## Getting Help

- Architecture questions: See `DUAL-BRANCH-ARCHITECTURE.md`
- Validation errors: Run `./scripts/validate-branch-content.sh` for details
- Enrichment issues: Run `npm run validate-b2b-enrichments` for details
- Migration questions: See `scripts/migrate-to-dual-branch.sh`

