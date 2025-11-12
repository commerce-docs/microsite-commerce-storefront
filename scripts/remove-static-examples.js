#!/usr/bin/env node

/**
 * Script to remove static examples from enrichment files
 * Maintains "Source-First" principle - examples should come from live source code only
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('\n' + '='.repeat(70));
console.log('✂️  REMOVING STATIC EXAMPLES FROM ENRICHMENT FILES');
console.log('='.repeat(70));
console.log('\n⚠️  Rationale: Examples should always come from source code to stay current.\n');

let totalRemoved = 0;
let totalKept = 0;

// Process each drop-in
for (const [dropinName, repoConfig] of Object.entries(DROPIN_REPOS)) {
    const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropinName, 'functions.json');

    if (!existsSync(enrichmentPath)) {
        console.log(`   ⏭️  Skipping ${dropinName} (no enrichment file)\n`);
        continue;
    }

    console.log(`📦 Processing ${dropinName}...`);

    const enrichment = JSON.parse(readFileSync(enrichmentPath, 'utf-8'));
    let dropinRemoved = 0;
    let dropinKept = 0;

    for (const [funcName, data] of Object.entries(enrichment)) {
        if (data.examples) {
            delete data.examples;
            dropinRemoved++;
            console.log(`   ✂️  Removed ${funcName}: examples deleted (will extract from source)`);
        }

        // Also remove old 'usage' if it still exists
        if (data.usage) {
            delete data.usage;
            dropinRemoved++;
            console.log(`   ✂️  Removed ${funcName}: usage deleted (will extract from source)`);
        }

        // Keep only: description, events, returns
        const keptFields = [];
        if (data.description) keptFields.push('description');
        if (data.events) keptFields.push('events');
        if (data.returns) keptFields.push('returns');

        if (keptFields.length > 0) {
            dropinKept++;
            console.log(`   ✅ Kept ${funcName}: ${keptFields.join(', ')}`);
        }

        enrichment[funcName] = data;
    }

    // Write back
    writeFileSync(enrichmentPath, JSON.stringify(enrichment, null, 2) + '\n');
    totalRemoved += dropinRemoved;
    totalKept += dropinKept;
    console.log(`   💾 Saved ${dropinName}/functions.json\n`);
}

// Summary
console.log('='.repeat(70));
console.log('📊 REMOVAL SUMMARY');
console.log('='.repeat(70));
console.log(`   Static examples/usage removed: ${totalRemoved}`);
console.log(`   Context-only enrichments kept: ${totalKept}`);
console.log('='.repeat(70) + '\n');

console.log('✅ Enrichment files now follow "Source-First" principle!\n');
console.log('💡 Next steps:');
console.log('   1. Examples will be extracted from JSDoc, tests, and HTML examples');
console.log('   2. Run: npm run audit-enrichments');
console.log('   3. Run: npm run generate-all-docs\n');

