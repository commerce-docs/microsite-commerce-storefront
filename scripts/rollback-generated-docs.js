#!/usr/bin/env node

/**
 * Rollback Generated Documentation
 * 
 * This script restores all auto-generated documentation files to their last committed state.
 * Useful for testing generators with a clean slate.
 * 
 * USAGE:
 * npm run rollback-docs
 * 
 * WHAT IT DOES:
 * - Restores modified/deleted files in src/content/docs/dropins/
 * - Restores modified/deleted files in src/content/docs/dropins-b2b/
 * - Removes untracked (new) files in these directories
 * - Shows what files were restored/removed
 * 
 * SAFETY:
 * - Only affects files in dropins directories
 * - Uses git restore for tracked files
 * - Uses git clean for untracked files
 * - Does not affect other parts of the codebase
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Paths containing auto-generated documentation
const GENERATED_PATHS = [
    'src/content/docs/dropins',
    'src/content/docs/dropins-b2b'
];

console.log('\n🔄 Rolling back generated documentation...\n');

let totalRestored = 0;
let totalDeleted = 0;

for (const path of GENERATED_PATHS) {
    const fullPath = join(projectRoot, path);

    if (!existsSync(fullPath)) {
        console.log(`  ⚠️  Path does not exist: ${path}`);
        continue;
    }

    try {
        // Check if there are any changes to restore or untracked files to delete
        const statusOutput = execSync(`git status --porcelain ${path}`, {
            encoding: 'utf8',
            cwd: projectRoot
        });

        if (statusOutput.trim()) {
            console.log(`  📂 ${path}`);

            const modifiedFiles = [];
            const untrackedFiles = [];

            // Parse status and categorize files
            const changedFiles = statusOutput.trim().split('\n');
            changedFiles.forEach(file => {
                const [status, ...fileParts] = file.trim().split(/\s+/);
                const fileName = fileParts.join(' ');

                if (status.includes('M')) {
                    console.log(`     ↩️  Restoring modified: ${fileName}`);
                    modifiedFiles.push(fileName);
                    totalRestored++;
                } else if (status.includes('D')) {
                    console.log(`     ↩️  Restoring deleted: ${fileName}`);
                    modifiedFiles.push(fileName);
                    totalRestored++;
                } else if (status.includes('?')) {
                    console.log(`     🗑️  Removing untracked: ${fileName}`);
                    untrackedFiles.push(fileName);
                    totalDeleted++;
                }
            });

            // Restore tracked files that were modified/deleted
            if (modifiedFiles.length > 0) {
                execSync(`git restore ${path}`, {
                    cwd: projectRoot,
                    stdio: 'pipe'
                });
            }

            // Remove untracked files
            if (untrackedFiles.length > 0) {
                execSync(`git clean -f ${path}`, {
                    cwd: projectRoot,
                    stdio: 'pipe'
                });
            }
        } else {
            console.log(`  ✓ ${path} (no changes)`);
        }
    } catch (error) {
        console.error(`  ❌ Error processing ${path}: ${error.message}`);
    }
}

const totalChanges = totalRestored + totalDeleted;

if (totalChanges > 0) {
    const messages = [];
    if (totalRestored > 0) messages.push(`${totalRestored} file(s) restored`);
    if (totalDeleted > 0) messages.push(`${totalDeleted} untracked file(s) removed`);
    console.log(`\n✅ ${messages.join(', ')}.\n`);
} else {
    console.log('\n✓ All generated documentation is already clean.\n');
}

console.log('💡 Tip: You can now regenerate documentation with a clean slate:');
console.log('   npm run generate-all-docs\n');

