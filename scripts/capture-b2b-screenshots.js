#!/usr/bin/env node

/**
 * Automated B2B Commerce Block Screenshot Capture
 * 
 * Captures screenshots of B2B commerce blocks using Playwright.
 * Features:
 * - 2x retina resolution (3840x2160)
 * - WebP format for optimal file size
 * - Individual block component targeting
 * - Automatic login and navigation
 * 
 * Usage:
 *   npm install playwright sharp
 *   node scripts/capture-b2b-screenshots.js
 * 
 * Options:
 *   --block <name>  Capture only specific block (e.g., --block commerce-b2b-negotiable-quote)
 *   --all           Capture all blocks (default)
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    baseUrl: 'https://b2b-suite-release1--boilerplate-b2b-accs-qa--adobe-commerce.aem.live',
    viewport: { width: 2560, height: 1600 }, // 2x retina (1280x800 base)
    deviceScaleFactor: 2,
    credentials: {
        username: process.env.B2B_USERNAME || 'tony.stark@fake.email',
        password: process.env.B2B_PASSWORD || 'Avengers_Assemble1',
        loginUrl: '/customer/account'
    },
    outputDir: path.join(__dirname, '..', 'public', 'images'),
    tempDir: path.join(__dirname, '..', '.temp-screenshots'),
    storageStatePath: path.join(__dirname, '..', '.temp-screenshots', 'auth-state.json'),
    // Screenshot settings
    maxWidth: 2560, // Max width @ 2x retina (1280px base)
    maxHeight: 1600 // Max height @ 2x retina (800px base)
};

/**
 * Block definitions with URL and CSS selector for each component
 */
