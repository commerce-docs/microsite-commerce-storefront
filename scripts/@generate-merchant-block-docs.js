#!/usr/bin/env node

/**
 * Merchant Block Documentation Generator
 *
 * Generates merchant-focused documentation for commerce blocks, showing how to
 * configure them using document-based authoring in AEM.
 *
 * Unlike technical documentation, this focuses on:
 * - Business user perspective
 * - Document authoring configuration
 * - Practical examples and tips
 * - Non-technical language
 *
 * USAGE:
 * - Generate all merchant block docs: npm run generate-merchant-docs
 *
 * OUTPUT: Multiple MDX files in src/content/docs/merchants/blocks/
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';

// Import shared utilities
import { getProjectRoot } from './lib/generator-core.js';
import { ensureParentDirectoryExists } from './lib/utils.js';
import { cloneOrUpdateBoilerplate } from './lib/repository.js';

const projectRoot = getProjectRoot();

// ============================================================================
// CHANGE DETECTION AND TRACKING
// ============================================================================

/**
 * Get current commit hash from boilerplate repository
 */
function getBoilerplateCommitHash(boilerplatePath) {
    try {
        return execSync('git rev-parse HEAD', {
            cwd: boilerplatePath,
            encoding: 'utf8'
        }).trim();
    } catch (error) {
        console.warn('  ⚠️  Could not get commit hash');
        return null;
    }
}

/**
 * Load enrichment metadata
 */
function loadEnrichmentMetadata() {
    const enrichmentPath = join(projectRoot, '_dropin-enrichments', 'merchant-blocks', 'descriptions.json');
    if (!existsSync(enrichmentPath)) {
        return null;
    }

    try {
        const content = readFileSync(enrichmentPath, 'utf8');
        const data = JSON.parse(content);
        return data.metadata || null;
    } catch (error) {
        console.warn(`  ⚠️  Could not load enrichment metadata: ${error.message}`);
        return null;
    }
}

/**
 * Detect changes in source code and README files
 * Returns report of what changed since last verification
 */
function detectChanges(boilerplatePath, blocks) {
    const currentCommit = getBoilerplateCommitHash(boilerplatePath);
    const metadata = loadEnrichmentMetadata();

    const changes = {
        hasChanges: false,
        currentCommit,
        lastVerifiedCommit: metadata?.last_verified_commit || null,
        sourceCodeChanges: [],
        readmeChanges: [],
        newBlocks: [],
        removedBlocks: []
    };

    if (!metadata || !metadata.last_verified_commit) {
        console.log('\n⚠️  No previous verification found - first run');
        changes.hasChanges = true;
        return changes;
    }

    if (currentCommit !== metadata.last_verified_commit) {
        console.log(`\n📋 Checking for changes since last verification...`);
        console.log(`   Last verified: ${metadata.last_verified_commit.substring(0, 8)}`);
        console.log(`   Current commit: ${currentCommit.substring(0, 8)}`);

        try {
            // Get list of changed files
            const changedFiles = execSync(
                `git diff --name-only ${metadata.last_verified_commit} HEAD`,
                { cwd: boilerplatePath, encoding: 'utf8' }
            ).trim().split('\n').filter(f => f);

            // Track source code changes
            const sourceChanges = changedFiles.filter(f => f.endsWith('.js') && f.startsWith('blocks/'));
            if (sourceChanges.length > 0) {
                changes.hasChanges = true;
                changes.sourceCodeChanges = sourceChanges;
                console.log(`\n   📝 Source code files changed: ${sourceChanges.length}`);
                sourceChanges.forEach(f => console.log(`      - ${f}`));
            }

            // Track README changes
            const readmeChanges = changedFiles.filter(f => f.endsWith('README.md') && f.startsWith('blocks/'));
            if (readmeChanges.length > 0) {
                changes.hasChanges = true;
                changes.readmeChanges = readmeChanges;
                console.log(`\n   📖 README files changed: ${readmeChanges.length}`);
                readmeChanges.forEach(f => console.log(`      - ${f}`));
            }

        } catch (error) {
            console.warn(`  ⚠️  Could not detect changes: ${error.message}`);
            changes.hasChanges = true; // Assume changes if we can't detect
        }
    } else {
        console.log(`\n✅ No changes detected since last verification (${metadata.last_verified_date})`);
    }

    return changes;
}

/**
 * Update enrichment metadata after successful generation
 */
function updateEnrichmentMetadata(boilerplatePath, blockCount) {
    const enrichmentPath = join(projectRoot, '_dropin-enrichments', 'merchant-blocks', 'descriptions.json');

    if (!existsSync(enrichmentPath)) {
        console.warn('  ⚠️  Enrichment file not found - skipping metadata update');
        return;
    }

    try {
        const content = readFileSync(enrichmentPath, 'utf8');
        const data = JSON.parse(content);

        data.metadata = {
            last_verified_commit: getBoilerplateCommitHash(boilerplatePath),
            last_verified_date: new Date().toISOString().split('T')[0],
            boilerplate_branch: 'b2b-suite-release1',
            total_blocks: blockCount,
            verified_blocks: Object.values(data.blocks || {}).filter(b => b.verified).length,
            verification_method: 'source-code-first'
        };

        writeFileSync(enrichmentPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log('  ✅ Updated enrichment metadata');
    } catch (error) {
        console.warn(`  ⚠️  Could not update enrichment metadata: ${error.message}`);
    }
}

// ============================================================================
// REPOSITORY MANAGEMENT
// ============================================================================

// ============================================================================
// CONFIGURATION EXTRACTION
// ============================================================================


/**
 * Helper: Split destructured properties while respecting nested structures
 */
function splitDestructuredProperties(content) {
    const properties = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const prev = content[i - 1];

        // Track string boundaries
        if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
            }
        }

        // Track nesting depth (for arrays/objects in default values)
        if (!inString) {
            if (char === '{' || char === '[' || char === '(') depth++;
            if (char === '}' || char === ']' || char === ')') depth--;
        }

        // Split on commas at depth 0 (not nested)
        if (char === ',' && depth === 0 && !inString) {
            properties.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    // Add the last property
    if (current.trim()) {
        properties.push(current);
    }

    return properties;
}

/**
 * Helper: Clean and normalize default values from source code
 */
