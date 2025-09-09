#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, readdirSync, statSync } from 'fs';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the project root directory (two levels up from scripts/)
const projectRoot = join(__dirname, '..');
const registryPath = join(projectRoot, 'dropin-registry.json');

// Registry management functions
function loadRegistry() {
    try {
        if (existsSync(registryPath)) {
            return JSON.parse(readFileSync(registryPath, 'utf8'));
        }
    } catch (error) {
        console.log('⚠️  Could not load dropin registry, creating new one');
    }
    return { dropins: {} };
}

function saveRegistry(registry) {
    try {
        writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    } catch (error) {
        console.log('⚠️  Could not save dropin registry:', error.message);
    }
}

function registerDropin(dropinName, isB2B = false) {
    const registry = loadRegistry();
    registry.dropins[dropinName] = {
        label: dropinName,
        isB2B: isB2B,
        createdAt: new Date().toISOString()
    };
    saveRegistry(registry);
}

function getDropinStructure(dropinName) {
    const registry = loadRegistry();
    return registry.dropins[dropinName] || null;
}

// Create readline interface for user input
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt user for input
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Helper function to convert dropin name to various formats
function formatDropinName(name) {
    const kebabCase = name.toLowerCase().replace(/\s+/g, '-');
    const camelCase = name.replace(/\s+(.)/g, (_, char) => char.toUpperCase());
    const pascalCase = name.replace(/\s+(.)/g, (_, char) => char.toUpperCase()).replace(/^./, char => char.toUpperCase());

    return {
        kebab: kebabCase,
        camel: camelCase,
        pascal: pascalCase,
        original: name
    };
}

// Helper function to replace placeholders in file content
function replacePlaceholders(content, dropinName) {
    const formats = formatDropinName(dropinName);

    // Replace DROPIN_NAME in title with the full dropin name + page type (e.g., "Company Management overview")
    let updatedContent = content.replace(/title: DROPIN_NAME (\w+)/g, (match, pageType) => {
        return `title: ${formats.original} ${pageType}`;
    });

    // Replace remaining DROPIN_NAME instances with the full dropin name
    updatedContent = updatedContent
        .replace(/DROPIN_NAME/g, formats.original)
        .replace(/DROPIN_PACKAGE/g, formats.kebab);

    return updatedContent;
}

