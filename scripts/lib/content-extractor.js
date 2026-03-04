/**
 * Content Extractor
 *
 * Extracts descriptions from existing generated MDX files for the Richer Description Rule.
 * Used by generators to compare existing vs generated and preserve richer content.
 *
 * Supports: initialization models, container parameters, event descriptions (see event-extractor.js).
 */

import { readFileSync, existsSync } from 'fs';

/**
 * Extract the intro paragraph from initialization.mdx.
 * The intro is the first paragraph after frontmatter and imports, before the version div.
 *
 * @param {string} filePath - Path to initialization.mdx
 * @returns {string|null} Intro paragraph text or null if not found
 */
export function extractExistingIntroParagraph(filePath) {
    if (!filePath || !existsSync(filePath)) return null;

    const content = readFileSync(filePath, 'utf-8');

    // Remove frontmatter
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\s*\n/, '');
    const lines = withoutFrontmatter.split('\n');

    const paragraphs = [];
    let current = [];
    let pastImports = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (current.length) {
                const para = current.join(' ').trim();
                if (para.length > 20 && !para.startsWith('import')) paragraphs.push(para);
                current = [];
            }
        } else if (trimmed.startsWith('import ') || trimmed.startsWith('import{')) {
            pastImports = true;
            if (current.length) {
                const para = current.join(' ').trim();
                if (para.length > 20 && !para.startsWith('import')) paragraphs.push(para);
                current = [];
            }
        } else if (pastImports && (trimmed.startsWith('<div') || trimmed.startsWith('<Aside') || trimmed.startsWith('##'))) {
            if (current.length) {
                const para = current.join(' ').trim();
                if (para.length > 20) paragraphs.push(para);
            }
            break;
        } else if (!trimmed.startsWith('|') && !trimmed.startsWith('```')) {
            current.push(trimmed);
        }
    }
    if (current.length) {
        const para = current.join(' ').trim();
        if (para.length > 20 && !para.startsWith('import')) paragraphs.push(para);
    }

    return paragraphs[0] || null;
}

/**
 * Extract the "Drop-in configuration" section intro from initialization.mdx.
 * The paragraph immediately after "## Drop-in configuration" and before the code block.
 *
 * @param {string} filePath - Path to initialization.mdx
 * @returns {string|null} Section intro text or null if not found
 */