function cleanDefaultValue(value) {
    if (!value) return 'undefined';

    let cleaned = value
        .replace(/^['"`]|['"`]$/g, '')  // Remove surrounding quotes
        .replace(/,\s*$/, '')            // Remove trailing comma
        .trim();

    return cleaned || 'undefined';
}

/**
 * Helper: Infer type from default value
 */
function inferType(defaultValue) {
    if (defaultValue === 'true' || defaultValue === 'false') {
        return 'boolean';
    }
    if (!isNaN(defaultValue) && defaultValue !== '' && defaultValue !== 'undefined') {
        return 'number';
    }
    if (defaultValue.startsWith('[') || defaultValue.startsWith('{')) {
        return 'object';
    }
    return 'string';
}

/**
 * Extract configuration from source code (PRIMARY SOURCE OF TRUTH)
 * Scans .js file for readBlockConfig() calls and extracts destructured keys
 * This is the ONLY way to know what configurations actually exist
 */
function extractConfigFromSource(blockPath) {
    const jsFile = join(blockPath, `${basename(blockPath)}.js`);

    if (!existsSync(jsFile)) {
        return [];
    }

    const sourceCode = readFileSync(jsFile, 'utf8');
    const configs = [];
    const foundKeys = new Set();

    // PATTERN 1: Destructuring pattern (both explicit and shorthand)
    // const { 'config-key': varName = 'default', shorthand, ... } = readBlockConfig(block);
    const readBlockConfigPattern = /const\s*\{([^}]+)\}\s*=\s*readBlockConfig\([^)]+\)/g;
    const matches = sourceCode.matchAll(readBlockConfigPattern);

    for (const match of matches) {
        const destructuredContent = match[1];

        // Split by commas (but be careful with nested objects/arrays)
        const properties = splitDestructuredProperties(destructuredContent);

        for (const prop of properties) {
            const trimmedProp = prop.trim();
            if (!trimmedProp) continue;

            // Pattern 1a: Explicit key-value: 'config-key': varName = 'defaultValue'
            const explicitPattern = /^['"]([^'"]+)['"]\s*:\s*(\w+)(?:\s*=\s*(.+))?$/;
            const explicitMatch = trimmedProp.match(explicitPattern);

            if (explicitMatch) {
                const key = explicitMatch[1].trim();
                const variable = explicitMatch[2].trim();
                let defaultValue = explicitMatch[3]?.trim() || 'undefined';

                // Clean up default value
                defaultValue = cleanDefaultValue(defaultValue);

                configs.push({
                    key: key,
                    variable: variable,
                    type: inferType(defaultValue),
                    default: defaultValue,
                    description: '', // Will be enriched from README
                    required: 'No',
                    sideEffects: '',
                    source: 'source-code-explicit'
                });

                foundKeys.add(key);
                continue;
            }

            // Pattern 1b: ES6 Shorthand: varName or varName = 'defaultValue'
            const shorthandPattern = /^(\w+)(?:\s*=\s*(.+))?$/;
            const shorthandMatch = trimmedProp.match(shorthandPattern);

            if (shorthandMatch) {
                const variable = shorthandMatch[1].trim();
                let defaultValue = shorthandMatch[2]?.trim() || 'undefined';

                // Clean up default value
                defaultValue = cleanDefaultValue(defaultValue);

                // For shorthand, the config key is the variable name
                configs.push({
                    key: variable,
                    variable: variable,
                    type: inferType(defaultValue),
                    default: defaultValue,
                    description: '', // Will be enriched from README
                    required: 'No',
                    sideEffects: '',
                    source: 'source-code-shorthand'
                });

                foundKeys.add(variable);
            }
        }
    }

    // PATTERN 2: Assignment pattern
    // const config = readBlockConfig(block);
    // if (config.urlpath) { ... }
    const assignmentPattern = /const\s+(\w+)\s*=\s*readBlockConfig\([^)]+\)/;
    const assignmentMatch = sourceCode.match(assignmentPattern);

    if (assignmentMatch) {
        const configVarName = assignmentMatch[1]; // e.g., "config"

        // Find all usages of config.property throughout the file
        const propertyUsagePattern = new RegExp(configVarName + '\\.(\\w+)', 'g');
        const propertyMatches = [...sourceCode.matchAll(propertyUsagePattern)];

        // Get unique property names
        const propertyNames = [...new Set(propertyMatches.map(m => m[1]))];

        for (const propertyName of propertyNames) {
            // Skip if already found via destructuring
            if (foundKeys.has(propertyName)) {
                continue;
            }

            // Skip common object properties that aren't config
            if (['length', 'toString', 'valueOf', 'constructor', 'dataset'].includes(propertyName)) {
                continue;
            }

            configs.push({
                key: propertyName,
                variable: propertyName,
                type: 'string', // Default to string, could be enhanced with more analysis
                default: 'undefined',
                description: '', // Will be enriched from README
                required: 'No',
                sideEffects: '',
                source: 'source-code-assignment'
            });

            foundKeys.add(propertyName);
        }
    }

    return configs;
}

/**
 * Extract configuration from README file (ENRICHMENT ONLY)
 * Used ONLY to add descriptions and type annotations to configs found in source code
 * README files should NOT be used to discover what configurations exist
 */