// Helper function to create directory if it doesn't exist
function ensureDir(dirPath) {
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: ${dirPath}`);
    }
}

// Helper function to copy and customize template file
function copyTemplateFile(templatePath, targetPath, dropinName) {
    try {
        const content = readFileSync(templatePath, 'utf8');
        const customizedContent = replacePlaceholders(content, dropinName);
        writeFileSync(targetPath, customizedContent);
        console.log(`✓ Created file: ${targetPath}`);
    } catch (error) {
        console.error(`✗ Error creating file ${targetPath}:`, error.message);
    }
}

// Helper function to update astro.config.mjs sidebar
function updateSidebarConfig(dropinName, formats, isB2B) {
    try {
        const configPath = join(projectRoot, 'astro.config.mjs');
        let configContent = readFileSync(configPath, 'utf8');

        const dropinLabel = formats.original;
        const dropinKebab = formats.kebab;
        const basePath = isB2B ? 'dropins-b2b' : 'dropins';

        // Create the new dropin entry with EXACT formatting matching existing entries
        const newDropinEntry = `                    {
                     label: '${dropinLabel}',
                     collapsed: true,
                     items: [
                       { label: 'Overview', link: '/${basePath}/${dropinKebab}/overview/' },
                       { label: 'Installation', link: '/${basePath}/${dropinKebab}/installation/' },
                       { label: 'Initialization', link: '/${basePath}/${dropinKebab}/initialization/' },
                       {
                         label: 'Containers', collapsed: true,
                         items: [
                            { label: 'ContainerName', link: '/${basePath}/${dropinKebab}/containers/container-name/' },
                           { label: 'Styles', link: '/${basePath}/${dropinKebab}/containers/container-styles/' },
                           { label: 'Slots', link: '/${basePath}/${dropinKebab}/containers/container-slots/' },
                         ]
                       },
                       { label: 'Data events', link: '/${basePath}/${dropinKebab}/data-events/' },
                       { label: 'Functions', link: '/${basePath}/${dropinKebab}/functions/' },
                       { label: 'Dictionary', link: '/${basePath}/${dropinKebab}/dictionary/' },
                     ]
                   }`;

        const sectionLabel = isB2B ? 'Drop-ins for B2B' : 'Drop-ins for B2C';

        if (isB2B) {
            // For B2B, add at the end of the B2B section
            const b2bSectionStart = configContent.indexOf(`label: '${sectionLabel}'`);
            if (b2bSectionStart === -1) {
                console.log(`⚠️  Could not find ${sectionLabel} section`);
                return;
            }

            // Find the items array and its closing bracket
            const itemsStart = configContent.indexOf('items: [', b2bSectionStart);
            let bracketCount = 1;
            let pos = itemsStart + 8; // Start after 'items: ['

            while (bracketCount > 0 && pos < configContent.length) {
                if (configContent[pos] === '[') bracketCount++;
                else if (configContent[pos] === ']') bracketCount--;
                pos++;
            }

            const insertPos = pos - 1; // Before the closing ]
            const beforeInsert = configContent.substring(0, insertPos);
            const afterInsert = configContent.substring(insertPos);

            configContent = beforeInsert + (beforeInsert.trim().endsWith('[') ? '' : ',\n') + newDropinEntry + '\n                 ' + afterInsert;

        } else {
            // For B2C, insert alphabetically in the correct position

            // Find the B2C section
            const b2cStart = configContent.indexOf("label: 'Drop-ins for B2C'");
            const b2cEnd = configContent.indexOf("label: 'Drop-ins for B2B'");

            if (b2cStart === -1 || b2cEnd === -1) {
                console.log('⚠️  Could not find B2C section boundaries');
                return;
            }

            const b2cSection = configContent.substring(b2cStart, b2cEnd);

            // Find all existing dropin entries and their positions
            const dropinPattern = /^                    {\s*\n\s*label:\s*'([^']+)',/gm;
            const existingDropins = [];
            let match;

            while ((match = dropinPattern.exec(b2cSection)) !== null) {
                const name = match[1];
                // Skip non-dropin sections
                if (name !== 'Common' && name !== 'Overview' && name !== 'Containers') {
                    existingDropins.push({
                        name: name,
                        position: b2cStart + match.index
                    });
                }
            }

            // Find the correct alphabetical position
            let insertPosition = null;
            const newDropinName = dropinLabel;

            for (let i = 0; i < existingDropins.length; i++) {
                if (newDropinName.localeCompare(existingDropins[i].name) < 0) {
                    // Found the dropin we should insert before
                    const targetDropinName = existingDropins[i].name;
                    const targetIndex = configContent.indexOf(`label: '${targetDropinName}',`);

                    if (targetIndex !== -1) {
                        // Find the opening brace before the label
                        let bracePos = targetIndex;
                        while (bracePos > 0 && configContent[bracePos] !== '{') {
                            bracePos--;
                        }

                        // Go to start of that line for proper indentation
                        while (bracePos > 0 && configContent[bracePos - 1] !== '\n') {
                            bracePos--;
                        }

                        insertPosition = bracePos;
                    }
                    break;
                }
            }

            // If no position found, insert at the end (before Wishlist)
            if (insertPosition === null) {
                const wishlistIndex = configContent.indexOf("label: 'Wishlist',");
                if (wishlistIndex !== -1) {
                    // Find the opening brace before "label: 'Wishlist'"
                    let bracePos = wishlistIndex;
                    while (bracePos > 0 && configContent[bracePos] !== '{') {
                        bracePos--;
                    }

                    // Go to start of that line
                    while (bracePos > 0 && configContent[bracePos - 1] !== '\n') {
                        bracePos--;
                    }

                    insertPosition = bracePos;
                }
            }

            if (insertPosition !== null) {
                const beforeInsert = configContent.substring(0, insertPosition);
                const afterInsert = configContent.substring(insertPosition);

                configContent = beforeInsert + newDropinEntry + ',\n' + afterInsert;
            } else {
                console.log('⚠️  Could not determine insertion position');
                return;
            }
        }

        writeFileSync(configPath, configContent);
        console.log(`✓ Updated astro.config.mjs sidebar with ${dropinLabel} dropin`);

        // Register dropin for simple removal later
        registerDropin(dropinLabel, isB2B);
        console.log(`✓ Registered dropin for future removal`);

        // Verify syntax is correct
        try {
            eval(`(${configContent.match(/export default\s+({[\s\S]*})/)[1]})`);
            console.log('✓ Syntax validation passed');
        } catch (syntaxError) {
            console.log('⚠️  Syntax error detected, but file was written');
        }

    } catch (error) {
        console.error(`✗ Error updating astro.config.mjs:`, error.message);
    }
}

// Main function
async function createDropin() {
    console.log('🚀 Dropin Generator CLI');
    console.log('======================\n');

    try {
        // Get dropin name from user
        const dropinName = await prompt('Enter the dropin name (e.g., "Product Search"): ');

        if (!dropinName.trim()) {
            console.log('❌ Dropin name cannot be empty. Exiting...');
            rl.close();
            return;
        }

        // Ask if this is a B2B or B2C dropin
        console.log('\nWhat type of dropin is this?');
        console.log('  1. B2B (Business to Business)');
        console.log('  2. B2C (Business to Consumer)');

        const dropinTypeChoice = await prompt('Select option (1 or 2): ');

        if (dropinTypeChoice === '1') {
            var dropinType = 'b2b';
        } else if (dropinTypeChoice === '2') {
            var dropinType = 'b2c';
        } else {
            console.log('❌ Please enter either "1" or "2". Exiting...');
            rl.close();
            return;
        }

        const isB2B = dropinType.toLowerCase() === 'b2b';
        const targetFolder = isB2B ? 'dropins-b2b' : 'dropins';
        const typeLabel = isB2B ? 'B2B' : 'B2C';

        const formats = formatDropinName(dropinName.trim());
        console.log(`\n📝 Dropin will be created as:`);
        console.log(`   Name: ${formats.original}`);
        console.log(`   Package: ${formats.kebab}`);
        console.log(`   Type: ${typeLabel}`);
        console.log(`   Location: src/content/docs/${targetFolder}/${formats.kebab}/\n`);

        // Confirm creation
        const confirm = await prompt(`Create ${typeLabel} dropin "${formats.original}" with package name "${formats.kebab}"? (Y/n): `);

        if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
            console.log('❌ Operation cancelled.');
            rl.close();
            return;
        }

        // Define paths
        const dropinPath = join(projectRoot, 'src', 'content', 'docs', targetFolder, formats.kebab);
        const containersPath = join(dropinPath, 'containers');
        const templatesPath = join(projectRoot, '_dropin-templates');

        console.log('\n📁 Creating directory structure...');

        // Create main dropin directory
        ensureDir(dropinPath);

        // Create containers subdirectory
        ensureDir(containersPath);

        console.log('\n📄 Copying and customizing template files...');

        // Read the order from order-of-usage.txt file
        const orderFilePath = join(templatesPath, 'order-of-usage.txt');
        const orderContent = readFileSync(orderFilePath, 'utf8');

        // Parse the order file to extract template filenames in the correct order
        const templateFiles = orderContent
            .split('\n')
            .filter(line => line.trim() && line.includes(':'))
            .map(line => {
                const match = line.match(/\d+\.\s+\w+.*?:\s*(.+\.mdx)/);
                return match ? match[1] : null;
            })
            .filter(file => file !== null);

        // Add dropin-slots.mdx and dropin-styles.mdx at the end (not in order file but needed)
        templateFiles.push('dropin-slots.mdx');
        templateFiles.push('dropin-styles.mdx');

        // Copy each template file
        for (const templateFile of templateFiles) {
            const templatePath = join(templatesPath, templateFile);
            let targetFileName = templateFile.replace('dropin-', '').replace('dropin', 'index');
            let targetPath;

            // Put containers.mdx, slots.mdx, and styles.mdx inside the containers folder with simple names
            if (templateFile === 'dropin-containers.mdx') {
                targetPath = join(containersPath, 'container-name.mdx');
            } else if (templateFile === 'dropin-slots.mdx') {
                targetPath = join(containersPath, 'container-slots.mdx');
            } else if (templateFile === 'dropin-styles.mdx') {
                targetPath = join(containersPath, 'container-styles.mdx');
            } else {
                targetPath = join(dropinPath, targetFileName);
            }

            if (existsSync(templatePath)) {
                copyTemplateFile(templatePath, targetPath, formats.original);
            } else {
                console.log(`⚠️  Template file not found: ${templatePath}`);
            }
        }

        // Update sidebar for both B2C and B2B dropins
        console.log('\n📝 Updating sidebar configuration...');
        updateSidebarConfig(formats.original, formats, isB2B);

        console.log('\n✅ Dropin creation completed successfully!');
        console.log(`\n📂 Created dropin structure:`);
        console.log(`   src/content/docs/${targetFolder}/${formats.kebab}/`);
        console.log(`   src/content/docs/${targetFolder}/${formats.kebab}/containers/`);
        console.log(`\n📋 Next steps:`);
        console.log(`   1. Review and customize the generated files`);
        console.log(`   2. Add specific containers to the containers/ folder`);
        console.log(`   3. Update the content to match your dropin's functionality`);
        console.log(`   4. Test the dropin integration`);

    } catch (error) {
        console.error('❌ Error creating dropin:', error.message);
    } finally {
        rl.close();
    }
}

