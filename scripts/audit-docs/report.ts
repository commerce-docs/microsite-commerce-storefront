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

import type { DropinGaps, SdkEventGaps } from './types.js';

export function hasGaps(gaps: DropinGaps): boolean {
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

export function renderGapsReport(
  allGaps: Record<string, DropinGaps>,
  sdkGaps: SdkEventGaps
): string {
  const date = new Date().toISOString().split('T')[0];
  const lines: string[] = [
    `# Documentation Gaps — Storefront Drop-ins`,
    `> Generated: ${date}`,
    `> Source: dropins-mcp registry vs microsite MDX files`,
    '',
  ];

  let totalGaps = 0;

  // --- SDK / common events section ---
  const sdkTotal = sdkGaps.missingFromDocs.length + sdkGaps.phantomInDocs.length;
  if (sdkTotal > 0) {
    totalGaps += sdkTotal;
    lines.push(`## common-events.mdx (${sdkTotal} gaps)`);
    lines.push('');
    if (sdkGaps.missingFromDocs.length > 0) {
      lines.push('### Missing SDK Events');
      lines.push(
        'Events present in the registry (no storefront-* emitter) but absent from `dropins/all/common-events.mdx`.'
      );
      lines.push('');
      lines.push('| Event |');
      lines.push('|---|');
      for (const ev of sdkGaps.missingFromDocs) lines.push(`| \`${ev}\` |`);
      lines.push('');
    }
    if (sdkGaps.phantomInDocs.length > 0) {
      lines.push('### Phantom SDK Events');
      lines.push('Events documented in `common-events.mdx` but absent from the registry.');
      lines.push('');
      lines.push('| Event |');
      lines.push('|---|');
      for (const ev of sdkGaps.phantomInDocs) lines.push(`| \`${ev}\` |`);
      lines.push('');
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
    lines.push('');

    if (gaps.missingContainerPages.length > 0) {
      lines.push('### Missing Container Pages');
      lines.push(
        'Containers present in the registry but with no corresponding MDX documentation page.'
      );
      lines.push('');
      lines.push('| Container |');
      lines.push('|---|');
      for (const name of gaps.missingContainerPages) lines.push(`| \`${name}\` |`);
      lines.push('');
    }

    if (gaps.missingSlots.length > 0) {
      lines.push('### Missing Slots');
      lines.push('Slots present in the registry but absent from slots.mdx.');
      lines.push('');
      lines.push('| Container | Slot |');
      lines.push('|---|---|');
      for (const { container, slot } of gaps.missingSlots)
        lines.push(`| \`${container}\` | \`${slot}\` |`);
      lines.push('');
    }

    if (gaps.phantomSlots.length > 0) {
      lines.push('### Phantom Slots');
      lines.push('Slots documented in slots.mdx but not found in the registry.');
      lines.push('');
      lines.push('| Container | Slot |');
      lines.push('|---|---|');
      for (const { container, slot } of gaps.phantomSlots)
        lines.push(`| \`${container}\` | \`${slot}\` |`);
      lines.push('');
    }

    if (gaps.missingProps.length > 0) {
      lines.push('### Missing Props');
      lines.push('Props present in the registry but absent from the container MDX file.');
      lines.push('');
      lines.push('| Container | Prop | Type |');
      lines.push('|---|---|---|');
      for (const { container, prop, type } of gaps.missingProps) {
        lines.push(`| \`${container}\` | \`${prop}\` | \`${type ?? ''}\` |`);
      }
      lines.push('');
    }

    if (gaps.phantomProps.length > 0) {
      lines.push('### Phantom Props');
      lines.push(
        'Props documented in MDX but not found in the registry. Verify whether these are valid props or should be removed.'
      );
      lines.push('');
      lines.push('| Container | Prop |');
      lines.push('|---|---|');
      for (const { container, prop } of gaps.phantomProps)
        lines.push(`| \`${container}\` | \`${prop}\` |`);
      lines.push('');
    }

    if (gaps.missingFunctions.length > 0) {
      lines.push('### Missing Functions');
      lines.push('Functions present in the registry but absent from functions.mdx.');
      lines.push('');
      lines.push('| Function |');
      lines.push('|---|');
      for (const { fn } of gaps.missingFunctions) lines.push(`| \`${fn}\` |`);
      lines.push('');
    }

    if (gaps.phantomFunctions.length > 0) {
      lines.push('### Phantom Functions');
      lines.push('Functions documented in MDX but not found in the registry.');
      lines.push('');
      lines.push('| Function |');
      lines.push('|---|');
      for (const { fn } of gaps.phantomFunctions) lines.push(`| \`${fn}\` |`);
      lines.push('');
    }

    if (gaps.missingEvents.length > 0) {
      lines.push('### Missing Events');
      lines.push('Events present in the registry but absent from events.mdx.');
      lines.push('');
      lines.push('| Event |');
      lines.push('|---|');
      for (const { event } of gaps.missingEvents) lines.push(`| \`${event}\` |`);
      lines.push('');
    }

    if (gaps.phantomEvents.length > 0) {
      lines.push('### Phantom Events');
      lines.push('Events documented in MDX but not found in the registry.');
      lines.push('');
      lines.push('| Event |');
      lines.push('|---|');
      for (const { event } of gaps.phantomEvents) lines.push(`| \`${event}\` |`);
      lines.push('');
    }

    if (gaps.missingI18nKeys.length > 0) {
      lines.push('### Missing Dictionary Keys');
      lines.push('i18n keys present in the registry but absent from dictionary.mdx.');
      lines.push('');
      lines.push('| Key | Default Value |');
      lines.push('|---|---|');
      for (const { key, value } of gaps.missingI18nKeys) {
        const escaped = (value ?? '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
        lines.push(`| \`${key}\` | ${escaped} |`);
      }
      lines.push('');
    }

    if (gaps.phantomI18nKeys.length > 0) {
      lines.push('### Phantom Dictionary Keys');
      lines.push('i18n keys documented in dictionary.mdx but not found in the registry.');
      lines.push('');
      lines.push('| Key |');
      lines.push('|---|');
      for (const { key } of gaps.phantomI18nKeys) lines.push(`| \`${key}\` |`);
      lines.push('');
    }
  }

  if (totalGaps === 0) {
    lines.push(
      'No documentation gaps found. All registry entries are reflected in the microsite docs.'
    );
  } else {
    lines.unshift(`> **Total gaps: ${totalGaps}**`, '');
  }

  return lines.join('\n');
}