function extractConfigFromReadme(readmePath) {
    if (!existsSync(readmePath)) {
        return [];
    }

    const readme = readFileSync(readmePath, 'utf8');
    let configs = [];

    // Method 1: Try to extract from markdown table first
    const blockConfigPattern = /(?:##\s+Block\s+Configuration|###\s+Block\s+Configuration)[\s\S]*?\|\s*Configuration\s+Key[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([\s\S]*?)(?=\n\n|\n##|\n###|$)/i;
    const tableMatch = readme.match(blockConfigPattern);

    if (tableMatch) {
        const tableContent = tableMatch[1];
        const rows = tableContent.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('|') &&
                !trimmed.match(/^\|\s*-+\s*\|/) && // Skip separator rows
                trimmed !== '|'; // Skip empty rows
        });

        for (const row of rows) {
            const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);

            // Expected columns: Configuration Key | Type | Default | Description | Required | Side Effects
            if (cells.length >= 4) {
                const key = cells[0].replace(/`/g, '').trim();
                const type = cells[1]?.trim() || 'string';
                const defaultValue = cells[2]?.trim() || 'undefined';
                const description = cells[3]?.trim() || '';
                const required = cells[4]?.replace(/`/g, '').trim() || 'No';
                const sideEffects = cells[5]?.trim() || '';

                // Skip header rows, "no config" entries, and invalid keys
                if (key &&
                    key !== 'Configuration Key' &&
                    key !== '–' &&
                    !key.toLowerCase().includes('configuration') &&
                    !key.match(/^-+$/) &&
                    !description.toLowerCase().includes('no authorable configuration')) {

                    // Clean default value
                    let cleanDefault = defaultValue.replace(/`/g, '').trim();
                    if (cleanDefault === '' || cleanDefault === 'undefined' || cleanDefault === '–') {
                        cleanDefault = 'undefined';
                    }

                    // Infer type if not specified
                    let inferredType = type.toLowerCase();
                    if (cleanDefault === 'true' || cleanDefault === 'false') {
                        inferredType = 'boolean';
                    } else if (cleanDefault && !isNaN(cleanDefault) && cleanDefault !== 'undefined') {
                        inferredType = 'number';
                    } else if (!inferredType || inferredType === 'string' || inferredType === '' || inferredType === '–') {
                        inferredType = 'string';
                    }

                    configs.push({
                        key: key,
                        variable: key.replace(/-/g, ''), // Convert kebab-case to variable name
                        type: inferredType,
                        default: cleanDefault,
                        description: description,
                        required: required === 'Yes' || required === 'Required' ? 'Yes' : 'No',
                        sideEffects: sideEffects
                    });
                }
            }
        }
    }

    // Method 2: If no table configs found, try bullet point format (common in B2B blocks)
    if (configs.length === 0) {
        const bulletConfigPattern = /(?:##\s+Block\s+Configuration|###\s+Block\s+Configuration)([\s\S]*?)(?=\n##|\n###|Example configuration:|$)/i;
        const bulletMatch = readme.match(bulletConfigPattern);

        if (bulletMatch) {
            const configSection = bulletMatch[1];
            // Match bullet points like: - **className** (string, optional): Description
            const bulletPattern = /^-\s+\*\*([^*]+)\*\*\s*\(([^,)]+)(?:,\s*(optional|required))?(?:,\s*default:\s*([^)]+))?\):\s*(.+)$/gm;
            let match;

            while ((match = bulletPattern.exec(configSection)) !== null) {
                const key = match[1].trim();
                const type = match[2].trim();
                const isRequired = match[3]?.trim() === 'required' ? 'Yes' : 'No';
                const defaultValue = match[4]?.trim() || 'undefined';
                const description = match[5].trim();

                // Clean up types and defaults
                let cleanDefault = defaultValue;
                let inferredType = type.toLowerCase();

                if (inferredType === 'boolean') {
                    cleanDefault = cleanDefault === 'true' ? 'true' : cleanDefault === 'false' ? 'false' : cleanDefault;
                }

                configs.push({
                    key: key,
                    variable: key.replace(/-/g, ''),
                    type: inferredType,
                    default: cleanDefault,
                    description: description,
                    required: isRequired,
                    sideEffects: ''
                });
            }
        }
    }

    return configs;
}

/**
 * Enrich configuration with descriptions from README (legacy function, kept for compatibility)
 */
function enrichConfigFromReadme(configs, readmePath) {
    // This function is now deprecated - use extractConfigFromReadme instead
    // Keeping for backward compatibility but it should not be called
    return configs;
}

/**
 * Extract merchant-friendly description from README overview
 * Simplifies technical README overview for merchant consumption
 */
function extractDescriptionFromReadme(readmePath) {
    if (!existsSync(readmePath)) {
        return null;
    }

    try {
        const content = readFileSync(readmePath, 'utf8');

        // Extract the Overview section
        const overviewMatch = content.match(/## Overview\s*\n\s*\n(.*?)(?=\n\n##|\n\n<!-- |\n\n\*|$)/s);
        if (!overviewMatch) {
            return null;
        }

        let overview = overviewMatch[1].trim();

        // Get the first sentence, which usually contains the core purpose
        const firstSentence = overview.match(/^[^.!?]+[.!?]/);
        if (!firstSentence) {
            return null;
        }

        // Simplify for merchant consumption
        let description = firstSentence[0]
            // Remove technical jargon
            .replace(/using the @dropins\/[^\s]+\s+\w+\s+container/gi, '')
            .replace(/The Commerce [\w\s]+ block (renders|provides|handles|displays)/gi, (match, verb) => {
                const actionMap = {
                    'renders': 'Display',
                    'provides': 'Manage',
                    'handles': 'Set up',
                    'displays': 'Show'
                };
                return actionMap[verb] || 'Configure';
            })
            // Clean up extra spaces
            .replace(/\s+/g, ' ')
            .trim();

        return description;
    } catch (error) {
        console.warn(`  ⚠️  Could not extract description from ${readmePath}: ${error.message}`);
        return null;
    }
}

/**
 * Load enrichment file with manually verified descriptions
 */
function loadDescriptionEnrichments() {
    const enrichmentPath = join(process.cwd(), '_dropin-enrichments', 'merchant-blocks', 'descriptions.json');
    if (!existsSync(enrichmentPath)) {
        return {};
    }

    try {
        const content = readFileSync(enrichmentPath, 'utf8');
        const data = JSON.parse(content);
        return data.blocks || {};
    } catch (error) {
        console.warn(`  ⚠️  Could not load description enrichments: ${error.message}`);
        return {};
    }
}

/**
 * Extract important notes from README
 * Looks for key information merchants need to know
 */
function extractImportantNotes(blockPath) {
    const readmePath = join(blockPath, 'README.md');

    if (!existsSync(readmePath)) {
        return [];
    }

    try {
        const content = readFileSync(readmePath, 'utf8');
        const notes = [];

        // Extract Overview section for authentication requirements
        const overviewMatch = content.match(/## Overview\n\n([\s\S]*?)(?=\n## |$)/);
        if (overviewMatch) {
            const overview = overviewMatch[1];

            // Check for authentication requirements
            if (overview.match(/authentication|authenticated|sign[- ]in|log[- ]in/i)) {
                if (overview.match(/redirect.*login|authentication.*redirect|not authenticated.*redirect/i)) {
                    notes.push('Requires user authentication. Unauthenticated users are automatically redirected to the login page.');
                }
            }

            // Check for company/B2B requirements
            if (overview.match(/company|B2B/i)) {
                if (overview.match(/company.*enabled|B2B.*enabled|associated.*company/i)) {
                    notes.push('Requires Adobe Commerce B2B features to be enabled and the user to be associated with a company.');
                }
            }
        }

        // Look for Behavior Patterns section
        const behaviorMatch = content.match(/## Behavior Patterns[\s\S]*?(?=\n## |$)/i);
        if (behaviorMatch) {
            const behavior = behaviorMatch[0];

            // Extract page context detection patterns
            if (behavior.match(/Authenticated Users.*not authenticated.*redirect/is)) {
                if (!notes.some(n => n.includes('authentication'))) {
                    notes.push('Requires user authentication. Unauthenticated users are automatically redirected to the login page.');
                }
            }

            // Extract modal integration notes
            if (behavior.match(/modal|popup/i)) {
                if (behavior.match(/authentication.*modal|sign[- ]in.*modal/i)) {
                    notes.push('May display authentication modal for guest users attempting certain actions.');
                }
            }
        }

        // Look for Error Handling section
        const errorMatch = content.match(/### Error Handling[\s\S]*?(?=\n## |$)/i);
        if (errorMatch) {
            const errorSection = errorMatch[0];

            // Extract fallback behaviors (only if meaningful)
            if (errorSection.match(/[Ff]allback.*default.*configuration/)) {
                notes.push('Uses default configuration values if custom settings are missing or invalid.');
            }

            // Extract specific error scenarios merchants should know
            if (errorSection.match(/payment.*error|payment.*fail/i)) {
                notes.push('Payment errors are displayed to customers with option to retry or choose different payment method.');
            }
        }

        // Look for Configuration section for dependencies
        const configMatch = content.match(/### Block Configuration[\s\S]*?(?=\n### |$)/i);
        if (configMatch) {
            const configSection = configMatch[0];

            // Check for URL requirements (but avoid if already noted from configs)
            const urlCount = (configSection.match(/-url`/g) || []).length;
            if (urlCount >= 2 && !notes.some(n => n.includes('URL'))) {
                notes.push('All URL paths must point to valid pages on your site for navigation to work correctly.');
            }
        }

        // Look for Side Effects column for important warnings
        if (content.match(/Side Effects/)) {
            const sideEffectsMatch = content.match(/\|\s*Side Effects\s*\|[\s\S]*?(?=\n\n|$)/);
            if (sideEffectsMatch) {
                const sideEffects = sideEffectsMatch[0];

                // Look for redirect warnings
                if (sideEffects.match(/redirect|navigation/i)) {
                    if (!notes.some(n => n.includes('redirect'))) {
                        // Already covered by other extraction
                    }
                }
            }
        }

        return notes.filter((note, index, self) => self.indexOf(note) === index); // Remove duplicates

    } catch (error) {
        return [];
    }
}

/**
 * Load configuration enrichments from JSON file
 */
function loadConfigurationEnrichments() {
    const enrichmentPath = join(process.cwd(), '_dropin-enrichments/merchant-blocks/configurations.json');
    if (!existsSync(enrichmentPath)) {
        return {};
    }

    try {
        const content = readFileSync(enrichmentPath, 'utf8');
        const data = JSON.parse(content);
        return data.configurations || {};
    } catch (error) {
        console.warn(`  ⚠️  Could not load configuration enrichments: ${error.message}`);
        return {};
    }
}


/**
 * Generate enhanced property descriptions with context
 * Adds WHEN/WHY information to make descriptions more actionable
 */