// Helper function to get all existing dropins
function getExistingDropins() {
    const dropins = [];

    // Check B2C dropins
    const b2cPath = join(projectRoot, 'src/content/docs/dropins');
    if (existsSync(b2cPath)) {
        const b2cDirs = readdirSync(b2cPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => ({ name: dirent.name, type: 'B2C', path: join(b2cPath, dirent.name) }));
        dropins.push(...b2cDirs);
    }

    // Check B2B dropins
    const b2bPath = join(projectRoot, 'src/content/docs/dropins-b2b');
    if (existsSync(b2bPath)) {
        const b2bDirs = readdirSync(b2bPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => ({ name: dirent.name, type: 'B2B', path: join(b2bPath, dirent.name) }));
        dropins.push(...b2bDirs);
    }

    return dropins;
}

// Helper function to get pages within a dropin
function getDropinPages(dropinPath) {
    const pages = [];

    if (!existsSync(dropinPath)) return pages;

    const items = readdirSync(dropinPath, { withFileTypes: true });

    for (const item of items) {
        if (item.isFile() && item.name.endsWith('.mdx')) {
            pages.push({
                name: item.name.replace('.mdx', ''),
                path: join(dropinPath, item.name),
                type: 'page'
            });
        } else if (item.isDirectory()) {
            const subPath = join(dropinPath, item.name);
            const subItems = readdirSync(subPath, { withFileTypes: true });

            for (const subItem of subItems) {
                if (subItem.isFile() && subItem.name.endsWith('.mdx')) {
                    pages.push({
                        name: `${item.name}/${subItem.name.replace('.mdx', '')}`,
                        path: join(subPath, subItem.name),
                        type: 'page'
                    });
                }
            }
        }
    }

    return pages;
}

