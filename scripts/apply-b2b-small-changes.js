#!/usr/bin/env node

/**
 * Apply generated content ONLY to files with 1-5 total changes.
 * Files with 6+ changes are left unchanged (manual content preserved).
 *
 * Flow:
 * 1. Backup current state
 * 2. Reset content to git HEAD (clean slate for generators)
 * 3. Run generators (B2C + B2B, overwrites all)
 * 4. Compare backup vs generator output (not git); restore files with 6+ changes
 * 5. Result: Files with 1-5 changes have generated content; 6+ keep pre-run content
 *
 * Does NOT commit. Changes stay in working tree for review.
 *
 * When fixing generator output during testing, document changes in
 * scripts/B2B-SMALL-CHANGES-ROLL-IN.md so they can be rolled into the generators.
 */

import { execSync, spawnSync } from 'child_process';
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BACKUP_DIR = join(projectRoot, '.temp-b2b-diff-backup');
const MIN_CHANGES = 1;
const MAX_CHANGES = 5;

const PATHS_TO_BACKUP = [
  { src: 'src/content/docs/dropins', label: 'dropins' },
  { src: 'src/content/docs/dropins-b2b', label: 'dropins-b2b' },
  { src: 'src/content/docs/merchants/blocks', label: 'merchants/blocks' }
];

function backup() {
  console.log('\n📦 Backing up current content...\n');
  if (existsSync(BACKUP_DIR)) rmSync(BACKUP_DIR, { recursive: true });
  mkdirSync(BACKUP_DIR, { recursive: true });

  for (const { src, label } of PATHS_TO_BACKUP) {
    const fullSrc = join(projectRoot, src);
    if (existsSync(fullSrc)) {
      const dest = join(BACKUP_DIR, label);
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(fullSrc, dest, { recursive: true });
      console.log(`   ✓ ${src}`);
    }
  }
}

/**
 * Reset all tracked files to git HEAD before running generators.
 * This ensures mergePreservingPreamble reads the ORIGINAL content,
 * not content corrupted by a previous run.
 */
function resetToGitHead() {
  console.log('\n🔄 Resetting files to git HEAD (clean slate for generators)...\n');
  for (const { src } of PATHS_TO_BACKUP) {
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
          cwd: boilerplatePath, stdio: 'pipe'
        });
      } catch (e) {}
    }
  };

  const generators = [
    'generate-function-docs', 'generate-event-docs', 'generate-container-docs',
    'generate-slot-docs', 'generate-styles-docs', 'generate-dictionary-docs',
    'generate-quick-start-docs', 'generate-initialization-docs'
  ];
  for (let i = 0; i < generators.length; i++) {
    const gen = generators[i];
    if (gen === 'generate-event-docs') resetBoilerplate();
    console.log(`   [${i + 1}/${generators.length + 1}] ${gen}...`);
    execSync(`npm run ${gen}`, { cwd: projectRoot, stdio: 'inherit' });
  }
  console.log(`\n   [${generators.length + 1}/${generators.length + 1}] generate-merchant-docs...`);
  execSync('npm run generate-merchant-docs', { cwd: projectRoot, stdio: 'inherit' });
}

/**
 * Recursively list all files in a directory.
 */
function walkFiles(dir, base = '') {
  const results = [];
  const fullPath = base ? join(dir, base) : dir;
  if (!existsSync(fullPath)) return results;
  const entries = readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...walkFiles(dir, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

/**
 * Count added/removed lines between two files using diff.
 * Returns { added, removed } or null if diff fails.
 */
function countDiffLines(backupPath, currentPath) {
  const result = spawnSync('diff', ['-u', backupPath, currentPath], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  // diff exits 0 = identical, 1 = differences, 2 = error
  if (result.status === 0) return { added: 0, removed: 0 };
  if (result.status === 2) return null;
  let added = 0, removed = 0;
  for (const line of (result.stdout || result.stderr || '').split('\n')) {
    if (line.startsWith('-') && !line.startsWith('---')) removed++;
    else if (line.startsWith('+') && !line.startsWith('+++')) added++;
  }
  return { added, removed };
}

/**
 * Compare backup vs generator output and return files with 6+ changes to restore.
 * Uses backup (pre-run state) as baseline—not git—so we preserve manual content
 * the user had before running, not stale committed content.
 */
function getFilesToRestore() {
  const filesToRestore = [];

  for (const { label } of PATHS_TO_BACKUP) {
    const backupBase = join(BACKUP_DIR, label);
    const currentBase = join(projectRoot, 'src', 'content', 'docs', label);
    if (!existsSync(backupBase)) continue;

    for (const relPath of walkFiles(backupBase)) {
      const backupPath = join(backupBase, relPath);
      const currentPath = join(currentBase, relPath);

      let added = 0, removed = 0;
      if (existsSync(currentPath)) {
        const diff = countDiffLines(backupPath, currentPath);
        if (!diff) continue;
        added = diff.added;
        removed = diff.removed;
      } else {
        // File was deleted by generator; treat as many changes (restore from backup)
        const content = readFileSync(backupPath, 'utf8');
        removed = content.split('\n').length;
        added = 0;
      }

      if (added + removed > MAX_CHANGES) {
        filesToRestore.push({ section: label, path: relPath });
      }
    }
  }

  return filesToRestore;
}

function restoreFiles(filesToRestore) {
  console.log(`\n🔄 Restoring ${filesToRestore.length} files with ${MAX_CHANGES + 1}+ changes (keeping manual content from backup)...\n`);

  for (const { section, path } of filesToRestore) {
    const backupPath = join(BACKUP_DIR, section, path);
    const destPath = join(projectRoot, 'src', 'content', 'docs', section, path);
    try {
      if (existsSync(backupPath)) {
        const destDir = dirname(destPath);
        if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
        cpSync(backupPath, destPath, { force: true });
        console.log(`   ✓ Restored: ${path}`);
      } else {
        // Fallback: restore from git if backup missing (e.g. new file)
        execSync(`git checkout HEAD -- ${join('src', 'content', 'docs', section, path)}`, { cwd: projectRoot, stdio: 'pipe' });
        console.log(`   ✓ Restored from git: ${path}`);
      }
    } catch (e) {
      console.warn(`   ⚠️  Could not restore ${path}: ${e.message}`);
    }
  }
}

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  APPLY B2B/B2C GENERATED CHANGES (1-5 changes only)');
  console.log('='.repeat(70));
  console.log(`\nWill apply generated content to files with ${MIN_CHANGES}-${MAX_CHANGES} total changes.`);
  console.log(`Files with ${MAX_CHANGES + 1}+ changes (backup vs generator) will keep pre-run content.\n`);

  try {
    backup();
    resetToGitHead();
    runGenerators();
    const filesToRestore = getFilesToRestore();
    restoreFiles(filesToRestore);

    if (existsSync(BACKUP_DIR)) rmSync(BACKUP_DIR, { recursive: true });

    console.log('\n' + '='.repeat(70));
    console.log('  COMPLETE');
    console.log('='.repeat(70));
    console.log('\nChanges are in your working tree. Review and accept or undo as needed.');
    console.log('Nothing has been committed.\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
