#!/usr/bin/env node

/**
 * Manual Login Helper - Save Authentication State
 * 
 * This script opens a browser for you to manually log in to the B2B site.
 * After you log in, it saves the authentication cookies/storage.
 * The capture-b2b-screenshots.js script will then reuse this auth state.
 * 
 * Usage:
 *   node scripts/save-auth-state.js
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    baseUrl: 'https://b2b-suite-release1--boilerplate-b2b-accs-qa--adobe-commerce.aem.live',
    loginUrl: '/customer/login',
    tempDir: path.join(__dirname, '..', '.temp-screenshots'),
    storageStatePath: path.join(__dirname, '..', '.temp-screenshots', 'auth-state.json')
};

async function main() {
    console.log('🔐 B2B Authentication State Saver\n');
    console.log('This script will open a browser for you to manually log in.');
    console.log('After you log in successfully, the authentication will be saved.\n');
    console.log('Instructions:');
    console.log('1. Browser will open to the login page');
    console.log('2. Log in with your credentials');
    console.log('3. Navigate to any customer page (orders, quotes, etc.)');
    console.log('4. Press ENTER in this terminal when done\n');

    // Create temp directory
    if (!fs.existsSync(CONFIG.tempDir)) {
        fs.mkdirSync(CONFIG.tempDir, { recursive: true });
    }

    // Launch browser in headed mode
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Navigate to login page
    await page.goto(`${CONFIG.baseUrl}${CONFIG.loginUrl}`);

    console.log('🌐 Browser opened at:', page.url());
    console.log('\n⏳ Waiting for you to log in...');
    console.log('   (Press ENTER in this terminal when you\'re logged in)\n');

    // Wait for user input
    await new Promise(resolve => {
        process.stdin.once('data', resolve);
    });

    // Save authentication state
    await context.storageState({ path: CONFIG.storageStatePath });

    console.log('\n✅ Authentication state saved to:', CONFIG.storageStatePath);
    console.log('\n📸 You can now run the screenshot capture script:');
    console.log('   node scripts/capture-b2b-screenshots.js\n');

    await browser.close();
}

main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});

