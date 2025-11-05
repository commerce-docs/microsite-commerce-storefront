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
        const fileContent = readFileSync(filePath, 'utf-8');

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
            fullFileContent: fileContent, // Keep full content for JSDoc extraction
            count: 1 // For logging
        };
    } catch (error) {
        console.log(`    ❌ Error extracting slots from ${containerName}: ${error.message}`);
        return null;
    }
}

/**
 * Extract slots from separate type files (used by Order dropin)
 */
function extractSlotsFromTypeFiles(repoPath) {
    const typesDir = join(repoPath, 'src', 'types');

    if (!existsSync(typesDir)) {
        return [];
    }

    const containers = [];

    try {
        const entries = readdirSync(typesDir);

        for (const entry of entries) {
            if (!entry.endsWith('.types.ts')) {
                continue;
            }

            const typeFilePath = join(typesDir, entry);
            const fileContent = readFileSync(typeFilePath, 'utf-8');

            // Look for interfaces that end with "Props" and have slots (both optional and required)
            const interfacePattern = /export\s+interface\s+(\w+Props)\s*\{[\s\S]*?slots\??\s*:\s*\{([\s\S]*?)\n\s*\};?[\s\S]*?\n\}/g;
            let match;

            while ((match = interfacePattern.exec(fileContent)) !== null) {
                const interfaceName = match[1];
                const containerName = interfaceName.replace(/Props$/, '');
                const fullInterface = match[0];

                // Extract just the slots section
                const slotsContent = extractSlotsSection(fullInterface);

                if (slotsContent) {
                    containers.push({
                        containerName,
                        slotsInterface: slotsContent,
                        fullFileContent: fileContent,
                        count: 1
                    });
                }
            }
        }
    } catch (error) {
        // Silently skip errors
    }

    return containers;
}

/**
 * Scan repository for containers with slots
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of containers with slots
 */
function scanForSlots(repoPath) {
    const containersDir = join(repoPath, 'src', 'containers');
    let containers = [];

    // Method 1: Scan container .tsx files (most dropins)
    if (existsSync(containersDir)) {
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
    }

    // Method 2: Scan separate type files (Order dropin pattern)
    const typeFileContainers = extractSlotsFromTypeFiles(repoPath);
    containers = containers.concat(typeFileContainers);

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
        // Match slot names regardless of type parameters (handles multiline definitions)
        const slotPattern = /(\w+)\??\s*:\s*SlotProps/g;
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
 * Detect non-standard slot types and generate explanatory notes
 */
function detectNonStandardSlots(slotsInterface) {
    const notes = [];

    // Check for slots that don't use SlotProps pattern
    const lines = slotsInterface.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trimStart();

        // Match slot definitions that don't use SlotProps
        const nonStandardMatch = trimmedLine.match(/^(\w+)\??\s*:\s*(\w+);/);
        if (nonStandardMatch && !trimmedLine.includes('SlotProps')) {
            const slotName = nonStandardMatch[1];
            const typeName = nonStandardMatch[2];

            // Generate explanation based on type name patterns
            if (typeName.includes('Slot') && !typeName.includes('SlotProps')) {
                // Likely an index signature or special slot type
                notes.push(`The \`${typeName}\` type uses an index signature where keys dynamically become slot names. Unlike standard slots with fixed names at compile time, this pattern determines slot names at runtime. You configure each slot with an object containing specific properties and render functions.`);
            }
        }
    }

    return notes;
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
        // Normalize indentation of the slots interface
        const lines = container.slotsInterface.split('\n');
        const normalizedLines = [];
        const slotLineNumbers = [];

        lines.forEach((line, index) => {
            // Remove all leading whitespace
            const trimmedLine = line.trimStart();

            if (!trimmedLine) {
                // Skip blank lines for cleaner output
                return;
            }

            // Determine indentation based on content - all 2-space increments
            let indentedLine;
            if (/^\w+\??\s*:\s*SlotProps/.test(trimmedLine)) {
                // Slot definition - indent with 2 spaces
                indentedLine = '  ' + trimmedLine;
                // Track for highlighting (add 4 for header lines)
                slotLineNumbers.push(normalizedLines.length + 4);
            } else if (trimmedLine.startsWith('}')) {
                // Closing brace for nested type - indent with 2 spaces
                indentedLine = '  ' + trimmedLine;
            } else {
                // Property inside nested type - indent with 4 spaces (2 levels)
                indentedLine = '    ' + trimmedLine;
            }

            normalizedLines.push(indentedLine);
        });

        // Generate highlight syntax for expressive-code
        const highlightSyntax = slotLineNumbers.length > 0
            ? ` {${slotLineNumbers.join(',')}}`
            : '';

        content += `## ${container.containerName} slots\n\n`;

        // Check for non-standard slots and add explanatory notes before code block
        const notes = detectNonStandardSlots(container.slotsInterface);
        if (notes.length > 0) {
            notes.forEach(note => {
                content += `${note}\n\n`;
            });
        }

        content += `\`\`\`js${highlightSyntax}\n`;
        content += `interface ${container.containerName}Props\n\n`;
        content += 'slots?: {\n';
        content += normalizedLines.join('\n');
        content += '\n};\n';
        content += '```\n';
        content += '\n---\n\n';
    }

    return content;
}

