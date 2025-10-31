/**
 * Data Models Generator
 * 
 * Generates "Data Models" documentation sections.
 * Used to document TypeScript types/interfaces referenced in events, functions, etc.
 * 
 * @module lib/core/data-models-generator
 */

/**
 * Data Models Generator
 * Tracks and generates documentation for data models
 */
export class DataModelsGenerator {
    constructor() {
        // Map<modelName, {definition, usedBy, description}>
        this.models = new Map();
    }

    /**
     * Track a model for documentation
     * 
     * @param {string} modelName - Name of the model
     * @param {string} definition - TypeScript definition
     * @param {string} usedBy - Context where model is used (e.g., 'cart/data')
     * @param {string} description - Editorial description
     * 
     * @example
     * generator.trackModel('CartModel', 'interface CartModel {...}', 'cart/data', 'The cart model...');
     */
    trackModel(modelName, definition, usedBy, description = '') {
        if (!this.models.has(modelName)) {
            this.models.set(modelName, {
                definition,
                usedBy: [],
                description
            });
        }

        const model = this.models.get(modelName);
        if (usedBy && !model.usedBy.includes(usedBy)) {
            model.usedBy.push(usedBy);
        }

        // Update description if provided and not already set
        if (description && !model.description) {
            model.description = description;
        }
    }

    /**
     * Set description for a model
     * 
     * @param {string} modelName - Name of the model
     * @param {string} description - Editorial description
     */
    setDescription(modelName, description) {
        if (this.models.has(modelName)) {
            this.models.get(modelName).description = description;
        }
    }

    /**
     * Check if a model is tracked
     * 
     * @param {string} modelName - Name of the model
     * @returns {boolean} True if model is tracked
     */
    hasModel(modelName) {
        return this.models.has(modelName);
    }

    /**
     * Get model data
     * 
     * @param {string} modelName - Name of the model
     * @returns {Object|null} Model data or null
     */
    getModel(modelName) {
        return this.models.get(modelName) || null;
    }

    /**
     * Get all tracked models
     * 
     * @returns {Map} Map of all models
     */
    getAllModels() {
        return this.models;
    }

    /**
     * Generate Data Models section markdown
     * 
     * @param {Object} options - Generation options
     * @param {string} options.title - Section title (default: "Data Models")
     * @param {string} options.contextType - Type of context (e.g., "event", "function")
     * @param {Function} options.linkFormatter - Optional function to format "Used in" links
     * @returns {string} Generated markdown
     * 
     * @example
     * const markdown = generator.generateSection({
     *   title: 'Data Models',
     *   contextType: 'event'
     * });
     */
    generateSection(options = {}) {
        const {
            title = 'Data Models',
            contextType = 'event',
            linkFormatter = null
        } = options;

        if (this.models.size === 0) {
            return '';
        }

        let markdown = `## ${title}\n\n`;
        markdown += `The following TypeScript types are used in ${contextType} payloads:\n\n`;

        // Sort models alphabetically
        const sortedModels = Array.from(this.models.entries()).sort((a, b) => 
            a[0].localeCompare(b[0])
        );

        for (const [modelName, modelData] of sortedModels) {
            markdown += `### ${modelName}\n\n`;

            // Add description if available
            if (modelData.description) {
                markdown += `${modelData.description}\n\n`;
            }

            // Add "Used in" information
            if (modelData.usedBy && modelData.usedBy.length > 0) {
                const usedByLinks = modelData.usedBy.map(context => {
                    if (linkFormatter) {
                        return linkFormatter(context, contextType);
                    }
                    // Default formatter
                    const anchor = context.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return `[\`${context}\`](#${anchor})`;
                });

                markdown += `Used in: ${usedByLinks.join(', ')}.\n\n`;
            }

            // Add type definition
            markdown += '```ts\n';
            markdown += modelData.definition + '\n';
            markdown += '```\n\n';
        }

        return markdown;
    }

    /**
     * Clear all tracked models
     */
    clear() {
        this.models.clear();
    }

    /**
     * Get model count
     * 
     * @returns {number} Number of tracked models
     */
    count() {
        return this.models.size;
    }

    /**
     * Create a link formatter function for events
     * 
     * @param {string} dropinName - Name of the drop-in
     * @returns {Function} Link formatter function
     * 
     * @example
     * const formatter = DataModelsGenerator.createEventLinkFormatter('cart');
     * generator.generateSection({ linkFormatter: formatter });
     */
    static createEventLinkFormatter(dropinName) {
        return (eventName, contextType) => {
            const anchor = eventName.toLowerCase().replace(/[^a-z0-9-]/g, '');
            return `[\`${eventName}\`](#${anchor})`;
        };
    }

    /**
     * Create a link formatter function for functions
     * 
     * @param {string} dropinName - Name of the drop-in
     * @returns {Function} Link formatter function
     */
    static createFunctionLinkFormatter(dropinName) {
        return (functionName, contextType) => {
            const anchor = functionName.toLowerCase();
            return `[\`${functionName}\`](#${anchor})`;
        };
    }
}