function generateEnhancedPropertyDescription(key, description, type, defaultValue, blockName) {
    // Try to load enriched description first
    const configEnrichments = loadConfigurationEnrichments();
    const blockConfigs = configEnrichments[blockName] || {};
    const enrichedConfig = blockConfigs[key.toLowerCase()];

    if (enrichedConfig && enrichedConfig.description) {
        // Use enriched description + when_to_use if available
        let enhanced = enrichedConfig.description;
        if (enrichedConfig.when_to_use) {
            enhanced += ` ${enrichedConfig.when_to_use}`;
        }
        return enhanced.endsWith('.') ? enhanced : enhanced + '.';
    }

    // Fall back to auto-generated enhancements
    const cleanKey = key.toLowerCase();
    let enhanced = description.trim();

    // Remove trailing period if it exists (we'll add it back at the end)
    if (enhanced.endsWith('.')) {
        enhanced = enhanced.slice(0, -1);
    }

    // Add context based on property patterns
    const additions = [];

    // For enable/show/hide toggles
    if (cleanKey.includes('enable') || cleanKey.includes('show') || cleanKey.includes('hide')) {
        if (type === 'boolean' || defaultValue === 'false' || defaultValue === 'true') {
            const action = cleanKey.includes('hide') ? 'hide' : 'enable';
            if (!enhanced.toLowerCase().includes('set to')) {
                additions.push(`Set to \`true\` to ${action} this feature`);
            }
        }
    }

    // For URL/path properties
    if (cleanKey.includes('url') || cleanKey.includes('path')) {
        // Specific URL guidance based on context
        if (cleanKey.includes('redirect')) {
            if (!enhanced.toLowerCase().includes('destination')) {
                additions.push('Determines where customers land after completing this action');
            }
        } else if (cleanKey.includes('cart')) {
            if (!enhanced.toLowerCase().includes('cart page')) {
                additions.push('Should link to your cart page (typically `/cart`)');
            }
        } else if (cleanKey.includes('checkout')) {
            if (!enhanced.toLowerCase().includes('checkout')) {
                additions.push('Should link to your checkout page (typically `/checkout`)');
            }
        } else if (cleanKey.includes('shopping')) {
            if (!enhanced.toLowerCase().includes('empty')) {
                additions.push('Provides call-to-action when cart or wishlist is empty');
            }
        } else {
            if (!enhanced.toLowerCase().includes('match') && !enhanced.toLowerCase().includes('point')) {
                additions.push('Must point to a valid page on your site');
            }
        }
    }

    // For max/limit/count properties
    if (cleanKey.includes('max') || cleanKey.includes('limit') || cleanKey.includes('count')) {
        if (!enhanced.toLowerCase().includes('empty') && !enhanced.toLowerCase().includes('show all')) {
            additions.push('Leave empty to show all items');
        }
    }

    // For minified/compact view properties
    if (cleanKey.includes('minified') || cleanKey.includes('compact')) {
        if (!enhanced.toLowerCase().includes('space') && !enhanced.toLowerCase().includes('condensed')) {
            additions.push('Use `true` for space-constrained layouts like checkout flows');
        }
    }

    // For undo properties
    if (cleanKey.includes('undo')) {
        if (!enhanced.toLowerCase().includes('customer')) {
            additions.push('Allows customers to restore accidentally removed items');
        }
    }

    // For attribute/field hide/show properties
    if (cleanKey.includes('attribute') || cleanKey.includes('field')) {
        if (cleanKey.includes('hide') && !enhanced.toLowerCase().includes('comma')) {
            additions.push('Use comma-separated list (e.g., `color, size`)');
        }
    }

    // Add default value context
    if (defaultValue && defaultValue !== 'undefined' && defaultValue !== "''") {
        additions.push(`Default: \`${defaultValue}\``);
    }

    // Combine description with additions
    if (additions.length > 0) {
        return `${enhanced}. ${additions.join('. ')}.`;
    }

    return enhanced + '.';
}

/**
 * Generate common configurations section
 * Shows 2-3 real-world configuration examples
 */
function generateCommonConfigurations(blockName, configs) {
    // Only generate for blocks with multiple boolean/toggle configs or URLs
    const toggleConfigs = configs.filter(c =>
        c.type === 'boolean' ||
        c.key.includes('enable') ||
        c.key.includes('hide') ||
        c.key.includes('show')
    );

    const urlConfigs = configs.filter(c =>
        c.key.includes('url') || c.key.includes('path')
    );

    // Need at least 2 toggles OR 2 URLs to generate examples
    if (toggleConfigs.length < 2 && urlConfigs.length < 2) {
        return '';
    }

    let output = `### Common configurations\n\n`;

    // Block-specific examples
    if (blockName === 'commerce-cart') {
        output += `**Quick checkout** (streamlined cart):\n`;
        output += `- Set \`enable-item-quantity-update\` to \`false\`\n`;
        output += `- Set \`enable-estimate-shipping\` to \`false\`\n`;
        output += `- Set \`checkout-url\` to \`/checkout\`\n`;
        output += `- Minimizes steps before checkout\n\n`;

        output += `**Full-featured cart** (maximum customer control):\n`;
        output += `- Set \`enable-item-quantity-update\` to \`true\`\n`;
        output += `- Set \`enable-estimate-shipping\` to \`true\`\n`;
        output += `- Set \`enable-updating-product\` to \`true\`\n`;
        output += `- Set \`start-shopping-url\` to \`/\` for empty cart\n`;
        output += `- Gives customers flexibility to modify before checkout\n\n`;
    }
    else if (blockName === 'commerce-mini-cart') {
        output += `**Basic mini cart** (view and checkout only):\n`;
        output += `- Set \`enable-updating-product\` to \`false\`\n`;
        output += `- Set \`undo-remove-item\` to \`false\`\n`;
        output += `- Set \`checkout-url\` to \`/checkout\`\n`;
        output += `- Simple, streamlined experience\n\n`;

        output += `**Enhanced mini cart** (full product control):\n`;
        output += `- Set \`enable-updating-product\` to \`true\`\n`;
        output += `- Set \`undo-remove-item\` to \`true\`\n`;
        output += `- Set \`cart-url\` to \`/cart\`\n`;
        output += `- Set \`start-shopping-url\` to \`/\` for empty cart\n`;
        output += `- Customers can edit products and undo removals\n\n`;
    }
    else if (blockName === 'commerce-addresses') {
        output += `**Full address management** (default view):\n`;
        output += `- Set \`minified-view\` to \`false\`\n`;
        output += `- Shows complete address management interface with all actions\n\n`;

        output += `**Compact address list** (space-saving view):\n`;
        output += `- Set \`minified-view\` to \`true\`\n`;
        output += `- Shows condensed address list with limited actions\n`;
        output += `- Good for checkout flows or embedded contexts\n\n`;
    }
    else if (blockName === 'commerce-wishlist') {
        output += `**Standard wishlist setup**:\n`;
        output += `- Set \`start-shopping-url\` to \`/\` or your main category page\n`;
        output += `- Provides clear call-to-action when wishlist is empty\n`;
        output += `- Encourages customers to browse products\n\n`;
    }
    else if (blockName === 'commerce-login') {
        output += `**Standard login configuration**:\n`;
        output += `- Set \`redirect-url\` to \`/account\` for post-login destination\n`;
        output += `- Customers land on their account page after signing in\n\n`;
    }
    else if (blockName === 'commerce-create-account') {
        output += `**Standard registration setup**:\n`;
        output += `- Set \`redirect-url\` to \`/account\` for post-registration\n`;
        output += `- New customers see their account dashboard immediately\n\n`;
    }
    else if (blockName === 'product-details') {
        output += `**Standard product page**:\n`;
        output += `- Set \`cart-url\` to \`/cart\` for cart navigation\n`;
        output += `- Customers can easily view cart after adding products\n\n`;
    }
    else if (toggleConfigs.length >= 3) {
        // Generic example for blocks with many toggles
        output += `**Minimal configuration** (essential features only):\n`;
        output += `- Keep most options at default \`false\`\n`;
        output += `- Enable only required features\n\n`;

        output += `**Full configuration** (all features enabled):\n`;
        const enabledKeys = toggleConfigs.slice(0, 3).map(c => `\`${c.key}\``).join(', ');
        output += `- Enable ${enabledKeys} for full functionality\n\n`;
    }

    return output;
}

