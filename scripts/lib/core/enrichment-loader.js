/**
 * Enrichment Loader
 * 
 * Unified enrichment loading system for all documentation generators.
 * Consolidates loading logic that was previously duplicated across 7+ generators.
 * 
 * @module lib/core/enrichment-loader
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

/**
 * Enrichment Loader class
 * Handles loading enrichment data for all documentation types
 */
export class EnrichmentLoader {
    /**
     * Load enrichments for a specific drop-in and type
     * 
     * @param {string} dropinName - Name of the drop-in (e.g., 'cart', 'checkout')
     * @param {string} type - Type of enrichment ('events', 'functions', 'containers', etc.)
     * @returns {Object} Enrichment data or empty object if not found
     * 
     * @example
     * const enrichments = EnrichmentLoader.load('cart', 'events');
     * const description = enrichments['cart/data']?.description;
     */
    static load(dropinName, type) {
        const enrichmentPath = join(
            projectRoot,
            '_dropin-enrichments',
            dropinName,
            `${type}.json`
        );

        if (!existsSync(enrichmentPath)) {
            return {};
        }

        try {
            const content = readFileSync(enrichmentPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn(`⚠️  Failed to load enrichment for ${dropinName}/${type}: ${error.message}`);
            return {};
        }
    }

    /**
     * Get description for an item from enrichments
     * 
     * @param {Object} enrichments - Loaded enrichments
     * @param {string} itemName - Name of the item
     * @returns {string|null} Description or null if not found
     * 
     * @example
     * const enrichments = EnrichmentLoader.load('cart', 'events');
     * const desc = EnrichmentLoader.getDescription(enrichments, 'cart/data');
     */
    static getDescription(enrichments, itemName) {
        return enrichments?.[itemName]?.description || null;
    }

    /**
     * Get payload override for an event from enrichments
     * 
     * @param {Object} enrichments - Loaded enrichments
     * @param {string} eventName - Name of the event
     * @returns {string|Object|null} Payload override (string or object) or null
     * 
     * @example
     * const enrichments = EnrichmentLoader.load('checkout', 'events');
     * const payload = EnrichmentLoader.getPayloadOverride(enrichments, 'checkout/initialized');
     * // Returns: "Cart | NegotiableQuote | null"
     */
    static getPayloadOverride(enrichments, eventName) {
        const payload = enrichments?.[eventName]?.payload;
        if (!payload) return null;
        
        // String payload = type override
        if (typeof payload === 'string') {
            return payload;
        }
        
        // Object payload = parameter descriptions (not a type override)
        return null;
    }

    /**
     * Get parameter descriptions for an item from enrichments
     * 
     * @param {Object} enrichments - Loaded enrichments
     * @param {string} itemName - Name of the item
     * @returns {Object} Parameter descriptions object
     * 
     * @example
     * const enrichments = EnrichmentLoader.load('cart', 'functions');
     * const params = EnrichmentLoader.getParameters(enrichments, 'addProductsToCart');
     */
    static getParameters(enrichments, itemName) {
        const params = enrichments?.[itemName]?.parameters;
        if (!params || typeof params !== 'object') {
            return {};
        }
        return params;
    }

    /**
     * Get model descriptions from enrichments
     * 
     * @param {Object} enrichments - Loaded enrichments
     * @returns {Object} Model descriptions object
     * 
     * @example
     * const enrichments = EnrichmentLoader.load('cart', 'events');
     * const models = EnrichmentLoader.getModels(enrichments);
     * const cartModelDesc = models.CartModel?.description;
     */
    static getModels(enrichments) {
        return enrichments?.models || {};
    }

    /**
     * Get model description for a specific model
     * 
     * @param {Object} enrichments - Loaded enrichments
     * @param {string} modelName - Name of the model
     * @returns {string|null} Model description or null
     * 
     * @example
     * const enrichments = EnrichmentLoader.load('cart', 'events');
     * const desc = EnrichmentLoader.getModelDescription(enrichments, 'CartModel');
     */
    static getModelDescription(enrichments, modelName) {
        return enrichments?.models?.[modelName]?.description || null;
    }

    /**
     * Check if enrichment exists for a drop-in and type
     * 
     * @param {string} dropinName - Name of the drop-in
     * @param {string} type - Type of enrichment
     * @returns {boolean} True if enrichment file exists
     * 
     * @example
     * if (EnrichmentLoader.exists('cart', 'events')) {
     *   // Load and use enrichments
     * }
     */
    static exists(dropinName, type) {
        const enrichmentPath = join(
            projectRoot,
            '_dropin-enrichments',
            dropinName,
            `${type}.json`
        );
        return existsSync(enrichmentPath);
    }

    /**
     * Get all enrichment types available for a drop-in
     * 
     * @param {string} dropinName - Name of the drop-in
     * @returns {string[]} Array of available enrichment types
     * 
     * @example
     * const types = EnrichmentLoader.getAvailableTypes('cart');
     * // Returns: ['events', 'functions']
     */
    static getAvailableTypes(dropinName) {
        const types = ['events', 'functions', 'containers', 'slots', 'dictionary'];
        return types.filter(type => this.exists(dropinName, type));
    }
}

/**
 * Backward compatibility exports
 * These maintain the existing API from event-enrichment.js
 */

/**
 * Load event enrichments (backward compatible)
 */
export function loadEventEnrichments(dropinName) {
    return EnrichmentLoader.load(dropinName, 'events');
}

/**
 * Get event description (backward compatible)
 */
export function getEventDescription(eventName, enrichment, fallback) {
    const description = EnrichmentLoader.getDescription(enrichment, eventName);
    return description || fallback || '';
}

/**
 * Get payload property description (backward compatible)
 */
export function getPayloadPropertyDescription(enrichment, eventName, propertyName) {
    const payload = enrichment?.[eventName]?.payload;
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    return payload[propertyName]?.description || null;
}

