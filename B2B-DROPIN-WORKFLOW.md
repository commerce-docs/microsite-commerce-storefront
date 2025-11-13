# B2B Drop-in Documentation Workflow

Complete workflow for creating documentation for new B2B drop-ins from their source repositories.

## ⚠️ CRITICAL: B2B Integration Branch

**ALL B2B work MUST be done on the `releases/b2b-nov-release` branch.**

This is the official B2B integration branch that consolidates all B2B drop-in documentation before it goes to production. Never work on `develop` or `main` for B2B drop-ins.

### Switch to B2B Branch

```bash
# Check out the B2B release branch
git checkout releases/b2b-nov-release

# Pull latest changes
git pull origin releases/b2b-nov-release

# Verify you're on the correct branch
git branch --show-current
# Should output: releases/b2b-nov-release
```

## Prerequisites

1. **Source repository must be cloned** in `.temp-repos/`:
   ```bash
   # Clone the B2B drop-in repository
   cd .temp-repos
   git clone <b2b-dropin-repo-url>
   ```

2. **Drop-in must be registered** in `scripts/lib/dropin-config.js`:
   ```javascript
   'quote-management': {
       packageName: '@dropins/storefront-quote-management',
       gitUrl: 'https://github.com/adobe-commerce/storefront-quote-management.git',
       type: 'B2B',
       displayName: 'Quote Management',
       isPublic: true  // Set to true if repo is public
   }
   ```

## Workflow Steps

### Step 1: Bootstrap the B2B Drop-in

Creates the minimal directory structure and overview page:

```bash
npm run bootstrap-b2b-dropin <dropin-name>
```

**Example:**
```bash
npm run bootstrap-b2b-dropin quote-management
```

**What this creates:**
- Directory: `src/content/docs/dropins-b2b/<dropin-name>/`
- Overview file: `src/content/docs/dropins-b2b/<dropin-name>/index.mdx`
- Sidebar entry in `astro.config.mjs` with all sub-pages

**What you need to do manually after bootstrap:**
1. Edit `src/content/docs/dropins-b2b/<dropin-name>/index.mdx`:
   - Add meaningful description
   - Update the feature table with actual features
   - Review/customize section descriptions
   - Add any B2B-specific notes

### Step 2: Create Enrichment Files (Optional but Recommended)

Create enrichment JSON files to provide editorial context for generated docs:

```bash
mkdir -p _dropin-enrichments/<dropin-name>
```

Create these files as needed:
- `_dropin-enrichments/<dropin-name>/functions.json` - Function descriptions
- `_dropin-enrichments/<dropin-name>/events.json` - Event descriptions
- `_dropin-enrichments/<dropin-name>/quick-start.json` - Installation notes
- `_dropin-enrichments/<dropin-name>/initialization.json` - Config guidance

**Enrichment file format example:**
```json
{
  "functions": {
    "getFunctionName": {
      "description": "Human-readable description of what this function does.",
      "parameters": {
        "paramName": {
          "description": "What this parameter is used for"
        }
      }
    }
  }
}
```

**Best practice:** Extract from manual docs or source code comments.

### Step 3: Generate All Documentation

Run the master generator to create all documentation files:

```bash
npm run generate-all-docs
```

**What this generates for your B2B drop-in:**
- `quick-start.mdx` - Installation and setup guide
- `initialization.mdx` - Configuration options
- `containers/*.mdx` - Individual UI container pages
- `functions.mdx` - API function reference
- `events.mdx` - Event bus documentation
- `slots.mdx` - Customization slots
- `dictionary.mdx` - i18n translation keys
- `styles.mdx` - CSS styling guide

**Time estimate:** 15-20 minutes for all generators

**Skip link verification** (if needed):
```bash
npm run generate-all-docs -- --skip-link-check
```

### Step 4: Review and Refine

1. **Check the generated documentation:**
   ```bash
   npm run dev
   # Visit: http://localhost:4321/developer/commerce/storefront/dropins-b2b/<dropin-name>/
   ```

2. **Common refinements needed:**
   - Add more context to function descriptions (via enrichment files)
   - Add real-world usage examples
   - Fix any broken GraphQL documentation links
   - Add screenshots or diagrams if helpful

3. **Regenerate specific docs** if you make enrichment changes:
   ```bash
   npm run generate-function-docs      # Just functions
   npm run generate-event-docs         # Just events
   npm run generate-initialization-docs # Just initialization
   # etc.
   ```

