/**
 * Markdown Example Generator
 * 
 * Shared utilities for generating code examples in documentation.
 * Handles React component examples, function call examples, and type-based value inference.
 * 
 * Features:
 * - Generate React component usage examples
 * - Generate function call examples
 * - Infer example values from TypeScript types
 * - Format code blocks with proper imports
 * - Support for JSX and JavaScript examples
 *
 * RULE - EXAMPLE VERIFICATION:
 * NEVER create code examples without thoroughly verifying every line against source code.
 * Always check: .temp-repos/StorefrontSDK, .temp-repos/{dropin-name}
 * Verify: API signatures (e.g. provider.render returns Promise → await required), event names,
 *         payload shapes, prop types, import paths.
 * If you cannot verify, do not invent—use placeholders with honest comments.
 *
 * RULE - CONTEXT-APPROPRIATE VALUES (see scripts/GENERATOR-RULES.md):
 * Infer example values from prop/parameter names and types. Use guiding examples (e.g. "REF-12345"
 * for reference numbers, (value) => ... for callbacks with params) instead of generic placeholders.
 *
 * RULE - VERIFY AGAINST SOURCE:
 * Generated descriptions and example values should be checked against the source (JSDoc, docs,
 * implementation) before being treated as accurate. When adding or changing patterns, verify first.
 */

import { getBestDiscoveredExample } from '../example-scanner.js';

/**
 * Replace empty slots objects with a helpful comment for developers.
 * Use when post-processing container examples from any source (enrichment, discovery, etc.).
 *
 * @param {string} code - Code block content (with or without ``` wrapper)
 * @returns {string} Code with slots: {} replaced by slots: { // Add custom slot implementations here }
 */
export function ensureSlotsComment(code) {
    return code.replace(/slots:\s*\{\s*\}/g, 'slots: {\n    // Add custom slot implementations here\n  }');
}

/**
 * Format an object literal string with proper indentation (one property per line).
 */
function formatConfigObject(configStr) {
    const trimmed = configStr.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return configStr;
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return '{}';

    const parts = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < inner.length; i++) {
        const c = inner[i];
        if (c === '"' || c === "'" || c === '`') {
            const q = c;
            i++;
            while (i < inner.length && (inner[i] !== q || inner[i - 1] === '\\')) i++;
            continue;
        }
        if (c === '{' || c === '(' || c === '[') depth++;
        else if (c === '}' || c === ')' || c === ']') depth--;
        else if (c === ',' && depth === 0) {
            parts.push(inner.slice(start, i).trim());
            start = i + 1;
        }
    }
    parts.push(inner.slice(start).trim());
    const nonEmpty = parts.filter(p => p.length > 0);
    const formatted = nonEmpty.map((p) => {
        if (/^slots:\s*\{\s*\}$/.test(p.trim())) {
            return '  slots: {\n    // Add custom slot implementations here\n  }';
        }
        return '  ' + p;
    });
    return '{\n' + formatted.join(',\n') + '\n}';
}

/**
 * Sanitize discovered config for docs: replace bare identifiers with concrete values
 * so examples are copy-pasteable without undefined references.
 */
