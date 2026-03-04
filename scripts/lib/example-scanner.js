/**
 * Example Scanner - Discover container usage from source code
 *
 * Scans boilerplate and drop-in repos for provider.render(ContainerName, { ... })
 * patterns and extracts the actual prop values used. Used to generate
 * code-accurate examples instead of heuristics.
 *
 * Search paths:
 * - .temp-repos/boilerplate/blocks/
 * - .temp-repos/boilerplate-b2b/blocks/
 * - .temp-repos/{dropin}/
 * - .temp-repos/checkout/examples/
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');
const tempRepos = join(projectRoot, '.temp-repos');

/**
 * Extract object literal from content starting at position of opening {
 */
function extractObjectLiteral(content, startIndex) {
  let depth = 1;
  let i = startIndex + 1;
  while (i < content.length && depth > 0) {
    const char = content[i];
    if (char === '{' && content[i - 1] !== '\\') depth++;
    else if (char === '}' && content[i - 1] !== '\\') depth--;
    i++;
  }
  return depth === 0 ? content.slice(startIndex, i).trim() : null;
}

/**
 * Find variable definition and extract its object literal value
 * Handles: const x = { ... }, let x = { ... }, var x = { ... }
 * Also: const x: Type = { ... } (TypeScript)
 */
function findVariableObjectLiteral(content, varName) {
  const re = new RegExp(
    `(?:const|let|var)\\s+${varName}\\s*(?::\\s*[^=]+)?\\s*=\\s*\\{`,
    'g'
  );
  const match = re.exec(content);
  if (!match) return null;
  const start = match.index + match[0].length - 1;
  return extractObjectLiteral(content, start);
}

/**
 * Convert test/mock values to doc-friendly equivalents
 */
function docFriendlyConfig(configStr) {
  return configStr
    .replace(/jest\.fn\(\)\.mockResolvedValue\([^)]+\)/g, "async () => { const cart = await getCartData(); if (!cart) throw new Error('Cart not initialized'); return cart.id; }")
    .replace(/jest\.fn\(\)/g, '() => {}')
    .replace(/jest\.fn\(\)\.mockReturnValue\(\[[^\]]*\]\)/g, "() => [{ sku: 'PRODUCT-SKU', quantity: 1 }]")
    .replace(/jest\.fn\(\)\.mockReturnValue\([^)]+\)/g, "() => [{ sku: 'PRODUCT-SKU', quantity: 1 }]");
}

/**
 * Extract the config object passed as second arg to render(Component, config)
 * Handles both object literals and variable references.
 *
 * @param {string} content - File content
 * @param {string} containerName - Container component name (e.g. ApplePay, CreditCard)
 * @returns {Array<{ config: string, context?: string }>} Extracted config objects
 */
function extractRenderConfigs(content, containerName) {
  const results = [];

  // Case 1: render(ContainerName, { ... }) - object literal
  const literalRe = new RegExp(
    `\\.render\\s*\\(\\s*${containerName}\\s*,\\s*\\{`,
    'g'
  );
  let match;
  while ((match = literalRe.exec(content)) !== null) {
    const start = match.index + match[0].length - 1;
    const config = extractObjectLiteral(content, start);
    if (config) results.push({ config });
  }

  // Case 2: render(ContainerName, varName) - variable reference
  const varRe = new RegExp(
    `\\.render\\s*\\(\\s*${containerName}\\s*,\\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*\\)`,
    'g'
  );
  while ((match = varRe.exec(content)) !== null) {
    const varName = match[1];
    let config = findVariableObjectLiteral(content, varName);
    // Case 2b: params built incrementally - merge additions into base
    if (config) {
      const renderIdx = content.indexOf(`render(${containerName}, ${varName})`, match.index);
      const blockEnd = renderIdx >= 0 ? renderIdx + 300 : match.index + 1500;
      const blockStart = Math.max(0, content.lastIndexOf(varName + ' =', match.index) - 50);
      const block = content.slice(blockStart, blockEnd);
      const getCartIdMatch = block.match(
        new RegExp(`${varName}\\.getCartId\\s*=\\s*([^;]+)`, 's')
      );
      let createCartVal = null;
      const createCartAssignRe = new RegExp(`${varName}\\.createCart\\s*=\\s*\\{`, 's');
      const createCartAssignMatch = block.match(createCartAssignRe);
      if (createCartAssignMatch) {
        const braceIdx = blockStart + block.indexOf(createCartAssignMatch[0]) + createCartAssignMatch[0].length - 1;
        createCartVal = extractObjectLiteral(content, braceIdx);
      }
      // getCartId and createCart are mutually exclusive (checkout vs product-detail)
      if (getCartIdMatch) {
        const val = getCartIdMatch[1].trim();
        config = config.replace(/,?\s*\}\s*$/, `, getCartId: ${val} }`);
      } else if (createCartVal) {
        config = config.replace(/,?\s*\}\s*$/, `, createCart: ${createCartVal} }`);
      }
    }
    if (config) {
      const fromTest = content.includes('jest.') || content.includes('.test.');
      results.push({
        config: fromTest ? docFriendlyConfig(config) : config,
        fromVariable: varName,
      });
    }
  }

  // Case 3: <ContainerName {...varName} /> - JSX spread
  const jsxRe = new RegExp(
    `<${containerName}\\s+[\\.\\.\\.]{3}([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*\\/?>`,
    'g'
  );
  while ((match = jsxRe.exec(content)) !== null) {
    const varName = match[1];
    const config = findVariableObjectLiteral(content, varName);
    if (config) {
      results.push({
        config: docFriendlyConfig(config),
        fromVariable: varName,
        fromJsx: true,
      });
    }
  }

  return results;
}

