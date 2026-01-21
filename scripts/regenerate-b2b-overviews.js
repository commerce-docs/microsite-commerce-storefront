#!/usr/bin/env node

/**
 * Regenerate B2B Drop-in Overview Pages
 * 
 * This script regenerates all B2B drop-in overview pages (index.mdx) from the
 * improved template (_dropin-templates/dropin-overview-minimal.mdx).
 * 
 * WHAT IT DOES:
 *   1. Deletes existing root index.mdx files (NOT container overviews)
 *   2. Bootstraps all B2B drop-ins to create new overview pages
 *   3. Runs generate-b2b-docs to regenerate all other documentation
 * 
 * USAGE:
 *   node scripts/regenerate-b2b-overviews.js
 *   
 * SAFETY:
 *   - Only deletes root index.mdx files, not containers/index.mdx
 *   - Creates backups before deletion (timestamped)
 *   - Provides clear output at each step
 */

import { existsSync, unlinkSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ============================================================================
// CONFIGURATION
// ============================================================================

const B2B_DROPINS = [
    'company-management',
    'company-switcher',
    'purchase-order',
    'quote-management',
    'requisition-list'
];

const B2B_BASE_PATH = 'src/content/docs/dropins-b2b';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(emoji, message) {
    console.log(`${emoji} ${message}`);
}

function header(text) {
    console.log('\n' + '='.repeat(70));
    console.log(`  ${text}`);
    console.log('='.repeat(70) + '\n');
}

// ============================================================================
// MAIN LOGIC
// ============================================================================

function createBackupDirectory() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupDir = join(projectRoot, '.backups', `b2b-overviews-${timestamp}`);

    if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true });
    }

    return backupDir;
}

function backupAndDeleteOverviews() {
    header('STEP 1: Backup and Delete Existing Overview Files');

    const backupDir = createBackupDirectory();
    log('📁', `Backup directory: ${backupDir}`);

    let deletedCount = 0;
    let skippedCount = 0;

    for (const dropin of B2B_DROPINS) {
        const indexPath = join(projectRoot, B2B_BASE_PATH, dropin, 'index.mdx');

        if (existsSync(indexPath)) {
            // Backup first
            const backupPath = join(backupDir, `${dropin}-index.mdx`);
            copyFileSync(indexPath, backupPath);
            log('💾', `Backed up: ${dropin}/index.mdx`);

            // Delete
            unlinkSync(indexPath);
            log('🗑️ ', `Deleted:   ${dropin}/index.mdx`);
            deletedCount++;
        } else {
            log('⚠️ ', `Not found: ${dropin}/index.mdx (will be created)`);
            skippedCount++;
        }
    }

    console.log(`\n📊 Summary: ${deletedCount} deleted, ${skippedCount} skipped (didn't exist)`);
}

function bootstrapAllDropins() {
    header('STEP 2: Bootstrap All B2B Drop-ins');

    log('🔧', 'Running bootstrap script for each drop-in...\n');

    for (const dropin of B2B_DROPINS) {
        console.log(`\n${'─'.repeat(70)}`);
        log('📦', `Bootstrapping: ${dropin}`);
        console.log('─'.repeat(70));

        try {
            execSync(`npm run bootstrap-b2b-dropin ${dropin}`, {
                stdio: 'inherit',
                cwd: projectRoot
            });
        } catch (error) {
            log('❌', `Failed to bootstrap ${dropin}`);
            console.error(error.message);
        }
    }

    log('✅', '\nAll drop-ins bootstrapped!');
}

function regenerateDocumentation() {
    header('STEP 3: Regenerate All B2B Documentation');

    log('🔄', 'Running generate-b2b-docs (this takes ~8-12 minutes)...\n');

    try {
        execSync('npm run generate-b2b-docs', {
            stdio: 'inherit',
            cwd: projectRoot
        });
    } catch (error) {
        log('❌', 'Failed to regenerate documentation');
        console.error(error.message);
        process.exit(1);
    }
}

function showResults() {
    header('COMPLETE!');

    log('✨', 'All B2B drop-in overview pages have been regenerated!');
    log('📝', 'Next Steps:\n');

    console.log('   1. Edit each overview page to complete the placeholders:');
    for (const dropin of B2B_DROPINS) {
        console.log(`      • ${B2B_BASE_PATH}/${dropin}/index.mdx`);
    }

    console.log('\n   2. For each overview, update:');
    console.log('      • Drop-in description (what it does, key capabilities)');
    console.log('      • Supported features table (all Adobe Commerce features)');
    console.log('      • Section descriptions (for each documentation section)');

    console.log('\n   3. Test the build:');
    console.log('      pnpm build:prod-fast');

    console.log('\n   4. Backups are available in:');
    console.log(`      .backups/b2b-overviews-*/\n`);
}

// ============================================================================
// EXECUTION
// ============================================================================

async function main() {
    console.log('\n');
    header('B2B Drop-in Overview Regeneration');

    log('📋', `Processing ${B2B_DROPINS.length} B2B drop-ins:`);
    B2B_DROPINS.forEach(dropin => console.log(`     • ${dropin}`));

    console.log('\n⚠️  This will:');
    console.log('   • Backup existing overview files');
    console.log('   • Delete and recreate all overview pages');
    console.log('   • Regenerate ALL B2B documentation (~8-12 minutes)');

    console.log('\n⏸️  Starting in 5 seconds... (Press Ctrl+C to cancel)\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Execute steps
    backupAndDeleteOverviews();
    bootstrapAllDropins();
    regenerateDocumentation();
    showResults();
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});

