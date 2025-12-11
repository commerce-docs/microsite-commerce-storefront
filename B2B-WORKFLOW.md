# B2B Documentation Workflow

**Complete Reference Guide for Adobe Commerce B2B Drop-in Documentation**

Last Updated: December 11, 2025

---

## Table of Contents

1. [Branching Strategy](#1-branching-strategy)
2. [Content Preservation System](#2-content-preservation-system)
3. [Documentation Generation Workflow](#3-documentation-generation-workflow)
4. [Common Workflows](#4-common-workflows)
5. [Key Files & Directories](#5-key-files--directories)
6. [Critical Rules & Principles](#6-critical-rules--principles)
7. [Essential Commands & Tools](#7-essential-commands--tools)
8. [Current Status](#8-current-status)
9. [Quick Reference](#9-quick-reference)

---

## 1. Branching Strategy

### Branch Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ releases/b2b-nov-release (Infrastructure Branch)       │
│ • Infrastructure files ONLY                             │
│ • ALL enrichment files for ALL dropins                  │
│ • Generator scripts, templates, configs                 │
│ • Merged dropin docs (e.g., Purchase Order from PR #620)│
│ • NO unmerged B2B dropin docs                           │
│ • NO merchant block docs (separate PRs)                 │
└─────────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────┴──────────────┐
         ↓                              ↓
┌────────────────────┐      ┌──────────────────────┐
│ Individual PR      │      │ Merchant Block PRs   │
│ Branches           │      │                      │
│ • Their enrichments│      │ • Merchant blocks    │
│ • Their docs       │      │ • Their enrichments  │
│ • ONLY their dropin│      │ • Quote Mgmt, Req    │
└────────────────────┘      │   List, etc.         │
                            └──────────────────────┘
         ↓                              ↓
         └──────────────┬──────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ b2b-documentation (Preview Branch)                      │
│ • ALL B2B dropin documentation (6 dropins, 90 files)    │
│ • ALL merchant blocks (58+ files)                       │
│ • Complete enrichment files for all dropins             │
│ • Infrastructure files                                  │
│ • Used for preview deployments                          │
└─────────────────────────────────────────────────────────┘
```

### Branch Purposes

| Branch Type | Contains | Purpose |
|-------------|----------|---------|
| **releases/b2b-nov-release** | Infrastructure + all enrichments + merged docs | Central source for generators and enrichments |
| **b2b-docs-[dropin]** | Single dropin's enrichments + docs | Individual PR for review |
| **feature/merchant-blocks-[name]** | Merchant block docs + enrichments | Merchant block PRs |
| **b2b-documentation** | Everything | Complete preview for stakeholders |

---

## 2. Content Preservation System

### Two-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: CODE EXTRACTION (Automated)                   │
│ • TypeScript interfaces, types, enums                   │
│ • Function signatures (parameters, return types)        │
│ • Event emissions from source code                      │
│ • Extracted from: .temp-repos/[dropin]/src/             │
└─────────────────────────────────────────────────────────┘
                        +
┌─────────────────────────────────────────────────────────┐
│ Layer 2: ENRICHMENTS (Manual Editorial Content)        │
│ • Human-written descriptions (WHAT and WHY)             │
│ • "Use to..." guidance and usage context                │
│ • Parameter descriptions (NOT types/required)           │
│ • Examples, best practices, behavioral notes            │
│ • Location: _dropin-enrichments/[dropin]/*.json         │
└─────────────────────────────────────────────────────────┘
                        ↓
                  GENERATORS
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Generated MDX Documentation                             │
│ • src/content/docs/dropins-b2b/[dropin]/               │
│ • Technical accuracy + Editorial quality                │
└─────────────────────────────────────────────────────────┘
```

### What Goes Where?

#### ✅ In Enrichment Files (Editorial Content)

- **Descriptions**: WHAT the function/container does and WHY
- **Usage guidance**: "Use to...", "Use for...", "Use when..."
- **Behavioral explanations**: "APPEND adds to existing, REPLACE removes all"
- **Parameter descriptions**: Human-readable explanations (NOT types or required flags)
- **Event context**: Additional payload details, conditional emissions
- **Examples**: Code samples, usage patterns, best practices
- **Links**: References to related documentation

#### ❌ NOT in Enrichment Files (Extract from Code)

- **Type definitions**: `string`, `number`, `boolean`, etc.
- **Required flags**: Whether parameter is required/optional
- **Function signatures**: Parameter lists, return types
- **Event emissions**: List of events fired (extracted from `events.emit()`)
- **Interface definitions**: TypeScript interfaces and types

### Enrichment File Structure

```json
{
  "ContainerName": {
    "description": "Action-oriented description starting with verb",
    "parameters": {
      "paramName": {
        "description": "Use to... (explanatory description)"
      }
    },
    "slots": {
      "SlotName": {
        "description": "Context about when/how to use this slot"
      }
    }
  }
}
```

---

## 3. Documentation Generation Workflow

### Standard 5-Step Process

```bash
# Step 1: Update Enrichments (if needed)
# Edit: _dropin-enrichments/[dropin]/*.json
# Add descriptions, usage context, examples

# Step 2: Verify Enrichments
npm run verify-enrichments [dropin-name]
# Fix any issues before generating

# Step 3: Generate Documentation
node scripts/@generate-container-docs.js [dropin]
# Or use other generators for functions, events, etc.

# Step 4: Verify No Content Loss
git diff src/content/docs/dropins-b2b/[dropin]/
# Check: Are descriptions present? No placeholders?

# Step 5: Commit Changes
git add src/content/docs/dropins-b2b/[dropin]/
git commit -m "docs: Update [dropin] documentation"
git push origin [branch-name]
```

### If Content Loss Detected

```bash
# STOP immediately
git restore src/content/docs/dropins-b2b/[dropin]/

# Fix enrichment files
# Add missing descriptions to _dropin-enrichments/[dropin]/*.json

# Regenerate
node scripts/@generate-container-docs.js [dropin]

# Verify again
git diff src/content/docs/dropins-b2b/[dropin]/
```

---

## 4. Common Workflows

### A. Adding Container Descriptions

**When**: Container overview shows "*Enrichment needed*" placeholders

**Steps**:
1. Edit `_dropin-enrichments/[dropin]/containers.json`
2. Add `"description"` field to container object
3. Run `node scripts/@generate-container-docs.js [dropin]`
4. Verify `containers/index.mdx` shows descriptions
5. Commit to preview branch AND PR branch (if exists)

**Example**:
```json
{
  "RequisitionListForm": {
    "description": "Provides a form for creating or editing requisition list details including name and description.",
    "parameters": {
      "mode": {
        "description": "The form mode determining whether to create a new requisition list or update an existing one."
      }
    }
  }
}
```

### B. Updating Function Documentation

**When**: Adding new functions or improving descriptions

**Steps**:
1. Edit `_dropin-enrichments/[dropin]/functions.json`
2. Update descriptions, add parameter descriptions
3. Run `node scripts/@generate-function-docs.js [dropin]`
4. Verify `functions.mdx` shows changes
5. Commit and push

**Example**:
```json
{
  "addProductToRequisitionList": {
    "description": "Adds a product to a specified requisition list with configurable quantity and options.",
    "parameters": {
      "sku": {
        "description": "The product SKU to add to the requisition list."
      },
      "quantity": {
        "description": "The quantity of the product to add. Defaults to 1 if not specified."
      }
    }
  }
}
```

### C. Infrastructure Changes

**When**: Updating generators, templates, or scripts

**Target Branch**: `releases/b2b-nov-release`

**Steps**:
1. Make changes to `scripts/@generate-*.js` or templates
2. Test with one dropin
3. Commit to `releases/b2b-nov-release`
4. Push to GitHub
5. Regenerate affected dropins on their branches

### D. Adding New B2B Dropin Documentation

**Steps**:
1. Create enrichment files in `_dropin-enrichments/[new-dropin]/`
2. Add to `releases/b2b-nov-release` (enrichments only)
3. Create PR branch: `b2b-docs-[dropin-name]`
4. Copy enrichments to PR branch
5. Generate docs on PR branch
6. Add to sidebar in `astro.config.mjs`
7. After PR approval: Merge to `b2b-documentation` preview

### E. Fixing Build Failures

#### Missing Sidebar Entries
**Error**: `Failed to find the topic for the page`

**Fix**: Add page to `astro.config.mjs` sidebar configuration

#### Link Validation Errors
**Error**: `Invalid link` or `Link not found`

**Fix for PR branches**: 
- Already configured with `SKIP_LINK_VALIDATION=true` in `.github/workflows/test-pull-request.yml`
- `astro.config.mjs` uses conditional link validation

**Fix for preview branch**: 
- Ensure all linked pages exist
- Check for typos in links

#### Starlight Sidebar Topics Errors
**Error**: Page requires topic association

**Fix**: Add page to sidebar `items` array in `astro.config.mjs`

#### Missing Enrichments
**Error**: Documentation shows placeholders

**Fix**: Add descriptions to enrichment JSON files, then regenerate

---

## 5. Key Files & Directories

### Enrichment Files (Master Editorial Content)

```
_dropin-enrichments/
├── checkout/
│   └── b2b-extension.json         ← B2B payment containers
├── company-management/
│   ├── containers.json
│   ├── functions.json
│   ├── events.json
│   ├── initialization.json
│   ├── quick-start.json
│   ├── slots.json
│   ├── styles.json
│   └── dictionary.json
├── company-switcher/              ← Same structure
├── purchase-order/                ← Same structure
├── quote-management/              ← Same structure
└── requisition-list/              ← Same structure
```

### Generator Scripts

```
scripts/
├── @generate-container-docs.js    ← Container documentation
├── @generate-function-docs.js     ← Functions API docs
├── @generate-event-docs.js        ← Events documentation
├── @generate-initialization-docs.js
├── @generate-quick-start-docs.js
├── @generate-styles-docs.js
├── @generate-slots-docs.js
├── @generate-dictionary-docs.js
├── verify-enrichments.js          ← Quality checker
└── lib/
    ├── generator-core.js          ← Core generator logic
    └── enrichment.js              ← Enrichment loader
```

### Templates

```
_dropin-templates/
├── container-page.md              ← Container page template
├── function-page.md               ← Function page template
├── event-page.md
├── initialization-page.md
└── (etc.)
```

### Generated Documentation

```
src/content/docs/dropins-b2b/
├── checkout/                      ← 3 files (B2B extension)
│   ├── index.mdx
│   └── containers/
│       ├── payment-on-account.mdx
│       └── purchase-order.mdx
├── company-management/            ← 17 files
│   ├── index.mdx
│   ├── quick-start.mdx
│   ├── initialization.mdx
│   ├── functions.mdx
│   ├── events.mdx
│   ├── slots.mdx
│   ├── styles.mdx
│   ├── dictionary.mdx
│   └── containers/
│       ├── index.mdx
│       ├── company-credit.mdx
│       └── (7 more containers)
├── company-switcher/              ← 10 files
├── purchase-order/                ← 21 files
├── quote-management/              ← 24 files
└── requisition-list/              ← 14 files
```

### Configuration Files

```
astro.config.mjs                   ← Sidebar navigation
.github/workflows/
└── test-pull-request.yml          ← CI/CD with SKIP_LINK_VALIDATION
package.json                       ← NPM scripts
```

### Documentation

```
B2B-WORKFLOW.md                    ← This file (complete reference)
ENRICHMENT-PRESERVATION.md         ← Detailed preservation system
QUICK-START-ENRICHMENTS.md         ← Quick reference guide
```

---

## 6. Critical Rules & Principles

### Enrichment Management

#### ✅ DO:
- Store ALL manual content in enrichment files
- Use action-oriented descriptions (starts with verbs: "Adds", "Displays", "Provides")
- Include "Use to..." guidance for parameters
- Provide behavioral context ("APPEND adds to existing, REPLACE removes all")
- Update enrichments BEFORE regenerating docs
- Verify quality with `npm run verify-enrichments`

#### ❌ DON'T:
- Put technical definitions in enrichments (extract from code)
- Include `type` or `required` in enrichment parameters
- Edit generated MDX files directly (update enrichments instead)
- Skip verification after generation
- Use "The [functionName] function" (just start with verb)
- Include non-exported functions in enrichments

### Branch Management

#### ✅ DO:
- Keep PR branches focused (ONLY their dropin)
- Maintain ALL enrichments in `releases/b2b-nov-release`
- Copy relevant enrichments to PR branches
- Merge approved PRs to `b2b-documentation` preview
- Use `git cherry-pick` to apply commits across branches
- Sync enrichments across release branch and PR branches

#### ❌ DON'T:
- Include unrelated dropins in PR branches
- Put unmerged dropin docs in release branch
- Mix infrastructure and documentation commits
- Merge release branch into PR branches (causes pollution)
- Delete enrichment files from any branch

### Documentation Quality

#### ✅ DO:
- Use active voice and sentence case (Heading 2s)
- Follow "The Elements of Style" principles
- Use articles (a, an, the) in prose
- Use periods for complete sentences in lists
- Capitalize drop-in names as proper nouns
- Use `<TableWrapper nowrap={[0]}>` for tables
- Import components: `Link`, `TableWrapper`, `Aside`, `Steps`
- Use H4 headings (####) for subsections under H3
- Use non-possessive constructions ("for the Cart drop-in" not "Cart drop-in's")

#### ❌ DON'T:
- Use possessive with apostrophe-s ('s) on proper nouns
- Start descriptions with "The [functionName] function"
- Include internal technical notes in public docs
- Use "AEM Commerce" (correct: "Adobe Commerce")
- Add "Next steps" or "Related" sections to B2B docs (unless external links)
- Create .md summary files (only keep ongoing reference docs)
- Use smart quotation marks in Markdown

### Code-First Extraction Strategy

#### Extraction Hierarchy:
1. **PRIMARY**: Extract from source code (types, signatures, events)
2. **ENRICHMENT**: Add human-written context (descriptions, guidance)
3. **NEVER**: Use enrichment as fallback for code extraction

#### Event Documentation:
- **DO document**: Drop-in events (with `/` in name like `cart/product/added`)
- **DON'T document**: ACDL events (like `SHOPPING_CART_VIEW`)
- Events are auto-extracted from `events.emit()` calls
- Enrichment provides additional payload/behavioral context

#### Function Documentation:
- **MUST include**: Returns section (even if `void`)
- **MUST include**: Events section (even if none emitted)
- **ONLY document**: Exported functions (`export` keyword)
- Non-exported functions are internal implementation details

---

## 7. Essential Commands & Tools

### Verification & Quality

```bash
# Check enrichment file quality
npm run verify-enrichments [dropin-name]
npm run verify-enrichments                # All dropins

# Verify generated changes
git diff src/content/docs/dropins-b2b/[dropin]/

# Check for placeholder text
grep -r "Enrichment needed" src/content/docs/dropins-b2b/
```

### Generation (Individual Generators)

```bash
# Generate specific documentation types
node scripts/@generate-container-docs.js [dropin]
node scripts/@generate-function-docs.js [dropin]
node scripts/@generate-event-docs.js [dropin]
node scripts/@generate-initialization-docs.js [dropin]
node scripts/@generate-quick-start-docs.js [dropin]
node scripts/@generate-styles-docs.js [dropin]
node scripts/@generate-slots-docs.js [dropin]
node scripts/@generate-dictionary-docs.js [dropin]

# Generate all for a dropin (if CLI exists)
npm run generate-docs -- --dropin [dropin-name]
```

### Building & Testing

```bash
# Fast production build (no compression)
npm run build:prod-fast

# Production build with link validation skipped (for PR branches)
SKIP_LINK_VALIDATION=true npm run build:prod

# Development server
npm run dev
```

### Git Operations

```bash
# Apply commit from one branch to another
git cherry-pick [commit-hash]

# Copy specific files from another branch
git checkout [branch] -- [file-path]

# Copy directory from another branch
git checkout [branch] -- [directory-path]

# Abort cherry-pick if conflicts
git cherry-pick --abort

# Check sync status with remote
git fetch origin [branch]
git rev-list --left-right --count HEAD...origin/[branch]
# Output: "0 0" means fully synced
```

### Branch Operations

```bash
# Switch to preview branch
git checkout b2b-documentation

# Switch to infrastructure branch
git checkout releases/b2b-nov-release

# Switch to PR branch
git checkout b2b-docs-[dropin-name]
git checkout feature/merchant-blocks-[name]

# List remote branches
git branch -r | grep "b2b\|merchant"

# Create new PR branch from release branch
git checkout releases/b2b-nov-release
git checkout -b b2b-docs-[new-dropin]
```

### File Operations

```bash
# Find all MDX files in a dropin
find src/content/docs/dropins-b2b/[dropin] -name "*.mdx"

# Count documentation files
find src/content/docs/dropins-b2b -name "*.mdx" | wc -l

# Check enrichment files
ls -la _dropin-enrichments/[dropin]/

# Find missing sidebar entries
for file in src/content/docs/merchants/blocks/*.mdx; do
  filename=$(basename "$file" .mdx)
  grep -q "'$filename'" astro.config.mjs || echo "Missing: $filename"
done
```

---

## 8. Current Status

**Last Updated**: December 11, 2025

### Infrastructure: ✅ Complete

- ✅ 8 generator scripts with enrichment support
- ✅ Content preservation system documented
- ✅ Verification tool (`verify-enrichments.js`)
- ✅ Templates in `_dropin-templates/`
- ✅ Conditional link validation for PR branches
- ✅ Starlight sidebar topics configured

### B2B Drop-in Documentation: ✅ Complete (90 files)

| Drop-in | Files | Core Pages | Containers | Status |
|---------|-------|------------|------------|--------|
| **Checkout** (B2B ext) | 3 | Overview only | 2 | ✅ |
| **Company Management** | 17 | All 8 | 8 | ✅ |
| **Company Switcher** | 10 | All 8 | 1 | ✅ |
| **Purchase Order** | 21 | All 8 | 12 | ✅ |
| **Quote Management** | 24 | All 8 | 15 | ✅ |
| **Requisition List** | 14 | All 8 | 5 | ✅ |

**Core Pages** (8 per dropin): Overview, Quick Start, Initialization, Functions, Events, Slots, Styles, Dictionary

### Enrichment Files: ✅ Complete

- ✅ All dropins have container descriptions
- ✅ Function descriptions present and action-oriented
- ✅ Parameter guidance included
- ✅ Zero "Enrichment needed" placeholders
- ✅ All enrichments verified with quality checker

### Branches: ✅ Synchronized

| Branch | Status | Content |
|--------|--------|---------|
| **b2b-documentation** | ✅ Synced | Full preview (all content) |
| **releases/b2b-nov-release** | ✅ Synced | Infrastructure + all enrichments |
| **b2b-docs-*** (PR branches) | ✅ Clean | Focused, single dropin |
| **feature/merchant-blocks-*** | ✅ Building | Merchant blocks + enrichments |

### Recent Fixes (Dec 11, 2025)

- ✅ Added B2B Checkout to sidebar (was missing)
- ✅ Fixed merchant block build failures (missing sidebar entries)
- ✅ Regenerated Requisition List with descriptions
- ✅ Added B2B commerce blocks section to sidebar
- ✅ Reorganized sidebar structure ("Drop-ins for B2C", "Drop-ins for B2B")

---

## 9. Quick Reference

### Most Common Operations

#### Update Container Descriptions
```bash
# 1. Edit enrichment
vim _dropin-enrichments/[dropin]/containers.json

# 2. Verify
npm run verify-enrichments [dropin]

# 3. Generate
node scripts/@generate-container-docs.js [dropin]

# 4. Check
git diff src/content/docs/dropins-b2b/[dropin]/containers/

# 5. Commit
git add src/content/docs/dropins-b2b/[dropin]/
git commit -m "docs: Add [dropin] container descriptions"
git push
```

#### Emergency: Restore Lost Content
```bash
# Restore from git
git restore src/content/docs/dropins-b2b/[dropin]/

# Check what was in last commit
git show HEAD:src/content/docs/dropins-b2b/[dropin]/[file].mdx

# Restore from specific commit
git checkout [commit-hash] -- src/content/docs/dropins-b2b/[dropin]/
```

#### Sync Enrichments Across Branches
```bash
# Copy from release branch to PR branch
git checkout [pr-branch]
git checkout releases/b2b-nov-release -- _dropin-enrichments/[dropin]/

git add _dropin-enrichments/
git commit -m "sync: Update [dropin] enrichments from release branch"
git push
```

### Key Patterns

**Action-Oriented Descriptions**:
- ✅ "Adds products to a cart"
- ✅ "Displays company credit information"
- ✅ "Provides a form for creating requisition lists"
- ❌ "The addProducts function adds products"
- ❌ "Used to add products"

**Parameter Descriptions**:
- ✅ "Use to specify the product SKU to add."
- ✅ "The quantity of the product to add. Defaults to 1."
- ❌ Include `type` or `required` (extracted from code)

**Container/Function Names**:
- ✅ Capitalize as proper nouns: "Cart", "Checkout", "Product Details"
- ✅ Reference without possessive: "for the Cart drop-in"
- ❌ Lowercase: "cart", "checkout"
- ❌ Possessive: "Cart drop-in's features"

---

## Documentation References

For more detailed information, see:

- **ENRICHMENT-PRESERVATION.md** - Deep dive into the preservation system (305 lines)
- **QUICK-START-ENRICHMENTS.md** - Quick reference for daily operations (141 lines)
- **This file (B2B-WORKFLOW.md)** - Complete workflow reference

---

**Questions or Issues?** Check the preservation docs or run `npm run verify-enrichments` to catch common problems.

