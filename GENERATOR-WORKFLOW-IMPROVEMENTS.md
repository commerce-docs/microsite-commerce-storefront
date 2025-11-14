# Generator Workflow Improvements

## Current Problems

1. **Bugs affect multiple branches** - Generator bugs discovered in one branch affect all branches using that generator
2. **No centralized bug tracking** - Bugs discovered ad-hoc, no systematic tracking
3. **Manual fixes required** - Even after fixing bugs, existing generated content needs manual fixes
4. **No validation for sidebar updates** - Generators can create pages but fail to update sidebar
5. **Late discovery** - Build failures discovered only during build, not during generation
6. **Branch coordination issues** - Multiple branches with overlapping generator code

## Proposed Solutions

### 1. Generator Bug Registry

Create a centralized bug tracking file for generator issues:

**File**: `scripts/GENERATOR-BUGS.md`

```markdown
# Generator Bug Registry

## Active Bugs

### [BUG-001] Installation generator doesn't update sidebar
- **Status**: FIXED
- **Date Found**: 2025-11-09
- **Affected Generators**: `@generate-installation-docs.js`
- **Root Cause**: `updateSidebarForInstallation` passes `null` instead of `'Overview'`
- **Fix**: Updated `scripts/lib/sidebar.js` line 142
- **Branches Affected**: `merchant-documentation`, `merchant-documentation-gaps`, `develop`
- **Manual Fix Required**: Add missing sidebar entries to `astro.config.mjs` in affected branches
- **Prevention**: Add sidebar update validation to test suite

## Resolved Bugs

[Past bugs moved here after verification]

## Prevention Checklist

When fixing generator bugs:
- [ ] Fix the root cause in shared library
- [ ] Document the bug in this registry
- [ ] Add test case to prevent regression
- [ ] List all affected branches
- [ ] Create checklist for manual fixes needed
- [ ] Update all affected branches
```

### 2. Sidebar Update Validation

Add validation to ensure generators update sidebar correctly:

**File**: `scripts/lib/validate-sidebar-updates.js`

```javascript
/**
 * Validates that generated pages have corresponding sidebar entries
 * 
 * @param {string} generatedPagePath - Path to generated page (e.g., '/dropins/order/installation/')
 * @param {string} astroConfigPath - Path to astro.config.mjs
 * @returns {boolean} True if sidebar entry exists
 */
export function validateSidebarEntry(generatedPagePath, astroConfigPath) {
    // Read astro.config.mjs
    // Check if page path exists in sidebar configuration
    // Return true/false
}

/**
 * Validates all generated pages have sidebar entries
 * 
 * @param {Array} generatedPages - Array of page paths
 * @returns {Object} Validation results with missing entries
 */
export function validateAllSidebarEntries(generatedPages) {
    // Check each generated page
    // Return list of missing sidebar entries
}
```

### 3. Pre-Generation Validation

Add validation BEFORE generating to catch issues early:

**File**: `scripts/lib/pre-generation-validator.js`

```javascript
/**
 * Validates generator configuration before running
 */
export function validateGeneratorConfig(generatorName, config) {
    const errors = [];
    
    // Check if sidebar update function exists
    if (config.updateSidebar && typeof config.updateSidebar !== 'function') {
        errors.push(`Generator ${generatorName}: updateSidebar must be a function`);
    }
    
    // Check if sidebar update function is properly configured
    if (config.updateSidebar) {
        // Test that it doesn't pass null as reference label
        // (This would catch the installation generator bug)
    }
    
    return errors;
}
```

### 4. Post-Generation Validation

Add validation AFTER generating to catch missing sidebar entries:

**File**: `scripts/lib/post-generation-validator.js`

```javascript
/**
 * Validates generator output after generation
 */
export function validateGeneratorOutput(generatorName, outputFiles) {
    const errors = [];
    
    // Check each generated file has sidebar entry
    for (const file of outputFiles) {
        if (!hasSidebarEntry(file.path)) {
            errors.push(`Missing sidebar entry for ${file.path}`);
        }
    }
    
    return errors;
}
```

### 5. Generator Test Suite Enhancement

Enhance existing test suite to include sidebar validation:

**File**: `scripts/test-generators.js` (enhancement)

```javascript
// Add sidebar validation to test suite
import { validateSidebarEntry } from './lib/validate-sidebar-updates.js';

// After each generator test:
const sidebarValid = validateSidebarEntry(generatedPagePath, 'astro.config.mjs');
if (!sidebarValid) {
    console.log(`   ⚠️  Warning: Sidebar entry missing for generated page`);
    failedTests++;
}
```

### 6. Branch Coordination Strategy

**File**: `GENERATOR-BRANCH-STRATEGY.md`

```markdown
# Generator Branch Strategy

## Branch Types

1. **Feature Branches** (`feature/*`)
   - Single feature or bug fix
   - Should NOT include generator infrastructure changes
   - Merge to `develop` when complete

2. **Generator Infrastructure Branches** (`generator-*`)
   - Shared generator improvements
   - Bug fixes to shared libraries
   - Must be merged to ALL active branches using generators

3. **Documentation Branches** (`*-documentation`)
   - Generated documentation only
   - Should pull generator infrastructure from `develop`
   - Should NOT modify generator code

## Workflow

### When Fixing Generator Bugs:

1. **Create bug fix branch** from `develop`
   - Name: `fix/generator-[bug-name]`
   - Fix the bug in shared library
   - Add test case
   - Document in `GENERATOR-BUGS.md`

2. **Merge to all affected branches**
   - List all branches using the generator
   - Merge bug fix branch to each
   - Verify build succeeds

3. **Apply manual fixes**
   - For each affected branch, apply manual fixes (e.g., sidebar entries)
   - Document manual fixes in bug registry

### When Adding New Generator Features:

1. **Create feature branch** from `develop`
   - Name: `feature/generator-[feature-name]`
   - Implement feature
   - Add tests
   - Update documentation

2. **Merge to `develop`**
   - Review and merge feature branch
   - All other branches can pull from `develop`

3. **Update dependent branches**
   - Notify branches that might benefit
   - They can merge `develop` when ready
```

### 7. Automated Sidebar Update Check

Add a pre-commit hook or CI check:

**File**: `.github/workflows/validate-sidebar.yml`

```yaml
name: Validate Sidebar Updates

on:
  pull_request:
    paths:
      - 'src/content/docs/**/*.mdx'
      - 'scripts/@generate-*.js'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate sidebar entries
        run: |
          npm run validate:sidebar
```

### 8. Generator Health Check Script

**File**: `scripts/check-generator-health.js`

```javascript
/**
 * Comprehensive generator health check
 * 
 * Checks:
 * - All generators can run without errors
 * - Generated pages have sidebar entries
 * - No orphaned sidebar entries
 * - Shared libraries are up to date
 * - No known bugs in current branch
 */
```

## Implementation Priority

1. **High Priority** (Do First):
   - ✅ Fix installation generator bug (already done)
   - Add sidebar validation to test suite
   - Create generator bug registry
   - Document branch coordination strategy

2. **Medium Priority**:
   - Add pre-generation validation
   - Add post-generation validation
   - Create generator health check script

3. **Low Priority** (Nice to Have):
   - CI/CD validation
   - Automated branch coordination
   - Generator dependency tracking

## Quick Wins

1. **Add sidebar validation to existing test suite** (30 min)
2. **Create GENERATOR-BUGS.md** (15 min)
3. **Document branch strategy** (30 min)
4. **Add validation script** (1 hour)

Total: ~2 hours for immediate improvements

