# Generator Migration Plan

## Overview

Migrate 7 additional generators from `auto-doc-generators` branch to use the new shared library framework.

## 🎯 Generators to Migrate

### ✅ Already Migrated (2)
1. ✅ `@generate-function-docs.js` - Complete with framework
2. ✅ `@generate-event-docs.js` - Complete with framework

### 📋 Remaining to Migrate (7)
1. `@generate-boilerplate-docs.js` - Boilerplate documentation
2. `@generate-container-docs.js` - Container documentation
3. `@generate-dictionary-docs.js` - i18n dictionary documentation
4. `@generate-initialization-docs.js` - Initialization docs
5. `@generate-installation-docs.js` - Installation docs
6. `@generate-merchant-block-docs.js` - Merchant block docs
7. `@generate-slot-docs.js` - Slot documentation

## 📄 Templates to Migrate

### ✅ Already Updated (2)
1. ✅ `dropin-functions.mdx` - Has CodeInclude import
2. ✅ `dropin-events.mdx` - Clean placeholders

### 📋 Templates Remaining (9)
1. `container-overview.mdx`
2. `dropin-container.mdx`
3. `dropin-containers-two.mdx`
4. `dropin-dictionary.mdx`
5. `dropin-initialization.mdx`
6. `dropin-installation.mdx`
7. `dropin-overview.mdx`
8. `dropin-slots.mdx`
9. `merchant-block.mdx`

## 🔄 Migration Strategy

### Phase 1: Assessment & Planning
1. Examine each generator in auto-doc-generators branch
2. Identify unique scanning logic
3. Identify unique generation logic
4. Document current template dependencies

### Phase 2: Branch Strategy

**Recommended Approach:**
```
Main Branch: develop
├── feature/generator-framework ← Merge first (shared lib)
├── feature/generator-containers ← Individual PRs
├── feature/generator-slots
├── feature/generator-dictionary
├── feature/generator-initialization
├── feature/generator-installation
├── feature/generator-merchant-blocks
└── feature/generator-boilerplate
```

**Benefits:**
- ✅ Each generator gets independent review
- ✅ Can be merged in any order
- ✅ No conflicts between generators
- ✅ Framework improvements benefit all

### Phase 3: Migration Pattern

**For Each Generator:**

#### Step 1: Create Feature Branch
```bash
git checkout develop
git pull
git checkout -b feature/generator-[name]
```

#### Step 2: Copy Generator from auto-doc-generators
```bash
git show origin/auto-doc-generators:scripts/@generate-[name]-docs.js > scripts/@generate-[name]-docs.js
```

#### Step 3: Refactor to Use Framework

**Current Pattern (Old):**
```javascript
// ~400 lines of code
import { readFileSync, writeFileSync, ...many imports } from 'fs';

const DROPIN_REPOS = { /* duplicated config */ };

function cloneBoilerplate() { /* duplicated */ }
function getVersions() { /* duplicated */ }
function cloneDropin() { /* duplicated */ }

async function main() {
    // Parse CLI
    // Setup boilerplate
    // Loop through dropins
    // Scan
    // Generate
    // Write
    // Update sidebar
}
```

**New Pattern (Framework):**
```javascript
// ~160 lines of code
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';
import { loadEnrichmentData } from './lib/enrichment.js';
import { updateSidebarFor[Type] } from './lib/sidebar.js';

const projectRoot = getProjectRoot();

function scanFor[Type](repoPath) {
    // Unique scanning logic (~50 lines)
    return data;
}

function generate[Type]MDX(repoName, repoConfig, data, version, enrichments) {
    // Unique generation logic (~80 lines)
    const template = readTemplate('dropin-[type].mdx');
    return replacePlaceholders(template, { /* ... */ });
}

runGenerator({
    name: '[Type]',
    itemType: '[types]',
    loadEnrichments: (name) => loadEnrichmentData(name, '[types]'),
    scanRepo: scanFor[Type],
    generateContent: generate[Type]MDX,
    updateSidebar: updateSidebarFor[Type],
    outputFileName: '[type].mdx'
});
```

