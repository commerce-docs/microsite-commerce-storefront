/**
 * Source Validation Module
 * 
 * Implements the Source-First Principle across all generators.
 * 
 * PRINCIPLE:
 * Source code is the single source of truth for technical specifications.
 * When source code conflicts with manual documentation, source code wins.
 * Human-written descriptions and context are preserved.
 * 
 * WHAT SOURCE CODE CONTROLS:
 * - Function signatures (parameters, types, return types)
 * - Event names and data payloads
 * - Container props and slot definitions
 * - Model/type structures
 * - Usage examples
 * 
 * WHAT MANUAL DOCS CONTROL:
 * - Descriptions and explanations
 * - Business context and "why"
 * - Best practices and recommendations
 * - Deprecation notices and migration guides
 * 
 * USAGE:
 * All generators should call validateAndMerge() to reconcile source vs manual data.
 */

import { logger } from './logger.js';

/**
 * Validate and merge source data with manual/enrichment data
 * 
 * @param {Object} options - Validation options
 * @param {string} options.itemName - Name of the item (function, event, container)
 * @param {string} options.itemType - Type of item (function, event, container)
 * @param {Object} options.sourceData - Data extracted from source code
 * @param {Object} options.manualData - Data from manual docs or enrichment files
 * @param {boolean} options.warnOnMismatch - Log warnings when data conflicts (default: true)
 * @returns {Object} Merged data with source taking precedence for technical specs
 */
export function validateAndMerge(options) {
    const {
        itemName,
        itemType = 'item',
        sourceData = {},
        manualData = {},
        warnOnMismatch = true
    } = options;

    const merged = {};
    const warnings = [];

    // Source code ALWAYS wins for technical specifications
    const sourceControlledFields = [
        'signature',
        'parameters',
        'params',
        'returnType',
        'returns',
        'props',
        'slots',
        'events',
        'types',
        'examples'
    ];

    // Manual data preserved for descriptions and context
    const manualControlledFields = [
        'description',
        'context',
        'notes',
        'bestPractices',
        'warnings',
        'deprecation'
    ];

    // Merge source-controlled fields (source wins)
    for (const field of sourceControlledFields) {
        if (sourceData[field] !== undefined) {
            merged[field] = sourceData[field];

            // Warn if manual data differs
            if (manualData[field] !== undefined && warnOnMismatch) {
                if (JSON.stringify(sourceData[field]) !== JSON.stringify(manualData[field])) {
                    warnings.push({
                        field,
                        message: `Source code differs from manual docs for "${field}"`,
                        resolution: 'Using source code (source of truth)'
                    });
                }
            }
        } else if (manualData[field] !== undefined) {
            // Source doesn't have this field, use manual as fallback
            merged[field] = manualData[field];
            if (warnOnMismatch) {
                warnings.push({
                    field,
                    message: `No source data found for "${field}"`,
                    resolution: 'Using manual data as fallback'
                });
            }
        }
    }

    // Merge manual-controlled fields (manual wins)
    for (const field of manualControlledFields) {
        if (manualData[field] !== undefined) {
            merged[field] = manualData[field];
        } else if (sourceData[field] !== undefined) {
            // Manual doesn't have this field, use source as fallback
            merged[field] = sourceData[field];
        }
    }

    // Log warnings if enabled
    if (warnings.length > 0 && warnOnMismatch) {
        console.log(`\n  ⚠️  Validation warnings for ${itemType}: ${itemName}`);
        warnings.forEach(w => {
            console.log(`     • ${w.field}: ${w.message}`);
            console.log(`       → ${w.resolution}`);
        });
    }

    return {
        data: merged,
        warnings,
        hasConflicts: warnings.length > 0
    };
}

