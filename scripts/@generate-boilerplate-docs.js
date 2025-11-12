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
// REPOSITORY MANAGEMENT
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
 * Extract version from boilerplate package.json
 */
function extractBoilerplateVersion(boilerplatePath) {
    const packageJsonPath = join(boilerplatePath, 'package.json');

    if (!existsSync(packageJsonPath)) {
        console.warn('  ⚠️  package.json not found, using "latest" as version');
        return 'latest';
    }

    try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        // Use the boilerplate's own version field
        const version = packageJson.version || 'latest';
        return version;
    } catch (error) {
        console.warn('  ⚠️  Error reading package.json:', error.message);
        return 'latest';
    }
}

/**
 * Load template file
 */
function loadTemplate(templateName) {
    const templatePath = join(projectRoot, '_dropin-templates', templateName);

    if (!existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
    }

    return readFileSync(templatePath, 'utf8');
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
 * Generate overview page with table of blocks
 */
function generateOverview(blocks, initializers, boilerplateVersion, outputPath) {
    console.log('\n📝 Generating overview page...');

    // Load template
    let content = loadTemplate('boilerplate-overview.mdx');

    // Build table for commerce blocks
    let tableContent = '| Block | Drop-ins used |\n';
    tableContent += '|-------|---------------|\n';
    
    for (const block of blocks) {
        const blockLink = `[${block.displayName}](/boilerplate/blocks/${block.name}/)`;
        const dropinList = block.analysis.dropins.length > 0
            ? block.analysis.dropins.join(', ')
            : 'None';

        tableContent += `| ${blockLink} | ${dropinList} |\n`;
    }

    // Build initializers list
    let initializersList = '';
    if (initializers.length > 0) {
        for (const init of initializers) {
            initializersList += `- **${init.name}** - ${init.path}\n`;
        }
    } else {
        initializersList = '- No initializers found\n';
    }

    // Replace placeholders
    content = content
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/BLOCK_COUNT/g, blocks.length.toString())
        .replace(/COMMERCE_BLOCKS_TABLE/g, tableContent)
        .replace(/INITIALIZERS_LIST/g, initializersList);

    // Write file
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate documentation for individual blocks
 */
function generateBlockDocs(block, boilerplateVersion, outputDir) {
    // Load template
    let content = loadTemplate('boilerplate-block.mdx');

    // Build description
    const description = `The ${block.displayName} block provides commerce functionality for ${block.name.replace(/-/g, ' ')}.`;

    // Build files list
    let filesList = '**Files:**\n';
    if (block.hasJs) filesList += `- \`${block.name}.js\` - JavaScript decorator and drop-in integration\n`;
    if (block.hasCss) filesList += `- \`${block.name}.css\` - Block-specific styles\n`;

    // Build drop-in info section
    let dropinInfo = '';
    if (block.analysis.dropins.length > 0) {
        dropinInfo = '\n## Drop-ins Used\n\nThis block integrates the following drop-in components:\n\n';
        for (const dropin of block.analysis.dropins) {
            const docPath = getDropinDocPath(dropin);
            if (docPath) {
                dropinInfo += `- [\`@dropins/${dropin}\`](/dropins/${docPath}/) - Full documentation\n`;
            } else {
                dropinInfo += `- \`@dropins/${dropin}\`\n`;
            }
        }
    }

    // Build implementation details section
    let implementationDetails = '';
    if (block.analysis.containers.length > 0) {
        implementationDetails += '### Containers\n\nThe following containers are rendered:\n\n';
        for (const container of block.analysis.containers) {
            implementationDetails += `- **${container}**\n`;
        }
        implementationDetails += '\n';
    }

    // Build events section
    let eventsSection = '';
    if (block.analysis.events.length > 0) {
        eventsSection = '\n## Events\n\nThis block listens to the following events:\n\n';
        for (const event of block.analysis.events) {
            eventsSection += `- \`${event}\`\n`;
        }
    }

    // Build API calls section
    let apiCallsSection = '';
    if (block.analysis.apiCalls.length > 0) {
        apiCallsSection = '\n## API Functions\n\nThis block uses the following API functions:\n\n';
        for (const apiCall of block.analysis.apiCalls) {
            apiCallsSection += `- \`${apiCall}()\`\n`;
        }
    }

    // Config options - currently not extracted, leave placeholder
    const configOptions = '';

    // Replace placeholders
    content = content
        .replace(/BLOCK_DISPLAY_NAME/g, block.displayName)
        .replace(/BLOCK_NAME/g, block.name)
        .replace(/BLOCK_DESCRIPTION/g, description)
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/FILES_LIST/g, filesList)
        .replace(/DROP_IN_INFO/g, dropinInfo)
        .replace(/IMPLEMENTATION_DETAILS/g, implementationDetails)
        .replace(/CONFIG_OPTIONS/g, configOptions)
        .replace(/EVENTS_SECTION/g, eventsSection)
        .replace(/API_CALLS_SECTION/g, apiCallsSection);

    // Don't apply standard transforms for boilerplate docs - they're designed for drop-in docs
    // and add sections (like "Block Configuration") that don't apply to boilerplate blocks

    // Write file
    const outputPath = join(outputDir, 'blocks', `${block.name}.mdx`);
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');
}

