#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, relative, resolve, normalize } from 'path';
import { fileURLToPath } from 'url';
import { generateSidebar } from '../astro.sidebar.mjs';
import { PRODUCTION_BASE_URL } from '../site.config.js';

// STOREFRONT-LLMS-DEPLOY-BASE — optional preview URL for generated bundle links (grep repo to revert).

/**
 * Base URL for absolute links inside generated llms bundles.
 *
 * Precedence:
 * 1. LLMS_PUBLIC_BASE_URL — manual override (any host).
 * 2. NODE_ENV=github plus GITHUB_PAGES_ORIGIN — GitHub Pages preview (same origin and base path as the Astro build). VITE_GITHUB_BASE_PATH may be empty for a site at the domain root.
 * 3. NODE_ENV=production or default — site.config.js PRODUCTION_BASE_URL (Experience League production).
 */
function resolvePublicDocBase() {
  const explicit = process.env.LLMS_PUBLIC_BASE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'github') {
    const origin = process.env.GITHUB_PAGES_ORIGIN?.trim();
    if (origin) {
      const originClean = origin.replace(/\/+$/, '');
      const basePathRaw = (process.env.VITE_GITHUB_BASE_PATH ?? '').trim();
      const basePath =
        !basePathRaw || basePathRaw === '/'
          ? ''
          : basePathRaw.startsWith('/')
            ? basePathRaw
            : `/${basePathRaw}`;
      return `${originClean}${basePath}`.replace(/\/+$/, '');
    }
  }

  return PRODUCTION_BASE_URL.replace(/\/+$/, '');
}

const PUBLIC_DOC_BASE = resolvePublicDocBase();
const PRODUCTION_DOC_BASE = PRODUCTION_BASE_URL.replace(/\/+$/, '');

/**
 * Turn any absolute Experience League storefront doc URLs into PUBLIC_DOC_BASE
 * when this run targets a non-production host (for example GitHub Pages). Source
 * pages may use full ExL URLs in markdown or after HTML unwrap; relative links
 * already go through resolveMarkdownLinkTarget.
 */
function rewriteStorefrontProductionUrls(content) {
  if (PUBLIC_DOC_BASE === PRODUCTION_DOC_BASE) {
    return content;
  }
  // Literal string replace (not a RegExp) so hostnames in site.config.js are not treated as regex patterns.
  return content.replaceAll(PRODUCTION_DOC_BASE, PUBLIC_DOC_BASE);
}

const browseDocsLabel =
  PUBLIC_DOC_BASE === PRODUCTION_DOC_BASE ? 'on Experience League' : 'on this documentation site';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// --- Glossary ---

