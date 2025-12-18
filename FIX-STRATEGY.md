# B2B Enrichment Pollution - Complete Fix Strategy

## Current Situation

**Audit reveals**: The `releases/b2b-nov-release` branch has POLLUTED enrichment files!

### Pollution Evidence

| Drop-in | Release | Feature | Issue |
|---------|---------|---------|-------|
| requisition-list | 88 params | 21 params | Release has 67 WRONG params from other drop-ins |
| company-switcher | 15 params | 2 params | Release has 13 WRONG params from other drop-ins |
| company-management | 111 params | 105 params | Release has some pollution, feature has good manual edits |
| quote-management | 20 params | 60 params | Feature has MORE (pagination params - likely GOOD) |

**Example pollution**: requisition-list containers have `purchaseOrderId`, `approvalRuleID`, `companyId` - these belong to OTHER drop-ins!

## Root Cause

Previous commits with message "Sync parameter descriptions from documentation" polluted the release branch by copying parameters across ALL drop-ins.

## The Fix (Step-by-Step)

### Phase 1: Clean the Release Branch (SOURCE OF TRUTH)

1. **Commit our NEW tools to release branch**:
   ```bash
   git checkout releases/b2b-nov-release
   git add scripts/validate-b2b-enrichments.js
   git add scripts/audit-branch-state.sh
   git add scripts/compare-enrichments.sh
   git add scripts/sync-infrastructure-simple.sh
   git add package.json
   git add INFRASTRUCTURE-SYNC.md
   git add FIX-STRATEGY.md
   git commit -m "feat: Add B2B enrichment validation and sync tools"
   git push origin releases/b2b-nov-release
   ```

2. **Copy CLEAN enrichments FROM feature branches TO release**:
   
   ```bash
   # Still on releases/b2b-nov-release
   
   # Requisition List (feature is clean)
   git checkout origin/b2b-docs-requisition-list-v3 -- _dropin-enrichments/requisition-list/containers.json
   
   # Company Switcher (feature is clean)  
   git checkout origin/b2b-docs-company-switcher-v2 -- _dropin-enrichments/company-switcher/containers.json
   
   # Quote Management (feature has good additions)
   git checkout origin/b2b-docs-quote-management-v2 -- _dropin-enrichments/quote-management/containers.json
   
   # Company Management (keep current - validate separately)
   # Skip for now
   ```

3. **Validate the cleaned release branch**:
   ```bash
   npm run validate-b2b-enrichments
   
   # Should show: ✅ All B2B enrichment files are clean!
   ```

4. **Commit cleaned enrichments**:
   ```bash
   git add _dropin-enrichments/
   git commit -m "fix: Clean B2B enrichment files - remove cross-drop-in pollution

- requisition-list: Remove 67 polluted parameters from other drop-ins
- company-switcher: Remove 13 polluted parameters  
- quote-management: Restore manual edits with pagination params

The enrichment files were polluted with parameters from ALL B2B
drop-ins. This restores the clean versions from feature branches."
   
   git push origin releases/b2b-nov-release
   ```

### Phase 2: Sync Infrastructure TO Feature Branches

Now that release branch is CLEAN, sync infrastructure to features:

```bash
# Sync cleaned infrastructure to all branches
./scripts/sync-infrastructure-simple.sh b2b-docs-requisition-list-v3 requisition-list
./scripts/sync-infrastructure-simple.sh b2b-docs-company-management-v2 company-management
./scripts/sync-infrastructure-simple.sh b2b-docs-company-switcher-v2 company-switcher
./scripts/sync-infrastructure-simple.sh b2b-docs-quote-management-v2 quote-management
```

This will give each feature branch:
- ✅ Validation script (`validate-b2b-enrichments.js`)
- ✅ Updated generators (if any changes)
- ✅ Their OWN cleaned enrichments
- ❌ NO docs from other drop-ins (script prevents this)

### Phase 3: Remove Purchase Order Pollution from Features

ALL feature branches currently have Purchase Order docs (21 files) - they shouldn't!

For EACH feature branch:

```bash
# Example for requisition-list
git checkout b2b-docs-requisition-list-v3

# Remove Purchase Order docs
git rm -r src/content/docs/dropins-b2b/purchase-order/

# Commit
git commit -m "chore: Remove Purchase Order docs (not for this branch)

Purchase Order was already merged in PR #620. These files shouldn't
be in the requisition-list feature branch."

git push origin b2b-docs-requisition-list-v3
```

Repeat for:
- `b2b-docs-company-management-v2`
- `b2b-docs-company-switcher-v2`
- `b2b-docs-quote-management-v2`

### Phase 4: Update Preview Branch (b2b-documentation)

```bash
git checkout b2b-documentation

# Merge cleaned release branch
git merge releases/b2b-nov-release

# Should bring:
# - All cleaned enrichments
# - Validation tools
# - All merged drop-in docs (Purchase Order, etc.)

git push origin b2b-documentation
```

## Validation Checklist

After ALL steps, validate each branch:

```bash
# For EACH branch
git checkout [branch-name]
npm run validate-b2b-enrichments

# Expected: ✅ All B2B enrichment files are clean!
```

## Prevention Going Forward

1. **Before committing ANY enrichment changes**:
   ```bash
   npm run validate-b2b-enrichments
   ```

2. **Keep infrastructure in sync**:
   - After infrastructure changes in release branch
   - Sync to all feature branches immediately

3. **Never manually copy enrichments** between drop-ins

4. **Always run validation** in CI/CD (future enhancement)

## Timeline

- **Phase 1** (Clean release): 15 minutes
- **Phase 2** (Sync to features): 10 minutes  
- **Phase 3** (Remove pollution): 15 minutes
- **Phase 4** (Update preview): 5 minutes

**Total**: ~45 minutes of careful, validated work

## Risk Mitigation

- ✅ All changes are in Git - easily reversible
- ✅ Validation script catches pollution immediately
- ✅ Dry-run audit showed exactly what will change
- ✅ Feature branches already pushed (backups exist)
- ✅ Each phase can be validated before moving to next

## Success Criteria

1. ✅ Release branch validates clean
2. ✅ All 4 feature branches validate clean
3. ✅ Preview branch validates clean
4. ✅ No Purchase Order docs in non-PO feature branches
5. ✅ All branches have validation tools
6. ✅ Generators work correctly on all branches

