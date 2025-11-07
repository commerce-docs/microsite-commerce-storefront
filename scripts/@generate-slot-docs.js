#!/usr/bin/env node

/**
 * Slots Documentation Generator
 *
 * This script generates slots documentation for drop-in components by:
 * 1. Scanning src/containers directories for .tsx files
 * 2. Extracting container names and Props interfaces
 * 3. Parsing slots property definitions from TypeScript
 * 4. Generating comprehensive slots documentation with TypeScript interfaces
 *
 * USAGE:
 * - Generate all drop-ins: npm run generate-slot-docs
 * - Generate single drop-in: npm run generate-slot-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, company-management
 *
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-slots.mdx
 * - Uses: Section text, imports, SLOTS_CONTENT placeholder
 * - Generates independently: Slot interfaces and documentation
 *
 * OUTPUT: Single consolidated slots.mdx file per drop-in
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadSlotEnrichments } from './lib/enrichment.js';
import { updateSidebarForSlots } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';

// Import Phase 2 shared libraries
import { extractPropsFromComponent, extractSlotsSection } from './lib/react/props-extractor.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================
// Note: Most extraction logic has been moved to shared Phase 2 libraries:
// - extractPropsFromComponent() - from lib/react/props-extractor.js
// - extractSlotsSection() - from lib/react/props-extractor.js

/**
 * Extract slots from a container file
 * Uses shared props-extractor library
 */
function extractContainerSlots(filePath, containerName, repoPath) {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');

    // Use shared library to extract props interface
    const { interfaceContent } = extractPropsFromComponent(
      filePath,
      containerName,
      repoPath
    );

    if (!interfaceContent) {
      return null;
    }

    // Extract slots section using shared function
    const slotsContent = extractSlotsSection(interfaceContent);

    if (!slotsContent) {
      return null;
    }

    return {
      containerName,
      slotsInterface: slotsContent,
      fullFileContent: fileContent, // Keep full content for JSDoc extraction
      count: 1 // For logging
    };
  } catch (error) {
    console.log(`    ❌ Error extracting slots from ${containerName}: ${error.message}`);
    return null;
  }
}

/**
 * Extract slots from separate type files (used by Order dropin)
 */
function extractSlotsFromTypeFiles(repoPath) {
  const typesDir = join(repoPath, 'src', 'types');

  if (!existsSync(typesDir)) {
    return [];
  }

  const containers = [];

  try {
    const entries = readdirSync(typesDir);

    for (const entry of entries) {
      // Check for both .types.ts and .types.d.ts files
      if (!entry.endsWith('.types.ts') && !entry.endsWith('.types.d.ts')) {
        continue;
      }

      const typeFilePath = join(typesDir, entry);
      const fileContent = readFileSync(typeFilePath, 'utf-8');

      // Look for interfaces that end with "Props" and have slots (both optional and required)
      // Updated pattern to handle multiline slots and extends clauses
      const interfacePattern = /export\s+interface\s+(\w+Props)(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?slots\??\s*:\s*\{([\s\S]*?)\s*\};?[\s\S]*?\}/g;
      let match;

      while ((match = interfacePattern.exec(fileContent)) !== null) {
        const interfaceName = match[1];
        const containerName = interfaceName.replace(/Props$/, '');
        const fullInterface = match[0];

        // Extract just the slots section
        const slotsContent = extractSlotsSection(fullInterface);

        if (slotsContent) {
          containers.push({
            containerName,
            slotsInterface: slotsContent,
            fullFileContent: fileContent,
            count: 1
          });
        }
      }
    }
  } catch (error) {
    // Silently skip errors
  }

  return containers;
}

/**
 * Scan repository for containers with slots
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of containers with slots
 */
function scanForSlots(repoPath) {
  const containersDir = join(repoPath, 'src', 'containers');
  let containers = [];

  // Method 1: Scan container .tsx files (most dropins)
  if (existsSync(containersDir)) {
    try {
      const entries = readdirSync(containersDir);

      for (const entry of entries) {
        const entryPath = join(containersDir, entry);
        const stat = statSync(entryPath);

        if (stat.isDirectory()) {
          const tsxPath = join(entryPath, `${entry}.tsx`);
          if (existsSync(tsxPath)) {
            const containerInfo = extractContainerSlots(tsxPath, entry, repoPath);
            if (containerInfo && containerInfo.slotsInterface) {
              containers.push(containerInfo);
            }
          }
        }
      }
    } catch (error) {
      // Silently skip errors
    }
  }

  // Method 2: Scan separate type files (Order dropin pattern)
  const typeFileContainers = extractSlotsFromTypeFiles(repoPath);
  containers = containers.concat(typeFileContainers);

  return containers;
}

// ============================================================================
// UNIQUE GENERATION LOGIC
// ============================================================================

/**
 * Generate summary table of all containers and their slots
 */
function generateSummaryTable(containers) {
  if (containers.length === 0) {
    return '';
  }

  let table = '<table>\n';
  table += '<thead>\n';
  table += '<tr>\n';
  table += '<th style="white-space: nowrap;">Container</th>\n';
  table += '<th>Slots</th>\n';
  table += '</tr>\n';
  table += '</thead>\n';
  table += '<tbody>\n';

  for (const container of containers) {
    // Parse slot names from the interface
    // Match slot names regardless of type parameters (handles multiline definitions)
    const slotPattern = /(\w+)\??\s*:\s*SlotProps/g;
    let match;
    const slots = [];

    while ((match = slotPattern.exec(container.slotsInterface)) !== null) {
      slots.push(`<code>${match[1]}</code>`);
    }

    const slotsList = slots.length > 0 ? slots.join(', ') : 'None';

    // Create anchor link to the container's section
    const anchorId = `${container.containerName.toLowerCase()}-slots`;
    const containerLink = `<a href="#${anchorId}"><code>${container.containerName}</code></a>`;

    table += '<tr>\n';
    table += `<td style="white-space: nowrap;">${containerLink}</td>\n`;
    table += `<td>${slotsList}</td>\n`;
    table += '</tr>\n';
  }

  table += '</tbody>\n';
  table += '</table>\n';

  return table;
}

/**
 * Detect non-standard slot types and generate explanatory notes
 */
function detectNonStandardSlots(slotsInterface) {
  const notes = [];

  // Check for slots that don't use SlotProps pattern
  const lines = slotsInterface.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trimStart();

    // Match slot definitions that don't use SlotProps
    const nonStandardMatch = trimmedLine.match(/^(\w+)\??\s*:\s*(\w+);/);
    if (nonStandardMatch && !trimmedLine.includes('SlotProps')) {
      const slotName = nonStandardMatch[1];
      const typeName = nonStandardMatch[2];

      // Generate explanation based on type name patterns
      if (typeName.includes('Slot') && !typeName.includes('SlotProps')) {
        // Likely an index signature or special slot type
        notes.push(`The \`${typeName}\` type uses an index signature where keys dynamically become slot names. Unlike standard slots with fixed names at compile time, this pattern determines slot names at runtime. You configure each slot with an object containing specific properties and render functions.`);
      }
    }
  }

  return notes;
}

/**
 * Generate slots content for documentation
 * Includes real examples from boilerplate and JSDoc when available
 */
