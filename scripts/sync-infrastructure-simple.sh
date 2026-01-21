#!/bin/bash

###############################################################################
# Simple Infrastructure Sync (Safer Alternative)
#
# Instead of merging, this script cherry-picks ONLY infrastructure files
# from the release branch using `git checkout`.
#
# This is MUCH safer because:
# - No merge conflicts
# - No risk of pulling other drop-in docs
# - Explicit control over what files are synced
#
# Usage:
#   ./scripts/sync-infrastructure-simple.sh [branch-name] [dropin-name]
#   
# Example:
#   ./scripts/sync-infrastructure-simple.sh b2b-docs-requisition-list-v3 requisition-list
###############################################################################

set -e

BRANCH="${1}"
DROPIN="${2}"
RELEASE_BRANCH="releases/b2b-nov-release"

if [[ -z "$BRANCH" ]] || [[ -z "$DROPIN" ]]; then
    echo "Usage: $0 <branch-name> <dropin-name>"
    echo ""
    echo "Example:"
    echo "  $0 b2b-docs-requisition-list-v3 requisition-list"
    exit 1
fi

echo ""
echo "========================================================================"
echo "  SYNC INFRASTRUCTURE: $BRANCH"
echo "========================================================================"
echo ""

# Ensure clean state
if [[ -n $(git status -s) ]]; then
    echo "❌ Working directory is not clean! Commit or stash changes first."
    exit 1
fi

# Checkout feature branch
echo "📌 Switching to $BRANCH..."
git checkout "$BRANCH"

# Fetch latest
echo "📥 Fetching latest from origin..."
git fetch origin

echo ""
echo "📦 Syncing infrastructure files from $RELEASE_BRANCH..."
echo ""

# Sync infrastructure files (checkout from release branch)
FILES_TO_SYNC=(
    "scripts/validate-b2b-enrichments.js"
    "scripts/@generate-container-docs.js"
    "scripts/@generate-initialization-docs.js"
    "scripts/@generate-function-docs.js"
    "scripts/@generate-event-docs.js"
    "scripts/@generate-slot-docs.js"
    "scripts/@generate-styles-docs.js"
    "scripts/@generate-dictionary-docs.js"
    "scripts/@generate-quick-start-docs.js"
    "scripts/generate-b2b-docs.js"
    "scripts/lib/enrichment.js"
    "scripts/lib/generator-core.js"
    "package.json"
    "_dropin-enrichments/$DROPIN"
)

for file in "${FILES_TO_SYNC[@]}"; do
    if git cat-file -e "origin/$RELEASE_BRANCH:$file" 2>/dev/null; then
        echo "   ✅ $file"
        git checkout "origin/$RELEASE_BRANCH" -- "$file"
    else
        echo "   ⚠️  $file (not in release branch)"
    fi
done

echo ""
echo "📊 Changes staged:"
git status -s

echo ""
read -p "Commit these changes? (yes/no): " confirm

if [[ "$confirm" == "yes" ]]; then
    git commit -m "chore: Sync infrastructure from release branch

- Update validation script (validate-b2b-enrichments.js)
- Update generators and generator libraries
- Update package.json with new npm scripts
- Sync cleaned enrichment files for $DROPIN

This ensures the feature branch uses validated infrastructure
without pulling documentation from other drop-ins."
    
    echo ""
    echo "✅ Committed!"
    echo ""
    read -p "Push to origin? (yes/no): " push_confirm
    
    if [[ "$push_confirm" == "yes" ]]; then
        git push origin "$BRANCH"
        echo "✅ Pushed!"
    fi
else
    echo "⚠️  Changes staged but not committed. Run 'git reset' to undo."
fi

echo ""
echo "========================================================================"
echo "✨ SYNC COMPLETE FOR $BRANCH"
echo "========================================================================"
echo ""
echo "🧪 Test the sync:"
echo "   npm run validate-b2b-enrichments"
echo "   npm run generate-b2b-docs $DROPIN -- --dry-run"
echo ""