const BLOCKS = {
    // Negotiable Quotes
    'commerce-b2b-negotiable-quote': {
        url: '/customer/negotiable-quote',
        selector: 'table[role="grid"], .quote-management-grid, [data-testid="quote-grid"]',
        waitFor: 'table',
        description: 'Negotiable quotes listing table'
    },
    'commerce-b2b-negotiable-quote-template': {
        url: '/customer/negotiable-quote-template',
        selector: '.quote-template-grid, [data-testid="quote-template-grid"], table',
        waitFor: 'table',
        description: 'Quote templates listing'
    },
    'commerce-b2b-quote-checkout': {
        url: '/customer/negotiable-quote',
        selector: '.quote-checkout-section, [data-testid="quote-checkout"]',
        waitFor: 'table',
        description: 'Quote checkout view',
        fallback: 'commerce-b2b-negotiable-quote' // Use same as negotiable-quote if selector not found
    },

    // Requisition Lists
    'commerce-b2b-requisition-list': {
        url: '/customer/requisition-lists',
        selector: '[data-testid="requisition-list-grid-wrapper"], .requisition-list-grid',
        waitFor: 'table',
        description: 'Requisition lists table'
    },
    'commerce-b2b-requisition-list-view': {
        url: '/customer/requisition-lists',
        selector: '[data-testid="requisition-list-grid-wrapper"], .requisition-list-grid',
        waitFor: 'table',
        description: 'Requisition list detail view',
        fallback: 'commerce-b2b-requisition-list'
    },

    // Purchase Orders - Main Views
    'commerce-b2b-po-customer-purchase-orders': {
        url: '/customer/purchase-orders',
        selector: '.purchase-orders-content, [data-testid="my-purchase-orders"]',
        waitFor: 'table',
        description: 'My purchase orders section'
    },
    'commerce-b2b-po-company-purchase-orders': {
        url: '/customer/purchase-orders',
        selector: '.company-purchase-orders, [data-testid="company-purchase-orders"]',
        waitFor: 'table',
        description: 'Company purchase orders section',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },
    'commerce-b2b-po-require-approval-purchase-orders': {
        url: '/customer/purchase-orders',
        selector: '[data-testid="requires-approval"], .requires-approval-section',
        waitFor: 'table',
        description: 'Purchase orders requiring approval',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },

    // Purchase Orders - Detail Components
    'commerce-b2b-po-header': {
        url: '/customer/purchase-orders',
        selector: '.po-header, [data-testid="po-header"]',
        waitFor: 'h1, h2',
        description: 'Purchase order header',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },
    'commerce-b2b-po-status': {
        url: '/customer/purchase-orders',
        selector: '.po-status, [data-testid="po-status"]',
        waitFor: 'table',
        description: 'Purchase order status indicator',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },
    'commerce-b2b-po-history-log': {
        url: '/customer/purchase-orders',
        selector: '.po-history, [data-testid="po-history"]',
        waitFor: 'table',
        description: 'Purchase order history log',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },

    // Purchase Orders - Comments
    'commerce-b2b-po-comments-list': {
        url: '/customer/purchase-orders',
        selector: '.po-comments-list, [data-testid="po-comments"]',
        waitFor: 'div',
        description: 'Purchase order comments list',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },
    'commerce-b2b-po-comment-form': {
        url: '/customer/purchase-orders',
        selector: '.po-comment-form, [data-testid="po-comment-form"]',
        waitFor: 'form',
        description: 'Purchase order comment form',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },

    // Purchase Orders - Approval Rules
    'commerce-b2b-po-approval-rules-list': {
        url: '/customer/approval-rules',
        selector: '.approval-rules-grid, [data-testid="approval-rules"], table',
        waitFor: 'table',
        description: 'Approval rules listing',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },
    'commerce-b2b-po-approval-rule-form': {
        url: '/customer/approval-rules',
        selector: '.approval-rule-form, [data-testid="approval-rule-form"]',
        waitFor: 'form',
        description: 'Approval rule form',
        fallback: 'commerce-b2b-po-approval-rules-list'
    },
    'commerce-b2b-po-approval-rule-details': {
        url: '/customer/approval-rules',
        selector: '.approval-rule-details, [data-testid="approval-rule-details"]',
        waitFor: 'div',
        description: 'Approval rule details',
        fallback: 'commerce-b2b-po-approval-rules-list'
    },
    'commerce-b2b-po-approval-flow': {
        url: '/customer/purchase-orders',
        selector: '.approval-flow, [data-testid="approval-flow"]',
        waitFor: 'div',
        description: 'Purchase order approval flow',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },

    // Purchase Orders - Checkout
    'commerce-b2b-po-checkout-success': {
        url: '/customer/purchase-orders',
        selector: '.checkout-success, [data-testid="checkout-success"]',
        waitFor: 'div',
        description: 'Purchase order checkout success',
        fallback: 'commerce-b2b-po-customer-purchase-orders'
    },

    // Company Management
    'commerce-account-nav': {
        url: '/customer/account',
        selector: '.account-nav, nav',
        waitFor: 'nav',
        description: 'B2B account navigation'
    },
    'commerce-customer-company': {
        url: '/customer/account',
        selector: '.customer-company, [data-testid="customer-company"]',
        waitFor: 'div',
        description: 'Customer company information'
    },
    'commerce-company-accept-invitation': {
        url: '/customer/company/accept-invitation',
        selector: '.accept-invitation, form',
        waitFor: 'form',
        description: 'Company invitation acceptance form'
    },
    'commerce-company-create': {
        url: '/customer/company/create',
        selector: '.company-create, form',
        waitFor: 'form',
        description: 'Create company form'
    },
    'commerce-company-credit': {
        url: '/customer/company/credit',
        selector: '.company-credit, [data-testid="company-credit"]',
        waitFor: 'div',
        description: 'Company credit history'
    },
    'commerce-company-profile': {
        url: '/customer/company',
        selector: '.company-profile, [data-testid="company-profile"]',
        waitFor: 'div',
        description: 'Company profile information'
    },
    'commerce-company-roles-permissions': {
        url: '/customer/company/roles',
        selector: '.roles-permissions, [data-testid="roles-permissions"], table',
        waitFor: 'table',
        description: 'Company roles and permissions'
    },
    'commerce-company-structure': {
        url: '/customer/company/structure',
        selector: '.company-structure, [data-testid="company-structure"]',
        waitFor: 'div',
        description: 'Company organizational structure'
    },
    'commerce-company-users': {
        url: '/customer/company/users',
        selector: '.company-users, [data-testid="company-users"], table',
        waitFor: 'table',
        description: 'Company users listing'
    }
};

/**
 * Check if already logged in
 */
