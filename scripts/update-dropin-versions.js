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
import { join } from 'path';
import { execFileSync } from 'child_process';
import { getProjectRoot } from './lib/generator-core.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();

// ============================================================================
// VERSION PATTERNS
// ============================================================================

// Matches: <strong>Version: 3.1.0</strong>
const VERSION_DIV_RE = /(<strong>Version: )\d+\.\d+\.\d+(<\/strong>)/g;

// Matches: **Version:** 3.1.0 (verify compatibility with your Commerce instance)
const VERSION_REF_RE = /(\*\*Version:\*\* )\d+\.\d+\.\d+( \(verify compatibility[^)]*\))/g;

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
        const version = execFileSync('npm', ['view', packageName, 'version'], {
            encoding: 'utf8',
            stdio: 'pipe',
        }).trim();
        return version || null;
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

    const entries = readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getMdxFiles(fullPath));
        } else if (entry.name.endsWith('.mdx')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Update both version patterns in a single MDX file.
 * Only writes if content actually changed.
 *
 * @param {string} filePath
 * @param {string} version - semver string, e.g. "3.1.0"
 * @returns {boolean} true if file was written
 */
function updateVersionInFile(filePath, version) {
    const content = readFileSync(filePath, 'utf8');

    VERSION_DIV_RE.lastIndex = 0;
    VERSION_REF_RE.lastIndex = 0;

    const hasDiv = VERSION_DIV_RE.test(content);
    const hasRef = VERSION_REF_RE.test(content);

    if (!hasDiv && !hasRef) return false;

    VERSION_DIV_RE.lastIndex = 0;
    VERSION_REF_RE.lastIndex = 0;

    const updated = content
        .replace(VERSION_DIV_RE, `$1${version}$2`)
        .replace(VERSION_REF_RE, `$1${version}$2`);

    if (updated === content) return false;

    writeFileSync(filePath, updated, 'utf8');
    return true;
}

/**
 * Update all MDX files in a drop-in's docs directory.
 *
 * @param {string} docsDir
 * @param {string} version
 * @returns {{ updatedCount: number, skippedCount: number }}
 */
function updateDropinDocs(docsDir, version) {
    const files = getMdxFiles(docsDir);
    let updatedCount = 0;
    let skippedCount = 0;

    for (const filePath of files) {
        const rel = filePath.replace(projectRoot + '/', '');
        const wasUpdated = updateVersionInFile(filePath, version);
        if (wasUpdated) {
            console.log(`      ✅ ${rel}`);
            updatedCount++;
        } else {
            skippedCount++;
        }
    }

    return { updatedCount, skippedCount };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('🔄 Drop-in Version Updater (live npm registry)');
    console.log('================================================\n');

    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalWarnings = 0;

    const b2cEntries = Object.entries(DROPIN_REPOS).filter(([, cfg]) => cfg.type === 'B2C');
    const b2bEntries = Object.entries(DROPIN_REPOS).filter(([, cfg]) => cfg.type === 'B2B');

    // ── B2C ──────────────────────────────────────────────────────────────────
    console.log('📦 B2C drop-ins\n');

    for (const [dropinKey, config] of b2cEntries) {
        const version = getNpmVersion(config.packageName);

        if (!version) {
            console.log(`   ⚠️  ${config.displayName}: could not fetch ${config.packageName} from npm`);
            console.log(`        Ensure npm is authenticated with the @dropins registry.\n`);
            totalWarnings++;
            continue;
        }

        const docsDir = join(projectRoot, 'src/content/docs/dropins', dropinKey);

        if (!existsSync(docsDir)) {
            console.log(`   ⏭️  ${config.displayName}: docs directory not found, skipping`);
            continue;
        }

        console.log(`   📝 ${config.displayName} (${version})`);
        const { updatedCount, skippedCount } = updateDropinDocs(docsDir, version);
        totalUpdated += updatedCount;
        totalSkipped += skippedCount;
    }

    // ── B2B ──────────────────────────────────────────────────────────────────
    console.log('\n📦 B2B drop-ins\n');

    for (const [dropinKey, config] of b2bEntries) {
        const version = getNpmVersion(config.packageName);

        if (!version) {
            console.log(`   ⚠️  ${config.displayName}: could not fetch ${config.packageName} from npm`);
            console.log(`        Ensure npm is authenticated with the @dropins registry.\n`);
            totalWarnings++;
            continue;
        }

        const docsDir = join(projectRoot, 'src/content/docs/dropins-b2b', dropinKey);

        if (!existsSync(docsDir)) {
            console.log(`   ⏭️  ${config.displayName}: docs directory not found, skipping`);
            continue;
        }

        console.log(`   📝 ${config.displayName} (${version})`);
        const { updatedCount, skippedCount } = updateDropinDocs(docsDir, version);
        totalUpdated += updatedCount;
        totalSkipped += skippedCount;
    }

    // ── SUMMARY ──────────────────────────────────────────────────────────────
    console.log('\n✨ Complete!');
    console.log(`   Files updated : ${totalUpdated}`);
    console.log(`   Files skipped : ${totalSkipped} (no version element or already current)`);
    if (totalWarnings > 0) {
        console.log(`   Warnings      : ${totalWarnings} (see above)`);
    }
    console.log('');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
}
