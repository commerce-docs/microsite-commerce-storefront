#!/usr/bin/env node

/**
 * Standalone Event Payload Validator
 * 
 * Validates that event documentation doesn't contain generic/useless types.
 * Run this manually to check documentation quality without regenerating.
 * 
 * USAGE:
 *   node scripts/validate-event-payloads.js
 *   npm run validate-event-payloads (if added to package.json)
 */

import { validateAllEventDocs } from './lib/payload-type-validator.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Event Payload Type Validation');
console.log('=================================\n');

const success = validateAllEventDocs(projectRoot);

if (success) {
    console.log('\n✅ All event documentation passed validation!');
    process.exit(0);
} else {
    console.log('\n❌ Validation failed - please fix the issues above.');
    process.exit(1);
}