/**
 * Validate function signature against source code
 * 
 * @param {Object} options - Validation options
 * @param {string} options.functionName - Name of the function
 * @param {Array} options.sourceParams - Parameters from TypeScript source
 * @param {Array} options.manualParams - Parameters from manual docs
 * @param {Object} options.sourceReturnType - Return type from source
 * @param {Object} options.manualReturnType - Return type from docs
 * @returns {Object} Validation result with conflicts and merged data
 */
export function validateFunctionSignature(options) {
    const {
        functionName,
        sourceParams = [],
        manualParams = [],
        sourceReturnType,
        manualReturnType
    } = options;

    const conflicts = [];

    // Check parameter count
    if (sourceParams.length !== manualParams.length && manualParams.length > 0) {
        conflicts.push({
            type: 'parameter-count',
            message: `Parameter count mismatch`,
            source: `${sourceParams.length} parameters`,
            manual: `${manualParams.length} parameters`,
            resolution: 'Using source parameter count'
        });
    }

    // Check parameter names and types
    sourceParams.forEach((sourceParam, index) => {
        const manualParam = manualParams[index];
        if (manualParam) {
            if (sourceParam.name !== manualParam.name) {
                conflicts.push({
                    type: 'parameter-name',
                    message: `Parameter ${index + 1} name differs`,
                    source: sourceParam.name,
                    manual: manualParam.name,
                    resolution: 'Using source parameter name'
                });
            }
            if (sourceParam.type !== manualParam.type) {
                conflicts.push({
                    type: 'parameter-type',
                    message: `Parameter "${sourceParam.name}" type differs`,
                    source: sourceParam.type,
                    manual: manualParam.type,
                    resolution: 'Using source type'
                });
            }
        }
    });

    // Check return type
    if (sourceReturnType && manualReturnType && sourceReturnType !== manualReturnType) {
        conflicts.push({
            type: 'return-type',
            message: `Return type differs`,
            source: sourceReturnType,
            manual: manualReturnType,
            resolution: 'Using source return type'
        });
    }

    // Log conflicts
    if (conflicts.length > 0) {
        console.log(`\n  ⚠️  Signature conflicts in function: ${functionName}`);
        conflicts.forEach(c => {
            console.log(`     • ${c.message}`);
            console.log(`       Source: ${c.source}`);
            console.log(`       Manual: ${c.manual}`);
            console.log(`       → ${c.resolution}`);
        });
    }

    return {
        conflicts,
        hasConflicts: conflicts.length > 0,
        // Always return source data as the merged result
        mergedParams: sourceParams.length > 0 ? sourceParams : manualParams,
        mergedReturnType: sourceReturnType || manualReturnType
    };
}

/**
 * Validate event data against source code
 * 
 * @param {Object} options - Validation options
 * @param {string} options.eventName - Name of the event
 * @param {Array} options.sourceEmissions - Event emissions from source code
 * @param {Object} options.manualEventData - Event data from manual docs
 * @returns {Object} Validation result
 */
export function validateEventData(options) {
    const {
        eventName,
        sourceEmissions = [],
        manualEventData = {}
    } = options;

    const conflicts = [];

    // Check if event is documented but not emitted in source
    if (manualEventData && sourceEmissions.length === 0) {
        conflicts.push({
            type: 'event-not-found',
            message: `Event documented but not found in source code`,
            resolution: 'Possible outdated documentation or conditional emission'
        });
    }

    // Check if event is emitted but not documented
    if (sourceEmissions.length > 0 && !manualEventData) {
        conflicts.push({
            type: 'undocumented-event',
            message: `Event found in source but not documented`,
            resolution: 'Auto-generating documentation from source'
        });
    }

    // Log conflicts
    if (conflicts.length > 0) {
        console.log(`\n  ⚠️  Event validation issues: ${eventName}`);
        conflicts.forEach(c => {
            console.log(`     • ${c.message}`);
            console.log(`       → ${c.resolution}`);
        });
    }

    return {
        conflicts,
        hasConflicts: conflicts.length > 0,
        // Prioritize source emissions
        mergedEmissions: sourceEmissions.length > 0 ? sourceEmissions : [],
        description: manualEventData?.description || ''
    };
}