// Conservative dropin removal - only removes sidebar entry, no file system changes
function removeSidebarEntry(dropinName, isB2B) {
    try {
        const configPath = join(projectRoot, 'astro.config.mjs');
        let configContent = readFileSync(configPath, 'utf8');

        console.log(`🔍 Looking for sidebar entry: "${dropinName}"`);

        // Simple approach: just remove the sidebar entry and let the user handle file cleanup
        // This prevents the aggressive regex from damaging the config file
        if (configContent.includes(`label: '${dropinName}'`)) {
            console.log(`⚠️  Found "${dropinName}" in sidebar - manual removal required`);
            console.log(`📝 Please manually remove the "${dropinName}" entry from the sidebar in astro.config.mjs`);
            console.log(`💡 Tip: Look for the section with label: '${dropinName}' and remove the entire object`);
        } else {
            console.log(`✅ "${dropinName}" not found in sidebar`);
        }

        // Remove from registry
        const registry = loadRegistry();
        delete registry.dropins[dropinName];
        saveRegistry(registry);
        console.log(`✅ Removed from dropin registry`);

    } catch (error) {
        console.log(`⚠️  Could not remove sidebar entry: ${error.message}`);
    }
}

// Post-removal cleanup function - removes any leftover fragments
function cleanupLeftoverSidebarFragments(dropinName) {
    try {
        const configPath = join(projectRoot, 'astro.config.mjs');
        let configContent = readFileSync(configPath, 'utf8');

        console.log(`🧹 Running post-removal cleanup for "${dropinName}"...`);

        // Check if the dropin name still exists anywhere
        if (!configContent.includes(dropinName)) {
            console.log(`✅ No fragments found for "${dropinName}"`);
            return;
        }

        const dropinSlug = dropinName.toLowerCase().replace(/\s+/g, '-');
        let hasChanges = false;
        let newContent = configContent;

        // Look for common leftover patterns and remove them - be very specific to avoid removing legitimate code
        const fragmentPatterns = [
            // Remove specific dropin page links
            new RegExp(`^\\s*{ label: 'Data events', link: '/dropins/${dropinSlug}/data-events/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'Functions', link: '/dropins/${dropinSlug}/functions/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'Dictionary', link: '/dropins/${dropinSlug}/dictionary/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'ContainerName', link: '/dropins/${dropinSlug}/containers/container-name/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'Styles', link: '/dropins/${dropinSlug}/containers/container-styles/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'Slots', link: '/dropins/${dropinSlug}/containers/container-slots/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'Overview', link: '/dropins/${dropinSlug}/overview/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'Installation', link: '/dropins/${dropinSlug}/installation/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'Initialization', link: '/dropins/${dropinSlug}/initialization/' },?\\s*\\n`, 'gm'),
            // Remove the specific dropin label line
            new RegExp(`^\\s*label: '${dropinName}',?\\s*\\n`, 'gm'),
            // Remove empty containers sections that might be left behind
            new RegExp(`^\\s*{\\s*\\n\\s*label: 'Containers', collapsed: true,\\s*\\n\\s*items: \\[\\s*\\n\\s*]\\s*\\n\\s*},?\\s*\\n`, 'gm'),
            // Remove any remaining references to the dropin name
            new RegExp(`^\\s*[^/]*${dropinName}[^/]*\\n`, 'gm')
        ];

        // Apply each cleanup pattern
        for (const pattern of fragmentPatterns) {
            const before = newContent.length;
            newContent = newContent.replace(pattern, '');
            if (newContent.length < before) {
                hasChanges = true;
                console.log(`🧹 Removed fragments (pattern removed ${before - newContent.length} characters)`);
            }
        }

        // Clean up any double newlines or spacing issues
        newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');

        if (hasChanges) {
            writeFileSync(configPath, newContent);
            console.log(`✅ Cleanup completed - removed leftover fragments for "${dropinName}"`);

            // Final verification
            const finalContent = readFileSync(configPath, 'utf8');
            if (finalContent.includes(dropinName)) {
                console.log(`⚠️  Some references to "${dropinName}" may still remain`);
            } else {
                console.log(`✅ Verified: All traces of "${dropinName}" removed`);
            }
        } else {
            console.log(`✅ No cleanup needed for "${dropinName}"`);
        }

    } catch (error) {
        console.log(`⚠️  Cleanup error: ${error.message}`);
    }
}

