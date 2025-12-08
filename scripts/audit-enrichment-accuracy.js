#!/usr/bin/env node
/**
 * Audit Enrichment Accuracy
 * 
 * Verifies that enrichment data matches actual source code:
 * - Validates `returns` fields have correct types and verification
 * - Validates `events` fields match emitted events in source
 * - Checks for missing enrichment on functions that need it
 * - Validates GraphQL references and JSON examples
 * 
 * Usage:
 *   npm run audit-enrichments          # Check all drop-ins
 *   npm run audit-enrichments cart     # Check specific drop-in
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const dropinArg = process.argv[2];

/**
 * Extract events emitted by a function from its source code
 * 
 * @param {string} content - Function source code content
 * @returns {string[]} Array of event names (e.g., ['cart/updated', 'cart/data'])
 */
function extractEventsFromSource(content) {
    const events = new Set();

    // Look for event emission patterns:
    // - events.emit('event/name')
    // - eventBus.emit('event/name')
    // - publish('event/name')
    // - emit('event/name')
    const emitPatterns = [
        /events\.emit\(['"]([^'"]+)['"]/g,
        /eventBus\.emit\(['"]([^'"]+)['"]/g,
        /publish\(['"]([^'"]+)['"]/g,
        /\.emit\(['"]([^'"]+)['"]/g,
    ];

    for (const pattern of emitPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const eventName = match[1];
            // Only add if it looks like an event name (has a slash)
            if (eventName.includes('/')) {
                events.add(eventName);
            }
        }
    }

    return Array.from(events).sort();
}

/**
 * Extract event names from enrichment text
 * 
 * @param {string} eventsText - Text from enrichment.events field
 * @returns {string[]} Array of event names
 */
function extractEventsFromEnrichment(eventsText) {
    const eventMentions = eventsText.match(/`([^`]+\/[^`]+)`/g);
    if (!eventMentions) return [];
    return eventMentions.map(e => e.replace(/`/g, '')).sort();
}

console.log('\n' + '='.repeat(70));
console.log('📋 ENRICHMENT ACCURACY AUDIT');
console.log('='.repeat(70) + '\n');

let totalChecked = 0;
let totalIssues = 0;
let totalVerified = 0;
let totalWithEnrichment = 0;
let totalNoEnrichment = 0;
let totalSuggestions = 0;

// Get dropins to check
const dropinsToCheck = dropinArg
    ? { [dropinArg]: DROPIN_REPOS[dropinArg] }
    : DROPIN_REPOS;

for (const [repoName, repoConfig] of Object.entries(dropinsToCheck)) {
    if (!repoConfig) {
        console.log(`⚠️  Unknown dropin: ${repoName}\n`);
        continue;
    }

    console.log(`\n📦 Checking ${repoConfig.displayName}...\n`);

    // Load enrichment file
    const enrichmentPath = join(projectRoot, '_dropin-enrichments', repoName, 'functions.json');
    if (!existsSync(enrichmentPath)) {
        console.log(`   ℹ️  No enrichment file found\n`);
        continue;
    }

    const enrichments = JSON.parse(readFileSync(enrichmentPath, 'utf-8'));
    const repoPath = join(projectRoot, '.temp-repos', repoName);

    if (!existsSync(repoPath)) {
        console.log(`   ⚠️  Repository not cloned. Run: npm run generate-function-docs ${repoName}\n`);
        continue;
    }

    // Check EVERY function (not just those with returns)
    for (const [funcName, enrichment] of Object.entries(enrichments)) {
        totalChecked++;
        console.log(`   🔍 ${funcName}`);

        // Check if function exists in source
        const functionPath = join(repoPath, 'src', 'api', funcName, `${funcName}.ts`);
        if (!existsSync(functionPath)) {
            console.log(`      ❌ Function file not found: ${functionPath}`);
            totalIssues++;
            continue;
        }

        const content = readFileSync(functionPath, 'utf-8');

        // Track if this function has any enrichment data
        const hasEnrichment = enrichment.returns || enrichment.events || enrichment.examples ||
            (enrichment.description && enrichment.description.includes('mutation'));

        if (hasEnrichment) {
            totalWithEnrichment++;
        } else {
            totalNoEnrichment++;

            // === ANALYZE FUNCTIONS WITHOUT ENRICHMENT ===
            // Check if they SHOULD have enrichment based on source analysis

            // Check 1: Does it return any/unknown?
            const returnsAnyMatch = content.match(/export\s+(?:const|function)\s+\w+[^:]*:\s*[^=]*Promise<(any|unknown)(\s*\|\s*\w+)?>/);
            if (returnsAnyMatch) {
                console.log(`      ⚠️  [Missing Enrichment] Returns \`${returnsAnyMatch[1]}\` - should add \`returns\` field with accurate type`);
                totalIssues++;
            }

            // Check 2: Does it emit events?
            const emitsEvents = content.match(/events\.emit\(['"]([^'"]+)['"]/g);
            if (emitsEvents && emitsEvents.length > 0) {
                const eventNames = emitsEvents.map(e => e.match(/['"]([^'"]+)['"]/)[1]);
                console.log(`      💡 [Suggestion] Emits ${eventNames.length} event(s): ${eventNames.map(e => `\`${e}\``).join(', ')} - consider adding \`events\` field for context`);
                totalSuggestions++;
            }

            // Check 3: Does it call a GraphQL mutation/query?
            const hasGraphQL = content.match(/fetchGraphQl\(/);
            if (hasGraphQL && !enrichment.description) {
                console.log(`      💡 [Suggestion] Calls GraphQL - consider adding description with link to mutation/query docs`);
                totalSuggestions++;
            }

            // Check 4: Are examples available from higher-priority sources?
            // Priority: JSDoc → HTML Examples → Boilerplate → Reference Repos → Enrichment
            let examplesAvailable = false;

            // Check JSDoc examples
            if (content.includes('@example')) {
                examplesAvailable = true;
                console.log(`      ✅ [Examples] Found in JSDoc (highest priority source)`);
            }

            // Check HTML examples
            const htmlExamplePath = join(repoPath, 'examples', 'html-host', 'index.html');
            if (!examplesAvailable && existsSync(htmlExamplePath)) {
                const htmlContent = readFileSync(htmlExamplePath, 'utf-8');
                if (htmlContent.includes(funcName)) {
                    examplesAvailable = true;
                    console.log(`      ✅ [Examples] Found in HTML examples (priority #2)`);
                }
            }

            // Check boilerplate (would need to check .temp-repos/boilerplate)
            // Check reference repos (would need to check reference repos)

            // If no higher-priority examples found, suggest enrichment
            if (!examplesAvailable) {
                console.log(`      💡 [Suggestion] No examples found in source - consider adding \`examples\` field in enrichment`);
                totalSuggestions++;
            }
        }

        // === CHECK 1: Returns Field ===
        if (enrichment.returns) {
            // Check for verification link
            if (!enrichment.returns.includes('github.com')) {
                console.log(`      ⚠️  [Returns] Missing verification link to source code`);
                totalIssues++;
            }

            // Check if it claims to return raw GraphQL
            const returnsRawGraphQL = enrichment.returns.includes('raw') || enrichment.returns.includes('GraphQL');

            if (returnsRawGraphQL) {
                // Verify GraphQL query exists
                const hasGraphQLImport = content.match(/import.*from\s+['"](.+graphql.+)['"]/);

                if (hasGraphQLImport) {
                    const graphQLPath = hasGraphQLImport[1]
                        .replace(/^@\/\w+\/api\//, 'src/api/')
                        .replace(/^\.\//, `src/api/${funcName}/`);
                    const fullGraphQLPath = join(repoPath, graphQLPath + '.ts');

                    if (existsSync(fullGraphQLPath)) {
                        console.log(`      ✅ GraphQL query verified: ${graphQLPath}`);

                        // Check if JSON example is provided
                        if (enrichment.returns.includes('```json')) {
                            console.log(`      ✅ JSON example provided`);
                            totalVerified++;
                        } else {
                            console.log(`      ⚠️  No JSON example provided for raw GraphQL return`);
                            totalIssues++;
                        }
                    } else {
                        console.log(`      ❌ GraphQL file not found: ${fullGraphQLPath}`);
                        totalIssues++;
                    }
                } else {
                    console.log(`      ❌ Claims raw GraphQL but no GraphQL import found`);
                    totalIssues++;
                }
            } else {
                // Check if it references a specific TypeScript type or primitive
                const hasSpecificType = enrichment.returns.match(/`(string|number|boolean|\w+Model|\w+Data|\w+Type|\w+Response)\s*(\||\-)/);
                if (hasSpecificType) {
                    console.log(`      ✅ References specific type: ${hasSpecificType[1]}`);
                    totalVerified++;
                } else if (enrichment.returns.includes('github.com')) {
                    console.log(`      ✅ Has verification link`);
                    totalVerified++;
                } else {
                    console.log(`      ⚠️  Generic 'object' type without specific structure`);
                }
            }
        }

        // === CHECK 2: Events Field ===
        if (enrichment.events) {
            // Extract events from both source and enrichment
            const sourceEvents = extractEventsFromSource(content);
            const enrichmentEvents = extractEventsFromEnrichment(enrichment.events);

            // Check for events in enrichment but NOT in source (stale/typo)
            const staleEvents = enrichmentEvents.filter(e => !sourceEvents.includes(e));

            // Check for events in source but NOT in enrichment (missing documentation)
            const missingEvents = sourceEvents.filter(e => !enrichmentEvents.includes(e));

            if (staleEvents.length === 0 && missingEvents.length === 0) {
                console.log(`      ✅ [Events] All ${enrichmentEvents.length} events match source`);
                totalVerified++;
            } else {
                if (staleEvents.length > 0) {
                    console.log(`      ❌ [Events] Documented but NOT emitted in source: ${staleEvents.map(e => `\`${e}\``).join(', ')}`);
                    console.log(`         💡 Remove from enrichment or verify source code`);
                    totalIssues++;
                }
                if (missingEvents.length > 0) {
                    console.log(`      ⚠️  [Events] Emitted in source but NOT documented: ${missingEvents.map(e => `\`${e}\``).join(', ')}`);
                    console.log(`         💡 Add to enrichment \`events\` field`);
                    totalIssues++;
                } else if (staleEvents.length === 0) {
                    console.log(`      ❌ [Events] No events found in source code`);
                    totalIssues++;
                }
            }
        }

        // === CHECK 3: Description Links ===
        if (enrichment.description) {
            // Check for GraphQL mutation/query links
            const graphqlLinks = enrichment.description.match(/\[`(\w+)`\]\(https?:\/\/[^)]+\)/g);
            if (graphqlLinks) {
                console.log(`      ✅ [Description] Has ${graphqlLinks.length} external reference link(s)`);
            }

            // Warn if description claims to call a mutation but doesn't link to it
            if (enrichment.description.includes('mutation')) {
                // Check if any URL in description links to developer.adobe.com
                const urlRegex = /\bhttps?:\/\/[^\s)]+/g;
                const urls = enrichment.description.match(urlRegex) || [];
                const hasDevAdobeLink = urls.some(urlStr => {
                    try {
                        const urlObj = new URL(urlStr);
                        return urlObj.hostname === 'developer.adobe.com';
                    } catch {
                        return false;
                    }
                });
                if (!hasDevAdobeLink) {
                    console.log(`      ⚠️  [Description] Mentions 'mutation' but no link to GraphQL docs`);
                    totalIssues++;
                }
            }
        }

        // === CHECK 4: Examples Syntax ===
        if (enrichment.examples && Array.isArray(enrichment.examples)) {
            let invalidExamples = 0;
            for (const example of enrichment.examples) {
                if (example.code) {
                    // Basic syntax check - look for common issues
                    if (example.code.includes('import') && !example.code.includes('from')) {
                        console.log(`      ❌ [Examples] Invalid import syntax in example`);
                        invalidExamples++;
                    }
                }
            }
            if (invalidExamples === 0 && enrichment.examples.length > 0) {
                console.log(`      ✅ [Examples] ${enrichment.examples.length} example(s) passed basic syntax check`);
            }
        }
    }
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 AUDIT SUMMARY');
console.log('='.repeat(70));
console.log(`   Total functions: ${totalChecked}`);
console.log(`   Functions with enrichment: ${totalWithEnrichment}`);
console.log(`   Functions without enrichment: ${totalNoEnrichment} (analyzed for completeness)`);
console.log(`   Enrichments verified: ${totalVerified}`);
console.log(`   Issues found: ${totalIssues}`);
console.log(`   Suggestions for improvement: ${totalSuggestions}`);
console.log('='.repeat(70) + '\n');

if (totalIssues > 0) {
    console.log('⚠️  Issues detected. Review enrichment files for accuracy.\n');
    console.log('💡 Tip: Fix issues found above, then re-run this audit.\n');
    process.exit(1);
} else if (totalChecked === 0) {
    console.log('ℹ️  No enrichment functions to audit.\n');
} else {
    console.log('✅ All enrichment data verified against source code!\n');
}

