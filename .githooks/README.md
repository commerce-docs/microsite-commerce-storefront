# Git Hooks for B2B Publication Safety

## What's Here

This directory contains Git hooks that prevent accidental direct merges of B2B work to `develop` without proper consolidation.

### `pre-push`

**Purpose**: Blocks pushes to `develop` from B2B branches (except `releases/b2b-nov-release`)

**When it runs**: Before every `git push`

**What it does**:
1. Detects if you're pushing to `develop`
2. Checks if current branch is B2B-related
3. **ALLOWS** if pushing from `releases/b2b-nov-release` (correct!)
4. **BLOCKS** if pushing from any other B2B branch (wrong!)
5. Shows correct workflow if blocked
6. Prompts to run verification script
7. Checks timestamp of last verification

---

## Setup (One-Time Per Developer)

```bash
# From repository root:
./scripts/setup-b2b-safety-hooks.sh
```

This configures Git to use hooks from this directory.

**Alternative manual setup:**
```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-push
```

---

## How It Works

### Scenario 1: Correct Workflow ✅

```bash
git checkout releases/b2b-nov-release
# ... do consolidation ...
git push origin releases/b2b-nov-release

# Hook allows this! (after verification check)
```

### Scenario 2: Wrong Workflow ❌

```bash
git checkout b2b-docs-requisition-list-v3
git push origin develop

# Hook BLOCKS this!
# Shows error with correct workflow
```

### Scenario 3: Non-B2B Branch ℹ️

```bash
git checkout feature/some-fix
git push origin develop

# Hook allows (not B2B-related)
```

---

## Verification Timestamp

The hook checks `.last-publication-verification` (git-ignored file):
- Created by `scripts/verify-publication-readiness.sh`
- Contains Unix timestamp of last verification
- Hook warns if verification is >1 hour old
- Prompts to re-run verification if stale

**Manual verification:**
```bash
./scripts/verify-publication-readiness.sh
```

---

## Bypassing (Emergency Only)

**Disable hooks temporarily:**
```bash
git config --unset core.hooksPath
# Make your push
git config core.hooksPath .githooks  # Re-enable!
```

**Skip hook for one push:**
```bash
git push --no-verify origin develop
```

**⚠️ WARNING**: Bypassing can cause data loss! Only do this if:
- You understand the risk
- You have approval
- You'll fix it properly afterward

---

## Testing

Test that hooks work:

```bash
# Test 1: Should BLOCK
git checkout b2b-docs-requisition-list-v3
git push --dry-run origin develop
# Expected: Hook blocks with error

# Test 2: Should ALLOW (with verification)
git checkout releases/b2b-nov-release
git push --dry-run origin releases/b2b-nov-release
# Expected: Hook allows after verification check
```

---

## Troubleshooting

### "Hook didn't run"

Check hook configuration:
```bash
git config core.hooksPath
# Should show: .githooks
```

Re-run setup if needed:
```bash
./scripts/setup-b2b-safety-hooks.sh
```

### "Hook keeps asking for verification"

Run the verification script:
```bash
./scripts/verify-publication-readiness.sh
```

This creates the timestamp file that the hook checks.

### "I got blocked but I think I'm right"

Read the error message carefully:
- It shows which branch you're on
- It shows the correct workflow
- It links to documentation

If you're pushing from `releases/b2b-nov-release`, the hook should allow it (after verification).

---

## Team Setup

**After cloning the repository**, each developer must:

1. Run the setup script:
   ```bash
   ./scripts/setup-b2b-safety-hooks.sh
   ```

2. Read the documentation:
   - `PUBLISH-B2B-README.md`
   - `PUBLISH-TO-PRODUCTION-CHECKLIST.md`

3. Test that hooks work (see Testing section above)

---

## Maintenance

### Updating Hooks

Hooks are versioned in Git. To update:

1. Edit `.githooks/pre-push`
2. Commit changes
3. Team members automatically get updated hook on next pull
4. No re-setup needed (unless `core.hooksPath` changes)

### Checking Hook Status

```bash
# Is hook configured?
git config core.hooksPath

# Is hook executable?
ls -la .githooks/pre-push

# Test hook manually
./.githooks/pre-push
```

---

## Related

- **GitHub Actions**: `.github/workflows/prevent-b2b-direct-merge.yml` (PR checks)
- **Branch Protection**: See `GITHUB-BRANCH-PROTECTION-SETUP.md`
- **Verification**: `scripts/verify-publication-readiness.sh`
- **Workflow Guide**: `B2B-WORKFLOW-GUIDE.md`

---

**Multiple Safety Layers**:
1. ✅ Git pre-push hooks (this)
2. ✅ GitHub Actions (PR validation)
3. ✅ Branch protection rules
4. ✅ Required reviews
5. ✅ Status checks

**Result**: Nearly impossible to accidentally bypass! 🛡️

