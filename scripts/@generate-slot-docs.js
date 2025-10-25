#!/usr/bin/env node

/**
 * Slots Documentation Generator
 *
 * This script generates slots documentation for drop-in components by:
 * 1. Scanning src/containers directories for .tsx files
 * 2. Extracting container names and Props interfaces
 * 3. Parsing slots property definitions from TypeScript
 * 4. Generating comprehensive slots documentation with TypeScript interfaces
 *
 * USAGE:
 * - Generate all drop-ins: npm run generate-slot-docs
 * - Generate single drop-in: npm run generate-slot-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, company-management
 *
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-slots.mdx
 * - Uses: Section text, imports, SLOTS_CONTENT placeholder
 * - Generates independently: Slot interfaces and documentation
 *
 * OUTPUT: Single consolidated slots.mdx file per drop-in
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadSlotEnrichments } from './lib/enrichment.js';
import { updateSidebarForSlots } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================

/**
 * Extract slots from an interface definition
 */
function extractSlotsFromInterface(interfaceContent) {
    // Extract the slots section (handles both }; and }, endings)
    const slotsPattern = /slots\?:\s*{([\s\S]*?)}[,;]/;
    const slotsMatch = interfaceContent.match(slotsPattern);

    if (!slotsMatch) {
        return null;
    }

    let slotsContent = slotsMatch[1].trim();

    // Clean up the content - keep only the slot definitions
    // Remove comments
    slotsContent = slotsContent.replace(/\/\*[\s\S]*?\*\//g, '');
    slotsContent = slotsContent.replace(/\/\/.*/g, '');

    return slotsContent;
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

            // Look for Props interface
            const propsInterfaceMatch = content.match(/export interface \w*Props\s*{([\s\S]*?)}\s*;/);
            if (propsInterfaceMatch) {
                return { content: propsInterfaceMatch[1], fullFile: content };
            }
        }
    }

    return null;
}

/**
 * Extract slots from a container file
 */
function extractContainerSlots(filePath, containerName, repoPath) {
    try {
        const content = readFileSync(filePath, 'utf8');

        // Try to find Props interface in the same file
        let propsInterfaceContent = '';

        // Match both "interface Props" and "export interface Props"
        const propsInterfaceMatch = content.match(/(?:export\s+)?interface\s+\w*Props\s*(?:extends\s+[^{]+)?\s*{([\s\S]*?)^}\s*;?/m);
        if (propsInterfaceMatch) {
            propsInterfaceContent = propsInterfaceMatch[1];
        } else {
            // Look in external type files
            const externalProps = findPropsInTypeFiles(repoPath, containerName);
            if (externalProps) {
                propsInterfaceContent = externalProps.content;
            }
        }

        if (!propsInterfaceContent) {
            return null;
        }

        // Extract slots section
        const slotsContent = extractSlotsFromInterface(propsInterfaceContent);

        if (!slotsContent) {
            return null;
        }

        return {
            containerName,
            slotsInterface: slotsContent,
            count: 1 // For logging
        };
    } catch (error) {
        return null;
    }
}

/**
 * Scan repository for containers with slots
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of containers with slots
 */
function scanForSlots(repoPath) {
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
                    const containerInfo = extractContainerSlots(tsxPath, entry, repoPath);
                    if (containerInfo && containerInfo.slotsInterface) {
                        containers.push(containerInfo);
                    }
                }
            }
        }
    } catch (error) {
        // Silently skip errors
    }

    return containers;
}

// ============================================================================
// UNIQUE GENERATION LOGIC
// ============================================================================

/**
 * Generate slots content for documentation
 */
function generateSlotsContent(containers) {
    if (containers.length === 0) {
        return '<Aside type="note">\nThis drop-in does not currently expose customizable slots.\n</Aside>';
    }

    let content = '';

    for (const container of containers) {
        content += `## ${container.containerName} slots\n\n`;
        content += `The slots for the \`${container.containerName}\` container allow you to customize its appearance and behavior.\n\n`;
        content += '```js\n';
        content += `interface ${container.containerName}Props\n\n`;
        content += 'slots?: {\n';
        content += container.slotsInterface;
        content += '\n};\n';
        content += '```\n\n';

        // Parse individual slots for detailed documentation sections
        const slotPattern = /(\w+)\??\s*:\s*SlotProps(?:<[^>]+>)?;/g;
        let match;
        const slots = [];

        while ((match = slotPattern.exec(container.slotsInterface)) !== null) {
            slots.push(match[1]);
        }

        // Generate placeholder sections for each slot
        if (slots.length > 0) {
            for (const slotName of slots) {
                content += `### ${slotName} slot\n\n`;
                content += `The \`${slotName}\` slot allows you to customize the ${slotName.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} section of the \`${container.containerName}\` container.\n\n`;
                content += '```js\n';
                content += ` provider.render(${container.containerName}, {\n`;
                content += '  slots: {\n';
                content += `    ${slotName}: (ctx) => {\n`;
                content += '      // Your custom implementation\n';
                content += '      const element = document.createElement(\'div\');\n';
                content += `      element.innerText = 'Custom ${slotName}';\n`;
                content += '      ctx.appendChild(element);\n';
                content += '    }\n';
                content += '  }\n';
                content += '});\n';
                content += '```\n\n';
            }
        }

        content += '---\n\n';
    }

    return content;
}

/**
 * Generate slots MDX documentation
 * 
 * @param {string} repoName - Drop-in name
 * @param {Object} repoConfig - Repository configuration
 * @param {Array} containers - Array of containers with slots
 * @param {string} version - Drop-in version
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateSlotsMDX(repoName, repoConfig, containers, version, enrichmentData = null) {
    const template = readTemplate('dropin-slots.mdx');

    // Generate slots content
    const slotsContent = generateSlotsContent(containers);

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(version),
        'SLOTS_CONTENT': slotsContent,
        'REPO_URL': repoConfig.gitUrl.replace('.git', ''),
        'CONTAINER_COUNT': containers.length.toString()
    });
}

// ============================================================================
// FRAMEWORK INTEGRATION
// ============================================================================

runGenerator({
    name: 'Slot',
    itemType: 'slots',
    loadEnrichments: loadSlotEnrichments,
    scanRepo: scanForSlots,
    generateContent: generateSlotsMDX,
    updateSidebar: updateSidebarForSlots,
    outputFileName: 'slots.mdx'
});
