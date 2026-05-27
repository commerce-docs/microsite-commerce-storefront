#!/usr/bin/env node
/********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2025 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 *******************************************************************/

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
 * Exits 1 when gaps are found, 0 when documentation is in sync.
 */

import { readFileSync, existsSync, writeFileSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const micrositeArgIdx = args.indexOf("--microsite-path");
if (micrositeArgIdx !== -1 && args[micrositeArgIdx + 1] === undefined) {
  console.error("[audit-docs] Error: --microsite-path requires a value.");
  process.exit(1);
}
const MICROSITE_PATH = resolve(
  micrositeArgIdx !== -1
    ? args[micrositeArgIdx + 1]
    : PROJECT_ROOT,
);

const registryArgIdx = args.indexOf("--registry-path");
if (registryArgIdx !== -1 && args[registryArgIdx + 1] === undefined) {
  console.error("[audit-docs] Error: --registry-path requires a value.");
  process.exit(1);
}
const REGISTRY_PATH = resolve(
  registryArgIdx !== -1
    ? args[registryArgIdx + 1]
    : join(PROJECT_ROOT, "node_modules", "@dropins", "mcp", "dist", "registry"),
);

const outputArgIdx = args.indexOf("--output-path");
if (outputArgIdx !== -1 && args[outputArgIdx + 1] === undefined) {
  console.error("[audit-docs] Error: --output-path requires a value.");
  process.exit(1);
}
const OUTPUT_PATH =
  outputArgIdx !== -1
    ? resolve(args[outputArgIdx + 1])
    : join(MICROSITE_PATH, "DOCS-GAPS.md");

// ---------------------------------------------------------------------------
// Drop-in name → microsite path mapping
// ---------------------------------------------------------------------------

const DROPIN_PATH_MAP: Record<string, string> = {
  "storefront-account": "dropins/user-account",
  "storefront-auth": "dropins/user-auth",
  "storefront-cart": "dropins/cart",
  "storefront-checkout": "dropins/checkout",
  "storefront-order": "dropins/order",
  "storefront-payment-services": "dropins/payment-services",
  "storefront-pdp": "dropins/product-details",
  "storefront-personalization": "dropins/personalization",
  "storefront-recommendations": "dropins/recommendations",
  "storefront-product-discovery": "dropins/product-discovery",
  "storefront-wishlist": "dropins/wishlist",
  "storefront-company-management": "dropins-b2b/company-management",
  "storefront-company-switcher": "dropins-b2b/company-switcher",
  "storefront-purchase-order": "dropins-b2b/purchase-order",
  "storefront-quick-order": "dropins-b2b/quick-order",
  "storefront-quote-management": "dropins-b2b/quote-management",
  "storefront-requisition-list": "dropins-b2b/requisition-list",
};

// ---------------------------------------------------------------------------
// Registry types (subset used for auditing)
// ---------------------------------------------------------------------------

interface ContainerEntry {
  name: string;
  props: Record<string, string>;
  slotNames: string[];
}

interface DropinContainers {
  version: string;
  containers: ContainerEntry[];
}

interface ContainersRegistry {
  dropins: Record<string, DropinContainers>;
}

interface FunctionEntry {
  name: string;
  signature?: string;
}

interface DropinFunctions {
  version: string;
  functions: FunctionEntry[];
}

interface ApiFunctionsRegistry {
  dropins: Record<string, DropinFunctions>;
}

interface EventEntry {
  name: string;
  emittedBy: { dropin: string }[];
  consumedBy: { dropin: string }[];
}

interface EventsRegistry {
  events: EventEntry[];
}

interface I18nDropinEntry {
  version: string;
  keyCount: number;
  keys: Record<string, string>;
}

interface I18nRegistry {
  dropins: Record<string, I18nDropinEntry>;
}

// ---------------------------------------------------------------------------
// Gap types
// ---------------------------------------------------------------------------

interface PropGap {
  container: string;
  prop: string;
  type?: string;
  reason: "missing" | "phantom";
}

interface FunctionGap {
  fn: string;
  reason: "missing" | "phantom";
}

interface EventGap {
  event: string;
  reason: "missing" | "phantom";
}

interface I18nGap {
  key: string;
  value?: string;
  reason: "missing" | "phantom";
}

interface SlotGap {
  container: string;
  slot: string;
  reason: "missing" | "phantom";
}

interface DropinGaps {
  missingContainerPages: string[];
  missingProps: PropGap[];
  phantomProps: PropGap[];
  missingFunctions: FunctionGap[];
  phantomFunctions: FunctionGap[];
  missingEvents: EventGap[];
  phantomEvents: EventGap[];
  missingI18nKeys: I18nGap[];
  phantomI18nKeys: I18nGap[];
  missingSlots: SlotGap[];
  phantomSlots: SlotGap[];
}

interface SdkEventGaps {
  missingFromDocs: string[]; // in registry (SDK-level) but absent from common-events.mdx
  phantomInDocs: string[]; // in common-events.mdx but absent from registry
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** PascalCase → kebab-case */
function toKebab(name: string): string {
  return name
    .replace(/([A-Z])/g, (m, c, idx) => (idx === 0 ? c : "-" + c))
    .toLowerCase();
}

/**
 * Parse prop names from MDX content. Handles two formats used in the microsite:
 *
 * 1. Standard markdown table with `| Parameter |` or `| Prop |` header
 *    (used by newer drop-in docs and TableWrapper-wrapped tables)
 *
 * 2. OptionsTable component with array syntax:
 *    options={[
 *      ['Options', 'Type', 'Req?', 'Description'],  ← header row, skipped
 *      ['propName', 'string', 'No', 'description'],  ← data rows
 *    ]}
 */
function parseMdxProps(content: string): Set<string> {
  const props = new Set<string>();

  // --- Format 1: standard markdown table ---
  // Match table sections that start with a Parameter/Prop/Name header.
  const headerRe =
    /\|\s*(?:Parameter|Prop|Name|Option[s]?)\s*\|[^\n]*\n\|[-| ]+\|([\s\S]*?)(?=\n##|\n<\/TableWrapper>|$)/gi;
  let tableMatch: RegExpExecArray | null;
  while ((tableMatch = headerRe.exec(content)) !== null) {
    const tableBody = tableMatch[1];
    const rowRe = /^\|\s*`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s*\|/gm;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRe.exec(tableBody)) !== null) {
      props.add(rowMatch[1]);
    }
  }

  // --- Format 2: OptionsTable array syntax ---
  // Match the full options={[ ... ]} block.
  const optionsBlockRe = /options=\{\[([\s\S]*?)\]\}/g;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = optionsBlockRe.exec(content)) !== null) {
    const block = blockMatch[1];
    // Each row is an array literal: ['propName', 'type', ...]
    // The first row is always the header (e.g. ['Options', 'Type', 'Req?', 'Description']).
    const rowRe = /\[\s*['"`]([^'"`\]]+)['"`]/g;
    let rowMatch: RegExpExecArray | null;
    let isFirst = true;
    while ((rowMatch = rowRe.exec(block)) !== null) {
      const name = rowMatch[1].trim();
      if (isFirst) {
        // Skip the header row — it contains column labels, not prop names.
        isFirst = false;
        continue;
      }
      // Skip slot entries (contain brackets like slots[AddressFormInput_...])
      if (name.includes("[") || name.includes("]")) continue;
      // Only capture valid identifier-like names
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        props.add(name);
      }
    }
  }

  return props;
}

/**
 * Parse function names from the overview table in a functions.mdx file.
 *
 * The overview table appears at the top of the file before any per-function
 * `## functionName` sections and has a `| Function |` header. We stop parsing
 * at the first `## ` heading to avoid matching parameter names from per-function
 * detail tables further down the file.
 */
function parseMdxFunctions(content: string): Set<string> {
  const fns = new Set<string>();

  // Isolate the overview section: everything before the first `## ` heading
  // that follows a blank line (i.e. a top-level section break for function details).
  const firstSectionBreak = content.search(/\n## [a-z]/);
  const overviewSection =
    firstSectionBreak > 0 ? content.slice(0, firstSectionBreak) : content;

  // Match rows like: | [`functionName`](#anchor) | description |
  // Only within the overview table block that starts with a `| Function |` header.
  const tableRe =
    /\|\s*Function\s*\|[^\n]*\n\|[-| ]+\|([\s\S]*?)(?=\n##|\n<\/TableWrapper>|$)/i;
  const tableMatch = tableRe.exec(overviewSection);
  if (!tableMatch) return fns;

  const tableBody = tableMatch[1];
  const rowRe = /^\|\s*\[?\`([a-zA-Z_][a-zA-Z0-9_]*)`\]?[^|]*\|/gm;
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(tableBody)) !== null) {
    fns.add(match[1]);
  }
  return fns;
}

/**
 * Parse event names from an events.mdx file.
 *
 * Anchors on the Direction column (Emits / Listens) to distinguish event rows
 * from payload-field rows or other tables in the same file. This handles
 * single-word event names (e.g. `error`, `authenticated`) as well as
 * slash-separated names (e.g. `auth/error`).
 *
 * Matches table rows in the form:
 *   | [`event/name`](#anchor) | Emits | description |
 *   | [event/name](#anchor)   | Listens | description |
 *   | `event/name`            | Emits | description |
 */
function parseMdxEvents(content: string): Set<string> {
  const events = new Set<string>();
  // Capture: first column (event name), second column must be Emits or Listens.
  const rowRe =
    /^\|\s*\[?\`?([a-z][a-z0-9/_-]*)`?\]?(?:\([^)]*\))?\s*\|\s*(?:Emits|Listens)/gim;
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(content)) !== null) {
    events.add(match[1].trim());
  }
  return events;
}

