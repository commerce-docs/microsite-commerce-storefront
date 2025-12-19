#!/bin/bash

###############################################################################
# Branch Content Validator
#
# Validates that changes in the current branch comply with dual-branch
# architecture rules:
# - Infrastructure branch: Only infrastructure files
# - Docs-only branch: Only merged drop-in docs
# - Feature branches: Only their drop-in's content + infrastructure
#
# Usage:
#   ./scripts/validate-branch-content.sh [--pre-commit]
#
# Exit codes:
#   0 = Valid
#   1 = Validation failed
###############################################################################

set -e

MODE="${1}"
BRANCH=$(git branch --show-current)

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "========================================================================"
echo "  BRANCH CONTENT VALIDATION"
echo "========================================================================"
echo ""
echo "Branch: $BRANCH"
echo ""

# Get changed files (staged for pre-commit, all for regular check)
if [[ "$MODE" == "--pre-commit" ]]; then
    CHANGED_FILES=$(git diff --cached --name-only)
    echo "Mode: Pre-commit validation (staged files only)"
else
    CHANGED_FILES=$(git diff --name-only origin/$BRANCH 2>/dev/null || git ls-files)
    echo "Mode: Full branch validation"
fi

if [[ -z "$CHANGED_FILES" ]]; then
    echo -e "${GREEN}✅ No changes to validate${NC}"
    exit 0
fi

echo ""
echo "Changed files:"
echo "$CHANGED_FILES" | head -10
if [[ $(echo "$CHANGED_FILES" | wc -l) -gt 10 ]]; then
    echo "... and $(($(echo "$CHANGED_FILES" | wc -l) - 10)) more"
fi
echo ""

ERRORS=0
WARNINGS=0

# ============================================================================
# Validation Rules by Branch Type
# ============================================================================

validate_infrastructure_branch() {
    echo "📋 Validating infrastructure branch..."
    echo ""
    
    # ALLOWED in infrastructure branch
    local allowed_patterns=(
        "^scripts/"
        "^_dropin-templates/"
        "^templates/"
        "^package\.json$"
        "^package-lock\.json$"
        "^\.github/workflows/"
        "^\.gitignore$"
        "^README"
        "^.*\.md$"
    )
    
    # FORBIDDEN in infrastructure branch
    local forbidden_patterns=(
        "^src/content/docs/"
        "^_dropin-enrichments/"
        "^public/images/dropins"
        "^astro\.config\.mjs$"
    )
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        # Check if file is allowed
        allowed=false
        for pattern in "${allowed_patterns[@]}"; do
            if echo "$file" | grep -qE "$pattern"; then
                allowed=true
                break
            fi
        done
        
        # Check if file is forbidden
        for pattern in "${forbidden_patterns[@]}"; do
            if echo "$file" | grep -qE "$pattern"; then
                echo -e "${RED}❌ FORBIDDEN: $file${NC}"
                echo "   Infrastructure branch should NOT contain documentation or enrichments"
                ((ERRORS++))
                allowed=false
                break
            fi
        done
        
        if ! $allowed; then
            echo -e "${YELLOW}⚠️  REVIEW NEEDED: $file${NC}"
            echo "   Not in allowed patterns - verify this should be in infrastructure"
            ((WARNINGS++))
        fi
    done <<< "$CHANGED_FILES"
}

validate_docs_only_branch() {
    echo "📋 Validating docs-only branch..."
    echo ""
    
    # ALLOWED in docs-only branch (only merged drop-ins)
    local allowed_patterns=(
        "^src/content/docs/dropins-b2b/purchase-order/"
        "^_dropin-enrichments/purchase-order/"
        "^public/images/dropins-b2b/purchase-order/"
        "^README"
        "^.*\.md$"
    )
    
    # FORBIDDEN in docs-only branch
    local forbidden_patterns=(
        "^scripts/"
        "^_dropin-templates/"
        "^package\.json$"
        "^astro\.config\.mjs$"
        "^src/content/docs/dropins-b2b/(?!purchase-order)"
        "^_dropin-enrichments/(?!purchase-order)"
    )
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        # Check if file is allowed
        allowed=false
        for pattern in "${allowed_patterns[@]}"; do
            if echo "$file" | grep -qE "$pattern"; then
                allowed=true
                break
            fi
        done
        
        # Check if file is forbidden
        for pattern in "${forbidden_patterns[@]}"; do
            if echo "$file" | grep -qE "$pattern"; then
                echo -e "${RED}❌ FORBIDDEN: $file${NC}"
                echo "   Docs-only branch should NOT contain infrastructure or unmerged drop-ins"
                ((ERRORS++))
                allowed=false
                break
            fi
        done
        
        if ! $allowed; then
            echo -e "${YELLOW}⚠️  NEW MERGED DROP-IN?: $file${NC}"
            echo "   If this is a newly merged drop-in, update validation rules"
            ((WARNINGS++))
        fi
    done <<< "$CHANGED_FILES"
}

