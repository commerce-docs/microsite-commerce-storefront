#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, relative, resolve, normalize } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const DOCS_DIR = join(projectRoot, 'src/content/docs');
const DOCS_ROOT = DOCS_DIR;
const OUTPUT_FULL = join(projectRoot, 'public/llms-full.txt');
const OUTPUT_SMALL = join(projectRoot, 'public/llms-small.txt');
const OUTPUT_LLMSTXT = join(projectRoot, 'public/llms.txt');
const OUTPUT_LLMS_TXT_DIR = join(projectRoot, 'public/_llms-txt');
const PRODUCTION_BASE_URL = 'https://experienceleague.adobe.com/developer/commerce/storefront';

/**
 * Thematic bundles (paths relative to src/content/docs, no extension).
 * Filters are mutually exclusive except where noted; together they cover all doc pages.
 */
const LLMS_TXT_BUNDLES = [
  {
    slug: 'documentation-home',
    label: 'Documentation home',
    blurb: 'Top-level documentation landing content',
    filter: p => p === 'index'
  },
  {
    slug: 'get-started',
    label: 'Get started',
    blurb: 'Onboarding, architecture, performance, and Lighthouse for Commerce storefront projects',
    filter: p => p.startsWith('get-started/')
  },
  {
    slug: 'boilerplate',
    label: 'Boilerplate',
    blurb: 'Boilerplate template, blocks reference, configuration, and Universal Editor',
    filter: p => p.startsWith('boilerplate/')
  },
  {
    slug: 'how-tos',
    label: 'How-tos',
    blurb: 'Task-focused how-to guides',
    filter: p => p.startsWith('how-tos/')
  },
  {
    slug: 'licensing',
    label: 'Licensing',
    blurb: 'Licensing and legal agreements',
    filter: p => p.startsWith('licensing/')
  },
  {
    slug: 'setup-reference',
    label: 'Setup and configuration',
    blurb: 'Discovery, configuration, SEO, launch, analytics, and compatibility',
    filter: p => p.startsWith('setup/')
  },
  {
    slug: 'dropins-reference',
    label: 'Drop-ins reference',
    blurb: 'Drop-in components, containers, APIs, and guides (excludes step-by-step tutorials)',
    filter: p =>
      (p.startsWith('dropins/') || p.startsWith('dropins-b2b/')) && !p.includes('/tutorials/')
  },
  {
    slug: 'tutorials-reference',
    label: 'Tutorials',
    blurb: 'Step-by-step tutorials under drop-ins (cart, checkout, order, account, product details)',
    filter: p => p.includes('/tutorials/')
  },
  {
    slug: 'blocks-reference',
    label: 'Commerce blocks reference',
    blurb: 'Edge Delivery blocks for commerce (placeholders, slots, and block-level documentation)',
    filter: p => p.startsWith('merchants/blocks/')
  },
  {
    slug: 'merchants-authoring',
    label: 'Merchants and authoring',
    blurb: 'Quick start, content, localization, storefront builder, and content customizations (excluding block reference pages)',
    filter: p => p.startsWith('merchants/') && !p.startsWith('merchants/blocks/')
  },
  {
    slug: 'sdk-reference',
    label: 'Storefront SDK',
    blurb: 'SDK components, patterns, and integration',
    filter: p => p.startsWith('sdk/')
  },
  {
    slug: 'videos',
    label: 'Videos',
    blurb: 'Training videos and related notes',
    filter: p => p.startsWith('videos/')
  },
  {
    slug: 'releases',
    label: 'Releases',
    blurb: 'Release notes, changelog, and hotfixes',
    filter: p => p.startsWith('releases/')
  },
  {
    slug: 'troubleshooting',
    label: 'Troubleshooting',
    blurb: 'FAQ and operational troubleshooting',
    filter: p => p.startsWith('troubleshooting/')
  },
  {
    slug: 'resources',
    label: 'Resources',
    blurb: 'Placeholders, building with AI (context files), and supplementary resources',
    filter: p => p.startsWith('resources/')
  },
  {
    slug: 'playgrounds',
    label: 'Playgrounds',
    blurb: 'Interactive playground documentation',
    filter: p => p.startsWith('playgrounds/')
  }
];

function shouldAddTrailingSlash(urlPath) {
  if (urlPath.includes('#')) {
    return false;
  }
  const lastSegment = urlPath.split('/').pop() || '';
  if (lastSegment.includes('.')) {
    return false;
  }
  return !urlPath.endsWith('/');
}

/** Paths relative to src/content/docs (no extension) excluded from the abridged bundle */
function isExcludedFromSmall(relativePath) {
  return relativePath === 'releases/changelog';
}

