/**
 * GenericTypeHandler
 * 
 * Utility for identifying and filtering out "generic" or unhelpful TypeScript types
 * from documentation (e.g., `any`, `unknown`, `Record<string, any>`)
 */
export class GenericTypeHandler {
    /**
     * Check if a type string is considered "generic" or unhelpful for documentation
     * @param {string} typeString - The type string to check
     * @returns {boolean} - True if the type is generic/unhelpful
     */
    static isGenericType(typeString) {
        if (!typeString || typeof typeString !== 'string') {
            return true;
        }

        const trimmed = typeString.trim();

        // Empty or just whitespace
        if (!trimmed || trimmed === '') {
            return true;
        }

        // Exact matches for unhelpful types
        const exactGenericTypes = [
            'any',
            'unknown',
            'never',
            'void',
            'undefined',
            'null',
            'object',
            'Object',
            'Function',
        ];

        if (exactGenericTypes.includes(trimmed)) {
            return true;
        }

        // Check for 'any' in the type (but allow legitimate uses like any[])
        if (trimmed.includes('any')) {
            // Check if it's a legitimate usage of 'any'
            if (this.isLegitimateAnyUsage(trimmed)) {
                return false;
            }
            // Has 'any' and it's not legitimate
            // But allow 'any[]' (array of any) as it's much less problematic
            if ((trimmed.includes(': any') || trimmed.includes('): any')) &&
                !trimmed.includes(': any[')) {
                return true;
            }
        }

        // Check for generic Record types
        if (trimmed.match(/^Record<string,\s*(any|unknown)>$/)) {
            return true;
        }

        // Check for generic object literals with only 'any' values
        if (trimmed.match(/^\{\s*\[.*\]:\s*any\s*\}$/)) {
            return true;
        }

        return false;
    }

    /**
     * Check if a usage of 'any' is legitimate (e.g., in array types, generics)
     * @param {string} typeString - The type string to check
     * @returns {boolean} - True if the 'any' usage is acceptable
     */
    static isLegitimateAnyUsage(typeString) {
        // Array of any is acceptable (any[])
        if (typeString.includes('any[]')) {
            return true;
        }

        // Array<any> is acceptable
        if (typeString.includes('Array<any>')) {
            return true;
        }

        // Generic with any as type parameter in complex types
        // e.g., Promise<any>, Observable<any>
        if (typeString.match(/\w+<any>/)) {
            return true;
        }

        return false;
    }

    /**
     * Extract a clean type string, filtering out generic types
     * @param {string} typeString - The type string to clean
     * @returns {string|null} - Cleaned type string or null if generic
     */
    static extractCleanType(typeString) {
        if (this.isGenericType(typeString)) {
            return null;
        }
        return typeString.trim();
    }

    /**
     * Validate and clean a type definition for documentation
     * @param {string} typeString - The type string to validate
     * @param {string} context - Context for logging (e.g., "Event payload")
     * @returns {Object} - { isValid: boolean, cleanType: string|null, reason: string }
     */
    static validateType(typeString, context = '') {
        if (!typeString) {
            return {
                isValid: false,
                cleanType: null,
                reason: 'Empty type string',
            };
        }

        const cleanType = this.extractCleanType(typeString);

        if (!cleanType) {
            return {
                isValid: false,
                cleanType: null,
                reason: `Generic or unhelpful type: ${typeString}`,
            };
        }

        return {
            isValid: true,
            cleanType,
            reason: 'Valid type',
        };
    }
}

