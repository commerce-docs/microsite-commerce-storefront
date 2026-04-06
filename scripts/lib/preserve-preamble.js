/**
 * Preserve Preamble Utility
 *
 * RULE: NEVER generate or overwrite the frontmatter and first paragraph of
 * existing MDX files. When a file exists, always keep its:
 * - Frontmatter (YAML between --- delimiters)
 * - First paragraph(s) (content after frontmatter until the first ## heading)
 *
 * RULE: When anchorHeading is provided, preserve EVERYTHING before that heading
 * in the existing file—including custom ## sections like Prerequisites or Admin
 * configuration. This prevents dangerous deletions of valuable documentation.
 *
 * RULE: Blank lines and whitespace must never be changed. Preserve exact
 * whitespace in the preamble; do not trim or normalize.
 *
 * Generators must use mergePreservingPreamble() before writing any MDX.
 *
 * @example
 * // Default: preamble = before first ##, body = from first ##
 * const merged = mergePreservingPreamble(outputPath, generatedContent);
 *
 * @example
 * // With anchor: preserve custom sections before ## Quick example
 * const merged = mergePreservingPreamble(outputPath, generatedContent, { anchorHeading: 'Quick example' });
 */

import { readFileSync, existsSync } from 'fs';
import { extractQuickExampleIntro } from './content-extractor.js';
import { isRicherDescription } from './richer-description.js';

/**
 * Extract the preamble (frontmatter + first paragraph) from MDX content.
 * The preamble is everything from the start of the file until (but not including)
 * the first ## heading. Uses regex to preserve exact whitespace including all
 * blank lines before ##.
 *
 * @param {string} content - Full MDX file content
 * @param {string} [anchorHeading] - If provided, preamble = everything before ## anchorHeading
 * @returns {{ preamble: string }|null} - Preamble text, or null if no valid preamble
 */
