#!/usr/bin/env node

/**
 * Boilerplate Documentation Generator
 *
 * Generates comprehensive documentation for the AEM Commerce boilerplate by analyzing
 * the repository structure, blocks, and configuration files.
 *
 * Unlike other generators, this creates MULTIPLE documentation pages:
 * - Overview page with CardGrid of all blocks
 * - Individual documentation page for each commerce block (30+ pages)
 * - Project structure documentation
 * - Build process documentation  
 * - Configuration documentation
 *
 * USAGE:
 * - Generate all documentation: npm run generate-boilerplate-docs
 *
 * OUTPUT: Multiple MDX files in src/content/docs/boilerplate/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';

// Import shared utilities
import { getProjectRoot } from './lib/generator-core.js';
import { ensureParentDirectoryExists, formatDate } from './lib/utils.js';
import { applyStandardTransforms } from './lib/content-transforms.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';
import { cloneOrUpdateBoilerplate } from './lib/repository.js';

const projectRoot = getProjectRoot();

// ============================================================================
// REPOSITORY MANAGEMENT
// ============================================================================

/**
 * Map drop-in package name to documentation path
 * @param {string} packageName - Package name (e.g., 'storefront-cart', 'tools')
 * @returns {string|null} Documentation path (e.g., 'cart') or null if not found
 */
function getDropinDocPath(packageName) {
    // Handle 'tools' package - it doesn't have its own documentation page
    if (packageName === 'tools') {
        return null; // Skip linking to tools
    }

    // Find the drop-in config entry that matches this package name
    for (const [docPath, config] of Object.entries(DROPIN_REPOS)) {
        // Extract package name without @dropins/ prefix
        const configPackageName = config.packageName.replace('@dropins/', '');
        if (configPackageName === packageName) {
            return docPath;
        }
    }

    return null;
}

/**
 * Extract version from boilerplate package.json
 */
function extractBoilerplateVersion(boilerplatePath) {
    const packageJsonPath = join(boilerplatePath, 'package.json');

    if (!existsSync(packageJsonPath)) {
        console.warn('  ⚠️  package.json not found, using "latest" as version');
        return 'latest';
    }

    try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        // Use the boilerplate's own version field
        const version = packageJson.version || 'latest';
        return version;
    } catch (error) {
        console.warn('  ⚠️  Error reading package.json:', error.message);
        return 'latest';
    }
}

/**
 * Load template file
 */