### Step 5: Build and Validate

```bash
npm run build:prod-fast
```

This validates:
- All internal links work
- No broken references
- Proper sidebar structure

## Quick Reference Commands

```bash
# 1. Bootstrap new B2B drop-in
npm run bootstrap-b2b-dropin <name>

# 2. Generate all documentation
npm run generate-all-docs

# 3. Regenerate specific doc types
npm run generate-function-docs
npm run generate-event-docs
npm run generate-container-docs
npm run generate-slot-docs
npm run generate-styles-docs
npm run generate-dictionary-docs
npm run generate-quick-start-docs
npm run generate-initialization-docs

# 4. Validate
npm run build:prod-fast
```

## Complete Example: Adding "Quote Management"

```bash
# 0. FIRST: Switch to B2B release branch
git checkout releases/b2b-nov-release
git pull origin releases/b2b-nov-release

# 1. Clone the repository
cd .temp-repos
git clone https://github.com/adobe-commerce/storefront-quote-management.git
cd ..

# 2. Register in dropin-config.js (if not already done)
# Edit: scripts/lib/dropin-config.js
# Add entry for 'quote-management'

# 3. Bootstrap
npm run bootstrap-b2b-dropin quote-management

# 4. Edit overview page
# Edit: src/content/docs/dropins-b2b/quote-management/index.mdx
# - Update description
# - Update features table

# 5. (Optional) Create enrichment files
mkdir -p _dropin-enrichments/quote-management
# Create functions.json, events.json, etc.

# 6. Generate all documentation
npm run generate-all-docs

# 7. Review locally
npm run dev

# 8. Build and validate
npm run build:prod-fast

# 9. Commit to B2B branch
git add .
git commit -m "docs: Add Quote Management B2B drop-in

- Bootstrap directory structure and overview page
- Generate functions, events, containers, slots, and styles docs
- Add sidebar navigation entries"

# 10. Push to B2B release branch
git push origin releases/b2b-nov-release
```

## Troubleshooting

### Generator fails with "Repository not found"

**Problem:** The drop-in repository isn't cloned in `.temp-repos/`

**Solution:**
```bash
cd .temp-repos
git clone <repo-url>
cd ..
npm run generate-all-docs
```

### "Could not extract types" error

**Problem:** The drop-in source doesn't have proper TypeScript definitions

**Solution:**
- Check that the drop-in has an `index.d.ts` or similar type definition file
- May need to add manual type definitions in enrichment files

### Links to GraphQL docs are broken

**Problem:** Enrichment files reference incorrect GraphQL documentation URLs

**Solution:**
```bash
# Verify all enrichment links
npm run verify:enrichment-links

# Fix broken URLs in _dropin-enrichments/<dropin-name>/*.json
```

### Sidebar entry doesn't appear

**Problem:** The bootstrap script couldn't find the B2B section in `astro.config.mjs`

**Solution:**
- Manually add the sidebar entry to `astro.config.mjs`
- Look for the `'B2B drop-ins'` section
- Follow the pattern from existing B2B drop-ins

## File Structure After Workflow

```
microsite-commerce-storefront/
├── .temp-repos/
│   └── storefront-<dropin-name>/        # Source repository
├── _dropin-enrichments/
│   └── <dropin-name>/                   # Editorial content (optional)
│       ├── functions.json
│       ├── events.json
│       ├── quick-start.json
│       └── initialization.json
├── src/content/docs/dropins-b2b/
│   └── <dropin-name>/                   # Generated documentation
│       ├── index.mdx                    # Overview (manually edited)
│       ├── quick-start.mdx              # Generated
│       ├── initialization.mdx           # Generated
│       ├── containers/                  # Generated
│       │   ├── index.mdx
│       │   └── <container-name>.mdx
│       ├── functions.mdx                # Generated
│       ├── events.mdx                   # Generated
│       ├── slots.mdx                    # Generated
│       ├── dictionary.mdx               # Generated
│       └── styles.mdx                   # Generated
└── astro.config.mjs                     # Sidebar updated by bootstrap
```

## Notes

- **Bootstrap only creates the overview page** - everything else is generated
- **Enrichment files are optional** but improve documentation quality
- **All generators read from `.temp-repos/`** - source repos must be cloned there
- **The workflow is identical for all B2B drop-ins** - just change the name
- **Regeneration is safe** - generated files can be recreated anytime from source

