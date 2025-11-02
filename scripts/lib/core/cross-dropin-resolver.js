/**
 * Cross-Dropin Resolver
 * 
 * Resolves types and enrichments across drop-ins.
 * Handles cases where one drop-in listens to events from another.
 * 
 * @module lib/core/cross-dropin-resolver
 */

import { EnrichmentLoader } from './enrichment-loader.js';

/**
 * Cross-Dropin Resolver
 * Handles resolution of types and data across drop-ins
 */
export class CrossDropinResolver {
    /**
     * Detect which drop-in is the source (emitter) of an event
     * 
     * @param {string} eventName - Event name (e.g., 'checkout/initialized')
     * @param {Map} eventEmits - Map of events emitted by current drop-in
     * @param {string} currentDropin - Current drop-in name
     * @returns {string|null} Source drop-in name or null
     * 
     * @example
     * const source = CrossDropinResolver.detectSourceDropin(
     *   'checkout/initialized',
     *   cartEventEmits,
     *   'cart'
     * );
     * // Returns: 'checkout' (inferred from event name prefix)
     */
    static detectSourceDropin(eventName, eventEmits, currentDropin) {
        // If current drop-in emits it, return current
        if (eventEmits.has(eventName)) {
            return currentDropin;
        }

        // Try to infer from event name prefix (e.g., 'checkout/initialized' -> 'checkout')
        const parts = eventName.split('/');
        if (parts.length >= 2) {
            const prefix = parts[0];

            // Map common prefixes to drop-in names
            const prefixMap = {
                'cart': 'cart',
                'checkout': 'checkout',
                'order': 'order',
                'pdp': 'product-details',
                'product': 'product-details',
                'auth': 'user-auth',
                'account': 'user-account',
                'user': 'user-account',
                'wishlist': 'wishlist',
                'personalization': 'personalization',
                'recommendations': 'recommendations',
                'payment': 'payment-services',
                'companyContext': 'company-context',
                'company': 'company-management'
            };

            return prefixMap[prefix] || null;
        }

        return null;
    }

    /**
     * Load enrichment from source drop-in
     * 
     * @param {string} sourceDropin - Source drop-in name
     * @param {string} type - Enrichment type ('events', 'functions', etc.)
     * @returns {Object} Enrichment data or empty object
     * 
     * @example
     * const enrichment = CrossDropinResolver.loadSourceEnrichment('checkout', 'events');
     */
    static loadSourceEnrichment(sourceDropin, type = 'events') {
        return EnrichmentLoader.load(sourceDropin, type);
    }

    /**
     * Get payload type from source drop-in enrichment
     * 
     * @param {string} eventName - Event name
     * @param {string} sourceDropin - Source drop-in name
     * @returns {string|null} Payload type override or null
     * 
     * @example
     * const payload = CrossDropinResolver.getSourcePayloadType(
     *   'checkout/initialized',
     *   'checkout'
     * );
     * // Returns: "Cart | NegotiableQuote | null"
     */
    static getSourcePayloadType(eventName, sourceDropin) {
        const sourceEnrichments = this.loadSourceEnrichment(sourceDropin, 'events');
        return EnrichmentLoader.getPayloadOverride(sourceEnrichments, eventName);
    }

    /**
     * Generate external link to source drop-in documentation
     * 
     * @param {string} sourceDropin - Source drop-in name
     * @param {string} typeName - Type name to link to
     * @param {string} section - Section ('events', 'functions', etc.)
     * @returns {string} Markdown link
     * 
     * @example
     * const link = CrossDropinResolver.generateExternalLink(
     *   'checkout',
     *   'Cart',
     *   'events'
     * );
     * // Returns: "[`Cart`](/dropins/checkout/events#cart)"
     */
    static generateExternalLink(sourceDropin, typeName, section = 'events') {
        const anchor = typeName.toLowerCase();
        return `[\`${typeName}\`](/dropins/${sourceDropin}/${section}#${anchor})`;
    }

    /**
     * Generate external links for multiple types
     * 
     * @param {string} sourceDropin - Source drop-in name
     * @param {Set<string>} typeNames - Set of type names
     * @param {string} section - Section ('events', 'functions', etc.)
     * @returns {string} Comma-separated markdown links
     * 
     * @example
     * const links = CrossDropinResolver.generateExternalLinks(
     *   'checkout',
     *   new Set(['Cart', 'NegotiableQuote']),
     *   'events'
     * );
     * // Returns: "[`Cart`](/dropins/checkout/events#cart), [`NegotiableQuote`](/dropins/checkout/events#negotiablequote)"
     */
    static generateExternalLinks(sourceDropin, typeNames, section = 'events') {
        return Array.from(typeNames)
            .map(typeName => this.generateExternalLink(sourceDropin, typeName, section))
            .join(', ');
    }

    /**
     * Check if an event is a cross-dropin event
     * 
     * @param {string} eventName - Event name
     * @param {Map} eventEmits - Events emitted by current drop-in
     * @param {string} currentDropin - Current drop-in name
     * @returns {boolean} True if event is from another drop-in
     * 
     * @example
     * const isCross = CrossDropinResolver.isCrossDropinEvent(
     *   'checkout/initialized',
     *   cartEventEmits,
     *   'cart'
     * );
     * // Returns: true (event is from checkout, not cart)
     */
    static isCrossDropinEvent(eventName, eventEmits, currentDropin) {
        const source = this.detectSourceDropin(eventName, eventEmits, currentDropin);
        return source !== null && source !== currentDropin;
    }

    /**
     * Get full cross-dropin event info
     * Returns payload type and whether it's cross-dropin
     * 
     * @param {string} eventName - Event name
     * @param {Map} eventEmits - Events emitted by current drop-in
     * @param {string} currentDropin - Current drop-in name
     * @returns {Object} { isCross: boolean, sourceDropin: string|null, payloadType: string|null }
     * 
     * @example
     * const info = CrossDropinResolver.getEventInfo(
     *   'checkout/initialized',
     *   cartEventEmits,
     *   'cart'
     * );
     * // Returns: { isCross: true, sourceDropin: 'checkout', payloadType: 'Cart | NegotiableQuote | null' }
     */
    static getEventInfo(eventName, eventEmits, currentDropin) {
        const sourceDropin = this.detectSourceDropin(eventName, eventEmits, currentDropin);
        const isCross = sourceDropin !== null && sourceDropin !== currentDropin;

        let payloadType = null;
        if (isCross && sourceDropin) {
            payloadType = this.getSourcePayloadType(eventName, sourceDropin);
        }

        return {
            isCross,
            sourceDropin,
            payloadType
        };
    }
}

