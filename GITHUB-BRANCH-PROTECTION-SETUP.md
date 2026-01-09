# GitHub Branch Protection Setup for B2B Safety

## Purpose

Set up GitHub branch protection rules to prevent accidental direct merges of B2B work to `develop` without proper consolidation.

**These rules work alongside:**
- Git pre-push hooks (`.githooks/pre-push`)
- GitHub Actions workflow (`.github/workflows/prevent-b2b-direct-merge.yml`)
- Verification scripts (`scripts/verify-publication-readiness.sh`)

---

## Step-by-Step Setup

### 1. Access Branch Protection Settings

1. Go to: https://github.com/commerce-docs/microsite-commerce-storefront/settings/branches
2. Click **"Add branch protection rule"** or edit existing `develop` rule

### 2. Configure `develop` Branch Protection

**Branch name pattern:**
```
develop
```

**Required settings:**

#### ✅ Protect matching branches

- [x] **Require a pull request before merging**
  - [x] Require approvals: **2**
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (optional but recommended)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - **Add required status checks:**
    - `validate-b2b-publication` (from prevent-b2b-direct-merge.yml)
    - Any other CI checks you have

- [x] **Require conversation resolution before merging**

- [x] **Do not allow bypassing the above settings**
  - This prevents even admins from accidentally bypassing

#### Optional but Recommended

- [x] **Require linear history** (prevents messy merge commits)
- [x] **Require signed commits** (security best practice)
- [ ] **Include administrators** (if you want to enforce on yourself - recommended!)

### 3. Configure `releases/b2b-nov-release` Branch Protection

**Branch name pattern:**
```
releases/b2b-nov-release
```

**Required settings:**

- [x] **Require a pull request before merging** (optional, depends on team)
- [x] **Require status checks to pass before merging**
  - `validate-b2b-enrichments` (if CI configured)
  - `validate-branch-content` (if CI configured)

- [ ] **Do not allow force pushes** (⚠️ **CRITICAL** - prevents history rewrite)
- [x] **Allow deletions** = **UNCHECKED** (⚠️ **CRITICAL** - prevents branch deletion)

**Why this matters:**
- This branch contains ALL 3,230+ commits
- Force pushes could destroy history
- Deletion would lose all work

### 4. Configure Working Branches (Optional)

**Branch name patterns:**
```
releases/b2b-infrastructure
releases/b2b-docs-only
```

**Settings:**
- [x] **Require status checks** (validation scripts)
- [ ] **Require pull requests** (optional, depends on workflow)
- [ ] **Do not allow force pushes** (recommended)

### 5. Configure Feature Branches (Optional)

**Branch name pattern:**
```
b2b-docs-*
```

**Settings:**
- [x] **Require status checks** (pollution validation)
- [ ] **Delete branch on merge** (cleanup)

---

## Verification

After setup, test the protection:

### Test 1: Try to push B2B branch directly to develop

```bash
# This should be BLOCKED by pre-push hook
git checkout b2b-docs-requisition-list-v3
git push origin develop
# Expected: Hook blocks with error message
```

### Test 2: Try to create PR from wrong branch

1. Create PR: `b2b-docs-requisition-list-v3` → `develop`
2. GitHub Actions should fail
3. Bot should comment with error message
4. PR should be blocked from merging

### Test 3: Correct workflow should work

```bash
# This should SUCCEED
git checkout releases/b2b-nov-release
# ... do consolidation ...
git push origin releases/b2b-nov-release
# Create PR: releases/b2b-nov-release → develop
# Should pass all checks
```

---

## What Each Layer Protects

| Layer | Protects Against | When It Activates |
|-------|------------------|-------------------|
| **Pre-push hook** | Local accidental pushes | Before `git push` |
| **GitHub Actions** | PR from wrong branch | When PR is opened |
| **Branch protection** | Direct pushes, force pushes | Always |
| **Required reviews** | Unreviewed changes | Before merge |
| **Status checks** | Validation failures | Before merge |

**Result**: Multiple overlapping safety nets! 🛡️

---

## Team Communication

After setup, announce to the team:

```
📢 Branch Protection Enabled for B2B Safety

To publish B2B work to production:
1. You CANNOT push directly to develop
2. You CANNOT create PR from feature branches to develop
3. You MUST use releases/b2b-nov-release (see PUBLISH-TO-PRODUCTION-CHECKLIST.md)

The system will block incorrect workflows and show you the correct steps.

Questions? Read: PUBLISH-B2B-README.md
```

---

## Troubleshooting

### "My push was blocked!"

**Good!** The system is working. Follow these steps:
1. Read the error message (it shows correct workflow)
2. Open `PUBLISH-TO-PRODUCTION-CHECKLIST.md`
3. Follow the consolidation workflow

### "I need to bypass for emergency"

**Before bypassing:**
1. Understand the risk (might lose commit history)
2. Document why bypassing is necessary
3. Get approval from 2+ people
4. Create a plan to fix properly after emergency

**To bypass:**
1. Admin temporarily disables branch protection
2. Make the push
3. **IMMEDIATELY** re-enable protection
4. Create follow-up task to do proper consolidation

### "Status check won't pass"

Check:
1. Did you run `./scripts/verify-publication-readiness.sh`?
2. Is your branch up to date?
3. Are there merge conflicts?
4. Check GitHub Actions logs for details

---

## Maintenance

### Quarterly Review

- [ ] Verify branch protection rules still active
- [ ] Test that hooks are working
- [ ] Review any bypass requests (should be zero)
- [ ] Update documentation if workflow changes

### When Team Changes

New team members need:
1. Hook installation: `git config core.hooksPath .githooks`
2. Read: `PUBLISH-B2B-README.md`
3. Review: `B2B-WORKFLOW-GUIDE.md`

---

## Related Files

- `.githooks/pre-push` - Local Git hook
- `.github/workflows/prevent-b2b-direct-merge.yml` - GitHub Actions
- `scripts/verify-publication-readiness.sh` - Verification script
- `PUBLISH-TO-PRODUCTION-CHECKLIST.md` - Publication guide

---

**Status**: Ready to implement  
**Priority**: High (protects 3,230+ commits)  
**Effort**: 15 minutes to set up  
**Impact**: Prevents catastrophic data loss

