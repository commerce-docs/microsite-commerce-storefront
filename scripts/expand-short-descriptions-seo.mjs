/**
 * Expands Starlight frontmatter `description` fields that are shorter than MIN_LEN
 * characters for the storefront SEO "Short Descriptions" URL set (Experience League crawl).
 *
 * Run: node scripts/expand-short-descriptions-seo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'src', 'content', 'docs');
const MIN_LEN = 118;

/** Relative paths under src/content/docs (matches published URL slugs). */
const FILES = [
  'dropins/all/labeling.mdx',
  'dropins/all/layouts.mdx',
  'dropins/cart/containers/cart-summary-grid.mdx',
  'dropins/cart/containers/cart-summary-list.mdx',
  'dropins/cart/containers/cart-summary-table.mdx',
  'dropins/cart/containers/coupons.mdx',
  'dropins/cart/containers/empty-cart.mdx',
  'dropins/cart/containers/gift-cards.mdx',
  'dropins/cart/containers/gift-options.mdx',
  'dropins/cart/containers/mini-cart.mdx',
  'dropins/cart/containers/order-summary.mdx',
  'dropins/cart/containers/order-summary-line.mdx',
  'dropins/cart/tutorials/gift-options.mdx',
  'dropins/order/containers/create-return.mdx',
  'dropins/order/containers/customer-details.mdx',
  'dropins/order/containers/order-cancel-form.mdx',
  'dropins/order/containers/order-cost-summary.mdx',
  'dropins/order/containers/order-product-list.mdx',
  'dropins/order/containers/order-returns.mdx',
  'dropins/order/containers/order-search.mdx',
  'dropins/order/containers/returns-list.mdx',
  'dropins/order/containers/shipping-status.mdx',
  'dropins/user-account/containers/addresses.mdx',
  'dropins/user-account/containers/address-form.mdx',
  'dropins/user-account/containers/customer-information.mdx',
  'dropins/user-account/containers/orders-list.mdx',
  'dropins/user-auth/containers/auth-combine.mdx',
  'dropins/user-auth/containers/reset-password.mdx',
  'dropins/user-auth/containers/update-password.mdx',
  'dropins/wishlist/containers/wishlist.mdx',
  'dropins/wishlist/containers/wishlist-alert.mdx',
  'dropins/wishlist/containers/wishlist-item.mdx',
  'dropins/wishlist/containers/wishlist-toggle.mdx',
  'dropins/recommendations/containers/product-list.mdx',
  'merchants/content-customizations/enrichment.mdx',
  'sdk/components/alertbanner.mdx',
  'sdk/components/breadcrumbs.mdx',
  'sdk/components/button.mdx',
  'sdk/components/card.mdx',
  'sdk/components/header.mdx',
  'sdk/components/inputdate.mdx',
  'sdk/components/inputfile.mdx',
  'sdk/components/modal.mdx',
  'sdk/components/overview.mdx',
  'sdk/components/portal.mdx',
  'sdk/components/skeleton.mdx',
  'sdk/components/tag.mdx',
  'sdk/components/textarea.mdx',
  'sdk/design/index.mdx',
  'sdk/design/grid.mdx',
  'sdk/get-started/cli.mdx',
  'sdk/reference/index.mdx',
  'sdk/reference/events.mdx',
  'sdk/reference/render.mdx',
  'sdk/reference/vcomponent.mdx',
  'sdk/utilities/index.mdx',
  'sdk/utilities/debounce.mdx',
  'sdk/utilities/getCookie.mdx',
  'sdk/utilities/getFormErrors.mdx',
  'sdk/utilities/getPathValue.mdx',
];

const SPECIAL = {
  'dropins/all/labeling.mdx':
    'Learn how to localize and relabel Adobe Commerce drop-in components using placeholder files, dictionary overrides, and merchant-friendly workflows on your storefront.',
  'dropins/all/layouts.mdx':
    'Learn how to configure HTML layouts for Commerce drop-in blocks on Edge Delivery Services so containers appear in the right order on product and category pages.',
  'sdk/design/index.mdx':
    'Explore the Adobe Base design system for storefront SDK work, including tokens for color, typography, spacing, shapes, and grids that keep drop-in UIs consistent.',
  'sdk/reference/index.mdx':
    'Browse core Storefront SDK reference topics for Adobe Commerce drop-ins, including events, initialization, rendering, GraphQL helpers, links, and reCAPTCHA integration.',
  'sdk/utilities/index.mdx':
    'Browse helper utilities for the Adobe Commerce Storefront SDK, including DOM helpers, debounce, cookies, form values, deep merge, and other common integration tasks.',
  'merchants/content-customizations/enrichment.mdx':
    'Learn how to enrich Adobe Commerce storefront pages on Edge Delivery Services with targeted blocks, promotions, and contextual content using enrichment metadata and authoring patterns.',
  'sdk/get-started/cli.mdx':
    'Learn how to install and use the Elsie CLI to scaffold, build, and maintain Adobe Commerce drop-in components and storefront packages from your terminal.',
  'sdk/design/grid.mdx':
    'Use the Base design system grid for Adobe Commerce storefront layouts, including breakpoints, columns, and spacing tokens that align SDK components with your page structure.',
  'sdk/reference/events.mdx':
    'Use the Storefront SDK event bus to communicate between Adobe Commerce drop-in packages, subscribe to lifecycle events, and keep cart, checkout, and PDP flows in sync.',
  'sdk/reference/render.mdx':
    'Render Adobe Commerce Storefront SDK components to the DOM or as HTML strings, including patterns for mounting drop-ins and integrating with your host application.',
  'sdk/reference/vcomponent.mdx':
    'Understand the VComponent wrapper for dynamic rendering in the Adobe Commerce Storefront SDK when you need flexible VNode trees inside drop-in containers.',
  'sdk/utilities/getCookie.mdx':
    'Read browser cookie values by name in the Adobe Commerce Storefront SDK so cart, auth, and session helpers can share lightweight client-side state.',
  'sdk/utilities/getPathValue.mdx':
    'Read nested values from plain objects and form state using dot-path strings in the Adobe Commerce Storefront SDK for configuration and form payloads.',
};

