#!/usr/bin/env node

/********************************************************************
 * Functions Documentation Generator
 * 
 * This script generates API function documentation for Adobe Commerce drop-ins
 * by extracting information from source repositories.
 * 
 * What it does:
 * - Clones/updates drop-in repositories to .temp-repos/
 * - Scans src/api/ for function directories
 * - Reads existing .mdx documentation files
 * - Extracts TypeScript function signatures
 * - Converts Storybook format to Starlight format
 * - Generates consolidated functions.mdx for each drop-in
 * - Uses _dropin-templates/dropin-functions.mdx as template
 *******************************************************************/

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Drop-in repositories configuration
const DROPIN_REPOS = {
    'cart': {
        url: 'https://github.com/adobe-commerce/storefront-cart.git',
        type: 'B2C',
        displayName: 'Cart'
    },
    'checkout': {
        url: 'https://github.com/adobe-commerce/storefront-checkout.git',
        type: 'B2C',
        displayName: 'Checkout'
    },
    'order': {
        url: 'https://github.com/adobe-commerce/storefront-order-confirmation.git',
        type: 'B2C',
        displayName: 'Order'
    },
    'product-details': {
        url: 'https://github.com/adobe-commerce/storefront-pdp.git',
        type: 'B2C',
        displayName: 'Product Details'
    },
    'product-discovery': {
        url: 'https://github.com/adobe-commerce/storefront-product-listing-page.git',
        type: 'B2C',
        displayName: 'Product Discovery'
    },
    'recommendations': {
        url: 'https://github.com/adobe-commerce/storefront-product-recommendations.git',
        type: 'B2C',
        displayName: 'Recommendations'
    },
    'user-account': {
        url: 'https://github.com/adobe-commerce/storefront-customer-account.git',
        type: 'B2C',
        displayName: 'User Account'
    },
    'user-auth': {
        url: 'https://github.com/adobe-commerce/storefront-auth.git',
        type: 'B2C',
        displayName: 'User Auth'
    },
    'wishlist': {
        url: 'https://github.com/adobe-commerce/storefront-wishlist.git',
        type: 'B2C',
        displayName: 'Wishlist'
    },
    'payment-services': {
        url: 'https://github.com/adobe-commerce/storefront-payment-services.git',
        type: 'B2C',
        displayName: 'Payment Services'
    },
    // B2B Drop-ins
    'company-management': {
        url: 'https://github.com/adobe-commerce/storefront-company-management.git',
        type: 'B2B',
        displayName: 'Company Management'
    },
};

