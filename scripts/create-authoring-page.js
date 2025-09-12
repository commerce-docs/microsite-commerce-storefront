#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Template and target paths
const TEMPLATE_PATH = join(projectRoot, '_dropin-templates', 'dropin-authoring.mdx');
const TARGET_DIR = join(projectRoot, 'src', 'content', 'docs', 'merchants', 'commerce-blocks');
const CONFIG_PATH = join(projectRoot, 'astro.config.mjs');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt for user input
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Helper function to format dropin name
function formatDropinName(name) {
    return {
        original: name,
        kebab: name.toLowerCase().replace(/\s+/g, '-'),
        pascal: name.replace(/\s+(.)/g, (_, char) => char.toUpperCase()),
        title: name.replace(/\b\w/g, char => char.toUpperCase())
    };
}

// Helper function to replace placeholders in template
function replacePlaceholders(content, dropinName) {
    const formats = formatDropinName(dropinName);

    return content
        .replace(/DROPIN_NAME/g, formats.title)
        .replace(/COMMERCE_FEATURE_NAME/g, 'Feature name');
}

// Helper function to remove item from sidebar config
function removeFromSidebarConfig(dropinName, formats) {
    try {
        let configContent = readFileSync(CONFIG_PATH, 'utf8');

        const dropinLabel = formats.original;
        const dropinKebab = formats.kebab;

        // Use regex to find the Commerce blocks section more precisely
        const commerceBlocksRegex = /(\s+{\s+label:\s+'Commerce blocks',\s+items:\s+\[)([\s\S]*?)(\s+\],\s+},)/;
        const match = configContent.match(commerceBlocksRegex);

        if (!match) {
            console.log('⚠️  Could not find Commerce blocks section');
            return false;
        }

        const [fullMatch, opening, itemsContent, closing] = match;

        // Parse existing items
        const existingItems = [];
        const itemRegex = /{\s*label:\s*'([^']+)',\s*link:\s*'([^']+)'\s*}/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(itemsContent)) !== null) {
            existingItems.push({
                label: itemMatch[1],
                link: itemMatch[2]
            });
        }

        // Find and remove the item
        const itemToRemove = existingItems.find(item =>
            item.label === dropinLabel || item.link === `merchants/commerce-blocks/${dropinKebab}/`
        );

        if (!itemToRemove) {
            console.log('⚠️  Entry not found in sidebar');
            return false;
        }

        // Remove the item
        const filteredItems = existingItems.filter(item => item !== itemToRemove);

        // Rebuild the items content
        const newItemsContent = filteredItems.map(item =>
            `                    {
                      label: '${item.label}',
                      link: '${item.link}'
                    }`
        ).join(',\n');

        // Reconstruct the section
        const newSection = `${opening}\n${newItemsContent}\n                  ${closing.trim()}`;

        // Replace the section in the config
        const updatedConfig = configContent.replace(fullMatch, newSection);

        // Write the updated config
        writeFileSync(CONFIG_PATH, updatedConfig);
        console.log('✅ Removed from sidebar configuration');
        return true;

    } catch (error) {
        console.error('❌ Error removing from sidebar:', error.message);
        return false;
    }
}

// Helper function to update sidebar config
function updateSidebarConfig(dropinName, formats) {
    try {
        let configContent = readFileSync(CONFIG_PATH, 'utf8');

        const dropinLabel = formats.original;
        const dropinKebab = formats.kebab;

        // Use regex to find the Commerce blocks section more precisely
        const commerceBlocksRegex = /(\s+{\s+label:\s+'Commerce blocks',\s+items:\s+\[)([\s\S]*?)(\s+\],\s+},)/;
        const match = configContent.match(commerceBlocksRegex);

        if (!match) {
            console.log('⚠️  Could not find Commerce blocks section');
            return;
        }

        const [fullMatch, opening, itemsContent, closing] = match;

        // Parse existing items
        const existingItems = [];
        const itemRegex = /{\s*label:\s*'([^']+)',\s*link:\s*'([^']+)'\s*}/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(itemsContent)) !== null) {
            existingItems.push({
                label: itemMatch[1],
                link: itemMatch[2]
            });
        }

        // Check if the new item already exists
        const alreadyExists = existingItems.some(item =>
            item.label === dropinLabel || item.link === `merchants/commerce-blocks/${dropinKebab}/`
        );

        if (alreadyExists) {
            console.log('⚠️  Entry already exists in sidebar');
            return;
        }

        // Add the new item
        existingItems.push({
            label: dropinLabel,
            link: `merchants/commerce-blocks/${dropinKebab}/`
        });

        // Sort items alphabetically by label
        existingItems.sort((a, b) => a.label.localeCompare(b.label));

        // Rebuild the items content
        const newItemsContent = existingItems.map(item =>
            `                    {
                      label: '${item.label}',
                      link: '${item.link}'
                    }`
        ).join(',\n');

        // Reconstruct the section
        const newSection = `${opening}\n${newItemsContent}\n                  ${closing.trim()}`;

        // Replace the section in the config
        const updatedConfig = configContent.replace(fullMatch, newSection);

        // Write the updated config
        writeFileSync(CONFIG_PATH, updatedConfig);
        console.log('✅ Updated sidebar configuration');

    } catch (error) {
        console.error('❌ Error updating sidebar:', error.message);
    }
}

