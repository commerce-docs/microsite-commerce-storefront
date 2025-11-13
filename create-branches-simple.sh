#!/bin/bash

# Create two branches by checking out specific files from feature branch
set -e

SOURCE_BRANCH="feature/generator-initialization"
BASE_BRANCH="develop"

echo "🚀 Creating branches from $SOURCE_BRANCH..."
echo ""

# Branch 1: Infrastructure
echo "📦 Creating initialization-generator-infrastructure..."
git checkout -b initialization-generator-infrastructure $BASE_BRANCH

# Checkout infrastructure files from feature branch
git checkout $SOURCE_BRANCH -- \
  scripts/@generate-initialization-docs.js \
  scripts/lib/repository.js \
  scripts/lib/generator-core.js \
  scripts/lib/logger.js \
  _dropin-templates/dropin-initialization.mdx \
  _dropin-enrichments \
  astro.config.mjs

git add -A
git commit -m "feat: modernize initialization generator with version tracking and custom intros

- Add version accuracy tracking to ensure docs match actual code
- Implement three-layer safety net (console, version display, warning box)
- Extract customizable models from ConfigProps.models definition
- Handle import aliases in model extraction (e.g., Cart as CartModel)
- Implement drop-in specific introductory paragraphs
- Add missing initialization sidebar links
- Include enrichment files with custom model descriptions"

echo "✅ Infrastructure branch created"
echo ""

# Branch 2: Content
echo "📄 Creating initialization-docs-content..."
git checkout $BASE_BRANCH
git checkout -b initialization-docs-content

# Checkout only the .mdx content files from feature branch
git checkout $SOURCE_BRANCH -- src/content/docs/dropins/*/initialization.mdx

git add -A
git commit -m "docs: regenerate initialization pages with improved content

- Add drop-in-specific introductory paragraphs
- Include version tracking with mismatch warnings
- Add model definitions sections with full TypeScript interfaces
- Include available models tables with meaningful descriptions
- Improve content organization and developer experience"

echo "✅ Content branch created"
echo ""

# Return to feature branch
git checkout $SOURCE_BRANCH

echo "✅ Branches created successfully!"
echo ""
echo "Summary:"
echo "  • initialization-generator-infrastructure - Generator, template, enrichments, sidebar"
echo "  • initialization-docs-content - Regenerated .mdx files only"
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

