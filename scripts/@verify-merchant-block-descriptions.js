#!/usr/bin/env node

/**
 * Verify merchant block descriptions against README files
 * Outputs a report showing:
 * - Which descriptions are verified
 * - Which need review
 * - The actual README overview for each block
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('\n============================================================');
console.log('  MERCHANT BLOCK DESCRIPTION VERIFICATION');
console.log('============================================================\n');

// Load enrichment file
const enrichmentPath = join(projectRoot, '_dropin-enrichments', 'merchant-blocks', 'descriptions.json');
let enrichments = {};
if (existsSync(enrichmentPath)) {
    enrichments = JSON.parse(readFileSync(enrichmentPath, 'utf8')).blocks || {};
}

// Get all commerce blocks
const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate', 'blocks');
const blockDirs = readdirSync(boilerplatePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.startsWith('commerce-') || name === 'product-details' || name === 'product-list-page' || name === 'product-recommendations' || name === 'targeted-block')
    .sort();

console.log(`📦 Found ${blockDirs.length} commerce blocks\n`);

const results = {
    verified: [],
    needsReview: [],
    missing: []
};

for (const blockName of blockDirs) {
    const blockPath = join(boilerplatePath, blockName);
    const readmePath = join(blockPath, 'README.md');
    const key = blockName.replace('commerce-', '');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📄 Block: ${blockName}`);
    console.log(`${'='.repeat(80)}`);

    if (!existsSync(readmePath)) {
        console.log('⚠️  No README.md found');
        results.missing.push({ block: blockName, reason: 'No README' });
        continue;
    }

    // Extract README overview
    const readmeContent = readFileSync(readmePath, 'utf8');
    const overviewMatch = readmeContent.match(/## Overview\s*\n\s*\n(.*?)(?=\n\n##|\n\n<!-- |\n\n\*|$)/s);

    if (!overviewMatch) {
        console.log('⚠️  No Overview section found in README');
        results.missing.push({ block: blockName, reason: 'No Overview section' });
        continue;
    }

    const overview = overviewMatch[1].trim();
    console.log('\n📖 README Overview (first 200 chars):');
    console.log(`   ${overview.substring(0, 200)}${overview.length > 200 ? '...' : ''}`);

    // Check enrichment status
    const enrichment = enrichments[key];
    if (enrichment) {
        console.log('\n📝 Enrichment Description:');
        console.log(`   ${enrichment.description}`);
        console.log(`\n✓ Status: ${enrichment.verified ? '✅ VERIFIED' : '⚠️  NEEDS REVIEW'}`);

        if (enrichment.note) {
            console.log(`\n📌 Note: ${enrichment.note}`);
        }

        if (enrichment.verified) {
            results.verified.push(blockName);
        } else {
            results.needsReview.push(blockName);
        }
    } else {
        console.log('\n❌ No enrichment entry found');
        results.needsReview.push(blockName);
    }
}

// Summary
console.log(`\n\n${'='.repeat(80)}`);
console.log('📊 VERIFICATION SUMMARY');
console.log(`${'='.repeat(80)}`);
console.log(`\n✅ Verified: ${results.verified.length}/${blockDirs.length} (${Math.round(results.verified.length / blockDirs.length * 100)}%)`);
console.log(`⚠️  Needs Review: ${results.needsReview.length}/${blockDirs.length}`);
console.log(`❌ Missing README/Overview: ${results.missing.length}/${blockDirs.length}`);

if (results.needsReview.length > 0) {
    console.log('\n\n⚠️  BLOCKS NEEDING REVIEW:');
    console.log('─'.repeat(80));
    results.needsReview.forEach(block => {
        console.log(`   • ${block}`);
    });
}

if (results.missing.length > 0) {
    console.log('\n\n❌ BLOCKS WITH MISSING DATA:');
    console.log('─'.repeat(80));
    results.missing.forEach(item => {
        console.log(`   • ${item.block} - ${item.reason}`);
    });
}

console.log('\n\n💡 Next Steps:');
console.log('─'.repeat(80));
console.log('1. Review README overviews for blocks marked "NEEDS REVIEW"');
console.log('2. Update _dropin-enrichments/merchant-blocks/descriptions.json');
console.log('3. Set "verified": true for accurate descriptions');
console.log('4. Regenerate documentation with: node scripts/@generate-merchant-block-docs.js');
console.log('\n');

