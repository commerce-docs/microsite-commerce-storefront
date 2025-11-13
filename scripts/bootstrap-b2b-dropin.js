#!/usr/bin/env node

/**
 * B2B Drop-in Bootstrap Script
 * 
 * Creates minimal directory structure and overview page for a new B2B drop-in,
 * then delegates to existing generators to create all documentation.
 * 
 * USAGE:
 *   node scripts/bootstrap-b2b-dropin.js quote-management
 *   node scripts/bootstrap-b2b-dropin.js company-management
 * 
 * WHAT IT DOES:
 *   1. Creates directory: src/content/docs/dropins-b2b/{dropin-name}/
 *   2. Creates overview: src/content/docs/dropins-b2b/{dropin-name}/index.mdx
 *   3. Adds sidebar entry to astro.config.mjs
 *   4. Tells you to run: npm run generate-all-docs
 * 
 * WHAT IT DOESN'T DO (generators handle this):
 *   - quick-start.mdx (from generate-quick-start-docs)
 *   - containers/* (from generate-container-docs)
 *   - functions.mdx (from generate-function-docs)
 *   - events.mdx (from generate-event-docs)
 *   - slots.mdx (from generate-slot-docs)
 *   - styles.mdx (from generate-styles-docs)
 *   - dictionary.mdx (from generate-dictionary-docs)
 *   - initialization.mdx (from generate-initialization-docs)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ============================================================================
// CONFIGURATION
// ============================================================================

const B2B_BASE_PATH = 'src/content/docs/dropins-b2b';
const CONFIG_FILE = 'astro.config.mjs';
const TEMPLATE_FILE = '_dropin-templates/dropin-overview-minimal.mdx';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function toKebabCase(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toTitleCase(str) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function replacePlaceholders(content, placeholders) {
    let result = content;
    for (const [key, value] of Object.entries(placeholders)) {
        const regex = new RegExp(key, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

// ============================================================================
// MAIN LOGIC
// ============================================================================

function createOverviewPage(dropinName) {
    const dropinSlug = toKebabCase(dropinName);
    const dropinDisplay = toTitleCase(dropinSlug);

    // Read template
    const templatePath = join(projectRoot, TEMPLATE_FILE);
    if (!existsSync(templatePath)) {
        console.error(`❌ Template not found: ${TEMPLATE_FILE}`);
        process.exit(1);
    }

    const template = readFileSync(templatePath, 'utf8');

    // Replace placeholders
    const content = replacePlaceholders(template, {
        'DROPIN_NAME': dropinDisplay,
        'DROPIN_SLUG': dropinSlug
    });

    // Create directory
    const dropinDir = join(projectRoot, B2B_BASE_PATH, dropinSlug);
    if (!existsSync(dropinDir)) {
        mkdirSync(dropinDir, { recursive: true });
        console.log(`✓ Created directory: ${B2B_BASE_PATH}/${dropinSlug}/`);
    } else {
        console.log(`⚠️  Directory already exists: ${B2B_BASE_PATH}/${dropinSlug}/`);
    }

    // Write overview file
    const overviewPath = join(dropinDir, 'index.mdx');
    if (existsSync(overviewPath)) {
        console.log(`⚠️  Overview already exists: ${overviewPath}`);
        console.log(`   Skipping to avoid overwriting manual content.`);
        return { dropinSlug, dropinDisplay, created: false };
    }

    writeFileSync(overviewPath, content, 'utf8');
    console.log(`✓ Created overview: ${B2B_BASE_PATH}/${dropinSlug}/index.mdx`);

    return { dropinSlug, dropinDisplay, created: true };
}

function addSidebarEntry(dropinSlug, dropinDisplay) {
    const configPath = join(projectRoot, CONFIG_FILE);
    let config = readFileSync(configPath, 'utf8');

    // Check if entry already exists
    const searchPattern = new RegExp(`label: '${dropinDisplay}'[\\s\\S]*?link: '/dropins-b2b/${dropinSlug}/'`, 'm');
    if (searchPattern.test(config)) {
        console.log(`⚠️  Sidebar entry already exists for: ${dropinDisplay}`);
        return;
    }

    // Find the B2B drop-ins section
    const b2bSectionPattern = /{\s*label: 'B2B drop-ins',[\s\S]*?items: \[\s*/;
    const match = config.match(b2bSectionPattern);

    if (!match) {
        console.error(`❌ Could not find B2B drop-ins section in ${CONFIG_FILE}`);
        console.log(`   Please add the sidebar entry manually.`);
        return;
    }

    // Create new entry
    const newEntry = `                    {
                      label: '${dropinDisplay}',
                      collapsed: true,
                      items: [
                        { label: 'Overview', link: '/dropins-b2b/${dropinSlug}/' },
                        { label: 'Quick Start', link: '/dropins-b2b/${dropinSlug}/quick-start/' },
                        { label: 'Initialization', link: '/dropins-b2b/${dropinSlug}/initialization/' },
                        {
                          label: 'Containers', collapsed: true,
                          items: [
                            { label: 'Overview', link: '/dropins-b2b/${dropinSlug}/containers/' },
                          ]
                        },
                        { label: 'Functions', link: '/dropins-b2b/${dropinSlug}/functions/' },
                        { label: 'Events', link: '/dropins-b2b/${dropinSlug}/events/' },
                        { label: 'Slots', link: '/dropins-b2b/${dropinSlug}/slots/' },
                        { label: 'Dictionary', link: '/dropins-b2b/${dropinSlug}/dictionary/' },
                        { label: 'Styles', link: '/dropins-b2b/${dropinSlug}/styles/' }
                      ]
                    },
`;

    // Insert after the B2B section opening
    const insertIndex = match.index + match[0].length;
    config = config.slice(0, insertIndex) + newEntry + config.slice(insertIndex);

    // Write back
    writeFileSync(configPath, config, 'utf8');
    console.log(`✓ Added sidebar entry to: ${CONFIG_FILE}`);
}