function generateSlotsContent(containers, repoConfig = null, repoPath = null) {
  if (containers.length === 0) {
    return ''; // No additional content needed for empty slots
  }

  let content = '';
  const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');

  for (const container of containers) {
    // Get container file content for JSDoc extraction
    const containerFilePath = repoPath ? join(repoPath, 'src', 'containers', `${container.containerName}.tsx`) : null;
    const containerFileContent = (containerFilePath && existsSync(containerFilePath))
      ? readFileSync(containerFilePath, 'utf8')
      : null;

    // Extract all slot examples for this container (from multiple sources)
    const slotExamples = repoConfig
      ? extractAllSlotExamplesForContainer(
        boilerplatePath,
        container.containerName,
        container.slotsInterface,
        repoConfig.packageName,
        containerFileContent // For JSDoc examples
      )
      : new Map();

    // Normalize indentation of the slots interface
    const lines = container.slotsInterface.split('\n');
    const normalizedLines = [];
    const slotLineNumbers = [];

    lines.forEach((line, index) => {
      // Remove all leading whitespace
      const trimmedLine = line.trimStart();

      if (!trimmedLine) {
        // Skip blank lines for cleaner output
        return;
      }

      // Determine indentation based on content - all 2-space increments
      let indentedLine;
      if (/^(\w+\??\s*:\s*SlotProps|\[.+?\]\s*:\s*SlotProps)/.test(trimmedLine)) {
        // Slot definition (named or index signature) - indent with 2 spaces
        indentedLine = '  ' + trimmedLine;
        // Track for highlighting (add 4 for header lines)
        slotLineNumbers.push(normalizedLines.length + 4);
      } else if (trimmedLine.startsWith('}')) {
        // Closing brace for nested type - indent with 2 spaces
        indentedLine = '  ' + trimmedLine;
      } else {
        // Property inside nested type - indent with 4 spaces (2 levels)
        indentedLine = '    ' + trimmedLine;
      }

      normalizedLines.push(indentedLine);
    });

    // Generate highlight syntax for expressive-code
    const highlightSyntax = slotLineNumbers.length > 0
      ? ` {${slotLineNumbers.join(',')}}`
      : '';

    content += `## ${container.containerName} slots\n\n`;

    // Check for non-standard slots and add explanatory notes before code block
    const notes = detectNonStandardSlots(container.slotsInterface);
    if (notes.length > 0) {
      notes.forEach(note => {
        content += `${note}\n\n`;
      });
    }

    content += `\`\`\`js${highlightSyntax}\n`;
    content += `interface ${container.containerName}Props\n\n`;
    content += 'slots?: {\n';
    content += normalizedLines.join('\n');
    content += '\n};\n';
    content += '```\n';

    // Add examples for each slot that has a boilerplate example
    if (slotExamples.size > 0 && repoConfig) {
      const containerKebab = container.containerName
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();

      for (const [slotName, example] of slotExamples.entries()) {
        content += `\n### ${slotName} example\n\n`;
        content += `This example from the ${example.blockName} block shows how to customize the \`${slotName}\` slot:\n\n`;
        content += `\`\`\`js\n`;

        // Check if example code uses h() function (either directly or for Icon)
        const exampleCode = example.code;
        const usesH = /\bh\s*\(/.test(exampleCode);
        // Detect Icon usage: direct Icon( calls OR getAddToCartButton (which uses Icon internally)
        const hasIconUsage = /Icon\s*\(\s*\{/.test(exampleCode);
        const hasGetAddToCartButton = /\bgetAddToCartButton\b/.test(exampleCode);
        const needsHImport = usesH || (hasIconUsage && !/h\s*\(\s*Icon/.test(exampleCode)) || hasGetAddToCartButton;
        const needsIconImport = hasIconUsage || /h\s*\(\s*Icon/.test(exampleCode) || hasGetAddToCartButton;

        // Detect what other imports are needed based on code usage
        const needsCartApi = /\bcartApi\b/.test(exampleCode);
        const needsWishlistToggle = /\bWishlistToggle\b/.test(exampleCode);
        const needsWishlistRender = /\bwishlistRender\b/.test(exampleCode);
        const needsPublishRecsItemAddToCartClick = /\bpublishRecsItemAddToCartClick\b/.test(exampleCode);
        const needsTryRenderAemAssetsImage = /\btryRenderAemAssetsImage\b/.test(exampleCode);
        const needsCreateProductLink = /\bcreateProductLink\b/.test(exampleCode);
        const needsGetProductLink = /\bgetProductLink\b/.test(exampleCode);
        const needsPaymentMethodCode = /\bPaymentMethodCode\b/.test(exampleCode);
        const needsPaymentServices = /\bPaymentServices\b/.test(exampleCode);
        const needsCreditCard = /\bCreditCard\b/.test(exampleCode);
        const needsRootLink = /\brootLink\b/.test(exampleCode);
        const needsPrivacyPolicyPath = /\bPRIVACY_POLICY_PATH\b/.test(exampleCode);
        const needsCartProvider = /\bCartProvider\b/.test(exampleCode);
        const needsGiftOptions = /\bGiftOptions\b/.test(exampleCode);

        // Build imports
        let imports = `import { render as provider } from '${repoConfig.packageName}/render.js';\n`;
        imports += `import ${container.containerName} from '${repoConfig.packageName}/containers/${container.containerName}.js';\n`;

        if (needsIconImport || needsHImport) {
          imports += `import { Button, Icon, provider as UI } from '@dropins/tools/components.js';\n`;
        }

        if (needsHImport) {
          imports += `import { h } from '@dropins/tools/preact.js';\n`;
        }

        if (needsCartApi) {
          imports += `import * as cartApi from '@dropins/storefront-cart/api.js';\n`;
        }

        if (needsWishlistToggle) {
          imports += `import { WishlistToggle } from '@dropins/storefront-wishlist/containers/WishlistToggle.js';\n`;
        }

        if (needsWishlistRender) {
          imports += `import { render as wishlistRender } from '@dropins/storefront-wishlist/render.js';\n`;
        }

        if (needsPublishRecsItemAddToCartClick) {
          imports += `import { publishRecsItemAddToCartClick } from '@dropins/storefront-recommendations/api.js';\n`;
        }

        if (needsTryRenderAemAssetsImage) {
          imports += `import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';\n`;
        }

        if (needsCreateProductLink || needsGetProductLink) {
          // createProductLink is typically a local wrapper, so import getProductLink instead
          imports += `import { getProductLink } from '../../scripts/commerce.js';\n`;
          if (needsCreateProductLink) {
            imports += `const createProductLink = (item) => getProductLink(item.urlKey, item.sku);\n`;
          }
        }

        if (needsPaymentMethodCode) {
          imports += `import { PaymentMethodCode } from '@dropins/storefront-payment-services/api.js';\n`;
        }

        if (needsPaymentServices) {
          imports += `import { render as PaymentServices } from '@dropins/storefront-payment-services/render.js';\n`;
        }

        if (needsCreditCard) {
          imports += `import CreditCard from '@dropins/storefront-payment-services/containers/CreditCard.js';\n`;
        }

        if (needsRootLink) {
          imports += `import { rootLink } from '../../scripts/commerce.js';\n`;
        }

        if (needsPrivacyPolicyPath) {
          imports += `import { PRIVACY_POLICY_PATH } from '../../scripts/commerce.js';\n`;
        }

        if (needsCartProvider) {
          imports += `import { render as CartProvider } from '@dropins/storefront-cart/render.js';\n`;
        }

        if (needsGiftOptions) {
          imports += `import GiftOptions from '@dropins/storefront-cart/containers/GiftOptions.js';\n`;
        }

        // Add placeholder comment for undefined variables that might be needed
        // (like labels, recommendationsData which are context-specific)
        if (/\blabels\b/.test(exampleCode) || /\brecommendationsData\b/.test(exampleCode)) {
          // These are typically defined in the block context, so we'll add a comment
          imports += `// Note: \`labels\` and \`recommendationsData\` should be defined in your block context\n`;
        }

        // Add comment for payment services variables that are typically defined locally
        if (/\bcommerceCoreEndpoint\b/.test(exampleCode) || /\bgetUserTokenCookie\b/.test(exampleCode) || /\bcreditCardFormRef\b/.test(exampleCode)) {
          imports += `// Note: \`commerceCoreEndpoint\`, \`getUserTokenCookie\`, and \`creditCardFormRef\` should be defined in your block context\n`;
        }

        // Add comments for other local variables/functions
        if (/\bplaceholders\b/.test(exampleCode)) {
          imports += `// Note: \`placeholders\` should be defined in your block context (typically from \`fetchPlaceholders()\`)\n`;
        }

        if (/\benableUpdatingProduct\b/.test(exampleCode)) {
          imports += `// Note: \`enableUpdatingProduct\` should be defined in your block context\n`;
        }

        if (/\bhandleEditButtonClick\b/.test(exampleCode)) {
          imports += `// Note: \`handleEditButtonClick\` should be defined in your block context\n`;
        }

        if (/\bimageSlotConfig\b/.test(exampleCode)) {
          imports += `// Note: \`imageSlotConfig\` should be defined in your block context (helper function for image slot configuration)\n`;
        }

        if (/\bgetAddToCartButton\b/.test(exampleCode)) {
          imports += `// Note: \`getAddToCartButton\` should be defined in your block context (helper function to create add to cart button)\n`;
        }

        if (/\bWISHLIST_IMAGE_DIMENSIONS\b/.test(exampleCode)) {
          imports += `// Note: \`WISHLIST_IMAGE_DIMENSIONS\` should be defined in your block context (object with \`width\` and \`height\` properties)\n`;
        }

        if (/\bswatchImageSlot\b/.test(exampleCode)) {
          imports += `// Note: \`swatchImageSlot\` should be defined in your block context (typically imported from a local utils file)\n`;
        }

        // Add comment for content variable used in Personalization examples
        if (/\bcontainer\.append\(content\)/.test(exampleCode) || (/\bcontent\b/.test(exampleCode) && !/\bdefaultImageProps\b/.test(exampleCode) && !/\bctx\./.test(exampleCode))) {
          imports += `// Note: \`content\` should be defined in your block context (typically a DOM element or fragment to render)\n`;
        }

        content += imports + '\n';

        // Fix Icon usage: replace Icon({ with h(Icon, {
        let fixedCode = exampleCode;
        if (needsHImport) {
          // Replace Icon({ source: ... }) with h(Icon, { source: ... })
          fixedCode = fixedCode.replace(/Icon\s*\(\s*\{/g, 'h(Icon, {');
        }

        content += `provider.render(${container.containerName}, {\n`;
        content += `  slots: {\n`;
        content += fixedCode.split('\n').map(line => '    ' + line).join('\n') + '\n';
        content += `  }\n`;
        content += `})(document.querySelector('.${containerKebab}'));\n`;
        content += `\`\`\`\n`;
      }
    }

    content += '\n---\n\n';
  }

  return content;
}

/**
 * Parse context properties from slot type definition
 */
function parseContextProperties(slotTypeDefinition) {
  const props = [];

  // Match property definitions (simple properties only, not nested objects)
  const lines = slotTypeDefinition.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*(\w+)\??:\s*(.+?)[,;]?\s*$/);
    if (match) {
      const propName = match[1];
      const propType = match[2].trim();

      // Classify the property type
      let category = 'unknown';
      if (propType.includes('boolean')) {
        category = 'boolean';
      } else if (propType.includes('=>') || propType.startsWith('(')) {
        category = 'function';
      } else if (propType.includes('ImageProps')) {
        category = 'imageProps';
      } else if (propType.includes('items[number]') || propType.includes('CartModel')) {
        category = 'item';
      } else if (propType.includes('string')) {
        category = 'string';
      } else if (propType.includes('number')) {
        category = 'number';
      }

      props.push({ name: propName, type: propType, category });
    }
  }

  return props;
}

/**
 * Extract slot examples from boilerplate blocks
 * 
 * @param {string} boilerplatePath - Path to boilerplate repository
 * @param {string} containerName - Container name (e.g., "CartSummaryList")
 * @param {string} slotName - Slot name (e.g., "Heading")
 * @param {string} packageName - Package name (e.g., "@dropins/storefront-cart")
 * @returns {Object|null} Example object with code and source, or null if not found
 */
function extractSlotExampleFromBoilerplate(boilerplatePath, containerName, slotName, packageName) {
  const blocksPath = join(boilerplatePath, 'blocks');

  if (!existsSync(blocksPath)) {
    return null;
  }

  // Map container names from TypeScript interfaces to actual boilerplate container names
  // Some containers have different names in the source vs boilerplate
  const containerNameMap = {
    'inputsDefaultValueSet': 'SignUp', // inputsDefaultValueSet is a prop name, but SignUp is the container
  };

  // Use mapped container name if available
  const actualContainerName = containerNameMap[containerName] || containerName;

  // Map package names to boilerplate block files that use them
  const packageToBlocks = {
    '@dropins/storefront-cart': [
      'commerce-cart/commerce-cart.js',
      'commerce-checkout/containers.js',
      'commerce-mini-cart/commerce-mini-cart.js',
      'commerce-gift-options/commerce-gift-options.js',
      'commerce-order-product-list/commerce-order-product-list.js',
      'commerce-wishlist/commerce-wishlist.js',
      'header/header.js',
      'product-details/product-details.js',
      'product-recommendations/product-recommendations.js'
    ],
    '@dropins/storefront-checkout': [
      'commerce-checkout/containers.js',
      'commerce-checkout/commerce-checkout.js'
    ],
    '@dropins/storefront-order': [
      'commerce-order-product-list/commerce-order-product-list.js',
      'commerce-order-returns/commerce-order-returns.js',
      'commerce-checkout/containers.js',
      'commerce-create-return/commerce-create-return.js',
      'commerce-customer-details/commerce-customer-details.js',
      'commerce-order-cost-summary/commerce-order-cost-summary.js',
      'commerce-returns-list/commerce-returns-list.js',
      'commerce-search-order/commerce-search-order.js'
    ],
    '@dropins/storefront-product-details': [
      'product-details/product-details.js',
      'commerce-wishlist/commerce-wishlist.js'
    ],
    '@dropins/storefront-product-discovery': [
      'product-list-page/product-list-page.js',
      'header/header.js'
    ],
    '@dropins/storefront-personalization': [
      'targeted-block/targeted-block.js'
    ],
    '@dropins/storefront-recommendations': [
      'product-recommendations/product-recommendations.js'
    ],
    '@dropins/storefront-wishlist': [
      'commerce-wishlist/commerce-wishlist.js',
      'commerce-cart/commerce-cart.js',
      'product-details/product-details.js',
      'product-list-page/product-list-page.js',
      'product-recommendations/product-recommendations.js'
    ],
    '@dropins/storefront-account': [
      'commerce-account-header/commerce-account-header.js',
      'commerce-account-sidebar/commerce-account-sidebar.js',
      'commerce-addresses/commerce-addresses.js',
      'commerce-customer-details/commerce-customer-details.js',
      'commerce-orders-list/commerce-orders-list.js',
      'commerce-checkout/containers.js',
      'commerce-customer-information/commerce-customer-information.js'
    ],
    '@dropins/storefront-auth': [
      'commerce-checkout/containers.js',
      'commerce-login/commerce-login.js',
      'commerce-create-account/commerce-create-account.js',
      'commerce-confirm-account/commerce-confirm-account.js',
      'commerce-create-password/commerce-create-password.js',
      'commerce-forgot-password/commerce-forgot-password.js',
      'commerce-search-order/commerce-search-order.js',
      'commerce-wishlist/commerce-wishlist.js',
      'header/header.js'
    ]
  };

  const blockFiles = packageToBlocks[packageName] || [];

  // Also search all commerce blocks if no specific mapping
  if (blockFiles.length === 0) {
    try {
      const allBlocks = readdirSync(blocksPath);
      blockFiles.push(...allBlocks
        .filter(block => block.startsWith('commerce-') || block.includes('product'))
        .map(block => {
          const blockPath = join(blocksPath, block);
          if (statSync(blockPath).isDirectory()) {
            const jsFile = join(blockPath, `${block}.js`);
            if (existsSync(jsFile)) {
              return `${block}/${block}.js`;
            }
            // Try containers.js for checkout
            const containersFile = join(blockPath, 'containers.js');
            if (existsSync(containersFile)) {
              return `${block}/containers.js`;
            }
          }
          return null;
        })
        .filter(Boolean));
    } catch (error) {
      // If directory read fails, continue with empty list
    }
  }

  for (const blockFile of blockFiles) {
    const filePath = join(blocksPath, blockFile);

    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');

    // Look for container render calls - pattern: Provider.render(ContainerName, { slots: { SlotName: ... } })
    // Match patterns like: CartProvider.render(CartSummaryList, ...) or provider.render(CartSummaryList, ...)
    // Also match: pdpRendered.render, cartRenderer.render, orderRenderer.render, etc.
    const containerPattern = new RegExp(`(?:await\\s+)?(?:\\w+Provider\\.|provider\\.|\\w+Renderer\\.|\\w+Rendered\\.|render\\.)?render\\s*\\(\\s*${actualContainerName}\\s*,`, 'g');
    const matches = [...content.matchAll(containerPattern)];

    for (const match of matches) {
      const startIndex = match.index;

      // Find the opening brace of the options object
      let braceStart = content.indexOf('{', startIndex);
      if (braceStart === -1) continue;

      // Find matching closing brace for the render() call
      let depth = 0;
      let braceEnd = -1;
      for (let i = braceStart; i < content.length; i++) {
        if (content[i] === '{') depth++;
        if (content[i] === '}') depth--;
        if (depth === 0 && content[i] === '}') {
          braceEnd = i + 1;
          break;
        }
      }

      if (braceEnd === -1) continue;

      const optionsBlock = content.substring(braceStart, braceEnd);

      // Look for slots object within options - need to handle nested braces
      const slotsStart = optionsBlock.indexOf('slots:');
      if (slotsStart === -1) continue;

      // Find the opening brace after 'slots:' OR check for direct variable assignment
      let slotsBraceStart = optionsBlock.indexOf('{', slotsStart);
      let slotsContent = '';
      let isDirectVar = false;

      if (slotsBraceStart === -1) {
        // No opening brace - might be direct variable assignment (e.g., slots: gallerySlots)
        const afterSlots = optionsBlock.substring(slotsStart + 6).trim();
        const directVarPattern = /^(\w+)/;
        const directVarMatch = afterSlots.match(directVarPattern);
        if (directVarMatch) {
          // This is a direct variable assignment, handle it separately
          isDirectVar = true;
          const varName = directVarMatch[1];
          // Find the variable definition in the current file
          const varStartPattern = new RegExp(`(?:export\\s+)?(?:const|let|var)\\s+${varName}\\s*=\\s*\\{`, 's');
          const varStartMatch = content.match(varStartPattern);

          if (varStartMatch) {
            const startIndex = varStartMatch.index + varStartMatch[0].length;
            // Find matching closing brace by counting braces
            let depth = 1;
            let endIndex = startIndex;
            for (let i = startIndex; i < content.length; i++) {
              if (content[i] === '{') depth++;
              if (content[i] === '}') {
                depth--;
                if (depth === 0) {
                  // Check if next non-whitespace is semicolon, comma, or newline
                  let nextChar = i + 1;
                  while (nextChar < content.length && /\s/.test(content[nextChar])) {
                    nextChar++;
                  }
                  if (nextChar >= content.length || /[;,\n]/.test(content[nextChar])) {
                    endIndex = i;
                    break;
                  }
                  depth = 1; // Continue searching
                }
              }
            }

            if (endIndex > startIndex) {
              const varContent = content.substring(startIndex, endIndex);
              // Extract the specific slot we're looking for
              const slotPattern = new RegExp(`${slotName}\\s*:\\s*(?:(async)\\s+)?\\(([^)]*)\\)\\s*=>\\s*\\{`, 's');
              const slotMatch = varContent.match(slotPattern);

              if (slotMatch) {
                const isAsync = !!slotMatch[1];
                const paramName = slotMatch[2].trim() || 'ctx';
                const slotStartIndex = slotMatch.index + slotMatch[0].length;

                // Find matching closing brace - need to find the closing brace of the function
                let depth = 1;
                let slotEndIndex = slotStartIndex;
                for (let i = slotStartIndex; i < varContent.length; i++) {
                  if (varContent[i] === '{') depth++;
                  if (varContent[i] === '}') {
                    depth--;
                    if (depth === 0) {
                      // Found the closing brace of the function
                      // Check if next non-whitespace is comma (property separator) or end
                      let nextChar = i + 1;
                      while (nextChar < varContent.length && /\s/.test(varContent[nextChar])) {
                        nextChar++;
                      }
                      // If next char is comma or we're at the end, this is the function's closing brace
                      if (nextChar >= varContent.length || varContent[nextChar] === ',') {
                        slotEndIndex = i;
                        break;
                      }
                      // Otherwise, continue searching (this was a nested brace)
                      depth = 1;
                    }
                  }
                }

                if (slotEndIndex > slotStartIndex) {
                  let body = varContent.substring(slotStartIndex, slotEndIndex).trim();

                  // Normalize indentation - remove all existing indentation
                  const lines = body.split('\n');
                  const normalizedBody = lines.map(l => {
                    if (!l.trim()) return '';
                    return l.trim();
                  }).filter((l, i) => {
                    if (i === 0 && !l.trim()) return false;
                    return true;
                  }).join('\n').trim();

                  // Re-indent with proper structure based on brace depth
                  // Template adds 4 spaces for "slots: {"
                  // Function body should have 2 spaces relative (indentLevel 1)
                  const bodyLines = normalizedBody.split('\n').filter(line => line.trim()); // Remove blank lines
                  let indentLevel = 1; // Start at 1 for function body (2 spaces relative to template)
                  const indentedBody = bodyLines.map(line => {
                    const trimmed = line.trim();

                    // Handle special cases: } else {, } catch {, } finally {
                    // These should be at the same indent level as the opening brace
                    const isElseBlock = /^\}\s+else\s+\{/.test(trimmed);
                    const isCatchBlock = /^\}\s+catch\s*\(/.test(trimmed);
                    const isFinallyBlock = /^\}\s+finally\s+\{/.test(trimmed);

                    // Count braces in the line
                    const openBraces = (trimmed.match(/\{/g) || []).length;
                    const closeBraces = (trimmed.match(/\}/g) || []).length;

                    // For lines that start with a closing brace (or are just a closing brace),
                    // indent at one level less than current (since we're closing a block)
                    const startsWithCloseBrace = /^\}/.test(trimmed);
                    const indentForLine = startsWithCloseBrace && !isElseBlock && !isCatchBlock && !isFinallyBlock
                      ? Math.max(0, indentLevel - 1)
                      : indentLevel;

                    if (isElseBlock || isCatchBlock || isFinallyBlock) {
                      // Decrease indent for the closing brace, then the else/catch/finally stays at that level
                      indentLevel = Math.max(1, indentLevel - 1);
                    }

                    // Apply indentation BEFORE the line (based on calculated indent level)
                    // Use 2 spaces per indent level (template adds 4 spaces base)
                    const indent = ' '.repeat(indentForLine * 2);
                    const indented = indent + trimmed;

                    // Update indent level AFTER processing this line
                    // (for next line's indentation)
                    if (isElseBlock || isCatchBlock || isFinallyBlock) {
                      // After } else {, the next line should be indented one more level
                      indentLevel += 1;
                    } else {
                      indentLevel += openBraces - closeBraces;
                    }

                    return indented;
                  }).join('\n');

                  const blockName = blockFile.split('/')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                  return {
                    code: `${slotName}: ${isAsync ? 'async ' : ''}(${paramName}) => {\n${indentedBody}\n}`,
                    source: 'boilerplate',
                    blockName: blockName
                  };
                }
              }
            }
          }
        }
        continue; // Skip to next match if we handled direct var assignment
      }

      // Find matching closing brace for slots object (handle nested braces)
      let slotsDepth = 0;
      let slotsBraceEnd = -1;
      for (let i = slotsBraceStart; i < optionsBlock.length; i++) {
        if (optionsBlock[i] === '{') slotsDepth++;
        if (optionsBlock[i] === '}') slotsDepth--;
        if (slotsDepth === 0 && optionsBlock[i] === '}') {
          slotsBraceEnd = i + 1;
          break;
        }
      }

      if (slotsBraceEnd === -1) continue;

      slotsContent = optionsBlock.substring(slotsBraceStart + 1, slotsBraceEnd - 1);

      // Check for spread operators (e.g., ...authPrivacyPolicyConsentSlot)
      // This needs to happen before direct slot matching since spread comes first in the slots object
      const spreadPattern = new RegExp(`\\.\\.\\.(\\w+)`, 's');
      const spreadMatch = slotsContent.match(spreadPattern);

      if (spreadMatch) {
        const spreadVarName = spreadMatch[1];
        // Try to find the variable definition - check imports
        // Import can be on multiple lines with curly braces, e.g.:
        // import {
        //   authPrivacyPolicyConsentSlot,
        //   rootLink,
        // } from '../../scripts/commerce.js';
        const importPattern = new RegExp(`import[\\s\\S]*?${spreadVarName}[\\s\\S]*?from[\\s]*['"]([^'"]+)['"]`, 's');
        const importMatch = content.match(importPattern);

        let searchPath = filePath;

        if (importMatch) {
          const importPath = importMatch[1];
          // Resolve relative import path
          if (importPath.includes('commerce.js')) {
            // Check if it's a relative path or absolute
            if (importPath.startsWith('../../')) {
              // Relative import like ../../scripts/commerce.js
              // Resolve from boilerplate root, not from current file
              searchPath = join(boilerplatePath, importPath.replace(/^\.\.\/\.\.\//, ''));
            } else if (importPath === 'scripts/commerce.js' || importPath.endsWith('/commerce.js')) {
              // Direct path to commerce.js
              searchPath = join(boilerplatePath, 'scripts', 'commerce.js');
            } else {
              // Try to find commerce.js in the path
              searchPath = join(boilerplatePath, 'scripts', 'commerce.js');
            }
          } else if (importPath.startsWith('../../')) {
            // Other relative import - resolve from current file
            const currentDir = dirname(filePath);
            searchPath = join(currentDir, importPath);
          }
        }

        // Try to read the file where the variable is defined
        if (existsSync(searchPath)) {
          const varContent = readFileSync(searchPath, 'utf8');
          // Match the variable definition - need to find the opening brace and match braces properly
          const varStartPattern = new RegExp(`(?:export\\s+)?(?:const|let|var)\\s+${spreadVarName}\\s*=\\s*\\{`, 's');
          const varStartMatch = varContent.match(varStartPattern);

          if (varStartMatch) {
            const startIndex = varStartMatch.index + varStartMatch[0].length;
            // Find matching closing brace by counting braces
            let depth = 1;
            let endIndex = startIndex;
            for (let i = startIndex; i < varContent.length; i++) {
              if (varContent[i] === '{') depth++;
              if (varContent[i] === '}') {
                depth--;
                if (depth === 0) {
                  // Check if next non-whitespace is semicolon, comma, or newline
                  let nextChar = i + 1;
                  while (nextChar < varContent.length && /\s/.test(varContent[nextChar])) {
                    nextChar++;
                  }
                  if (nextChar >= varContent.length || /[;,\n]/.test(varContent[nextChar])) {
                    endIndex = i;
                    break;
                  }
                  depth = 1; // Continue searching
                }
              }
            }

            if (endIndex > startIndex) {
              const slotDefinitions = varContent.substring(startIndex, endIndex);
              // Extract the specific slot we're looking for
              const slotPattern = new RegExp(`${slotName}\\s*:\\s*(?:(async)\\s+)?\\(([^)]*)\\)\\s*=>\\s*\\{`, 's');
              const slotMatch = slotDefinitions.match(slotPattern);

              if (slotMatch) {
                const isAsync = !!slotMatch[1];
                const paramName = slotMatch[2].trim() || 'ctx';
                const slotStartIndex = slotMatch.index + slotMatch[0].length;

                // Find matching closing brace - need to find the closing brace of the function
                // The function is inside an object, so we need to find the }, that closes this property
                let depth = 1;
                let slotEndIndex = slotStartIndex;
                for (let i = slotStartIndex; i < slotDefinitions.length; i++) {
                  if (slotDefinitions[i] === '{') depth++;
                  if (slotDefinitions[i] === '}') {
                    depth--;
                    if (depth === 0) {
                      // Found the closing brace of the function
                      // Check if next non-whitespace is comma (property separator) or end
                      let nextChar = i + 1;
                      while (nextChar < slotDefinitions.length && /\s/.test(slotDefinitions[nextChar])) {
                        nextChar++;
                      }
                      // If next char is comma or we're at the end, this is the function's closing brace
                      if (nextChar >= slotDefinitions.length || slotDefinitions[nextChar] === ',') {
                        slotEndIndex = i;
                        break;
                      }
                      // Otherwise, continue searching (this was a nested brace)
                      depth = 1;
                    }
                  }
                }

                if (slotEndIndex > slotStartIndex) {
                  let body = slotDefinitions.substring(slotStartIndex, slotEndIndex).trim();

                  // Normalize indentation - remove all existing indentation
                  const lines = body.split('\n');
                  const normalizedBody = lines.map(l => {
                    if (!l.trim()) return '';
                    return l.trim();
                  }).filter((l, i) => {
                    if (i === 0 && !l.trim()) return false;
                    return true;
                  }).join('\n').trim();

                  // Re-indent with proper structure based on brace depth
                  // Template adds 4 spaces for "slots: {"
                  // Function body should have 2 spaces relative (indentLevel 1)
                  const bodyLines = normalizedBody.split('\n').filter(line => line.trim()); // Remove blank lines
                  let indentLevel = 1; // Start at 1 for function body (2 spaces relative to template)
                  const indentedBody = bodyLines.map(line => {
                    const trimmed = line.trim();

                    // Handle special cases: } else {, } catch {, } finally {
                    // These should be at the same indent level as the opening brace
                    const isElseBlock = /^\}\s+else\s+\{/.test(trimmed);
                    const isCatchBlock = /^\}\s+catch\s*\(/.test(trimmed);
                    const isFinallyBlock = /^\}\s+finally\s+\{/.test(trimmed);

                    // Count braces in the line
                    const openBraces = (trimmed.match(/\{/g) || []).length;
                    const closeBraces = (trimmed.match(/\}/g) || []).length;

                    // For lines that start with a closing brace (or are just a closing brace),
                    // indent at one level less than current (since we're closing a block)
                    const startsWithCloseBrace = /^\}/.test(trimmed);
                    const indentForLine = startsWithCloseBrace && !isElseBlock && !isCatchBlock && !isFinallyBlock
                      ? Math.max(0, indentLevel - 1)
                      : indentLevel;

                    if (isElseBlock || isCatchBlock || isFinallyBlock) {
                      // Decrease indent for the closing brace, then the else/catch/finally stays at that level
                      indentLevel = Math.max(1, indentLevel - 1);
                    }

                    // Apply indentation BEFORE the line (based on calculated indent level)
                    // Use 2 spaces per indent level (template adds 4 spaces base)
                    const indent = ' '.repeat(indentForLine * 2);
                    const indented = indent + trimmed;

                    // Update indent level AFTER processing this line
                    // (for next line's indentation)
                    if (isElseBlock || isCatchBlock || isFinallyBlock) {
                      // After } else {, the next line should be indented one more level
                      indentLevel += 1;
                    } else {
                      indentLevel += openBraces - closeBraces;
                    }

                    return indented;
                  }).join('\n');

                  const blockName = searchPath.includes('commerce.js')
                    ? 'Commerce Scripts'
                    : blockFile.split('/')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                  return {
                    code: `${slotName}: ${isAsync ? 'async ' : ''}(${paramName}) => {\n${indentedBody}\n}`,
                    source: 'boilerplate',
                    blockName: blockName
                  };
                }
              } else {
                // Slot not found in slot definitions - continue to next source
              }
            } else {
              // Failed to extract slot definitions - continue to next source
            }
          } else {
            // Variable definition not found - continue to next source
          }
        } else {
          // Search path does not exist - continue to next source
        }
      } else {
        // No spread operator found - continue to direct slot matching
      }

      // Check for index signature slots first (e.g., Methods: { [PaymentMethodCode.CREDIT_CARD]: { ... } })
      // These slots have a nested object structure instead of a direct function
      const indexSignaturePattern = new RegExp(`${slotName}\\s*:\\s*\\{`, 's');
      const indexSignatureMatch = slotsContent.match(indexSignaturePattern);

      if (indexSignatureMatch) {
        // This is an index signature slot - extract the entire object structure
        const startIndex = indexSignatureMatch.index + indexSignatureMatch[0].length; // Start after opening brace

        // Find matching closing brace for the entire Methods object
        let depth = 1;
        let endIndex = startIndex;
        for (let i = startIndex; i < slotsContent.length; i++) {
          if (slotsContent[i] === '{') depth++;
          if (slotsContent[i] === '}') {
            depth--;
            if (depth === 0) {
              endIndex = i + 1;
              break;
            }
          }
        }

        if (endIndex > startIndex) {
          let body = slotsContent.substring(startIndex, endIndex - 1).trim(); // Exclude closing brace

          // Normalize indentation
          const lines = body.split('\n');
          const normalizedBody = lines.map(l => {
            if (!l.trim()) return '';
            return l.trim();
          }).filter((l, i) => {
            if (i === 0 && !l.trim()) return false;
            return true;
          }).join('\n').trim();

          // Re-indent with proper structure
          const bodyLines = normalizedBody.split('\n').filter(line => line.trim());
          let indentLevel = 1; // Start at 1 for object body (2 spaces relative to template)
          const indentedBody = bodyLines.map(line => {
            const trimmed = line.trim();

            // Count braces in the line
            const openBraces = (trimmed.match(/\{/g) || []).length;
            const closeBraces = (trimmed.match(/\}/g) || []).length;

            // For lines that start with a closing brace, indent at one level less
            const startsWithCloseBrace = /^\}/.test(trimmed);
            const indentForLine = startsWithCloseBrace
              ? Math.max(0, indentLevel - 1)
              : indentLevel;

            // Apply indentation
            const indent = ' '.repeat(indentForLine * 2);
            const indented = indent + trimmed;

            // Update indent level
            indentLevel += openBraces - closeBraces;

            return indented;
          }).join('\n');

          const blockName = blockFile.split('/')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          return {
            code: `${slotName}: {\n${indentedBody}\n}`,
            source: 'boilerplate',
            blockName: blockName
          };
        }
      }

      // Look for the specific slot - Pattern: SlotName: (ctx) => { ... } or SlotName: async (ctx) => { ... }
      // Need to properly match nested braces by finding the opening brace and matching closing brace
      const slotStartPattern = new RegExp(`${slotName}\\s*:\\s*(?:(async)\\s+)?\\(([^)]*)\\)\\s*=>\\s*\\{`, 's');
      const slotStartMatch = slotsContent.match(slotStartPattern);

      if (slotStartMatch) {
        const isAsync = !!slotStartMatch[1];
        const paramName = slotStartMatch[2].trim() || 'ctx';
        const startIndex = slotStartMatch.index + slotStartMatch[0].length;

        // Find matching closing brace (handle nested braces)
        let depth = 1;
        let endIndex = startIndex;
        for (let i = startIndex; i < slotsContent.length; i++) {
          if (slotsContent[i] === '{') depth++;
          if (slotsContent[i] === '}') depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }

        if (endIndex === startIndex) {
          continue; // No matching brace found
        }

        let body = slotsContent.substring(startIndex, endIndex).trim();

        // Normalize indentation - find minimum indent of non-empty lines
        const lines = body.split('\n');
        const nonEmptyLines = lines.filter(l => l.trim().length > 0);
        if (nonEmptyLines.length === 0) {
          continue; // Skip empty slot bodies
        }

        const minIndent = Math.min(...nonEmptyLines.map(l => {
          const match = l.match(/^(\s*)/);
          return match ? match[1].length : 0;
        }));

        // Normalize: remove ALL indentation, start everything at column 0
        const normalizedBody = lines.map(l => {
          if (!l.trim()) return '';
          const match = l.match(/^(\s*)(.*)$/);
          if (match) {
            const content = match[2];
            // Remove all indentation - start everything at column 0
            // Then we'll add proper indentation based on structure
            return content;
          }
          return l;
        }).filter((l, i) => {
          // Remove leading empty lines
          if (i === 0 && !l.trim()) return false;
          return true;
        }).join('\n').trim();

        // Re-indent with proper structure based on brace depth
        // Template adds 4 spaces for "slots: {"
        // Function body should have 2 spaces relative (indentLevel 1)
        const bodyLines = normalizedBody.split('\n').filter(line => line.trim()); // Remove blank lines
        let indentLevel = 1; // Start at 1 for function body (2 spaces relative to template)
        const indentedBody = bodyLines.map(line => {
          const trimmed = line.trim();

          // Handle special cases: } else {, } catch {, } finally {
          // These should be at the same indent level as the opening brace
          const isElseBlock = /^\}\s+else\s+\{/.test(trimmed);
          const isCatchBlock = /^\}\s+catch\s*\(/.test(trimmed);
          const isFinallyBlock = /^\}\s+finally\s+\{/.test(trimmed);

          // Count braces in the line
          const openBraces = (trimmed.match(/\{/g) || []).length;
          const closeBraces = (trimmed.match(/\}/g) || []).length;

          // For lines that start with a closing brace (or are just a closing brace),
          // indent at one level less than current (since we're closing a block)
          const startsWithCloseBrace = /^\}/.test(trimmed);
          const indentForLine = startsWithCloseBrace && !isElseBlock && !isCatchBlock && !isFinallyBlock
            ? Math.max(0, indentLevel - 1)
            : indentLevel;

          if (isElseBlock || isCatchBlock || isFinallyBlock) {
            // Decrease indent for the closing brace, then the else/catch/finally stays at that level
            indentLevel = Math.max(1, indentLevel - 1);
          }

          // Apply indentation BEFORE the line (based on calculated indent level)
          // Use 2 spaces per indent level (template adds 4 spaces base)
          const indent = ' '.repeat(indentForLine * 2);
          const indented = indent + trimmed;

          // Update indent level AFTER processing this line
          // (for next line's indentation)
          if (isElseBlock || isCatchBlock || isFinallyBlock) {
            // After } else {, the next line should be indented one more level
            indentLevel += 1;
          } else {
            indentLevel += openBraces - closeBraces;
          }

          return indented;
        }).join('\n');

        const exampleCode = `${slotName}: ${isAsync ? 'async ' : ''}(${paramName}) => {\n${indentedBody}\n}`;

        // Extract block name for title
        const blockName = blockFile.split('/')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return {
          code: exampleCode,
          source: 'boilerplate',
          blockName: blockName
        };
      }

      // Also check for function references (e.g., Footer: renderCartGiftOptions)
      const refPattern = new RegExp(`${slotName}\\s*:\\s*(\\w+)`, 'g');
      const refMatch = slotsContent.match(refPattern);

      if (refMatch) {
        // Find the function definition
        const funcName = refMatch[1];
        const funcPattern = new RegExp(
          `(?:function\\s+${funcName}|const\\s+${funcName}\\s*=\\s*(?:async\\s+)?\\([^)]*\\)\\s*=>|${funcName}\\s*=\\s*(?:async\\s+)?\\([^)]*\\)\\s*=>)\\s*\\{([\\s\\S]*?)\\}(?=\\s*(?:;|,|\\n|$))`,
          's'
        );
        const funcMatch = content.match(funcPattern);

        if (funcMatch) {
          const funcBody = funcMatch[1].trim();
          const paramMatch = funcMatch[0].match(/\(([^)]*)\)/);
          const paramName = paramMatch ? paramMatch[1].trim() : 'ctx';

          // Normalize indentation
          const lines = funcBody.split('\n');
          const nonEmptyLines = lines.filter(l => l.trim().length > 0);
          if (nonEmptyLines.length === 0) {
            continue; // Skip empty function bodies
          }

          const minIndent = Math.min(...nonEmptyLines.map(l => {
            const match = l.match(/^(\s*)/);
            return match ? match[1].length : 0;
          }));

          // Normalize: remove ALL indentation, start everything at column 0
          const normalizedBody = lines.map(l => {
            if (!l.trim()) return '';
            const match = l.match(/^(\s*)(.*)$/);
            if (match) {
              return match[2]; // Just the content, no indentation
            }
            return l;
          }).filter((l, i) => {
            if (i === 0 && !l.trim()) return false;
            return true;
          }).join('\n').trim();

          // Re-indent with proper structure based on brace depth
          // Template adds 4 spaces for "slots: {"
          // Function body should have 2 spaces relative (indentLevel 1)
          const bodyLines = normalizedBody.split('\n').filter(line => line.trim()); // Remove blank lines
          let indentLevel = 1; // Start at 1 for function body (2 spaces relative to template)
          const indentedBody = bodyLines.map(line => {
            const trimmed = line.trim();

            // Handle special cases: } else {, } catch {, } finally {
            // These should be at the same indent level as the opening brace
            const isElseBlock = /^\}\s+else\s+\{/.test(trimmed);
            const isCatchBlock = /^\}\s+catch\s*\(/.test(trimmed);
            const isFinallyBlock = /^\}\s+finally\s+\{/.test(trimmed);

            // Count braces in the line
            const openBraces = (trimmed.match(/\{/g) || []).length;
            const closeBraces = (trimmed.match(/\}/g) || []).length;

            // For lines that start with a closing brace (or are just a closing brace),
            // indent at one level less than current (since we're closing a block)
            const startsWithCloseBrace = /^\}/.test(trimmed);
            const indentForLine = startsWithCloseBrace && !isElseBlock && !isCatchBlock && !isFinallyBlock
              ? Math.max(0, indentLevel - 1)
              : indentLevel;

            if (isElseBlock || isCatchBlock || isFinallyBlock) {
              // Decrease indent for the closing brace, then the else/catch/finally stays at that level
              indentLevel = Math.max(1, indentLevel - 1);
            }

            // Apply indentation BEFORE the line (based on calculated indent level)
            // Use 2 spaces per indent level (template adds 4 spaces base)
            const indent = ' '.repeat(indentForLine * 2);
            const indented = indent + trimmed;

            // Update indent level AFTER processing this line
            // (for next line's indentation)
            if (isElseBlock || isCatchBlock || isFinallyBlock) {
              // After } else {, the next line should be indented one more level
              indentLevel += 1;
            } else {
              indentLevel += openBraces - closeBraces;
            }

            return indented;
          }).join('\n');

          const blockName = blockFile.split('/')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

          return {
            code: `${slotName}: (${paramName}) => {\n${indentedBody}\n}`,
            source: 'boilerplate',
            blockName: blockName
          };
        }
      }
    }
  }

  return null;
}

/**
 * Extract slot examples from HTML example files
 * 
 * @param {string} dropinPath - Path to drop-in repository
 * @param {string} containerName - Container name
 * @param {string} slotName - Slot name
 * @returns {Object|null} Example object with code and source, or null if not found
 */
function extractSlotExampleFromHTML(dropinPath, containerName, slotName) {
  const examplePath = join(dropinPath, 'examples', 'html-host', 'index.html');

  if (!existsSync(examplePath)) {
    return null;
  }

  const content = readFileSync(examplePath, 'utf8');

  // Look for container render calls with slots
  // Handle patterns like: provider.render(ContainerName, { slots: { ... } })
  // or: render(ContainerName, { slots: { ... } })
  const containerPattern = new RegExp(`(?:\\w+\\.)?render\\s*\\(\\s*${containerName}\\s*,`, 'g');
  const matches = [...content.matchAll(containerPattern)];

  if (matches.length === 0) {
    return null;
  }

  // Find the render call that has slots
  let slotsContent = null;
  for (const match of matches) {
    const startIndex = match.index;

    // Find the opening brace of the options object
    let braceStart = content.indexOf('{', startIndex);
    if (braceStart === -1) continue;

    // Find matching closing brace for the render() call using brace counting
    let depth = 0;
    let braceEnd = -1;
    for (let i = braceStart; i < content.length; i++) {
      if (content[i] === '{') depth++;
      if (content[i] === '}') depth--;
      if (depth === 0 && content[i] === '}') {
        braceEnd = i + 1;
        break;
      }
    }

    if (braceEnd === -1) continue;

    const optionsBlock = content.substring(braceStart, braceEnd);

    // Look for slots object within options
    const slotsStart = optionsBlock.indexOf('slots:');
    if (slotsStart === -1) continue;

    // Find the opening brace after 'slots:'
    let slotsBraceStart = optionsBlock.indexOf('{', slotsStart);
    if (slotsBraceStart === -1) continue;

    // Extract slots content using brace counting
    let slotsDepth = 0;
    let slotsBraceEnd = -1;
    for (let i = slotsBraceStart; i < optionsBlock.length; i++) {
      if (optionsBlock[i] === '{') slotsDepth++;
      if (optionsBlock[i] === '}') slotsDepth--;
      if (slotsDepth === 0 && optionsBlock[i] === '}') {
        slotsBraceEnd = i;
        break;
      }
    }

    if (slotsBraceEnd === -1) continue;

    slotsContent = optionsBlock.substring(slotsBraceStart + 1, slotsBraceEnd);
    break; // Found slots, stop searching
  }

  if (!slotsContent) {
    return null;
  }

  // Look for the specific slot
  const slotPattern = new RegExp(`${slotName}\\s*:\\s*(?:(async)\\s+)?\\(([^)]*)\\)\\s*=>\\s*\\{`, 's');
  const slotMatch = slotsContent.match(slotPattern);

  if (slotMatch) {
    const isAsync = !!slotMatch[1];
    const paramName = slotMatch[2].trim() || 'ctx';
    const startIndex = slotMatch.index + slotMatch[0].length;

    // Find matching closing brace
    let depth = 1;
    let endIndex = startIndex;
    for (let i = startIndex; i < slotsContent.length; i++) {
      if (slotsContent[i] === '{') depth++;
      if (slotsContent[i] === '}') depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === startIndex) {
      return null;
    }

    let body = slotsContent.substring(startIndex, endIndex).trim();

    // Normalize indentation - remove all existing indentation
    const lines = body.split('\n');
    const normalizedBody = lines.map(l => {
      if (!l.trim()) return '';
      return l.trim();
    }).filter((l, i) => {
      if (i === 0 && !l.trim()) return false;
      return true;
    }).join('\n').trim();

    // Re-indent with proper structure based on brace depth
    // Template adds 4 spaces for "slots: {"
    // Function body should have 2 spaces relative (indentLevel 1)
    const bodyLines = normalizedBody.split('\n').filter(line => line.trim()); // Remove blank lines
    let indentLevel = 1; // Start at 1 for function body (2 spaces relative to template)
    const indentedBody = bodyLines.map(line => {
      const trimmed = line.trim();

      // Handle special cases: } else {, } catch {, } finally {
      // These should be at the same indent level as the opening brace
      const isElseBlock = /^\}\s+else\s+\{/.test(trimmed);
      const isCatchBlock = /^\}\s+catch\s*\(/.test(trimmed);
      const isFinallyBlock = /^\}\s+finally\s+\{/.test(trimmed);

      // Count braces in the line
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;

      // For lines that start with a closing brace (or are just a closing brace),
      // indent at one level less than current (since we're closing a block)
      const startsWithCloseBrace = /^\}/.test(trimmed);
      const indentForLine = startsWithCloseBrace && !isElseBlock && !isCatchBlock && !isFinallyBlock
        ? Math.max(0, indentLevel - 1)
        : indentLevel;

      if (isElseBlock || isCatchBlock || isFinallyBlock) {
        // Decrease indent for the closing brace, then the else/catch/finally stays at that level
        indentLevel = Math.max(1, indentLevel - 1);
      }

      // Apply indentation BEFORE the line (based on calculated indent level)
      // Use 2 spaces per indent level (template adds 4 spaces base)
      const indent = ' '.repeat(indentForLine * 2);
      const indented = indent + trimmed;

      // Update indent level AFTER processing this line
      // (for next line's indentation)
      if (isElseBlock || isCatchBlock || isFinallyBlock) {
        // After } else {, the next line should be indented one more level
        indentLevel += 1;
      } else {
        indentLevel += openBraces - closeBraces;
      }

      return indented;
    }).join('\n');

    return {
      code: `${slotName}: ${isAsync ? 'async ' : ''}(${paramName}) => {\n${indentedBody}\n}`,
      source: 'html-example',
      blockName: 'HTML Example'
    };
  }

  return null;
}

