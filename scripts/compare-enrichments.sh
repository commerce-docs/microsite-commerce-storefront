#!/bin/bash

###############################################################################
# Compare Enrichment Files Across Branches
#
# Shows detailed diffs of enrichment files to understand what's different
###############################################################################

set -e

DROPIN="${1:-requisition-list}"
RELEASE_BRANCH="releases/b2b-nov-release"

echo ""
echo "========================================================================"
echo "  ENRICHMENT COMPARISON: $DROPIN"
echo "========================================================================"
echo ""

enrichment_file="_dropin-enrichments/$DROPIN/containers.json"

echo "📊 Comparing containers.json across branches..."
echo ""

# Get file from release
echo "1️⃣  Release branch version:"
if git cat-file -e "origin/$RELEASE_BRANCH:$enrichment_file" 2>/dev/null; then
    release_containers=$(git show "origin/$RELEASE_BRANCH:$enrichment_file" | jq -r 'keys[]' 2>/dev/null | sort)
    release_param_count=$(git show "origin/$RELEASE_BRANCH:$enrichment_file" | jq '[.. | .parameters? | select(. != null) | keys[]] | length' 2>/dev/null)
    echo "   Containers: $(echo "$release_containers" | wc -l | tr -d ' ')"
    echo "   Total parameters: $release_param_count"
    echo "   Container list:"
    echo "$release_containers" | sed 's/^/      - /'
else
    echo "   NOT FOUND"
fi

echo ""

# Feature branches to check
case "$DROPIN" in
    requisition-list)
        feature_branch="b2b-docs-requisition-list-v3"
        ;;
    company-management)
        feature_branch="b2b-docs-company-management-v2"
        ;;
    company-switcher)
        feature_branch="b2b-docs-company-switcher-v2"
        ;;
    quote-management)
        feature_branch="b2b-docs-quote-management-v2"
        ;;
    *)
        feature_branch=""
        ;;
esac

if [[ -n "$feature_branch" ]]; then
    echo "2️⃣  Feature branch version ($feature_branch):"
    if git cat-file -e "origin/$feature_branch:$enrichment_file" 2>/dev/null; then
        feature_containers=$(git show "origin/$feature_branch:$enrichment_file" | jq -r 'keys[]' 2>/dev/null | sort)
        feature_param_count=$(git show "origin/$feature_branch:$enrichment_file" | jq '[.. | .parameters? | select(. != null) | keys[]] | length' 2>/dev/null)
        echo "   Containers: $(echo "$feature_containers" | wc -l | tr -d ' ')"
        echo "   Total parameters: $feature_param_count"
        echo "   Container list:"
        echo "$feature_containers" | sed 's/^/      - /'
    else
        echo "   NOT FOUND"
    fi
fi

echo ""
echo "3️⃣  Detailed parameter comparison:"
echo ""

# Show which parameters are in each
if git cat-file -e "origin/$RELEASE_BRANCH:$enrichment_file" 2>/dev/null && \
   git cat-file -e "origin/$feature_branch:$enrichment_file" 2>/dev/null; then
    
    # Get all container names from both
    all_containers=$(echo -e "$release_containers\n$feature_containers" | sort -u)
    
    while IFS= read -r container; do
        [[ -z "$container" ]] && continue
        
        echo "   📦 $container:"
        
        # Get parameters from release
        release_params=$(git show "origin/$RELEASE_BRANCH:$enrichment_file" | \
            jq -r ".\"$container\".parameters? // {} | keys[]" 2>/dev/null | sort)
        
        # Get parameters from feature
        feature_params=$(git show "origin/$feature_branch:$enrichment_file" | \
            jq -r ".\"$container\".parameters? // {} | keys[]" 2>/dev/null | sort)
        
        # Compare
        if [[ "$release_params" == "$feature_params" ]]; then
            param_count=$(echo "$release_params" | wc -l | tr -d ' ')
            echo "      ✓ SAME ($param_count parameters)"
        else
            release_count=$(echo "$release_params" | grep -v '^$' | wc -l | tr -d ' ')
            feature_count=$(echo "$feature_params" | grep -v '^$' | wc -l | tr -d ' ')
            echo "      ⚠️  DIFFERENT (release: $release_count, feature: $feature_count)"
            
            # Show what's only in release
            only_release=$(comm -23 <(echo "$release_params") <(echo "$feature_params"))
            if [[ -n "$only_release" ]]; then
                echo "         Only in RELEASE:"
                echo "$only_release" | sed 's/^/            + /'
            fi
            
            # Show what's only in feature
            only_feature=$(comm -13 <(echo "$release_params") <(echo "$feature_params"))
            if [[ -n "$only_feature" ]]; then
                echo "         Only in FEATURE:"
                echo "$only_feature" | sed 's/^/            + /'
            fi
        fi
        echo ""
    done <<< "$all_containers"
fi

echo ""
echo "========================================================================"
echo "  RECOMMENDATION"
echo "========================================================================"
echo ""

if git cat-file -e "origin/$RELEASE_BRANCH:$enrichment_file" 2>/dev/null && \
   git cat-file -e "origin/$feature_branch:$enrichment_file" 2>/dev/null; then
    
    if [[ "$release_param_count" -gt "$feature_param_count" ]]; then
        echo "⚠️  Release has MORE parameters ($release_param_count vs $feature_param_count)"
        echo "   This suggests pollution in release branch - DON'T sync"
        echo "   Keep feature branch version"
    elif [[ "$feature_param_count" -gt "$release_param_count" ]]; then
        echo "⚠️  Feature has MORE parameters ($feature_param_count vs $release_param_count)"
        echo "   This could be:"
        echo "   - Valuable manual edits (GOOD) - preserve them"
        echo "   - Pollution (BAD) - run validate-b2b-enrichments"
        echo ""
        echo "   Run validation to check:"
        echo "   git checkout $feature_branch"
        echo "   npm run validate-b2b-enrichments"
    else
        echo "✓ Same parameter count, but different content"
        echo "  Manual inspection needed"
    fi
fi

echo ""

