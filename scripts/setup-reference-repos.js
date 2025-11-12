#!/usr/bin/env node

/**
 * Setup Reference Repositories
 * 
 * This script clones the reference repositories used for documentation enrichment:
 * - dropin-template: Official template with examples
 * - StorefrontSDK: Core SDK with utilities and types
 * - storefront-tools: Development tools
 * 
 * Usage: node scripts/setup-reference-repos.js
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { REFERENCE_REPOS } from './lib/dropin-config.js';
import { getProjectRoot } from './lib/generator-core.js';

const projectRoot = getProjectRoot();
const tempReposDir = join(projectRoot, '.temp-repos');

console.log('🚀 Setting up reference repositories...');
console.log('');

for (const [repoKey, config] of Object.entries(REFERENCE_REPOS)) {
    const repoPath = join(tempReposDir, repoKey);

    if (existsSync(repoPath)) {
        console.log(`✅ ${config.displayName} already exists`);
        console.log(`   Updating...`);
        try {
            execSync('git pull', { cwd: repoPath, stdio: 'inherit' });
        } catch (error) {
            console.log(`   ⚠️  Could not update (may be detached HEAD, skipping)`);
        }
    } else {
        console.log(`📥 Cloning ${config.displayName}...`);
        console.log(`   ${config.description}`);
        try {
            execSync(`git clone ${config.gitUrl} ${repoPath}`, { stdio: 'inherit' });
            console.log(`   ✅ Cloned successfully`);
        } catch (error) {
            console.log(`   ❌ Failed to clone`);
            console.error(error.message);
        }
    }
    console.log('');
}

console.log('✨ Reference repositories setup complete!');
console.log('');
console.log('These repositories will be used for:');
console.log('  • Extracting usage examples');
console.log('  • Providing context for enrichments');
console.log('  • Reference documentation');

