/**
 * React Props Extractor
 * 
 * Shared utilities for extracting React component Props from .tsx files and type definitions.
 * Handles JSDoc parsing, external type files, and property extraction.
 * 
 * Features:
 * - Extract Props interfaces from .tsx component files
 * - Find Props in external type files
 * - Parse JSDoc comments for property descriptions
 * - Extract property types and required status
 * - Handle slots extraction
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Extract JSDoc description for a property
 * 
 * Looks backward from the property definition to find the closest JSDoc comment.
 * 
 * @param {string} text - Full file or interface text
 * @param {string} propertyName - Name of the property to find docs for
 * @param {number} searchDistance - Maximum characters to search backward (default: 500)
 * @returns {string} Extracted description or empty string
 * 
 * @example
 * const text = `
 *   /**
 *    * The product SKU
 *    *\/
 *   sku: string;
 * `;
 * extractJSDocDescription(text, 'sku') // Returns: 'The product SKU'
 */
export function extractJSDocDescription(text, propertyName, searchDistance = 500) {
    if (!text || !propertyName) return '';

    // Find the property position first
    const propIndex = text.indexOf(propertyName);
    if (propIndex === -1) return '';

    // Look backwards from the property for the closest JSDoc comment
    const searchStart = Math.max(0, propIndex - searchDistance);
    const searchText = text.substring(searchStart, propIndex);

    // Find the last JSDoc comment before the property
    const jsDocPattern = /\/\*\*([\s\S]*?)\*\//g;
    let lastMatch = null;
    let match;

    while ((match = jsDocPattern.exec(searchText)) !== null) {
        lastMatch = match;
    }

    if (lastMatch) {
        // Clean up JSDoc comment
        const comment = lastMatch[1]
            .split('\n')
            .map(line => {
                // Remove leading * and whitespace
                return line.replace(/^\s*\*\s?/, '').trim();
            })
            .filter(line => {
                // Remove JSDoc tags like @param, @returns, etc.
                return line && !line.startsWith('@');
            })
            .join(' ')
            .trim();

        return comment || '';
    }

    return '';
}

/**
 * Parse a Props interface to extract individual properties
 * 
 * Extracts property name, type, required status, and description from JSDoc.
 * 
 * @param {string} interfaceContent - Content between the interface braces
 * @param {string} fullText - Full file text (for JSDoc extraction)
 * @param {Object} options - Parsing options
 * @param {boolean} options.includeSlots - Whether to include slot properties (default: false)
 * @param {Function} options.descriptionGenerator - Function to generate descriptions if JSDoc missing
 * @returns {Array<Object>} Array of property objects
 * 
 * @example
 * const interfaceContent = `
 *   sku: string;
 *   quantity?: number;
 *   onAddToCart?: () => void;
 * `;
 * parsePropsInterface(interfaceContent, fullText)
 * // Returns: [
 * //   { name: 'sku', type: 'string', required: true, description: '...' },
 * //   { name: 'quantity', type: 'number', required: false, description: '...' },
 * //   { name: 'onAddToCart', type: '() => void', required: false, description: '...' }
 * // ]
 */
