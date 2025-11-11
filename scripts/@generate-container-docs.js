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
 *
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-container.mdx
 * - Uses: Section text, imports, placeholders
 * - Generates independently: Configuration tables, slots content, usage examples
 *
 * IMPORTANT: Generates multiple files (one per container)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadContainerEnrichments } from './lib/enrichment.js';
import { updateSidebarForContainers } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion, toKebabCase, capitalize } from './lib/utils.js';
import { logger } from './lib/logger.js';

// Import Phase 2 shared libraries
import { extractPropsFromComponent } from './lib/react/props-extractor.js';
import { generatePropertyDescription } from './lib/description-generator.js';
import { generatePropertyTable, generateSlotsTable } from './lib/markdown/table-generator.js';
import { generateReactExample } from './lib/markdown/example-generator.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================
// Note: Most extraction logic has been moved to shared Phase 2 libraries:
// - extractPropsFromComponent() - from lib/react/props-extractor.js
// - generatePropertyDescription() - from lib/description-generator.js

/**
 * Extract container information from a file
 * Uses shared props-extractor library
 */
function extractContainerInfo(filePath, containerName, repoPath) {
    try {
        // Use shared library to extract props and slots
        const { props, slots } = extractPropsFromComponent(
            filePath,
            containerName,
            repoPath,
            {
                includeSlots: false,  // We extract slots separately
                descriptionGenerator: generatePropertyDescription
            }
        );

        // Generate a basic description
        const description = `The ${containerName} container component for the drop-in.`;

        return {
            containerName,
            description,
            props,
            slots,
            count: 1 // For logging purposes
        };
    } catch (error) {
        logger.warn(`Error extracting container info from ${filePath}: ${error.message}`);
        return null;
    }
}

/**
 * Scan repository for containers
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of container information objects
 */
function scanForContainers(repoPath) {
    const containersDir = join(repoPath, 'src', 'containers');

    if (!existsSync(containersDir)) {
        return [];
    }

    const containers = [];

    try {
        const entries = readdirSync(containersDir);

        for (const entry of entries) {
            const entryPath = join(containersDir, entry);
            const stat = statSync(entryPath);

            if (stat.isDirectory()) {
                const tsxPath = join(entryPath, `${entry}.tsx`);
                if (existsSync(tsxPath)) {
                    const containerInfo = extractContainerInfo(tsxPath, entry, repoPath);
                    if (containerInfo) {
                        containers.push(containerInfo);
                    }
                }
            }
        }
    } catch (error) {
        logger.warn(`Error scanning containers: ${error.message}`);
    }

    return containers;
}

// ============================================================================
// UNIQUE GENERATION LOGIC
// ============================================================================
// Note: Most generation logic has been moved to shared Phase 2 libraries:
// - generatePropertyTable() - from lib/markdown/table-generator.js
// - generateSlotsTable() - from lib/markdown/table-generator.js
// - generateReactExample() - from lib/markdown/example-generator.js

/**
 * Generate slots content section
 * Uses shared table generator for slots table
 */
function generateSlotsContent(containerName, slots) {
    if (slots.length === 0) {
        return 'This container does not currently expose any customizable slots.';
    }

    // Add descriptions to slots for the table
    const slotsWithDescriptions = slots.map(slot => ({
        ...slot,
        description: `Custom slot for rendering ${slot.name.replace(/Slot$/, '').replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`
    }));

    let content = 'This container exposes the following slots for customization:\n\n';
    content += generateSlotsTable(slotsWithDescriptions);

    return content;
}

/**
 * Generate container MDX documentation
 * 
 * @param {string} repoName - Drop-in name
 * @param {Object} repoConfig - Repository configuration
 * @param {Array} containers - Array of container info objects
 * @param {string} version - Drop-in version
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {Map} Map of container names to MDX content
 */
