#!/usr/bin/env node

/**
 * Generate Upstream Issues Report
 * 
 * Scans generated documentation for incomplete TypeScript definitions
 * and creates a clean, actionable report for Adobe Commerce developers.
 * 
 * Outputs:
 * - UPSTREAM-TYPE-ISSUES.md - Markdown list for developers
 * - JIRA-TICKETS.md - Pre-formatted Jira ticket descriptions
 * - TYPESCRIPT-CHECKLIST.md - Simple checklist
 * 
 * Usage:
 *   node scripts/generate-upstream-issues.js
 */

import { readFileSync, existsSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Scanning generated documentation for incomplete TypeScript definitions...\n');

// ============================================================================
// SCAN GENERATED DOCS FOR ISSUES
// ============================================================================

const issues = {
    functions: [],
    events: []
};

// Scan function documentation
// Match function headings (lowercase start, not "Events" or "Data")
const functionsPattern = /^## ([a-z]\w+)\s*\n[\s\S]*?```(?:typescript|ts)\s+([\s\S]*?)```/gm;
const anyPattern = /:\s*any\b|<any>|Promise<any>|paymentMethod:\s*any|\bany\s*\)/i;

function scanFunctionsFile(filePath, dropin, type = 'B2C') {
    try {
        const content = readFileSync(filePath, 'utf8');
        let match;

        while ((match = functionsPattern.exec(content)) !== null) {
            const functionName = match[1];
            const signature = match[2].trim();

            // Check if signature contains 'any'
            if (anyPattern.test(signature)) {
                issues.functions.push({
                    dropin,
                    type,
                    item: functionName,
                    issue: 'Function signature contains generic "any" type',
                    signature: signature.replace(/\n/g, ' ').replace(/\s+/g, ' '),
                    category: 'Function',
                    file: filePath
                });
            }
        }
    } catch (error) {
        // File doesn't exist or can't be read
    }
}

// Scan event documentation
const eventsPattern = /## `([^`]+)`[\s\S]*?Event payload\s*\n\s*(?:```typescript\s+([\s\S]*?)```|`([^`]+)`)/g;

function scanEventsFile(filePath, dropin, type = 'B2C') {
    try {
        const content = readFileSync(filePath, 'utf8');
        let match;

        while ((match = eventsPattern.exec(content)) !== null) {
            const eventName = match[1];
            const payloadType = match[2] || match[3];

            // Check if payload is 'any' or contains 'any'
            if (payloadType && anyPattern.test(payloadType)) {
                issues.events.push({
                    dropin,
                    type,
                    item: eventName,
                    issue: 'Event payload type is generic "any"',
                    signature: payloadType.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '),
                    category: 'Event',
                    file: filePath
                });
            }
        }
    } catch (error) {
        // File doesn't exist or can't be read
    }
}

// Scan all drop-ins
const contentPath = join(projectRoot, 'src', 'content', 'docs');

function scanDropins(basePath, type = 'B2C') {
    const dropinsPath = join(contentPath, basePath);
    if (!existsSync(dropinsPath)) return;

    const dropins = readdirSync(dropinsPath);

    for (const dropin of dropins) {
        const dropinPath = join(dropinsPath, dropin);

        // Scan functions
        const functionsFile = join(dropinPath, 'functions.mdx');
        if (existsSync(functionsFile)) {
            scanFunctionsFile(functionsFile, dropin, type);
        }

        // Scan events
        const eventsFile = join(dropinPath, 'events.mdx');
        if (existsSync(eventsFile)) {
            scanEventsFile(eventsFile, dropin, type);
        }
    }
}

// Scan B2C and B2B drop-ins
scanDropins('dropins', 'B2C');
scanDropins('dropins-b2b', 'B2B');

// ============================================================================
// GENERATE REPORTS
// ============================================================================

