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

    return content
        .replace(/DROPIN_NAME/g, formats.original)
        .replace(/DROPIN_PACKAGE/g, formats.kebab);
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
function updateSidebarConfig(dropinName, formats) {
    try {
        const configPath = join(projectRoot, 'astro.config.mjs');
        const configContent = readFileSync(configPath, 'utf8');

        // Create the new dropin sidebar entry
        const dropinLabel = formats.original;
        const dropinKebab = formats.kebab;

        const newDropinEntry = `                    {
                      label: '${dropinLabel}',
                      collapsed: true,
                      items: [
                        { label: 'Overview', link: '/dropins/${dropinKebab}/' },
                        { label: 'Installation', link: '/dropins/${dropinKebab}/installation/' },
                        { label: 'Initialization', link: '/dropins/${dropinKebab}/initialization/' },
                        { label: 'Styles', link: '/dropins/${dropinKebab}/styles/' },
                        {
                          label: 'Containers', collapsed: true,
                          items: [
                            { label: 'Overview', link: '/dropins/${dropinKebab}/containers/container/' },
                            { label: 'Slots', link: '/dropins/${dropinKebab}/containers/container-slots/' },
                          ]
                        },
                        { label: 'Data Events', link: '/dropins/${dropinKebab}/data-events/' },
                        { label: 'Functions', link: '/dropins/${dropinKebab}/functions/' },
                        { label: 'Dictionary', link: '/dropins/${dropinKebab}/dictionary/' },
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

        // List of template files to copy (excluding order-of-usage.txt)
        const templateFiles = [
            'dropin-overview.mdx',
            'dropin-installation.mdx',
            'dropin-initialization.mdx',
            'dropin-containers.mdx',
            'dropin-styles.mdx',
            'dropin-data-events.mdx',
            'dropin-functions.mdx',
            'dropin-dictionary.mdx',
            'dropin-slots.mdx'
        ];

        // Copy each template file
        for (const templateFile of templateFiles) {
            const templatePath = join(templatesPath, templateFile);
            let targetFileName = templateFile.replace('dropin-', '').replace('dropin', 'index');
            let targetPath;

            // Put containers.mdx and slots.mdx inside the containers folder with simple names
            if (templateFile === 'dropin-containers.mdx') {
                targetPath = join(containersPath, 'container.mdx');
            } else if (templateFile === 'dropin-slots.mdx') {
                targetPath = join(containersPath, 'container-slots.mdx');
            } else {
                targetPath = join(dropinPath, targetFileName);
            }

            if (existsSync(templatePath)) {
                copyTemplateFile(templatePath, targetPath, formats.original);
            } else {
                console.log(`⚠️  Template file not found: ${templatePath}`);
            }
        }

        // Only update sidebar for B2C dropins (B2B uses autogenerate)
        if (!isB2B) {
            console.log('\n📝 Updating sidebar configuration...');
            updateSidebarConfig(formats.original, formats);
        } else {
            console.log('\n📝 B2B dropin will be automatically included in sidebar via autogenerate');
        }

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