// Remove sidebar entry for a specific page
function removeSidebarPageEntry(page) {
    try {
        const configPath = join(projectRoot, 'astro.config.mjs');
        let configContent = readFileSync(configPath, 'utf8');

        console.log(`🔍 Looking for sidebar entry for page: "${page.name}"`);

        // Build the page link based on the page path
        const relativePath = path.relative(join(projectRoot, 'src/content/docs'), page.path);
        const linkPath = '/' + relativePath.replace(/\.mdx?$/, '/').replace(/\\/g, '/');

        console.log(`🔗 Looking for link: ${linkPath}`);

        // Look for the specific page link in the sidebar
        const linkPattern = new RegExp(`^\\s*{ label: '[^']*', link: '${linkPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}' },?\\s*\\n`, 'gm');

        const originalLength = configContent.length;
        const newContent = configContent.replace(linkPattern, '');

        if (newContent.length < originalLength) {
            writeFileSync(configPath, newContent);
            console.log(`✅ Removed sidebar entry for "${page.name}" (removed ${originalLength - newContent.length} characters)`);

            // Verify removal
            if (newContent.includes(linkPath)) {
                console.log(`⚠️  Some references to "${linkPath}" may still remain`);
            } else {
                console.log(`✅ Verified: All references to "${page.name}" removed from sidebar`);
            }
        } else {
            console.log(`⚠️  Could not find sidebar entry for "${page.name}" with link "${linkPath}"`);

            // Try a broader search for any link containing parts of the path
            const pathParts = linkPath.split('/').filter(part => part.length > 0);
            if (pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1];
                console.log(`🔍 Searching for any link containing "${lastPart}"`);

                const broadPattern = new RegExp(`^\\s*{ label: '[^']*', link: '[^']*${lastPart}[^']*' },?\\s*\\n`, 'gm');
                const broadMatch = configContent.match(broadPattern);

                if (broadMatch) {
                    console.log(`📍 Found potential matches:`);
                    broadMatch.forEach(match => console.log(`  ${match.trim()}`));

                    // Remove the first match as a best guess
                    const newContentBroad = configContent.replace(broadPattern, '');
                    if (newContentBroad.length < originalLength) {
                        writeFileSync(configPath, newContentBroad);
                        console.log(`✅ Removed best-match sidebar entry for "${page.name}"`);
                    }
                }
            }
        }

    } catch (error) {
        console.log(`⚠️  Could not remove sidebar entry: ${error.message}`);
    }
}


