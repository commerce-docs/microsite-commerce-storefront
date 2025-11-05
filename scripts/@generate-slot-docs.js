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
        console.log(`    ❌ Error extracting slots from ${containerName}: ${error.message}`);
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
 * Generate summary table of all containers and their slots
 */
function generateSummaryTable(containers) {
    if (containers.length === 0) {
        return '';
    }

    let table = '<table>\n';
    table += '<thead>\n';
    table += '<tr>\n';
    table += '<th style="white-space: nowrap;">Container</th>\n';
    table += '<th>Slots</th>\n';
    table += '</tr>\n';
    table += '</thead>\n';
    table += '<tbody>\n';

    for (const container of containers) {
        // Parse slot names from the interface
        const slotPattern = /(\w+)\??\s*:\s*SlotProps(?:<[^>]+>)?;/g;
        let match;
        const slots = [];

        while ((match = slotPattern.exec(container.slotsInterface)) !== null) {
            slots.push(`<code>${match[1]}</code>`);
        }

        const slotsList = slots.length > 0 ? slots.join(', ') : 'None';

        // Create anchor link to the container's section
        const anchorId = `${container.containerName.toLowerCase()}-slots`;
        const containerLink = `<a href="#${anchorId}"><code>${container.containerName}</code></a>`;

        table += '<tr>\n';
        table += `<td style="white-space: nowrap;">${containerLink}</td>\n`;
        table += `<td>${slotsList}</td>\n`;
        table += '</tr>\n';
    }

    table += '</tbody>\n';
    table += '</table>\n';

    return table;
}

/**
 * Generate slots content for documentation
 */
function generateSlotsContent(containers) {
    if (containers.length === 0) {
        return ''; // No additional content needed for empty slots
    }

    let content = '';

    for (const container of containers) {
        // Find line numbers for slot definitions to highlight
        const lines = container.slotsInterface.split('\n');
        const slotLineNumbers = [];

        lines.forEach((line, index) => {
            // Match lines that define slots (e.g., "SlotName?: SlotProps...")
            if (/^\s*\w+\??\s*:\s*SlotProps/.test(line)) {
                // Add 4 because:
                // Line 1: interface Name
                // Line 2: (blank)
                // Line 3: slots?: {
                // Line 4+: slot definitions start here
                slotLineNumbers.push(index + 4);
            }
        });

        // Generate highlight syntax for expressive-code
        const highlightSyntax = slotLineNumbers.length > 0
            ? ` {${slotLineNumbers.join(',')}}`
            : '';

        content += `## ${container.containerName} slots\n\n`;
        content += `\`\`\`js${highlightSyntax}\n`;
        content += `interface ${container.containerName}Props\n\n`;
        content += 'slots?: {\n';
        content += container.slotsInterface;
        content += '\n};\n';
        content += '```\n\n';
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
 * @param {Object} versionInfo - Version information object with requested, actual, isExactMatch
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateSlotsMDX(repoName, repoConfig, containers, versionInfo, enrichmentData = null) {
    const template = readTemplate('dropin-slots.mdx');

    // Generate summary table and detailed content
    const summaryTable = generateSummaryTable(containers);
    const slotsContent = generateSlotsContent(containers);

    // Generate intro text based on whether slots exist
    let introText;
    if (containers.length === 0) {
        // Concise intro for drop-ins with no slots
        introText = `The ${repoConfig.displayName} drop-in does not currently expose any slots for customization.`;
    } else {
        // Brief, focused intro for drop-ins with slots
        const containerCount = containers.length;
        const containerWord = containerCount === 1 ? 'container' : 'containers';
        introText = `The ${repoConfig.displayName} drop-in exposes slots in ${containerCount} ${containerWord}, allowing you to customize specific sections of the UI. Slots let you replace or extend parts of a container with your own implementations. For details on default properties available to all slots, see [Extending drop-in components](/dropins/all/extending/).`;
    }

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(versionInfo.requested),
        'INTRO_TEXT': introText,
        'SUMMARY_TABLE': summaryTable,
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
