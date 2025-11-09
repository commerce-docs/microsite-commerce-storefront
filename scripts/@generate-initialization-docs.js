#!/usr/bin/env node

/**
 * Initialization Documentation Generator
 *
 * Generates comprehensive initialization documentation for each drop-in by:
 * 1. Extracting ConfigProps from initialize.ts files
 * 2. Identifying available models from data/models directories
 * 3. Using enrichment files for custom descriptions
 * 4. Creating accurate configuration examples
 *
 * USAGE:
 * - Generate all drop-ins: npm run generate-initialization-docs
 * - Generate single drop-in: npm run generate-initialization-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, personalization
 *
 * OUTPUT: Single initialization.mdx file per drop-in
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadInitializationEnrichments } from './lib/enrichment.js';
import { updateSidebarForInitialization } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';
import { generatePropertyTable } from './lib/markdown/table-generator.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================

/**
 * Extract configuration properties from initialize.ts
 * 
 * Searches for ConfigProps type definition in initialize.ts and extracts
 * all configuration options with their types.
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of config property objects with name, type, required
 */
function extractConfigProps(repoPath) {
    // Try common locations for initialize.ts
    const possiblePaths = [
        join(repoPath, 'src', 'api', 'initialize', 'initialize.ts'),
        join(repoPath, 'src', 'api', 'initialize.ts'),
        join(repoPath, 'src', 'initialize.ts'),
    ];

    let initializeContent = null;
    let foundPath = null;

    for (const path of possiblePaths) {
        if (existsSync(path)) {
            initializeContent = readFileSync(path, 'utf8');
            foundPath = path;
            break;
        }
    }

    if (!initializeContent) {
        return [];
    }

    // Extract ConfigProps type definition with balanced braces
    const configPropsPattern = /type\s+ConfigProps\s*=\s*\{/;
    const match = initializeContent.match(configPropsPattern);

    if (!match) {
        return [];
    }

    // Find the complete type definition using balanced brace matching
    const startPos = match.index + match[0].length;
    let braceCount = 1;
    let endPos = startPos;

    while (endPos < initializeContent.length && braceCount > 0) {
        const char = initializeContent[endPos];
        if (char === '{') {
            braceCount++;
        } else if (char === '}') {
            braceCount--;
        }
        endPos++;
    }

    if (braceCount !== 0) {
        return [];
    }

    const propsContent = initializeContent.substring(startPos, endPos - 1);

    // Parse individual properties (only top-level, not nested)
    const customOptions = [];
    const lines = propsContent.split('\n');

    // Standard options that should be excluded (they're added separately)
    const standardOptionNames = ['langDefinitions', 'models'];

    // Track brace depth to avoid extracting nested properties
    let braceDepth = 0;
    let currentProp = null;
    let inlineObjectDef = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            continue;
        }

        // Count braces to track nesting depth
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;

        // Match property definition: propName?: type
        // Only extract if we're at the top level (braceDepth === 0)
        if (braceDepth === 0) {
            const propMatch = trimmed.match(/^(\w+)(\?)?:\s*(.+)/);
            if (propMatch) {
                const [, propName, optional, rest] = propMatch;
                const name = propName.trim();

                // Skip standard options (langDefinitions, models)
                if (standardOptionNames.includes(name)) {
                    braceDepth += openBraces - closeBraces;
                    continue;
                }

                // Check if this is an inline object type definition
                if (rest.trim().startsWith('{')) {
                    currentProp = {
                        name: name,
                        type: 'object',
                        required: !optional,
                        description: '',
                        inlineDefinition: null
                    };
                    inlineObjectDef = [line];
                    braceDepth += openBraces - closeBraces;

                    // If it closes on the same line, capture it
                    if (braceDepth === 0) {
                        currentProp.inlineDefinition = inlineObjectDef.join('\n');
                        customOptions.push(currentProp);
                        currentProp = null;
                        inlineObjectDef = [];
                    }
                } else {
                    // Regular type (not inline object)
                    customOptions.push({
                        name: name,
                        type: rest.replace(/[;,]$/, '').trim(),
                        required: !optional,
                        description: ''
                    });
                }
                continue;
            }
        }

        // If we're inside an inline object definition, collect lines
        if (braceDepth > 0 && currentProp) {
            inlineObjectDef.push(line);
        }

        // Update brace depth after processing the line
        braceDepth += openBraces - closeBraces;

        // If we just closed the inline object, save it
        if (braceDepth === 0 && currentProp) {
            currentProp.inlineDefinition = inlineObjectDef.join('\n');
            customOptions.push(currentProp);
            currentProp = null;
            inlineObjectDef = [];
        }
    }

    return customOptions;
}

