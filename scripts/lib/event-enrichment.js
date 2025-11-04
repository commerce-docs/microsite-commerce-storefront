/**
 * Event Enrichment Utilities
 * 
 * Similar to function enrichments, but for event payloads and descriptions.
 * Uses the shared EnrichmentLoader for loading enrichment files.
 */

import { EnrichmentLoader } from './core/enrichment-loader.js';

/**
 * Load event enrichments for a specific drop-in
 * @param {string} dropinName - Name of the drop-in (e.g., 'cart', 'checkout')
 * @returns {Object|null} Event enrichment data or null if not found
 */
export function loadEventEnrichments(dropinName) {
    const enrichment = EnrichmentLoader.load(dropinName, 'events');
    return Object.keys(enrichment).length > 0 ? enrichment : null;
}

/**
 * Get payload property description with fallback priority:
 * 1. Enrichment (manual override)
 * 2. Pattern-based generation
 * 3. Type-based inference
 * 4. Default fallback
 * 
 * @param {string} eventName - Event name (e.g., 'cart/merged')
 * @param {string} propertyName - Property name in the payload
 * @param {string} propertyType - TypeScript type of the property
 * @param {Object} enrichment - Enrichment data for the event
 * @returns {string} Best available description
 */
export function getPayloadPropertyDescription(eventName, propertyName, propertyType, enrichment) {
    // Priority 1: Enrichment (manual override)
    if (enrichment?.payload?.[propertyName]?.description) {
        return enrichment.payload[propertyName].description;
    }

    // Priority 2: Pattern-based generation for common properties
    const patternDescription = getPayloadPatternDescription(propertyName, propertyType, eventName);
    if (patternDescription) {
        return patternDescription;
    }

    // Priority 3: Type-based inference
    const inferredDescription = inferDescriptionFromType(propertyName, propertyType);
    if (inferredDescription) {
        return inferredDescription;
    }

    // Priority 4: Default fallback
    return 'See type definition in source code';
}

/**
 * Get description from common payload patterns
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @param {string} eventName - Event name for context
 * @returns {string|null} Pattern-based description or null
 */
function getPayloadPatternDescription(propertyName, propertyType, eventName) {
    const lowerName = propertyName.toLowerCase();
    const lowerType = propertyType.toLowerCase();

    // Common payload patterns
    if (lowerName === 'items' && lowerType.includes('item')) {
        return 'Array of items affected by this event';
    }
    if (lowerName === 'cart' || lowerName.includes('cart') && lowerType.includes('cart')) {
        return 'The current cart data structure';
    }
    if (lowerName === 'data' && lowerType.includes('model')) {
        return 'The data model containing updated information';
    }
    if (lowerName === 'address' && lowerType.includes('address')) {
        return 'Address information used in this operation';
    }
    if (lowerName === 'error' || lowerType.includes('error')) {
        return 'Error information if the operation failed';
    }
    if (lowerName.includes('method') && lowerType.includes('shipping')) {
        return 'Selected shipping method with cost and details';
    }
    if (lowerName === 'status' || lowerType.includes('status')) {
        return 'Status of the operation or current state';
    }
    if (lowerName.includes('old') || lowerName.includes('previous')) {
        return 'Previous state before the change';
    }
    if (lowerName.includes('new') || lowerName.includes('current')) {
        return 'New state after the change';
    }

    return null;
}

/**
 * Infer description from property type
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @returns {string|null} Inferred description or null
 */
function inferDescriptionFromType(propertyName, propertyType) {
    // Model types
    if (propertyType.includes('Model')) {
        const modelName = propertyType.replace(/\s*\|.*$/, '').trim(); // Remove union types
        return `${modelName} data structure`;
    }

    // Array types
    if (propertyType.includes('[]')) {
        const elementType = propertyType.replace('[]', '').replace(/\s*\|.*$/, '').trim();
        return `Array of ${elementType} objects`;
    }

    // Nullable types
    if (propertyType.includes('| null') || propertyType.includes('|null')) {
        return `${propertyName} value, or null if not available`;
    }

    // Boolean types
    if (propertyType === 'boolean') {
        return `Whether ${propertyName} is enabled or active`;
    }

    // String types
    if (propertyType === 'string') {
        return `${propertyName} value as a string`;
    }

    // Number types
    if (propertyType === 'number') {
        return `Numeric ${propertyName} value`;
    }

    return null;
}

/**
 * Get event description from enrichment or generate default
 * @param {string} eventName - Event name
 * @param {Object} enrichment - Enrichment data for the event
 * @param {string} generatedDescription - Default generated description
 * @returns {string} Best available description
 */
export function getEventDescription(eventName, enrichment, generatedDescription) {
    // Use enrichment description if available
    if (enrichment?.description) {
        return enrichment.description;
    }

    // Otherwise use generated description
    return generatedDescription;
}

