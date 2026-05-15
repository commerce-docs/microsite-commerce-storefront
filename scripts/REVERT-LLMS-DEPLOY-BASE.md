# Revert: LLMS bundle link base (GitHub Pages vs Experience League)

`STOREFRONT-LLMS-DEPLOY-BASE`

When you commit this work, put **`STOREFRONT-LLMS-DEPLOY-BASE`** in the commit subject or body so you can find it later with:

```bash
git log --oneline --grep=STOREFRONT-LLMS-DEPLOY-BASE
```

## What this change does

Generated `llms.txt`, `_llms-txt/*.txt`, and related bundles can use either Experience League (`site.config.js` `PRODUCTION_BASE_URL`) or the GitHub Pages preview URL, depending on environment variables. See `resolvePublicDocBase()` in `generate-llms-full.js`.

## Files involved

- `scripts/generate-llms-full.js` — `resolvePublicDocBase`, `PUBLIC_DOC_BASE`, `browseDocsLabel`, and all link emission that uses `PUBLIC_DOC_BASE`
- `.github/workflows/preview-on-pages.yml` — `NODE_ENV`, `GITHUB_PAGES_ORIGIN`, `VITE_GITHUB_BASE_PATH` on the build step

## Find the introducing commit (after push)

```bash
git log --oneline --grep=STOREFRONT-LLMS-DEPLOY-BASE
```

Or search history:

```bash
git log -S STOREFRONT-LLMS-DEPLOY-BASE --oneline -- scripts/generate-llms-full.js
```

## Revert options

1. **Single revert commit (preferred if history is linear):**  
   `git revert <commit-sha>`

2. **Manual:** Remove `resolvePublicDocBase` and use `PRODUCTION_BASE_URL` directly everywhere `PUBLIC_DOC_BASE` appears; remove `browseDocsLabel` and restore fixed “on Experience League” copy; delete this note. In `preview-on-pages.yml`, drop `GITHUB_PAGES_ORIGIN` from env if you drop script support, and restore whatever `run:` / env you had before (for example inline `NODE_ENV=github` only on `astro build` if you split the step again).

After a manual revert, delete this file and the `STOREFRONT-LLMS-DEPLOY-BASE` comments so the marker does not linger.
