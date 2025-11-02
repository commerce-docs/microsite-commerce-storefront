/**
 * Parameter Pattern Application
 * 
 * Applies reusable parameter description patterns from parameter-patterns.json
 * to generate consistent, developer-friendly descriptions across all drop-ins.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './generator-core.js';

let patternsCache = null;

/**
 * Load parameter patterns from JSON file
 * @returns {Object} Patterns object
 */
export function loadParameterPatterns() {
    if (patternsCache) {
        return patternsCache;
    }

    try {
        const patternsPath = join(getProjectRoot(), '_dropin-enrichments', 'parameter-patterns.json');
        const patternsContent = readFileSync(patternsPath, 'utf-8');
        patternsCache = JSON.parse(patternsContent);
        return patternsCache;
    } catch (error) {
        console.warn('  ⚠️  Could not load parameter-patterns.json:', error.message);
        return { patterns: {} };
    }
}

/**
 * Determine context from drop-in name and function name
 * @param {string} dropinName - Drop-in name (e.g., 'cart', 'wishlist', 'order')
 * @param {string} functionName - Function name (e.g., 'addProductsToCart')
 * @returns {string} Context key (e.g., 'cart', 'wishlist', 'update')
 */
function determineContext(dropinName, functionName) {
    const lowerFuncName = functionName.toLowerCase();

    // Function name-based context (more specific)
    if (lowerFuncName.includes('update')) {
        return 'update';
    }
    if (lowerFuncName.includes('add') || lowerFuncName.includes('insert')) {
        return 'add';
    }
    if (lowerFuncName.includes('remove') || lowerFuncName.includes('delete')) {
        return 'remove';
    }
    if (lowerFuncName.includes('guest')) {
        return 'guest_checkout';
    }
    if (lowerFuncName.includes('create')) {
        return 'create';
    }
    if (lowerFuncName.includes('initialize')) {
        return 'initialize';
    }
    if (lowerFuncName.includes('synchronize')) {
        return 'synchronize';
    }
    if (lowerFuncName.includes('apply')) {
        return 'apply';
    }
    if (lowerFuncName.includes('resend')) {
        return 'resend';
    }
    if (lowerFuncName.includes('confirm')) {
        return 'confirm';
    }
    if (lowerFuncName.includes('login') || lowerFuncName.includes('token')) {
        return 'login';
    }
    if (lowerFuncName.includes('password')) {
        return 'password';
    }
    if (lowerFuncName.includes('billing')) {
        return 'billing';
    }
    if (lowerFuncName.includes('shipping')) {
        return 'shipping';
    }
    if (lowerFuncName.includes('payment')) {
        return 'payment';
    }
    if (lowerFuncName.includes('estimate')) {
        return 'estimate';
    }
    if (lowerFuncName.includes('quote')) {
        return 'quote';
    }
    if (lowerFuncName.includes('coupon')) {
        return 'coupon_strategy';
    }

    // Drop-in name-based context (fallback)
    return dropinName || 'default';
}

/**
 * Apply parameter pattern to generate description
 * @param {string} paramName - Parameter name
 * @param {string} dropinName - Drop-in name for context
 * @param {string} functionName - Function name for additional context
 * @returns {string|null} Generated description or null if no pattern exists
 */
