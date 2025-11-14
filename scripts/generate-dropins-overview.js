#!/usr/bin/env node

/**
 * Auto-generates the drop-ins overview page at src/content/docs/dropins/index.mdx
 * by reading all drop-in directories and extracting their frontmatter.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DROPINS_DIR = join(__dirname, '../src/content/docs/dropins');
const OUTPUT_FILE = join(DROPINS_DIR, 'index.mdx');

// Define the order and grouping of drop-ins
const DROP_IN_ORDER = {
    'Getting started': [
        { file: 'all/introduction.mdx', path: '/dropins/all/introduction/', label: 'Introduction' }
    ],
    'Core drop-ins': [
        'cart',
        'checkout',
        'product-details',
        'product-discovery',
        'order',
        'user-account',
        'user-auth',
        'wishlist'
    ],
    'Enhanced features': [
        'recommendations',
        'payment-services',
        'personalization'
    ]
};

/**
 * Extracts title and description from MDX frontmatter
 */
function extractFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) return null;

    const frontmatter = match[1];
    const titleMatch = frontmatter.match(/title:\s*(.+)/);
    const descMatch = frontmatter.match(/description:\s*(.+)/);

    return {
        title: titleMatch ? titleMatch[1].trim() : null,
        description: descMatch ? descMatch[1].trim() : null
    };
}

/**
 * Gets drop-in info from index.mdx file
 */
async function getDropInInfo(dropInPath, filePath = null) {
    try {
        const indexPath = filePath
            ? join(DROPINS_DIR, filePath)
            : join(DROPINS_DIR, dropInPath, 'index.mdx');

        const content = await readFile(indexPath, 'utf-8');
        const frontmatter = extractFrontmatter(content);

        if (!frontmatter || !frontmatter.title || !frontmatter.description) {
            console.warn(`Warning: Missing frontmatter in ${indexPath}`);
            return null;
        }

        return {
            path: dropInPath,
            title: frontmatter.title,
            description: frontmatter.description
        };
    } catch (error) {
        console.error(`Error reading ${dropInPath}:`, error.message);
        return null;
    }
}

/**
 * Generates the overview page content
 */
async function generateOverviewPage() {
    console.log('Generating drop-ins overview page...\n');

    const sections = [];

    for (const [sectionName, dropIns] of Object.entries(DROP_IN_ORDER)) {
        console.log(`Processing section: ${sectionName}`);

        const sectionItems = [];

        for (const dropIn of dropIns) {
            let dropInPath, label, filePath, customPath;

            if (typeof dropIn === 'string') {
                dropInPath = dropIn;
                label = null; // Will use the title from frontmatter
                filePath = null;
                customPath = null;
            } else {
                dropInPath = dropIn.dir || dropIn.file?.replace('.mdx', '');
                label = dropIn.label;
                filePath = dropIn.file;
                customPath = dropIn.path;
            }

            const info = await getDropInInfo(dropInPath, filePath);

            if (info) {
                const displayLabel = label || info.title;
                const cleanDescription = info.description.replace(/^Learn (about|how to install|about the (purpose, )?features and functions of) (the )?/i, '').trim();
                const finalDescription = cleanDescription.charAt(0).toUpperCase() + cleanDescription.slice(1);

                sectionItems.push({
                    label: displayLabel,
                    path: customPath || `/dropins/${dropInPath}/`,
                    description: finalDescription
                });

                console.log(`  ✓ ${displayLabel}`);
            }
        }

        sections.push({
            name: sectionName,
            items: sectionItems
        });
    }

    // Generate the MDX content
    let content = `---
title: Overview
description: Explore Adobe Commerce drop-in components for building high-performance storefronts with pre-built UI components and commerce functionality.
sidebar:
  label: Overview
  order: 1
---

import TableWrapper from '@components/TableWrapper.astro';

Drop-ins are pre-built, customizable UI components that provide complete commerce functionality for your storefront. Each drop-in handles a specific aspect of the shopping experience, from browsing products to completing checkout.

<TableWrapper nowrap={[0]}>

| Drop-in | Description |
|---------|-------------|
`;

    for (const section of sections) {
        content += `| **${section.name}** | |\n`;

        for (const item of section.items) {
            content += `| [${item.label}](${item.path}) | ${item.description} |\n`;
        }
    }

    content += `
</TableWrapper>
`;

    return content;
}

/**
 * Main function
 */
async function main() {
    try {
        const content = await generateOverviewPage();
        await writeFile(OUTPUT_FILE, content, 'utf-8');

        console.log(`\n✅ Successfully generated: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error generating overview page:', error);
        process.exit(1);
    }
}

main();

