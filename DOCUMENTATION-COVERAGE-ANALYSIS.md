# Documentation Coverage Analysis: Universal Editor Gaps vs Existing Docs

## Summary

After scanning da.live, aem.live, and Experience League documentation URLs referenced in the codebase, here's what's already covered and what gaps remain.

## Key URLs Found in Reference Documentation

From `reference-docs.json`:
- **AEM as Content Source**: `https://www.aem.live/docs/aem-content-source` - "Publishing from AEM Sites to Edge Delivery"
- **Authoring with AEM**: `https://www.aem.live/docs/aem-authoring` - "Using Universal Editor with Edge Delivery Services"
- **Translation and Localization**: `https://www.aem.live/docs/translation-and-localization`

From existing docs:
- **Universal Editor authoring**: `https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/sites/authoring/universal-editor/authoring`
- **AEM Cloud Service Translation**: `https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/sites/administering/reusing-content/translation/overview`
- **DA.live docs**: `https://da.live/docs`
- **DA.live tutorial**: `https://www.aem.live/developer/da-tutorial`

## Gap Analysis: What's Covered vs What's Missing

### ✅ PARTIALLY COVERED - Need Commerce Storefront Context

#### 1. **AEM Cloud Service Integration with Edge Delivery Services**
**Status:** Partially covered in external docs, but missing Commerce Storefront-specific guidance

**Existing Coverage:**
- ✅ `https://www.aem.live/docs/aem-content-source` - Covers "Publishing from AEM Sites to Edge Delivery"
- ✅ `https://www.aem.live/docs/aem-authoring` - Covers "Using Universal Editor with Edge Delivery Services"

**Gap:** 
- These docs cover general AEM → Edge Delivery integration
- Missing: Commerce Storefront-specific integration details
- Missing: How multistore folder structures map
- Missing: Commerce-specific configuration requirements
- Missing: Integration troubleshooting for Commerce use cases

**Recommendation:** Create Commerce Storefront-specific integration guide that references these docs but adds Commerce context.

---

#### 2. **Universal Editor Content Authoring Workflows**
**Status:** Partially covered in external docs, but missing Commerce Storefront workflows

**Existing Coverage:**
- ✅ `https://www.aem.live/docs/aem-authoring` - "Using Universal Editor with Edge Delivery Services"
- ✅ `https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/sites/authoring/universal-editor/authoring` - Universal Editor authoring guide

**Gap:**
- General Universal Editor workflows are documented
- Missing: Commerce-specific authoring workflows
- Missing: How to author Commerce blocks and drop-ins in Universal Editor
- Missing: Commerce content management patterns

**Recommendation:** Create Commerce Storefront-specific Universal Editor authoring guide or add Commerce sections to existing Visual Editor docs.

---

#### 3. **AEM Cloud Service Translation and Localization**
**Status:** Covered in external docs, but missing Commerce Storefront integration details

**Existing Coverage:**
- ✅ `https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/sites/administering/reusing-content/translation/overview` - AEM Cloud Service Translation guide
- ✅ `https://www.aem.live/docs/translation-and-localization` - Edge Delivery Services translation

**Gap:**
- General AEM translation workflows are documented
- Missing: How translation projects sync to Edge Delivery Services folder structure
- Missing: Commerce-specific translation workflows (placeholder files, multistore)
- Missing: Integration between AEM translation and Commerce multistore setup

**Recommendation:** ✅ **ALREADY ADDRESSED** - We created the Universal Editor localization guide that bridges this gap.

---

### ❌ NOT COVERED - Need New Documentation

#### 4. **Visual Editor Localization Workflows**
**Status:** Not covered

**Existing Coverage:**
- ❌ No specific Visual Editor localization documentation found

**Gap:** Visual Editor docs don't explain localization options

**Recommendation:** Add localization section to Visual Editor docs referencing Universal Editor localization guide.

---

#### 5. **Tool Selection Guidance**
**Status:** Not covered