/** Recursively flattens a nested JSON object into dot-notation key-value pairs. */
function flattenKeys(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result[fullKey] = value;
    } else if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      Object.assign(
        result,
        flattenKeys(value as Record<string, unknown>, fullKey),
      );
    }
  }
  return result;
}

/**
 * Parse i18n keys from a dictionary.mdx file.
 *
 * Each dictionary.mdx contains a fenced JSON code block (```json title="en_US.json")
 * with the full nested dictionary. We extract and flatten it to dot-notation keys for
 * comparison against the registry.
 */
function parseMdxDictionaryKeys(content: string): Set<string> {
  const keys = new Set<string>();

  // Match the JSON code block: ```json title="en_US.json" ... ```
  const jsonBlockRe = /```json[^\n]*\n([\s\S]*?)```/;
  const match = jsonBlockRe.exec(content);
  if (!match) return keys;

  try {
    const parsed = JSON.parse(match[1]) as Record<string, unknown>;
    const flat = flattenKeys(parsed);
    for (const key of Object.keys(flat)) {
      keys.add(key);
    }
  } catch {
    // Malformed JSON — return empty set; the audit will flag everything as missing.
  }

  return keys;
}

/**
 * Parse slot names from a slots.mdx file.
 *
 * The summary table at the top of every slots.mdx associates containers with
 * their slot names. Format:
 *   | [`ContainerName`](#anchor) | `Slot1`, `Slot2`, `Slot3` |
 *   | [`ContainerName`](#anchor) | None |
 *
 * Returns a Map of containerName → Set of slot names.
 * Containers documented as "None" map to an empty Set.
 */