export function applyParameterPattern(paramName, dropinName, functionName) {
    const patterns = loadParameterPatterns();

    // Check if pattern exists for this parameter
    const pattern = patterns.patterns?.[paramName];
    if (!pattern) {
        return null;
    }

    // Determine context
    const context = determineContext(dropinName, functionName);

    // If there's a simple description template without variables, use it directly
    if (!pattern.description_template) {
        return null;
    }

    let description = pattern.description_template;

    // Replace {context} variable
    if (description.includes('{context}') && pattern.contexts) {
        const contextValue = pattern.contexts[context] || pattern.contexts['default'] || '';
        description = description.replace('{context}', contextValue);
    }

    // Replace {action} variable
    if (description.includes('{action}') && pattern.actions) {
        const actionValue = pattern.actions[context] || pattern.actions['default'] || pattern.actions['selected'] || '';
        description = description.replace('{action}', actionValue);
    }

    // Replace {example} variable
    if (description.includes('{example}') && pattern.examples) {
        // Try context-specific example, then 'configurable' as default for product params
        const exampleValue = pattern.examples[context] || pattern.examples['configurable'] || pattern.examples['default'] || '';
        description = description.replace('{example}', exampleValue);
    }

    // Replace {child_example} and {parent_example} for parentSku
    if (paramName === 'parentSku' && pattern.examples) {
        description = description.replace('{child_example}', pattern.examples.child_example || 'MS09-M-Blue');
        description = description.replace('{parent_example}', pattern.examples.parent_example || 'MS09');
    }

    // Replace {base_description} for quantity
    if (paramName === 'quantity' && pattern.base_descriptions) {
        const baseDesc = pattern.base_descriptions[context] || pattern.base_descriptions['default'] || '';
        description = description.replace('{base_description}', baseDesc);

        // Replace {constraint}
        if (pattern.constraints) {
            const constraint = pattern.constraints['positive'] || pattern.constraints['default'] || '';
            description = description.replace('{constraint}', constraint);
        }

        // Replace {example}
        if (pattern.examples) {
            const exampleValue = pattern.examples['single'] || pattern.examples['default'] || '';
            description = description.replace('{example}', exampleValue);
        }
    }

    // Replace {entity} and {examples} for customFields
    if (paramName === 'customFields') {
        if (pattern.entities) {
            const entity = context.includes('cart') ? 'cart_item' : context.includes('wishlist') ? 'wishlist_item' : 'default';
            const entityValue = pattern.entities[entity] || pattern.entities['default'] || 'item';
            description = description.replace('{entity}', entityValue);
        }

        if (pattern.example_sets) {
            const exampleSet = context.includes('cart') ? 'cart' : context.includes('order') ? 'order' : 'default';
            const examples = pattern.example_sets[exampleSet] || pattern.example_sets['default'] || 'additional metadata';
            description = description.replace('{examples}', examples);
        }
    }

    // Replace {address_type}, {action}, {optional_fields} for address
    if (paramName === 'address') {
        if (pattern.address_types) {
            const addrType = functionName.toLowerCase().includes('shipping') ? 'shipping' :
                functionName.toLowerCase().includes('billing') ? 'billing' :
                    functionName.toLowerCase().includes('customer') ? 'customer' : 'default';
            description = description.replace('{address_type}', pattern.address_types[addrType] || '');
        }

        if (pattern.actions) {
            const action = functionName.toLowerCase().includes('set') ? 'set' :
                functionName.toLowerCase().includes('create') ? 'create' :
                    functionName.toLowerCase().includes('update') ? 'update' : 'default';
            description = description.replace('{action}', pattern.actions[action] || '');
        }

        if (pattern.optional_field_sets) {
            description = description.replace('{optional_fields}', pattern.optional_field_sets['full'] || '');
        }
    }

    // Replace {item_type} for items parameter
    if (paramName === 'items' && pattern.item_types) {
        const itemType = pattern.item_types[dropinName] || pattern.item_types['default'] || 'items';
        description = description.replace('{item_type}', itemType);

        // Also replace {action} for items
        if (pattern.actions) {
            const action = pattern.actions[context] || pattern.actions['default'] || '';
            description = description.replace('{action}', action);
        }
    }

    // Replace {action} for couponCode
    if (paramName === 'couponCode' && pattern.actions) {
        const action = context === 'remove' ? 'remove' : 'apply';
        description = description.replace('{action}', pattern.actions[action] || pattern.actions['default'] || '');
    }

    // Replace {action} for input (address context)
    if (paramName === 'input' && description.includes('{action}')) {
        let action = 'set';
        if (context === 'billing' || context === 'shipping') {
            action = 'set';
        }
        description = description.replace('{action}', action);
    }

    // Replace {event} and {data} for callback
    if (paramName === 'callback') {
        if (pattern.events && description.includes('{event}')) {
            let eventKey = 'default';
            if (functionName.toLowerCase().includes('valid')) {
                eventKey = 'config_valid';
            } else if (functionName.toLowerCase().includes('values')) {
                eventKey = 'config_values';
            }
            description = description.replace('{event}', pattern.events[eventKey] || pattern.events['default'] || '');
        }

        if (pattern.data_types && description.includes('{data}')) {
            let dataKey = 'default';
            if (functionName.toLowerCase().includes('valid')) {
                dataKey = 'validity';
            } else if (functionName.toLowerCase().includes('values')) {
                dataKey = 'values';
            }
            description = description.replace('{data}', pattern.data_types[dataKey] || pattern.data_types['default'] || '');
        }
    }

    // Clean up any remaining unreplaced variables (shouldn't happen, but just in case)
    description = description.replace(/\{[^}]+\}/g, '');

    // Clean up any double spaces or extra whitespace
    description = description.replace(/\s{2,}/g, ' ').trim();

    return description;
}

/**
 * Get parameter description with fallback priority:
 * 1. Enrichment (manual override)
 * 2. Pattern-based generation
 * 3. Inline TypeScript comment
 * 4. Default fallback
 * 
 * @param {string} paramName - Parameter name
 * @param {Object} enrichment - Enrichment data for the function
 * @param {string} inlineComment - Inline TypeScript comment (if any)
 * @param {string} dropinName - Drop-in name
 * @param {string} functionName - Function name
 * @returns {string} Best available description
 */
export function getParameterDescription(paramName, enrichment, inlineComment, dropinName, functionName) {
    // Priority 1: Enrichment (manual override)
    if (enrichment?.parameters?.[paramName]?.description) {
        return enrichment.parameters[paramName].description;
    }

    // Priority 2: Pattern-based generation
    const patternDescription = applyParameterPattern(paramName, dropinName, functionName);
    if (patternDescription) {
        return patternDescription;
    }

    // Priority 3: Inline TypeScript comment
    if (inlineComment) {
        // Capitalize first letter and ensure it ends with a period
        let description = inlineComment.charAt(0).toUpperCase() + inlineComment.slice(1);
        if (!description.endsWith('.')) {
            description += '.';
        }
        return description;
    }

    // Priority 4: Default fallback
    return 'See function signature above';
}

