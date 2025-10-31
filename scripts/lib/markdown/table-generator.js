/**
 * Markdown Table Generator
 * 
 * Shared utilities for generating markdown tables with proper escaping and formatting.
 * Used across multiple documentation generators (Container, Function, Initialization, etc.)
 * 
 * Features:
 * - Sanitize text for markdown table cells
 * - Generate property/parameter tables
 * - Support TableWrapper component integration
 * - Consistent column formatting
 */

/**
 * Sanitize text for safe use in markdown table cells
 * 
 * Escapes special markdown characters and normalizes whitespace
 * to prevent table formatting issues.
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text safe for markdown tables
 * 
 * @example
 * sanitizeText('Type: string | number')
 * // Returns: 'Type: string \\| number'
 */
export function sanitizeText(text) {
    if (!text) return '';

    return text
        .replace(/\\/g, '\\\\')        // Escape backslashes FIRST
        .replace(/\n/g, ' ')           // Remove line breaks
        .replace(/\r/g, '')            // Remove carriage returns
        .replace(/\|/g, '\\|')         // Escape pipes
        .replace(/`/g, '\\`')          // Escape backticks
        .replace(/\{/g, '\\{')         // Escape curly braces (MDX expressions)
        .replace(/\}/g, '\\}')         // Escape curly braces (MDX expressions)
        .replace(/</g, '&lt;')         // Escape less-than (HTML/JSX tags)
        .replace(/>/g, '&gt;')         // Escape greater-than (HTML/JSX tags)
        .replace(/\*/g, '\\*')         // Escape asterisks
        .replace(/\[/g, '\\[')         // Escape brackets
        .replace(/\]/g, '\\]')         // Escape brackets
        .replace(/\s+/g, ' ')          // Collapse multiple spaces
        .trim();
}

/**
 * Generate a markdown table for properties/parameters/configurations
 * 
 * Creates a markdown table with columns for name, type, required status, and description.
 * Automatically wraps in TableWrapper component if nowrap columns are specified.
 * 
 * @param {Array<Object>} items - Array of items to include in table
 * @param {string} items[].name - Property/parameter name
 * @param {string} items[].type - TypeScript type
 * @param {boolean} items[].required - Whether the item is required
 * @param {string} items[].description - Description text
 * @param {Object} options - Table generation options
 * @param {Array<number>} options.nowrapColumns - Column indices that should not wrap (0-based)
 * @param {string} options.emptyMessage - Message to show if table is empty
 * @param {boolean} options.includeRequired - Whether to include Required column (default: true)
 * @returns {string} Markdown table with optional TableWrapper
 * 
 * @example
 * const items = [
 *   { name: 'sku', type: 'string', required: true, description: 'Product SKU' },
 *   { name: 'quantity', type: 'number', required: false, description: 'Quantity to add' }
 * ];
 * generatePropertyTable(items, { nowrapColumns: [0, 1] })
 */
export function generatePropertyTable(items, options = {}) {
    const {
        nowrapColumns = [],
        emptyMessage = 'No properties',
        includeRequired = true
    } = options;

    // Handle empty items
    if (!items || items.length === 0) {
        const requiredCol = includeRequired ? ' - |' : '';
        return `| ${emptyMessage} | - |${requiredCol} - |`;
    }

    // Start with TableWrapper if nowrap columns specified
    let table = '';
    if (nowrapColumns.length > 0) {
        const nowrapArray = JSON.stringify(nowrapColumns);
        table += `<TableWrapper nowrap={${nowrapArray}}>\n\n`;
    }

    // Generate header row
    table += includeRequired
        ? '| Parameter | Type | Req? | Description |\n'
        : '| Parameter | Type | Description |\n';

    table += includeRequired
        ? '|---|---|---|---|\n'
        : '|---|---|---|\n';

    // Generate data rows
    for (const item of items) {
        const name = `\`${item.name}\``;
        const type = `\`${sanitizeText(item.type)}\``;
        const required = item.required ? 'Yes' : 'No';
        const description = sanitizeText(item.description || '');

        table += includeRequired
            ? `| ${name} | ${type} | ${required} | ${description} |\n`
            : `| ${name} | ${type} | ${description} |\n`;
    }

    // Close TableWrapper if opened
    if (nowrapColumns.length > 0) {
        table += '\n</TableWrapper>';
    }

    return table;
}

/**
 * Generate a simple two-column table (name and description)
 * 
 * Useful for function indexes, container lists, and other simple tables.
 * 
 * @param {Array<Object>} items - Array of items
 * @param {string} items[].name - Item name
 * @param {string} items[].description - Item description
 * @param {Object} options - Table options
 * @param {Array<number>} options.nowrapColumns - Columns to prevent wrapping
 * @param {string} options.nameHeader - Header text for name column (default: 'Name')
 * @param {string} options.descriptionHeader - Header text for description column (default: 'Description')
 * @param {boolean} options.linkNames - Whether to generate anchor links for names (default: false)
 * @returns {string} Markdown table
 * 
 * @example
 * const functions = [
 *   { name: 'addToCart', description: 'Adds items to cart' },
 *   { name: 'removeFromCart', description: 'Removes items from cart' }
 * ];
 * generateSimpleTable(functions, { nameHeader: 'Function', linkNames: true })
 */
export function generateSimpleTable(items, options = {}) {
    const {
        nowrapColumns = [],
        nameHeader = 'Name',
        descriptionHeader = 'Description',
        linkNames = false
    } = options;

    if (!items || items.length === 0) {
        return `| No items | - |\n| --- | --- |`;
    }

    let table = '';

    // Add TableWrapper if needed
    if (nowrapColumns.length > 0) {
        const nowrapArray = JSON.stringify(nowrapColumns);
        table += `<TableWrapper nowrap={${nowrapArray}}>\n\n`;
    }

    // Generate header
    table += `| ${nameHeader} | ${descriptionHeader} |\n`;
    table += `| --- | --- |\n`;

    // Generate rows
    for (const item of items) {
        const name = linkNames
            ? `[\`${item.name}\`](#${item.name.toLowerCase()})`
            : `\`${item.name}\``;

        const description = sanitizeText(item.description || '');
        table += `| ${name} | ${description} |\n`;
    }

    // Close TableWrapper if needed
    if (nowrapColumns.length > 0) {
        table += '\n</TableWrapper>';
    }

    return table;
}

/**
 * Generate a configuration options table
 * 
 * Specialized table for initialization/configuration documentation.
 * Shows option name, type, and description.
 * 
 * @param {Array<Object>} options - Configuration options
 * @param {string} options[].name - Option name
 * @param {string} options[].type - Option type
 * @param {string} options[].description - Option description
 * @returns {string} Markdown table
 * 
 * @example
 * const configOptions = [
 *   { name: 'langDefinitions', type: 'LangDefinitions', description: 'Language definitions' },
 *   { name: 'models', type: 'Record<string, any>', description: 'Custom data models' }
 * ];
 * generateConfigTable(configOptions)
 */
export function generateConfigTable(options) {
    if (!options || options.length === 0) {
        return '| No configuration options | - | - |\n| --- | --- | --- |';
    }

    let table = '| Option | Type | Description |\n';
    table += '|--------|------|-------------|\n';

    for (const option of options) {
        const name = `\`${option.name}\``;
        const type = `\`${sanitizeText(option.type)}\``;
        const description = sanitizeText(option.description || '');
        table += `| ${name} | ${type} | ${description} |\n`;
    }

    return table;
}

/**
 * Generate a slots table for container documentation
 * 
 * @param {Array<Object>} slots - Slot definitions
 * @param {string} slots[].name - Slot name
 * @param {string} slots[].type - Slot type
 * @param {boolean} slots[].required - Whether slot is required
 * @param {string} slots[].description - Slot description
 * @returns {string} Markdown table
 */
export function generateSlotsTable(slots) {
    if (!slots || slots.length === 0) {
        return '| No slots | - | - | - |\n| --- | --- | --- | --- |';
    }

    let table = '| Slot | Type | Required | Description |\n';
    table += '|------|------|----------|-------------|\n';

    for (const slot of slots) {
        const name = `\`${slot.name}\``;
        const type = `\`${sanitizeText(slot.type)}\``;
        const required = slot.required ? 'Yes' : 'No';
        const description = sanitizeText(slot.description || '');
        table += `| ${name} | ${type} | ${required} | ${description} |\n`;
    }

    return table;
}