/**
 * Generate important notes section
 */
function generateImportantNotesSection(blockName, blockPath, configs) {
    const notes = extractImportantNotes(blockPath);

    // Add configuration-specific notes
    const hasUrlConfigs = configs.some(c => c.key.includes('url') || c.key.includes('path'));
    if (hasUrlConfigs && !notes.some(n => n.includes('URL'))) {
        notes.push('URL paths must point to valid pages on your site for navigation to work correctly.');
    }

    if (notes.length === 0) {
        return '';
    }

    let output = `### Important notes\n\n`;
    notes.forEach(note => {
        output += `- ${note}\n`;
    });
    output += '\n';

    return output;
}

/**
 * Extract requirements/prerequisites from README Overview section
 * Looks for sentences mentioning authentication, permissions, or required features
 */
function extractRequirements(blockPath) {
    const readmePath = join(blockPath, 'README.md');

    if (!existsSync(readmePath)) {
        return null;
    }

    try {
        const content = readFileSync(readmePath, 'utf8');

        // Extract Overview section
        const overviewMatch = content.match(/## Overview\n\n([\s\S]*?)(?=\n## |$)/);
        if (!overviewMatch) return null;

        const overview = overviewMatch[1];

        // Look for requirement-related sentences
        const requirementPatterns = [
            /requires?\s+[^.]+(?:authentication|company|enabled|permission|associated)[^.]*\./gi,
            /must\s+(?:be\s+)?(?:enabled|authenticated|associated)[^.]*\./gi,
            /user[s]?\s+(?:must|should|need)[^.]*\./gi,
            /This block requires [^.]+\./gi
        ];

        const requirements = [];
        for (const pattern of requirementPatterns) {
            const matches = overview.match(pattern);
            if (matches) {
                requirements.push(...matches);
            }
        }

        // Remove duplicates and clean up
        const uniqueReqs = [...new Set(requirements)]
            .map(req => {
                req = req.trim();
                // Capitalize first letter
                if (req.length > 0) {
                    req = req.charAt(0).toUpperCase() + req.slice(1);
                }
                // Remove "This block " prefix to avoid redundancy
                req = req.replace(/^This block /, '');
                return req;
            })
            .filter(req => req.length > 20); // Filter out too-short matches

        // Remove near-duplicates (if one contains the other)
        const filtered = uniqueReqs.filter((req, index) => {
            return !uniqueReqs.some((other, otherIndex) =>
                index !== otherIndex && other.toLowerCase().includes(req.toLowerCase())
            );
        });

        return filtered.length > 0 ? filtered : null;

    } catch (error) {
        return null;
    }
}

/**
 * Generate Requirements section if block has prerequisites
 * Priority: 1) Enrichment file, 2) README extraction
 */
function generateRequirementsSection(blockName, blockPath) {
    // Try to load enriched requirements first
    const requirementsEnrichmentPath = join(process.cwd(), '_dropin-enrichments/merchant-blocks/requirements.json');
    let enrichedRequirement = null;

    try {
        if (existsSync(requirementsEnrichmentPath)) {
            const enrichmentData = JSON.parse(readFileSync(requirementsEnrichmentPath, 'utf8'));
            enrichedRequirement = enrichmentData[blockName];  // FIXED: Direct access, not nested
        }
    } catch (error) {
        console.warn(`Warning: Could not load requirements enrichment: ${error.message}`);
    }

    // Use enriched requirement if available
    if (enrichedRequirement) {
        return `## Requirements\n\n${enrichedRequirement}\n\n`;
    }

    // Fall back to README extraction
    const requirements = extractRequirements(blockPath);

    if (!requirements || requirements.length === 0) {
        return '';
    }

    let output = `## Requirements\n\n`;

    if (requirements.length === 1) {
        // Single requirement as a paragraph
        let req = requirements[0];
        // Ensure it starts with "This block" for clarity
        if (!req.toLowerCase().startsWith('this block')) {
            req = `This block ${req.charAt(0).toLowerCase()}${req.slice(1)}`;
        }
        output += `${req}\n\n`;
    } else {
        // Multiple requirements as a list
        requirements.forEach(req => {
            output += `- ${req}\n`;
        });
        output += '\n';
    }

    return output;
}

/**
 * Generate merchant-friendly description for a block
 * Priority: 1) Verified enrichment, 2) README extraction, 3) Fallback
 */
function generateMerchantDescription(blockName, blockPath) {
    const enrichments = loadDescriptionEnrichments();
    const key = blockName.replace('commerce-', '');

    // Priority 1: Use verified enrichment if available
    if (enrichments[key] && enrichments[key].verified) {
        return enrichments[key].description;
    }

    // Priority 2: Extract from README
    const readmePath = join(blockPath, 'README.md');
    const readmeDescription = extractDescriptionFromReadme(readmePath);
    if (readmeDescription) {
        return readmeDescription;
    }

    // Priority 3: Use unverified enrichment if available
    if (enrichments[key]) {
        return enrichments[key].description;
    }

    // Priority 4: Fallback to generic description
    return `Configure the ${blockName.replace('commerce-', '').replace(/-/g, ' ')} block for your store.`;
}

/**
 * Generate configuration tips for merchants
 */
function generateTips(blockName, configs) {
    const tips = [];

    if (configs.length > 0) {
        tips.push('Use document authoring to configure this block without writing code.');
        tips.push('Test configuration changes in preview before publishing to production.');
    }

    if (blockName.includes('cart') || blockName.includes('checkout')) {
        tips.push('Ensure your configuration matches your Adobe Commerce backend settings.');
    }

    if (blockName.includes('product')) {
        tips.push('Configure product attributes to match your catalog structure.');
    }

    return tips;
}

/**
 * Convert kebab-case to Title Case (matching AEM document authoring format)
 * e.g., "enable-item-quantity-update" -> "Enable Item Quantity Update"
 */
function toTitleCase(str) {
    return str.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Get readable title and label for B2B blocks
 * Returns null for non-B2B blocks (use default title generation)
 */
function getB2BBlockTitles(blockName) {
    // Remove 'commerce-' prefix for matching
    const name = blockName.replace('commerce-', '');
    
    // B2B block title transformations
    const b2bTitles = {
        // Purchase Order blocks
        'b2b-po-approval-flow': { title: 'Purchase Order Approval Flow', label: 'PO Approval Flow' },
        'b2b-po-approval-rule-details': { title: 'Purchase Order Approval Rule Details', label: 'PO Approval Rule Details' },
        'b2b-po-approval-rule-form': { title: 'Purchase Order Approval Rule Form', label: 'PO Approval Rule Form' },
        'b2b-po-approval-rules-list': { title: 'Purchase Order Approval Rules List', label: 'PO Approval Rules List' },
        'b2b-po-checkout-success': { title: 'Purchase Order Checkout Success', label: 'PO Checkout Success' },
        'b2b-po-comment-form': { title: 'Purchase Order Comment Form', label: 'PO Comment Form' },
        'b2b-po-comments-list': { title: 'Purchase Order Comments List', label: 'PO Comments List' },
        'b2b-po-company-purchase-orders': { title: 'Company Purchase Orders', label: 'Company POs' },
        'b2b-po-customer-purchase-orders': { title: 'Customer Purchase Orders', label: 'My POs' },
        'b2b-po-header': { title: 'Purchase Order Header', label: 'PO Header' },
        'b2b-po-history-log': { title: 'Purchase Order History Log', label: 'PO History Log' },
        'b2b-po-require-approval-purchase-orders': { title: 'Purchase Orders Requiring Approval', label: 'POs Requiring Approval' },
        'b2b-po-status': { title: 'Purchase Order Status', label: 'PO Status' },
        
        // Quote Management blocks
        'b2b-negotiable-quote': { title: 'Negotiable Quote', label: 'Negotiable Quote' },
        'b2b-negotiable-quote-template': { title: 'Negotiable Quote Template', label: 'Quote Template' },
        'b2b-quote-checkout': { title: 'Quote Checkout', label: 'Quote Checkout' },
        
        // Requisition List blocks
        'b2b-requisition-list': { title: 'Requisition Lists', label: 'Requisition Lists' },
        'b2b-requisition-list-view': { title: 'Requisition List View', label: 'List View' },
        
        // Company Management blocks
        'company-accept-invitation': { title: 'Accept Company Invitation', label: 'Accept Invitation' },
        'company-create': { title: 'Create Company', label: 'Create Company' },
        'company-credit': { title: 'Company Credit', label: 'Company Credit' },
        'company-profile': { title: 'Company Profile', label: 'Company Profile' },
        'company-roles-permissions': { title: 'Company Roles and Permissions', label: 'Roles & Permissions' },
        'company-structure': { title: 'Company Structure', label: 'Company Structure' },
        'company-users': { title: 'Company Users', label: 'Company Users' },
        
        // Checkout & Account blocks
        'account-nav': { title: 'Account Navigation', label: 'Account Navigation' },
        'checkout-success': { title: 'Checkout Success', label: 'Checkout Success' },
        'customer-company': { title: 'Customer Company', label: 'Customer Company' },
    };
    
    return b2bTitles[name] || null;
}

/**
 * Format value for AEM document authoring
 * Shows example values for empty properties based on property name and type
 */
function formatValueForAEM(value, type, propertyKey) {
    if (value === '' || value === 'undefined' || value === "''") {
        // Show example values based on property name and type
        let example = '';
        const keyLower = propertyKey.toLowerCase();

        // Number-like properties (even if stored as string in AEM)
        // Check property name patterns first, before type check
        if (keyLower.includes('max') || keyLower.includes('min') ||
            keyLower.includes('count') || keyLower.includes('items') ||
            keyLower.includes('limit') || keyLower.includes('quantity') ||
            keyLower.includes('number') || keyLower.includes('size') ||
            keyLower.includes('amount') || keyLower.includes('total')) {
            example = '10';
        }
        // Attribute-related properties (check before ID to avoid false matches)
        else if (keyLower.includes('attributes') || keyLower.includes('attribute')) {
            example = 'color, size';
        }
        // SKU-related properties
        else if (keyLower.includes('sku') || keyLower.includes('currentsku')) {
            example = 'ABC-123';
        }
        // ID-related properties (check after attributes to avoid false matches)
        else if (keyLower.includes('id') || keyLower.includes('recid') || keyLower.includes('reqid')) {
            example = 'rec-12345';
        }
        // URL-related properties
        else if (keyLower.includes('url') || keyLower.includes('link') || keyLower.includes('path')) {
            example = '/path/to/page';
        }
        // Name or title properties
        else if (keyLower.includes('name') || keyLower.includes('title')) {
            example = 'Example Name';
        }
        // Number type (explicit)
        else if (type === 'number') {
            example = '10';
        }
        // Boolean type
        else if (type === 'boolean') {
            example = 'true';
        }
        // Default string
        else {
            example = 'value';
        }

        return `<em style="color: var(--sl-color-gray-3); font-style: italic;">${example} <span style="font-size: 0.85em;">(example)</span></em>`;
    }
    return value;
}

/**
 * Generate configuration section for blocks with no config properties
 * Provides clear instructions for creating the block in DA.live
 */
function generateNoConfigurationSection(blockName) {
    let output = `## Configuration\n\n`;
    output += `No configurations available for this block.\n\n`;
    return output;
}

/**
 * Generate section metadata table for document authoring
 * Shows common section styling options available to all blocks
 * Varies examples across blocks for demonstration
 */
function generateSectionMetadataTable(blockName) {
    // Vary examples across blocks to show different options
    // All values verified from boilerplate/styles/styles.css lines 406-491
    const styleExamples = {
        'default': 'light',
        'alt1': 'highlight',
        'alt2': 'light, highlight'  // Shows multiple values supported
    };

    // Distribute examples based on block name for variety
    let styleValue = styleExamples.default;
    if (blockName.includes('b2b')) {
        styleValue = styleExamples.alt1;  // B2B blocks use 'highlight'
    } else if (blockName.includes('cart') || blockName.includes('checkout')) {
        styleValue = styleExamples.alt2;  // Key blocks show multiple values
    }

    let output = `## Section metadata\n\n`;
    output += `Control the section styling, spacing, and layout that wraps your commerce block. All properties are optional:\n\n`;

    // Table with full-width responsive layout showing ALL section-metadata properties
    output += `<table style="width: 100%; min-width: 470px; max-width: 100%; table-layout: fixed; border-collapse: collapse;">\n`;
    output += `<tbody>\n`;

    // First row: section-metadata label
    output += `<tr>\n`;
    output += `<td colspan="2" style="text-align: center; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5); background-color: var(--sl-color-gray-6); font-weight: 600;">section-metadata</td>\n`;
    output += `</tr>\n`;

    // Style row (background color)
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Style</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);"><em style="color: var(--sl-color-gray-3); font-style: italic;">${styleValue} <span style="font-size: 0.85em;">(optional)</span></em></td>\n`;
    output += `</tr>\n`;

    // Padding row (vertical spacing inside section)
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Padding</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);"><em style="color: var(--sl-color-gray-3); font-style: italic;">medium <span style="font-size: 0.85em;">(optional)</span></em></td>\n`;
    output += `</tr>\n`;

    // Margin row (vertical spacing outside section)
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Margin</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);"><em style="color: var(--sl-color-gray-3); font-style: italic;">small <span style="font-size: 0.85em;">(optional)</span></em></td>\n`;
    output += `</tr>\n`;

    // Column Width row (for multi-column layouts)
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Column Width</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);"><em style="color: var(--sl-color-gray-3); font-style: italic;">30% <span style="font-size: 0.85em;">(optional)</span></em></td>\n`;
    output += `</tr>\n`;

    // Gap row (spacing between columns)
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Gap</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);"><em style="color: var(--sl-color-gray-3); font-style: italic;">small <span style="font-size: 0.85em;">(optional)</span></em></td>\n`;
    output += `</tr>\n`;

    output += `</tbody>\n`;
    output += `</table>\n\n`;

    output += `<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0 2rem 0;">\n`;
    output += `<strong>Learn more:</strong> See the <a href="/merchants/storefront-builder/section-metadata/">Section Metadata guide</a> for all available values and the <a href="/merchants/storefront-builder/page-metadata/">Page Metadata guide</a> for SEO and caching options.\n`;
    output += `</div>\n\n`;

    return output;
}

