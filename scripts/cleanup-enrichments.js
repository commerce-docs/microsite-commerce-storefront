#!/usr/bin/env node

/**
 * Cleanup Enrichment Files
 * 
 * This script systematically cleans up all enrichment files to ensure:
 * 1. Parameters only contain 'description' field (no 'type' or 'required')
 * 2. ACDL event mentions are documented appropriately
 * 3. Data follows the code-first strategy
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const enrichmentsDir = join(projectRoot, '_dropin-enrichments');

function cleanupEnrichmentFile(filePath, dropinName) {
    console.log(`\n📁 Processing ${dropinName}...`);

    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let parametersFixed = 0;
    let acdlWarnings = 0;

    // Process each function
    for (const [funcName, funcData] of Object.entries(data)) {
        // 1. Clean up parameters: remove 'type' and 'required' fields
        if (funcData.parameters) {
            for (const [paramName, paramData] of Object.entries(funcData.parameters)) {
                let modified = false;

                if (paramData.type !== undefined) {
                    delete paramData.type;
                    modified = true;
                }

                if (paramData.required !== undefined) {
                    delete paramData.required;
                    modified = true;
                }

                if (modified) {
                    parametersFixed++;
                }
            }
        }

        // 2. Check for ACDL mentions in events field
        if (funcData.events) {
            const hasACDL = funcData.events.includes('ACDL') ||
                funcData.events.includes('Adobe Client Data Layer') ||
                funcData.events.match(/[A-Z_]{2,}/); // All-caps event names

            if (hasACDL) {
                acdlWarnings++;
                console.log(`  ⚠️  ${funcName}: May contain ACDL event mention in 'events' field`);
            }
        }
    }

    // Write back the cleaned data
    const cleanedContent = JSON.stringify(data, null, 2) + '\n';
    writeFileSync(filePath, cleanedContent, 'utf-8');

    console.log(`  ✅ Fixed ${parametersFixed} parameter field(s)`);
    if (acdlWarnings > 0) {
        console.log(`  ⚠️  Found ${acdlWarnings} potential ACDL mention(s) - manual review recommended`);
    }

    return { parametersFixed, acdlWarnings };
}

function main() {
    console.log('🧹 Starting Enrichment Files Cleanup...\n');
    console.log('This script will:');
    console.log('  1. Remove "type" and "required" fields from parameters');
    console.log('  2. Check for ACDL event mentions that may need review');
    console.log('  3. Format JSON consistently\n');

    const dirs = readdirSync(enrichmentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    let totalParametersFixed = 0;
    let totalACDLWarnings = 0;
    const filesProcessed = [];

    for (const dropinName of dirs) {
        const functionsFile = join(enrichmentsDir, dropinName, 'functions.json');

        try {
            const stats = cleanupEnrichmentFile(functionsFile, dropinName);
            totalParametersFixed += stats.parametersFixed;
            totalACDLWarnings += stats.acdlWarnings;
            filesProcessed.push(dropinName);
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Cleanup Summary');
    console.log('='.repeat(60));
    console.log(`Files processed: ${filesProcessed.length}`);
    console.log(`Parameter fields removed: ${totalParametersFixed}`);
    console.log(`ACDL warnings: ${totalACDLWarnings}`);

    if (totalACDLWarnings > 0) {
        console.log('\n⚠️  Manual Review Needed:');
        console.log('   Some functions may have ACDL event mentions in their "events" field.');
        console.log('   Review these to ensure only drop-in events are documented.');
        console.log('   ACDL context can be mentioned in function descriptions.');
    }

    console.log('\n✨ Cleanup complete!\n');
}

main();

