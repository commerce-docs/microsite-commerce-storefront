#!/usr/bin/env node

/**
 * B2B/B2C Generation Diff Script
 *
 * Produces a single combined diff of what the generators would produce
 * vs. the current content. Does not modify the repo - backs up, runs generators,
 * creates diff, then restores from backup.
 *
 * Scope:
 * - src/content/docs/dropins/ (B2C drop-in docs)
 * - src/content/docs/dropins-b2b/ (B2B drop-in docs)
 * - src/content/docs/merchants/blocks/ (merchant block docs from boilerplate b2b branch)
 *
 * Generators run:
 * - All drop-in generators (Functions, Events, Containers, Slots, Styles, Dictionary, Quick Start, Initialization)
 * - generate-merchant-docs (uses boilerplate b2b branch)
 *
 * Output:
 *   - b2b-generation-diff-summary.md (scannable table of changed files)
 *   - b2b-diffs/ (per-file .patch files for focused review)
 *   - b2b-diffs/full-combined.patch (full diff, if needed)
 *
 * Only includes files with 1-5 total changes. Files with 6+ changes are omitted
 * (they will be skipped by apply-b2b-small-changes anyway).
 *
 * Usage: node scripts/diff-b2b-generated-vs-current.js
 *
 * When fixing generator output, document changes in scripts/B2B-SMALL-CHANGES-ROLL-IN.md.
 */

