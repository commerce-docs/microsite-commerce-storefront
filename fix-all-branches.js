#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const branches = [
    'feature/merchant-blocks-checkout-account',
    'feature/merchant-blocks-company-management',
    'feature/merchant-blocks-purchase-order',
    'feature/merchant-blocks-quote-management',
    'feature/merchant-blocks-requisition-list'
];

function fixDuplicateLabels(blocksDir) {
    const b2bFiles = readdirSync(blocksDir).filter(f =>
        f.startsWith('commerce-b2b-') ||
        f.startsWith('commerce-company-') ||
        f === 'commerce-customer-company.mdx' ||
        f === 'commerce-account-nav.mdx' ||
        f === 'commerce-checkout-success.mdx'
    );

    let fixed = 0;

    for (const file of b2bFiles) {
        const path = join(blocksDir, file);
        const content = readFileSync(path, 'utf8');
        const lines = content.split('\n');

        const newLines = [];
        let inFrontmatter = false;
        let inSidebar = false;
        let seenLabel = false;

        for (const line of lines) {
            if (line === '---') {
                if (!inFrontmatter) {
                    inFrontmatter = true;
                } else {
                    inFrontmatter = false;
                    inSidebar = false;
                    seenLabel = false;
                }
                newLines.push(line);
                continue;
            }

            if (inFrontmatter) {
                if (line === 'sidebar:') {
                    inSidebar = true;
                    seenLabel = false;
                    newLines.push(line);
                    continue;
                }

                if (inSidebar && line.startsWith('  label:')) {
                    if (!seenLabel) {
                        seenLabel = true;
                        newLines.push(line);
                    } else {
                        // Skip duplicate label
                        fixed++;
                        continue;
                    }
                } else {
                    if (inSidebar && !line.startsWith('  ')) {
                        inSidebar = false;
                    }
                    newLines.push(line);
                }
            } else {
                newLines.push(line);
            }
        }

        writeFileSync(path, newLines.join('\n'), 'utf8');
    }

    return { fixed, total: b2bFiles.length };
}

console.log('🔧 Fixing duplicate sidebar labels in all feature branches...\n');

for (const branch of branches) {
    try {
        console.log(`\n📌 Processing ${branch}...`);

        // Checkout branch
        execSync(`git checkout ${branch}`, { stdio: 'pipe' });
        console.log('   ✅ Checked out branch');

        // Fix duplicate labels
        const result = fixDuplicateLabels('src/content/docs/merchants/blocks');
        console.log(`   ✅ Fixed ${result.fixed} duplicate labels in ${result.total} files`);

        if (result.fixed > 0) {
            // Commit and push
            execSync('git add src/content/docs/merchants/blocks/', { stdio: 'pipe' });
            execSync('git commit -m "fix: Remove duplicate sidebar labels from frontmatter"', { stdio: 'pipe' });
            execSync(`git push origin ${branch}`, { stdio: 'pipe' });
            console.log('   ✅ Committed and pushed fixes');
        } else {
            console.log('   ℹ️  No duplicates found - already fixed');
        }

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
    }
}

// Return to original branch
execSync('git checkout releases/b2b-nov-release', { stdio: 'pipe' });
console.log('\n✅ All feature branches fixed and pushed!');
console.log('🎯 PRs should now build successfully');

