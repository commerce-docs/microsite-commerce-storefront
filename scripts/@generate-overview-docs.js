#!/usr/bin/env node

/**
 * Generate Overview Page from Enrichment (All B2B Drop-ins)
 * 
 * Generates the index.mdx overview page from enrichment JSON data.
 * Works for any B2B drop-in with an overview.json file.
 * 
 * Usage: node scripts/@generate-overview-docs.js <dropin-name>
 * Example: node scripts/@generate-overview-docs.js purchase-order
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from './lib/logger.js';

// Get drop-in name from command line
const dropinName = process.argv[2];

if (!dropinName) {
    console.error('❌ Error: Drop-in name required');
    console.error('Usage: node scripts/@generate-overview-docs.js <dropin-name>');
    console.error('Example: node scripts/@generate-overview-docs.js purchase-order');
    process.exit(1);
}

const enrichmentPath = `_dropin-enrichments/${dropinName}/overview.json`;
const outputPath = `src/content/docs/dropins-b2b/${dropinName}/index.mdx`;

// Check if enrichment file exists
if (!existsSync(enrichmentPath)) {
    logger.skipping(dropinName, `No overview.json found. Create ${enrichmentPath} to enable overview generation.`);
    process.exit(0);
}

console.log(`📝 Generating ${dropinName} overview page...\n`);

// Load enrichment data
const data = JSON.parse(readFileSync(enrichmentPath, 'utf8'));

// Generate supported features table
function getStatusVariant(status) {
    const statusLower = status.toLowerCase();
    if (statusLower === 'supported') return 'tip';
    if (statusLower === 'roadmap' || statusLower === 'planned') return 'caution';
    if (statusLower === 'not supported' || statusLower === 'deprecated') return 'danger';
    if (statusLower === 'in progress' || statusLower === 'beta') return 'note';
    return 'tip'; // default
}

const featuresTable = data.supported_features.map(item => {
    const variant = getStatusVariant(item.status);
    return `| ${item.feature} | <Badge text="${item.status}" variant="${variant}" /> |`;
}).join('\n');

// Generate key events section (optional)
const keyEventsSection = data.key_events ? data.key_events.map(event => {
    let section = `### ${event.name}\n\n${event.description}\n`;

    if (event.details) {
        section += '\n' + event.details.join('\n') + '\n';
    }

    return section;
}).join('\n') : '';

// Generate section topics (without internal links)
const sectionTopics = data.section_topics.sections.map(section => {
    return `### ${section.title}\n\n${section.description}\n`;
}).join('\n');

// Convert kebab-case to Title Case for display
const dropinDisplayName = dropinName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Generate concise intro paragraph (20-40 words) summarizing high-level capabilities
 * across all documentation pages for the drop-in.
 */
function generateIntroSummary(data, dropinName) {
    const displayName = dropinName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Extract top 3-4 supported features that describe core functionality
    const topFeatures = data.supported_features
        .filter(f => f.status.toLowerCase() === 'supported')
        .slice(0, 4);

    // Build a concise description from the features
    if (topFeatures.length === 0) {
        return `The ${displayName} drop-in provides UI containers, API functions, and event notifications for Adobe Commerce storefronts.`;
    }

    /**
     * Convert feature names to gerund form for parallel construction (CONTRIBUTING.md rule 6).
     * Ensures all items follow parallel grammatical structure: "enables X, Y, and Z"
     * E.g., "Request negotiable quotes" -> "requesting negotiable quotes"
     *       "Quote management and tracking" -> "managing and tracking quotes"
     *       "Role-based permissions" -> "role-based permissions" (keep as is)
     */
    function toGerundForm(feature) {
        const lower = feature.toLowerCase();

        // Verb mapping for imperative -> gerund conversion
        const verbMap = {
            'request ': 'requesting ',
            'create ': 'creating ',
            'manage ': 'managing ',
            'track ': 'tracking ',
            'update ': 'updating ',
            'view ': 'viewing ',
            'edit ': 'editing ',
            'delete ': 'deleting ',
            'add ': 'adding ',
            'remove ': 'removing ',
            'send ': 'sending ',
            'convert ': 'converting ',
            'handle ': 'handling ',
            'process ': 'processing ',
            'display ': 'displaying ',
            'show ': 'showing ',
            'save ': 'saving ',
            'load ': 'loading ',
            'support ': 'supporting ',
            'enable ': 'enabling ',
            'provide ': 'providing '
        };

        // Check for direct verb matches first
        for (const [verb, gerund] of Object.entries(verbMap)) {
            if (lower.startsWith(verb)) {
                return gerund + lower.slice(verb.length);
            }
        }

        // Handle compound noun phrases with "and" (e.g., "quote management and tracking")
        // Keep as is to maintain clarity - don't try to restructure complex compounds
        if (lower.includes(' and ') && (lower.includes('management') || lower.includes('tracking') || lower.includes('updates'))) {
            return lower;
        }

        // For simple noun phrases that are already clear, keep as is
        // Examples: "role-based permissions", "quote status updates", "quote comments and attachments"
        // These are already in acceptable parallel form
        return lower;
    }

    // Convert features to proper grammatical form for parallel structure
    const featureDescriptions = topFeatures.map(f => toGerundForm(f.feature));

    /**
     * Build summary following CONTRIBUTING.md writing rules:
     * - Rule 1: Use active voice ("enables" not "is enabled by")
     * - Rule 6: Express parallel ideas in parallel form (all gerunds)
     * - Rule 5: Keep related words together (subject-verb-object)
     * - Grammar Rule 1: Use articles appropriately (the drop-in, for Adobe Commerce)
     * 
     * Pattern: "The [Name] drop-in enables [action1], [action2], and [action3] for Adobe Commerce storefronts."
     */
    let summary = `The ${displayName} drop-in enables `;

    if (featureDescriptions.length === 1) {
        summary += `${featureDescriptions[0]}`;
    } else if (featureDescriptions.length === 2) {
        summary += `${featureDescriptions[0]} and ${featureDescriptions[1]}`;
    } else {
        const lastFeature = featureDescriptions[featureDescriptions.length - 1];
        const otherFeatures = featureDescriptions.slice(0, -1).join(', ');
        summary += `${otherFeatures}, and ${lastFeature}`;
    }

    summary += ' for Adobe Commerce storefronts.';

    return summary;
}

// Generate MDX content
const mdx = `---
title: ${dropinDisplayName} overview
description: Learn about the features and functions of the ${dropinDisplayName} drop-in component.
sidebar:
  order: 1
---

import { Badge } from '@astrojs/starlight/components';
import { Aside } from '@astrojs/starlight/components';

${generateIntroSummary(data, dropinName)}

## Supported Commerce features

The following table provides an overview of the Adobe Commerce features that the ${dropinDisplayName} drop-in supports:

| Feature | Status |
| ------- | ------ |
${featuresTable}
${data.key_events ? `
## Key events

The ${dropinDisplayName} drop-in exposes the following key events through the boilerplate:

${keyEventsSection}
` : ''}
## Section topics

${data.section_topics.intro}

${sectionTopics}
`;

// Write the file
writeFileSync(outputPath, mdx, 'utf8');

console.log(`✅ Generated overview page for ${dropinName}`);
console.log('');
console.log(`📁 Output: ${outputPath}`);
console.log('');
console.log(`🔄 To update: Edit ${enrichmentPath} and re-run`);
console.log('   npm run generate-overview-docs', dropinName);
console.log('');

