#!/bin/bash

# Script to merge dropin branch changes into b2b-documentation for preview
# Usage: ./scripts/update-b2b-preview.sh company-management

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
  echo -e "${RED}Error: Please provide a dropin name${NC}"
  echo "Usage: $0 <dropin-name>"
  echo ""
  echo "Available dropins:"
  echo "  - company-management"
  echo "  - company-switcher"
  echo "  - purchase-order"
  echo "  - quote-management"
  echo "  - requisition-list"
  exit 1
fi

DROPIN=$1
DROPIN_BRANCH="b2b-docs-$DROPIN"
PREVIEW_BRANCH="b2b-documentation"

echo -e "${BLUE}📦 Merging $DROPIN_BRANCH into $PREVIEW_BRANCH...${NC}"

# Get current branch to return to it later
CURRENT_BRANCH=$(git branch --show-current)

# Switch to preview branch
echo -e "${BLUE}→ Switching to $PREVIEW_BRANCH${NC}"
git checkout $PREVIEW_BRANCH

# Pull latest changes
echo -e "${BLUE}→ Pulling latest changes${NC}"
git pull origin $PREVIEW_BRANCH

# Merge the dropin branch
echo -e "${BLUE}→ Merging $DROPIN_BRANCH${NC}"
git merge $DROPIN_BRANCH --no-ff -m "merge: $DROPIN updates for preview"

# Push to GitHub
echo -e "${BLUE}→ Pushing to GitHub${NC}"
git push origin $PREVIEW_BRANCH

# Return to original branch
if [ "$CURRENT_BRANCH" != "$PREVIEW_BRANCH" ]; then
  echo -e "${BLUE}→ Returning to $CURRENT_BRANCH${NC}"
  git checkout $CURRENT_BRANCH
fi

echo ""
echo -e "${GREEN}✅ Preview updated successfully!${NC}"
echo -e "${GREEN}→ GitHub will build the preview from $PREVIEW_BRANCH${NC}"

