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
import { join, resolve } from 'path';
import { execFileSync } from 'child_process';
import { REFERENCE_REPOS } from './lib/dropin-config.js';
import { getProjectRoot } from './lib/generator-core.js';

const projectRoot = getProjectRoot();
const tempReposDir = join(projectRoot, '.temp-repos');

console.log('🚀 Setting up reference repositories...');
console.log('');

for (const [repoKey, config] of Object.entries(REFERENCE_REPOS)) {
    // SECURITY: Validate repoKey to prevent path traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(repoKey)) {
        console.error(`❌ Invalid repo key: ${repoKey}`);
        continue;
    }

    const repoPath = join(tempReposDir, repoKey);

    // SECURITY: Ensure repoPath is within tempReposDir
    const resolvedPath = resolve(repoPath);
    if (!resolvedPath.startsWith(resolve(tempReposDir))) {
        console.error(`❌ Path traversal detected for: ${repoKey}`);
        continue;
    }

    // SECURITY: Validate gitUrl format
    const gitUrlPattern = /^(git@github\.com:|https:\/\/github\.com\/)[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\.git$/;
    if (!gitUrlPattern.test(config.gitUrl)) {
        console.error(`❌ Invalid git URL format: ${config.gitUrl}`);
        continue;
    }

    if (existsSync(repoPath)) {
        console.log(`✅ ${config.displayName} already exists`);
        console.log(`   Updating...`);
        try {
            // SECURITY: execFileSync is safe - no shell interpolation
            execFileSync('git', ['pull'], { cwd: repoPath, stdio: 'inherit' });
        } catch (error) {
            console.log(`   ⚠️  Could not update (may be detached HEAD, skipping)`);
        }
    } else {
        console.log(`📥 Cloning ${config.displayName}...`);
        console.log(`   ${config.description}`);
        try {
            // SECURITY: Use execFileSync with argument array - prevents command injection
            execFileSync('git', ['clone', config.gitUrl, repoPath], { stdio: 'inherit' });
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