export function parsePropsInterface(interfaceContent, fullText, options = {}) {
    const {
        includeSlots = false,
        descriptionGenerator = null
    } = options;

    const props = [];

    // Remove JSDoc comments from interface content to avoid parsing them as properties
    // Keep the original for JSDoc extraction later
    const cleanedContent = interfaceContent.replace(/\/\*\*[\s\S]*?\*\//g, '');

    // Parse properties with balanced brace/bracket/paren tracking
    // This handles complex nested types like (params: { foo: Bar, baz: Qux }) => void
    let i = 0;
    while (i < cleanedContent.length) {
        // Skip whitespace
        while (i < cleanedContent.length && /\s/.test(cleanedContent[i])) {
            i++;
        }

        if (i >= cleanedContent.length) break;

        // Match property name (word characters, followed by optional ?, then :)
        const propMatch = cleanedContent.substring(i).match(/^(\w+)(\??)\s*:\s*/);
        if (!propMatch) {
            // Skip to next potential property (after semicolon or comma)
            const nextDelim = cleanedContent.indexOf(';', i);
            if (nextDelim === -1) break;
            i = nextDelim + 1;
            continue;
        }

        const propertyName = propMatch[1];
        const isOptional = propMatch[2] === '?';
        i += propMatch[0].length;

        // Extract type with balanced delimiters
        let type = '';
        let depth = { braces: 0, brackets: 0, parens: 0, angles: 0 };
        let inString = false;
        let stringChar = '';

        while (i < cleanedContent.length) {
            const char = cleanedContent[i];

            // Handle string literals
            if ((char === '"' || char === "'" || char === '`') && cleanedContent[i - 1] !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
                type += char;
                i++;
                continue;
            }

            if (inString) {
                type += char;
                i++;
                continue;
            }

            // Track nesting depth
            // Special case: Don't treat `=>` arrow operator as angle bracket
            const prevChar = i > 0 ? cleanedContent[i - 1] : '';
            const nextChar = i + 1 < cleanedContent.length ? cleanedContent[i + 1] : '';
            const isArrowOperator = char === '=' && nextChar === '>';

            if (char === '{') depth.braces++;
            else if (char === '}') depth.braces--;
            else if (char === '[') depth.brackets++;
            else if (char === ']') depth.brackets--;
            else if (char === '(') depth.parens++;
            else if (char === ')') depth.parens--;
            else if (char === '<' && !isArrowOperator) depth.angles++;
            else if (char === '>' && prevChar !== '=') depth.angles--;

            // Check if we've reached the end of the type (semicolon or comma at depth 0)
            const isAtTopLevel = depth.braces === 0 && depth.brackets === 0 &&
                depth.parens === 0 && depth.angles === 0;

            if (isAtTopLevel && (char === ';' || char === ',')) {
                i++; // Skip the delimiter
                break;
            }

            type += char;
            i++;
        }

        type = type.trim();

        // Skip slots unless explicitly requested
        if (!includeSlots && propertyName.toLowerCase().includes('slot')) {
            continue;
        }

        // Check if property is required
        const required = !isOptional;

        // Try to get JSDoc description
        let description = extractJSDocDescription(fullText, propertyName);

        // If no JSDoc and generator provided, generate description
        if (!description && descriptionGenerator) {
            description = descriptionGenerator(propertyName, type);
        }

        props.push({
            name: propertyName,
            type: simplifyType(type),
            required,
            description
        });
    }

    return props;
}

/**
 * Simplify TypeScript type for display in documentation tables
 * 
 * Converts complex function signatures and generic types to simple labels
 * for better readability in configuration tables.
 * 
 * @param {string} type - TypeScript type string
 * @returns {string} Simplified type
 * 
 * @example
 * simplifyType('() => void') // Returns: 'function'
 * simplifyType('(item: Item) => string') // Returns: 'function'
 * simplifyType('SlotProps<ComplexType>') // Returns: 'SlotProps'
 * simplifyType('string') // Returns: 'string'
 */
export function simplifyType(type) {
    if (!type) return type;
    
    const trimmedType = type.trim();
    
    // Check if this is a function type:
    // - Arrow functions: () => void, (x: string) => number
    // - Function keyword: Function, (() => void) | undefined
    if (
        trimmedType.includes('=>') ||
        trimmedType === 'Function' ||
        /^\([^)]*\)\s*=>/.test(trimmedType)
    ) {
        return 'function';
    }
    
    // Simplify SlotProps with complex generics: SlotProps<ComplexType> → SlotProps
    if (trimmedType.startsWith('SlotProps<')) {
        return 'SlotProps';
    }
    
    return type;
}

/**
 * Extract slots from a Props interface
 * 
 * Handles two patterns:
 * 1. Direct slot properties: headerSlot?: SlotProps;
 * 2. Nested slots object: slots?: { Header?: SlotProps; Footer?: SlotProps; }
 * 
 * @param {string} interfaceContent - Content between the interface braces
 * @returns {Array<Object>} Array of slot objects
 * 
 * @example
 * const interfaceContent = `
 *   headerSlot?: SlotProps;
 *   slots?: { Header?: SlotProps; Footer?: SlotProps; };
 * `;
 * extractSlotsFromInterface(interfaceContent)
 * // Returns: [
 * //   { name: 'headerSlot', type: 'SlotProps', required: false },
 * //   { name: 'Header', type: 'SlotProps', required: false },
 * //   { name: 'Footer', type: 'SlotProps', required: false }
 * // ]
 */