import { execSync, spawnSync } from 'child_process';
import { rmSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const SUMMARY_OUTPUT = join(projectRoot, 'b2b-generation-diff-summary.md');
const RESTORE_LIST_OUTPUT = join(projectRoot, 'b2b-restore-list.json');
const DIFFS_DIR = join(projectRoot, 'b2b-diffs');
const MIN_CHANGES = 1;
const MAX_CHANGES = 5;

const PATHS_TO_PROCESS = [
  { src: 'src/content/docs/dropins', label: 'dropins' },
  { src: 'src/content/docs/dropins-b2b', label: 'dropins-b2b' },
  { src: 'src/content/docs/merchants/blocks', label: 'merchants/blocks' }
];

/**
 * Reset all tracked files to git HEAD before running generators.
 * This ensures mergePreservingPreamble reads the ORIGINAL committed content,
 * not content that may have been corrupted by a previous run.
 */
function resetToGitHead() {
  console.log('\n🔄 Resetting files to git HEAD (clean slate for generators)...\n');
  for (const { src } of PATHS_TO_PROCESS) {
    try {
      execSync(`git checkout HEAD -- ${src}`, { cwd: projectRoot, stdio: 'pipe' });
      console.log(`   ✓ Reset ${src}`);
    } catch (e) {
      // Directory may not exist in git yet
    }
  }
}

function runGenerators() {
  console.log('\n🔄 Running generators (B2C + B2B)...\n');

  const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');
  const resetBoilerplate = () => {
    if (existsSync(join(boilerplatePath, '.git'))) {
      try {
        execSync('git fetch origin && git checkout main && git pull origin main', {
          cwd: boilerplatePath,
          stdio: 'pipe'
        });
      } catch (e) {
        console.warn('   ⚠️  Could not reset boilerplate:', e.message);
      }
    }
  };

  // 1. Drop-in docs (B2C + B2B - run without --type=B2B to generate both)
  const generators = [
    'generate-function-docs',
    'generate-event-docs',
    'generate-container-docs',
    'generate-slot-docs',
    'generate-styles-docs',
    'generate-dictionary-docs',
    'generate-quick-start-docs',
    'generate-initialization-docs'
  ];
  for (let i = 0; i < generators.length; i++) {
    const gen = generators[i];
    if (gen === 'generate-event-docs') resetBoilerplate();
    console.log(`   [${i + 1}/${generators.length + 1}] ${gen}...`);
    try {
      execSync(`npm run ${gen}`, {
        cwd: projectRoot,
        stdio: 'inherit'
      });
    } catch (error) {
      console.error(`\n   ❌ ${gen} failed`);
      throw error;
    }
  }

  // 2. Merchant block docs (uses b2b branch)
  console.log(`\n   [${generators.length + 1}/${generators.length + 1}] generate-merchant-docs...`);
  try {
    execSync('npm run generate-merchant-docs', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('\n   ❌ generate-merchant-docs failed');
    throw error;
  }
}

/**
 * Parse git diff output to extract per-file stats and content
 */
function parseGitDiff(diffText, sectionLabel) {
  const files = [];
  // Split on "diff --git" lines
  const blocks = diffText.split(/(?=^diff --git )/m).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    let removed = 0, added = 0;
    let filePath = '';

    for (const line of lines) {
      if (line.startsWith('diff --git ')) {
        // Extract relative path from "diff --git a/path b/path"
        const match = line.match(/diff --git a\/src\/content\/docs\/(?:dropins-b2b|dropins|merchants\/blocks)\/([^\s]+)/);
        filePath = match ? match[1] : '';
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        removed++;
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        added++;
      }
    }

    if (filePath) {
      files.push({ path: filePath, removed, added, content: block.trim() });
    }
  }

  return files;
}

function createDiff() {
  console.log('\n📝 Creating diff output...\n');

  const allFiles = {};

  for (const { src, label } of PATHS_TO_PROCESS) {
    const currentPath = join(projectRoot, src);

    if (!existsSync(currentPath)) continue;

    // Compare git HEAD (original committed content) vs current (generated)
    const result = spawnSync('git', ['diff', 'HEAD', '--', src], {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024 // 50MB
    });

    if (result.stdout) {
      allFiles[label] = parseGitDiff(result.stdout, label);
    }
    if (result.stdout && result.stdout.trim()) {
      console.log(`   ✓ Differences found in ${label}`);
    } else {
      console.log(`   ⊘ No differences in ${label}`);
    }
  }

  // Split into 1-4 (for review) and 5+ (for apply script to restore)
  const filteredFiles = {};
  const restoreList = {};
  for (const [label, files] of Object.entries(allFiles)) {
    filteredFiles[label] = files.filter(f => {
      const total = f.removed + f.added;
      return total >= MIN_CHANGES && total <= MAX_CHANGES;
    });
    const toRestore = files.filter(f => (f.removed + f.added) > MAX_CHANGES).map(f => f.path);
    if (toRestore.length > 0) {
      restoreList[label] = toRestore;
    }
  }

  writeRestoreList(restoreList);
  writeSummary(filteredFiles);
  writePerFileDiffs(filteredFiles);

  // Write full combined diff (1-4 change files only)
  const fullPath = join(DIFFS_DIR, 'full-combined.patch');
  mkdirSync(DIFFS_DIR, { recursive: true });
  const combinedParts = [];
  for (const [label, files] of Object.entries(filteredFiles)) {
    if (files.length === 0) continue;
    combinedParts.push(`\n--- ${label} ---\n`);
    for (const f of files.sort((a, b) => a.path.localeCompare(b.path))) {
      combinedParts.push(f.content, '\n');
    }
  }
  const combined = [
    `# B2B Generation Diff (${MIN_CHANGES}-${MAX_CHANGES} changes only)`,
    '# Generated: ' + new Date().toISOString(),
    '# Primary: b2b-generation-diff-summary.md',
    `# Files with ${MAX_CHANGES + 1}+ changes are omitted.`,
    '',
    ...combinedParts
  ].join('\n');
  writeFileSync(fullPath, combined, 'utf8');

  return combined;
}

function writeRestoreList(restoreList) {
  writeFileSync(RESTORE_LIST_OUTPUT, JSON.stringify(restoreList, null, 2), 'utf8');
  const total = Object.values(restoreList).reduce((n, arr) => n + arr.length, 0);
  if (total > 0) {
    console.log(`   ✓ Restore list: ${RESTORE_LIST_OUTPUT} (${total} files with ${MAX_CHANGES + 1}+ changes)`);
  }
}

function writeSummary(allFiles) {
  const lines = [
    '# B2B Generation Diff Summary',
    '',
    '**Generated:** ' + new Date().toISOString(),
    '',
    `Only files with **1–${MAX_CHANGES} total changes** are included. Files with ${MAX_CHANGES + 1}+ changes are omitted.`,
    '',
    '## Legend',
    '',
    '| Symbol | Meaning |',
    '|--------|---------|',
    '| **Current** | What\'s in the repo now (manual edits) |',
    '| **Generated** | What the B2B generators would produce |',
    '| Removed | Lines that would be deleted (current content) |',
    '| Added | Lines that would be added (generated content) |',
    '',
    '---',
    ''
  ];

  let totalFiles = 0;
  let totalRemoved = 0;
  let totalAdded = 0;

  for (const [label, files] of Object.entries(allFiles)) {
    if (files.length === 0) continue;

    lines.push(`## ${label}`);
    lines.push('');
    lines.push('| File | Removed (−) | Added (+) |');
    lines.push('|------|-------------|------------|');

    for (const f of files.sort((a, b) => a.path.localeCompare(b.path))) {
      lines.push(`| \`${f.path}\` | ${f.removed} | ${f.added} |`);
      totalFiles += 1;
      totalRemoved += f.removed;
      totalAdded += f.added;
    }

    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Totals');
  lines.push('');
  lines.push(`- **${totalFiles}** files would change`);
  lines.push(`- **${totalRemoved}** lines removed (current content)`);
  lines.push(`- **${totalAdded}** lines added (generated content)`);
  lines.push('');
  lines.push('## Per-file diffs');
  lines.push('');
  lines.push('See the `b2b-diffs/` directory for individual `.patch` files you can review one at a time.');
  lines.push('');

  writeFileSync(SUMMARY_OUTPUT, lines.join('\n'), 'utf8');
  console.log(`   ✓ Summary: ${SUMMARY_OUTPUT}`);
}

function writePerFileDiffs(allFiles) {
  if (existsSync(DIFFS_DIR)) rmSync(DIFFS_DIR, { recursive: true });
  mkdirSync(DIFFS_DIR, { recursive: true });

  let count = 0;
  for (const [label, files] of Object.entries(allFiles)) {
    const sectionDir = join(DIFFS_DIR, label.replace(/\//g, '-'));
    mkdirSync(sectionDir, { recursive: true });

    for (const f of files) {
      const safeName = f.path.replace(/\//g, '__').replace(/\s+/g, '_') + '.patch';
      const outPath = join(sectionDir, safeName);
      writeFileSync(outPath, f.content, 'utf8');
      count++;
    }
  }

  console.log(`   ✓ Per-file diffs: ${DIFFS_DIR}/ (${count} files)`);
}

function restore() {
  console.log('\n🔄 Restoring to git HEAD...\n');

  for (const { src } of PATHS_TO_PROCESS) {
    try {
      execSync(`git checkout HEAD -- ${src}`, { cwd: projectRoot, stdio: 'pipe' });
      console.log(`   ✓ Restored ${src}`);
    } catch (e) {
      // Directory may not exist in git
    }
  }
}

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  B2B/B2C GENERATION DIFF');
  console.log('='.repeat(70));
  console.log('\nThis will:');
  console.log('  1. Reset files to git HEAD (clean slate)');
  console.log('  2. Run generators (uses mergePreservingPreamble)');
  console.log(`  3. Create diff: git HEAD vs. generated (${MIN_CHANGES}-${MAX_CHANGES} changes only)`);
  console.log('  4. Restore to git HEAD (undo generation)');
  console.log(`\nOutput: summary + per-file diffs (files with ${MIN_CHANGES}-${MAX_CHANGES} changes)\n`);

  try {
    resetToGitHead();
    runGenerators();
    createDiff();
    restore();

    console.log('\n' + '='.repeat(70));
    console.log('  COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📄 Output:');
    console.log(`   • Summary: ${SUMMARY_OUTPUT}`);
    console.log(`   • Per-file diffs: ${DIFFS_DIR}/\n`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nAttempting to restore from backup...');
    try {
      restore();
    } catch (restoreError) {
      console.error('Restore failed:', restoreError.message);
      console.log(`\nManual restore: copy from ${BACKUP_DIR}`);
    }
    process.exit(1);
  }
}

main();
