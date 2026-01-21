#!/usr/bin/env node

/**
 * Verify block configurations against source code
 * Reports mismatches between README documentation and actual readBlockConfig() calls
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('\n============================================================');
console.log('  SOURCE CODE CONFIGURATION VERIFICATION');
console.log('============================================================\n');

const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate', 'blocks');

const results = {
    verified: [],
    mismatches: [],
    noConfig: [],
    errors: []
};

// Extract configs from source code
function extractFromSource(blockPath) {
    const jsFile = join(blockPath, `${basename(blockPath)}.js`);

    if (!existsSync(jsFile)) {
        return null;
    }

    try {
        const sourceCode = readFileSync(jsFile, 'utf8');
        const configs = [];

        const readBlockConfigPattern = /const\s*\{([^}]+)\}\s*=\s*readBlockConfig\([^)]+\)/g;
        const matches = sourceCode.matchAll(readBlockConfigPattern);

        for (const match of matches) {
            const destructuredContent = match[1];
            const propertyPattern = /['"]([^'"]+)['"]\s*:\s*(\w+)(?:\s*=\s*([^,}]+))?/g;
            const propertyMatches = destructuredContent.matchAll(propertyPattern);

            for (const propMatch of propertyMatches) {
                configs.push(propMatch[1].trim());
            }
        }

        return configs;
    } catch (error) {
        return null;
    }
}

// Extract configs from README
function extractFromReadme(readmePath) {
    if (!existsSync(readmePath)) {
        return null;
    }

    try {
        const readme = readFileSync(readmePath, 'utf8');
        const configs = [];

        // Table format
        const tablePattern = /\|\s*Configuration\s+Key[^|]*\|[\s\S]*?\|([^|]+)\|/gi;
        let match;
        while ((match = tablePattern.exec(readme)) !== null) {
            const key = match[1]?.replace(/`/g, '').trim();
            if (key && key !== 'Configuration Key' && key !== '–' && !key.match(/^-+$/)) {
                configs.push(key);
            }
        }

        // Bullet format
        if (configs.length === 0) {
            const bulletPattern = /-\s+\*\*([^*]+)\*\*/g;
            while ((match = bulletPattern.exec(readme)) !== null) {
                configs.push(match[1].trim());
            }
        }

        return configs;
    } catch (error) {
        return null;
    }
}

// Process all commerce blocks
const blockDirs = readdirSync(boilerplatePath).filter(name => {
    const path = join(boilerplatePath, name);
    const isDir = statSync(path).isDirectory();
    const isCommerce = name.startsWith('commerce-') ||
        name.includes('product') ||
        name.includes('cart') ||
        name.includes('checkout');
    return isDir && isCommerce;
});

console.log(`📦 Found ${blockDirs.length} commerce blocks\n`);

for (const blockName of blockDirs) {
    const blockPath = join(boilerplatePath, blockName);
    const readmePath = join(blockPath, 'README.md');

    console.log(`${'='.repeat(80)}`);
    console.log(`📄 Block: ${blockName}`);
    console.log(`${'='.repeat(80)}`);

    const sourceConfigs = extractFromSource(blockPath);
    const readmeConfigs = extractFromReadme(readmePath);

    if (sourceConfigs === null) {
        console.log('⚠️  No .js file found');
        results.errors.push({ block: blockName, reason: 'No .js file' });
        continue;
    }

    if (sourceConfigs.length === 0) {
        console.log('✓ No readBlockConfig() call found (no configuration)');
        results.noConfig.push(blockName);
        continue;
    }

    console.log(`\n📝 Source Code Configurations (${sourceConfigs.length}):`);
    sourceConfigs.forEach(key => console.log(`   - ${key}`));

    if (readmeConfigs === null || readmeConfigs.length === 0) {
        console.log(`\n⚠️  README has no configuration documentation`);
        results.mismatches.push({
            block: blockName,
            issue: 'README missing',
            sourceConfigs: sourceConfigs,
            readmeConfigs: []
        });
        continue;
    }

    console.log(`\n📖 README Configurations (${readmeConfigs.length}):`);
    readmeConfigs.forEach(key => console.log(`   - ${key}`));

    // Compare
    const sourceSet = new Set(sourceConfigs);
    const readmeSet = new Set(readmeConfigs);

    const inSourceNotReadme = sourceConfigs.filter(k => !readmeSet.has(k));
    const inReadmeNotSource = readmeConfigs.filter(k => !sourceSet.has(k));

    if (inSourceNotReadme.length === 0 && inReadmeNotSource.length === 0) {
        console.log(`\n✅ VERIFIED - Source code and README match perfectly`);
        results.verified.push(blockName);
    } else {
        console.log(`\n❌ MISMATCH DETECTED`);

        if (inSourceNotReadme.length > 0) {
            console.log(`\n   ⚠️  In source but NOT in README:`);
            inSourceNotReadme.forEach(k => console.log(`      - ${k}`));
        }

        if (inReadmeNotSource.length > 0) {
            console.log(`\n   ⚠️  In README but NOT in source (not implemented):`);
            inReadmeNotSource.forEach(k => console.log(`      - ${k}`));
        }

        results.mismatches.push({
            block: blockName,
            issue: 'Config mismatch',
            inSourceNotReadme,
            inReadmeNotSource
        });
    }

    console.log();
}

// Summary
console.log(`\n${'='.repeat(80)}`);
console.log('📊 VERIFICATION SUMMARY');
console.log(`${'='.repeat(80)}`);
console.log(`\n✅ Verified (source = README): ${results.verified.length}/${blockDirs.length}`);
console.log(`⚠️  No configuration blocks: ${results.noConfig.length}/${blockDirs.length}`);
console.log(`❌ Mismatches: ${results.mismatches.length}/${blockDirs.length}`);
console.log(`⚠️  Errors: ${results.errors.length}/${blockDirs.length}`);

if (results.mismatches.length > 0) {
    console.log('\n\n❌ BLOCKS WITH MISMATCHES:');
    console.log('─'.repeat(80));
    results.mismatches.forEach(item => {
        console.log(`\n   • ${item.block}`);
        if (item.inSourceNotReadme?.length > 0) {
            console.log(`     Missing from README: ${item.inSourceNotReadme.join(', ')}`);
        }
        if (item.inReadmeNotSource?.length > 0) {
            console.log(`     Not implemented in source: ${item.inReadmeNotSource.join(', ')}`);
        }
    });
}

console.log('\n\n💡 Next Steps:');
console.log('─'.repeat(80));
console.log('1. Review mismatches - README may document planned but unimplemented features');
console.log('2. Update README files to match actual source code implementation');
console.log('3. Or implement missing configurations in source code');
console.log('4. Regenerate merchant documentation: node scripts/@generate-merchant-block-docs.js');
console.log('\n');

