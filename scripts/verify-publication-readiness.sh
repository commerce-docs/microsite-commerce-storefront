#!/bin/bash

###############################################################################
# Verify Publication Readiness
#
# Verifies that releases/b2b-nov-release is ready to merge to develop
# Checks for:
# - All expected content is present
# - No pollution or unexpected files
# - Infrastructure is up to date
# - All commits are accounted for
#
# Usage:
#   ./scripts/verify-publication-readiness.sh
###############################################################################

set -e

RELEASE_BRANCH="releases/b2b-nov-release"
INFRA_BRANCH="releases/b2b-infrastructure"
DOCS_BRANCH="releases/b2b-docs-only"
TARGET_BRANCH="develop"

echo ""
echo "========================================================================"
echo "  PUBLICATION READINESS VERIFICATION"
echo "========================================================================"
echo ""

# Ensure we're on the release branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "$RELEASE_BRANCH" ]]; then
    echo "❌ Not on $RELEASE_BRANCH branch"
    echo "   Current branch: $CURRENT_BRANCH"
    echo "   Run: git checkout $RELEASE_BRANCH"
    exit 1
fi

echo "✅ On correct branch: $RELEASE_BRANCH"
echo ""

# Check if branch is up to date with remote
echo "📡 Checking remote status..."
git fetch origin >/dev/null 2>&1

LOCAL_COMMIT=$(git rev-parse @)
REMOTE_COMMIT=$(git rev-parse @{u} 2>/dev/null || echo "no-remote")
BASE_COMMIT=$(git merge-base @ @{u} 2>/dev/null || echo "no-base")

if [[ "$REMOTE_COMMIT" == "no-remote" ]]; then
    echo "⚠️  No remote tracking branch set"
elif [[ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]]; then
    echo "✅ Branch is up to date with remote"
elif [[ "$LOCAL_COMMIT" == "$BASE_COMMIT" ]]; then
    echo "⚠️  Branch is behind remote (you need to pull)"
    echo "   Run: git pull origin $RELEASE_BRANCH"
    exit 1
elif [[ "$REMOTE_COMMIT" == "$BASE_COMMIT" ]]; then
    echo "⚠️  Branch is ahead of remote (unpushed commits)"
    echo "   This is OK if you haven't pushed yet"
else
    echo "⚠️  Branch has diverged from remote"
    echo "   Run: git status"
    exit 1
fi
echo ""

# Check commit count vs develop
echo "📊 Analyzing commit history..."
COMMIT_COUNT=$(git rev-list --count $RELEASE_BRANCH ^$TARGET_BRANCH 2>/dev/null || echo "0")
echo "   Commits ahead of $TARGET_BRANCH: $COMMIT_COUNT"

if [[ "$COMMIT_COUNT" -eq 0 ]]; then
    echo "❌ No new commits to publish"
    exit 1
fi
echo ""

# Check contributor count
echo "👥 Checking contributors..."
CONTRIBUTOR_COUNT=$(git shortlog -sn $RELEASE_BRANCH ^$TARGET_BRANCH | wc -l | tr -d ' ')
echo "   Contributors: $CONTRIBUTOR_COUNT"
echo ""

# Verify expected content exists
echo "📂 Verifying content structure..."

ERRORS=0

# Check for Purchase Order (merged drop-in)
if [[ ! -d "src/content/docs/dropins-b2b/purchase-order" ]]; then
    echo "❌ Missing Purchase Order documentation"
    ((ERRORS++))
else
    echo "✅ Purchase Order documentation present"
fi

# Check for infrastructure
if [[ ! -d "scripts" ]]; then
    echo "❌ Missing scripts directory"
    ((ERRORS++))
else
    SCRIPT_COUNT=$(find scripts -name "*.js" -o -name "*.sh" | wc -l | tr -d ' ')
    echo "✅ Scripts directory present ($SCRIPT_COUNT files)"
fi

# Check for templates
if [[ ! -d "_dropin-templates" ]]; then
    echo "❌ Missing _dropin-templates directory"
    ((ERRORS++))
else
    TEMPLATE_COUNT=$(find _dropin-templates -name "*.mdx" | wc -l | tr -d ' ')
    echo "✅ Templates directory present ($TEMPLATE_COUNT files)"
fi

# Check for package.json
if [[ ! -f "package.json" ]]; then
    echo "❌ Missing package.json"
    ((ERRORS++))
else
    echo "✅ package.json present"
fi

# Check for astro.config.mjs
if [[ ! -f "astro.config.mjs" ]]; then
    echo "⚠️  Missing astro.config.mjs (expected on release branch)"
else
    echo "✅ astro.config.mjs present"
fi

echo ""

# Check for unexpected B2B drop-ins (should only have Purchase Order)
echo "🔍 Checking for unexpected content..."

B2B_DROPINS=($(ls -d src/content/docs/dropins-b2b/*/ 2>/dev/null | xargs -n1 basename || echo ""))

UNEXPECTED=()
for dropin in "${B2B_DROPINS[@]}"; do
    # Only Purchase Order and checkout (B2B extension) should be present
    if [[ "$dropin" != "purchase-order" ]] && [[ "$dropin" != "checkout" ]]; then
        UNEXPECTED+=("$dropin")
    fi
done

if [[ ${#UNEXPECTED[@]} -gt 0 ]]; then
    echo "⚠️  Unexpected B2B drop-ins found (in-progress work):"
    for dropin in "${UNEXPECTED[@]}"; do
        echo "   - $dropin"
    done
    echo ""
    echo "   These should be in feature branches, not the release branch."
    echo "   Consider removing before publication."
    echo ""
else
    echo "✅ No unexpected B2B drop-ins"
fi

# Check for uncommitted changes
echo "📝 Checking for uncommitted changes..."
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ You have uncommitted changes:"
    git status --short
    echo ""
    echo "   Commit or stash changes before publication"
    exit 1
else
    echo "✅ No uncommitted changes"
fi
echo ""

# Final summary
echo "========================================================================"
echo "  VERIFICATION SUMMARY"
echo "========================================================================"
echo ""

if [[ $ERRORS -gt 0 ]]; then
    echo "❌ VERIFICATION FAILED ($ERRORS error(s))"
    echo ""
    echo "Fix the issues above before publishing to $TARGET_BRANCH"
    exit 1
fi

if [[ ${#UNEXPECTED[@]} -gt 0 ]]; then
    echo "⚠️  WARNINGS FOUND"
    echo ""
    echo "Review unexpected content before publishing."
    echo "If you're sure, you can proceed with:"
    echo ""
    echo "   git checkout $TARGET_BRANCH"
    echo "   git merge $RELEASE_BRANCH --no-ff -m \"Publish B2B documentation\""
    echo "   git push origin $TARGET_BRANCH"
    echo ""
    exit 0
fi

echo "✅ ALL CHECKS PASSED"
echo ""
echo "📊 Publication stats:"
echo "   - $COMMIT_COUNT commits to publish"
echo "   - $CONTRIBUTOR_COUNT contributors"
echo "   - $SCRIPT_COUNT scripts"
echo "   - $TEMPLATE_COUNT templates"
echo ""

# Create timestamp for pre-push hook
date +%s > .last-publication-verification
echo "✅ Verification timestamp created (.last-publication-verification)"
echo ""

echo "Ready to publish! Run:"
echo ""
echo "   git checkout $TARGET_BRANCH"
echo "   git merge $RELEASE_BRANCH --no-ff -m \"Publish B2B documentation\""
echo "   git push origin $TARGET_BRANCH"
echo ""

