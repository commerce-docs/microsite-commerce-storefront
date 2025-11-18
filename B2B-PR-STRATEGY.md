# B2B Documentation PR Strategy

## The Problem
- Multiple B2B dropins worked on across different branches
- Changes include both generators (shared) AND output pages (dropin-specific)
- Want clean reviews per dropin without splitting into error-prone separate PRs

## The Solution: Single Branch with Organized Commits

### Why This Works
1. **Reviewers only care about output pages** - They don't need to review generator scripts
2. **Generators are shared infrastructure** - Splitting them across PRs creates conflicts
3. **Git commits can be organized logically** - Group changes by dropin for easy review
4. **GitHub PR features support targeted reviews** - Can assign reviewers per file path

---

## Step-by-Step Implementation

### Step 1: Create Consolidated Branch

```bash
# Start fresh from main
git checkout main
git pull origin main

# Create single B2B documentation branch
git checkout -b b2b-documentation-complete

# This branch will contain ALL B2B work
```

### Step 2: Cherry-pick Changes in Logical Order

```bash
# First: Generator improvements (foundation for everything)
git cherry-pick <commit-hash-generator-fixes>

# Then: Each dropin in separate commits
git cherry-pick <commit-hash-company-management>
git cherry-pick <commit-hash-company-switcher>
git cherry-pick <commit-hash-requisition-list>
git cherry-pick <commit-hash-purchase-order>
git cherry-pick <commit-hash-quote-management>
```

**Better approach**: Reorganize commits cleanly:

```bash
# Option A: Interactive rebase to organize commits
git checkout purchase-order
git rebase -i main  # Reorganize commits by topic

# Option B: Create new branch and commit in order
git checkout -b b2b-documentation-complete main

# Commit 1: Generator infrastructure
git add scripts/@generate-*.js scripts/lib/ _dropin-templates/
git commit -m "feat: Add B2B generator improvements

- Add TypeScript-only function extraction
- Add .d.ts file support
- Fix template comment block handling
- Improve return type inference

Affects all B2B dropin documentation generation."

# Commit 2: Company Management documentation
git add src/content/docs/dropins-b2b/company-management/
git add _dropin-enrichments/company-management/
git commit -m "docs: Add Company Management dropin documentation

Generated documentation for 7 containers, 27 functions, 2 events.
Includes complete initialization, slots, dictionary, and styles pages.

Review focus: src/content/docs/dropins-b2b/company-management/"

# Commit 3: Company Switcher documentation  
git add src/content/docs/dropins-b2b/company-switcher/
git add _dropin-enrichments/company-switcher/
git commit -m "docs: Add Company Switcher dropin documentation

Generated documentation for 3 functions, 1 event.
Includes initialization, overview, and integration examples.

Review focus: src/content/docs/dropins-b2b/company-switcher/"

# Repeat for each dropin...
```

### Step 3: Structure PR Description for Easy Review

```markdown
# B2B Drop-ins Documentation

This PR adds comprehensive documentation for 5 B2B drop-ins with improved generators.

## Changes Overview

### Generator Infrastructure (Review Optional)
- `scripts/@generate-*.js` - Generator improvements
- `scripts/lib/` - Shared libraries
- `_dropin-templates/` - MDX templates
- `_dropin-enrichments/` - Editorial content

**Note**: Reviewers can skip these files - focus on output pages below.

---

## Documentation by Drop-in (Review These)

### 📦 Company Management (@reviewer-name-1)
**Review focus**: `src/content/docs/dropins-b2b/company-management/`

- ✅ 7 containers documented
- ✅ 27 functions documented  
- ✅ 2 events documented
- ✅ Initialization, slots, dictionary, styles

**Files**:
- index.mdx, functions.mdx, events.mdx
- containers/*.mdx
- initialization.mdx, slots.mdx, dictionary.mdx, styles.mdx

---

### 📦 Company Switcher (@reviewer-name-2)
**Review focus**: `src/content/docs/dropins-b2b/company-switcher/`

- ✅ 3 functions documented
- ✅ 1 event documented
- ✅ Complete integration examples

**Files**:
- functions.mdx, events.mdx, index.mdx

---

### 📦 Requisition List (@reviewer-name-3)
**Review focus**: `src/content/docs/dropins-b2b/requisition-list/`

- ✅ 5 containers documented
- ✅ 9 functions documented
- ✅ 5 events documented

**Files**:
- index.mdx, functions.mdx, events.mdx
- containers/*.mdx
- [other pages]

---

[Repeat for Purchase Order and Quote Management]

## Review Guidelines

1. **Each reviewer focuses ONLY on their assigned dropin folder**
2. **Check for**:
   - Technical accuracy
   - Code example correctness
   - Missing information
   - Formatting issues
3. **Ignore**:
   - Generator scripts (unless you're the tech lead)
   - Other dropins' folders
   - Shared infrastructure

## Testing

Reviewers can preview documentation by:
```bash
pnpm build:prod-fast
pnpm preview
```

Then navigate to `/dropins-b2b/<your-dropin>/`
```

### Step 4: Use GitHub Review Features

When creating the PR:

1. **Add all reviewers** but assign them specific paths
2. **Use PR comments** to tag reviewers at their sections:
   ```
   @reviewer1 - Please review Company Management section above ⬆️
   ```
3. **GitHub Settings** → Can request reviews for specific files/folders

---

## Advantages of This Approach

✅ **No cherry-picking errors** - Single source of truth
✅ **No merge conflicts** - One branch, one merge
✅ **Easy review** - Clear separation by folder
✅ **Parallel reviews** - Reviewers don't block each other
✅ **Clean git history** - Organized commits by topic
✅ **Single CI/CD run** - Test everything together
✅ **Atomic deployment** - All B2B docs go live together

## Disadvantages (Mitigated)

⚠️ **Large PR** → Mitigated by clear review sections
⚠️ **Multiple approvals needed** → But can be done in parallel
⚠️ **One blocker blocks all** → Can merge with subset of approvals if needed

---

## Alternative: Stacked PRs (If team prefers smaller PRs)

If reviewers REALLY need separate PRs:

```bash
# Base branch: generators
git checkout -b b2b-generators main
# [commit generator changes]
# PR #1: Review generators only

# Branch 1: Company Management (based on generators)
git checkout -b b2b-company-management b2b-generators
# [commit company management docs]
# PR #2: Review Company Management → merges to b2b-generators

# Branch 2: Company Switcher (based on generators)  
git checkout -b b2b-company-switcher b2b-generators
# [commit company switcher docs]
# PR #3: Review Company Switcher → merges to b2b-generators

# Continue pattern...
# Final PR: Merge b2b-generators to main
```

**Problem**: This is complex and error-prone (what you want to avoid).

---

## Recommendation

**Use the single consolidated branch approach.**

It's the cleanest solution given:
- Shared generator infrastructure
- Independent review requirements
- Need for atomic deployment

The PR might be large, but it's well-organized and reviewers only look at their assigned folders (100-300 lines each, not thousands).

