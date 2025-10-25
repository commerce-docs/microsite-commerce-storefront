# Generator Refactoring Analysis

## Executive Summary

**Current State:**
- Function Generator: 478 lines
- Event Generator: 770 lines
- **Total: 1,247 lines**

**Estimated Refactoring Potential:**
- **~150-200 lines of duplicated code** can be extracted to shared libraries
- **Target: Reduce each generator to ~300-400 lines**

## ✅ Already Extracted (Great Job!)

### 1. Configuration Management
- ✅ `dropin-config.js` - Centralized DROPIN_REPOS
- ✅ Eliminates 85 lines per generator

### 2. Enrichment System
- ✅ `enrichment.js` - Loading enrichment data
- ✅ `loadFunctionEnrichments()` and `loadEventEnrichments()`
- ✅ Eliminates ~20 lines per generator

### 3. Repository Operations
- ✅ `repository.js` - Git cloning and version management
- ✅ `cloneOrUpdateBoilerplate()`, `getBoilerplatePackageVersions()`, `cloneDropinAtVersion()`
- ✅ Eliminates ~60 lines per generator

### 4. Sidebar Management
- ✅ `sidebar.js` - Automatic navigation updates
- ✅ `updateSidebarForFunctions()`, `updateSidebarForEvents()`
- ✅ Eliminates ~35 lines per generator

### 5. Utility Functions
- ✅ `utils.js` - File system operations, string utilities
- ✅ `ensureParentDirectoryExists()`, `cleanVersion()`, etc.
- ✅ Eliminates ~15 lines per generator

### 6. Markdown Helpers
- ✅ `markdown.js` - Template processing utilities
- ✅ Ready for use but not yet fully utilized

## 🔴 Remaining Duplication (High Priority)

### 1. Main Execution Flow (~95 lines duplicated)

**Location:**
- `@generate-function-docs.js`: Lines 381-478
- `@generate-event-docs.js`: Lines 688-770

**Duplication:**
```javascript
// IDENTICAL in both generators
async function main() {
    console.log('🚀 [Type] Documentation Generator');
    console.log('=====================================\n');

    // Parse command-line arguments
    const targetDropin = process.argv[2];

    // Filter drop-ins based on target
    let dropinsToProcess = DROPIN_REPOS;

    if (targetDropin) {
        if (!DROPIN_REPOS[targetDropin]) {
            console.error(`❌ Error: Drop-in "${targetDropin}" not found.\n`);
            console.log('Available drop-ins:');
            Object.keys(DROPIN_REPOS).forEach(name => {
                console.log(`  - ${name}`);
            });
            process.exit(1);
        }
        dropinsToProcess = { [targetDropin]: DROPIN_REPOS[targetDropin] };
        console.log(`🎯 Processing single drop-in: ${targetDropin}\n`);
    } else {
        console.log(`📦 Processing all ${Object.keys(DROPIN_REPOS).length} drop-ins\n`);
    }

    // Clone/update boilerplate once for all drop-ins
    const boilerplatePath = cloneOrUpdateBoilerplate();

    // Get package versions from boilerplate
    const packageVersions = getBoilerplatePackageVersions(boilerplatePath);
    console.log(`\n📦 Loaded package versions from boilerplate\n`);

    // Process each drop-in [DIFFERENT CONTENT HERE]
    
    console.log('\n✨ [Type] documentation generation complete!\n');
}
```

**Recommendation:** Extract to `lib/generator-core.js`

### 2. Command-Line Argument Parsing (~30 lines)

**Duplication:**
```javascript
// Parse command-line arguments
const targetDropin = process.argv[2];

// Filter drop-ins based on target
let dropinsToProcess = DROPIN_REPOS;

if (targetDropin) {
    if (!DROPIN_REPOS[targetDropin]) {
        console.error(`❌ Error: Drop-in "${targetDropin}" not found.\n`);
        console.log('Available drop-ins:');
        Object.keys(DROPIN_REPOS).forEach(name => {
            console.log(`  - ${name}`);
        });
        process.exit(1);
    }
    dropinsToProcess = { [targetDropin]: DROPIN_REPOS[targetDropin] };
    console.log(`🎯 Processing single drop-in: ${targetDropin}\n`);
} else {
    console.log(`📦 Processing all ${Object.keys(DROPIN_REPOS).length} drop-ins\n`);
}
```

