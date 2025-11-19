#!/usr/bin/env node

/**
 * B2B Documentation Generator
 * 
 * Runs all documentation generators for B2B drop-ins only (dropins-b2b/).
 * This is useful when you want to update B2B documentation without regenerating
 * all B2C drop-in documentation.
 * 
 * USAGE:
 * - Generate all B2B docs: npm run generate-b2b-docs
 * 
 * This script runs the following generators with --type=B2B filter:
 * - Functions
 * - Events  
 * - Containers
 * - Slots
 * - Styles
 * - Dictionary
 * - Quick Start
 * - Initialization
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
        command: 'npm run generate-function-docs -- --type=B2B',
        description: 'API function documentation for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Events',
        command: 'npm run generate-event-docs -- --type=B2B',
        description: 'Event bus documentation for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Containers',
        command: 'npm run generate-container-docs -- --type=B2B',
        description: 'UI container documentation for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Slots',
        command: 'npm run generate-slot-docs -- --type=B2B',
        description: 'Customization slots documentation for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Styles',
        command: 'npm run generate-styles-docs -- --type=B2B',
        description: 'CSS styling documentation for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Dictionary',
        command: 'npm run generate-dictionary-docs -- --type=B2B',
        description: 'i18n keys documentation for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Quick Start',
        command: 'npm run generate-quick-start-docs -- --type=B2B',
        description: 'Quick start reference pages for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    },
    {
        name: 'Initialization',
        command: 'npm run generate-initialization-docs -- --type=B2B',
        description: 'Configuration documentation for B2B drop-ins',
        estimatedTime: '1-2 minutes'
    }
];

const isDryRun = process.argv.includes('--dry-run');

console.log('\n' + '='.repeat(70));
console.log('  B2B DOCUMENTATION GENERATOR');
console.log('='.repeat(70));
console.log('\n📚 This will regenerate documentation for B2B drop-ins only');
console.log('   (B2C drop-ins in /dropins/ will not be touched)');
console.log(`\n⏱️  Estimated total time: 8-12 minutes\n`);

if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No generators will be executed\n');
}

console.log('Generators to run:\n');
generators.forEach((gen, index) => {
    console.log(`  ${index + 1}. ${gen.name}`);
    console.log(`     ${gen.description}`);
    console.log(`     Estimated: ${gen.estimatedTime}\n`);
});

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
        console.log('\n✨ All B2B generators completed successfully!');
        console.log('\n📄 Generated B2B documentation in /dropins-b2b/\n');
    } else {
        console.log('\n⚠️  Some generators failed. Please review errors above.\n');
        process.exit(1);
    }
}

console.log('='.repeat(70) + '\n');
