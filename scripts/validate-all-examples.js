#!/usr/bin/env node

/**
 * Validate All Examples
 *
 * Runs the full suite of example validation across containers, functions, events,
 * and other doc types. Ensures examples are accurate and copy-pasteable.
 *
 * Usage:
 *   npm run validate:all-examples [path]
 *   npm run validate:all-examples                    # Full docs
 *   npm run validate:all-examples:small-changes      # b2b-small-changes scope only
 *
 * Validation steps:
 *   1. verify:examples     - Import paths, anti-patterns, null safety (all code blocks)
 *   2. typecheck:examples - TypeScript check (provider.render, container examples)
 *   3. test:example-runtime - Runtime mount test (Apple Pay representative)
 *   4. validate:functions  - Function signature types (no generic any/unknown)
 *   5. validate:events     - Event payload types (no generic any/unknown)
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const SMALL_CHANGES_PATHS = [
    'src/content/docs/dropins',
    'src/content/docs/dropins-b2b',
    'src/content/docs/merchants/blocks',
];

const STEPS = [
    { name: 'Verify examples (imports, anti-patterns, null safety)', cmd: 'verify:examples' },
    { name: 'Type-check examples', cmd: 'typecheck:examples' },
    { name: 'Runtime test (mount)', cmd: 'test:example-runtime' },
    { name: 'Function signature types', cmd: 'validate:functions' },
    { name: 'Event payload types', cmd: 'validate:events' },
];

function run(cmd, pathArg = '') {
    const fullCmd = pathArg ? `npm run ${cmd} -- ${pathArg}` : `npm run ${cmd}`;
    execSync(fullCmd, { stdio: 'inherit', cwd: projectRoot });
}

function main() {
    const isSmallChanges = process.argv.includes('--small-changes') || process.argv[2] === 'small-changes';

    console.log('\n' + '='.repeat(60));
    console.log('  VALIDATE ALL EXAMPLES');
    console.log('='.repeat(60));
    console.log(isSmallChanges ? '\n  Scope: b2b-small-changes (dropins, dropins-b2b, merchants/blocks)\n' : '\n  Scope: full documentation\n');

    try {
        if (isSmallChanges) {
            // Step 1: verify on each path
            console.log('\n--- Step 1: Verify examples (imports, anti-patterns) ---\n');
            for (const path of SMALL_CHANGES_PATHS) {
                run('verify:examples', path);
            }
            // Step 2: typecheck on each path
            console.log('\n--- Step 2: Type-check examples ---\n');
            for (const path of SMALL_CHANGES_PATHS) {
                run('typecheck:examples', path);
            }
            // Step 3: runtime
            console.log('\n--- Step 3: Runtime test ---\n');
            run('test:example-runtime');
            // Steps 4-5: function/event validators (scan dropins, dropins-b2b)
            console.log('\n--- Step 4: Function signature types ---\n');
            run('validate:functions');
            console.log('\n--- Step 5: Event payload types ---\n');
            run('validate:events');
        } else {
            const pathArg = process.argv[2] && process.argv[2] !== 'small-changes' ? process.argv[2] : '';
            for (let i = 0; i < STEPS.length; i++) {
                console.log(`\n--- Step ${i + 1}: ${STEPS[i].name} ---\n`);
                const cmd = STEPS[i].cmd;
                const needsPath = (cmd === 'verify:examples' || cmd === 'typecheck:examples') && pathArg;
                run(cmd, needsPath ? pathArg : '');
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('  ✅ All example validation passed');
        console.log('='.repeat(60) + '\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Validation failed. Fix the issues above.\n');
        process.exit(1);
    }
}

main();
