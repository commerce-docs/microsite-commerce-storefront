/********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2026 Adobe
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

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  ContainerEntry,
  DropinGaps,
  EventEntry,
  FunctionEntry,
  SdkEventGaps,
} from './types.js';
import {
  isSdkEvent,
  toKebab,
  parseMdxProps,
  parseMdxFunctions,
  parseMdxEvents,
  parseMdxDictionaryKeys,
  parseMdxSlots,
  parseSdkEventNames,
} from './mdx-parsers.js';
import {
  KNOWN_PROP_OMISSIONS,
  KNOWN_FUNCTION_ALIASES,
  KNOWN_EXTRACTOR_GAPS_FUNCTIONS,
  KNOWN_EXTRACTOR_GAPS_EVENTS,
  KNOWN_EXTRACTOR_GAPS_SLOTS,
} from './omissions.js';

/** Maps dropin package names to their microsite documentation path segments. */
export const DROPIN_PATH_MAP: Record<string, string> = {
  'storefront-account': 'dropins/user-account',
  'storefront-auth': 'dropins/user-auth',
  'storefront-cart': 'dropins/cart',
  'storefront-checkout': 'dropins/checkout',
  'storefront-order': 'dropins/order',
  'storefront-payment-services': 'dropins/payment-services',
  'storefront-pdp': 'dropins/product-details',
  'storefront-personalization': 'dropins/personalization',
  'storefront-recommendations': 'dropins/recommendations',
  'storefront-product-discovery': 'dropins/product-discovery',
  'storefront-wishlist': 'dropins/wishlist',
  'storefront-company-management': 'dropins-b2b/company-management',
  'storefront-company-switcher': 'dropins-b2b/company-switcher',
  'storefront-purchase-order': 'dropins-b2b/purchase-order',
  'storefront-quick-order': 'dropins-b2b/quick-order',
  'storefront-quote-management': 'dropins-b2b/quote-management',
  'storefront-requisition-list': 'dropins-b2b/requisition-list',
};

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export function micrositeDocPath(
  micrositePath: string,
  dropinKey: string,
  ...segments: string[]
): string {
  const docPath = DROPIN_PATH_MAP[dropinKey];
  if (!docPath) return '';
  return join(micrositePath, 'src', 'content', 'docs', docPath, ...segments);
}

/** Returns true for entries that are TypeScript enums misclassified as functions. */
function isEnumEntry(fn: FunctionEntry): boolean {
  return !!fn.signature?.match(/\(\.\.\.args\):\s*unknown$/);
}

