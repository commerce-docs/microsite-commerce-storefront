# Generator Migration Action Plan

## 🎯 Executive Summary

**Goal**: Migrate 7 remaining generators from `auto-doc-generators` branch to use the new shared library framework.

**Timeline**: 2-3 weeks (3-4 hours per generator)

**Benefit**: Consistent, maintainable, scalable documentation generation system

## 📊 Current Status

### ✅ Complete (2 generators)
1. ✅ Functions Generator - 387 lines, using framework
2. ✅ Events Generator - 694 lines, using framework

### 🔄 Framework Infrastructure
- ✅ `generator-core.js` (229 lines) - Main execution framework
- ✅ `logger.js` (154 lines) - Standardized logging
- ✅ `dropin-config.js` (84 lines) - Repository configuration
- ✅ `enrichment.js` (116 lines) - Enrichment data loading
- ✅ `repository.js` (120 lines) - Git operations
- ✅ `sidebar.js` (124 lines) - Navigation management
- ✅ `markdown.js` (155 lines) - MDX utilities
- ✅ `utils.js` (206 lines) - General utilities

**Total Shared Infrastructure**: 1,188 lines ready for use!

### 📋 Remaining Work (7 generators)

| Generator | Priority | Est. Lines | Complexity | Time Est. |
|-----------|----------|------------|------------|-----------|
| Containers | High | 759 → ~600 | High | 3-4 hrs |
| Slots | High | ? → ~200 | Medium | 3 hrs |
| Dictionary | High | ? → ~150 | Low | 2 hrs |
| Installation | Medium | ? → ~150 | Low | 2 hrs |
| Initialization | Medium | ? → ~180 | Medium | 2-3 hrs |
| Merchant Blocks | Low | ? → ~200 | Medium | 3 hrs |
| Boilerplate | Low | ? → ~150 | Low | 2 hrs |

## 🚀 Migration Roadmap

### Week 1: High-Impact Generators

#### Monday: Containers (Most Complex, High Value)
```bash
git checkout develop && git pull
git checkout -b feature/generator-containers

# Copy and refactor
git show origin/auto-doc-generators:scripts/@generate-container-docs.js > scripts/@generate-container-docs.js
git show origin/auto-doc-generators:_dropin-templates/dropin-container.mdx > _dropin-templates/dropin-container.mdx

# Follow migration template
# Test thoroughly
# Create PR
```

**Deliverables**:
- ✅ Container generator using framework
- ✅ Container template updated
- ✅ Sidebar integration
- ✅ Enrichment support
- ✅ Documentation updated

#### Wednesday: Slots
```bash
git checkout develop && git pull
git checkout -b feature/generator-slots
# ... follow same pattern
```

#### Friday: Dictionary
```bash
git checkout develop && git pull
git checkout -b feature/generator-dictionary
# ... follow same pattern
```

### Week 2: Setup Generators

#### Monday: Installation
```bash
git checkout develop && git pull
git checkout -b feature/generator-installation
# ... follow same pattern
```

#### Wednesday: Initialization
```bash
git checkout develop && git pull
git checkout -b feature/generator-initialization
# ... follow same pattern
```

### Week 3: Specialized Generators

#### Monday: Merchant Blocks
```bash
git checkout develop && git pull
git checkout -b feature/generator-merchant-blocks
# ... follow same pattern
```

#### Wednesday: Boilerplate
```bash
git checkout develop && git pull
git checkout -b feature/generator-boilerplate
# ... follow same pattern
```

## 📚 Resource Documents

### Already Created
1. ✅ **MIGRATION-PLAN.md** - Comprehensive migration strategy
2. ✅ **MIGRATION-TEMPLATE.md** - Step-by-step template
3. ✅ **MIGRATION-EXAMPLE-CONTAINERS.md** - Concrete before/after example
4. ✅ **REFACTORING-COMPLETE.md** - Framework completion summary
5. ✅ **REFACTORING-ANALYSIS.md** - Detailed analysis
6. ✅ **LEAN-ANALYSIS.md** - Code leanness assessment
7. ✅ **scripts/README.md** - Complete usage documentation

### Quick Start Guide

**For each generator, follow this pattern:**

1. **Read the docs** (15 min)
   - MIGRATION-TEMPLATE.md - Your step-by-step guide
   - MIGRATION-EXAMPLE-CONTAINERS.md - Concrete example
   - MIGRATION-PLAN.md - Overall strategy

2. **Setup branch** (5 min)
   ```bash
   git checkout develop && git pull
   git checkout -b feature/generator-[name]
   ```

3. **Copy files** (5 min)
   ```bash
   git show origin/auto-doc-generators:scripts/@generate-[name]-docs.js > scripts/@generate-[name]-docs.js
   git show origin/auto-doc-generators:_dropin-templates/dropin-[name].mdx > _dropin-templates/dropin-[name].mdx
   ```

4. **Refactor generator** (1-2 hrs)
   - Add shared utility imports
   - Remove duplicated infrastructure
   - Keep all unique scanning/generation logic
   - Replace main() with runGenerator()
   - Use readTemplate() and replacePlaceholders()

5. **Update template** (30 min)
   - Consistent placeholders
   - Add component imports
   - Clean content markers

