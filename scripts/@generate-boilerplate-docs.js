#!/usr/bin/env node

/**
 * Boilerplate Documentation Generator
 *
 * Generates comprehensive documentation for the AEM Commerce boilerplate by analyzing
 * the repository structure, blocks, and configuration files.
 *
 * Unlike other generators, this creates MULTIPLE documentation pages:
 * - Overview page with CardGrid of all blocks
 * - Individual documentation page for each commerce block (30+ pages)
 * - Project structure documentation
 * - Build process documentation  
 * - Configuration documentation
 *
 * USAGE:
 * - Generate all documentation: npm run generate-boilerplate-docs
 *
 * OUTPUT: Multiple MDX files in src/content/docs/boilerplate/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { execSync } from 'child_process';

// Import shared utilities
import { getProjectRoot } from './lib/generator-core.js';
import { ensureParentDirectoryExists, formatDate } from './lib/utils.js';
import { applyStandardTransforms } from './lib/content-transforms.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();

// ============================================================================
// REPOSITORY MANAGEMENT
// ============================================================================

/**
 * Clone or update the boilerplate repository
 */
function cloneBoilerplate() {
    const boilerplatePath = join(projectRoot, '.temp-repos', 'aem-boilerplate-commerce');

    console.log('\n📦 Cloning/updating AEM Commerce boilerplate...');

    if (!existsSync(boilerplatePath)) {
        console.log('  Cloning boilerplate repository...');
        execSync('git clone --depth 1 https://github.com/hlxsites/aem-boilerplate-commerce.git ' + boilerplatePath, { stdio: 'inherit' });
    } else {
        console.log('  Updating boilerplate repository...');
        execSync(`cd ${boilerplatePath} && git pull`, { stdio: 'inherit' });
    }

    return boilerplatePath;
}

/**
 * Map drop-in package name to documentation path
 * @param {string} packageName - Package name (e.g., 'storefront-cart', 'tools')
 * @returns {string|null} Documentation path (e.g., 'cart') or null if not found
 */
function getDropinDocPath(packageName) {
    // Handle 'tools' package - it doesn't have its own documentation page
    if (packageName === 'tools') {
        return null; // Skip linking to tools
    }

    // Find the drop-in config entry that matches this package name
    for (const [docPath, config] of Object.entries(DROPIN_REPOS)) {
        // Extract package name without @dropins/ prefix
        const configPackageName = config.packageName.replace('@dropins/', '');
        if (configPackageName === packageName) {
            return docPath;
        }
    }

    return null;
}

// ============================================================================
// CODE ANALYSIS
// ============================================================================

/**
 * Analyze JavaScript code to extract implementation details
 */
