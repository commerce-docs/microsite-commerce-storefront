#!/bin/bash

###############################################################################
# Branch State Audit - DRY RUN ONLY
#
# This script audits the current state of all B2B branches to identify:
# - What files exist in each branch
# - What enrichments are present
# - What documentation exists
# - Potential conflicts when syncing
#
# Does NOT make any changes - read-only analysis
###############################################################################

set -e

echo ""
echo "========================================================================"
echo "  B2B BRANCHES STATE AUDIT (DRY RUN)"
echo "========================================================================"
echo ""

# Configuration
RELEASE_BRANCH="releases/b2b-nov-release"
BRANCHES=(
    "b2b-documentation:preview"
    "b2b-docs-requisition-list-v3:requisition-list"
    "b2b-docs-company-management-v2:company-management"
    "b2b-docs-company-switcher-v2:company-switcher"
    "b2b-docs-quote-management-v2:quote-management"
)

CURRENT_BRANCH=$(git branch --show-current)

# Save current branch state
echo "📌 Current branch: $CURRENT_BRANCH"
echo "   (Will return here after audit)"
echo ""

# Fetch latest
echo "📥 Fetching latest from origin..."
git fetch origin --quiet

echo ""
echo "========================================================================"
echo "  PART 1: INFRASTRUCTURE FILES COMPARISON"
echo "========================================================================"
echo ""

INFRA_FILES=(
    "scripts/validate-b2b-enrichments.js"
    "scripts/@generate-container-docs.js"
    "scripts/generate-b2b-docs.js"
    "scripts/lib/enrichment.js"
    "package.json"
)

echo "Checking which branches have these infrastructure files:"
echo ""

for file in "${INFRA_FILES[@]}"; do
    echo "📄 $file"
    
    # Check release branch
    if git cat-file -e "origin/$RELEASE_BRANCH:$file" 2>/dev/null; then
        file_hash=$(git rev-parse "origin/$RELEASE_BRANCH:$file")
        echo "   ✓ release: ${file_hash:0:8}"
    else
        echo "   ✗ release: NOT FOUND"
    fi
    
    # Check each feature branch
    for branch_config in "${BRANCHES[@]}"; do
        IFS=':' read -r branch label <<< "$branch_config"
        
        if git cat-file -e "origin/$branch:$file" 2>/dev/null; then
            file_hash=$(git rev-parse "origin/$branch:$file")
            match=""
            if git cat-file -e "origin/$RELEASE_BRANCH:$file" 2>/dev/null; then
                release_hash=$(git rev-parse "origin/$RELEASE_BRANCH:$file")
                if [[ "$file_hash" == "$release_hash" ]]; then
                    match=" ✓ SAME"
                else
                    match=" ⚠️  DIFFERENT"
                fi
            fi
            echo "   ✓ $label: ${file_hash:0:8}$match"
        else
            echo "   ✗ $label: NOT FOUND"
        fi
    done
    echo ""
done

echo ""
echo "========================================================================"
echo "  PART 2: DROP-IN DOCUMENTATION PRESENCE"
echo "========================================================================"
echo ""

DROPINS=("purchase-order" "requisition-list" "company-management" "company-switcher" "quote-management")

for branch_config in "${BRANCHES[@]}"; do
    IFS=':' read -r branch label <<< "$branch_config"
    
    echo "📦 Branch: $branch ($label)"
    
    for dropin in "${DROPINS[@]}"; do
        doc_path="src/content/docs/dropins-b2b/$dropin"
        
        if git ls-tree -r "origin/$branch" --name-only 2>/dev/null | grep -q "^$doc_path/"; then
            file_count=$(git ls-tree -r "origin/$branch" --name-only 2>/dev/null | grep "^$doc_path/" | wc -l)
            echo "   ✓ $dropin: $file_count files"
        else
            echo "   ✗ $dropin: NOT PRESENT"
        fi
    done
    echo ""
done

echo ""
echo "========================================================================"
echo "  PART 3: ENRICHMENT FILES COMPARISON"
echo "========================================================================"
echo ""

