#!/bin/bash

# Create individual branches for each B2B drop-in for team review
set -e

# Configuration
SOURCE_BRANCH="b2b-documentation"  # Branch with all B2B work
BASE_BRANCH="develop"  # Base branch to branch from
B2B_DROPINS=(
    "company-management"
    "company-switcher"
    "purchase-order"
    "quote-management"
    "requisition-list"
)

echo "🚀 Creating individual B2B drop-in branches for team review"
echo "📍 Source branch: $SOURCE_BRANCH"
echo "🎯 Base branch: $BASE_BRANCH"
echo ""

# Verify source branch exists
if ! git rev-parse --verify $SOURCE_BRANCH &>/dev/null; then
    echo "❌ Error: Source branch '$SOURCE_BRANCH' not found"
    echo "Available B2B branches:"
    git branch -a | grep -i b2b
    exit 1
fi

# Save current branch
ORIGINAL_BRANCH=$(git branch --show-current)

echo "📦 Creating branches for ${#B2B_DROPINS[@]} B2B drop-ins..."
echo ""

for dropin in "${B2B_DROPINS[@]}"; do
    BRANCH_NAME="b2b-docs-${dropin}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📄 Creating branch: $BRANCH_NAME"
    echo ""
    
    # Check if branch already exists
    if git rev-parse --verify $BRANCH_NAME &>/dev/null; then
        echo "⚠️  Branch '$BRANCH_NAME' already exists. Skipping..."
        echo ""
        continue
    fi
    
    # Create new branch from base
    git checkout -b $BRANCH_NAME $BASE_BRANCH
    
    # Checkout ONLY this drop-in's generated documentation from source branch
    echo "  → Copying generated documentation for $dropin..."
    git checkout $SOURCE_BRANCH -- src/content/docs/dropins-b2b/$dropin/ 2>/dev/null || {
        echo "  ⚠️  No documentation found for $dropin in source branch"
        git checkout $ORIGINAL_BRANCH
        git branch -D $BRANCH_NAME
        continue
    }
    
    # DO NOT checkout enrichment files (internal editorial files)
    # DO NOT checkout full astro.config.mjs (contains all B2B drop-ins)
    # Teams only need to review the generated .mdx documentation files
    
    # Stage all changes
    git add -A
    
    # Check if there are any changes to commit
    if git diff --cached --quiet; then
        echo "  ⚠️  No changes to commit for $dropin"
        git checkout $ORIGINAL_BRANCH
        git branch -D $BRANCH_NAME
        continue
    fi
    
    # Commit the changes
    git commit -m "docs: Add ${dropin} B2B drop-in documentation

- Add overview page with features and architecture
- Generate functions, events, containers, and slots documentation
- Add quick start and initialization guides
- Include styling and dictionary documentation

This documentation is ready for ${dropin} team review."
    
    echo "  ✅ Branch created: $BRANCH_NAME"
    echo ""
done

# Return to original branch
git checkout $ORIGINAL_BRANCH

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Branch creation complete!"
echo ""
echo "📋 Summary of created branches:"
echo ""
for dropin in "${B2B_DROPINS[@]}"; do
    BRANCH_NAME="b2b-docs-${dropin}"
    if git rev-parse --verify $BRANCH_NAME &>/dev/null; then
        echo "  ✓ $BRANCH_NAME"
    fi
done
echo ""
echo "Next steps:"
echo ""
echo "1. Review and test each branch:"
for dropin in "${B2B_DROPINS[@]}"; do
    BRANCH_NAME="b2b-docs-${dropin}"
    if git rev-parse --verify $BRANCH_NAME &>/dev/null; then
        echo "   git checkout $BRANCH_NAME && npm run build:prod-fast"
    fi
done
echo ""
echo "2. Push branches to create PRs:"
for dropin in "${B2B_DROPINS[@]}"; do
    BRANCH_NAME="b2b-docs-${dropin}"
    if git rev-parse --verify $BRANCH_NAME &>/dev/null; then
        echo "   git push -u origin $BRANCH_NAME"
    fi
done
echo ""
echo "3. Create PRs for each branch:"
echo "   - Each PR should target 'develop' (or your production branch)"
echo "   - Tag the appropriate drop-in team as reviewers"
echo "   - Include link to the drop-in repository"
echo ""
echo "You are currently on branch: $(git branch --show-current)"

