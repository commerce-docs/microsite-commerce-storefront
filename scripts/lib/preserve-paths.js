/**
 * Preserve Paths
 *
 * Files listed in _dropin-enrichments/preserve-paths.json are never overwritten
 * by generators. Use for manual content (setup steps, custom prose) that would
 * otherwise be replaced.
 *
 * Paths are relative to src/content/docs/ (e.g. "dropins/product-details/containers/index.mdx").
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');
const PRESERVE_PATH = join(projectRoot, '_dropin-enrichments', 'preserve-paths.json');

const DOCS_PREFIX = join(projectRoot, 'src', 'content', 'docs') + '/';

/**
 * Load the preserve paths map. Keys are paths relative to src/content/docs.
 * Values are optional reason strings.
 *
 * @returns {Record<string, string>}
 */
export function loadPreservePaths() {
  if (!existsSync(PRESERVE_PATH)) return {};
  try {
    const data = JSON.parse(readFileSync(PRESERVE_PATH, 'utf8'));
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && !key.startsWith('_')) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Convert an absolute output path to the preserve-paths key format
 * (relative to src/content/docs, forward slashes).
 *
 * @param {string} absolutePath - Full path to the output file
 * @returns {string|null} Relative path or null if not under src/content/docs
 */
export function toPreserveKey(absolutePath) {
  const normalized = absolutePath.replace(/\\/g, '/');
  const prefix = DOCS_PREFIX.replace(/\\/g, '/');
  if (!normalized.startsWith(prefix)) return null;
  return normalized.slice(prefix.length);
}

/**
 * Check if a path should not be overwritten by generators.
 *
 * @param {string} absolutePath - Full path to the output file
 * @returns {boolean}
 */
export function isPathPreserved(absolutePath) {
  const key = toPreserveKey(absolutePath);
  if (!key) return false;
  const preserve = loadPreservePaths();
  return preserve[key] !== undefined;
}

/**
 * Add a path to the preserve list.
 *
 * @param {string} relativePath - Path relative to src/content/docs (e.g. "merchants/blocks/product-recommendations.mdx")
 * @param {string} [reason] - Optional reason
 */
export function addPreservePath(relativePath, reason = 'manual content') {
  const path = relativePath.replace(/\\/g, '/');
  let data = {};
  if (existsSync(PRESERVE_PATH)) {
    try {
      data = JSON.parse(readFileSync(PRESERVE_PATH, 'utf8'));
    } catch {}
  }
  data[path] = reason;
  // Preserve _comment and other metadata when writing
  writeFileSync(PRESERVE_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Remove a path from the preserve list.
 *
 * @param {string} relativePath - Path relative to src/content/docs
 */
export function removePreservePath(relativePath) {
  const path = relativePath.replace(/\\/g, '/');
  if (!existsSync(PRESERVE_PATH)) return;
  const data = JSON.parse(readFileSync(PRESERVE_PATH, 'utf8'));
  delete data[path];
  writeFileSync(PRESERVE_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
