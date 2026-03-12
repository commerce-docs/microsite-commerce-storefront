#!/usr/bin/env node

/**
 * Run drop-in and merchant documentation generators (no backup/reset/restore).
 *
 * Generators now use enrichment as source of truth and overwrite junk descriptions.
 * This script simply runs the same generators that b2b-small-changes ran, without
 * the backup/reset/restore workaround.
 *
 * Scope: dropins/, dropins-b2b/, merchants/blocks/
 *
 * USAGE:
 *   npm run run-dropin-generators
 *
 * For diff review before/after, run `npm run diff-b2b-generated` separately.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');

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

function resetBoilerplate() {
  if (existsSync(join(boilerplatePath, '.git'))) {
    try {
      execSync('git fetch origin && git checkout main && git pull origin main', {
        cwd: boilerplatePath,
        stdio: 'pipe',
      });
    } catch (e) {}
  }
}

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  RUN DROP-IN GENERATORS (B2C + B2B + merchants/blocks)');
  console.log('='.repeat(70));
  console.log('\nNo backup, reset, or restore. Generators use enrichment and overwrite junk.\n');

  for (let i = 0; i < generators.length; i++) {
    const gen = generators[i];
    if (gen === 'generate-event-docs') resetBoilerplate();
    console.log(`   [${i + 1}/${generators.length + 1}] ${gen}...`);
    execSync(`npm run ${gen}`, { cwd: projectRoot, stdio: 'inherit' });
  }
  console.log(`\n   [${generators.length + 1}/${generators.length + 1}] generate-merchant-docs...`);
  execSync('npm run generate-merchant-docs', { cwd: projectRoot, stdio: 'inherit' });

  console.log('\n' + '='.repeat(70));
  console.log('  COMPLETE');
  console.log('='.repeat(70));
  console.log('\nFor diff review: npm run diff-b2b-generated\n');
}

main();