#### Step 4: Update Template

**Template Checklist:**
```markdown
✅ Use consistent placeholders (DROPIN_NAME, DROPIN_VERSION, etc.)
✅ Add necessary component imports
✅ Use cleanVersion() compatible placeholders
✅ Add clear content markers for replacement
✅ Document expected data structure in comments
```

#### Step 5: Add Sidebar Function (if needed)

In `lib/sidebar.js`:
```javascript
export function updateSidebarFor[Type](dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, '[Type]', '[ReferenceEntry]');
}
```

#### Step 6: Create Enrichment Support

Create enrichment file structure:
```
_dropin-enrichments/
  └── [dropin-name]/
      └── [type]s.json  (e.g., slots.json, containers.json)
```

Update `_dropin-enrichments/README.md` with new format.

#### Step 7: Test
```bash
npm run generate-[type]-docs [test-dropin]
npm run generate-[type]-docs  # All dropins
```

#### Step 8: Document
- Update `scripts/README.md` with new generator
- Add usage examples
- Document any unique features

### Phase 4: Template Updates

**For Each Template:**

#### Current Issues to Fix:
1. **Inconsistent Placeholders**
   - Some use `DROPIN_NAME`, others use variations
   - Standardize to: `DROPIN_NAME`, `DROPIN_VERSION`, `DROPIN_PACKAGE`

2. **Missing Imports**
   - Add necessary Astro/Starlight component imports
   - Add custom component imports (Badge, CodeInclude, etc.)

3. **Version Placeholders**
   - Change: `${version.replace(/^[\^~]/, '')}`
   - To: `DROPIN_VERSION` (cleaned by generator)

4. **Content Markers**
   - Ensure clear markers for content insertion
   - Document expected structure

#### Template Update Pattern:
```mdx
---
title: DROPIN_NAME [Type]
description: Description for DROPIN_NAME [type].
sidebar:
  label: [Type]
  order: [N]
---

import { Aside } from '@astrojs/starlight/components';
import Badge from '@components/overrides/Badge.astro';

Intro text using DROPIN_NAME.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: DROPIN_VERSION</strong>
</div>

## Section

[TYPE]_CONTENT

{/* This documentation is auto-generated from: REPO_URL */}
```

## 📊 Priority Order

### High Priority (Core Functionality)
1. **Containers** - Most visible to developers
2. **Slots** - Critical for customization
3. **Dictionary** - i18n support

### Medium Priority (Setup)
4. **Installation** - Setup documentation
5. **Initialization** - Configuration docs

### Lower Priority (Specialized)
6. **Merchant Blocks** - Specialized feature
7. **Boilerplate** - Meta-documentation

## 🎯 Generator-Specific Considerations

### 1. Containers Generator
**Unique Challenges:**
- Multiple container types per drop-in
- Container overview page generation
- Individual container pages
- Props and slots documentation

**Scanning Logic:**
- Find `src/containers/` directory
- Parse container TypeScript files
- Extract props, events, slots

**Enrichment Needs:**
- Container descriptions
- Usage examples
- Best practices

### 2. Slots Generator
**Unique Challenges:**
- Slot discovery across containers
- Default vs custom slots
- Slot props and context

**Scanning Logic:**
- Find slot definitions in containers
- Parse slot types
- Extract slot context types

**Enrichment Needs:**
- Slot purposes
- When to customize
- Examples

### 3. Dictionary Generator
**Unique Challenges:**
- i18n key extraction
- Namespace organization
- Default values

**Scanning Logic:**
- Find `i18n/` or `lang/` directories
- Parse translation files
- Extract keys and defaults

**Enrichment Needs:**
- Key descriptions
- Context where used
- Customization examples

### 4. Installation Generator
**Unique Challenges:**
- Version-specific instructions
- Dependency documentation
- Setup variations

**Scanning Logic:**
- Read package.json
- Check peer dependencies
- Find setup requirements

**Enrichment Needs:**
- Setup notes
- Common issues
- Requirements