function parseMdxSlots(content: string): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  // Isolate the summary table: starts with `| Container | Slots |` header.
  const tableRe =
    /\|\s*Container\s*\|\s*Slots\s*\|[^\n]*\n\|[-| ]+\|([\s\S]*?)(?=\n##|\n<\/TableWrapper>|$)/i;
  const tableMatch = tableRe.exec(content);
  if (!tableMatch) return result;

  const tableBody = tableMatch[1];
  // Each row: | [`ContainerName`](#anchor) | slot content |
  const rowRe = /^\|\s*\[`?(\w+)`?\]\([^)]+\)[^|]*\|\s*(.*?)\s*\|/gm;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRe.exec(tableBody)) !== null) {
    const containerName = rowMatch[1];
    const slotsStr = rowMatch[2].trim();
    const slots = new Set<string>();

    if (slotsStr.toLowerCase() !== "none" && slotsStr !== "") {
      // Slot names are backtick-quoted and comma-separated.
      const slotRe = /`([^`]+)`/g;
      let slotMatch: RegExpExecArray | null;
      while ((slotMatch = slotRe.exec(slotsStr)) !== null) {
        slots.add(slotMatch[1]);
      }
    }
    result.set(containerName, slots);
  }

  return result;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function micrositeDocPath(dropinKey: string, ...segments: string[]): string {
  const micrositePath = DROPIN_PATH_MAP[dropinKey];
  if (!micrositePath) return "";
  return join(
    MICROSITE_PATH,
    "src",
    "content",
    "docs",
    micrositePath,
    ...segments,
  );
}

/**
 * Extract event names from the shared common-events.mdx page.
 * Each event has a dedicated `## eventName` section heading.
 */
function parseSdkEventNames(content: string): Set<string> {
  const events = new Set<string>();
  // Match level-2 headings that look like event names (lowercase, may contain / or -)
  const re = /^##\s+[`]?([a-z][a-z0-9/_-]*)[`]?\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    events.add(match[1]);
  }
  return events;
}

/**
 * Audit the shared common-events.mdx page against the registry.
 *
 * Two checks:
 * 1. Missing — events with no storefront-* emitter AND 2+ storefront-* consumers
 *    must appear in common-events.mdx (they are host/boilerplate-fired and have
 *    no single owning drop-in to document them).
 * 2. Phantom — events documented in common-events.mdx must exist somewhere in the
 *    registry (any emitter or consumer). This catches stale references even if the
 *    event is not strictly "SDK-level".
 */
