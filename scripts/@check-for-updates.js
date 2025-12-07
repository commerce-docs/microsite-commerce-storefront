#!/usr/bin/env node

/**
 * Check for updates in boilerplate repository
 * Compares current state against last verification
 * Generates a detailed report of what changed
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('\n============================================================');
console.log('  BOILERPLATE UPDATE CHECKER');
console.log('============================================================\n');

// Load enrichment metadata
const enrichmentPath = join(projectRoot, '_dropin-enrichments', 'merchant-blocks', 'descriptions.json');
let metadata = null;

if (existsSync(enrichmentPath)) {
    const content = readFileSync(enrichmentPath, 'utf8');
    const data = JSON.parse(content);
    metadata = data.metadata;
}

if (!metadata || !metadata.last_verified_commit) {
    console.log('⚠️  No previous verification found');
    console.log('   Run: node scripts/@generate-merchant-block-docs.js');
    process.exit(0);
}

console.log('📋 Last Verification:');
console.log(`   Commit: ${metadata.last_verified_commit.substring(0, 8)}`);
console.log(`   Date: ${metadata.last_verified_date}`);
console.log(`   Branch: ${metadata.boilerplate_branch}`);
console.log(`   Blocks: ${metadata.total_blocks}`);

const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');

if (!existsSync(boilerplatePath)) {
    console.log('\n⚠️  Boilerplate repository not found');
    console.log('   Run: node scripts/@generate-merchant-block-docs.js');
    process.exit(0);
}

// Get current commit
const currentCommit = execSync('git rev-parse HEAD', {
    cwd: boilerplatePath,
    encoding: 'utf8'
}).trim();

console.log(`\n📋 Current State:`);
console.log(`   Commit: ${currentCommit.substring(0, 8)}`);

if (currentCommit === metadata.last_verified_commit) {
    console.log('\n✅ NO CHANGES DETECTED');
    console.log('   Enrichment files are up-to-date');
    console.log('   No action required\n');
    process.exit(0);
}

console.log('\n⚠️  CHANGES DETECTED\n');

// Get changed files
const changedFiles = execSync(
    `git diff --name-only ${metadata.last_verified_commit} HEAD`,
    { cwd: boilerplatePath, encoding: 'utf8' }
).trim().split('\n').filter(f => f);

// Categorize changes
const sourceCodeChanges = changedFiles.filter(f => f.endsWith('.js') && f.startsWith('blocks/commerce-'));
const readmeChanges = changedFiles.filter(f => f.endsWith('README.md') && f.startsWith('blocks/commerce-'));
const otherChanges = changedFiles.filter(f => !sourceCodeChanges.includes(f) && !readmeChanges.includes(f));

// Report
const report = {
    metadata: {
        generated: new Date().toISOString(),
        last_verified_commit: metadata.last_verified_commit,
        current_commit: currentCommit,
        commits_behind: 'unknown'
    },
    changes: {
        source_code: sourceCodeChanges.map(f => ({
            file: f,
            block: basename(dirname(f)),
            type: 'source-code',
            requires: 'config verification'
        })),
        readme: readmeChanges.map(f => ({
            file: f,
            block: basename(dirname(f)),
            type: 'readme',
            requires: 'description verification'
        })),
        other: otherChanges.length
    },
    recommendations: []
};

// Calculate commits behind
try {
    const commitCount = execSync(
        `git rev-list --count ${metadata.last_verified_commit}..HEAD`,
        { cwd: boilerplatePath, encoding: 'utf8' }
    ).trim();
    report.metadata.commits_behind = parseInt(commitCount);
} catch (error) {
    // Ignore
}

console.log('📊 Change Summary:');
console.log(`   Commits behind: ${report.metadata.commits_behind}`);
console.log(`   Source code changes: ${sourceCodeChanges.length}`);
console.log(`   README changes: ${readmeChanges.length}`);
console.log(`   Other changes: ${otherChanges.length}`);

if (sourceCodeChanges.length > 0) {
    console.log('\n📝 SOURCE CODE CHANGES:');
    console.log('─'.repeat(80));
    const uniqueBlocks = [...new Set(sourceCodeChanges.map(f => basename(dirname(f))))];
    uniqueBlocks.forEach(block => {
        console.log(`   • ${block}`);
    });

    report.recommendations.push({
        priority: 'HIGH',
        action: 'Verify configurations against source code',
        command: 'node scripts/@verify-block-configs-source-code.js',
        reason: 'Source code changes may add/remove/modify configurations'
    });
}

if (readmeChanges.length > 0) {
    console.log('\n📖 README CHANGES:');
    console.log('─'.repeat(80));
    const uniqueBlocks = [...new Set(readmeChanges.map(f => basename(dirname(f))))];
    uniqueBlocks.forEach(block => {
        console.log(`   • ${block}`);
    });

    report.recommendations.push({
        priority: 'MEDIUM',
        action: 'Review description changes',
        command: 'node scripts/@verify-merchant-block-descriptions.js',
        reason: 'README Overview changes may require description updates'
    });
}

// Get recent commits
console.log('\n📜 Recent Commits:');
console.log('─'.repeat(80));
try {
    const commits = execSync(
        `git log --oneline ${metadata.last_verified_commit}..HEAD`,
        { cwd: boilerplatePath, encoding: 'utf8' }
    ).trim();
    console.log(commits);
} catch (error) {
    console.log('   Could not retrieve commits');
}

// Recommendations
console.log('\n\n💡 RECOMMENDED ACTIONS:');
console.log('─'.repeat(80));

if (report.recommendations.length === 0) {
    console.log('   No specific actions required - changes are in non-documentation files');
    console.log('   Consider running verification scripts as a precaution:');
    console.log('   1. node scripts/@verify-block-configs-source-code.js');
    console.log('   2. node scripts/@verify-merchant-block-descriptions.js');
} else {
    report.recommendations.forEach((rec, idx) => {
        console.log(`\n${idx + 1}. [${rec.priority}] ${rec.action}`);
        console.log(`   Reason: ${rec.reason}`);
        console.log(`   Command: ${rec.command}`);
    });
}

console.log('\n\n📝 After Verification:');
console.log('─'.repeat(80));
console.log('1. Update _dropin-enrichments/merchant-blocks/descriptions.json as needed');
console.log('2. Regenerate documentation: node scripts/@generate-merchant-block-docs.js');
console.log('3. Metadata will auto-update to current commit after successful generation');

// Write report file
const reportPath = join(projectRoot, '_dropin-enrichments', 'merchant-blocks', 'change-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`\n📄 Detailed report saved: ${reportPath}`);

console.log('\n');

