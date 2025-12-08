import { readFileSync, writeFileSync } from 'fs';

// Read requirements
const requirements = JSON.parse(readFileSync('_dropin-enrichments/merchant-blocks/requirements.json', 'utf8'));

let fixed = 0;

for (const [blockName, requirement] of Object.entries(requirements)) {
    const filePath = `src/content/docs/merchants/blocks/${blockName}.mdx`;

    try {
        let content = readFileSync(filePath, 'utf8');

        // Replace the Requirements section (match any single line after ## Requirements)
        const requirementsRegex = /(## Requirements\n\n)[^\n]+/;
        const newRequirements = `$1${requirement}`;

        if (content.match(requirementsRegex)) {
            content = content.replace(requirementsRegex, newRequirements);
            writeFileSync(filePath, content, 'utf8');
            fixed++;
            console.log(`✓ ${blockName}`);
        } else {
            console.log(`⚠ No Requirements section found in ${blockName}`);
        }
    } catch (err) {
        console.log(`✗ ${blockName}: ${err.message}`);
    }
}

console.log(`\n✅ Restored verified admin panel paths to ${fixed} B2B blocks`);

