# Concrete Migration Example: Containers Generator

## Overview

This document shows a real before/after comparison for migrating the containers generator.

## Current State (auto-doc-generators branch)

**File**: `scripts/@generate-container-docs.js`
**Lines**: 759 lines
**Structure**: Monolithic with duplicated infrastructure

### Current Structure Analysis

```
Lines 1-108:    Imports, setup, DROPIN_REPOS config (DUPLICATED)
Lines 111-128:  cloneOrUpdateRepo() (DUPLICATED)
Lines 129-237:  extractJSDocDescription() - UNIQUE LOGIC ✅
Lines 240-330:  parsePropsInterface() - UNIQUE LOGIC ✅
Lines 333-381:  extractSlotsFromInterface() - UNIQUE LOGIC ✅
Lines 384-433:  findPropsInTypeFiles() - UNIQUE LOGIC ✅
Lines 436-548:  extractContainerInfo() - UNIQUE LOGIC ✅
Lines 551-585:  scanContainers() - UNIQUE LOGIC ✅
Lines 588-600:  sanitizeForMarkdown() - UNIQUE LOGIC ✅
Lines 603-623:  generateConfigurationsTable() - UNIQUE LOGIC ✅
Lines 626-653:  generateSlotsContent() - UNIQUE LOGIC ✅
Lines 656-678:  generateUsageExample() - UNIQUE LOGIC ✅
Lines 681-744:  generateContainerMDX() - UNIQUE LOGIC ✅
Lines 747-759:  main() function (DUPLICATED INFRASTRUCTURE)
```

**Analysis:**
- Infrastructure (duplicated): ~150 lines (20%)
- Unique scanning logic: ~400 lines (53%)
- Unique generation logic: ~200 lines (27%)

## Migrated State (Framework-based)

**File**: `scripts/@generate-container-docs.js`
**Estimated Lines**: ~600 lines (79% of original)
**Structure**: Lean, focused on unique logic

### Migrated Structure