**Existing Coverage:**
- ❌ No comparison or selection guide found

**Gap:** No guidance on when to use Document Authoring Tool vs Universal Editor vs Visual Editor

**Recommendation:** Create "Choosing Your Authoring Tool" guide.

---

#### 6. **Universal Editor Setup and Configuration**
**Status:** Partially covered, but missing Commerce-specific setup

**Existing Coverage:**
- ✅ General Universal Editor setup in Experience League docs
- ✅ `https://www.aem.live/docs/aem-authoring` may cover some setup

**Gap:**
- Missing: Commerce Storefront-specific setup steps
- Missing: Configuration requirements for Commerce integration
- Missing: Prerequisites for Commerce use cases

**Recommendation:** Create Commerce-specific Universal Editor setup guide.

---

#### 7. **Multistore Content Organization for Universal Editor**
**Status:** Not covered

**Existing Coverage:**
- ❌ No Universal Editor-specific multistore content organization guidance

**Gap:** Multistore setup docs only cover da.live workflows

**Recommendation:** Expand multistore setup docs with Universal Editor section.

---

#### 8. **Universal Editor Asset Management**
**Status:** Partially covered

**Existing Coverage:**
- ✅ `https://www.aem.live/docs/universal-editor-assets` - "Publishing pages with AEM Assets"
- ✅ `https://experienceleague.adobe.com/en/docs/experience-manager-assets/content/home.html` - AEM Assets overview

**Gap:**
- General AEM Assets workflows are documented
- Missing: Commerce-specific asset management workflows
- Missing: Asset organization for multistore setups

**Recommendation:** Expand existing DAM section in `create-content.mdx` with Universal Editor workflows.

---

#### 9. **Universal Editor Troubleshooting**
**Status:** Not covered

**Existing Coverage:**
- ❌ No Commerce-specific Universal Editor troubleshooting

**Gap:** No troubleshooting guide for Universal Editor + Commerce Storefront issues

**Recommendation:** Add Universal Editor section to troubleshooting docs.

---

#### 10. **Storebuilder Definition**
**Status:** Not clearly defined

**Existing Coverage:**
- ❌ "Storebuilder" terminology not clearly defined in docs

**Gap:** Creates confusion about what Storebuilder is vs Commerce Storefront

**Recommendation:** Clarify terminology in existing docs.

---

## Recommendations Summary

### High Priority - Create New Commerce-Specific Docs

1. **AEM Cloud Service Integration for Commerce Storefront**
   - Reference: `https://www.aem.live/docs/aem-content-source`
   - Add: Commerce-specific integration details, multistore mapping, Commerce configuration

2. **Universal Editor Content Authoring for Commerce**
   - Reference: `https://www.aem.live/docs/aem-authoring`
   - Add: Commerce blocks, drop-ins, Commerce content patterns

3. **Tool Selection Guide**
   - New topic comparing Document Authoring Tool vs Universal Editor vs Visual Editor

### Medium Priority - Expand Existing Docs

4. **Visual Editor Localization** - Add section to `visual-editor.mdx`
5. **Multistore Content Organization** - Expand `multistore-setup.mdx` with Universal Editor section
6. **Universal Editor Setup** - Create Commerce-specific setup guide
7. **Asset Management** - Expand DAM section with Universal Editor workflows

### Lower Priority - Updates/Clarifications

8. **Troubleshooting** - Add Universal Editor section
9. **Storebuilder Definition** - Clarify terminology

## Key Finding

**Most gaps are NOT about missing Universal Editor documentation in general** - they're about **missing Commerce Storefront-specific context** for Universal Editor workflows. The external docs (aem.live, Experience League) cover Universal Editor generally, but don't address Commerce Storefront integration specifics.

**Strategy:** Create Commerce Storefront-specific guides that:
1. Reference the general Universal Editor docs
2. Add Commerce-specific workflows and examples
3. Bridge the gap between general AEM docs and Commerce Storefront needs

