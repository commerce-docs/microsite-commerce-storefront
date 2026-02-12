#!/bin/bash
# =============================================================================
# Fetch Changelog Data from Drop-in Repositories
# =============================================================================
# 
# This script fetches commit messages and PR details between version tags
# for all drop-in repositories to help generate changelog entries.
#
# Usage: 
#   ./fetch-changelog.sh [output_dir] [release_name]
#
# Examples:
#   ./fetch-changelog.sh                          # Uses defaults
#   ./fetch-changelog.sh ./changelog-data         # Custom output dir
#   ./fetch-changelog.sh ./changelog-data "March 2026"  # Custom release name
#
# Requirements:
#   - SSH access to adobe-commerce GitHub org
#   - gh CLI installed (for PR details)
#
# Configuration:
#   Edit the version numbers in B2C_REPOS and B2B_REPOS arrays below
#   to match the versions you want to compare.
#
# =============================================================================

set -e

OUTPUT_DIR="${1:-./changelog-data}"
RELEASE_NAME="${2:-February 2026}"
RELEASE_DATE="${3:-2026-02-17}"

mkdir -p "$OUTPUT_DIR"

# =============================================================================
# CONFIGURE VERSIONS HERE
# =============================================================================
# Format: "repo_name:old_version:new_version:display_name:new_display_version"
#
# To update for a new release:
# 1. Change old_version to the previous release tag (e.g., v3.1.0)
# 2. Change new_version to the new release tag or latest beta
# 3. Update new_display_version to the target release version

declare -a B2C_REPOS=(
  "storefront-cart:v3.0.0:v3.1.0-beta1:Cart:v3.1.0"
  "storefront-checkout:v3.0.0:v3.1.0-beta1:Checkout:v3.1.0"
  "storefront-order:v3.0.0:v3.1.0-beta1:Order:v3.1.0"
  "storefront-pdp:v3.0.0:v3.0.1-beta2:Product Details Page:v3.1.0"
  "storefront-account:v3.0.0:v3.1.0-beta1:User Account:v3.1.0"
  "storefront-auth:v3.0.0:v3.1.0-beta2:User Auth:v3.1.0"
  "storefront-wishlist:v3.0.0:v3.1.0-beta2:Wishlist:v3.1.0"
)

declare -a B2B_REPOS=(
  "storefront-quote-management:v1.0.0:v1.1.0-beta1:Quote Management:v1.1.0"
  "storefront-company-management:v1.0.0:v1.1.0-beta1:Company Management:v1.1.0"
  "storefront-company-switcher:v1.0.0:v1.1.0-beta1:Company Switcher:v1.1.0"
  "storefront-purchase-order:v1.0.0:v1.1.0-beta1:Purchase Order:v1.1.0"
  "storefront-requisition-list:v1.0.0:v1.1.0-beta1:Requisition List:v1.1.0"
)

# =============================================================================

COMBINED_FILE="$OUTPUT_DIR/COMBINED.md"
CHANGELOG_FILE="$OUTPUT_DIR/CHANGELOG_ENTRIES.md"

# Check for gh CLI
HAS_GH_CLI=false
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
  HAS_GH_CLI=true
  echo "✓ GitHub CLI authenticated - will fetch PR details"
else
  echo "⚠ GitHub CLI not available or not authenticated - skipping PR details"
  echo "  Run 'gh auth login' to enable PR detail fetching"
fi

# Start combined file
cat > "$COMBINED_FILE" << EOF
# Drop-in Changelog Data ($RELEASE_NAME)

Generated for creating changelog entries in changelog.mdx.

**Generated:** $(date)
**Release Date:** $RELEASE_DATE

---

EOF

# Start changelog entries file (ready to paste into changelog.mdx)
cat > "$CHANGELOG_FILE" << EOF
{/* =============================================================================
    $RELEASE_NAME Changelog Entries
    Generated: $(date)
    
    Copy these entries into changelog.mdx under each component's section.
    Review and edit descriptions before publishing.
============================================================================= */}

