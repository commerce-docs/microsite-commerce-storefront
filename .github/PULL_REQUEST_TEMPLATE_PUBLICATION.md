---
name: Publication to Production
about: Merge B2B documentation to develop for production release
---

# 🚀 B2B Documentation Publication

**⚠️ CRITICAL: This PR publishes B2B work to production**

## Pre-Publication Checklist

**BEFORE creating this PR, you MUST:**

- [ ] **Step 1: Consolidate infrastructure**
  ```bash
  git checkout releases/b2b-nov-release
  git merge releases/b2b-infrastructure --no-ff -m "chore: Consolidate infrastructure for publication"
  ```

- [ ] **Step 2: Consolidate approved documentation**
  ```bash
  git merge releases/b2b-docs-only --no-ff -m "docs: Consolidate approved documentation for publication"
  ```

- [ ] **Step 3: Run verification script**
  ```bash
  ./scripts/verify-publication-readiness.sh
  ```
  ✅ Script must pass before proceeding

- [ ] **Step 4: Push consolidated branch**
  ```bash
  git push origin releases/b2b-nov-release
  ```

## This PR Should Be

- **From**: `releases/b2b-nov-release`
- **To**: `develop`
- **Type**: Merge commit (not squash, not rebase)

## What's Being Published

<!-- List major features/drop-ins included -->

- [ ] Infrastructure updates (generators, scripts, templates)
- [ ] Drop-in documentation:
  - [ ] Purchase Order (merged)
  - [ ] Requisition List
  - [ ] Company Management
  - [ ] Company Switcher
  - [ ] Quote Management
  - [ ] Other: _______________

## Commit Stats

- **Commits**: _____ (from `releases/b2b-nov-release`)
- **Contributors**: _____ (check with `git shortlog -sn`)
- **Files changed**: _____

## Verification

- [ ] Ran `./scripts/verify-publication-readiness.sh` ✅
- [ ] Reviewed commit history (`git log --oneline develop..releases/b2b-nov-release`)
- [ ] Verified no unexpected files
- [ ] Confirmed all attributions preserved
- [ ] Stakeholders notified

## Rollback Plan

If issues arise post-merge:

```bash
# Find the merge commit
git log --oneline --graph develop | head -20

# Revert the merge
git revert -m 1 <merge-commit-sha>
git push origin develop
```

---

**📚 Documentation**: See `B2B-WORKFLOW-GUIDE.md` → Workflow 4: Publish to Production

**❓ Questions**: Review `DUAL-BRANCH-ARCHITECTURE.md` → Publication Strategy

