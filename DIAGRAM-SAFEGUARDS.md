# Diagram Component Safeguards

This document describes the safeguards implemented to prevent malformed Diagram components that cause build failures.

## The Problem

During merge conflict resolution, Diagram components can become malformed with escaped quotes:

```jsx
❌ WRONG: <Diagram caption=""Purchase Order..." block.">
✅ RIGHT: <Diagram caption="Purchase Order... block.">
```

These malformed captions cause **JSX parsing errors** that break the build.

## The Solution: Three-Layer Protection

### 1. Automated Validation Script

**File:** `scripts/validate-diagrams.js`

Automatically scans all merchant block files and detects:
- Escaped quotes in caption attributes (`caption=""`)
- Extra quotes in alt text (`!["`)
- Unresolved merge conflict markers

**Usage:**
```bash
# Run validation
pnpm run validate-diagrams

# Exit codes:
# 0 = all valid
# 1 = errors found
```

**Example Output:**
```
═══════════════════════════════════════════════════════════
🔍 VALIDATING DIAGRAM COMPONENTS
═══════════════════════════════════════════════════════════

Files checked: 58
Files with Diagrams: 58
Files with errors: 0

✅ ALL DIAGRAMS VALID
```

### 2. CI/CD Pipeline Integration

**File:** `.github/workflows/test-pull-request.yml`

The validation runs **automatically on every PR** before the build:

```yaml
- name: Validate Diagram Components
  run: pnpm run validate-diagrams
- name: Build
  run: pnpm run build:prod
```

**Result:** PRs with malformed Diagrams are **immediately rejected** before merge.

### 3. Manual Verification

**When merging branches**, always verify Diagram syntax:

```bash
# After resolving conflicts, check for issues
pnpm run validate-diagrams

# If errors found, fix with sed:
sed -i '' 's/<Diagram caption=""/<Diagram caption="/g' file.mdx
sed -i '' 's/" block\.">/ block.">/g' file.mdx
sed -i '' 's/!\["/![/g' file.mdx
```

## How Malformed Diagrams Happen

### Root Cause: Git Conflict Resolution

When merging branches with different Diagram formats:

```
Branch A: <Diagram caption="Text block.">
Branch B: <Diagram caption="Text block.">
```

Using `git checkout --theirs` or `git merge` can produce:

```
Result:   <Diagram caption=""Text" block.">  ❌
```

### Prevention During Merges

1. **Never blindly use** `git checkout --theirs` on files with Diagrams
2. **Always run validation** after resolving conflicts
3. **Test locally** before pushing to GitHub

## Common Patterns to Watch For

### ❌ Malformed Examples

```jsx
// Escaped quotes in caption
<Diagram caption=""Purchase Order" block.">

// Extra quotes in alt text
!["Purchase Order block.](/images/placeholder.webp)

// Unresolved conflict markers
<<<<<<< HEAD
<Diagram caption="Text block.">
=======
<Diagram caption="Text block.">
>>>>>>> branch
```

### ✅ Correct Format

```jsx
// Clean caption
<Diagram caption="Purchase Order block.">
  ![Purchase Order block.](/images/placeholder.webp)
</Diagram>
```

## Workflow Integration

### For Regular Development

```bash
# 1. Make changes to merchant blocks
# 2. Validate before committing
pnpm run validate-diagrams

# 3. Commit if valid
git add .
git commit -m "docs: Update merchant blocks"
```

### For Merge Conflict Resolution

```bash
# 1. Merge branch
git merge feature/branch

# 2. If conflicts in merchant blocks, resolve manually
# 3. Validate after resolution
pnpm run validate-diagrams

# 4. Fix any issues
# 5. Complete merge
git add .
git commit -m "Merge feature/branch"
```

### For PR Reviews

Reviewers can check for Diagram issues:

```bash
# Checkout PR branch
git checkout pr-branch

# Run validation
pnpm run validate-diagrams
```

## Technical Details

### Validation Patterns

The script checks for these regex patterns:

```javascript
// Pattern 1: Escaped quotes
/caption=""/

// Pattern 2: Extra quotes in alt text
/!\["/

// Pattern 3: Conflict markers
/<<<<<<</  or  />>>>>>>/
```

### Files Checked

- All `.mdx` files in `src/content/docs/merchants/blocks/`
- Recursively includes subdirectories
- Skips files without `<Diagram` components

## Emergency Recovery

If malformed Diagrams make it to production:

```bash
# 1. Identify affected files
pnpm run validate-diagrams

# 2. Fix all at once
for file in src/content/docs/merchants/blocks/*.mdx; do
  sed -i '' 's/<Diagram caption=""/<Diagram caption="/g' "$file"
  sed -i '' 's/" block\.">/ block.">/g' "$file"
  sed -i '' 's/!\["/![/g' "$file"
done

# 3. Verify fix
pnpm run validate-diagrams

# 4. Commit and push
git add src/content/docs/merchants/blocks/*.mdx
git commit -m "fix: Correct malformed Diagram captions"
git push
```

## History

### December 2024

**Problem Identified:**
- Merge conflicts during diagram placeholder updates caused malformed JSX
- 21 files across 5 PR branches had build failures

**Solution Implemented:**
- Created `validate-diagrams.js` validation script
- Integrated into CI/CD pipeline
- Added documentation and recovery procedures

**Result:**
- All branches fixed and validated
- Future occurrences prevented by automated checks

## Guarantee

With these three layers of protection:

1. ✅ **Automated validation** runs on every PR
2. ✅ **Build fails immediately** if Diagrams are malformed
3. ✅ **Local validation** available for developers

**We guarantee** malformed Diagram components will be caught **before merge** and **cannot break production builds**.

## Related Files

- `scripts/validate-diagrams.js` - Validation script
- `.github/workflows/test-pull-request.yml` - CI/CD integration
- `package.json` - NPM script definition
- `B2B-WORKFLOW.md` - Overall B2B documentation workflow

## Questions?

If you encounter Diagram-related build failures:

1. Run `pnpm run validate-diagrams` to identify issues
2. Use the emergency recovery steps above
3. Consult `B2B-WORKFLOW.md` for merge procedures

