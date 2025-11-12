#!/usr/bin/env node

/**
 * Script to convert old 'usage' string fields to new 'examples' array format
 * and extract examples from JSDoc in source files
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('\n' + '='.repeat(70));
console.log('🔄 CONVERTING USAGE TO EXAMPLES FORMAT');
console.log('='.repeat(70) + '\n');

let totalConverted = 0;
let totalExtracted = 0;

/**
 * Extract JSDoc examples from source file
 */
function extractJSDocExamples(functionPath) {
    if (!existsSync(functionPath)) return [];

    const content = readFileSync(functionPath, 'utf-8');
    const examples = [];

    // Match @example blocks in JSDoc
    const exampleRegex = /@example\s*\n\s*\*\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g;
    let match;

    while ((match = exampleRegex.exec(content)) !== null) {
        const exampleCode = match[1]
            .split('\n')
            .map(line => line.replace(/^\s*\*\s?/, ''))
            .join('\n')
            .trim();

        if (exampleCode) {
            examples.push({
                title: null,
                code: exampleCode
            });
        }
    }

    return examples;
}

// Process each drop-in
for (const [dropinName, repoConfig] of Object.entries(DROPIN_REPOS)) {
    const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropinName, 'functions.json');

    if (!existsSync(enrichmentPath)) {
        console.log(`   ⏭️  Skipping ${dropinName} (no enrichment file)\n`);
        continue;
    }

    console.log(`📦 Processing ${dropinName}...`);

    const enrichment = JSON.parse(readFileSync(enrichmentPath, 'utf-8'));
    const repoPath = join(projectRoot, '.temp-repos', dropinName);
    let dropinConverted = 0;
    let dropinExtracted = 0;

    for (const [funcName, data] of Object.entries(enrichment)) {
        let modified = false;

        // Convert 'usage' to 'examples' if it exists
        if (data.usage && !data.examples) {
            data.examples = [{
                title: null,
                code: data.usage
            }];
            delete data.usage;
            modified = true;
            dropinConverted++;
            console.log(`   ✅ Converted ${funcName}: usage → examples`);
        }

        // Try to extract JSDoc examples if no examples exist
        if (!data.examples) {
            const functionPath = join(repoPath, 'src', 'api', funcName, `${funcName}.ts`);
            const jsDocExamples = extractJSDocExamples(functionPath);

            if (jsDocExamples.length > 0) {
                data.examples = jsDocExamples;
                modified = true;
                dropinExtracted++;
                console.log(`   ✅ Extracted ${funcName}: ${jsDocExamples.length} example(s) from JSDoc`);
            }
        }

        enrichment[funcName] = data;
    }

    // Write back if modified
    if (dropinConverted > 0 || dropinExtracted > 0) {
        writeFileSync(enrichmentPath, JSON.stringify(enrichment, null, 2) + '\n');
        totalConverted += dropinConverted;
        totalExtracted += dropinExtracted;
        console.log(`   💾 Saved ${dropinName}/functions.json`);
    } else {
        console.log(`   ℹ️  No changes needed`);
    }

    console.log();
}

// Summary
console.log('='.repeat(70));
console.log('📊 CONVERSION SUMMARY');
console.log('='.repeat(70));
console.log(`   Usage fields converted: ${totalConverted}`);
console.log(`   JSDoc examples extracted: ${totalExtracted}`);
console.log(`   Total enhancements: ${totalConverted + totalExtracted}`);
console.log('='.repeat(70) + '\n');

if (totalConverted + totalExtracted > 0) {
    console.log('✅ Conversion complete! Run audit again to verify.\n');
} else {
    console.log('ℹ️  No conversions needed.\n');
}

