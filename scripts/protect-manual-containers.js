#!/usr/bin/env node

/**
 * Protect Manual Container Documentation
 * 
 * Scans all container files and creates enrichment files with override_template: true
 * for any containers that have custom rich content (Diagrams, OptionsTable, images, etc.)
 * 
 * This prevents the container generator from overwriting manual documentation.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Drop-ins to scan (excluding B2B for now)
const DROPINS = [
    'cart',
    'checkout',
    'order',
    'payment-services',
    'personalization',
    'product-details',
    'product-discovery',
    'recommendations',
    'user-account',
    'user-auth',
    'wishlist'
];

// Patterns that indicate custom rich content
const RICH_CONTENT_PATTERNS = [
    'Diagram',
    'OptionsTable',
    '@images',
    'CodeInclude',
    '![', // Inline images
];

/**
 * Convert kebab-case to PascalCase for container names
 */
function toPascalCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

/**
 * Check if a file has custom rich content
 */
function hasRichContent(filePath) {
    try {
        const content = readFileSync(filePath, 'utf8');
        return RICH_CONTENT_PATTERNS.some(pattern => content.includes(pattern));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Extract description from MDX file
 */
function extractDescription(filePath) {
    try {
        const content = readFileSync(filePath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const descMatch = frontmatter.match(/description:\s*(.+)/);
            if (descMatch) {
                return descMatch[1].trim().replace(/^["']|["']$/g, '');
            }
        }

        // Try to extract first paragraph after frontmatter
        const afterFrontmatter = content.substring(content.indexOf('---', 3) + 3);
        const paragraphs = afterFrontmatter.split('\n\n');
        for (const para of paragraphs) {
            const trimmed = para.trim();
            if (trimmed && !trimmed.startsWith('import ') && !trimmed.startsWith('<') && !trimmed.startsWith('#')) {
                return trimmed.substring(0, 200);
            }
        }
    } catch (error) {
        return null;
    }
    return null;
}

/**
 * Scan drop-in containers and find ones with rich content
 */
function scanDropinContainers(dropinName) {
    const containersDir = join(projectRoot, 'src/content/docs/dropins', dropinName, 'containers');

    if (!existsSync(containersDir)) {
        return [];
    }

    const richContainers = [];
    const files = readdirSync(containersDir);

    for (const file of files) {
        // Skip index files and non-MDX files
        if (file === 'index.mdx' || !file.endsWith('.mdx')) {
            continue;
        }

        // Skip files starting with _ (includes/partials)
        if (file.startsWith('_')) {
            continue;
        }

        const filePath = join(containersDir, file);

        if (hasRichContent(filePath)) {
            const containerName = basename(file, '.mdx');
            const pascalName = toPascalCase(containerName);
            const description = extractDescription(filePath);

            richContainers.push({
                kebabName: containerName,
                pascalName: pascalName,
                description: description
            });
        }
    }

    return richContainers;
}

/**
 * Create or update enrichment file for a drop-in
 */
function createEnrichmentFile(dropinName, containers) {
    if (containers.length === 0) {
        console.log(`  ⊘  No containers with rich content`);
        return;
    }

    const enrichmentDir = join(projectRoot, '_dropin-enrichments', dropinName);
    const enrichmentFile = join(enrichmentDir, 'containers.json');

    // Create directory if it doesn't exist
    if (!existsSync(enrichmentDir)) {
        mkdirSync(enrichmentDir, { recursive: true });
    }

    // Load existing enrichment if it exists
    let enrichmentData = {};
    if (existsSync(enrichmentFile)) {
        try {
            enrichmentData = JSON.parse(readFileSync(enrichmentFile, 'utf8'));
        } catch (error) {
            console.warn(`  ⚠️  Could not parse existing enrichment: ${error.message}`);
        }
    }

    // Add/update containers with rich content
    let addedCount = 0;
    let updatedCount = 0;

    for (const container of containers) {
        if (!enrichmentData[container.pascalName]) {
            enrichmentData[container.pascalName] = {
                override_template: true,
                description: container.description || `Custom ${container.pascalName} container documentation.`,
                note: "This container has custom manual documentation with rich content (diagrams, images, tables, etc.). The manual file will be preserved and not overwritten by the generator."
            };
            addedCount++;
        } else if (!enrichmentData[container.pascalName].override_template) {
            enrichmentData[container.pascalName].override_template = true;
            updatedCount++;
        }
    }

    // Write enrichment file with nice formatting
    writeFileSync(enrichmentFile, JSON.stringify(enrichmentData, null, 2) + '\n', 'utf8');

    console.log(`  ✅ ${addedCount} added, ${updatedCount} updated → ${enrichmentFile.replace(projectRoot, '.')}`);
}

/**
 * Main function
 */
function main() {
    console.log('🛡️  Protecting Manual Container Documentation\n');
    console.log('Scanning for containers with rich content...\n');

    let totalProtected = 0;

    for (const dropin of DROPINS) {
        console.log(`📦 ${dropin}`);
        const containers = scanDropinContainers(dropin);

        if (containers.length > 0) {
            console.log(`  Found ${containers.length} containers with rich content:`);
            containers.forEach(c => console.log(`    - ${c.kebabName} (${c.pascalName})`));
            createEnrichmentFile(dropin, containers);
            totalProtected += containers.length;
        } else {
            console.log(`  ⊘  No containers with rich content`);
        }
        console.log();
    }

    console.log(`\n✨ Protected ${totalProtected} containers across ${DROPINS.length} drop-ins\n`);
    console.log('These containers will not be overwritten when running: npm run generate-container-docs\n');
}

main();