/**
 * Parse context properties from slot type definition
 */
function parseContextProperties(slotTypeDefinition) {
    const props = [];

    // Match property definitions (simple properties only, not nested objects)
    const lines = slotTypeDefinition.split('\n');

    for (const line of lines) {
        const match = line.match(/^\s*(\w+)\??:\s*(.+?)[,;]?\s*$/);
        if (match) {
            const propName = match[1];
            const propType = match[2].trim();

            // Classify the property type
            let category = 'unknown';
            if (propType.includes('boolean')) {
                category = 'boolean';
            } else if (propType.includes('=>') || propType.startsWith('(')) {
                category = 'function';
            } else if (propType.includes('ImageProps')) {
                category = 'imageProps';
            } else if (propType.includes('items[number]') || propType.includes('CartModel')) {
                category = 'item';
            } else if (propType.includes('string')) {
                category = 'string';
            } else if (propType.includes('number')) {
                category = 'number';
            }

            props.push({ name: propName, type: propType, category });
        }
    }

    return props;
}

/**
 * Generate a simple example using the first container with slots
 */
function generateSimpleExample(containers, repoConfig) {
    if (containers.length === 0) {
        return '';
    }

    // Use the first container
    const container = containers[0];

    // Parse to find the first slot name
    const slotMatch = container.slotsInterface.match(/(\w+)\??\s*:\s*SlotProps/);
    if (!slotMatch) {
        return '';
    }

    const slotName = slotMatch[1];
    const containerName = container.containerName;

    // Convert container name to kebab-case for BEM
    const containerKebab = containerName
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
    const slotKebab = slotName
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();

    // Extract the slot's type definition to see what properties are available
    const slotTypeMatch = container.slotsInterface.match(
        new RegExp(`${slotName}\\??\\s*:\\s*SlotProps<\\{([\\s\\S]*?)\\}>`, 's')
    );

    // Generate example based on context properties
    let exampleContent;
    if (slotTypeMatch && slotTypeMatch[1].trim()) {
        const contextProps = parseContextProperties(slotTypeMatch[1]);
        const hasItem = contextProps.some(p => p.category === 'item');
        const hasImageProps = contextProps.some(p => p.category === 'imageProps');
        const hasBoolean = contextProps.some(p => p.category === 'boolean');
        const booleanProp = contextProps.find(p => p.category === 'boolean');

        if (hasItem && hasImageProps) {
            // Image-related slot with item
            const imageProp = contextProps.find(p => p.category === 'imageProps').name;
            exampleContent = `    ${slotName}: (ctx) => {
      const { item, ${imageProp} } = ctx;
      
      const link = document.createElement('a');
      link.href = \`/products/\${item.sku}\`;
      link.className = '${containerKebab}__${slotKebab}';
      
      const img = document.createElement('img');
      img.src = ${imageProp}.src;
      img.alt = item.name || 'Product image';
      img.width = ${imageProp}.width;
      img.height = ${imageProp}.height;
      
      link.appendChild(img);
      ctx.appendChild(link);
    }`;
        } else if (hasItem) {
            // Item-related slot without images
            exampleContent = `    ${slotName}: (ctx) => {
      const { item } = ctx;
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = \`SKU: \${item.sku}\`;
      ctx.appendChild(div);
    }`;
        } else if (hasBoolean && booleanProp) {
            // Boolean property - generate conditional example
            const trueValue = slotName.includes('Heading') || slotName.includes('Title')
                ? `'Welcome Back!'`
                : `'Authenticated State'`;
            const falseValue = slotName.includes('Heading') || slotName.includes('Title')
                ? `'Sign In'`
                : `'Guest State'`;

            exampleContent = `    ${slotName}: (ctx) => {
      const { ${booleanProp.name} } = ctx;
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = ${booleanProp.name} ? ${trueValue} : ${falseValue};
      ctx.appendChild(div);
    }`;
        } else if (contextProps.length > 0) {
            // Has properties but no specific pattern - show first property
            const firstProp = contextProps[0].name;
            exampleContent = `    ${slotName}: (ctx) => {
      const { ${firstProp} } = ctx;
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = 'Custom ${slotName}';
      ctx.appendChild(div);
    }`;
        } else {
            // Fallback - no recognized properties
            exampleContent = `    ${slotName}: (ctx) => {
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = 'Custom ${slotName}';
      ctx.appendChild(div);
    }`;
        }
    } else {
        // No properties - simple slot
        exampleContent = `    ${slotName}: (ctx) => {
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = 'Custom ${slotName}';
      ctx.appendChild(div);
    }`;
    }

    return `## Using slots

This example customizes the \`${slotName}\` slot in \`${containerName}\`:

\`\`\`js
import { render as provider } from '${repoConfig.packageName}/render.js';
import ${containerName} from '${repoConfig.packageName}/containers/${containerName}.js';

provider.render(${containerName}, {
  slots: {
${exampleContent}
  }
})(document.querySelector('.${containerKebab}'));
\`\`\`
`;
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

    // Generate summary table, example, and detailed content
    const summaryTable = generateSummaryTable(containers);
    const simpleExample = generateSimpleExample(containers, repoConfig);
    const slotsContent = generateSlotsContent(containers);

    // Generate intro text based on whether slots exist
    let introText;
    if (containers.length === 0) {
        // All no-slot dropins get the "Why no slots?" heading
        const baseIntro = `The ${repoConfig.displayName} drop-in does not expose any slots for customization.\n\n## Why no slots?`;

        // Add specific explanation based on the dropin
        if (repoConfig.packageName === '@dropins/storefront-payment-services') {
            introText = `${baseIntro}\n\nThis drop-in wraps the Adobe Payment Services SDK (\`@adobe-commerce/payment-services-sdk\`), which renders secure payment forms directly into specified DOM elements. The SDK controls all UI rendering to maintain PCI (Payment Card Industry) compliance and security standards. You customize the payment forms through SDK configuration options (field placeholders, card type settings, callback handlers) passed to \`sdk.Payment.CreditCard.render()\`, not through the slot-based pattern other drop-ins use.`;
        } else {
            // Generic explanation for other dropins without slots
            introText = `${baseIntro}\n\nThis drop-in provides functionality through API methods and configuration options rather than UI customization points. Slots may be added in future versions as the drop-in's feature set expands.`;
        }
    } else {
        // Count total slots across all containers
        const totalSlots = containers.reduce((total, container) => {
            const slotPattern = /(\w+)\??\s*:\s*SlotProps/g;
            const matches = container.slotsInterface.match(slotPattern);
            return total + (matches ? matches.length : 0);
        }, 0);

        // Brief, focused intro for drop-ins with slots
        const containerCount = containers.length;
        const containerWord = containerCount === 1 ? 'container' : 'containers';
        const slotWord = totalSlots === 1 ? 'slot' : 'slots';
        introText = `The ${repoConfig.displayName} drop-in exposes **${totalSlots} ${slotWord}** in **${containerCount} ${containerWord}** for customizing specific UI sections. Use slots to replace or extend container components. For default properties available to all slots, see [Extending drop-in components](/dropins/all/extending/).`;
    }

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(versionInfo.requested),
        'INTRO_TEXT': introText,
        'SUMMARY_TABLE': summaryTable,
        'SIMPLE_EXAMPLE': simpleExample,
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