```javascript
#!/usr/bin/env node

/**
 * Container Documentation Generator
 * 
 * This script generates container documentation for drop-in components by:
 * 1. Scanning src/containers directories for .tsx files
 * 2. Extracting Props interfaces (including from external type files)
 * 3. Parsing JSDoc comments for property descriptions
 * 4. Generating comprehensive container documentation
 * 
 * USAGE:
 * - Generate all drop-ins: npm run generate-container-docs
 * - Generate single drop-in: npm run generate-container-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, company-management
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadContainerEnrichments } from './lib/enrichment.js';
import { updateSidebarForContainers } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion, capitalize } from './lib/utils.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC (Lines ~30-430 = 400 lines)
// ============================================================================

/**
 * Extract JSDoc description from TypeScript interface
 */
function extractJSDocDescription(text, propertyName) {
    // [Keep existing implementation - ~100 lines]
    // This is UNIQUE logic for parsing JSDoc comments
}

/**
 * Generate property description if none exists
 */
function generatePropertyDescription(propertyName, propertyType) {
    // [Keep existing implementation - ~70 lines]
    // This is UNIQUE logic for generating descriptions
}

/**
 * Parse Props interface to extract properties
 */
function parsePropsInterface(interfaceContent, fullText) {
    // [Keep existing implementation - ~90 lines]
    // This is UNIQUE logic for parsing TypeScript interfaces
}

/**
 * Extract slots from Props interface
 */
function extractSlotsFromInterface(interfaceContent) {
    // [Keep existing implementation - ~50 lines]
    // This is UNIQUE logic for extracting slots
}

/**
 * Find Props in external type files
 */
function findPropsInTypeFiles(repoPath, containerName) {
    // [Keep existing implementation - ~50 lines]
    // This is UNIQUE logic for finding type files
}

/**
 * Extract container information from a file
 */
function extractContainerInfo(filePath, containerName, repoPath) {
    // [Keep existing implementation - ~110 lines]
    // This is UNIQUE logic for extracting container info
}

/**
 * Scan repository for containers
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of container information objects with count property
 */
function scanForContainers(repoPath) {
    const containersPath = join(repoPath, 'src', 'containers');
    
    if (!existsSync(containersPath)) {
        return [];
    }

    const containers = [];
    const entries = readdirSync(containersPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const containerPath = join(containersPath, entry.name);
            const files = readdirSync(containerPath).filter(f => f.endsWith('.tsx'));
            
            for (const file of files) {
                const filePath = join(containerPath, file);
                const containerName = file.replace('.tsx', '');
                const info = extractContainerInfo(filePath, containerName, repoPath);
                
                if (info) {
                    containers.push(info);
                }
            }
        }
    }

    return containers;
}

// ============================================================================
// UNIQUE GENERATION LOGIC (Lines ~430-630 = 200 lines)
// ============================================================================

/**
 * Sanitize text for markdown output
 */
function sanitizeForMarkdown(text) {
    // [Keep existing implementation - ~15 lines]
}

/**
 * Generate configurations table
 */
function generateConfigurationsTable(configurations) {
    // [Keep existing implementation - ~20 lines]
}

/**
 * Generate slots content
 */
function generateSlotsContent(containerName, slots) {
    // [Keep existing implementation - ~30 lines]
}

/**
 * Generate usage example
 */
function generateUsageExample(containerName, configurations, repoConfig) {
    // [Keep existing implementation - ~25 lines]
}

/**
 * Generate container MDX documentation
 * 
 * @param {string} repoName - Drop-in name
 * @param {Object} repoConfig - Repository configuration
 * @param {Array} containers - Array of container info
 * @param {string} version - Drop-in version
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {Object} Map of container names to MDX content
 */
function generateContainersMDX(repoName, repoConfig, containers, version, enrichmentData = null) {
    const template = readTemplate('dropin-container.mdx');
    const containerDocs = new Map();

    for (const containerInfo of containers) {
        const enrichment = enrichmentData?.[containerInfo.name] || null;

        // Build configurations table
        const configurationsTable = generateConfigurationsTable(containerInfo.props);

        // Build slots content
        const slotsContent = generateSlotsContent(containerInfo.name, containerInfo.slots);

        // Build usage example
        const usageExample = generateUsageExample(
            containerInfo.name,
            containerInfo.props,
            repoConfig
        );

        // Replace placeholders
        const mdxContent = replacePlaceholders(template, {
            'DROPIN_NAME': repoConfig.displayName,
            'CONTAINER_NAME': containerInfo.name,
            'CONTAINER_DISPLAY_NAME': capitalize(containerInfo.name),
            'DROPIN_VERSION': cleanVersion(version),
            'CONTAINER_DESCRIPTION': enrichment?.description || containerInfo.description,
            'CONFIGURATIONS_TABLE': configurationsTable,
            'SLOTS_CONTENT': slotsContent,
            'USAGE_EXAMPLE': usageExample,
            'REPO_URL': repoConfig.gitUrl.replace('.git', '')
        });

        containerDocs.set(containerInfo.name, mdxContent);
    }

    return containerDocs;
}

// ============================================================================
// CUSTOM WRITE HANDLER (Containers need multiple files)
// ============================================================================

/**
 * Custom write handler for containers (generates multiple files)
 */
function writeContainerDocs(repoName, repoConfig, containerDocs) {
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const outputDir = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, 'containers');

    for (const [containerName, mdxContent] of containerDocs) {
        const outputPath = join(outputDir, `${containerName}.mdx`);
        ensureParentDirectoryExists(outputPath);
        writeFileSync(outputPath, mdxContent, 'utf8');
        
        const relativeUrl = `/${basePath}/${repoName}/containers/${containerName}`;
        console.log(`  ✅ Generated ${outputPath}`);
        console.log(`  📄 View at: ${relativeUrl}`);
    }
}

// ============================================================================
// FRAMEWORK INTEGRATION (~10 lines - THAT'S IT!)
// ============================================================================

runGenerator({
    name: 'Container',
    itemType: 'containers',
    loadEnrichments: loadContainerEnrichments,
    scanRepo: scanForContainers,
    generateContent: generateContainersMDX,
    updateSidebar: updateSidebarForContainers,
    // Custom write handler since containers generate multiple files
    writeOutput: writeContainerDocs,
    outputFileName: null  // Not used with custom write handler
});
```

## Key Differences

### What Was REMOVED (150 lines)
```javascript
// ❌ REMOVED: Duplicated DROPIN_REPOS config
const DROPIN_REPOS = { /* 80 lines */ };

// ❌ REMOVED: Duplicated clone function
function cloneOrUpdateRepo(repoUrl, targetPath) { /* 20 lines */ }

// ❌ REMOVED: Duplicated main() function
async function main() {
    // Parse CLI args
    // Setup boilerplate
    // Get versions
    // Loop through dropins
    // Clone repos
    // Call scan
    // Call generate
    // Write files
    // Update sidebar
    /* 50+ lines */
}
```

