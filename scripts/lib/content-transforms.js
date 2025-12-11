/**
 * Content Transformation Utilities
 * 
 * Helper functions for transforming and cleaning generated documentation content.
 * Used primarily by the boilerplate generator but available for other generators.
 */

/**
 * Ensure standard sections exist in block documentation
 * Adds Block Configuration and Events sections if missing
 * 
 * @param {string} content - Content to process
 * @returns {string} Content with standard sections
 */
export function ensureStandardSections(content) {
    // Check if content starts with frontmatter (---)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatterMatch) {
        // No frontmatter found, return as-is (shouldn't happen in normal flow)
        return content;
    }

    // Split content into frontmatter and body
    const frontmatterEnd = frontmatterMatch[0].length;
    const frontmatter = content.substring(0, frontmatterEnd);
    const body = content.substring(frontmatterEnd);

    const lines = body.split('\n');
    const result = [];

    const hasBlockConfig = /^#{2,3}\s+Block Configuration/m.test(body);
    const hasEvents = /^#{2,3}\s+Events/m.test(body);

    let blockConfigAdded = false;
    let eventsAdded = false;
    let foundBlockConfig = false;
    let foundFirstHeadingAfterBlockConfig = false;

    // Add Block Configuration at the beginning if missing
    if (!hasBlockConfig) {
        result.push('### Block Configuration');
        result.push('');
        result.push('This block does not use any configuration options.');
        result.push('');
        blockConfigAdded = true;
        foundBlockConfig = true;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isHeading = line.trim().match(/^#{2,3}\s+/);
        const isBlockConfig = line.trim().match(/^#{2,3}\s+Block Configuration/);

        // Track when we find Block Configuration
        if (isBlockConfig) {
            foundBlockConfig = true;
        }

        // If we found Block Configuration and now hit another heading, insert Events before it
        if (foundBlockConfig && !foundFirstHeadingAfterBlockConfig && isHeading && !isBlockConfig && !hasEvents) {
            result.push('### Events');
            result.push('');
            result.push('This block does not emit or listen to any events.');
            result.push('');
            result.push('');
            eventsAdded = true;
            foundFirstHeadingAfterBlockConfig = true;
        }

        result.push(line);
    }

    // If Events wasn't added and doesn't exist, add it at the end
    if (!hasEvents && !eventsAdded) {
        result.push('');
        result.push('### Events');
        result.push('');
        result.push('This block does not emit or listen to any events.');
        result.push('');
    }

    // Reconstruct content with frontmatter first, then transformed body
    return frontmatter + '\n' + result.join('\n');
}

/**
 * Format package names by wrapping them in backticks
 * 
 * @param {string} text - Text containing package names
 * @returns {string} Text with formatted package names
 */
export function formatPackageNames(text) {
    // Match @dropins/package-name and @adobe/package-name patterns and wrap in backticks if not already wrapped
    return text.replace(/(?<!`)((@dropins\/[\w-]+)|(@adobe\/[\w-]+))(?!`)/g, '`$1`');
}

/**
 * Bold container names in text
 * 
 * @param {string} text - Text containing container names
 * @returns {string} Text with bolded container names
 */
export function boldContainerNames(text) {
    // Match pattern: `@package/name` followed by one or more capitalized words and "container"
    return text.replace(/(`@(?:dropins|adobe)\/[\w-]+`)\s+([A-Z][\w\s]+?\s+container)/g, '$1 **$2**');
}

/**
 * Normalize whitespace in content
 * 
 * @param {string} content - Content to normalize
 * @returns {string} Content with normalized whitespace
 */
export function normalizeWhitespace(content) {
    // Replace 3+ consecutive empty lines with exactly 2 empty lines
    return content.replace(/\n{4,}/g, '\n\n\n');
}

/**
 * Wrap tables with TableWrapper component
 * 
 * @param {string} content - Content containing markdown tables
 * @returns {string} Content with wrapped tables
 */
export function wrapTablesWithTableWrapper(content) {
    const lines = content.split('\n');
    const result = [];
    let inTable = false;
    let tableStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');

        if (isTableLine && !inTable) {
            // Start of a new table
            inTable = true;
            tableStart = i;
            result.push('<TableWrapper nowrap={[0]}>');
            result.push('');
            result.push(line);
        } else if (isTableLine && inTable) {
            // Continue table
            result.push(line);
        } else if (!isTableLine && inTable) {
            // End of table
            inTable = false;
            result.push('');
            result.push('</TableWrapper>');
            result.push(line);
        } else {
            // Regular line
            result.push(line);
        }
    }

    // Close table if we ended while still in one
    if (inTable) {
        result.push('');
        result.push('</TableWrapper>');
    }

    return result.join('\n');
}

