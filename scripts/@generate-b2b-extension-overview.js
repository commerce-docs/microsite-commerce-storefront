#!/usr/bin/env node

/**
 * Generate B2B extension overview pages for dropins that have B2B-specific containers.
 * 
 * This generator creates overview pages for B2B extensions to existing B2C dropins.
 * Currently supports: Checkout
 * 
 * Usage: node scripts/@generate-b2b-extension-overview.js [dropin-name]
 * Example: node scripts/@generate-b2b-extension-overview.js checkout
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Generate B2B extension overview for a dropin
 */
function generateB2BExtensionOverview(dropinSlug) {
    console.log(`\n📄 Generating B2B extension overview for ${dropinSlug}...`);
    
    // Read enrichment data
    const enrichmentPath = join(rootDir, `_dropin-enrichments/${dropinSlug}/b2b-extension.json`);
    
    if (!existsSync(enrichmentPath)) {
        console.log(`⚠️  No B2B extension enrichment found at ${enrichmentPath}`);
        return false;
    }
    
    const enrichment = JSON.parse(readFileSync(enrichmentPath, 'utf-8'));
    
    // Generate content
    const content = generateContent(enrichment);
    
    // Write to output path
    const outputPath = join(rootDir, `src/content/docs/dropins-b2b/${dropinSlug}/index.mdx`);
    const outputDir = dirname(outputPath);
    
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }
    
    writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ Generated: ${outputPath}`);
    
    return true;
}

/**
 * Generate MDX content from enrichment data
 */
function generateContent(data) {
    const { title, description, intro, note, features, containers, containersNote } = data;
    
    let content = `---
title: ${title}
description: ${description}
sidebar:
  order: 1
---

import { Badge } from '@astrojs/starlight/components';
import { Aside } from '@astrojs/starlight/components';
import Link from '@components/Link.astro';
import TableWrapper from '@components/TableWrapper.astro';

${intro}

`;

    // Add note/aside if present
    if (note) {
        content += `<Aside type="${note.type}">
${note.content}
</Aside>

`;
    }

    // Get table settings
    const tableSettings = data.tableSettings || {};
    const featuresNowrap = tableSettings.features?.nowrap || [0, 1];
    const containersNowrap = tableSettings.containers?.nowrap || [0];

    // Add features table
    content += `## Supported Commerce features

The B2B payment method containers support the following Adobe Commerce features:

<TableWrapper nowrap={[${featuresNowrap.join(', ')}]}>

| Feature | Status |
| ------- | ------ |
`;

    features.forEach(({ feature, status }) => {
        content += `| ${feature} | <Badge text="${status}" variant="tip" /> |\n`;
    });

    content += `\n</TableWrapper>

`;

    // Add containers section
    content += `## B2B payment methods

The Checkout drop-in includes specialized payment method containers designed for B2B purchasing workflows:

<TableWrapper nowrap={[${containersNowrap.join(', ')}]}>

| Container | Description |
|-----------|-------------|
`;

    containers.forEach(({ name, link, description }) => {
        content += `| [${name}](${link}) | ${description} |\n`;
    });

    content += `\n</TableWrapper>

`;

    if (containersNote) {
        content += `${containersNote}\n`;
    }

    return content;
}

// Main execution
const args = process.argv.slice(2);
const dropinSlug = args[0] || 'checkout';

console.log('🚀 B2B Extension Overview Generator');
console.log('=====================================');

const success = generateB2BExtensionOverview(dropinSlug);

if (success) {
    console.log('\n✨ Generation complete!');
} else {
    console.log('\n⚠️  No B2B extension overview generated');
    process.exit(1);
}

