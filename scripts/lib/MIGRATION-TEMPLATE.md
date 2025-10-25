# Quick Migration Template

Use this template to migrate any generator from auto-doc-generators to the new framework.

## Step-by-Step Migration Process

### 1. Setup Branch
```bash
# Start from develop with latest changes
git checkout develop
git pull

# Create feature branch
git checkout -b feature/generator-[NAME]

# Example: git checkout -b feature/generator-containers
```

### 2. Copy Generator
```bash
# Copy the generator from auto-doc-generators branch
git show origin/auto-doc-generators:scripts/@generate-[NAME]-docs.js > scripts/@generate-[NAME]-docs.js

# Copy the template
git show origin/auto-doc-generators:_dropin-templates/dropin-[NAME].mdx > _dropin-templates/dropin-[NAME].mdx

# Example:
# git show origin/auto-doc-generators:scripts/@generate-container-docs.js > scripts/@generate-container-docs.js
# git show origin/auto-doc-generators:_dropin-templates/dropin-container.mdx > _dropin-templates/dropin-container.mdx
```

### 3. Refactor Generator

Replace the entire file with this template:

```javascript
#!/usr/bin/env node

/**
 * [Name] Documentation Generator
 * 
 * This script generates [name] documentation for drop-in components by:
 * 1. [What it scans]
 * 2. [What it extracts]
 * 3. Generating comprehensive MDX documentation
 * 
 * USAGE:
 * - Generate all drop-ins: npm run generate-[name]-docs
 * - Generate single drop-in: npm run generate-[name]-docs cart
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { load[Name]Enrichments } from './lib/enrichment.js';
import { updateSidebarFor[Name]s } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';

const projectRoot = getProjectRoot();

/**
 * Scan repository for [items]
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array|Object} Scanned data with optional count property
 */
function scanFor[Name]s(repoPath) {
    // TODO: Implement scanning logic
    // Look in specific directories
    // Parse files
    // Extract relevant data
    
    const [items] = []; // Replace with actual scanning
    
    return [items]; // Return array or object with .count property
}

/**
 * Generate [name] MDX documentation
 * 
 * @param {string} repoName - Drop-in name (e.g., 'cart')
 * @param {Object} repoConfig - Repository configuration
 * @param {Array|Object} data - Scanned data
 * @param {string} version - Drop-in version
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generate[Name]sMDX(repoName, repoConfig, data, version, enrichmentData = null) {
    // Read template
    const template = readTemplate('dropin-[name]s.mdx');
    
    // Build content
    let content = '';
    
    // TODO: Build content from data
    // Loop through items
    // Format sections
    // Apply enrichments
    
    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoName,
        'DROPIN_VERSION': cleanVersion(version),
        '[NAME]S_CONTENT': content,
        'REPO_URL': repoConfig.gitUrl.replace('.git', '')
    });
}

// Main execution using shared generator framework
runGenerator({
    name: '[Name]',
    itemType: '[name]s',
    loadEnrichments: load[Name]Enrichments,
    scanRepo: scanFor[Name]s,
    generateContent: generate[Name]sMDX,
    updateSidebar: updateSidebarFor[Name]s,
    outputFileName: '[name]s.mdx'
});
```

**Replace:**
- `[Name]` with title case (e.g., `Container`, `Slot`, `Dictionary`)
- `[name]` with lowercase (e.g., `container`, `slot`, `dictionary`)
- `[items]` with plural (e.g., `containers`, `slots`, `dictionary entries`)

### 4. Update Template

Edit `_dropin-templates/dropin-[name]s.mdx`:

```mdx
---
title: DROPIN_NAME [Name]s
description: [Name] documentation for the DROPIN_NAME drop-in.
sidebar:
  label: [Name]s
  order: [N]
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

import { Aside } from '@astrojs/starlight/components';
import Badge from '@components/overrides/Badge.astro';
import OptionsTable from '@components/OptionsTable.astro';
{/* Add other imports as needed */}

Introductory text about DROPIN_NAME [name]s.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: DROPIN_VERSION</strong>
</div>

## [Section Title]

[NAME]S_CONTENT

{/* This documentation is auto-generated from: REPO_URL */}
```

**Template Checklist:**
- [ ] Uses `DROPIN_NAME` placeholder
- [ ] Uses `DROPIN_VERSION` placeholder (not inline replace)
- [ ] Uses `DROPIN_PACKAGE` if needed
- [ ] Has clear content marker (`[NAME]S_CONTENT`)
- [ ] Imports necessary components
- [ ] Has proper frontmatter

### 5. Add Sidebar Support

Edit `scripts/lib/sidebar.js`:

```javascript
/**
 * Update sidebar navigation for [name]s
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarFor[Name]s(dropinName, repoConfig) {
    // Insert after [reference entry]
    return insertSidebarEntry(dropinName, repoConfig, '[Name]s', '[ReferenceEntry]');
}
```

