/**
 * Empty State Generator
 * 
 * Shared utilities for generating clean, consistent "no items" pages
 * when a drop-in has no functions, events, or other content.
 * 
 * Used by:
 * - Function generator (no functions defined)
 * - Event generator (no drop-in-specific events)
 * - Other generators that need empty state pages
 */

import { cleanVersion } from '../utils.js';

/**
 * Generate simple "no functions" page
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.dropinDisplayName - Display name (e.g., "Payment Services")
 * @param {string} config.version - Version string (e.g., "1.0.3")
 * @param {string} config.repoUrl - Repository URL (optional)
 * @returns {string} Complete MDX content for functions page
 */
export function generateNoFunctionsPage(config) {
  const { dropinDisplayName, version, repoUrl = '' } = config;
  const cleanVersionStr = cleanVersion(version);

  return `---
title: ${dropinDisplayName} Functions
description: API functions provided by the ${dropinDisplayName} drop-in for programmatic control and customization.
sidebar:
  label: Functions
  order: 6
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

{/*
  ⚠️ TEMPLATE USAGE GUIDE ⚠️
  
  This template is used by scripts/@generate-function-docs.js to generate API function documentation.
  
  Placeholders used in this template:
  - DROPIN_NAME → Display name (e.g., "Cart", "Checkout")
  - DROPIN_DISPLAY_NAME → Display name for use in text (e.g., "Cart", "Checkout")
  - DROPIN_VERSION → Version number (e.g., "1.5.1")
  - FUNCTIONS_TABLE → Table listing all functions with brief descriptions
  - FUNCTIONS_CONTENT → All function documentation (generated from source .mdx files)
  
  The script handles:
  - Reading function .mdx files from src/api directories in source repositories
  - Cleaning Storybook imports and metadata
  - Combining all functions into a single documentation page
  
  The template and script must be kept in sync.
  
  HEADING HIERARCHY:
  H1: "DROPIN_NAME functions" (from title)
  H2: Individual function names
  H3: Examples, Events, Returns (subsection headings)
  Content flow: [Signature code block] → [Parameters table] → Examples → Events → Returns
*/}

import TableWrapper from '@components/TableWrapper.astro';
import Link from '@components/Link.astro';
import { Aside } from '@astrojs/starlight/components';

This drop-in currently has no functions defined.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanVersionStr}</strong>
</div>

{/* AUTO-GENERATED CONTENT - Do not edit below this line */}




${repoUrl ? `\n{/* This documentation is auto-generated from the drop-in source repository: ${repoUrl} */}` : ''}
`;
}

/**
 * Generate simple "no events" page
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.dropinDisplayName - Display name (e.g., "Payment Services")
 * @param {string} config.version - Version string (e.g., "1.0.3")
 * @returns {string} Complete MDX content for events page
 */
export function generateNoEventsPage(config) {
  const { dropinDisplayName, version } = config;
  const cleanVersionStr = cleanVersion(version);

  return `---
title: ${dropinDisplayName} Data & Events
description: Learn about the events used by the ${dropinDisplayName} and the data available within the events.
sidebar:
  label: Events
  order: 5
---

import { Aside } from '@astrojs/starlight/components';

This drop-in does not emit or listen to any drop-in-specific events.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanVersionStr}</strong>
</div>
`;
}

/**
 * Generate simple "no containers" page
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.dropinDisplayName - Display name
 * @param {string} config.version - Version string
 * @returns {string} Complete MDX content for containers index page
 */
export function generateNoContainersPage(config) {
  const { dropinDisplayName, version } = config;
  const cleanVersionStr = cleanVersion(version);

  return `---
title: ${dropinDisplayName} Containers
description: React containers provided by the ${dropinDisplayName} drop-in.
sidebar:
  label: Containers
  order: 3
---

This drop-in currently has no containers defined.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanVersionStr}</strong>
</div>
`;
}

/**
 * Generate simple "no slots" page
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.dropinDisplayName - Display name
 * @param {string} config.version - Version string
 * @returns {string} Complete MDX content for slots page
 */
export function generateNoSlotsPage(config) {
  const { dropinDisplayName, version } = config;
  const cleanVersionStr = cleanVersion(version);

  return `---
title: ${dropinDisplayName} Slots
description: Customizable slots provided by the ${dropinDisplayName} drop-in.
sidebar:
  label: Slots
  order: 4
---

This drop-in currently has no customizable slots defined.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanVersionStr}</strong>
</div>

For information about slots in general, see the [slots documentation](/customize/slots/).
`;
}

/**
 * Generate simple "no dictionary" page
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.dropinDisplayName - Display name
 * @param {string} config.version - Version string
 * @returns {string} Complete MDX content for dictionary page
 */
export function generateNoDictionaryPage(config) {
  const { dropinDisplayName, version } = config;
  const cleanVersionStr = cleanVersion(version);

  return `---
title: ${dropinDisplayName} Dictionary
description: Customize user-facing text and labels in the ${dropinDisplayName} drop-in for localization and branding.
sidebar:
  label: Dictionary
  order: 8
---

This drop-in currently has no dictionary defined.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanVersionStr}</strong>
</div>
`;
}


