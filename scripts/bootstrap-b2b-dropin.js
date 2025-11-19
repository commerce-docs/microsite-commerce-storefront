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
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Import drop-in configuration
import { DROPIN_REPOS } from './lib/dropin-config.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const B2B_BASE_PATH = 'src/content/docs/dropins-b2b';
const CONFIG_FILE = 'astro.config.mjs';
const TEMPLATE_FILE = '_dropin-templates/dropin-overview-minimal.mdx';
const TEMP_CLONE_DIR = '.temp-repo-clone';

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

/**
 * Extract description from README.md
 */
function extractDescriptionFromReadme(readmeContent) {
    if (!readmeContent) return null;
    
    // Try to find first meaningful paragraph after title
    const lines = readmeContent.split('\n');
    let description = '';
    let foundTitle = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) continue;
        
        // Skip title (first # heading)
        if (trimmed.startsWith('#') && !foundTitle) {
            foundTitle = true;
            continue;
        }
        
        // Skip badges, images, links at start
        if (trimmed.startsWith('[![') || trimmed.startsWith('[!') || trimmed.startsWith('![')) {
            continue;
        }
        
        // Found first paragraph - use it
        if (foundTitle && trimmed.length > 50 && !trimmed.startsWith('#')) {
            description = trimmed;
            break;
        }
    }
    
    return description || null;
}

/**
 * Get drop-in information from repository
 */
function getDropinInfo(dropinSlug) {
    const repoConfig = DROPIN_REPOS[dropinSlug];
    
    if (!repoConfig) {
        console.log(`⚠️  No repository config found for: ${dropinSlug}`);
        return { description: null, repoConfig: null };
    }
    
    // If it's a public repo, try to fetch README
    if (repoConfig.isPublic) {
        try {
            const tempDir = join(projectRoot, TEMP_CLONE_DIR, dropinSlug);
            
            // Clean up any existing temp directory
            if (existsSync(tempDir)) {
                execSync(`rm -rf "${tempDir}"`);
            }
            
            mkdirSync(tempDir, { recursive: true });
            
            // Clone repo shallowly (just latest commit, faster)
            console.log(`  📥 Fetching README from: ${repoConfig.gitUrl}`);
            execSync(`git clone --depth 1 "${repoConfig.gitUrl}" "${tempDir}"`, { 
                stdio: 'pipe' 
            });
            
            // Read README
            const readmePath = join(tempDir, 'README.md');
            if (existsSync(readmePath)) {
                const readmeContent = readFileSync(readmePath, 'utf8');
                const description = extractDescriptionFromReadme(readmeContent);
                
                // Clean up
                execSync(`rm -rf "${tempDir}"`);
                
                if (description) {
                    console.log(`  ✓ Extracted description from README`);
                    return { description, repoConfig };
                }
            }
            
            // Clean up
            execSync(`rm -rf "${tempDir}"`);
        } catch (error) {
            console.log(`  ⚠️  Could not fetch README: ${error.message}`);
        }
    }
    
    return { description: null, repoConfig };
}

// ============================================================================
// MAIN LOGIC
// ============================================================================

function createOverviewPage(dropinName) {
    const dropinSlug = toKebabCase(dropinName);
    const dropinDisplay = toTitleCase(dropinSlug);

    // Get drop-in information from repository
    const { description, repoConfig } = getDropinInfo(dropinSlug);

    // Read template
    const templatePath = join(projectRoot, TEMPLATE_FILE);
    if (!existsSync(templatePath)) {
        console.error(`❌ Template not found: ${TEMPLATE_FILE}`);
        process.exit(1);
    }

    let template = readFileSync(templatePath, 'utf8');

    // If we have a description from README, replace the placeholder paragraph
    if (description) {
        // Replace the [Drop-in developer] placeholder paragraph with actual description
        template = template.replace(
            /\*\*\[Drop-in developer\]:\*\*.*?(?=\n\n##)/s,
            description
        );
    }

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

