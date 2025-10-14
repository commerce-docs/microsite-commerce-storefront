#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const DOCS_DIR = join(projectRoot, 'src/content/docs');
const OUTPUT_FILE = join(projectRoot, 'public/llms-full.txt');
const PRODUCTION_BASE_URL = 'https://experienceleague.adobe.com/developer/commerce/storefront';

// Simple frontmatter parser (removes YAML between --- markers)
function removeFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  return content.replace(frontmatterRegex, '');
}

// Extract title from frontmatter
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

// Remove import statements
function removeImports(content) {
  // Remove all import statements (single and multi-line)
  let result = content.replace(/^import\s+.*?from\s+['"].*?['"];?\r?\n/gm, '');
  result = result.replace(/^import\s+\{[^}]*\}\s+from\s+['"].*?['"];?\r?\n/gm, '');
  result = result.replace(/^import\s+.*?;?\r?\n/gm, '');
  return result;
}

// Convert relative links to absolute URLs
function convertLinks(content, filePath) {
  // Convert relative markdown links to absolute URLs
  const relativeLinkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g;

  return content.replace(relativeLinkRegex, (match, text, link) => {
    // Handle different link formats
    let absoluteLink = link;

    // Remove .mdx or .md extensions
    absoluteLink = absoluteLink.replace(/\.mdx?$/, '');

    // If link starts with /, it's relative to docs root
    if (absoluteLink.startsWith('/')) {
      absoluteLink = `${PRODUCTION_BASE_URL}${absoluteLink}`;
    } else if (absoluteLink.startsWith('./') || absoluteLink.startsWith('../')) {
      // For relative paths, we'd need more complex logic
      // For now, just clean them up
      absoluteLink = absoluteLink.replace(/^\.\.?\//, '');
      absoluteLink = `${PRODUCTION_BASE_URL}/${absoluteLink}`;
    }

    // Ensure trailing slash for page links (not anchors or external)
    if (!absoluteLink.includes('#') && !absoluteLink.endsWith('/')) {
      absoluteLink += '/';
    }

    return `[${text}](${absoluteLink})`;
  });
}

// Simple component removal (converts common components to markdown equivalents)
function removeComponents(content) {
  let result = content;

  // Remove JSX-style components but keep their text content
  // Handle self-closing components
  result = result.replace(/<\w+[^>]*\/>/g, '');

  // Handle components with children - extract text content
  result = result.replace(/<(\w+)[^>]*>([\s\S]*?)<\/\1>/g, (match, tag, content) => {
    // For common components, convert to markdown equivalent
    if (tag === 'Aside' || tag === 'Note') {
      return `> **Note:** ${content.trim()}`;
    }
    // Otherwise just return the content
    return content;
  });

  return result;
}

// Process a single MDX file
function processFile(filePath, relativePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Extract title for section header
    const title = extractTitle(content) || relativePath;

    // Process content
    let processed = removeFrontmatter(content);
    processed = removeImports(processed);
    processed = convertLinks(processed, filePath);
    processed = removeComponents(processed);

    // Add section header
    const sectionHeader = `\n\n---\n\n# ${title}\n\n`;

    return sectionHeader + processed.trim();
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return '';
  }
}

// Recursively get all MDX/MD files in a directory
function getAllDocsFiles(dir, baseDir = dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip hidden directories and drafts
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

// Sort files based on sidebar structure
function getSidebarOrder() {
  // This defines the general order of sections
  // Files will be sorted alphabetically within their sections
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

// Sort files according to sidebar order
function sortFiles(files) {
  const sidebarOrder = getSidebarOrder();

  return files.sort((a, b) => {
    // Determine section for each file
    const sectionA = sidebarOrder.find(section => a.relativePath.startsWith(section)) || '';
    const sectionB = sidebarOrder.find(section => b.relativePath.startsWith(section)) || '';

    const orderA = sidebarOrder.indexOf(sectionA);
    const orderB = sidebarOrder.indexOf(sectionB);

    // First sort by section order
    if (orderA !== orderB) {
      return (orderA === -1 ? Infinity : orderA) - (orderB === -1 ? Infinity : orderB);
    }

    // Within same section, sort alphabetically
    return a.relativePath.localeCompare(b.relativePath);
  });
}

// Generate table of contents
function generateTableOfContents(files) {
  let toc = '## Table of Contents\n\n';
  let currentSection = '';

  files.forEach(file => {
    const parts = file.relativePath.split('/');
    const section = parts[0];

    if (section !== currentSection) {
      currentSection = section;
      toc += `\n### ${section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ')}\n`;
    }

    toc += `- ${file.relativePath}\n`;
  });

  return toc + '\n';
}

// Main function to generate llms-full.txt
function generateLLMSFull() {
  console.log('🚀 Generating llms-full.txt...\n');

  // Get all documentation files
  console.log('📂 Scanning documentation files...');
  const files = getAllDocsFiles(DOCS_DIR);
  console.log(`   Found ${files.length} documentation files\n`);

  // Sort files according to sidebar order
  console.log('📋 Sorting files by structure...');
  const sortedFiles = sortFiles(files);

  // Generate header
  const timestamp = new Date().toISOString();
  let output = `<SYSTEM>This is the full developer documentation for Adobe Commerce Storefront on Edge Delivery Services</SYSTEM>

# Adobe Commerce Storefront Documentation

> Complete documentation for Adobe Commerce Storefront
> Generated: ${timestamp}
> Source: ${PRODUCTION_BASE_URL}

This file contains the complete documentation from https://experienceleague.adobe.com/developer/commerce/storefront/ in a single markdown file, optimized for consumption by AI language models and tools.
`;

  // Generate table of contents
  console.log('📑 Generating table of contents...');
  output += generateTableOfContents(sortedFiles);

  // Process each file
  console.log('⚙️  Processing documentation files...\n');
  let processedCount = 0;

  sortedFiles.forEach((file, index) => {
    const processed = processFile(file.path, file.relativePath);
    if (processed) {
      output += processed;
      processedCount++;

      // Progress indicator
      if ((index + 1) % 50 === 0) {
        console.log(`   Processed ${index + 1}/${sortedFiles.length} files...`);
      }
    }
  });

  console.log(`   Processed ${processedCount}/${sortedFiles.length} files\n`);

  // Write output file
  console.log('💾 Writing output file...');
  writeFileSync(OUTPUT_FILE, output, 'utf-8');

  // Get file size
  const stats = statSync(OUTPUT_FILE);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\n✅ Successfully generated llms-full.txt!`);
  console.log(`   Location: ${OUTPUT_FILE}`);
  console.log(`   File size: ${fileSizeInMB} MB`);
  console.log(`   Pages processed: ${processedCount}`);
  console.log(`   URL: ${PRODUCTION_BASE_URL}/llms-full.txt\n`);
}

// Run the generator
try {
  generateLLMSFull();
} catch (error) {
  console.error('❌ Error generating llms-full.txt:', error.message);
  console.error(error.stack);
  process.exit(1);
}
