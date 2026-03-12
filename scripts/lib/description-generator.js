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
 * - Writing style normalization (Latin abbreviations, etc.)
 *
 * RULE - VERIFY AGAINST SOURCE:
 * Generated descriptions should be checked against the source (JSDoc, docs, implementation)
 * before being treated as accurate. When adding or changing patterns, verify against the
 * actual drop-in source.
 */

/**
 * Normalize text according to writing style rules
 * 
 * Applies consistent writing conventions:
 * - Replaces Latin abbreviations with plain English
 * - Standardizes punctuation and formatting
 * 
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 * 
 * @example
 * normalizeWritingStyle('e.g., check the config')
 * // Returns: 'for example, check the config'
 * 
 * normalizeWritingStyle('i.e., the main component')
 * // Returns: 'that is, the main component'
 */
export function normalizeWritingStyle(text) {
    if (!text) return text;
    
    return text
        // Latin abbreviations -> plain English
        .replace(/\be\.g\.\,?/gi, 'for example,')
        .replace(/\bi\.e\.\,?/gi, 'that is,')
        .replace(/\betc\./gi, 'and so on')
        .replace(/\bvs\./gi, 'versus')
        .replace(/\bviz\./gi, 'namely,')
        .replace(/\bcf\./gi, 'compare')
        .replace(/\bet al\./gi, 'and others')
        .replace(/\bN\.B\./gi, 'Note:')
        .replace(/\bn\.b\./gi, 'note:')
        // Clean up double commas that might result from replacements
        .replace(/,\s*,/g, ',')
        // Clean up double spaces
        .replace(/\s+/g, ' ')
        .trim();
}

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
    if (propertyName === 'scope') {
        // From product-details/src/docs/intro.mdx and setProductConfigurationValues.mdx
        return 'Unique identifier for the context. Used to isolate events and data between different instances on the same page.';
    }
    if (propertyName === 'initialData') {
        // From product-details initialization.mdx - Elsie Container base prop
        return 'Preloaded data for the model before backend data is fetched. Use for testing, SSR, or improving initial load.';
    }

    // Data model props (product-details, order containers)
    if (propertyName === 'productData') {
        return 'Preloaded product data. Use for SSR or to avoid an extra GraphQL request on initial load.';
    }
    if (propertyName === 'orderData') {
        return 'Preloaded order data. Use for SSR or as fallback when data is not yet fetched from the backend.';
    }

    // Visibility toggles (hideX, showX)
    if (propertyName.startsWith('hide')) {
        const target = toReadable(propertyName.substring(4));
        return `When true, hides the ${target} in the UI.`;
    }
    if (propertyName.startsWith('show') && propertyType.includes('boolean')) {
        const target = toReadable(propertyName.substring(4));
        return `When true, displays the ${target} in the UI.`;
    }

    // Routing/navigation functions (order, checkout containers)
    if (propertyName.startsWith('route') && (propertyType.includes('function') || propertyType.includes('=>'))) {
        const target = toReadable(propertyName.substring(5));
        return `Function that returns the URL path for ${target}. Used for navigation links.`;
    }

    // Handler functions (handleX)
    if (propertyName.startsWith('handle') && propertyType.includes('function')) {
        const action = toReadable(propertyName.substring(6));
        return `Callback invoked when ${action}.`;
    }

    // Product identifier
    if (propertyName === 'sku') {
        return 'Product SKU. For configurable products, use the child variant SKU.';
    }

    // Reference/number inputs (purchase order, etc.)
    if (propertyName === 'initialReferenceNumber') {
        return 'Initial value for the reference number input. Used for purchase order or similar flows.';
    }

    // Order status (order containers)
    if (propertyName === 'status') {
        return 'Order or shipment status value. Determines which status UI to display.';
    }
    if (propertyName === 'statusTitle') {
        return 'Custom title for the status section. Overrides the default heading.';
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

    // Config objects (optionsConfig, etc.)
    if (propertyName.endsWith('Config')) {
        const target = toReadable(propertyName.replace(/Config$/, ''));
        return `Configuration options for ${target}.`;
    }

    // Product-details specific
    if (propertyName === 'carousel') {
        return 'Configuration for the product image carousel (thumbnails, zoom behavior).';
    }
    if (propertyName === 'zoomType') {
        return 'Zoom behavior: `zoom` for inline zoom, `overlay` for overlay zoom.';
    }

    // Boolean flags - use pattern for common ones, empty for obscure
    if (propertyType.includes('boolean')) {
        const boolPatterns = {
            closeButton: 'When true, shows a close button.',
            useACDL: 'When true, publishes events to the Adobe Client Data Layer.',
            disableDropdownPreselection: 'When true, prevents automatic selection of the first option in dropdowns.'
        };
        if (boolPatterns[propertyName]) return boolPatterns[propertyName];
        return '';
    }

    // Slot props (SlotProps type)
    if (propertyType.includes('SlotProps')) {
        const slotName = toReadable(propertyName);
        return `Props passed to the ${slotName} slot for customization.`;
    }

    return '';
}

/**
 * Generate description for a configuration option
 *
 * Used for initialization/configuration documentation. Provides pattern-based
 * fallbacks for common config options that appear across multiple drop-ins.
 * Enrichment overrides these; use enrichment for drop-in-specific nuance.
 *
 * @param {string} optionName - Option name
 * @param {string} optionType - TypeScript type
 * @returns {string} Generated description
 */
export function generateConfigDescription(optionName, optionType) {
    // Shared config options used across user-auth, user-account, payment-services
    const patterns = {
        authHeaderConfig: 'Configures authentication header format for API requests including custom header names and token prefix format (for example, `Bearer`, `Token`).',
        apiUrl: 'URL for the payment or Commerce API endpoint. Required for payment processing and backend communication.',
        getCustomerToken: 'Function that returns the current customer auth token, or null if not authenticated. Used for authenticated API requests.',
        storeViewCode: 'Store view code for the Commerce backend. Determines locale, currency, and catalog scope for API requests.',
        customerPermissionRoles: 'When true, includes customer permission roles in the auth context. Used for role-based access control.',
        adobeCommerceOptimizer: 'When true, indicates the storefront connects to Adobe Commerce Optimizer (ACO) for catalog and checkout.',
        features: 'Enables or disables checkout features including B2B quote functionality and custom login routing.'
    };

    const desc = patterns[optionName];
    if (desc) return desc;

    // For inline object types, generic fallback
    if (optionType && (optionType.includes('{') || optionType.includes('=>'))) {
        return `Configuration object for ${optionName}.`;
    }

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

/**
 * Generate a container description from the container name and drop-in display name.
 * Used when no description exists in enrichment, JSDoc, or existing MDX.
 * The generated description is written to enrichment so it persists.
 *
 * @param {string} containerName - PascalCase container name (e.g. ProductAttributes)
 * @param {string} dropinDisplayName - Drop-in display name (e.g. Product Details)
 * @returns {string} Generated description
 */
export function generateContainerDescription(containerName, dropinDisplayName) {
    const readable = toReadable(containerName);
    return `Displays ${readable} for the ${dropinDisplayName} drop-in.`;
}

