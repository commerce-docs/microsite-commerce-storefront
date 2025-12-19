#!/bin/bash

###############################################################################
# Sync Infrastructure Changes to B2B Feature Branches
#
# This script safely merges ONLY infrastructure changes from the release 
# branch into feature branches, avoiding pollution from other drop-in docs.
#
# What Gets Synced:
# - scripts/ (generators, validators)
# - package.json (npm scripts)
# - Each branch's OWN enrichment files only
#
# What Doesn't Get Synced:
# - Documentation from OTHER drop-ins
# - Enrichments from OTHER drop-ins
#
# Usage:
#   ./scripts/sync-infrastructure-to-feature-branches.sh
###############################################################################

set -e  # Exit on any error

echo ""
echo "========================================================================"
echo "  SYNC INFRASTRUCTURE TO B2B FEATURE BRANCHES"
echo "========================================================================"
echo ""

# Configuration
RELEASE_BRANCH="releases/b2b-nov-release"
FEATURE_BRANCHES=(
    "b2b-docs-requisition-list-v3:requisition-list"
    "b2b-docs-company-management-v2:company-management"
    "b2b-docs-company-switcher-v2:company-switcher"
    "b2b-docs-quote-management-v2:quote-management"
)

# Ensure we're on a clean state
if [[ -n $(git status -s) ]]; then
    echo "❌ Working directory is not clean!"
    echo "   Please commit or stash your changes first."
    exit 1
fi

# Ensure release branch is up to date
echo "📥 Fetching latest from origin..."
git fetch origin

echo ""
echo "🔍 Checking what's in release branch vs feature branches..."
echo ""

# Show what merged drop-ins exist in release branch
echo "📦 Drop-ins merged in release branch:"
for dropin in purchase-order quote-management requisition-list company-management company-switcher; do
    if [[ -d "src/content/docs/dropins-b2b/$dropin" ]]; then
        echo "   ✓ $dropin"
    fi
done

echo ""
echo "⚠️  IMPORTANT: We will ONLY merge infrastructure files, not drop-in docs."
echo ""
read -p "Continue? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
    echo "Aborted."
    exit 0
fi

# Process each feature branch
for branch_config in "${FEATURE_BRANCHES[@]}"; do
    # Split branch:dropin
    IFS=':' read -r BRANCH DROPIN <<< "$branch_config"
    
    echo ""
    echo "========================================================================"
    echo "  Processing: $BRANCH"
    echo "========================================================================"
    echo ""
    
    # Checkout feature branch
    echo "📌 Checking out $BRANCH..."
    git checkout "$BRANCH"
    
    # Merge release branch with strategy
    echo "🔀 Merging infrastructure from $RELEASE_BRANCH..."
    
    # Use merge strategy that favors ours for documentation, theirs for infrastructure
    git merge "$RELEASE_BRANCH" --no-commit --no-ff || true
    
    echo ""
    echo "🧹 Cleaning up unwanted files from merge..."
    echo ""
    
    # For each B2B drop-in directory, if it's NOT this feature's drop-in, restore from HEAD
    for other_dropin in purchase-order quote-management requisition-list company-management company-switcher; do
        if [[ "$other_dropin" != "$DROPIN" ]]; then
            doc_path="src/content/docs/dropins-b2b/$other_dropin"
            enrichment_path="_dropin-enrichments/$other_dropin"
            
            # Check if these exist in the merge (were added from release branch)
            if [[ -d "$doc_path" ]] || git ls-files --stage "$doc_path" | grep -q .; then
                echo "   ❌ Removing $other_dropin docs (not for this branch)"
                git rm -rf "$doc_path" 2>/dev/null || git restore --source=HEAD "$doc_path" 2>/dev/null || true
            fi
            
            # Restore other drop-in enrichments if they were changed
            if git diff --cached --name-only | grep -q "$enrichment_path"; then
                echo "   ↩️  Restoring $other_dropin enrichments from feature branch"
                git restore --source=HEAD "$enrichment_path" 2>/dev/null || true
            fi
        fi
    done
    
    # Keep THIS drop-in's enrichments from release branch (they're cleaned)
    echo "   ✅ Keeping $DROPIN enrichments from release branch (cleaned)"
    git add "_dropin-enrichments/$DROPIN/" 2>/dev/null || true
    
    # Keep infrastructure files from release branch
    echo "   ✅ Keeping scripts/ from release branch"
    git add scripts/ 2>/dev/null || true
    
    echo "   ✅ Keeping package.json from release branch"
    git add package.json 2>/dev/null || true
    
    echo ""
    echo "📊 Files being merged:"
    git diff --cached --name-status | head -20
    
    echo ""
    read -p "Commit this merge for $BRANCH? (yes/no): " commit_confirm
    
    if [[ "$commit_confirm" == "yes" ]]; then
        git commit -m "chore: Sync infrastructure from release branch

- Update generators and validation scripts
- Sync cleaned enrichment files for $DROPIN
- Update package.json with new npm scripts

This ensures the feature branch uses the latest validated infrastructure
without pulling in documentation from other drop-ins."
        
        echo "✅ Committed merge for $BRANCH"
        echo ""
        read -p "Push to origin? (yes/no): " push_confirm
        
        if [[ "$push_confirm" == "yes" ]]; then
            git push origin "$BRANCH"
            echo "✅ Pushed $BRANCH"
        fi
    else
        echo "⚠️  Aborting merge for $BRANCH"
        git merge --abort
    fi
done

echo ""
echo "========================================================================"
echo "✨ INFRASTRUCTURE SYNC COMPLETE"
echo "========================================================================"
echo ""
echo "📝 Next steps:"
echo "   1. Test generators on each branch: npm run generate-b2b-docs [dropin]"
echo "   2. Run validation: npm run validate-b2b-enrichments"
echo "   3. Verify no pollution occurred"
echo ""

