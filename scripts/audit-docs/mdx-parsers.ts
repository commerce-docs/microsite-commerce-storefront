import type { EventEntry } from './types.js';

/**
 * Returns true if the event is SDK-level: fired by the host/boilerplate layer
 * (no registry-tracked emitter) and consumed by 2+ distinct storefront-* drop-ins.
 * These events have no single owning drop-in and must be documented in common-events.mdx.
 */
export function isSdkEvent(e: EventEntry): boolean {
  if (e.emittedBy.length > 0) return false;
  const uniqueConsumers = new Set(
    e.consumedBy.filter((b) => b.dropin.startsWith('storefront-')).map((b) => b.dropin)
  );
  return uniqueConsumers.size >= 2;
}

/** PascalCase → kebab-case */
export function toKebab(name: string): string {
  return name.replace(/([A-Z])/g, (m, c, idx) => (idx === 0 ? c : '-' + c)).toLowerCase();
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
export function parseMdxProps(content: string): Set<string> {
  const props = new Set<string>();

  // --- Format 1: standard markdown table ---
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
  const optionsBlockRe = /options=\{\[([\s\S]*?)\]\}/g;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = optionsBlockRe.exec(content)) !== null) {
    const block = blockMatch[1];
    const rowRe = /\[\s*['"`]([^'"`\]]+)['"`]/g;
    let rowMatch: RegExpExecArray | null;
    let isFirst = true;
    while ((rowMatch = rowRe.exec(block)) !== null) {
      const name = rowMatch[1].trim();
      if (isFirst) {
        isFirst = false;
        continue;
      }
      if (name.includes('[') || name.includes(']')) continue;
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
export function parseMdxFunctions(content: string): Set<string> {
  const fns = new Set<string>();

  const firstSectionBreak = content.search(/\n## [a-z]/);
  const overviewSection = firstSectionBreak > 0 ? content.slice(0, firstSectionBreak) : content;

  const tableRe = /\|\s*Function\s*\|[^\n]*\n\|[-| ]+\|([\s\S]*?)(?=\n##|\n<\/TableWrapper>|$)/i;
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
 * Anchors on the Direction column to distinguish event rows from payload-field
 * rows or other tables in the same file. Accepted direction values:
 *   - "Emits"
 *   - "Listens"
 *   - "Emits and listens"
 *
 * Matches table rows in the form:
 *   | [`event/name`](#anchor) | Emits | description |
 *   | [event/name](#anchor)   | Listens | description |
 *   | `event/name`            | Emits and listens | description |
 */
export function parseMdxEvents(content: string): Set<string> {
  const events = new Set<string>();
  const rowRe =
    /^\|\s*\[?\`?([a-z][a-zA-Z0-9/_-]*)`?\]?(?:\([^)]*\))?\s*\|\s*(?:Emits and listens|Emits|Listens)/gim;
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(content)) !== null) {
    events.add(match[1].trim());
  }
  return events;
}

/** Recursively flattens a nested JSON object into dot-notation key-value pairs. */
export function flattenKeys(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value as Record<string, unknown>, fullKey));
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
export function parseMdxDictionaryKeys(content: string): Set<string> {
  const keys = new Set<string>();

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
 *   | [`ContainerName`](#anchor)                    | `Slot1`, `Slot2`, `Slot3` |
 *   | [`ContainerName` container (deprecated)](#anchor) | `Slot1`, `Slot2`      |
 *   | [`ContainerName`](#anchor)                    | None                      |
 *
 * The container name is the first \w+ token inside the link brackets, so extra
 * trailing text such as " container (deprecated)" is intentionally ignored.
 *
 * Returns a Map of containerName → Set of slot names.
 * Containers documented as "None" map to an empty Set.
 */
export function parseMdxSlots(content: string): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();

  const tableRe =
    /\|\s*Container\s*\|\s*Slots\s*\|[^\n]*\n\|[-| ]+\|([\s\S]*?)(?=\n##|\n<\/TableWrapper>|$)/i;
  const tableMatch = tableRe.exec(content);
  if (!tableMatch) return result;

  const tableBody = tableMatch[1];
  const rowRe = /^\|\s*\[`?(\w+)`?[^\]]*\]\([^)]+\)[^|]*\|\s*(.*?)\s*\|/gm;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRe.exec(tableBody)) !== null) {
    const containerName = rowMatch[1];
    const slotsStr = rowMatch[2].trim();
    const slots = new Set<string>();

    if (slotsStr.toLowerCase() !== 'none' && slotsStr !== '') {
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

/**
 * Parse the documented drop-in version from an initialization MDX file.
 *
 * Matches the styled version badge used across all drop-in init pages:
 *   <strong>Version: X.Y.Z</strong>
 *
 * Returns the semver string (e.g. "3.2.0") or null when no badge is found.
 */
export function parseMdxVersion(content: string): string | null {
  const match = /<strong>Version:\s*(\d+\.\d+\.\d+)<\/strong>/i.exec(content);
  return match ? match[1] : null;
}

/**
 * Extract event names from the shared common-events.mdx page.
 * Each event has a dedicated `## eventName` section heading.
 */
export function parseSdkEventNames(content: string): Set<string> {
  const events = new Set<string>();
  // Match level-2 headings that look like event names (may contain camelCase segments, / or -)
  const re = /^##\s+[`]?([a-z][a-zA-Z0-9/_-]*)[`]?\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    events.add(match[1]);
  }
  return events;
}
