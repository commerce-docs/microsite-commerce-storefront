#!/usr/bin/env node

/**
 * Master Type Validator
 * 
 * Validates all generated documentation (events and functions) for generic types.
 * Useful for comprehensive quality checks before committing or deploying.
 * 
 * USAGE:
 *   node scripts/validate-all-types.js
 *   npm run validate-all-types
 */

import { validateAllEventDocs } from './lib/payload-type-validator.js';
import { validateAllFunctionDocs } from './lib/function-type-validator.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Master Type Validation');
console.log('=========================\n');
console.log('Validating all generated documentation for type quality...\n');

let allSuccess = true;

// Validate event documentation
console.log('━'.repeat(50));
console.log('1️⃣  EVENT DOCUMENTATION');
console.log('━'.repeat(50));

const eventsSuccess = validateAllEventDocs(projectRoot);
if (!eventsSuccess) {
    allSuccess = false;
}

// Validate function documentation
console.log('\n' + '━'.repeat(50));
console.log('2️⃣  FUNCTION DOCUMENTATION');
console.log('━'.repeat(50));

const functionsSuccess = validateAllFunctionDocs(projectRoot);
if (!functionsSuccess) {
    allSuccess = false;
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(50) + '\n');

if (allSuccess) {
    console.log('✅ Events:    Passed');
    console.log('✅ Functions: Passed');
    console.log('\n🎉 All documentation passed type validation!');
    process.exit(0);
} else {
    if (!eventsSuccess) {
        console.log('❌ Events:    Failed');
    } else {
        console.log('✅ Events:    Passed');
    }

    if (!functionsSuccess) {
        console.log('❌ Functions: Failed');
    } else {
        console.log('✅ Functions: Passed');
    }

    console.log('\n⚠️  Some documentation has type quality issues.');
    console.log('   Please review and fix the issues above.');
    process.exit(1);
}

