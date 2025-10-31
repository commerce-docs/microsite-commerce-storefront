/**
 * Dictionary Processor
 * 
 * Utilities for processing i18n dictionary JSON into organized sections,
 * tables, and usage examples for documentation.
 */

/**
 * Flatten nested JSON into key-value pairs with dot notation
 * 
 * @param {Object} obj - Nested JSON object
 * @param {string} prefix - Current key prefix
 * @returns {Array<Object>} Array of {key, value} objects
 * 
 * @example
 * flattenJson({ Cart: { heading: "Cart" } })
 * // Returns: [{ key: "Cart.heading", value: "Cart" }]
 */
function flattenJson(obj, prefix = '') {
    const result = [];

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Recursive for nested objects
            result.push(...flattenJson(value, newKey));
        } else {
            // Leaf node - add the key-value pair
            result.push({
                key: newKey,
                value: typeof value === 'string' ? value : JSON.stringify(value)
            });
        }
    }

    return result;
}

/**
 * Group dictionary entries by top-level section
 * 
 * @param {Object} json - Dictionary JSON
 * @returns {Array<Object>} Array of section objects with {name, keys}
 * 
 * @example
 * groupBySections({ Cart: { MiniCart: {...}, EmptyCart: {...} } })
 * // Returns: [{ name: "Cart.MiniCart", keys: [...] }, { name: "Cart.EmptyCart", keys: [...] }]
 */
export function groupBySections(json) {
    const sections = [];

    // Get the root keys (e.g., "Cart", "PaymentServices")
    const rootKeys = Object.keys(json);

    // Process each root key
    for (const rootKey of rootKeys) {
        const rootValue = json[rootKey];

        if (rootValue && typeof rootValue === 'object') {
            // Get second-level keys (e.g., "MiniCart", "EmptyCart" under "Cart")
            const secondLevelKeys = Object.keys(rootValue);

            for (const sectionKey of secondLevelKeys) {
                const sectionValue = rootValue[sectionKey];
                const sectionName = `${rootKey}.${sectionKey}`;

                // Flatten this section's keys
                const flattenedKeys = flattenJson(sectionValue, sectionName);

                if (flattenedKeys.length > 0) {
                    sections.push({
                        name: sectionName,
                        displayName: sectionKey,
                        keys: flattenedKeys,
                        count: flattenedKeys.length
                    });
                }
            }
        }
    }

    return sections;
}

/**
 * Generate markdown table for dictionary keys
 * 
 * @param {Array<Object>} keys - Array of {key, value} objects
 * @param {number} maxRows - Maximum rows to show (0 = all)
 * @returns {string} Markdown table
 */
export function generateDictionaryTable(keys, maxRows = 0) {
    if (!keys || keys.length === 0) {
        return '| Key | Default Value |\n|-----|---------------|\n| No keys found | - |';
    }

    let table = '<TableWrapper nowrap={[0]}>\n\n';
    table += '| Key | Default Value |\n';
    table += '|-----|---------------|\n';

    const keysToShow = maxRows > 0 ? keys.slice(0, maxRows) : keys;

    for (const { key, value } of keysToShow) {
        // Sanitize value for markdown
        const sanitizedValue = value
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        table += `| \`${key}\` | ${sanitizedValue} |\n`;
    }

    if (maxRows > 0 && keys.length > maxRows) {
        table += `| ... | *${keys.length - maxRows} more keys* |\n`;
    }

    table += '\n</TableWrapper>';

    return table;
}

/**
 * Generate usage example for overriding dictionary keys
 * 
 * @param {string} dropinName - Drop-in name (e.g., "Cart")
 * @param {Array<Object>} sampleKeys - Sample keys to use in example (1-3)
 * @returns {string} Markdown with code example
 */
export function generateUsageExample(dropinName, sampleKeys) {
    if (!sampleKeys || sampleKeys.length === 0) {
        return '';
    }

    // Take up to 3 sample keys
    const samples = sampleKeys.slice(0, 3);

    // Build example JSON
    const exampleJson = {};
    for (const { key, value } of samples) {
        const parts = key.split('.');
        let current = exampleJson;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        // Use a customized version of the value
        current[parts[parts.length - 1]] = value.includes('Cart')
            ? value.replace('Cart', 'Basket')
            : `Custom ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`;
    }

    const jsonString = JSON.stringify(exampleJson, null, 2);

    return `### Example: Custom dictionary

\`\`\`javascript title="custom-dictionary.js"
// Create your custom dictionary file
export const customDictionary = ${jsonString};
\`\`\`

\`\`\`javascript title="initialize-dropin.js"
import { initialize } from '${dropinName.toLowerCase()}';
import { customDictionary } from './custom-dictionary';

// Initialize with custom dictionary
await initialize({
  langDefinitions: {
    en_US: customDictionary
  }
});
\`\`\``;
}

/**
 * Get summary statistics for dictionary
 * 
 * @param {Object} json - Dictionary JSON
 * @returns {Object} Statistics object
 */
export function getDictionaryStats(json) {
    const flattened = flattenJson(json);
    const sections = groupBySections(json);

    return {
        totalKeys: flattened.length,
        totalSections: sections.length,
        sections: sections.map(s => ({ name: s.name, count: s.count }))
    };
}

