# B2B Dual-Branch Architecture - Complete Documentation

## Quick Start

**New to the architecture?** Start here:
1. Read [DUAL-BRANCH-ARCHITECTURE.md](./DUAL-BRANCH-ARCHITECTURE.md) - Understand WHY and WHAT
2. Read [B2B-WORKFLOW-GUIDE.md](./B2B-WORKFLOW-GUIDE.md) - Learn HOW to work daily
3. Run validation: `npm run validate-b2b-enrichments && ./scripts/validate-branch-content.sh`

**Publishing to production?** 🚨 **READ THIS FIRST:**
1. [PUBLISH-B2B-README.md](./PUBLISH-B2B-README.md) - **STOP! Read before merging to develop**
2. [PUBLISH-TO-PRODUCTION-CHECKLIST.md](./PUBLISH-TO-PRODUCTION-CHECKLIST.md) - Complete checklist
3. Run check: `./scripts/pre-merge-to-develop-check.sh <branch-name>`

## Documentation Structure

### 📚 Core Architecture Documents

#### [DUAL-BRANCH-ARCHITECTURE.md](./DUAL-BRANCH-ARCHITECTURE.md)
**Purpose**: Complete architecture specification

**Contains**:
- Problem statement (why we need this)
- Solution overview (two release branches)
- File ownership matrix
- Workflows for each scenario
- Testing strategy
- Benefits and rationale

**Read this if**: You need to understand the architecture or make changes to it

---

#### [B2B-WORKFLOW-GUIDE.md](./B2B-WORKFLOW-GUIDE.md)
**Purpose**: Daily operational procedures

**Contains**:
- Quick reference table
- Step-by-step workflows for common tasks
- All 10 potential issues and their solutions
- Validation checklist
- Emergency procedures
- Branch protection rules

**Read this if**: You're working on B2B documentation or infrastructure

---

#### [B2B-ARCHITECTURE-INDEX.md](./B2B-ARCHITECTURE-INDEX.md) ← You are here
**Purpose**: Navigation and overview

**Contains**:
- Document index
- Quick reference
- Decision tree for "which branch?"
- Common scenarios

---

### 🛠️ Tools and Scripts

#### [scripts/validate-b2b-enrichments.js](./scripts/validate-b2b-enrichments.js)
**Purpose**: Detect enrichment pollution

**Usage**:
```bash
npm run validate-b2b-enrichments           # Check
npm run validate-b2b-enrichments -- --fix  # Fix
```

**What it checks**:
- Parameters from other drop-ins (pollution)
- Containers that don't exist in source code
- Parameter counts across branches

---

#### [scripts/validate-branch-content.sh](./scripts/validate-branch-content.sh)
**Purpose**: Enforce dual-branch architecture rules

**Usage**:
```bash
./scripts/validate-branch-content.sh              # Full validation
./scripts/validate-branch-content.sh --pre-commit # Pre-commit hook
```

**What it checks**:
- Infrastructure branch: Only infrastructure files
- Docs-only branch: Only merged drop-ins
- Feature branches: Only their drop-in's content
- No cross-contamination

---

#### [scripts/migrate-to-dual-branch.sh](./scripts/migrate-to-dual-branch.sh)
**Purpose**: Migrate from single to dual-branch architecture

**Usage**:
```bash
./scripts/migrate-to-dual-branch.sh audit    # Dry-run analysis
./scripts/migrate-to-dual-branch.sh execute  # Perform migration
```

**What it does**:
- Comprehensive audit of all branches
- Enrichment ownership decisions
- Step-by-step migration plan
- Creates new branch structure

---

#### [scripts/audit-branch-state.sh](./scripts/audit-branch-state.sh)
**Purpose**: Analyze current branch state

**Usage**:
```bash
./scripts/audit-branch-state.sh
```

**What it shows**:
- Infrastructure file versions across branches
- Documentation presence per branch
- Enrichment file comparisons
- What would be synced

---

#### [scripts/compare-enrichments.sh](./scripts/compare-enrichments.sh)
**Purpose**: Detailed enrichment comparison

**Usage**:
```bash
./scripts/compare-enrichments.sh [dropin-name]
```

**What it shows**:
- Parameter-level differences
- Which version is cleaner
- Pollution analysis
- Recommendations

---

### 📋 Reference Documents

#### [INFRASTRUCTURE-SYNC.md](./INFRASTRUCTURE-SYNC.md)
**Status**: ⚠️ DEPRECATED - Use B2B-WORKFLOW-GUIDE.md instead

**Historical context**: Original sync strategy before dual-branch architecture

---

#### [FIX-STRATEGY.md](./FIX-STRATEGY.md)
**Status**: ⚠️ DEPRECATED - Use migration scripts instead

**Historical context**: Manual fix strategy before automation

---

### 🔄 CI/CD

#### [.github/workflows/validate-b2b-architecture.yml](./.github/workflows/validate-b2b-architecture.yml)
**Purpose**: Automated validation on push/PR

