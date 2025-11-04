#!/usr/bin/env node

/**
 * URL Verification Script for Enrichment Files
 * 
 * This script extracts and verifies all URLs in enrichment files
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

/**
 * Extract URLs from text
 */
function extractUrls(text) {
    const urlRegex = /https?:\/\/[^\s\])\'"]+/g;
    return text.match(urlRegex) || [];
}

/**
 * Check if URL is accessible
 */
async function checkUrl(url) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;

        const req = protocol.get(url, { timeout: 10000 }, (res) => {
            // Consider redirects as success
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ url, status: res.statusCode, ok: true });
            } else {
                resolve({ url, status: res.statusCode, ok: false });
            }
        });

        req.on('error', (error) => {
            resolve({ url, status: 0, ok: false, error: error.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ url, status: 0, ok: false, error: 'Timeout' });
        });
    });
}

/**
 * Load all enrichment files and extract URLs
 */
function loadEnrichmentsAndUrls() {
    const enrichmentDir = join(projectRoot, '_dropin-enrichments');
    const dropins = readdirSync(enrichmentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !name.startsWith('.') && !name.startsWith('_'));

    const urlMap = new Map(); // url -> [{dropin, file, occurrences}]

    for (const dropin of dropins) {
        const functionsPath = join(enrichmentDir, dropin, 'functions.json');
        try {
            const content = readFileSync(functionsPath, 'utf-8');
            const urls = extractUrls(content);

            for (const url of urls) {
                if (!urlMap.has(url)) {
                    urlMap.set(url, []);
                }
                urlMap.get(url).push({
                    dropin,
                    file: 'functions.json',
                    occurrences: (content.match(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
                });
            }
        } catch (error) {
            // Skip if file doesn't exist
        }
    }

    return urlMap;
}

/**
 * Main verification function
 */
async function verifyLinks() {
    console.log(`${colors.cyan}🔍 Verifying URLs in Enrichment Files${colors.reset}\n`);

    const urlMap = loadEnrichmentsAndUrls();
    const uniqueUrls = Array.from(urlMap.keys());

    console.log(`Found ${uniqueUrls.length} unique URLs to verify...\n`);

    const results = [];

    // Check each URL
    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        process.stdout.write(`\rChecking ${i + 1}/${uniqueUrls.length}... ${colors.gray}${url.substring(0, 60)}...${colors.reset}`);

        const result = await checkUrl(url);
        results.push({
            ...result,
            locations: urlMap.get(url)
        });

        // Rate limit to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    process.stdout.write('\r' + ' '.repeat(100) + '\r'); // Clear line

    // Print results
    const broken = results.filter(r => !r.ok);
    const working = results.filter(r => r.ok);

    console.log(`${colors.green}✓ Working URLs: ${working.length}${colors.reset}`);
    console.log(`${colors.red}✗ Broken URLs: ${broken.length}${colors.reset}\n`);

    if (broken.length > 0) {
        console.log(`${colors.red}Broken URLs:${colors.reset}\n`);
        for (const item of broken) {
            console.log(`${colors.red}✗${colors.reset} ${item.url}`);
            console.log(`  Status: ${item.status || 'Error'} ${item.error ? `(${item.error})` : ''}`);
            console.log(`  Found in:`);
            for (const loc of item.locations) {
                console.log(`    - ${colors.cyan}${loc.dropin}/${loc.file}${colors.reset} (${loc.occurrences} occurrence${loc.occurrences > 1 ? 's' : ''})`);
            }
            console.log();
        }
    }

    if (working.length > 0 && broken.length === 0) {
        console.log(`${colors.green}🎉 All URLs are working!${colors.reset}`);
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Total URLs checked: ${uniqueUrls.length}`);
    console.log(`${colors.green}Working: ${working.length}${colors.reset}`);
    console.log(`${colors.red}Broken: ${broken.length}${colors.reset}`);
    console.log(`${'='.repeat(60)}\n`);

    return broken.length === 0;
}

// Run verification
verifyLinks().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
});

