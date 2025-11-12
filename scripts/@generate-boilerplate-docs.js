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

// Import shared utilities
import { getProjectRoot } from './lib/generator-core.js';
import { ensureParentDirectoryExists, formatDate } from './lib/utils.js';
import { applyStandardTransforms } from './lib/content-transforms.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';
import { cloneOrUpdateBoilerplate } from './lib/repository.js';

const projectRoot = getProjectRoot();

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
            sidebarLabel: blockName.replace('commerce-', '').split('-').map(word =>
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
 * Generate overview page with table
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

import TableWrapper from '@components/TableWrapper.astro';

## Commerce Blocks

The boilerplate includes **${blocks.length} commerce blocks** that implement various e-commerce functionality using drop-in components.

<TableWrapper nowrap={[0]}>

| Block | Drop-ins |
|-------|----------|
`;

    // Add table rows for each block
    for (const block of blocks) {
        const sidebarLabel = block.sidebarLabel || block.displayName;
        const dropinList = block.analysis.dropins.length > 0
            ? block.analysis.dropins.join(', ')
            : 'None';

        content += `| [${sidebarLabel}](/boilerplate/blocks/${block.name}/) | ${dropinList} |\n`;
    }

    content += `
</TableWrapper>

## Additional Documentation

<TableWrapper nowrap={[0]}>

| Documentation | Description | Link |
|---------------|-------------|------|
| Project Structure | Learn about the boilerplate project structure and file organization. | [View structure docs](/boilerplate/structure/) |
| Build Process | Understand the build and deployment process for the boilerplate. | [View build docs](/boilerplate/build-process/) |
| Configuration | Learn about head configuration, importmaps, and initializers. | [View config docs](/boilerplate/configuration/) |

</TableWrapper>

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

    const sidebarLabel = block.sidebarLabel || block.displayName;
    let content = `---
title: ${block.displayName}
description: Documentation for the ${block.displayName} block in the AEM Commerce boilerplate.
sidebar:
  label: ${sidebarLabel}
---

import { Code } from '@astrojs/starlight/components';

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

import { FileTree } from '@astrojs/starlight/components';

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

import { Steps } from '@astrojs/starlight/components';

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

import { Code } from '@astrojs/starlight/components';

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
 * Generate commerce blocks and drop-ins mapping page
 */
function generateCommerceBlocksMapping(blocks, outputPath) {
    console.log('\n📝 Generating commerce blocks and drop-ins mapping...');

    // Create reverse mapping: drop-in -> blocks that use it
    const dropinToBlocks = new Map();

    for (const block of blocks) {
        const sidebarLabel = block.sidebarLabel || block.displayName;

        for (const dropin of block.analysis.dropins) {
            // Skip 'tools' as it's a utility library, not a drop-in component
            if (dropin === 'tools') {
                continue;
            }

            if (!dropinToBlocks.has(dropin)) {
                dropinToBlocks.set(dropin, []);
            }
            dropinToBlocks.get(dropin).push(sidebarLabel);
        }
    }

    // Sort drop-ins alphabetically
    const sortedDropins = Array.from(dropinToBlocks.keys()).sort();

    let content = `---
title: Commerce blocks and drop-ins
description: Learn which drop-in components are used in the Commerce blocks from the AEM Commerce boilerplate.
sidebar:
  label: Commerce blocks
---

import TableWrapper from '@components/TableWrapper.astro';
import Aside from '@components/Aside.astro';

## Related documentation

- [Boilerplate Reference](/boilerplate/) - Complete reference for all Commerce blocks
- [Drop-in components](/dropins/all/introduction/) - Overview of all available drop-in components

The [AEM Commerce boilerplate](/boilerplate/) includes ${blocks.length} Commerce blocks that wrap drop-in components to provide ready-to-use e-commerce functionality. These blocks integrate drop-ins with AEM Edge Delivery Services, making it easy to add commerce features to your storefront without writing custom code.

## Drop-ins used in Commerce blocks

The following table shows which drop-in components are used by each Commerce block:

<TableWrapper nowrap={[0]}>

| Drop-in | Commerce blocks |
|---------|---------------------------|
`;

    for (const dropin of sortedDropins) {
        const blockList = dropinToBlocks.get(dropin).join(', ');
        content += `| **${dropin}** | ${blockList} |\n`;
    }

    content += `
</TableWrapper>

<Aside type="note">
The \`@dropins/tools\` package is a utility library required by all drop-in components, providing shared functionality like \`fetch-graphql\`, \`event-bus\`, and \`initializer\` utilities. It is not a drop-in component itself, but rather a dependency used by Commerce blocks that integrate drop-ins.
</Aside>
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

    // Clone/update boilerplate using shared function
    const { path: boilerplatePath } = cloneOrUpdateBoilerplate();

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

    // Generate commerce blocks and drop-ins mapping
    generateCommerceBlocksMapping(blocks, join(projectRoot, 'src', 'content', 'docs', 'dropins', 'all', 'commerce-blocks.mdx'));

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
    console.log(`✅ Commerce blocks mapping: 1`);
    console.log(`✅ Sidebar navigation: Updated`);
    console.log(`📄 Total: ${blocks.length + 5} pages`);

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
    console.log(`   📂 /dropins/all/`);
    console.log(`      📄 commerce-blocks.mdx`);

    console.log('\n✨ Boilerplate documentation generation complete!\n');

} catch (error) {
    console.error('\n❌ Error generating boilerplate documentation:');
    console.error(`   ${error.message}`);
    console.error(`\n${error.stack}`);
    process.exit(1);
}
