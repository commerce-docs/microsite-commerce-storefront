#!/usr/bin/env node

/**
 * B2B Enrichment Validation and Cleanup Script
 * 
 * This script validates that B2B drop-in enrichment files (containers.json) 
 * only contain parameters from their OWN containers, not from other drop-ins.
 * 
 * The Problem:
 * - Enrichment files were getting polluted with parameters from ALL B2B drop-ins
 * - For example, company-switcher/containers.json had parameters from:
 *   purchase-order, requisition-list, approval-rules, etc.
 * 
 * This Script:
 * 1. Reads each B2B drop-in's container documentation
 * 2. Extracts actual container names and parameters from source code
 * 3. Validates enrichment files only reference their own containers
 * 4. Can automatically clean polluted files (with --fix flag)
 * 
 * Usage:
 *   node scripts/validate-b2b-enrichments.js              # Check all B2B drop-ins
 *   node scripts/validate-b2b-enrichments.js --fix        # Fix polluted files
 *   node scripts/validate-b2b-enrichments.js company-switcher  # Check specific drop-in
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const B2B_DROPINS = [
    'company-management',
    'company-switcher',
    'purchase-order',
    'quote-management',
    'requisition-list'
];

// Get command line args
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const specificDropin = args.find(arg => !arg.startsWith('--'));

/**
 * Extract actual container names from a drop-in's source code
 */
function getActualContainersForDropin(dropinName) {
    const repoPath = join(projectRoot, '.temp-repos', dropinName);
    const containersPath = join(repoPath, 'src', 'containers');

    if (!existsSync(containersPath)) {
        console.log(`   ⚠️  Source not found: ${containersPath}`);
        console.log(`      Run: npm run bootstrap-b2b-dropin ${dropinName}`);
        return null;
    }

    const containers = new Set();
    const items = readdirSync(containersPath, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            // B2B drop-ins use directories (e.g., containers/CompanySwitcher/)
            containers.add(item.name);
        } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
            // B2C drop-ins use files (e.g., containers/CartSummaryList.tsx)
            const baseName = item.name.replace(/\.(tsx?|jsx?)$/, '');
            if (baseName !== 'index') {
                containers.add(baseName);
            }
        }
    }

    return Array.from(containers).sort();
}

/**
 * Get all parameter names from ALL B2B drop-ins (for detecting cross-contamination)
 */
function getAllB2BParameters() {
    const allParams = new Map(); // parameter name -> Set of drop-ins that use it

    for (const dropinName of B2B_DROPINS) {
        const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropinName, 'containers.json');

        if (!existsSync(enrichmentPath)) continue;

        try {
            const data = JSON.parse(readFileSync(enrichmentPath, 'utf8'));

            for (const [containerName, containerData] of Object.entries(data)) {
                const params = containerData.parameters || {};

                for (const paramName of Object.keys(params)) {
                    if (!allParams.has(paramName)) {
                        allParams.set(paramName, new Set());
                    }
                    allParams.get(paramName).add(`${dropinName}:${containerName}`);
                }
            }
        } catch (error) {
            // Ignore parse errors
        }
    }

    return allParams;
}

/**
 * Identify parameters that are likely pollution (used in other drop-ins but not this one)
 */
function identifyPollutedParameters(dropinName, containerName, parameters, allParams) {
    const polluted = [];
    const ownPrefix = `${dropinName}:${containerName}`;

    for (const paramName of Object.keys(parameters)) {
        const usedIn = allParams.get(paramName);

        if (usedIn && usedIn.size > 1 && !usedIn.has(ownPrefix)) {
            // This parameter is used in other drop-ins but NOT in this container
            polluted.push({
                name: paramName,
                appearsIn: Array.from(usedIn).filter(ref => !ref.startsWith(dropinName + ':'))
            });
        }
    }

    return polluted;
}

/**
 * Validate a specific drop-in's enrichment file
 */