// Helper function to clean up orphaned sidebar entries
function cleanupOrphanedSidebarEntries() {
    try {
        const configPath = join(projectRoot, 'astro.config.mjs');
        const configContent = readFileSync(configPath, 'utf8');

        // Find all dropin labels in the sidebar by looking for entries with dropin links
        const dropinLabels = configContent.match(/label: '([^']+)',\s*collapsed: true,\s*items:\s*\[\s*\{[^}]*link: '\/dropins[^']*'/g);
        if (!dropinLabels) return [];

        const orphanedEntries = [];

        for (const labelMatch of dropinLabels) {
            const labelName = labelMatch.match(/label: '([^']+)'/)[1];

            // Skip section headers, common words, and known legitimate B2B dropins
            const excludeWords = [
                'Containers', 'Tutorials', 'Common', 'Drop-ins for B2C', 'Drop-ins for B2B',
                'Company Management', 'Quote Management' // Known legitimate B2B dropins
            ];
            if (excludeWords.includes(labelName)) {
                continue;
            }

            // Check if this dropin exists in the file system
            // Convert label to folder name: remove parentheses content, convert to lowercase, replace spaces with hyphens
            const folderName = labelName
                .replace(/\s*\([^)]*\)\s*/g, '') // Remove parentheses and their content
                .toLowerCase()
                .replace(/\s+/g, '-');

            const b2cPath = join(projectRoot, 'src/content/docs/dropins', folderName);
            const b2bPath = join(projectRoot, 'src/content/docs/dropins-b2b', folderName);

            if (!existsSync(b2cPath) && !existsSync(b2bPath)) {
                orphanedEntries.push(labelName);
            }
        }

        if (orphanedEntries.length > 0) {
            console.log(`\n🧹 Found ${orphanedEntries.length} orphaned sidebar entries:`);
            orphanedEntries.forEach(entry => console.log(`  - ${entry}`));

            return orphanedEntries;
        }

        return [];
    } catch (error) {
        console.log(`⚠️  Could not check for orphaned entries: ${error.message}`);
        return [];
    }
}

