#!/usr/bin/env node

/**
 * Manage preserve-paths.json: files that generators must not overwrite.
 *
 * USAGE:
 *   npm run preserve-paths                    # List preserved paths
 *   npm run preserve-paths -- add <path>      # Add path (relative to src/content/docs)
 *   npm run preserve-paths -- remove <path>   # Remove path
 *   npm run preserve-paths -- from-diff      # Backup, run generators, add 6+ change files to preserve, restore them
 *
 * Path format: dropins/product-details/containers/index.mdx (no leading src/content/docs/)
 */

import { execSync, spawnSync } from 'child_process';
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  loadPreservePaths,
  addPreservePath,
  removePreservePath,
  toPreserveKey,
} from './lib/preserve-paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BACKUP_DIR = join(projectRoot, '.temp-b2b-diff-backup');
const MAX_CHANGES = 5;

const PATHS_TO_BACKUP = [
  { src: 'src/content/docs/dropins', label: 'dropins' },
  { src: 'src/content/docs/dropins-b2b', label: 'dropins-b2b' },
  { src: 'src/content/docs/merchants/blocks', label: 'merchants/blocks' },
];

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

function countDiffLines(backupPath, currentPath) {
  const result = spawnSync('diff', ['-u', backupPath, currentPath], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status === 0) return { added: 0, removed: 0 };
  if (result.status === 2) return null;
  let added = 0,
    removed = 0;
  for (const line of (result.stdout || result.stderr || '').split('\n')) {
    if (line.startsWith('-') && !line.startsWith('---')) removed++;
    else if (line.startsWith('+') && !line.startsWith('+++')) added++;
  }
  return { added, removed };
}

function getFilesWithManyChanges() {
  const files = [];
  for (const { label } of PATHS_TO_BACKUP) {
    const backupBase = join(BACKUP_DIR, label);
    const currentBase = join(projectRoot, 'src', 'content', 'docs', label);
    if (!existsSync(backupBase)) continue;

    for (const relPath of walkFiles(backupBase)) {
      const backupPath = join(backupBase, relPath);
      const currentPath = join(currentBase, relPath);

      let added = 0,
        removed = 0;
      if (existsSync(currentPath)) {
        const diff = countDiffLines(backupPath, currentPath);
        if (!diff) continue;
        added = diff.added;
        removed = diff.removed;
      } else {
        const content = readFileSync(backupPath, 'utf8');
        removed = content.split('\n').length;
      }

      if (added + removed > MAX_CHANGES) {
        files.push(`${label}/${relPath}`);
      }
    }
  }
  return files;
}

function backup() {
  if (existsSync(BACKUP_DIR)) rmSync(BACKUP_DIR, { recursive: true });
  mkdirSync(BACKUP_DIR, { recursive: true });
  for (const { src, label } of PATHS_TO_BACKUP) {
    const fullSrc = join(projectRoot, src);
    if (existsSync(fullSrc)) {
      cpSync(fullSrc, join(BACKUP_DIR, label), { recursive: true });
    }
  }
}

function resetToGitHead() {
  for (const { src } of PATHS_TO_BACKUP) {
    try {
      execSync(`git checkout HEAD -- ${src}`, { cwd: projectRoot, stdio: 'pipe' });
    } catch (e) {}
  }
}

function runGenerators() {
  const generators = [
    'generate-function-docs',
    'generate-event-docs',
    'generate-container-docs',
    'generate-slot-docs',
    'generate-styles-docs',
    'generate-dictionary-docs',
    'generate-quick-start-docs',
    'generate-initialization-docs',
  ];
  for (const gen of generators) {
    execSync(`npm run ${gen}`, { cwd: projectRoot, stdio: 'inherit' });
  }
  execSync('npm run generate-merchant-docs', { cwd: projectRoot, stdio: 'inherit' });
}

function restoreFromBackup(relativePaths) {
  for (const relPath of relativePaths) {
    const [label, ...rest] = relPath.split('/');
    const path = rest.join('/');
    const backupPath = join(BACKUP_DIR, label, path);
    const destPath = join(projectRoot, 'src', 'content', 'docs', label, path);
    if (existsSync(backupPath)) {
      mkdirSync(dirname(destPath), { recursive: true });
      cpSync(backupPath, destPath, { force: true });
      console.log(`   ✓ Restored: ${relPath}`);
    }
  }
}

function cmdList() {
  const preserve = loadPreservePaths();
  const keys = Object.keys(preserve).sort();
  if (keys.length === 0) {
    console.log('No preserved paths.\n');
    return;
  }
  console.log(`Preserved paths (${keys.length}):\n`);
  for (const key of keys) {
    console.log(`  ${key}  ${preserve[key] ? `# ${preserve[key]}` : ''}`);
  }
  console.log('');
}

function cmdAdd(path, reason) {
  const normalized = path.replace(/^src\/content\/docs\//, '').replace(/\\/g, '/');
  addPreservePath(normalized, reason || 'manual content');
  console.log(`Added: ${normalized}\n`);
}

function cmdRemove(path) {
  const normalized = path.replace(/^src\/content\/docs\//, '').replace(/\\/g, '/');
  removePreservePath(normalized);
  console.log(`Removed: ${normalized}\n`);
}

function cmdFromDiff() {
  console.log('\n📦 Backing up current content...\n');
  backup();

  console.log('\n🔄 Resetting to git HEAD...\n');
  resetToGitHead();

  console.log('\n🔄 Running generators...\n');
  runGenerators();

  const files = getFilesWithManyChanges();
  if (files.length === 0) {
    console.log('\nNo files with 6+ changes. Nothing to add to preserve list.\n');
  } else {
    console.log(`\n📝 Adding ${files.length} file(s) to preserve list and restoring from backup...\n`);
    for (const relPath of files) {
      addPreservePath(relPath, '6+ changes (from-diff)');
    }
    restoreFromBackup(files);
  }

  if (existsSync(BACKUP_DIR)) rmSync(BACKUP_DIR, { recursive: true });
  console.log('\n✅ Done. These files will be skipped by generators on future runs.\n');
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const arg1 = args[1];
  const arg2 = args[2];

  if (cmd === 'add' && arg1) {
    cmdAdd(arg1, arg2);
  } else if (cmd === 'remove' && arg1) {
    cmdRemove(arg1);
  } else if (cmd === 'from-diff') {
    cmdFromDiff();
  } else {
    cmdList();
    console.log('Usage:');
    console.log('  npm run preserve-paths                    List preserved paths');
    console.log('  npm run preserve-paths -- add <path>       Add path (e.g. merchants/blocks/product-recommendations.mdx)');
    console.log('  npm run preserve-paths -- remove <path>    Remove path');
    console.log('  npm run preserve-paths -- from-diff       Backup, run generators, add 6+ change files, restore them');
    console.log('');
  }
}

main();
