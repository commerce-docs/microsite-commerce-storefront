#!/usr/bin/env node

/**
 * Event Documentation Generator
 * 
 * This script generates event documentation for drop-in components by:
 * 1. Cloning/updating source repositories
 * 2. Scanning source code for event emissions and listeners
 * 3. Extracting TypeScript type definitions
 * 4. Generating comprehensive MDX documentation with examples
 * 
 * USAGE:
 * - Generate all drop-ins: npm run generate-event-docs
 * - Generate single drop-in: npm run generate-event-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services
 * 
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-events.mdx
 * - Uses: Section text, imports, REPEAT_FOR_EACH_EVENT block, placeholders
 * - Generates independently: Table contents (between START/END markers), event data
 * 
 * ENRICHMENT FILES:
 * - Location: _dropin-enrichments/{dropin}/events.json
 * - Can include "overview" field for drop-in-specific introductions
 * - Falls back to generic overview if not specified
 * 
 * TO MODIFY TABLE STRUCTURE:
 * - Update table generation code in this script (search for "Generate emits table")
 * - Update template example rows to match (for documentation purposes)
 * - Both must stay in sync!
 * 
 * IMPORTANT: Always verify against source repositories rather than making assumptions.
 * This ensures accuracy in type definitions, API patterns, and code examples.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, execFileSync } from 'child_process';
import { DROPIN_REPOS } from './lib/dropin-config.js';
import { loadEventEnrichments, getPayloadPropertyDescription, getEventDescription } from './lib/event-enrichment.js';
import { TypeInferenceChecklist } from './lib/type-inference.js';
import { validateAllEventDocs } from './lib/payload-type-validator.js';
import { GenericTypeHandler } from './lib/core/generic-type-handler.js';
import { TypeExtractor } from './lib/core/type-extractor.js';
import { CrossDropinResolver } from './lib/core/cross-dropin-resolver.js';
import { generateNoEventsPage } from './lib/markdown/empty-state-generator.js';
import { cleanVersion } from './lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function cloneOrUpdateBoilerplate() {
    const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');
    const boilerplateUrl = 'https://github.com/hlxsites/aem-boilerplate-commerce.git';

    console.log(`\n📦 Setting up boilerplate repository...`);

    if (!existsSync(boilerplatePath)) {
        console.log(`  Cloning boilerplate...`);
        mkdirSync(dirname(boilerplatePath), { recursive: true });
        execFileSync('git', ['clone', '--depth', '1', '--branch', 'main', boilerplateUrl, boilerplatePath], { stdio: 'inherit' });

        console.log(`  Installing boilerplate dependencies...`);
        execFileSync('npm', ['install'], { stdio: 'inherit', cwd: boilerplatePath });
    } else {
        console.log(`  Updating boilerplate...`);
        // Reset any local changes before pulling
        execFileSync('git', ['reset', '--hard', 'HEAD'], { cwd: boilerplatePath, stdio: 'pipe' });
        execFileSync('git', ['pull'], { stdio: 'inherit', cwd: boilerplatePath });

        console.log(`  Updating dependencies...`);
        execFileSync('npm', ['install'], { stdio: 'inherit', cwd: boilerplatePath });
    }

    return boilerplatePath;
}

function getBoilerplatePackageVersions(boilerplatePath) {
    const packageJsonPath = join(boilerplatePath, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.dependencies || {};
}

function cloneDropinAtVersion(repoName, repoConfig, version) {
    const dropinPath = join(projectRoot, '.temp-repos', repoName);

    // Clean version string (remove ~ ^ etc)
    const cleanVersionStr = cleanVersion(version);
    const tag = `v${cleanVersionStr}`;

    console.log(`  Using version: ${cleanVersionStr}`);

    if (!existsSync(dropinPath)) {
        console.log(`  Cloning repository at ${tag}...`);
        try {
            execFileSync('git', ['clone', '--depth', '1', '--branch', tag, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
        } catch (error) {
            // If tag doesn't exist, try without 'v' prefix
            console.log(`  Tag ${tag} not found, trying ${cleanVersionStr}...`);
            execFileSync('git', ['clone', '--depth', '1', '--branch', cleanVersionStr, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
        }
    } else {
        console.log(`  Checking out ${tag}...`);
        try {
            // First fetch all tags
            execFileSync('git', ['fetch', '--tags'], { cwd: dropinPath, stdio: 'pipe' });
            // Then checkout the specific tag
            execFileSync('git', ['checkout', tag], { cwd: dropinPath, stdio: 'pipe' });
        } catch (error) {
            // If tag with 'v' doesn't exist, try without
            console.log(`  Tag ${tag} not found, trying ${cleanVersionStr}...`);
            try {
                execFileSync('git', ['checkout', cleanVersionStr], { cwd: dropinPath, stdio: 'pipe' });
            } catch (secondError) {
                console.error(`  ⚠️  Warning: Could not checkout ${cleanVersionStr}, repository may be at outdated version`);
                // Continue anyway - the repo might already be at the correct version
            }
        }
    }

    return dropinPath;
}

/**
 * Use existing drop-in repository without version constraints
 * This is used for B2B drop-ins that aren't in the boilerplate
 */