function auditSdkEvents(
  allEvents: EventEntry[],
  micrositePath: string,
): SdkEventGaps {
  const gaps: SdkEventGaps = { missingFromDocs: [], phantomInDocs: [] };

  const commonEventsFile = join(
    micrositePath,
    "src",
    "content",
    "docs",
    "dropins",
    "all",
    "common-events.mdx",
  );

  // SDK-level events: no registry-tracked emitter (host/boilerplate-fired),
  // consumed by 2+ distinct storefront-* drop-ins.
  const sdkRegistryEvents = new Set(
    allEvents
      .filter((e) => {
        if (e.emittedBy.length > 0) return false;
        const uniqueConsumers = new Set(
          e.consumedBy
            .filter((b) => b.dropin.startsWith("storefront-"))
            .map((b) => b.dropin),
        );
        return uniqueConsumers.size >= 2;
      })
      .map((e) => e.name),
  );

  // All event names that exist anywhere in the registry — used for phantom detection.
  const allRegistryEventNames = new Set(allEvents.map((e) => e.name));

  if (!existsSync(commonEventsFile)) {
    for (const name of sdkRegistryEvents) {
      gaps.missingFromDocs.push(name);
    }
    return gaps;
  }

  const content = readFileSync(commonEventsFile, "utf8");
  const docEvents = parseSdkEventNames(content);

  // Missing: SDK-level events not documented in common-events.mdx.
  for (const name of sdkRegistryEvents) {
    if (!docEvents.has(name)) {
      gaps.missingFromDocs.push(name);
    }
  }

  // Phantom: events in common-events.mdx that don't exist anywhere in the registry.
  for (const name of docEvents) {
    if (!allRegistryEventNames.has(name)) {
      gaps.phantomInDocs.push(name);
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Known intentional omissions
// ---------------------------------------------------------------------------

/**
 * Props that are present in the TypeScript type but deliberately not documented
 * because the container does not expose them as a public API surface.
 * Key format: "dropin-key/ContainerName/propName"
 */
const KNOWN_PROP_OMISSIONS = new Set([
  "storefront-order/CustomerDetails/withHeader",
  "storefront-account/AddressForm/handleRenderForm",
]);

/**
 * Functions that are re-export aliases of another documented function.
 * The registry extracts both the canonical name and the alias; the alias is
 * documented inline within the canonical function's page, so flagging it as
 * missing would be a false positive.
 * Key format: "dropin-key/functionName"
 */
const KNOWN_FUNCTION_ALIASES = new Set([
  "storefront-checkout/setShippingMethodsOnCart", // alias of setShippingMethods
]);

/**
 * Functions and events that exist in the drop-in source code but are not yet
 * picked up by the registry extractor. The docs are correct; these entries
 * should not be flagged as phantom until the extractor is fixed.
 * Key format: "dropin-key/name"
 */
const KNOWN_EXTRACTOR_GAPS_FUNCTIONS = new Set([
  "storefront-company-management/initialize",
]);

const KNOWN_EXTRACTOR_GAPS_EVENTS = new Set<string>();

const KNOWN_EXTRACTOR_GAPS_SLOTS = new Set<string>();

// ---------------------------------------------------------------------------
// Core diff logic
// ---------------------------------------------------------------------------

/** Returns true for entries that are TypeScript enums misclassified as functions. */
function isEnumEntry(fn: FunctionEntry): boolean {
  // Enum constructors surface in the registry with `...args` and `unknown` return type.
  return !!fn.signature?.match(/\(\.\.\.args\):\s*unknown$/);
}

function auditDropin(
  dropinKey: string,
  containers: ContainerEntry[],
  functions: FunctionEntry[],
  events: EventEntry[],
  sdkEvents: Set<string>,
  i18nKeys: Record<string, string>,
): DropinGaps {
  const gaps: DropinGaps = {
    missingContainerPages: [],
    missingProps: [],
    phantomProps: [],
    missingFunctions: [],
    phantomFunctions: [],
    missingEvents: [],
    phantomEvents: [],
    missingI18nKeys: [],
    phantomI18nKeys: [],
    missingSlots: [],
    phantomSlots: [],
  };

  // Props that are framework-injected by Container<T> or are HTML/styling
  // conventions that do not belong in the registry-vs-docs diff.
  const FRAMEWORK_PROPS = new Set([
    "initialData",
    "children",
    "scope",
    "className", // HTML attribute documented by convention, not in registry
  ]);

  // --- Props per container ---
  for (const container of containers) {
    // Filter test-only and framework-injected props from the registry before diffing.
    container.props = Object.fromEntries(
      Object.entries(container.props).filter(
        ([prop]) =>
          !prop.startsWith("__test") &&
          !prop.startsWith("_test") &&
          !FRAMEWORK_PROPS.has(prop),
      ),
    );
    const containerFile = micrositeDocPath(
      dropinKey,
      "containers",
      `${toKebab(container.name)}.mdx`,
    );

    if (!existsSync(containerFile)) {
      // Entire container page is missing — record once instead of flooding props.
      const hasContent =
        Object.keys(container.props).length > 0 ||
        container.slotNames.length > 0;
      if (hasContent) {
        gaps.missingContainerPages.push(container.name);
      }
      continue;
    }

    const mdxContent = readFileSync(containerFile, "utf8");
    const docProps = parseMdxProps(mdxContent);
    const registryProps = new Set(Object.keys(container.props));

    // Props in registry but not in docs
    for (const prop of registryProps) {
      if (
        !docProps.has(prop) &&
        !KNOWN_PROP_OMISSIONS.has(`${dropinKey}/${container.name}/${prop}`)
      ) {
        gaps.missingProps.push({
          container: container.name,
          prop,
          type: container.props[prop],
          reason: "missing",
        });
      }
    }

    // Props in docs but not in registry (phantom).
    // Skip framework-injected and slot props — they may appear in docs by convention.
    const PHANTOM_SKIP = new Set([...FRAMEWORK_PROPS, "slots", "className"]);
    for (const prop of docProps) {
      if (!registryProps.has(prop) && !PHANTOM_SKIP.has(prop)) {
        gaps.phantomProps.push({
          container: container.name,
          prop,
          reason: "phantom",
        });
      }
    }
  }

  // --- Functions ---
  // Exclude internal helpers (underscore prefix), TypeScript enums misclassified
  // as functions, and known re-export aliases documented inline under their
  // canonical function name.
  const publicFunctions = functions.filter(
    (f) =>
      !f.name.startsWith("_") &&
      !isEnumEntry(f) &&
      !KNOWN_FUNCTION_ALIASES.has(`${dropinKey}/${f.name}`),
  );

  const functionsFile = micrositeDocPath(dropinKey, "functions.mdx");
  if (existsSync(functionsFile)) {
    const mdxContent = readFileSync(functionsFile, "utf8");
    const docFunctions = parseMdxFunctions(mdxContent);
    const registryFunctions = new Set(publicFunctions.map((f) => f.name));

    for (const fn of registryFunctions) {
      if (!docFunctions.has(fn)) {
        gaps.missingFunctions.push({ fn, reason: "missing" });
      }
    }

    for (const fn of docFunctions) {
      if (
        !registryFunctions.has(fn) &&
        !KNOWN_EXTRACTOR_GAPS_FUNCTIONS.has(`${dropinKey}/${fn}`)
      ) {
        gaps.phantomFunctions.push({ fn, reason: "phantom" });
      }
    }
  } else if (publicFunctions.length > 0) {
    for (const fn of publicFunctions) {
      gaps.missingFunctions.push({ fn: fn.name, reason: "missing" });
    }
  }

  // --- Events ---
  const eventsFile = micrositeDocPath(dropinKey, "events.mdx");

  // Events that this drop-in emits — must be documented (excluding SDK-level events
  // which have their own central documentation page).
  const emittedEvents = new Set(
    events
      .filter(
        (e) =>
          !sdkEvents.has(e.name) &&
          e.emittedBy.some((b) => b.dropin === dropinKey),
      )
      .map((e) => e.name),
  );

  if (existsSync(eventsFile)) {
    const mdxContent = readFileSync(eventsFile, "utf8");
    const docEvents = parseMdxEvents(mdxContent);

    // All events related to this drop-in (emitted or consumed) — valid to document.
    const relatedEvents = new Set(
      events
        .filter(
          (e) =>
            !sdkEvents.has(e.name) &&
            (e.emittedBy.some((b) => b.dropin === dropinKey) ||
              e.consumedBy.some((b) => b.dropin === dropinKey)),
        )
        .map((e) => e.name),
    );

    // Missing: emitted by this dropin but not documented.
    for (const ev of emittedEvents) {
      if (!docEvents.has(ev)) {
        gaps.missingEvents.push({ event: ev, reason: "missing" });
      }
    }

    // Phantom: documented but completely unrelated to this dropin in the registry.
    for (const ev of docEvents) {
      if (
        !relatedEvents.has(ev) &&
        !KNOWN_EXTRACTOR_GAPS_EVENTS.has(`${dropinKey}/${ev}`)
      ) {
        gaps.phantomEvents.push({ event: ev, reason: "phantom" });
      }
    }
  } else if (emittedEvents.size > 0) {
    for (const ev of emittedEvents) {
      gaps.missingEvents.push({ event: ev, reason: "missing" });
    }
  }

  // --- Slots ---
  const slotsFile = micrositeDocPath(dropinKey, "slots.mdx");

  // Containers already recorded as missing their whole page — skip their slots
  // to avoid double-reporting. The single missingContainerPages entry is enough.
  const missingPageSet = new Set(gaps.missingContainerPages);

  const containersWithSlots = containers.filter(
    (c) => c.slotNames.length > 0 && !missingPageSet.has(c.name),
  );

  // Full registry lookup: containerName → Set<slotName> (covers ALL containers,
  // including those with 0 slots, so phantom detection is complete).
  const registrySlotMap = new Map(
    containers.map((c) => [c.name, new Set(c.slotNames)]),
  );

  if (existsSync(slotsFile)) {
    const mdxContent = readFileSync(slotsFile, "utf8");
    const docSlots = parseMdxSlots(mdxContent);

    // Missing: slots in registry but absent from docs.
    // Containers already in missingContainerPages are excluded above.
    for (const container of containersWithSlots) {
      const registrySlots = registrySlotMap.get(container.name)!;
      const docContainerSlots =
        docSlots.get(container.name) ?? new Set<string>();

      for (const slot of registrySlots) {
        if (!docContainerSlots.has(slot)) {
          gaps.missingSlots.push({
            container: container.name,
            slot,
            reason: "missing",
          });
        }
      }
    }

    // Phantom: slots documented in slots.mdx but absent from the registry.
    // Iterating docSlots (not containersWithSlots) catches:
    //   1. Stale container rows (container renamed/removed from registry)
    //   2. Containers in registry with 0 slots but still listed in docs
    for (const [containerName, docContainerSlots] of docSlots) {
      const registrySlots =
        registrySlotMap.get(containerName) ?? new Set<string>();

      for (const slot of docContainerSlots) {
        if (
          !registrySlots.has(slot) &&
          !KNOWN_EXTRACTOR_GAPS_SLOTS.has(
            `${dropinKey}/${containerName}/${slot}`,
          )
        ) {
          gaps.phantomSlots.push({
            container: containerName,
            slot,
            reason: "phantom",
          });
        }
      }
    }
  } else if (containersWithSlots.length > 0) {
    for (const container of containersWithSlots) {
      for (const slot of container.slotNames) {
        gaps.missingSlots.push({
          container: container.name,
          slot,
          reason: "missing",
        });
      }
    }
  }

  // --- Dictionary / i18n keys ---
  const dictionaryFile = micrositeDocPath(dropinKey, "dictionary.mdx");
  const registryI18nKeys = new Set(Object.keys(i18nKeys));

  if (registryI18nKeys.size > 0) {
    if (!existsSync(dictionaryFile)) {
      for (const key of registryI18nKeys) {
        gaps.missingI18nKeys.push({
          key,
          value: i18nKeys[key],
          reason: "missing",
        });
      }
    } else {
      const mdxContent = readFileSync(dictionaryFile, "utf8");
      const docKeys = parseMdxDictionaryKeys(mdxContent);

      for (const key of registryI18nKeys) {
        if (!docKeys.has(key)) {
          gaps.missingI18nKeys.push({
            key,
            value: i18nKeys[key],
            reason: "missing",
          });
        }
      }

      for (const key of docKeys) {
        if (!registryI18nKeys.has(key)) {
          gaps.phantomI18nKeys.push({ key, reason: "phantom" });
        }
      }
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function hasGaps(gaps: DropinGaps): boolean {
  return (
    gaps.missingProps.length > 0 ||
    gaps.phantomProps.length > 0 ||
    gaps.missingFunctions.length > 0 ||
    gaps.phantomFunctions.length > 0 ||
    gaps.missingContainerPages.length > 0 ||
    gaps.missingEvents.length > 0 ||
    gaps.phantomEvents.length > 0 ||
    gaps.missingI18nKeys.length > 0 ||
    gaps.phantomI18nKeys.length > 0 ||
    gaps.missingSlots.length > 0 ||
    gaps.phantomSlots.length > 0
  );
}

function renderGapsReport(
  allGaps: Record<string, DropinGaps>,
  sdkGaps: SdkEventGaps,
): string {
  const date = new Date().toISOString().split("T")[0];
  const lines: string[] = [
    `# Documentation Gaps — Storefront Drop-ins`,
    `> Generated: ${date}`,
    `> Source: dropins-mcp registry vs microsite MDX files`,
    "",
  ];

  let totalGaps = 0;

  // --- SDK / common events section ---
  const sdkTotal =
    sdkGaps.missingFromDocs.length + sdkGaps.phantomInDocs.length;
  if (sdkTotal > 0) {
    totalGaps += sdkTotal;
    lines.push(`## common-events.mdx (${sdkTotal} gaps)`);
    lines.push("");
    if (sdkGaps.missingFromDocs.length > 0) {
      lines.push("### Missing SDK Events");
      lines.push(
        "Events present in the registry (no storefront-* emitter) but absent from `dropins/all/common-events.mdx`.",
      );
      lines.push("");
      lines.push("| Event |");
      lines.push("|---|");
      for (const ev of sdkGaps.missingFromDocs) {
        lines.push(`| \`${ev}\` |`);
      }
      lines.push("");
    }
    if (sdkGaps.phantomInDocs.length > 0) {
      lines.push("### Phantom SDK Events");
      lines.push(
        "Events documented in `common-events.mdx` but absent from the registry.",
      );
      lines.push("");
      lines.push("| Event |");
      lines.push("|---|");
      for (const ev of sdkGaps.phantomInDocs) {
        lines.push(`| \`${ev}\` |`);
      }
      lines.push("");
    }
  }

  for (const [dropin, gaps] of Object.entries(allGaps)) {
    if (!hasGaps(gaps)) continue;

    const dropinTotal =
      gaps.missingContainerPages.length +
      gaps.missingProps.length +
      gaps.phantomProps.length +
      gaps.missingFunctions.length +
      gaps.phantomFunctions.length +
      gaps.missingEvents.length +
      gaps.phantomEvents.length +
      gaps.missingI18nKeys.length +
      gaps.phantomI18nKeys.length +
      gaps.missingSlots.length +
      gaps.phantomSlots.length;

    totalGaps += dropinTotal;
    lines.push(`## ${dropin} (${dropinTotal} gaps)`);
    lines.push("");

    if (gaps.missingContainerPages.length > 0) {
      lines.push("### Missing Container Pages");
      lines.push(
        "Containers present in the registry but with no corresponding MDX documentation page.",
      );
      lines.push("");
      lines.push("| Container |");
      lines.push("|---|");
      for (const name of gaps.missingContainerPages) {
        lines.push(`| \`${name}\` |`);
      }
      lines.push("");
    }

    if (gaps.missingSlots.length > 0) {
      lines.push("### Missing Slots");
      lines.push("Slots present in the registry but absent from slots.mdx.");
      lines.push("");
      lines.push("| Container | Slot |");
      lines.push("|---|---|");
      for (const { container, slot } of gaps.missingSlots) {
        lines.push(`| \`${container}\` | \`${slot}\` |`);
      }
      lines.push("");
    }

    if (gaps.phantomSlots.length > 0) {
      lines.push("### Phantom Slots");
      lines.push(
        "Slots documented in slots.mdx but not found in the registry.",
      );
      lines.push("");
      lines.push("| Container | Slot |");
      lines.push("|---|---|");
      for (const { container, slot } of gaps.phantomSlots) {
        lines.push(`| \`${container}\` | \`${slot}\` |`);
      }
      lines.push("");
    }

    if (gaps.missingProps.length > 0) {
      lines.push("### Missing Props");
      lines.push(
        "Props present in the registry but absent from the container MDX file.",
      );
      lines.push("");
      lines.push("| Container | Prop | Type |");
      lines.push("|---|---|---|");
      for (const { container, prop, type } of gaps.missingProps) {
        lines.push(`| \`${container}\` | \`${prop}\` | \`${type ?? ""}\` |`);
      }
      lines.push("");
    }

    if (gaps.phantomProps.length > 0) {
      lines.push("### Phantom Props");
      lines.push(
        "Props documented in MDX but not found in the registry. Verify whether these are valid props or should be removed.",
      );
      lines.push("");
      lines.push("| Container | Prop |");
      lines.push("|---|---|");
      for (const { container, prop } of gaps.phantomProps) {
        lines.push(`| \`${container}\` | \`${prop}\` |`);
      }
      lines.push("");
    }

    if (gaps.missingFunctions.length > 0) {
      lines.push("### Missing Functions");
      lines.push(
        "Functions present in the registry but absent from functions.mdx.",
      );
      lines.push("");
      lines.push("| Function |");
      lines.push("|---|");
      for (const { fn } of gaps.missingFunctions) {
        lines.push(`| \`${fn}\` |`);
      }
      lines.push("");
    }

    if (gaps.phantomFunctions.length > 0) {
      lines.push("### Phantom Functions");
      lines.push("Functions documented in MDX but not found in the registry.");
      lines.push("");
      lines.push("| Function |");
      lines.push("|---|");
      for (const { fn } of gaps.phantomFunctions) {
        lines.push(`| \`${fn}\` |`);
      }
      lines.push("");
    }

    if (gaps.missingEvents.length > 0) {
      lines.push("### Missing Events");
      lines.push("Events present in the registry but absent from events.mdx.");
      lines.push("");
      lines.push("| Event |");
      lines.push("|---|");
      for (const { event } of gaps.missingEvents) {
        lines.push(`| \`${event}\` |`);
      }
      lines.push("");
    }

    if (gaps.phantomEvents.length > 0) {
      lines.push("### Phantom Events");
      lines.push("Events documented in MDX but not found in the registry.");
      lines.push("");
      lines.push("| Event |");
      lines.push("|---|");
      for (const { event } of gaps.phantomEvents) {
        lines.push(`| \`${event}\` |`);
      }
      lines.push("");
    }

    if (gaps.missingI18nKeys.length > 0) {
      lines.push("### Missing Dictionary Keys");
      lines.push(
        "i18n keys present in the registry but absent from dictionary.mdx.",
      );
      lines.push("");
      lines.push("| Key | Default Value |");
      lines.push("|---|---|");
      for (const { key, value } of gaps.missingI18nKeys) {
        const escaped = (value ?? "").replace(/\|/g, "\\|");
        lines.push(`| \`${key}\` | ${escaped} |`);
      }
      lines.push("");
    }

    if (gaps.phantomI18nKeys.length > 0) {
      lines.push("### Phantom Dictionary Keys");
      lines.push(
        "i18n keys documented in dictionary.mdx but not found in the registry.",
      );
      lines.push("");
      lines.push("| Key |");
      lines.push("|---|");
      for (const { key } of gaps.phantomI18nKeys) {
        lines.push(`| \`${key}\` |`);
      }
      lines.push("");
    }
  }

  if (totalGaps === 0) {
    lines.push(
      "No documentation gaps found. All registry entries are reflected in the microsite docs.",
    );
  } else {
    lines.unshift(`> **Total gaps: ${totalGaps}**`, "");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const log = (msg: string) => process.stderr.write(`[audit-docs] ${msg}\n`);

  log(`Microsite path: ${MICROSITE_PATH}`);
  log(`Registry path:  ${REGISTRY_PATH}`);

  if (!existsSync(MICROSITE_PATH)) {
    process.stderr.write(
      `[audit-docs] ERROR: Microsite not found at ${MICROSITE_PATH}\n` +
        `Pass --microsite-path <path> to override.\n`,
    );
    process.exit(2);
  }

  if (!existsSync(REGISTRY_PATH)) {
    process.stderr.write(
      `[audit-docs] ERROR: Registry not found at ${REGISTRY_PATH}\n` +
        `Pass --registry-path <path> to override, or install @dropins/mcp as a devDependency.\n`,
    );
    process.exit(2);
  }

  const containersRegistry = readJson<ContainersRegistry>(
    join(REGISTRY_PATH, "containers.json"),
  );
  const apiFunctionsRegistry = readJson<ApiFunctionsRegistry>(
    join(REGISTRY_PATH, "api-functions.json"),
  );
  const eventsRegistry = readJson<EventsRegistry>(
    join(REGISTRY_PATH, "events.json"),
  );
  const i18nRegistry = readJson<I18nRegistry>(join(REGISTRY_PATH, "i18n.json"));

  const allEvents = eventsRegistry.events ?? [];

  // Derive SDK-level events at runtime.
  // Criteria: no registry-tracked emitter AND consumed by 2+ distinct storefront-* drop-ins.
  // "No registry-tracked emitter" means the event is fired by the host/boilerplate layer,
  // which is not itself a registered drop-in. `locale` is the canonical example.
  // Events that DO have a registry emitter (e.g. `authenticated` from storefront-auth,
  // `cart/data` from storefront-cart) are owned by that drop-in's events.mdx and are
  // not required in common-events.mdx.
  const sdkEvents = new Set(
    allEvents
      .filter((e) => {
        if (e.emittedBy.length > 0) return false;
        const uniqueConsumers = new Set(
          e.consumedBy
            .filter((b) => b.dropin.startsWith("storefront-"))
            .map((b) => b.dropin),
        );
        return uniqueConsumers.size >= 2;
      })
      .map((e) => e.name),
  );

  log(
    `SDK-level events (no storefront-* emitter): ${[...sdkEvents].join(", ") || "none"}`,
  );

  // Audit common-events.mdx against the derived SDK event set.
  const sdkGaps = auditSdkEvents(allEvents, MICROSITE_PATH);
  log(
    `common-events.mdx: ${sdkGaps.missingFromDocs.length} missing, ${sdkGaps.phantomInDocs.length} phantom`,
  );

  const allGaps: Record<string, DropinGaps> = {};
  let totalDropinsAudited = 0;

  for (const [dropinKey, micrositePath] of Object.entries(DROPIN_PATH_MAP)) {
    if (!micrositePath) continue;

    const containers = containersRegistry.dropins[dropinKey]?.containers ?? [];
    const functions = apiFunctionsRegistry.dropins[dropinKey]?.functions ?? [];
    const i18nKeys = i18nRegistry.dropins[dropinKey]?.keys ?? {};
    const i18nKeyCount = Object.keys(i18nKeys).length;

    log(
      `Auditing ${dropinKey} (${containers.length} containers, ${functions.length} functions, ${i18nKeyCount} i18n keys)`,
    );

    allGaps[dropinKey] = auditDropin(
      dropinKey,
      containers,
      functions,
      allEvents,
      sdkEvents,
      i18nKeys,
    );
    totalDropinsAudited++;
  }

  log(`Audited ${totalDropinsAudited} drop-ins`);

  const report = renderGapsReport(allGaps, sdkGaps);
  const outputPath = OUTPUT_PATH;
  const sdkHasGaps =
    sdkGaps.missingFromDocs.length > 0 || sdkGaps.phantomInDocs.length > 0;
  const anyGaps = sdkHasGaps || Object.values(allGaps).some(hasGaps);

  if (anyGaps) {
    writeFileSync(outputPath, report, "utf8");
    log(`Gaps found — report written to ${outputPath}`);
    process.stdout.write(report);
    process.exit(1);
  } else {
    // Remove stale report if it exists
    if (existsSync(outputPath)) {
      unlinkSync(outputPath);
    }
    log("No documentation gaps found.");
    process.exit(0);
  }
}

main();
