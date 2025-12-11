#!/usr/bin/env node

/**
 * Comprehensive test of ALL enrichment file loading
 * This tests that the generator can correctly load all enrichment data
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Testing ALL Enrichment File Loading\n');

let passed = 0;
let failed = 0;

// Test 1: Requirements.json
console.log('1️⃣  Testing requirements.json...');
try {
    const path = '_dropin-enrichments/merchant-blocks/requirements.json';

    if (!existsSync(path)) {
        console.error('   ❌ FAIL: File does not exist');
        failed++;
    } else {
        const data = JSON.parse(readFileSync(path, 'utf8'));

        // Should be flat structure: { "block-name": "requirement text" }
        const testBlock = 'commerce-company-profile';
        const requirement = data[testBlock];  // Direct access

        if (!requirement) {
            console.error(`   ❌ FAIL: Could not load requirement for ${testBlock}`);
            console.error(`      Available keys: ${Object.keys(data).slice(0, 5).join(', ')}...`);
            failed++;
        } else if (requirement.includes('**Stores**')) {
            console.log(`   ✅ PASS: Loaded ${Object.keys(data).length} requirements`);
            console.log(`      Sample: ${requirement.substring(0, 60)}...`);
            passed++;
        } else {
            console.error('   ❌ FAIL: Requirement text missing bolded paths');
            failed++;
        }
    }
} catch (error) {
    console.error(`   ❌ FAIL: ${error.message}`);
    failed++;
}

// Test 2: Descriptions.json
console.log('\n2️⃣  Testing descriptions.json...');
try {
    const path = '_dropin-enrichments/merchant-blocks/descriptions.json';

    if (!existsSync(path)) {
        console.error('   ❌ FAIL: File does not exist');
        failed++;
    } else {
        const data = JSON.parse(readFileSync(path, 'utf8'));

        // Should have nested structure: { "blocks": { "cart": {...} } }
        const blocks = data.blocks;

        if (!blocks) {
            console.error('   ❌ FAIL: Missing "blocks" wrapper');
            console.error(`      Top-level keys: ${Object.keys(data).join(', ')}`);
            failed++;
        } else {
            const testBlock = 'cart';  // Without "commerce-" prefix
            const block = blocks[testBlock];

            if (!block || !block.description) {
                console.error(`   ❌ FAIL: Could not load description for ${testBlock}`);
                console.error(`      Available keys: ${Object.keys(blocks).slice(0, 5).join(', ')}...`);
                failed++;
            } else {
                console.log(`   ✅ PASS: Loaded ${Object.keys(blocks).length} descriptions`);
                console.log(`      Sample: ${block.description.substring(0, 60)}...`);
                console.log(`      Verified: ${block.verified ? 'Yes' : 'No'}`);
                passed++;
            }
        }
    }
} catch (error) {
    console.error(`   ❌ FAIL: ${error.message}`);
    failed++;
}

// Test 3: Verify generator can use these files
console.log('\n3️⃣  Testing generator compatibility...');
try {
    // Simulate how generator loads requirements
    const reqPath = join(process.cwd(), '_dropin-enrichments/merchant-blocks/requirements.json');
    const reqData = JSON.parse(readFileSync(reqPath, 'utf8'));
    const reqTest = reqData['commerce-b2b-negotiable-quote'];  // Direct access

    // Simulate how generator loads descriptions
    const descPath = join(process.cwd(), '_dropin-enrichments', 'merchant-blocks', 'descriptions.json');
    const descData = JSON.parse(readFileSync(descPath, 'utf8'));
    const descTest = descData.blocks?.['cart'];  // Nested access with optional chaining

    if (reqTest && descTest) {
        console.log('   ✅ PASS: Generator can load both enrichments correctly');
        console.log(`      Requirements: ${reqTest.substring(0, 50)}...`);
        console.log(`      Descriptions: ${descTest.description.substring(0, 50)}...`);
        passed++;
    } else {
        console.error('   ❌ FAIL: Generator compatibility issue');
        if (!reqTest) console.error('      Requirements failed to load');
        if (!descTest) console.error('      Descriptions failed to load');
        failed++;
    }
} catch (error) {
    console.error(`   ❌ FAIL: ${error.message}`);
    failed++;
}

// Test 4: Check for common structure mistakes
console.log('\n4️⃣  Testing for common structure mistakes...');
try {
    const reqData = JSON.parse(readFileSync('_dropin-enrichments/merchant-blocks/requirements.json', 'utf8'));
    const descData = JSON.parse(readFileSync('_dropin-enrichments/merchant-blocks/descriptions.json', 'utf8'));

    let structureOk = true;

    // Requirements should NOT have nested wrapper
    if (reqData.requirements) {
        console.error('   ❌ FAIL: requirements.json has incorrect nested "requirements" wrapper');
        console.error('      Should be flat: { "block-name": "text" }');
        structureOk = false;
    }

    // Descriptions SHOULD have nested wrapper
    if (!descData.blocks) {
        console.error('   ❌ FAIL: descriptions.json missing required "blocks" wrapper');
        console.error('      Should be nested: { "blocks": { "cart": {...} } }');
        structureOk = false;
    }

    // Requirements keys should include "commerce-" prefix
    const reqKeys = Object.keys(reqData);
    const hasPrefix = reqKeys.some(k => k.startsWith('commerce-'));
    if (!hasPrefix && reqKeys.length > 0 && !reqKeys.includes('$schema')) {
        console.error('   ⚠️  WARNING: requirements.json keys might be missing "commerce-" prefix');
        console.error(`      First key: ${reqKeys[0]}`);
    }

    // Descriptions keys should NOT include "commerce-" prefix
    if (descData.blocks) {
        const descKeys = Object.keys(descData.blocks);
        const hasWrongPrefix = descKeys.some(k => k.startsWith('commerce-'));
        if (hasWrongPrefix) {
            console.error('   ⚠️  WARNING: descriptions.json keys should not have "commerce-" prefix');
            console.error(`      Keys are stripped by generator: "commerce-cart" → "cart"`);
        }
    }

    if (structureOk) {
        console.log('   ✅ PASS: File structures are correct');
        passed++;
    } else {
        failed++;
    }
} catch (error) {
    console.error(`   ❌ FAIL: ${error.message}`);
    failed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('\n✅ All enrichment loading tests PASSED!');
    console.log('   The generator should correctly load all enrichments.');
    process.exit(0);
} else {
    console.log('\n❌ Some tests FAILED!');
    console.log('   Fix the issues above before running the generator.');
    process.exit(1);
}

