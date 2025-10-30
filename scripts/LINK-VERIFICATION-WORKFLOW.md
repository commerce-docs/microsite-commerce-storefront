# Link Verification Workflow Guide

## Quick Reference

```bash
# Verify links manually
pnpm run verify-links

# Generate all docs (with automatic verification)
pnpm run generate-all-docs

# Generate individual docs (manual verification recommended)
pnpm run verify-links && pnpm run generate-function-docs cart

# Emergency: Skip verification (not recommended)
pnpm run generate-all-docs -- --skip-link-check
```

## When Links Are Verified

### ✅ Automatic Verification

**`pnpm run generate-all-docs`**

Links are automatically verified as a pre-flight check before any generators run.

```
======================================================================
  MASTER DOCUMENTATION GENERATOR
======================================================================

🔍 PRE-FLIGHT CHECK: Verifying enrichment file links...

   This ensures all GraphQL documentation URLs are valid.
   (Skip with --skip-link-check if needed)

🔍 Verifying URLs in Enrichment Files
Found 30 unique URLs to verify...
✓ Working URLs: 30
✗ Broken URLs: 0

✅ All enrichment file links are valid!

Starting generation in 3 seconds...
```

**Benefits:**
- ✅ Catches broken links before generating 500+ pages
- ✅ Prevents broken links from reaching production
- ✅ Only runs once (15 seconds), not 9 times (2+ minutes)
- ✅ Clear error messages with fix instructions

### ⚠️ Manual Verification Recommended

**Individual Generator Runs:**
- `pnpm run generate-function-docs [dropin]`
- `node scripts/@generate-function-docs.js [dropin]`

**Why not automatic?**
- Individual generators run frequently during development (testing, iteration)
- Verification adds 15 seconds to every run
- Would slow down rapid development cycles

**When to verify manually:**
1. Before committing enrichment file changes
2. After updating GraphQL documentation URLs
3. When working on multiple enrichment files
4. Before creating a pull request

**How to verify manually:**
```bash
# Quick verification
pnpm run verify-links

# Then generate individual docs
pnpm run generate-function-docs cart
```

## Workflow Scenarios

### Scenario 1: Regular Documentation Regeneration

**Command:**
```bash
pnpm run generate-all-docs
```

**What happens:**
1. ✅ Links verified automatically (15 seconds)
2. ✅ All generators run (15-20 minutes)
3. ✅ 500+ pages regenerated with valid links

**No extra steps needed!**

---

### Scenario 2: Updating Enrichment Files

**Workflow:**
```bash
# 1. Edit enrichment file
code _dropin-enrichments/cart/functions.json

# 2. Verify links
pnpm run verify-links

# 3. Generate docs for testing
pnpm run generate-function-docs cart

# 4. Verify output
# Check src/content/docs/dropins/cart/functions.mdx

# 5. Commit when satisfied
git add _dropin-enrichments/cart/functions.json
git commit -m "fix: update cart enrichment descriptions"
```

**Best practice:** Run verification after editing any enrichment file with URLs.

---

### Scenario 3: Quick Individual Generator Iteration

**Workflow:**
```bash
# Verify once
pnpm run verify-links

# Then iterate freely
pnpm run generate-function-docs cart
pnpm run generate-function-docs wishlist
pnpm run generate-function-docs checkout

# Links are already verified, no need to re-check
```

**Tip:** Verification results are valid until you change enrichment files.

---

### Scenario 4: Broken Link Detected

**What you see:**
```
🔍 PRE-FLIGHT CHECK: Verifying enrichment file links...

✗ Broken URLs: 3

✗ https://developer.adobe.com/commerce/...
  Status: 404
  Found in:
    - user-account/functions.json (1 occurrence)

❌ Link verification failed!

⚠️  Some URLs in enrichment files are broken.
   Please fix the broken links before generating documentation.

   Options:
   1. Fix the URLs in enrichment files and try again
   2. Run with --skip-link-check to generate anyway (not recommended)
```

**How to fix:**
```bash
# 1. Note which files have broken links

# 2. Fix the URLs in enrichment files
code _dropin-enrichments/user-account/functions.json
# Update the broken URL

# 3. Verify fix
pnpm run verify-links

# 4. Generate docs
pnpm run generate-all-docs
```

---

### Scenario 5: Adobe Documentation URL Changed

**Symptoms:**
- Previously working link now returns 404
- Multiple functions affected

**Resolution:**
```bash
# 1. Run verification to identify affected URLs
pnpm run verify-enrichment-links

# 2. Search for correct Adobe Commerce documentation
# Check: https://developer.adobe.com/commerce/webapi/graphql/reference/

# 3. Update enrichment files with corrected URLs
# e.g., /directory/queries/ → /store/queries/

# 4. Verify all links working
pnpm run verify-links

# 5. Regenerate affected documentation
pnpm run generate-all-docs
```

