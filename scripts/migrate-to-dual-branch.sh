#!/bin/bash

###############################################################################
# Migrate to Dual-Branch Architecture
#
# This script safely migrates from single release branch to dual-branch:
# - releases/b2b-infrastructure (scripts only)
# - releases/b2b-docs-only (merged docs + their enrichments only)
#
# CRITICAL: Enrichments stay with their feature branches!
#
# Phase 1: AUDIT ONLY (dry-run, no changes)
# Phase 2: Execute migration (after approval)
###############################################################################

set -e

PHASE="${1:-audit}"
CURRENT_RELEASE="releases/b2b-nov-release"
NEW_INFRA="releases/b2b-infrastructure"
NEW_DOCS="releases/b2b-docs-only"

# Drop-in ownership mapping (using function instead of associative array for sh compatibility)
get_branch_for_dropin() {
    case "$1" in
        requisition-list) echo "b2b-docs-requisition-list-v3" ;;
        company-management) echo "b2b-docs-company-management-v2" ;;
        company-switcher) echo "b2b-docs-company-switcher-v2" ;;
        quote-management) echo "b2b-docs-quote-management-v2" ;;
        purchase-order) echo "MERGED" ;;
        *) echo "UNKNOWN" ;;
    esac
}

DROPINS=("requisition-list" "company-management" "company-switcher" "quote-management" "purchase-order")

PHASE_UPPER=$(echo "$PHASE" | tr '[:lower:]' '[:upper:]')

echo ""
echo "========================================================================"
echo "  DUAL-BRANCH MIGRATION - PHASE: $PHASE_UPPER"
echo "========================================================================"
echo ""

if [[ "$PHASE" != "audit" ]] && [[ "$PHASE" != "execute" ]]; then
    echo "❌ Invalid phase. Use: audit | execute"
    exit 1
fi

# ============================================================================
# PHASE 1: COMPREHENSIVE AUDIT
# ============================================================================

audit_enrichments() {
    echo "📊 ENRICHMENT OWNERSHIP AUDIT"
    echo "========================================================================"
    echo ""
    
    # Create temporary audit file
    AUDIT_FILE="/tmp/enrichment-audit-$(date +%s).json"
    echo "{" > "$AUDIT_FILE"
    
    for dropin in "${DROPINS[@]}"; do
        echo ""
        echo "🔍 Analyzing: $dropin"
        echo "----------------------------------------"
        
        enrichment_file="_dropin-enrichments/$dropin/containers.json"
        
        # Get enrichment from release branch
        if git cat-file -e "origin/$CURRENT_RELEASE:$enrichment_file" 2>/dev/null; then
            release_hash=$(git rev-parse "origin/$CURRENT_RELEASE:$enrichment_file")
            release_size=$(git cat-file -s "origin/$CURRENT_RELEASE:$enrichment_file")
            release_params=$(git show "origin/$CURRENT_RELEASE:$enrichment_file" | \
                jq '[.. | .parameters? | select(. != null) | keys[]] | length' 2>/dev/null || echo "0")
            
            echo "   Release branch:"
            echo "      Hash: ${release_hash:0:8}"
            echo "      Size: $release_size bytes"
            echo "      Parameters: $release_params"
        else
            echo "   Release branch: NOT FOUND"
            release_hash=""
            release_size=0
            release_params=0
        fi
        
        # Get enrichment from feature branch (if not merged)
        feature_branch=$(get_branch_for_dropin "$dropin")
        if [[ "$feature_branch" != "MERGED" ]]; then
            if git cat-file -e "origin/$feature_branch:$enrichment_file" 2>/dev/null; then
                feature_hash=$(git rev-parse "origin/$feature_branch:$enrichment_file")
                feature_size=$(git cat-file -s "origin/$feature_branch:$enrichment_file")
                feature_params=$(git show "origin/$feature_branch:$enrichment_file" | \
                    jq '[.. | .parameters? | select(. != null) | keys[]] | length' 2>/dev/null || echo "0")
                
                echo "   Feature branch ($feature_branch):"
                echo "      Hash: ${feature_hash:0:8}"
                echo "      Size: $feature_size bytes"
                echo "      Parameters: $feature_params"
                
                # Determine which is better
                if [[ "$release_hash" == "$feature_hash" ]]; then
                    decision="SAME - use either"
                elif [[ $feature_params -lt $release_params ]]; then
                    # Feature has FEWER params - likely cleaner!
                    decision="✅ USE FEATURE (cleaner - fewer params)"
                elif [[ $feature_params -gt $release_params ]]; then
                    # Feature has MORE params - could be manual edits OR pollution
                    decision="⚠️  VALIDATE - feature has more (manual edits or pollution?)"
                else
                    decision="⚠️  VALIDATE - same count but different content"
                fi
                
                echo ""
                echo "   📋 DECISION: $decision"
            else
                echo "   Feature branch: NOT FOUND"
                feature_hash=""
                feature_size=0
                feature_params=0
                decision="USE RELEASE (no feature version)"
            fi
        else
            echo "   Feature branch: MERGED (keep in docs-only branch)"
            feature_hash="$release_hash"
            feature_size=$release_size
            feature_params=$release_params
            decision="KEEP IN DOCS-ONLY"
        fi
        
        # Save to audit file
        cat >> "$AUDIT_FILE" << EOF
  "$dropin": {
    "release": {
      "hash": "$release_hash",
      "size": $release_size,
      "params": $release_params
    },
    "feature": {
      "branch": "$feature_branch",
      "hash": "$feature_hash",
      "size": $feature_size,
      "params": $feature_params
    },
    "decision": "$decision"
  },
EOF
    done
    
    # Close JSON
    echo "  \"audit_complete\": true" >> "$AUDIT_FILE"
    echo "}" >> "$AUDIT_FILE"
    
    echo ""
    echo "========================================================================"
    echo "📄 Audit saved to: $AUDIT_FILE"
    echo ""
}