/**
 * Extract slot examples from JSDoc comments in container files
 * 
 * @param {string} containerFileContent - Full content of container file
 * @param {string} slotName - Slot name
 * @returns {Object|null} Example object with code and source, or null if not found
 */
function extractSlotExampleFromJSDoc(containerFileContent, slotName) {
  // Look for JSDoc comments that mention the slot
  const jsdocPattern = new RegExp(`/\*\*[\\s\\S]*?@slot\\s+${slotName}[\\s\\S]*?@example\\s+([\\s\\S]*?)(?=\\s*\\*/)`, 's');
  const match = containerFileContent.match(jsdocPattern);

  if (match) {
    let code = match[1]
      .replace(/^\s*\*\s*/gm, '') // Remove JSDoc asterisks
      .trim();

    // Normalize indentation
    const lines = code.split('\n');
    const normalizedBody = lines.map(l => {
      if (!l.trim()) return '';
      return l.trim();
    }).filter((l, i) => {
      if (i === 0 && !l.trim()) return false;
      return true;
    }).join('\n').trim();

    return {
      code: normalizedBody,
      source: 'jsdoc',
      blockName: 'JSDoc Example'
    };
  }

  return null;
}

/**
 * Extract all slot examples for a container from boilerplate
 * 
 * @param {string} boilerplatePath - Path to boilerplate repository
 * @param {string} containerName - Container name
 * @param {string} slotsInterface - Slots interface string
 * @param {string} packageName - Package name
 * @param {string} containerFileContent - Container file content (optional, for JSDoc examples)
 * @returns {Map<string, Object>} Map of slot name to example object
 */