function validateDropin(dropinName, allParams) {
    console.log(`\n📦 Validating ${dropinName}...\n`);

    const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropinName, 'containers.json');

    if (!existsSync(enrichmentPath)) {
        console.log(`   ℹ️  No containers.json found - OK\n`);
        return { valid: true, issues: 0 };
    }

    let data;
    try {
        data = JSON.parse(readFileSync(enrichmentPath, 'utf8'));
    } catch (error) {
        console.log(`   ❌ Failed to parse JSON: ${error.message}\n`);
        return { valid: false, issues: 1 };
    }

    // Get actual containers from source
    const actualContainers = getActualContainersForDropin(dropinName);

    let issues = 0;
    const cleanedData = {};

    for (const [containerName, containerData] of Object.entries(data)) {
        console.log(`   🔍 ${containerName}`);

        // Check if this container actually exists
        if (actualContainers && !actualContainers.includes(containerName)) {
            console.log(`      ⚠️  Container doesn't exist in ${dropinName} source code`);
            console.log(`      📝 Actual containers: ${actualContainers.join(', ')}`);
            issues++;
            continue; // Skip this container in cleaned data
        }

        const parameters = containerData.parameters || {};
        const polluted = identifyPollutedParameters(dropinName, containerName, parameters, allParams);

        if (polluted.length > 0) {
            console.log(`      ❌ ${polluted.length} polluted parameter(s) found:`);
            polluted.forEach(p => {
                console.log(`         - ${p.name} (appears in: ${p.appearsIn.join(', ')})`);
            });
            issues += polluted.length;

            // Create cleaned version
            if (shouldFix) {
                const cleanedParams = {};
                for (const [paramName, paramData] of Object.entries(parameters)) {
                    if (!polluted.some(p => p.name === paramName)) {
                        cleanedParams[paramName] = paramData;
                    }
                }
                cleanedData[containerName] = {
                    ...containerData,
                    parameters: cleanedParams
                };
            }
        } else {
            console.log(`      ✅ Clean`);
            cleanedData[containerName] = containerData;
        }
    }

    if (issues > 0 && shouldFix) {
        // Write cleaned version
        writeFileSync(enrichmentPath, JSON.stringify(cleanedData, null, 2) + '\n', 'utf8');
        console.log(`\n   🔧 Fixed: ${enrichmentPath}`);
        console.log(`   📊 Removed ${issues} polluted parameters\n`);
    }

    return { valid: issues === 0, issues };
}

// Main execution
console.log('\n' + '='.repeat(70));
console.log('🧹 B2B ENRICHMENT VALIDATION');
console.log('='.repeat(70));

if (shouldFix) {
    console.log('\n⚠️  FIX MODE ENABLED - Will clean polluted files\n');
} else {
    console.log('\n📋 CHECK MODE - Use --fix to clean polluted files\n');
}

// Get all parameters across all B2B drop-ins
console.log('📊 Analyzing all B2B enrichment files...\n');
const allParams = getAllB2BParameters();
console.log(`   Found ${allParams.size} unique parameters across ${B2B_DROPINS.length} B2B drop-ins\n`);

// Validate drop-ins
const dropinsToCheck = specificDropin ? [specificDropin] : B2B_DROPINS;
let totalIssues = 0;
let totalValid = 0;

for (const dropinName of dropinsToCheck) {
    const result = validateDropin(dropinName, allParams);
    totalIssues += result.issues;
    if (result.valid) totalValid++;
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(70) + '\n');

console.log(`   Checked: ${dropinsToCheck.length} drop-in(s)`);
console.log(`   ✅ Clean: ${totalValid}`);
console.log(`   ❌ Issues: ${totalIssues}\n`);

if (totalIssues > 0) {
    if (shouldFix) {
        console.log('✨ All polluted parameters have been removed!\n');
        console.log('📝 Next steps:');
        console.log('   1. Review the changes: git diff _dropin-enrichments/');
        console.log('   2. Commit if correct: git add _dropin-enrichments/ && git commit\n');
    } else {
        console.log('⚠️  Issues found! Run with --fix to clean polluted files:\n');
        console.log('   node scripts/validate-b2b-enrichments.js --fix\n');
    }
    process.exit(1);
} else {
    console.log('✅ All B2B enrichment files are clean!\n');
}

console.log('='.repeat(70) + '\n');