EOF

fetch_pr_details() {
  local repo=$1
  local pr_number=$2
  
  if [ "$HAS_GH_CLI" = true ]; then
    gh pr view "$pr_number" --repo "adobe-commerce/$repo" --json title,body,url 2>/dev/null || echo "{}"
  else
    echo "{}"
  fi
}

extract_pr_numbers() {
  local commit_msg=$1
  echo "$commit_msg" | grep -oE '#[0-9]+' | tr -d '#' || true
}

fetch_repo_changes() {
  local repo=$1
  local old_ver=$2
  local new_ver=$3
  local display_name=$4
  local display_version=$5
  
  echo "Fetching $repo: $old_ver -> $new_ver"
  
  # Create temp dir for shallow clone
  local tmp_dir=$(mktemp -d)
  
  # Clone repo
  if git clone --bare --single-branch --no-tags \
    "git@github.com:adobe-commerce/${repo}.git" \
    "$tmp_dir" 2>/dev/null; then
    
    # Fetch the specific tags
    git -C "$tmp_dir" fetch origin "refs/tags/${old_ver}:refs/tags/${old_ver}" 2>/dev/null || true
    git -C "$tmp_dir" fetch origin "refs/tags/${new_ver}:refs/tags/${new_ver}" 2>/dev/null || true
    
    # Write to combined file
    echo "" >> "$COMBINED_FILE"
    echo "## ${display_name} ${display_version}" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
    echo "**Repository:** \`adobe-commerce/${repo}\`" >> "$COMBINED_FILE"
    echo "**Comparing:** ${old_ver} → ${new_ver}" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
    
    # Get commits
    local commits=""
    commits=$(git -C "$tmp_dir" log --oneline --pretty=format:"%s" \
      "${old_ver}..${new_ver}" 2>/dev/null) || commits=""
    
    if [ -n "$commits" ]; then
      echo "### Commits" >> "$COMBINED_FILE"
      echo "" >> "$COMBINED_FILE"
      
      # Process each commit
      local pr_numbers=""
      local meaningful_changes=""
      
      while IFS= read -r commit; do
        echo "- $commit" >> "$COMBINED_FILE"
        
        # Extract PR numbers
        local prs=$(extract_pr_numbers "$commit")
        if [ -n "$prs" ]; then
          pr_numbers="$pr_numbers $prs"
        fi
        
        # Filter out internal/merge commits for meaningful changes
        if [[ ! "$commit" =~ ^(Merge|INTERNAL|Beta|update.*version|fix.*test|Update.*README) ]]; then
          meaningful_changes="$meaningful_changes
- $commit"
        fi
      done <<< "$commits"
      
      echo "" >> "$COMBINED_FILE"
      
      # Fetch PR details if available
      if [ "$HAS_GH_CLI" = true ] && [ -n "$pr_numbers" ]; then
        echo "### PR Details" >> "$COMBINED_FILE"
        echo "" >> "$COMBINED_FILE"
        
        for pr in $pr_numbers; do
          local pr_data=$(fetch_pr_details "$repo" "$pr")
          if [ -n "$pr_data" ] && [ "$pr_data" != "{}" ]; then
            local pr_title=$(echo "$pr_data" | jq -r '.title // empty')
            local pr_url=$(echo "$pr_data" | jq -r '.url // empty')
            if [ -n "$pr_title" ]; then
              echo "- **#$pr**: $pr_title" >> "$COMBINED_FILE"
              echo "  $pr_url" >> "$COMBINED_FILE"
            fi
          fi
        done
        echo "" >> "$COMBINED_FILE"
      fi
      
      # Generate changelog entry
      echo "" >> "$CHANGELOG_FILE"
      generate_changelog_entry "$display_name" "$display_version" "$repo" "$meaningful_changes" "$pr_numbers"
      
    else
      echo "- (No commits found between versions)" >> "$COMBINED_FILE"
      echo "" >> "$COMBINED_FILE"
      
      # Generate minimal changelog entry
      echo "" >> "$CHANGELOG_FILE"
      generate_changelog_entry "$display_name" "$display_version" "$repo" "" ""
    fi
    
    echo "---" >> "$COMBINED_FILE"
  else
    echo "## ${display_name} ${display_version}" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
    echo "- (Unable to clone repository)" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
    echo "---" >> "$COMBINED_FILE"
  fi
  
  rm -rf "$tmp_dir"
}

