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

// ---------------------------------------------------------------------------
// Registry types (subset used for auditing)
// ---------------------------------------------------------------------------

export interface ContainerEntry {
  name: string;
  props: Record<string, string>;
  slotNames: string[];
}

export interface DropinContainers {
  version: string;
  containers: ContainerEntry[];
}

export interface ContainersRegistry {
  dropins: Record<string, DropinContainers>;
}

export interface FunctionEntry {
  name: string;
  signature?: string;
}

export interface DropinFunctions {
  version: string;
  functions: FunctionEntry[];
}

export interface ApiFunctionsRegistry {
  dropins: Record<string, DropinFunctions>;
}

export interface EventEntry {
  name: string;
  emittedBy: { dropin: string }[];
  consumedBy: { dropin: string }[];
}

export interface EventsRegistry {
  events: EventEntry[];
}

export interface I18nDropinEntry {
  version: string;
  keyCount: number;
  keys: Record<string, string>;
}

export interface I18nRegistry {
  dropins: Record<string, I18nDropinEntry>;
}

// ---------------------------------------------------------------------------
// Gap types
// ---------------------------------------------------------------------------

export interface PropGap {
  container: string;
  prop: string;
  type?: string;
  reason: 'missing' | 'phantom';
}

export interface FunctionGap {
  fn: string;
  reason: 'missing' | 'phantom';
}

export interface EventGap {
  event: string;
  reason: 'missing' | 'phantom';
}

export interface I18nGap {
  key: string;
  value?: string;
  reason: 'missing' | 'phantom';
}

export interface SlotGap {
  container: string;
  slot: string;
  reason: 'missing' | 'phantom';
}

export interface DropinGaps {
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

export interface SdkEventGaps {
  missingFromDocs: string[]; // in registry (SDK-level) but absent from common-events.mdx
  phantomInDocs: string[]; // in common-events.mdx but absent from registry
}