function sanitizeDiscoveredConfig(configStr, packageName) {
    let config = configStr;
    const extraImports = [];

    // location → location: PaymentLocation.CHECKOUT (payment-services shorthand)
    if (packageName?.includes('payment-services') && /\blocation\b/.test(config)) {
        config = config.replace(/\blocation\b/g, 'location: PaymentLocation.CHECKOUT');
        extraImports.push(`import { PaymentLocation } from '${packageName}/api.js';`);
    }

    // onSuccess, onError - replace bare refs with doc-friendly callbacks
    if (packageName?.includes('payment-services')) {
        config = config.replace(/\bonSuccess\b/g, 'onSuccess: (event) => console.log(\'Payment success\', event)');
        config = config.replace(/\bonError\b/g, 'onError: (error) => console.error(error)');
    }

    // getCartId: getCartId → getCartId with null check (api.js, returns Promise<string>)
    if (packageName?.includes('payment-services') && /getCartId:\s*getCartId/.test(config)) {
        const getCartIdImpl = "async () => { const cart = await getCartData(); if (!cart) throw new Error('Cart not initialized'); return cart.id; }";
        config = config.replace(/getCartId:\s*getCartId/g, `getCartId: ${getCartIdImpl}`);
        extraImports.push("import { getCartData } from '@dropins/storefront-cart/api.js';");
    }

    // Replace rootLink(...) with simple paths across all dropins (boilerplate uses rootLink + path constants)
    const routeReplacements = [
        [/routeRequisitionListDetails:\s*\(uid\)\s*=>\s*rootLink\([^)]+\)/g, 'routeRequisitionListDetails: (uid) => `/customer/requisition-lists/$${uid}`'],
        [/routeRequisitionListGrid:\s*\(\)\s*=>\s*rootLink\([^)]+\)/g, 'routeRequisitionListGrid: () => `/customer/requisition-lists`'],
        [/routeRequisitionListView:\s*\(\)\s*=>\s*rootLink\([^)]+\)/g, 'routeRequisitionListView: () => `/customer/requisition-lists`'],
        [/routeRequisitionList:\s*\(\)\s*=>\s*rootLink\([^)]+\)/g, 'routeRequisitionList: () => `/customer/requisition-lists`'],
        [/routePurchaseOrderDetails:\s*\([^)]+\)\s*=>\s*rootLink\([^)]+\)/g, 'routePurchaseOrderDetails: (poId) => `/purchase-order/details?poRef=$${poId}`'],
        [/routeApprovalRulesList:\s*\(\)\s*=>\s*rootLink\([^)]+\)/g, 'routeApprovalRulesList: () => `/company/approval-rules`'],
        [/routeApprovalRuleDetails:\s*\([^)]+\)\s*=>\s*rootLink\([^)]+\)/g, 'routeApprovalRuleDetails: (id) => `/approval-rules/details?ruleRef=$${id}`'],
        [/routeEditApprovalRule:\s*\([^)]+\)\s*=>\s*rootLink\([^)]+\)/g, 'routeEditApprovalRule: (id) => `/approval-rules/edit?ruleRef=$${id}`'],
        [/routeCreateApprovalRule:\s*\([^)]+\)\s*=>\s*rootLink\([^)]+\)/g, 'routeCreateApprovalRule: (id) => `/approval-rules/create`'],
        [/routeMyAccount:\s*\(\)\s*=>\s*rootLink\([^)]+\)/g, 'routeMyAccount: () => `/customer/account`'],
        [/routeLogin:\s*\(\)\s*=>\s*rootLink\([^)]+\)/g, 'routeLogin: () => `/customer/login`'],
    ];
    routeReplacements.forEach(([pattern, replacement]) => {
        config = config.replace(pattern, replacement);
    });

    return { config, extraImports };
}

/**
 * Infer route function value from prop name and type. Applies across all dropins.
 * Extracts param from type (uid, id, poId, etc.) and infers path from prop name.
 *
 * @param {string} propName - e.g. routeRequisitionListDetails, routeProduct
 * @param {string} type - e.g. (uid: string) => string, (item: CartItem) => string
 * @returns {string|null} Example value or null if not a route function
 */
