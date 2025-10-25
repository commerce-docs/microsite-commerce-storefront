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

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================

/**
 * Extract JSDoc description from a comment block
 */
function extractJSDocDescription(text, propertyName) {
    // Find the property position first
    const propIndex = text.indexOf(propertyName);
    if (propIndex === -1) return '';

    // Look backwards from the property for the closest JSDoc comment (within 500 chars)
    const searchStart = Math.max(0, propIndex - 500);
    const searchText = text.substring(searchStart, propIndex);

    // Find the last JSDoc comment before the property
    const jsDocPattern = /\/\*\*([\s\S]*?)\*\//g;
    let lastMatch = null;
    let match;

    while ((match = jsDocPattern.exec(searchText)) !== null) {
        lastMatch = match;
    }

    if (lastMatch) {
        // Clean up JSDoc comment
        const comment = lastMatch[1]
            .split('\n')
            .map(line => {
                // Remove leading * and whitespace
                return line.replace(/^\s*\*\s?/, '').trim();
            })
            .filter(line => {
                // Remove JSDoc tags like @param, @returns, etc.
                return line && !line.startsWith('@');
            })
            .join(' ')
            .trim();

        return comment || '';
    }

    return '';
}

/**
 * Generate a description for a property based on its name and type
 */
function generatePropertyDescription(propertyName, propertyType) {
    // Common prop patterns
    if (propertyName === 'className') {
        return 'Additional CSS classes to apply to the container';
    }
    if (propertyName === 'children') {
        return 'Child elements to render within the container';
    }
    if (propertyName === 'testId') {
        return 'Test ID for automated testing';
    }

    // Action handlers
    if (propertyName.startsWith('on')) {
        const action = propertyName.substring(2);
        return `Callback function triggered when ${action.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
    }

    // Boolean flags
    if (propertyType.includes('boolean')) {
        if (propertyName.startsWith('is')) {
            const state = propertyName.substring(2);
            return `Whether the ${state.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} state is active`;
        }
        if (propertyName.startsWith('show')) {
            const element = propertyName.substring(4);
            return `Controls visibility of ${element.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
        }
        if (propertyName.startsWith('enable')) {
            const feature = propertyName.substring(6);
            return `Enables or disables ${feature.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
        }
    }

    // Text/content props
    if (propertyType.includes('string')) {
        if (propertyName.endsWith('Text')) {
            const context = propertyName.replace(/Text$/, '');
            return `Text content for ${context.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
        }
        if (propertyName.endsWith('Label')) {
            const context = propertyName.replace(/Label$/, '');
            return `Label text for ${context.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
        }
        if (propertyName.endsWith('Placeholder')) {
            const context = propertyName.replace(/Placeholder$/, '');
            return `Placeholder text for ${context.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
        }
    }

    // URL/link props
    if (propertyName.endsWith('Url') || propertyName.endsWith('Href')) {
        const context = propertyName.replace(/(Url|Href)$/, '');
        return `URL for ${context.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
    }

    // Data props
    if (propertyName.endsWith('Data')) {
        const context = propertyName.replace(/Data$/, '');
        return `Data object for ${context.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
    }

    // Configuration props
    if (propertyName.endsWith('Config')) {
        const context = propertyName.replace(/Config$/, '');
        return `Configuration options for ${context.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
    }

    // Options/items props
    if (propertyName.endsWith('Options') || propertyName.endsWith('Items')) {
        const context = propertyName.replace(/(Options|Items)$/, '');
        return `Available options for ${context.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
    }

    // Generic fallback
    const readable = propertyName
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();

    return `Configuration for ${readable}`;
}

/**
 * Parse Props interface to extract properties
 */
function parsePropsInterface(interfaceContent, fullText) {
    const props = [];

    // Match property definitions (property: type, property?: type, property?: type | null)
    const propertyPattern = /(\w+)\??\s*:\s*([^;,]+)/g;
    let match;

    while ((match = propertyPattern.exec(interfaceContent)) !== null) {
        const propertyName = match[1];
        const propertyType = match[2].trim();

        // Skip slots (we handle those separately)
        if (propertyName.toLowerCase().includes('slot')) {
            continue;
        }

        // Check if property is required (no ? after name)
        const required = !interfaceContent.includes(`${propertyName}?`);

        // Try to get JSDoc description
        let description = extractJSDocDescription(fullText, propertyName);

        // If no JSDoc, generate a description
        if (!description) {
            description = generatePropertyDescription(propertyName, propertyType);
        }

        props.push({
            name: propertyName,
            type: propertyType,
            required,
            description
        });
    }

    return props;
}

/**
 * Extract slots from Props interface
 */
function extractSlotsFromInterface(interfaceContent) {
    const slots = [];

    // Match slot definitions (property containing "Slot" in name)
    const slotPattern = /(\w*[Ss]lot\w*)\??\s*:\s*([^;,]+)/g;
    let match;

    while ((match = slotPattern.exec(interfaceContent)) !== null) {
        const slotName = match[1];
        const slotType = match[2].trim();

        // Check if slot is required
        const required = !interfaceContent.includes(`${slotName}?`);

        slots.push({
            name: slotName,
            type: slotType,
            required
        });
    }

    return slots;
}

/**
 * Find Props interface in external type files
 */
function findPropsInTypeFiles(repoPath, containerName) {
    const possiblePaths = [
        join(repoPath, 'src', 'containers', containerName, 'types.ts'),
        join(repoPath, 'src', 'containers', containerName, `${containerName}.types.ts`),
        join(repoPath, 'src', 'types', 'containers.ts'),
        join(repoPath, 'src', 'types', `${containerName}.ts`)
    ];

    for (const path of possiblePaths) {
        if (existsSync(path)) {
            const content = readFileSync(path, 'utf8');
            const propsInterfaceMatch = content.match(/export interface \w*Props\s*{([^}]+)}/);
            if (propsInterfaceMatch) {
                return { content: propsInterfaceMatch[1], fullText: content };
            }
        }
    }

    return null;
}

/**
 * Extract container information from a file
 */
function extractContainerInfo(filePath, containerName, repoPath) {
    try {
        const content = readFileSync(filePath, 'utf8');

        // Try to find Props interface in the same file
        let propsInterfaceContent = '';
        let fullText = content;

        const propsInterfaceMatch = content.match(/interface \w*Props\s*{([^}]+)}/);
        if (propsInterfaceMatch) {
            propsInterfaceContent = propsInterfaceMatch[1];
        } else {
            // Look in external type files
            const externalProps = findPropsInTypeFiles(repoPath, containerName);
            if (externalProps) {
                propsInterfaceContent = externalProps.content;
                fullText = externalProps.fullText;
            }
        }

        // Parse props and slots
        const props = propsInterfaceContent ? parsePropsInterface(propsInterfaceContent, fullText) : [];
        const slots = propsInterfaceContent ? extractSlotsFromInterface(propsInterfaceContent) : [];

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

/**
 * Sanitize text for markdown table cells
 */
function sanitizeForMarkdown(text) {
    return text
        .replace(/\n/g, ' ')           // Remove line breaks
        .replace(/\r/g, '')            // Remove carriage returns
        .replace(/\|/g, '\\|')         // Escape pipes
        .replace(/\*/g, '\\*')         // Escape asterisks
        .replace(/\[/g, '\\[')         // Escape brackets
        .replace(/\]/g, '\\]')         // Escape brackets
        .replace(/\s+/g, ' ')          // Collapse multiple spaces
        .trim();
}

/**
 * Generate configurations table
 */
function generateConfigurationsTable(configurations) {
    if (configurations.length === 0) {
        return '| No configurations | - | - | - |';
    }

    return configurations.map(prop => {
        const required = prop.required ? 'Yes' : 'No';
        const type = sanitizeForMarkdown(prop.type);
        const description = sanitizeForMarkdown(prop.description);
        return `| \`${prop.name}\` | \`${type}\` | ${required} | ${description} |`;
    }).join('\n');
}

/**
 * Generate slots content
 */
function generateSlotsContent(containerName, slots) {
    if (slots.length === 0) {
        return 'This container does not currently expose any customizable slots.';
    }

    let content = 'This container exposes the following slots for customization:\n\n';

    slots.forEach(slot => {
        content += `### \`${slot.name}\`\n\n`;
        content += `**Type**: \`${slot.type}\`\n\n`;
        content += `**Required**: ${slot.required ? 'Yes' : 'No'}\n\n`;
        content += `Custom slot for rendering ${slot.name.replace(/Slot$/, '').replace(/([A-Z])/g, ' $1').toLowerCase().trim()}.\n\n`;
    });

    return content;
}

/**
 * Generate usage example
 */
function generateUsageExample(containerName, configurations, repoConfig) {
    const kebabName = toKebabCase(containerName);

    let example = `\`\`\`jsx
import { ${containerName} } from '${repoConfig.packageName}';

export default function MyComponent() {
  return (
    <${containerName}`;

    // Add example props
    if (configurations.length > 0) {
        // Show first 3 required props as examples
        const requiredProps = configurations.filter(c => c.required).slice(0, 3);
        if (requiredProps.length > 0) {
            example += '\n';
            requiredProps.forEach(prop => {
                if (prop.type.includes('string')) {
                    example += `      ${prop.name}="example"\n`;
                } else if (prop.type.includes('boolean')) {
                    example += `      ${prop.name}={true}\n`;
                } else if (prop.type.includes('number')) {
                    example += `      ${prop.name}={123}\n`;
                } else if (prop.type.includes('()')) {
                    example += `      ${prop.name}={() => console.log('${prop.name}')}\n`;
                } else {
                    example += `      ${prop.name}={data}\n`;
                }
            });
            example += '    ';
        }
    }

    example += '/>\n  );\n}\n\`\`\`';

    return example;
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
function generateContainersMDX(repoName, repoConfig, containers, version, enrichmentData = null) {
    const template = readTemplate('dropin-container.mdx');
    const containerDocs = new Map();

    for (const containerInfo of containers) {
        const enrichment = enrichmentData?.[containerInfo.containerName] || null;

        // Build configurations table
        const configurationsTable = generateConfigurationsTable(containerInfo.props);

        // Build slots content
        const slotsContent = generateSlotsContent(containerInfo.containerName, containerInfo.slots);

        // Build usage example
        const usageExample = generateUsageExample(
            containerInfo.containerName,
            containerInfo.props,
            repoConfig
        );

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
function writeContainerDocs(repoName, repoConfig, containerDocs, version) {
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
function generateOverviewPage(repoName, repoConfig, containerDocs, version, outputDir, basePath) {
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