### 5. Initialization Generator
**Unique Challenges:**
- Configuration options
- API key requirements
- Environment setup

**Scanning Logic:**
- Find initialization functions
- Extract config types
- Document options

**Enrichment Needs:**
- Config descriptions
- Required vs optional
- Examples

### 6. Merchant Blocks Generator
**Unique Challenges:**
- Admin panel integration
- Block types
- Configuration UI

**Scanning Logic:**
- Find merchant block definitions
- Parse block schemas
- Extract field types

**Enrichment Needs:**
- Block purposes
- Field descriptions
- Admin setup

### 7. Boilerplate Generator
**Unique Challenges:**
- Meta-documentation
- Version tracking
- Integration overview

**Scanning Logic:**
- Parse boilerplate structure
- Extract integration points
- Document architecture

**Enrichment Needs:**
- Architecture notes
- Integration guides
- Version notes

## 🔧 Required Updates to Shared Library

### sidebar.js Additions
```javascript
export function updateSidebarForContainers(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Containers', 'Events');
}

export function updateSidebarForSlots(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Slots', 'Containers');
}

export function updateSidebarForDictionary(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Dictionary', 'Slots');
}

// etc.
```

### enrichment.js Additions
```javascript
export function loadContainerEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'containers');
}

export function loadSlotEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'slots');
}

export function loadDictionaryEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'dictionary');
}

// etc.
```

## 📋 Checklist Per Generator

- [ ] Create feature branch
- [ ] Copy generator from auto-doc-generators
- [ ] Refactor to use runGenerator()
- [ ] Update to use readTemplate() and replacePlaceholders()
- [ ] Add sidebar update function
- [ ] Create enrichment support
- [ ] Copy and update template
- [ ] Test with single drop-in
- [ ] Test with all drop-ins
- [ ] Update scripts/README.md
- [ ] Update _dropin-enrichments/README.md
- [ ] Create PR
- [ ] Review and merge

## 🎯 Success Criteria

**For Each Generator:**
- ✅ Uses runGenerator() framework
- ✅ Uses shared utilities (readTemplate, replacePlaceholders, cleanVersion)
- ✅ No duplicated infrastructure code
- ✅ Clear scanning and generation logic separation
- ✅ Enrichment support enabled
- ✅ Template updated and consistent
- ✅ Sidebar integration working
- ✅ Tests passing
- ✅ Documentation complete

## 📈 Expected Results

**Per Generator Migration:**
- Code reduction: ~60% (400 → 160 lines)
- Time to implement: 2-4 hours
- PR size: Small and focused
- Review time: Quick and easy

**Overall Results:**
- 9 generators using framework
- 100% consistency
- Easy to maintain
- Quick to extend
- Professional codebase

## 🚀 Getting Started

**Recommended Order:**

### Week 1: High-Impact Generators
1. **Day 1-2**: Containers (most complex, high value)
2. **Day 3**: Slots (important for customization)
3. **Day 4**: Dictionary (essential i18n)

### Week 2: Setup Generators
4. **Day 1**: Installation (setup docs)
5. **Day 2**: Initialization (config docs)

### Week 3: Specialized Generators
6. **Day 1**: Merchant Blocks (specialized)
7. **Day 2**: Boilerplate (meta-docs)

### Continuous: Template Updates
- Update templates as you migrate each generator
- Test with multiple drop-ins
- Ensure consistency

## 📚 Resources

- **Reference Implementation**: `@generate-function-docs.js` and `@generate-event-docs.js`
- **Framework Documentation**: `scripts/README.md`
- **Library Modules**: `scripts/lib/*.js`
- **Analysis Documents**: `scripts/lib/REFACTORING-*.md`

## 💡 Tips

1. **Start Simple**: Begin with the simplest generator to learn the pattern
2. **Copy Pattern**: Use function/event generators as templates
3. **Test Frequently**: Test after each major change
4. **Small Commits**: Commit logical chunks
5. **Document**: Update docs as you go
6. **Ask Questions**: The framework is designed to help you!

---

**Ready to begin?** Start with containers generator - it's the most visible to developers and will provide the most value!