export function auditDropin(
  micrositePath: string,
  dropinKey: string,
  containers: ContainerEntry[],
  functions: FunctionEntry[],
  events: EventEntry[],
  sdkEvents: Set<string>,
  i18nKeys: Record<string, string>
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

  const FRAMEWORK_PROPS = new Set(['initialData', 'children', 'scope', 'className']);

  // --- Props per container ---
  for (const container of containers) {
    container.props = Object.fromEntries(
      Object.entries(container.props).filter(
        ([prop]) =>
          !prop.startsWith('__test') && !prop.startsWith('_test') && !FRAMEWORK_PROPS.has(prop)
      )
    );
    const containerFile = micrositeDocPath(
      micrositePath,
      dropinKey,
      'containers',
      `${toKebab(container.name)}.mdx`
    );

    if (!existsSync(containerFile)) {
      const hasContent = Object.keys(container.props).length > 0 || container.slotNames.length > 0;
      if (hasContent) gaps.missingContainerPages.push(container.name);
      continue;
    }

    const mdxContent = readFileSync(containerFile, 'utf8');
    const docProps = parseMdxProps(mdxContent);
    const registryProps = new Set(Object.keys(container.props));
    const PHANTOM_SKIP = new Set([...FRAMEWORK_PROPS, 'slots', 'className']);

    for (const prop of registryProps) {
      if (
        !docProps.has(prop) &&
        !KNOWN_PROP_OMISSIONS.has(`${dropinKey}/${container.name}/${prop}`)
      ) {
        gaps.missingProps.push({
          container: container.name,
          prop,
          type: container.props[prop],
          reason: 'missing',
        });
      }
    }
    for (const prop of docProps) {
      if (!registryProps.has(prop) && !PHANTOM_SKIP.has(prop)) {
        gaps.phantomProps.push({ container: container.name, prop, reason: 'phantom' });
      }
    }
  }

  // --- Functions ---
  const publicFunctions = functions.filter(
    (f) =>
      !f.name.startsWith('_') &&
      !isEnumEntry(f) &&
      !KNOWN_FUNCTION_ALIASES.has(`${dropinKey}/${f.name}`)
  );

  const functionsFile = micrositeDocPath(micrositePath, dropinKey, 'functions.mdx');
  if (existsSync(functionsFile)) {
    const mdxContent = readFileSync(functionsFile, 'utf8');
    const docFunctions = parseMdxFunctions(mdxContent);
    const registryFunctions = new Set(publicFunctions.map((f) => f.name));

    for (const fn of registryFunctions) {
      if (!docFunctions.has(fn)) gaps.missingFunctions.push({ fn, reason: 'missing' });
    }
    for (const fn of docFunctions) {
      if (!registryFunctions.has(fn) && !KNOWN_EXTRACTOR_GAPS_FUNCTIONS.has(`${dropinKey}/${fn}`)) {
        gaps.phantomFunctions.push({ fn, reason: 'phantom' });
      }
    }
  } else if (publicFunctions.length > 0) {
    for (const fn of publicFunctions) {
      gaps.missingFunctions.push({ fn: fn.name, reason: 'missing' });
    }
  }

  // --- Events ---
  const eventsFile = micrositeDocPath(micrositePath, dropinKey, 'events.mdx');

  const emittedEvents = new Set(
    events
      .filter((e) => !sdkEvents.has(e.name) && e.emittedBy.some((b) => b.dropin === dropinKey))
      .map((e) => e.name)
  );

  if (existsSync(eventsFile)) {
    const mdxContent = readFileSync(eventsFile, 'utf8');
    const docEvents = parseMdxEvents(mdxContent);

    const relatedEvents = new Set(
      events
        .filter(
          (e) =>
            !sdkEvents.has(e.name) &&
            (e.emittedBy.some((b) => b.dropin === dropinKey) ||
              e.consumedBy.some((b) => b.dropin === dropinKey))
        )
        .map((e) => e.name)
    );

    for (const ev of emittedEvents) {
      if (!docEvents.has(ev)) gaps.missingEvents.push({ event: ev, reason: 'missing' });
    }
    for (const ev of docEvents) {
      if (!relatedEvents.has(ev) && !KNOWN_EXTRACTOR_GAPS_EVENTS.has(`${dropinKey}/${ev}`)) {
        gaps.phantomEvents.push({ event: ev, reason: 'phantom' });
      }
    }
  } else if (emittedEvents.size > 0) {
    for (const ev of emittedEvents) {
      gaps.missingEvents.push({ event: ev, reason: 'missing' });
    }
  }

  // --- Slots ---
  const slotsFile = micrositeDocPath(micrositePath, dropinKey, 'slots.mdx');
  const missingPageSet = new Set(gaps.missingContainerPages);
  const containersWithSlots = containers.filter(
    (c) => c.slotNames.length > 0 && !missingPageSet.has(c.name)
  );
  const registrySlotMap = new Map(containers.map((c) => [c.name, new Set(c.slotNames)]));

  if (existsSync(slotsFile)) {
    const mdxContent = readFileSync(slotsFile, 'utf8');
    const docSlots = parseMdxSlots(mdxContent);

    for (const container of containersWithSlots) {
      const registrySlots = registrySlotMap.get(container.name)!;
      const docContainerSlots = docSlots.get(container.name) ?? new Set<string>();
      for (const slot of registrySlots) {
        if (!docContainerSlots.has(slot)) {
          gaps.missingSlots.push({ container: container.name, slot, reason: 'missing' });
        }
      }
    }
    for (const [containerName, docContainerSlots] of docSlots) {
      const registrySlots = registrySlotMap.get(containerName) ?? new Set<string>();
      for (const slot of docContainerSlots) {
        if (
          !registrySlots.has(slot) &&
          !KNOWN_EXTRACTOR_GAPS_SLOTS.has(`${dropinKey}/${containerName}/${slot}`)
        ) {
          gaps.phantomSlots.push({ container: containerName, slot, reason: 'phantom' });
        }
      }
    }
  } else if (containersWithSlots.length > 0) {
    for (const container of containersWithSlots) {
      for (const slot of container.slotNames) {
        gaps.missingSlots.push({ container: container.name, slot, reason: 'missing' });
      }
    }
  }

  // --- Dictionary / i18n keys ---
  const dictionaryFile = micrositeDocPath(micrositePath, dropinKey, 'dictionary.mdx');
  const registryI18nKeys = new Set(Object.keys(i18nKeys));

  if (registryI18nKeys.size > 0) {
    if (!existsSync(dictionaryFile)) {
      for (const key of registryI18nKeys) {
        gaps.missingI18nKeys.push({ key, value: i18nKeys[key], reason: 'missing' });
      }
    } else {
      const mdxContent = readFileSync(dictionaryFile, 'utf8');
      const docKeys = parseMdxDictionaryKeys(mdxContent);
      for (const key of registryI18nKeys) {
        if (!docKeys.has(key))
          gaps.missingI18nKeys.push({ key, value: i18nKeys[key], reason: 'missing' });
      }
      for (const key of docKeys) {
        if (!registryI18nKeys.has(key)) gaps.phantomI18nKeys.push({ key, reason: 'phantom' });
      }
    }
  }

  return gaps;
}

/**
 * Audit the shared common-events.mdx page against the registry.
 *
 * Two checks:
 * 1. Missing — SDK-level events (no storefront-* emitter, 2+ consumers) must appear in common-events.mdx.
 * 2. Phantom — events in common-events.mdx must exist somewhere in the registry.
 */
export function auditSdkEvents(allEvents: EventEntry[], micrositePath: string): SdkEventGaps {
  const gaps: SdkEventGaps = { missingFromDocs: [], phantomInDocs: [] };

  const commonEventsFile = join(
    micrositePath,
    'src',
    'content',
    'docs',
    'dropins',
    'all',
    'common-events.mdx'
  );

  const sdkRegistryEvents = new Set(allEvents.filter(isSdkEvent).map((e) => e.name));
  const allRegistryEventNames = new Set(allEvents.map((e) => e.name));

  if (!existsSync(commonEventsFile)) {
    for (const name of sdkRegistryEvents) gaps.missingFromDocs.push(name);
    return gaps;
  }

  const content = readFileSync(commonEventsFile, 'utf8');
  const docEvents = parseSdkEventNames(content);

  for (const name of sdkRegistryEvents) {
    if (!docEvents.has(name)) gaps.missingFromDocs.push(name);
  }
  for (const name of docEvents) {
    if (!allRegistryEventNames.has(name)) gaps.phantomInDocs.push(name);
  }

  return gaps;
}