function extractAllSlotExamplesForContainer(boilerplatePath, containerName, slotsInterface, packageName, containerFileContent = null) {
  const examples = new Map();

  // Extract all slot names from the interface
  // Match both SlotProps pattern and custom slot types (e.g., PaymentMethodsSlot)
  const slotPattern = /(\w+)\??\s*:\s*(SlotProps|.*Slot)/g;
  const slotMatches = [...slotsInterface.matchAll(slotPattern)];

  for (const match of slotMatches) {
    const slotName = match[1];
    const slotType = match[2];

    // Try sources in priority order: Boilerplate > JSDoc
    // Boilerplate examples are real-world usage, so they take priority
    let example = null;

    // First priority: Real-world boilerplate examples
    example = extractSlotExampleFromBoilerplate(boilerplatePath, containerName, slotName, packageName);

    // Second priority: JSDoc examples from container files
    if (!example && containerFileContent) {
      example = extractSlotExampleFromJSDoc(containerFileContent, slotName);
    }

    if (example) {
      examples.set(slotName, example);
    }
  }

  return examples;
}

/**
 * Generate a simple example using the first container with slots
 * Tries to use real boilerplate examples first, falls back to generated examples
 */
function generateSimpleExample(containers, repoConfig) {
  if (containers.length === 0) {
    return '';
  }

  // Find the first container with a named slot (not just index signatures)
  let container = null;
  let slotMatch = null;

  for (const cont of containers) {
    slotMatch = cont.slotsInterface.match(/(\w+)\??\s*:\s*SlotProps/);
    if (slotMatch) {
      container = cont;
      break;
    }
  }

  // If no container has named slots, return empty
  if (!container || !slotMatch) {
    return '';
  }

  const slotName = slotMatch[1];
  const containerName = container.containerName;

  // Try to get real example from boilerplate
  const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');
  const boilerplateExample = extractSlotExampleFromBoilerplate(boilerplatePath, containerName, slotName, repoConfig.packageName);

  if (boilerplateExample) {
    // Use real boilerplate example
    const containerKebab = containerName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

    return `## Example usage

This example customizes the \`${slotName}\` slot in \`${containerName}\` (from ${boilerplateExample.blockName} block):

\`\`\`js
import { render as provider } from '${repoConfig.packageName}/render.js';
import ${containerName} from '${repoConfig.packageName}/containers/${containerName}.js';

provider.render(${containerName}, {
  slots: {
${boilerplateExample.code.split('\n').map(line => '    ' + line).join('\n')}
  }
})(document.querySelector('.${containerKebab}'));
\`\`\`
`;
  }

  // Convert container name to kebab-case for BEM
  const containerKebab = containerName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  const slotKebab = slotName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

  // Extract the slot's type definition to see what properties are available
  const slotTypeMatch = container.slotsInterface.match(
    new RegExp(`${slotName}\\??\\s*:\\s*SlotProps<\\{([\\s\\S]*?)\\}>`, 's')
  );

  // Generate example based on context properties
  let exampleContent;
  if (slotTypeMatch && slotTypeMatch[1].trim()) {
    const contextProps = parseContextProperties(slotTypeMatch[1]);
    const hasItem = contextProps.some(p => p.category === 'item');
    const hasImageProps = contextProps.some(p => p.category === 'imageProps');
    const hasBoolean = contextProps.some(p => p.category === 'boolean');
    const booleanProp = contextProps.find(p => p.category === 'boolean');

    if (hasItem && hasImageProps) {
      // Image-related slot with item
      const imageProp = contextProps.find(p => p.category === 'imageProps').name;
      exampleContent = `    ${slotName}: (ctx) => {
      const { item, ${imageProp} } = ctx;
      
      const link = document.createElement('a');
      link.href = \`/products/\${item.sku}\`;
      link.className = '${containerKebab}__${slotKebab}';
      
      const img = document.createElement('img');
      img.src = ${imageProp}.src;
      img.alt = item.name || 'Product image';
      img.width = ${imageProp}.width;
      img.height = ${imageProp}.height;
      
      link.appendChild(img);
      ctx.appendChild(link);
    }`;
    } else if (hasItem) {
      // Item-related slot without images
      exampleContent = `    ${slotName}: (ctx) => {
      const { item } = ctx;
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = \`SKU: \${item.sku}\`;
      ctx.appendChild(div);
    }`;
    } else if (hasBoolean && booleanProp) {
      // Boolean property - generate conditional example
      const trueValue = slotName.includes('Heading') || slotName.includes('Title')
        ? `'Welcome Back!'`
        : `'Authenticated State'`;
      const falseValue = slotName.includes('Heading') || slotName.includes('Title')
        ? `'Sign In'`
        : `'Guest State'`;

      exampleContent = `    ${slotName}: (ctx) => {
      const { ${booleanProp.name} } = ctx;
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = ${booleanProp.name} ? ${trueValue} : ${falseValue};
      ctx.appendChild(div);
    }`;
    } else if (contextProps.length > 0) {
      // Has properties but no specific pattern - show first property
      const firstProp = contextProps[0].name;
      exampleContent = `    ${slotName}: (ctx) => {
      const { ${firstProp} } = ctx;
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = 'Custom ${slotName}';
      ctx.appendChild(div);
    }`;
    } else {
      // Fallback - no recognized properties
      exampleContent = `    ${slotName}: (ctx) => {
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = 'Custom ${slotName}';
      ctx.appendChild(div);
    }`;
    }
  } else {
    // No properties - simple slot
    exampleContent = `    ${slotName}: (ctx) => {
      const div = document.createElement('div');
      div.className = '${containerKebab}__${slotKebab}';
      div.textContent = 'Custom ${slotName}';
      ctx.appendChild(div);
    }`;
  }

  return `## Example usage

This example customizes the \`${slotName}\` slot in \`${containerName}\`:

\`\`\`js
import { render as provider } from '${repoConfig.packageName}/render.js';
import ${containerName} from '${repoConfig.packageName}/containers/${containerName}.js';

provider.render(${containerName}, {
  slots: {
${exampleContent}
  }
})(document.querySelector('.${containerKebab}'));
\`\`\`
`;
}

