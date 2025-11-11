# Documentation Automation Scripts

This directory contains automation tools for managing drop-in documentation, including:
- **Dropin Management CLI** - Create and remove drop-in components
- **Documentation Generators** - Auto-generate function and event documentation
- **Shared Library** - Reusable utilities for all generators

## Table of Contents

1. [Dropin Management CLI](#dropin-management-cli)
2. [Documentation Generators](#documentation-generators)
3. [Shared Library](#shared-library)

---

# Dropin Management CLI

Create and remove drop-in components for the Commerce Storefront documentation.

## Quick Start

```bash
pnpm dropins
```

The CLI will ask what you want to do:

1. **Create a new dropin**
2. **Remove an existing dropin or page**

### Creating drop-ins

The CLI follows this sequence:

1. **Main menu**: Choose to create or remove a dropin
2. **Dropin name**: Enter the dropin name (e.g., "Product Search")
3. **Type selection**: Choose B2B or B2C
4. **Confirmation**: Confirm the dropin details before creation

The CLI then automatically handles all the setup and configuration for you.

## What it creates

**B2C drop-ins**: `src/content/docs/dropins/[name]/`  
**B2B drop-ins**: `src/content/docs/dropins-b2b/[name]/`

```
[dropin-folder]/
├── overview.mdx
├── installation.mdx
├── initialization.mdx
├── containers/
│   ├── index.mdx              ← Container overview
│   ├── container-one.mdx      ← ContainerOne template
│   └── container-two.mdx      ← ContainerTwo template
├── data-events.mdx
├── functions.mdx
└── dictionary.mdx
```

### Removing drop-ins

The CLI can remove:

1. **Entire drop-ins** (all files, folders, and sidebar entries)
2. **Individual pages** (single files within a dropin)

## Features

- ✅ **Auto-generates** folder structure and template files
- ✅ **Automatic placeholder resolution** (`DROPIN_NAME`, `DROPIN_PACKAGE`, `DROPINS_BASE_PATH`)
- ✅ **Smart path handling** (B2C: `/dropins/`, B2B: `/dropins-b2b/`)
- ✅ **Updates sidebar** (both B2C and B2B drop-ins)
- ✅ **Two-container system** (ContainerOne + ContainerTwo templates)
- ✅ **Container overview** with card-based navigation
- ✅ **Removes drop-ins** and their sidebar entries completely
- ✅ **Removes individual pages** from drop-ins
- ✅ **Alphabetical insertion** - new drop-ins are placed in alphabetical order
- ✅ **Robust removal** - completely removes dropin objects from sidebar
- ✅ **No merge conflicts** - registry is auto-generated from file system

## Placeholder Resolution

The CLI automatically resolves placeholders in dropin templates, providing a hybrid approach that handles mechanical replacements while preserving placeholders that require developer customization.

### Automatic Resolution

The CLI automatically resolves these placeholders when creating a dropin:

| Placeholder | Resolved Value | Example |
|-------------|----------------|---------|
| `DROPIN_NAME` | Actual component name | `Quote Management` |
| `DROPIN_PACKAGE` | Package name (kebab-case) | `quote-management` |
| `DROPINS_BASE_PATH` | Base path (`dropins` or `dropins-b2b`) | `dropins-b2b` |

### Template Processing Example

**Before (Template):**
```markdown
---
title: DROPIN_NAME overview
description: Learn about the features and functions of the DROPIN_NAME drop-in component.
---

{/* DESCRIBE the main functionality and purpose of the DROPIN_NAME drop-in component. */}

Visit the [DROPIN_NAME installation](/DROPINS_BASE_PATH/DROPIN_PACKAGE/installation/) page to get started.

## Available slots

| Slot | Purpose | Required |
|------|---------|----------|
| SLOT_NAME | DESCRIPTION of what this slot does | Yes/No |
```

**After (CLI Processing):**
```markdown
---
title: Quote Management overview
description: Learn about the features and functions of the Quote Management drop-in component.
---

{/* DESCRIBE the main functionality and purpose of the Quote Management drop-in component. */}

Visit the [Quote Management installation](/dropins-b2b/quote-management/installation/) page to get started.

## Available slots

| Slot | Purpose | Required |
|------|---------|----------|
| SLOT_NAME | DESCRIPTION of what this slot does | Yes/No |
```

### Manual Customization Required

Developers still need to customize these placeholders:

1. **`{/* DESCRIBE ... */}`** → Actual descriptive content
2. **`SLOT_NAME`** → Specific slot names (e.g., "Header", "QuoteDetails")
3. **`FUNCTION_NAME`** → Specific function names (e.g., "createQuote", "updateQuote")
4. **`COMMERCE_FEATURE_NAME`** → Specific Commerce features
5. **`DESCRIPTION`** → Specific descriptions and explanations
6. **`ISSUE_NAME`** → Specific troubleshooting issues
7. **`PRACTICE_NAME`** → Specific best practices
8. **`FEATURE_NAME`** → Specific features

### Benefits

1. **Efficiency**: CLI handles repetitive, mechanical replacements
2. **Accuracy**: No typos in component names, package names, or paths
3. **Consistency**: All instances are replaced uniformly
4. **Flexibility**: Developers still customize content-specific placeholders
5. **Quality**: Forces developers to think about actual functionality

## Examples

### Creating a drop-in

```bash
$ pnpm dropins

🚀 Dropin Management CLI
========================

What would you like to do?
  1. Create a new dropin
  2. Remove an existing dropin or page

Select option (1 or 2): 1

Enter the dropin name: Quotes Management

Is this a B2B or B2C dropin?
  1. B2B
  2. B2C

Select option (1 or 2): 1

📝 Dropin will be created as:
   Name: Quotes Management
   Package: quotes-management
   Type: B2B
   Location: src/content/docs/dropins/quotes-management/

Create B2C dropin "Quotes Management"? (Y/n): [Press Enter]

✅ Dropin creation completed successfully!
```

### Removing a drop-in

```bash
$ pnpm dropins

🚀 Dropin Management CLI
========================

What would you like to do?
  1. Create a new dropin
  2. Remove an existing dropin or page

Select option (1 or 2): 2

Available dropins:
  1. quote-management (B2B)

Select a dropin to remove (number) or "cancel": 1

What would you like to remove for "quotes-management"?
  1. Entire dropin (all files and folders)
  2. Individual pages

Select option (1 or 2): 1

⚠️  Are you sure you want to remove the entire "quotes-management" dropin? (Y/n): [Press Enter]

✅ Removed dropin folder: src/content/docs/dropins/quotes-management
✅ Removed sidebar entry for "quotes-management"
✅ Successfully removed "quotes-management" dropin!
```

## Reliability

The CLI has been extensively tested and improved to ensure:

- **Complete removal** - no leftover sidebar entries or fragments
- **Alphabetical ordering** - new drop-ins are inserted in the correct position
- **No merge conflicts** - registry is generated dynamically from the file system
- **Debugging output** - detailed output shows exactly what's happening

## Next Steps

1. Review and customize the generated files
2. Add specific containers to the `containers/` folder
3. Update content to match your dropin's functionality

---

# Documentation Generators

Automated generators for creating function and event documentation from drop-in source repositories.

## Source-First Principle 🎯

**ALL generators prioritize data extraction from source repositories over manual enrichment files.**

### Version Management

The generator workflow ensures documentation matches the exact version in production:

1. **Clone Boilerplate** → Clones/updates `aem-boilerplate-commerce` (main branch)
2. **Read Versions** → Extracts `@dropins/*` package versions from `package.json`
3. **Clone Drop-ins** → For each drop-in, clones the **specific tagged version** (e.g., `v1.2.3`)
4. **Extract Data** → Reads actual source code, examples, JSDoc, tests
5. **Generate Docs** → Creates documentation from verified, working code

### What Gets Extracted from Source

| Data Type | Source Locations | Priority |
|-----------|------------------|----------|
| **Function Signatures** | TypeScript definitions | Always from source |
| **Parameters** | TypeScript interfaces | Always from source |
| **Return Types** | TypeScript types | Always from source |
| **Usage Examples** | JSDoc → HTML examples → Boilerplate blocks | Source first, enrichment fallback |
| **Event Emissions** | `events.emit()` calls in source | Always from source |
| **Event Listeners** | `events.on()` calls in source | Always from source |

### Repository Structure

```
.temp-repos/
├── boilerplate/              # Main branch (determines versions)
│   ├── package.json         # Source of truth for @dropin versions
│   └── blocks/              # Real-world usage examples
│       ├── product-details/
│       ├── product-list-page/
│       └── commerce-cart/
├── cart/                    # Tagged version (e.g., v1.2.3)
│   ├── src/api/            # Function source code
│   ├── examples/           # HTML example demonstrations
│   └── tests/              # Test files with usage examples
├── checkout/                # Tagged version
├── order/                  # Tagged version
└── ...                     # All other drop-ins at tagged versions
```

### Enrichment Files (Fallback Only)

Manual enrichment files in `_dropin-enrichments/` are used **only when**:
- Source code lacks necessary documentation
- Additional business context is needed
- Examples in source are insufficient

**Rule:** If it exists in source code, extract it. Don't maintain it manually.

## Master Command - Generate All Documentation ⭐

**Run all 9 generators at once** to regenerate the entire documentation site (500+ pages):

```bash
# Run all generators sequentially
npm run generate-all-docs

# Dry run (preview what will be generated without running)
npm run generate-all-docs -- --dry-run
```

**What it does:**
- ✅ Runs all 9 generators in sequence
- ✅ Provides progress updates for each generator
- ✅ Shows timing for each generator
- ✅ Handles errors gracefully (asks to continue on failure)
- ✅ Displays comprehensive summary at the end

**Generated documentation:**
- **70+ drop-in pages** (functions, events, containers, slots, dictionaries, installation, initialization)
- **33 boilerplate pages** (technical documentation)
- **29 merchant block pages** (business user documentation)
- **500+ total pages**

**Estimated time:** 15-20 minutes

**Use cases:**
- Testing all generators after framework changes
- Regenerating all docs after drop-in updates
- Verifying complete documentation pipeline
- CI/CD integration for automated doc updates

**Example output:**
```
======================================================================
  MASTER DOCUMENTATION GENERATOR
======================================================================

📚 This will regenerate ALL documentation (500+ pages)
⏱️  Estimated total time: 15-20 minutes

[1/9] Running Functions Generator...
✅ Functions completed in 134.2s

[2/9] Running Events Generator...
✅ Events completed in 128.5s

...

📊 SUMMARY:
   ✅ Successful: 9/9
   ⏱️  Total time: 18.4 minutes

✨ All generators completed successfully!
```

>>>>>>> origin/develop
## Available Generators

### Function Documentation Generator

Generates comprehensive function documentation by scanning drop-in repositories.

```bash
# Generate for all drop-ins
npm run generate-function-docs

# Generate for specific drop-in
npm run generate-function-docs cart
```

**Output**: `src/content/docs/dropins/{dropin-name}/functions.mdx`

**Features**:
- Scans `src/api/` directories for function MDX files
- Extracts TypeScript function signatures
- Supports enrichment data for manual descriptions
- Auto-updates sidebar navigation

### Event Documentation Generator

Generates event documentation by scanning for event emissions and listeners.

```bash
# Generate for all drop-ins
npm run generate-event-docs

# Generate for specific drop-in
npm run generate-event-docs cart
```

**Output**: `src/content/docs/dropins/{dropin-name}/events.mdx`

**Features**:
- Scans source code for `events.emit()` and `events.on()`
- Extracts TypeScript type definitions
- Identifies documented vs undocumented events
- Supports enrichment data for event descriptions
- Auto-updates sidebar navigation

### Container Documentation Generator

Generates container documentation by scanning for TypeScript container definitions.

```bash
# Generate for all drop-ins
npm run generate-container-docs

# Generate for specific drop-in
npm run generate-container-docs cart
```

**Output**: `src/content/docs/dropins/{dropin-name}/containers/{container-name}.mdx` (multiple files)

**Features**:
- Scans `src/containers/` directories for `.tsx` files
- Extracts Props interfaces from TypeScript
- Parses JSDoc comments for property descriptions
- Generates fallback descriptions for undocumented props
- Extracts and documents slots
- Creates usage examples
- Generates overview page with all containers
- Supports enrichment data for container descriptions
- Auto-updates sidebar navigation

**Unique**: This generator creates **multiple files** (one per container) plus an overview page, unlike other generators that create a single file.

### Slot Documentation Generator

Generates slot documentation by scanning for slot definitions in container files.

```bash
# Generate for all drop-ins
npm run generate-slot-docs

# Generate for specific drop-in
npm run generate-slot-docs cart
```

**Output**: `src/content/docs/dropins/{dropin-name}/slots.mdx`

**Features**:
- Scans `src/containers/` directories for `.tsx` files
- Extracts Props interfaces with slots definitions
- Parses TypeScript slot types
- Generates complete slot interfaces for each container
- Creates placeholder usage examples for each slot
- Supports enrichment data for slot descriptions
- Auto-updates sidebar navigation

### Styles Documentation Generator

Generates CSS styling documentation by analyzing drop-in component stylesheets and design token usage. **Also generates a comprehensive design tokens reference** in the universal styling guide.

```bash
# Generate for all drop-ins
npm run generate-styles-docs

# Generate for specific drop-in
npm run generate-styles-docs cart
```

**Output**: 
- `src/content/docs/dropins/{dropin-name}/styles.mdx` - Drop-in specific styles
- `src/content/docs/dropins/all/styling.mdx` - Universal guide with complete design tokens reference

**Features**:
- Scans `src/components/` and `src/containers/` directories for `.css` files
- Extracts CSS class names using BEM-like naming conventions
- **Extracts ALL design tokens from boilerplate with actual default values**
- **Generates comprehensive, categorized design tokens reference** (colors, spacing, typography, shapes, grid)
- Analyzes design token usage (colors, spacing, typography, etc.)
- Identifies responsive patterns and media queries
- Generates real CSS examples from actual component files
- Groups classes and tokens by component
- **Organizes tokens by category** with collapsible sections for large groups
- Provides customization examples and best practices
- Auto-updates sidebar navigation

**Design Tokens Reference**:
The generator automatically updates the universal styling guide (`dropins/all/styling.mdx`) with a complete, categorized list of all available design tokens extracted from the boilerplate's `styles/styles.css`. This eliminates the need for developers to navigate GitHub to find token values—everything is documented in one searchable location with actual default values shown.

### Dictionary Documentation Generator

Generates dictionary documentation by extracting i18n strings from source repositories.

```bash
# Generate for all drop-ins
npm run generate-dictionary-docs

# Generate for specific drop-in
npm run generate-dictionary-docs cart
```

**Output**: `src/content/docs/dropins/{dropin-name}/dictionary.mdx`

**Features**:
- Scans for `i18n/en_US.json` files in multiple locations
- Extracts all dictionary keys and values
- Formats JSON content for easy reference
- Counts total number of keys
- Generates usage instructions and examples
- Supports enrichment data for additional documentation
- Auto-updates sidebar navigation

### Installation Documentation Generator

Generates comprehensive installation documentation with package setup, imports, and configuration.

```bash
# Generate for all drop-ins
npm run generate-installation-docs

# Generate for specific drop-in
npm run generate-installation-docs cart
```

**Output**: `src/content/docs/dropins/{dropin-name}/installation.mdx`

**Features**:
- Extracts package names and versions from package.json
- Identifies available containers for import examples
- Generates accurate importmap configurations
- Creates step-by-step installation guides
- Includes version information and container counts
- Provides usage examples with actual container names
- Supports enrichment data for custom instructions

### Initialization Documentation Generator

Generates initialization documentation by parsing TypeScript configuration from initialize.ts files.

```bash
# Generate for all drop-ins
npm run generate-initialization-docs

# Generate for specific drop-in
npm run generate-initialization-docs cart
```

**Output**: `src/content/docs/dropins/{dropin-name}/initialization.mdx`

**Features**:
- Parses TypeScript ConfigProps from initialize.ts files
- Extracts property names, types, and generates descriptions
- Identifies available models from data/models directories
- Generates configuration options tables
- Creates examples with actual model names
- Supports enrichment data for detailed configuration documentation

### Boilerplate Documentation Generator

Generates comprehensive documentation for the AEM Commerce boilerplate by analyzing the repository structure and blocks.

```bash
# Generate all boilerplate documentation
npm run generate-boilerplate-docs
```

**Output**: Multiple MDX files in `src/content/docs/boilerplate/`

**Features**:
- Analyzes commerce blocks from the boilerplate repository
- Generates overview page with CardGrid of all blocks
- Creates individual documentation pages for each block (30+ pages)
- Extracts drop-in usage, containers, events, and API calls
- Generates project structure documentation
- Generates build process documentation
- Generates configuration documentation
- Auto-updates sidebar navigation

**Unique Characteristics**:
- Multi-file output (unlike other generators)
- Analyzes a single repository (AEM boilerplate)
- Uses content transformation utilities for cleanup

### Merchant Block Documentation Generator

Generates merchant-focused documentation for commerce blocks, emphasizing document authoring and business user perspective.

```bash
# Generate all merchant block documentation
npm run generate-merchant-block-docs
```

**Output**: Multiple MDX files in `src/content/docs/merchants/blocks/`

**Features**:
- Generates merchant-friendly documentation (non-technical language)
- Extracts configuration options from block README files
- Creates practical examples and configuration tables
- Provides merchant-specific tips and best practices
- Links to related technical documentation
- Focuses on document-based authoring approach

**Unique Characteristics**:
- Business user perspective (not developer)
- Emphasizes AEM document authoring
- Multi-file output (29+ block pages)
- Complements technical boilerplate documentation

>>>>>>> origin/develop
## Enrichment System

Enrichment files allow you to preserve high-quality, manually written documentation while benefiting from automated generation.

**Location**: `_dropin-enrichments/{dropin-name}/`

**Supported Files**:
- `functions.json` - Function descriptions, metadata, and **accurate type signatures**
- `events.json` - Event descriptions and use cases
- `containers.json` - Container descriptions and configuration
- `slots.json` - Slot descriptions and customization examples
- `dictionary.json` - Additional documentation for i18n keys
- `installation.json` - Custom installation instructions and requirements
- `initialization.json` - Additional configuration documentation

### Signature Enrichment (Type Accuracy)

When TypeScript source files lack explicit return type annotations, the generator infers `Promise<any>` or `any` as a safe fallback. For accurate documentation, you can override these with correct types in enrichment files.

**Run the audit tool to find functions needing type enrichment:**

```bash
# Audit specific drop-in
npm run audit-signatures cart

# Or run directly
node scripts/audit-signatures.js cart
```

**Example output:**
```
⚠️  Functions needing manual type enrichment:
----------------------------------------------------------------------
   createGuestCart
      Inferred: Promise<any>
      Action: Add to _dropin-enrichments/cart/functions.json
```

**Add accurate signature to enrichment file:**

```json
{
  "createGuestCart": {
    "signature": {
      "params": "",
      "returnType": "Promise<string>"
    }
  }
}
```

The generator will use your enriched signature instead of the inferred one, ensuring accurate documentation.

### Example: Event Enrichment

```json
{
  "cart:updated": {
    "description": "Fired when the cart is updated with new items, quantities, or pricing information.",
    "useCase": "Use this event to sync cart state with external systems or trigger UI updates."
  }
}
```

When the generator runs:
1. It scans the source repository for events
2. If an enrichment exists, it uses the enriched description
3. Otherwise, it generates a description from the code

**Benefits**:
- Preserve manually written, high-quality descriptions
- Keep API signatures and types up-to-date automatically
- Reduce maintenance burden
- Ensure consistency across documentation

---

# Reference Documentation System

The project includes a lightweight reference documentation system for linking to external documentation sources (e.g., AEM.live).

## Overview

Rather than scraping and maintaining local copies of external docs, the system provides a centralized registry of reference URLs that enrichment files and generators can use to create consistent, accurate links.

**Location**: `reference-docs.json` (root of project)

## Available References

### AEM.live Documentation

The system includes **40+ indexed topics** from the official [AEM.live documentation](https://www.aem.live/docs/):

- Developer topics: blocks, spreadsheets, indexing, custom headers, etc.
- Authoring topics: content creation, AEM authoring, bulk metadata, etc.
- Launch topics: CDN setup, redirects, sitemap, go-live checklist, etc.
- Architecture topics: security, global CDN, anti-patterns, etc.

## Using Reference Links

### In Enrichment Files

Reference external documentation directly in your enrichment JSON:

```json
{
  "myFunction": {
    "description": "This function integrates with [AEM blocks](https://www.aem.live/developer/block-collection) to render content. For data sources, see the [spreadsheets documentation](https://www.aem.live/developer/spreadsheets)."
  }
}
```

### In Generator Scripts

Programmatically access reference URLs:

```javascript
import { getReferenceUrl, createReferenceLink } from './lib/reference-docs.js';

// Get a specific URL
const url = getReferenceUrl('aem-live', 'block-collection');
// Returns: "https://www.aem.live/developer/block-collection"

// Create a markdown link
const link = createReferenceLink('aem-live', 'authoring', 'Learn about authoring');
// Returns: "[Learn about authoring](https://www.aem.live/docs/authoring)"
```

## CLI Tools

### List All References

Display all available reference documentation sources and topics:

```bash
npm run list-reference-docs
```

**Output:**
```
📚 Available Reference Documentation Sources:

Adobe Experience Manager - Edge Delivery Services
  Base URL: https://www.aem.live/docs/
  Description: Official AEM Edge Delivery Services documentation
  Topics: 40

💡 Usage Examples:
  - Get URL: getReferenceUrl("aem-live", "authoring")
  - Create Link: createReferenceLink("aem-live", "block-collection")
```

### Search for Topics

Search across all reference documentation:

```bash
npm run list-reference-docs -- search authoring
npm run list-reference-docs -- search security
npm run list-reference-docs -- search blocks
```

### List Topics for a Source

Show all available topics for a specific source:

```bash
npm run list-reference-docs -- list aem-live
```

**Output:**
```
📖 Topics in 'aem-live':

  developer-tutorial
    Title: Developer Tutorial
    URL: https://www.aem.live/developer/tutorial
    Description: Get up-and-running with a new project
  
  block-collection
    Title: Block Collection
    URL: https://www.aem.live/developer/block-collection
    Description: Product blocks and recommended blueprints
  
  ... (40+ topics)
```

## Available Helper Functions

The `scripts/lib/reference-docs.js` module provides:

```javascript
import { 
  getReferenceUrl,           // Get URL by source and topic key
  getReferenceTopic,         // Get topic info (title, description, URL)
  createReferenceLink,       // Create markdown link
  getAllTopics,              // Get all topics for a source
  searchTopics,              // Search by keyword
  listSources,               // List all available sources
  displayReferenceInfo       // Display CLI info
} from './lib/reference-docs.js';
```

## Adding New Reference Sources

To add a new reference documentation source:

1. Edit `reference-docs.json`
2. Add a new source under `references`:

```json
{
  "references": {
    "aem-live": { ... },
    "my-new-source": {
      "name": "My Documentation Source",
      "base_url": "https://docs.example.com/",
      "description": "Description of the documentation",
      "topics": {
        "getting-started": {
          "url": "https://docs.example.com/getting-started",
          "title": "Getting Started",
          "description": "Introduction and setup guide"
        }
      }
    }
  }
}
```

3. The CLI and helper functions will automatically pick up the new source

## Benefits

- ✅ **Centralized** - All reference links in one place
- ✅ **Maintainable** - Update URLs once, reflected everywhere
- ✅ **Consistent** - Standardized linking across all docs
- ✅ **Discoverable** - Search and explore available references
- ✅ **No Scraping** - Links to live documentation, always up-to-date
- ✅ **Lightweight** - Just configuration, no cached files

---

# Shared Library

The `scripts/lib/` directory contains reusable utilities used by all generators and scripts.

## Architecture Benefits

✅ **DRY Principle** - Write features once, use everywhere  
✅ **Easy Maintenance** - Update shared code in one place  
✅ **Independent Generators** - Each generator can be developed in separate branches  
✅ **Modular Design** - Import only what you need  
✅ **Testable** - Shared utilities can be unit tested separately

## Library Modules

### `generator-core.js` ⭐

**Core generator execution framework** - This is the heart of the system!

Provides a standardized workflow for all generators, eliminating boilerplate code and ensuring consistency.

```javascript
import { runGenerator } from './lib/generator-core.js';
import { loadEventEnrichments } from './lib/enrichment.js';
import { updateSidebarForEvents } from './lib/sidebar.js';

// Your generator-specific functions
function scanForEvents(repoPath) {
  // Scan logic...
  return { data, count };
}

function generateEventsMDX(repoName, repoConfig, data, version, enrichments) {
  // Generation logic...
  return mdxContent;
}

// Use the framework - that's it!
runGenerator({
  name: 'Event',
  itemType: 'events',
  loadEnrichments: loadEventEnrichments,
  scanRepo: scanForEvents,
  generateContent: generateEventsMDX,
  updateSidebar: updateSidebarForEvents,
  outputFileName: 'events.mdx'
});
```

**What it handles automatically:**
- ✅ CLI argument parsing (single drop-in vs all)
- ✅ Boilerplate repository setup
- ✅ Version management from boilerplate
- ✅ Iterating through drop-ins
- ✅ Enrichment loading
- ✅ Repository scanning
- ✅ Content generation
- ✅ File output with proper paths
- ✅ Sidebar updates
- ✅ Error handling and logging
- ✅ Preview link generation

**You only write:**
- Scanner function (find what you need in the repo)
- Generator function (create the MDX content)

**Benefits:**
- New generators are 60% smaller
- 100% consistent workflow
- Fixes/improvements benefit all generators instantly

### `logger.js`

Standardized logging utilities for consistent console output.

```javascript
import { logger } from './lib/logger.js';

// Use throughout your generator
logger.header('My Generator');
logger.processingDropin('Cart');
logger.found(15, 'items');
logger.generated('/path/to/file.mdx');
logger.complete('My Generator');
```

**Available methods:**
- `header(name)` - Print generator header
- `processingAll(count)` - Log processing all drop-ins
- `processingSingle(name)` - Log single drop-in
- `processingDropin(displayName)` - Starting a drop-in
- `skipping(packageName, reason)` - Skip a drop-in
- `enrichmentLoaded(count, type)` - Enrichment loaded
- `scanning(type)` - Scanning repository
- `found(count, type)` - Items found
- `noneFound(type)` - No items found
- `generated(path)` - File generated
- `viewAt(url)` - Show preview URL
- `boilerplateLoaded()` - Boilerplate ready
- `complete(type)` - Generation complete
- `error(name, message)` - Error occurred
- `errorNotFound(name)` - Drop-in not found
- `blank()` - Blank line for spacing

**Benefits:**
- Consistent formatting and emojis
- Easy to test
- Centralized updates

### `content-transforms.js`

Content transformation utilities for cleaning and formatting generated documentation.

```javascript
import { applyStandardTransforms, formatPackageNames } from './lib/content-transforms.js';

// Apply all standard transformations
let content = generateContent();
content = applyStandardTransforms(content);

// Or use individual transformations
content = formatPackageNames(content);
content = boldContainerNames(content);
content = normalizeWhitespace(content);
```

**Available functions:**
- `formatPackageNames(text)` - Wrap @dropins/package names in backticks
- `boldContainerNames(text)` - Bold container names in text
- `normalizeWhitespace(content)` - Remove excess blank lines
- `wrapTablesWithTableWrapper(content)` - Wrap markdown tables in TableWrapper
- `removeEmptyContainerHeadings(content)` - Remove headings with no content
- `promoteHeadingsToH2(content)` - Promote H3 to H2
- `splitConfigurationTables(content)` - Split large tables
- `applyStandardTransforms(content)` - Apply all standard transformations

**Used by:**
- Boilerplate generator (primary user)
- Any generator needing content cleanup

**Benefits:**
- Consistent content formatting
- Reusable transformation logic
- Cleaner generated output

>>>>>>> origin/develop
### `dropin-config.js`

Centralized configuration for all drop-in repositories.

```javascript
import { DROPIN_REPOS } from './lib/dropin-config.js';

// Access configuration
const cartConfig = DROPIN_REPOS['cart'];
// {
//   packageName: '@dropins/storefront-cart',
//   gitUrl: 'https://github.com/adobe-commerce/storefront-cart.git',
//   type: 'B2C',
//   displayName: 'Cart'
// }
```

**Used by**: All generators  
**Maintains**: Drop-in repository URLs, package names, types, and display names

### `enrichment.js`

Load and manage enrichment data for generators.

```javascript
import { loadFunctionEnrichments, loadEventEnrichments } from './lib/enrichment.js';

// Load function enrichments
const functionData = loadFunctionEnrichments('cart');

// Load event enrichments
const eventData = loadEventEnrichments('cart');

// Check if enrichment exists
import { hasEnrichment, getEnrichedValue } from './lib/enrichment.js';
if (hasEnrichment(enrichmentData, 'myFunction', 'description')) {
  const desc = getEnrichedValue(enrichmentData, 'myFunction', 'description');
}
```

**Used by**: Function and event generators  
**Features**:
- Loads enrichment JSON files
- Validates enrichment data
- Provides fallback mechanisms
- Returns null for empty enrichments

### `source-validator.js` ⭐

**SOURCE-FIRST PRINCIPLE**: Validates and merges source code data with manual documentation, ensuring source code is always the source of truth for technical specifications.

```javascript
import { 
  validateAndMerge, 
  validateFunctionSignature,
  validateEventData,
  createValidationReport 
} from './lib/source-validator.js';

// Create validation report for a generator run
const report = createValidationReport();

// Validate and merge function data
const result = validateAndMerge({
  itemName: 'addToCart',
  itemType: 'function',
  sourceData: {
    signature: '(items: CartItem[]) => Promise<CartModel>',
    params: [{ name: 'items', type: 'CartItem[]' }],
    returnType: 'Promise<CartModel>'
  },
  manualData: enrichmentData,
  warnOnMismatch: true
});

// Use merged data (source takes precedence)
const mergedData = result.data;

// Add to report
report.addItem('addToCart', result);

// Print validation summary at end of generation
report.printSummary();
```

**Used by**: ALL generators (required for Source-First Principle)  
**What It Does**:
- ✅ **Validates** source code vs manual docs
- ✅ **Merges** data with source taking precedence
- ✅ **Warns** when conflicts are detected
- ✅ **Reports** validation results
- ✅ **Overwrites** outdated manual specs

**Source-Controlled Fields** (source always wins):
- Function signatures, parameters, return types
- Event names and data payloads
- Container props and slot definitions
- Model/type structures
- Usage examples

**Manual-Controlled Fields** (manual preserved):
- Descriptions and explanations
- Business context and rationale
- Best practices and recommendations
- Deprecation notices

### `example-extractor.js`

Extracts real-world usage examples from source repositories (HTML examples, boilerplate blocks, JSDoc).

```javascript
import { getAllExamples } from './lib/example-extractor.js';

// Get examples for a function (prioritizes source over enrichment)
const examples = getAllExamples('cart', 'addProductsToCart', 3);

// Returns array of { title, code, source }
// source: 'jsdoc' | 'html-example' | 'boilerplate'
```

**Used by**: Function generators  
**Priority Order**:
1. JSDoc `@example` tags (highest)
2. HTML examples (`examples/html-host/index.html`)
3. Boilerplate blocks (`blocks/*/*.js`)
4. Enrichment files (fallback only)

**Important**: Must be called AFTER repositories are cloned at correct versions.

### `repository.js`

Git repository operations for cloning and version management.

```javascript
import { 
  cloneOrUpdateBoilerplate,
  getBoilerplatePackageVersions,
  cloneDropinAtVersion 
} from './lib/repository.js';

// Clone/update boilerplate
const boilerplatePath = cloneOrUpdateBoilerplate();

// Get package versions
const versions = getBoilerplatePackageVersions(boilerplatePath);

// Clone drop-in at specific version
const dropinPath = cloneDropinAtVersion('cart', cartConfig, '1.0.0');
```

**Used by**: All generators  
**Features**:
- Clones repositories with proper depth and branching
- Handles version tags (with and without 'v' prefix)
- Updates existing repositories
- Manages `.temp-repos/` directory

### `sidebar.js`

Automatic sidebar navigation management.

```javascript
import { 
  updateSidebarForFunctions,
  updateSidebarForEvents,
  updateSidebarForContainers,
  insertSidebarEntry 
} from './lib/sidebar.js';

// Update sidebar for functions (inserts after Slots)
updateSidebarForFunctions('cart', cartConfig);

// Update sidebar for events (inserts after Functions)
updateSidebarForEvents('cart', cartConfig);

// Custom insertion
insertSidebarEntry('cart', cartConfig, 'CustomPage', 'Events');
```

**Used by**: All generators  
**Features**:
- Automatically inserts sidebar entries
- Maintains proper order (Slots → Functions → Events → Containers)
- Checks for existing entries
- Updates `astro.config.mjs`

### `markdown.js`

MDX generation and template processing utilities.

```javascript
import { 
  readTemplate,
  replacePlaceholders,
  replaceContentBetweenMarkers,
  toTitleCase,
  escapeMDX 
} from './lib/markdown.js';

// Read template file
const template = readTemplate('dropin-functions.mdx');

// Replace placeholders
const content = replacePlaceholders(template, {
  'DROPIN_NAME': 'Cart',
  'VERSION': '1.0.0'
});

// Replace content between markers
const updated = replaceContentBetweenMarkers(
  content,
  '{/* TABLE_START */}',
  '{/* TABLE_END */}',
  tableContent
);
```

**Used by**: All generators  
**Features**:
- Template reading from `_dropin-templates/`
- Placeholder replacement
- Content marker replacement
- MDX escaping utilities
- Case conversion utilities

### `utils.js`

General-purpose utilities used across scripts.

```javascript
import { 
  ensureDirectoryExists,
  ensureParentDirectoryExists,
  toKebabCase,
  toCamelCase,
  capitalize,
  formatDate,
  cleanVersion 
} from './lib/utils.js';

// Ensure directories exist
ensureParentDirectoryExists('/path/to/file.mdx');

// String utilities
const kebab = toKebabCase('getUserToken'); // 'get-user-token'
const camel = toCamelCase('user-account'); // 'userAccount'

// Version cleaning
const version = cleanVersion('^1.0.0'); // '1.0.0'
```

**Used by**: All generators and scripts  
**Features**:
- File system operations
- String manipulation
- Date formatting
- Version string cleaning
- Command-line argument parsing

## Creating New Generators

Creating a new generator is now incredibly simple with the `runGenerator()` framework! Here's the complete process:

### 1. Create Your Generator File

```javascript
#!/usr/bin/env node

/**
 * Container Documentation Generator
 * 
 * Generates container documentation for drop-in components by:
 * 1. Scanning repository for container definitions
 * 2. Generating comprehensive MDX documentation
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Import framework and utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadEnrichmentData } from './lib/enrichment.js';
import { updateSidebarForContainers } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';

const projectRoot = getProjectRoot();
```

### 2. Write Generator-Specific Functions

Only write the logic specific to your generator:

```javascript
// Scanner: Find what you need in the repository
function scanForContainers(repoPath) {
    const containersPath = join(repoPath, 'src', 'containers');
    
    if (!existsSync(containersPath)) {
        return [];
    }
    
    const containers = readdirSync(containersPath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => ({
            name: entry.name,
            path: join(containersPath, entry.name)
        }));
    
    return containers;
}

// Generator: Create the MDX content
function generateContainersMDX(repoName, repoConfig, containers, version, enrichmentData) {
    // Read template
    const template = readTemplate('dropin-containers.mdx');
    
    // Build content
    let containersContent = '';
    for (const container of containers) {
        // Extract container info and build MDX sections
        containersContent += `## ${container.name}\n\n`;
        // ... more logic
    }
    
    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_VERSION': version,
        'CONTAINERS_CONTENT': containersContent
    });
}
```

### 3. Use the Framework - That's It!

```javascript
// Main execution - single call to runGenerator()
runGenerator({
    name: 'Containers',
    itemType: 'containers',
    loadEnrichments: (repoName) => loadEnrichmentData(repoName, 'containers'),
    scanRepo: scanForContainers,
    generateContent: generateContainersMDX,
    updateSidebar: updateSidebarForContainers,
    outputFileName: 'containers.mdx'
});
```

### Complete Example (Full Generator in ~100 Lines!)

```javascript
#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadEnrichmentData } from './lib/enrichment.js';
import { updateSidebarForContainers } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';

