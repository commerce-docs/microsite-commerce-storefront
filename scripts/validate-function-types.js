#!/usr/bin/env node

/**
 * Standalone Function Type Validator
 * 
 * Validates that function documentation doesn't contain generic/useless types
 * in signatures, parameters, or return types.
 * 
 * USAGE:
 *   node scripts/validate-function-types.js
 *   npm run validate-function-types (if added to package.json)
 */

import { validateAllFunctionDocs } from './lib/function-type-validator.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Function Type Validation');
console.log('============================\n');

const success = validateAllFunctionDocs(projectRoot);

if (success) {
    console.log('\n✅ All function documentation passed validation!');
    process.exit(0);
} else {
    console.log('\n⚠️  Function documentation has type quality issues.');
    console.log('   These should be fixed in the function generator or enrichment files.');
    process.exit(1);
}