function generateMarkdownReport() {
    const totalIssues = issues.functions.length + issues.events.length;

    if (totalIssues === 0) {
        return `# ✅ No Incomplete TypeScript Definitions Found

All functions and events have proper TypeScript definitions!

**Last checked**: ${new Date().toLocaleString()}
`;
    }

    let md = `# Incomplete TypeScript Definitions - Action Required

**Generated**: ${new Date().toLocaleString()}  
**Total Issues**: ${totalIssues} (${issues.functions.length} functions, ${issues.events.length} events)

> **Note**: These are issues in the source code repositories, not in the documentation generator.
> The generator correctly extracts what exists in the source.

---

## Summary by Drop-in

`;

    // Group by drop-in
    const byDropin = {};
    [...issues.functions, ...issues.events].forEach(issue => {
        const key = `${issue.dropin} (${issue.type})`;
        if (!byDropin[key]) {
            byDropin[key] = { functions: [], events: [] };
        }
        if (issue.category === 'Function') {
            byDropin[key].functions.push(issue);
        } else {
            byDropin[key].events.push(issue);
        }
    });

    Object.entries(byDropin).sort().forEach(([dropin, items]) => {
        const count = items.functions.length + items.events.length;
        md += `- **${dropin}**: ${count} issue${count > 1 ? 's' : ''} (${items.functions.length} functions, ${items.events.length} events)\n`;
    });

    md += '\n---\n\n## Functions with Incomplete Types\n\n';

    if (issues.functions.length === 0) {
        md += '✅ All functions have proper TypeScript definitions.\n\n';
    } else {
        Object.entries(byDropin).sort().forEach(([dropin, items]) => {
            if (items.functions.length > 0) {
                md += `### ${dropin}\n\n`;
                items.functions.forEach(func => {
                    md += `- **\`${func.item}\`**\n`;
                    md += `  - **Issue**: ${func.issue}\n`;
                    md += `  - **Signature**: \`${func.signature.substring(0, 100)}${func.signature.length > 100 ? '...' : ''}\`\n`;
                    md += `  - **Action**: Replace \`any\` with specific TypeScript type\n\n`;
                });
            }
        });
    }

    md += '---\n\n## Events with Incomplete Types\n\n';

    if (issues.events.length === 0) {
        md += '✅ All events have proper TypeScript definitions.\n\n';
    } else {
        Object.entries(byDropin).sort().forEach(([dropin, items]) => {
            if (items.events.length > 0) {
                md += `### ${dropin}\n\n`;
                items.events.forEach(event => {
                    md += `- **\`${event.item}\`**\n`;
                    md += `  - **Issue**: ${event.issue}\n`;
                    md += `  - **Current Type**: \`${event.signature}\`\n`;
                    md += `  - **Action**: Define proper payload interface in \`events.d.ts\` or \`event-bus.d.ts\`\n\n`;
                });
            }
        });
    }

    md += '---\n\n## How to Fix\n\n';
    md += '### For Functions\n\n';
    md += '1. Locate the function in \`src/api/[function-name]/[function-name].ts\`\n';
    md += '2. Replace \`any\` types with specific TypeScript interfaces\n';
    md += '3. Add JSDoc comments if needed\n';
    md += '4. Run tests to ensure no breaking changes\n\n';

    md += '### For Events\n\n';
    md += '1. Locate the event definition in \`src/types/events.d.ts\` or \`src/types/event-bus.d.ts\`\n';
    md += '2. Replace \`any\` with a proper interface (e.g., \`CartUpdatedPayload\`)\n';
    md += '3. Define the interface if it doesn\'t exist\n';
    md += '4. Update all \`events.emit()\` calls to match the new type\n\n';

    md += '---\n\n## Repository Links\n\n';
    const repos = [...new Set([...issues.functions, ...issues.events].map(i => i.dropin))].sort();
    repos.forEach(repo => {
        md += `- [${repo}](https://github.com/adobe-commerce/${repo})\n`;
    });

    md += '\n---\n\n*This report was automatically generated by scanning the documentation.*\n';

    return md;
}

function generateJiraTickets() {
    const totalIssues = issues.functions.length + issues.events.length;

    if (totalIssues === 0) {
        return `# ✅ No Jira Tickets Needed\n\nAll TypeScript definitions are complete!\n\n**Last checked**: ${new Date().toLocaleString()}\n`;
    }

    let jira = `# Jira Tickets for Incomplete TypeScript Definitions\n\n**Generated**: ${new Date().toLocaleString()}  \n**Recommended Tickets**: ${Object.keys(groupByDropin()).length}\n\nCopy each section below into a new Jira ticket.\n\n---\n\n`;

    function groupByDropin() {
        const byDropin = {};
        [...issues.functions, ...issues.events].forEach(issue => {
            const key = issue.dropin;
            if (!byDropin[key]) {
                byDropin[key] = { functions: [], events: [], type: issue.type };
            }
            if (issue.category === 'Function') {
                byDropin[key].functions.push(issue);
            } else {
                byDropin[key].events.push(issue);
            }
        });
        return byDropin;
    }

    const byDropin = groupByDropin();
    let ticketNumber = 1;

    Object.entries(byDropin).sort().forEach(([dropin, data]) => {
        const items = [...data.functions, ...data.events];
        const repoName = dropin;

        jira += `## Ticket ${ticketNumber}: [${dropin}] Add Proper TypeScript Definitions\n\n`;
        jira += `\`\`\`\n`;
        jira += `Summary: Add proper TypeScript definitions to ${dropin} drop-in\n\n`;
        jira += `Type: Technical Debt\n`;
        jira += `Priority: Medium\n`;
        jira += `Component: ${dropin}\n`;
        jira += `Labels: typescript, type-definitions, documentation, ${data.type.toLowerCase()}\n\n`;
        jira += `Description:\n\n`;
        jira += `The ${dropin} drop-in has ${items.length} item(s) with incomplete TypeScript definitions (using 'any' type).\n\n`;

        jira += `Items to Fix:\n\n`;
        if (data.functions.length > 0) {
            jira += `Functions:\n`;
            data.functions.forEach(func => {
                jira += `* ${func.item} - ${func.issue}\n`;
            });
            jira += `\n`;
        }
        if (data.events.length > 0) {
            jira += `Events:\n`;
            data.events.forEach(event => {
                jira += `* ${event.item} - ${event.issue}\n`;
            });
            jira += `\n`;
        }

        jira += `Acceptance Criteria:\n\n`;
        jira += `* All 'any' types replaced with specific TypeScript interfaces\n`;
        jira += `* Type definitions added to .d.ts files where needed\n`;
        jira += `* No breaking changes to existing API\n`;
        jira += `* Tests passing\n`;
        jira += `* Documentation automatically reflects new types\n\n`;

        jira += `Repository: https://github.com/adobe-commerce/${repoName}\n`;
        jira += `\`\`\`\n\n`;
        jira += `---\n\n`;
        ticketNumber++;
    });

    return jira;
}