**Runs**:
- Branch content validation
- Enrichment validation
- Merge direction checks
- Comments on failed PRs

**Triggers**:
- Push to any B2B branch
- PR to any B2B branch

---

## Decision Trees

### "Which Branch Should I Use?"

```
┌─ Need to update a generator?
│  └─> releases/b2b-infrastructure
│
├─ Need to update _dropin-templates/?
│  └─> releases/b2b-infrastructure
│
├─ Need to update package.json?
│  └─> releases/b2b-infrastructure
│
├─ Working on drop-in documentation?
│  └─> b2b-docs-[dropin-name]-vN
│
├─ Updating enrichments for a drop-in?
│  └─> b2b-docs-[dropin-name]-vN
│
├─ Merging approved drop-in?
│  └─> releases/b2b-docs-only
│
├─ Updating preview for reviewers?
│  └─> b2b-documentation
│
└─ Updating astro.config.mjs sidebar?
   └─> b2b-documentation (only)
```

### "How Do I Sync?"

```
┌─ Infrastructure updated?
│  └─> Merge infrastructure → ALL feature branches
│     $ for branch in ...; do
│         git checkout b2b-docs-$branch
│         git merge releases/b2b-infrastructure
│       done
│
├─ Drop-in merged to docs-only?
│  └─> Merge docs-only → preview
│     $ git checkout b2b-documentation
│     $ git merge releases/b2b-docs-only
│
└─ Feature branch updated?
   └─> Merge feature → preview (for review)
      $ git checkout b2b-documentation
      $ git merge b2b-docs-requisition-list-v3
```

## Common Scenarios

### Scenario 1: "I want to fix a generator bug"

1. **Branch**: `releases/b2b-infrastructure`
2. **Edit**: `scripts/@generate-container-docs.js`
3. **Validate**: `./scripts/validate-branch-content.sh`
4. **Test**: `npm run generate-b2b-docs requisition-list -- --dry-run`
5. **Commit**: Direct to infrastructure or PR
6. **Sync**: Merge to all feature branches

### Scenario 2: "I'm documenting a new container"

1. **Branch**: `b2b-docs-[mydropin]-v3`
2. **Edit**: `src/content/docs/dropins-b2b/[mydropin]/containers/my-container.mdx`
3. **Update**: `_dropin-enrichments/[mydropin]/containers.json`
4. **Generate**: `npm run generate-b2b-docs [mydropin]`
5. **Validate**: `npm run validate-b2b-enrichments`
6. **Commit**: To feature branch
7. **Preview**: Merge to `b2b-documentation`

### Scenario 3: "My PR was approved!"

1. **Review**: Ensure only drop-in-specific files
2. **Branch**: `releases/b2b-docs-only`
3. **Merge**: Squash merge from feature branch
4. **Keep**: Only `src/content/docs/dropins-b2b/[dropin]/` and `_dropin-enrichments/[dropin]/`
5. **Update**: Merge `docs-only` → `b2b-documentation`

### Scenario 6: "We're ready to publish B2B to production!"

**CRITICAL**: This preserves ALL 3,230+ commits from 50+ contributors.

**🚨 BEFORE YOU START**: Read `PUBLISH-B2B-README.md`

**📋 USE THE CHECKLIST**: Open `PUBLISH-TO-PRODUCTION-CHECKLIST.md`

1. **Consolidate**: Merge infrastructure + docs-only → `releases/b2b-nov-release`
2. **Verify**: Run `./scripts/verify-publication-readiness.sh`
3. **Check**: Run `./scripts/pre-merge-to-develop-check.sh releases/b2b-nov-release`
4. **Publish**: Merge `b2b-nov-release` → `develop` (use PR template)
5. **Tag**: Create release tag
6. **Notify**: Stakeholders that B2B docs are live

**See**: "Workflow 4: Publish to Production" in B2B-WORKFLOW-GUIDE.md

**Reminders**:
- `PUBLISH-B2B-README.md` - STOP sign before merging
- `PUBLISH-TO-PRODUCTION-CHECKLIST.md` - Step-by-step guide
- `scripts/pre-merge-to-develop-check.sh` - Automated safety check
- `.github/PULL_REQUEST_TEMPLATE_PUBLICATION.md` - PR template

### Scenario 4: "I need to fix an enrichment in merged drop-in"

1. **Branch**: Feature branch (if exists) or create from docs-only
2. **Edit**: `_dropin-enrichments/[dropin]/containers.json`
3. **Validate**: `npm run validate-b2b-enrichments`
4. **Commit**: To feature branch
5. **Cherry-pick**: To `releases/b2b-docs-only`
6. **Update**: Merge to `b2b-documentation`

### Scenario 5: "I got a validation error!"

**Error**: "FORBIDDEN: src/content/docs/dropins-b2b/purchase-order/"

**Cause**: Feature branch contains files from other drop-ins