for dropin in "${DROPINS[@]}"; do
    echo "🔍 Enrichments for: $dropin"
    echo ""
    
    enrichment_file="_dropin-enrichments/$dropin/containers.json"
    
    # Check release branch
    if git cat-file -e "origin/$RELEASE_BRANCH:$enrichment_file" 2>/dev/null; then
        release_hash=$(git rev-parse "origin/$RELEASE_BRANCH:$enrichment_file")
        release_size=$(git cat-file -s "origin/$RELEASE_BRANCH:$enrichment_file")
        echo "   Release: ${release_hash:0:8} ($release_size bytes)"
    else
        echo "   Release: NOT FOUND"
        release_hash=""
    fi
    
    # Check each feature branch
    for branch_config in "${BRANCHES[@]}"; do
        IFS=':' read -r branch label <<< "$branch_config"
        
        if git cat-file -e "origin/$branch:$enrichment_file" 2>/dev/null; then
            file_hash=$(git rev-parse "origin/$branch:$enrichment_file")
            file_size=$(git cat-file -s "origin/$branch:$enrichment_file")
            
            match=""
            if [[ -n "$release_hash" ]]; then
                if [[ "$file_hash" == "$release_hash" ]]; then
                    match=" ✓ SAME"
                else
                    match=" ⚠️  DIFFERENT (will sync)"
                fi
            fi
            
            echo "   $label: ${file_hash:0:8} ($file_size bytes)$match"
        else
            echo "   $label: NOT FOUND"
        fi
    done
    echo ""
done

echo ""
echo "========================================================================"
echo "  PART 4: WHAT WOULD BE SYNCED TO EACH BRANCH"
echo "========================================================================"
echo ""

for branch_config in "${BRANCHES[@]}"; do
    IFS=':' read -r branch label <<< "$branch_config"
    
    # Skip preview branch
    if [[ "$label" == "preview" ]]; then
        continue
    fi
    
    echo "📦 $branch ($label)"
    echo ""
    echo "   Would sync these files FROM release:"
    
    files_to_sync=0
    
    for file in "${INFRA_FILES[@]}"; do
        if git cat-file -e "origin/$RELEASE_BRANCH:$file" 2>/dev/null; then
            release_hash=$(git rev-parse "origin/$RELEASE_BRANCH:$file")
            
            if git cat-file -e "origin/$branch:$file" 2>/dev/null; then
                branch_hash=$(git rev-parse "origin/$branch:$file")
                
                if [[ "$release_hash" != "$branch_hash" ]]; then
                    echo "   ⚠️  $file (DIFFERENT)"
                    ((files_to_sync++))
                else
                    echo "   ✓ $file (same, skip)"
                fi
            else
                echo "   + $file (NEW)"
                ((files_to_sync++))
            fi
        fi
    done
    
    # Check drop-in-specific enrichments
    enrichment_path="_dropin-enrichments/$label"
    if git cat-file -e "origin/$RELEASE_BRANCH:$enrichment_path/containers.json" 2>/dev/null; then
        release_hash=$(git rev-parse "origin/$RELEASE_BRANCH:$enrichment_path/containers.json")
        
        if git cat-file -e "origin/$branch:$enrichment_path/containers.json" 2>/dev/null; then
            branch_hash=$(git rev-parse "origin/$branch:$enrichment_path/containers.json")
            
            if [[ "$release_hash" != "$branch_hash" ]]; then
                echo "   ⚠️  $enrichment_path/containers.json (DIFFERENT)"
                ((files_to_sync++))
            else
                echo "   ✓ $enrichment_path/containers.json (same, skip)"
            fi
        else
            echo "   + $enrichment_path/containers.json (NEW)"
            ((files_to_sync++))
        fi
    fi
    
    echo ""
    echo "   📊 Total files to sync: $files_to_sync"
    echo ""
done

echo ""
echo "========================================================================"
echo "  PART 5: POTENTIAL CONFLICTS"
echo "========================================================================"
echo ""

echo "Checking for uncommitted changes that would conflict..."
echo ""

for branch_config in "${BRANCHES[@]}"; do
    IFS=':' read -r branch label <<< "$branch_config"
    
    # Check if branch has uncommitted changes
    git checkout "origin/$branch" --quiet 2>/dev/null || continue
    
    if [[ -n $(git status -s) ]]; then
        echo "⚠️  $branch has uncommitted changes:"
        git status -s | head -5
        echo ""
    fi
done

# Return to original branch
git checkout "$CURRENT_BRANCH" --quiet 2>/dev/null || git checkout "$CURRENT_BRANCH"

echo ""
echo "========================================================================"
echo "  AUDIT COMPLETE"
echo "========================================================================"
echo ""
echo "📌 Returned to: $CURRENT_BRANCH"
echo ""
echo "📋 Summary:"
echo "   - Checked infrastructure files across all branches"
echo "   - Identified which drop-in docs exist where"
echo "   - Compared enrichment file versions"
echo "   - Calculated what would be synced"
echo "   - Checked for potential conflicts"
echo ""
echo "📝 Next steps:"
echo "   1. Review the output above"
echo "   2. Identify any concerning differences"
echo "   3. Decide on sync strategy"
echo "   4. Test sync script on ONE branch first"
echo ""

