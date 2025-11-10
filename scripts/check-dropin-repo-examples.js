#!/usr/bin/env node

/**
 * Check Drop-in Repos for HTML and JSDoc Examples
 * 
 * Scans cloned drop-in repositories for:
 * 1. HTML examples in examples/html-host/index.html
 * 2. JSDoc examples in container .tsx files
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './lib/generator-core.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();
const tempReposPath = join(projectRoot, '.temp-repos');

console.log('🔍 Checking drop-in repos for HTML and JSDoc examples...\n');

const results = {
    htmlExamples: {},
    jsdocExamples: {}
};

for (const [dropinName, config] of Object.entries(DROPIN_REPOS)) {
    const repoPath = join(tempReposPath, dropinName);

    if (!existsSync(repoPath)) {
        console.log(`⚠️  ${dropinName}: Repository not cloned\n`);
        continue;
    }

    console.log(`Checking ${dropinName}...`);

    // Check for HTML examples
    const htmlExamplePath = join(repoPath, 'examples', 'html-host', 'index.html');
    if (existsSync(htmlExamplePath)) {
        const htmlContent = readFileSync(htmlExamplePath, 'utf-8');
        const slotMatches = [...htmlContent.matchAll(/slots\s*:\s*\{([\s\S]*?)\}/g)];

        if (slotMatches.length > 0) {
            const slotNames = new Set();
            for (const match of slotMatches) {
                const slotNameMatches = [...match[1].matchAll(/(\w+)\s*:\s*(?:async\s+)?\(/g)];
                for (const slotMatch of slotNameMatches) {
                    slotNames.add(slotMatch[1]);
                }
            }

            if (slotNames.size > 0) {
                results.htmlExamples[dropinName] = Array.from(slotNames);
                console.log(`  ✓ HTML examples found: ${Array.from(slotNames).join(', ')}`);
            }
        } else {
            console.log(`  - No slots found in HTML example`);
        }
    } else {
        console.log(`  - No HTML example file found`);
    }

    // Check for JSDoc examples in container files
    const containersPath = join(repoPath, 'src', 'containers');
    if (existsSync(containersPath)) {
        const containers = [];
        function scanContainers(dir) {
            try {
                const entries = readdirSync(dir);
                for (const entry of entries) {
                    const entryPath = join(dir, entry);
                    const stat = statSync(entryPath);
                    if (stat.isDirectory()) {
                        const tsxPath = join(entryPath, `${entry}.tsx`);
                        if (existsSync(tsxPath)) {
                            containers.push(tsxPath);
                        }
                        scanContainers(entryPath);
                    } else if (entry.endsWith('.tsx')) {
                        containers.push(entryPath);
                    }
                }
            } catch (error) {
                // Skip
            }
        }
        scanContainers(containersPath);

        const jsdocSlots = new Set();
        for (const containerFile of containers) {
            try {
                const content = readFileSync(containerFile, 'utf-8');
                // Look for JSDoc with @slot and @example
                const jsdocPattern = /\/\*\*[\s\S]*?@slot\s+(\w+)[\s\S]*?@example[\s\S]*?\*\//g;
                const matches = [...content.matchAll(jsdocPattern)];
                for (const match of matches) {
                    jsdocSlots.add(match[1]);
                }
            } catch (error) {
                // Skip
            }
        }

        if (jsdocSlots.size > 0) {
            results.jsdocExamples[dropinName] = Array.from(jsdocSlots);
            console.log(`  ✓ JSDoc examples found: ${Array.from(jsdocSlots).join(', ')}`);
        } else {
            console.log(`  - No JSDoc examples found`);
        }
    } else {
        console.log(`  - No containers directory found`);
    }

    console.log('');
}

// Summary
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

if (Object.keys(results.htmlExamples).length > 0) {
    console.log('\n📄 HTML Examples Found:');
    for (const [dropin, slots] of Object.entries(results.htmlExamples)) {
        console.log(`  ${dropin}: ${slots.join(', ')}`);
    }
} else {
    console.log('\n📄 No HTML examples found');
}

if (Object.keys(results.jsdocExamples).length > 0) {
    console.log('\n📝 JSDoc Examples Found:');
    for (const [dropin, slots] of Object.entries(results.jsdocExamples)) {
        console.log(`  ${dropin}: ${slots.join(', ')}`);
    }
} else {
    console.log('\n📝 No JSDoc examples found');
}

console.log('\n' + '='.repeat(80));

