#!/usr/bin/env node

/**
 * Helper script to resolve astro.config.mjs conflicts when merging B2B feature branches
 * 
 * Usage: Run this after a merge conflict in astro.config.mjs
 * It will automatically combine all B2B sidebar entries and organize them
 */

import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 B2B Sidebar Merge Helper\n');

try {
    const config = readFileSync('astro.config.mjs', 'utf8');

    // Check if there are conflict markers
    if (!config.includes('<<<<<<<') && !config.includes('>>>>>>>')) {
        console.log('ℹ️  No merge conflicts found in astro.config.mjs');
        console.log('   This script is only needed when conflicts exist.');
        process.exit(0);
    }

    console.log('✅ Merge conflict detected in astro.config.mjs');
    console.log('📋 Extracting all B2B sidebar entries...\n');

    // Extract all B2B block entries from both sides of conflict
    const b2bBlockPattern = /\{ label: '(?:Account Navigation|Checkout Success|Customer Company|Accept Invitation|Company Credit|Company Profile|Company Structure|Company Users|Create Company|Roles & Permissions|Company POs|Customer POs|PO [^']+|Negotiable Quotes?|Quote [^']+|Requisition List[^']*)', link: '\/merchants\/blocks\/commerce-[^']+\/' \}/g;

    const allBlocks = [...config.matchAll(b2bBlockPattern)].map(m => m[0]);
    const uniqueBlocks = [...new Set(allBlocks)]; // Remove duplicates

    console.log(`   Found ${allBlocks.length} total entries`);
    console.log(`   Unique entries: ${uniqueBlocks.length}`);

    if (uniqueBlocks.length === 0) {
        console.error('❌ Could not extract B2B blocks from conflict');
        console.log('   Please resolve manually or check the conflict markers');
        process.exit(1);
    }

    // Organize by category
    const categorized = {
        account: [],
        company: [],
        po: [],
        quote: [],
        requisition: []
    };

    uniqueBlocks.forEach(block => {
        if (block.includes('Account Navigation') || block.includes('Checkout Success') || block.includes('Customer Company')) {
            categorized.account.push(block);
        } else if (block.includes('Company') || block.includes('Accept Invitation') || block.includes('Roles')) {
            categorized.company.push(block);
        } else if (block.includes('PO ') || block.includes('POs ')) {
            categorized.po.push(block);
        } else if (block.includes('Quote')) {
            categorized.quote.push(block);
        } else if (block.includes('Requisition')) {
            categorized.requisition.push(block);
        }
    });

    // Build organized B2B section
    const organized = `                  {
                    label: 'B2B commerce blocks',
                    collapsed: true,
                    items: [
                      // Account & Authentication (${categorized.account.length})
                      ${categorized.account.map(b => `${b},`).join('\n                      ')}
                      // Company Management (${categorized.company.length})
                      ${categorized.company.map(b => `${b},`).join('\n                      ')}
                      // Purchase Orders (${categorized.po.length})
                      ${categorized.po.map(b => `${b},`).join('\n                      ')}
                      // Quotes (${categorized.quote.length})
                      ${categorized.quote.map(b => `${b},`).join('\n                      ')}
                      // Requisition Lists (${categorized.requisition.length})
                      ${categorized.requisition.map(b => `${b},`).join('\n                      ')}
                    ],
                  },`;

    // Remove conflict markers and old B2B section
    let resolved = config.replace(/<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>> [^\n]+/g, '');

    // Insert organized B2B section before Content customizations
    resolved = resolved.replace(
        /(\{[\s\S]*?label: 'Content customizations',)/,
        `${organized}\n                  $1`
    );

    // Clean up any duplicate B2B sections
    const b2bSections = [...resolved.matchAll(/\{[\s\S]*?label: 'B2B commerce blocks',[\s\S]*?\},[\s]*(?=\{[\s\S]*?label: 'Content customizations',)/g)];
    if (b2bSections.length > 1) {
        console.log('   🧹 Removing duplicate B2B sections...');
        // Keep only the last (most complete) one
        for (let i = 0; i < b2bSections.length - 1; i++) {
            resolved = resolved.replace(b2bSections[i][0], '');
        }
    }

    writeFileSync('astro.config.mjs', resolved, 'utf8');

    console.log('\n✅ Merge conflict resolved!');
    console.log(`   Total B2B blocks: ${uniqueBlocks.length}`);
    console.log(`   - Account & Authentication: ${categorized.account.length}`);
    console.log(`   - Company Management: ${categorized.company.length}`);
    console.log(`   - Purchase Orders: ${categorized.po.length}`);
    console.log(`   - Quotes: ${categorized.quote.length}`);
    console.log(`   - Requisition Lists: ${categorized.requisition.length}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Review the changes: git diff astro.config.mjs');
    console.log('   2. Stage the file: git add astro.config.mjs');
    console.log('   3. Complete the merge: git commit --no-edit');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

