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
 * TO MODIFY TABLE STRUCTURE:
 * - Update table generation code in this script (search for "Generate emits table")
 * - Update template example rows to match (for documentation purposes)
 * - Both must stay in sync!
 * 
 * IMPORTANT: Always verify against source repositories rather than making assumptions.
 * This ensures accuracy in type definitions, API patterns, and code examples.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync, execFileSync } from 'child_process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration for drop-in packages
// Maps documentation paths to npm package names and git repos
const DROPIN_REPOS = {
    // B2C Drop-ins
    'cart': {
        packageName: '@dropins/storefront-cart',
        gitUrl: 'https://github.com/adobe-commerce/storefront-cart.git',
        type: 'B2C',
        displayName: 'Cart'
    },
    'checkout': {
        packageName: '@dropins/storefront-checkout',
        gitUrl: 'https://github.com/adobe-commerce/storefront-checkout.git',
        type: 'B2C',
        displayName: 'Checkout'
    },
    'order': {
        packageName: '@dropins/storefront-order',
        gitUrl: 'https://github.com/adobe-commerce/storefront-order.git',
        type: 'B2C',
        displayName: 'Order'
    },
    'product-details': {
        packageName: '@dropins/storefront-pdp',
        gitUrl: 'https://github.com/adobe-commerce/storefront-pdp.git',
        type: 'B2C',
        displayName: 'Product Details'
    },
    'product-discovery': {
        packageName: '@dropins/storefront-product-discovery',
        gitUrl: 'https://github.com/adobe-commerce/storefront-search-dropin.git',
        type: 'B2C',
        displayName: 'Product Discovery'
    },
    'recommendations': {
        packageName: '@dropins/storefront-recommendations',
        gitUrl: 'https://github.com/adobe-commerce/storefront-recommendations.git',
        type: 'B2C',
        displayName: 'Recommendations'
    },
    'user-account': {
        packageName: '@dropins/storefront-account',
        gitUrl: 'https://github.com/adobe-commerce/storefront-account.git',
        type: 'B2C',
        displayName: 'User Account'
    },
    'user-auth': {
        packageName: '@dropins/storefront-auth',
        gitUrl: 'https://github.com/adobe-commerce/storefront-auth.git',
        type: 'B2C',
        displayName: 'User Auth'
    },
    'wishlist': {
        packageName: '@dropins/storefront-wishlist',
        gitUrl: 'https://github.com/adobe-commerce/storefront-wishlist.git',
        type: 'B2C',
        displayName: 'Wishlist'
    },
    'payment-services': {
        packageName: '@dropins/storefront-payment-services',
        gitUrl: 'https://github.com/adobe-commerce/storefront-payment-services.git',
        type: 'B2C',
        displayName: 'Payment Services'
    }
    // Note: Personalization drop-in has no i18n dictionary or events (data-only)
    // Only drop-ins published to npm and used in the boilerplate should be included here
};

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
    const cleanVersion = version.replace(/^[\^~]/, '');
    const tag = `v${cleanVersion}`;

    console.log(`  Using version: ${cleanVersion}`);

    if (!existsSync(dropinPath)) {
        console.log(`  Cloning repository at ${tag}...`);
        try {
            execFileSync('git', ['clone', '--depth', '1', '--branch', tag, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
        } catch (error) {
            // If tag doesn't exist, try without 'v' prefix
            console.log(`  Tag ${tag} not found, trying ${cleanVersion}...`);
            execFileSync('git', ['clone', '--depth', '1', '--branch', cleanVersion, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
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
            console.log(`  Tag ${tag} not found, trying ${cleanVersion}...`);
            execFileSync('git', ['checkout', cleanVersion], { cwd: dropinPath, stdio: 'pipe' });
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

    // Read TypeScript event definitions
    const typedEvents = new Map();
    const eventsTypePath = join(repoPath, 'src/types/events.d.ts');
    if (existsSync(eventsTypePath)) {
        const eventsTypeFile = readFileSync(eventsTypePath, 'utf8');

        // Match event names and extract their type definitions with proper brace matching
        const eventNamePattern = /['"`]([^'"`]+)['"`]\s*:/g;
        let nameMatch;

        while ((nameMatch = eventNamePattern.exec(eventsTypeFile)) !== null) {
            const eventName = nameMatch[1];
            let startIndex = nameMatch.index + nameMatch[0].length;

            // Skip whitespace
            while (startIndex < eventsTypeFile.length && /\s/.test(eventsTypeFile[startIndex])) {
                startIndex++;
            }

            // Extract the type definition by matching balanced braces
            let typeDef = '';
            let braceCount = 0;
            let inBraces = false;
            let i = startIndex;

            while (i < eventsTypeFile.length) {
                const char = eventsTypeFile[i];

                if (char === '{') {
                    braceCount++;
                    inBraces = true;
                    typeDef += char;
                } else if (char === '}') {
                    braceCount--;
                    typeDef += char;
                    if (braceCount === 0 && inBraces) {
                        // Found matching closing brace, now look for semicolon
                        i++;
                        while (i < eventsTypeFile.length && /\s/.test(eventsTypeFile[i])) {
                            i++;
                        }
                        if (eventsTypeFile[i] === ';') {
                            break; // Complete type definition found
                        }
                    }
                } else if (char === ';' && !inBraces) {
                    // Simple type (no braces), stop at semicolon
                    break;
                } else {
                    typeDef += char;
                }
                i++;
            }

            // Clean up and normalize indentation
            typeDef = typeDef.trim();
            if (typeDef.includes('\n')) {
                typeDef = typeDef.split('\n').map(line => line.trim()).join('\n');
            }

            typedEvents.set(eventName, typeDef);
        }
    }

    console.log(`  ✓ Found ${eventEmits.size} emitted events`);
    console.log(`  ✓ Found ${eventListeners.size} listened events`);
    console.log(`  ✓ Found ${typedEvents.size} typed events`);

    return { eventEmits, eventListeners, typedEvents };
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
            const propMatch = prop.match(/^\s*(\w+)\??\s*:\s*(.+)$/);
            if (propMatch) {
                const [, name, type] = propMatch;
                properties.push({
                    name: name.trim(),
                    type: type.trim(),
                    optional: prop.includes('?')
                });
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
        return `${verb} the component completes initialization`;
    }
    if (name.includes('/updated')) {
        return `${verb} the component state is updated`;
    }
    if (name.includes('/added')) {
        return `${verb} an item is added`;
    }
    if (name.includes('/removed')) {
        return `${verb} an item is removed`;
    }
    if (name.includes('/merged')) {
        return `${verb} data is merged`;
    }
    if (name.includes('/reset')) {
        return `${verb} the component state is reset`;
    }
    if (name.includes('/changed')) {
        return `${verb} a change occurs`;
    }
    if (name.includes('/data')) {
        return `${verb} data is available or changes`;
    }
    if (name.includes('/values')) {
        return `${verb} form or configuration values change`;
    }
    if (name.includes('/error')) {
        return `${verb} an error occurs`;
    }
    if (name.includes('/placed')) {
        return `${verb} an order is placed`;
    }
    if (name.includes('/alert')) {
        return `${verb} an alert or notification is triggered`;
    }
    if (name.includes('/permissions')) {
        return `${verb} permissions are updated`;
    }
    if (name.includes('/loading')) {
        return `${verb} loading state changes`;
    }
    if (name.includes('/result')) {
        return `${verb} results are available`;
    }
    if (name.includes('/valid')) {
        return `${verb} validation state changes`;
    }
    if (name.includes('/estimate')) {
        return `${verb} an estimate is calculated`;
    }
    if (name.includes('setvalues')) {
        return `${verb} values are set programmatically`;
    }
    if (name === 'authenticated') {
        return `${verb} authentication state changes`;
    }
    if (name === 'locale') {
        return `${verb} locale/language changes`;
    }
    if (name === 'error') {
        return `${verb} an error occurs`;
    }

    // Default description if no pattern matches - use neutral, conservative language
    if (isEmitter && !isListener) {
        return 'Emitted by this drop-in when a specific condition or state change occurs';
    } else if (isListener && !isEmitter) {
        const sourceComponent = extractSourceComponent(eventName);
        const componentName = sourceComponent.original
            ? `${sourceComponent.formatted} (\`${sourceComponent.original}\`)`
            : sourceComponent.formatted;
        return `Fired by ${componentName} when a specific condition or state change occurs`;
    } else if (isBoth) {
        return 'Emitted and consumed by this drop-in for internal and external communication';
    }
    return 'Event for component communication and state management';
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
    template = template.replace(/DROPIN_VERSION/g, version.replace(/^[\^~]/, ''));

    // Generate combined events table sorted by direction, then alphabetically
    // NOTE: This table structure is built independently (not read from template)
    // If you change formatting here, update template example rows to match
    let eventsTable = '';

    // Check if there are any events at all
    const hasAnyEvents = sortedEvents.length > 0;

    if (!hasAnyEvents) {
        eventsTable = '<Aside type="note">\nNo drop-in-specific events. See [Common Events](/sdk/reference/common-events/) for shared events.\n</Aside>';
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
            eventsTable += `| [${eventName}](#${anchor}) | Emits and Listens | ${description} |\n`;
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
            directionText = 'Emits and Listens';
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

        // Replace EVENT_DESCRIPTION - use documented description if available
        let description;
        if (documentedDescriptions && documentedDescriptions.has(eventName)) {
            description = documentedDescriptions.get(eventName);
        } else {
            description = generateEventDescription(eventName, emits, listeners);
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

        if (typedEvents.has(eventName)) {
            const typeDefinition = typedEvents.get(eventName);
            payloadSection += `\`\`\`typescript\n${typeDefinition}\n\`\`\`\n\n`;

            // Check if this is a simple type reference (no braces, likely references another interface)
            const hasObjectStructure = typeDefinition.includes('{');

            const properties = parseTypeScriptProperties(typeDefinition);

            if (hasObjectStructure && properties.length > 0) {
                // This is an inline object type with properties we can list
                payloadSection += `| Property | Type | Description |\n`;
                payloadSection += `|----------|------|-------------|\n`;

                properties.forEach(prop => {
                    const optionalMark = prop.optional ? ' (optional)' : '';
                    const escapedType = prop.type.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
                    payloadSection += `| \`${prop.name}\` | \`${escapedType}\`${optionalMark} | See type definition in source code |\n`;
                });
            }
        }

        eventSection = eventSection.replace(/EVENT_PAYLOAD_SECTION/g, payloadSection);

        eventsContent += eventSection;
    });

    // Check if there are no drop-in-specific events (only common events)
    if (sortedEvents.length === 0) {
        // Determine what types of events are missing
        const hasNoEmits = emitsOnlyFiltered.length === 0 && bidirectionalFiltered.length === 0;
        const hasNoListens = listensOnlyFiltered.length === 0 && bidirectionalFiltered.length === 0;

        // Generate explanation based on what's missing
        let explanation = '';
        if (hasNoEmits && hasNoListens) {
            explanation = 'This drop-in focuses on UI presentation and data display, relying on function calls rather than event-driven communication for its core functionality. It uses only common events for standard cross-component functionality like localization and error handling.';
        } else if (hasNoEmits) {
            explanation = 'This drop-in does not emit any drop-in-specific events because it primarily responds to external state changes and user interactions without needing to broadcast its own state to other components. It uses only common events for standard functionality.';
        } else if (hasNoListens) {
            explanation = 'This drop-in does not listen to any drop-in-specific events because it operates independently, managing its own state without requiring coordination with other drop-ins. It uses only common events for standard functionality.';
        }

        // Generate simplified content for drop-ins that only use common events
        const simplifiedContent = `---
title: ${repoConfig.displayName} Data & Events
description: Learn about the events used by the ${repoConfig.displayName} and the data available within the events.
sidebar:
  label: Events
  order: 5
---

import { Aside } from '@astrojs/starlight/components';

The **${repoConfig.displayName}** drop-in uses the [Event Bus](/sdk/reference/events/) for communication between drop-ins and external integrations.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${version.replace(/^[\^~]/, '')}</strong>
</div>

## Events

This drop-in does not emit or listen to any drop-in-specific events. ${explanation}

For information about common events like \`locale\`, \`error\`, and \`authenticated\`, see the [Common Events Reference](/sdk/reference/common-events/).
`;
        return simplifiedContent;
    }

    // Assemble final content
    return beforeRepeat + eventsContent + afterRepeat;
}

async function main() {
    console.log('🚀 Event Documentation Generator');
    console.log('================================\n');

    // Parse command-line arguments
    const targetDropin = process.argv[2];

    // Filter drop-ins based on target
    let dropinsToProcess = DROPIN_REPOS;

    if (targetDropin) {
        if (!DROPIN_REPOS[targetDropin]) {
            console.error(`❌ Error: Drop-in "${targetDropin}" not found.\n`);
            console.log('Available drop-ins:');
            Object.keys(DROPIN_REPOS).forEach(name => {
                console.log(`  - ${name}`);
            });
            process.exit(1);
        }
        dropinsToProcess = { [targetDropin]: DROPIN_REPOS[targetDropin] };
        console.log(`🎯 Processing single drop-in: ${targetDropin}\n`);
    } else {
        console.log(`📦 Processing all ${Object.keys(DROPIN_REPOS).length} drop-ins\n`);
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

            if (!version) {
                console.log(`  ⚠️  Skipping: ${repoConfig.packageName} not found in boilerplate`);
                console.log(`     This drop-in may not be included in the current boilerplate version.\n`);
                continue;
            }

            // Clone git repo at specific version
            const dropinPath = cloneDropinAtVersion(repoName, repoConfig, version);
            const eventsData = scanForEvents(dropinPath);
            const mdxContent = generateEventsMDX(repoName, repoConfig, eventsData, version);

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
}

main();