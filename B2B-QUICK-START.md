# B2B Drop-in Quick Start

**One-page reference for adding new B2B drop-in documentation**

## ⚠️ IMPORTANT: Work on B2B Release Branch

**ALL B2B work must be done on the `releases/b2b-nov-release` branch:**

```bash
# Switch to B2B release branch
git checkout releases/b2b-nov-release
git pull origin releases/b2b-nov-release
```

## TL;DR - 5 Step Process

```bash
# 0. Switch to B2B branch (REQUIRED!)
git checkout releases/b2b-nov-release

# 1. Clone the B2B drop-in repository
cd .temp-repos && git clone <repo-url> && cd ..

# 2. Register in dropin-config.js (if needed)
# Edit: scripts/lib/dropin-config.js

# 3. Bootstrap + Generate (ONE COMMAND!)
npm run bootstrap-and-generate-b2b <dropin-name>

# 4. Edit overview page
# Edit: src/content/docs/dropins-b2b/<dropin-name>/index.mdx

# 5. Build & validate
npm run build:prod-fast
```

## Commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm run bootstrap-b2b-dropin <name>` | Creates directory + overview + sidebar | First time setup |
| `npm run bootstrap-and-generate-b2b <name>` | Bootstrap + generate all docs | **One-command full setup** |
| `npm run generate-all-docs` | Regenerates ALL drop-in docs | After enrichment changes |
| `npm run generate-function-docs` | Just functions.mdx | Quick function doc updates |
| `npm run generate-event-docs` | Just events.mdx | Quick event doc updates |
| `npm run build:prod-fast` | Validate build | Before committing |

## Example: Adding "Quote Management"

```bash
# Clone repo (if not already done)
cd .temp-repos
git clone https://github.com/adobe-commerce/storefront-quote-management.git
cd ..

# ONE COMMAND - Bootstrap + Generate
npm run bootstrap-and-generate-b2b quote-management

# Edit overview (add real description)
code src/content/docs/dropins-b2b/quote-management/index.mdx

# Validate
npm run build:prod-fast

# Commit to B2B branch
git add .
git commit -m "docs: Add Quote Management B2B drop-in

- Bootstrap directory structure and overview page
- Generate all documentation from source repository
- Add sidebar navigation entries"
git push origin releases/b2b-nov-release
```

## What Gets Created

```
src/content/docs/dropins-b2b/<name>/
├── index.mdx           ← Edit this manually
├── quick-start.mdx     ← Generated
├── initialization.mdx  ← Generated
├── containers/         ← Generated
│   └── *.mdx
├── functions.mdx       ← Generated
├── events.mdx          ← Generated
├── slots.mdx           ← Generated
├── dictionary.mdx      ← Generated
└── styles.mdx          ← Generated
```

## Enrichment Files (Optional but Better Docs)

```bash
# Create enrichment files for better docs
mkdir -p _dropin-enrichments/<dropin-name>

# Add descriptions (JSON format):
_dropin-enrichments/<dropin-name>/
├── functions.json      ← Function descriptions
├── events.json         ← Event descriptions
├── quick-start.json    ← Installation notes
└── initialization.json ← Config guidance
```

Then regenerate:
```bash
npm run generate-all-docs
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Repository not found" | Clone repo to `.temp-repos/` |
| Sidebar entry missing | Manually add to `astro.config.mjs` |
| Build fails with link errors | Run `npm run verify:enrichment-links` |
| Generated docs look thin | Add enrichment JSON files |

## Full Workflow (Detailed)

See [B2B-DROPIN-WORKFLOW.md](./B2B-DROPIN-WORKFLOW.md) for complete documentation including:
- Prerequisites and setup
- Enrichment file formats
- Regeneration strategies
- Complete examples
- Troubleshooting guide