// Main function to remove authoring page
async function removeAuthoringPage() {
    console.log('🗑️  Drop-in Authoring Page Remover');
    console.log('==================================\n');

    try {
        // Get dropin name from user
        const dropinName = await prompt('Enter the drop-in component name to remove: ');

        if (!dropinName.trim()) {
            console.log('❌ Drop-in name is required.');
            rl.close();
            return;
        }

        const formats = formatDropinName(dropinName.trim());
        const fileName = `${formats.kebab}.mdx`;
        const targetPath = join(TARGET_DIR, fileName);

        // Check if file exists
        if (!existsSync(targetPath)) {
            console.log(`❌ File "${fileName}" does not exist.`);
            rl.close();
            return;
        }

        // Confirm removal
        const confirm = await prompt(`⚠️  Are you sure you want to remove "${fileName}"? This action cannot be undone. (y/N): `);
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            console.log('❌ Operation cancelled.');
            rl.close();
            return;
        }

        // Remove the file
        console.log('🗑️  Removing authoring page...');
        unlinkSync(targetPath);
        console.log(`✅ Removed file: ${fileName}`);

        // Remove from sidebar
        console.log('🔧 Removing from sidebar...');
        const sidebarRemoved = removeFromSidebarConfig(dropinName.trim(), formats);

        if (sidebarRemoved) {
            console.log(`\n✅ Successfully removed authoring page: ${fileName}`);
            console.log('🔗 Removed from Commerce blocks sidebar section');
        } else {
            console.log(`\n⚠️  File removed but sidebar entry may not have been found`);
        }

    } catch (error) {
        console.error('❌ Error removing authoring page:', error.message);
    } finally {
        rl.close();
    }
}

// Main function to create authoring page
async function createAuthoringPage() {
    console.log('📝 Drop-in Authoring Page Generator');
    console.log('===================================\n');

    try {
        // Check if template exists
        if (!existsSync(TEMPLATE_PATH)) {
            console.error('❌ Template file not found:', TEMPLATE_PATH);
            rl.close();
            return;
        }

        // Get dropin name from user
        const dropinName = await prompt('Enter the drop-in component name: ');

        if (!dropinName.trim()) {
            console.log('❌ Drop-in name is required.');
            rl.close();
            return;
        }

        const formats = formatDropinName(dropinName.trim());
        const fileName = `${formats.kebab}.mdx`;
        const targetPath = join(TARGET_DIR, fileName);

        // Check if file already exists
        if (existsSync(targetPath)) {
            const overwrite = await prompt(`⚠️  File "${fileName}" already exists. Overwrite? (y/N): `);
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('❌ Operation cancelled.');
                rl.close();
                return;
            }
        }

        // Read template
        console.log('📖 Reading template...');
        const templateContent = readFileSync(TEMPLATE_PATH, 'utf8');

        // Replace placeholders
        console.log('🔄 Processing template...');
        const customizedContent = replacePlaceholders(templateContent, dropinName.trim());

        // Ensure target directory exists
        if (!existsSync(TARGET_DIR)) {
            console.log('📁 Creating target directory...');
            mkdirSync(TARGET_DIR, { recursive: true });
        }

        // Write the new file
        console.log(' Creating authoring page...');
        writeFileSync(targetPath, customizedContent);

        // Update sidebar
        console.log('🔧 Updating sidebar...');
        updateSidebarConfig(dropinName.trim(), formats);

        console.log(`\n✅ Successfully created authoring page: ${fileName}`);
        console.log(` Location: ${targetPath}`);
        console.log('🔗 Added to Commerce blocks sidebar section');
        console.log('\n Next steps:');
        console.log('1. Edit the file to add specific commerce features');
        console.log('2. Update the description and overview content');
        console.log('3. Add any additional sections as needed');

    } catch (error) {
        console.error('❌ Error creating authoring page:', error.message);
    } finally {
        rl.close();
    }
}

// Help function
function showHelp() {
    console.log('📝 Drop-in Authoring Page Manager');
    console.log('=================================\n');
    console.log('Usage:');
    console.log('  node create-authoring-page.js [command]\n');
    console.log('Commands:');
    console.log('  create, c    Create a new authoring page (default)');
    console.log('  remove, r    Remove an existing authoring page');
    console.log('  help, h      Show this help message\n');
    console.log('Examples:');
    console.log('  node create-authoring-page.js create');
    console.log('  node create-authoring-page.js remove');
    console.log('  node create-authoring-page.js c');
    console.log('  node create-authoring-page.js r');
}

// Main execution function
async function main() {
    const args = process.argv.slice(2);
    const command = args[0]?.toLowerCase();

    switch (command) {
        case 'remove':
        case 'r':
            await removeAuthoringPage();
            break;
        case 'help':
        case 'h':
        case '--help':
        case '-h':
            showHelp();
            break;
        case 'create':
        case 'c':
        case undefined:
        case '':
            await createAuthoringPage();
            break;
        default:
            console.log(`❌ Unknown command: ${command}\n`);
            showHelp();
            process.exit(1);
    }
}

// Run the script
main();