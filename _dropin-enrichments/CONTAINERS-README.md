# Container Enrichments

This directory contains enrichment files that protect manual container documentation from being overwritten by the auto-generator.

## Overview

Many container documentation files have custom rich content:
- Diagrams and images
- OptionsTable components with detailed configurations
- CodeInclude components for type definitions
- Custom examples and tutorials

To prevent these from being overwritten when running `npm run generate-container-docs`, we use enrichment files with the `override_template: true` flag.

## Current Protection

**51 containers** across **10 drop-ins** are currently protected:

- **cart**: 1 container (MiniCart)
- **checkout**: 11 containers
- **order**: 9 containers
- **personalization**: 1 container
- **product-details**: 9 containers
- **product-discovery**: 4 containers
- **recommendations**: 1 container
- **user-account**: 5 containers
- **user-auth**: 6 containers
- **wishlist**: 4 containers

## How It Works

When you run `npm run generate-container-docs`:

1. Generator loads enrichment data from `{dropin}/containers.json`
2. For each container with `override_template: true`:
   - Generator **skips** that container
   - Manual file in `src/content/docs/dropins/{dropin}/containers/` is preserved
3. Containers without enrichment entries are auto-generated normally

## Protecting New Containers

If you create new container documentation with custom content:

### Option 1: Automatic (Recommended)

Run the protection script to scan and protect all containers with rich content:

```bash
npm run protect-manual-containers
```

This will:
- Scan all container files
- Detect rich content (Diagrams, OptionsTable, images, etc.)
- Create/update enrichment entries automatically

### Option 2: Manual

Add an entry to the appropriate `{dropin}/containers.json`:

```json
{
  "ContainerName": {
    "override_template": true,
    "description": "Brief description of the container",
    "note": "This container has custom manual documentation..."
  }
}
```

**Container names must be in PascalCase** (e.g., `MiniCart`, `PlaceOrder`, `ProductGallery`)

## Updating Protected Containers

Protected containers are **never overwritten** by the generator. To update them:

1. Manually edit the file in `src/content/docs/dropins/{dropin}/containers/`
2. Changes persist across generator runs

## Removing Protection

To allow a container to be auto-generated:

1. Remove the entry from `{dropin}/containers.json`, OR
2. Set `override_template: false`

Then run `npm run generate-container-docs -- {dropin}`

## Related Files

- **Generator**: `scripts/@generate-container-docs.js`
- **Protection Script**: `scripts/protect-manual-containers.js`
- **Manual Container Files**: `src/content/docs/dropins/*/containers/*.mdx`

## Verification

After running the protection script, verify with:

```bash
# Regenerate a drop-in to see which containers are skipped
npm run generate-container-docs -- checkout

# Should see: ⏭️  Skipping {ContainerName} (override_template: true)
```