**Fix**:
```bash
git rm -r src/content/docs/dropins-b2b/purchase-order/
git commit -m "chore: Remove other drop-in's files"
```

**Error**: "N polluted parameter(s) found"

**Cause**: Enrichment has parameters from other drop-ins

**Fix**:
```bash
npm run validate-b2b-enrichments -- --fix
git add _dropin-enrichments/
git commit -m "fix: Clean polluted enrichments"
```

## Quick Reference Cards

### Branch Types

| Branch | Base | Contains | Purpose |
|--------|------|----------|---------|
| `releases/b2b-infrastructure` | - | Scripts, templates, package.json | Tool source |
| `releases/b2b-docs-only` | - | Merged drop-ins | Feature base |
| `b2b-docs-[dropin]-vN` | docs-only | One drop-in + infra | Development |
| `b2b-documentation` | - | Everything | Preview/review |

### File Ownership

| File Pattern | Owner | Sync Direction |
|--------------|-------|----------------|
| `scripts/` | Infrastructure | infra → features |
| `_dropin-templates/` | Infrastructure | infra → features |
| `_dropin-enrichments/[dropin]/` | Feature branch | feature → docs-only |
| `src/content/docs/dropins-b2b/[dropin]/` | Feature branch | feature → docs-only |
| `astro.config.mjs` | Preview only | - |

### Validation Commands

| Command | Purpose | When |
|---------|---------|------|
| `npm run validate-b2b-enrichments` | Check pollution | Before commit (enrichments) |
| `./scripts/validate-branch-content.sh` | Check files | Before commit (any) |
| `./scripts/validate-branch-content.sh --pre-commit` | Pre-commit | Git hook |
| `./scripts/compare-enrichments.sh [dropin]` | Deep analysis | Troubleshooting |
| `./scripts/audit-branch-state.sh` | Branch state | Migration planning |

## Publication Safeguards 🛡️

**Problem**: It's easy to forget the consolidation step when publishing (happens periodically, not daily)

**Solution**: Multiple reminder systems

### 1. Visual Warning File
**`PUBLISH-B2B-README.md`** - At repository root
- Shows up in GitHub file browser
- Big red stop sign
- Quick reference guide

### 2. Complete Checklist
**`PUBLISH-TO-PRODUCTION-CHECKLIST.md`** - Copy-paste ready
- Every step with commands
- Pre/post publication tasks
- Rollback procedure
- ~30 minute process

### 3. Automated Check Script
**`scripts/pre-merge-to-develop-check.sh`** - Blocks wrong merges
```bash
# Run before merging to develop:
./scripts/pre-merge-to-develop-check.sh <branch-name>

# ✅ Passes if branch is releases/b2b-nov-release
# ❌ Blocks if branch is anything else B2B-related
```

### 4. GitHub PR Template
**`.github/PULL_REQUEST_TEMPLATE_PUBLICATION.md`**
- Forces checklist completion
- Pre-publication verification required
- Links to all documentation

### How to Remember

**When publishing time comes:**

1. You'll see `PUBLISH-B2B-README.md` in file list
2. Open it, it says "STOP AND READ"
3. It points to `PUBLISH-TO-PRODUCTION-CHECKLIST.md`
4. Follow checklist step-by-step
5. Script blocks you if you try to skip

**Can't forget** - multiple safety nets! 🎯

---

## Glossary

**Infrastructure**: Shared tools used by ALL drop-ins (generators, templates)

**Content**: Drop-in-specific files (docs, enrichments, images)

**Pollution**: Files/parameters from other drop-ins leaking into a branch

**Enrichment**: JSON files with metadata for documentation generation

**Feature Branch**: Branch for one drop-in's documentation (e.g., `b2b-docs-requisition-list-v3`)

**Docs-Only Branch**: Contains ONLY merged, approved drop-in documentation

**Preview Branch**: Consolidated view for reviewers (all drop-ins)

**Base Branch**: Branch that feature branches are created from (`releases/b2b-docs-only`)

**Consolidation**: Merging working branches into publication branch before production

## Migration Status

- [x] Architecture designed
- [x] Validation scripts created
- [x] CI/CD workflow created
- [x] Documentation complete
- [ ] Audit run
- [ ] Migration executed
- [ ] Branch protection enabled
- [ ] Team trained

## Getting Help

**Architecture questions**: Read DUAL-BRANCH-ARCHITECTURE.md

**Daily workflow questions**: Read B2B-WORKFLOW-GUIDE.md

**Validation errors**: Run the validator to see detailed error messages

**Migration questions**: Run `./scripts/migrate-to-dual-branch.sh audit`

**Emergency**: See "Emergency Procedures" in B2B-WORKFLOW-GUIDE.md

## Contributing

When updating this architecture:

1. Update documentation first
2. Update validation scripts to match
3. Update CI/CD workflows
4. Test on a branch before rolling out
5. Update this index

---

**Version**: 1.0  
**Last Updated**: 2024-12-18  
**Status**: Ready for implementation

