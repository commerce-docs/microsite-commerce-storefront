#!/usr/bin/env node

/**
 * Quick Link Verification Script
 * 
 * A lightweight wrapper around verify-enrichment-links.js for use in workflows
 * and as a standalone command.
 * 
 * USAGE:
 * - node scripts/verify-links.js
 * - npm run verify-links (if added to package.json)
 */

import { execSync } from 'child_process';

console.log('🔗 Verifying enrichment file links...\n');

try {
    execSync('node scripts/verify-enrichment-links.js', {
        stdio: 'inherit'
    });
    process.exit(0);
} catch (error) {
    console.error('\n❌ Link verification failed!');
    console.error('Please fix broken links in enrichment files before generating docs.\n');
    process.exit(1);
}