function analyzeBlockCode(jsPath) {
    const analysis = {
        dropins: [],
        containers: [],
        events: [],
        configOptions: [],
        apiCalls: []
    };

    if (!existsSync(jsPath)) {
        return analysis;
    }

    const code = readFileSync(jsPath, 'utf8');

    // Extract drop-in imports
    const dropinImportPattern = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]@dropins\/([\w-]+)(?:\/(.+?))?['"]/g;
    let match;
    while ((match = dropinImportPattern.exec(code)) !== null) {
        const dropin = match[1];
        if (!analysis.dropins.includes(dropin)) {
            analysis.dropins.push(dropin);
        }
    }

    // Extract container usage
    const containerPattern = /(\w+)\.render\s*\(/g;
    while ((match = containerPattern.exec(code)) !== null) {
        const container = match[1];
        if (!analysis.containers.includes(container)) {
            analysis.containers.push(container);
        }
    }

    // Extract event listeners
    const eventPattern = /events\.on\(['"]([^'"]+)['"]/g;
    while ((match = eventPattern.exec(code)) !== null) {
        const event = match[1];
        if (!analysis.events.includes(event)) {
            analysis.events.push(event);
        }
    }

    // Extract API function calls
    const apiCallPattern = /(?:api|pkg)\.(\w+)\s*\(/g;
    while ((match = apiCallPattern.exec(code)) !== null) {
        const apiCall = match[1];
        if (!analysis.apiCalls.includes(apiCall)) {
            analysis.apiCalls.push(apiCall);
        }
    }

    return analysis;
}

/**
 * Extract commerce blocks from the boilerplate
 */
function extractCommerceBlocks(boilerplatePath) {
    console.log('\n🔍 Analyzing commerce blocks...');

    const blocksDir = join(boilerplatePath, 'blocks');
    const blocks = [];

    if (!existsSync(blocksDir)) {
        console.log('  ⚠️  Blocks directory not found');
        return blocks;
    }

    const blockDirs = readdirSync(blocksDir).filter(name => {
        const path = join(blocksDir, name);
        return statSync(path).isDirectory();
    });

    for (const blockName of blockDirs) {
        const blockPath = join(blocksDir, blockName);
        const jsPath = join(blockPath, `${blockName}.js`);
        const cssPath = join(blockPath, `${blockName}.css`);

        // Only process commerce-related blocks
        if (!blockName.startsWith('commerce-') &&
            !blockName.includes('product') &&
            !blockName.includes('cart') &&
            !blockName.includes('checkout')) {
            continue;
        }

        const analysis = analyzeBlockCode(jsPath);

        blocks.push({
            name: blockName,
            displayName: blockName.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            path: blockPath,
            hasJs: existsSync(jsPath),
            hasCss: existsSync(cssPath),
            analysis
        });
    }

    console.log(`  ✓ Found ${blocks.length} commerce blocks`);
    return blocks;
}

/**
 * Extract initializers from scripts directory
 */
function extractInitializers(boilerplatePath) {
    console.log('\n🔍 Analyzing initializers...');

    const scriptsDir = join(boilerplatePath, 'scripts');
    const initializers = [];

    const initFiles = ['commerce.js', 'initializers.js'];

    for (const file of initFiles) {
        const filePath = join(scriptsDir, file);
        if (existsSync(filePath)) {
            initializers.push({
                name: file,
                path: filePath
            });
        }
    }

    console.log(`  ✓ Found ${initializers.length} initializer files`);
    return initializers;
}

// ============================================================================
// DOCUMENTATION GENERATION
// ============================================================================

/**
 * Map drop-in package name to documentation path
 * @param {string} packageName - Package name (e.g., 'storefront-cart', 'tools')
 * @returns {string|null} Documentation path (e.g., 'cart') or null if not found
 */
function getDropinDocPath(packageName) {
    // Handle 'tools' package - it doesn't have its own documentation page
    if (packageName === 'tools') {
        return null; // Skip linking to tools
    }
    
    // Find the drop-in config entry that matches this package name
    for (const [docPath, config] of Object.entries(DROPIN_REPOS)) {
        // Extract package name without @dropins/ prefix
        const configPackageName = config.packageName.replace('@dropins/', '');
        if (configPackageName === packageName) {
            return docPath;
        }
    }
    
    return null;
}

/**
 * Generate overview page with CardGrid
 */
function generateOverview(blocks, initializers, outputPath) {
    console.log('\n📝 Generating overview page...');

    const generationDate = formatDate(new Date());

    let content = `---
title: Boilerplate Reference
description: Complete reference for the AEM Commerce boilerplate project, including all commerce blocks and configuration.
sidebar:
  label: Overview
  order: 1
---

import { Card, CardGrid, Aside } from '@astrojs/starlight/components';

<Aside type="note">
Auto-generated on ${generationDate}. This documentation is generated from the [AEM Commerce boilerplate](https://github.com/hlxsites/aem-boilerplate-commerce) repository.
</Aside>

## Commerce Blocks

The boilerplate includes **${blocks.length} commerce blocks** that implement various e-commerce functionality using drop-in components.

<CardGrid>
`;

    // Add cards for each block
    for (const block of blocks) {
        const dropinList = block.analysis.dropins.length > 0
            ? block.analysis.dropins.join(', ')
            : 'None';

        content += `  <Card title="${block.displayName}" icon="seti:html">
    [View documentation](/boilerplate/blocks/${block.name}/)
    
    **Drop-ins**: ${dropinList}
  </Card>
`;
    }

    content += `</CardGrid>

## Additional Documentation

<CardGrid>
  <Card title="Project Structure" icon="seti:folder">
    Learn about the boilerplate project structure and file organization.
    
    [View structure docs](/boilerplate/structure/)
  </Card>
  <Card title="Build Process" icon="seti:config">
    Understand the build and deployment process for the boilerplate.
    
    [View build docs](/boilerplate/build-process/)
  </Card>
  <Card title="Configuration" icon="seti:json">
    Learn about head configuration, importmaps, and initializers.
    
    [View config docs](/boilerplate/configuration/)
  </Card>
</CardGrid>

## Quick Links

- [AEM Commerce Boilerplate Repository](https://github.com/hlxsites/aem-boilerplate-commerce)
- [Drop-in Components Documentation](/dropins/all/introduction/)
- [Edge Delivery Services Documentation](https://www.aem.live/docs/)
`;

    // Don't apply standard transforms to overview page - it's not a block doc
    // Standard transforms are designed for individual block documentation pages

    // Write file
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate documentation for individual blocks
 */
function generateBlockDocs(block, outputDir) {
    const generationDate = formatDate(new Date());

    let content = `---
title: ${block.displayName}
description: Documentation for the ${block.displayName} block in the AEM Commerce boilerplate.
sidebar:
  label: ${block.displayName}
---

import { Aside, Code } from '@astrojs/starlight/components';

<Aside type="note">
Auto-generated on ${generationDate}. This block is part of the [AEM Commerce boilerplate](https://github.com/hlxsites/aem-boilerplate-commerce).
</Aside>

## Overview

The **${block.displayName}** block provides commerce functionality using drop-in components.

`;

    // Add drop-ins section
    if (block.analysis.dropins.length > 0) {
        content += `## Drop-ins Used

This block uses the following drop-in components:

`;
        for (const dropin of block.analysis.dropins) {
            const docPath = getDropinDocPath(dropin);
            if (docPath) {
                content += `- [\`@dropins/${dropin}\`](/dropins/${docPath}/)\n`;
            } else {
                // For packages without documentation pages (like 'tools'), just show the package name
                content += `- \`@dropins/${dropin}\`\n`;
            }
        }
        content += '\n';
    }

    // Add containers section
    if (block.analysis.containers.length > 0) {
        content += `## Containers

The following containers are rendered:

`;
        for (const container of block.analysis.containers) {
            content += `- **${container}**\n`;
        }
        content += '\n';
    }

    // Add events section
    if (block.analysis.events.length > 0) {
        content += `## Events

This block listens to the following events:

`;
        for (const event of block.analysis.events) {
            content += `- \`${event}\`\n`;
        }
        content += '\n';
    }

    // Add API calls section
    if (block.analysis.apiCalls.length > 0) {
        content += `## API Functions

This block uses the following API functions:

`;
        for (const apiCall of block.analysis.apiCalls) {
            content += `- \`${apiCall}()\`\n`;
        }
        content += '\n';
    }

    content += `## Implementation

Block location: \`/blocks/${block.name}/\`

- **JavaScript**: ${block.hasJs ? '✓' : '✗'}
- **CSS**: ${block.hasCss ? '✓' : '✗'}

## Related Documentation

- [All Drop-ins](/dropins/all/introduction/)
- [Boilerplate Overview](/boilerplate/)
- [View source code](https://github.com/hlxsites/aem-boilerplate-commerce/tree/main/blocks/${block.name})
`;

    // Apply standard transforms
    content = applyStandardTransforms(content);

    // Write file
    const outputPath = join(outputDir, 'blocks', `${block.name}.mdx`);
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');
}

/**
 * Generate structure documentation
 */
function generateStructureDocs(boilerplatePath, outputPath) {
    console.log('\n📝 Generating project structure documentation...');

    const generationDate = formatDate(new Date());

    const content = `---
title: Project Structure
description: Understand the file and directory structure of the AEM Commerce boilerplate.
sidebar:
  label: Structure
  order: 2
---

import { Aside, FileTree } from '@astrojs/starlight/components';

<Aside type="note">
Auto-generated on ${generationDate}.
</Aside>

## Directory Structure

The AEM Commerce boilerplate follows the standard AEM Edge Delivery Services structure with commerce-specific additions:

<FileTree>
- blocks/ Commerce blocks
  - commerce-cart/
  - commerce-checkout/
  - product-details/
  - ...
- scripts/ JavaScript utilities
  - commerce.js Initializers
  - initializers.js Loader
- styles/ Global CSS
- head.html Site-wide head configuration
- fstab.yaml Content source configuration
</FileTree>

## Key Directories

### /blocks

Contains all UI blocks, including commerce-specific blocks that integrate with drop-in components.

### /scripts

Core JavaScript files for:
- Drop-in initialization
- Commerce configuration
- Event handling

### /styles

Global CSS and design tokens that can be customized for branding.

## Related Documentation

- [Configuration](/boilerplate/configuration/)
- [Build Process](/boilerplate/build-process/)
- [Commerce Blocks](/boilerplate/)
`;

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate build process documentation
 */
function generateBuildDocs(outputPath) {
    console.log('\n📝 Generating build process documentation...');

    const generationDate = formatDate(new Date());

    const content = `---
title: Build Process
description: Learn about the build and deployment process for the AEM Commerce boilerplate.
sidebar:
  label: Build Process
  order: 3
---

import { Aside, Steps } from '@astrojs/starlight/components';

<Aside type="note">
Auto-generated on ${generationDate}.
</Aside>

## Overview

The AEM Commerce boilerplate uses Edge Delivery Services' build system, which automatically handles:

- JavaScript and CSS optimization
- Asset delivery via CDN
- Server-side rendering
- Progressive enhancement

## Build Steps

<Steps>

1. **Code Push**
   
   Push code changes to your GitHub repository.

2. **Automatic Build**
   
   Edge Delivery Services detects changes and triggers a build.

3. **Optimization**
   
   - JavaScript is bundled and minified
   - CSS is optimized and purged
   - Assets are CDN-optimized

4. **Deployment**
   
   Changes are deployed to the Edge network within seconds.

</Steps>

## Development Workflow

1. Clone the boilerplate repository
2. Make changes locally
3. Test using \`aem up\` (local development server)
4. Commit and push to GitHub
5. Changes automatically deploy to preview URL

## Production Deployment

Production deployment requires:
- Repository connected to Adobe Experience Manager
- Custom domain configuration (optional)
- Performance monitoring setup

## Related Documentation

- [Project Structure](/boilerplate/structure/)
- [Configuration](/boilerplate/configuration/)
- [Edge Delivery Services Documentation](https://www.aem.live/docs/)
`;

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate configuration documentation
 */
function generateConfigDocs(initializers, outputPath) {
    console.log('\n📝 Generating configuration documentation...');

    const generationDate = formatDate(new Date());

    const content = `---
title: Configuration
description: Learn about configuration options for the AEM Commerce boilerplate.
sidebar:
  label: Configuration
  order: 4
---

import { Aside, Code } from '@astrojs/starlight/components';

<Aside type="note">
Auto-generated on ${generationDate}.
</Aside>

## Head Configuration

The \`head.html\` file contains:

- **Importmap**: Maps drop-in package names to CDN URLs
- **Meta tags**: SEO and social sharing metadata
- **Scripts**: Analytics, tracking, and initialization

### Importmap Example

\`\`\`html
<script type="importmap">
{
  "imports": {
    "@dropins/storefront-cart/": "/scripts/__dropins__/storefront-cart/",
    "@dropins/storefront-checkout/": "/scripts/__dropins__/storefront-checkout/",
    "@dropins/tools/": "/scripts/__dropins__/tools/"
  }
}
</script>
\`\`\`

## Initializers

Drop-ins are initialized in \`scripts/commerce.js\`:

${initializers.map(init => `- \`${init.name}\``).join('\n')}

### Initialization Pattern

Each drop-in follows this pattern:

1. Import tools and drop-in packages
2. Configure endpoint and headers
3. Register initializer
4. Mount drop-in

## Environment Variables

Configure your environment using:

- **GraphQL Endpoint**: Commerce backend URL
- **Store Code**: Multi-store configuration
- **API Keys**: Third-party integrations

## Related Documentation

- [Project Structure](/boilerplate/structure/)
- [Build Process](/boilerplate/build-process/)
- [Drop-in Installation](/dropins/cart/installation/)
`;

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Update sidebar navigation
 */
function updateSidebarNavigation(blocks) {
    console.log('\n📝 Updating sidebar navigation...');

    const configPath = join(projectRoot, 'astro.config.mjs');
    let config = readFileSync(configPath, 'utf8');

    // Find the boilerplate sidebar section
    const boilerplatePattern = /label:\s*['"]Boilerplate['"]\s*,\s*items:\s*\[[\s\S]*?\]/;

    const blockItems = blocks.map(block =>
        `{ label: '${block.displayName}', slug: 'boilerplate/blocks/${block.name}' }`
    ).join(',\n            ');

    const newBoilerplateSection = `label: 'Boilerplate',
        items: [
          { label: 'Overview', slug: 'boilerplate/index' },
          { label: 'Structure', slug: 'boilerplate/structure' },
          { label: 'Build Process', slug: 'boilerplate/build-process' },
          { label: 'Configuration', slug: 'boilerplate/configuration' },
          {
            label: 'Blocks',
            collapsed: true,
            items: [
              ${blockItems}
            ]
          }
        ]`;

    if (boilerplatePattern.test(config)) {
        config = config.replace(boilerplatePattern, newBoilerplateSection);
        writeFileSync(configPath, config, 'utf8');
        console.log('  ✅ Updated sidebar navigation');
    } else {
        console.log('  ⚠️  Could not find boilerplate section in sidebar');
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

try {
    console.log('\n' + '='.repeat(60));
    console.log('  AEM COMMERCE BOILERPLATE DOCUMENTATION GENERATOR');
    console.log('='.repeat(60));

    // Clone/update boilerplate
    const boilerplatePath = cloneBoilerplate();

    // Extract information
    const blocks = extractCommerceBlocks(boilerplatePath);
    const initializers = extractInitializers(boilerplatePath);

    // Generate documentation
    const outputDir = join(projectRoot, 'src', 'content', 'docs', 'boilerplate');

    // Ensure blocks directory exists
    ensureParentDirectoryExists(join(outputDir, 'blocks', 'placeholder.md'));

    // Generate overview
    generateOverview(blocks, initializers, join(outputDir, 'index.mdx'));

    // Generate block documentation
    console.log('\n📝 Generating block documentation...');
    let blockCount = 0;
    blocks.forEach(block => {
        generateBlockDocs(block, outputDir);
        blockCount++;
    });
    console.log(`  ✅ Generated ${blockCount} block docs`);

    // Generate additional documentation
    generateStructureDocs(boilerplatePath, join(outputDir, 'structure.mdx'));
    generateBuildDocs(join(outputDir, 'build-process.mdx'));
    generateConfigDocs(initializers, join(outputDir, 'configuration.mdx'));

    // Update sidebar
    updateSidebarNavigation(blocks);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Generation Summary:\n');
    console.log(`✅ Overview page: 1`);
    console.log(`✅ Commerce blocks: ${blocks.length}`);
    console.log(`✅ Structure docs: 1`);
    console.log(`✅ Build docs: 1`);
    console.log(`✅ Configuration docs: 1`);
    console.log(`✅ Sidebar navigation: Updated`);
    console.log(`📄 Total: ${blocks.length + 4} pages`);

    console.log('\n📝 Generated Documentation:\n');
    console.log(`   📂 /boilerplate/`);
    console.log(`      📄 index.mdx (Overview)`);
    console.log(`      📄 structure.mdx`);
    console.log(`      📄 build-process.mdx`);
    console.log(`      📄 configuration.mdx`);
    console.log(`      📂 blocks/`);
    blocks.forEach(block => {
        console.log(`         📄 ${block.name}.mdx`);
    });

    console.log('\n✨ Boilerplate documentation generation complete!\n');

} catch (error) {
    console.error('\n❌ Error generating boilerplate documentation:');
    console.error(`   ${error.message}`);
    console.error(`\n${error.stack}`);
    process.exit(1);
}
