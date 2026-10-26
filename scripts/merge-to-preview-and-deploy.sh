#!/usr/bin/env bash
###############################################################################
# Merge current branch into the preview branch, push to GitHub, and rely on
# the "Deploy site to Pages" workflow (preview-on-pages.yml), which runs on push
# to branches: preview, b2b-documentation.
#
# Usage:
#   ./scripts/merge-to-preview-and-deploy.sh
#
# Environment:
#   PREVIEW_BRANCH - target branch (default: preview)
###############################################################################
set -euo pipefail

PREVIEW_BRANCH="${PREVIEW_BRANCH:-preview}"
SOURCE_BRANCH="$(git branch --show-current)"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

if [[ "$SOURCE_BRANCH" == "$PREVIEW_BRANCH" ]]; then
  echo "Error: already on ${PREVIEW_BRANCH}. Checkout the branch you want to merge first." >&2
  exit 1
fi

echo "Source branch: ${SOURCE_BRANCH}"
echo "Preview branch: ${PREVIEW_BRANCH}"
echo ""

git fetch origin "${PREVIEW_BRANCH}"

git checkout "${PREVIEW_BRANCH}"
git pull --ff-only origin "${PREVIEW_BRANCH}"

git merge --no-ff "${SOURCE_BRANCH}" -m "Merge branch '${SOURCE_BRANCH}' into ${PREVIEW_BRANCH}"

git push origin "${PREVIEW_BRANCH}"

git checkout "${SOURCE_BRANCH}"

echo ""
echo "Done. Pushed ${PREVIEW_BRANCH} to origin."
echo "GitHub Actions \"Deploy site to Pages\" runs automatically on push to ${PREVIEW_BRANCH}."
echo "Watch: https://github.com/commerce-docs/microsite-commerce-storefront/actions/workflows/preview-on-pages.yml"
