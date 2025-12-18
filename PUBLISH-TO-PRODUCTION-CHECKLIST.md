# 🚀 Publish B2B Documentation to Production - CHECKLIST

**⚠️ SAVE THIS FILE - You'll need it when publishing!**

---

## When to Use This

Use this checklist when you're ready to publish B2B documentation to the live site (merge to `develop`).

**Typical triggers:**
- Major drop-ins are complete and reviewed
- Quarterly release cycle
- Before product launch
- Critical updates needed in production

---

## The Checklist (Copy This Each Time)

### Pre-Publication Phase

- [ ] **All feature branch PRs reviewed and approved**
  - [ ] Requisition List PR #___
  - [ ] Company Management PR #___
  - [ ] Company Switcher PR #___
  - [ ] Quote Management PR #___
  - [ ] Other: _______________

- [ ] **Infrastructure is current**
  - [ ] Latest generators tested
  - [ ] Validation scripts working
  - [ ] No known bugs in tooling

- [ ] **Stakeholders notified**
  - [ ] Product team aware
  - [ ] Engineering team aware
  - [ ] Documentation team aware
  - [ ] Publication window scheduled

---

### Step 1: Consolidate Infrastructure (5 min)

```bash
# Switch to publication branch
git checkout releases/b2b-nov-release
git pull origin releases/b2b-nov-release

# Merge infrastructure updates
git merge releases/b2b-infrastructure --no-ff \
  -m "chore: Consolidate infrastructure for publication

- Latest generators and validation scripts
- Updated templates
- Package dependencies
- Architectural documentation"

# Push
git push origin releases/b2b-nov-release
```

- [ ] Infrastructure merged
- [ ] No conflicts
- [ ] Pushed to GitHub

---

### Step 2: Consolidate Approved Documentation (5 min)

```bash
# Still on releases/b2b-nov-release

# Merge approved, merged drop-ins
git merge releases/b2b-docs-only --no-ff \
  -m "docs: Consolidate approved documentation for publication

Merged drop-ins:
- Purchase Order (PR #620)
- Requisition List (PR #___)
- Company Management (PR #___)
- Company Switcher (PR #___)
- Quote Management (PR #___)"

# Push
git push origin releases/b2b-nov-release
```

- [ ] Documentation merged
- [ ] List all included drop-ins in commit message
- [ ] No conflicts
- [ ] Pushed to GitHub

---

### Step 3: Verify Readiness (2 min)

```bash
# Run automated verification
./scripts/verify-publication-readiness.sh
```

**This script checks:**
- ✅ Branch is up to date
- ✅ Expected content present (Purchase Order, scripts, templates)
- ✅ No unexpected in-progress drop-ins
- ✅ No uncommitted changes
- ✅ Commit and contributor counts

- [ ] Verification script passed ✅
- [ ] Reviewed any warnings
- [ ] Confirmed commit count (should show 3,230+)
- [ ] Confirmed contributor count (50+)

**If verification FAILS**: Fix issues before proceeding!

---

### Step 4: Create Publication PR (10 min)

```bash
# Switch to develop
git checkout develop
git pull origin develop

# Check what will be merged (review carefully!)
git log --oneline develop..releases/b2b-nov-release | head -20

# Verify the stats
git diff --stat develop..releases/b2b-nov-release
```

- [ ] Reviewed commits to be merged
- [ ] Verified no unexpected changes
- [ ] Checked file count is reasonable

**Create PR on GitHub:**

- [ ] From: `releases/b2b-nov-release`
- [ ] To: `develop`
- [ ] Title: "feat: Publish B2B documentation to production"
- [ ] Used `.github/PULL_REQUEST_TEMPLATE_PUBLICATION.md`
- [ ] All checklist items in template completed
- [ ] Reviewers assigned (minimum 2)
- [ ] Labels added: `B2B`, `production-release`

---

### Step 5: Review and Merge PR (time varies)

- [ ] PR reviewed by team
- [ ] CI/CD checks passing
- [ ] No merge conflicts
- [ ] Final approval from product owner

**Merge the PR:**

- [ ] Use **"Merge commit"** (NOT squash, NOT rebase)
- [ ] Verify merge commit message is descriptive
- [ ] Merged to `develop`

---

### Step 6: Post-Publication (5 min)

```bash
# Tag the release
git checkout develop
git pull origin develop

git tag -a b2b-release-$(date +%Y%m%d) \
  -m "B2B documentation release $(date +%Y-%m-%d)

Published drop-ins:
- Purchase Order
- Requisition List  
- Company Management
- Company Switcher
- Quote Management

Total commits: 3,230+
Contributors: 50+"

git push origin --tags
```

- [ ] Release tagged
- [ ] Tag pushed to GitHub

**Notify stakeholders:**

- [ ] Slack announcement
- [ ] Email to product team
- [ ] Update project tracker
- [ ] Documentation site updated

**Verify production:**

- [ ] Browse to production docs site
- [ ] Check B2B section loads
- [ ] Spot-check 2-3 pages
- [ ] Verify search works

---

## Rollback (If Needed)

**If something goes wrong after merge:**

```bash
# Find the merge commit
git log --oneline --graph develop | head -20

# Revert the merge (keeps history)
git checkout develop
git revert -m 1 <merge-commit-sha>

# Add explanation
# Edit commit message to explain why reverting

git push origin develop
```

- [ ] Identified issue
- [ ] Found merge commit SHA
- [ ] Reverted (not reset!)
- [ ] Notified team
- [ ] Investigated root cause

---

## Success Criteria

✅ All 3,230+ commits merged to develop  
✅ All 50+ contributors credited  
✅ Production site shows B2B documentation  
✅ No errors in production  
✅ Team notified  
✅ Release tagged  

---

## Quick Reference

**Before publishing:**
- Check this file: `PUBLISH-TO-PRODUCTION-CHECKLIST.md`
- Review: `B2B-WORKFLOW-GUIDE.md` → Workflow 4
- Understand: `DUAL-BRANCH-ARCHITECTURE.md` → Publication Strategy

**During publishing:**
- Run: `./scripts/verify-publication-readiness.sh`
- Use template: `.github/PULL_REQUEST_TEMPLATE_PUBLICATION.md`

**After publishing:**
- Tag the release
- Notify stakeholders
- Verify production

---

## Emergency Contacts

- **Architecture questions**: Bruce Denham
- **Technical issues**: [Your DevOps team]
- **Product approval**: [Product owner]
- **Emergency rollback**: [On-call engineer]

---

**💡 TIP**: Print this checklist or keep it bookmarked. You'll use it every time you publish B2B work to production.

**📅 Last Updated**: 2024-12-18  
**🔗 Related Docs**: `B2B-WORKFLOW-GUIDE.md`, `DUAL-BRANCH-ARCHITECTURE.md`

