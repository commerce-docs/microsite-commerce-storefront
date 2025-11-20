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

---

**Full documentation**: See `B2B-INFRASTRUCTURE-WORKFLOW.md`

