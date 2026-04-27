#!/usr/bin/env node

/**
 * Drop-in Version Updater
 *
 * Updates version numbers in all drop-in documentation files for both
 * B2C (src/content/docs/dropins/) and B2B (src/content/docs/dropins-b2b/).
 *
 * USAGE:
 *   npm run update-dropin-versions
 *
 * VERSION SOURCE:
 *   Queries the npm registry live for every drop-in package. No local clones
 *   or temp repos are read. Requires npm to be authenticated with the registry
 *   that hosts the @dropins/* packages.
 *
 * VERSION PATTERNS UPDATED:
 *   1. Styled div badge:  <strong>Version: X.Y.Z</strong>
 *   2. Quick-reference:   **Version:** X.Y.Z (verify compatibility with your Commerce instance)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { execFileSync } from 'child_process';
import { getProjectRoot } from './lib/generator-core.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();

// ============================================================================
// VERSION PATTERNS
// Factory functions return a fresh regex on each call, avoiding the stateful
// lastIndex resets that module-level /g regexes require.
// ============================================================================

const VERSION_DIV_RE = () => /(<strong>Version: )\d+\.\d+\.\d+(<\/strong>)/g;
const VERSION_REF_RE = () => /(\*\*Version:\*\* )\d+\.\d+\.\d+( \(verify compatibility[^)]*\))/g;

// ============================================================================
// NPM REGISTRY LOOKUP
// ============================================================================

/**
 * Fetch the latest published version of a package from the npm registry.
 *
 * @param {string} packageName - e.g. "@dropins/storefront-cart"
 * @returns {string|null} semver string (e.g. "3.1.0"), or null on failure
 */
function getNpmVersion(packageName) {
    try {
        return execFileSync('npm', ['view', packageName, 'version'], {
            encoding: 'utf8',
            stdio: 'pipe',
        }).trim() || null;
    } catch {
        return null;
    }
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Recursively collect all .mdx files under a directory.
 *
 * @param {string} dir
 * @returns {string[]}
 */
function getMdxFiles(dir) {
    if (!existsSync(dir)) return [];

    return readdirSync(dir, { withFileTypes: true, recursive: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.mdx'))
        .map(entry => join(entry.parentPath ?? entry.path, entry.name));
}

/**
 * Update both version patterns in a single MDX file.
 * Only writes if content actually changed.
 *
 * @param {string} filePath
 * @param {string} version - semver string, e.g. "3.1.0"
 * @returns {boolean} true if the file was written
 */
function updateVersionInFile(filePath, version) {
    const content = readFileSync(filePath, 'utf8');

    const updated = content
        .replace(VERSION_DIV_RE(), `$1${version}$2`)
        .replace(VERSION_REF_RE(), `$1${version}$2`);

    if (updated === content) return false;

    writeFileSync(filePath, updated, 'utf8');
    return true;
}

// ============================================================================
// GROUP PROCESSOR
// ============================================================================

/**
 * Fetch live versions and update all MDX files for a set of drop-in entries.
 *
 * @param {string} label          - Display label, e.g. "B2C"
 * @param {Array}  entries        - [dropinKey, config] pairs from DROPIN_REPOS
 * @param {string} docsSubdir     - "dropins" or "dropins-b2b"
 * @returns {{ updated: number, skipped: number, warnings: number }}
 */
function processGroup(label, entries, docsSubdir) {
    console.log(`📦 ${label} drop-ins\n`);

    let updated = 0;
    let skipped = 0;
    let warnings = 0;

    for (const [dropinKey, config] of entries) {
        const version = getNpmVersion(config.packageName);

        if (!version) {
            console.log(`   ⚠️  ${config.displayName}: could not fetch ${config.packageName} from npm`);
            console.log(`        Ensure npm is authenticated with the @dropins registry.\n`);
            warnings++;
            continue;
        }

        const docsDir = join(projectRoot, 'src/content/docs', docsSubdir, dropinKey);

        if (!existsSync(docsDir)) {
            console.log(`   ⏭️  ${config.displayName}: docs directory not found, skipping`);
            continue;
        }

        console.log(`   📝 ${config.displayName} (${version})`);

        for (const filePath of getMdxFiles(docsDir)) {
            if (updateVersionInFile(filePath, version)) {
                console.log(`      ✅ ${relative(projectRoot, filePath)}`);
                updated++;
            } else {
                skipped++;
            }
        }
    }

    return { updated, skipped, warnings };
}

// ============================================================================
// GROUP CONFIG
// Add a row here if a new drop-in type is introduced (e.g. B2B2C).
// label must match the `type` field used in dropin-config.js.
// ============================================================================

const GROUPS = [
    { label: 'B2C', docsSubdir: 'dropins' },
    { label: 'B2B', docsSubdir: 'dropins-b2b' },
];

// ============================================================================
// MAIN
// ============================================================================

function main() {
    console.log('🔄 Drop-in Version Updater (live npm registry)');
    console.log('================================================\n');

    const allEntries = Object.entries(DROPIN_REPOS);

    const results = GROUPS.map(({ label, docsSubdir }, i) => {
        if (i > 0) console.log('');
        const entries = allEntries.filter(([, cfg]) => cfg.type === label);
        return processGroup(label, entries, docsSubdir);
    });

    const total = results.reduce(
        (acc, { updated, skipped, warnings }) => ({
            updated:  acc.updated  + updated,
            skipped:  acc.skipped  + skipped,
            warnings: acc.warnings + warnings,
        }),
        { updated: 0, skipped: 0, warnings: 0 }
    );

    console.log('\n✨ Complete!');
    console.log(`   Files updated : ${total.updated}`);
    console.log(`   Files skipped : ${total.skipped} (no version element or already current)`);
    if (total.warnings > 0) {
        console.log(`   Warnings      : ${total.warnings} (see above)`);
    }
    console.log('');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        main();
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

export { main as updateDropinDocVersions };