function inferRouteValue(propName, type) {
    const lowerName = propName.toLowerCase();
    if (!lowerName.includes('route') && !lowerName.includes('navigate')) return null;

    // Extract param from type: (uid: string) => string, (id: string) => string, (poId: string) => string
    const paramMatch = type.match(/\(\s*(\w+)\s*:/);
    const param = paramMatch ? paramMatch[1] : null;

    // Convert routeXxxYyy to kebab path segment (e.g. routeRequisitionListDetails → requisition-list-details)
    const withoutRoute = propName.replace(/^route/, '');
    const kebab = withoutRoute.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

    // Map common patterns to concrete paths (works across requisition-list, purchase-order, cart, etc.)
    // Use string concat to avoid template literal interpolation of ${param}
    const pathMap = {
        'requisition-list-details': '(uid) => `/customer/requisition-lists/${uid}`',
        'requisition-list-grid': "() => '/customer/requisition-lists'",
        'requisition-list-view': "() => '/customer/requisition-lists'",
        'requisition-list': "() => '/customer/requisition-lists'",
        'purchase-order-details': '(poId) => `/purchase-order/details?poRef=${poId}`',
        'approval-rules-list': "() => '/company/approval-rules'",
        'approval-rule-details': '(id) => `/approval-rules/details?ruleRef=${id}`',
        'edit-approval-rule': '(id) => `/approval-rules/edit?ruleRef=${id}`',
        'create-approval-rule': "(id) => '/approval-rules/create'",
        'product': param ? '(item) => `/${"${"}item.url?.urlKey ?? item.sku}`' : "() => '/product'",
        'cart': "() => '/cart'",
        'checkout': "() => '/checkout'",
        'empty-cart-cta': "() => '/cart'",
        'empty-cart-c-t-a': "() => '/cart'",
        'my-account': "() => '/customer/account'",
        'login': "() => '/customer/login'",
    };

    if (pathMap[kebab]) return pathMap[kebab];

    // Fallback: infer from structure. *Details with param → /${param}, else base path
    const basePath = '/' + kebab.replace(/-details$/, '').replace(/-grid$/, '').replace(/-view$/, '');
    if (param && (lowerName.includes('details') || lowerName.includes('detail'))) {
        return `(${param}) => \`${basePath}/\${${param}}\``;
    }
    return `() => '${basePath}'`;
}

/**
 * Infer the first parameter name for an onX callback from the prop name.
 * e.g. onReferenceNumberChange → referenceNumber, onItemSelect → item
 *
 * @param {string} propName - Callback prop name (e.g. onReferenceNumberChange)
 * @returns {string|null} Inferred param name or null if not inferrable
 */
function inferCallbackParamName(propName) {
    if (!propName || !propName.startsWith('on') || propName.length <= 2) {
        return null;
    }
    const rest = propName.slice(2);
    if (!rest) return null;
    // Remove common suffixes (Change, Blur, Click, etc.) to get the value param
    const suffixPattern = /(Change|Blur|Click|Select|Submit|Load|Focus|Input|Update)$/i;
    const stem = rest.replace(suffixPattern, '');
    if (stem) {
        return stem.charAt(0).toLowerCase() + stem.slice(1);
    }
    return rest.charAt(0).toLowerCase() + rest.slice(1);
}

/**
 * Infer an example value based on TypeScript type
 * 
 * @param {string} type - TypeScript type string
 * @param {string} propName - Property/parameter name (for context)
 * @returns {string} Example value suitable for the type
 * 
 * @example
 * inferExampleValue('string', 'sku') // Returns: '"PRODUCT-SKU-123"'
 * inferExampleValue('number', 'quantity') // Returns: '1'
 * inferExampleValue('boolean', 'enabled') // Returns: 'true'
 */
export function inferExampleValue(type, propName = '') {
    const lowerType = type.toLowerCase();
    const lowerName = propName.toLowerCase();

    // Handle union types - pick first non-null option
    if (type.includes('|')) {
        const options = type.split('|').map(t => t.trim());
        const firstNonNull = options.find(t => t !== 'null' && t !== 'undefined');
        if (firstNonNull) {
            return inferExampleValue(firstNonNull, propName);
        }
    }

    // createCart: { getCartItems: () => CartItem[] } - before array check (type contains [])
    if (lowerName === 'createcart') {
        return "{ getCartItems: () => [{ sku: 'PRODUCT-SKU', quantity: 1 }] }";
    }

    // Handle array types
    if (type.includes('[]') || type.includes('Array<')) {
        return '[]';
    }

    // Handle Set types
    if (type.includes('Set<')) {
        return 'new Set()';
    }

    // Handle Map types
    if (type.includes('Map<')) {
        return 'new Map()';
    }

    // Handle function types
    if (type.includes('=>') || type.includes('()') || lowerType.includes('function')) {
        if (lowerName.startsWith('on')) {
            const action = propName.substring(2);
            const paramName = inferCallbackParamName(propName);
            if (paramName) {
                return `(${paramName}) => console.log('${action}', ${paramName})`;
            }
            return `() => console.log('${action}')`;
        }
        if (lowerName.includes('route') || lowerName.includes('navigate')) {
            const routeVal = inferRouteValue(propName, type);
            if (routeVal) return routeVal;
            return `() => '/example-path'`;
        }
        // getCartId: returns Promise<string> - use getCartData from cart drop-in (throws when null)
        if (lowerName === 'getcartid') {
            return "async () => { const cart = await getCartData(); if (!cart) throw new Error('Cart not initialized'); return cart.id; }";
        }
        return '() => {}';
    }

    // PaymentLocation enum (CHECKOUT, PRODUCT_DETAIL)
    if (lowerName === 'location' && (type.includes('PaymentLocation') || type.includes('Location'))) {
        return 'PaymentLocation.CHECKOUT';
    }

    // Handle specific types
    if (lowerType.includes('string')) {
        // Context-aware string examples
        if (lowerName.includes('sku')) return '"PRODUCT-SKU-123"';
        if (lowerName.includes('uid')) return '"abc-123"';
        if (lowerName.includes('id')) return '"abc-123"';
        if (lowerName.includes('reference')) return '"REF-12345"';
        if (lowerName.includes('email')) return '"user@example.com"';
        if (lowerName.includes('url') || lowerName.includes('href')) return '"https://example.com"';
        if (lowerName === 'fallbackroute') return '"/customer/account"';
        if (lowerName.includes('route') || lowerName.includes('path')) return '"/account"';
        if (lowerName.includes('name')) return '"Example Name"';
        if (lowerName.includes('title')) return '"Example Title"';
        if (lowerName.includes('description')) return '"Example description"';
        if (lowerName.includes('label')) return '"Label"';
        if (lowerName.includes('text')) return '"Text content"';
        if (lowerName.includes('class')) return '"custom-class"';
        if (lowerName === 'scope') return '"modal"';  // Isolated instance (e.g. quick-view modal, popover)
        return '"example"';
    }

    if (lowerType.includes('number')) {
        if (lowerName.includes('quantity')) return '1';
        if (lowerName.includes('price')) return '99.99';
        if (lowerName.includes('count')) return '10';
        if (lowerName.includes('size')) return '10';
        if (lowerName.includes('page')) return '1';
        if (lowerName.includes('limit')) return '20';
        if (lowerName.includes('id')) return '123';
        return '1';
    }

    if (lowerType.includes('boolean') || lowerType.includes('bool')) {
        return 'true';
    }

    if (lowerType === 'null') {
        return 'null';
    }

    if (lowerType === 'undefined') {
        return 'undefined';
    }

    // Handle object types (explicit)
    if (type.includes('{') || type.includes('object') || type.includes('Object')) {
        return '{}';
    }

    // Handle complex/model types (PascalCase types like NegotiableQuoteModel)
    if (/^[A-Z][a-zA-Z]*$/.test(type) || type.includes('Model') || type.includes('Data')) {
        return 'undefined';
    }

    // Default: use undefined for unknown types to avoid circular references
    return 'undefined';
}

/**
 * Get a helpful comment for auto-inferred values that may need developer attention
 * 
 * @param {string} type - TypeScript type string
 * @param {string} propName - Property name
 * @param {string} value - The inferred value
 * @returns {string|null} Comment string or null if no comment needed
 */
function getValueComment(type, propName, value) {
    const lowerName = propName.toLowerCase();
    const lowerType = type.toLowerCase();
    
    // UIDs typically come from URL params or context
    if (lowerName.includes('uid') && value === '"abc-123"') {
        return '// Get from URL params or context';
    }
    
    // Complex model/data types need to be fetched
    if (value === 'undefined') {
        if (lowerName.includes('data') || lowerName.includes('list') || lowerName.includes('item')) {
            return '// Auto-populated from drop-in state, or provide explicitly';
        }
        // Generic complex types
        if (/^[A-Z]/.test(type) || type.includes('Model')) {
            return '// Optional - omit to use drop-in state';
        }
    }
    
    // Empty collections may need initialization
    if (value === 'new Set()' || value === 'new Map()') {
        return '// Initialize with useState or useRef';
    }
    
    // Route functions should return actual paths
    if (lowerName.includes('route') && value.includes("'/example-path'")) {
        return '// Return your actual route path';
    }
    
    return null;
}

/**
 * Generate a React component usage example
 * 
 * @param {Object} options - Generation options
 * @param {string} options.componentName - Name of the component
 * @param {string} options.packageName - Package import path
 * @param {Array<Object>} options.props - Component props to include in example
 * @param {string} options.props[].name - Prop name
 * @param {string} options.props[].type - Prop type
 * @param {boolean} options.props[].required - Whether prop is required
 * @param {boolean} options.selfClosing - Whether to use self-closing tag (default: true)
 * @param {number} options.maxProps - Maximum number of props to show (default: 3)
 * @returns {string} Formatted JSX code example
 * 
 * @example
 * generateReactExample({
 *   componentName: 'Cart',
 *   packageName: '@dropins/storefront-cart',
 *   props: [
 *     { name: 'sku', type: 'string', required: true },
 *     { name: 'quantity', type: 'number', required: false }
 *   ]
 * })
 */
export function generateReactExample(options) {
    const {
        componentName,
        packageName,
        props = [],
        selfClosing = true,
        maxProps = 3
    } = options;

    let example = '```jsx\n';
    example += `import { ${componentName} } from '${packageName}';\n\n`;
    example += 'export default function MyComponent() {\n';
    example += '  return (\n';
    example += `    <${componentName}`;

    // Filter to required props first, then optional, up to maxProps
    const requiredProps = props.filter(p => p.required);
    const optionalProps = props.filter(p => !p.required);
    const propsToShow = [...requiredProps, ...optionalProps].slice(0, maxProps);

    if (propsToShow.length > 0) {
        example += '\n';
        propsToShow.forEach(prop => {
            const value = inferExampleValue(prop.type, prop.name);

            // Format based on type
            if (prop.type.includes('string')) {
                example += `      ${prop.name}=${value}\n`;
            } else if (prop.type.includes('=>') || prop.type.includes('()')) {
                example += `      ${prop.name}={${value}}\n`;
            } else {
                example += `      ${prop.name}={${value}}\n`;
            }
        });
        example += '    ';
    }

    if (selfClosing) {
        example += '/>\n';
    } else {
        example += '>\n';
        example += `    </${componentName}>\n`;
    }

    example += '  );\n';
    example += '}\n';
    example += '```';

    return example;
}

/**
 * Generate a function call example
 * 
 * @param {Object} options - Generation options
 * @param {string} options.functionName - Name of the function
 * @param {string} options.packageName - Package import path
 * @param {Array<Object>} options.parameters - Function parameters
 * @param {string} options.parameters[].name - Parameter name
 * @param {string} options.parameters[].type - Parameter type
 * @param {boolean} options.parameters[].required - Whether parameter is required
 * @param {string} options.returnType - Return type (optional)
 * @param {boolean} options.isAsync - Whether function is async (default: true)
 * @param {string} options.language - Code language (default: 'js')
 * @returns {string} Formatted function call example
 * 
 * @example
 * generateFunctionExample({
 *   functionName: 'addToCart',
 *   packageName: '@dropins/storefront-cart/api',
 *   parameters: [
 *     { name: 'sku', type: 'string', required: true },
 *     { name: 'quantity', type: 'number', required: false }
 *   ],
 *   isAsync: true
 * })
 */
export function generateFunctionExample(options) {
    const {
        functionName,
        packageName,
        parameters = [],
        returnType = null,
        isAsync = true,
        language = 'js'
    } = options;

    let example = `\`\`\`${language}\n`;
    example += `import { ${functionName} } from '${packageName}';\n\n`;

    // Generate the function call
    const awaitKeyword = isAsync ? 'await ' : '';

    if (parameters.length === 0) {
        example += `const result = ${awaitKeyword}${functionName}();\n`;
    } else if (parameters.length === 1) {
        const param = parameters[0];
        const value = inferExampleValue(param.type, param.name);
        example += `const result = ${awaitKeyword}${functionName}(${value});\n`;
    } else {
        // Multiple parameters - use object syntax if all params are named
        const allNamed = parameters.every(p => p.name && p.name !== 'options');

        if (allNamed && parameters.length > 2) {
            // Use object destructuring style for readability
            example += `const result = ${awaitKeyword}${functionName}({\n`;
            parameters.forEach((param, index) => {
                const value = inferExampleValue(param.type, param.name);
                const comma = index < parameters.length - 1 ? ',' : '';
                example += `  ${param.name}: ${value}${comma}\n`;
            });
            example += '});\n';
        } else {
            // Use positional arguments
            const args = parameters
                .map(param => inferExampleValue(param.type, param.name))
                .join(', ');
            example += `const result = ${awaitKeyword}${functionName}(${args});\n`;
        }
    }

    example += '```';

    return example;
}

/**
 * Generate a simple code example from a code string
 * 
 * Formats a code string into a markdown code block with proper indentation and imports.
 * 
 * @param {Object} options - Generation options
 * @param {string} options.code - Raw code string
 * @param {string} options.language - Code language (default: 'js')
 * @param {string} options.importStatement - Optional import statement to prepend
 * @param {boolean} options.normalizeIndentation - Whether to normalize indentation (default: true)
 * @returns {string} Formatted code block
 * 
 * @example
 * generateCodeExample({
 *   code: 'const cart = await getCart();',
 *   importStatement: "import { getCart } from '@dropins/storefront-cart/api';",
 *   language: 'js'
 * })
 */
export function generateCodeExample(options) {
    const {
        code,
        language = 'js',
        importStatement = null,
        normalizeIndentation = true
    } = options;

    let formattedCode = code;

    // Normalize indentation if requested
    if (normalizeIndentation) {
        const lines = code.split('\n');
        let minIndent = Infinity;

        // Find minimum indentation
        lines.forEach(line => {
            if (line.trim().length > 0) {
                const leadingSpaces = line.match(/^(\s*)/)[1].length;
                minIndent = Math.min(minIndent, leadingSpaces);
            }
        });

        // Remove minimum indentation from all lines
        if (minIndent > 0 && minIndent < Infinity) {
            formattedCode = lines
                .map(line => line.length > minIndent ? line.substring(minIndent) : line)
                .join('\n');
        }
    }

    formattedCode = formattedCode.trim();

    // Build the code block
    let example = `\`\`\`${language}\n`;

    if (importStatement) {
        example += `${importStatement}\n\n`;
    }

    example += formattedCode;
    example += '\n```';

    return example;
}

/**
 * Generate a container usage example using provider.render() pattern
 * 
 * This generates examples that match the actual boilerplate usage pattern.
 * 
 * @param {Object} options - Generation options
 * @param {string} options.componentName - Name of the container component
 * @param {string} options.packageName - Package import path
 * @param {Array<Object>} options.props - Component props to include in example
 * @param {string} options.props[].name - Prop name
 * @param {string} options.props[].type - Prop type
 * @param {boolean} options.props[].required - Whether prop is required
 * @param {number} options.maxProps - Maximum number of props to show (default: 3)
 * @param {boolean} options.includeSlots - Whether to include a slots example (default: false)
 * @returns {string} Formatted JavaScript code example
 * 
 * @example
 * generateContainerExample({
 *   componentName: 'CompanyRegistration',
 *   packageName: '@dropins/storefront-company-management',
 *   props: [
 *     { name: 'isAuthenticated', type: 'boolean', required: false },
 *     { name: 'onRedirectLogin', type: '() => void', required: false }
 *   ]
 * })
 */
export function generateContainerExample(options) {
    const {
        componentName,
        packageName,
        props = [],
        maxProps = 3,
        includeSlots = false,
        useDiscoveredExamples = true
    } = options;

    // Try to use code-discovered example first (from boilerplate, checkout, etc.)
    if (useDiscoveredExamples) {
        const discovered = getBestDiscoveredExample(componentName, packageName);
        if (discovered?.config) {
            const { config, extraImports } = sanitizeDiscoveredConfig(discovered.config, packageName);
            // Skip discovered examples that still reference boilerplate-only identifiers (would cause ReferenceError)
            const hasUndefinedRefs = /\brootLink\b|\bCUSTOMER_NEGOTIABLE_QUOTE_PATH\b|\btryRenderAemAssetsImage\b/.test(config);
            // Skip empty discovered config when container has meaningful props (e.g. scope for PDP containers)
            const isEmptyConfig = /^\s*\{\s*\}$/.test(config.trim());
            const hasMeaningfulProps = props.some(p => inferExampleValue(p.type, p.name) !== 'undefined');
            if (!hasUndefinedRefs && !(isEmptyConfig && hasMeaningfulProps)) {
                const fromCheckout = discovered.file?.includes('commerce-checkout');
                let example = '```js\n';
                if (fromCheckout) {
                    example += '// From checkout PaymentMethods slot - ctx provides cartId\n';
                }
                extraImports.forEach(imp => { example += imp + '\n'; });
                example += `import { render as provider } from '${packageName}/render.js';\n`;
                example += `import { ${componentName} } from '${packageName}/containers/${componentName}.js';\n\n`;
                example += `await provider.render(${componentName}, ${formatConfigObject(config)})(block);\n`;
                example += '```';
                return example;
            }
        }
    }

    // Filter to required props first, then optional, up to maxProps
    const requiredProps = props.filter(p => p.required);
    const optionalPropsWithValues = props
        .filter(p => !p.required)
        // Omit optional props that would show as undefined - including them is redundant and confusing
        .filter(p => inferExampleValue(p.type, p.name) !== 'undefined');
    const optionalPropsFilteredOut = props
        .filter(p => !p.required)
        .filter(p => inferExampleValue(p.type, p.name) === 'undefined');
    let propsToShow = [...requiredProps, ...optionalPropsWithValues].slice(0, maxProps);

    // When config would be empty, show at least one prop so the example is useful
    if (propsToShow.length === 0 && optionalPropsFilteredOut.length > 0) {
        const firstFiltered = optionalPropsFilteredOut[0];
        propsToShow = [{
            ...firstFiltered,
            _showAsPlaceholder: true  // Use propName: propName pattern with comment
        }];
    }

    // getCartId and createCart are mutually exclusive (Apple Pay) - prefer getCartId
    if (propsToShow.some(p => p.name === 'getCartId') && propsToShow.some(p => p.name === 'createCart')) {
        propsToShow = propsToShow.filter(p => p.name !== 'createCart');
    }

    // Collect extra imports needed for context-appropriate examples
    const needsPaymentLocation = propsToShow.some(
        p => p.name === 'location' && (p.type.includes('PaymentLocation') || p.type.includes('Location'))
    );
    const needsGetCartData = propsToShow.some(
        p => p.name === 'getCartId' && packageName.includes('payment-services')
    );

    let example = '```js\n';
    if (needsPaymentLocation) {
        example += `import { PaymentLocation } from '${packageName}/api.js';\n`;
    }
    if (needsGetCartData) {
        example += `import { getCartData } from '@dropins/storefront-cart/api.js';\n`;
    }
    example += `import { render as provider } from '${packageName}/render.js';\n`;
    example += `import { ${componentName} } from '${packageName}/containers/${componentName}.js';\n\n`;

    // When showing placeholder for optional data prop, add const so example is runnable
    const placeholderProp = propsToShow.find(p => p._showAsPlaceholder);
    if (placeholderProp) {
        example += `// Omit ${placeholderProp.name} to use drop-in state. When passing from parent:\n`;
        example += `const ${placeholderProp.name} = props.${placeholderProp.name};\n\n`;
    }

    example += `await provider.render(${componentName}, {\n`;

    // Add props with helpful comments for values that need developer attention
    if (propsToShow.length > 0) {
        propsToShow.forEach(prop => {
            if (prop._showAsPlaceholder) {
                example += `  ${prop.name},\n`;
                return;
            }
            const value = inferExampleValue(prop.type, prop.name);
            // Skip generic comments for context-appropriate examples we've added
            const skipComment = (prop.name === 'location' && value.includes('PaymentLocation')) ||
                (prop.name === 'getCartId' && value.includes('getCartData')) ||
                (prop.name === 'createCart' && value.includes('getCartItems'));
            const comment = skipComment ? null : getValueComment(prop.type, prop.name, value);
            if (comment) {
                example += `  ${prop.name}: ${value}, ${comment}\n`;
            } else {
                example += `  ${prop.name}: ${value},\n`;
            }
        });
    }

    // Add slots example if requested
    if (includeSlots) {
        example += '  slots: {\n';
        example += '    // Add custom slot implementations here\n';
        example += '  }\n';
    }

    example += '})(block);\n';
    example += '```';

    return example;
}

/**
 * Generate multiple examples with titles
 * 
 * @param {Array<Object>} examples - Array of example objects
 * @param {string} examples[].title - Example title
 * @param {string} examples[].code - Example code
 * @param {string} examples[].description - Optional description
 * @param {Object} options - Generation options
 * @param {string} options.importStatement - Import statement to add to each example
 * @returns {string} Formatted examples with titles
 * 
 * @example
 * generateMultipleExamples([
 *   { title: 'Basic usage', code: 'const cart = await getCart();' },
 *   { title: 'With options', code: 'const cart = await getCart({ refresh: true });' }
 * ], { importStatement: "import { getCart } from '@dropins/storefront-cart/api';" })
 */
export function generateMultipleExamples(examples, options = {}) {
    const { importStatement = null } = options;

    if (!examples || examples.length === 0) {
        return '';
    }

    let output = '';

    examples.forEach((example, index) => {
        if (example.title) {
            output += `${example.title}:\n\n`;
        }

        if (example.description) {
            output += `${example.description}\n\n`;
        }

        // Generate code block
        output += generateCodeExample({
            code: example.code,
            language: example.language || 'js',
            importStatement: importStatement
        });

        // Add spacing between examples (except after last one)
        if (index < examples.length - 1) {
            output += '\n\n';
        }
    });

    return output;
}