function generateContainersMDX(repoName, repoConfig, containers, versionInfo, enrichmentData = null) {
    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    const template = readTemplate('dropin-container.mdx');

    // Validate template: Check if it contains TableWrapper around CONFIGURATIONS_TABLE
    // This would cause nested wrappers since generatePropertyTable() already adds them
    if (template.includes('<TableWrapper') && template.includes('CONFIGURATIONS_TABLE')) {
        const configSection = template.substring(
            template.indexOf('## Configuration'),
            template.indexOf('## Slots')
        );
        if (configSection.includes('<TableWrapper') && configSection.includes('CONFIGURATIONS_TABLE')) {
            logger.warn('⚠️  Template contains TableWrapper in Configuration section!');
            logger.warn('   This will cause nested wrappers. Remove wrapper from template.');
            logger.warn('   The generatePropertyTable() function already includes the wrapper.');
        }
    }

    const containerDocs = new Map();

    for (const containerInfo of containers) {
        const enrichment = enrichmentData?.[containerInfo.containerName] || null;

        // Build configurations table using shared library
        const configurationsTable = generatePropertyTable(containerInfo.props, {
            nowrapColumns: [0, 1],
            emptyMessage: 'No configurations'
        });

        // Build slots content
        const slotsContent = generateSlotsContent(containerInfo.containerName, containerInfo.slots);

        // Build usage example using shared library
        const usageExample = generateReactExample({
            componentName: containerInfo.containerName,
            packageName: repoConfig.packageName,
            props: containerInfo.props,
            selfClosing: true,
            maxProps: 3
        });

        // Use enriched description if available
        const description = enrichment?.description || containerInfo.description;

        // Replace placeholders
        const mdxContent = replacePlaceholders(template, {
            'DROPIN_NAME': repoConfig.displayName,
            'DROPIN_PACKAGE': repoConfig.packageName,
            'CONTAINER_NAME': containerInfo.containerName,
            'CONTAINER_DISPLAY_NAME': capitalize(containerInfo.containerName),
            'DROPIN_VERSION': cleanVersion(version),
            'CONTAINER_DESCRIPTION': description,
            'CONFIGURATIONS_TABLE': configurationsTable,
            'SLOTS_CONTENT': slotsContent,
            'USAGE_EXAMPLE': usageExample,
            'REPO_URL': repoConfig.gitUrl.replace('.git', '')
        });

        // Use kebab-case for file name
        const fileName = toKebabCase(containerInfo.containerName);
        containerDocs.set(fileName, mdxContent);
    }

    return containerDocs;
}

// ============================================================================
// CUSTOM WRITE HANDLER (Containers generate multiple files)
// ============================================================================

/**
 * Custom write handler for containers (generates multiple files)
 */
function writeContainerDocs(repoName, repoConfig, containerDocs, versionInfo) {
    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const outputDir = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, 'containers');

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    // Write each container file
    for (const [fileName, mdxContent] of containerDocs) {
        const outputPath = join(outputDir, `${fileName}.mdx`);
        writeFileSync(outputPath, mdxContent, 'utf8');

        const relativeUrl = `/${basePath}/${repoName}/containers/${fileName}`;
        logger.generated(outputPath, relativeUrl);
    }

    // Also generate overview page
    generateOverviewPage(repoName, repoConfig, containerDocs, version, outputDir, basePath);
}

/**
 * Generate containers overview page
 */
function generateOverviewPage(repoName, repoConfig, containerDocs, versionInfo, outputDir, basePath) {
    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    const overviewTemplate = readTemplate('container-overview.mdx');

    // Build list of containers
    let containersList = '';
    for (const [fileName] of containerDocs) {
        const displayName = capitalize(fileName.replace(/-/g, ' '));
        containersList += `- [${displayName}](/${basePath}/${repoName}/containers/${fileName}/)\n`;
    }

    const overviewContent = replacePlaceholders(overviewTemplate, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_VERSION': cleanVersion(version),
        'CONTAINERS_LIST': containersList,
        'CONTAINER_COUNT': containerDocs.size.toString()
    });

    const overviewPath = join(outputDir, 'index.mdx');
    writeFileSync(overviewPath, overviewContent, 'utf8');

    const relativeUrl = `/${basePath}/${repoName}/containers/`;
    logger.generated(overviewPath, relativeUrl);
}

// ============================================================================
// FRAMEWORK INTEGRATION
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
