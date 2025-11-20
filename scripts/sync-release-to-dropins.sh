#!/bin/bash

# ============================================================================
# B2B Release → Dropin Branch Synchronization Script
# ============================================================================
#
# PURPOSE:
#   Propagates infrastructure changes from releases/b2b-nov-release to all
#   B2B dropin documentation branches.
#
# USAGE:
#   ./scripts/sync-release-to-dropins.sh [options]
#
# OPTIONS:
#   --dry-run       Show what would be merged without making changes
#   --push          Automatically push changes to remote after merging
#   --dropin NAME   Only sync to specific dropin branch (e.g., quote-management)
#
# EXAMPLES:
#   # Preview changes without merging
#   ./scripts/sync-release-to-dropins.sh --dry-run
#
#   # Merge release into all dropin branches
#   ./scripts/sync-release-to-dropins.sh
#
#   # Merge and push to remote
#   ./scripts/sync-release-to-dropins.sh --push
#
#   # Sync only quote-management branch
#   ./scripts/sync-release-to-dropins.sh --dropin quote-management
#
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
RELEASE_BRANCH="releases/b2b-nov-release"
DROPIN_BRANCHES=(
    "b2b-docs-company-management"
    "b2b-docs-company-switcher"
    "b2b-docs-purchase-order"
    "b2b-docs-quote-management"
    "b2b-docs-requisition-list"
)

# Parse arguments
DRY_RUN=false
AUTO_PUSH=false
SINGLE_DROPIN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --push)
            AUTO_PUSH=true
            shift
            ;;
        --dropin)
            SINGLE_DROPIN="b2b-docs-$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Filter to single dropin if specified
if [ -n "$SINGLE_DROPIN" ]; then
    DROPIN_BRANCHES=("$SINGLE_DROPIN")
fi

# ============================================================================
# Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# ============================================================================
# Pre-flight checks
# ============================================================================

print_header "B2B Release → Dropin Synchronization"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Save current branch
ORIGINAL_BRANCH=$(git branch --show-current)
print_info "Current branch: ${ORIGINAL_BRANCH}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Update from remote
print_info "Fetching latest changes from remote..."
if [ "$DRY_RUN" = false ]; then
    git fetch origin
fi
print_success "Fetched latest changes"

# ============================================================================
# Sync each dropin branch
# ============================================================================

SUCCESSFUL_MERGES=()
FAILED_MERGES=()
CONFLICTS=()

for branch in "${DROPIN_BRANCHES[@]}"; do
    print_header "Processing: $branch"
    
    # Check if branch exists
    if ! git show-ref --verify --quiet refs/heads/$branch; then
        print_warning "Branch $branch does not exist locally, checking out from remote..."
        if [ "$DRY_RUN" = false ]; then
            git checkout -b $branch origin/$branch 2>/dev/null || {
                print_error "Failed to checkout $branch"
                FAILED_MERGES+=("$branch")
                continue
            }
        else
            print_info "[DRY RUN] Would checkout: $branch"
        fi
    else
        if [ "$DRY_RUN" = false ]; then
            git checkout $branch
        else
            print_info "[DRY RUN] Would checkout: $branch"
        fi
    fi
    
    # Show what would be merged
    if git rev-list HEAD..$RELEASE_BRANCH --count > /dev/null 2>&1; then
        COMMITS_AHEAD=$(git rev-list HEAD..$RELEASE_BRANCH --count)
        if [ "$COMMITS_AHEAD" -gt 0 ]; then
            print_info "Release branch is $COMMITS_AHEAD commits ahead"
            
            if [ "$DRY_RUN" = true ]; then
                print_info "Commits that would be merged:"
                git log --oneline HEAD..$RELEASE_BRANCH | head -10
                echo ""
            fi
        else
            print_success "Branch is already up to date with release"
            continue
        fi
    fi
    
    # Attempt merge
    if [ "$DRY_RUN" = false ]; then
        print_info "Merging $RELEASE_BRANCH into $branch..."
        
        if git merge $RELEASE_BRANCH --no-edit; then
            print_success "Merged successfully"
            SUCCESSFUL_MERGES+=("$branch")
            
            # Push if requested
            if [ "$AUTO_PUSH" = true ]; then
                print_info "Pushing to remote..."
                if git push origin $branch; then
                    print_success "Pushed to origin/$branch"
                else
                    print_error "Failed to push $branch"
                fi
            fi
        else
            print_error "Merge conflicts detected!"
            CONFLICTS+=("$branch")
            
            # Show conflicted files
            print_info "Conflicted files:"
            git diff --name-only --diff-filter=U
            
            # Abort merge
            git merge --abort
            print_warning "Merge aborted. Please resolve conflicts manually."
        fi
    else
        print_info "[DRY RUN] Would merge $RELEASE_BRANCH into $branch"
    fi
done

# ============================================================================
# Return to original branch
# ============================================================================

if [ "$DRY_RUN" = false ]; then
    git checkout $ORIGINAL_BRANCH
    print_success "Returned to $ORIGINAL_BRANCH"
fi

# ============================================================================
# Summary Report
# ============================================================================

print_header "Summary"

if [ "$DRY_RUN" = true ]; then
    print_info "DRY RUN - No changes were made"
    echo ""
fi

if [ ${#SUCCESSFUL_MERGES[@]} -gt 0 ]; then
    print_success "Successfully merged ${#SUCCESSFUL_MERGES[@]} branches:"
    for branch in "${SUCCESSFUL_MERGES[@]}"; do
        echo "  • $branch"
    done
    echo ""
fi

if [ ${#CONFLICTS[@]} -gt 0 ]; then
    print_warning "Merge conflicts in ${#CONFLICTS[@]} branches:"
    for branch in "${CONFLICTS[@]}"; do
        echo "  • $branch"
    done
    echo ""
    print_info "To resolve conflicts manually:"
    for branch in "${CONFLICTS[@]}"; do
        echo "  git checkout $branch"
        echo "  git merge $RELEASE_BRANCH"
        echo "  # Resolve conflicts"
        echo "  git commit"
        echo ""
    done
fi

if [ ${#FAILED_MERGES[@]} -gt 0 ]; then
    print_error "Failed to process ${#FAILED_MERGES[@]} branches:"
    for branch in "${FAILED_MERGES[@]}"; do
        echo "  • $branch"
    done
    echo ""
fi

# Exit with error if there were conflicts or failures
if [ ${#CONFLICTS[@]} -gt 0 ] || [ ${#FAILED_MERGES[@]} -gt 0 ]; then
    exit 1
fi

print_success "All branches synchronized successfully!"

