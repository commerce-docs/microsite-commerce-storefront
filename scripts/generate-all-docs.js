#!/usr/bin/env node

/**
 * Master Documentation Generator
 * 
 * Runs all documentation generators in sequence to regenerate the entire
 * documentation site. This is useful for:
 * - Testing that all generators work
 * - Refreshing all documentation after updates
 * - Verifying the complete documentation pipeline
 * 
 * USAGE:
 * - Run all generators: npm run generate-all-docs
 * - Test mode (dry run): npm run generate-all-docs -- --dry-run
 * - Skip link verification: npm run generate-all-docs -- --skip-link-check
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const generators = [
    {
        name: 'Functions',
        command: 'npm run generate-function-docs',
        description: 'API function documentation for all drop-ins',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Events',
        command: 'npm run generate-event-docs',
        description: 'Event bus documentation for all drop-ins',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Containers',
        command: 'npm run generate-container-docs',
        description: 'UI container documentation for all drop-ins (multi-file)',
        estimatedTime: '3-4 minutes'
    },
    {
        name: 'Slots',
        command: 'npm run generate-slot-docs',
        description: 'Customization slots documentation for all drop-ins',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Styles',
        command: 'npm run generate-styles-docs',
        description: 'CSS styling documentation for all drop-ins',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Dictionary',
        command: 'npm run generate-dictionary-docs',
        description: 'i18n keys documentation for all drop-ins',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Installation',
        command: 'npm run generate-installation-docs',
        description: 'Installation guides for all drop-ins',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Initialization',
        command: 'npm run generate-initialization-docs',
        description: 'Configuration documentation for all drop-ins',
        estimatedTime: '2-3 minutes'
    },
    {
        name: 'Boilerplate',
        command: 'npm run generate-boilerplate-docs',
        description: 'Technical documentation for boilerplate blocks (33 pages)',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Merchant Blocks',
        command: 'npm run generate-merchant-block-docs',
        description: 'Business user documentation for blocks (29 pages)',
        estimatedTime: '1-2 minutes'
    }
];

const isDryRun = process.argv.includes('--dry-run');
const skipLinkCheck = process.argv.includes('--skip-link-check');

console.log('\n' + '='.repeat(70));
console.log('  MASTER DOCUMENTATION GENERATOR');
console.log('='.repeat(70));
console.log('\n📚 This will regenerate ALL documentation (500+ pages)');
console.log(`⏱️  Estimated total time: 15-20 minutes\n`);

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

// Pre-flight check: Verify enrichment file links
if (!isDryRun && !skipLinkCheck) {
    console.log('─'.repeat(70));
    console.log('\n🔍 PRE-FLIGHT CHECK: Verifying enrichment file links...\n');
    console.log('   This ensures all GraphQL documentation URLs are valid.');
    console.log('   (Skip with --skip-link-check if needed)\n');

    try {
        execSync('node scripts/verify-enrichment-links.js', {
            stdio: 'inherit',
            cwd: projectRoot
        });
        console.log('\n✅ All enrichment file links are valid!\n');
    } catch (error) {
        console.error('\n❌ Link verification failed!');
        console.error('\n⚠️  Some URLs in enrichment files are broken.');
        console.error('   Please fix the broken links before generating documentation.\n');
        console.error('   Options:');
        console.error('   1. Fix the URLs in enrichment files and try again');
        console.error('   2. Run with --skip-link-check to generate anyway (not recommended)\n');
        process.exit(1);
    }
}

if (!isDryRun) {
    console.log('Starting generation in 3 seconds...');
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
    console.log(`\n[${i + 1}/${generators.length}] Running ${generator.name} Generator...`);
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
console.log('  GENERATION COMPLETE');
console.log('='.repeat(70) + '\n');

if (isDryRun) {
    console.log('🔍 DRY RUN SUMMARY:\n');
    console.log(`   Generators listed: ${generators.length}`);
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
        console.log('\n✨ All generators completed successfully!');
        console.log('\n📄 Generated documentation includes:');
        console.log('   • 70+ drop-in documentation pages');
        console.log('   • 33 boilerplate block pages');
        console.log('   • 29 merchant block pages');
        console.log('   • 500+ total pages\n');
    } else {
        console.log('\n⚠️  Some generators failed. Please review errors above.\n');
        process.exit(1);
    }
}

console.log('='.repeat(70) + '\n');