---

### Scenario 6: CI/CD Pipeline

**Recommended workflow:**

```yaml
# .github/workflows/docs.yml
steps:
  - name: Verify enrichment links
    run: pnpm run verify-links
    
  - name: Generate documentation
    run: pnpm run generate-all-docs
    
  - name: Build site
    run: pnpm run build:prod
```

**Note:** `generate-all-docs` includes verification, but explicit step provides better error visibility in CI logs.

---

### Scenario 7: Emergency - Skip Verification

**When you might need this:**
- Adobe's documentation site is temporarily down
- You need to generate docs urgently for a demo
- You're working offline

**Command:**
```bash
pnpm run generate-all-docs -- --skip-link-check
```

**⚠️ Warning:** This will generate documentation with potentially broken links. Use only when absolutely necessary and fix links ASAP.

**Better approach:**
```bash
# Fix the specific broken link first
# Then generate normally
pnpm run generate-all-docs
```

## Commands Reference

### Verification Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `pnpm run verify-links` | Quick verification | Pass/Fail with summary |
| `pnpm run verify-enrichment-links` | Detailed verification | Full report with locations |
| `node scripts/verify-enrichment-links.js` | Direct execution | Same as above |

### Generation Commands with Verification

| Command | Automatic Verification | Time Impact |
|---------|----------------------|-------------|
| `pnpm run generate-all-docs` | ✅ Yes | +15 seconds |
| `pnpm run generate-all-docs -- --skip-link-check` | ❌ No | 0 seconds |
| `pnpm run generate-function-docs` | ❌ No | 0 seconds |
| `node scripts/@generate-function-docs.js cart` | ❌ No | 0 seconds |

## Best Practices

### ✅ Do

1. **Run verification after editing enrichment files**
   ```bash
   # Edit file
   code _dropin-enrichments/cart/functions.json
   
   # Verify immediately
   pnpm run verify-links
   ```

2. **Use `generate-all-docs` for full regeneration**
   ```bash
   # Automatic verification included
   pnpm run generate-all-docs
   ```

3. **Verify once, iterate many**
   ```bash
   pnpm run verify-links  # Once
   pnpm run generate-function-docs cart  # Many times
   ```

4. **Fix broken links at the source**
   - Update enrichment files, not generated MDX
   - Fixes persist across regenerations

### ❌ Don't

1. **Don't skip verification without good reason**
   ```bash
   # Avoid unless emergency
   pnpm run generate-all-docs -- --skip-link-check
   ```

2. **Don't fix links in generated MDX files**
   ```bash
   # ❌ Don't edit these
   src/content/docs/dropins/cart/functions.mdx
   
   # ✅ Edit these instead
   _dropin-enrichments/cart/functions.json
   ```

3. **Don't run verification before every individual generator**
   ```bash
   # ❌ Inefficient
   pnpm run verify-links && pnpm run generate-function-docs cart
   pnpm run verify-links && pnpm run generate-function-docs wishlist
   
   # ✅ Better
   pnpm run verify-links
   pnpm run generate-function-docs cart
   pnpm run generate-function-docs wishlist
   ```

## Troubleshooting

### Verification Takes Too Long

**Normal:** 15 seconds for 30 URLs
**Cause:** Network latency, Adobe server response times
**Solution:** Be patient, or skip verification for iteration (not for commits)

### False Positives (Link works in browser but fails verification)

**Cause:** Timeout, rate limiting, or server protection
**Solution:** 
1. Verify URL in browser
2. If it works, the URL is correct
3. The verification script uses 10-second timeouts
4. Occasional failures are okay for valid URLs

### All Links Suddenly Broken

**Cause:** Network connectivity issue
**Solution:**
1. Check internet connection
2. Try visiting https://developer.adobe.com manually
3. If down, use `--skip-link-check` temporarily

## Maintenance

### Weekly

```bash
# Verify all links are still valid
pnpm run verify-enrichment-links
```

### Before Releases

```bash
# Full verification and regeneration
pnpm run generate-all-docs
```

### After Adobe Documentation Updates

```bash
# Check for broken links
pnpm run verify-links

# Fix any broken URLs
# Then regenerate
pnpm run generate-all-docs
```

## Related Documentation

- [Link Verification Summary](./LINK-VERIFICATION-SUMMARY.md) - Technical details and history
- [Parameter Patterns Guide](../_dropin-enrichments/PARAMETER-PATTERNS-README.md) - Content quality
- [Improvements Summary](../_dropin-enrichments/IMPROVEMENTS-SUMMARY.md) - System overview

---

**Status:** Link verification integrated and production-ready ✅  
**Date:** October 30, 2025

