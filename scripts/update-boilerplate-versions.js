#!/usr/bin/env node

/**
 * Boilerplate Version Updater
 *
 * Updates the version number in boilerplate documentation files while leaving
 * all other content untouched.
 *
 * USAGE:
 *   npm run update-boilerplate-versions
 *
 * VERSION SOURCE:
 *   Fetches the latest release tag from the GitHub API for
 *   hlxsites/aem-boilerplate-commerce (public repo, no auth required).
 *   No local clones or temp repos are read.
 *
 * VERSION PATTERNS UPDATED:
 *   1. Styled div badge:  <strong>Version: X.Y.Z</strong>
 *   2. Text label:        Boilerplate version: X.Y.Z
 *   3. Text label:        Current Version: X.Y.Z
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './lib/generator-core.js';

const projectRoot = getProjectRoot();

const BOILERPLATE_REPO = 'hlxsites/aem-boilerplate-commerce';
const PACKAGE_JSON_URL = `https://raw.githubusercontent.com/${BOILERPLATE_REPO}/main/package.json`;

// ============================================================================
// VERSION PATTERNS
// ============================================================================

// Matches: <strong>Version: 7.0.0</strong>
const VERSION_DIV_RE = /(<strong>Version: )\d+\.\d+\.\d+(<\/strong>)/g;

// Matches: Boilerplate version: 7.0.0
const VERSION_BOILERPLATE_RE = /(Boilerplate version:)\s*(\d+\.\d+\.\d+|latest)/g;

// Matches: Current Version: 7.0.0
const VERSION_CURRENT_RE = /(Current Version:)\s*(\d+\.\d+\.\d+|latest)/g;

// ============================================================================
// LIVE VERSION FETCH
// ============================================================================

/**
 * Fetch the current version from the boilerplate's package.json on main.
 *
 * The boilerplate uses date-based release tags (e.g. "b2c-march-2026"), not
 * semver tags, so the version field in package.json is the authoritative source.
 *
 * @returns {Promise<string>} semver string (e.g. "7.0.0")
 */
async function getLatestBoilerplateVersion() {
    const response = await fetch(PACKAGE_JSON_URL);

    if (!response.ok) {
        throw new Error(`Could not fetch boilerplate package.json: ${response.status} ${response.statusText}`);
    }

    const pkg = await response.json();

    if (!pkg.version) {
        throw new Error('package.json did not include a version field');
    }

    return pkg.version;
}

// ============================================================================
// FILE UPDATING
// ============================================================================

/**
 * Update all version patterns in a single MDX file.
 * Only writes if content actually changed.
 *
 * @param {string} filePath
 * @param {string} version - semver string, e.g. "7.0.0"
 * @returns {boolean} true if file was written
 */
function updateVersionInFile(filePath, version) {
    if (!existsSync(filePath)) return false;

    const content = readFileSync(filePath, 'utf8');

    // Reset before testing
    VERSION_DIV_RE.lastIndex = 0;
    VERSION_BOILERPLATE_RE.lastIndex = 0;
    VERSION_CURRENT_RE.lastIndex = 0;

    const hasAny =
        VERSION_DIV_RE.test(content) ||
        VERSION_BOILERPLATE_RE.test(content) ||
        VERSION_CURRENT_RE.test(content);

    if (!hasAny) return false;

    // Reset before replacing
    VERSION_DIV_RE.lastIndex = 0;
    VERSION_BOILERPLATE_RE.lastIndex = 0;
    VERSION_CURRENT_RE.lastIndex = 0;

    const updated = content
        .replace(VERSION_DIV_RE, `$1${version}$2`)
        .replace(VERSION_BOILERPLATE_RE, `$1 ${version}`)
        .replace(VERSION_CURRENT_RE, `$1 ${version}`);

    if (updated === content) return false;

    writeFileSync(filePath, updated, 'utf8');
    return true;
}

/**
 * Update versions in all boilerplate documentation files.
 *
 * @param {string} version
 */
function updateBoilerplateDocVersions(version) {
    const boilerplateDocsDir = join(projectRoot, 'src/content/docs/boilerplate');

    if (!existsSync(boilerplateDocsDir)) {
        console.error('❌ Boilerplate docs directory not found:', boilerplateDocsDir);
        return;
    }

    const files = readdirSync(boilerplateDocsDir)
        .filter(file => file.endsWith('.mdx'))
        .map(file => join(boilerplateDocsDir, file));

    console.log(`\n📝 Updating boilerplate versions to: ${version}`);
    console.log(`   Found ${files.length} MDX files to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const filePath of files) {
        const fileName = filePath.split('/').pop();
        const wasUpdated = updateVersionInFile(filePath, version);

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
// MAIN
// ============================================================================

async function main() {
    console.log('🔄 Boilerplate Version Updater (live GitHub API)');
    console.log('=================================================\n');

    console.log(`📡 Fetching package.json from github.com/${BOILERPLATE_REPO} (main)...`);
    const version = await getLatestBoilerplateVersion();
    console.log(`📌 Latest boilerplate release: ${version}\n`);

    updateBoilerplateDocVersions(version);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
}

export { updateBoilerplateDocVersions };