export function extractSlotsFromInterface(interfaceContent) {
    const allProps = parsePropsInterface(interfaceContent, interfaceContent, { includeSlots: true });
    const extractedSlots = [];

    for (const prop of allProps) {
        const propName = prop.name.toLowerCase();
        
        // Case 1: Property is named exactly "slots" - extract nested slots
        if (propName === 'slots' && prop.type.trim().startsWith('{')) {
            // Parse the nested object to extract individual slots
            const nestedSlots = parsePropsInterface(prop.type, prop.type, { includeSlots: true });
            extractedSlots.push(...nestedSlots);
        }
        // Case 2: Property name contains "slot" but isn't exactly "slots"
        else if (propName.includes('slot') && propName !== 'slots') {
            extractedSlots.push(prop);
        }
    }

    return extractedSlots;
}

/**
 * Find Props interface in external type files
 * 
 * Searches common locations for TypeScript type definition files
 * that might contain the Props interface.
 * 
 * @param {string} repoPath - Path to the repository
 * @param {string} componentName - Name of the component (for path inference)
 * @returns {Object|null} Object with { content, fullText } or null if not found
 * 
 * @example
 * findPropsInTypeFiles('/path/to/repo', 'Cart')
 * // Returns: { content: 'sku: string; ...', fullText: 'export interface CartProps { ... }' }
 */
