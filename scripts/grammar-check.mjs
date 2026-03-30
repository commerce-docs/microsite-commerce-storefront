/**
 * LanguageTool (via gramma) for Markdown/MDX prose.
 * Complements cspell: the "typos" category is disabled to reduce overlap with spelling checks.
 *
 * Env:
 *   LANGUAGETOOL_API_KEY — optional; higher limits at https://languagetool.org/ (recommended for CI / full-repo runs).
 *   GRAMMAR_BASE — merge base branch (default: release).
 *   GRAMMAR_ALL — if "1", check every tracked .md/.mdx; otherwise only files changed vs GRAMMAR_BASE (+ unstaged/staged).
 *   GRAMMAR_DELAY_MS — ms between API requests (default: 0 if LANGUAGETOOL_API_KEY set, else 3200 for public API).
 *   GRAMMAR_SKIP — if "1", exit 0.
 *   GRAMMAR_MAX_FILES — cap file count (debug).
 *   GRAMMAR_INCLUDE_ROOT — if "1", include repo-root Markdown files (e.g. CONTRIBUTING.md). Default: only under src/content/.
 */

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const gramma = require('gramma');

const MAX_CHUNK_CHARS = 8000;

/** Typos: cspell. Others: reduce MDX / technical-doc false positives vs. prose-only LanguageTool defaults. */
const LT_RULES_TECH_DOCS = {
  typos: false,
  typography: false,
  casing: false,
  style: false,
  semantics: false,
};

function stripForGrammarCheck(source) {
  let s = source;
  if (s.startsWith('---')) {
    const m = s.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (m) s = s.slice(m[0].length);
  }
  s = s.replace(/```[\s\S]*?```/g, '\n');
  s = s.replace(/^import\s[^\n]+$/gm, '');
  s = s.replace(/^export\s[^\n]+$/gm, '');
  s = s
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (t.startsWith('<') && t.includes('>')) return false;
      return true;
    })
    .join('\n');
  return s.replace(/\n{3,}/g, '\n\n').trim();
}

function* chunkText(text) {
  if (text.length <= MAX_CHUNK_CHARS) {
    yield text;
    return;
  }
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + MAX_CHUNK_CHARS, text.length);
    if (end < text.length) {
      const sub = text.slice(i, end);
      const breakAt = sub.lastIndexOf('\n\n');
      if (breakAt > 400) {
        end = i + breakAt;
      }
    }
    yield text.slice(i, end);
    i = end;
  }
}

function includeInGrammarScope(file) {
  if (file.startsWith('src/content/')) return true;
  if (process.env.GRAMMAR_INCLUDE_ROOT === '1' || process.env.GRAMMAR_INCLUDE_ROOT === 'true') {
    return /\.(md|mdx)$/.test(file) && !file.includes('/');
  }
  return false;
}

function listAllMarkdownFiles() {
  const out = execSync('git ls-files', { encoding: 'utf8', cwd: process.cwd() });
  return out
    .split('\n')
    .map((l) => l.trim())
    .filter((f) => f && /\.(md|mdx)$/.test(f) && includeInGrammarScope(f));
}

function gitNameOnly(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: process.cwd() });
  } catch {
    return '';
  }
}

function listChangedMarkdownFiles(base) {
  const set = new Set();
  gitNameOnly(`git diff --name-only "${base}"...HEAD -- '*.md' '*.mdx'`)
    .split('\n')
    .forEach((f) => f && set.add(f));
  gitNameOnly(`git diff --name-only HEAD -- '*.md' '*.mdx'`)
    .split('\n')
    .forEach((f) => f && set.add(f));
  return [...set].filter((f) => existsSync(f) && includeInGrammarScope(f));
}

async function checkStrippedText(stripped, fileLabel, apiKey, delayMs, requestState) {
  let allMatches = [];
  for (const chunk of chunkText(stripped)) {
    if (requestState.calls > 0 && delayMs > 0) {
      await delay(delayMs);
    }
    requestState.calls += 1;

    let result;
    try {
      result = await gramma.check(chunk, {
        language: 'en-US',
        markdown: true,
        rules: LT_RULES_TECH_DOCS,
        api_key: apiKey || '',
      });
    } catch (e) {
      throw new Error(`${fileLabel}: ${e.message}`);
    }
    const matches = result.matches || [];
    allMatches = allMatches.concat(matches);
  }
  return allMatches;
}

async function main() {
  if (process.env.GRAMMAR_SKIP === '1' || process.env.GRAMMAR_SKIP === 'true') {
    console.log('grammar-check: skipped (GRAMMAR_SKIP)');
    process.exit(0);
  }

  const apiKey = process.env.LANGUAGETOOL_API_KEY || '';
  const grammarAll = process.env.GRAMMAR_ALL === '1' || process.env.GRAMMAR_ALL === 'true';
  const base = process.env.GRAMMAR_BASE || 'release';

  let defaultDelay = 0;
  if (!apiKey) {
    defaultDelay = 3200;
  }
  const delayMs = Math.max(
    0,
    process.env.GRAMMAR_DELAY_MS !== undefined
      ? parseInt(String(process.env.GRAMMAR_DELAY_MS), 10) || 0
      : defaultDelay,
  );

  const maxFiles = process.env.GRAMMAR_MAX_FILES
    ? Math.max(1, parseInt(String(process.env.GRAMMAR_MAX_FILES), 10) || 0)
    : 0;

  let files = grammarAll ? listAllMarkdownFiles() : listChangedMarkdownFiles(base);
  if (maxFiles > 0) {
    files = files.slice(0, maxFiles);
  }

  if (files.length === 0) {
    console.log(
      grammarAll
        ? 'grammar-check: no Markdown files in repo.'
        : `grammar-check: no changed .md/.mdx vs "${base}" (and working tree).`,
    );
    process.exit(0);
  }

  if (!grammarAll && !apiKey) {
    console.log(
      'grammar-check: changed-files mode (set GRAMMAR_ALL=1 for entire repo). Public API is rate-limited; set LANGUAGETOOL_API_KEY for higher limits.',
    );
  }

  let failed = 0;
  let checked = 0;
  const requestState = { calls: 0 };

  for (const file of files) {
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const stripped = stripForGrammarCheck(text);
    if (stripped.length < 30) {
      continue;
    }

    checked++;
    let matches;
    try {
      matches = await checkStrippedText(stripped, file, apiKey, delayMs, requestState);
    } catch (e) {
      console.error(`grammar-check: ${e.message}`);
      process.exit(1);
    }

    if (matches.length > 0) {
      failed++;
      console.error(`\n${file} — ${matches.length} issue(s)`);
      for (const m of matches) {
        const msg = m.message || m.rule?.description || 'issue';
        const ctx = m.context?.text?.trim() || '';
        console.error(`  - ${msg}${ctx ? ` — …${ctx.slice(0, 120)}…` : ''}`);
      }
    }
  }

  if (failed > 0) {
    console.error(`\ngrammar-check: failed (${failed} file(s)).`);
    console.error('Set LANGUAGETOOL_API_KEY or GRAMMAR_DELAY_MS; see README.');
    process.exit(1);
  }

  console.log(`grammar-check: OK (${checked} file(s), ${requestState.calls} LanguageTool request(s)).`);
}

main();
