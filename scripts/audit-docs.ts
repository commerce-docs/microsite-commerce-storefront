#!/usr/bin/env node
/**
 * audit-docs.ts
 *
 * Diffs the dropins-mcp registry (containers.json, api-functions.json,
 * events.json) against the microsite MDX documentation files and writes a
 * DOCS-GAPS.md report to the microsite root.
 *
 * Usage:
 *   npx tsx scripts/audit-docs.ts [--microsite-path <path>] [--registry-path <path>]
 *
 * --registry-path  Path to the dropins-mcp registry directory.
 *                  Defaults to node_modules/@dropins/mcp/dist/registry
 *                  (i.e. the installed npm package).
 *
 * Version comparisons use the live npm registry as the source of truth so that
 * docs updated ahead of the next @dropins/mcp release are not flagged as
 * mismatches. The version bundled in @dropins/mcp is used as a fallback when
 * a package cannot be reached.
 *
 * Exits 1 when gaps are found, 0 when documentation is in sync.
 */

import { existsSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type {
  ContainersRegistry,
  ApiFunctionsRegistry,
  EventsRegistry,
  I18nRegistry,
  DropinGaps,
} from './audit-docs/types.js';
import { isSdkEvent } from './audit-docs/mdx-parsers.js';
import { auditDropin, auditSdkEvents, readJson, DROPIN_PATH_MAP } from './audit-docs/audit.js';
import { hasGaps, renderGapsReport } from './audit-docs/report.js';

const NPM_FETCH_RETRIES = 3;
const NPM_FETCH_RETRY_DELAY_MS = 500;

/**
 * Fetch the latest published version of a single @dropins/{key} package from npm.
 * Retries up to NPM_FETCH_RETRIES times (with linear backoff) before giving up.
 * Returns null when all attempts fail so the caller can fall back gracefully.
 */
async function fetchNpmVersion(key: string): Promise<string | null> {
  const url = `https://registry.npmjs.org/@dropins/${key}/latest`;
  for (let attempt = 1; attempt <= NPM_FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/vnd.npm.install-v1+json' } });
      if (res.ok) {
        const data = (await res.json()) as { version?: string };
        return data.version ?? null;
      }
    } catch {
      // network error — fall through to retry
    }
    if (attempt < NPM_FETCH_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, attempt * NPM_FETCH_RETRY_DELAY_MS));
    }
  }
  return null;
}

/**
 * Fetch the latest published version of each @dropins/{key} package from npm.
 * All packages are queried in parallel (each with its own retry budget) so the
 * total wait time is bounded by one round-trip rather than one per package.
 * Packages that exhaust their retries are omitted from the result so the caller
 * can fall back to the @dropins/mcp registry version for those entries.
 */
async function fetchNpmVersions(dropinKeys: string[]): Promise<Map<string, string>> {
  const versions = new Map<string, string>();
  await Promise.all(
    dropinKeys.map(async (key) => {
      const version = await fetchNpmVersion(key);
      if (version) versions.set(key, version);
    })
  );
  return versions;
}

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, '..');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function requireArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  if (args[idx + 1] === undefined) {
    console.error(`[audit-docs] Error: ${flag} requires a value.`);
    process.exit(1);
  }
  return args[idx + 1];
}

const MICROSITE_PATH = resolve(requireArg('--microsite-path') ?? PROJECT_ROOT);
const REGISTRY_PATH = resolve(
  requireArg('--registry-path') ??
    join(PROJECT_ROOT, 'node_modules', '@dropins', 'mcp', 'dist', 'registry')
);
const OUTPUT_PATH = resolve(requireArg('--output-path') ?? join(MICROSITE_PATH, 'DOCS-GAPS.md'));

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const log = (msg: string) => process.stderr.write(`[audit-docs] ${msg}\n`);

  log(`Microsite path: ${MICROSITE_PATH}`);
  log(`Registry path:  ${REGISTRY_PATH}`);

  if (!existsSync(MICROSITE_PATH)) {
    process.stderr.write(
      `[audit-docs] ERROR: Microsite not found at ${MICROSITE_PATH}\n` +
        `Pass --microsite-path <path> to override.\n`
    );
    process.exit(2);
  }

  if (!existsSync(REGISTRY_PATH)) {
    process.stderr.write(
      `[audit-docs] ERROR: Registry not found at ${REGISTRY_PATH}\n` +
        `Pass --registry-path <path> to override, or install @dropins/mcp as a devDependency.\n`
    );
    process.exit(2);
  }

  const containersRegistry = readJson<ContainersRegistry>(join(REGISTRY_PATH, 'containers.json'));
  const apiFunctionsRegistry = readJson<ApiFunctionsRegistry>(
    join(REGISTRY_PATH, 'api-functions.json')
  );
  const eventsRegistry = readJson<EventsRegistry>(join(REGISTRY_PATH, 'events.json'));
  const i18nRegistry = readJson<I18nRegistry>(join(REGISTRY_PATH, 'i18n.json'));

  const allEvents = eventsRegistry.events ?? [];
  const sdkEvents = new Set(allEvents.filter(isSdkEvent).map((e) => e.name));

  log(`SDK-level events (no storefront-* emitter): ${[...sdkEvents].join(', ') || 'none'}`);

  const sdkGaps = auditSdkEvents(allEvents, MICROSITE_PATH);
  log(
    `common-events.mdx: ${sdkGaps.missingFromDocs.length} missing, ${sdkGaps.phantomInDocs.length} phantom`
  );

  const allGaps: Record<string, DropinGaps> = {};
  let totalDropinsAudited = 0;

  log('Fetching latest versions from npm registry…');
  const npmVersions = await fetchNpmVersions(Object.keys(DROPIN_PATH_MAP));
  log(`npm versions resolved for: ${[...npmVersions.keys()].join(', ') || 'none'}`);

  for (const [dropinKey] of Object.entries(DROPIN_PATH_MAP)) {
    const dropinContainers = containersRegistry.dropins[dropinKey];
    const containers = dropinContainers?.containers ?? [];
    // Prefer the live npm version; fall back to the version bundled in @dropins/mcp.
    const registryVersion = npmVersions.get(dropinKey) ?? dropinContainers?.version;
    const functions = apiFunctionsRegistry.dropins[dropinKey]?.functions ?? [];
    const i18nKeys = i18nRegistry.dropins[dropinKey]?.keys ?? {};

    log(
      `Auditing ${dropinKey} (${containers.length} containers, ${functions.length} functions, ${Object.keys(i18nKeys).length} i18n keys, npm v${registryVersion ?? 'unknown'})`
    );

    allGaps[dropinKey] = auditDropin(
      MICROSITE_PATH,
      dropinKey,
      containers,
      functions,
      allEvents,
      sdkEvents,
      i18nKeys,
      registryVersion
    );
    totalDropinsAudited++;
  }

  log(`Audited ${totalDropinsAudited} drop-ins`);

  const report = renderGapsReport(allGaps, sdkGaps);
  const sdkHasGaps = sdkGaps.missingFromDocs.length > 0 || sdkGaps.phantomInDocs.length > 0;
  const anyGaps = sdkHasGaps || Object.values(allGaps).some(hasGaps);

  if (anyGaps) {
    writeFileSync(OUTPUT_PATH, report, 'utf8');
    log(`Gaps found — report written to ${OUTPUT_PATH}`);
    process.stdout.write(report);
    process.exit(1);
  } else {
    if (existsSync(OUTPUT_PATH)) unlinkSync(OUTPUT_PATH);
    log('No documentation gaps found.');
    process.exit(0);
  }
}

main();
