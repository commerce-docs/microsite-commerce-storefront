#!/usr/bin/env node

/**
 * Auto-generates overview pages by scanning directories and extracting content.
 * 
 * FEATURES:
 * - Auto-discovers subdirectories with index.mdx files
 * - Supports nested folder structures
 * - Configurable target directory
 * - Optional custom ordering and filtering
 * - Intelligent description shortening
 * 
 * USAGE:
 *   # Auto-discover drop-ins in default directory
 *   npm run generate-dropins-overview
 * 
 *   # Generate overview for custom directory
 *   npm run generate-dropins-overview -- src/content/docs/blocks
 * 
 *   # Use custom config file
 *   npm run generate-dropins-overview -- --config custom-config.js
 * 
 * CONFIG FILE (optional):
 *   export default {
 *     targetDir: 'src/content/docs/dropins',  // Directory to scan
 *     outputFile: 'index.mdx',                // Output filename
 *     include: ['cart', 'checkout'],          // Only include these (optional)
 *     exclude: ['deprecated-*'],              // Exclude patterns (optional)
 *     order: 'alphabetical',                  // 'alphabetical' or 'custom' or 'discovery'
 *     customOrder: [],                        // Custom order array (if order: 'custom')
 *     title: 'Overview',                      // Page title
 *     description: 'Overview description',    // Page description
 *     introText: 'Introduction paragraph'     // Intro paragraph
 *   }
 * 
 * See scripts/README-generate-overview.md for full documentation.
 */

import { readdir, readFile, writeFile, access, stat } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Default configuration
const DEFAULT_CONFIG = {
    targetDir: 'src/content/docs/dropins',
    outputFile: 'index.mdx',
    include: null,  // null = include all
    exclude: ['all'], // Exclude utility folders
    order: 'alphabetical', // 'alphabetical' | 'custom' | 'discovery'
    customOrder: [],
    title: 'Overview',
    description: 'Explore Adobe Commerce drop-in components for building high-performance storefronts with pre-built UI components and commerce functionality.',
    introText: 'Drop-ins are pre-built, customizable UI components that provide complete commerce functionality for your storefront. Each drop-in handles a specific aspect of the shopping experience, from browsing products to completing checkout.'
};

/**
 * Intelligently shortens text to fit within max length while preserving meaning
 */
function intelligentShorten(text, maxLength) {
    // Remove redundant phrases
    let shortened = text
        // Remove "The X drop-in component" prefixes - specific cases first
        .replace(/^The checkout drop-in component /i, '')
        .replace(/^The Payment Services drop-in component /i, '')
        .replace(/^The user account drop-in component /i, '')
        .replace(/^The user auth drop-in component /i, '')
        // Then general patterns
        .replace(/^The\s+(.+?)\s+drop-in\s+component\s+/i, '')
        .replace(/^The\s+(.+?)\s+drop-in\s+/i, '')
        // Simplify verbose phrases
        .replace(/^provides a variety of fully-(\w+)/i, 'Provides $1')
        .replace(/^will provide /i, 'Provides ')
        .replace(/^renders /i, 'Renders ')
        .replace(/provides a comprehensive set of tools and containers/i, 'Provides tools')
        .replace(/provides a powerful way to/i, 'Enables you to')
        .replace(/provides a set of tools and containers/i, 'Provides tools')
        .replace(/provides both guests and registered customers with a mechanism to/i, 'Lets customers')
        // Remove redundant endings
        .replace(/\s+in\s+your\s+storefront\.?$/i, '.')
        .replace(/\s+within\s+your\s+storefront\.?$/i, '.')
        .replace(/\s+for\s+your\s+storefront\.?$/i, '.')
        .replace(/\s+of\s+your\s+storefront\.?$/i, '.')
        // Simplify "designed to"
        .replace(/designed to manage and display/i, 'to manage and display')
        .replace(/designed to display/i, 'to display')
        .replace(/designed to/gi, 'to')
        // Clean up
        .replace(/drop-in\s+component/gi, 'drop-in')
        .replace(/\s{2,}/g, ' ')
        .replace(/\.\s*\./g, '.')
        .trim();

    // Capitalize first letter
    if (shortened.length > 0) {
        shortened = shortened.charAt(0).toUpperCase() + shortened.slice(1);
    }

    // If still too long, intelligently truncate at sentence or clause boundary
    if (shortened.length > maxLength) {
        // Try to cut at a sentence boundary
        const sentences = shortened.match(/[^.!?]+[.!?]+/g) || [shortened];
        let result = '';

        for (const sentence of sentences) {
            if ((result + sentence).length <= maxLength) {
                result += sentence;
            } else {
                break;
            }
        }

        // If we got at least one sentence, use it
        if (result.length > 50) {
            return result.trim();
        }

        // Otherwise, cut at a comma or natural break point
        const maxCut = maxLength - 1;
        const cutPoint = shortened.lastIndexOf(',', maxCut);

        if (cutPoint > 50) {
            return shortened.substring(0, cutPoint) + '.';
        }

        // Last resort: cut at last space before limit
        const spacePoint = shortened.lastIndexOf(' ', maxCut);
        return shortened.substring(0, spacePoint) + '.';
    }

    return shortened;
}

