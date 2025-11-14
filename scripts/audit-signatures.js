#!/usr/bin/env node

/**
 * Signature Audit Tool
 * 
 * Identifies functions with missing or inferred return types that may need
 * manual enrichment with accurate type information.
 * 
 * USAGE:
 * node scripts/audit-signatures.js [dropin-name]
 * 
 * Example:
 * node scripts/audit-signatures.js cart
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const dropinName = process.argv[2];

if (!dropinName) {
    console.error('Usage: node scripts/audit-signatures.js <dropin-name>');
    console.error('Example: node scripts/audit-signatures.js cart');
    process.exit(1);
}

console.log(`\n🔍 Auditing function signatures for ${dropinName}...\n`);

// Path to the cloned repository
const repoPath = join(projectRoot, '.temp-repos', dropinName);
const apiPath = join(repoPath, 'src', 'api');

if (!existsSync(apiPath)) {
    console.error(`❌ No src/api directory found in ${repoPath}`);
    process.exit(1);
}

const findings = [];

// Scan each function directory
const entries = readdirSync(apiPath);
for (const entry of entries) {
    const entryPath = join(apiPath, entry);
    const stat = statSync(entryPath);

    // Skip files, only process directories
    if (!stat.isDirectory()) continue;

    // Skip special directories
    if (entry.startsWith('.') || entry === 'graphql' || entry === 'fetch-graphql') continue;

    const tsPath = join(entryPath, `${entry}.ts`);
    if (!existsSync(tsPath)) continue;

    const tsContent = readFileSync(tsPath, 'utf8');

    // Check if function has explicit return type
    const patterns = [
        new RegExp(`export\\s+const\\s+${entry}\\s*=\\s*async\\s*\\([^)]*\\)\\s*:\\s*([^{]+)`, 's'),
        new RegExp(`export\\s+const\\s+${entry}\\s*=\\s*\\([^)]*\\)\\s*:\\s*([^{]+)`, 's'),
        new RegExp(`export\\s+async\\s+function\\s+${entry}\\s*\\([^)]*\\)\\s*:\\s*([^{]+)`, 's'),
        new RegExp(`export\\s+function\\s+${entry}\\s*\\([^)]*\\)\\s*:\\s*([^{]+)`, 's'),
    ];

    let hasExplicitType = false;
    let returnType = null;

    for (const pattern of patterns) {
        const match = tsContent.match(pattern);
        if (match) {
            hasExplicitType = true;
            returnType = match[1].trim().replace(/\s*=>\s*\{[\s\S]*$/, '').trim();
            break;
        }
    }

    // Try to infer what it returns by looking at return statements
    let inferredType = 'unknown';
    const isAsync = /export\s+(?:const|async\s+function)\s+\w+\s*=\s*async/.test(tsContent);

    if (!hasExplicitType) {
        // Look for return statements
        const returnMatches = tsContent.match(/return\s+([^;]+);/g);
        if (returnMatches) {
            const lastReturn = returnMatches[returnMatches.length - 1];

            if (lastReturn.includes('CartModel') || lastReturn.includes('cart')) {
                inferredType = isAsync ? 'Promise<CartModel | null>' : 'CartModel | null';
            } else if (lastReturn.includes('cartId') || lastReturn.includes('.id')) {
                inferredType = isAsync ? 'Promise<string>' : 'string';
            } else if (lastReturn.includes('null')) {
                inferredType = isAsync ? 'Promise<null>' : 'null';
            } else if (lastReturn.includes('void') || lastReturn.includes('undefined')) {
                inferredType = isAsync ? 'Promise<void>' : 'void';
            } else if (lastReturn.includes('true') || lastReturn.includes('false')) {
                inferredType = isAsync ? 'Promise<boolean>' : 'boolean';
            } else if (lastReturn.includes('[') || lastReturn.includes('Array')) {
                inferredType = isAsync ? 'Promise<Array<any>>' : 'Array<any>';
            } else {
                inferredType = isAsync ? 'Promise<any>' : 'any';
            }
        } else {
            inferredType = isAsync ? 'Promise<void>' : 'void';
        }
    }

    findings.push({
        name: entry,
        hasExplicitType,
        returnType: returnType || inferredType,
        needsReview: !hasExplicitType,
        isAsync
    });
}

// Sort: functions needing review first
findings.sort((a, b) => {
    if (a.needsReview && !b.needsReview) return -1;
    if (!a.needsReview && b.needsReview) return 1;
    return a.name.localeCompare(b.name);
});

// Display results
console.log('Function Signature Audit Results');
console.log('='.repeat(70));
console.log();

const needsReview = findings.filter(f => f.needsReview);
const hasTypes = findings.filter(f => !f.needsReview);

if (needsReview.length > 0) {
    console.log('⚠️  Functions needing manual type enrichment:');
    console.log('-'.repeat(70));
    needsReview.forEach(f => {
        console.log(`   ${f.name}`);
        console.log(`      Inferred: ${f.returnType}`);
        console.log(`      Action: Add to _dropin-enrichments/${dropinName}/functions.json`);
        console.log();
    });
}

if (hasTypes.length > 0) {
    console.log('✅ Functions with explicit types:');
    console.log('-'.repeat(70));
    hasTypes.forEach(f => {
        console.log(`   ${f.name}: ${f.returnType}`);
    });
    console.log();
}

console.log('Summary:');
console.log(`   Total functions: ${findings.length}`);
console.log(`   ✅ Have explicit types: ${hasTypes.length}`);
console.log(`   ⚠️  Need manual enrichment: ${needsReview.length}`);
console.log();

if (needsReview.length > 0) {
    console.log('💡 To add enrichment, edit:');
    console.log(`   _dropin-enrichments/${dropinName}/functions.json`);
    console.log();
    console.log('   Add signature object like:');
    console.log('   "functionName": {');
    console.log('     "signature": {');
    console.log('       "params": "param1: Type1, param2: Type2",');
    console.log('       "returnType": "Promise<ReturnType>"');
    console.log('     }');
    console.log('   }');
}

console.log();

