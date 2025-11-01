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
 * 
 * @param {string} str - String to convert
 * @returns {string} Human-readable string
 * 
 * @example
 * toReadable('productSku') // Returns: 'product sku'
 * toReadable('isEnabled') // Returns: 'is enabled'
 */
export function toReadable(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();
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

    // Boolean flags
    if (propertyType.includes('boolean')) {
        if (propertyName.startsWith('is')) {
            const state = propertyName.substring(2);
            return `Whether the ${toReadable(state)} state is active`;
        }
        if (propertyName.startsWith('has')) {
            const state = propertyName.substring(3);
            return `Whether ${toReadable(state)} is present`;
        }
        if (propertyName.startsWith('show')) {
            const element = propertyName.substring(4);
            return `Controls visibility of ${toReadable(element)}`;
        }
        if (propertyName.startsWith('hide')) {
            const element = propertyName.substring(4);
            return `Controls hiding of ${toReadable(element)}`;
        }
        if (propertyName.startsWith('enable')) {
            const feature = propertyName.substring(6);
            return `Enables or disables ${toReadable(feature)}`;
        }
        if (propertyName.startsWith('disable')) {
            const feature = propertyName.substring(7);
            return `Disables ${toReadable(feature)}`;
        }
        if (propertyName.startsWith('allow')) {
            const feature = propertyName.substring(5);
            return `Allows ${toReadable(feature)}`;
        }
    }

    // Text/content props
    if (propertyType.includes('string')) {
        if (propertyName.endsWith('Text')) {
            const context = propertyName.replace(/Text$/, '');
            return `Text content for ${toReadable(context)}`;
        }
        if (propertyName.endsWith('Label')) {
            const context = propertyName.replace(/Label$/, '');
            return `Label text for ${toReadable(context)}`;
        }
        if (propertyName.endsWith('Placeholder')) {
            const context = propertyName.replace(/Placeholder$/, '');
            return `Placeholder text for ${toReadable(context)}`;
        }
        if (propertyName.endsWith('Title')) {
            const context = propertyName.replace(/Title$/, '');
            return `Title text for ${toReadable(context)}`;
        }
        if (propertyName.endsWith('Message')) {
            const context = propertyName.replace(/Message$/, '');
            return `Message text for ${toReadable(context)}`;
        }
        if (propertyName.endsWith('Description')) {
            const context = propertyName.replace(/Description$/, '');
            return `Description text for ${toReadable(context)}`;
        }
    }

    // URL/link props
    if (propertyName.endsWith('Url') || propertyName.endsWith('Href')) {
        const context = propertyName.replace(/(Url|Href)$/, '');
        return `URL for ${toReadable(context)}`;
    }
    if (propertyName.endsWith('Link')) {
        const context = propertyName.replace(/Link$/, '');
        return `Link to ${toReadable(context)}`;
    }

    // Data props
    if (propertyName.endsWith('Data')) {
        const context = propertyName.replace(/Data$/, '');
        return `Data object for ${toReadable(context)}`;
    }

    // Configuration props
    if (propertyName.endsWith('Config')) {
        const context = propertyName.replace(/Config$/, '');
        return `Configuration options for ${toReadable(context)}`;
    }
    if (propertyName.endsWith('Settings')) {
        const context = propertyName.replace(/Settings$/, '');
        return `Settings for ${toReadable(context)}`;
    }

    // Options/items props
    if (propertyName.endsWith('Options')) {
        const context = propertyName.replace(/Options$/, '');
        return `Available options for ${toReadable(context)}`;
    }
    if (propertyName.endsWith('Items')) {
        const context = propertyName.replace(/Items$/, '');
        return `Array of items for ${toReadable(context)}`;
    }
    if (propertyName.endsWith('List')) {
        const context = propertyName.replace(/List$/, '');
        return `List of ${toReadable(context)}`;
    }

    // ID props
    if (propertyName.endsWith('Id')) {
        const context = propertyName.replace(/Id$/, '');
        return `Unique identifier for ${toReadable(context)}`;
    }

    // Count/size props
    if (propertyType.includes('number')) {
        if (propertyName.endsWith('Count')) {
            const context = propertyName.replace(/Count$/, '');
            return `Number of ${toReadable(context)}`;
        }
        if (propertyName.endsWith('Size')) {
            const context = propertyName.replace(/Size$/, '');
            return `Size of ${toReadable(context)}`;
        }
        if (propertyName.endsWith('Width') || propertyName.endsWith('Height')) {
            return `${propertyName} in pixels`;
        }
        if (propertyName.startsWith('max')) {
            const context = propertyName.substring(3);
            return `Maximum ${toReadable(context)}`;
        }
        if (propertyName.startsWith('min')) {
            const context = propertyName.substring(3);
            return `Minimum ${toReadable(context)}`;
        }
    }

    // Handler/callback props (not starting with 'on')
    if (propertyType.includes('=>') || propertyType.includes('()')) {
        return `Callback function for ${toReadable(propertyName)}`;
    }

    // Generic fallback
    const readable = toReadable(propertyName);
    return `Configuration for ${readable}`;
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
    const lowerName = optionName.toLowerCase();

    // Specific config patterns
    if (lowerName.includes('model')) {
        return 'Custom data models for type transformations';
    }
    if (lowerName.includes('lang') || lowerName.includes('language')) {
        return 'Language definitions for internationalization';
    }
    if (lowerName.includes('i18n')) {
        return 'Internationalization configuration';
    }
    if (lowerName.includes('locale')) {
        return 'Locale settings for formatting and translations';
    }
    if (lowerName.includes('endpoint')) {
        return 'API endpoint configuration';
    }
    if (lowerName.includes('url') && !lowerName.includes('base')) {
        return 'Service URL configuration';
    }
    if (lowerName.includes('baseurl') || lowerName.includes('base_url')) {
        return 'Base URL for API requests';
    }
    if (lowerName.includes('token')) {
        return 'Authentication token';
    }
    if (lowerName.includes('apikey') || lowerName.includes('api_key')) {
        return 'API key for authentication';
    }
    if (lowerName.includes('auth') && !lowerName.includes('header')) {
        return 'Authentication configuration';
    }
    if (lowerName.includes('header')) {
        return 'Custom HTTP headers';
    }
    if (lowerName.includes('timeout')) {
        return 'Request timeout in milliseconds';
    }
    if (lowerName.includes('retry')) {
        return 'Retry configuration for failed requests';
    }
    if (lowerName.includes('cache')) {
        return 'Caching configuration';
    }
    if (lowerName.includes('debug')) {
        return 'Enable debug mode for additional logging';
    }
    if (lowerName.includes('log')) {
        return 'Logging configuration';
    }
    if (lowerName.includes('theme')) {
        return 'Theme configuration';
    }
    if (lowerName.includes('style')) {
        return 'Styling configuration';
    }

    // Type-based inference
    if (optionType.includes('boolean')) {
        return `Enable or disable ${toReadable(optionName)}`;
    }
    if (optionType.includes('number')) {
        return `Numeric value for ${toReadable(optionName)}`;
    }
    if (optionType.includes('string')) {
        return `String value for ${toReadable(optionName)}`;
    }

    // Generic fallback
    return `Configuration for ${toReadable(optionName)}`;
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
    const lowerName = paramName.toLowerCase();

    // Common parameter patterns
    if (lowerName === 'sku') {
        return 'Product SKU identifier';
    }
    if (lowerName === 'id') {
        return 'Unique identifier';
    }
    if (lowerName === 'email') {
        return 'Email address';
    }
    if (lowerName === 'password') {
        return 'User password';
    }
    if (lowerName === 'username') {
        return 'Username';
    }
    if (lowerName === 'token') {
        return 'Authentication token';
    }
    if (lowerName === 'quantity') {
        return 'Quantity of items';
    }
    if (lowerName === 'amount') {
        return 'Numeric amount';
    }
    if (lowerName === 'price') {
        return 'Price value';
    }
    if (lowerName === 'cartid' || lowerName === 'cart_id') {
        return 'Shopping cart identifier';
    }
    if (lowerName === 'productid' || lowerName === 'product_id') {
        return 'Product identifier';
    }
    if (lowerName === 'orderid' || lowerName === 'order_id') {
        return 'Order identifier';
    }
    if (lowerName === 'customerid' || lowerName === 'customer_id') {
        return 'Customer identifier';
    }

    // Options/config object
    if (paramName === 'options' || paramName === 'config') {
        return 'Configuration options';
    }

    // Callback patterns
    if (paramType.includes('=>') || paramType.includes('()')) {
        return `Callback function for ${toReadable(paramName)}`;
    }

    // Use property description as fallback
    return generatePropertyDescription(paramName, paramType);
}