### What Was ADDED (35 lines)
```javascript
// ✅ ADDED: Shared utility imports
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadContainerEnrichments } from './lib/enrichment.js';
import { updateSidebarForContainers } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion, capitalize } from './lib/utils.js';

// ✅ ADDED: Custom write handler (containers need multiple files)
function writeContainerDocs(repoName, repoConfig, containerDocs) {
    // ~20 lines
}

// ✅ ADDED: Framework integration
runGenerator({
    name: 'Container',
    itemType: 'containers',
    loadEnrichments: loadContainerEnrichments,
    scanRepo: scanForContainers,
    generateContent: generateContainersMDX,
    updateSidebar: updateSidebarForContainers,
    writeOutput: writeContainerDocs,
    outputFileName: null
});
```

### What Was KEPT (600 lines)
- ✅ All unique scanning logic
- ✅ All unique generation logic
- ✅ All TypeScript parsing logic
- ✅ All JSDoc extraction logic
- ✅ All markdown generation logic

## Benefits

### Code Reduction
- **Before**: 759 lines
- **After**: ~600 lines
- **Reduction**: 159 lines (-21%)
- **Infrastructure**: 0% (was 20%)

### Consistency
- ✅ Uses same CLI as other generators
- ✅ Uses same logging as other generators
- ✅ Uses same error handling as other generators
- ✅ Uses same enrichment system as other generators

### Maintainability
- ✅ Fix framework bugs once, all generators benefit
- ✅ Add framework features once, all generators can use
- ✅ Clear separation of concerns
- ✅ Easy to test and debug

## Special Considerations for Containers

### Multiple Files Output

The containers generator is unique because it generates **multiple files** (one per container) instead of a single file. The framework supports this through a custom `writeOutput` handler:

```javascript
runGenerator({
    // ... other options
    writeOutput: writeContainerDocs,  // Custom handler
    outputFileName: null               // Not used
});
```

### Sidebar Updates

Containers should appear in a specific order in the sidebar. Update `lib/sidebar.js`:

```javascript
export function updateSidebarForContainers(dropinName, repoConfig) {
    // Containers go after Events
    return insertSidebarEntry(dropinName, repoConfig, 'Containers', 'Events');
}
```

### Template Updates

The container template needs to support multiple placeholders for container-specific content:

```mdx
---
title: DROPIN_NAME - CONTAINER_DISPLAY_NAME Container
description: CONTAINER_DESCRIPTION
sidebar:
  label: CONTAINER_DISPLAY_NAME
  order: auto
---

## Configurations

CONFIGURATIONS_TABLE

## Slots

SLOTS_CONTENT

## Usage

USAGE_EXAMPLE
```

## Migration Checklist

For containers generator specifically:

- [ ] Create branch: `feature/generator-containers`
- [ ] Copy generator from auto-doc-generators
- [ ] Add shared utility imports
- [ ] Remove DROPIN_REPOS (use shared config)
- [ ] Remove cloneOrUpdateRepo (use repository.js)
- [ ] Remove main() function (use runGenerator)
- [ ] Update generateContainersMDX to use readTemplate() and replacePlaceholders()
- [ ] Add custom writeContainerDocs() handler
- [ ] Add updateSidebarForContainers() to lib/sidebar.js
- [ ] Add loadContainerEnrichments() to lib/enrichment.js
- [ ] Update template with consistent placeholders
- [ ] Test with cart drop-in
- [ ] Test with all drop-ins
- [ ] Update scripts/README.md
- [ ] Create PR

## Estimated Time

- **Reading and understanding**: 30 minutes
- **Code refactoring**: 1-2 hours
- **Template updates**: 30 minutes
- **Testing**: 30 minutes
- **Documentation**: 30 minutes
- **Total**: 3-4 hours

## Expected Results

- 21% code reduction
- 100% infrastructure extraction
- Full framework consistency
- Easy to maintain
- Ready for enrichments
- Professional implementation

---

**This is a realistic example of what migration looks like!**

The containers generator is one of the more complex ones (759 lines) but even it benefits significantly from the framework. Simpler generators will have even higher reduction percentages!

