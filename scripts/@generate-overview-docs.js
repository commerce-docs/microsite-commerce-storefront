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

// Generate MDX content
const mdx = `---
title: ${dropinDisplayName} overview
description: Learn about the features and functions of the ${dropinDisplayName} drop-in component.
sidebar:
  order: 1
---

import { Badge } from '@astrojs/starlight/components';
import { Aside } from '@astrojs/starlight/components';

${data.introduction}

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