const projectRoot = getProjectRoot();

function scanForContainers(repoPath) {
    const containersPath = join(repoPath, 'src', 'containers');
    if (!existsSync(containersPath)) return [];
    
    return readdirSync(containersPath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => ({
            name: entry.name,
            path: join(containersPath, entry.name)
        }));
}

function generateContainersMDX(repoName, repoConfig, containers, version, enrichmentData) {
    const template = readTemplate('dropin-containers.mdx');
    
    let containersContent = '';
    for (const container of containers) {
        containersContent += `## ${container.name}\n\n`;
        containersContent += `Container component for ${repoConfig.displayName}.\n\n`;
    }
    
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_VERSION': version,
        'CONTAINERS_CONTENT': containersContent
    });
}

// That's it - everything else is handled by the framework!
runGenerator({
    name: 'Containers',
    itemType: 'containers',
    loadEnrichments: (repoName) => loadEnrichmentData(repoName, 'containers'),
    scanRepo: scanForContainers,
    generateContent: generateContainersMDX,
    updateSidebar: updateSidebarForContainers,
    outputFileName: 'containers.mdx'
});
```

### What You Get Automatically

The framework handles ALL of this for you:
- ✅ CLI argument parsing
- ✅ Drop-in filtering
- ✅ Boilerplate setup and version extraction
- ✅ Repository cloning at correct versions
- ✅ Enrichment loading and logging
- ✅ Scanning with progress logging
- ✅ Content generation
- ✅ File output with proper paths
- ✅ Sidebar updates
- ✅ Error handling
- ✅ Success messages and preview links

### Benefits

- **~60% less code** compared to manual implementation
- **100% consistent** with other generators
- **Instant improvements** when framework is enhanced
- **Focus on logic** not infrastructure
- **Easy to test** your scanner and generator functions

## Documentation Accuracy Standards

**🎯 Critical**: All generated documentation must be 100% accurate and verifiable.

### Verification Checklist

Before committing enrichment data with `returns` fields:

- [ ] **Verified from source** - Checked actual implementation file
- [ ] **Complete structure** - All fields from GraphQL query/mutation included
- [ ] **Verification link** - Added GitHub source link in documentation
- [ ] **Tested accuracy** - Cross-referenced with test files for validation
- [ ] **Documented raw vs transformed** - Clarified if data is raw GraphQL or transformed

### Tools for Verification

1. **Return Type Analyzer** (`scripts/lib/return-type-analyzer.js`)
   - Analyzes function implementations
   - Extracts GraphQL field structures
   - Generates verified JSON examples
   - Provides GitHub verification links

2. **Manual Verification Process**
   - Read the function implementation (`src/api/[function]/[function].ts`)
   - Find what's actually returned (look for `return` statements)
   - If returning raw GraphQL, check the query/mutation file
   - Extract all fields from the GraphQL definition
   - Cross-reference with test data for validation

### Example: Verifying `getEstimateShipping`

```bash
# 1. Check implementation
cat .temp-repos/cart/src/api/getEstimateShipping/getEstimateShipping.ts
# → Returns: selectedMethod (line 81)