// --- Frontmatter ---

function removeFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  return content.replace(frontmatterRegex, '');
}

function extractTitle(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatter = match[1];
    const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim().replace(/['"]/g, '');
    }
  }

  return null;
}

function removeImports(content) {
  let result = content.replace(/^import\s+.*?from\s+['"].*?['"];?\r?\n/gm, '');
  result = result.replace(/^import\s+\{[^}]*\}\s+from\s+['"].*?['"];?\r?\n/gm, '');
  result = result.replace(/^import\s+.*?;?\r?\n/gm, '');
  return result;
}

// --- Preserve human-visible content from MDX components (before generic stripping) ---

/** Starlight <Code code={`...`} /> → fenced block (keeps YAML/code shown to readers). */
function expandCodeComponents(content) {
  const marker = 'code={`';
  let result = content;
  let searchPos = 0;

  while (true) {
    const codeTag = result.indexOf('<Code', searchPos);
    if (codeTag === -1) {
      break;
    }
    const propIdx = result.indexOf(marker, codeTag);
    if (propIdx === -1 || propIdx > codeTag + 400) {
      searchPos = codeTag + 5;
      continue;
    }
    const innerStart = propIdx + marker.length;
    const innerEnd = result.indexOf('`}', innerStart);
    if (innerEnd === -1) {
      searchPos = codeTag + 5;
      continue;
    }
    const codeBody = result.slice(innerStart, innerEnd);
    const afterTemplate = innerEnd + 2;
    const closeIdx = result.indexOf('/>', afterTemplate);
    if (closeIdx === -1) {
      break;
    }
    const attrRegion = result.slice(afterTemplate, closeIdx);
    const langMatch = attrRegion.match(/\blang=["']([^"']*)["']/);
    const titleMatch = attrRegion.match(/\btitle=["']([^"']*)["']/);
    const lang = langMatch ? langMatch[1] : 'text';
    const title = titleMatch ? titleMatch[1] : '';
    const titleLine = title ? `### ${title}\n\n` : '';
    const replacement = `\n\n${titleLine}\`\`\`${lang}\n${codeBody}\n\`\`\`\n\n`;
    result = result.slice(0, codeTag) + replacement + result.slice(closeIdx + 2);
    searchPos = codeTag + replacement.length;
  }

  return result;
}

/** LinkCard props → markdown line (links resolved later). */
function expandLinkCards(content) {
  return content.replace(/<LinkCard\b([\s\S]*?)\/>/g, (full, attrs) => {
    const title = (attrs.match(/\btitle=["']([^"']*)["']/) || [])[1] || '';
    const description = (attrs.match(/\bdescription=["']([^"']*)["']/) || [])[1] || '';
    const link = (attrs.match(/\blink=["']([^"']*)["']/) || [])[1] || '';
    if (link && title) {
      const desc = description ? ` — ${description}` : '';
      return `\n\n- [${title}](${link})${desc}\n\n`;
    }
    const parts = [title && `**${title}**`, description].filter(Boolean);
    return parts.length ? `\n\n${parts.join(' — ')}\n\n` : '\n\n';
  });
}

/** OptionsTable options={[...]} → fenced text so table data is not lost. */
function expandOptionsTable(content) {
  return content.replace(/<OptionsTable\b([\s\S]*?)\/>/g, full => {
    const start = full.indexOf('options={');
    if (start === -1) {
      return '\n\n*[Options table: see live documentation for full grid]*\n\n';
    }
    let pos = start + 'options={'.length;
    if (full[pos] !== '[') {
      return '\n\n*[Options table: see live documentation for full grid]*\n\n';
    }
    let depth = 0;
    const arrStart = pos;
    for (; pos < full.length; pos++) {
      const c = full[pos];
      if (c === '[') {
        depth++;
      } else if (c === ']') {
        depth--;
        if (depth === 0) {
          const arr = full.slice(arrStart, pos + 1);
          return `\n\n\`\`\`text\n${arr}\n\`\`\`\n\n`;
        }
      }
    }
    return '\n\n*[Options table: see live documentation for full grid]*\n\n';
  });
}

function expandBadgeEmbedChecklist(content) {
  let result = content.replace(/<Badge\b([^/]*?)\/>/g, (full, attrs) => {
    const text = (attrs.match(/\btext=["']([^"']*)["']/) || [])[1] || '';
    const tooltip = (attrs.match(/\btooltip=["']([^"']*)["']/) || [])[1] || '';
    let s = '';
    if (text) {
      s += `\n\n*(Badge: ${text})*`;
    }
    if (tooltip) {
      s += ` _(${tooltip})_`;
    }
    return s ? `${s}\n\n` : '\n\n';
  });

  result = result.replace(/<Embed\b([^/]*?)\/>/g, (full, attrs) => {
    const src = (attrs.match(/\bsrc=["']([^"']*)["']/) || [])[1] || '';
    return src ? `\n\n**Embedded content:** ${src}\n\n` : '\n\n';
  });

  result = result.replace(/<Checklist\b([^/]*?)\/>/g, (full, attrs) => {
    const key = (attrs.match(/\bchecklistKey=["']([^"']*)["']/) || [])[1] || '';
    return key ? `\n\n*(Interactive checklist: ${key})*\n\n` : `\n\n*(Interactive checklist)*\n\n`;
  });

  return result;
}

function expandToolsAemLiveNote(content) {
  return content.replace(
    /<ToolsAemLiveNote\b[^/]*\/>/g,
    '\n\n*(AEM Live tools note — see the full documentation site for the complete callout.)*\n\n'
  );
}

function expandVisualMdxContent(content) {
  let result = expandCodeComponents(content);
  result = expandLinkCards(result);
  result = expandOptionsTable(result);
  result = expandBadgeEmbedChecklist(result);
  result = expandToolsAemLiveNote(result);
  return result;
}

// --- Links ---

function resolveMarkdownLinkTarget(link, sourceFilePath) {
  const hashIndex = link.indexOf('#');
  const pathPart = hashIndex >= 0 ? link.slice(0, hashIndex) : link;
  const hash = hashIndex >= 0 ? link.slice(hashIndex) : '';

  const p = pathPart.trim();
  if (!p) {
    return link;
  }

  if (/^mailto:/i.test(p) || /^javascript:/i.test(p)) {
    return link;
  }

  if (p.startsWith('@images/')) {
    const rest = p.slice('@images/'.length);
    const urlPath = `/images/${rest}`;
    const slash = shouldAddTrailingSlash(urlPath) ? '/' : '';
    return `${PRODUCTION_BASE_URL}${urlPath}${slash}${hash}`;
  }

  if (p.startsWith('/')) {
    let abs = p.replace(/\.mdx?$/, '');
    if (shouldAddTrailingSlash(abs)) {
      abs += '/';
    }
    return `${PRODUCTION_BASE_URL}${abs}${hash}`;
  }

  const resolved = normalize(resolve(dirname(sourceFilePath), p));
  const rel = relative(DOCS_ROOT, resolved);
  if (rel.startsWith('..')) {
    return link;
  }

  let urlPath = '/' + rel.replace(/\\/g, '/').replace(/\.mdx?$/, '');
  if (shouldAddTrailingSlash(urlPath)) {
    urlPath += '/';
  }
  return `${PRODUCTION_BASE_URL}${urlPath}${hash}`;
}

function convertLinks(content, filePath) {
  const relativeLinkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g;

  return content.replace(relativeLinkRegex, (match, text, link) => {
    const trimmed = link.trim();
    const absoluteLink = resolveMarkdownLinkTarget(trimmed, filePath);
    return `[${text}](${absoluteLink})`;
  });
}

function convertLinkComponentsToMarkdown(content) {
  let result = content;
  let prev;
  do {
    prev = result;
    result = result.replace(
      /<Link\s+href=["']([^"']*)["']\s+text=["']([^"']*)["'][^/]*\/>/g,
      '[$2]($1)'
    );
  } while (result !== prev);
  return result;
}

// --- MDX / HTML cleanup ---

function unwrapAsideBlocks(content) {
  return content.replace(/<Aside([^>]*)>([\s\S]*?)<\/Aside>/g, (match, attrs, body) => {
    const titleMatch = attrs.match(/title=["']([^"']*)["']/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const inner = body.trim();
    if (title) {
      return `\n\n> **${title}** ${inner}\n\n`;
    }
    return `\n\n> ${inner}\n\n`;
  });
}

/** Inner tags first (typical nesting). Aside handled separately. */
const PAIRED_TAG_ORDER = [
  'Option',
  'Options',
  'TabItem',
  'Step',
  'Task',
  'Tabs',
  'Steps',
  'Tasks',
  'CardGrid',
  'Diagram',
  'Callouts',
  'TableWrapper',
  'StarlightPage',
  'Card',
  'Note',
  'LinkCard',
];

function stripPairedCustomTags(content) {
  let result = content;
  for (let round = 0; round < 30; round++) {
    let changed = false;
    for (const tag of PAIRED_TAG_ORDER) {
      const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');
      const next = result.replace(re, '$1');
      if (next !== result) {
        changed = true;
      }
      result = next;
    }
    if (!changed) {
      break;
    }
  }
  return result;
}

function removeSelfClosingCustomJsx(content) {
  let result = content;
  let prev;
  do {
    prev = result;
    result = result.replace(/<[A-Z][A-Za-z0-9.]*[\s\S]*?\/>/g, '');
  } while (result !== prev);
  return result;
}

function convertIframesToText(content) {
  return content.replace(
    /<iframe[\s\S]*?src=["']([^"']*)["'][\s\S]*?>(?:[\s\S]*?<\/iframe>)?/gi,
    '\n\n**Video:** $1\n\n'
  );
}

function unwrapCommonHtml(content) {
  let result = content;
  result = result.replace(/<h2>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  result = result.replace(/<h3>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  result = result.replace(/<p>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  result = result.replace(/<a\s+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  result = result.replace(/<ul>/gi, '\n');
  result = result.replace(/<\/ul>/gi, '\n');
  result = result.replace(/<li>([\s\S]*?)<\/li>/gi, '- $1\n');
  result = result.replace(/<div[^>]*>/gi, '');
  result = result.replace(/<\/div>/gi, '');
  result = result.replace(/<br\s*\/?>/gi, '\n');
  return result;
}

/** MDX/HTML stripping after links are normalized (Link components must be converted before convertLinks). */
function stripMdxArtifacts(content) {
  let result = content;
  result = unwrapAsideBlocks(result);
  result = stripPairedCustomTags(result);
  result = convertIframesToText(result);
  result = unwrapCommonHtml(result);
  result = removeSelfClosingCustomJsx(result);
  result = result.replace(/<(\w+)[^>]*>([\s\S]*?)<\/\1>/g, (match, tag, inner) => {
    if (tag === 'Aside' || tag === 'Note') {
      return `> **Note:** ${inner.trim()}`;
    }
    return inner;
  });
  result = result.replace(/<\/?(?:Task|Tasks|Option|Options)>/g, '');
  return result;
}

function processFile(filePath, relativePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    const title = extractTitle(content) || relativePath;

    let processed = removeFrontmatter(content);
    processed = removeImports(processed);
    processed = expandVisualMdxContent(processed);
    processed = convertLinkComponentsToMarkdown(processed);
    processed = convertLinks(processed, filePath);
    processed = stripMdxArtifacts(processed);

    const sectionHeader = `\n\n---\n\n# ${title}\n\n`;

    return sectionHeader + processed.trim();
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return '';
  }
}

function getAllDocsFiles(dir, baseDir = dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && !file.startsWith('_')) {
        getAllDocsFiles(filePath, baseDir, fileList);
      }
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      const relativePath = filePath.replace(baseDir + '/', '').replace(/\.mdx?$/, '');
      fileList.push({ path: filePath, relativePath });
    }
  });

  return fileList;
}

function getSidebarOrder() {
  return [
    'get-started',
    'setup',
    'dropins/all',
    'dropins/cart',
    'dropins/checkout',
    'dropins/order',
    'dropins/payment-services',
    'dropins/personalization',
    'dropins/product-details',
    'dropins/product-discovery',
    'dropins/recommendations',
    'dropins/user-account',
    'dropins/user-auth',
    'dropins/wishlist',
    'dropins-b2b',
    'sdk',
    'merchants',
    'videos',
    'playgrounds',
    'releases',
    'troubleshooting',
    'resources'
  ];
}

function sortFiles(files) {
  const sidebarOrder = getSidebarOrder();

  return files.sort((a, b) => {
    const sectionA = sidebarOrder.find(section => a.relativePath.startsWith(section)) || '';
    const sectionB = sidebarOrder.find(section => b.relativePath.startsWith(section)) || '';

    const orderA = sidebarOrder.indexOf(sectionA);
    const orderB = sidebarOrder.indexOf(sectionB);

    if (orderA !== orderB) {
      return (orderA === -1 ? Infinity : orderA) - (orderB === -1 ? Infinity : orderB);
    }

    return a.relativePath.localeCompare(b.relativePath);
  });
}

function buildBundleHeader({ label, description, timestamp }) {
  return `<SYSTEM>This is the ${label} for Adobe Commerce Storefront on Edge Delivery Services</SYSTEM>

# Adobe Commerce Storefront Documentation

> ${description}
> Generated: ${timestamp}
> Source: ${PRODUCTION_BASE_URL}
`;
}

function buildTopicBundleHeader({ title, blurb, timestamp }) {
  return `<SYSTEM>This is the ${title} bundle for Adobe Commerce Storefront on Edge Delivery Services</SYSTEM>

# ${title}

> ${blurb}
> Generated: ${timestamp}
> Source: ${PRODUCTION_BASE_URL}
`;
}

function writeLlmsTxt() {
  const thematic = LLMS_TXT_BUNDLES.map(
    b =>
      `- [${b.label}](${PRODUCTION_BASE_URL}/_llms-txt/${b.slug}.txt): ${b.blurb}`
  ).join('\n');

  const body = `# Adobe Commerce Storefront

> Documentation for building Adobe Commerce storefronts on Adobe Edge Delivery Services using drop-in components, the Storefront SDK, and related tools.

- Edge Delivery Services documentation for Commerce storefront projects
- Covers setup, drop-ins, SDK, merchants, releases, and troubleshooting
- Generated from the same sources as the site

## Documentation Sets

- [Abridged documentation](${PRODUCTION_BASE_URL}/llms-small.txt): a compact bundle with non-essential long-form changelog content removed
- [Complete documentation](${PRODUCTION_BASE_URL}/llms-full.txt): the full documentation for Adobe Commerce Storefront

${thematic}

## Notes

- The complete documentation includes all content from the official documentation
- The content is automatically generated from the same source as the official documentation

## Optional

- [Browse the documentation](${PRODUCTION_BASE_URL}/) on Experience League
`;

  writeFileSync(OUTPUT_LLMSTXT, body, 'utf-8');
}

function validateCoverage(allFiles) {
  const paths = allFiles.map(f => f.relativePath);
  const uncovered = paths.filter(p => !LLMS_TXT_BUNDLES.some(b => b.filter(p)));
  if (uncovered.length > 0) {
    console.warn(
      'Warning: some docs are not covered by any _llms-txt bundle filter:',
      uncovered.slice(0, 20),
      uncovered.length > 20 ? `... (+${uncovered.length - 20} more)` : ''
    );
  }
}

function generate() {
  console.log('Generating llms.txt, llms-full.txt, llms-small.txt, and _llms-txt bundles...\n');

  mkdirSync(OUTPUT_LLMS_TXT_DIR, { recursive: true });

  console.log('Scanning documentation files...');
  const allFiles = getAllDocsFiles(DOCS_DIR);
  console.log(`   Found ${allFiles.length} documentation files\n`);

  validateCoverage(allFiles);

  const sortedAll = sortFiles([...allFiles]);
  const smallFiles = sortedAll.filter(f => !isExcludedFromSmall(f.relativePath));

  const timestamp = new Date().toISOString();

  writeLlmsTxt();
  console.log(`   Wrote ${OUTPUT_LLMSTXT}`);

  function writeBundle(outputPath, header, files) {
    let output = header;

    console.log(`\nProcessing ${files.length} files -> ${outputPath}...`);
    let processedCount = 0;

    files.forEach((file, index) => {
      const processed = processFile(file.path, file.relativePath);
      if (processed) {
        output += processed;
        processedCount++;
      }
      if ((index + 1) % 50 === 0) {
        console.log(`   Processed ${index + 1}/${files.length} files...`);
      }
    });

    writeFileSync(outputPath, output, 'utf-8');
    const stats = statSync(outputPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    const relUrl = outputPath.replace(join(projectRoot, 'public') + '/', '');
    console.log(`   Done: ${processedCount} pages, ${fileSizeInMB} MB`);
    console.log(`   URL: ${PRODUCTION_BASE_URL}/${relUrl}\n`);
  }

  writeBundle(
    OUTPUT_FULL,
    buildBundleHeader({
      label: 'full developer documentation',
      description: 'Complete documentation for Adobe Commerce Storefront',
      timestamp
    }),
    sortedAll
  );

  writeBundle(
    OUTPUT_SMALL,
    buildBundleHeader({
      label: 'abridged developer documentation (without the release changelog page)',
      description: 'Abridged documentation for Adobe Commerce Storefront (excludes releases/changelog)',
      timestamp
    }),
    smallFiles
  );

  for (const bundle of LLMS_TXT_BUNDLES) {
    const files = sortedAll.filter(f => bundle.filter(f.relativePath));
    const outPath = join(OUTPUT_LLMS_TXT_DIR, `${bundle.slug}.txt`);
    writeBundle(
      outPath,
      buildTopicBundleHeader({
        title: bundle.label,
        blurb: bundle.blurb,
        timestamp
      }),
      files
    );
  }

  console.log('Successfully generated llms context files.');
}

try {
  generate();
} catch (error) {
  console.error('Error generating llms files:', error.message);
  console.error(error.stack);
  process.exit(1);
}