6. **Add support functions** (15 min)
   - Add to lib/sidebar.js
   - Add to lib/enrichment.js
   - Update package.json

7. **Test** (30 min)
   ```bash
   npm run generate-[name]-docs cart
   npm run generate-[name]-docs
   ```

8. **Document** (30 min)
   - Update scripts/README.md
   - Update _dropin-enrichments/README.md

9. **PR** (15 min)
   ```bash
   git add -A
   git commit -m "feat: add [name] generator using shared framework"
   git push origin feature/generator-[name]
   # Create PR on GitHub
   ```

## 🎯 Success Criteria

**Per Generator:**
- ✅ Reduces code by ~20-60%
- ✅ Uses runGenerator() framework
- ✅ Uses all shared utilities
- ✅ No duplicated infrastructure
- ✅ Enrichment support enabled
- ✅ Template updated
- ✅ Tests passing
- ✅ Documentation complete

**Overall Project:**
- ✅ 9 generators using framework
- ✅ 100% consistency across all generators
- ✅ Zero code duplication
- ✅ Easy to maintain
- ✅ Easy to extend
- ✅ Professional codebase

## 💡 Tips for Success

### 1. Start with the Template
Use MIGRATION-TEMPLATE.md as your checklist. Don't skip steps!

### 2. Reference the Examples
Look at @generate-function-docs.js and @generate-event-docs.js constantly.

### 3. Keep Unique Logic
Don't try to generalize everything. Keep scanner and generator logic specific.

### 4. Test Frequently
Test after each major change. Don't wait until the end.

### 5. Small Commits
Commit logical chunks as you go. Makes debugging easier.

### 6. Ask Questions
Review the framework code if something is unclear.

## 🔧 Required Updates to Shared Library

As you migrate generators, you'll need to add support functions:

### lib/sidebar.js
```javascript
// Add one function per generator
export function updateSidebarForContainers(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Containers', 'Events');
}

export function updateSidebarForSlots(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Slots', 'Functions');
}

// ... etc for each generator
```

### lib/enrichment.js
```javascript
// Add one function per generator
export function loadContainerEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'containers');
}

export function loadSlotEnrichments(dropinName) {
    return loadEnrichmentData(dropinName, 'slots');
}

// ... etc for each generator
```

### package.json
```json
{
  "scripts": {
    "generate-container-docs": "node scripts/@generate-container-docs.js",
    "generate-slot-docs": "node scripts/@generate-slot-docs.js",
    "generate-dictionary-docs": "node scripts/@generate-dictionary-docs.js",
    "generate-installation-docs": "node scripts/@generate-installation-docs.js",
    "generate-initialization-docs": "node scripts/@generate-initialization-docs.js",
    "generate-merchant-block-docs": "node scripts/@generate-merchant-block-docs.js",
    "generate-boilerplate-docs": "node scripts/@generate-boilerplate-docs.js"
  }
}
```

## 📊 Expected Results

### By Completion

**Code Metrics:**
- Total generator lines: ~3,000 (down from ~4,000)
- Shared library lines: 1,188
- Code duplication: 0%
- Infrastructure per generator: 0%

**Quality Metrics:**
- Consistency: 100%
- Maintainability: Excellent
- Testability: High
- Scalability: Unlimited

**Developer Experience:**
- New generator creation: ~160 lines (was ~400)
- Time to create: 2-3 hours (was 1-2 days)
- Understanding code: Easy (was complex)
- Debugging: Straightforward (was difficult)

## 🎉 Future Possibilities

Once all generators are migrated:

### Easy Enhancements
- Add --watch mode to all generators
- Add --dry-run mode to all generators
- Add --diff mode to see changes
- Add parallel processing for speed
- Add caching for repeated runs

### New Generators
Creating new generators becomes trivial:
- Copy template (~10 min)
- Write scanner (~1 hour)
- Write generator (~1 hour)
- Test and document (~1 hour)
- Total: ~3 hours for complete generator!

### Framework Improvements
Any improvement to the framework automatically benefits all generators:
- Better error messages
- Progress indicators
- Performance optimizations
- New shared utilities

## 🚦 Getting Started NOW

**Ready to begin?** Start with containers:

```bash
# 1. Checkout develop
git checkout develop
git pull

# 2. Create feature branch
git checkout -b feature/generator-containers

# 3. Read the migration template
cat scripts/lib/MIGRATION-TEMPLATE.md

# 4. Read the containers example
cat scripts/lib/MIGRATION-EXAMPLE-CONTAINERS.md

# 5. Copy the generator
git show origin/auto-doc-generators:scripts/@generate-container-docs.js > scripts/@generate-container-docs.js

# 6. Start refactoring!
# Follow MIGRATION-TEMPLATE.md step by step
```

---

## 📞 Need Help?

**Reference Materials:**
- MIGRATION-TEMPLATE.md - Step-by-step instructions
- MIGRATION-EXAMPLE-CONTAINERS.md - Concrete example
- MIGRATION-PLAN.md - Overall strategy
- scripts/README.md - Framework documentation
- @generate-function-docs.js - Working example
- @generate-event-docs.js - Working example

**The framework is designed to make your life easier!**

Every line of infrastructure code has already been written, tested, and documented. You just need to focus on the unique scanning and generation logic for each generator.

**Let's build something amazing!** 🚀

