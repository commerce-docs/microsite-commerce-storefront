#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, readdirSync, statSync } from 'fs';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the project root directory (two levels up from scripts/)
const projectRoot = join(__dirname, '..');
// Auto-generate registry from existing dropins instead of maintaining a file
function generateRegistry() {
    const registry = { dropins: {} };

    // Scan existing dropins and build registry
    const dropins = getExistingDropins();
    dropins.forEach(dropin => {
        registry.dropins[dropin.name] = {
            label: dropin.name, // Use folder name as display name
            isB2B: dropin.type === 'B2B',
            createdAt: new Date().toISOString() // Use current time as fallback
        };
    });

    return registry;
}

function getDropinDisplayName(folderName) {
    // Convert folder name to display name (kebab-case to title case)
    return folderName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function registerDropin(dropinName, isB2B = false) {
    // No longer needed - registry is auto-generated
    console.log(`📝 Dropin "${dropinName}" will be automatically registered in the generated registry`);
}

function getDropinStructure(dropinName) {
    // Check if dropin exists in file system
    const dropins = getExistingDropins();
    const dropin = dropins.find(d => d.name === dropinName);

    if (dropin) {
        return {
            label: getDropinDisplayName(dropinName),
            isB2B: dropin.type === 'B2B',
            createdAt: new Date().toISOString()
        };
    }

    return null;
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
function replacePlaceholders(content, dropinName, isB2B = false) {
    const formats = formatDropinName(dropinName);
    const basePath = isB2B ? 'dropins-b2b' : 'dropins';

    // Replace DROPIN_NAME in title with the full dropin name + page type (e.g., "Company Management overview")
    let updatedContent = content.replace(/title: DROPIN_NAME (\w+)/g, (match, pageType) => {
        return `title: ${formats.original} ${pageType}`;
    });

    // Replace all placeholders with their resolved values
    updatedContent = updatedContent
        .replace(/DROPIN_NAME/g, formats.original)
        .replace(/DROPIN_PACKAGE/g, formats.kebab)
        .replace(/DROPINS_BASE_PATH/g, basePath)
        // Replace common placeholder patterns that developers will need to customize
        .replace(/SLOT_NAME/g, 'SLOT_NAME') // Keep as placeholder for manual customization
        .replace(/FUNCTION_NAME/g, 'FUNCTION_NAME') // Keep as placeholder for manual customization
        .replace(/COMMERCE_FEATURE_NAME/g, 'COMMERCE_FEATURE_NAME') // Keep as placeholder for manual customization
        .replace(/CONTAINER_NAME-COMPONENT_NAME__ELEMENT_NAME/g, `${formats.kebab}-component__element`) // Provide example structure
        .replace(/ContainerOne/g, 'ContainerOne') // Keep as placeholder for manual customization
        .replace(/ContainerTwo/g, 'ContainerTwo') // Keep as placeholder for manual customization
        .replace(/CSS_PROPERTY: VALUE/g, 'property: value') // Provide example structure
        .replace(/PROPERTY_NAME/g, 'propertyName') // Provide example structure
        .replace(/PARAMETER_NAME/g, 'parameterName') // Provide example structure
        .replace(/PARAMETER_TYPE/g, 'ParameterType') // Provide example structure
        .replace(/RETURN_TYPE/g, 'ReturnType') // Provide example structure
        .replace(/ELEMENT_NAME/g, 'elementName') // Provide example structure
        .replace(/ELEMENT_TYPE/g, 'elementType') // Provide example structure
        .replace(/KEY_NAME: VALUE/g, 'keyName: value') // Provide example structure
        .replace(/ISSUE_NAME/g, 'ISSUE_NAME') // Keep as placeholder for manual customization
        .replace(/PRACTICE_NAME/g, 'PRACTICE_NAME') // Keep as placeholder for manual customization
        .replace(/FEATURE_NAME/g, 'FEATURE_NAME') // Keep as placeholder for manual customization
        .replace(/SCOPE_NAME/g, 'scopeName') // Provide example structure
        .replace(/VALUE_OR_FUNCTION/g, 'valueOrFunction') // Provide example structure
        .replace(/TYPE/g, 'Type') // Provide example structure
        .replace(/Yes\/No/g, 'Yes/No') // Keep as placeholder for manual customization
        .replace(/DESCRIPTION/g, 'DESCRIPTION') // Keep as placeholder for manual customization
        .replace(/CONDITION/g, 'condition') // Provide example structure
        .replace(/CUSTOM_SLOT_NAME/g, 'customSlotName') // Provide example structure
        .replace(/INSPECTION_STEP/g, 'INSPECTION_STEP') // Keep as placeholder for manual customization
        .replace(/IDENTIFICATION_STEP/g, 'IDENTIFICATION_STEP') // Keep as placeholder for manual customization
        .replace(/OVERRIDE_STEP/g, 'OVERRIDE_STEP'); // Keep as placeholder for manual customization

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
function copyTemplateFile(templatePath, targetPath, dropinName, isB2B = false) {
    try {
        const content = readFileSync(templatePath, 'utf8');
        const customizedContent = replacePlaceholders(content, dropinName, isB2B);
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
                            { label: 'Overview', link: '/${basePath}/${dropinKebab}/containers/' },
                            { label: 'ContainerOne', link: '/${basePath}/${dropinKebab}/containers/container-one/' },
                            { label: 'ContainerTwo', link: '/${basePath}/${dropinKebab}/containers/container-two/' },
                          ]
                        },
                        { label: 'Data events', link: '/${basePath}/${dropinKebab}/data-events/' },
                        { label: 'Functions', link: '/${basePath}/${dropinKebab}/functions/' },
                        { label: 'Dictionary', link: '/${basePath}/${dropinKebab}/dictionary/' },
                      ]
                    }`;

        const sectionLabel = isB2B ? 'Drop-ins for B2B' : 'Drop-ins for B2C';

        if (isB2B) {
            // For B2B, use sophisticated logic similar to B2C but adapted for B2B structure

            // Find the B2B section boundaries
            const b2bStart = configContent.indexOf("label: 'Drop-ins for B2B'");

            if (b2bStart === -1) {
                console.log('⚠️  Could not find B2B section');
                return;
            }

            // B2B section comes after B2C, so we need to find the end of the file or next major section
            // Find the end of the B2B section by looking for the closing brace
            const b2bSectionStart = configContent.indexOf('items: [', b2bStart);
            if (b2bSectionStart === -1) {
                console.log('⚠️  Could not find B2B items array');
                return;
            }

            // Find the matching closing bracket for the items array
            let bracketCount = 0;
            let pos = b2bSectionStart;
            let foundEnd = false;

            while (pos < configContent.length && !foundEnd) {
                if (configContent[pos] === '[') bracketCount++;
                if (configContent[pos] === ']') bracketCount--;
                if (bracketCount === 0) {
                    foundEnd = true;
                    break;
                }
                pos++;
            }

            if (!foundEnd) {
                console.log('⚠️  Could not find end of B2B items array');
                return;
            }

            const b2bSection = configContent.substring(b2bStart, pos + 1);

            // Find all existing B2B dropin entries and their positions
            // B2B dropins have the pattern: { label: 'DropinName', (with proper indentation)
            const dropinPattern = /^                    {\s*\n\s*label:\s*'([^']+)',/gm;
            const existingDropins = [];
            let match;

            while ((match = dropinPattern.exec(b2bSection)) !== null) {
                const name = match[1];
                // Skip non-dropin sections (Overview, etc.)
                if (name !== 'Overview' && name !== 'Containers') {
                    existingDropins.push({
                        name: name,
                        position: b2bStart + match.index
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
                    const targetIndex = configContent.indexOf(`label: '${targetDropinName}',`, b2bStart);

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

            // If no position found, insert at the end (after the last dropin)
            if (insertPosition === null) {
                if (existingDropins.length > 0) {
                    // Find the last dropin and insert after it
                    const lastDropin = existingDropins[existingDropins.length - 1];
                    const lastDropinIndex = configContent.indexOf(`label: '${lastDropin.name}',`, b2bStart);

                    if (lastDropinIndex !== -1) {
                        // Find the closing brace of the last dropin
                        let braceCount = 0;
                        let pos = lastDropinIndex;
                        let foundClosingBrace = false;

                        // Find the opening brace of the last dropin
                        while (pos > 0 && configContent[pos] !== '{') {
                            pos--;
                        }

                        // Count braces to find the matching closing brace
                        while (pos < configContent.length && !foundClosingBrace) {
                            if (configContent[pos] === '{') braceCount++;
                            if (configContent[pos] === '}') braceCount--;
                            if (braceCount === 0) {
                                foundClosingBrace = true;
                                break;
                            }
                            pos++;
                        }

                        if (foundClosingBrace) {
                            // Insert after the closing brace
                            insertPosition = pos + 1;
                        }
                    }
                } else {
                    // No existing dropins, insert after the Overview item
                    const overviewIndex = configContent.indexOf(`{ label: 'Overview', link: '/dropins-b2b/overview/' }`, b2bStart);
                    if (overviewIndex !== -1) {
                        // Find the end of the Overview item
                        let pos = overviewIndex;
                        while (pos < configContent.length && configContent[pos] !== '}') {
                            pos++;
                        }
                        if (pos < configContent.length) {
                            // Move to the end of the line (after the closing brace)
                            while (pos < configContent.length && configContent[pos] !== '\n') {
                                pos++;
                            }
                            insertPosition = pos;
                        }
                    }
                }
            }

            if (insertPosition === null) {
                console.log('⚠️  Could not find insertion position in B2B section');
                return;
            }

            // Insert the new dropin at the calculated position
            const beforeInsert = configContent.substring(0, insertPosition);
            const afterInsert = configContent.substring(insertPosition);

            // Check if we need a comma before the new entry
            const beforeTrimmed = beforeInsert.trim();
            const needsCommaBefore = !beforeTrimmed.endsWith('[') && !beforeTrimmed.endsWith(',') && !beforeTrimmed.endsWith('}');

            // Check if we need a comma after the new entry
            const afterTrimmed = afterInsert.trim();
            const isLastItem = afterTrimmed.startsWith(']') || afterTrimmed.startsWith('\n]');
            const needsCommaAfter = !isLastItem;

            // Check if afterInsert already starts with a newline to avoid double newlines
            const afterStartsWithNewline = afterInsert.startsWith('\n');

            // Determine the separators
            const separatorBefore = needsCommaBefore ? ',\n' : '\n';
            let separatorAfter = '';
            if (needsCommaAfter) {
                separatorAfter = afterStartsWithNewline ? ',' : ',\n';
            } else if (!afterStartsWithNewline) {
                separatorAfter = '\n';
            }

            configContent = beforeInsert + separatorBefore + newDropinEntry + separatorAfter + afterInsert;

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
            .flatMap(line => {
                const match = line.match(/\d+\.\s+\w+.*?:\s*(.+)/);
                if (match) {
                    // Handle multiple templates separated by commas
                    return match[1].split(',').map(file => file.trim());
                }
                return [];
            })
            .filter(file => file !== null && file.endsWith('.mdx'));

        // Note: dropin-slots.mdx and dropin-styles.mdx are no longer included in new dropins

        // Copy each template file
        for (const templateFile of templateFiles) {
            const templatePath = join(templatesPath, templateFile);
            let targetFileName = templateFile.replace('dropin-', '').replace('dropin', 'index');
            let targetPath;

            // Handle container templates
            if (templateFile === 'dropin-container.mdx') {
                targetPath = join(containersPath, 'container-one.mdx');
            } else if (templateFile === 'dropin-containers-two.mdx') {
                targetPath = join(containersPath, 'container-two.mdx');
            } else if (templateFile === 'container-overview.mdx') {
                targetPath = join(containersPath, 'index.mdx');
            } else {
                targetPath = join(dropinPath, targetFileName);
            }

            if (existsSync(templatePath)) {
                copyTemplateFile(templatePath, targetPath, formats.original, isB2B);
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

// Precise dropin removal using brace counting - isolates dropin object boundaries
function removeSidebarEntry(dropinName, isB2B) {
    try {
        const configPath = join(projectRoot, 'astro.config.mjs');
        let configContent = readFileSync(configPath, 'utf8');

        console.log(`🔍 Looking for sidebar entry: "${dropinName}"`);

        // Check if dropin exists in sidebar
        if (!configContent.includes(`label: '${dropinName}'`)) {
            console.log(`✅ "${dropinName}" not found in sidebar`);
            return;
        }

        console.log(`📍 Found "${dropinName}" in sidebar, locating object boundaries...`);

        const lines = configContent.split('\n');
        let labelLineIndex = -1;

        // Find the line with the dropin label
        console.log(`🔍 Searching for label: '${dropinName}' in ${lines.length} lines...`);
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`label: '${dropinName}'`)) {
                labelLineIndex = i;
                console.log(`📍 Found label line ${i + 1}: "${lines[i].trim()}"`);
                console.log(`📍 Context around label line:`);
                for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
                    const marker = j === i ? ">>> " : "    ";
                    console.log(`${marker}${j + 1}: "${lines[j]}"`);
                }
                break;
            }
        }

        if (labelLineIndex === -1) {
            console.log(`⚠️  Could not find label line for "${dropinName}"`);
            return;
        }

        // Find the parent opening brace by going backwards from the label line
        // Look for the opening brace that starts the dropin object (should be just above the label)
        let openBraceIndex = -1;

        console.log(`🔍 Searching backwards from line ${labelLineIndex + 1} for opening brace...`);
        for (let i = labelLineIndex; i >= 0; i--) {
            console.log(`🔍 Checking line ${i + 1}: "${lines[i]}" (trimmed: "${lines[i].trim()}")`);
            if (lines[i].trim() === '{') {
                openBraceIndex = i;
                console.log(`📍 Found parent opening brace at line ${i + 1}: "${lines[i]}"`);
                console.log(`📍 Context around opening brace:`);
                for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
                    const marker = j === i ? ">>> " : "    ";
                    console.log(`${marker}${j + 1}: "${lines[j]}"`);
                }
                break;
            }
        }

        if (openBraceIndex === -1) {
            console.log(`⚠️  Could not find opening brace for "${dropinName}"`);
            return;
        }

        // Count braces to find the matching closing brace
        let braceCount = 0;
        let closeBraceIndex = -1;

        console.log(`📍 Starting brace count from line ${openBraceIndex + 1}`);

        for (let i = openBraceIndex; i < lines.length; i++) {
            const line = lines[i];
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;

            braceCount += openBraces - closeBraces;

            console.log(`📍 Line ${i + 1}: "${line.trim()}" - Open: ${openBraces}, Close: ${closeBraces}, Count: ${braceCount}`);

            if (braceCount === 0 && i > openBraceIndex) {
                closeBraceIndex = i;
                console.log(`📍 Found closing brace at line ${i + 1}`);
                break;
            }
        }

        if (closeBraceIndex === -1) {
            console.log(`⚠️  Could not find closing brace for "${dropinName}"`);
            return;
        }

        console.log(`📍 Dropin object spans lines ${openBraceIndex + 1} to ${closeBraceIndex + 1}`);

        // Check if there's a comma after the closing brace that needs to be removed
        let endIndex = closeBraceIndex;
        if (closeBraceIndex + 1 < lines.length && lines[closeBraceIndex + 1].trim() === ',') {
            endIndex = closeBraceIndex + 1;
            console.log(`📍 Including trailing comma at line ${endIndex + 1}`);
        } else if (lines[closeBraceIndex].includes('},')) {
            console.log(`📍 Comma is on the same line as closing brace`);
        }

        console.log(`📍 Final removal range: lines ${openBraceIndex + 1} to ${endIndex + 1}`);
        console.log(`📍 Lines to be removed:`);
        for (let i = openBraceIndex; i <= endIndex; i++) {
            console.log(`  ${i + 1}: "${lines[i]}"`);
        }

        // Remove the dropin object by splicing out the lines
        const beforeLines = lines.slice(0, openBraceIndex);
        const afterLines = lines.slice(endIndex + 1);

        // Fix indentation of the closing bracket if needed
        let fixedAfterLines = afterLines;
        if (afterLines.length > 0) {
            const firstAfterLine = afterLines[0];
            // If the first line after removal is a closing bracket, ensure proper indentation
            if (firstAfterLine.trim() === ']') {
                // Find the indentation level of the items array opening bracket
                // Look in the original lines array to find the items: [ line
                const itemsArrayLine = lines.find(line => line.includes('items: [') && line.includes('Drop-ins for B2B'));
                if (itemsArrayLine) {
                    const itemsIndent = itemsArrayLine.match(/^(\s*)/)[1];
                    fixedAfterLines = [itemsIndent + ']', ...afterLines.slice(1)];
                } else {
                    // Fallback: use 18 spaces for B2B items array closing bracket
                    fixedAfterLines = ['                  ]', ...afterLines.slice(1)];
                }
            }
        }

        const newLines = beforeLines.concat(fixedAfterLines);

        console.log(`🔍 File modification details:`);
        console.log(`  Original lines: ${lines.length}`);
        console.log(`  Before lines: ${beforeLines.length}`);
        console.log(`  After lines: ${afterLines.length}`);
        console.log(`  New total lines: ${newLines.length}`);
        console.log(`  Lines to remove: ${endIndex - openBraceIndex + 1}`);

        const newContent = newLines.join('\n');

        // Write the updated content
        console.log(`🔍 Writing updated content to file...`);
        writeFileSync(configPath, newContent);

        const removedLines = lines.length - newLines.length;
        console.log(`✅ Successfully removed "${dropinName}" from sidebar (${removedLines} lines removed)`);

        // Registry is auto-generated, no need to manually remove entries
        console.log(`✅ Dropin will be automatically removed from generated registry`);

        // Final verification
        console.log(`🔍 Reading file back for verification...`);
        const finalContent = readFileSync(configPath, 'utf8');
        const finalLines = finalContent.split('\n');
        console.log(`🔍 Final file has ${finalLines.length} lines (was ${lines.length})`);

        if (finalContent.includes(`label: '${dropinName}'`)) {
            console.log(`❌ WARNING: "${dropinName}" still present after removal - manual cleanup may be needed`);
            console.log(`🔍 Searching for remaining references:`);
            finalLines.forEach((line, index) => {
                if (line.includes(dropinName)) {
                    console.log(`  Line ${index + 1}: "${line.trim()}"`);
                }
            });
        } else {
            console.log(`✅ Verified: "${dropinName}" completely removed from sidebar`);
        }

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
            new RegExp(`^\\s*{ label: 'Overview', link: '/dropins/${dropinSlug}/containers/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'ContainerOne', link: '/dropins/${dropinSlug}/containers/container-one/' },?\\s*\\n`, 'gm'),
            new RegExp(`^\\s*{ label: 'ContainerTwo', link: '/dropins/${dropinSlug}/containers/container-two/' },?\\s*\\n`, 'gm'),
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

                // Get the display name using the new auto-generated approach
                const displayName = getDropinDisplayName(selectedDropin.name);
                console.log(`🔍 Using display name: "${displayName}" (from folder: "${selectedDropin.name}")`);

                removeSidebarEntry(displayName, isB2B);

                // Run cleanup to remove any leftover fragments
                cleanupLeftoverSidebarFragments(displayName);

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
