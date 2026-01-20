#!/usr/bin/env node

/**
 * Enrichment Verification Script
 * 
 * Verifies that enrichment files contain adequate content before running generators.
 * This helps prevent loss of manual editorial content during regeneration.
 * 
 * Usage:
 *   npm run verify-enrichments [dropin-name]
 *   npm run verify-enrichments                # Check all dropins
 *   npm run verify-enrichments company-management
 * 
 * Exit codes:
 *   0 - All enrichments are adequate
 *   1 - Issues found that need attention
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const enrichmentsDir = join(projectRoot, '_dropin-enrichments');

// Minimum description length for quality (characters)
const MIN_DESCRIPTION_LENGTH = 50;

// Keywords that indicate generic/placeholder content
const PLACEHOLDER_KEYWORDS = [
    'API function for the drop-in',
    'Container for the drop-in',
    'Event for the drop-in',
    'Slot for the drop-in',
    '*Enrichment needed*',
    'TODO',
    'TBD',
    'placeholder'
];

let issuesFound = 0;
let warningsFound = 0;

function checkPlaceholderContent(text) {
    if (!text) return true;
    return PLACEHOLDER_KEYWORDS.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
}

function checkDescriptionQuality(description, itemName, type) {
    const issues = [];
    const warnings = [];

    if (!description) {
        issues.push(`Missing description`);
        return { issues, warnings };
    }

    if (description.length < MIN_DESCRIPTION_LENGTH) {
        warnings.push(`Short description (${description.length} chars, recommend ${MIN_DESCRIPTION_LENGTH}+)`);
    }

    if (checkPlaceholderContent(description)) {
        issues.push(`Contains placeholder/generic content`);
    }

    // Check for proper grammar
    if (!/^[A-Z]/.test(description)) {
        warnings.push(`Description should start with capital letter`);
    }

    if (!/[.!?]$/.test(description)) {
        warnings.push(`Description should end with punctuation`);
    }

    // Check for action-oriented language (functions/containers)
    if (type === 'function' || type === 'container') {
        const actionVerbs = /^(Adds|Returns|Retrieves|Fetches|Creates|Updates|Deletes|Processes|Manages|Displays|Renders|Validates|Checks|Sets|Gets|Publishes|Emits|Allows|Enables|Provides|Handles)/;
        if (!actionVerbs.test(description)) {
            warnings.push(`Consider starting with an action verb (Adds, Returns, Manages, etc.)`);
        }
    }

    return { issues, warnings };
}

function verifyFunctionsEnrichment(dropinName, data) {
    console.log(`\n  📄 functions.json`);
    let localIssues = 0;
    let localWarnings = 0;

    for (const [funcName, funcData] of Object.entries(data)) {
        const { issues, warnings } = checkDescriptionQuality(funcData.description, funcName, 'function');

        if (issues.length > 0) {
            console.log(`    ❌ ${funcName}:`);
            issues.forEach(issue => console.log(`       - ${issue}`));
            localIssues += issues.length;
        }

        if (warnings.length > 0 && issues.length === 0) {
            console.log(`    ⚠️  ${funcName}:`);
            warnings.forEach(warning => console.log(`       - ${warning}`));
            localWarnings += warnings.length;
        }

        // Check parameters
        if (funcData.parameters) {
            for (const [paramName, paramData] of Object.entries(funcData.parameters)) {
                if (paramData.type || paramData.required !== undefined) {
                    console.log(`    ❌ ${funcName}.${paramName}: Should NOT contain 'type' or 'required' (extracted from source)`);
                    localIssues++;
                }
                if (!paramData.description) {
                    console.log(`    ⚠️  ${funcName}.${paramName}: Missing parameter description`);
                    localWarnings++;
                }
            }
        }
    }

    if (localIssues === 0 && localWarnings === 0) {
        console.log(`    ✅ All function enrichments look good`);
    }

    return { issues: localIssues, warnings: localWarnings };
}

function verifyContainersEnrichment(dropinName, data) {
    console.log(`\n  📄 containers.json`);
    let localIssues = 0;
    let localWarnings = 0;

    for (const [containerName, containerData] of Object.entries(data)) {
        // Check top-level description
        if (!containerData.description) {
            console.log(`    ❌ ${containerName}: Missing top-level description`);
            localIssues++;
        } else {
            const { issues, warnings } = checkDescriptionQuality(containerData.description, containerName, 'container');
            if (issues.length > 0) {
                console.log(`    ❌ ${containerName}:`);
                issues.forEach(issue => console.log(`       - ${issue}`));
                localIssues += issues.length;
            }
            if (warnings.length > 0 && issues.length === 0) {
                console.log(`    ⚠️  ${containerName}:`);
                warnings.forEach(warning => console.log(`       - ${warning}`));
                localWarnings += warnings.length;
            }
        }

        // Check parameters
        if (containerData.parameters) {
            for (const [paramName, paramData] of Object.entries(containerData.parameters)) {
                if (paramData.type || paramData.required !== undefined) {
                    console.log(`    ❌ ${containerName}.${paramName}: Should NOT contain 'type' or 'required'`);
                    localIssues++;
                }
            }
        }
    }

    if (localIssues === 0 && localWarnings === 0) {
        console.log(`    ✅ All container enrichments look good`);
    }

    return { issues: localIssues, warnings: localWarnings };
}

function verifyOverviewEnrichment(dropinName, data) {
    console.log(`\n  📄 overview.json`);
    let localIssues = 0;

    if (!data.introduction) {
        console.log(`    ❌ Missing 'introduction' field`);
        localIssues++;
    } else if (checkPlaceholderContent(data.introduction)) {
        console.log(`    ❌ Introduction contains placeholder content`);
        localIssues++;
    } else {
        console.log(`    ✅ Overview introduction looks good`);
    }

    return { issues: localIssues, warnings: 0 };
}

function verifyInitializationEnrichment(dropinName, data) {
    console.log(`\n  📄 initialization.json`);
    let localIssues = 0;

    if (!data.intro) {
        console.log(`    ❌ Missing 'intro' field`);
        localIssues++;
    } else if (checkPlaceholderContent(data.intro)) {
        console.log(`    ❌ Intro contains placeholder content`);
        localIssues++;
    } else {
        console.log(`    ✅ Initialization intro looks good`);
    }

    return { issues: localIssues, warnings: 0 };
}

function verifyDropinEnrichments(dropinName) {
    const dropinPath = join(enrichmentsDir, dropinName);

    if (!existsSync(dropinPath)) {
        console.log(`\n⚠️  ${dropinName}: No enrichment directory found`);
        return;
    }

    console.log(`\n🔍 Verifying: ${dropinName}`);
    console.log(`   Path: _dropin-enrichments/${dropinName}/`);

    const files = readdirSync(dropinPath).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log(`  ⚠️  No enrichment files found`);
        warningsFound++;
        return;
    }

    let dropinIssues = 0;
    let dropinWarnings = 0;

    for (const file of files) {
        const filePath = join(dropinPath, file);
        try {
            const content = readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            if (Object.keys(data).length === 0) {
                console.log(`\n  📄 ${file}`);
                console.log(`    ⚠️  Empty enrichment file`);
                dropinWarnings++;
                continue;
            }

            const type = file.replace('.json', '');
            let result = { issues: 0, warnings: 0 };

            switch (type) {
                case 'functions':
                    result = verifyFunctionsEnrichment(dropinName, data);
                    break;
                case 'containers':
                    result = verifyContainersEnrichment(dropinName, data);
                    break;
                case 'overview':
                    result = verifyOverviewEnrichment(dropinName, data);
                    break;
                case 'initialization':
                    result = verifyInitializationEnrichment(dropinName, data);
                    break;
                default:
                    console.log(`\n  📄 ${file}`);
                    console.log(`    ℹ️  Verification not implemented for this type`);
            }

            dropinIssues += result.issues;
            dropinWarnings += result.warnings;

        } catch (error) {
            console.log(`\n  📄 ${file}`);
            console.log(`    ❌ Error reading file: ${error.message}`);
            dropinIssues++;
        }
    }

    issuesFound += dropinIssues;
    warningsFound += dropinWarnings;

    if (dropinIssues === 0 && dropinWarnings === 0) {
        console.log(`\n  ✅ All ${dropinName} enrichments verified`);
    }
}

function main() {
    const args = process.argv.slice(2);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ENRICHMENT VERIFICATION`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\nPurpose: Verify enrichment quality before running generators`);
    console.log(`Location: _dropin-enrichments/`);

    if (!existsSync(enrichmentsDir)) {
        console.error(`\n❌ ERROR: Enrichments directory not found: ${enrichmentsDir}`);
        process.exit(1);
    }

    const dropins = args.length > 0
        ? args
        : readdirSync(enrichmentsDir).filter(name => {
            const path = join(enrichmentsDir, name);
            return existsSync(path) && readdirSync(path).length > 0;
        });

    if (dropins.length === 0) {
        console.log(`\n⚠️  No dropins to verify`);
        process.exit(0);
    }

    for (const dropin of dropins) {
        verifyDropinEnrichments(dropin);
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Dropins checked: ${dropins.length}`);
    console.log(`Issues found: ${issuesFound}`);
    console.log(`Warnings found: ${warningsFound}`);

    if (issuesFound > 0) {
        console.log(`\n❌ ISSUES DETECTED - Fix enrichments before regenerating`);
        console.log(`   See: ENRICHMENT-PRESERVATION.md for guidance`);
        process.exit(1);
    } else if (warningsFound > 0) {
        console.log(`\n⚠️  WARNINGS DETECTED - Consider improving enrichments`);
        console.log(`   Warnings won't block regeneration but may affect quality`);
        process.exit(0);
    } else {
        console.log(`\n✅ ALL ENRICHMENTS VERIFIED - Safe to regenerate`);
        process.exit(0);
    }
}

main();