/**
 * Extract customizable model information from ConfigProps.models definition
 * 
 * Only extracts models that are explicitly exposed in the initialize ConfigProps,
 * not all models in the data/models directory (many are internal).
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of model objects with name, description, and definition
 */
function extractModelNames(repoPath) {
    const initializePath = join(repoPath, 'src', 'api', 'initialize', 'initialize.ts');

    if (!existsSync(initializePath)) {
        return [];
    }

    try {
        const content = readFileSync(initializePath, 'utf8');

        // Extract imports to map aliases to actual interface names
        // e.g., "Cart as CartModel" maps CartModel -> Cart
        const aliasMap = {};
        const importMatches = content.matchAll(/import\s+\{([^}]+)\}/g);

        for (const importMatch of importMatches) {
            const imports = importMatch[1];
            // Match "Cart as CartModel" or "Customer as CustomerModel"
            const aliases = imports.matchAll(/(\w+)\s+as\s+(\w+)/g);
            for (const aliasMatch of aliases) {
                const [, original, alias] = aliasMatch;
                aliasMap[alias] = original;
            }
        }

        // Extract the models property from ConfigProps type
        const modelsMatch = content.match(/models\?:\s*\{([^}]+)\}/s);
        if (!modelsMatch) {
            return [];
        }

        const modelsContent = modelsMatch[1];

        // Extract model names (e.g., "CartModel?: Model<CartModel>")
        const modelMatches = [...modelsContent.matchAll(/(\w+)\?:\s*Model</g)];

        return modelMatches.map(match => {
            const modelName = match[1];

            // Check if this is an alias, if so, use the original interface name for searching
            const actualInterfaceName = aliasMap[modelName] || modelName;

            // Find the corresponding model file and extract definitions
            const modelsDir = join(repoPath, 'src', 'data', 'models');
            let modelDefinition = '';

            if (existsSync(modelsDir)) {
                // Try to find the model definition file
                const files = readdirSync(modelsDir);
                for (const file of files) {
                    const filePath = join(modelsDir, file);

                    // Skip directories (like __fixtures__)
                    if (statSync(filePath).isDirectory()) {
                        continue;
                    }

                    const fileContent = readFileSync(filePath, 'utf8');

                    // Check if this file exports the actual interface
                    if (fileContent.includes(`export interface ${actualInterfaceName}`) ||
                        fileContent.includes(`export type ${actualInterfaceName}`)) {
                        modelDefinition = extractTypeDefinitions(fileContent, actualInterfaceName);
                        break;
                    }
                }
            }

            return {
                name: modelName, // Use the ConfigProps name (e.g., CartModel) for documentation
                description: '', // Will be enriched later
                definition: modelDefinition
            };
        });
    } catch (error) {
        return [];
    }
}

/**
 * Extract a specific TypeScript type definition from file content
 * 
 * @param {string} content - TypeScript file content
 * @param {string} interfaceName - The interface or type name to extract
 * @returns {string} Extracted type definition
 */
