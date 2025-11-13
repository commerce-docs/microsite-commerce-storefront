#!/usr/bin/env node

/**
 * B2B Drop-in Documentation Generator
 * 
 * Runs all documentation generators ONLY for B2B drop-ins, skipping B2C drop-ins.
 * This is much faster than running generate-all-docs which regenerates 500+ pages.
 * 
 * USAGE:
 * - Generate all B2B docs: npm run generate-b2b-docs
 * - Skip link verification: npm run generate-b2b-docs -- --skip-link-check
 * - Dry run: npm run generate-b2b-docs -- --dry-run
 * 
 * B2B drop-ins processed:
 * - Quote Management
 * - Purchase Order
 * - Requisition List
 * - Company Management
 * - Company Switcher
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// B2B-specific generators (skip Boilerplate and Merchant Blocks)
const generators = [
    {
        name: 'Functions',
        command: 'npm run generate-function-docs -- --type=B2B',
        description: 'API function documentation for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    },
    {
        name: 'Events',
        command: 'npm run generate-event-docs -- --type=B2B',
        description: 'Event bus documentation for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    },
    {
        name: 'Containers',
        command: 'npm run generate-container-docs -- --type=B2B',
        description: 'UI container documentation for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    },
    {
        name: 'Slots',
        command: 'npm run generate-slot-docs -- --type=B2B',
        description: 'Customization slots documentation for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    },
    {
        name: 'Styles',
        command: 'npm run generate-styles-docs -- --type=B2B',
        description: 'CSS styling documentation for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    },
    {
        name: 'Dictionary',
        command: 'npm run generate-dictionary-docs -- --type=B2B',
        description: 'i18n keys documentation for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    },
    {
        name: 'Quick Start',
        command: 'npm run generate-quick-start-docs -- --type=B2B',
        description: 'Quick start reference pages for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    },
    {
        name: 'Initialization',
        command: 'npm run generate-initialization-docs -- --type=B2B',
        description: 'Configuration documentation for B2B drop-ins',
        estimatedTime: '30-60 seconds'
    }
];

const isDryRun = process.argv.includes('--dry-run');
const skipLinkCheck = process.argv.includes('--skip-link-check');

console.log('\n' + '='.repeat(70));
console.log('  B2B DROP-IN DOCUMENTATION GENERATOR');
console.log('='.repeat(70));
console.log('\n📚 This will regenerate documentation for B2B drop-ins ONLY');
console.log(`⏱️  Estimated total time: 5-8 minutes\n`);
console.log('B2B drop-ins included:');
console.log('  • Quote Management');
console.log('  • Purchase Order');
console.log('  • Requisition List');
console.log('  • Company Management');
console.log('  • Company Switcher\n');

if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No generators will be executed\n');
}

if (skipLinkCheck) {
    console.log('⚠️  Link verification will be SKIPPED\n');
}

console.log('Generators to run:\n');
generators.forEach((gen, index) => {
    console.log(`  ${index + 1}. ${gen.name}`);
    console.log(`     ${gen.description}`);
    console.log(`     Estimated: ${gen.estimatedTime}\n`);
});

// Pre-flight check: Verify enrichment file links (B2B only)
if (!isDryRun && !skipLinkCheck) {
    console.log('─'.repeat(70));
    console.log('\n🔍 PRE-FLIGHT CHECK: Verifying B2B enrichment file links...\n');
    console.log('   (Skip with --skip-link-check if needed)\n');

    try {
        execSync('node scripts/verify-enrichment-links.js --type=B2B', {
            stdio: 'inherit',
            cwd: projectRoot
        });
        console.log('\n✅ All B2B enrichment file links are valid!\n');
    } catch (error) {
        console.error('\n❌ Link verification failed!');
        console.error('\n⚠️  Some URLs in B2B enrichment files are broken.');
        console.error('   Options:');
        console.error('   1. Fix the URLs and try again');
        console.error('   2. Run with --skip-link-check to generate anyway\n');
        process.exit(1);
    }
}

if (!isDryRun) {
    console.log('Starting B2B generation in 3 seconds...');
    console.log('Press Ctrl+C to cancel\n');

    // Give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 3000));
}

const results = {
    successful: [],
    failed: [],
    skipped: []
};

const startTime = Date.now();

for (let i = 0; i < generators.length; i++) {
    const generator = generators[i];

    console.log('\n' + '─'.repeat(70));
    console.log(`\n[${i + 1}/${generators.length}] Running ${generator.name} Generator (B2B only)...`);
    console.log('─'.repeat(70) + '\n');

    if (isDryRun) {
        console.log(`  Would run: ${generator.command}`);
        results.skipped.push(generator.name);
        continue;
    }

    const genStartTime = Date.now();

    try {
        execSync(generator.command, {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        const duration = ((Date.now() - genStartTime) / 1000).toFixed(1);
        results.successful.push({ name: generator.name, duration });

        console.log(`\n✅ ${generator.name} completed in ${duration}s`);
    } catch (error) {
        results.failed.push(generator.name);
        console.error(`\n❌ ${generator.name} failed!`);
        console.error(`   Error: ${error.message}`);

        // Ask user if they want to continue
        console.log('\n⚠️  Generator failed. Do you want to continue with remaining generators?');
        console.log('   Press Ctrl+C to stop, or wait 5 seconds to continue...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

// Final summary
const totalDuration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

console.log('\n' + '='.repeat(70));
console.log('  B2B GENERATION COMPLETE');
console.log('='.repeat(70) + '\n');

if (isDryRun) {
    console.log('🔍 DRY RUN SUMMARY:\n');
    console.log(`   B2B generators listed: ${generators.length}`);
    console.log(`   All generators are configured correctly\n`);
} else {
    console.log('📊 SUMMARY:\n');
    console.log(`   ✅ Successful: ${results.successful.length}/${generators.length}`);

    if (results.successful.length > 0) {
        console.log('\n   Completed generators:');
        results.successful.forEach(gen => {
            console.log(`      • ${gen.name} (${gen.duration}s)`);
        });
    }

    if (results.failed.length > 0) {
        console.log(`\n   ❌ Failed: ${results.failed.length}`);
        console.log('\n   Failed generators:');
        results.failed.forEach(name => {
            console.log(`      • ${name}`);
        });
    }

    console.log(`\n   ⏱️  Total time: ${totalDuration} minutes`);

    if (results.failed.length === 0) {
        console.log('\n✨ All B2B generators completed successfully!');
        console.log('\n📄 Generated B2B drop-in documentation for:');
        console.log('   • Quote Management');
        console.log('   • Purchase Order');
        console.log('   • Requisition List');
        console.log('   • Company Management');
        console.log('   • Company Switcher\n');
        console.log('📝 Next steps:');
        console.log('   1. Review generated documentation');
        console.log('   2. Add enrichment content for better descriptions');
        console.log('   3. Update sidebar entries in astro.config.mjs');
        console.log('   4. Run npm run build:prod-fast to validate\n');
    } else {
        console.log('\n⚠️  Some generators failed. Please review errors above.\n');
        console.log('💡 Common issues:');
        console.log('   • B2B drop-ins not installed in boilerplate node_modules');
        console.log('   • Missing enrichment files');
        console.log('   • Repository version mismatches\n');
        process.exit(1);
    }
}

console.log('='.repeat(70) + '\n');

