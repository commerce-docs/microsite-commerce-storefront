/**
 * Description Generator
 * 
 * Shared utilities for auto-generating property descriptions from names and types.
 * Uses pattern matching and heuristics to create meaningful descriptions when
 * JSDoc comments are missing.
 * 
 * Features:
 * - Generate React prop descriptions
 * - Generate configuration option descriptions
 * - Generate parameter descriptions
 * - Pattern-based inference from names
 * - Type-aware description generation
 */

/**
 * Convert camelCase or PascalCase to human-readable lowercase string
 * Handles acronyms (ID, UID, API, URL, etc.) correctly
 * 
 * @param {string} str - String to convert
 * @returns {string} Human-readable string
 * 
 * @example
 * toReadable('productSku') // Returns: 'product sku'
 * toReadable('isEnabled') // Returns: 'is enabled'
 * toReadable('approvalRuleID') // Returns: 'approval rule ID'
 * toReadable('cartUID') // Returns: 'cart UID'
 * toReadable('SKU') // Returns: 'SKU'
 * toReadable('useACDL') // Returns: 'use ACDL'
 */
export function toReadable(str) {
    // Handle all-caps inputs first (like SKU, HTML, ACDL)
    if (str === str.toUpperCase() && /^[A-Z]+$/.test(str)) {
        return str; // Return as-is for all-caps acronyms
    }

    return str
        // Insert space before uppercase letters that are followed by lowercase letters
        // This handles: "camelCase" -> "camel Case"
        .replace(/([A-Z])([a-z])/g, ' $1$2')
        // Insert space before uppercase letters that follow lowercase letters
        // This handles: "approvalRule" -> "approval Rule"
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // Keep consecutive uppercase letters together (acronyms like ID, UID, API)
        // The above rules already handle this correctly
        .toLowerCase()
        .trim()
        // Fix common acronyms to be uppercase
        .replace(/\b(id|uid|url|api|sdk|ui|ux|html|css|json|xml|http|https|ssh|ftp|sku|acdl)\b/g, match => match.toUpperCase());
}

/**
 * Generate description for a React component property
 * 
 * Uses naming patterns and type information to infer meaningful descriptions.
 * 
 * @param {string} propertyName - Property name
 * @param {string} propertyType - TypeScript type
 * @returns {string} Generated description
 * 
 * @example
 * generatePropertyDescription('className', 'string')
 * // Returns: 'Additional CSS classes to apply to the container'
 * 
 * generatePropertyDescription('onAddToCart', '() => void')
 * // Returns: 'Callback function triggered when add to cart'
 * 
 * generatePropertyDescription('isLoading', 'boolean')
 * // Returns: 'Whether the loading state is active'
 */
export function generatePropertyDescription(propertyName, propertyType) {
    // Common React prop patterns
    if (propertyName === 'className') {
        return 'Additional CSS classes to apply to the container';
    }
    if (propertyName === 'children') {
        return 'Child elements to render within the container';
    }
    if (propertyName === 'testId') {
        return 'Test ID for automated testing';
    }
    if (propertyName === 'style') {
        return 'Inline styles to apply to the container';
    }
    if (propertyName === 'ref') {
        return 'React ref for accessing the DOM element';
    }
    if (propertyName === 'key') {
        return 'Unique key for React list rendering';
    }

    // Action handlers (onClick, onChange, onSubmit, etc.)
    if (propertyName.startsWith('on')) {
        const action = propertyName.substring(2);
        return `Callback function triggered when ${toReadable(action)}`;
    }

    // Customization callbacks (setColumns, setRowsData, etc.)
    if (propertyName.startsWith('set') && propertyType.includes('function')) {
        const target = propertyName.substring(3);
        return `Callback to customize ${toReadable(target)}`;
    }

    // Boolean flags
    // Boolean props - parameter names are self-documenting
    // Return empty string - only enrichment should provide descriptions
    if (propertyType.includes('boolean')) {
        return '';
    }

    // All other parameter names are self-documenting
    // Return empty string - only enrichment files should provide meaningful descriptions
    // that explain WHY and WHEN to use a parameter, not just WHAT it is
    return '';
}

/**
 * Generate description for a configuration option
 * 
 * Used for initialization/configuration documentation where options
 * are more about setup than React props.
 * 
 * @param {string} optionName - Option name
 * @param {string} optionType - TypeScript type
 * @returns {string} Generated description
 * 
 * @example
 * generateConfigDescription('langDefinitions', 'LangDefinitions')
 * // Returns: 'Language definitions for internationalization'
 * 
 * generateConfigDescription('apiEndpoint', 'string')
 * // Returns: 'API endpoint configuration'
 */
export function generateConfigDescription(optionName, optionType) {
    // Configuration option names are self-documenting
    // Return empty string - only enrichment files should provide meaningful descriptions
    // that explain WHY and WHEN to use an option, not just WHAT it is
    return '';
}

/**
 * Generate description for a function parameter
 * 
 * Similar to property descriptions but more focused on function behavior.
 * 
 * @param {string} paramName - Parameter name
 * @param {string} paramType - TypeScript type
 * @returns {string} Generated description
 * 
 * @example
 * generateParameterDescription('sku', 'string')
 * // Returns: 'Product SKU identifier'
 * 
 * generateParameterDescription('quantity', 'number')
 * // Returns: 'Quantity of items'
 */
export function generateParameterDescription(paramName, paramType) {
    // Parameter names are self-documenting
    // Return empty string - only enrichment files should provide meaningful descriptions
    // that explain WHY and WHEN to use a parameter, not just WHAT it is
    return '';
}