function cloneOrUpdateRepo(repoName, repoConfig) {
    const tempPath = join(projectRoot, '.temp-repos', repoName);

    if (!existsSync(tempPath)) {
        console.log(`  Cloning repository...`);
        const tempReposDir = join(projectRoot, '.temp-repos');
        if (!existsSync(tempReposDir)) {
            mkdirSync(tempReposDir, { recursive: true });
        }
        execSync(`git clone --depth 1 ${repoConfig.url} ${tempPath}`, { stdio: 'inherit' });
    } else {
        console.log(`  Updating repository...`);
        execSync(`cd ${tempPath} && git pull`, { stdio: 'inherit' });
    }

    return tempPath;
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

function extractFunctionInfo(functionData) {
    const mdxContent = readFileSync(functionData.mdxPath, 'utf8');

    // Extract function name from path
    const functionName = functionData.name;

    // Extract description (first paragraph after h1)
    const descMatch = mdxContent.match(/^# \w+\n\n(.+?)$/m);
    let description = descMatch ? descMatch[1] : 'API function for the drop-in.';

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
    // Pattern: "The `functionName` function does [what the name says]."
    const sentences = description.split(/\.\s+/);
    if (sentences.length > 1) {
        const firstSentence = sentences[0].toLowerCase();

        // Check if first sentence is just restating the function name without adding value
        // e.g., "The setProductConfigurationValues function sets the product configuration values"
        if (firstSentence.includes(`\`${functionName.toLowerCase()}\` function`)) {
            // Extract the action from the function name (e.g., "sets" from "setProductConfiguration")
            const nameWords = functionName.replace(/([A-Z])/g, ' $1').toLowerCase().trim().split(/\s+/);
            const actionWord = nameWords[0]; // get, set, fetch, etc.

            // If first sentence contains both the function name and repeats the action, remove it
            if (firstSentence.includes(actionWord)) {
                description = sentences.slice(1).join('. ').trim();
                if (!description.endsWith('.')) description += '.';
            }
        }
    }

    // Extract usage section (try both "## Usage Examples" and "## Examples")
    let usageMatch = mdxContent.match(/## Usage Examples\n\n([\s\S]+?)(?=\n## |\n---|\n$)/);
    if (!usageMatch) {
        usageMatch = mdxContent.match(/## Examples\n\n([\s\S]+?)(?=\n## |\n---|\n$)/);
    }
    if (!usageMatch) {
        // For "## Usage", preserve the code block structure
        const usageBlockMatch = mdxContent.match(/## Usage\n\n(```ts\n[\s\S]*?```)/);
        if (usageBlockMatch) {
            usageMatch = [null, usageBlockMatch[1]];
        }
    }
    const examples = usageMatch ? usageMatch[1].trim() : '';

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

    return {
        name: functionName,
        description,
        signature,
        examples,
        mdxContent
    };
}

function generateDescriptionFromName(functionName) {
    // Generate a basic description based on the function name pattern
    if (functionName.startsWith('publish')) {
        return 'Publishes analytics or tracking events for monitoring and reporting.';
    }
    if (functionName.startsWith('get')) {
        // Extract the subject from the function name (e.g., "ProductData" from "getProductData")
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

function generateFunctionsMDX(dropinName, repoConfig, functions) {
    const currentDate = new Date().toISOString().split('T')[0];
    const dropinDisplayName = repoConfig.displayName;

    // Read template
    const templatePath = join(projectRoot, '_dropin-templates', 'dropin-functions.mdx');
    let template = readFileSync(templatePath, 'utf8');

    // Remove JSX comments (template usage guide)
    template = template.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

    // Build functions content
    let functionsContent = '';

    for (const func of functions) {
        const info = extractFunctionInfo(func);

        functionsContent += `## ${info.name}\n\n`;
        functionsContent += `${info.description}\n\n`;

        if (info.signature) {
            functionsContent += `### Signature\n\n\`\`\`ts\n${info.signature}\n\`\`\`\n\n`;
        }

        if (info.examples) {
            functionsContent += `${info.examples}\n\n`;
        }

        functionsContent += `---\n\n`;
    }

    // Replace placeholders in template
    const mdxContent = template
        .replace(/DROPIN_NAME/g, dropinDisplayName)
        .replace(/DROPIN_PACKAGE/g, dropinName)
        .replace(/GENERATION_DATE/g, currentDate)
        .replace(/FUNCTIONS_CONTENT/g, functionsContent)
        .replace(/REPO_URL/g, repoConfig.url.replace('.git', ''));

    return mdxContent;
}

// Main execution
console.log('🚀 Functions Documentation Generator');
console.log('================================\n');

Object.entries(DROPIN_REPOS).forEach(([dropinName, repoConfig]) => {
    console.log(`📦 Processing ${repoConfig.displayName}...`);

    try {
        // Clone or update repository
        const repoPath = cloneOrUpdateRepo(dropinName, repoConfig);

        // Scan for functions
        console.log(`  🔍 Scanning for functions...`);
        const functions = scanForFunctions(repoPath);

        if (functions.length === 0) {
            console.log(`  ⚠️  No functions found\n`);
            return;
        }

        console.log(`  ✓ Found ${functions.length} functions`);

        // Generate MDX
        const mdxContent = generateFunctionsMDX(dropinName, repoConfig, functions);

        // Write to output file
        const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
        const outputPath = join(projectRoot, 'src', 'content', 'docs', basePath, dropinName, 'functions.mdx');
        const outputDir = dirname(outputPath);

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        writeFileSync(outputPath, mdxContent, 'utf8');
        console.log(`  ✅ Generated ${outputPath}\n`);

    } catch (error) {
        console.error(`  ❌ Error processing ${repoConfig.displayName}: ${error.message}\n`);
    }
});

console.log('\n✨ Functions documentation generation complete!\n');