/**
 * Generate a complex slot example demonstrating callbacks
 * 
 * @param {Array} containers - Array of containers with slots
 * @param {Object} repoConfig - Repository configuration
 * @returns {string|null} Complex example markdown or null if no suitable slot found
 */
function generateComplexExample(containers, repoConfig) {
  // Find a slot with callbacks/methods (functions in context properties)
  for (const container of containers) {
    const { containerName, slotsInterface } = container;
    const containerKebab = containerName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

    // Look for Agreements slot (Checkout drop-in)
    const agreementsPattern = /Agreements\??:\s*SlotProps<\{[^}]*appendAgreement[^}]*\}>/;
    const agreementsMatch = slotsInterface.match(agreementsPattern);

    if (agreementsMatch) {
      return `
This example customizes the \`Agreements\` slot to demonstrate using slot methods:

\`\`\`js
import { render as provider } from '${repoConfig.packageName}/render.js';
import ${containerName} from '${repoConfig.packageName}/containers/${containerName}.js';

provider.render(${containerName}, {
  slots: {
    Agreements: (ctx) => {
      // Use the appendAgreement method to add custom terms
      ctx.appendAgreement(() => ({
        name: 'privacy-policy',
        mode: 'manual',
        translationId: 'Checkout.PrivacyPolicy.label',
      }));
      
      // You can add multiple agreements
      ctx.appendAgreement(() => ({
        name: 'newsletter',
        mode: 'auto',
        text: 'I agree to receive marketing emails',
      }));
    }
  }
})(document.querySelector('.${containerKebab}'));
\`\`\`
`;
    }

    // Look for Actions slot with appendButton (Product Details drop-in)
    const actionsPattern = /Actions\??:\s*SlotProps<[^>]*appendButton[^>]*>/;
    const actionsMatch = slotsInterface.match(actionsPattern);

    if (actionsMatch) {
      return `
This example customizes the \`Actions\` slot to demonstrate using slot methods to add custom buttons:

\`\`\`js
import { render as provider } from '${repoConfig.packageName}/render.js';
import ${containerName} from '${repoConfig.packageName}/containers/${containerName}.js';

provider.render(${containerName}, {
  slots: {
    Actions: (ctx) => {
      // Use appendButton method to add custom action buttons
      ctx.appendButton({
        text: 'Add to Wishlist',
        icon: 'Heart',
        variant: 'secondary',
        onClick: () => {
          console.log('Added to wishlist');
        },
      });
      
      // Add another custom button
      ctx.appendButton({
        text: 'Compare',
        icon: 'Scale',
        variant: 'tertiary',
        onClick: () => {
          console.log('Added to compare');
        },
      });
    }
  }
})(document.querySelector('.${containerKebab}'));
\`\`\`
`;
    }

    // Look for Breadcrumbs slot with multiple methods (Product Details drop-in)
    const breadcrumbsPattern = /Breadcrumbs\??:\s*SlotProps<[^>]*appendLink[^>]*>/;
    const breadcrumbsMatch = slotsInterface.match(breadcrumbsPattern);

    if (breadcrumbsMatch) {
      return `
This example customizes the \`Breadcrumbs\` slot to demonstrate using multiple slot methods:

\`\`\`js
import { render as provider } from '${repoConfig.packageName}/render.js';
import ${containerName} from '${repoConfig.packageName}/containers/${containerName}.js';

provider.render(${containerName}, {
  slots: {
    Breadcrumbs: (ctx) => {
      // Set a custom separator
      ctx.setSeparator('ChevronRight');
      
      // Add custom breadcrumb links
      ctx.appendLink({
        text: 'Custom Category',
        href: '/category/custom',
      });
      
      ctx.appendLink({
        text: 'Subcategory',
        href: '/category/custom/sub',
      });
      
      // Add a custom HTML element
      const badge = document.createElement('span');
      badge.className = 'breadcrumb-badge';
      badge.textContent = 'New';
      ctx.appendHTMLElement(badge);
    }
  }
})(document.querySelector('.${containerKebab}'));
\`\`\`
`;
    }

    // Look for Footer slot in CartSummaryList (Cart drop-in - nested containers)
    // Check this before UndoBanner to prioritize the more complex example
    if (containerName === 'CartSummaryList') {
      const footerPattern = /Footer\??:\s*SlotProps/;
      const footerMatch = slotsInterface.match(footerPattern);

      if (footerMatch) {
        return `
This example customizes the \`Footer\` slot to demonstrate rendering multiple nested containers:

\`\`\`js
import { render as provider } from '@dropins/storefront-cart/render.js';
import CartSummaryList from '@dropins/storefront-cart/containers/CartSummaryList.js';
import GiftOptions from '@dropins/storefront-cart/containers/GiftOptions.js';
import { Button, Icon, provider as UI } from '@dropins/tools/components.js';

provider.render(CartSummaryList, {
  slots: {
    Footer: (ctx) => {
      // Render edit button for configurable items
      if (ctx.item?.itemType === 'ConfigurableCartItem') {
        const editLink = document.createElement('div');
        editLink.className = 'cart-item-edit-link';
        
        UI.render(Button, {
          children: 'Edit',
          variant: 'tertiary',
          size: 'medium',
          icon: Icon({ source: 'Edit' }),
          onClick: () => {
            console.log('Edit item:', ctx.item);
          },
        })(editLink);
        
        ctx.appendChild(editLink);
      }
      
      // Render nested GiftOptions container with its own slots
      const giftOptions = document.createElement('div');
      provider.render(GiftOptions, {
        item: ctx.item,
        view: 'product',
        dataSource: 'cart',
        handleItemsLoading: ctx.handleItemsLoading,
        handleItemsError: ctx.handleItemsError,
        onItemUpdate: ctx.onItemUpdate,
      })(giftOptions);
      
      ctx.appendChild(giftOptions);
    }
  }
})(document.querySelector('.cart-summary-list'));
\`\`\`
`;
      }
    }

    // Look for Footer slot in OrderProductList (Order drop-in - nested containers)
    if (containerName === 'OrderProductList') {
      const footerPattern = /Footer\??:\s*SlotProps/;
      const footerMatch = slotsInterface.match(footerPattern);

      if (footerMatch) {
        return `
This example customizes the \`Footer\` slot to demonstrate rendering nested containers from other drop-ins:

\`\`\`js
import { render as orderRenderer } from '@dropins/storefront-order/render.js';
import { OrderProductList } from '@dropins/storefront-order/containers/OrderProductList.js';
import GiftOptions from '@dropins/storefront-cart/containers/GiftOptions.js';
import { render as CartProvider } from '@dropins/storefront-cart/render.js';

orderRenderer.render(OrderProductList, {
  slots: {
    Footer: (ctx) => {
      // Render GiftOptions from Cart drop-in with order data source
      const giftOptions = document.createElement('div');
      
      CartProvider.render(GiftOptions, {
        item: ctx.item,
        view: 'product',
        dataSource: 'order',
        isEditable: false,
      })(giftOptions);
      
      ctx.appendChild(giftOptions);
    }
  }
})(document.querySelector('.order-product-list'));
\`\`\`
`;
      }
    }

    // Look for Footer slot in ProductList (Recommendations drop-in - conditional rendering with events)
    if (containerName === 'ProductList' && repoConfig.packageName === '@dropins/storefront-recommendations') {
      const footerPattern = /Footer\??:\s*SlotProps/;
      const footerMatch = slotsInterface.match(footerPattern);

      if (footerMatch) {
        return `
This example customizes the \`Footer\` slot to demonstrate conditional rendering and event publishing:

\`\`\`js
import { render as provider } from '@dropins/storefront-recommendations/render.js';
import ProductList from '@dropins/storefront-recommendations/containers/ProductList.js';
import { Button, Icon, provider as UI } from '@dropins/tools/components.js';
import * as cartApi from '@dropins/storefront-cart/api.js';
import { publishRecsItemAddToCartClick } from '@dropins/storefront-recommendations/api.js';

provider.render(ProductList, {
  routeProduct: (item) => \`/products/\${item.urlKey}\`,
  recId: 'product-recs',
  currentSku: 'MT01',
  slots: {
    Footer: (ctx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'footer__wrapper';
      
      const addToCart = document.createElement('div');
      addToCart.className = 'footer__button--add-to-cart';
      wrapper.appendChild(addToCart);
      
      // Conditional rendering based on product type
      if (ctx.item.itemType === 'SimpleProductView') {
        // Simple product - show add to cart button
        UI.render(Button, {
          children: 'Add to Cart',
          icon: Icon({ source: 'Cart' }),
          onClick: (event) => {
            // Add to cart
            cartApi.addProductsToCart([
              { sku: ctx.item.sku, quantity: 1 }
            ]);
            
            // Stop event propagation to prevent parent click handlers
            event.stopPropagation();
            
            // Publish analytics event
            publishRecsItemAddToCartClick({
              recommendationUnit: ctx.recommendationUnit,
              pagePlacement: 'product-list',
              yOffsetTop: addToCart.getBoundingClientRect().top ?? 0,
              yOffsetBottom: addToCart.getBoundingClientRect().bottom ?? 0,
              productId: ctx.index,
            });
          },
          variant: 'primary',
        })(addToCart);
      } else {
        // Complex product - show select options button
        UI.render(Button, {
          children: 'Select Options',
          href: \`/products/\${ctx.item.urlKey}\`,
          variant: 'tertiary',
        })(addToCart);
      }
      
      ctx.replaceWith(wrapper);
    }
  }
})(document.querySelector('.recommendations'));
\`\`\`
`;
      }
    }

    // Look for ProductActions slot (Product Discovery drop-in - action wrappers)
    if (containerName === 'SearchResults') {
      const productActionsPattern = /ProductActions\??:\s*SlotProps/;
      const productActionsMatch = slotsInterface.match(productActionsPattern);

      if (productActionsMatch) {
        return `
This example customizes the \`ProductActions\` slot to demonstrate building action wrappers with multiple components:

\`\`\`js
import { render as provider } from '@dropins/storefront-product-discovery/render.js';
import SearchResults from '@dropins/storefront-product-discovery/containers/SearchResults.js';
import { Button, Icon, provider as UI } from '@dropins/tools/components.js';
import * as cartApi from '@dropins/storefront-cart/api.js';
import { WishlistToggle } from '@dropins/storefront-wishlist/containers/WishlistToggle.js';
import { render as wishlistRender } from '@dropins/storefront-wishlist/render.js';

provider.render(SearchResults, {
  routeProduct: (product) => \`/products/\${product.urlKey}\`,
  slots: {
    ProductActions: (ctx) => {
      // Create wrapper for multiple actions
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'product-discovery-product-actions';
      
      // Add to cart button (conditional based on product type)
      const addToCartBtn = document.createElement('div');
      addToCartBtn.className = 'product-discovery-product-actions__add-to-cart';
      
      if (ctx.product.typename === 'ComplexProductView') {
        UI.render(Button, {
          children: 'Select Options',
          icon: Icon({ source: 'Cart' }),
          href: \`/products/\${ctx.product.urlKey}\`,
          variant: 'primary',
        })(addToCartBtn);
      } else {
        UI.render(Button, {
          children: 'Add to Cart',
          icon: Icon({ source: 'Cart' }),
          onClick: () => cartApi.addProductsToCart([
            { sku: ctx.product.sku, quantity: 1 }
          ]),
          variant: 'primary',
        })(addToCartBtn);
      }
      
      // Wishlist toggle from another drop-in
      const wishlistToggle = document.createElement('div');
      wishlistToggle.className = 'product-discovery-product-actions__wishlist-toggle';
      
      wishlistRender.render(WishlistToggle, {
        product: ctx.product,
        variant: 'tertiary',
      })(wishlistToggle);
      
      // Assemble the wrapper
      actionsWrapper.appendChild(addToCartBtn);
      actionsWrapper.appendChild(wishlistToggle);
      
      ctx.replaceWith(actionsWrapper);
    }
  }
})(document.querySelector('.search-results'));
\`\`\`
`;
      }
    }

    // Look for SuccessNotificationActions slot (User Auth drop-in - nested actions)
    if (containerName === 'SuccessNotification') {
      const successNotificationActionsPattern = /SuccessNotificationActions\??:\s*SlotProps/;
      const successNotificationActionsMatch = slotsInterface.match(successNotificationActionsPattern);

      if (successNotificationActionsMatch) {
        return `
This example customizes the \`SuccessNotificationActions\` slot to demonstrate rendering custom action buttons:

\`\`\`js
import { render as authRenderer } from '@dropins/storefront-auth/render.js';
import { SuccessNotification } from '@dropins/storefront-auth/containers/SuccessNotification.js';
import { Button, provider as UI } from '@dropins/tools/components.js';

authRenderer.render(SuccessNotification, {
  labels: {
    headingText: 'Success!',
    messageText: 'Your account has been updated.',
  },
  slots: {
    SuccessNotificationActions: (ctx) => {
      // Primary action button
      const primaryBtn = document.createElement('div');
      UI.render(Button, {
        children: 'My Account',
        onClick: () => {
          window.location.href = '/customer/account';
        },
      })(primaryBtn);
      ctx.appendChild(primaryBtn);
      
      // Secondary action button with custom styling
      const secondaryBtn = document.createElement('div');
      secondaryBtn.style.display = 'flex';
      secondaryBtn.style.justifyContent = 'center';
      secondaryBtn.style.marginTop = 'var(--spacing-xsmall)';
      
      UI.render(Button, {
        children: 'Continue Shopping',
        variant: 'tertiary',
        onClick: () => {
          window.location.href = '/';
        },
      })(secondaryBtn);
      ctx.appendChild(secondaryBtn);
    },
  },
})(document.querySelector('.success-notification'));
\`\`\`
`;
      }
    }

    // Look for SuccessNotification slot in SignIn (User Auth drop-in - nested container rendering)
    if (containerName === 'SignIn') {
      const successNotificationPattern = /SuccessNotification\??:\s*SlotProps/;
      const successNotificationMatch = slotsInterface.match(successNotificationPattern);

      if (successNotificationMatch) {
        return `
This example customizes the \`SuccessNotification\` slot to demonstrate rendering a nested container with its own slots:

\`\`\`js
import { render as authRenderer } from '@dropins/storefront-auth/render.js';
import { SignIn } from '@dropins/storefront-auth/containers/SignIn.js';
import { SuccessNotification } from '@dropins/storefront-auth/containers/SuccessNotification.js';
import { Button, provider as UI } from '@dropins/tools/components.js';

authRenderer.render(SignIn, {
  slots: {
    SuccessNotification: (ctx) => {
      const elem = document.createElement('div');
      
      // Render nested SuccessNotification container with its own slots
      authRenderer.render(SuccessNotification, {
        labels: {
          headingText: 'Welcome back!',
          messageText: 'You have successfully signed in.',
        },
        slots: {
          SuccessNotificationActions: (innerCtx) => {
            const primaryBtn = document.createElement('div');
            UI.render(Button, {
              children: 'My Account',
              onClick: () => {
                window.location.href = '/customer/account';
              },
            })(primaryBtn);
            innerCtx.appendChild(primaryBtn);
            
            const secondaryBtn = document.createElement('div');
            secondaryBtn.style.marginTop = 'var(--spacing-xsmall)';
            
            UI.render(Button, {
              children: 'Continue Shopping',
              variant: 'tertiary',
              onClick: () => {
                window.location.href = '/';
              },
            })(secondaryBtn);
            innerCtx.appendChild(secondaryBtn);
          },
        },
      })(elem);
      
      ctx.appendChild(elem);
    },
  },
})(document.querySelector('.sign-in'));
\`\`\`
`;
      }
    }

    // Look for UndoBanner slot (Cart drop-in) - fallback if Footer wasn't matched
    const undoBannerPattern = /UndoBanner\??:\s*SlotProps<\{[^}]*onUndo[^}]*onDismiss[^}]*\}>/;
    const undoBannerMatch = slotsInterface.match(undoBannerPattern);

    if (undoBannerMatch) {
      return `
This example customizes the \`UndoBanner\` slot to demonstrate handling callbacks and state:

\`\`\`js
import { render as provider } from '${repoConfig.packageName}/render.js';
import ${containerName} from '${repoConfig.packageName}/containers/${containerName}.js';

provider.render(${containerName}, {
  slots: {
    UndoBanner: (ctx) => {
      const { item, loading, error, onUndo, onDismiss } = ctx;
      
      const banner = document.createElement('div');
      banner.className = '${containerKebab}__undo-banner';
      
      // Show loading state
      if (loading) {
        banner.textContent = 'Processing...';
        ctx.appendChild(banner);
        return;
      }
      
      // Display item name
      const message = document.createElement('p');
      message.textContent = \`Removed \${item.name}\`;
      banner.appendChild(message);
      
      // Show error if present
      if (error) {
        const errorText = document.createElement('span');
        errorText.className = '${containerKebab}__undo-banner-error';
        errorText.textContent = error;
        banner.appendChild(errorText);
      }
      
      // Wire up undo callback
      const undoBtn = document.createElement('button');
      undoBtn.textContent = 'Undo';
      undoBtn.onclick = onUndo;
      banner.appendChild(undoBtn);
      
      // Wire up dismiss callback
      const dismissBtn = document.createElement('button');
      dismissBtn.textContent = 'Dismiss';
      dismissBtn.onclick = onDismiss;
      banner.appendChild(dismissBtn);
      
      ctx.appendChild(banner);
    }
  }
})(document.querySelector('.${containerKebab}'));
\`\`\`
`;
    }
  }

  return null; // No complex slot found
}

