/**
 * Type Extractor
 * 
 * Extracts TypeScript type definitions from source code.
 * Used by generators to get type information for documentation.
 * 
 * @module lib/core/type-extractor
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * TypeScript Type Extractor
 * Handles extraction of types from .d.ts files and source code
 */
export class TypeExtractor {
    constructor(dropinPath) {
        this.dropinPath = dropinPath;
    }

    /**
     * Find event type definition file
     * Checks for both common naming conventions
     * 
     * @returns {string|null} Path to events type file or null
     * 
     * @example
     * const extractor = new TypeExtractor('/path/to/cart');
     * const eventTypePath = extractor.findEventTypeFile();
     */
    findEventTypeFile() {
        const possiblePaths = [
            join(this.dropinPath, 'src/types/events.d.ts'),
            join(this.dropinPath, 'src/types/event-bus.d.ts'),
            join(this.dropinPath, 'src/types/events.ts'),
            join(this.dropinPath, 'src/types/event-bus.ts')
        ];

        for (const path of possiblePaths) {
            if (existsSync(path)) {
                return path;
            }
        }

        return null;
    }

    /**
     * Extract all event types from events.d.ts or event-bus.d.ts
     * 
     * @returns {Map<string, string>} Map of event names to type definitions
     * 
     * @example
     * const extractor = new TypeExtractor('/path/to/cart');
     * const types = extractor.extractEventTypes();
     * const cartInitType = types.get('cart/initialized');
     */
    extractEventTypes() {
        const typedEvents = new Map();
        const eventsTypePath = this.findEventTypeFile();

        if (!eventsTypePath) {
            return typedEvents;
        }

        try {
            const eventsTypeFile = readFileSync(eventsTypePath, 'utf8');

            // Match event names and extract their type definitions with proper brace matching
            const eventNamePattern = /['"`]([^'"`]+)['"`]\s*:/g;
            let nameMatch;

            while ((nameMatch = eventNamePattern.exec(eventsTypeFile)) !== null) {
                const eventName = nameMatch[1];
                let startIndex = nameMatch.index + nameMatch[0].length;

                // Skip whitespace
                while (startIndex < eventsTypeFile.length && /\s/.test(eventsTypeFile[startIndex])) {
                    startIndex++;
                }

                // Extract the type definition by matching balanced braces
                let typeDef = '';
                let braceCount = 0;
                let inBraces = false;
                let i = startIndex;

                while (i < eventsTypeFile.length) {
                    const char = eventsTypeFile[i];

                    if (char === '{') {
                        braceCount++;
                        inBraces = true;
                        typeDef += char;
                    } else if (char === '}') {
                        braceCount--;
                        typeDef += char;
                        if (braceCount === 0 && inBraces) {
                            // Found matching closing brace, now look for semicolon
                            i++;
                            while (i < eventsTypeFile.length && /\s/.test(eventsTypeFile[i])) {
                                i++;
                            }
                            if (eventsTypeFile[i] === ';') {
                                break; // Complete type definition found
                            }
                        }
                    } else if (char === ';' && !inBraces) {
                        // Simple type (no braces), stop at semicolon
                        break;
                    } else {
                        typeDef += char;
                    }
                    i++;
                }

                // Clean up and normalize indentation
                typeDef = this.normalizeTypeDefinition(typeDef);
                typedEvents.set(eventName, typeDef);
            }
        } catch (error) {
            console.warn(`  ⚠️  Failed to parse event types: ${error.message}`);
        }

        return typedEvents;
    }

    /**
     * Normalize type definition formatting
     * Handles indentation for inline objects and multi-line types
     * 
     * @param {string} typeDef - Raw type definition
     * @returns {string} Normalized type definition
     * 
     * @private
     */
    normalizeTypeDefinition(typeDef) {
        typeDef = typeDef.trim();

        if (typeDef.includes('\n') && typeDef.startsWith('{')) {
            // For inline object types, preserve structure with proper indentation
            const lines = typeDef.split('\n');
            typeDef = lines.map((line, index) => {
                const trimmed = line.trim();
                // First line (opening brace) and last line (closing brace) - no indent
                if (index === 0 || trimmed === '}' || trimmed === '};') {
                    return trimmed.replace(/;$/, '');
                }
                // Property lines - indent with 2 spaces
                return '  ' + trimmed;
            }).join('\n');
        } else if (typeDef.includes('\n')) {
            // For multi-line non-object types, just trim each line
            typeDef = typeDef.split('\n').map(line => line.trim()).join('\n');
        }

        return typeDef;
    }

    /**
     * Extract a specific model definition from source code
     * 
     * @param {string} modelName - Name of the model/type to extract
     * @returns {string|null} Model definition or null if not found
     * 
     * @example
     * const extractor = new TypeExtractor('/path/to/cart');
     * const cartModelDef = extractor.extractModelDefinition('CartModel');
     */
    extractModelDefinition(modelName) {
        const possiblePaths = [
            join(this.dropinPath, 'data/models'),
            join(this.dropinPath, 'types'),
            join(this.dropinPath, 'api/types'),
            join(this.dropinPath, 'src/data/models'),
            join(this.dropinPath, 'src/types'),
            join(this.dropinPath, 'src/api/types'),
        ];

        for (const searchPath of possiblePaths) {
            if (!existsSync(searchPath)) continue;

            try {
                const files = readdirSync(searchPath, { recursive: true });
                for (const file of files) {
                    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;

                    const filePath = join(searchPath, file);
                    const content = readFileSync(filePath, 'utf8');

                    // Try to find and extract the type/interface with proper brace matching
                    const extracted = this.extractTypeWithBalancedBraces(content, modelName);
                    if (extracted) {
                        return this.cleanModelDefinition(extracted);
                    }
                }
            } catch (error) {
                // Continue searching other paths
                continue;
            }
        }

        return null;
    }

    /**
     * Extract a type or interface definition with proper brace matching
     * Handles nested braces correctly
     * 
     * @param {string} content - File content to search
     * @param {string} typeName - Name of the type/interface to extract
     * @returns {string|null} Complete type definition or null
     * 
     * @private
     */
    extractTypeWithBalancedBraces(content, typeName) {
        // Look for "export type TypeName =" or "export interface TypeName {"
        const typeStartPattern = new RegExp(`export\\s+(type|interface)\\s+${typeName}\\s*[={]`, 'g');
        const match = typeStartPattern.exec(content);

        if (!match) {
            return null;
        }

        const isInterface = match[1] === 'interface';
        const startIndex = match.index;

        // Find where the actual definition starts (after '=' for type, at '{' for interface)
        let defStartIndex = startIndex + match[0].length;

        // For types, we need to check if it's an object type or a simple type
        if (!isInterface) {
            // Back up to find the '=' sign
            defStartIndex = content.indexOf('=', startIndex) + 1;

            // Skip whitespace after '='
            while (defStartIndex < content.length && /\s/.test(content[defStartIndex])) {
                defStartIndex++;
            }

            // Check if it's an object type (starts with '{')
            if (content[defStartIndex] !== '{') {
                // Simple type - find the semicolon
                const semicolonIndex = content.indexOf(';', defStartIndex);
                if (semicolonIndex === -1) return null;
                return content.substring(startIndex, semicolonIndex + 1);
            }
        }

        // For object types and interfaces, match balanced braces
        let braceCount = 0;
        let i = isInterface ? defStartIndex - 1 : defStartIndex;
        let inString = false;
        let stringChar = '';

        // Start from the opening brace
        for (; i < content.length; i++) {
            const char = content[i];
            const prevChar = i > 0 ? content[i - 1] : '';

            // Handle string literals
            if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
                continue;
            }

            if (inString) continue;

            // Count braces
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    // Found matching closing brace, now find the semicolon
                    let j = i + 1;
                    while (j < content.length && /\s/.test(content[j])) {
                        j++;
                    }
                    if (content[j] === ';') {
                        return content.substring(startIndex, j + 1);
                    }
                    // For interfaces, semicolon is optional
                    if (isInterface) {
                        return content.substring(startIndex, i + 1);
                    }
                }
            }
        }

        return null;
    }

    /**
     * Clean model definition for display
     * Removes export keywords and normalizes formatting
     * 
     * @param {string} definition - Raw model definition
     * @returns {string} Cleaned definition
     * 
     * @private
     */
    cleanModelDefinition(definition) {
        // Remove 'export' keyword
        definition = definition.replace(/^export\s+/, '');

        // Normalize whitespace
        definition = definition.trim();

        return definition;
    }

    /**
     * Extract referenced types from a type definition
     * Finds all capitalized type names (excluding built-ins)
     * 
     * @param {string} typeDefinition - Type definition to analyze
     * @returns {Set<string>} Set of referenced type names
     * 
     * @example
     * const types = TypeExtractor.extractReferencedTypes('CartModel | null');
     * // Returns: Set(['CartModel'])
     */
    static extractReferencedTypes(typeDefinition) {
        const types = new Set();

        // Match type references that look like model names (capitalized, alphanumeric)
        const typePattern = /\b([A-Z][A-Za-z0-9]*)\b/g;
        let match;

        while ((match = typePattern.exec(typeDefinition)) !== null) {
            const typeName = match[1];
            // Exclude TypeScript built-in types
            if (!['Promise', 'Array', 'Record', 'Partial', 'Pick', 'Omit', 'Readonly', 'Required', 'Error'].includes(typeName)) {
                types.add(typeName);
            }
        }

        return types;
    }

    /**
     * Find all TypeScript definition files in a directory
     * 
     * @param {string} directory - Directory to search
     * @returns {string[]} Array of .d.ts file paths
     */
    static findDefinitionFiles(directory) {
        if (!existsSync(directory)) {
            return [];
        }

        const files = [];
        const entries = readdirSync(directory, { recursive: true, withFileTypes: true });

        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.d.ts')) {
                files.push(join(entry.path || directory, entry.name));
            }
        }

        return files;
    }
}