/**
 * Compare two data structures and generate a diff report
 * 
 * @param {Object} source - Source code data
 * @param {Object} manual - Manual documentation data
 * @param {string} context - Context for the comparison (e.g., "function:addToCart")
 * @returns {Object} Diff report
 */
export function generateDiffReport(source, manual, context) {
    const differences = [];

    // Compare keys
    const sourceKeys = new Set(Object.keys(source));
    const manualKeys = new Set(Object.keys(manual));

    // Keys only in source (new in source)
    const onlyInSource = [...sourceKeys].filter(k => !manualKeys.has(k));
    if (onlyInSource.length > 0) {
        differences.push({
            type: 'added-in-source',
            fields: onlyInSource,
            message: 'New fields found in source code'
        });
    }

    // Keys only in manual (removed from source)
    const onlyInManual = [...manualKeys].filter(k => !sourceKeys.has(k));
    if (onlyInManual.length > 0) {
        differences.push({
            type: 'removed-from-source',
            fields: onlyInManual,
            message: 'Fields in manual docs but not in source (possibly outdated)'
        });
    }

    // Keys in both but with different values
    const commonKeys = [...sourceKeys].filter(k => manualKeys.has(k));
    commonKeys.forEach(key => {
        if (JSON.stringify(source[key]) !== JSON.stringify(manual[key])) {
            differences.push({
                type: 'value-mismatch',
                field: key,
                sourceValue: source[key],
                manualValue: manual[key]
            });
        }
    });

    return {
        context,
        differences,
        hasDifferences: differences.length > 0,
        sourceKeys: [...sourceKeys],
        manualKeys: [...manualKeys]
    };
}

/**
 * Create a validation report for an entire generator run
 * 
 * @returns {Object} Validation report tracker
 */
export function createValidationReport() {
    const report = {
        totalItems: 0,
        itemsWithConflicts: 0,
        conflicts: [],
        warnings: []
    };

    return {
        addItem(itemName, validationResult) {
            report.totalItems++;
            if (validationResult.hasConflicts) {
                report.itemsWithConflicts++;
                report.conflicts.push({
                    item: itemName,
                    conflicts: validationResult.conflicts || validationResult.warnings
                });
            }
        },

        addWarning(message) {
            report.warnings.push(message);
        },

        getReport() {
            return report;
        },

        printSummary() {
            console.log(`\n${'='.repeat(60)}`);
            console.log('📊 Source Validation Report');
            console.log('='.repeat(60));
            console.log(`Total items validated: ${report.totalItems}`);
            console.log(`Items with conflicts: ${report.itemsWithConflicts}`);
            console.log(`Warnings issued: ${report.warnings.length}`);

            if (report.itemsWithConflicts > 0) {
                console.log(`\n⚠️  ${report.itemsWithConflicts} items had conflicts between source and manual docs.`);
                console.log('   All conflicts resolved by using source code as the source of truth.');
            } else {
                console.log(`\n✅ All items validated successfully - source and docs are in sync!`);
            }

            if (report.warnings.length > 0) {
                console.log(`\n⚠️  General warnings:`);
                report.warnings.forEach(w => console.log(`   • ${w}`));
            }

            console.log('='.repeat(60) + '\n');
        }
    };
}

/**
 * Check if source data is more recent than manual data
 * 
 * @param {Object} sourceMetadata - Metadata from source (e.g., git commit date)
 * @param {Object} manualMetadata - Metadata from manual docs (e.g., last modified)
 * @returns {boolean} True if source is newer
 */
export function isSourceNewer(sourceMetadata, manualMetadata) {
    if (!sourceMetadata?.date || !manualMetadata?.date) {
        return true; // Default to source if dates unavailable
    }

    const sourceDate = new Date(sourceMetadata.date);
    const manualDate = new Date(manualMetadata.date);

    return sourceDate > manualDate;
}

