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
 */

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

    // Handle array types
    if (type.includes('[]') || type.includes('Array<')) {
        return '[]';
    }

    // Handle function types
    if (type.includes('=>') || type.includes('()')) {
        if (lowerName.startsWith('on')) {
            const action = propName.substring(2);
            return `() => console.log('${action}')`;
        }
        return '() => {}';
    }

    // Handle specific types
    if (lowerType.includes('string')) {
        // Context-aware string examples
        if (lowerName.includes('sku')) return '"PRODUCT-SKU-123"';
        if (lowerName.includes('id')) return '"abc-123"';
        if (lowerName.includes('email')) return '"user@example.com"';
        if (lowerName.includes('url') || lowerName.includes('href')) return '"https://example.com"';
        if (lowerName.includes('name')) return '"Example Name"';
        if (lowerName.includes('title')) return '"Example Title"';
        if (lowerName.includes('description')) return '"Example description"';
        if (lowerName.includes('label')) return '"Label"';
        if (lowerName.includes('text')) return '"Text content"';
        if (lowerName.includes('class')) return '"custom-class"';
        return '"example"';
    }

    if (lowerType.includes('number')) {
        if (lowerName.includes('quantity')) return '1';
        if (lowerName.includes('price')) return '99.99';
        if (lowerName.includes('count')) return '10';
        if (lowerName.includes('id')) return '123';
        return '0';
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

    // Handle object types
    if (type.includes('{') || type.includes('object') || type.includes('Object')) {
        return '{}';
    }

    // Default: use the property name as a variable
    return propName || 'data';
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
        includeSlots = false
    } = options;

    let example = '```js\n';
    example += `import { render as provider } from '${packageName}/render.js';\n`;
    example += `import { ${componentName} } from '${packageName}/containers/${componentName}.js';\n\n`;
    example += `await provider.render(${componentName}, {\n`;

    // Filter to required props first, then optional, up to maxProps
    const requiredProps = props.filter(p => p.required);
    const optionalProps = props.filter(p => !p.required);
    const propsToShow = [...requiredProps, ...optionalProps].slice(0, maxProps);

    // Add props
    if (propsToShow.length > 0) {
        propsToShow.forEach(prop => {
            const value = inferExampleValue(prop.type, prop.name);
            example += `  ${prop.name}: ${value},\n`;
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