**Sidebar Order Reference:**
- Slots → Functions → Events → Containers → Dictionary

### 6. Add Enrichment Support

Edit `scripts/lib/enrichment.js`:

```javascript
/**
 * Load [name] enrichments for a drop-in
 * 
 * @param {string} dropinName - Name of the drop-in
 * @returns {Object|null} [Name] enrichment data
 */
export function load[Name]Enrichments(dropinName) {
    return loadEnrichmentData(dropinName, '[name]s');
}
```

### 7. Create Enrichment Structure

Create example enrichment file:
```bash
# Create directory structure
mkdir -p _dropin-enrichments/cart

# Create example enrichment file
cat > _dropin-enrichments/cart/[name]s.json << 'EOF'
{
  "[item-name]": {
    "description": "Enhanced description for this [item].",
    "usage": "Example usage code...",
    "notes": "Additional notes..."
  }
}
EOF
```

Update `_dropin-enrichments/README.md` with new format documentation.

### 8. Add NPM Script

Edit `package.json`:

```json
{
  "scripts": {
    "generate-[name]-docs": "node scripts/@generate-[name]-docs.js"
  }
}
```

### 9. Test Generator

```bash
# Test with single drop-in
npm run generate-[name]-docs cart

# Verify output
ls -la src/content/docs/dropins/cart/[name]s.mdx

# Check content
head -50 src/content/docs/dropins/cart/[name]s.mdx

# Test with all drop-ins (if ready)
npm run generate-[name]-docs
```

### 10. Document

Update `scripts/README.md`:

```markdown
### [Name] Documentation Generator

Generates [name] documentation by scanning drop-in repositories.

\`\`\`bash
# Generate for all drop-ins
npm run generate-[name]-docs

# Generate for specific drop-in
npm run generate-[name]-docs cart
\`\`\`

**Output**: `src/content/docs/dropins/{dropin-name}/[name]s.mdx`

**Features**:
- Scans `[path]` for [items]
- Extracts [what is extracted]
- Supports enrichment data for [what can be enriched]
- Auto-updates sidebar navigation
```

### 11. Create PR

```bash
# Stage changes
git add scripts/@generate-[name]-docs.js
git add _dropin-templates/dropin-[name]s.mdx
git add scripts/lib/sidebar.js
git add scripts/lib/enrichment.js
git add scripts/README.md
git add package.json
git add _dropin-enrichments/

# Commit
git commit -m "feat: add [name] generator using shared framework

- Implement [name] documentation generator
- Add template for [name] docs
- Add sidebar and enrichment support
- Update documentation
- Uses shared generator framework (runGenerator)
- Follows established patterns from function/event generators

Reduces code by ~60% compared to old pattern
Generates: src/content/docs/dropins/{name}/[name]s.mdx"

# Push
git push origin feature/generator-[name]

# Create PR on GitHub
```

## Quick Reference

### Common Imports
```javascript
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';
import { loadEnrichmentData } from './lib/enrichment.js';
```

### Scanner Return Types
```javascript
// Option 1: Array (count is calculated automatically)
return items; // Array of items

// Option 2: Object with count (for complex data)
return {
    items: items,
    categories: categories,
    count: items.length  // Required for logging
};
```

### Common Replacements
```javascript
replacePlaceholders(template, {
    'DROPIN_NAME': repoConfig.displayName,        // "Cart"
    'DROPIN_PACKAGE': repoName,                   // "cart"
    'DROPIN_VERSION': cleanVersion(version),      // "1.5.1"
    'CONTENT_MARKER': generatedContent,           // Your content
    'REPO_URL': repoConfig.gitUrl.replace('.git', '')
});
```

### Sidebar Order
```
Overview
Installation
Initialization
Slots
Functions
Events
Containers
Dictionary
Styles
Troubleshooting
```

## Troubleshooting

### Generator not found
- Check branch: `git branch`
- Verify file exists in auto-doc-generators: `git ls-tree -r origin/auto-doc-generators | grep [name]`

### Template not rendering
- Check imports match components used
- Verify placeholders are correct case
- Check for syntax errors in MDX

### Sidebar not updating
- Verify function is exported from sidebar.js
- Check reference entry exists
- Run generator to see logs

### Enrichment not loading
- Check file path: `_dropin-enrichments/[dropin]/[type]s.json`
- Verify JSON syntax
- Check function is exported from enrichment.js

## Examples

See these for reference:
- `scripts/@generate-function-docs.js` - Function generator
- `scripts/@generate-event-docs.js` - Event generator
- `scripts/lib/REFACTORING-COMPLETE.md` - Complete refactoring details
- `scripts/lib/MIGRATION-PLAN.md` - Overall migration strategy

---

**Time Estimate:** 2-4 hours per generator

**Difficulty:** Low (if following pattern) → Medium (for complex generators)

**Support:** Refer to completed generators and framework documentation

