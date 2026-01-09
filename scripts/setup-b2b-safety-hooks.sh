#!/bin/bash

###############################################################################
# Setup B2B Safety Hooks
#
# Installs Git hooks that prevent accidental direct merges to develop
# without proper B2B consolidation workflow.
#
# Usage:
#   ./scripts/setup-b2b-safety-hooks.sh
###############################################################################

echo ""
echo "========================================================================"
echo "  SETUP B2B PUBLICATION SAFETY HOOKS"
echo "========================================================================"
echo ""

# Check if we're in a git repository
if [[ ! -d ".git" ]]; then
    echo "❌ Error: Not in a Git repository"
    echo "   Run this from the repository root"
    exit 1
fi

# Make .githooks directory if it doesn't exist
if [[ ! -d ".githooks" ]]; then
    echo "⚠️  .githooks directory not found"
    echo "   This should exist in the repository"
    exit 1
fi

# Make hooks executable
echo "Making hooks executable..."
chmod +x .githooks/pre-push
echo "✅ Hooks are executable"
echo ""

# Configure Git to use .githooks directory
echo "Configuring Git to use .githooks..."
git config core.hooksPath .githooks

if [[ $? -eq 0 ]]; then
    echo "✅ Git configured to use .githooks"
else
    echo "❌ Failed to configure Git hooks"
    exit 1
fi

echo ""

# Verify the configuration
HOOKS_PATH=$(git config core.hooksPath)
if [[ "$HOOKS_PATH" == ".githooks" ]]; then
    echo "✅ Verification: Git is using .githooks"
else
    echo "⚠️  Warning: Git hooks path is: $HOOKS_PATH"
fi

echo ""
echo "========================================================================"
echo "  SETUP COMPLETE"
echo "========================================================================"
echo ""
echo "What was configured:"
echo "  ✅ pre-push hook (blocks direct B2B pushes to develop)"
echo ""
echo "What happens now:"
echo "  1. Before every push, Git will run .githooks/pre-push"
echo "  2. If you try to push B2B work directly to develop, it will BLOCK"
echo "  3. You'll see instructions for the correct workflow"
echo ""
echo "Test it:"
echo "  Try: git push origin develop (from a B2B branch)"
echo "  Expected: Hook blocks with error message"
echo ""
echo "Disable (if needed):"
echo "  git config --unset core.hooksPath"
echo "  (Not recommended - removes safety!)"
echo ""
echo "For team setup:"
echo "  Each developer needs to run this script once after cloning"
echo ""