export function findPropsInTypeFiles(repoPath, componentName) {
    // Convert PascalCase to camelCase for some naming patterns
    const camelCaseName = componentName.charAt(0).toLowerCase() + componentName.slice(1);

    const possiblePaths = [
        join(repoPath, 'src', 'containers', componentName, 'types.ts'),
        join(repoPath, 'src', 'containers', componentName, `${componentName}.types.ts`),
        join(repoPath, 'src', 'components', componentName, 'types.ts'),
        join(repoPath, 'src', 'components', componentName, `${componentName}.types.ts`),
        join(repoPath, 'src', 'types', 'containers.ts'),
        join(repoPath, 'src', 'types', 'components.ts'),
        join(repoPath, 'src', 'types', `${componentName}.ts`),
        // CamelCase patterns directly in src/types (Company Management pattern)
        join(repoPath, 'src', 'types', `${camelCaseName}.types.ts`),
        join(repoPath, 'src', 'types', `${componentName}.types.ts`),
        // Additional patterns for B2B drop-ins (e.g., Purchase Order)
        join(repoPath, 'src', 'types', 'containers', `${camelCaseName}.types.ts`),
        join(repoPath, 'src', 'types', 'containers', `${componentName}.types.ts`),
        join(repoPath, 'src', 'types', 'components', `${camelCaseName}.types.ts`),
        join(repoPath, 'src', 'types', 'components', `${componentName}.types.ts`)
    ];

    for (const path of possiblePaths) {
        if (existsSync(path)) {
            const content = readFileSync(path, 'utf8');

            // Look for Props interface (with or without export)
            // Specifically match {ComponentName}Props to avoid matching wrong interfaces
            const componentPropsRegex = new RegExp(`(?:export\\s+)?interface\\s+${componentName}Props\\s*(?:extends\\s+[^{]+)?\\s*{`);
            const genericPropsRegex = /(?:export\s+)?interface\s+Props\s*(?:extends\s+[^{]+)?\s*{/;
            const propsInterfaceStartMatch = content.match(componentPropsRegex) || content.match(genericPropsRegex);

            if (propsInterfaceStartMatch) {
                // Find the position right after the opening brace
                const startPos = propsInterfaceStartMatch.index + propsInterfaceStartMatch[0].length;

                // Use balanced brace matching to find the closing brace
                let braceCount = 1;
                let endPos = startPos;

                while (endPos < content.length && braceCount > 0) {
                    const char = content[endPos];
                    if (char === '{') {
                        braceCount++;
                    } else if (char === '}') {
                        braceCount--;
                    }
                    endPos++;
                }

                if (braceCount === 0) {
                    // Successfully found matching closing brace
                    const interfaceContent = content.substring(startPos, endPos - 1);
                    return {
                        content: interfaceContent,
                        fullText: content
                    };
                }
            }
        }
    }

    return null;
}

/**
 * Extract Props interface from a component file
 * 
 * Main entry point for extracting Props from a React component.
 * Looks in the file itself first, then searches external type files.
 * 
 * @param {string} filePath - Path to the component file (.tsx)
 * @param {string} componentName - Name of the component
 * @param {string} repoPath - Path to the repository (for external type file search)
 * @param {Object} options - Extraction options
 * @param {boolean} options.includeSlots - Whether to include slots (default: false)
 * @param {Function} options.descriptionGenerator - Function to generate descriptions
 * @returns {Object} Object with { props, slots, interfaceContent, fullText }
 * 
 * @example
 * const result = extractPropsFromComponent(
 *   '/path/to/Cart/Cart.tsx',
 *   'Cart',
 *   '/path/to/repo'
 * );
 * // Returns: { props: [...], slots: [...], interfaceContent: '...', fullText: '...' }
 */
export function extractPropsFromComponent(filePath, componentName, repoPath, options = {}) {
    const {
        includeSlots = false,
        descriptionGenerator = null
    } = options;

    try {
        const content = readFileSync(filePath, 'utf8');

        // Try to find Props interface in the same file
        let propsInterfaceContent = '';
        let fullText = content;

        // Match both "interface Props" and "export interface Props"
        // Also handle interfaces that extend other interfaces
        // Specifically match {ComponentName}Props to avoid matching wrong interfaces
        const componentPropsRegex = new RegExp(`(?:export\\s+)?interface\\s+${componentName}Props\\s*(?:extends\\s+[^{]+)?\\s*{`);
        const genericPropsRegex = /(?:export\s+)?interface\s+Props\s*(?:extends\s+[^{]+)?\s*{/;
        const propsInterfaceStartMatch = content.match(componentPropsRegex) || content.match(genericPropsRegex);

        if (propsInterfaceStartMatch) {
            // Find the position right after the opening brace
            const startPos = propsInterfaceStartMatch.index + propsInterfaceStartMatch[0].length;

            // Use balanced brace matching to find the closing brace
            let braceCount = 1;
            let endPos = startPos;

            while (endPos < content.length && braceCount > 0) {
                const char = content[endPos];
                if (char === '{') {
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                }
                endPos++;
            }

            if (braceCount === 0) {
                // Successfully found matching closing brace
                propsInterfaceContent = content.substring(startPos, endPos - 1);
            }
        } else {
            // Look in external type files
            const externalProps = findPropsInTypeFiles(repoPath, componentName);
            if (externalProps) {
                propsInterfaceContent = externalProps.content;
                fullText = externalProps.fullText;
            }
        }

        if (!propsInterfaceContent) {
            return { props: [], slots: [], interfaceContent: '', fullText: content };
        }

        // Parse props and slots
        const props = parsePropsInterface(propsInterfaceContent, fullText, {
            includeSlots,
            descriptionGenerator
        });

        const slots = extractSlotsFromInterface(propsInterfaceContent);

        return {
            props,
            slots,
            interfaceContent: propsInterfaceContent,
            fullText
        };
    } catch (error) {
        console.warn(`  ⚠️  Error extracting props from ${filePath}:`, error.message);
        return { props: [], slots: [], interfaceContent: '', fullText: '' };
    }
}

/**
 * Extract slots section from Props interface
 * 
 * Some components have a nested `slots` property containing slot definitions.
 * This extracts that specific nested structure.
 * 
 * @param {string} interfaceContent - Props interface content
 * @returns {string|null} Slots section content or null if not found
 * 
 * @example
 * const interfaceContent = `
 *   sku: string;
 *   slots?: {
 *     header?: SlotProps;
 *     footer?: SlotProps;
 *   };
 * `;
 * extractSlotsSection(interfaceContent)
 * // Returns: 'header?: SlotProps;\n    footer?: SlotProps;'
 */
export function extractSlotsSection(interfaceContent) {
    // Find the start of the slots section (matches both "slots?:" and "slots:")
    const slotsStartPattern = /slots\??:\s*{/;
    const slotsStartMatch = interfaceContent.match(slotsStartPattern);

    if (!slotsStartMatch) {
        return null;
    }

    // Find the position right after "slots?: {" or "slots: {"
    const startPos = slotsStartMatch.index + slotsStartMatch[0].length;

    // Use balanced brace matching to find the closing brace
    let braceCount = 1;
    let endPos = startPos;

    while (endPos < interfaceContent.length && braceCount > 0) {
        const char = interfaceContent[endPos];
        if (char === '{') {
            braceCount++;
        } else if (char === '}') {
            braceCount--;
        }
        endPos++;
    }

    if (braceCount !== 0) {
        // Didn't find matching closing brace
        return null;
    }

    // Extract the content between the braces (excluding the closing brace)
    let slotsContent = interfaceContent.substring(startPos, endPos - 1).trim();

    // Clean up the content - keep only the slot definitions
    // Remove comments
    slotsContent = slotsContent.replace(/\/\*[\s\S]*?\*\//g, '');
    slotsContent = slotsContent.replace(/\/\/.*/g, '');

    return slotsContent;
}

