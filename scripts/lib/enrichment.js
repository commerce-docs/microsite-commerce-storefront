/**
 * Enrichment Data Loading Module
 * 
 * Provides utilities for loading enrichment data from the _dropin-enrichments directory.
 * Enrichment data allows manual, high-quality documentation to be preserved while
 * still benefiting from automated generation.
 * 
 * Supports enrichment files for:
 * - functions.json: Function documentation enrichments
 * - events.json: Event documentation enrichments
 * - (Future: containers.json, slots.json, etc.)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

/**
 * Load enrichment data for a specific drop-in and type
 * 
 * @param {string} dropinName - Name of the drop-in (e.g., 'cart', 'checkout')
 * @param {string} enrichmentType - Type of enrichment (e.g., 'functions', 'events')
 * @returns {Object|null} Enrichment data object or null if not found/invalid
 * 
 * @example
 * const functionEnrichments = loadEnrichmentData('cart', 'functions');
 * const eventEnrichments = loadEnrichmentData('cart', 'events');
 */
export function loadEnrichmentData(dropinName, enrichmentType) {
    const enrichmentPath = join(
        projectRoot,
        '_dropin-enrichments',
        dropinName,
        `${enrichmentType}.json`
    );

    if (existsSync(enrichmentPath)) {
        try {
            const content = readFileSync(enrichmentPath, 'utf8');
            const data = JSON.parse(content);

            // Return null for empty objects to avoid confusion
            if (Object.keys(data).length === 0) {
                return null;
            }

            return data;
        } catch (error) {
            console.warn(`  ⚠️  Failed to load enrichment data from ${enrichmentPath}: ${error.message}`);
            return null;
        }
    }

    return null;
}

/**
 * Load function enrichments for a drop-in
 * 
 * @param {string} dropinName - Name of the drop-in
 * @returns {Object|null} Function enrichment data
 */
export function loadFunctionEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'functions');
}

/**
 * Load event enrichments for a drop-in
 * 
 * @param {string} dropinName - Name of the drop-in
 * @returns {Object|null} Event enrichment data
 */
export function loadEventEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'events');
}

/**
 * Load container enrichments for a drop-in
 * 
 * @param {string} dropinName - Name of the drop-in
 * @returns {Object|null} Container enrichment data
 */
export function loadContainerEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'containers');
}

/**
 * Load slot enrichments for a drop-in
 * 
 * @param {string} dropinName - Name of the drop-in
 * @returns {Object|null} Slot enrichment data
 */
export function loadSlotEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'slots');
}

/**
 * Load dictionary enrichments for a drop-in
 * 
 * @param {string} dropinName - Name of the drop-in
 * @returns {Object|null} Dictionary enrichment data
 */
export function loadDictionaryEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'dictionary');
}

/**
 * Check if a specific item has enrichment data
 * 
 * @param {Object} enrichmentData - The loaded enrichment data object
 * @param {string} itemName - Name of the item (function name, event name, etc.)
 * @param {string} field - Optional specific field to check
 * @returns {boolean} True if enrichment exists for the item
 */
export function hasEnrichment(enrichmentData, itemName, field = null) {
    if (!enrichmentData || !enrichmentData[itemName]) {
        return false;
    }

    if (field) {
        return enrichmentData[itemName][field] !== undefined;
    }

    return true;
}

/**
 * Get enriched value with fallback
 * 
 * @param {Object} enrichmentData - The loaded enrichment data object
 * @param {string} itemName - Name of the item
 * @param {string} field - Field to retrieve
 * @param {*} fallback - Fallback value if enrichment not found
 * @returns {*} Enriched value or fallback
 */
export function getEnrichedValue(enrichmentData, itemName, field, fallback = null) {
    if (hasEnrichment(enrichmentData, itemName, field)) {
        return enrichmentData[itemName][field];
    }
    return fallback;
}