export function extractExistingDropinConfigIntro(filePath) {
    if (!filePath || !existsSync(filePath)) return null;

    const content = readFileSync(filePath, 'utf-8');

    const match = content.match(/## Drop-in configuration\s*\n\n([\s\S]*?)(?=\n\n```|$)/);
    return match ? match[1].trim() : null;
}

/**
 * Extract model descriptions from initialization.mdx models table.
 * Parses rows like: | [`ModelName`](#anchor) | Description |
 *
 * @param {string} filePath - Path to initialization.mdx
 * @returns {Map<string, string>} Map of modelName -> description (trimmed)
 */
export function extractExistingModelDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    // Find the models table: | Model | Description | ... | [`ModelName`](#anchor) | desc |
    const tableMatch = content.match(/\|\s*Model\s*\|\s*Description\s*\|\s*\n\|\s*---+\s*\|\s*---+\s*\|\s*\n([\s\S]*?)(?=\n\n|\n<TableWrapper|\n<\/TableWrapper|$)/);
    if (!tableMatch) return result;

    const rows = tableMatch[1].trim().split('\n');
    for (const row of rows) {
        const pipeMatch = row.match(/\|\s*\[`([^`]+)`\]\([^)]+\)\s*\|\s*(.+?)\s*\|/);
        if (pipeMatch) {
            const modelName = pipeMatch[1];
            const description = pipeMatch[2].trim();
            if (description.length > 0) {
                result.set(modelName, description);
            }
        }
    }

    return result;
}

/**
 * Extract config option descriptions from initialization.mdx.
 * Parses the Configuration options table: | Parameter | Type | Req? | Description |
 *
 * @param {string} filePath - Path to initialization.mdx
 * @returns {Map<string, string>} Map of paramName -> description (trimmed)
 */
export function extractExistingConfigOptionDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    // Find the first Parameter | Type | Req? | Description table (Configuration options)
    const tableMatch = content.match(/\|\s*Parameter\s*\|\s*Type\s*\|\s*Req\?\s*\|\s*Description\s*\|\s*\n\|\s*---+\s*\|\s*---+\s*\|\s*---+\s*\|\s*---+\s*\|\s*\n([\s\S]*?)(?=\n\n|\n<\/TableWrapper|$)/);
    if (!tableMatch) return result;

    const rows = tableMatch[1].trim().split('\n');
    for (const row of rows) {
        // Match param name and description; type column may contain \| so match last two cols (Req?, Description)
        const pipeMatch = row.match(/\|\s*`([^`]+)`\s*\|[^]*?\|\s*(?:Yes|No)\s*\|\s*(.*?)\s*\|/);
        if (pipeMatch) {
            const paramName = pipeMatch[1];
            const description = pipeMatch[2].trim();
            if (description.length > 0) {
                result.set(paramName, description);
            }
        }
    }

    return result;
}

/**
 * Extract parameter descriptions from a container MDX file.
 * Parses rows like: | `paramName` | Type | Required | Description |
 *
 * @param {string} filePath - Path to container.mdx
 * @returns {Map<string, string>} Map of paramName -> description (trimmed)
 */
export function extractExistingParameterDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    // Find the Configuration table (Parameter | Type | Req? | Description)
    const tableMatch = content.match(/\|\s*Parameter\s*\|\s*Type\s*\|\s*Req\?\s*\|\s*Description\s*\|\s*\n\|\s*---+\s*\|\s*---+\s*\|\s*---+\s*\|\s*---+\s*\|\s*\n([\s\S]*?)(?=\n\n|\n<\/TableWrapper|$)/);
    if (!tableMatch) return result;

    const rows = tableMatch[1].trim().split('\n');
    for (const row of rows) {
        // Match param name and description; type column may contain \| so match last two cols (Req?, Description)
        const pipeMatch = row.match(/\|\s*`([^`]+)`\s*\|[^]*?\|\s*(?:Yes|No)\s*\|\s*(.*?)\s*\|/);
        if (pipeMatch) {
            const paramName = pipeMatch[1];
            const description = pipeMatch[2].trim();
            if (description.length > 0) {
                result.set(paramName, description);
            }
        }
    }

    return result;
}

/**
 * Extract slot descriptions from a slots.mdx file.
 * Parses ## ContainerName slots sections and ### SlotName slot subsections.
 * Returns Map of "containerName#slotName" -> description.
 *
 * @param {string} filePath - Path to slots.mdx
 * @returns {Map<string, string>} Map of "containerName#slotName" -> description
 */
export function extractExistingSlotDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    let currentContainer = null;

    // Match ## ContainerName slots (e.g. ## CartSummaryGrid slots)
    const containerPattern = /^## (\w+) slots\s*$/gm;
    // Match ### SlotName slot (e.g. ### Thumbnail slot)
    const slotPattern = /^### (\w+) slot\s*$/gm;

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const containerMatch = line.match(/^## (\w+) slots\s*$/);
        if (containerMatch) {
            currentContainer = containerMatch[1];
            continue;
        }

        const slotMatch = line.match(/^### (\w+) slot\s*$/);
        if (slotMatch && currentContainer) {
            const slotName = slotMatch[1];
            // Description is the next non-empty paragraph (until #### or ### or ##)
            let description = '';
            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j];
                if (nextLine.match(/^#### |^### |^## /)) break;
                if (nextLine.trim()) {
                    description = nextLine.trim();
                    break;
                }
            }
            if (description.length > 0) {
                result.set(`${currentContainer}#${slotName}`, description);
            }
        }
    }

    return result;
}

/**
 * Extract customization intro and container classes section from styles.mdx.
 * Returns { customizationIntro, componentClassesSection } for richer-description comparison.
 *
 * @param {string} filePath - Path to styles.mdx
 * @returns {{ customizationIntro: string|null, componentClassesSection: string|null }}
 */
export function extractExistingStylesContent(filePath) {
    const result = { customizationIntro: null, componentClassesSection: null };
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    const customizationMatch = content.match(/## Customization example\s*\n\n([\s\S]*?)(?=\n\nFor a complete list|$)/);
    if (customizationMatch) {
        result.customizationIntro = customizationMatch[1].trim();
    }

    const classesMatch = content.match(/## Container classes\s*\n\n([\s\S]*?)(?=\n## |$)/);
    if (classesMatch) {
        result.componentClassesSection = classesMatch[1].trim();
    }

    return result;
}

/**
 * Extract the intro/description paragraph from a merchant block MDX file.
 * The description is the first paragraph after frontmatter and imports.
 *
 * @param {string} filePath - Path to block .mdx file
 * @returns {string|null} Intro paragraph or null
 */
export function extractExistingBlockDescription(filePath) {
    if (!filePath || !existsSync(filePath)) return null;

    const content = readFileSync(filePath, 'utf-8');

    // Remove frontmatter
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\s*\n/, '');
    const lines = withoutFrontmatter.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 20 && !trimmed.startsWith('import') && !trimmed.startsWith('<') && !trimmed.startsWith('##')) {
            return trimmed;
        }
    }
    return null;
}

/**
 * Extract function descriptions from a functions.mdx file.
 * Parses each ## functionName section and its first paragraph (before signature block).
 * Used by the Richer Description Rule to preserve richer function descriptions.
 *
 * @param {string} filePath - Path to functions.mdx
 * @returns {Map<string, string>} Map of functionName -> description
 */
