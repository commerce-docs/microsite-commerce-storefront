/**
 * Function Type Validator
 * 
 * Validates function documentation to ensure no generic/useless types are exposed
 * in function signatures, parameters, or return types.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { GenericTypeHandler } from './core/generic-type-handler.js';

/**
 * Extract and validate function signatures from generated MDX files
 */
function extractFunctionSignatures(mdxContent, filePath) {
    const issues = [];
    const lines = mdxContent.split('\n');

    let inCodeBlock = false;
    let currentFunction = null;
    let signatureLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Track current function
        if (line.match(/^## /)) {
            const match = line.match(/^## ([a-zA-Z0-9_]+)/);
            if (match) {
                currentFunction = match[1];
            }
        }

        // Detect function signature code blocks
        if (line.trim() === '```ts' || line.trim() === '```typescript') {
            inCodeBlock = true;
            signatureLines = [];
            continue;
        }

        if (inCodeBlock && line.trim() === '```') {
            inCodeBlock = false;

            // Analyze collected signature
            if (signatureLines.length > 0 && currentFunction) {
                const signature = signatureLines.join('\n');

                // Check for 'any' in function signature (excluding legitimate uses)
                if (signature.includes(': any') || signature.includes('): any')) {
                    // Skip if it's a legitimate any (Record<string, any>, etc.)
                    if (!GenericTypeHandler.isLegitimateAnyUsage(signature)) {
                        issues.push({
                            file: filePath,
                            function: currentFunction,
                            line: lineNum - signatureLines.length,
                            type: 'GENERIC_ANY_IN_SIGNATURE',
                            description: 'Function signature contains generic "any" type',
                            snippet: signature.substring(0, 150)
                        });
                    }
                }

                // Check for other forbidden types
                if (signature.match(/:\s*(unknown|object|Object)\b/)) {
                    issues.push({
                        file: filePath,
                        function: currentFunction,
                        line: lineNum - signatureLines.length,
                        type: 'FORBIDDEN_TYPE_IN_SIGNATURE',
                        description: 'Function signature contains generic type (unknown/object/Object)',
                        snippet: signature.substring(0, 150)
                    });
                }
            }

            signatureLines = [];
            continue;
        }

        if (inCodeBlock) {
            signatureLines.push(line);
        }
    }

    return issues;
}

// Removed: isLegitimateAnyUsage - now using GenericTypeHandler.isLegitimateAnyUsage()

/**
 * Validate all function documentation files
 */
export function validateAllFunctionDocs(projectRoot) {
    console.log('\n🔍 Validating function documentation for generic types...');

    const dropinsDir = join(projectRoot, 'src/content/docs/dropins');
    const dropins = readdirSync(dropinsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    let allIssues = [];

    for (const dropin of dropins) {
        const functionsFile = join(dropinsDir, dropin, 'functions.mdx');

        try {
            const content = readFileSync(functionsFile, 'utf8');
            const issues = extractFunctionSignatures(content, `dropins/${dropin}/functions.mdx`);
            allIssues = allIssues.concat(issues);
        } catch (error) {
            // File might not exist
            continue;
        }
    }

    // Report issues
    if (allIssues.length > 0) {
        console.error('\n❌ Found generic type issues in function documentation:\n');

        for (const issue of allIssues) {
            console.error(`  ${issue.file}`);
            console.error(`    Function: ${issue.function}`);
            console.error(`    Issue: ${issue.description}`);
            console.error(`    Signature: ${issue.snippet}${issue.snippet.length >= 150 ? '...' : ''}`);
            console.error('');
        }

        console.error(`❌ Validation failed: ${allIssues.length} issue(s) found`);
        console.error('   These types should be replaced with specific types from the source code.');
        console.error('   Check the source repository for proper TypeScript definitions.');
        return false;
    }

    console.log('✅ All function signatures validated successfully!');
    return true;
}

/**
 * Run validation as standalone script
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const projectRoot = process.cwd();
    const success = validateAllFunctionDocs(projectRoot);
    process.exit(success ? 0 : 1);
}

