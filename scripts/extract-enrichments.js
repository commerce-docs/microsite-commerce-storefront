#!/usr/bin/env node

/**
 * Enrichment Extraction Helper
 * 
 * This script helps extract manual function documentation from the develop branch
 * and converts it into enrichment JSON files.
 * 
 * USAGE:
 * node scripts/extract-enrichments.js <dropin-name>
 * 
 * Example:
 * node scripts/extract-enrichments.js cart
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const dropinName = process.argv[2];

if (!dropinName) {
    console.error('Usage: node scripts/extract-enrichments.js <dropin-name>');
    console.error('Example: node scripts/extract-enrichments.js cart');
    process.exit(1);
}

console.log(`\n🔍 Extracting enrichment data for ${dropinName}...\n`);

// Get the file from develop branch
let mdxContent;
try {
    mdxContent = execFileSync('git', ['show', `origin/develop:src/content/docs/dropins/${dropinName}/functions.mdx`], { encoding: 'utf8' });
} catch (error) {
    console.error(`❌ Could not find functions.mdx for ${dropinName} on develop branch`);
    process.exit(1);
}

// Parse the MDX content
const functions = {};
const functionMatches = mdxContent.matchAll(/## (\w+)\n\n/g);

for (const match of functionMatches) {
    const functionName = match[1];
    const startIndex = match.index;

    // Find the next function or end of file
    const nextMatch = mdxContent.substring(startIndex + match[0].length).match(/\n## \w+\n\n/);
    const endIndex = nextMatch ? startIndex + match[0].length + nextMatch.index : mdxContent.length;

    const functionContent = mdxContent.substring(startIndex + match[0].length, endIndex);

    // Extract description (first paragraph)
    const descMatch = functionContent.match(/^(.+?)(?=\n\n|```)/s);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract parameters from OptionsTable
    const paramsMatch = functionContent.match(/<OptionsTable[\s\S]*?options=\{([\s\S]*?)\}\s*\/>/);
    let parameters = null;
    if (paramsMatch) {
        try {
            // Extract the array content
            const arrayContent = paramsMatch[1];
            // This is a rough parse - may need manual cleanup
            parameters = eval(arrayContent);
        } catch (e) {
            console.warn(`  ⚠️  Could not auto-parse parameters for ${functionName}`);
        }
    }

    // Extract Returns section
    const returnsMatch = functionContent.match(/### Returns\n\n([\s\S]*?)(?=\n### |\n## |$)/);
    const returns = returnsMatch ? returnsMatch[1].trim().split('\n')[0] : null;

    // Extract Events section
    const eventsMatch = functionContent.match(/### Events\n\n([\s\S]*?)(?=\n### |\n## |$)/);
    const events = eventsMatch ? eventsMatch[1].trim().split('\n')[0] : null;

    // Extract Usage/Examples
    const usageMatch = functionContent.match(/### Usage\n\n([\s\S]*?)(?=\n## |$)/);
    let examples = null;
    if (usageMatch) {
        const usageContent = usageMatch[1].trim();
        // Look for multiple examples with titles
        const exampleMatches = [...usageContent.matchAll(/(?:^|To )([^:]+):\n\n```[\w]*\n([\s\S]*?)```/g)];

        if (exampleMatches.length > 0) {
            examples = exampleMatches.map(m => ({
                title: 'To ' + m[1].trim(),
                code: m[2].trim()
            }));
        } else {
            // Single example
            const codeMatch = usageContent.match(/```[\w]*\n([\s\S]*?)```/);
            if (codeMatch) {
                examples = [{ code: codeMatch[1].trim() }];
            }
        }
    }

    // Build enrichment object (only include non-null fields)
    const enrichment = {};
    if (description) enrichment.description = description;
    if (parameters) enrichment.parameters = parameters;
    if (returns) enrichment.returns = returns;
    if (events) enrichment.events = events;
    if (examples) enrichment.examples = examples;

    if (Object.keys(enrichment).length > 0) {
        functions[functionName] = enrichment;
        console.log(`  ✓ Extracted ${functionName}`);
    }
}

// Write to enrichment file
const enrichmentDir = join(projectRoot, '_dropin-enrichments', dropinName);
if (!existsSync(enrichmentDir)) {
    mkdirSync(enrichmentDir, { recursive: true });
}

const enrichmentPath = join(enrichmentDir, 'functions.json');
writeFileSync(enrichmentPath, JSON.stringify(functions, null, 2), 'utf8');

console.log(`\n✅ Extracted ${Object.keys(functions).length} functions to ${enrichmentPath}`);
console.log(`\n⚠️  Please review the file and manually fix any parsing issues.\n`);

