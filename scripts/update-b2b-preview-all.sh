#!/bin/bash

# Script to merge ALL infrastructure and dropin changes into b2b-documentation preview
# Usage: ./scripts/update-b2b-preview-all.sh

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PREVIEW_BRANCH="b2b-documentation"
RELEASE_BRANCH="releases/b2b-nov-release"

DROPIN_BRANCHES=(
  "b2b-docs-company-management"
  "b2b-docs-company-switcher"
  "b2b-docs-purchase-order"
  "b2b-docs-quote-management"
  "b2b-docs-requisition-list"
)

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  B2B Preview Update - ALL Infrastructure + Content${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Get current branch to return to it later
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}ℹ${NC} Current branch: ${CURRENT_BRANCH}"

# Fetch latest changes
echo -e "${BLUE}ℹ${NC} Fetching latest changes from remote..."
git fetch --all
echo -e "${GREEN}✓${NC} Fetched latest changes"
echo ""

# Switch to preview branch
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Switching to ${PREVIEW_BRANCH}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
git checkout ${PREVIEW_BRANCH}
git pull origin ${PREVIEW_BRANCH}
echo ""

# Merge infrastructure changes
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Merging Infrastructure (${RELEASE_BRANCH})${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if there are changes to merge
BEHIND_COUNT=$(git rev-list --count HEAD..origin/${RELEASE_BRANCH} 2>/dev/null || echo "0")

if [ "$BEHIND_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Already up to date with ${RELEASE_BRANCH}"
else
  echo -e "${BLUE}ℹ${NC} ${RELEASE_BRANCH} is ${BEHIND_COUNT} commits ahead"
  echo -e "${BLUE}ℹ${NC} Merging infrastructure changes..."
  git merge origin/${RELEASE_BRANCH} --no-ff -m "merge: infrastructure updates from ${RELEASE_BRANCH}"
  echo -e "${GREEN}✓${NC} Merged infrastructure successfully"
fi
echo ""

# Merge all dropin branches
for DROPIN_BRANCH in "${DROPIN_BRANCHES[@]}"; do
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Merging ${DROPIN_BRANCH}${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo ""
  
  # Check if there are changes to merge
  BEHIND_COUNT=$(git rev-list --count HEAD..origin/${DROPIN_BRANCH} 2>/dev/null || echo "0")
  
  if [ "$BEHIND_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Already up to date with ${DROPIN_BRANCH}"
  else
    echo -e "${BLUE}ℹ${NC} ${DROPIN_BRANCH} is ${BEHIND_COUNT} commits ahead"
    echo -e "${BLUE}ℹ${NC} Merging dropin changes..."
    
    # Extract dropin name for commit message
    DROPIN_NAME=$(echo ${DROPIN_BRANCH} | sed 's/b2b-docs-//')
    
    git merge origin/${DROPIN_BRANCH} --no-ff -m "merge: ${DROPIN_NAME} updates"
    echo -e "${GREEN}✓${NC} Merged ${DROPIN_NAME} successfully"
  fi
  echo ""
done

# Push to GitHub
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Pushing to GitHub${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
git push origin ${PREVIEW_BRANCH}
echo -e "${GREEN}✓${NC} Pushed to origin/${PREVIEW_BRANCH}"
echo ""

# Return to original branch
if [ "$CURRENT_BRANCH" != "$PREVIEW_BRANCH" ]; then
  echo -e "${BLUE}ℹ${NC} Returning to ${CURRENT_BRANCH}..."
  git checkout ${CURRENT_BRANCH}
  echo -e "${GREEN}✓${NC} Returned to ${CURRENT_BRANCH}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✓${NC} Preview updated successfully!"
echo -e "${GREEN}✓${NC} Merged infrastructure from ${RELEASE_BRANCH}"
echo -e "${GREEN}✓${NC} Merged all 5 dropin branches:"
for DROPIN_BRANCH in "${DROPIN_BRANCHES[@]}"; do
  DROPIN_NAME=$(echo ${DROPIN_BRANCH} | sed 's/b2b-docs-//')
  echo -e "  • ${DROPIN_NAME}"
done
echo ""
echo -e "${GREEN}→${NC} GitHub will build the preview from ${PREVIEW_BRANCH}"
echo -e "${GREEN}→${NC} Preview URL: https://main--microsite-commerce-storefront--commerce-docs.hlx.page/"
echo ""

