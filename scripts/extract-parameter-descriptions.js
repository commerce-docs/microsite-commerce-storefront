#!/usr/bin/env node

/**
 * Extract Parameter Descriptions from Old Function Documentation
 * 
 * This script extracts parameter descriptions from the manually-written function
 * documentation (before the generator overwrote them) and adds them to the
 * enrichment JSON files.
 * 
 * USAGE: node scripts/extract-parameter-descriptions.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

// List of drop-ins to process
const dropins = [
    'cart',
    'checkout',
    'order',
    'payment-services',
    'personalization',
    'product-details',
    'product-discovery',
    'recommendations',
    'user-account',
    'user-auth',
    'wishlist'
];

// Git commit with original manual documentation
const RESTORE_COMMIT = 'c06383cc'; // "restore original function.mdx files"

console.log('🔍 Extracting parameter descriptions from manual documentation...\n');

dropins.forEach(dropin => {
    console.log(`\n📦 Processing ${dropin}...`);

    try {
        // Get the old manual documentation from git
        const filePath = `src/content/docs/dropins/${dropin}/functions.mdx`;
        const gitCommand = `git show ${RESTORE_COMMIT}:${filePath}`;

        let oldContent;
        try {
            oldContent = execSync(gitCommand, { cwd: projectRoot, encoding: 'utf8' });
        } catch (error) {
            console.log(`  ⚠️  No manual docs found in git history, skipping...`);
            return;
        }

        // Parse parameter descriptions from OptionsTable
        const paramDescriptions = extractParameterDescriptions(oldContent);

        if (Object.keys(paramDescriptions).length === 0) {
            console.log(`  ℹ️  No parameter descriptions found`);
            return;
        }

        console.log(`  ✅ Found parameter descriptions for ${Object.keys(paramDescriptions).length} function(s)`);

        // Load existing enrichment file
        const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropin, 'functions.json');

        let enrichmentData = {};
        if (existsSync(enrichmentPath)) {
            enrichmentData = JSON.parse(readFileSync(enrichmentPath, 'utf8'));
        }

        // Add parameter descriptions to enrichment
        let updatedCount = 0;
        Object.keys(paramDescriptions).forEach(functionName => {
            if (!enrichmentData[functionName]) {
                enrichmentData[functionName] = {};
            }

            enrichmentData[functionName].parameters = paramDescriptions[functionName];
            updatedCount++;
        });

        // Write back to enrichment file
        writeFileSync(enrichmentPath, JSON.stringify(enrichmentData, null, 2) + '\n', 'utf8');
        console.log(`  💾 Updated ${updatedCount} function(s) in enrichment file`);

    } catch (error) {
        console.error(`  ❌ Error processing ${dropin}:`, error.message);
    }
});

console.log('\n✨ Extraction complete!\n');

/**
 * Extract parameter descriptions from MDX content
 * 
 * Looks for OptionsTable components with parameter information:
 * <OptionsTable
 *   options={[
 *     ['Parameter', 'Type', 'Req?', 'Description'],
 *     ['paramName', 'type', 'Yes', 'The description here'],
 *   ]}
 * />
 * 
 * @param {string} mdxContent - The MDX file content
 * @returns {Object} Map of functionName -> { paramName: { description, type, required } }
 */
function extractParameterDescriptions(mdxContent) {
    const result = {};

    // Split content into function sections (each starts with ## functionName)
    const functionSections = mdxContent.split(/^## /m);

    functionSections.forEach(section => {
        if (!section.trim()) return;

        // Extract function name from first line
        const firstLine = section.split('\n')[0];
        const functionName = firstLine.trim();

        if (!functionName || functionName.includes('#')) return;

        // Look for OptionsTable in this section
        const optionsTableMatch = section.match(/<OptionsTable[\s\S]*?options=\{(\[[\s\S]*?\])\}[\s\S]*?\/>/);

        if (optionsTableMatch) {
            try {
                // Extract the array from the JSX
                const optionsArray = eval(optionsTableMatch[1]); // Safe since this is our own code

                // Skip header row, process parameter rows
                const params = {};
                for (let i = 1; i < optionsArray.length; i++) {
                    const [paramName, type, required, description] = optionsArray[i];

                    if (paramName && description && description !== 'See function signature above') {
                        params[paramName] = {
                            description,
                            type,
                            required: required === 'Yes'
                        };
                    }
                }

                if (Object.keys(params).length > 0) {
                    result[functionName] = params;
                }
            } catch (error) {
                // Skip if we can't parse the options array
            }
        }
    });

    return result;
}