function extractTypeDefinitions(content, interfaceName) {
    // Remove copyright header
    const withoutCopyright = content.replace(/\/\*+[\s\S]*?\*+\//m, '').trim();

    // Remove import statements
    const withoutImports = withoutCopyright.replace(/^import\s+.*?;?\s*$/gm, '').trim();

    // Extract only the specific interface
    const lines = withoutImports.split('\n');
    let inExport = false;
    let braceDepth = 0;
    let currentBlock = [];

    for (const line of lines) {
        const trimmed = line.trim();

        // Start of export - check if it's the interface we're looking for
        if (trimmed.startsWith('export ') &&
            (trimmed.includes(`interface ${interfaceName}`) ||
                trimmed.includes(`type ${interfaceName}`))) {
            inExport = true;
            currentBlock = [line];
            braceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

            // Single-line export
            if (braceDepth === 0 && trimmed.endsWith(';')) {
                return currentBlock.join('\n');
            }
            continue;
        }

        // Continue collecting export block
        if (inExport) {
            currentBlock.push(line);
            braceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

            // End of export block
            if (braceDepth === 0) {
                return currentBlock.join('\n');
            }
        }
    }

    return '';
}

/**
 * Scan repository for initialization data
 * 
 * @param {string} repoPath - Path to the repository
 * @param {Object} repoConfig - Repository configuration (not currently used)
 * @returns {Object} Initialization data with config options and models
 */
function scanForInitialization(repoPath, repoConfig) {
    const configProps = extractConfigProps(repoPath);
    const models = extractModelNames(repoPath);

    return {
        configProps,
        models,
        count: configProps.length + models.length // For logging
    };
}

// ============================================================================
// UNIQUE GENERATION LOGIC
// ============================================================================

/**
 * Generate initialization MDX documentation
 * 
 * @param {string} repoName - Drop-in name (kebab-case)
 * @param {Object} repoConfig - Repository configuration
 * @param {Object} initData - Initialization data
 * @param {Object} versionInfo - Version info object with { requested, actual, isExactMatch }
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateInitializationMDX(repoName, repoConfig, initData, versionInfo, enrichmentData = null) {
    const { configProps, models } = initData;

    // Use simplified template for drop-ins with no custom configuration
    if (configProps.length === 0 && models.length === 0) {
        return generateSimplifiedInitializationMDX(repoName, repoConfig, versionInfo);
    }

    const template = readTemplate('dropin-initialization.mdx');

    // Always include standard options with links to their definitions
    const standardOptions = [
        {
            name: 'langDefinitions',
            type: '__LINK__[`LangDefinitions`](#langdefinitions)',
            required: false,
            description: 'Language definitions for internationalization (i18n). Override dictionary keys for localization or branding.'
        },
        {
            name: 'models',
            type: '__LINK__[`Record<string, any>`](#models)',
            required: false,
            description: 'Custom data models for type transformations. Extend or modify default models with custom fields and transformers.'
        }
    ];

    // Merge with drop-in specific options
    const allOptions = [...standardOptions];

    // Track configuration types that need full definitions at the bottom
    const configTypesWithDefinitions = [];

    // Extract model names for linking
    const modelNames = models.map(m => m.name);

    // Add drop-in specific config props if they exist
    configProps.forEach(prop => {
        // Check if enrichment has a description for this property
        const enrichedDesc = enrichmentData?.config?.[prop.name]?.description;

        let displayType = prop.type;

        // If this property has an inline object definition, save it for the Configuration types section
        if (prop.inlineDefinition) {
            const anchor = prop.name.toLowerCase();
            // Extract the actual type definition for display
            const typeDefMatch = prop.inlineDefinition.match(/:\s*(\{[\s\S]*\})/);
            const typeDef = typeDefMatch ? typeDefMatch[1] : prop.inlineDefinition;

            configTypesWithDefinitions.push({
                name: prop.name,
                definition: `${prop.name}${prop.required ? '' : '?'}: ${typeDef.trim()}`,
                description: enrichedDesc || `Configuration object for ${prop.name}.`
            });

            // Link to the definition
            displayType = `__LINK__[\`${prop.name}\`](#${anchor})`;
        } else {
            // Check if the type references a model and create a link to it
            let hasModelLink = false;
            modelNames.forEach(modelName => {
                if (prop.type.includes(modelName)) {
                    const anchor = modelName.toLowerCase();
                    // Replace model name with a link, preserving surrounding syntax (like | null)
                    displayType = displayType.replace(modelName, `[\`${modelName}\`](#${anchor})`);
                    hasModelLink = true;
                }
            });
            // If we added a link, mark the whole type with __LINK__ marker and escape pipes
            if (hasModelLink) {
                // Escape pipe characters so they don't break markdown table columns
                displayType = displayType.replace(/\s*\|\s*/g, ' \\| ');
                displayType = `__LINK__${displayType}`;
            }
        }

        allOptions.push({
            name: prop.name,
            type: displayType,
            required: prop.required,
            description: enrichedDesc || `Configuration for ${prop.name}.`
        });
    });

    // Generate table using shared library
    const optionsTable = generatePropertyTable(allOptions, {
        nowrapColumns: [0, 1]
    });

    // Pick first model for example, or use a generic placeholder  
    const primaryModel = models.length > 0 ? models[0].name : 'CustomModel';

    // Merge enrichment descriptions with extracted models
    const enrichedModels = models.map(model => {
        const enrichedDesc = enrichmentData?.models?.[model.name]?.description;
        return {
            ...model,
            description: enrichedDesc || `Transforms ${model.name.replace(/-/g, ' ')} data from GraphQL.`
        };
    });

    // Generate models table with links to definitions
    let modelList;
    let modelDefinitions = '';

    if (enrichedModels.length > 0) {
        const modelRows = enrichedModels.map(model => {
            const anchor = model.name.toLowerCase();
            return `| [\`${model.name}\`](#${anchor}) | ${model.description} |`;
        }).join('\n');

        modelList = `
<TableWrapper nowrap={[0]}>

| Model | Description |
|---|---|
${modelRows}

</TableWrapper>`;

        // Generate model definitions section
        modelDefinitions = `
## Model definitions

The following TypeScript definitions show the structure of each customizable model:

${enrichedModels.map(model => {
            return `### ${model.name}

\`\`\`typescript
${model.definition}
\`\`\``;
        }).join('\n\n')}`;
    } else {
        modelList = `
