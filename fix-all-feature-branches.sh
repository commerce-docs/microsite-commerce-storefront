#!/bin/bash

branches=(
  "feature/merchant-blocks-company-management"
  "feature/merchant-blocks-purchase-order"
  "feature/merchant-blocks-quote-management"
  "feature/merchant-blocks-requisition-list"
  "feature/merchant-blocks-checkout-account"
)

for branch in "${branches[@]}"; do
  echo "=== Fixing $branch ==="
  
  git checkout "$branch"
  
  # Copy requirements.json
  cp /tmp/requirements-verified.json _dropin-enrichments/merchant-blocks/requirements.json
  
  # Apply requirements using node script
  cat > apply-req.js << 'SCRIPT'
import { readFileSync, writeFileSync } from 'fs';
const requirements = JSON.parse(readFileSync('_dropin-enrichments/merchant-blocks/requirements.json', 'utf8'));
let fixed = 0;
for (const [blockName, requirement] of Object.entries(requirements)) {
  const filePath = `src/content/docs/merchants/blocks/${blockName}.mdx`;
  try {
    let content = readFileSync(filePath, 'utf8');
    const requirementsRegex = /(## Requirements\n\n)[^\n]+/;
    if (content.match(requirementsRegex)) {
      content = content.replace(requirementsRegex, `$1${requirement}`);
      writeFileSync(filePath, content, 'utf8');
      fixed++;
    }
  } catch (err) {
    // File doesn't exist on this branch - that's OK
  }
}
console.log(`✓ Applied requirements to ${fixed} blocks`);
SCRIPT
  
  node apply-req.js
  rm apply-req.js
  
  # Fix configuration messages and links
  find src/content/docs/merchants/blocks/ -name "commerce-b2b-*.mdx" -o -name "commerce-company-*.mdx" -o -name "commerce-customer-company.mdx" -o -name "commerce-account-nav.mdx" -o -name "commerce-checkout-success.mdx" | while read file; do
    if [ -f "$file" ]; then
      sed -i '' 's/This block requires no configuration. Add the block name to a table in your document and it will automatically work with your storefront./No configurations available for this block./g' "$file"
      sed -i '' 's|/merchants/storefront-builder/section-metadata/|/merchants/quick-start/section-metadata/|g' "$file"
      sed -i '' 's|/merchants/storefront-builder/page-metadata/|/merchants/quick-start/page-metadata/|g' "$file"
    fi
  done
  
  # Commit and push
  git add -A
  git commit -m "Restore verified Requirements with admin panel paths

- Applied verified admin panel paths to Requirements sections
- Simplified configuration messages
- Fixed broken links to quick-start"
  git push origin "$branch"
  
  echo "✅ Done"
  echo ""
done

echo "🎉 All 5 feature branches updated!"

