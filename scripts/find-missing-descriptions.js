#!/usr/bin/env node

/**
 * Find Missing Parameter Descriptions
 * 
 * This script identifies all parameters across all drop-ins that still have
 * placeholder "See function signature above" descriptions.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function extractFunctionParameters(mdxContent) {
    const functions = [];

    // Match function sections (## functionName)
    const functionPattern = /^## (\w+)$/gm;
    let functionMatch;

    while ((functionMatch = functionPattern.exec(mdxContent)) !== null) {
        const functionName = functionMatch[1];
        const functionStart = functionMatch.index;

        // Find the next function or end of file
        const nextFunctionMatch = functionPattern.exec(mdxContent);
        const functionEnd = nextFunctionMatch ? nextFunctionMatch.index : mdxContent.length;
        functionPattern.lastIndex = functionEnd; // Reset for next iteration

        const functionSection = mdxContent.substring(functionStart, functionEnd);

        // Look for parameter table
        const tableMatch = functionSection.match(/\| Parameter \| Type \| Req\? \| Description \|[\s\S]*?\n\n/);
        if (tableMatch) {
            const tableContent = tableMatch[0];

            // Find rows with "See function signature above"
            const placeholderRows = [];
            const rows = tableContent.split('\n').filter(line => line.startsWith('| `'));

            for (const row of rows) {
                if (row.includes('See function signature above')) {
                    // Extract parameter name
                    const paramMatch = row.match(/\| `(\w+)` \|/);
                    if (paramMatch) {
                        placeholderRows.push(paramMatch[1]);
                    }
                }
            }

            if (placeholderRows.length > 0) {
                functions.push({
                    name: functionName,
                    missingParams: placeholderRows
                });
            }
        }
    }

    return functions;
}

function main() {
    console.log('🔍 Finding Missing Parameter Descriptions...\n');

    const dropinsDir = join(projectRoot, 'src', 'content', 'docs', 'dropins');
    const dropins = readdirSync(dropinsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const allMissing = {};
    let totalMissing = 0;

    for (const dropin of dropins) {
        const functionsFile = join(dropinsDir, dropin, 'functions.mdx');

        try {
            const content = readFileSync(functionsFile, 'utf-8');
            const missing = extractFunctionParameters(content);

            if (missing.length > 0) {
                allMissing[dropin] = missing;
                const count = missing.reduce((sum, f) => sum + f.missingParams.length, 0);
                totalMissing += count;
            }
        } catch (error) {
            // Skip if file doesn't exist
        }
    }

    // Print results
    for (const [dropin, functions] of Object.entries(allMissing)) {
        console.log(`📦 ${dropin}`);
        for (const func of functions) {
            console.log(`   ${func.name}:`);
            for (const param of func.missingParams) {
                console.log(`      - ${param}`);
            }
        }
        console.log();
    }

    console.log('='.repeat(60));
    console.log(`Total missing descriptions: ${totalMissing}`);
    console.log('='.repeat(60));
    console.log('\n💡 These parameters need descriptions added to enrichment files.');
}

main();