<Aside type="note">
No customizable models are available for this drop-in.
</Aside>`;
    }

    // Generate custom config section if there are drop-in specific options
    let customConfigSection = '';
    if (configProps.length > 0) {
        customConfigSection = `## Drop-in-specific configuration

The **${repoConfig.displayName}** drop-in provides additional configuration options beyond the standard \`langDefinitions\` and \`models\`. These options customize drop-in-specific behaviors and features.

\`\`\`javascript title="scripts/initializers/${repoName}.js"
import { initializers } from '@dropins/tools/initializer.js';
import { initialize } from '${repoConfig.packageName}';

await initializers.mountImmediately(initialize, {
  // Drop-in-specific configuration
${configProps.map(prop => `  ${prop.name}: ${getExampleValue(prop.type)},`).join('\n')}
});
\`\`\`

<Aside type="note">
Refer to the [Configuration options](#configuration-options) table for descriptions of each option.
</Aside>

`;
    }

    // Get intro paragraph from enrichment or use default
    const introParagraph = enrichmentData?.intro ||
        `The **${repoConfig.displayName} initializer** configures the drop-in with global settings. Pass configuration options to the \`initialize()\` function during drop-in setup to customize language definitions, data models, and drop-in-specific behaviors.`;

    // Create version display with warning if mismatch
    let versionDisplay = cleanVersion(versionInfo.requested);
    let versionWarning = '';

    if (!versionInfo.isExactMatch) {
        versionDisplay = `${cleanVersion(versionInfo.requested)} (documented from ${versionInfo.actual})`;
        versionWarning = `
<Aside type="caution" title="Version Mismatch">
The boilerplate specifies version **${cleanVersion(versionInfo.requested)}**, but this documentation was generated from **${versionInfo.actual}** because the specific version tag was not found in the repository. The documented configuration may differ from the published package version.
</Aside>
`;
    }

    // Add standard type definitions for langDefinitions and models
    configTypesWithDefinitions.push({
        name: 'langDefinitions',
        definition: `langDefinitions?: {
  [locale: string]: {
    [key: string]: string;
  };
};`,
        description: 'Maps locale identifiers to dictionaries of key-value pairs. The `default` locale is used as the fallback when no specific locale matches. Each dictionary key corresponds to a text string used in the drop-in UI.'
    });

    configTypesWithDefinitions.push({
        name: 'models',
        definition: `models?: {
  [modelName: string]: Model<any>;
};`,
        description: 'Maps model names to transformer functions. Each transformer receives data from GraphQL and returns a modified or extended version. Use the `Model<T>` type from `@dropins/tools` to create type-safe transformers.'
    });

    // Generate Configuration types section
    let configTypeDefinitions = '';
    if (configTypesWithDefinitions.length > 0) {
        configTypeDefinitions = `## Configuration types

The following TypeScript definitions show the structure of each configuration object:

${configTypesWithDefinitions.map(configType => {
            const anchor = configType.name.toLowerCase();
            return `### ${configType.name}

${configType.description}

\`\`\`typescript
${configType.definition}
\`\`\``;
        }).join('\n\n')}`;
    }

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_KEY': repoName,  // kebab-case for URLs
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': versionDisplay,
        'VERSION_WARNING': versionWarning,
        'INTRO_PARAGRAPH': introParagraph,
        'CONFIG_OPTIONS_TABLE': optionsTable,
        'MODEL_NAME': primaryModel,
        'MODEL_LIST': modelList,
        'MODEL_DEFINITIONS': modelDefinitions,
        'CONFIG_TYPE_DEFINITIONS': configTypeDefinitions,
        'CUSTOM_CONFIG_SECTION': customConfigSection,
        'REPO_URL': repoConfig.gitUrl.replace('.git', '')
    });
}

/**
 * Generate simplified initialization documentation for drop-ins without custom config options
 * 
 * @param {string} repoName - Repository name (kebab-case)
 * @param {Object} repoConfig - Repository configuration
 * @param {Object} versionInfo - Version info object
 * @returns {string} Generated MDX content
 */
function generateSimplifiedInitializationMDX(repoName, repoConfig, versionInfo) {
    const versionDisplay = cleanVersion(versionInfo.requested);

    return `---