async function checkIfLoggedIn(page) {
    await page.goto(`${CONFIG.baseUrl}/customer/account`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // If we're on account page and see user name, we're logged in
    const isLoggedIn = page.url().includes('/customer/account') &&
        !page.url().includes('/customer/login');

    return isLoggedIn;
}

/**
 * Login to B2B site
 */
async function login(page) {
    console.log('🔐 Logging in...');

    // Navigate to login page
    await page.goto(`${CONFIG.baseUrl}/customer/login`);

    // Wait for page to fully load including network requests
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Extra wait for drop-ins to initialize

    // Check if already logged in (redirected to account page)
    if (page.url().includes('/customer/account')) {
        console.log('✅ Already logged in');
        return;
    }

    console.log('   Filling login form via JavaScript...');

    // Use JavaScript to completely bypass Playwright's visibility checks
    const loginResult = await page.evaluate(({ username, password }) => {
        // Find email and password inputs
        const emailInput = document.querySelector('input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const submitButton = document.querySelector('button[type="submit"]');

        if (!emailInput || !passwordInput) {
            return { success: false, error: 'Login form fields not found' };
        }

        // Fill fields
        emailInput.value = username;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));

        passwordInput.value = password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

        // Click submit
        if (submitButton) {
            submitButton.click();
            return { success: true };
        }

        return { success: false, error: 'Submit button not found' };
    }, { username: CONFIG.credentials.username, password: CONFIG.credentials.password });

    if (!loginResult.success) {
        throw new Error(`Login form interaction failed: ${loginResult.error}`);
    }

    console.log('   Waiting for login to complete...');

    // Wait for navigation or error message
    try {
        await page.waitForURL(/customer\/(account|negotiable-quote|purchase-orders)/, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
        console.log('✅ Logged in successfully');
    } catch (error) {
        // Check for error message on page
        const errorText = await page.evaluate(() => {
            const errorEl = document.querySelector('.error, .message-error, [role="alert"]');
            return errorEl ? errorEl.textContent : null;
        });

        if (errorText) {
            throw new Error(`Login failed: ${errorText}`);
        }

        throw new Error('Login timeout - credentials may be incorrect or page issue');
    }
}

/**
 * Convert PNG to WebP
 */
async function convertToWebP(pngPath, webpPath) {
    await sharp(pngPath)
        .webp({ quality: 90, lossless: false })
        .toFile(webpPath);
}

/**
 * Capture screenshot for a specific block
 */
async function captureBlock(page, blockName, config) {
    console.log(`\n📸 Capturing: ${blockName}`);
    console.log(`   Description: ${config.description}`);
    console.log(`   URL: ${config.url}`);

    // Navigate to page
    await page.goto(`${CONFIG.baseUrl}${config.url}`);
    await page.waitForLoadState('networkidle');

    // Wait for content
    try {
        await page.waitForSelector(config.waitFor, { timeout: 5000 });
    } catch (error) {
        console.log(`   ⚠️  Wait selector not found, continuing...`);
    }

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Force hidden elements to be visible using JavaScript DOM manipulation
    await page.evaluate(() => {
        // Remove hidden attributes
        document.querySelectorAll('[hidden]').forEach(el => el.removeAttribute('hidden'));

        // Override inline styles that hide elements
        document.querySelectorAll('*').forEach(el => {
            const style = el.style;
            if (style.display === 'none') style.display = '';
            if (style.visibility === 'hidden') style.visibility = 'visible';
            if (style.opacity === '0') style.opacity = '1';
        });

        // Remove hidden classes
        document.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
    });

    // Wait for any dynamic content to render after forcing visibility
    await page.waitForTimeout(1000);

    console.log(`   🎨 Forced hidden elements visible via DOM manipulation`);

    // Try to find the specific selector
    let element;

    // FIRST: Try the most reliable selector - data-block-name attribute
    const dataBlockSelector = `[data-block-name="${blockName}"]`;
    try {
        element = await page.locator(dataBlockSelector).first();
        if (await element.count() > 0) {
            console.log(`   ✓ Found via data-block-name: ${blockName}`);
        } else {
            element = null;
        }
    } catch (error) {
        element = null;
    }

    // SECOND: Try configured selectors if data-block-name didn't work
    if (!element) {
        const selectors = config.selector.split(',').map(s => s.trim());
        for (const selector of selectors) {
            try {
                element = await page.locator(selector).first();
                const count = await element.count();
                if (count > 0) {
                    console.log(`   ✓ Found selector: ${selector}`);
                    break;
                }
            } catch (error) {
                continue;
            }
        }
    }

    // Fallback: Try to find by common classnames or component patterns
    if (!element || await element.count() === 0) {
        console.log(`   ⚠️  Primary selectors not found, trying fallback patterns...`);

        // Extract key terms from block name for intelligent fallback
        const blockKey = blockName.replace('commerce-b2b-', '').replace(/-/g, '_');
        const fallbackSelectors = [
            `[class*="${blockKey}"]`,
            `[data-block="${blockKey}"]`,
            `[id*="${blockKey}"]`,
            '.dropin-container',
            '[class*="dropin"]'
        ];

        for (const fallbackSelector of fallbackSelectors) {
            try {
                const fallbackElement = await page.locator(fallbackSelector).first();
                if (await fallbackElement.count() > 0) {
                    console.log(`   ✓ Found via fallback: ${fallbackSelector}`);
                    element = fallbackElement;
                    break;
                }
            } catch (error) {
                continue;
            }
        }
    }

    // If still not found, use configured fallback
    if (!element || await element.count() === 0) {
        if (config.fallback) {
            console.log(`   ⚠️  No selectors found, using fallback: ${config.fallback}`);
            return config.fallback;
        }

        // Last resort: screenshot the main content area
        console.log(`   ⚠️  No selectors found, capturing main content`);
        element = page.locator('main, .main-content, [role="main"]').first();
    }

    // Take screenshot
    const tempPngPath = path.join(CONFIG.tempDir, `${blockName}.png`);
    const finalWebpPath = path.join(CONFIG.outputDir, `${blockName}.webp`);

    try {
        // Try element screenshot first with shorter timeout
        await element.screenshot({ path: tempPngPath, timeout: 5000 });
        console.log(`   → PNG saved: ${tempPngPath}`);
    } catch (error) {
        // If element screenshot fails, capture main content area
        console.log(`   ⚠️  Element screenshot failed, capturing main content`);
        try {
            const mainContent = page.locator('main').first();
            await mainContent.screenshot({ path: tempPngPath, timeout: 5000 });
            console.log(`   → PNG saved (main content): ${tempPngPath}`);
        } catch (mainError) {
            // Last resort: full viewport screenshot
            console.log(`   ⚠️  Main content failed, capturing viewport`);
            await page.screenshot({ path: tempPngPath, fullPage: false });
            console.log(`   → PNG saved (viewport): ${tempPngPath}`);
        }
    }

    // Convert to WebP with size constraints
    let image = sharp(tempPngPath);
    const metadata = await image.metadata();

    console.log(`   📐 Original: ${metadata.width}x${metadata.height}`);

    // Enforce max dimensions while maintaining aspect ratio
    let resizeOptions = { fit: 'inside', withoutEnlargement: true };

    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
        resizeOptions.width = CONFIG.maxWidth;
        resizeOptions.height = CONFIG.maxHeight;
        console.log(`   📐 Resizing to fit within ${CONFIG.maxWidth}x${CONFIG.maxHeight}`);
        image = image.resize(resizeOptions);
    }

    await image.webp({ quality: 90, lossless: false }).toFile(finalWebpPath);

    // Get final dimensions
    const finalMetadata = await sharp(finalWebpPath).metadata();
    console.log(`   ✅ WebP saved: ${finalWebpPath} (${finalMetadata.width}x${finalMetadata.height})`);

    // Clean up temp PNG
    fs.unlinkSync(tempPngPath);

    return null; // Success
}