audit_documentation() {
    echo ""
    echo "📄 DOCUMENTATION OWNERSHIP AUDIT"
    echo "========================================================================"
    echo ""
    
    for dropin in "${DROPINS[@]}"; do
        docs_path="src/content/docs/dropins-b2b/$dropin"
        feature_branch=$(get_branch_for_dropin "$dropin")
        
        echo "📦 $dropin (${feature_branch})"
        
        # Check release branch
        if git ls-tree -r "origin/$CURRENT_RELEASE" --name-only 2>/dev/null | grep -q "^$docs_path/"; then
            file_count=$(git ls-tree -r "origin/$CURRENT_RELEASE" --name-only 2>/dev/null | \
                grep "^$docs_path/" | wc -l | tr -d ' ')
            echo "   Release: $file_count files"
        else
            echo "   Release: NOT FOUND"
            file_count=0
        fi
        
        # Check feature branch (if not merged)
        if [[ "$feature_branch" != "MERGED" ]]; then
            if git ls-tree -r "origin/$feature_branch" --name-only 2>/dev/null | grep -q "^$docs_path/"; then
                feature_count=$(git ls-tree -r "origin/$feature_branch" --name-only 2>/dev/null | \
                    grep "^$docs_path/" | wc -l | tr -d ' ')
                echo "   Feature: $feature_count files"
                
                if [[ $file_count -eq $feature_count ]]; then
                    echo "   ✅ SAME file count"
                elif [[ $feature_count -gt $file_count ]]; then
                    echo "   ⚠️  Feature has MORE files (use feature)"
                else
                    echo "   ⚠️  Release has MORE files (investigate)"
                fi
            else
                echo "   Feature: NOT FOUND"
            fi
        else
            echo "   Status: MERGED - keep in docs-only branch"
        fi
        
        echo ""
    done
}

migration_plan() {
    echo ""
    echo "📋 MIGRATION PLAN"
    echo "========================================================================"
    echo ""
    
    echo "Step 1: Create releases/b2b-infrastructure"
    echo "   - Start from: $CURRENT_RELEASE"
    echo "   - Keep: scripts/, package.json"
    echo "   - Remove: src/content/docs/, _dropin-enrichments/, astro.config.mjs"
    echo ""
    
    echo "Step 2: Create releases/b2b-docs-only"
    echo "   - Start from: $CURRENT_RELEASE"
    echo "   - Keep: src/content/docs/dropins-b2b/purchase-order/"
    echo "   - Keep: _dropin-enrichments/purchase-order/"
    echo "   - Remove: All other docs and enrichments"
    echo "   - Remove: scripts/, package.json, astro.config.mjs"
    echo ""
    
    echo "Step 3: Clean Feature Branches"
    for dropin in "requisition-list" "company-management" "company-switcher" "quote-management"; do
        feature_branch=$(get_branch_for_dropin "$dropin")
        echo "   $feature_branch:"
        echo "      - Keep: src/content/docs/dropins-b2b/$dropin/"
        echo "      - Keep: _dropin-enrichments/$dropin/ (use cleanest version)"
        echo "      - Remove: All other dropins' docs and enrichments"
        echo "      - Merge: infrastructure branch for scripts/package.json"
    done
    echo ""
    
    echo "Step 4: Update Preview Branch"
    echo "   - Merge: releases/b2b-docs-only (approved docs)"
    echo "   - Keep: astro.config.mjs (complete sidebar)"
    echo ""
}

# ============================================================================
# PHASE 2: EXECUTE MIGRATION
# ============================================================================

execute_migration() {
    echo "⚠️  EXECUTING MIGRATION - THIS WILL MODIFY BRANCHES"
    echo ""
    read -p "Are you ABSOLUTELY SURE? Type 'YES' to continue: " confirm
    
    if [[ "$confirm" != "YES" ]]; then
        echo "Aborted."
        exit 0
    fi
    
    echo ""
    echo "🚀 Starting migration..."
    echo ""
    
    # TODO: Implementation
    echo "❌ MIGRATION NOT IMPLEMENTED YET"
    echo ""
    echo "   Run 'audit' phase first and review results!"
    echo "   After approval, implementation will be added."
    exit 1
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if [[ "$PHASE" == "audit" ]]; then
    echo "🔍 Running comprehensive audit (no changes)..."
    echo ""
    
    # Fetch latest
    echo "📥 Fetching latest from origin..."
    git fetch origin --quiet
    
    audit_enrichments
    audit_documentation
    migration_plan
    
    echo ""
    echo "========================================================================"
    echo "✅ AUDIT COMPLETE"
    echo "========================================================================"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Review the audit results above"
    echo "   2. Verify enrichment decisions are correct"
    echo "   3. Check the migration plan"
    echo "   4. If approved, run: $0 execute"
    echo ""
    
elif [[ "$PHASE" == "execute" ]]; then
    execute_migration
fi

echo ""