validate_feature_branch() {
    local dropin_name="$1"
    
    echo "📋 Validating feature branch for: $dropin_name"
    echo ""
    
    # ALLOWED in feature branch
    local allowed_patterns=(
        "^scripts/"                                                    # From infrastructure merge
        "^_dropin-templates/"                                          # From infrastructure merge
        "^templates/"                                                  # From infrastructure merge
        "^package\.json$"                                              # From infrastructure merge
        "^package-lock\.json$"                                         # From infrastructure merge
        "^\.github/workflows/"                                         # From infrastructure merge (safeguards)
        "^\.githooks/"                                                 # From infrastructure merge (safeguards)
        "^src/content/docs/dropins-b2b/${dropin_name}/"               # Their docs
        "^_dropin-enrichments/${dropin_name}/"                         # Their enrichments
        "^public/images/dropins-b2b/${dropin_name}/"                  # Their images
        "^README"
        "^.*\.md$"                                                     # Includes all safeguard docs
    )
    
    # FORBIDDEN in feature branch
    local other_dropins="requisition-list|company-management|company-switcher|quote-management|purchase-order"
    # Remove current dropin from forbidden list
    other_dropins=$(echo "$other_dropins" | sed "s/|${dropin_name}//g" | sed "s/${dropin_name}|//g" | sed "s/${dropin_name}//g")
    
    local forbidden_patterns=(
        "^src/content/docs/dropins-b2b/(${other_dropins})/"
        "^_dropin-enrichments/(${other_dropins})/"
        "^public/images/dropins-b2b/(${other_dropins})/"
        "^astro\.config\.mjs$"
    )
    
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        
        # Check if file is allowed
        allowed=false
        for pattern in "${allowed_patterns[@]}"; do
            if echo "$file" | grep -qE "$pattern"; then
                allowed=true
                break
            fi
        done
        
        # Check if file is forbidden
        for pattern in "${forbidden_patterns[@]}"; do
            if echo "$file" | grep -qE "$pattern"; then
                echo -e "${RED}❌ FORBIDDEN: $file${NC}"
                echo "   Feature branch should ONLY contain its own drop-in's content"
                echo "   This file belongs to a different drop-in"
                ((ERRORS++))
                allowed=false
                break
            fi
        done
        
        if ! $allowed && [[ $ERRORS -eq 0 ]]; then
            echo -e "${YELLOW}⚠️  UNEXPECTED: $file${NC}"
            echo "   Not in expected patterns - verify this should be here"
            ((WARNINGS++))
        fi
    done <<< "$CHANGED_FILES"
}

validate_preview_branch() {
    echo "📋 Validating preview branch..."
    echo ""
    echo -e "${GREEN}ℹ️  Preview branch allows all content (by design)${NC}"
    echo "   No validation needed - this is the consolidated view"
    echo ""
}

# ============================================================================
# Main Validation Logic
# ============================================================================

case "$BRANCH" in
    releases/b2b-infrastructure)
        validate_infrastructure_branch
        ;;
    releases/b2b-docs-only)
        validate_docs_only_branch
        ;;
    b2b-docs-requisition-list*)
        validate_feature_branch "requisition-list"
        ;;
    b2b-docs-company-management*)
        validate_feature_branch "company-management"
        ;;
    b2b-docs-company-switcher*)
        validate_feature_branch "company-switcher"
        ;;
    b2b-docs-quote-management*)
        validate_feature_branch "quote-management"
        ;;
    b2b-documentation)
        validate_preview_branch
        ;;
    *)
        echo -e "${YELLOW}⚠️  Unknown branch pattern: $BRANCH${NC}"
        echo "   Skipping validation (not a B2B architecture branch)"
        exit 0
        ;;
esac

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "========================================================================"
echo "  VALIDATION SUMMARY"
echo "========================================================================"
echo ""

if [[ $ERRORS -gt 0 ]]; then
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo ""
    echo "   Errors: $ERRORS"
    echo "   Warnings: $WARNINGS"
    echo ""
    echo "Files in this branch violate dual-branch architecture rules."
    echo "See errors above for details."
    echo ""
    echo "💡 Common fixes:"
    echo "   - Infrastructure changes → commit to releases/b2b-infrastructure"
    echo "   - Drop-in docs/enrichments → commit to feature branch"
    echo "   - Other drop-ins' files → remove from this branch"
    echo ""
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  VALIDATION PASSED WITH WARNINGS${NC}"
    echo ""
    echo "   Warnings: $WARNINGS"
    echo ""
    echo "Review warnings above to ensure changes are correct."
    echo ""
    exit 0
else
    echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
    echo ""
    echo "All changes comply with dual-branch architecture."
    echo ""
    exit 0
fi

