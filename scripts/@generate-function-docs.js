#!/usr/bin/env node

/**
 * Function Documentation Generator
 * 
 * This script generates function documentation for drop-in components by:
 * 1. Reading boilerplate package.json to determine versions
 * 2. Cloning/updating source repositories at specific versions
 * 3. Scanning source code for function directories in src/api/
 * 4. Extracting TypeScript function signatures and documentation
 * 5. Generating comprehensive MDX documentation
 * 
 * USAGE:
 * - Generate all drop-ins: npm run generate-function-docs
 * - Generate single drop-in: npm run generate-function-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, company-management
 * 
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-functions.mdx
 * - Uses: Frontmatter, imports, intro text, FUNCTIONS_CONTENT placeholder
 * - Generates independently: Function sections with signatures and examples
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load enrichment data for a drop-in (if available)
function loadEnrichmentData(dropinName) {
    const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropinName, 'functions.json');
    if (existsSync(enrichmentPath)) {
        try {
            const content = readFileSync(enrichmentPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.warn(`  ⚠️  Failed to load enrichment data: ${error.message}`);
            return null;
        }
    }
    return null;
}

// Drop-in repositories configuration
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
    },
    // B2B Drop-ins
    'company-management': {
        packageName: '@dropins/storefront-company-management',
        gitUrl: 'https://github.com/adobe-commerce/storefront-company-management.git',
        type: 'B2B',
        displayName: 'Company Management'
    },
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

function scanForFunctions(repoPath) {
    const apiPath = join(repoPath, 'src', 'api');

    if (!existsSync(apiPath)) {
        return [];
    }

    const functions = [];
    const entries = readdirSync(apiPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'graphql' && entry.name !== 'fetch-graphql') {
            const funcPath = join(apiPath, entry.name);
            const mdxPath = join(funcPath, `${entry.name}.mdx`);
            const tsPath = join(funcPath, `${entry.name}.ts`);

            if (existsSync(mdxPath)) {
                functions.push({
                    name: entry.name,
                    mdxPath,
                    tsPath: existsSync(tsPath) ? tsPath : null
                });
            }
        }
    }

    return functions;
}

function extractFunctionInfo(functionData, enrichmentData = null) {
    const mdxContent = readFileSync(functionData.mdxPath, 'utf8');

    // Extract function name from path
    const functionName = functionData.name;

    // Check if we have enrichment data for this function
    const enrichment = enrichmentData && enrichmentData[functionName] ? enrichmentData[functionName] : null;

    // Use enriched description if available, otherwise extract from MDX
    let description;
    if (enrichment && enrichment.description) {
        description = enrichment.description;
    } else {
        // Extract description (first paragraph after h1)
        const descMatch = mdxContent.match(/^# \w+\n\n(.+?)$/m);
        description = descMatch ? descMatch[1] : 'API function for the drop-in.';

        // Filter out placeholder/test descriptions BEFORE cleaning
        const placeholders = [
            /howdy world/i,
            /hello world/i,
            /test function/i,
            /todo/i,
            /placeholder/i,
            /^A function that/i,
            /^returns ".*?"\.?$/i
        ];

        let isPlaceholder = false;
        for (const placeholder of placeholders) {
            if (placeholder.test(description)) {
                // Generate a basic description from the function name
                description = generateDescriptionFromName(functionName);
                isPlaceholder = true;
                break;
            }
        }

        // Clean up description (only if not already replaced)
        if (!isPlaceholder) {
            description = description
                .replace(/^A function that /, '')
                .replace(/"\.$/, '');
        }

        // Remove redundant first sentence if it just restates the function name
        const sentences = description.split(/\.\s+/);
        if (sentences.length > 1) {
            const firstSentence = sentences[0].toLowerCase();

            if (firstSentence.includes(`\`${functionName.toLowerCase()}\` function`)) {
                const nameWords = functionName.replace(/([A-Z])/g, ' $1').toLowerCase().trim().split(/\s+/);
                const actionWord = nameWords[0];

                if (firstSentence.includes(actionWord)) {
                    description = sentences.slice(1).join('. ').trim();
                    if (!description.endsWith('.')) description += '.';
                }
            }
        }
    }

    // Use enriched usage if available, otherwise extract from MDX
    let examples = '';
    if (enrichment && enrichment.usage) {
        // Format the enriched usage as a code block if it's not already
        if (!enrichment.usage.includes('```')) {
            examples = `\`\`\`ts\n${enrichment.usage}\n\`\`\``;
        } else {
            examples = enrichment.usage;
        }
    } else {
        // Extract usage section (try both "## Usage Examples" and "## Examples")
        let usageMatch = mdxContent.match(/## Usage Examples\n\n([\s\S]+?)(?=\n## |\n---|\n$)/);
        if (!usageMatch) {
            usageMatch = mdxContent.match(/## Examples\n\n([\s\S]+?)(?=\n## |\n---|\n$)/);
        }
        if (!usageMatch) {
            const usageBlockMatch = mdxContent.match(/## Usage\n\n(```ts\n[\s\S]*?```)/);
            if (usageBlockMatch) {
                usageMatch = [null, usageBlockMatch[1]];
            }
        }
        examples = usageMatch ? usageMatch[1].trim() : '';
    }

    // Extract TypeScript signature if available
    let signature = '';

    // First try to extract from MDX "## Function Signature" section
    const mdxSigMatch = mdxContent.match(/## Function Signature\n\n```ts\n([\s\S]*?)\n```/);
    if (mdxSigMatch) {
        signature = mdxSigMatch[1].trim();
    }

    // Fallback: Try to extract from TypeScript file for async functions
    if (!signature && functionData.tsPath) {
        const tsContent = readFileSync(functionData.tsPath, 'utf8');
        const sigMatch = tsContent.match(/export const \w+ = async \(([\s\S]*?)\): Promise<([\s\S]*?)> =>/);
        if (sigMatch) {
            const params = sigMatch[1].trim();
            const returnType = sigMatch[2].trim();
            signature = `export const ${functionName} = async (\n  ${params}\n): Promise<${returnType}>`;
        }
    }

    // Extract enriched fields if available
    const parameters = enrichment && enrichment.parameters ? enrichment.parameters : null;
    const returns = enrichment && enrichment.returns ? enrichment.returns : null;
    const events = enrichment && enrichment.events ? enrichment.events : null;

    // Handle both old 'usage' field and new 'examples' array
    let examplesList = null;
    if (enrichment) {
        if (enrichment.examples && Array.isArray(enrichment.examples)) {
            examplesList = enrichment.examples;
        } else if (enrichment.usage && !examples) {
            // Backward compatibility: convert single usage to examples array
            examplesList = [{ code: enrichment.usage }];
        }
    }

    return {
        name: functionName,
        description,
        signature,
        examples: examplesList || examples, // Use enriched examples or extracted
        parameters,
        returns,
        events,
        mdxContent
    };
}

function generateDescriptionFromName(functionName) {
    if (functionName.startsWith('publish')) {
        return 'Publishes analytics or tracking events for monitoring and reporting.';
    }
    if (functionName.startsWith('get')) {
        const subject = functionName.replace(/^get/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Returns ${readableSubject} from the current state or cache.`;
    }
    if (functionName.startsWith('update')) {
        return 'Updates data in the Adobe Commerce backend.';
    }
    if (functionName.startsWith('add')) {
        return 'Adds items or data to the system.';
    }
    if (functionName.startsWith('remove')) {
        return 'Removes items or data from the system.';
    }
    if (functionName.startsWith('create')) {
        return 'Creates new entities or resources.';
    }
    if (functionName.startsWith('delete')) {
        return 'Deletes entities or resources.';
    }
    if (functionName.startsWith('initialize')) {
        return 'Initializes the drop-in or component with configuration.';
    }
    if (functionName.startsWith('set')) {
        const subject = functionName.replace(/^set/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Sets or updates ${readableSubject} in the current state.`;
    }
    if (functionName.startsWith('is')) {
        const subject = functionName.replace(/^is/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Checks whether ${readableSubject}.`;
    }
    if (functionName.includes('fetch')) {
        const subject = functionName.replace(/^fetch/, '').replace(/fetch/i, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return readableSubject ? `Fetches ${readableSubject} from the Adobe Commerce backend.` : 'Fetches data from the Adobe Commerce backend.';
    }

    return 'API function for the drop-in.';
}

function generateEmptyFunctionsMDX(dropinName, repoConfig, version) {
    const dropinDisplayName = repoConfig.displayName;
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';

    // Check what documentation sections exist for this drop-in
    const docsPath = join(projectRoot, 'src', 'content', 'docs', basePath, dropinName);
    const hasEvents = existsSync(join(docsPath, 'events.mdx'));
    const hasContainers = existsSync(join(docsPath, 'containers'));

    // Build the alternatives list based on what exists
    let alternatives = [];

    if (hasContainers) {
        alternatives.push('- **Containers** - Pre-built UI components that you can integrate into your storefront. Check the Containers section for available components.');
    }
    if (hasEvents) {
        alternatives.push(`- **Events** - Event-driven communication for state management and integration. See the [Events documentation](/${basePath}/${dropinName}/events/) for details.`);
    }
    alternatives.push('- **Configuration** - Setup and configuration through Adobe Commerce admin panel.');

    const alternativesText = alternatives.length > 0
        ? `\n\nThe ${dropinDisplayName} drop-in provides functionality through:\n\n${alternatives.join('\n')}`
        : '';

    // Generate simplified content for drop-ins that have no functions
    const simplifiedContent = `---
title: ${dropinDisplayName} Functions
description: API functions provided by the ${dropinDisplayName} drop-in for programmatic control and customization.
sidebar:
  label: Functions
  order: 6
---

import { Aside } from '@astrojs/starlight/components';

This drop-in does not currently expose public API functions.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${version.replace(/^[\^~]/, '')}</strong>
</div>${alternativesText}

<Aside type="tip">
If you need programmatic control, consider reaching out to Adobe Commerce support or checking the latest drop-in releases for new API functions.
</Aside>
`;
    return simplifiedContent;
}

function generateFunctionsMDX(dropinName, repoConfig, functions, version, enrichmentData = null) {
    const dropinDisplayName = repoConfig.displayName;

    // Read template
    const templatePath = join(projectRoot, '_dropin-templates', 'dropin-functions.mdx');
    let template = readFileSync(templatePath, 'utf8');

    // Build functions content
    let functionsContent = '';

    for (const func of functions) {
        const info = extractFunctionInfo(func, enrichmentData);

        functionsContent += `## ${info.name}\n\n`;
        functionsContent += `${info.description}\n\n`;

        if (info.signature) {
            functionsContent += `### Signature\n\n\`\`\`ts\n${info.signature}\n\`\`\`\n\n`;
        }

        // Add Parameters section with OptionsTable if available
        if (info.parameters && Array.isArray(info.parameters) && info.parameters.length > 0) {
            functionsContent += `### Parameters\n\n`;
            functionsContent += `<OptionsTable\n  compact\n  options={[\n`;
            info.parameters.forEach(param => {
                functionsContent += `    ${JSON.stringify(param)},\n`;
            });
            functionsContent += `  ]}\n/>\n\n`;
        }

        // Add Returns section if available
        if (info.returns) {
            functionsContent += `### Returns\n\n${info.returns}\n\n`;
        }

        // Add Events section if available
        if (info.events) {
            functionsContent += `### Events\n\n${info.events}\n\n`;
        }

        // Add Usage/Examples section
        if (info.examples) {
            // Check if it's an array of examples or a simple string
            if (Array.isArray(info.examples)) {
                functionsContent += `### Usage\n\n`;
                info.examples.forEach(example => {
                    if (example.title) {
                        functionsContent += `${example.title}:\n\n`;
                    }
                    if (example.code) {
                        // Check if code already has code block markers
                        if (example.code.includes('```')) {
                            functionsContent += `${example.code}\n\n`;
                        } else {
                            functionsContent += `\`\`\`ts\n${example.code}\n\`\`\`\n\n`;
                        }
                    }
                });
            } else if (typeof info.examples === 'string') {
                functionsContent += `### Usage\n\n${info.examples}\n\n`;
            }
        }

        functionsContent += `---\n\n`;
    }

    // Replace placeholders in template
    const mdxContent = template
        .replace(/DROPIN_NAME/g, dropinDisplayName)
        .replace(/DROPIN_PACKAGE/g, dropinName)
        .replace(/DROPIN_VERSION/g, version.replace(/^[\^~]/, ''))
        .replace(/FUNCTIONS_CONTENT/g, functionsContent)
        .replace(/REPO_URL/g, repoConfig.gitUrl.replace('.git', ''));

    return mdxContent;
}

function updateSidebarNavigation(dropinName, repoConfig) {
    const configPath = join(projectRoot, 'astro.config.mjs');
    const config = readFileSync(configPath, 'utf8');

    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const sidebarEntry = `{ label: 'Functions', link: '/${basePath}/${dropinName}/functions/' },`;

    // Find the Slots entry for this dropin and add functions after it
    const slotsPattern = new RegExp(
        `(\\{\\s*label:\\s*'Slots',\\s*link:\\s*'/${basePath}/${dropinName}/slots/'\\s*\\},)`,
        'i'
    );

    // Check if the functions entry already exists first
    const functionsPattern = new RegExp(`label:\\s*'Functions',\\s*link:\\s*'/${basePath}/${dropinName}/functions/'`);
    if (functionsPattern.test(config)) {
        console.log(`  ℹ️  Sidebar entry already exists for ${repoConfig.displayName} functions`);
        return false;
    }

    // Try to insert after Slots
    const match = config.match(slotsPattern);
    if (match) {
        const updated = config.replace(
            slotsPattern,
            `$1\n                          ${sidebarEntry}`
        );
        writeFileSync(configPath, updated);
        console.log(`  ✅ Added sidebar entry for ${repoConfig.displayName} functions`);
        return true;
    }

    // If Slots doesn't exist, that's okay - sidebar can be managed manually
    return false;
}

// Main execution
async function main() {
    console.log('🚀 Functions Documentation Generator');
    console.log('=====================================\n');

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
            const repoPath = cloneDropinAtVersion(repoName, repoConfig, version);

            // Load enrichment data if available
            const enrichmentData = loadEnrichmentData(repoName);
            if (enrichmentData) {
                console.log(`  📚 Loaded enrichment data for ${Object.keys(enrichmentData).length} functions`);
            }

            // Scan for functions
            console.log(`  🔍 Scanning for functions...`);
            const functions = scanForFunctions(repoPath);

            let mdxContent;
            if (functions.length === 0) {
                console.log(`  ⚠️  No functions found - generating placeholder page`);
                // Generate a placeholder page explaining no functions are available
                mdxContent = generateEmptyFunctionsMDX(repoName, repoConfig, version);
            } else {
                console.log(`  ✓ Found ${functions.length} functions`);
                // Generate MDX with actual functions
                mdxContent = generateFunctionsMDX(repoName, repoConfig, functions, version, enrichmentData);
            }

            // Write to output file
            const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
            const outputPath = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, 'functions.mdx');
            const outputDir = dirname(outputPath);

            if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true });
            }

            writeFileSync(outputPath, mdxContent, 'utf8');
            console.log(`  ✅ Generated ${outputPath}`);

            // Show preview link for single drop-in generation
            if (targetDropin) {
                const urlPath = `/${basePath}/${repoName}/functions`;
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

    console.log('\n✨ Functions documentation generation complete!\n');
}

main();