# 2. Check GraphQL query
cat .temp-repos/cart/src/api/getEstimateShipping/graphql/estimateShippingMethodsMutation.ts
# → Fields: amount, carrier_code, method_code, error_message, price_excl_tax, price_incl_tax

# 3. Verify with tests
grep -A 10 "estimateShippingMethods:" .temp-repos/cart/src/api/getEstimateShipping/getEstimateShipping.test.ts
# → Confirms all fields present in test data
```

## Best Practices

1. **Import only what you need**: Don't import entire modules
2. **Use shared types**: When adding features, consider making them shared
3. **Document in JSDoc**: All shared functions have comprehensive JSDoc comments
4. **Handle errors gracefully**: Shared functions return null on errors with warnings
5. **Keep generators focused**: Generators should focus on their specific task
6. **Test incrementally**: Test with single drop-ins before running on all
7. **Verify accuracy**: Always verify enrichment data against source code before committing

## Troubleshooting

### Generator fails to find repository

Check `lib/dropin-config.js` to ensure the repository is configured:
```javascript
'my-dropin': {
    packageName: '@dropins/storefront-my-dropin',
    gitUrl: 'https://github.com/adobe-commerce/storefront-my-dropin.git',
    type: 'B2C',
    displayName: 'My Dropin'
}
```

### Enrichment not being used

1. Verify file exists: `_dropin-enrichments/{dropin-name}/functions.json`
2. Check JSON syntax is valid
3. Ensure enrichment keys match function/event names exactly
4. Check generator logs for warnings

### Sidebar not updating

1. Run generator again (it skips existing entries)
2. Manually verify `astro.config.mjs` for correct format
3. Check that reference entry exists (e.g., Functions for Events)

---

## Summary

The shared library architecture provides a robust foundation for all documentation automation:

- **Maintainable**: Update once, benefit everywhere
- **Scalable**: Add new generators easily
- **Reliable**: Tested, shared code reduces bugs
- **Flexible**: Generators can evolve independently
- **Professional**: Clean, modular, well-documented code

This system is designed to grow with the project, making it easy to add new generators and features while maintaining consistency and quality across all documentation.