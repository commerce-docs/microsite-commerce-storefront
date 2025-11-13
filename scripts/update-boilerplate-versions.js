#!/usr/bin/env node

/**
 * Boilerplate Version Updater
 *
 * Updates the version number in boilerplate documentation files while leaving
 * all other content untouched. This allows manually-maintained docs to stay
 * current with the boilerplate version without regenerating the entire file.
 *
 * USAGE:
 * - Update all boilerplate doc versions: npm run update-boilerplate-versions
 *
 * PROCESS:
 * 1. Extracts version from boilerplate's package.json
 * 2. Finds all boilerplate MDX files with version elements
 * 3. Updates only the version number in those elements
 * 4. Reports which files were updated
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './lib/generator-core.js';
import { cloneOrUpdateBoilerplate } from './lib/repository.js';

const projectRoot = getProjectRoot();

// ============================================================================
// VERSION EXTRACTION
// ============================================================================

/**
 * Get the boilerplate version from package.json
 * Falls back to 'latest' if version cannot be determined
 */
function getBoilerplateVersion(boilerplatePath) {
    try {
        const packageJsonPath = join(boilerplatePath, 'package.json');
        if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.version) {
                return packageJson.version;
            }
        }
    } catch (error) {
        console.warn('  ⚠️  Could not read package.json version:', error.message);
    }

    return 'latest';
}

// ============================================================================
// VERSION UPDATING
// ============================================================================

/**
 * Update version in a single MDX file
 * Only updates the version number, leaves all other content unchanged
 * 
 * @param {string} filePath - Full path to the MDX file
 * @param {string} newVersion - New version to set
 * @returns {boolean} - True if file was updated, false otherwise
 */
function updateVersionInFile(filePath, newVersion) {
    if (!existsSync(filePath)) {
        return false;
    }

    const content = readFileSync(filePath, 'utf8');

    // Pattern matches the version element with any version number
    // Captures everything except the version number itself
    const versionPattern = /(Boilerplate version:|Current Version:)\s*(\d+\.\d+\.\d+|latest)/g;

    // Check if file contains a version element
    if (!versionPattern.test(content)) {
        return false;
    }

    // Reset regex lastIndex
    versionPattern.lastIndex = 0;

    // Replace version number while keeping the label
    const updatedContent = content.replace(
        versionPattern,
        `$1 ${newVersion}`
    );

    // Only write if content actually changed
    if (updatedContent !== content) {
        writeFileSync(filePath, updatedContent, 'utf8');
        return true;
    }

    return false;
}

/**
 * Update versions in all boilerplate documentation files
 * 
 * @param {string} newVersion - Version to set in all files
 */
function updateBoilerplateDocVersions(newVersion) {
    const boilerplateDocsDir = join(projectRoot, 'src/content/docs/boilerplate');

    if (!existsSync(boilerplateDocsDir)) {
        console.error('❌ Boilerplate docs directory not found:', boilerplateDocsDir);
        return;
    }

    const files = readdirSync(boilerplateDocsDir)
        .filter(file => file.endsWith('.mdx'))
        .map(file => join(boilerplateDocsDir, file));

    console.log(`\n📝 Updating boilerplate versions to: ${newVersion}`);
    console.log(`   Found ${files.length} MDX files to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const filePath of files) {
        const fileName = filePath.split('/').pop();
        const wasUpdated = updateVersionInFile(filePath, newVersion);

        if (wasUpdated) {
            console.log(`   ✅ Updated: ${fileName}`);
            updatedCount++;
        } else {
            console.log(`   ⏭️  Skipped: ${fileName} (no version element or already current)`);
            skippedCount++;
        }
    }

    console.log(`\n✨ Complete!`);
    console.log(`   Updated: ${updatedCount} files`);
    console.log(`   Skipped: ${skippedCount} files\n`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    console.log('🔄 Boilerplate Version Updater');
    console.log('================================\n');

    // Clone/update boilerplate repository
    console.log('📦 Syncing boilerplate repository...');
    const boilerplateResult = await cloneOrUpdateBoilerplate();
    console.log(`   ✓ Boilerplate ready at: ${boilerplateResult.path}\n`);

    // Get current boilerplate version
    const version = getBoilerplateVersion(boilerplateResult.path);
    console.log(`📌 Current boilerplate version: ${version}`);

    // Update all boilerplate doc files
    updateBoilerplateDocVersions(version);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
}

export { updateBoilerplateDocVersions, getBoilerplateVersion };