/**
 * Update MDX file to use new screenshot
 */
function updateMdxFile(blockName, screenshotName) {
    const mdxPath = path.join(__dirname, '..', 'src', 'content', 'docs', 'merchants', 'blocks', `${blockName}.mdx`);

    if (!fs.existsSync(mdxPath)) {
        console.log(`   ⚠️  MDX file not found: ${blockName}.mdx`);
        return false;
    }

    let content = fs.readFileSync(mdxPath, 'utf-8');

    // Replace image path
    const oldPattern = /!\[([^\]]*)\]\(\/images\/[^)]+\.(png|webp)\)/g;
    const newPath = `/images/${screenshotName}.webp`;

    content = content.replace(oldPattern, `![$1](${newPath})`);

    fs.writeFileSync(mdxPath, content, 'utf-8');
    console.log(`   ✅ Updated MDX: ${blockName}.mdx`);

    return true;
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 B2B Commerce Block Screenshot Capture\n');
    console.log(`Configuration:`);
    console.log(`  Base URL: ${CONFIG.baseUrl}`);
    console.log(`  Viewport: ${CONFIG.viewport.width}x${CONFIG.viewport.height} @ ${CONFIG.deviceScaleFactor}x`);
    console.log(`  Format: WebP (quality 90)`);
    console.log(`  Output: ${CONFIG.outputDir}\n`);

    // Parse command line arguments
    const args = process.argv.slice(2);
    const specificBlock = args.includes('--block') ? args[args.indexOf('--block') + 1] : null;

    // Create temp directory
    if (!fs.existsSync(CONFIG.tempDir)) {
        fs.mkdirSync(CONFIG.tempDir, { recursive: true });
    }

    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Launch browser (headed mode to ensure drop-ins render properly)
    const browser = await chromium.launch({ headless: false });

    // Try to load saved authentication state
    let contextOptions = {
        viewport: CONFIG.viewport,
        deviceScaleFactor: CONFIG.deviceScaleFactor
    };

    if (fs.existsSync(CONFIG.storageStatePath)) {
        console.log('📦 Using saved authentication state');
        contextOptions.storageState = CONFIG.storageStatePath;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
        // Verify authentication
        const isLoggedIn = await checkIfLoggedIn(page);

        if (!isLoggedIn) {
            console.log('❌ Not logged in! Please run: node scripts/save-auth-state.js');
            console.log('   The authentication state has expired or was not saved.\n');
            process.exit(1);
        }

        console.log('✅ Authenticated successfully\n');

        // Determine which blocks to capture
        const blocksToCapture = specificBlock
            ? { [specificBlock]: BLOCKS[specificBlock] }
            : BLOCKS;

        if (specificBlock && !BLOCKS[specificBlock]) {
            throw new Error(`Block "${specificBlock}" not found in BLOCKS configuration`);
        }

        const total = Object.keys(blocksToCapture).length;
        let current = 0;
        const fallbackMap = new Map(); // Track which blocks use fallbacks

        console.log(`\n📊 Capturing ${total} block(s)...\n`);

        // Capture each block
        for (const [blockName, config] of Object.entries(blocksToCapture)) {
            current++;
            console.log(`[${current}/${total}]`);

            const fallback = await captureBlock(page, blockName, config);

            if (fallback) {
                fallbackMap.set(blockName, fallback);
            } else {
                // Update MDX file
                updateMdxFile(blockName, blockName);
            }
        }

        // Handle fallbacks - copy screenshots
        if (fallbackMap.size > 0) {
            console.log(`\n📋 Processing fallbacks...`);
            for (const [blockName, fallbackName] of fallbackMap.entries()) {
                const fallbackPath = path.join(CONFIG.outputDir, `${fallbackName}.webp`);
                const targetPath = path.join(CONFIG.outputDir, `${blockName}.webp`);

                if (fs.existsSync(fallbackPath)) {
                    fs.copyFileSync(fallbackPath, targetPath);
                    console.log(`   ✅ ${blockName}.webp ← copied from ${fallbackName}.webp`);
                    updateMdxFile(blockName, blockName);
                } else {
                    console.log(`   ⚠️  Fallback not found: ${fallbackName}.webp`);
                }
            }
        }

        console.log(`\n✨ Done! Captured ${total} block screenshot(s)`);
        console.log(`📁 Screenshots saved to: ${CONFIG.outputDir}`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await browser.close();

        // Clean up temp directory
        if (fs.existsSync(CONFIG.tempDir)) {
            fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { main, BLOCKS, CONFIG };

