# B2B Infrastructure Workflow - Quick Reference

## Quick Decision: Where Does This Change Go?

```
Generator/Template/Script fix → releases/b2b-nov-release
Enrichment/Generated docs     → b2b-docs-{dropin} branch
```

## Common Commands

### Propagate Infrastructure Fix

```bash
# 1. Fix in current branch & commit
git add scripts/@generate-*.js
git commit -m "Fix: description"

# 2. Cherry-pick to release
COMMIT=$(git log --oneline -1 | cut -d' ' -f1)
git checkout releases/b2b-nov-release
git cherry-pick $COMMIT
git push origin releases/b2b-nov-release

# 3. Sync to all dropin branches
git checkout b2b-docs-quote-management
./scripts/sync-release-to-dropins.sh --push
```

### Add Content (No Sync Needed)

```bash
# Stay on your dropin branch
git add _dropin-enrichments/{dropin}/*.json
git add src/content/docs/dropins-b2b/{dropin}/*.mdx
git commit -m "Add enrichments"
git push origin b2b-docs-{dropin}
```

### Sync Script Usage

```bash
# Preview (safe, no changes)
./scripts/sync-release-to-dropins.sh --dry-run

# Sync all branches
./scripts/sync-release-to-dropins.sh

# Sync and push
./scripts/sync-release-to-dropins.sh --push

# Sync one branch
./scripts/sync-release-to-dropins.sh --dropin quote-management
```

## File Paths Quick Reference

### → Release Branch
- `scripts/@generate-*.js`
- `scripts/lib/*.js`
- `_dropin-templates/*.mdx`
- `scripts/generate-b2b-docs.js`

### → Dropin Branch
- `_dropin-enrichments/{dropin}/*.json`
- `src/content/docs/dropins-b2b/{dropin}/*.mdx`
- `*-SUMMARY.md`, `*-VERIFICATION.md`

## Troubleshooting One-Liners

```bash
# Merge conflict? Resolve manually
git merge releases/b2b-nov-release  # resolve conflicts
git add . && git commit

# Empty cherry-pick?
git cherry-pick --skip

# Check what would be merged
git log --oneline HEAD..releases/b2b-nov-release

# Update sync script for new dropin
# Edit scripts/sync-release-to-dropins.sh → DROPIN_BRANCHES array
```

## Current B2B Dropin Branches

- `b2b-docs-company-management`
- `b2b-docs-company-switcher`
- `b2b-docs-purchase-order`
- `b2b-docs-quote-management`
- `b2b-docs-requisition-list`

## ⚠️ Common Mistakes & Lessons Learned

### ❌ WRONG: Infrastructure Changes on Dropin Branches First

**What Happened (Nov 2025):**
```bash
# WRONG ORDER - Made changes on dropin branch first
git checkout b2b-docs-company-management
# Edit astro.config.mjs (sidebar)
# Edit scripts/lib/generator-core.js
git commit -m "Fix generator"
git push origin b2b-docs-company-management

# Then cherry-picked to release branch (backwards!)
git checkout releases/b2b-nov-release
git cherry-pick <commit>
```

**Why This is Wrong:**
- Infrastructure changes appear to originate from dropin branches
- Confusing commit history
- Makes it unclear where infrastructure lives
- Hard to track what's infrastructure vs. content

### ✅ CORRECT: Infrastructure Changes on Release Branch First

**Correct Order:**
```bash
# 1. ALWAYS start on release branch for infrastructure
git checkout releases/b2b-nov-release
# Edit scripts/@generate-*.js, astro.config.mjs, etc.
git add scripts/ astro.config.mjs
git commit -m "Fix: generator improvement"
git push origin releases/b2b-nov-release

# 2. THEN merge/cherry-pick to dropin branches
git checkout b2b-docs-company-management
git merge releases/b2b-nov-release --no-edit
# OR use sync script for all branches
./scripts/sync-release-to-dropins.sh --push

# 3. THEN regenerate content on dropin branch
node scripts/@generate-overview-docs.js company-management
git add src/content/docs/dropins-b2b/company-management/
git commit -m "Regenerate company-management overview with fixed generator"
git push origin b2b-docs-company-management
```

### ❌ WRONG: Shared Files on Multiple Dropin Branches

**What Happened (Nov 2025):**
```bash
# Added B2B overview page to ALL dropin branches
# Each branch only has 1 dropin's content
# Overview page links to all 5 dropins = 4 broken links per branch
git add src/content/docs/dropins-b2b/index.mdx
git commit -m "Add B2B overview"
# This broke builds on all individual dropin branches
```

**Why This is Wrong:**
- Link validation fails (links to dropins not in that branch)
- Each branch should be self-contained
- Overview page needs ALL dropins to work

### ✅ CORRECT: Shared Content Only on Preview Branch

**Correct Approach:**
```bash
# Shared content (overview, navigation) goes ONLY on preview branch
git checkout b2b-documentation
git add src/content/docs/dropins-b2b/index.mdx
git commit -m "Add B2B overview page (preview branch only)"

# Individual dropin branches have ONLY their own content
git checkout b2b-docs-company-management
ls src/content/docs/dropins-b2b/
# Should show ONLY: company-management/ (not index.mdx)
```

## 📋 Checklist Before Committing

### Infrastructure Changes (generators, templates, scripts):
- [ ] On `releases/b2b-nov-release` branch?
- [ ] Committed and pushed to `releases/b2b-nov-release` FIRST?
- [ ] Then synced to dropin branches?

### Content Changes (generated docs, enrichments):
- [ ] On appropriate `b2b-docs-{dropin}` branch?
- [ ] Only contains files for THIS dropin?
- [ ] No cross-dropin links without all content present?

### Sidebar/Config Changes:
- [ ] Committed to `releases/b2b-nov-release` FIRST?
- [ ] Then synced to all branches that need it?

### Shared Content (overview pages, cross-dropin navigation):
- [ ] Only on `b2b-documentation` preview branch?
- [ ] NOT on individual dropin branches?

---

**Full documentation**: See `B2B-INFRASTRUCTURE-WORKFLOW.md`

