/**
 * Payload Type Validator
 * 
 * Validates event documentation to ensure no generic/useless types are exposed.
 * This runs automatically after documentation generation to catch issues.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { GenericTypeHandler } from './core/generic-type-handler.js';

/**
 * Types that should never appear as standalone payload types
 */
const FORBIDDEN_STANDALONE_TYPES = ['any', 'unknown', 'object', 'Object'];

/**
 * Patterns that indicate incomplete/generic typing
 */
const PROBLEMATIC_PATTERNS = [
    { pattern: /^any$/, description: 'Standalone "any" type' },
    { pattern: /^unknown$/, description: 'Standalone "unknown" type' },
    { pattern: /^object$/, description: 'Standalone "object" type' },
    { pattern: /^Object$/, description: 'Standalone "Object" type' },
];

/**
 * Extract payload types from generated MDX files
 */
function extractPayloadTypes(mdxContent, filePath) {
    const issues = [];
    const lines = mdxContent.split('\n');

    let inPayloadSection = false;
    let inCodeBlock = false;
    let currentEvent = null;
    let payloadLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Track current event
        if (line.match(/^### `([^`]+)` \(/)) {
            const match = line.match(/^### `([^`]+)` \(/);
            currentEvent = match[1];
        }

        // Detect payload section
        if (line.includes('#### Event payload')) {
            inPayloadSection = true;
            payloadLines = [];
            continue;
        }

        // Exit payload section
        if (inPayloadSection && line.includes('#### Usage')) {
            inPayloadSection = false;

            // Analyze collected payload
            if (payloadLines.length > 0) {
                const payloadType = payloadLines.join('\n').trim();

                // Check for forbidden standalone types
                for (const { pattern, description } of PROBLEMATIC_PATTERNS) {
                    if (pattern.test(payloadType)) {
                        issues.push({
                            file: filePath,
                            event: currentEvent,
                            line: lineNum,
                            type: 'FORBIDDEN_TYPE',
                            description,
                            snippet: payloadType
                        });
                    }
                }

                // Check for 'any' within complex types (excluding legitimate uses)
                if (payloadType.includes('any') && !GenericTypeHandler.isLegitimateAnyUsage(payloadType)) {
                    issues.push({
                        file: filePath,
                        event: currentEvent,
                        line: lineNum,
                        type: 'GENERIC_ANY',
                        description: 'Type contains generic "any"',
                        snippet: payloadType
                    });
                }
            }

            payloadLines = [];
            continue;
        }

        // Collect payload content
        if (inPayloadSection) {
            if (line.trim() === '```typescript') {
                inCodeBlock = true;
                continue;
            }
            if (line.trim() === '```') {
                inCodeBlock = false;
                continue;
            }
            if (inCodeBlock) {
                payloadLines.push(line);
            }
        }
    }

    return issues;
}

// Removed: isLegitimateAnyUsage - now using GenericTypeHandler.isLegitimateAnyUsage()

/**
 * Validate all event documentation files
 */
export function validateAllEventDocs(projectRoot) {
    console.log('\n🔍 Validating event documentation for generic types...');

    const dropinsDir = join(projectRoot, 'src/content/docs/dropins');
    const dropins = readdirSync(dropinsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    let allIssues = [];

    for (const dropin of dropins) {
        const eventsFile = join(dropinsDir, dropin, 'events.mdx');

        try {
            const content = readFileSync(eventsFile, 'utf8');
            const issues = extractPayloadTypes(content, `dropins/${dropin}/events.mdx`);
            allIssues = allIssues.concat(issues);
        } catch (error) {
            // File might not exist (e.g., no events page for this dropin)
            continue;
        }
    }

    // Report issues
    if (allIssues.length > 0) {
        console.error('\n❌ Found generic type issues:\n');

        for (const issue of allIssues) {
            console.error(`  ${issue.file}`);
            console.error(`    Event: ${issue.event}`);
            console.error(`    Issue: ${issue.description}`);
            console.error(`    Type: ${issue.snippet.substring(0, 100)}${issue.snippet.length > 100 ? '...' : ''}`);
            console.error('');
        }

        console.error(`❌ Validation failed: ${allIssues.length} issue(s) found`);
        console.error('   These types should be replaced with specific types from enrichment files.');
        return false;
    }

    console.log('✅ All event payload types validated successfully!');
    return true;
}

/**
 * Run validation as standalone script
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const projectRoot = process.cwd();
    const success = validateAllEventDocs(projectRoot);
    process.exit(success ? 0 : 1);
}