// ============================================================================
// CLI
// ============================================================================

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
B2B Drop-in Bootstrap Script
============================

Creates minimal structure for a new B2B drop-in.

USAGE:
  node scripts/bootstrap-b2b-dropin.js <dropin-name>

EXAMPLES:
  node scripts/bootstrap-b2b-dropin.js quote-management
  node scripts/bootstrap-b2b-dropin.js company-management

WHAT IT CREATES:
  - Directory: src/content/docs/dropins-b2b/{dropin-name}/
  - Overview: src/content/docs/dropins-b2b/{dropin-name}/index.mdx
  - Sidebar entry in astro.config.mjs

NEXT STEPS:
  1. Update the overview page with actual content
  2. Run: npm run generate-all-docs
     (This generates all other documentation files)
        `);
        process.exit(0);
    }

    const dropinName = args[0];

    console.log(`\n🚀 Bootstrapping B2B Drop-in: ${dropinName}`);
    console.log(`${'='.repeat(50)}\n`);

    // Create overview
    const { dropinSlug, dropinDisplay, created } = createOverviewPage(dropinName);

    // Add sidebar entry
    addSidebarEntry(dropinSlug, dropinDisplay);

    // Next steps
    console.log(`\n✅ Bootstrap complete!\n`);
    console.log(`📝 NEXT STEPS:\n`);
    console.log(`   1. Edit the overview page:`);
    console.log(`      ${B2B_BASE_PATH}/${dropinSlug}/index.mdx`);
    console.log(`      - Add description`);
    console.log(`      - Update feature table`);
    console.log(`      - Review section descriptions\n`);
    console.log(`   2. Generate all documentation:`);
    console.log(`      npm run generate-all-docs\n`);
    console.log(`   This will create:`);
    console.log(`      - quick-start.mdx`);
    console.log(`      - containers/*.mdx`);
    console.log(`      - functions.mdx`);
    console.log(`      - events.mdx`);
    console.log(`      - slots.mdx`);
    console.log(`      - styles.mdx`);
    console.log(`      - dictionary.mdx`);
    console.log(`      - initialization.mdx\n`);
}

main();

