#!/usr/bin/env node

/**
 * Extract Manual Examples to Enrichment Files
 * 
 * This script extracts manually-added examples from events.mdx files
 * and moves them into enrichment JSON files, making documentation regenerable.
 * 
 * For each event in events.mdx, extracts:
 * - When triggered (bulleted list)
 * - Examples (code blocks with titles)
 * - Usage scenarios (text)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const B2B_DROPINS = [
    'purchase-order',
    'quote-management',
    'requisition-list',
    'company-management',
    'company-switcher'
];

/**
 * Parse an events.mdx file and extract manual content for each event
 */
function parseEventsMDX(mdxPath) {
    if (!existsSync(mdxPath)) {
        console.log(`  ⚠️  File not found: ${mdxPath}`);
        return {};
    }

    const content = readFileSync(mdxPath, 'utf8');
    const lines = content.split('\n');

    const events = {};
    let currentEvent = null;
    let currentSection = null;
    let currentContent = [];
    let inCodeBlock = false;
    let currentExampleTitle = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect event heading (### eventName)
        if (line.match(/^### [a-z][\w\-\/]+$/)) {
            // Save previous event
            if (currentEvent && currentSection) {
                saveSection(events, currentEvent, currentSection, currentContent, currentExampleTitle);
            }

            currentEvent = line.substring(4).trim();
            events[currentEvent] = {
                whenTriggered: [],
                examples: [],
                usageScenarios: ''
            };
            currentSection = null;
            currentContent = [];
            currentExampleTitle = null;
            continue;
        }

        if (!currentEvent) continue;

        // Detect sections
        if (line === '#### When triggered') {
            if (currentSection) {
                saveSection(events, currentEvent, currentSection, currentContent, currentExampleTitle);
            }
            currentSection = 'whenTriggered';
            currentContent = [];
            currentExampleTitle = null;
            continue;
        }

        if (line.match(/^#### Example/)) {
            if (currentSection) {
                saveSection(events, currentEvent, currentSection, currentContent, currentExampleTitle);
            }
            currentSection = 'example';
            currentContent = [];
            // Extract example title (e.g., "Example 1: Basic usage" -> "Basic usage")
            const match = line.match(/^#### Example(?:\s+\d+)?:\s*(.+)$/);
            currentExampleTitle = match ? match[1].trim() : 'Example';
            continue;
        }

        if (line === '#### Example') {
            if (currentSection) {
                saveSection(events, currentEvent, currentSection, currentContent, currentExampleTitle);
            }
            currentSection = 'example';
            currentContent = [];
            currentExampleTitle = 'Example';
            continue;
        }

        if (line === '#### Usage scenarios') {
            if (currentSection) {
                saveSection(events, currentEvent, currentSection, currentContent, currentExampleTitle);
            }
            currentSection = 'usageScenarios';
            currentContent = [];
            currentExampleTitle = null;
            continue;
        }

        // Track code blocks
        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }

        // Stop collecting at next H4 or H3 (unless in code block)
        if (!inCodeBlock && (line.match(/^####/) || line.match(/^###/))) {
            if (currentSection) {
                saveSection(events, currentEvent, currentSection, currentContent, currentExampleTitle);
                currentSection = null;
                currentContent = [];
                currentExampleTitle = null;
            }
            continue;
        }

        // Collect content for current section
        if (currentSection) {
            currentContent.push(line);
        }
    }

    // Save last section
    if (currentEvent && currentSection) {
        saveSection(events, currentEvent, currentSection, currentContent, currentExampleTitle);
    }

    return events;
}

function saveSection(events, eventName, sectionType, content, exampleTitle) {
    const text = content.join('\n').trim();
    if (!text) return;

    switch (sectionType) {
        case 'whenTriggered':
            // Extract bulleted list items
            const items = text.split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.trim().substring(1).trim());
            if (items.length > 0) {
                events[eventName].whenTriggered = items;
            }
            break;

        case 'example':
            events[eventName].examples.push({
                title: exampleTitle,
                code: text
            });
            break;

        case 'usageScenarios':
            events[eventName].usageScenarios = text;
            break;
    }
}

/**
 * Merge extracted content into existing enrichment file
 */
function updateEnrichmentFile(dropinName, extractedEvents) {
    const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropinName, 'events.json');

    let enrichment = { overview: '' };
    if (existsSync(enrichmentPath)) {
        enrichment = JSON.parse(readFileSync(enrichmentPath, 'utf8'));
    }

    // Merge extracted events
    for (const [eventName, eventData] of Object.entries(extractedEvents)) {
        if (!enrichment[eventName]) {
            enrichment[eventName] = {};
        }

        // Add extracted manual content
        if (eventData.whenTriggered && eventData.whenTriggered.length > 0) {
            enrichment[eventName].whenTriggered = eventData.whenTriggered;
        }

        if (eventData.examples && eventData.examples.length > 0) {
            enrichment[eventName].examples = eventData.examples;
        }

        if (eventData.usageScenarios) {
            enrichment[eventName].usageScenarios = eventData.usageScenarios;
        }
    }

    // Write back
    writeFileSync(enrichmentPath, JSON.stringify(enrichment, null, 2) + '\n');
    console.log(`  ✅ Updated: ${enrichmentPath}`);

    // Count what was extracted
    let totalExamples = 0;
    let totalWhenTriggered = 0;
    let totalUsageScenarios = 0;
    for (const eventData of Object.values(extractedEvents)) {
        totalExamples += eventData.examples?.length || 0;
        totalWhenTriggered += eventData.whenTriggered?.length || 0;
        if (eventData.usageScenarios) totalUsageScenarios++;
    }

    console.log(`     Events: ${Object.keys(extractedEvents).length}`);
    console.log(`     Examples: ${totalExamples}`);
    console.log(`     When-triggered items: ${totalWhenTriggered}`);
    console.log(`     Usage scenarios: ${totalUsageScenarios}`);
}

// Main execution
console.log('\n' + '='.repeat(70));
console.log('  EXTRACT EXAMPLES TO ENRICHMENT');
console.log('='.repeat(70) + '\n');

console.log('📦 Processing B2B drop-ins...\n');

for (const dropinName of B2B_DROPINS) {
    console.log(`\n[${dropinName}]`);

    const mdxPath = join(projectRoot, 'src', 'content', 'docs', 'dropins-b2b', dropinName, 'events.mdx');

    const extractedEvents = parseEventsMDX(mdxPath);

    if (Object.keys(extractedEvents).length > 0) {
        updateEnrichmentFile(dropinName, extractedEvents);
    } else {
        console.log(`  ℹ️  No events found or file doesn't exist`);
    }
}

console.log('\n' + '='.repeat(70));
console.log('✨ Extraction complete!');
console.log('='.repeat(70) + '\n');