title: ${repoConfig.displayName} initialization
description: Configure the ${repoConfig.displayName} drop-in with language definitions and custom data models.
sidebar:
  label: Initialization
  order: 3
---

import { Aside } from '@astrojs/starlight/components';

The **${repoConfig.displayName}** drop-in has no drop-in-specific configuration options or customizable models.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${versionDisplay}</strong>
</div>

## Basic initialization

Initialize the drop-in with default settings:

\`\`\`javascript title="scripts/initializers/${repoName}.js"
import { initializers } from '@dropins/tools/initializer.js';
import { initialize } from '${repoConfig.packageName}';

await initializers.mountImmediately(initialize, {});
\`\`\`

<Aside type="note" title="Standard options">
You can customize text and labels using the standard \`langDefinitions\` option. See other drop-in initialization pages for examples.
</Aside>

{/* This documentation is auto-generated from: ${repoConfig.gitUrl.replace('.git', '')} */}
`;
}

/**
 * Generate example value based on TypeScript type
 * 
 * @param {string} type - TypeScript type string
 * @returns {string} Example value
 */
function getExampleValue(type) {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('string')) return "'value'";
    if (lowerType.includes('number')) return '123';
    if (lowerType.includes('boolean')) return 'true';
    if (lowerType.includes('[]') || lowerType.includes('array')) return '[]';
    if (lowerType.includes('function') || lowerType.includes('=>')) return '() => {}';

    return '{}'; // Default for objects
}

// ============================================================================
// FRAMEWORK INTEGRATION
// ============================================================================

runGenerator({
    name: 'Initialization',
    itemType: 'configuration options',
    loadEnrichments: loadInitializationEnrichments,
    scanRepo: scanForInitialization,
    generateContent: generateInitializationMDX,
    updateSidebar: updateSidebarForInitialization,
    outputFileName: 'initialization.mdx'
});