/**
 * Extracts title from MDX frontmatter and description from first paragraph
 */
function extractFrontmatterAndContent(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) return null;

    const frontmatter = match[1];
    const titleMatch = frontmatter.match(/title:\s*(.+)/);

    // Get content after frontmatter
    const contentAfterFrontmatter = content.substring(match[0].length);

    // Extract first meaningful paragraph (skip imports and empty lines)
    const paragraphs = contentAfterFrontmatter
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => {
            // Skip empty, imports, and component declarations
            return p &&
                !p.startsWith('import ') &&
                !p.startsWith('<') &&
                !p.startsWith('##') &&
                !p.startsWith(':::') &&
                p.length > 20; // Ensure it's substantial
        });

    // Get first paragraph and clean it up
    let description = paragraphs[0] || null;

    if (description) {
        // Remove markdown formatting
        description = description
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
            .replace(/[*_`]/g, '') // Remove emphasis markers
            .replace(/\n/g, ' ') // Join lines
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Always intelligently shorten (removes redundant phrases and enforces max length)
        description = intelligentShorten(description, 150);
    }

    return {
        title: titleMatch ? titleMatch[1].trim() : null,
        description
    };
}

/**
 * Checks if a path matches any glob-like patterns
 */
function matchesPattern(path, patterns) {
    if (!patterns || patterns.length === 0) return false;

    return patterns.some(pattern => {
        // Simple glob support: * matches anything
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(path);
    });
}

/**
 * Auto-discovers subdirectories that contain index.mdx files
 */
async function discoverSubdirectories(targetDir, config) {
    const discovered = [];

    async function scanDir(dir, relativePath = '') {
        try {
            const entries = await readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                if (!entry.isDirectory()) continue;

                const entryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
                const fullPath = join(dir, entry.name);
                const indexPath = join(fullPath, 'index.mdx');

                // Check if this directory should be excluded
                if (config.exclude && matchesPattern(entry.name, config.exclude)) {
                    continue;
                }

                // Check if this directory should be included
                if (config.include && !config.include.includes(entry.name) && !config.include.includes(entryPath)) {
                    // Still recurse in case there are subdirectories we want
                    await scanDir(fullPath, entryPath);
                    continue;
                }

                // Check if index.mdx exists
                try {
                    await access(indexPath);
                    discovered.push(entryPath);
                } catch {
                    // No index.mdx, recurse into subdirectories
                    await scanDir(fullPath, entryPath);
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dir}:`, error.message);
        }
    }

    await scanDir(targetDir);
    return discovered;
}

/**
 * Gets drop-in info from index.mdx file
 */
