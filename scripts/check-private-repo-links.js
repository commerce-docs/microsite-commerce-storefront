#!/usr/bin/env node

/**
 * Check for Private Repository Links in Enrichment Files
 * 
 * This script scans all enrichment files for GitHub links to private repositories
 * and reports any violations. Private repo links cause 404 errors in public documentation.
 * 
 * Usage:
 *   node scripts/check-private-repo-links.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DROPIN_REPOS, REFERENCE_REPOS } from './lib/dropin-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const enrichmentsDir = join(projectRoot, '_dropin-enrichments');

// Extract repo names from GitHub URLs (supports both HTTPS and SSH formats)
function extractRepoNameFromUrl(url) {
    // Match HTTPS: https://github.com/org/repo
    let match = url.match(/github\.com\/([^\/]+)\/([^\/\s\)#]+)/);
    if (match) {
        let repo = match[2].replace(/\.git$/, ''); // Remove .git suffix
        return `${match[1]}/${repo}`;
    }

    // Match SSH: git@github.com:org/repo.git
    match = url.match(/git@github\.com:([^\/]+)\/([^\s]+)/);
    if (match) {
        let repo = match[2].replace(/\.git$/, '');
        return `${match[1]}/${repo}`;
    }

    return null;
}

// Get list of private repo patterns
function getPrivateRepoPatterns() {
    const patterns = [];

    for (const [name, config] of Object.entries(DROPIN_REPOS)) {
        if (config.isPublic === false) {
            const repoName = extractRepoNameFromUrl(config.gitUrl);
            if (repoName) patterns.push(repoName);
        }
    }

    for (const [name, config] of Object.entries(REFERENCE_REPOS)) {
        if (config.isPublic === false) {
            const repoName = extractRepoNameFromUrl(config.gitUrl);
            if (repoName) patterns.push(repoName);
        }
    }

    return patterns;
}

// Check a single file for private repo links
function checkFile(filePath, privatePatterns) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const violations = [];

        // Find all GitHub URLs in the file
        const githubUrlRegex = /https?:\/\/github\.com\/[^\s\)"]*/g;
        const matches = content.matchAll(githubUrlRegex);

        for (const match of matches) {
            const url = match[0];
            const repoName = extractRepoNameFromUrl(url);

            if (repoName && privatePatterns.includes(repoName)) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                violations.push({
                    line: lineNumber,
                    url: url,
                    repo: repoName
                });
            }
        }

        return violations;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return [];
    }
}

// Recursively scan directory for JSON files
function scanDirectory(dir, privatePatterns) {
    const results = [];

    try {
        const entries = readdirSync(dir);

        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                results.push(...scanDirectory(fullPath, privatePatterns));
            } else if (entry.endsWith('.json') && entry !== 'package.json') {
                const violations = checkFile(fullPath, privatePatterns);
                if (violations.length > 0) {
                    results.push({
                        file: fullPath.replace(projectRoot + '/', ''),
                        violations
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning ${dir}:`, error.message);
    }

    return results;
}

// Main execution
console.log('🔍 Checking for private repository links in enrichment files...\n');

const privatePatterns = getPrivateRepoPatterns();
console.log(`Private repos being checked (${privatePatterns.length}):`);
privatePatterns.forEach(p => console.log(`  - ${p}`));
console.log();

const results = scanDirectory(enrichmentsDir, privatePatterns);

if (results.length === 0) {
    console.log('✅ No private repository links found!\n');
    process.exit(0);
} else {
    console.log(`❌ Found ${results.length} file(s) with private repo links:\n`);

    for (const result of results) {
        console.log(`📄 ${result.file}`);
        for (const violation of result.violations) {
            console.log(`   Line ${violation.line}: ${violation.url}`);
            console.log(`   Private repo: ${violation.repo}`);
        }
        console.log();
    }

    console.log('⚠️  Private repo links will cause 404 errors in public documentation.');
    console.log('    Remove these links and use generic verification notes instead.\n');
    process.exit(1);
}