function loadTemplate(templateName) {
    const templatePath = join(projectRoot, '_dropin-templates', templateName);

    if (!existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`);
    }

    return readFileSync(templatePath, 'utf8');
}

// ============================================================================
// CODE ANALYSIS
// ============================================================================

/**
 * Analyze JavaScript code to extract implementation details
 */
function analyzeBlockCode(jsPath) {
    const analysis = {
        dropins: [],
        containers: [],
        events: [],
        configOptions: [],
        apiCalls: []
    };

    if (!existsSync(jsPath)) {
        return analysis;
    }

    const code = readFileSync(jsPath, 'utf8');

    // Extract drop-in imports (handles: import {}, import name, import * as name, import name, { ... })
    const dropinImportPattern = /import\s+(?:(?:\*\s+as\s+\w+)|(?:{[^}]+})|(?:\w+(?:\s*,\s*{[^}]+})?))\s+from\s+['"]@dropins\/([\w-]+)(?:\/[^'"]+)?['"]/g;
    let match;
    while ((match = dropinImportPattern.exec(code)) !== null) {
        const dropin = match[1];
        if (!analysis.dropins.includes(dropin)) {
            analysis.dropins.push(dropin);
        }
    }

    // Extract container usage
    const containerPattern = /(\w+)\.render\s*\(/g;
    while ((match = containerPattern.exec(code)) !== null) {
        const container = match[1];
        if (!analysis.containers.includes(container)) {
            analysis.containers.push(container);
        }
    }

    // Extract event listeners
    const eventPattern = /events\.on\(['"]([^'"]+)['"]/g;
    while ((match = eventPattern.exec(code)) !== null) {
        const event = match[1];
        if (!analysis.events.includes(event)) {
            analysis.events.push(event);
        }
    }

    // Extract API function calls
    const apiCallPattern = /(?:api|pkg)\.(\w+)\s*\(/g;
    while ((match = apiCallPattern.exec(code)) !== null) {
        const apiCall = match[1];
        if (!analysis.apiCalls.includes(apiCall)) {
            analysis.apiCalls.push(apiCall);
        }
    }

    return analysis;
}

/**
 * Extract commerce blocks from the boilerplate
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
        const blockPath = join(blocksDir, blockName);
        const jsPath = join(blockPath, `${blockName}.js`);
        const cssPath = join(blockPath, `${blockName}.css`);

        // Only process commerce-related blocks
        if (!blockName.startsWith('commerce-') &&
            !blockName.includes('product') &&
            !blockName.includes('cart') &&
            !blockName.includes('checkout')) {
            continue;
        }

        const analysis = analyzeBlockCode(jsPath);

        blocks.push({
            name: blockName,
            displayName: blockName.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            sidebarLabel: blockName.replace('commerce-', '').split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            path: blockPath,
            hasJs: existsSync(jsPath),
            hasCss: existsSync(cssPath),
            analysis
        });
    }

    console.log(`  ✓ Found ${blocks.length} commerce blocks`);
    return blocks;
}

/**
 * Extract initializers from scripts/initializers directory
 */
function extractInitializers(boilerplatePath) {
    console.log('\n🔍 Analyzing initializers...');

    const initializersDir = join(boilerplatePath, 'scripts', 'initializers');
    const initializers = [];

    if (existsSync(initializersDir)) {
        const files = readdirSync(initializersDir);

        for (const file of files) {
            if (file.endsWith('.js')) {
                const filePath = join(initializersDir, file);
                const stats = statSync(filePath);

                if (stats.isFile()) {
                    initializers.push({
                        name: file,
                        path: `scripts/initializers/${file}` // Relative path for display
                    });
                }
            }
        }

        // Sort alphabetically for consistent output
        initializers.sort((a, b) => a.name.localeCompare(b.name));
    }

    console.log(`  ✓ Found ${initializers.length} initializer files`);
    return initializers;
}

// ============================================================================
// DOCUMENTATION GENERATION
// ============================================================================

/**
 * Generate overview page with table of blocks
 */
function generateOverview(blocks, initializers, boilerplateVersion, outputPath) {
    console.log('\n📝 Generating overview page...');

    // Load template
    let content = loadTemplate('boilerplate-overview.mdx');

    // Build table for commerce blocks
    let tableContent = '| Block | Drop-ins used |\n';
    tableContent += '|-------|---------------|\n';

    for (const block of blocks) {
        const blockLink = `[${block.displayName}](/boilerplate/blocks/${block.name}/)`;
        const dropinList = block.analysis.dropins.length > 0
            ? block.analysis.dropins.join(', ')
            : 'None';

        tableContent += `| ${blockLink} | ${dropinList} |\n`;
    }

    // Build initializers list
    let initializersList = '';
    if (initializers.length > 0) {
        for (const init of initializers) {
            initializersList += `- **${init.name}** - ${init.path}\n`;
        }
    } else {
        initializersList = '- No initializers found\n';
    }

    // Replace placeholders
    content = content
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/BLOCK_COUNT/g, blocks.length.toString())
        .replace(/COMMERCE_BLOCKS_TABLE/g, tableContent)
        .replace(/INITIALIZERS_LIST/g, initializersList);

    // Write file
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate blocks overview page with grouped technical reference
 */
function generateBlocksOverview(blocks, outputPath) {
    console.log('\n📝 Generating blocks overview page...');

    // Load template
    let content = loadTemplate('boilerplate-blocks-overview.mdx');

    // Group blocks by category
    const categories = {
        'Shopping Experience': ['product-list-page', 'product-details', 'product-recommendations', 'commerce-cart', 'commerce-mini-cart', 'commerce-checkout'],
        'Customer Account': ['commerce-login', 'commerce-create-account', 'commerce-confirm-account', 'commerce-forgot-password', 'commerce-create-password', 'commerce-account-header', 'commerce-account-sidebar', 'commerce-addresses', 'commerce-customer-information', 'commerce-customer-details'],
        'Order Management': ['commerce-orders-list', 'commerce-search-order', 'commerce-order-header', 'commerce-order-status', 'commerce-order-product-list', 'commerce-order-cost-summary', 'commerce-shipping-status'],
        'Returns & Exchanges': ['commerce-returns-list', 'commerce-create-return', 'commerce-order-returns', 'commerce-return-header'],
        'Gift Options': ['commerce-gift-options'],
        'Wishlist': ['commerce-wishlist']
    };

    // Build grouped table
    let tableContent = '<TableWrapper nowrap={[0]}>\n\n';
    tableContent += '| Block | Primary Drop-ins | Key Features |\n';
    tableContent += '|-------|-----------------|--------------|\n';

    for (const [category, blockNames] of Object.entries(categories)) {
        tableContent += `| **${category}** | | |\n`;

        for (const blockName of blockNames) {
            const block = blocks.find(b => b.name === blockName);
            if (block) {
                const blockLink = `[${block.sidebarLabel}](/boilerplate/blocks/${block.name}/)`;
                const primaryDropins = block.analysis.dropins.slice(0, 3).join(', ') || 'tools';

                // Generate key features based on block name
                const features = getBlockFeatures(block.name);

                tableContent += `| ${blockLink} | ${primaryDropins} | ${features} |\n`;
            }
        }
    }

    tableContent += '\n</TableWrapper>';

    // Replace placeholder
    content = content.replace('BLOCKS_TABLE', tableContent);

    // Write file
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Get key features description for a block
 */
function getBlockFeatures(blockName) {
    const features = {
        'product-list-page': 'Search, filtering, sorting, pagination, wishlist integration',
        'product-details': 'Product options, pricing, add to cart, wishlist toggle',
        'product-recommendations': 'AI-powered recommendations, multiple page types',
        'commerce-cart': 'Item management, coupon codes, gift options, move to wishlist',
        'commerce-mini-cart': 'Dropdown cart summary, quick view, checkout navigation',
        'commerce-checkout': 'Complete checkout flow, shipping, payment, order review',
        'commerce-login': 'Email/password authentication, redirect handling',
        'commerce-create-account': 'Registration form, validation, account creation',
        'commerce-confirm-account': 'Email confirmation landing, account activation',
        'commerce-forgot-password': 'Password reset request, email trigger',
        'commerce-create-password': 'Password reset form, token validation',
        'commerce-account-header': 'Customer name display, logout functionality',
        'commerce-account-sidebar': 'Account navigation menu, active state management',
        'commerce-addresses': 'Address CRUD operations, default address management',
        'commerce-customer-information': 'Profile editing, email/name updates',
        'commerce-customer-details': 'Customer info display in order context',
        'commerce-orders-list': 'Order history, status display, order details navigation',
        'commerce-search-order': 'Guest order lookup, email and order number validation',
        'commerce-order-header': 'Order number, date, status badge',
        'commerce-order-status': 'Detailed status, tracking info, delivery estimates',
        'commerce-order-product-list': 'Line items, reorder functionality, product images',
        'commerce-order-cost-summary': 'Subtotal, taxes, shipping, discounts, grand total',
        'commerce-shipping-status': 'Shipment tracking, carrier info, delivery status',
        'commerce-returns-list': 'Return history, status tracking, return details navigation',
        'commerce-create-return': 'Return request form, item selection, reason codes',
        'commerce-order-returns': 'Return details for specific order',
        'commerce-return-header': 'Return number, date, status display',
        'commerce-gift-options': 'Gift messages, gift wrapping, gift receipt options',
        'commerce-wishlist': 'Saved items, move to cart, item management'
    };

    return features[blockName] || 'Commerce functionality';
}

/**
 * Parse README file for a block to extract configuration, events, and other details
 */
function parseBlockReadme(blockPath) {
    const readmePath = join(blockPath, 'README.md');

    if (!existsSync(readmePath)) {
        return {
            hasReadme: false,
            configuration: null,
            events: { listeners: [], emitters: [] },
            urlParams: [],
            localStorage: [],
            behaviorPatterns: null,
            errorHandling: null
        };
    }

    const readmeContent = readFileSync(readmePath, 'utf8');

    return {
        hasReadme: true,
        configuration: extractConfigurationTable(readmeContent),
        events: extractEvents(readmeContent),
        urlParams: extractUrlParams(readmeContent),
        localStorage: extractLocalStorage(readmeContent),
        behaviorPatterns: extractSection(readmeContent, '## Behavior Patterns'),
        errorHandling: extractSection(readmeContent, '### Error Handling')
    };
}

/**
 * Extract configuration table from README
 */
function extractConfigurationTable(content) {
    const configMatch = content.match(/\| Configuration Key \| Type \| Default \| Description \| Required \| Side Effects \|([\s\S]*?)(?=\n##|\n<!--|$)/);
    if (!configMatch) return null;

    const tableContent = configMatch[0];
    const rows = tableContent.split('\n').filter(line => line.trim() && !line.includes('|---'));

    if (rows.length <= 1) return null; // Only header row

    return tableContent;
}

/**
 * Extract events (listeners and emitters) from README
 */
function extractEvents(content) {
    const events = { listeners: [], emitters: [] };

    // Extract event listeners
    const listenersMatch = content.match(/#### Event Listeners([\s\S]*?)(?=####|##|$)/);
    if (listenersMatch) {
        const listenerLines = listenersMatch[1].match(/- `events\.on\(['"](.*?)['"].*?\)` - (.*?)$/gm);
        if (listenerLines) {
            events.listeners = listenerLines.map(line => {
                const match = line.match(/- `events\.on\(['"](.*?)['"].*?\)` - (.*)$/);
                if (match) {
                    return { name: match[1], description: match[2] };
                }
                return null;
            }).filter(Boolean);
        }
    }

    // Extract event emitters
    const emittersMatch = content.match(/#### Event Emitters([\s\S]*?)(?=##|$)/);
    if (emittersMatch) {
        const emitterLines = emittersMatch[1].match(/- `.*?\)` - (.*?)$/gm);
        if (emitterLines) {
            events.emitters = emitterLines.map(line => {
                const match = line.match(/- `(.*?)\)` - (.*)$/);
                if (match) {
                    return { name: match[1], description: match[2] };
                }
                return null;
            }).filter(Boolean);
        }
    }

    return events;
}

/**
 * Extract URL parameters from README
 */
function extractUrlParams(content) {
    const urlMatch = content.match(/### URL Parameters([\s\S]*?)(?=###|##|$)/);
    if (!urlMatch || urlMatch[1].includes('No URL parameters')) return [];

    const paramLines = urlMatch[1].match(/- `.*?` - .*$/gm);
    if (!paramLines) return [];

    return paramLines.map(line => {
        const match = line.match(/- `(.*?)` - (.*)$/);
        if (match) {
            return { name: match[1], description: match[2] };
        }
        return null;
    }).filter(Boolean);
}

/**
 * Extract local storage usage from README
 */
function extractLocalStorage(content) {
    const storageMatch = content.match(/### Local Storage([\s\S]*?)(?=###|##|$)/);
    if (!storageMatch || storageMatch[1].includes('No localStorage')) return [];

    const storageLines = storageMatch[1].match(/- `.*?` - .*$/gm);
    if (!storageLines) return [];

    return storageLines.map(line => {
        const match = line.match(/- `(.*?)` - (.*)$/);
        if (match) {
            return { key: match[1], description: match[2] };
        }
        return null;
    }).filter(Boolean);
}

/**
 * Extract a section from README by heading
 */
function extractSection(content, heading) {
    const pattern = new RegExp(`${heading}([\\s\\S]*?)(?=\\n## |$)`);
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
}

/**
 * Get a specific, meaningful description for a block
 */
function getBlockDescription(blockName) {
    const descriptions = {
        'product-list-page': 'Displays product listings with advanced search, filtering, sorting, and pagination capabilities. Integrates with Adobe Commerce Live Search and Product Recommendations for intelligent product discovery.',
        'product-details': 'Renders complete product information including images, pricing, configurable options, and add-to-cart functionality. Supports simple, configurable, grouped, and bundle product types with wishlist integration.',
        'product-recommendations': 'Displays AI-powered product recommendations based on Adobe Sensei machine learning. Adapts recommendations by page type (PDP, cart, homepage) and supports multiple recommendation units per page.',
        'commerce-cart': 'Provides full shopping cart functionality with item management, quantity updates, coupon codes, gift options, and move-to-wishlist capabilities. Displays real-time pricing and inventory status.',
        'commerce-mini-cart': 'Shows a dropdown cart summary typically placed in the site header. Provides quick cart overview, item count, subtotal, and one-click checkout navigation without leaving the current page.',
        'commerce-checkout': 'Delivers the complete checkout experience including shipping address, shipping methods, payment options, and order review. Integrates with Adobe Payment Services for secure payment processing.',
        'commerce-login': 'Provides customer authentication with email and password. Handles session management, redirect after login, and integrates with the storefront authentication system.',
        'commerce-create-account': 'Enables new customer registration with email validation, password requirements, and privacy policy consent. Handles email confirmation flow and redirects authenticated users to their account page.',
        'commerce-confirm-account': 'Serves as the email confirmation landing page after registration. Validates confirmation tokens and activates customer accounts, completing the registration process.',
        'commerce-forgot-password': 'Initiates the password reset workflow by collecting the customer email address and triggering a password reset email with a secure token.',
        'commerce-create-password': 'Completes the password reset process by validating the reset token and allowing customers to set a new password. Includes password strength requirements and confirmation.',
        'commerce-account-header': 'Displays the logged-in customer name and provides logout functionality. Typically used at the top of account dashboard pages for consistent navigation.',
        'commerce-account-sidebar': 'Renders the account section navigation menu with links to orders, addresses, account information, and wishlist. Highlights the active section for easy navigation.',
        'commerce-addresses': 'Manages customer shipping and billing addresses with full CRUD operations. Allows setting default addresses and validates address data before saving.',
        'commerce-customer-information': 'Enables customers to view and edit their profile information including name, email, and password. Validates changes and requires current password for email updates.',
        'commerce-customer-details': 'Displays read-only customer information within the order details context, including name, email, and contact information associated with the order.',
        'commerce-orders-list': 'Shows the complete order history with order numbers, dates, status, totals, and quick links to order details. Supports pagination for customers with many orders.',
        'commerce-search-order': 'Allows guest customers to look up orders using order number and email address, providing access to order tracking without requiring account login.',
        'commerce-order-header': 'Displays essential order information at the top of order details pages, including order number, order date, and current order status with visual status indicators.',
        'commerce-order-status': 'Provides detailed order status information including processing status, shipment tracking, and delivery estimates. Updates dynamically as order progresses through fulfillment.',
        'commerce-order-product-list': 'Lists all products in an order with images, names, quantities, prices, and options. Displays gift options for each item and provides links to product detail pages.',
        'commerce-order-cost-summary': 'Breaks down order costs including subtotal, taxes, shipping fees, discounts, and grand total. Shows both order-time pricing and any applied promotions.',
        'commerce-shipping-status': 'Displays shipment tracking information including carrier details, tracking numbers, and delivery status. Links to carrier tracking pages for detailed shipment updates.',
        'commerce-returns-list': 'Shows all return requests with return numbers, dates, status, and links to return details. Helps customers track the progress of their return requests.',
        'commerce-create-return': 'Enables customers to initiate return requests by selecting items from eligible orders, specifying quantities, and providing return reasons. Validates return eligibility.',
        'commerce-order-returns': 'Displays return information specific to an order, showing which items have been returned or have pending return requests within the order details context.',
        'commerce-return-header': 'Shows key return request information at the top of return details pages, including return number, request date, and current return status.',
        'commerce-gift-options': 'Displays read-only gift options from order data in order-related pages. Shows gift messages and wrapping selections with secondary view styling for order context.',
        'commerce-wishlist': 'Manages saved items for future purchase with options to move items to cart, remove items, and view product details. Supports both authenticated and guest users with automatic wishlist merging upon sign-in.'
    };

    return descriptions[blockName] || `Provides ${blockName.replace(/-/g, ' ')} functionality for the storefront.`;
}

/**
 * Generate documentation for individual blocks
 */
function generateBlockDocs(block, boilerplateVersion, outputDir) {
    // Load template
    let content = loadTemplate('boilerplate-block.mdx');

    // Parse README for rich information
    const readme = parseBlockReadme(block.path);

    // Build description
    const description = getBlockDescription(block.name);

    // Build streamlined sections
    const quickStartSection = buildQuickStartSection(block.name);
    const integrationSection = buildStreamlinedIntegrationSection(block, readme);
    const customizationSection = buildCustomizationSection(block);

    // Replace placeholders
    content = content
        .replace(/BLOCK_DISPLAY_NAME/g, block.displayName)
        .replace(/SIDEBAR_LABEL/g, block.sidebarLabel)
        .replace(/BLOCK_NAME/g, block.name)
        .replace(/BLOCK_DESCRIPTION/g, description)
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/QUICK_START_SECTION/g, quickStartSection)
        .replace(/INTEGRATION_SECTION/g, integrationSection)
        .replace(/CUSTOMIZATION_SECTION/g, customizationSection);

    // Write file
    const outputPath = join(outputDir, 'blocks', `${block.name}.mdx`);
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');
}

/**
 * Build Quick Start section
 */
function buildQuickStartSection(blockName) {
    return `## Quick start

This block is included in the boilerplate and works out of the box.

- **Block:** \`blocks/${blockName}/${blockName}.js\`
- **Styles:** \`blocks/${blockName}/${blockName}.css\`

<Aside type="tip" title="For merchants">
See the [merchant documentation](/merchants/blocks/${blockName}/) for how to add this block to pages.
</Aside>`;
}

/**
 * Build streamlined How it works section - combines drop-ins, events, config, and behavior
 */
function buildStreamlinedIntegrationSection(block, readme) {
    let section = '## How it works\n\n';

    // Drop-ins
    if (block.analysis.dropins && block.analysis.dropins.length > 0) {
        section += '### Drop-ins used\n\n';
        for (const dropin of block.analysis.dropins) {
            const docPath = getDropinDocPath(dropin);
            const dropinPurpose = getDropinPurpose(dropin);
            if (docPath) {
                section += `- **${dropinPurpose}:** [\`@dropins/${dropin}\`](/dropins/${docPath}/)\n`;
            } else {
                section += `- **${dropinPurpose}:** \`@dropins/${dropin}\`\n`;
            }
        }
        section += '\n';
    }

    // Events (if any)
    const hasListeners = readme.events.listeners && readme.events.listeners.length > 0;
    const hasEmitters = readme.events.emitters && readme.events.emitters.length > 0;

    if (hasListeners || hasEmitters) {
        section += '### Events\n\n';

        if (hasListeners) {
            section += 'Listens to:\n\n';
            for (const event of readme.events.listeners) {
                section += `- \`${event.name}\` - ${event.description}\n`;
            }
            section += '\n';
        }

        if (hasEmitters) {
            section += 'Emits:\n\n';
            for (const event of readme.events.emitters) {
                section += `- \`${event.name}\` - ${event.description}\n`;
            }
            section += '\n';
        }
    }

    // Configuration (if any)
    if (readme.configuration) {
        section += '### Configuration options\n\n';
        section += '<TableWrapper nowrap={[0]}>\n\n';
        section += readme.configuration;
        section += '\n\n</TableWrapper>\n\n';
    }

    // Key behavior patterns (concise)
    if (readme.behaviorPatterns) {
        const contextDetection = readme.behaviorPatterns.match(/### Page Context Detection([\s\S]*?)(?=###|$)/);
        if (contextDetection) {
            section += '### Key behaviors\n\n';
            section += contextDetection[1].trim() + '\n\n';
        }
    }

    return section;
}

/**
 * Build Customization section
 */
function buildCustomizationSection(block) {
    const blockName = block.name;

    let section = '## Customization\n\n';

    section += 'Common approaches:\n\n';
    section += `- **Modify behavior**: Edit \`blocks/${blockName}/${blockName}.js\`\n`;
    section += `- **Update styles**: Edit \`blocks/${blockName}/${blockName}.css\`\n`;

    if (block.analysis.dropins.length > 0) {
        section += '- **Extend drop-ins**: Use [drop-in slots and events](/dropins/all/quick-start/#slots-and-events) for custom behavior\n';
    }

    section += '\n';
    section += `See the <Link href="https://github.com/hlxsites/aem-boilerplate-commerce/tree/main/blocks/${blockName}" text="source code" /> for implementation details.\n`;

    return section;
}

/**
 * Get purpose description for a drop-in
 */
function getDropinPurpose(dropin) {
    const purposes = {
        'storefront-cart': 'Cart management and operations',
        'storefront-checkout': 'Checkout flow and order placement',
        'storefront-order': 'Order management and history',
        'storefront-pdp': 'Product detail page functionality',
        'storefront-product-discovery': 'Product search and filtering',
        'storefront-recommendations': 'AI-powered product recommendations',
        'storefront-account': 'Customer account management',
        'storefront-auth': 'Authentication and authorization',
        'storefront-wishlist': 'Wishlist management',
        'storefront-payment-services': 'Payment processing',
        'tools': 'Shared utilities and components'
    };
    return purposes[dropin] || 'Commerce functionality';
}

/**
 * Generate structure documentation
 */
function generateStructureDocs(boilerplateVersion, outputPath) {
    console.log('\n📝 Generating project structure documentation...');

    // Load template
    let content = loadTemplate('boilerplate-structure.mdx');

    // Build file tree content
    const fileTreeContent = `<FileTree>
- blocks/ _-- Content and Commerce blocks_
  - commerce-cart/ _-- Cart block_
  - commerce-checkout/ _-- Checkout block_
  - product-details/ _-- PDP block_
  - product-list-page/ _-- PLP block_
  - ... _-- More commerce blocks_
- scripts/ _-- JavaScript files_
  - __dropins__/ _-- Imported drop-in components_
  - initializers/ _-- Drop-in initialization_
  - aem.js _-- AEM site functions_
  - commerce.js _-- Commerce functionality_
  - configs.js _-- Configuration functions_
  - scripts.js _-- Core AEM functionality_
- styles/ _-- CSS files_
  - fonts.css _-- Typography_
  - lazy-styles.css _-- Deferred styles_
  - styles.css _-- Global design tokens_
- tools/ _-- Commerce tooling_
  - picker/ _-- Commerce Picker_
  - sidekick/ _-- Sidekick config_
- head.html _-- Site-wide head configuration_
- package.json _-- Dependencies and scripts_
</FileTree>`;

    // Replace placeholders
    content = content
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/FILE_TREE_CONTENT/g, fileTreeContent);

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate build process documentation
 */
function generateBuildDocs(boilerplateVersion, outputPath) {
    console.log('\n📝 Generating build process documentation...');

    // Load template
    let content = loadTemplate('boilerplate-build-process.mdx');

    // Replace placeholders
    content = content
        .replace(/BOILERPLATE_VERSION/g, boilerplateVersion)
        .replace(/TOOLS_VERSION/g, boilerplateVersion); // Use same version

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Generate configuration documentation
 */
function generateConfigDocs(boilerplateVersion, outputPath) {
    console.log('\n📝 Generating configuration documentation...');

    // Load template
    let content = loadTemplate('boilerplate-configuration.mdx');

    // Replace placeholders
    content = content.replace(/BOILERPLATE_VERSION/g, boilerplateVersion);

    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ Generated ${outputPath}`);
}

/**
 * Update sidebar navigation
 * Note: Individual block pages removed - only overview page remains
 */
function updateSidebarNavigation(blocks) {
    console.log('\n📝 Updating sidebar navigation...');
    console.log('  ℹ️  Individual block pages removed - sidebar will be manually managed');
    console.log('  ℹ️  Commerce blocks are now consolidated in /boilerplate/blocks/');
    // Sidebar is now manually managed in astro.config.mjs
    // No automatic updates needed for blocks section
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

try {
    console.log('\n' + '='.repeat(60));
    console.log('  AEM COMMERCE BOILERPLATE DOCUMENTATION GENERATOR');
    console.log('='.repeat(60));

    // Clone/update boilerplate using shared function
    const { path: boilerplatePath } = cloneOrUpdateBoilerplate();

    // Extract version
    const boilerplateVersion = extractBoilerplateVersion(boilerplatePath);
    console.log(`\n📦 Boilerplate version: ${boilerplateVersion}`);

    // Extract information
    const blocks = extractCommerceBlocks(boilerplatePath);
    const initializers = extractInitializers(boilerplatePath);

    // Generate documentation
    const outputDir = join(projectRoot, 'src', 'content', 'docs', 'boilerplate');

    // Ensure blocks directory exists
    ensureParentDirectoryExists(join(outputDir, 'blocks', 'placeholder.md'));

    // Generate overview
    generateOverview(blocks, initializers, boilerplateVersion, join(outputDir, 'index.mdx'));

    // Generate blocks overview page
    generateBlocksOverview(blocks, join(outputDir, 'blocks', 'index.mdx'));

    // Individual block documentation removed - consolidated into overview page
    // See /boilerplate/blocks/ for complete block reference
    // See /boilerplate/customizing-blocks/ for implementation guidance

    // Generate additional documentation
    generateStructureDocs(boilerplateVersion, join(outputDir, 'structure.mdx'));
    generateBuildDocs(boilerplateVersion, join(outputDir, 'build-process.mdx'));
    generateConfigDocs(boilerplateVersion, join(outputDir, 'configuration.mdx'));

    // Update sidebar
    updateSidebarNavigation(blocks);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Generation Summary:\n');
    console.log(`✅ Overview page: 1`);
    console.log(`✅ Blocks overview page: 1 (${blocks.length} blocks listed)`);
    console.log(`✅ Structure docs: 1`);
    console.log(`✅ Build docs: 1`);
    console.log(`✅ Configuration docs: 1`);
    console.log(`ℹ️  Sidebar navigation: Manually managed`);
    console.log(`📄 Total: 5 pages`);

    console.log('\n📝 Generated Documentation:\n');
    console.log(`   📂 /boilerplate/`);
    console.log(`      📄 index.mdx (Overview)`);
    console.log(`      📄 structure.mdx`);
    console.log(`      📄 build-process.mdx`);
    console.log(`      📄 configuration.mdx`);
    console.log(`      📂 blocks/`);
    console.log(`         📄 index.mdx (Overview for ${blocks.length} blocks)`);
    console.log(`\n   ℹ️  Individual block pages removed - see /boilerplate/blocks/`);
    console.log(`   ℹ️  Customization guide at /boilerplate/customizing-blocks/`);

    console.log('\n✨ Boilerplate documentation generation complete!\n');

} catch (error) {
    console.error('\n❌ Error generating boilerplate documentation:');
    console.error(`   ${error.message}`);
    console.error(`\n${error.stack}`);
    process.exit(1);
}