/**
 * Generate page metadata table for document authoring
 * Used for blocks that need page-level metadata (robots, cache-control, title)
 */
function generateMetadataTable(blockName, blockDisplayName) {
    // Only generate metadata table for specific blocks that need it
    // These are full-page blocks that need SEO/caching controls
    const blocksWithMetadata = [
        // B2C full pages
        'commerce-checkout',
        'commerce-cart',
        'commerce-login',
        'commerce-create-account',
        'commerce-addresses',
        // B2B Company Management pages (user-specific account pages)
        'commerce-company-create',
        'commerce-company-profile',
        'commerce-company-users',
        'commerce-company-structure',
        'commerce-company-roles-permissions',
        'commerce-company-credit',
        // B2B Purchase Order pages (user-specific transaction pages)
        'commerce-b2b-po-company-purchase-orders',
        'commerce-b2b-po-customer-purchase-orders',
        'commerce-b2b-po-approval-rules-list',
        'commerce-b2b-po-require-approval-purchase-orders',
        // B2B Quote pages (user-specific, should not be cached/indexed)
        'commerce-b2b-negotiable-quote',
        'commerce-b2b-quote-checkout',
        // B2B Requisition List pages (user shopping lists)
        'commerce-b2b-requisition-list',
        'commerce-b2b-requisition-list-view'
    ];

    if (!blocksWithMetadata.includes(blockName)) {
        return '';
    }

    // Determine metadata values based on block type
    let robots = '';
    let cacheControl = '';
    let title = blockDisplayName;
    let template = '';

    if (blockName === 'commerce-checkout') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Checkout';
    } else if (blockName === 'commerce-cart') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Cart';
    } else if (blockName === 'commerce-login' || blockName === 'commerce-create-account') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = blockDisplayName.replace('Commerce ', '');
    } else if (blockName === 'commerce-addresses') {
        robots = 'noindex, nofollow';
        title = 'Addresses';
        template = 'Addresses, Columns';
        // B2B Company Management pages
    } else if (blockName === 'commerce-company-create') {
        robots = 'noindex, nofollow';
        title = 'Company Registration';
    } else if (blockName === 'commerce-company-profile') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Company Profile';
    } else if (blockName === 'commerce-company-users') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Company Users';
    } else if (blockName === 'commerce-company-structure') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Company Structure';
    } else if (blockName === 'commerce-company-roles-permissions') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Roles & Permissions';
    } else if (blockName === 'commerce-company-credit') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Company Credit';
        // B2B Purchase Order pages
    } else if (blockName === 'commerce-b2b-po-company-purchase-orders') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Purchase Orders';
    } else if (blockName === 'commerce-b2b-po-customer-purchase-orders') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'My Purchase Orders';
    } else if (blockName === 'commerce-b2b-po-approval-rules-list') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Approval Rules';
    } else if (blockName === 'commerce-b2b-po-require-approval-purchase-orders') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Requires My Approval';
        // B2B Quote pages
    } else if (blockName === 'commerce-b2b-negotiable-quote') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Quotes';
    } else if (blockName === 'commerce-b2b-quote-checkout') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Checkout';
        // B2B Requisition List pages
    } else if (blockName === 'commerce-b2b-requisition-list') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Requisition Lists';
    } else if (blockName === 'commerce-b2b-requisition-list-view') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Requisition List';
    }

    let output = `## Page metadata\n\n`;
    output += `Configure page-level metadata in the document authoring table below:\n\n`;

    // Table with full-width responsive layout
    output += `<table style="width: 100%; min-width: 470px; max-width: 100%; table-layout: fixed; border-collapse: collapse;">\n`;
    output += `<tbody>\n`;

    // First row: metadata label
    output += `<tr>\n`;
    output += `<td colspan="2" style="text-align: center; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5); background-color: var(--sl-color-gray-6); font-weight: 600;">metadata</td>\n`;
    output += `</tr>\n`;

    // Title row (always present)
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Title</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${title}</td>\n`;
    output += `</tr>\n`;

    // Template row (only for addresses)
    if (template) {
        output += `<tr>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Template</td>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${template}</td>\n`;
        output += `</tr>\n`;
    }

    // Robots row
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Robots</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${robots}</td>\n`;
    output += `</tr>\n`;

    // Cache Control row (only for checkout, cart, login, create-account)
    if (cacheControl) {
        output += `<tr>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Cache Control</td>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${cacheControl}</td>\n`;
        output += `</tr>\n`;
    }

    output += `</tbody>\n`;
    output += `</table>\n\n`;

    return output;
}

