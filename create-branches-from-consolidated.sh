#!/bin/bash

# Create two branches from the consolidated feature branch
set -e

CURRENT_BRANCH=$(git branch --show-current)
BASE_BRANCH="develop"

echo "🚀 Creating branches from consolidated initialization work..."
echo "📍 Current branch: $CURRENT_BRANCH"
echo "🎯 Base branch: $BASE_BRANCH"
echo ""

if [ "$CURRENT_BRANCH" != "feature/generator-initialization" ]; then
  echo "⚠️  Warning: You're not on feature/generator-initialization branch"
  echo "   Current branch: $CURRENT_BRANCH"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Get the current HEAD (both commits we just made)
CURRENT_HEAD=$(git rev-parse HEAD)
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
BASE_COMMIT=$(git rev-parse HEAD~2)

echo "📝 Commits:"
echo "   Base: $BASE_COMMIT (consolidated initialization changes)"
echo "   +Enrichments: $PREVIOUS_COMMIT"
echo "   +Content: $CURRENT_HEAD"
echo ""

# Branch 1: Infrastructure (base + enrichments)
echo "📦 Creating initialization-generator-infrastructure..."
git checkout -b initialization-generator-infrastructure $BASE_BRANCH
git cherry-pick $BASE_COMMIT
git cherry-pick $PREVIOUS_COMMIT

echo "✅ Infrastructure branch created with generator, template, and enrichments"
echo ""

# Branch 2: Content (only content files)
echo "📄 Creating initialization-docs-content..."
git checkout $BASE_BRANCH
git checkout -b initialization-docs-content
git cherry-pick $CURRENT_HEAD

echo "✅ Content branch created with regenerated .mdx files"
echo ""

# Return to original branch
git checkout $CURRENT_BRANCH

echo "✅ Branches created successfully!"
echo ""
echo "Summary:"
echo "  • initialization-generator-infrastructure - Generator code, template, enrichments"
echo "  • initialization-docs-content - Regenerated .mdx documentation files"
echo ""
echo "Next steps:"
echo "1. Test infrastructure branch:"
echo "   git checkout initialization-generator-infrastructure"
echo "   pnpm build:prod-fast"
echo ""
echo "2. If successful, push:"
echo "   git push -u origin initialization-generator-infrastructure"
echo ""
echo "3. Test content branch:"
echo "   git checkout initialization-docs-content"
echo "   pnpm build:prod-fast"
echo ""
echo "4. If successful, push:"
echo "   git push -u origin initialization-docs-content"
echo ""
echo "You are currently on branch: $(git branch --show-current)"