**Recommendation:** Extract to `lib/cli.js`

### 3. Output Path Generation (~10 lines)

**Duplication:**
```javascript
// Write to output file
const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
const outputPath = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, 'functions.mdx');

ensureParentDirectoryExists(outputPath);
writeFileSync(outputPath, mdxContent, 'utf8');
console.log(`  ✅ Generated ${outputPath}`);
```

**Recommendation:** Extract to `lib/file-output.js` or add to `utils.js`

### 4. Console Logging Patterns (~20 lines)

**Duplication:**
```javascript
console.log('🚀 Functions Documentation Generator');
console.log('=====================================\n');

console.log(`\n📦 Processing ${repoConfig.displayName}...`);
console.log(`  ⚠️  Skipping: ${repoConfig.packageName} not found in boilerplate`);
console.log(`  📚 Loaded enrichment data for ${Object.keys(enrichmentData).length} functions`);
console.log(`  🔍 Scanning for functions...`);
console.log(`  ✓ Found ${functions.length} functions`);
console.log(`  ✅ Generated ${outputPath}`);
console.log(`  📄 View at: ${urlPath}`);
```

**Recommendation:** Extract to `lib/logger.js` with standardized logging utilities

### 5. Template Reading and Placeholder Replacement

**Current Pattern:**
```javascript
// Function generator
const templatePath = join(projectRoot, '_dropin-templates', 'dropin-functions.mdx');
let template = readFileSync(templatePath, 'utf8');
template = template
    .replace(/DROPIN_NAME/g, repoConfig.displayName)
    .replace(/DROPIN_VERSION/g, version)
    .replace(/FUNCTIONS_CONTENT/g, functionsContent)
    .replace(/REPO_URL/g, repoConfig.gitUrl.replace('.git', ''));
```

**Already Exists:** `markdown.js` has `readTemplate()` and `replacePlaceholders()` - just not used yet!

**Recommendation:** Refactor generators to use existing utilities

## 🟡 Potential Extractions (Medium Priority)

### 1. String Transformation Utilities

**Pattern in Function Generator:**
```javascript
function generateDescriptionFromName(functionName) {
    if (functionName.startsWith('publish')) {
        return 'Publishes analytics or tracking events...';
    }
    if (functionName.startsWith('get')) {
        const subject = functionName.replace(/^get/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Returns ${readableSubject} from the current state or cache.`;
    }
    // ... more patterns
}
```

**Pattern in Event Generator:**
```javascript
function eventNameToAnchor(eventName, direction) {
    return `${eventName.replace(/[/:]/g, '-')}-${direction}`;
}

function extractSourceComponent(eventName) {
    return eventName.split('/')[0] || 'Unknown';
}

function eventNameToListenerVar(eventName) {
    return eventName.split('/').map((part, i) => 
        i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    ).join('') + 'Listener';
}
```

**Recommendation:** Move to `lib/naming.js` for name transformation utilities

### 2. TypeScript Parsing Utilities

**Event Generator has:**
```javascript
function parseTypeScriptProperties(typeDefinition) {
    const properties = [];
    // Complex regex parsing logic...
    return properties;
}
```

**Recommendation:** Extract to `lib/typescript-parser.js` if needed by other generators

## 📊 Proposed New Library Modules

### `lib/generator-core.js` - Main Execution Framework

```javascript
/**
 * Core generator execution framework
 * Provides standardized workflow for all documentation generators
 */

import { DROPIN_REPOS } from './dropin-config.js';
import { cloneOrUpdateBoilerplate, getBoilerplatePackageVersions } from './repository.js';