function useExistingDropinRepo(repoName, repoConfig) {
    const dropinPath = join(projectRoot, '.temp-repos', repoName);

    if (!existsSync(dropinPath)) {
        console.log(`  Repository not found at ${dropinPath}`);
        console.log(`  Cloning from default branch...`);
        execFileSync('git', ['clone', repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
    }

    // Get current ref/branch/tag
    try {
        // Try to get exact tag
        const actualVersion = execFileSync('git', ['describe', '--tags', '--exact-match'],
            { cwd: dropinPath, encoding: 'utf8', stdio: 'pipe' }).trim();
        console.log(`  Using version: ${actualVersion}`);
    } catch {
        // Not on a tag, get branch or commit
        try {
            const actualVersion = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'],
                { cwd: dropinPath, encoding: 'utf8', stdio: 'pipe' }).trim();
            console.log(`  Using branch: ${actualVersion}`);
        } catch {
            const actualVersion = execFileSync('git', ['rev-parse', '--short', 'HEAD'],
                { cwd: dropinPath, encoding: 'utf8', stdio: 'pipe' }).trim();
            console.log(`  Using commit: ${actualVersion}`);
        }
    }

    return dropinPath;
}

function scanForEvents(repoPath) {
    console.log(`  🔍 Scanning for events...`);

    const eventEmits = new Map();
    const eventListeners = new Map();

    // Find all TypeScript/JavaScript files (excluding tests and node_modules)
    try {
        let files;
        if (process.platform === 'win32') {
            // Use 'cmd.exe' to call 'dir' with proper quoting
            const dirArgs = [
                '/s', '/b',
                `${repoPath}\\src\\*.ts`,
                `${repoPath}\\src\\*.tsx`
            ];
            // Use execFileSync to avoid shell interpretation
            files = execFileSync('cmd.exe', ['/c', 'dir', ...dirArgs], { encoding: 'utf8' })
                .split('\r\n')
                .filter(f => f.trim());
        } else {
            const findArgs = [
                `${repoPath}/src`,
                '-type', 'f',
                '(', '-name', '*.ts', '-o', '-name', '*.tsx', ')',
                '!', '-path', '*/node_modules/*',
                '!', '-name', '*.test.*',
                '!', '-name', '*.d.ts'
            ];
            files = execFileSync('find', findArgs, { encoding: 'utf8' })
                .split('\n')
                .filter(f => f.trim());
        }

        files.forEach(file => {
            if (!existsSync(file)) return;

            const content = readFileSync(file, 'utf8');
            const relativePath = file.replace(repoPath, '').replace(/\\/g, '/');

            // Find events.emit calls
            const emitPattern = /events\.emit\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\)/g;
            let match;
            while ((match = emitPattern.exec(content)) !== null) {
                const eventName = match[1];
                const payload = match[2].trim();
                if (!eventEmits.has(eventName)) {
                    eventEmits.set(eventName, []);
                }
                eventEmits.get(eventName).push({
                    file: relativePath,
                    line: content.substring(0, match.index).split('\n').length,
                    payload: payload.length > 80 ? payload.substring(0, 80) + '...' : payload
                });
            }

            // Find events.on calls
            const onPattern = /events\.on\s*\(\s*['"`]([^'"`]+)['"`]/g;
            while ((match = onPattern.exec(content)) !== null) {
                const eventName = match[1];
                if (!eventListeners.has(eventName)) {
                    eventListeners.set(eventName, []);
                }
                eventListeners.get(eventName).push({
                    file: relativePath,
                    line: content.substring(0, match.index).split('\n').length
                });
            }
        });
    } catch (error) {
        console.error(`  ⚠️  Error scanning files: ${error.message}`);
    }

    // Read TypeScript event definitions using TypeExtractor
    const typeExtractor = new TypeExtractor(repoPath);
    const typedEvents = typeExtractor.extractEventTypes();

    console.log(`  ✓ Found ${eventEmits.size} emitted events`);
    console.log(`  ✓ Found ${eventListeners.size} listened events`);
    console.log(`  ✓ Found ${typedEvents.size} typed events`);

    return { eventEmits, eventListeners, typedEvents };
}

/**
 * Find and parse an interface/type definition from source files
 * @param {string} typeName - The name of the type to find (e.g., "Item", "CartModel")
 * @param {string} dropinSourcePath - Path to the drop-in source code
 * @returns {Array|null} Array of properties or null if not found
 */
function resolveTypeDefinition(typeName, dropinSourcePath) {
    try {
        // Common locations for type definitions
        const possiblePaths = [
            join(dropinSourcePath, 'data', 'models'),
            join(dropinSourcePath, 'types'),
            join(dropinSourcePath, 'api', 'types'),
        ];

        let interfaceContent = null;

        // Search for the interface definition
        for (const searchPath of possiblePaths) {
            if (!existsSync(searchPath)) continue;

            const files = readdirSync(searchPath, { recursive: true });
            for (const file of files) {
                if (!file.endsWith('.ts') && !file.endsWith('.d.ts')) continue;

                const filePath = join(searchPath, file);
                const content = readFileSync(filePath, 'utf8');

                // Look for interface or type definition - find the start
                const startRegex = new RegExp(
                    `export\\s+(interface|type)\\s+${typeName}\\s*\\{`,
                    'm'
                );
                const startMatch = content.match(startRegex);

                if (startMatch) {
                    // Find the matching closing brace
                    const startIndex = startMatch.index + startMatch[0].length;
                    let braceCount = 1;
                    let endIndex = startIndex;

                    for (let i = startIndex; i < content.length && braceCount > 0; i++) {
                        if (content[i] === '{') braceCount++;
                        if (content[i] === '}') braceCount--;
                        if (braceCount === 0) {
                            endIndex = i;
                            break;
                        }
                    }

                    if (braceCount === 0) {
                        interfaceContent = content.substring(startIndex, endIndex);
                        break;
                    }
                }
            }

            if (interfaceContent) break;
        }

        if (!interfaceContent) {
            return null;
        }

        // Parse the interface properties
        const properties = [];
        const lines = interfaceContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

            // Match property definitions: name: type or name?: type
            const propMatch = trimmed.match(/^(\w+)(\?)?:\s*([^;]+);?/);
            if (propMatch) {
                const [, name, optionalMarker, type] = propMatch;
                properties.push({
                    name: name.trim(),
                    type: type.trim(),
                    optional: !!optionalMarker
                });
            }
        }

        return properties.length > 0 ? properties : null;
    } catch (error) {
        // Silent failure - type resolution is a best-effort feature
        return null;
    }
}

/**
 * Parse a single parameter for event payloads (similar to function parameter parsing)
 * @param {string} paramStr - Parameter string
 * @returns {object|null} Parsed parameter object
 */
function parseEventParameter(paramStr) {
    // Enhanced parsing to handle default values
    // Matches: name?: type = default, name: type = default, name?: type, name: type
    const propMatch = paramStr.match(/^\s*(\w+)(\?)?\s*:\s*([^=]+)(=\s*(.+))?$/);
    if (propMatch) {
        const [, name, optionalMarker, type, , defaultValue] = propMatch;
        const hasDefault = !!defaultValue;
        const isOptional = !!optionalMarker || hasDefault;

        return {
            name: name.trim(),
            type: type.trim(),
            optional: isOptional,
            defaultValue: defaultValue ? defaultValue.trim() : undefined
        };
    }

    // Fallback to simpler parsing if enhanced parsing fails
    const simplePropMatch = paramStr.match(/^\s*(\w+)\??\s*:\s*(.+)$/);
    if (simplePropMatch) {
        const [, name, type] = simplePropMatch;
        return {
            name: name.trim(),
            type: type.trim(),
            optional: paramStr.includes('?')
        };
    }

    return null;
}

/**
 * Extract nested properties from an inline object type in event payloads
 * @param {string} objectType - Object type string like "{ sku: string; quantity: number }[]"
 * @returns {Array} Nested properties
 */
function extractNestedEventProperties(objectType) {
    const properties = [];

    // Remove array brackets if present
    let cleanType = objectType.trim();
    if (cleanType.endsWith('[]')) {
        cleanType = cleanType.slice(0, -2).trim();
    }
    if (cleanType.startsWith('[') && cleanType.endsWith(']')) {
        cleanType = cleanType.slice(1, -1).trim();
    }

    // Extract content between braces
    const match = cleanType.match(/^\{([\s\S]*)\}$/);
    if (!match) return properties;

    const content = match[1];
    let current = '';
    let depth = 0;

    // Split on semicolons at depth 0
    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (char === '{' || char === '[' || char === '<') {
            depth++;
        } else if (char === '}' || char === ']' || char === '>') {
            depth--;
        }

        if (char === ';' && depth === 0) {
            if (current.trim()) {
                const param = parseEventParameter(current.trim());
                if (param) {
                    properties.push(param);
                }
            }
            current = '';
        } else {
            current += char;
        }
    }

    // Don't forget the last property
    if (current.trim()) {
        const param = parseEventParameter(current.trim());
        if (param) {
            properties.push(param);
        }
    }

    return properties;
}

function parseTypeScriptProperties(typeDefinition) {
    // Try to parse properties from TypeScript type definitions
    const properties = [];

    // Handle object types like { property: Type, ... }
    const objectMatch = typeDefinition.match(/\{([^}]+)\}/);
    if (objectMatch) {
        const propertiesStr = objectMatch[1];
        // Split by commas or semicolons, accounting for nested types
        const propertyMatches = propertiesStr.split(/[,;]\s*/).filter(p => p.trim());

        propertyMatches.forEach(prop => {
            const param = parseEventParameter(prop);
            if (param) {
                properties.push(param);
            }
        });
    }

    // Handle simple types
    if (properties.length === 0 && typeDefinition.trim() && !typeDefinition.includes('{')) {
        // Simple type like "string", "CartModel | null"
        return [{
            name: 'value',
            type: typeDefinition.trim(),
            optional: false
        }];
    }

    return properties;
}

function eventNameToAnchor(eventName, direction) {
    // Convert event name to anchor ID format matching Starlight's auto-generation
    // For heading: ### `event/name` (direction)
    // Starlight creates: event/name-direction -> eventname-direction
    const cleanName = eventName.toLowerCase().replace(/[\/\s]/g, '');
    const cleanDirection = direction ? direction.toLowerCase().replace(/\s+and\s+/g, '-').replace(/\s+/g, '-') : '';
    return cleanDirection ? `${cleanName}-${cleanDirection}` : cleanName;
}

function extractSourceComponent(eventName) {
    // Extract the component name from the event (e.g., "checkout/initialized" → { formatted: "Checkout", original: "checkout" })
    if (eventName.includes('/')) {
        const prefix = eventName.split('/')[0];
        // Convert camelCase to Title Case with spaces
        const formatted = prefix
            .replace(/([A-Z])/g, ' $1') // Add space before capitals
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
        return { formatted, original: prefix };
    }
    return { formatted: 'external source', original: null }; // Fallback for events without namespace
}

function eventNameToListenerVar(eventName) {
    // Convert event name to camelCase listener variable
    // Examples: "cart/initialized" → "cartInitializedListener"
    //           "checkout/updated" → "checkoutUpdatedListener"
    //           "authenticated" → "authenticatedListener"

    // Split by / or - and filter out empty strings
    const parts = eventName.split(/[\/\-]/).filter(p => p);

    // Convert to camelCase
    const camelCase = parts.map((part, index) => {
        if (index === 0) {
            // First part stays lowercase
            return part.charAt(0).toLowerCase() + part.slice(1);
        }
        // Capitalize first letter of subsequent parts
        return part.charAt(0).toUpperCase() + part.slice(1);
    }).join('');

    return `${camelCase}Listener`;
}

function generateEventDescription(eventName, emits, listeners) {
    // Use conservative, fact-based descriptions based on event names
    // Use "Emitted after" for emits, "Fired after" for listens

    const name = eventName.toLowerCase();
    const isEmitter = emits && emits.length > 0;
    const isListener = listeners && listeners.length > 0;
    const isBoth = isEmitter && isListener;

    // Determine the verb based on direction
    let verb = '';
    if (isEmitter && !isListener) {
        verb = 'Emitted when';
    } else if (isListener && !isEmitter) {
        const sourceComponent = extractSourceComponent(eventName);
        verb = sourceComponent.original
            ? `Fired by ${sourceComponent.formatted} (\`${sourceComponent.original}\`) when`
            : `Fired by ${sourceComponent.formatted} when`;
    } else if (isBoth) {
        // For bidirectional events, use neutral language that doesn't imply redundancy
        verb = 'Triggered when';
    }

    // Common patterns we can safely infer from naming conventions
    if (name.includes('/initialized')) {
        return `${verb} the component completes initialization.`;
    }
    if (name.includes('/updated')) {
        return `${verb} the component state is updated.`;
    }
    if (name.includes('/added')) {
        return `${verb} an item is added.`;
    }
    if (name.includes('/removed')) {
        return `${verb} an item is removed.`;
    }
    if (name.includes('/merged')) {
        return `${verb} data is merged.`;
    }
    if (name.includes('/reset')) {
        return `${verb} the component state is reset.`;
    }
    if (name.includes('/changed')) {
        return `${verb} a change occurs.`;
    }
    if (name.includes('/data')) {
        return `${verb} data is available or changes.`;
    }
    if (name.includes('/values')) {
        return `${verb} form or configuration values change.`;
    }
    if (name.includes('/error')) {
        return `${verb} an error occurs.`;
    }
    if (name.includes('/placed')) {
        return `${verb} an order is placed.`;
    }
    if (name.includes('/alert')) {
        return `${verb} an alert or notification is triggered.`;
    }
    if (name.includes('/permissions')) {
        return `${verb} permissions are updated.`;
    }
    if (name.includes('/loading')) {
        return `${verb} loading state changes.`;
    }
    if (name.includes('/result')) {
        return `${verb} results are available.`;
    }
    if (name.includes('/valid')) {
        return `${verb} validation state changes.`;
    }
    if (name.includes('/estimate')) {
        return `${verb} an estimate is calculated.`;
    }
    if (name.includes('setvalues')) {
        return `${verb} values are set programmatically.`;
    }
    if (name === 'authenticated') {
        return `${verb} authentication state changes.`;
    }
    if (name === 'locale') {
        return `${verb} locale/language changes.`;
    }
    if (name === 'error') {
        return `${verb} an error occurs.`;
    }

    // Default description if no pattern matches - use neutral, conservative language
    if (isEmitter && !isListener) {
        return `Emitted when a specific condition or state change occurs.`;
    } else if (isListener && !isEmitter) {
        const sourceComponent = extractSourceComponent(eventName);
        const componentName = sourceComponent.original
            ? `${sourceComponent.formatted} (\`${sourceComponent.original}\`)`
            : sourceComponent.formatted;
        return `Fired by ${componentName} when a specific condition or state change occurs.`;
    } else if (isBoth) {
        return `Emitted and consumed for internal and external communication.`;
    }
    return 'Event for component communication and state management.';
}


/**
 * Extract model definition from source files for event payload types
 * @param {string} modelName - Name of the type/interface to extract
 * @param {string} dropinName - Name of the dropin (e.g., 'cart', 'checkout')
 * @returns {string|null} The full type definition or null if not found
 */
// Replaced with TypeExtractor.extractModelDefinition()
function extractModelDefinition(modelName, dropinName) {
    const repoPath = join(projectRoot, '.temp-repos', dropinName);
    const extractor = new TypeExtractor(repoPath);
    return extractor.extractModelDefinition(modelName);
}

// Replaced with CrossDropinResolver.detectSourceDropin()
function detectSourceDropin(eventName, eventEmits, currentDropin) {
    return CrossDropinResolver.detectSourceDropin(eventName, eventEmits, currentDropin);
}

/**
 * Extract types referenced in an event payload definition
 * @param {string} typeDefinition - The type definition string
 * @returns {Set<string>} Set of type names referenced
 */
// Replaced with TypeExtractor.extractReferencedTypes()
function extractReferencedTypes(typeDefinition) {
    return TypeExtractor.extractReferencedTypes(typeDefinition);
}

function updateSidebarNavigation(dropinName, repoConfig) {
    const configPath = join(projectRoot, 'astro.config.mjs');
    const config = readFileSync(configPath, 'utf8');

    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const sidebarEntry = `{ label: 'Events', link: '/${basePath}/${dropinName}/events/' },`;

    // Find the Functions entry for this dropin and add events after it
    // Order: Functions → Events → Dictionary
    const functionsPattern = new RegExp(
        `(\\{\\s*label:\\s*'Functions',\\s*link:\\s*'/${basePath}/${dropinName}/functions/'\\s*\\},)`,
        'i'
    );

    const match = config.match(functionsPattern);
    if (match) {
        // Check if the events entry already exists
        const eventsPattern = new RegExp(`label:\\s*'Events',\\s*link:\\s*'/${basePath}/${dropinName}/events/'`);
        if (!eventsPattern.test(config)) {
            const updated = config.replace(
                functionsPattern,
                `$1\n                          ${sidebarEntry}`
            );
            writeFileSync(configPath, updated);
            console.log(`  ✅ Added sidebar entry for ${repoConfig.displayName} events`);
            return true;
        } else {
            console.log(`  ℹ️  Sidebar entry already exists for ${repoConfig.displayName} events`);
            return false;
        }
    } else {
        console.log(`  ⚠️  Could not find Functions entry to insert after`);
        return false;
    }
}

function generateEventsMDX(dropinName, repoConfig, eventsData, version) {
    const { eventEmits, eventListeners, typedEvents, implementationStatus, documentedDescriptions } = eventsData;

    // Load event enrichments for this drop-in
    const enrichments = loadEventEnrichments(dropinName);

    // Construct the drop-in source path for type resolution
    const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');
    const dropinSourcePath = join(boilerplatePath, 'node_modules', `@dropins/storefront-${dropinName}`);

    // Track all models used in event payloads for Data Models section
    const modelDefinitions = new Map(); // Map<modelName, {definition, events, description}>

    const allEvents = new Set([
        ...eventEmits.keys(),
        ...eventListeners.keys(),
        ...typedEvents.keys()
    ]);

    // Define common events that are documented separately
    const commonEvents = new Set(['locale', 'error', 'authenticated']);

    // Group events by direction
    const emitsOnly = [];
    const listensOnly = [];
    const bidirectional = [];

    allEvents.forEach(eventName => {
        const emits = eventEmits.get(eventName);
        const listeners = eventListeners.get(eventName);

        if (emits && listeners) {
            bidirectional.push(eventName);
        } else if (emits) {
            emitsOnly.push(eventName);
        } else if (listeners) {
            listensOnly.push(eventName);
        }
    });

    // Sort function: alphabetize by type (event prefix/namespace), then by full name
    const sortByTypeAndName = (a, b) => {
        // Extract the type/prefix (part before '/' or the whole name if no '/')
        const getEventType = (eventName) => {
            if (eventName.includes('/')) {
                return eventName.split('/')[0];
            }
            return eventName; // Events without namespace (like 'locale', 'error')
        };

        const typeA = getEventType(a).toLowerCase();
        const typeB = getEventType(b).toLowerCase();

        // First, sort by type
        if (typeA !== typeB) {
            return typeA.localeCompare(typeB);
        }

        // If types are the same, sort by full event name
        return a.toLowerCase().localeCompare(b.toLowerCase());
    };

    // Filter out common events from all groups (they're documented separately in common-events page)
    const emitsOnlyFiltered = emitsOnly.filter(eventName => !commonEvents.has(eventName));
    const listensOnlyFiltered = listensOnly.filter(eventName => !commonEvents.has(eventName));
    const bidirectionalFiltered = bidirectional.filter(eventName => !commonEvents.has(eventName));

    // Sort each group alphabetically by type, then by name (for table generation)
    emitsOnlyFiltered.sort(sortByTypeAndName);
    listensOnlyFiltered.sort(sortByTypeAndName);
    bidirectionalFiltered.sort(sortByTypeAndName);

    // For Event Details section: pure alphabetical order for easier scanning
    const sortedEvents = [...emitsOnlyFiltered, ...listensOnlyFiltered, ...bidirectionalFiltered].sort(sortByTypeAndName);

    // Read the template file
    const templatePath = join(projectRoot, '_dropin-templates', 'dropin-events.mdx');
    let template = readFileSync(templatePath, 'utf8');

    // Replace global placeholders
    template = template.replace(/DROPIN_NAME/g, repoConfig.displayName);
    template = template.replace(/DROPIN_DISPLAY_NAME/g, repoConfig.displayName);
    template = template.replace(/DROPIN_VERSION/g, cleanVersion(version));

    // Replace overview with enriched content or fallback to generic
    const dropinOverview = enrichments.overview ||
        `The **${repoConfig.displayName}** drop-in uses the [event bus](/sdk/reference/events) to emit and listen to events for communication between drop-ins and external integrations.`;
    template = template.replace(/DROPIN_OVERVIEW/g, dropinOverview);

    // Generate combined events table sorted by direction, then alphabetically
    // NOTE: This table structure is built independently (not read from template)
    // If you change formatting here, update template example rows to match
    let eventsTable = '';

    // Check if there are any events at all
    const hasAnyEvents = sortedEvents.length > 0;

    if (!hasAnyEvents) {
        eventsTable = '<Aside type="note">\nNo drop-in-specific events. See [Common Events](/dropins/all/events/#common-events-reference) for shared events.\n</Aside>';
    } else {
        // Generate combined table with all events ordered by direction, then alphabetically
        eventsTable = '<TableWrapper nowrap={[0, 1]}>\n\n| Event | Direction | Description |\n|-------|-----------|-------------|\n';

        // Add events in order: Emits, Listens, Emits and Listens
        emitsOnlyFiltered.forEach(eventName => {
            let description;
            if (documentedDescriptions && documentedDescriptions.has(eventName)) {
                description = documentedDescriptions.get(eventName);
            } else {
                description = generateEventDescription(eventName, eventEmits.get(eventName), null);
            }

            if (implementationStatus && implementationStatus.get(eventName) === 'documented-only') {
                description += ' 🚧';
            }

            const anchor = eventNameToAnchor(eventName, 'emits');
            eventsTable += `| [${eventName}](#${anchor}) | Emits | ${description} |\n`;
        });

        listensOnlyFiltered.forEach(eventName => {
            let description;
            if (documentedDescriptions && documentedDescriptions.has(eventName)) {
                description = documentedDescriptions.get(eventName);
            } else {
                description = generateEventDescription(eventName, null, eventListeners.get(eventName));
            }

            if (implementationStatus && implementationStatus.get(eventName) === 'documented-only') {
                description += ' 🚧';
            }

            const anchor = eventNameToAnchor(eventName, 'listens');
            eventsTable += `| [${eventName}](#${anchor}) | Listens | ${description} |\n`;
        });

        bidirectionalFiltered.forEach(eventName => {
            let description;
            if (documentedDescriptions && documentedDescriptions.has(eventName)) {
                description = documentedDescriptions.get(eventName);
            } else {
                description = generateEventDescription(eventName, eventEmits.get(eventName), eventListeners.get(eventName));
            }

            if (implementationStatus && implementationStatus.get(eventName) === 'documented-only') {
                description += ' 🚧';
            }

            const anchor = eventNameToAnchor(eventName, 'emits-and-listens');
            eventsTable += `| [${eventName}](#${anchor}) | Emits and listens | ${description} |\n`;
        });

        eventsTable += '\n</TableWrapper>';
    }

    template = template.replace(
        /\{\/\* EVENTS_TABLE_START \*\/\}[\s\S]*?\{\/\* EVENTS_TABLE_END \*\/\}/,
        `{/* EVENTS_TABLE_START */}\n${eventsTable}\n{/* EVENTS_TABLE_END */}`
    );

    // Extract the repeatable event section
    const repeatStart = template.indexOf('{/* REPEAT_FOR_EACH_EVENT */}');
    const repeatEnd = template.indexOf('{/* END_REPEAT */}');

    if (repeatStart === -1 || repeatEnd === -1) {
        throw new Error('Template markers not found');
    }

    const beforeRepeat = template.substring(0, repeatStart);
    const repeatTemplate = template.substring(repeatStart + '{/* REPEAT_FOR_EACH_EVENT */}'.length, repeatEnd);
    const afterRepeat = template.substring(repeatEnd + '{/* END_REPEAT */}'.length);

    // Generate content for each event
    let eventsContent = '';
    sortedEvents.forEach(eventName => {
        const emits = eventEmits.get(eventName);
        const listeners = eventListeners.get(eventName);

        // Clone the repeat template for this event
        let eventSection = repeatTemplate;

        // Determine EVENT_DIRECTION first (needed for anchor generation)
        let directionText = '';
        if (emits && listeners) {
            directionText = 'Emits and listens';
        } else if (emits) {
            directionText = 'Emits';
        } else if (listeners) {
            directionText = 'Listens';
        }

        // Generate anchor with direction for proper linking
        const directionForAnchor = directionText.toLowerCase().replace(/\s+and\s+/g, '-').replace(/\s+/g, '-');
        const anchor = eventNameToAnchor(eventName, directionForAnchor);

        // Replace EVENT_NAME and EVENT_ANCHOR
        eventSection = eventSection.replace(/EVENT_ANCHOR/g, anchor);
        eventSection = eventSection.replace(/EVENT_NAME/g, eventName);

        // Replace EVENT_LISTENER_VAR with camelCase variable name
        const listenerVar = eventNameToListenerVar(eventName);
        eventSection = eventSection.replace(/EVENT_LISTENER_VAR/g, listenerVar);

        // Replace EVENT_DIRECTION
        eventSection = eventSection.replace(/EVENT_DIRECTION_LOWERCASE/g, directionText.toLowerCase());
        eventSection = eventSection.replace(/EVENT_DIRECTION/g, directionText);

        // Generate EVENT_HEADING - use backticks around event name to handle special chars
        const eventHeading = `### \`${eventName}\` (${directionText.toLowerCase()})`;
        eventSection = eventSection.replace(/EVENT_HEADING/g, eventHeading);

        // Replace EVENT_DESCRIPTION - use enrichment, documented description, or generate
        const eventEnrichment = enrichments?.[eventName];
        let description;
        if (documentedDescriptions && documentedDescriptions.has(eventName)) {
            description = documentedDescriptions.get(eventName);
        } else {
            const generatedDescription = generateEventDescription(eventName, emits, listeners);
            description = getEventDescription(eventName, eventEnrichment, generatedDescription);
        }

        // Add implementation status note for documented-only events
        if (implementationStatus && implementationStatus.get(eventName) === 'documented-only') {
            description += '\n\n<Aside type="caution" title="Planned Event">\nThis event is documented but not yet implemented in the current version. The API may change before implementation.\n</Aside>';
        }

        eventSection = eventSection.replace(/EVENT_DESCRIPTION/g, description);
        // Generate EVENT_PAYLOAD_SECTION
        let payloadSection = '';

        // Check if this is a documented-only event
        const isDocumentedOnly = implementationStatus && implementationStatus.get(eventName) === 'documented-only';

        // Check for enrichment payload type override (when payload is a string instead of object)
        let enrichmentPayloadOverride = enrichments?.[eventName]?.payload;
        let hasPayloadOverride = typeof enrichmentPayloadOverride === 'string';

        // If not found in current drop-in's enrichment, check if it's a cross-dropin event
        // Also check cross-dropin if the current type is generic (essentially untyped/incomplete)
        let isCrossDropinEvent = false;
        const currentType = typedEvents.get(eventName);
        const hasGenericType = GenericTypeHandler.isGenericType(currentType);
        if (!hasPayloadOverride && (!typedEvents.has(eventName) || hasGenericType)) {
            const sourceDropin = detectSourceDropin(eventName, eventEmits, dropinName);
            if (sourceDropin && sourceDropin !== dropinName) {
                // Load enrichment from the source drop-in
                const sourceEnrichments = loadEventEnrichments(sourceDropin);
                const sourcePayload = sourceEnrichments?.[eventName]?.payload;
                if (typeof sourcePayload === 'string') {
                    enrichmentPayloadOverride = sourcePayload;
                    hasPayloadOverride = true;
                    isCrossDropinEvent = true;
                }
            }
        }

        if (hasPayloadOverride) {
            // Use enrichment override for payload type
            const typeDefinition = enrichmentPayloadOverride;
            payloadSection += `\`\`\`typescript\n${typeDefinition}\n\`\`\`\n\n`;

            const referencedTypes = extractReferencedTypes(typeDefinition);

            // For cross-dropin events, link to the source dropin's events page
            // For same-dropin events, extract and track models locally
            if (isCrossDropinEvent) {
                // Generate external links to source drop-in's events page
                if (referencedTypes.size > 0) {
                    const sourceDropin = detectSourceDropin(eventName, eventEmits, dropinName);
                    const typeLinks = CrossDropinResolver.generateExternalLinks(sourceDropin, referencedTypes, 'events');
                    payloadSection += `See ${typeLinks} for full type definition${referencedTypes.size > 1 ? 's' : ''}.\n\n`;
                }
            } else {
                // Same-dropin event: extract and track models locally
                referencedTypes.forEach(typeName => {
                    const definition = extractModelDefinition(typeName, dropinName);
                    if (definition) {
                        if (!modelDefinitions.has(typeName)) {
                            modelDefinitions.set(typeName, {
                                definition,
                                events: [],
                                description: '' // Will be populated from enrichment if available
                            });
                        }
                        const modelData = modelDefinitions.get(typeName);
                        if (!modelData.events.includes(eventName)) {
                            modelData.events.push(eventName);
                        }
                    }
                });

                // Generate links to Data Models section for referenced types (only if they have definitions)
                if (referencedTypes.size > 0) {
                    const typesWithDefinitions = Array.from(referencedTypes).filter(typeName => modelDefinitions.has(typeName));
                    if (typesWithDefinitions.length > 0) {
                        const typeLinks = typesWithDefinitions
                            .map(typeName => `[\`${typeName}\`](#${typeName.toLowerCase()})`)
                            .join(', ');
                        payloadSection += `See ${typeLinks} for full type definition${typesWithDefinitions.length > 1 ? 's' : ''}.\n\n`;
                    }
                }
            }
        } else if (typedEvents.has(eventName)) {
            // Skip displaying generic types as they provide no useful information
            const typeDefinition = typedEvents.get(eventName);
            if (GenericTypeHandler.isGenericType(typeDefinition)) {
                // Don't display generic types - leave payload section empty
            } else {
                payloadSection += `\`\`\`typescript\n${typeDefinition}\n\`\`\`\n\n`;

                // Extract and track model types referenced in this event payload
                const referencedTypes = extractReferencedTypes(typeDefinition);
                referencedTypes.forEach(typeName => {
                    const definition = extractModelDefinition(typeName, dropinName);
                    if (definition) {
                        if (!modelDefinitions.has(typeName)) {
                            modelDefinitions.set(typeName, {
                                definition,
                                events: [],
                                description: '' // Will be populated from enrichment if available
                            });
                        }
                        const modelData = modelDefinitions.get(typeName);
                        if (!modelData.events.includes(eventName)) {
                            modelData.events.push(eventName);
                        }
                    }
                });

                // Generate links to Data Models section for referenced types (only if they have definitions)
                if (referencedTypes.size > 0) {
                    const typesWithDefinitions = Array.from(referencedTypes).filter(typeName => modelDefinitions.has(typeName));
                    if (typesWithDefinitions.length > 0) {
                        const typeLinks = typesWithDefinitions
                            .map(typeName => `[\`${typeName}\`](#${typeName.toLowerCase()})`)
                            .join(', ');
                        payloadSection += `See ${typeLinks} for full type definition${typesWithDefinitions.length > 1 ? 's' : ''}.\n\n`;
                    }
                }
            }
        } else {
            // No TypeScript definition available - use comprehensive type inference
            const dropinPath = join(projectRoot, '.temp-repos', dropinName);
            const checker = new TypeInferenceChecklist(dropinName, dropinPath);
            const result = checker.inferEventPayloadType(eventName);

            // Log the inference process (optional - only in verbose mode)
            if (process.env.VERBOSE_INFERENCE) {
                console.log(`  📋 Type inference for ${eventName}:`);
                result.log.forEach(line => console.log(`    ${line}`));
            }

            if (result.type) {
                // Found an inferred type - display it
                payloadSection += `\`\`\`typescript\n${result.type}\n\`\`\`\n\n`;

                // Extract and track any model types from the inferred type
                const referencedTypes = extractReferencedTypes(result.type);
                referencedTypes.forEach(typeName => {
                    const definition = extractModelDefinition(typeName, dropinName);
                    if (definition) {
                        if (!modelDefinitions.has(typeName)) {
                            modelDefinitions.set(typeName, {
                                definition,
                                events: [],
                                description: ''
                            });
                        }
                        const modelData = modelDefinitions.get(typeName);
                        if (!modelData.events.includes(eventName)) {
                            modelData.events.push(eventName);
                        }
                    }
                });

                if (referencedTypes.size > 0) {
                    const typesWithDefinitions = Array.from(referencedTypes).filter(typeName => modelDefinitions.has(typeName));
                    if (typesWithDefinitions.length > 0) {
                        const typeLinks = typesWithDefinitions
                            .map(typeName => `[\`${typeName}\`](#${typeName.toLowerCase()})`)
                            .join(', ');
                        payloadSection += `See ${typeLinks} for full type definition${typesWithDefinitions.length > 1 ? 's' : ''}.\n\n`;
                    }
                }
            }
            // If no type found (neither defined nor inferred), leave payload section empty
        }

        eventSection = eventSection.replace(/EVENT_PAYLOAD_SECTION/g, payloadSection);

        eventsContent += eventSection;
    });

    // Check if there are no drop-in-specific events (only common events)
    if (sortedEvents.length === 0) {
        // Determine what types of events are missing
        const hasNoEmits = emitsOnlyFiltered.length === 0 && bidirectionalFiltered.length === 0;
        const hasNoListens = listensOnlyFiltered.length === 0 && bidirectionalFiltered.length === 0;

        // Use shared empty state generator for clean, consistent output
        return generateNoEventsPage({
            dropinDisplayName: repoConfig.displayName,
            version
        });
    }

    // Generate Data Models section
    let dataModelsSection = '';
    if (modelDefinitions.size > 0) {
        dataModelsSection += '\n\n## Data Models\n\n';
        dataModelsSection += 'The following data models are used in event payloads for this drop-in.\n\n';

        // Sort models alphabetically
        const sortedModels = Array.from(modelDefinitions.keys()).sort();

        for (const modelName of sortedModels) {
            const modelData = modelDefinitions.get(modelName);

            dataModelsSection += `### ${modelName}\n\n`;

            // Add description if available from enrichment
            if (enrichments?.models?.[modelName]?.description) {
                dataModelsSection += `${enrichments.models[modelName].description}\n\n`;
            }

            // List events that use this model
            if (modelData.events.length > 0) {
                dataModelsSection += `Used in: `;
                dataModelsSection += modelData.events
                    .map(eventName => {
                        // Determine direction
                        let direction;
                        if (eventEmits.has(eventName) && eventListeners.has(eventName)) {
                            direction = 'emits-and-listens';
                        } else if (eventEmits.has(eventName)) {
                            direction = 'emits';
                        } else {
                            direction = 'listens';
                        }
                        // Use eventNameToAnchor for consistency
                        const anchor = eventNameToAnchor(eventName, direction);
                        return `[\`${eventName}\`](#${anchor})`;
                    })
                    .join(', ');
                dataModelsSection += '.\n\n';
            }

            // Add the TypeScript definition
            dataModelsSection += '```ts\n';
            dataModelsSection += modelData.definition;
            dataModelsSection += '\n```\n\n';
        }
    }

    // Assemble final content with Data Models section
    return beforeRepeat + eventsContent + afterRepeat + dataModelsSection;
}

async function main() {
    console.log('🚀 Event Documentation Generator');
    console.log('================================\n');

    // Parse command-line arguments
    const args = process.argv.slice(2);
    const targetDropin = args.find(arg => !arg.startsWith('--'));
    const typeFilter = args.find(arg => arg.startsWith('--type='))?.split('=')[1];

    // Filter drop-ins based on type if specified (e.g., --type=B2B or --type=B2C)
    let dropinsToProcess = DROPIN_REPOS;
    if (typeFilter) {
        const upperTypeFilter = typeFilter.toUpperCase();
        dropinsToProcess = Object.fromEntries(
            Object.entries(DROPIN_REPOS).filter(([_, config]) => config.type === upperTypeFilter)
        );
        console.log(`🔍 Filtering by type: ${upperTypeFilter}\n`);
    }

    // Filter by specific drop-in if specified
    if (targetDropin) {
        if (!dropinsToProcess[targetDropin]) {
            console.error(`❌ Error: Drop-in "${targetDropin}" not found.\n`);
            console.log('Available drop-ins:');
            Object.keys(DROPIN_REPOS).forEach(name => {
                console.log(`  - ${name}`);
            });
            process.exit(1);
        }
        dropinsToProcess = { [targetDropin]: dropinsToProcess[targetDropin] };
        console.log(`🎯 Processing single drop-in: ${targetDropin}\n`);
    } else {
        console.log(`📦 Processing all ${Object.keys(dropinsToProcess).length} drop-ins\n`);
    }

    // Clone/update boilerplate once for all drop-ins
    const boilerplatePath = cloneOrUpdateBoilerplate();

    // Get package versions from boilerplate
    const packageVersions = getBoilerplatePackageVersions(boilerplatePath);
    console.log(`\n📦 Loaded package versions from boilerplate\n`);

    // Process each drop-in
    for (const [repoName, repoConfig] of Object.entries(dropinsToProcess)) {
        try {
            console.log(`\n📦 Processing ${repoConfig.displayName}...`);

            // Get version from boilerplate package.json
            const version = packageVersions[repoConfig.packageName];
            let dropinPath;

            if (!version) {
                // B2B drop-ins aren't in boilerplate - use existing standalone repo
                console.log(`  Not found in boilerplate, using standalone repository...`);
                dropinPath = useExistingDropinRepo(repoName, repoConfig);
            } else {
                // B2C drop-ins are in boilerplate - use version from there
                dropinPath = cloneDropinAtVersion(repoName, repoConfig, version);
            }
            const eventsData = scanForEvents(dropinPath);
            // Use 'latest' for B2B drop-ins without boilerplate versions
            const versionToUse = version || 'latest';
            const mdxContent = generateEventsMDX(repoName, repoConfig, eventsData, versionToUse);

            // Write to the appropriate location in docs
            const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
            const outputDir = join(
                projectRoot,
                'src/content/docs',
                basePath,
                repoName
            );
            const outputPath = join(outputDir, 'events.mdx');

            // Create directory if it doesn't exist
            if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true });
                console.log(`  📁 Created directory ${outputDir}`);
            }

            writeFileSync(outputPath, mdxContent);
            console.log(`  ✅ Generated ${outputPath}`);

            // Show preview link for single drop-in generation
            if (targetDropin) {
                const urlPath = `/${basePath}/${repoName}/events`;
                console.log(`  📄 View at: ${urlPath}`);
                console.log(`     (Start dev server with 'npm run dev' if not already running)`);
            }

            // Update sidebar navigation
            updateSidebarNavigation(repoName, repoConfig);
            console.log('');

        } catch (error) {
            console.error(`  ❌ Error processing ${repoName}: ${error.message}\n`);
        }
    }

    console.log('✨ Event documentation generation complete!');

    // Validate generated documentation for generic types
    const validationSuccess = validateAllEventDocs(projectRoot);
    if (!validationSuccess) {
        console.error('\n⚠️  WARNING: Generic type issues detected in generated documentation.');
        console.error('   Please update enrichment files to provide proper type overrides.');
        process.exit(1);
    }
}

main();