async function getDropInInfo(targetDir, dropInPath) {
    try {
        const indexPath = join(targetDir, dropInPath, 'index.mdx');
        const content = await readFile(indexPath, 'utf-8');
        const extracted = extractFrontmatterAndContent(content);

        if (!extracted || !extracted.title || !extracted.description) {
            console.warn(`Warning: Missing title or description in ${indexPath}`);
            return null;
        }

        return {
            path: dropInPath,
            title: extracted.title,
            description: extracted.description
        };
    } catch (error) {
        console.error(`Error reading ${dropInPath}:`, error.message);
        return null;
    }
}

/**
 * Sorts subdirectories according to config
 */
function sortSubdirectories(subdirs, config) {
    if (config.order === 'discovery') {
        return subdirs; // Keep discovery order
    }

    if (config.order === 'custom' && config.customOrder && config.customOrder.length > 0) {
        // Sort by custom order, putting unspecified items at the end
        return [...subdirs].sort((a, b) => {
            const aIndex = config.customOrder.indexOf(a);
            const bIndex = config.customOrder.indexOf(b);

            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }

    // Default: alphabetical
    return [...subdirs].sort((a, b) => a.localeCompare(b));
}

/**
 * Generates the overview page content
 */
async function generateOverviewPage(config) {
    const targetDir = join(PROJECT_ROOT, config.targetDir);
    const targetDirRelative = relative(join(targetDir, '..'), targetDir);

    console.log(`Generating overview for: ${config.targetDir}\n`);

    // Auto-discover subdirectories
    let subdirs = await discoverSubdirectories(targetDir, config);
    console.log(`Discovered ${subdirs.length} subdirectories\n`);

    // Sort according to config
    subdirs = sortSubdirectories(subdirs, config);

    // Get info for each subdirectory
    const items = [];
    for (const subdir of subdirs) {
        const info = await getDropInInfo(targetDir, subdir);

        if (info) {
            // Construct path based on target directory
            const itemPath = `/${config.targetDir.replace('src/content/docs/', '')}/${subdir}/`;

            items.push({
                label: info.title,
                path: itemPath,
                description: info.description
            });

            console.log(`  ✓ ${info.title}`);
        }
    }

    // Generate the MDX content
    let content = `---
title: ${config.title}
description: ${config.description}
sidebar:
  label: Overview
  order: 1
---

import TableWrapper from '@components/TableWrapper.astro';

${config.introText}

<TableWrapper nowrap={[0]}>

| Item | Description |
|------|-------------|
`;

    for (const item of items) {
        content += `| [${item.label}](${item.path}) | ${item.description} |\n`;
    }

    content += `
</TableWrapper>
`;

    return content;
}

/**
 * Loads configuration from file or command-line arguments
 */
async function loadConfig() {
    let config = { ...DEFAULT_CONFIG };

    const args = process.argv.slice(2);

    // Check for --config flag
    const configIndex = args.indexOf('--config');
    if (configIndex !== -1 && args[configIndex + 1]) {
        const configPath = join(PROJECT_ROOT, args[configIndex + 1]);
        try {
            const configModule = await import(configPath);
            config = { ...config, ...configModule.default };
            console.log(`📄 Loaded config from: ${args[configIndex + 1]}\n`);
        } catch (error) {
            console.error(`Error loading config file: ${error.message}`);
            process.exit(1);
        }
    } else if (args[0] && !args[0].startsWith('--')) {
        // First argument is target directory
        config.targetDir = args[0];
    }

    return config;
}

/**
 * Main function
 */
async function main() {
    try {
        const config = await loadConfig();
        const targetDir = join(PROJECT_ROOT, config.targetDir);
        const outputFile = join(targetDir, config.outputFile);

        const content = await generateOverviewPage(config);
        await writeFile(outputFile, content, 'utf-8');

        console.log(`\n✅ Successfully generated: ${relative(PROJECT_ROOT, outputFile)}`);
    } catch (error) {
        console.error('Error generating overview page:', error);
        process.exit(1);
    }
}

main();