export function extractExistingFunctionDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    // Split by ## functionName sections (but skip ## Data Models and other non-function headings)
    const sectionPattern = /^## (\w+)\s*$/gm;
    let match;
    const sections = [];
    while ((match = sectionPattern.exec(content)) !== null) {
        sections.push({ name: match[1], start: match.index });
    }

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const end = sections[i + 1]?.start ?? content.length;
        const sectionContent = content.substring(section.start, end);

        // First paragraph is between ## heading and ``` or ### or empty line followed by ```
        // Match: optional blank line, then non-empty paragraph(s) until ``` or ###
        const descMatch = sectionContent.match(/^## \w+\s*\n\n([\s\S]*?)(?=\n```|\n###|\n##|$)/);
        if (!descMatch) continue;

        const paragraph = descMatch[1].trim();
        if (paragraph.length > 0) {
            result.set(section.name, paragraph);
        }
    }

    return result;
}

/**
 * Extract parameter descriptions from a functions.mdx file.
 * Parses each ## functionName section and its param table.
 * Returns Map of "functionName#paramName" -> description.
 *
 * @param {string} filePath - Path to functions.mdx
 * @returns {Map<string, string>} Map of "functionName#paramName" -> description
 */
export function extractExistingFunctionParameterDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    // Split by ## functionName sections (## addProductsToCart, ## applyCouponsToCart, etc.)
    const sectionPattern = /^## (\w+)\s*$/gm;
    let match;
    const sections = [];
    while ((match = sectionPattern.exec(content)) !== null) {
        sections.push({ name: match[1], start: match.index });
    }

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const end = sections[i + 1]?.start ?? content.length;
        const sectionContent = content.substring(section.start, end);

        // Find param table: | Parameter | Type | Req? | Description |
        const tableMatch = sectionContent.match(/\|\s*Parameter\s*\|\s*Type\s*\|\s*Req\?\s*\|\s*Description\s*\|\s*\n\|\s*---+\s*\|\s*---+\s*\|\s*---+\s*\|\s*---+\s*\|\s*\n([\s\S]*?)(?=\n\n|\n###|\n##|$)/);
        if (!tableMatch) continue;

        const rows = tableMatch[1].trim().split('\n');
        for (const row of rows) {
            // Match param name and description; type column may contain \| so match last two cols (Req?, Description)
            const pipeMatch = row.match(/\|\s*`([^`]+)`\s*\|[^]*?\|\s*(?:Yes|No)\s*\|\s*(.*?)\s*\|/);
            if (pipeMatch) {
                const paramName = pipeMatch[1];
                const description = pipeMatch[2].trim();
                if (description.length > 0) {
                    result.set(`${section.name}#${paramName}`, description);
                }
            }
        }
    }

    return result;
}

/**
 * Extract the intro paragraph from the ## Quick example section in quick-start content.
 * The intro is the paragraph(s) between the heading and the first ``` code block.
 * Used by the Richer Description Rule to preserve manually added helpful context.
 *
 * @param {string} content - Full MDX content (or file path when used with existsSync)
 * @returns {string|null} Intro paragraph text or null if not found
 */
export function extractQuickExampleIntro(content) {
    if (!content || typeof content !== 'string') return null;

    const match = content.match(/## Quick example\s*\n\n([\s\S]*?)(?=\n```|$)/);
    if (!match) return null;

    const paragraph = match[1].trim();
    return paragraph.length > 0 ? paragraph : null;
}

/**
 * Extract the intro paragraph from the ## Quick example section in quick-start.mdx.
 * Reads from file path.
 *
 * @param {string} filePath - Path to quick-start.mdx
 * @returns {string|null} Intro paragraph text or null if not found
 */
export function extractExistingQuickExampleIntro(filePath) {
    if (!filePath || !existsSync(filePath)) return null;
    return extractQuickExampleIntro(readFileSync(filePath, 'utf-8'));
}

/**
 * Extract container descriptions from the containers index.mdx table.
 * Used by the Richer Description Rule to preserve richer index row descriptions.
 *
 * @param {string} filePath - Path to containers/index.mdx
 * @returns {Map<string, string>} Map of containerName (PascalCase) -> description
 */
export function extractExistingContainerIndexDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    // Match table rows: | [ContainerName](/path/) | Description text. |
    const rowPattern = /^\|\s*\[([^\]]+)\]\([^)]+\)\s*\|\s*(.*?)\s*\|/gm;
    let match;
    while ((match = rowPattern.exec(content)) !== null) {
        const containerName = match[1].trim();
        const description = match[2].trim();
        if (containerName && description.length > 0 && containerName !== 'Container') {
            result.set(containerName, description);
        }
    }

    return result;
}