function generateSimpleChecklist() {
    const totalIssues = issues.functions.length + issues.events.length;

    if (totalIssues === 0) {
        return `# ✅ TypeScript Definitions Checklist\n\nAll complete! Nothing to fix.\n\n**Last checked**: ${new Date().toLocaleString()}\n`;
    }

    let checklist = `# TypeScript Definitions - Quick Checklist\n\n**Total**: ${totalIssues} items need fixing\n\n`;

    checklist += `## Functions (${issues.functions.length})\n\n`;
    if (issues.functions.length === 0) {
        checklist += '✅ All complete\n\n';
    } else {
        issues.functions.sort((a, b) => a.dropin.localeCompare(b.dropin)).forEach(func => {
            checklist += `- [ ] **${func.dropin}** → \`${func.item}\`\n`;
        });
        checklist += '\n';
    }

    checklist += `## Events (${issues.events.length})\n\n`;
    if (issues.events.length === 0) {
        checklist += '✅ All complete\n\n';
    } else {
        issues.events.sort((a, b) => a.dropin.localeCompare(b.dropin)).forEach(event => {
            checklist += `- [ ] **${event.dropin}** → \`${event.item}\`\n`;
        });
    }

    checklist += `\n---\n*Generated: ${new Date().toLocaleString()}*\n`;

    return checklist;
}

// ============================================================================
// WRITE OUTPUT FILES
// ============================================================================

const totalIssues = issues.functions.length + issues.events.length;

console.log(`✅ Scan complete!\n`);
console.log(`Found ${totalIssues} incomplete TypeScript definition(s):\n`);
console.log(`  Functions: ${issues.functions.length}`);
console.log(`  Events: ${issues.events.length}\n`);

if (totalIssues > 0) {
    // Show summary by drop-in
    const byDropin = {};
    [...issues.functions, ...issues.events].forEach(issue => {
        if (!byDropin[issue.dropin]) byDropin[issue.dropin] = 0;
        byDropin[issue.dropin]++;
    });

    console.log('By drop-in:');
    Object.entries(byDropin).sort().forEach(([dropin, count]) => {
        console.log(`  • ${dropin}: ${count}`);
    });
    console.log('');
}

// Write reports
const mdReport = generateMarkdownReport();
const mdPath = join(projectRoot, 'UPSTREAM-TYPE-ISSUES.md');
writeFileSync(mdPath, mdReport, 'utf8');
console.log(`📄 Generated: UPSTREAM-TYPE-ISSUES.md`);

const jiraReport = generateJiraTickets();
const jiraPath = join(projectRoot, 'JIRA-TICKETS.md');
writeFileSync(jiraPath, jiraReport, 'utf8');
console.log(`📄 Generated: JIRA-TICKETS.md`);

const checklist = generateSimpleChecklist();
const checklistPath = join(projectRoot, 'TYPESCRIPT-CHECKLIST.md');
writeFileSync(checklistPath, checklist, 'utf8');
console.log(`📄 Generated: TYPESCRIPT-CHECKLIST.md\n`);

if (totalIssues > 0) {
    console.log('📋 Files ready to share with developers:');
    console.log('   1. TYPESCRIPT-CHECKLIST.md (quick list)');
    console.log('   2. UPSTREAM-TYPE-ISSUES.md (detailed report)');
    console.log('   3. JIRA-TICKETS.md (copy-paste into Jira)\n');
    console.log('💡 Tip: These are upstream issues in source repositories, not generator bugs.\n');
} else {
    console.log('🎉 All TypeScript definitions are complete - no action needed!\n');
}
