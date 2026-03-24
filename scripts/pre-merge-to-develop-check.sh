#!/bin/bash

###############################################################################
# Pre-Merge to Release Check
#
# Prevents accidental direct merges to release without going through
# the publication consolidation workflow.
#
# Usage:
#   Run before merging any B2B branch to release:
#   ./scripts/pre-merge-to-develop-check.sh <branch-to-merge>
###############################################################################

set -e

BRANCH_TO_MERGE="${1}"
TARGET_BRANCH="release"
PUBLICATION_BRANCH="releases/b2b-nov-release"

if [[ -z "$BRANCH_TO_MERGE" ]]; then
    echo "Usage: $0 <branch-to-merge>"
    echo ""
    echo "Example:"
    echo "  $0 releases/b2b-nov-release"
    exit 1
fi

echo ""
echo "========================================================================"
echo "  PRE-MERGE TO RELEASE CHECK"
echo "========================================================================"
echo ""
echo "Checking: $BRANCH_TO_MERGE → $TARGET_BRANCH"
echo ""

# Check if branch is a B2B branch
if [[ "$BRANCH_TO_MERGE" == *"b2b"* ]] || [[ "$BRANCH_TO_MERGE" == "releases/b2b-"* ]]; then
    
    if [[ "$BRANCH_TO_MERGE" == "$PUBLICATION_BRANCH" ]]; then
        echo "✅ CORRECT: Merging from publication branch"
        echo ""
        echo "This is the correct workflow for publishing B2B documentation."
        echo ""
        echo "Before proceeding, verify you've completed:"
        echo "  1. ✅ Merged releases/b2b-infrastructure → releases/b2b-nov-release"
        echo "  2. ✅ Merged releases/b2b-docs-only → releases/b2b-nov-release"
        echo "  3. ✅ Ran ./scripts/verify-publication-readiness.sh"
        echo ""
        echo "If all steps complete, proceed with:"
        echo "  git merge $PUBLICATION_BRANCH --no-ff -m \"feat: Publish B2B documentation\""
        echo ""
        exit 0
    else
        echo "❌ ERROR: Cannot merge B2B branch directly to release"
        echo ""
        echo "You're attempting to merge:"
        echo "  $BRANCH_TO_MERGE → release"
        echo ""
        echo "This bypasses the publication consolidation workflow!"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  CORRECT WORKFLOW (preserves all 3,230+ commits):"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Step 1: Consolidate infrastructure"
        echo "  git checkout releases/b2b-nov-release"
        echo "  git merge releases/b2b-infrastructure --no-ff"
        echo ""
        echo "Step 2: Consolidate approved documentation"
        echo "  git merge releases/b2b-docs-only --no-ff"
        echo ""
        echo "Step 3: Verify readiness"
        echo "  ./scripts/verify-publication-readiness.sh"
        echo ""
        echo "Step 4: Merge to release"
        echo "  git checkout release"
        echo "  git merge releases/b2b-nov-release --no-ff"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "📚 See: B2B-WORKFLOW-GUIDE.md → Workflow 4: Publish to Production"
        echo ""
        exit 1
    fi
else
    echo "ℹ️  Not a B2B branch - standard merge workflow applies"
    echo ""
    echo "Proceed with normal merge to release:"
    echo "  git merge $BRANCH_TO_MERGE"
    echo ""
    exit 0
fi