function dropinName(rel) {
  const parts = rel.split('/');
  if (rel.startsWith('dropins/') && parts.length >= 2 && parts[1] !== 'all') {
    return parts[1].replace(/-/g, ' ');
  }
  if (rel.startsWith('dropins-b2b')) return 'B2B';
  if (rel.startsWith('merchants/')) return 'Commerce storefront';
  if (rel.startsWith('sdk/')) return 'Storefront SDK';
  return 'storefront';
}

function expand(rel, desc) {
  if (desc.length >= MIN_LEN) return null;
  if (SPECIAL[rel]) return SPECIAL[rel];
  if (desc.startsWith('Learn about the ') && desc.toLowerCase().includes('container')) {
    const inner = desc.slice('Learn about the '.length).replace(/\.$/, '');
    const dn = dropinName(rel);
    return `Learn about the ${inner} in the Adobe Commerce ${dn} drop-in documentation, including configuration options, props, and practical integration guidance for your storefront.`;
  }
  if (desc.startsWith('Learn how to add gift options')) {
    return `${desc} Follow this Adobe Commerce Cart tutorial to connect gift options on the PDP and cart summary using drop-in configuration and slots.`;
  }
  if (desc === 'How to localize your drop-in components.') {
    return SPECIAL['dropins/all/labeling.mdx'];
  }
  if (desc.startsWith('Use ') && !desc.includes('Storefront SDK')) {
    return `${desc} This Adobe Commerce Storefront SDK component page explains props, anatomy, and Storybook-driven examples you can reuse in drop-in projects.`;
  }
  if (desc.startsWith('This page describes debounce')) {
    return 'Use the debounce utility in the Adobe Commerce Storefront SDK to limit how often a function runs so cart, search, and PDP handlers stay responsive under rapid user input.';
  }
  if (desc.includes('Get a value from an object')) {
    return 'Read nested values from plain objects and form state using path strings in the Adobe Commerce Storefront SDK, with related helpers for cookies and structured configuration data.';
  }
  if (desc.startsWith('Returns every form error')) {
    return 'Collect every validation error from an HTML form element in the Adobe Commerce Storefront SDK so you can show inline messages during checkout and account registration.';
  }
  if (desc.includes('Overview of the shared')) {
    return 'Overview of shared Adobe Commerce Storefront SDK components, including inputs, layout primitives, and patterns used across Cart, Checkout, and PDP drop-ins.';
  }
  if (desc.startsWith('Event Bus')) {
    return SPECIAL['sdk/reference/events.mdx'];
  }
  if (desc.startsWith('Render your component')) {
    return SPECIAL['sdk/reference/render.mdx'];
  }
  if (desc.startsWith('Grid system')) {
    return SPECIAL['sdk/design/grid.mdx'];
  }
  if (desc.startsWith('Learn how to configure commerce block layouts')) {
    return SPECIAL['dropins/all/layouts.mdx'];
  }
  if (desc.startsWith('Learn how to enrich')) {
    return SPECIAL['merchants/content-customizations/enrichment.mdx'];
  }
  return null;
}

function main() {
  let updated = 0;
  let skipped = 0;
  for (const rel of FILES) {
    const filePath = path.join(ROOT, rel);
    if (!fs.existsSync(filePath)) {
      console.warn('missing file:', rel);
      skipped++;
      continue;
    }
    let text = fs.readFileSync(filePath, 'utf8');
    const m = text.match(/^---\n([\s\S]*?)\n---/);
    if (!m) {
      skipped++;
      continue;
    }
    const fm = m[1];
    const dm = fm.match(/^description:\s*(.+)$/m);
    if (!dm) {
      skipped++;
      continue;
    }
    const oldLine = dm[0];
    const desc = dm[1].trim();
    if (desc.startsWith('"') || desc.startsWith("'")) {
      skipped++;
      continue;
    }
    const newDesc = expand(rel, desc);
    if (!newDesc) {
      skipped++;
      continue;
    }
    const newFm = fm.replace(oldLine, `description: ${newDesc}`, 1);
    const newText = `---\n${newFm}\n---${text.slice(m[0].length)}`;
    fs.writeFileSync(filePath, newText, 'utf8');
    updated++;
  }
  console.log(`expand-short-descriptions-seo: updated ${updated} files, skipped ${skipped}`);
}

main();
