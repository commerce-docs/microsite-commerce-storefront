# Additional Documentation Gaps: Universal Editor and AEM Cloud Service

## Summary

While we've added Universal Editor localization documentation, there are several additional gaps in the storefront documentation related to Universal Editor, AEM Cloud Service integration, and related workflows.

## Identified Gaps

### 1. **Visual Editor Localization Workflows**

**Gap:** The Visual Editor documentation (`visual-editor.mdx`) mentions that Visual Editor is "a subset of features from the AEM Universal Editor" but doesn't cover localization workflows for Visual Editor users.

**Impact:** Medium - Users of Visual Editor (which is Universal Editor-based) may not know how to localize content.

**Recommendation:** Add a section to Visual Editor documentation explaining localization options, or create a separate guide for Visual Editor localization workflows.

**Location:** `src/content/docs/merchants/storefront-builder/visual-editor.mdx`

---

### 2. **Universal Editor Content Authoring Workflows**

**Gap:** Beyond localization, there's no documentation for other Universal Editor workflows:
- Creating and editing content in Universal Editor
- Managing content blocks and components
- Publishing workflows from Universal Editor to Edge Delivery Services
- Content versioning and rollback in Universal Editor

**Impact:** High - Customers using Universal Editor need guidance on day-to-day content authoring tasks.

**Recommendation:** Create comprehensive Universal Editor authoring documentation or expand existing Visual Editor docs to cover full Universal Editor capabilities.

**Location:** New page or expansion of `src/content/docs/merchants/storefront-builder/visual-editor.mdx`

---

### 3. **AEM Cloud Service Integration with Edge Delivery Services**

**Gap:** No documentation explaining:
- How AEM Cloud Service content syncs to Edge Delivery Services
- Configuration requirements for AEM Cloud Service integration
- Content publishing workflows from AEM Cloud Service
- How folder structures map between AEM Cloud Service and Edge Delivery Services
- Troubleshooting sync issues

**Impact:** High - Critical for ACCS customers to understand the integration architecture.

**Recommendation:** Create integration documentation covering AEM Cloud Service → Edge Delivery Services workflows.

**Location:** New page: `src/content/docs/setup/configuration/aem-cloud-service-integration.mdx` or similar

---

### 4. **Tool Selection Guidance**

**Gap:** No clear guidance helping users choose between:
- Document Authoring Tool (da.live) vs Universal Editor
- Visual Editor vs Universal Editor
- When to use each tool for different use cases
- Migration paths between tools

**Impact:** Medium - Users may choose the wrong tool or be confused about options.

**Recommendation:** Create a "Choosing Your Authoring Tool" guide or add a comparison section to the Storefront Builder overview.

**Location:** New page: `src/content/docs/merchants/storefront-builder/choosing-authoring-tool.mdx` or add to `create-content.mdx`

---

### 5. **Universal Editor Setup and Configuration**

**Gap:** No documentation for:
- Setting up Universal Editor for Commerce Storefront
- Configuring Universal Editor with Edge Delivery Services
- Prerequisites and requirements
- Initial setup steps

**Impact:** Medium - New users need setup guidance.

**Recommendation:** Create setup documentation for Universal Editor integration.

**Location:** New page: `src/content/docs/setup/configuration/universal-editor-setup.mdx` or similar

---

### 6. **Storebuilder Definition and Workflows**

**Gap:** "Storebuilder" is mentioned in context but not clearly defined or documented:
- What is Storebuilder vs Commerce Storefront?
- How does Storebuilder relate to Universal Editor?
- What workflows are specific to Storebuilder?

**Impact:** Low-Medium - Creates confusion about terminology and scope.

**Recommendation:** Clarify Storebuilder definition and scope in documentation, or remove references if it's not a distinct product.

**Location:** Review and update `src/content/docs/merchants/storefront-builder/` documentation

---

### 7. **Multistore Content Organization for Universal Editor**

**Gap:** The multistore setup documentation mentions content can come from multiple sources but doesn't explain:
- How Universal Editor-managed content maps to folder structure (`/en/`, `/fr_ca/`, etc.)
- Content synchronization workflows for Universal Editor
- How to organize content in AEM Cloud Service for multistore setups

**Impact:** Medium - ACCS customers need guidance on organizing multistore content in Universal Editor.

**Recommendation:** Expand multistore setup documentation with Universal Editor-specific content organization guidance.

**Location:** Update `src/content/docs/setup/configuration/multistore-setup.mdx`

---

### 8. **Universal Editor Asset Management**

**Gap:** Documentation mentions AEM Assets integration but doesn't cover:
- How to manage assets in Universal Editor
- Asset workflows for localized content
- Asset organization for multistore setups
- Asset publishing from AEM Cloud Service

**Impact:** Medium - Asset management is critical for content workflows.

**Recommendation:** Add Universal Editor asset management documentation or expand existing DAM documentation.

**Location:** New section in Universal Editor docs or expand `create-content.mdx` DAM section

---

### 9. **Universal Editor Troubleshooting and Best Practices**

**Gap:** No troubleshooting guide for:
- Common Universal Editor issues
- Content sync problems
- Publishing failures
- Best practices for Universal Editor workflows

**Impact:** Medium - Users need troubleshooting guidance.

**Recommendation:** Create troubleshooting documentation or add Universal Editor section to existing troubleshooting guides.

**Location:** New page or add to existing troubleshooting documentation

---

### 10. **Workflow Verification and Accuracy**

**Gap:** The Universal Editor localization guide includes a caution that workflows may vary and need verification. This suggests:
- Actual workflows may differ from documented workflows
- Need for customer validation (Mazda, Ernst and Young)
- Potential inaccuracies in current documentation

**Impact:** High - Documentation may not match actual implementation.

**Recommendation:** 
- Verify workflows with Mazda team and Ernst and Young SI partner
- Update documentation based on actual implementation
- Remove caution notes once workflows are verified

**Location:** All Universal Editor documentation

---

## Priority Recommendations

### High Priority
1. **AEM Cloud Service Integration Documentation** - Critical for ACCS customers
2. **Universal Editor Content Authoring Workflows** - Core functionality missing
3. **Workflow Verification** - Ensure accuracy of existing documentation

### Medium Priority
4. **Visual Editor Localization** - Related to Universal Editor localization
5. **Tool Selection Guidance** - Helps users choose appropriate tools
6. **Multistore Content Organization for Universal Editor** - Important for ACCS customers

### Low Priority
7. **Universal Editor Setup** - Can be addressed after core workflows are documented
8. **Storebuilder Clarification** - Terminology cleanup
9. **Asset Management** - Nice to have, less critical
10. **Troubleshooting** - Can be added incrementally

## Next Steps

1. **Immediate:** Verify Universal Editor localization workflows with Mazda team
2. **Short-term:** Create AEM Cloud Service integration documentation
3. **Short-term:** Add Universal Editor content authoring workflows
4. **Medium-term:** Add tool selection guidance
5. **Long-term:** Expand troubleshooting and best practices

