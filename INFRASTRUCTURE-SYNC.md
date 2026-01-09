# Infrastructure Sync Strategy for B2B Feature Branches

## The Problem

When infrastructure changes (generators, validators, scripts) are made in the `releases/b2b-nov-release` branch, feature branches become out of date. This causes:

1. **Stale Generators**: Running generators on feature branches uses old code
2. **Missing Validators**: New validation scripts aren't available
3. **Enrichment Pollution**: Without the validation script, polluted enrichment files can be re-committed
4. **Inconsistent Tooling**: Different branches use different generator versions

## The Challenge

We can't do a simple `git merge releases/b2b-nov-release` into feature branches because:

- ❌ Release branch contains **merged drop-in docs** (e.g., Purchase Order from PR #620)
- ❌ Merging would pollute feature branches with docs from OTHER drop-ins
- ✅ But we DO want infrastructure changes

## The Solution: Selective Sync

We have **two scripts** to safely sync ONLY infrastructure files:

### Option 1: Simple Checkout (RECOMMENDED)

**Safest approach** - Cherry-picks specific files from release branch:

```bash
# Sync infrastructure for a specific feature branch
./scripts/sync-infrastructure-simple.sh b2b-docs-requisition-list-v3 requisition-list
./scripts/sync-infrastructure-simple.sh b2b-docs-company-management-v2 company-management
./scripts/sync-infrastructure-simple.sh b2b-docs-company-switcher-v2 company-switcher
./scripts/sync-infrastructure-simple.sh b2b-docs-quote-management-v2 quote-management
```

**What it syncs:**
- ✅ `scripts/validate-b2b-enrichments.js` (pollution detection)
- ✅ All generator scripts (`@generate-*.js`)
- ✅ Generator libraries (`scripts/lib/*.js`)
- ✅ `package.json` (npm scripts)
- ✅ **Only this drop-in's enrichment files** (`_dropin-enrichments/[dropin]`)

**What it does NOT sync:**
- ❌ Documentation from other drop-ins
- ❌ Enrichments from other drop-ins

### Option 2: Merge with Cleanup

**More complex** - Does a merge but removes unwanted files:

```bash
# Sync all feature branches at once (interactive)
./scripts/sync-infrastructure-to-feature-branches.sh
```

This script:
1. Merges `releases/b2b-nov-release` into feature branch
2. Removes docs from OTHER drop-ins
3. Keeps only infrastructure files and this drop-in's files
4. Prompts for confirmation before committing

## When to Sync

Sync infrastructure whenever:

1. **Generators are fixed** (to prevent bugs from recurring)
2. **New validators are added** (like `validate-b2b-enrichments.js`)
3. **Enrichment files are cleaned** (to propagate fixes)
4. **Generator libraries are updated** (for consistency)

## Workflow

### For Infrastructure Changes

When you make infrastructure changes in `releases/b2b-nov-release`:

1. **Make the change** (e.g., fix a generator bug)
2. **Test in release branch**
3. **Commit to release branch**
4. **Sync to all active feature branches**:
   ```bash
   # Sync to all 4 branches
   ./scripts/sync-infrastructure-simple.sh b2b-docs-requisition-list-v3 requisition-list
   ./scripts/sync-infrastructure-simple.sh b2b-docs-company-management-v2 company-management
   ./scripts/sync-infrastructure-simple.sh b2b-docs-company-switcher-v2 company-switcher
   ./scripts/sync-infrastructure-simple.sh b2b-docs-quote-management-v2 quote-management
   ```

### For Feature Branch Work

When working on a feature branch:

1. **Before regenerating docs**:
   ```bash
   # Ensure you have latest infrastructure
   git pull origin [your-branch]
   
   # Check if infrastructure is in sync
   git log --oneline | grep "chore: Sync infrastructure"
   ```

2. **After regenerating**:
   ```bash
   # Validate enrichments
   npm run validate-b2b-enrichments
   
   # Should show: ✅ All B2B enrichment files are clean!
   ```

## Files That Are Infrastructure

### Always Sync These

```
scripts/
├── validate-b2b-enrichments.js         ← Pollution detector
├── @generate-container-docs.js         ← Generators
├── @generate-initialization-docs.js
├── @generate-function-docs.js
├── @generate-event-docs.js
├── @generate-slot-docs.js
├── @generate-styles-docs.js
├── @generate-dictionary-docs.js
├── @generate-quick-start-docs.js
├── generate-b2b-docs.js                ← Main B2B runner
└── lib/
    ├── enrichment.js                   ← Shared libraries
    ├── generator-core.js
    └── ...

package.json                            ← npm scripts
```

### Conditionally Sync These

```
_dropin-enrichments/
└── [dropin-name]/                      ← ONLY if for THIS drop-in
    ├── containers.json
    ├── functions.json
    ├── events.json
    └── ...
```

### NEVER Sync These

```
src/content/docs/dropins-b2b/
└── [other-dropin]/                     ← NOT for this feature branch
    └── ...
```

## Validation

After syncing, ALWAYS run:

```bash
# Validate enrichments are clean
npm run validate-b2b-enrichments

# Test generator (dry-run, doesn't write files)
npm run generate-b2b-docs [dropin] -- --dry-run
```

Expected output:
```
✅ All B2B enrichment files are clean!
```

## Troubleshooting

### "Container doesn't exist in source code"

Your enrichment file has containers that don't exist. Run with `--fix`:

```bash
npm run validate-b2b-enrichments -- --fix
```

### "N polluted parameter(s) found"

Parameters from other drop-ins leaked in. Run with `--fix`:

```bash
npm run validate-b2b-enrichments -- --fix
```

### Merge Conflicts

If you get merge conflicts during sync:

1. **Abort the merge**:
   ```bash
   git merge --abort
   ```

2. **Use the simple script instead** (safer):
   ```bash
   ./scripts/sync-infrastructure-simple.sh [branch] [dropin]
   ```

## Best Practices

1. **Sync immediately** after infrastructure changes in release branch
2. **Validate after sync** with `npm run validate-b2b-enrichments`
3. **Test generators** before committing (use `--dry-run`)
4. **Communicate with team** when infrastructure changes land
5. **Document changes** in commit messages

## Prevention

To prevent future pollution:

1. **Always run validation** before committing enrichments:
   ```bash
   npm run validate-b2b-enrichments
   ```

2. **Add to pre-commit workflow** (future enhancement)

3. **Keep infrastructure in sync** across all branches

4. **Never manually copy enrichments** between drop-ins

---

## Summary

**Problem**: Feature branches get out of sync with infrastructure changes.

**Solution**: Use selective sync scripts to get ONLY infrastructure, not other drop-in docs.

**Command**: 
```bash
./scripts/sync-infrastructure-simple.sh [branch-name] [dropin-name]
```

**Always validate**:
```bash
npm run validate-b2b-enrichments
```

