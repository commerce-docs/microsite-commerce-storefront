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
import { cleanVersion, toKebabCase, capitalize, wrapCodeNames } from './lib/utils.js';
import { logger } from './lib/logger.js';

// Import Phase 2 shared libraries
import { extractPropsFromComponent } from './lib/react/props-extractor.js';
import { generatePropertyDescription } from './lib/description-generator.js';
import { generatePropertyTable, generateSlotsTable } from './lib/markdown/table-generator.js';
import { generateContainerExample } from './lib/markdown/example-generator.js';

const projectRoot = getProjectRoot();

// ============================================================================
// IMAGE DISCOVERY FOR CONTAINERS
// ============================================================================

// Supported image formats for container diagrams
const IMAGE_EXTENSIONS = ['.png', '.webp', '.jpg', '.jpeg'];

/**
 * Split long descriptions into two paragraphs for better readability
 * and wrap code names in backticks
 * 
 * @param {string} description - The description text
 * @returns {string} - Description split into 2 paragraphs if long enough, with code names in backticks
 */
function splitDescription(description) {
    if (!description) return '';

    // Wrap code names in backticks first
    const wrappedDescription = wrapCodeNames(description);

    // Split by sentences (periods followed by space or end of string)
    const sentences = wrappedDescription.match(/[^.!?]+[.!?]+/g) || [wrappedDescription];

    if (sentences.length <= 2) {
        // Short description, keep as is
        return wrappedDescription;
    }

    // Split roughly in half (first 2-3 sentences in first paragraph)
    const midPoint = Math.ceil(sentences.length / 2);
    const firstParagraph = sentences.slice(0, midPoint).join(' ').trim();
    const secondParagraph = sentences.slice(midPoint).join(' ').trim();

    return `${firstParagraph}\n\n${secondParagraph}`;
}

/**
 * Automatically discover image for a container
 * Convention: ContainerName -> container-name.{png,webp,jpg}
 * 
 * @param {string} containerName - PascalCase container name
 * @param {string} repoName - Drop-in repository name
 * @param {string} basePath - Base path (dropins or dropins-b2b)
 * @returns {string|null} - Image filename if found, null otherwise
 */
function findImageForContainer(containerName, repoName, basePath) {
    const imagesDir = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, 'images');

    if (!existsSync(imagesDir)) {
        return null;
    }

    // Get all files in images directory
    const files = readdirSync(imagesDir);

    // Convert container name to kebab-case
    const kebabName = toKebabCase(containerName);

    // Look for exact match: container-name.{ext}
    for (const ext of IMAGE_EXTENSIONS) {
        const expectedFileName = `${kebabName}${ext}`;
        if (files.includes(expectedFileName)) {
            return expectedFileName;
        }
    }

    return null;
}

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================
// Note: Most extraction logic has been moved to shared Phase 2 libraries:
// - extractPropsFromComponent() - from lib/react/props-extractor.js
// - generatePropertyDescription() - from lib/description-generator.js

/**
 * Extract description from JSDoc comment or component source
 */
