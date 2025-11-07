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

// Import Phase 2 shared libraries
import { extractPropsFromComponent, extractSlotsSection } from './lib/react/props-extractor.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================
// Note: Most extraction logic has been moved to shared Phase 2 libraries:
// - extractPropsFromComponent() - from lib/react/props-extractor.js
// - extractSlotsSection() - from lib/react/props-extractor.js

/**
 * Extract slots from a container file
 * Uses shared props-extractor library
 */
function extractContainerSlots(filePath, containerName, repoPath) {
    try {
        // Use shared library to extract props interface
        const { interfaceContent } = extractPropsFromComponent(
            filePath,
            containerName,
            repoPath
        );

        if (!interfaceContent) {
            return null;
        }

        // Extract slots section using shared function
        const slotsContent = extractSlotsSection(interfaceContent);

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
        return ''; // No additional content needed for empty slots
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
function generateSlotsMDX(repoName, repoConfig, containers, versionInfo, enrichmentData = null) {
    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    const template = readTemplate('dropin-slots.mdx');

    // Generate slots content
    const slotsContent = generateSlotsContent(containers);

    // Generate intro text based on whether slots exist
    let introText;
    if (containers.length === 0) {
        // Concise intro for drop-ins with no slots
        introText = `This drop-in currently has no slots defined.`;
    } else {
        // Full intro with explanation for drop-ins with slots
        introText = `## Overview

Learn about the slots provided in the **${repoConfig.displayName}** drop-in component for customizing container appearance and behavior.

<Aside type="tip">
[Extending drop-in components](/dropins/all/extending/) describes default properties available to all slots.
</Aside>

## What are Slots?

Slots are customization points that allow you to replace or extend parts of a container's UI. Each container can expose multiple slots for different sections of its interface.`;
    }

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(version),
        'INTRO_TEXT': introText,
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
