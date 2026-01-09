# 📢 ATTENTION: Publishing B2B to Production?

## 🚨 STOP AND READ THIS FIRST

**Before merging ANY B2B branch to `develop`**, you MUST follow the consolidation workflow.

### Quick Check: Which branch are you merging?

❌ **WRONG**: `b2b-docs-*` → `develop` (skips consolidation!)  
❌ **WRONG**: `releases/b2b-infrastructure` → `develop` (skips consolidation!)  
❌ **WRONG**: `releases/b2b-docs-only` → `develop` (skips consolidation!)

✅ **CORRECT**: `releases/b2b-nov-release` → `develop` (after consolidation)

---

## The Rule

**ALL B2B work MUST flow through `releases/b2b-nov-release` before going to `develop`.**

This preserves:
- All 3,230+ commits
- All 50+ contributor attributions
- Complete commit history

---

## What to Do

### Option 1: Use the Checklist (Recommended)

Open: **`PUBLISH-TO-PRODUCTION-CHECKLIST.md`**

Follow every step. Takes ~30 minutes total.

### Option 2: Use the Script

```bash
# Before merging, run:
./scripts/pre-merge-to-develop-check.sh <branch-name>

# This will STOP you if you're about to skip the workflow
```

### Option 3: Quick Steps

```bash
# 1. Consolidate
git checkout releases/b2b-nov-release
git merge releases/b2b-infrastructure --no-ff
git merge releases/b2b-docs-only --no-ff

# 2. Verify
./scripts/verify-publication-readiness.sh

# 3. Publish
git checkout develop
git merge releases/b2b-nov-release --no-ff
git push origin develop
```

---

## Why This Matters

If you skip the consolidation step:
- ❌ You might lose commits
- ❌ Contributors might not get credit
- ❌ History might be incomplete
- ❌ The 3,230+ commits might not merge properly

The consolidation step ensures **100% safety**.

---

## More Info

- **Full guide**: `B2B-WORKFLOW-GUIDE.md` → Workflow 4
- **Architecture**: `DUAL-BRANCH-ARCHITECTURE.md` → Publication Strategy
- **Checklist**: `PUBLISH-TO-PRODUCTION-CHECKLIST.md`

---

**🔖 BOOKMARK THIS FILE - You'll need it when publishing!**