/**
 * Remove empty container headings
 * Removes h2 headings that have no content before the next heading
 * 
 * @param {string} content - Content to clean
 * @returns {string} Content without empty container sections
 */
export function removeEmptyContainerHeadings(content) {
    const lines = content.split('\n');
    const result = [];
    let skipUntilIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        // Skip lines if we're in a skip range
        if (i <= skipUntilIndex) {
            continue;
        }

        const line = lines[i];
        const isH2 = line.trim().startsWith('## ') && !line.trim().startsWith('### ');

        if (isH2) {
            // Look ahead to see if there's any content before the next heading or h3
            let hasContent = false;
            let nextHeadingIndex = -1;

            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();

                // Skip completely empty lines
                if (!nextLine) {
                    continue;
                }

                // If we hit any heading (h1, h2, or h3), mark it
                if (nextLine.startsWith('#')) {
                    nextHeadingIndex = j;
                    break;
                }

                // If we find any non-empty content that's not a heading, mark it
                hasContent = true;
                break;
            }

            // If this h2 has no content before the next heading, skip it and all empty lines
            if (nextHeadingIndex > 0 && !hasContent) {
                // Skip from current h2 up to (but not including) the next heading
                skipUntilIndex = nextHeadingIndex - 1;
                continue;
            }
        }

        result.push(line);
    }

    return result.join('\n');
}

/**
 * Promote headings to H2 level
 * Promotes h3 -> h2, h4 -> h3, etc.
 * 
 * @param {string} content - Content to transform
 * @returns {string} Content with promoted headings
 */
export function promoteHeadingsToH2(content) {
    const lines = content.split('\n');
    const result = [];

    for (const line of lines) {
        const trimmed = line.trim();

        // Promote each heading level by one (h3 -> h2, h4 -> h3, etc.)
        if (trimmed.startsWith('####')) {
            // h4 -> h3
            result.push(line.replace(/^(\s*)####/, '$1###'));
        } else if (trimmed.startsWith('###')) {
            // h3 -> h2
            result.push(line.replace(/^(\s*)###/, '$1##'));
        } else {
            result.push(line);
        }
    }

    return result.join('\n');
}

/**
 * Split configuration tables into separate sections
 * Splits 6-column config tables into two smaller tables
 * 
 * @param {string} content - Content containing configuration tables
 * @returns {string} Content with split tables
 */
export function splitConfigurationTables(content) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Check if this is a configuration table header
        if (line.includes('Configuration Key') && line.includes('Type') && line.includes('Default') &&
            line.includes('Description') && line.includes('Required') && line.includes('Side Effects')) {

            // Found a 6-column config table, split it
            const headerLine = line;
            const separatorLine = lines[i + 1];

            // Create first table (Configuration Key | Type | Default)
            result.push('**Configuration Options:**');
            result.push('');
            result.push('| Configuration Key | Type | Default |');
            result.push('|-------------------|------|---------|');

            // Process data rows for first table
            let j = i + 2;
            const dataRows = [];
            while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
                const row = lines[j];
                const columns = row.split('|').map(col => col.trim()).filter(col => col);
                if (columns.length >= 6) {
                    dataRows.push(columns);
                    result.push(`| ${columns[0]} | ${columns[1]} | ${columns[2]} |`);
                }
                j++;
            }

            // Add spacing and second table (Configuration Key | Description | Side Effects)
            result.push('');
            result.push('**Details:**');
            result.push('');
            result.push('| Configuration Key | Description | Side Effects |');
            result.push('|-------------------|-------------|--------------|');

            // Process data rows for second table
            for (const columns of dataRows) {
                result.push(`| ${columns[0]} | ${columns[3]} | ${columns[5]} |`);
            }

            // Skip past the original table
            i = j;
        } else {
            result.push(line);
            i++;
        }
    }

    return result.join('\n');
}

/**
 * Apply standard content transformations
 * Applies all content transformation functions in the correct order
 * 
 * @param {string} content - Raw content
 * @returns {string} Transformed content
 */
export function applyStandardTransforms(content) {
    let result = content;

    // Ensure standard sections exist first
    result = ensureStandardSections(result);

    // Remove empty headings
    result = removeEmptyContainerHeadings(result);

    // Promote headings for clearer hierarchy
    result = promoteHeadingsToH2(result);

    // Split large configuration tables
    result = splitConfigurationTables(result);

    // Format package names
    result = formatPackageNames(result);

    // Bold container names
    result = boldContainerNames(result);

    // Normalize whitespace
    result = normalizeWhitespace(result);

    // Wrap tables with TableWrapper (should be last)
    result = wrapTablesWithTableWrapper(result);

    return result;
}