/**
 * Normalize extracted config for comparison (strip whitespace, collapse)
 */
function normalizeConfig(configStr) {
  return configStr
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

/**
 * Scan a file for container usage
 */
function scanFile(filePath, containerName, packageName) {
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, 'utf8');
  const configs = extractRenderConfigs(content, containerName);

  return configs.map(({ config }) => ({
    file: filePath.replace(projectRoot + '/', ''),
    containerName,
    packageName,
    config: normalizeConfig(config),
    raw: config,
  }));
}

/**
 * Recursively find JS/TS files in directory
 */
function findScriptFiles(dir, ext = /\.(js|ts|tsx|html)$/) {
  const files = [];
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
      files.push(...findScriptFiles(full, ext));
    } else if (e.isFile() && ext.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Scan all known locations for a container's usage
 *
 * @param {string} containerName - e.g. ApplePay, CreditCard
 * @param {string} packageName - e.g. @dropins/storefront-payment-services
 * @returns {Array} Discovered usage examples
 */
export function scanForContainerUsage(containerName, packageName) {
  const examples = [];

  const searchDirs = [
    join(tempRepos, 'boilerplate', 'blocks'),
    join(tempRepos, 'boilerplate-b2b', 'blocks'),
    join(tempRepos, 'checkout', 'examples'),
  ];

  // Map package to dropin folder name for .temp-repos/{dropin} (source + tests)
  const pkgToDropin = {
    '@dropins/storefront-payment-services': 'payment-services',
    '@dropins/storefront-cart': 'cart',
    '@dropins/storefront-checkout': 'checkout',
    '@dropins/storefront-pdp': 'product-details',
    // Add more as needed
  };
  const dropinName = pkgToDropin[packageName];
  if (dropinName && existsSync(join(tempRepos, dropinName))) {
    searchDirs.push(join(tempRepos, dropinName));
    // Drop-in examples (e.g. payment-services/examples)
    const examplesDir = join(tempRepos, dropinName, 'examples');
    if (existsSync(examplesDir)) searchDirs.push(examplesDir);
  }

  for (const dir of searchDirs) {
    const files = findScriptFiles(dir);
    for (const file of files) {
      const found = scanFile(file, containerName, packageName);
      examples.push(...found);
    }
  }

  return examples;
}

/**
 * Get the best discovered example for a container (first from boilerplate, else first found)
 */
export function getBestDiscoveredExample(containerName, packageName) {
  const examples = scanForContainerUsage(containerName, packageName);

  // Prefer boilerplate > boilerplate-b2b > checkout examples > dropin source > tests
  const bySource = (a, b) => {
    const score = (f) => {
      if (f.includes('boilerplate/blocks') && !f.includes('boilerplate-b2b')) return 4;
      if (f.includes('boilerplate-b2b')) return 3;
      if (f.includes('checkout/examples')) return 2;
      if (f.includes('.test.') || f.includes('.spec.')) return 0; // Prefer non-test
      return 1; // dropin source
    };
    return score(b.file) - score(a.file);
  };

  examples.sort(bySource);
  return examples[0] || null;
}