/**
 * Run a generator with standardized workflow
 * 
 * @param {Object} options - Generator configuration
 * @param {string} options.name - Generator name (e.g., 'Functions', 'Events')
 * @param {Function} options.loadEnrichments - Function to load enrichments
 * @param {Function} options.scanRepo - Function to scan repository
 * @param {Function} options.generateContent - Function to generate MDX content
 * @param {Function} options.updateSidebar - Function to update sidebar
 * @param {string} options.outputFileName - Output file name (e.g., 'functions.mdx')
 */
export async function runGenerator(options) {
    const {
        name,
        loadEnrichments,
        scanRepo,
        generateContent,
        updateSidebar,
        outputFileName
    } = options;

    // Parse CLI args
    const targetDropin = process.argv[2];
    
    // Print header
    console.log(`🚀 ${name} Documentation Generator`);
    console.log('=====================================\n');

    // Filter drop-ins
    const dropinsToProcess = filterDropins(targetDropin);

    // Setup boilerplate
    const boilerplatePath = cloneOrUpdateBoilerplate();
    const packageVersions = getBoilerplatePackageVersions(boilerplatePath);
    console.log(`\n📦 Loaded package versions from boilerplate\n`);

    // Process each drop-in
    for (const [repoName, repoConfig] of Object.entries(dropinsToProcess)) {
        try {
            await processDropin({
                repoName,
                repoConfig,
                packageVersions,
                loadEnrichments,
                scanRepo,
                generateContent,
                updateSidebar,
                outputFileName,
                targetDropin
            });
        } catch (error) {
            console.error(`  ❌ Error processing ${repoName}: ${error.message}\n`);
        }
    }

    console.log(`\n✨ ${name} documentation generation complete!\n`);
}

function filterDropins(targetDropin) {
    if (targetDropin) {
        if (!DROPIN_REPOS[targetDropin]) {
            console.error(`❌ Error: Drop-in "${targetDropin}" not found.\n`);
            console.log('Available drop-ins:');
            Object.keys(DROPIN_REPOS).forEach(name => {
                console.log(`  - ${name}`);
            });
            process.exit(1);
        }
        console.log(`🎯 Processing single drop-in: ${targetDropin}\n`);
        return { [targetDropin]: DROPIN_REPOS[targetDropin] };
    } else {
        console.log(`📦 Processing all ${Object.keys(DROPIN_REPOS).length} drop-ins\n`);
        return DROPIN_REPOS;
    }
}

async function processDropin(options) {
    const {
        repoName,
        repoConfig,
        packageVersions,
        loadEnrichments,
        scanRepo,
        generateContent,
        updateSidebar,
        outputFileName,
        targetDropin
    } = options;

    console.log(`\n📦 Processing ${repoConfig.displayName}...`);

    // Get version
    const version = packageVersions[repoConfig.packageName];
    if (!version) {
        console.log(`  ⚠️  Skipping: ${repoConfig.packageName} not found in boilerplate`);
        console.log(`     This drop-in may not be included in the current boilerplate version.\n`);
        return;
    }

    // Clone repository
    const repoPath = cloneDropinAtVersion(repoName, repoConfig, version);

    // Load enrichments
    const enrichmentData = loadEnrichments(repoName);
    if (enrichmentData) {
        console.log(`  📚 Loaded enrichment data for ${Object.keys(enrichmentData).length} items`);
    }

    // Scan and generate
    const scannedData = scanRepo(repoPath);
    const mdxContent = generateContent(repoName, repoConfig, scannedData, version, enrichmentData);

    // Write output
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const outputPath = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, outputFileName);
    
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, mdxContent, 'utf8');
    console.log(`  ✅ Generated ${outputPath}`);

    // Show preview link
    if (targetDropin) {
        const fileNameWithoutExt = outputFileName.replace('.mdx', '');
        const urlPath = `/${basePath}/${repoName}/${fileNameWithoutExt}`;
        console.log(`  📄 View at: ${urlPath}`);
        console.log(`     (Start dev server with 'npm run dev' if not already running)`);
    }

    // Update sidebar
    updateSidebar(repoName, repoConfig);
    console.log('');
}
```

### `lib/logger.js` - Standardized Logging

```javascript
/**
 * Standardized logging utilities for generators
 */