// Main remove function
async function removeDropin() {
    console.log('\n🗑️  Dropin Removal Tool');
    console.log('======================\n');

    // Check for orphaned sidebar entries first
    const orphanedEntries = cleanupOrphanedSidebarEntries();

    const dropins = getExistingDropins();

    if (dropins.length === 0 && orphanedEntries.length === 0) {
        console.log('❌ No existing dropins found.');
        rl.close();
        return;
    }

    if (dropins.length > 0) {
        console.log('Available dropins:');
        dropins.forEach((dropin, index) => {
            console.log(`  ${index + 1}. ${dropin.name} (${dropin.type})`);
        });
    }

    if (orphanedEntries.length > 0) {
        console.log('\nOrphaned sidebar entries (folders removed but sidebar entries remain):');
        orphanedEntries.forEach((entry, index) => {
            console.log(`  ${dropins.length + index + 1}. ${entry} (orphaned)`);
        });
    }

    const choice = await prompt('\nSelect a dropin to remove (number) or "cancel": ');

    if (choice.toLowerCase() === 'cancel') {
        console.log('❌ Operation cancelled.');
        rl.close();
        return;
    }

    const dropinIndex = parseInt(choice) - 1;
    const totalItems = dropins.length + orphanedEntries.length;

    if (isNaN(dropinIndex) || dropinIndex < 0 || dropinIndex >= totalItems) {
        console.log('❌ Invalid selection. Exiting...');
        rl.close();
        return;
    }

    let selectedDropin;
    let isOrphaned = false;

    if (dropinIndex < dropins.length) {
        selectedDropin = dropins[dropinIndex];
    } else {
        // It's an orphaned entry
        const orphanedIndex = dropinIndex - dropins.length;
        selectedDropin = { name: orphanedEntries[orphanedIndex], type: 'Orphaned' };
        isOrphaned = true;
    }

    // Ask what to remove
    console.log(`\nWhat would you like to remove for "${selectedDropin.name}"?`);
    console.log('  1. Entire dropin (all files and folders)');
    console.log('  2. Individual pages');

    const removeChoice = await prompt('Select option (1 or 2): ');

    if (removeChoice === '1') {
        if (isOrphaned) {
            // For orphaned entries, just remove the sidebar entry
            const confirm = await prompt(`\n⚠️  Are you sure you want to remove the orphaned sidebar entry for "${selectedDropin.name}"? (Y/n): `);

            if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
                console.log('❌ Operation cancelled.');
                rl.close();
                return;
            }

            try {
                // Remove sidebar entry (try both B2B and B2C)
                removeSidebarEntry(selectedDropin.name, false);
                removeSidebarEntry(selectedDropin.name, true);

                // Run cleanup to remove any leftover fragments
                cleanupLeftoverSidebarFragments(selectedDropin.name);

                console.log(`\n✅ Successfully removed orphaned sidebar entry for "${selectedDropin.name}"!`);
            } catch (error) {
                console.log(`❌ Error removing orphaned entry: ${error.message}`);
            }
        } else {
            // Remove entire dropin
            const confirm = await prompt(`\n⚠️  Are you sure you want to remove the entire "${selectedDropin.name}" dropin? This will delete all files and folders. (Y/n): `);

            if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
                console.log('❌ Operation cancelled.');
                rl.close();
                return;
            }

            try {
                // Remove the folder
                rmSync(selectedDropin.path, { recursive: true, force: true });
                console.log(`✅ Removed dropin folder: ${selectedDropin.path}`);

                // Remove sidebar entry
                const isB2B = selectedDropin.type === 'B2B';
                removeSidebarEntry(selectedDropin.name, isB2B);

                // Run cleanup to remove any leftover fragments
                cleanupLeftoverSidebarFragments(selectedDropin.name);

                console.log(`\n✅ Successfully removed "${selectedDropin.name}" dropin!`);
            } catch (error) {
                console.log(`❌ Error removing dropin: ${error.message}`);
            }
        }

    } else if (removeChoice === '2') {
        if (isOrphaned) {
            console.log('❌ Cannot remove individual pages from orphaned entries. The folder no longer exists.');
            rl.close();
            return;
        }

        // Remove individual pages
        const pages = getDropinPages(selectedDropin.path);

        if (pages.length === 0) {
            console.log('❌ No pages found in this dropin.');
            rl.close();
            return;
        }

        console.log('\nAvailable pages:');
        pages.forEach((page, index) => {
            console.log(`  ${index + 1}. ${page.name}`);
        });

        const pageChoice = await prompt('\nSelect a page to remove (number) or "cancel": ');

        if (pageChoice.toLowerCase() === 'cancel') {
            console.log('❌ Operation cancelled.');
            rl.close();
            return;
        }

        const pageIndex = parseInt(pageChoice) - 1;
        if (isNaN(pageIndex) || pageIndex < 0 || pageIndex >= pages.length) {
            console.log('❌ Invalid selection. Exiting...');
            rl.close();
            return;
        }

        const selectedPage = pages[pageIndex];

        const confirm = await prompt(`\n⚠️  Are you sure you want to remove "${selectedPage.name}"? (Y/n): `);

        if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
            console.log('❌ Operation cancelled.');
            rl.close();
            return;
        }

        try {
            // Remove the file
            rmSync(selectedPage.path, { force: true });
            console.log(`✅ Removed page: ${selectedPage.path}`);

            // Remove the sidebar entry for this specific page
            removeSidebarPageEntry(selectedPage);

            console.log(`\n✅ Successfully removed "${selectedPage.name}" page and its sidebar entry!`);
        } catch (error) {
            console.log(`❌ Error removing page: ${error.message}`);
        }

    } else {
        console.log('❌ Invalid option. Exiting...');
    }

    rl.close();
}

// Main CLI function
async function main() {
    console.log('🚀 Dropin Management CLI');
    console.log('========================\n');

    console.log('What would you like to do?');
    console.log('  1. Create a new dropin');
    console.log('  2. Remove an existing dropin or page');

    const choice = await prompt('Select option (1 or 2): ');

    if (choice === '1') {
        await createDropin();
    } else if (choice === '2') {
        await removeDropin();
    } else {
        console.log('❌ Invalid option. Exiting...');
        rl.close();
    }
}

// Run the CLI
main();