/**
 * Generate slots MDX documentation
 * 
 * @param {string} repoName - Drop-in name
 * @param {Object} repoConfig - Repository configuration
 * @param {Array} containers - Array of containers with slots
 * @param {Object} versionInfo - Version information object with requested, actual, isExactMatch
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateSlotsMDX(repoName, repoConfig, containers, versionInfo, enrichmentData = null) {
  // Handle versionInfo object or string
  const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
  const template = readTemplate('dropin-slots.mdx');

  // Get repo path for HTML and JSDoc extraction
  const repoPath = join(projectRoot, '.temp-repos', repoName);

  // Generate summary table and detailed content
  // Note: We no longer generate top-level examples since each slot has its own example
  const summaryTable = generateSummaryTable(containers);
  const slotsContent = generateSlotsContent(containers, repoConfig, repoPath);

  // Generate intro text based on whether slots exist
  let introText;
  if (containers.length === 0) {
    // All no-slot dropins get the "Why no slots?" heading
    const baseIntro = `The ${repoConfig.displayName} drop-in does not expose any slots for customization.\n\n## Why no slots?`;

    // Add specific explanation based on the dropin
    if (repoConfig.packageName === '@dropins/storefront-payment-services') {
      introText = `${baseIntro}\n\nThis drop-in wraps the Adobe Payment Services SDK (\`@adobe-commerce/payment-services-sdk\`), which renders secure payment forms directly into specified DOM elements. The SDK controls all UI rendering to maintain PCI (Payment Card Industry) compliance and security standards. You customize the payment forms through SDK configuration options (field placeholders, card type settings, callback handlers) passed to \`sdk.Payment.CreditCard.render()\`, not through the slot-based pattern other drop-ins use.`;
    } else {
      // Generic explanation for other dropins without slots
      introText = `${baseIntro}\n\nThis drop-in provides functionality through API methods and configuration options rather than UI customization points. Slots may be added in future versions as the drop-in's feature set expands.`;
    }
  } else {
    // Count total slots across all containers
    const totalSlots = containers.reduce((total, container) => {
      const slotPattern = /(\w+)\??\s*:\s*SlotProps/g;
      const matches = container.slotsInterface.match(slotPattern);
      return total + (matches ? matches.length : 0);
    }, 0);

    // Brief, focused intro for drop-ins with slots
    const containerCount = containers.length;
    const containerWord = containerCount === 1 ? 'container' : 'containers';
    const slotWord = totalSlots === 1 ? 'slot' : 'slots';
    introText = `The ${repoConfig.displayName} drop-in exposes **${totalSlots} ${slotWord}** in **${containerCount} ${containerWord}** for customizing specific UI sections. Use slots to replace or extend container components. For default properties available to all slots, see [Extending drop-in components](/dropins/all/extending/).`;
  }

  // Replace placeholders
  return replacePlaceholders(template, {
    'DROPIN_NAME': repoConfig.displayName,
    'DROPIN_PACKAGE': repoConfig.packageName,
    'DROPIN_VERSION': cleanVersion(versionInfo.requested),
    'INTRO_TEXT': introText,
    'SUMMARY_TABLE': summaryTable,
    'SIMPLE_EXAMPLE': '', // Removed - each slot now has its own example
    'COMPLEX_EXAMPLE': '', // Removed - each slot now has its own example
    'SLOTS_CONTENT': slotsContent,
    'REPO_URL': repoConfig.gitUrl.replace('.git', ''),
    'CONTAINER_COUNT': containers.length.toString()
  });
}

// ============================================================================
// FRAMEWORK INTEGRATION
// ============================================================================

runGenerator({
  name: 'Slot',
  itemType: 'slots',
  loadEnrichments: loadSlotEnrichments,
  scanRepo: scanForSlots,
  generateContent: generateSlotsMDX,
  updateSidebar: updateSidebarForSlots,
  outputFileName: 'slots.mdx'
});