/**
 * Generate structure documentation
 */
function generateStructureDocs(boilerplateVersion, outputPath) {
    console.log('\n📝 Generating project structure documentation...');

    // Load template
    let content = loadTemplate('boilerplate-structure.mdx');

    // Build file tree content
    const fileTreeContent = `<FileTree>
- blocks/ _-- Content and Commerce blocks_
  - commerce-cart/ _-- Cart block_
  - commerce-checkout/ _-- Checkout block_
  - product-details/ _-- PDP block_
  - product-list-page/ _-- PLP block_
  - ... _-- More commerce blocks_
- scripts/ _-- JavaScript files_
  - __dropins__/ _-- Imported drop-in components_
  - initializers/ _-- Drop-in initialization_
  - aem.js _-- AEM site functions_
  - commerce.js _-- Commerce functionality_
  - configs.js _-- Configuration functions_
  - scripts.js _-- Core AEM functionality_
- styles/ _-- CSS files_
  - fonts.css _-- Typography_
  - lazy-styles.css _-- Deferred styles_
  - styles.css _-- Global design tokens_
- tools/ _-- Commerce tooling_
  - picker/ _-- Commerce Picker_
  - sidekick/ _-- Sidekick config_
- head.html _-- Site-wide head configuration_
- package.json _-- Dependencies and scripts_
</FileTree>`;

    // Replace placeholders
    content = content
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/FILE_TREE_CONTENT/g, fileTreeContent);

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate build process documentation
 */
function generateBuildDocs(boilerplateVersion, outputPath) {
    console.log('\n📝 Generating build process documentation...');

    // Load template
    let content = loadTemplate('boilerplate-build-process.mdx');

    // Replace placeholders
    content = content
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/TOOLS_VERSION/g, boilerplateVersion); // Use same version

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate configuration documentation
 */
function generateConfigDocs(boilerplateVersion, outputPath) {
    console.log('\n📝 Generating configuration documentation...');

    // Load template
    let content = loadTemplate('boilerplate-configuration.mdx');

    // Replace placeholders
    content = content.replace(/BOILERPLATE_VERSION/g, boilerplateVersion);

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

    // Extract version
    const boilerplateVersion = extractBoilerplateVersion(boilerplatePath);
    console.log(`\n📦 Boilerplate version: ${boilerplateVersion}`);

    // Extract information
    const blocks = extractCommerceBlocks(boilerplatePath);
    const initializers = extractInitializers(boilerplatePath);

    // Generate documentation
    const outputDir = join(projectRoot, 'src', 'content', 'docs', 'boilerplate');

    // Ensure blocks directory exists
    ensureParentDirectoryExists(join(outputDir, 'blocks', 'placeholder.md'));

    // Generate overview
    generateOverview(blocks, initializers, boilerplateVersion, join(outputDir, 'index.mdx'));

    // Generate block documentation
    console.log('\n📝 Generating block documentation...');
    let blockCount = 0;
    blocks.forEach(block => {
        generateBlockDocs(block, boilerplateVersion, outputDir);
        blockCount++;
    });
    console.log(`  ✅ Generated ${blockCount} block docs`);

    // Generate additional documentation
    generateStructureDocs(boilerplateVersion, join(outputDir, 'structure.mdx'));
    generateBuildDocs(boilerplateVersion, join(outputDir, 'build-process.mdx'));
    generateConfigDocs(boilerplateVersion, join(outputDir, 'configuration.mdx'));

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
