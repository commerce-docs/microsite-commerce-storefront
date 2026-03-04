#!/usr/bin/env node

/**
 * Runtime test for documentation examples
 *
 * Verifies that example code can execute: imports resolve, config is valid,
 * and provider.render can be called. Uses JSDOM for browser globals.
 *
 * Usage: node scripts/test-example-runtime.mjs
 * Requires: pnpm add -D jsdom
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

async function setupJSDOM() {
    let JSDOM;
    try {
        // createRequire(import.meta.url) resolves from script location; fallback to project root
        const projectRequire = createRequire(join(__dirname, '..', 'package.json'));
        ({ JSDOM } = projectRequire('jsdom'));
    } catch (e) {
        console.error('  ⚠️  jsdom not installed. Run: pnpm add -D jsdom');
        console.error(`     (${e.message})\n`);
        process.exit(0);
    }
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost',
        pretendToBeVisual: true,
    });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.localStorage = dom.window.localStorage;
    globalThis.sessionStorage = dom.window.sessionStorage;
}

async function testImportsResolve() {
    console.log('  📦 Testing import resolution...');
    const errors = [];

    try {
        const { getCartData } = await import('@dropins/storefront-cart/api.js');
        if (typeof getCartData !== 'function') {
            errors.push('getCartData is not a function');
        }
    } catch (e) {
        errors.push(`@dropins/storefront-cart/api.js: ${e.message}`);
    }

    try {
        const { PaymentLocation } = await import('@dropins/storefront-payment-services/api.js');
        if (!PaymentLocation?.CHECKOUT) {
            errors.push('PaymentLocation.CHECKOUT not found');
        }
    } catch (e) {
        errors.push(`@dropins/storefront-payment-services/api.js: ${e.message}`);
    }

    try {
        const mod = await import('@dropins/storefront-payment-services/render.js');
        const { render } = mod;
        if (typeof render?.render !== 'function') {
            errors.push('render.render is not a function');
        }
    } catch (e) {
        errors.push(`@dropins/storefront-payment-services/render.js: ${e.message}`);
    }

    try {
        const { ApplePay } = await import('@dropins/storefront-payment-services/containers/ApplePay.js');
        if (typeof ApplePay !== 'function') {
            errors.push('ApplePay is not a component');
        }
    } catch (e) {
        errors.push(`ApplePay container: ${e.message}`);
    }

    if (errors.length > 0) {
        throw new Error('Import resolution failed:\n' + errors.map((e) => '  - ' + e).join('\n'));
    }
    console.log('     ✅ All imports resolve');
}

async function testRenderApi() {
    console.log('  🔧 Testing render API and config...');

    const { getCartData } = await import('@dropins/storefront-cart/api.js');
    const { PaymentLocation } = await import('@dropins/storefront-payment-services/api.js');
    const { render } = await import('@dropins/storefront-payment-services/render.js');
    const { ApplePay } = await import('@dropins/storefront-payment-services/containers/ApplePay.js');

    const config = {
        location: PaymentLocation.CHECKOUT,
        onSuccess: (event) => console.log('Payment success', event),
        onError: (error) => console.error(error),
        getCartId: async () => {
            const cart = await getCartData();
            if (!cart) throw new Error('Cart not initialized');
            return cart.id;
        },
    };

    const renderFn = render.render(ApplePay, config);
    if (typeof renderFn !== 'function') {
        throw new Error('render.render() did not return a function');
    }
    console.log('     ✅ Render API returns function, config is valid');
}

async function testMountComponent() {
    console.log('  🖼️  Testing component mount...');

    const { getCartData } = await import('@dropins/storefront-cart/api.js');
    const { PaymentLocation } = await import('@dropins/storefront-payment-services/api.js');
    const { render } = await import('@dropins/storefront-payment-services/render.js');
    const { ApplePay } = await import('@dropins/storefront-payment-services/containers/ApplePay.js');

    const block = document.createElement('div');
    block.id = 'apple-pay-mount-test';
    document.body.appendChild(block);

    const config = {
        location: PaymentLocation.CHECKOUT,
        onSuccess: () => {},
        onError: () => {},
        getCartId: async () => {
            const cart = await getCartData();
            if (!cart) throw new Error('Cart not initialized');
            return cart.id;
        },
    };

    const renderFn = render.render(ApplePay, config);
    await renderFn(block);
    block.remove();
    console.log('     ✅ Component mounted without error');
}

async function main() {
    console.log('\n🧪 Example Runtime Test\n');
    console.log('='.repeat(50));

    try {
        await setupJSDOM();
        await testImportsResolve();
        await testRenderApi();
        await testMountComponent();
        console.log('\n✅ All runtime tests passed.\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Runtime test failed:', err.message);
        process.exit(1);
    }
}

main();
