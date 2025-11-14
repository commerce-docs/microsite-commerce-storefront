#!/usr/bin/env node

/**
 * Enrichment Extraction Script
 * 
 * This script extracts structured content from manually-created functions.mdx files
 * on the develop branch and converts them to enrichment JSON format.
 * 
 * USAGE: node scripts/@extract-enrichment-from-manual.js <dropin-name>
 * Example: node scripts/@extract-enrichment-from-manual.js cart
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function extractFunctionsFromMDX(mdxContent) {
    const functions = {};

    // Split by H2 headings (## functionName)
    const functionBlocks = mdxContent.split(/\n## (?=[a-z])/);

    // Skip the first block (front matter and intro)
    for (let i = 1; i < functionBlocks.length; i++) {
        const block = functionBlocks[i];

        // Extract function name (first line)
        const nameMatch = block.match(/^([a-zA-Z0-9_]+)/);
        if (!nameMatch) continue;

        const functionName = nameMatch[1];
        console.log(`  📝 Extracting ${functionName}...`);

        const enrichment = {};

        // Extract description (first paragraph after function name)
        const descMatch = block.match(/^[a-zA-Z0-9_]+\n\n(.+?)(?=\n\n```|$)/s);
        if (descMatch) {
            enrichment.description = descMatch[1].trim();
        }

        // Extract parameters from OptionsTable
        const paramsMatch = block.match(/<OptionsTable[\s\S]*?options=\{(\[[\s\S]*?\])\}[\s\S]*?\/>/);
        if (paramsMatch) {
            try {
                // Clean up the options array string for parsing
                const optionsStr = paramsMatch[1]
                    .replace(/\\/g, '\\\\') // Escape backslashes
                    .replace(/(['"])\s*\n\s*/g, '$1,\n    '); // Fix line breaks in strings

                const options = eval(optionsStr); // Use eval carefully - we control the input
                enrichment.parameters = options;
            } catch (e) {
                console.warn(`    ⚠️  Failed to parse parameters for ${functionName}: ${e.message}`);
            }
        }

        // Extract Returns section
        const returnsMatch = block.match(/### Returns\n\n([\s\S]*?)(?=\n### |---|\n\n## |$)/);
        if (returnsMatch) {
            enrichment.returns = returnsMatch[1].trim();
        }

        // Extract Events section
        const eventsMatch = block.match(/### Events\n\n([\s\S]*?)(?=\n### |---|\n\n## |$)/);
        if (eventsMatch) {
            enrichment.events = eventsMatch[1].trim();
        }

        // Extract Usage/Examples section
        const usageMatch = block.match(/### Usage\n\n([\s\S]*?)(?=\n### |---|\n\n## |$)/);
        if (usageMatch) {
            const usageContent = usageMatch[1].trim();

            // Check if there are multiple examples (indicated by text before code blocks)
            const exampleBlocks = usageContent.split(/\n\n(?=To |For |When |Example)/);

            if (exampleBlocks.length > 1) {
                // Multiple examples
                enrichment.examples = [];
                exampleBlocks.forEach(exBlock => {
                    const titleMatch = exBlock.match(/^(.+?):/);
                    const codeMatch = exBlock.match(/```[a-z]*\n([\s\S]*?)```/);

                    if (codeMatch) {
                        const example = {};
                        if (titleMatch) {
                            example.title = titleMatch[1].trim();
                        }
                        example.code = codeMatch[1].trim();
                        enrichment.examples.push(example);
                    }
                });

                if (enrichment.examples.length === 0) {
                    delete enrichment.examples;
                }
            } else {
                // Single example
                const codeMatch = usageContent.match(/```[a-z]*\n([\s\S]*?)```/);
                if (codeMatch) {
                    enrichment.usage = codeMatch[1].trim();
                }
            }
        }

        // Only add if we extracted meaningful content
        if (Object.keys(enrichment).length > 0) {
            functions[functionName] = enrichment;
        }
    }

    return functions;
}

async function main() {
    const dropinName = process.argv[2];

    if (!dropinName) {
        console.error('❌ Error: Please specify a drop-in name');
        console.log('Usage: node scripts/@extract-enrichment-from-manual.js <dropin-name>');
        process.exit(1);
    }

    console.log(`\n🔍 Extracting enrichment data for ${dropinName}...\n`);

    // Get the file from develop branch
    try {
        const mdxPath = `src/content/docs/dropins/${dropinName}/functions.mdx`;
        console.log(`  📖 Reading ${mdxPath} from develop branch...`);

        const mdxContent = execSync(`git show origin/develop:${mdxPath}`, {
            encoding: 'utf8',
            cwd: projectRoot
        });

        // Extract structured content
        const functions = extractFunctionsFromMDX(mdxContent);

        console.log(`\n  ✅ Extracted ${Object.keys(functions).length} functions`);

        // Write to enrichment file
        const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropinName, 'functions.json');
        writeFileSync(enrichmentPath, JSON.stringify(functions, null, 2));

        console.log(`  💾 Saved to ${enrichmentPath}\n`);

    } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

main();