/**
 * Generate document authoring configuration table with descriptions
 * Combines configuration example with property descriptions for one-stop reference
 */
function generateDocumentAuthoringTable(blockName, configs) {
    if (configs.length === 0) {
        return '';
    }

    // Filter out placeholder/empty configs (those with key '–' or empty)
    const validConfigs = configs.filter(c => c.key && c.key !== '–' && c.key.trim() !== '');

    if (validConfigs.length === 0) {
        return '';
    }

    let output = `## Configuration\n\n`;
    output += `Add this table to your document to configure the block:\n\n`;

    // Table with full-width responsive layout
    output += `<table style="width: 100%; min-width: 470px; max-width: 100%; table-layout: fixed; border-collapse: collapse;">\n`;
    output += `<tbody>\n`;

    // First row: block name only (single cell, centered)
    output += `<tr>\n`;
    output += `<td colspan="2" style="text-align: center; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5); background-color: var(--sl-color-gray-6); font-weight: 600;">${blockName}</td>\n`;
    output += `</tr>\n`;

    // Property rows: Title Case names and formatted values with examples
    for (const config of validConfigs) {
        const titleCaseName = toTitleCase(config.key);
        const formattedValue = formatValueForAEM(config.default, config.type, config.key);
        output += `<tr>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${titleCaseName}</td>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${formattedValue}</td>\n`;
        output += `</tr>\n`;
    }

    output += `</tbody>\n`;
    output += `</table>\n\n`;

    // Add property descriptions if they exist
    const configsWithDescriptions = validConfigs.filter(c => c.description && c.description.trim() && c.description !== 'This block has no authorable configuration.');
    if (configsWithDescriptions.length > 0) {
        output += `### Property descriptions\n\n`;
        for (const config of configsWithDescriptions) {
            const titleCaseName = toTitleCase(config.key);
            const enhancedDesc = generateEnhancedPropertyDescription(
                config.key,
                config.description.trim(),
                config.type,
                config.default,
                blockName  // ADDED: Pass blockName for enrichment lookup
            );
            output += `**${titleCaseName}**: ${enhancedDesc}\n\n`;
        }
    }

    return output;
}

// ============================================================================
// BLOCK EXTRACTION
// ============================================================================

/**
 * Extract commerce blocks from boilerplate
 */