function extractContainerDescription(filePath, containerName) {
    try {
        const content = readFileSync(filePath, 'utf8');

        // Try to find JSDoc comment above the main export
        const exportPattern = new RegExp(`/\\*\\*[\\s\\S]*?\\*/\\s*export\\s+(?:const|function)\\s+${containerName}`, 'g');
        const match = exportPattern.exec(content);

        if (match) {
            const jsdocMatch = match[0].match(/\/\*\*([\s\S]*?)\*\//);
            if (jsdocMatch) {
                const jsdocContent = jsdocMatch[1];
                // Extract first line that isn't @param, @returns, etc.
                const lines = jsdocContent.split('\n')
                    .map(line => line.replace(/^\s*\*\s?/, '').trim())
                    .filter(line => line && !line.startsWith('@'));

                if (lines.length > 0) {
                    return lines[0];
                }
            }
        }

        // Fallback: Try to find component description comment near the export
        const descriptionPattern = /\/\/\s*(.+?)\s*\n\s*export\s+/;
        const descMatch = descriptionPattern.exec(content);
        if (descMatch) {
            return descMatch[1].trim();
        }

        // Last resort: Return null to indicate no description available
        // This signals that enrichment data should be added
        return null;

    } catch (error) {
        return `Container for ${containerName}.`;
    }
}

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

        // Extract description from JSDoc or generate from component name
        const description = extractContainerDescription(filePath, containerName);

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
// - generateContainerExample() - from lib/markdown/example-generator.js

/**
 * Generate slots content section
 * Uses shared table generator for slots table
 */
function generateSlotsContent(containerName, slots) {
    if (slots.length === 0) {
        return 'This container does not expose any customizable slots.';
    }

    // Slots should already have descriptions from enrichment or be empty
    // Don't override them - just pass through as-is
    let content = 'This container exposes the following slots for customization:\n\n';
    content += generateSlotsTable(slots);

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
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';

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

        // Skip generation if enrichment specifies override_template
        if (enrichment?.override_template === true) {
            console.log(`  ⏭️  Skipping ${containerInfo.containerName} (override_template: true)`);
            continue;
        }

        // Auto-discover image for this container
        const imageName = findImageForContainer(containerInfo.containerName, repoName, basePath);
        const hasImage = imageName !== null;

        // Determine which columns should nowrap based on type length
        // If all types are short (≤20 chars), prevent wrapping on both name and type columns
        const hasOnlyShortTypes = containerInfo.props.every(prop => {
            if (!prop.type) return true;
            // Remove __LINK__ marker and extract display text from markdown links
            let cleanType = prop.type.replace('__LINK__', '');
            // Extract display text from markdown link: [`LangDefinitions`](#url) -> LangDefinitions
            const linkMatch = cleanType.match(/\[`([^`]+)`\]/);
            if (linkMatch) {
                cleanType = linkMatch[1]; // Extract just the text between backticks
            }
            return cleanType.length <= 20;
        });

        const nowrapColumns = hasOnlyShortTypes ? [0, 1] : [0];

        // Enrich props with descriptions from enrichment file
        const enrichedProps = containerInfo.props.map(prop => {
            const enrichedDesc = enrichment?.parameters?.[prop.name]?.description;
            return {
                ...prop,
                description: enrichedDesc || prop.description || ''
            };
        });

        // Build configurations table using shared library
        const configurationsTable = generatePropertyTable(enrichedProps, {
            nowrapColumns,
            emptyMessage: 'No configurations'
        });

        // Enrich slots with descriptions from enrichment file
        const enrichedSlots = containerInfo.slots.map(slot => {
            const enrichedDesc = enrichment?.slots?.[slot.name]?.description;
            return {
                ...slot,
                description: enrichedDesc || slot.description || ''
            };
        });

        // Build slots content
        const slotsContent = generateSlotsContent(containerInfo.containerName, enrichedSlots);

        // Build usage example using boilerplate provider.render() pattern
        const usageExample = generateContainerExample({
            componentName: containerInfo.containerName,
            packageName: repoConfig.packageName,
            props: enrichedProps, // Use enriched props for better examples
            maxProps: 3,
            includeSlots: enrichedSlots.length > 0
        });

        // Build complete example section if enrichment provides it
        let completeExample = '';
        if (enrichment?.completeExample) {
            const ce = enrichment.completeExample;
            completeExample = `\n## ${ce.title}\n\n`;
            if (ce.intro) {
                completeExample += `${ce.intro}\n\n`;
            }
            completeExample += `${ce.code}\n\n`;
            if (ce.keyPoints && ce.keyPoints.length > 0) {
                completeExample += `### Key patterns demonstrated\n\n`;
                ce.keyPoints.forEach((point, index) => {
                    completeExample += `${index + 1}. ${point}\n`;
                });
                completeExample += `\n`;
            }
        }

        // Use enriched description if available
        const description = enrichment?.description || containerInfo.description;

        // Build image section if image exists
        const diagramImport = hasImage ? "import Diagram from '@components/Diagram.astro';\n" : '';
        const imageSection = hasImage
            ? `\n<Diagram caption="${containerInfo.containerName} container">\n  ![${containerInfo.containerName} container](../images/${imageName})\n</Diagram>\n`
            : '';

        // Replace placeholders
        let mdxContent = replacePlaceholders(template, {
            'DROPIN_NAME': repoConfig.displayName,
            'DROPIN_PACKAGE': repoConfig.packageName,
            'CONTAINER_NAME': containerInfo.containerName,
            'CONTAINER_DISPLAY_NAME': capitalize(containerInfo.containerName),
            'DROPIN_VERSION': cleanVersion(version),
            'CONTAINER_DESCRIPTION': splitDescription(description),
            'CONFIGURATIONS_TABLE': configurationsTable,
            'SLOTS_CONTENT': slotsContent,
            'USAGE_EXAMPLE': usageExample,
            'COMPLETE_EXAMPLE': completeExample,
            'REPO_URL': repoConfig.gitUrl.replace('.git', '')
        });

        // Add Diagram import after other imports if image exists
        if (hasImage) {
            mdxContent = mdxContent.replace(
                /(import.*from '@astrojs\/starlight\/components';)/,
                `$1\n${diagramImport}`
            );
        }

        // Add image section after container description (after the description line, before version badge)
        if (hasImage) {
            // Insert after description line and before the version badge div
            mdxContent = mdxContent.replace(
                /(^## Overview\n\n[\s\S]*?\n)(\n<div style="background-color)/m,
                `$1${imageSection}$2`
            );
        }

        // Remove navigational sections for B2B drop-ins (only contain internal links unless external links are present)
        // Matches: "## Next steps", "## Related", "## See also", "## Learn more"
        // Check both repo-level B2B and container-level b2b flag
        if (repoConfig.type === 'B2B' || enrichment?.b2b === true) {
            mdxContent = mdxContent.replace(/^## (Next steps|Related|See also|Learn more)\n\n[\s\S]*?(?=\n## |\{\/\*|$)/gm, '');
        }

        // Use kebab-case for file name
        const fileName = toKebabCase(containerInfo.containerName);

        // Store container with b2b flag for path determination during write
        containerDocs.set(fileName, {
            content: mdxContent,
            isB2B: enrichment?.b2b === true
        });
    }

    // Return both the docs and the original data for overview generation
    return {
        containerDocs,
        containersArray: containers,
        enrichmentData
    };
}

// ============================================================================
// CUSTOM WRITE HANDLER (Containers generate multiple files)
// ============================================================================

/**
 * Custom write handler for containers (generates multiple files)
 */
function writeContainerDocs(repoName, repoConfig, containerDocsData, versionInfo) {
    // containerDocsData includes: containerDocs Map, containersArray, enrichmentData
    const { containerDocs, containersArray, enrichmentData } = containerDocsData;

    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    const defaultBasePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';

    // Write each container file (may go to different directories for B2B containers)
    for (const [fileName, containerData] of containerDocs) {
        // Determine output path based on container-level b2b flag
        const basePath = containerData.isB2B ? 'dropins-b2b' : defaultBasePath;
        const outputDir = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, 'containers');

        // Ensure output directory exists
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = join(outputDir, `${fileName}.mdx`);
        writeFileSync(outputPath, containerData.content, 'utf8');

        const relativeUrl = `/${basePath}/${repoName}/containers/${fileName}`;
        logger.generated(outputPath, relativeUrl);
    }

    // Also generate overview page (pass containers array and enrichment for descriptions)
    // Use default base path for overview (B2C containers overview)
    const outputDir = join(projectRoot, 'src', 'content', 'docs', defaultBasePath, repoName, 'containers');
    generateOverviewPage(repoName, repoConfig, containerDocs, containersArray, enrichmentData, version, outputDir, defaultBasePath);
}

/**
 * Generate containers overview page
 */
function generateOverviewPage(repoName, repoConfig, containerDocs, containersArray, enrichmentData, versionInfo, outputDir, basePath) {
    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    const overviewTemplate = readTemplate('container-overview.mdx');

    // Build table of containers with descriptions
    // Use containersArray instead of containerDocs to include all containers (even those with override_template)
    // Filter out B2B containers (they have their own overview in dropins-b2b)
    let containersTable = '| Container | Description |\n';
    containersTable += '| --------- | ----------- |\n';

    for (const containerInfo of containersArray) {
        const fileName = toKebabCase(containerInfo.containerName);
        const displayName = containerInfo.containerName; // Use actual PascalCase name

        // Get description from enrichment or fallback to scanned description
        const enrichment = enrichmentData?.[containerInfo.containerName];

        // Skip B2B containers in B2C overview
        if (enrichment?.b2b === true) {
            continue;
        }

        let description = enrichment?.description || containerInfo.description;

        // If no description available, indicate enrichment is needed
        if (!description) {
            description = '*Enrichment needed - add description to `_dropin-enrichments/' + repoName + '/containers.json`*';
        } else {
            // Remove "The ContainerName container" prefix if present
            description = description.replace(/^The\s+\w+\s+container\s+/i, '');

            // Capitalize first letter after removing prefix
            description = description.charAt(0).toUpperCase() + description.slice(1);

            // Use full first sentence, aim for ~150 chars but don't truncate mid-sentence
            const firstSentence = description.split(/\.\s+/)[0];
            description = firstSentence.endsWith('.') ? firstSentence : firstSentence + '.';

            // Wrap code names in backticks
            description = wrapCodeNames(description);
        }

        containersTable += `| [${displayName}](/${basePath}/${repoName}/containers/${fileName}/) | ${description} |\n`;
    }

    const overviewContent = replacePlaceholders(overviewTemplate, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_VERSION': cleanVersion(version),
        'CONTAINERS_LIST': containersTable
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
