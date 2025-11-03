/**
 * Generic Type Handler
 * 
 * Detects and handles generic/useless types like 'any', 'unknown', 'object'.
 * Used by all generators to ensure type quality in documentation.
 * 
 * @module lib/core/generic-type-handler
 */

/**
 * Handles detection and validation of generic types
 */
export class GenericTypeHandler {
    /**
     * Check if a type is generic/useless
     * 
     * @param {string} typeString - The type to check
     * @returns {boolean} True if the type is generic
     * 
     * @example
     * GenericTypeHandler.isGenericType('any') // true
     * GenericTypeHandler.isGenericType('string') // false
     * GenericTypeHandler.isGenericType('{ oldCartItems: any[] }') // true
     * GenericTypeHandler.isGenericType('{ [key: string]: any }') // false (legitimate)
     */
    static isGenericType(typeString) {
        if (!typeString) return false;

        const trimmed = typeString.trim();

        // Standalone generic types
        if (['any', 'unknown', 'object', 'Object'].includes(trimmed)) {
            return true;
        }

        // Contains 'any' in properties (but check for legitimate uses first)
        if (trimmed.includes('any')) {
            if (this.isLegitimateAnyUsage(trimmed)) {
                return false;
            }
            // Has 'any' and it's not legitimate
            if (trimmed.includes(': any') || trimmed.includes('): any')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if 'any' usage is legitimate
     * 
     * Legitimate cases include:
     * - Index signatures: { [key: string]: any }
     * - Record types: Record<string, any>
     * - Complex mapped types with dynamic keys
     * 
     * @param {string} typeString - The type string to check
     * @returns {boolean} True if 'any' usage is legitimate
     * 
     * @example
     * GenericTypeHandler.isLegitimateAnyUsage('{ [key: string]: any }') // true
     * GenericTypeHandler.isLegitimateAnyUsage('Record<string, any>') // true
     * GenericTypeHandler.isLegitimateAnyUsage('{ foo: any }') // false
     */
    static isLegitimateAnyUsage(typeString) {
        // Index signatures like { [key: string]: any }
        if (typeString.match(/\[key:\s*string\]:\s*any/)) {
            return true;
        }

        // Record types like Record<string, any> or Record<K, any>
        if (typeString.match(/Record<[^,]+,\s*any>/)) {
            return true;
        }

        // Allow [key: string]: any with various spacing
        if (typeString.match(/\[\s*key\s*:\s*string\s*\]\s*:\s*any/)) {
            return true;
        }

        return false;
    }

    /**
     * Should this type be displayed to users?
     * 
     * @param {string} typeString - The type to check
     * @returns {boolean} True if type should be displayed, false if it should be hidden
     * 
     * @example
     * GenericTypeHandler.shouldDisplayType('string') // true
     * GenericTypeHandler.shouldDisplayType('any') // false
     * GenericTypeHandler.shouldDisplayType('CartModel | null') // true
     */
    static shouldDisplayType(typeString) {
        return !this.isGenericType(typeString);
    }

    /**
     * Get a list of forbidden type strings
     * 
     * @returns {string[]} Array of forbidden type names
     */
    static getForbiddenTypes() {
        return ['any', 'unknown', 'object', 'Object'];
    }

    /**
     * Check if a type contains any forbidden type
     * 
     * @param {string} typeString - The type to check
     * @returns {boolean} True if contains forbidden types
     */
    static containsForbiddenType(typeString) {
        if (!typeString) return false;

        const forbidden = this.getForbiddenTypes();
        return forbidden.some(type => {
            const regex = new RegExp(`\\b${type}\\b`);
            if (regex.test(typeString)) {
                // Found forbidden type, but check if it's legitimate
                return !this.isLegitimateAnyUsage(typeString);
            }
            return false;
        });
    }
}

