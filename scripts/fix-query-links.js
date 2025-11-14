#!/usr/bin/env node

/**
 * Fix GraphQL query links that incorrectly use "mutations" instead of "queries"
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Find all function enrichment files
const enrichmentDir = join(projectRoot, '_dropin-enrichments');
const dropinDirs = readdirSync(enrichmentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const files = [];
for (const dropin of dropinDirs) {
    const functionsFile = join(enrichmentDir, dropin, 'functions.json');
    if (existsSync(functionsFile)) {
        files.push(functionsFile);
    }
}

console.log('🔄 Fixing query links that incorrectly use "mutations"...\n');

let updatedCount = 0;
let fixedCount = 0;

for (const file of files) {
    const content = readFileSync(file, 'utf8');
    let updated = false;
    let fileFixedCount = 0;

    // Find URLs with "mutations" that appear in descriptions mentioning "query"
    // Pattern: look for "query" in description text, then find URL with "mutations" and replace with "queries"
    const updatedContent = content.replace(
        /(https:\/\/developer\.adobe\.com\/commerce\/webapi\/graphql\/schema\/[^\/]+\/)mutations\/([^\)"]+)/g,
        (match, prefix, operation) => {
            // Check if this URL appears in a description that mentions "query"
            // We'll check the context around this match
            const beforeMatch = content.substring(Math.max(0, content.indexOf(match) - 200), content.indexOf(match));
            const afterMatch = content.substring(content.indexOf(match), Math.min(content.length, content.indexOf(match) + 200));
            const context = beforeMatch + afterMatch;

            // If the context mentions "query" (but not "mutation"), replace mutations with queries
            if (context.match(/\bquery\b/i) && !context.match(/\bmutation\b/i)) {
                updated = true;
                fileFixedCount++;
                return `${prefix}queries/${operation}`;
            }
            return match;
        }
    );

    if (updated) {
        writeFileSync(file, updatedContent, 'utf8');
        const relativePath = file.replace(projectRoot + '/', '');
        console.log(`✅ Updated: ${relativePath} (${fileFixedCount} link(s) fixed)`);
        updatedCount++;
        fixedCount += fileFixedCount;
    }
}

console.log(`\n✅ Fixed query links in ${updatedCount} file(s)`);

