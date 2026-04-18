#!/usr/bin/env node

/**
 * Type-check documentation examples against TypeScript definitions
 *
 * Extracts code blocks from docs, writes to temp .ts files, runs tsc --noEmit.
 * Catches type errors (wrong prop types, missing imports, etc.).
 *
 * Usage: node scripts/typecheck-examples.mjs [path]
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const TEMP_DIR = join(projectRoot, '.temp-typecheck-examples');

function findMdxFiles(dir, files = []) {
    if (!dir || !existsSync(dir)) return files;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const name = e.name;
        const full = join(dir, name);
        if (e.isDirectory() && !name.startsWith('.') && name !== 'node_modules') {
            findMdxFiles(full, files);
        } else if (e.isFile() && name.endsWith('.mdx')) {
            files.push(full);
        }
    }
    return files;
}

function extractCodeBlocks(content) {
    const blocks = [];
    const re = /```(?:js|javascript|ts|typescript)\n([\s\S]*?)```/g;
    let match;
    while ((match = re.exec(content)) !== null) {
        blocks.push({ code: match[1], lang: match[0].slice(3, 5) });
    }
    return blocks;
}

function hasRunnableExample(code) {
    // Container examples: provider.render(Container, config)(block)
    // Payment-services has self-contained examples; cart/checkout use snippet context and complex slots that cause parse errors
    return /provider\.render|render\.render/.test(code) && /@dropins\/storefront-payment-services/.test(code);
}

// Stub declarations for vars from block config / surrounding context (not imported in examples)
const STUB_DECLARATIONS = `declare const block: HTMLElement;
declare const createProductLink: (item: unknown) => string;
declare const rootLink: (url: string) => () => string;
declare const ctx: Record<string, unknown>;
declare const creditCardFormRef: { current: unknown };
declare const item: unknown;
declare const hideHeading: string;
declare const startShoppingURL: string;
declare const cartURL: string;
declare const checkoutURL: string;
declare const maxItems: string;
declare const hideAttributes: string;
declare const enableUpdateItemQuantity: string;
declare const enableRemoveItem: string;
declare const undo: string;
declare const enableEstimateShipping: string;
declare const enableUpdatingProduct: string;
declare const placeholders: { Global?: { [k: string]: string } };
declare const swatchImageSlot: (ctx: unknown) => void;
declare const tryRenderAemAssetsImage: (ctx: unknown, opts: unknown) => void;
declare const handleEditButtonClick: (item: unknown) => void;
declare const UI: { render: (c: unknown, props: unknown) => (el: HTMLElement) => void };
declare const Button: unknown;
declare const Icon: unknown;
declare const h: (c: unknown, props: unknown) => unknown;
declare const wishlistRender: { render: (c: unknown, props: unknown) => (el: HTMLElement) => void };
declare const WishlistToggle: unknown;
declare const Cart: { updateProductsFromCart: unknown };

`;

function codeToTypeScript(code) {
    let ts = code;
    if (code.includes('(block)') && !code.includes('const block')) {
        ts = STUB_DECLARATIONS + ts;
    }
    return ts;
}

function main() {
    const defaultPath = join(projectRoot, 'src/content/docs');
    const resolved = process.argv[2]
        ? join(projectRoot, process.argv[2])
        : defaultPath;
    if (!existsSync(resolved)) {
        console.error(`Directory not found: ${resolved}`);
        process.exit(1);
    }

    console.log('\n📐 Type-checking documentation examples...\n');
    console.log(`   Scanning: ${resolved}\n`);

    const files = findMdxFiles(resolved);
    const examplesToCheck = [];

    for (const filePath of files) {
        const content = readFileSync(filePath, 'utf8');
        const blocks = extractCodeBlocks(content);
        for (const block of blocks) {
            if (hasRunnableExample(block.code)) {
                examplesToCheck.push({
                    file: filePath.replace(projectRoot + '/', ''),
                    code: block.code,
                });
            }
        }
    }

    if (examplesToCheck.length === 0) {
        console.log('   No runnable examples found to type-check.\n');
        process.exit(0);
    }

    console.log(`   Found ${examplesToCheck.length} example(s) to type-check.\n`);

    mkdirSync(TEMP_DIR, { recursive: true });

    const tsConfig = {
        compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            noImplicitAny: false,
            skipLibCheck: true,
            noEmit: true,
            allowJs: true,
            checkJs: false,
        },
        include: ['*.ts'],
    };

    writeFileSync(join(TEMP_DIR, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

    let hasErrors = false;
    for (let i = 0; i < examplesToCheck.length; i++) {
        const { file, code } = examplesToCheck[i];
        const tsCode = codeToTypeScript(code);
        const tempFile = join(TEMP_DIR, `example.ts`);
        // Clear previous .ts files so tsc only checks this example (avoids cross-file errors)
        for (const name of readdirSync(TEMP_DIR)) {
            if (name.endsWith('.ts')) rmSync(join(TEMP_DIR, name));
        }
        writeFileSync(tempFile, tsCode);

        try {
            execSync(`npx tsc --noEmit -p ${TEMP_DIR}`, {
                cwd: projectRoot,
                stdio: 'pipe',
                encoding: 'utf8',
            });
        } catch (err) {
            const out = err.stdout || err.stderr || '';
            if (out.includes('error TS')) {
                console.error(`\n❌ ${file}`);
                console.error(out.split('\n').filter((l) => l.includes('error')).join('\n'));
                hasErrors = true;
            }
        }
    }

    rmSync(TEMP_DIR, { recursive: true, force: true });

    if (hasErrors) {
        console.error('\n⚠️  Type-check found issues. Fix the examples above.\n');
        process.exit(1);
    }

    console.log(`   ✅ Type-checked ${examplesToCheck.length} example(s).\n`);
    process.exit(0);
}

main();