export function extractPreamble(content, anchorHeading = null) {
  if (!content || typeof content !== 'string') return null;

  // Require frontmatter
  if (!content.trimStart().startsWith('---')) return null;

  if (anchorHeading) {
    // Preserve everything before ## anchorHeading (including custom ## sections like Prerequisites)
    const pattern = new RegExp(`^([\\s\\S]*?\\n)(?=##\\s+${escapeRegex(anchorHeading)}(?:\\s|$))`);
    const match = content.match(pattern);
    if (match) {
      return { preamble: match[1] };
    }
    // Fallback: anchor not found, use first ##
  }

  // Default: everything up to and including the newline before first ##
  const match = content.match(/^[\s\S]*?\n(?=##(?:\s|$))/);
  if (match) {
    return { preamble: match[0] };
  }
  return null;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Collapse 2+ consecutive blank lines to 1 (at most one blank line between blocks).
 * Generators must never add blank lines; this ensures output has no more than one.
 *
 * @param {string} content - MDX content
 * @returns {string} Content with excessive blank lines normalized
 */
function normalizeExcessiveBlankLines(content) {
  if (!content || typeof content !== 'string') return content;
  return content.replace(/\n{3,}/g, '\n\n');
}

/**
 * Extract the body from generated content.
 *
 * @param {string} content - Generated MDX content
 * @param {string} [anchorHeading] - If provided, body = from ## anchorHeading onward
 * @returns {string} - Body content from the anchor or first ## heading onward
 */
function extractGeneratedBody(content, anchorHeading = null) {
  if (!content || typeof content !== 'string') return content;

  const lines = content.split('\n');
  let firstHeadingIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? '';
    if (line.startsWith('##')) {
      if (firstHeadingIndex < 0) firstHeadingIndex = i;
      const headingMatch = line.match(/^##\s+(.+)$/);
      const heading = headingMatch ? headingMatch[1].trim() : '';
      if (!anchorHeading || heading === anchorHeading) {
        return lines.slice(i).join('\n').trimStart();
      }
    }
  }

  // Anchor not found: fall back to first ## to avoid wiping the body
  if (firstHeadingIndex >= 0) {
    return lines.slice(firstHeadingIndex).join('\n').trimStart();
  }
  return '';
}

/**
 * Extract the body (everything from first ## onward) from content.
 */
function extractBody(content) {
  if (!content || typeof content !== 'string') return '';
  const idx = content.search(/\n(?=##(?:\s|$))/);
  if (idx < 0) return '';
  return content.slice(idx + 1);
}

/**
 * Extract all TableWrapper nowrap values from content (e.g. [0, 1], [0]).
 * @param {string} content - MDX content
 * @returns {string[]} - Array of nowrap strings (e.g. ['[0,1]', '[0]'])
 */
function extractNowrapValues(content) {
  const matches = content.matchAll(/<TableWrapper\s+nowrap=\{[^}]+\}>/g);
  return [...matches].map(m => {
    const inner = m[0].match(/nowrap=\{([^}]+)\}/);
    return inner ? inner[1].trim() : null;
  }).filter(Boolean);
}

/**
 * Replace TableWrapper nowrap values in content with those from existing (by position).
 * Preserves existing nowrap parameters so generators do not change them.
 * @param {string} content - Content to modify
 * @param {string[]} existingNowrap - Nowrap values from existing file
 * @returns {string} - Content with nowrap values replaced
 */
function preserveTableWrapperNowrap(content, existingNowrap) {
  if (!existingNowrap || existingNowrap.length === 0) return content;

  let index = 0;
  return content.replace(/<TableWrapper\s+nowrap=\{[^}]+\}>/g, (match) => {
    const replacement = existingNowrap[index];
    index++;
    if (replacement) {
      return `<TableWrapper nowrap={${replacement}}>`;
    }
    return match;
  });
}

/**
 * Merge generated content with preserved preamble from an existing file.
 * NEVER overwrites frontmatter or first paragraph when the file exists.
 * Preserves TableWrapper nowrap parameters from existing content.
 * If the file does not exist, returns the generated content unchanged.
 *
 * @param {string} filePath - Path to the output file (used to read existing content)
 * @param {string} generatedContent - Full content the generator produced
 * @param {{ anchorHeading?: string, preserveRicherQuickExampleIntro?: boolean }} [options]
 *   - anchorHeading: When set (e.g. 'Quick example'), preserves everything before that heading.
 *   - preserveRicherQuickExampleIntro: When true, preserves a richer intro paragraph in the
 *     ## Quick example section (avoids overwriting manually added helpful context).
 * @returns {string} - Merged content to write
 */
export function mergePreservingPreamble(filePath, generatedContent, options = {}) {
  if (!existsSync(filePath)) {
    return normalizeExcessiveBlankLines(generatedContent);
  }

  generatedContent = normalizeExcessiveBlankLines(generatedContent);

  const { anchorHeading, preserveRicherQuickExampleIntro } = options;
  const existingContent = readFileSync(filePath, 'utf8');
  const extracted = extractPreamble(existingContent, anchorHeading);
  let merged;

  let body = extractGeneratedBody(generatedContent, anchorHeading);

  // Preserve richer intro paragraph in ## Quick example section when requested
  if (preserveRicherQuickExampleIntro && body) {
    const existingIntro = extractQuickExampleIntro(existingContent);
    const generatedIntro = extractQuickExampleIntro(body);
    if (existingIntro && isRicherDescription(existingIntro, generatedIntro)) {
      body = body.replace(
        /(## Quick example\s*\n\n)([\s\S]*?)(?=\n```)/,
        (_, prefix, _replaced) => `${prefix}${existingIntro}\n\n`
      );
    }
  }
  const versionMatch = body.match(/\*\*Version:\*\* (\d+\.\d+\.\d+)/);
  const syncVersionInPreamble = (p) => {
    if (!versionMatch) return p;
    return p.replace(/<strong>Version: \d+\.\d+\.\d+<\/strong>/, `<strong>Version: ${versionMatch[1]}</strong>`);
  };

  if (!extracted) {
    // Fallback: preserve everything before anchor heading or first ##
    let fallbackPreamble;
    if (anchorHeading) {
      const anchorRe = new RegExp(`\\n(?=##\\s+${escapeRegex(anchorHeading)}(?:\\s|$))`);
      const anchorIdx = existingContent.search(anchorRe);
      fallbackPreamble = anchorIdx >= 0 ? existingContent.slice(0, anchorIdx + 1) : null;
    }
    if (fallbackPreamble == null) {
      const firstH2 = existingContent.search(/\n## /);
      fallbackPreamble = firstH2 >= 0 ? existingContent.slice(0, firstH2 + 1) : existingContent;
    }
    fallbackPreamble = syncVersionInPreamble(fallbackPreamble);
    const sep = fallbackPreamble.endsWith('\n') ? '' : '\n';
    merged = fallbackPreamble + (body ? sep + body : '');
  } else {
    const sep = extracted.preamble.endsWith('\n') ? '' : '\n';
    const preamble = syncVersionInPreamble(extracted.preamble);
    merged = preamble + (body ? sep + body : '');
  }

  // Preserve TableWrapper nowrap parameters from existing content (full file, not just body—
  // tables in preamble e.g. function index must have their nowrap preserved)
  const existingNowrap = extractNowrapValues(existingContent);
  const withNowrap = preserveTableWrapperNowrap(merged, existingNowrap);
  return normalizeExcessiveBlankLines(withNowrap);
}
