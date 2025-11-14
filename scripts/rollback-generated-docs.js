#!/usr/bin/env node

/**
 * Rollback Generated Documentation
 * 
 * This script reverts all auto-generated documentation files to their
 * original state or deletes them if they were newly created.
 * 
 * USAGE:
 * - Rollback all generated docs: npm run rollback-generated-docs
 * - Rollback specific type: npm run rollback-generated-docs functions
 * - Available types: functions, events, slots, containers, dictionaries, all
 * 
 * ACTIONS:
 * - Restores modified files from git (if they existed before)
 * - Deletes newly created files (not tracked in git)
 * - Shows summary of all changes rolled back
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

// Define patterns for generated files
const GENERATED_FILE_PATTERNS = {
    functions: 'src/content/docs/dropins/*/functions.mdx',
    events: 'src/content/docs/dropins/*/events.mdx',
    slots: 'src/content/docs/dropins/*/slots.mdx',
    containers: 'src/content/docs/dropins/*/containers/*.mdx',
    dictionaries: 'src/content/docs/dropins/*/dictionary.mdx',
    quickStart: 'src/content/docs/dropins/*/quick-start.mdx',
};

/**
 * Get git status for generated files
 */
function getGeneratedFileStatus(fileType = 'all') {
    const patterns = fileType === 'all'
        ? Object.values(GENERATED_FILE_PATTERNS)
        : [GENERATED_FILE_PATTERNS[fileType]];

    const modified = [];
    const untracked = [];
    const deleted = [];

    for (const pattern of patterns) {
        try {
            // Get modified and deleted files
            const modifiedOutput = execSync(
                `git diff --name-only --diff-filter=M ${pattern}`,
                { encoding: 'utf8', cwd: projectRoot }
            ).trim();

            if (modifiedOutput) {
                modified.push(...modifiedOutput.split('\n').filter(Boolean));
            }

            // Get deleted files
            const deletedOutput = execSync(
                `git diff --name-only --diff-filter=D ${pattern}`,
                { encoding: 'utf8', cwd: projectRoot }
            ).trim();

            if (deletedOutput) {
                deleted.push(...deletedOutput.split('\n').filter(Boolean));
            }

            // Get untracked files
            const untrackedOutput = execSync(
                `git ls-files --others --exclude-standard ${pattern}`,
                { encoding: 'utf8', cwd: projectRoot }
            ).trim();

            if (untrackedOutput) {
                untracked.push(...untrackedOutput.split('\n').filter(Boolean));
            }
        } catch (error) {
            // Pattern might not match any files, continue
        }
    }

    return { modified, untracked, deleted };
}

/**
 * Rollback modified files using git restore
 */
function rollbackModifiedFiles(files) {
    if (files.length === 0) return 0;

    console.log(`\n📝 Restoring ${files.length} modified file(s)...`);

    let restored = 0;
    for (const file of files) {
        try {
            execSync(`git restore "${file}"`, { cwd: projectRoot, stdio: 'pipe' });
            console.log(`  ✅ Restored: ${file}`);
            restored++;
        } catch (error) {
            console.log(`  ❌ Failed to restore: ${file}`);
        }
    }

    return restored;
}

/**
 * Delete untracked files
 */
function deleteUntrackedFiles(files) {
    if (files.length === 0) return 0;

    console.log(`\n🗑️  Deleting ${files.length} untracked file(s)...`);

    let deleted = 0;
    for (const file of files) {
        try {
            const filePath = join(projectRoot, file);
            if (existsSync(filePath)) {
                execSync(`rm "${filePath}"`, { cwd: projectRoot, stdio: 'pipe' });
                console.log(`  ✅ Deleted: ${file}`);
                deleted++;
            }
        } catch (error) {
            console.log(`  ❌ Failed to delete: ${file}`);
        }
    }

    return deleted;
}

/**
 * Restore deleted files
 */
function restoreDeletedFiles(files) {
    if (files.length === 0) return 0;

    console.log(`\n♻️  Restoring ${files.length} deleted file(s)...`);

    let restored = 0;
    for (const file of files) {
        try {
            execSync(`git restore "${file}"`, { cwd: projectRoot, stdio: 'pipe' });
            console.log(`  ✅ Restored: ${file}`);
            restored++;
        } catch (error) {
            console.log(`  ❌ Failed to restore: ${file}`);
        }
    }

    return restored;
}

/**
 * Main rollback function
 */
function rollbackGeneratedDocs(fileType = 'all') {
    console.log('🔄 Rolling back generated documentation...');
    console.log('=====================================\n');

    if (fileType !== 'all' && !GENERATED_FILE_PATTERNS[fileType]) {
        console.error(`❌ Invalid file type: ${fileType}`);
        console.log(`Available types: ${Object.keys(GENERATED_FILE_PATTERNS).join(', ')}, all`);
        process.exit(1);
    }

    console.log(`📂 Scanning for ${fileType === 'all' ? 'all generated' : fileType} files...\n`);

    const { modified, untracked, deleted } = getGeneratedFileStatus(fileType);

    const totalFiles = modified.length + untracked.length + deleted.length;

    if (totalFiles === 0) {
        console.log('✨ No generated files to rollback. Everything is clean!');
        return;
    }

    console.log(`Found ${totalFiles} file(s) to rollback:`);
    console.log(`  - ${modified.length} modified`);
    console.log(`  - ${untracked.length} untracked`);
    console.log(`  - ${deleted.length} deleted`);

    // Perform rollback
    const modifiedCount = rollbackModifiedFiles(modified);
    const untrackedCount = deleteUntrackedFiles(untracked);
    const deletedCount = restoreDeletedFiles(deleted);

    // Summary
    console.log('\n✨ Rollback complete!');
    console.log('=====================================');
    console.log(`📊 Summary:`);
    console.log(`  - ${modifiedCount} file(s) restored`);
    console.log(`  - ${untrackedCount} file(s) deleted`);
    console.log(`  - ${deletedCount} file(s) recovered`);
    console.log(`  - Total: ${modifiedCount + untrackedCount + deletedCount}/${totalFiles} files processed\n`);

    if (modifiedCount + untrackedCount + deletedCount < totalFiles) {
        console.log('⚠️  Some files could not be rolled back. Please check the errors above.');
        process.exit(1);
    }
}

// Parse command line arguments
const fileType = process.argv[2] || 'all';

// Run rollback
rollbackGeneratedDocs(fileType);