generate_changelog_entry() {
  local display_name=$1
  local display_version=$2
  local repo=$3
  local changes=$4
  local pr_numbers=$5
  
  cat >> "$CHANGELOG_FILE" << EOF
    <ChangelogEntry
      date="$RELEASE_DATE"
      title="$display_name $display_version"
      components={['$display_name']}
    >
      The $display_name drop-in has been updated with the following changes:

EOF

  if [ -n "$changes" ]; then
    # Clean up and format changes
    echo "$changes" | while IFS= read -r line; do
      if [ -n "$line" ]; then
        # Extract description and PR number
        local desc=$(echo "$line" | sed 's/^- //' | sed 's/ (#[0-9]*)$//')
        local pr=$(echo "$line" | grep -oE '#[0-9]+' | head -1)
        
        if [ -n "$pr" ]; then
          echo "      - **${desc}** ([${pr}](https://github.com/adobe-commerce/${repo}/pull/${pr#\#}))." >> "$CHANGELOG_FILE"
        elif [ -n "$desc" ]; then
          echo "      - **${desc}**." >> "$CHANGELOG_FILE"
        fi
      fi
    done
  else
    echo "      - SDK and dependency updates for improved stability." >> "$CHANGELOG_FILE"
  fi

  cat >> "$CHANGELOG_FILE" << EOF

    </ChangelogEntry>

EOF
}

echo ""
echo "=== Fetching B2C Drop-in Changes ==="
echo "" >> "$COMBINED_FILE"
echo "# B2C Drop-ins" >> "$COMBINED_FILE"
echo "" >> "$COMBINED_FILE"

echo "" >> "$CHANGELOG_FILE"
echo "{/* B2C Drop-ins */}" >> "$CHANGELOG_FILE"
echo "" >> "$CHANGELOG_FILE"

for entry in "${B2C_REPOS[@]}"; do
  IFS=':' read -r repo old_ver new_ver display_name display_version <<< "$entry"
  fetch_repo_changes "$repo" "$old_ver" "$new_ver" "$display_name" "$display_version"
done

echo ""
echo "=== Fetching B2B Drop-in Changes ==="
echo "" >> "$COMBINED_FILE"
echo "# B2B Drop-ins" >> "$COMBINED_FILE"
echo "" >> "$COMBINED_FILE"

echo "" >> "$CHANGELOG_FILE"
echo "{/* B2B Drop-ins */}" >> "$CHANGELOG_FILE"
echo "" >> "$CHANGELOG_FILE"

for entry in "${B2B_REPOS[@]}"; do
  IFS=':' read -r repo old_ver new_ver display_name display_version <<< "$entry"
  fetch_repo_changes "$repo" "$old_ver" "$new_ver" "$display_name" "$display_version"
done

echo ""
echo "=============================================="
echo "=== Done ==="
echo "=============================================="
echo ""
echo "Output files:"
echo "  1. $COMBINED_FILE"
echo "     - Raw commit data and PR details for review"
echo ""
echo "  2. $CHANGELOG_FILE"  
echo "     - Ready-to-use changelog entries for changelog.mdx"
echo ""
echo "Next steps:"
echo "  1. Review $CHANGELOG_FILE"
echo "  2. Edit descriptions to be user-friendly"
echo "  3. Copy entries into src/content/docs/releases/changelog.mdx"
echo "  4. Insert each entry under its component's section header"
echo ""