export const logger = {
    header(name) {
        console.log(`🚀 ${name} Documentation Generator`);
        console.log('=====================================\n');
    },

    processingAll(count) {
        console.log(`📦 Processing all ${count} drop-ins\n`);
    },

    processingSingle(name) {
        console.log(`🎯 Processing single drop-in: ${name}\n`);
    },

    processingDropin(displayName) {
        console.log(`\n📦 Processing ${displayName}...`);
    },

    skipping(packageName, reason) {
        console.log(`  ⚠️  Skipping: ${packageName} not found in boilerplate`);
        if (reason) console.log(`     ${reason}\n`);
    },

    enrichmentLoaded(count, type) {
        console.log(`  📚 Loaded enrichment data for ${count} ${type}`);
    },

    scanning(type) {
        console.log(`  🔍 Scanning for ${type}...`);
    },

    found(count, type) {
        console.log(`  ✓ Found ${count} ${type}`);
    },

    generated(path) {
        console.log(`  ✅ Generated ${path}`);
    },

    viewAt(url) {
        console.log(`  📄 View at: ${url}`);
        console.log(`     (Start dev server with 'npm run dev' if not already running)`);
    },

    complete(type) {
        console.log(`\n✨ ${type} documentation generation complete!\n`);
    },

    error(name, message) {
        console.error(`  ❌ Error processing ${name}: ${message}\n`);
    },

    errorNotFound(name) {
        console.error(`❌ Error: Drop-in "${name}" not found.\n`);
        console.log('Available drop-ins:');
        Object.keys(DROPIN_REPOS).forEach(name => {
            console.log(`  - ${name}`);
        });
    }
};
```

## 📋 Refactoring Roadmap

### Phase 1: Create Core Framework (High Impact)
1. Create `lib/generator-core.js` with `runGenerator()` function
2. Create `lib/logger.js` with standardized logging
3. Update `markdown.js` to export more utilities

### Phase 2: Refactor Existing Generators
1. Refactor `@generate-function-docs.js` to use `runGenerator()`
2. Refactor `@generate-event-docs.js` to use `runGenerator()`
3. Test both generators thoroughly

### Phase 3: Enhance Utilities (Medium Impact)
1. Add `lib/naming.js` for string transformations
2. Enhance `utils.js` with output path generation
3. Add `lib/cli.js` for advanced CLI handling (if needed)

## 🎯 Expected Results

### Before Refactoring:
```
@generate-function-docs.js: 478 lines
@generate-event-docs.js: 770 lines
Total: 1,247 lines
```

### After Refactoring:
```
@generate-function-docs.js: ~300 lines (37% reduction)
@generate-event-docs.js: ~500 lines (35% reduction)
lib/generator-core.js: ~150 lines (new)
lib/logger.js: ~50 lines (new)
Total: 1,000 lines (20% reduction overall)
```

### Benefits:
- ✅ **20% less code** to maintain
- ✅ **Consistency** across all generators
- ✅ **Faster development** of new generators
- ✅ **Easier testing** with isolated utilities
- ✅ **Better error handling** with standardized patterns
- ✅ **Improved logging** with consistent formatting

## 🚀 Next Steps

1. Review this analysis
2. Decide which phase to implement first
3. Create `lib/generator-core.js` and `lib/logger.js`
4. Refactor one generator as proof of concept
5. Apply learnings to remaining generators
6. Document the new pattern for future generators

## 📝 Notes

- The existing `markdown.js` utilities are ready but not yet used - leverage these first
- Focus on high-impact extractions (main execution flow) before micro-optimizations
- Each generator will still have its unique scanning and generation logic
- The framework should be flexible enough to accommodate different generator needs

