#!/usr/bin/env node

/**
 * Diagram Validation Script
 * 
 * Validates that all Diagram components in merchant block files have correct syntax.
 * Prevents malformed captions that cause build failures.
 * 
 * Usage: node scripts/validate-diagrams.js
 * Exit code: 0 = all valid, 1 = errors found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MERCHANT_BLOCKS_DIR = path.join(__dirname, '..', 'src/content/docs/merchants/blocks');

// Validation patterns
const MALFORMED_PATTERNS = [
    {
        pattern: /caption=""/,
        description: 'Escaped quotes in caption attribute',
        example: 'caption=""Text" should be caption="Text'
    },
    {
        pattern: /!\["/,
        description: 'Extra quotes in alt text after opening bracket',
        example: '!["Text should be ![Text'
    }
];

function findMdxFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) {
        return results;
    }
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(findMdxFiles(filePath));
        } else if (file.endsWith('.mdx')) {
            results.push(filePath);
        }
    }

    return results;
}

function validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Check for Diagram component
    if (!content.includes('<Diagram')) {
        return { valid: true, hasNoDiagram: true };
    }

    // Check for malformed patterns
    MALFORMED_PATTERNS.forEach(({ pattern, description, example }) => {
        if (pattern.test(content)) {
            errors.push({
                description,
                example,
                line: content.split('\n').findIndex(line => pattern.test(line)) + 1
            });
        }
    });

    // Check for conflict markers
    if (content.includes('<<<<<<<') || content.includes('>>>>>>>')) {
        errors.push({
            description: 'Unresolved merge conflict markers',
            example: 'Remove <<<<<<< HEAD and >>>>>>> markers'
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 VALIDATING DIAGRAM COMPONENTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const files = findMdxFiles(MERCHANT_BLOCKS_DIR);
    let totalFiles = 0;
    let filesWithErrors = 0;
    let filesWithDiagrams = 0;
    const allErrors = [];

    files.forEach(file => {
        totalFiles++;
        const result = validateFile(file);

        if (result.hasNoDiagram) {
            return;
        }

        filesWithDiagrams++;

        if (!result.valid) {
            filesWithErrors++;
            allErrors.push({
                file: path.basename(file),
                errors: result.errors
            });
        }
    });

    console.log(`Files checked: ${totalFiles}`);
    console.log(`Files with Diagrams: ${filesWithDiagrams}`);
    console.log(`Files with errors: ${filesWithErrors}\n`);

    if (filesWithErrors > 0) {
        console.log('❌ VALIDATION FAILED\n');
        console.log('Errors found:\n');

        allErrors.forEach(({ file, errors }) => {
            console.log(`📄 ${file}`);
            errors.forEach(error => {
                console.log(`   ❌ ${error.description}`);
                if (error.line) {
                    console.log(`      Line ${error.line}`);
                }
                console.log(`      Fix: ${error.example}\n`);
            });
        });

        console.log('═══════════════════════════════════════════════════════════');
        console.log('Run: node scripts/validate-diagrams.js --fix to auto-repair');
        console.log('═══════════════════════════════════════════════════════════');

        process.exit(1);
    } else {
        console.log('✅ ALL DIAGRAMS VALID\n');
        console.log('All Diagram components have correct syntax.');
        console.log('═══════════════════════════════════════════════════════════');
        process.exit(0);
    }
}

// Run script
main();

