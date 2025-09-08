#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the project root directory (two levels up from scripts/)
const projectRoot = join(__dirname, '..');

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
        const configContent = readFileSync(configPath, 'utf8');

        // Create the new dropin sidebar entry
        const dropinLabel = formats.original;
        const dropinKebab = formats.kebab;
        const basePath = isB2B ? 'dropins-b2b' : 'dropins';

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
                            { label: 'Overview', link: '/${basePath}/${dropinKebab}/containers/container/' },
                            { label: 'Styles', link: '/${basePath}/${dropinKebab}/containers/styles/' },
                            { label: 'Slots', link: '/${basePath}/${dropinKebab}/containers/container-slots/' },
                          ]
                        },
                        { label: 'Data events', link: '/${basePath}/${dropinKebab}/data-events/' },
                        { label: 'Functions', link: '/${basePath}/${dropinKebab}/functions/' },
                        { label: 'Dictionary', link: '/${basePath}/${dropinKebab}/dictionary/' },
                      ]
                    },`;

        // Find the position to insert the new dropin (after the last existing dropin)
        // Look for the pattern that indicates the end of the dropins section
        const insertPattern = /(\s+)(\]\s*}\s*,\s*{\s*label:\s*'Troubleshooting')/;
        const match = configContent.match(insertPattern);

        if (match) {
            const indentation = match[1];
            const replacement = `${indentation}${newDropinEntry}\n${indentation}${match[2]}`;
            const updatedContent = configContent.replace(insertPattern, replacement);

            writeFileSync(configPath, updatedContent);
            console.log(`✓ Updated astro.config.mjs sidebar with ${dropinLabel} dropin`);
        } else {
            console.log(`⚠️  Could not find insertion point in astro.config.mjs sidebar`);
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
        const dropinType = await prompt('Is this a B2B or B2C dropin? (b2b/b2c): ');

        if (!dropinType.toLowerCase().match(/^(b2b|b2c)$/)) {
            console.log('❌ Please enter either "b2b" or "b2c". Exiting...');
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
        const confirm = await prompt(`Create ${typeLabel} dropin "${formats.original}" with package name "${formats.kebab}"? (y/N): `);

        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
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
                targetPath = join(containersPath, 'container.mdx');
            } else if (templateFile === 'dropin-slots.mdx') {
                targetPath = join(containersPath, 'container-slots.mdx');
            } else if (templateFile === 'dropin-styles.mdx') {
                targetPath = join(containersPath, 'styles.mdx');
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

// Run the CLI
createDropin();