function loadGlossary() {
  const src = readFileSync(join(projectRoot, 'src/data/glossary.ts'), 'utf-8');

  function normalizeTerm(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // Find the glossaryEntries array and walk it with a simple brace counter
  const arrayStart = src.indexOf('const glossaryEntries');
  const fromArray = src.slice(arrayStart);
  const assignIdx = fromArray.indexOf('= [');
  const bracketOpen = assignIdx >= 0 ? assignIdx + 2 : fromArray.indexOf('[');
  let depth = 0;
  let end = -1;
  for (let i = bracketOpen; i < fromArray.length; i++) {
    if (fromArray[i] === '[') depth++;
    else if (fromArray[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  const arrayContent = fromArray.slice(bracketOpen + 1, end);

  // Extract individual entry blocks with a brace counter
  const entries = [];
  let entryDepth = 0;
  let entryStart = -1;
  for (let i = 0; i < arrayContent.length; i++) {
    if (arrayContent[i] === '{') {
      if (entryDepth === 0) entryStart = i;
      entryDepth++;
    } else if (arrayContent[i] === '}') {
      entryDepth--;
      if (entryDepth === 0 && entryStart >= 0) {
        entries.push(arrayContent.slice(entryStart + 1, i));
        entryStart = -1;
      }
    }
  }

  const index = new Map();
  for (const entry of entries) {
    const termMatch = entry.match(/term:\s*'([^']*)'/) ?? entry.match(/term:\s*"([^"]*)"/);
    const defMatch = entry.match(/definition:\s*\n?\s*'([^']*)'/) ?? entry.match(/definition:\s*\n?\s*"([^"]*)"/);
    if (!termMatch || !defMatch) continue;

    const term = termMatch[1];
    const definition = defMatch[1];

    const aliasBlock = entry.match(/aliases:\s*\[([^\]]*)\]/)?.[1] ?? '';
    const aliases = [...aliasBlock.matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);

    const obj = { term, definition };
    index.set(normalizeTerm(term), obj);
    for (const alias of aliases) index.set(normalizeTerm(alias), obj);
  }

  return index;
}

const GLOSSARY = loadGlossary();

// Configuration
const DOCS_DIR = join(projectRoot, 'src/content/docs');
const DOCS_ROOT = DOCS_DIR;
const OUTPUT_FULL = join(projectRoot, 'public/llms-full.txt');
const OUTPUT_SMALL = join(projectRoot, 'public/llms-small.txt');
const OUTPUT_LLMSTXT = join(projectRoot, 'public/llms.txt');
const OUTPUT_LLMS_TXT_DIR = join(projectRoot, 'public/_llms-txt');

/**
 * Thematic bundles (paths relative to src/content/docs, no extension).
 * Filters are mutually exclusive except where noted; together they cover all doc pages.
 */
const LLMS_TXT_BUNDLES = [
  {
    slug: 'documentation-home',
    label: 'Documentation home',
    blurb: 'Top-level documentation landing content and reference hub',
    filter: p => p === 'index' || p.startsWith('reference/')
  },
  {
    slug: 'get-started',
    label: 'Get started',
    blurb: 'Onboarding, architecture, backend options, performance, Lighthouse, and browser compatibility',
    filter: p => p.startsWith('get-started/')
  },
  {
    slug: 'ai',
    label: 'Build with AI',
    blurb: 'Overview, documentation context files, Dropins MCP server, and AI agent skills for storefront development',
    filter: p => p.startsWith('ai/')
  },
  {
    slug: 'boilerplate',
    label: 'Boilerplate',
    blurb: 'Boilerplate setup, configuration, blocks reference, customization, Universal Editor, and updates',
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
    slug: 'setup-configuration',
    label: 'Setup — configuration',
    blurb: 'Configuration: endpoints, headers, CORS, gated content, multistore, prerender, CDN, AEM Assets, Storefront Compatibility Package',
    filter: p => p.startsWith('setup/configuration/')
  },
  {
    slug: 'setup-go-live',
    label: 'Setup — go live',
    blurb: 'Discovery, Luma Bridge, analytics, AEP, SEO, launch checklist, and data export validation',
    filter: p => p.startsWith('setup/') && !p.startsWith('setup/configuration/')
  },
  {
    slug: 'dropins-intro',
    label: 'Drop-ins overview',
    blurb: 'Cross-drop-in concepts, shared APIs, and indexes for B2C and B2B drop-ins',
    filter: p =>
      (p.startsWith('dropins/all/') || p === 'dropins/index' || p === 'dropins-b2b/index') &&
      !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-cart',
    label: 'Cart drop-in',
    blurb: 'Cart drop-in containers, slots, events, and customization APIs',
    filter: p => p.startsWith('dropins/cart/') && !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-checkout',
    label: 'Checkout drop-in',
    blurb: 'Checkout drop-in containers, slots, events, and customization APIs',
    filter: p => p.startsWith('dropins/checkout/') && !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-order',
    label: 'Order drop-in',
    blurb: 'Order management, order confirmation, and returns drop-in reference',
    filter: p => p.startsWith('dropins/order/') && !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-pdp',
    label: 'Product details drop-in',
    blurb: 'Product details page drop-in containers, slots, and APIs',
    filter: p => p.startsWith('dropins/product-details/') && !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-account-auth',
    label: 'Account and auth drop-ins',
    blurb: 'User account and user authentication drop-in reference',
    filter: p =>
      (p.startsWith('dropins/user-account/') || p.startsWith('dropins/user-auth/')) &&
      !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-catalog',
    label: 'Catalog drop-ins',
    blurb: 'Product discovery (Live Search), recommendations, and personalization drop-in reference',
    filter: p =>
      (p.startsWith('dropins/product-discovery/') ||
        p.startsWith('dropins/recommendations/') ||
        p.startsWith('dropins/personalization/')) &&
      !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-wishlist-payments',
    label: 'Wishlist and payments drop-ins',
    blurb: 'Wishlist and payment services drop-in reference',
    filter: p =>
      (p.startsWith('dropins/wishlist/') || p.startsWith('dropins/payment-services/')) &&
      !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-b2b-quote',
    label: 'B2B quote management drop-in',
    blurb: 'Quote management drop-in containers, slots, events, and APIs for B2B',
    filter: p => p.startsWith('dropins-b2b/quote-management/') && !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-b2b-company',
    label: 'B2B company management drop-ins',
    blurb: 'Company management and company switcher drop-in reference for B2B',
    filter: p =>
      (p.startsWith('dropins-b2b/company-management/') ||
        p.startsWith('dropins-b2b/company-switcher/')) &&
      !p.includes('/tutorials/')
  },
  {
    slug: 'dropins-b2b-purchasing',
    label: 'B2B purchasing drop-ins',
    blurb: 'Purchase order, quick order, and requisition list drop-in reference for B2B',
    filter: p =>
      (p.startsWith('dropins-b2b/purchase-order/') ||
        p.startsWith('dropins-b2b/quick-order/') ||
        p.startsWith('dropins-b2b/requisition-list/')) &&
      !p.includes('/tutorials/')
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
    blurb: 'EDS block configurations for B2C and B2B commerce (cart, checkout, account, order, quotes, and purchasing)',
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
    blurb: 'UI components, design system, reference APIs (Event Bus, GraphQL, slots), CLI, and utilities',
    filter: p => p.startsWith('sdk/')
  },
  // Excluded: videos/ pages are descriptions of video content with no actionable text for AI tools;
  // the corresponding step-by-step content lives in tutorials-reference.
  // {
  //   slug: 'videos',
  //   label: 'Videos',
  //   blurb: 'Training videos and related notes',
  //   filter: p => p.startsWith('videos/')
  // },
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
  // Excluded: resources/ contains only a list of external JSON URLs; no actionable content for AI tools.
  // {
  //   slug: 'resources',
  //   label: 'Resources',
  //   blurb: 'Placeholder files (storefront labels for drop-in components) and supplementary resources',
  //   filter: p => p.startsWith('resources/')
  // },
  // Excluded: playgrounds/ pages wrap an interactive GraphiQL UI that renders nothing meaningful as text.
  // {
  //   slug: 'playgrounds',
  //   label: 'Playgrounds',
  //   blurb: 'Interactive playground documentation',
  //   filter: p => p.startsWith('playgrounds/')
  // }
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

function extractFrontmatterBlock(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  return match ? match[1] : null;
}

function extractTitle(content) {
  const fm = extractFrontmatterBlock(content);
  if (fm) {
    const m = fm.match(/^title:\s*(.+)$/m);
    if (m) return m[1].trim().replace(/['"]/g, '');
  }
  return null;
}

function extractDescription(content) {
  const fm = extractFrontmatterBlock(content);
  if (fm) {
    const m = fm.match(/^description:\s*(.+)$/m);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return null;
}

function extractIframeSrc(content) {
  const fm = extractFrontmatterBlock(content);
  if (fm) {
    const m = fm.match(/^iframe:\s*\r?\n\s+src:\s*["']?([^"'\r\n]+)["']?/m);
    if (m) return m[1].trim();
  }
  return null;
}

function removeImports(content) {
  let result = content.replace(/^import\s+.*?from\s+['"].*?['"];?\r?\n/gm, '');
  result = result.replace(/^import\s+\{[^}]*\}\s+from\s+['"].*?['"];?\r?\n/gm, '');
  result = result.replace(/^import\s+.*?;?\r?\n/gm, '');
  return result;
}

function buildImportMap(content) {
  const map = new Map();
  const re = /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(content)) !== null) map.set(m[1], m[2]);
  return map;
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
  // Badge: inline text only (used in table cells — newlines would break the table)
  let result = content.replace(/<Badge\b([\s\S]*?)\/>/g, (_, attrs) => {
    const text = (attrs.match(/\btext=["']([^"']*)["']/) || [])[1] || '';
    const tooltip = (attrs.match(/\btooltip=["']([^"']*)["']/) || [])[1] || '';
    return tooltip ? `${text} (${tooltip})` : text;
  });

  result = result.replace(/<Embed\b([^/]*?)\/>/g, (_, attrs) => {
    const src = (attrs.match(/\bsrc=["']([^"']*)["']/) || [])[1] || '';
    return src ? `\n\n**Embedded content:** ${src}\n\n` : '\n\n';
  });

  return result;
}

function expandToolsAemLiveNote(content) {
  return content.replace(
    /<ToolsAemLiveNote\b[^/]*\/>/g,
    '\n\n*(AEM Live tools note — see the full documentation site for the complete callout.)*\n\n'
  );
}

/** <Term>word</Term> or <Term term="lookup">word</Term> → "word (definition)" */
function expandTermComponents(content) {
  function normalizeTerm(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  return content.replace(/<Term(?:\s+term=["']([^"']*)["'])?\s*>([\s\S]*?)<\/Term>/g, (_, termProp, slot) => {
    const displayText = slot.trim();
    const lookupKey = normalizeTerm(termProp ?? displayText);
    const entry = GLOSSARY.get(lookupKey);
    return entry ? `${displayText} (${entry.definition})` : displayText;
  });
}

/** <IFrame src={frontmatter.iframe.src} /> → Storybook link using the resolved src. */
function expandIFrameComponents(content, iframeSrc) {
  if (!iframeSrc) return content;
  const url = `${PUBLIC_DOC_BASE}/storybook-static/iframe.html?id=${iframeSrc}&viewMode=docs`;
  return content.replace(
    /<IFrame\b[\s\S]*?\/>/g,
    `\n\n[View interactive component in Storybook](${url})\n\n`
  );
}

/** <Diagram type="mermaid" code={`...`} /> → fenced mermaid block; <Diagram caption>img</Diagram> → image + caption. */
function expandDiagramComponents(content) {
  let result = content;

  // Self-closing mermaid variant: code={`...`}
  const marker = 'code={`';
  let pos = 0;
  while (true) {
    const tagStart = result.indexOf('<Diagram', pos);
    if (tagStart === -1) break;
    const codeIdx = result.indexOf(marker, tagStart);
    if (codeIdx === -1 || codeIdx - tagStart > 600) { pos = tagStart + 8; continue; }
    const innerStart = codeIdx + marker.length;
    const innerEnd = result.indexOf('`}', innerStart);
    if (innerEnd === -1) { pos = tagStart + 8; continue; }
    const closeIdx = result.indexOf('/>', innerEnd);
    if (closeIdx === -1) { pos = tagStart + 8; continue; }
    const mermaidCode = result.slice(innerStart, innerEnd);
    const attrRegion = result.slice(tagStart, innerStart);
    const captionMatch = attrRegion.match(/\bcaption=["']([^"']*)["']/);
    const caption = captionMatch ? `\n\n*${captionMatch[1]}*` : '';
    const replacement = `\n\n\`\`\`mermaid\n${mermaidCode.trim()}\n\`\`\`${caption}\n\n`;
    result = result.slice(0, tagStart) + replacement + result.slice(closeIdx + 2);
    pos = tagStart + replacement.length;
  }

  // Paired image/content variant: <Diagram caption="...">content</Diagram>
  result = result.replace(/<Diagram\b([^>]*)>([\s\S]*?)<\/Diagram>/g, (_, attrs, body) => {
    const captionMatch = attrs.match(/\bcaption=["']([^"']*)["']/);
    const inner = body.trim();
    return captionMatch ? `\n\n${inner}\n\n*${captionMatch[1]}*\n\n` : `\n\n${inner}\n\n`;
  });

  return result;
}

/** <Tabs> / <TabItem label="..."> → ### heading per tab, strip wrappers. */
function expandTabsComponents(content) {
  let result = content.replace(
    /<TabItem\b[^>]*\blabel=["']([^"']*)["'][^>]*>([\s\S]*?)<\/TabItem>/g,
    (_, label, body) => `\n\n### ${label}\n\n${body.trim()}\n\n`
  );
  result = result.replace(/<\/?Tabs\b[^>]*>/g, '');
  return result;
}

/** <Screenshot src={Var} alt="..." /> → markdown image using the import map. */
function expandScreenshotComponents(content, importMap, filePath) {
  return content.replace(/<Screenshot\b([\s\S]*?)\/>/g, (_, attrs) => {
    const alt = (attrs.match(/\balt=["']([^"']*)["']/) || [])[1] || 'Screenshot';
    const strSrc = (attrs.match(/\bsrc=["']([^"']*)["']/) || [])[1];
    if (strSrc) return `![${alt}](${resolveMarkdownLinkTarget(strSrc, filePath)})`;
    const varName = (attrs.match(/\bsrc=\{(\w+)\}/) || [])[1];
    if (varName && importMap.has(varName)) {
      return `![${alt}](${resolveMarkdownLinkTarget(importMap.get(varName), filePath)})`;
    }
    return `![${alt}]`;
  });
}

/** <ExternalLink href="...">text</ExternalLink> → [text](href) */
function expandExternalLinkComponents(content) {
  return content.replace(
    /<ExternalLink\b[^>]*\bhref=["']([^"']*)["'][^>]*>([\s\S]*?)<\/ExternalLink>/g,
    (_, href, text) => `[${text.trim()}](${href})`
  );
}

/** <CodeInclude code={varName} lang="ts" /> → fenced block from the ?raw import. */
function expandCodeIncludeComponents(content, importMap, filePath) {
  return content.replace(/<CodeInclude\b([\s\S]*?)\/>/g, (_, attrs) => {
    const varName = (attrs.match(/\bcode=\{(\w+)\}/) || [])[1];
    const lang = (attrs.match(/\blang=["']([^"']*)["']/) || [])[1] || 'ts';
    if (varName && importMap.has(varName)) {
      const importPath = importMap.get(varName).replace(/\?raw$/, '');
      const resolvedPath = resolve(dirname(filePath), importPath);
      try {
        const code = readFileSync(resolvedPath, 'utf-8');
        return `\n\n\`\`\`${lang}\n${code.trim()}\n\`\`\`\n\n`;
      } catch {
        return `\n\n*[Code: ${importPath}]*\n\n`;
      }
    }
    return '';
  });
}

function expandVisualMdxContent(content, iframeSrc) {
  let result = expandCodeComponents(content);
  result = expandLinkCards(result);
  result = expandOptionsTable(result);
  result = expandBadgeEmbedChecklist(result);
  result = expandToolsAemLiveNote(result);
  result = expandTermComponents(result);
  result = expandDiagramComponents(result);
  result = expandTabsComponents(result);
  result = expandExternalLinkComponents(result);
  result = expandIFrameComponents(result, iframeSrc);
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
    return `${PUBLIC_DOC_BASE}${urlPath}${slash}${hash}`;
  }

  if (p.startsWith('/')) {
    let abs = p.replace(/\.mdx?$/, '');
    if (shouldAddTrailingSlash(abs)) {
      abs += '/';
    }
    return `${PUBLIC_DOC_BASE}${abs}${hash}`;
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
  return `${PUBLIC_DOC_BASE}${urlPath}${hash}`;
}

function convertLinks(content, filePath) {
  const relativeLinkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g;

  return content.replace(relativeLinkRegex, (match, text, link) => {
    const trimmed = link.trim();
    const absoluteLink = resolveMarkdownLinkTarget(trimmed, filePath);
    return `[${text}](${absoluteLink})`;
  });
}

function unwrapLinkComponents(content) {
  return content.replace(/<Link\b[\s\S]*?\/>/g, (match) => {
    const jsxHref = match.match(/\bhref=\{["']([^"']+)["']\}/);
    if (jsxHref) return jsxHref[1];
    const strHref = match.match(/\bhref=["']([^"']+)["']/);
    if (strHref) return strHref[1];
    return '';
  });

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

function unwrapTableBlocks(content) {
  return content.replace(/<TableWrapper\b[^>]*>([\s\S]*?)<\/TableWrapper>/g, '$1');
}

/**
 * Extract plain text from an HTML cell, stripping all tags and decoding common entities.
 * Input is trusted internal MDX (no user-supplied HTML); output is a plain-text .txt file
 * consumed by LLMs, never rendered in a browser — CodeQL sanitization heuristics don't apply.
 */
function cellText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** Convert HTML tables to Markdown pipe tables. */
function convertHtmlTablesToMarkdown(content) {
  return content.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    const rows = [];
    const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowPattern.exec(tableHtml)) !== null) {
      const cells = [];
      const cellPattern = /<t[dh]([^>]*)>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch;
      while ((cellMatch = cellPattern.exec(rowMatch[1])) !== null) {
        const attrs = cellMatch[1];
        const colspanMatch = attrs.match(/colspan=["']?(\d+)["']?/i);
        const colspan = colspanMatch ? parseInt(colspanMatch[1], 10) : 1;
        cells.push({ text: cellText(cellMatch[2]), colspan });
      }
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length === 0) return tableHtml;

    // Determine column count from the widest row
    const colCount = Math.max(2, ...rows.map(r => r.reduce((s, c) => s + c.colspan, 0)));

    const lines = [];
    for (let i = 0; i < rows.length; i++) {
      // Expand colspan cells into empty sibling columns
      const expanded = [];
      for (const cell of rows[i]) {
        expanded.push(cell.text);
        for (let j = 1; j < cell.colspan; j++) expanded.push('');
      }
      while (expanded.length < colCount) expanded.push('');
      lines.push('| ' + expanded.join(' | ') + ' |');
      // Separator after header row
      if (i === 0) lines.push('| ' + Array(colCount).fill('---').join(' | ') + ' |');
    }

    return '\n\n' + lines.join('\n') + '\n\n';
  });
}

function unwrapTaskBlocks(content) {
  return content.replace(/<Tasks>([\s\S]*?)<\/Tasks>/g, (_, inner) => {
    let step = 0;
    return inner.replace(/<Task>([\s\S]*?)<\/Task>/g, (_, body) => {
      step++;
      return body.replace(/(#{1,6} )/, `$1${step}. `);
    });
  });
}

/** Strip wrapper tags whose content is already readable markdown (Steps, Callouts, etc.). */
function unwrapSimpleBlockWrappers(content) {
  return content
    .replace(/<Steps>([\s\S]*?)<\/Steps>/g, '$1')
    .replace(/<Callouts>([\s\S]*?)<\/Callouts>/g, '$1')
    .replace(/<FileTree>([\s\S]*?)<\/FileTree>/g, '$1')
    .replace(/<Checklist\b[^>]*>([\s\S]*?)<\/Checklist>/g, '$1')
    .replace(/<CardGrid\b[^>]*>([\s\S]*?)<\/CardGrid>/g, '$1')
    .replace(/<Options\b[^>]*>([\s\S]*?)<\/Options>/g, '$1')
    .replace(/<Option>([\s\S]*?)<\/Option>/g, '$1')
    .replace(/<ColorTokenList\b[\s\S]*?\/>/g, '');
}

/** MDX/HTML cleanup after links are normalized (Link components must be converted before convertLinks). */
function stripMdxArtifacts(content) {
  let result = content;
  result = unwrapAsideBlocks(result);
  result = unwrapTableBlocks(result);
  result = convertHtmlTablesToMarkdown(result);
  result = unwrapTaskBlocks(result);
  result = unwrapSimpleBlockWrappers(result);
  result = convertIframesToText(result);
  result = unwrapCommonHtml(result);
  return result;
}

function processFile(filePath, relativePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    const title = extractTitle(content) || relativePath;
    const description = extractDescription(content);
    const iframeSrc = extractIframeSrc(content);
    const importMap = buildImportMap(content);

    let processed = removeFrontmatter(content);
    processed = removeImports(processed);
    processed = expandVisualMdxContent(processed, iframeSrc);
    processed = expandScreenshotComponents(processed, importMap, filePath);
    processed = expandCodeIncludeComponents(processed, importMap, filePath);
    processed = unwrapLinkComponents(processed);
    processed = convertLinks(processed, filePath);
    processed = stripMdxArtifacts(processed);
    processed = processed.replace(/\n{3,}/g, '\n\n');

    // For pages whose only content is a Storybook iframe, the description
    // frontmatter field is the only prose — include it explicitly.
    if (iframeSrc && description) {
      processed = description + '\n\n' + processed.trim();
    }

    processed = rewriteStorefrontProductionUrls(processed);

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
  const seen = new Set();
  const prefixes = [];

  function visit(items) {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (item.link) {
        const path = item.link.replace(/^\//, '').replace(/\/$/, '');
        const top = path.split('/')[0];
        if (top && !seen.has(top)) {
          seen.add(top);
          prefixes.push(top);
        }
      }
      if (item.autogenerate?.directory) {
        const dir = item.autogenerate.directory.replace(/^\//, '').replace(/\/$/, '');
        const top = dir.split('/')[0];
        if (top && !seen.has(top)) {
          seen.add(top);
          prefixes.push(top);
        }
      }
      if (item.items) visit(item.items);
    }
  }

  visit(generateSidebar());
  return prefixes;
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
> Source: ${PUBLIC_DOC_BASE}
`;
}

function buildTopicBundleHeader({ title, blurb, timestamp }) {
  return `<SYSTEM>This is the ${title} bundle for Adobe Commerce Storefront on Edge Delivery Services</SYSTEM>

# ${title}

> ${blurb}
> Generated: ${timestamp}
> Source: ${PUBLIC_DOC_BASE}
`;
}

function writeLlmsTxt() {
  const thematic = LLMS_TXT_BUNDLES.map(
    b =>
      `- [${b.label}](${PUBLIC_DOC_BASE}/_llms-txt/${b.slug}.txt): ${b.blurb}`
  ).join('\n');

  const body = `# Adobe Commerce Storefront

> Documentation for building Adobe Commerce storefronts on Adobe Edge Delivery Services using drop-in components, the Storefront SDK, and related tools.

- Edge Delivery Services documentation for Commerce storefront projects
- Covers setup, drop-ins, SDK, merchants, releases, and troubleshooting
- Generated from the same sources as the site

## Documentation Sets

- [Abridged documentation](${PUBLIC_DOC_BASE}/llms-small.txt): a compact bundle with non-essential long-form changelog content removed
- [Complete documentation](${PUBLIC_DOC_BASE}/llms-full.txt): the full documentation for Adobe Commerce Storefront

${thematic}

## Notes

- The complete documentation includes all content from the official documentation
- The content is automatically generated from the same source as the official documentation

## Optional

- [Browse the documentation](${PUBLIC_DOC_BASE}/) ${browseDocsLabel}
`;

  writeFileSync(OUTPUT_LLMSTXT, body, 'utf-8');
}

// Paths intentionally excluded from all bundles (content not useful for AI tools).
const COVERAGE_EXCLUSIONS = ['videos/', 'resources/', 'playgrounds/'];

function validateCoverage(allFiles) {
  const paths = allFiles.map(f => f.relativePath);
  const uncovered = paths.filter(
    p => !LLMS_TXT_BUNDLES.some(b => b.filter(p)) && !COVERAGE_EXCLUSIONS.some(e => p.startsWith(e))
  );
  if (uncovered.length > 0) {
    console.warn(
      'Warning: some docs are not covered by any _llms-txt bundle filter:',
      uncovered.slice(0, 20),
      uncovered.length > 20 ? `... (+${uncovered.length - 20} more)` : ''
    );
  }
  for (const bundle of LLMS_TXT_BUNDLES) {
    if (!paths.some(p => bundle.filter(p))) {
      console.warn(`Warning: bundle "${bundle.slug}" matches zero documentation files`);
    }
  }
}

function generate() {
  console.log('Generating llms.txt, llms-full.txt, llms-small.txt, and _llms-txt bundles...\n');
  if (PUBLIC_DOC_BASE !== PRODUCTION_DOC_BASE) {
    console.log(`   Bundle link base: ${PUBLIC_DOC_BASE}\n`);
  }

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
    console.log(`   URL: ${PUBLIC_DOC_BASE}/${relUrl}\n`);
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