function extractCommerceBlocks(boilerplatePath) {
    console.log('\n🔍 Analyzing commerce blocks...');

    const blocksDir = join(boilerplatePath, 'blocks');
    const blocks = [];

    if (!existsSync(blocksDir)) {
        console.log('  ⚠️  Blocks directory not found');
        return blocks;
    }

    const blockDirs = readdirSync(blocksDir).filter(name => {
        const path = join(blocksDir, name);
        return statSync(path).isDirectory();
    });

    for (const blockName of blockDirs) {
        // Only process commerce-related blocks
        if (!blockName.startsWith('commerce-') &&
            !blockName.includes('product') &&
            !blockName.includes('cart') &&
            !blockName.includes('checkout')) {
            continue;
        }

        const blockPath = join(blocksDir, blockName);
        const readmePath = join(blockPath, 'README.md');

        // SOURCE CODE IS THE ONLY SOURCE OF TRUTH
        // Extract configs from actual readBlockConfig() calls in .js file
        let configs = extractConfigFromSource(blockPath);

        // Enrich with descriptions from README (if available)
        if (configs.length > 0) {
            const readmeConfigs = extractConfigFromReadme(readmePath);
            const readmeMap = new Map(readmeConfigs.map(c => [c.key, c]));

            for (const config of configs) {
                const readmeConfig = readmeMap.get(config.key);
                if (readmeConfig) {
                    // Enrich with README description and type (if source type is unclear)
                    config.description = readmeConfig.description || '';
                    if (!config.type && readmeConfig.type) {
                        config.type = readmeConfig.type;
                    }
                    config.sideEffects = readmeConfig.sideEffects || '';
                } else {
                    // Config exists in source but not documented in README
                    config.description = 'No description available (not documented in README)';
                }
            }
        }

        // Get B2B-specific titles if available, otherwise use default title case
        const b2bTitles = getB2BBlockTitles(blockName);
        const displayName = b2bTitles?.title || blockName.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        const sidebarLabel = b2bTitles?.label || blockName.replace('commerce-', '').split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        blocks.push({
            name: blockName,
            displayName: displayName,
            sidebarLabel: sidebarLabel,
            path: blockPath,
            configs,
            hasReadme: existsSync(readmePath)
        });
    }

    console.log(`  ✓ Found ${blocks.length} commerce blocks`);
    return blocks;
}

// ============================================================================
// DOCUMENTATION GENERATION
// ============================================================================

/**
 * Get boilerplate version from package.json
 * This provides a consistent semantic version (e.g., 4.0.1) rather than
 * git tags which may be descriptive (e.g., "fix-headers")
 */
function getBoilerplateVersion(boilerplatePath) {
    try {
        // Primary: Use package.json version (semantic versioning)
        const packageJsonPath = join(boilerplatePath, 'package.json');
        if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.version) {
                return packageJson.version;
            }
        }
    } catch (error) {
        console.warn('  ⚠️  Could not read package.json version');
    }

    // Fallback: Try git tag (only if package.json fails)
    try {
        const tag = execSync('git describe --tags --abbrev=0', {
            cwd: boilerplatePath,
            encoding: 'utf8'
        }).trim();
        // Remove 'v' prefix if present
        return tag.replace(/^v/, '');
    } catch {
        return 'latest';
    }
}

/**
 * Mapping of blocks to their setup/tutorial guides
 */
const setupGuideMapping = {
    'product-recommendations': '/merchants/commerce-blocks/product-recommendations/'
};

/**
 * Generate merchant documentation for a single block
 */
function generateMerchantBlockDoc(block, outputDir, boilerplateVersion) {
    const description = generateMerchantDescription(block.name, block.path);
    const documentAuthoringTable = generateDocumentAuthoringTable(block.name, block.configs);
    const metadataTable = generateMetadataTable(block.name, block.displayName);
    const requirementsSection = generateRequirementsSection(block.name, block.path);
    const setupGuideUrl = setupGuideMapping[block.name];

    const sidebarLabel = block.sidebarLabel || block.displayName;
    let content = `---
title: ${block.displayName}
description: ${description}
sidebar:
  label: ${sidebarLabel}
---

${description}

`;

    // Add setup guide note if one exists
    if (setupGuideUrl) {
        content += `:::note[Setup required]
Before using this block, see the [${block.displayName} setup guide](${setupGuideUrl}) for configuration instructions.
:::

`;
    }

    // Add requirements section (if block has prerequisites)
    if (requirementsSection) {
        content += requirementsSection;
    }

    // Add document authoring table with descriptions
    if (block.configs.length > 0) {
        content += documentAuthoringTable;

        // Add common configurations section (for blocks with multiple options)
        const commonConfigs = generateCommonConfigurations(block.name, block.configs);
        if (commonConfigs) {
            content += commonConfigs;
        }

        // Add important notes section
        const importantNotes = generateImportantNotesSection(block.name, block.path, block.configs);
        if (importantNotes) {
            content += importantNotes;
        }
    } else {
        content += generateNoConfigurationSection(block.name);
    }

    // Add page metadata table (for blocks that need it)
    if (metadataTable) {
        content += metadataTable;
    }

    // Add section metadata table (available to ALL blocks)
    content += generateSectionMetadataTable(block.name);

    // Write file
    const outputPath = join(outputDir, 'blocks', `${block.name}.mdx`);
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

try {
    console.log('\n' + '='.repeat(60));
    console.log('  MERCHANT BLOCK DOCUMENTATION GENERATOR');
    console.log('='.repeat(60));

    // Clone/update boilerplate - use b2b-suite-release1 branch for B2B blocks
    const { path: boilerplatePath } = cloneOrUpdateBoilerplate('b2b-suite-release1');

    // Extract blocks
    const blocks = extractCommerceBlocks(boilerplatePath);

    // Detect changes since last verification
    const changeReport = detectChanges(boilerplatePath, blocks);

    if (changeReport.hasChanges) {
        console.log('\n⚠️  CHANGES DETECTED - Review recommended before generation');

        if (changeReport.sourceCodeChanges.length > 0) {
            console.log('\n   📝 Source code changes may affect configurations');
        }

        if (changeReport.readmeChanges.length > 0) {
            console.log('   📖 README changes may affect descriptions');
        }

        console.log('\n   💡 Run verification after generation:');
        console.log('      node scripts/@verify-block-configs-source-code.js');
        console.log('      node scripts/@verify-merchant-block-descriptions.js');
        console.log('\n   ⚠️  Continuing with generation using current enrichments...\n');
    }

    // Generate documentation
    const outputDir = join(projectRoot, 'src', 'content', 'docs', 'merchants');

    console.log('\n📝 Generating merchant block documentation...');
    const boilerplateVersion = getBoilerplateVersion(boilerplatePath);
    let blockCount = 0;
    for (const block of blocks) {
        generateMerchantBlockDoc(block, outputDir, boilerplateVersion);
        blockCount++;
    }

    // Update enrichment metadata after successful generation
    updateEnrichmentMetadata(boilerplatePath, blockCount);
    console.log(`  ✅ Generated ${blockCount} block docs`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Generation Summary:\n');
    console.log(`✅ Commerce blocks: ${blocks.length}`);
    console.log(`📄 Total pages: ${blocks.length}`);

    console.log('\n📝 Generated Documentation:\n');
    console.log(`   📂 /merchants/blocks/`);
    blocks.forEach(block => {
        console.log(`      📄 ${block.name}.mdx`);
    });

    console.log('\n✨ Merchant block documentation generation complete!\n');

} catch (error) {
    console.error('\n❌ Error generating merchant block documentation:');
    console.error(`   ${error.message}`);
    console.error(`\n${error.stack}`);
    process.exit(1);
}

