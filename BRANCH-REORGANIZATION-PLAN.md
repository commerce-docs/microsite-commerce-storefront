# Branch Reorganization Plan - Action Steps

## Current Situation
- On `purchase-order` branch with changes for multiple dropins
- Need to consolidate into single reviewable PR
- Want to avoid error-prone cherry-picking

## Goal
Single `b2b-documentation` branch with organized commits that's easy to review by dropin.

---

## Step 1: Commit Current Work with Clear Message

```bash
# First, see what files have changed
git status

# Stage and commit everything currently modified
git add -A
git commit -m "WIP: B2B documentation work in progress

Includes:
- Generator improvements (TypeScript support, template fixes)
- Company Management documentation
- Company Switcher documentation  
- Requisition List documentation
- Purchase Order documentation
- Quote Management documentation

Will be reorganized into clean commits before PR."
```

---

## Step 2: Create Clean Branch from Main

```bash
# Fetch latest from remote
git fetch origin

# Create new branch from main
git checkout -b b2b-documentation origin/main

# Cherry-pick the WIP commit
git cherry-pick purchase-order

# OR if cherry-pick has issues, use patch:
# git checkout purchase-order
# git diff main > b2b-changes.patch
# git checkout -b b2b-documentation main
# git apply b2b-changes.patch
# git add -A
# git commit -m "Add complete B2B documentation"
```

---

## Step 3: Organize Into Logical Commits (Optional but Recommended)

If you want super clean history:

```bash
# Interactive rebase to split into logical commits
git rebase -i main

# In the editor, mark the commit as 'edit'
# Then split it:

# Commit 1: Generators and infrastructure
git reset HEAD^
git add scripts/ _dropin-templates/ CONTRIBUTING.md
git commit -m "feat: Improve B2B documentation generators

- Add TypeScript-only function extraction (.d.ts support)
- Add template comment block removal
- Improve return type inference
- Add external link component usage
- Update generator core for B2B branch support

These changes enable accurate B2B dropin documentation generation.

Technical review: @tech-lead
Optional for dropin reviewers."

# Commit 2: Enrichment files (editorial content)
git add _dropin-enrichments/
git commit -m "docs: Add B2B dropin enrichment content

Editorial descriptions, examples, and metadata for:
- Company Management
- Company Switcher
- Requisition List
- Purchase Order
- Quote Management

These files provide human-written context for generated docs."

# Commit 3: Company Management docs
git add src/content/docs/dropins-b2b/company-management/
git commit -m "docs: Generate Company Management documentation

Complete documentation including:
- Overview and quick start
- 7 containers with examples
- 27 functions with signatures
- 2 events with integration patterns
- Initialization, slots, dictionary, styles

📋 Review focus: src/content/docs/dropins-b2b/company-management/
👤 Reviewer: @company-management-expert"

# Commit 4: Company Switcher docs
git add src/content/docs/dropins-b2b/company-switcher/
git commit -m "docs: Generate Company Switcher documentation

Complete documentation including:
- Overview and quick start
- 3 functions with signatures  
- 1 event with integration patterns
- Initialization and styles

📋 Review focus: src/content/docs/dropins-b2b/company-switcher/
👤 Reviewer: @company-switcher-expert"

# Continue for other dropins...

# When done splitting:
git rebase --continue
```

**Simpler approach** (if you want to skip the splitting):

```bash
# Just keep the single commit and push
# The PR description will organize the review
```

---

## Step 4: Push and Create PR

```bash
# Push the new branch
git push origin b2b-documentation

# Create PR on GitHub
# Use the PR template from B2B-PR-STRATEGY.md
```

---

## Step 5: Structure GitHub PR (Copy/Paste This Template)

```markdown
# B2B Drop-ins Complete Documentation

This PR adds comprehensive, generated documentation for all 5 B2B drop-ins.

## 🎯 Review Instructions

**Each reviewer should ONLY review their assigned dropin folder below.**

Generator changes (scripts/, templates/) are optional to review - focus on output quality.

---

## 📦 Drop-in Reviews

### Company Management
**👤 Reviewer**: @[username]  
**📁 Focus**: `src/content/docs/dropins-b2b/company-management/`

**What's included**:
- ✅ Overview and quick start
- ✅ 7 containers (CompanyProfile, CompanyStructure, CompanyUsers, etc.)
- ✅ 27 API functions  
- ✅ 2 events
- ✅ Initialization, slots, dictionary, styles

**Check for**: Technical accuracy, example correctness, missing info

---

### Company Switcher
**👤 Reviewer**: @[username]
**📁 Focus**: `src/content/docs/dropins-b2b/company-switcher/`

**What's included**:
- ✅ Overview and quick start
- ✅ 3 API functions (verified against TypeScript definitions)
- ✅ 1 event with integration examples
- ✅ Initialization and styles

**Check for**: Technical accuracy, example correctness

---

### Requisition List
**👤 Reviewer**: @[username]
**📁 Focus**: `src/content/docs/dropins-b2b/requisition-list/`

**What's included**:
- ✅ Overview and quick start
- ✅ 5 containers
- ✅ 9 API functions (100% verified)
- ✅ 5 events
- ✅ Complete integration examples

---

### Purchase Order  
**👤 Reviewer**: @[username]
**📁 Focus**: `src/content/docs/dropins-b2b/purchase-order/`

**What's included**:
- ✅ Overview and quick start
- ✅ 12 containers with complete boilerplate examples
- ✅ Functions and events
- ✅ Initialization, slots, dictionary, styles

---

### Quote Management
**👤 Reviewer**: @[username]
**📁 Focus**: `src/content/docs/dropins-b2b/quote-management/`

**What's included**:
- ✅ Overview and quick start
- ✅ 15 containers
- ✅ Functions and events
- ✅ Complete documentation suite

---

## 🔧 Generator Improvements (Optional Review)

**📁 Files**: `scripts/`, `_dropin-templates/`, `_dropin-enrichments/`

For tech leads who want to review infrastructure:
- Added TypeScript-only function extraction
- Improved template processing
- Enhanced return type inference
- External link component integration

---

## 🧪 Testing

Preview documentation locally:

\`\`\`bash
pnpm build:prod-fast
pnpm preview
# Navigate to /dropins-b2b/[your-dropin]/
\`\`\`

---

## ✅ Approval Strategy

- Each dropin reviewer approves independently
- Parallel reviews (no blocking)
- Can merge with subset of approvals if needed
- Generators reviewed separately by tech lead
```

---

## Alternative: Quick and Dirty (If Time-Constrained)

```bash
# Just push current branch renamed
git branch -m purchase-order b2b-documentation
git push origin b2b-documentation

# Delete old remote branch
git push origin --delete purchase-order

# Create PR with organized description
```

---

## Recommendation

**Use Step 2 (Clean branch) + Step 5 (Organized PR description)**

This gives you:
- ✅ Clean git history
- ✅ Easy parallel reviews
- ✅ Clear review assignments
- ✅ No cherry-picking errors

The PR will be large (~500-1000 lines changed) but each reviewer only looks at 100-200 lines in their folder.

**Time estimate**: 20-30 minutes to reorganize and push.

