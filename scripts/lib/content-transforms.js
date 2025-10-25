/**
 * Content Transformation Utilities
 * 
 * Helper functions for transforming and cleaning generated documentation content.
 * Used primarily by the boilerplate generator but available for other generators.
 */

/**
 * Format package names by wrapping them in backticks
 * 
 * @param {string} text - Text containing package names
 * @returns {string} Text with formatted package names
 */
export function formatPackageNames(text) {
    // Match @dropins/package-name and @adobe/package-name patterns
    return text.replace(/@(dropins|adobe)\/[\w-]+/g, match => {
        // Only wrap if not already in backticks
        return text.includes(`\`${match}\``) ? match : `\`${match}\``;
    });
}

/**
 * Bold container names in text
 * 
 * @param {string} text - Text containing container names
 * @returns {string} Text with bolded container names
 */
export function boldContainerNames(text) {
    // Match pattern: `@package/name` followed by one or more capitalized words and "container"
    return text.replace(/(`@[\w-]+\/[\w-]+`)\s+([A-Z]\w+(?:\s+[A-Z]\w+)*)\s+container/g, '$1 **$2** container');
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
    let tableLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a table line (starts with |)
        if (line.trim().startsWith('|')) {
            if (!inTable) {
                inTable = true;
                result.push('<TableWrapper>');
                result.push('');
            }
            tableLines.push(line);
        } else {
            if (inTable) {
                // End of table
                result.push(...tableLines);
                result.push('');
                result.push('</TableWrapper>');
                result.push('');
                inTable = false;
                tableLines = [];
            }
            result.push(line);
        }
    }

    // Handle table at end of file
    if (inTable && tableLines.length > 0) {
        result.push(...tableLines);
        result.push('');
        result.push('</TableWrapper>');
    }

    return result.join('\n');
}

/**
 * Remove empty container headings
 * 
 * @param {string} content - Content to clean
 * @returns {string} Content without empty container sections
 */
export function removeEmptyContainerHeadings(content) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Check if this is a ### Containers heading
        if (line.trim() === '### Containers') {
            // Look ahead to see if there's content before the next heading
            let j = i + 1;
            let hasContent = false;

            while (j < lines.length) {
                const nextLine = lines[j].trim();

                // Stop at next heading
                if (nextLine.startsWith('##')) {
                    break;
                }

                // Check for content (not empty, not just whitespace)
                if (nextLine && nextLine !== '') {
                    hasContent = true;
                    break;
                }

                j++;
            }

            // Only include the heading if there's content
            if (hasContent) {
                result.push(line);
            }
        } else {
            result.push(line);
        }

        i++;
    }

    return result.join('\n');
}

/**
 * Promote H3 headings to H2 in specific sections
 * 
 * @param {string} content - Content to transform
 * @returns {string} Content with promoted headings
 */
export function promoteHeadingsToH2(content) {
    const lines = content.split('\n');
    const result = [];

    for (const line of lines) {
        // Convert ### to ## for specific patterns
        if (line.startsWith('### ')) {
            result.push(line.replace(/^### /, '## '));
        } else {
            result.push(line);
        }
    }

    return result.join('\n');
}

/**
 * Split configuration tables into separate sections
 * 
 * @param {string} content - Content containing configuration tables
 * @returns {string} Content with split tables
 */
export function splitConfigurationTables(content) {
    const lines = content.split('\n');
    const result = [];
    let inConfigTable = false;
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if we're entering a configuration table
        if (line.includes('| Option | Type |') || line.includes('| Configuration |')) {
            inConfigTable = true;
            result.push(line);
            continue;
        }

        // Check if we're in a table separator line
        if (inConfigTable && line.match(/^\|[\s:-]+\|/)) {
            result.push(line);
            continue;
        }

        // Process table rows
        if (inConfigTable && line.trim().startsWith('|')) {
            tableRows.push(line);
        } else {
            // End of table
            if (tableRows.length > 0) {
                result.push(...tableRows);
                tableRows = [];
            }
            inConfigTable = false;
            result.push(line);
        }
    }

    // Handle remaining table rows
    if (tableRows.length > 0) {
        result.push(...tableRows);
    }

    return result.join('\n');
}

/**
 * Apply standard content transformations
 * 
 * @param {string} content - Raw content
 * @returns {string} Transformed content
 */
export function applyStandardTransforms(content) {
    let result = content;

    result = formatPackageNames(result);
    result = boldContainerNames(result);
    result = removeEmptyContainerHeadings(result);
    result = wrapTablesWithTableWrapper(result);
    result = normalizeWhitespace(result);

    return result;
}

