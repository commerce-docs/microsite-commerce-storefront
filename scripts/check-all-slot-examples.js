#!/usr/bin/env node

/**
 * Comprehensive Slot Example Checker
 * 
 * Checks all drop-ins to verify:
 * 1. Which slots have examples extracted from boilerplate/repos
 * 2. Which slots are missing examples
 * 3. Which blocks in boilerplate contain slot examples that might be missed
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './lib/generator-core.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();

// Track results
const results = {
    withExamples: [],
    missingExamples: [],
    noSlots: [],
    errors: []
};

console.log('🔍 Checking slot examples for all drop-ins...\n');

for (const [dropinName, config] of Object.entries(DROPIN_REPOS)) {
    try {
        console.log(`Checking ${dropinName}...`);

        const basePath = config.type === 'B2B' ? 'dropins-b2b' : 'dropins';
        const slotsFile = join(projectRoot, 'src/content/docs', basePath, dropinName, 'slots.mdx');

        if (!existsSync(slotsFile)) {
            console.log(`  ⚠️  No slots.mdx file found\n`);
            continue;
        }

        const content = readFileSync(slotsFile, 'utf-8');

        // Check if drop-in has no slots
        if (content.includes('does not expose any slots') || content.includes('Why no slots?')) {
            results.noSlots.push(dropinName);
            console.log(`  ✓ No slots (as expected)\n`);
            continue;
        }

        // Extract container names and their slots
        const containerMatches = [...content.matchAll(/## (\w+) slots/g)];

        const containers = {};
        for (const match of containerMatches) {
            const containerName = match[1];
            containers[containerName] = { slots: [], examples: [] };

            // Find slots for this container
            const containerSectionStart = content.indexOf(`## ${containerName} slots`);
            const nextSectionMatch = content.substring(containerSectionStart).match(/\n## \w+ slots/);
            const containerSectionEnd = nextSectionMatch ? containerSectionStart + nextSectionMatch.index : content.length;
            const containerSection = content.substring(containerSectionStart, containerSectionEnd);

            // Extract slot names from interface
            const slotInterfaceMatches = [...containerSection.matchAll(/(\w+)\??\s*:\s*SlotProps/g)];
            for (const slotMatch of slotInterfaceMatches) {
                containers[containerName].slots.push(slotMatch[1]);
            }

            // Find examples for this container
            const exampleMatches = [...containerSection.matchAll(/### (\w+) example/g)];
            for (const exampleMatch of exampleMatches) {
                containers[containerName].examples.push(exampleMatch[1]);
            }
        }

        // Analyze results
        let hasMissing = false;
        let hasExamples = false;

        for (const [containerName, data] of Object.entries(containers)) {
            const missingSlots = data.slots.filter(slot => !data.examples.includes(slot));

            if (missingSlots.length > 0) {
                hasMissing = true;
                results.missingExamples.push({
                    dropin: dropinName,
                    container: containerName,
                    missingSlots: missingSlots,
                    totalSlots: data.slots.length,
                    hasExamples: data.examples.length
                });
            }

            if (data.examples.length > 0) {
                hasExamples = true;
            }
        }

        if (hasExamples && !hasMissing) {
            results.withExamples.push(dropinName);
            console.log(`  ✓ All slots have examples\n`);
        } else if (hasMissing) {
            console.log(`  ⚠️  Some slots missing examples\n`);
        } else {
            console.log(`  ⚠️  No examples found\n`);
        }

    } catch (error) {
        results.errors.push({ dropin: dropinName, error: error.message });
        console.log(`  ❌ Error: ${error.message}\n`);
    }
}

// Print summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

console.log(`\n✅ Drop-ins with all examples (${results.withExamples.length}):`);
for (const dropin of results.withExamples) {
    console.log(`   - ${dropin}`);
}

console.log(`\n⚠️  Drop-ins with missing examples (${results.missingExamples.length} containers):`);
const missingByDropin = {};
for (const item of results.missingExamples) {
    if (!missingByDropin[item.dropin]) {
        missingByDropin[item.dropin] = [];
    }
    missingByDropin[item.dropin].push(item);
}

for (const [dropin, items] of Object.entries(missingByDropin)) {
    console.log(`\n   ${dropin}:`);
    for (const item of items) {
        console.log(`     Container: ${item.container}`);
        console.log(`       Missing: ${item.missingSlots.join(', ')}`);
        console.log(`       Has examples: ${item.hasExamples}/${item.totalSlots}`);
    }
}

console.log(`\n📦 Drop-ins with no slots (${results.noSlots.length}):`);
for (const dropin of results.noSlots) {
    console.log(`   - ${dropin}`);
}

if (results.errors.length > 0) {
    console.log(`\n❌ Errors (${results.errors.length}):`);
    for (const error of results.errors) {
        console.log(`   - ${error.dropin}: ${error.error}`);
    }
}

console.log('\n' + '='.repeat(80));
