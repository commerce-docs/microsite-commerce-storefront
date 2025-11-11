# Styles Documentation Generator

## Overview

The Styles Documentation Generator creates **concise, practical** CSS styling documentation for drop-in components by analyzing actual stylesheet files from drop-in repositories. 

## Architecture: Universal + Specific

The generator follows a **DRY (Don't Repeat Yourself)** architecture:

### Universal Guide (`dropins/all/styling.mdx`)
**164 lines - Read once, applies to all drop-ins**

Contains all common styling information:
- Design tokens system overview
- How to override tokens globally
- CSS class naming conventions (BEM)
- DevTools workflow with diagram
- Responsive breakpoints
- Best practices
- Example customizations

### Drop-in-Specific Pages (`dropins/{name}/styles.mdx`)
**~77 lines - Just the essentials**

Contains only drop-in-specific information:
- Link to universal guide
- 5 key component classes (not all hundreds)
- Design tokens used by THIS drop-in
- 3 practical customization examples

## Benefits

✅ **79% reduction** per drop-in (363 lines → 77 lines)  
✅ **No duplication** - Common content lives in one place  
✅ **Better maintenance** - Update design tokens once  
✅ **Better UX** - Learn once, apply everywhere  
✅ **Faster generation** - Less content to process

## What the Generator Does

### 1. **Scans for Real CSS Files**
Searches `src/components/` and `src/containers/` directories for `.css` files in each drop-in repository.

**Example from Cart:**
- 11 CSS files found
- `MiniCart.css`, `CartSummaryList.css`, `OrderSummary.css`
- And 8 more...

### 2. **Extracts Key Component Classes**
Shows only the **first 5 components** with their main class (not hundreds of variants).

**Example output:**
```markdown
- `.cart-cart-summary-grid` - CartSummaryGrid
- `.cart-cart-summary-list` - CartSummaryList
- `.cart-cart-summary-table__item` - Item
- `.cart-coupons__accordion-section` - Coupons
- `.cart-empty-cart` - EmptyCart
- ...and 6 more components
```

### 3. **Analyzes Design Token Usage**
Identifies which boilerplate design tokens are actually used by the drop-in (summarized, not per-component).

**Example output:**
```markdown
**Design tokens used by this drop-in:**

- **Colors**: --color-brand-700, --color-neutral-200, --color-neutral-400, ...and 10 more
- **Spacing**: --spacing-small, --spacing-xsmall, --spacing-medium, ...and 2 more
- **Typography**: --type-body-2-strong-font, --type-headline-1-font, ...and 21 more
```

### 4. **Generates Practical Examples**
Creates 3 copy-paste-ready examples using the actual main class:

1. **Adjust spacing** - Change padding and gaps
2. **Customize colors** - Override background and text colors  
3. **Add responsive styles** - Mobile-first media query example

### 5. **Generates Minimal Documentation**
Creates a concise styles.mdx file (~77 lines) with:
- Link to universal styling guide
- 5 key component classes
- Design tokens used by this drop-in
- 3 practical customization examples
- DevTools tip for finding other classes

## Usage

### Generate for All Drop-ins
```bash
npm run generate-styles-docs
```

### Generate for Specific Drop-in
```bash
npm run generate-styles-docs cart
npm run generate-styles-docs quote-management
```

## Output

**File Location:** `src/content/docs/dropins/{dropin-name}/styles.mdx`  
**B2B Location:** `src/content/docs/dropins-b2b/{dropin-name}/styles.mdx`

## Template Structure

The generator uses `_dropin-templates/dropin-styles.mdx` which includes:

1. **Design tokens section** - Explains the boilerplate's design token system
2. **Component classes placeholder** - Gets replaced with extracted classes
3. **Customizing styles** - Instructions for overriding tokens and adding custom CSS
4. **Custom CSS examples placeholder** - Gets replaced with real examples
5. **Responsive customization** - Standard breakpoint guidance
6. **Dark mode support** - Example of theming with design tokens
7. **Best practices** - Guidelines for using design tokens

## Example Generated Output

For the Cart drop-in (77 lines total):

### Complete File Structure
```markdown
---
title: Cart styles
description: CSS classes and customization examples for the Cart drop-in component.
---

import Aside from '@components/Aside.astro';

Customize the Cart drop-in using CSS classes and design tokens.

<Aside type="tip">

See [Styling Drop-In Components](/dropins/all/styling/) for design tokens, 
responsive breakpoints, and best practices. This page shows the specific 
classes for the Cart drop-in.

</Aside>

## Component classes

The Cart drop-in uses BEM-style class naming. Key components include:

- `.cart-cart-summary-grid` - CartSummaryGrid
- `.cart-cart-summary-list` - CartSummaryList
- `.cart-cart-summary-table__item` - Item
- `.cart-coupons__accordion-section` - Coupons
- `.cart-empty-cart` - EmptyCart
- ...and 6 more components

<Aside type="tip">

Use browser DevTools to inspect elements and find specific class names 
for your customizations.

</Aside>

**Design tokens used by this drop-in:**

- **Colors**: --color-brand-700, --color-neutral-200, ...and 10 more
- **Spacing**: --spacing-small, --spacing-xsmall, ...and 2 more
- **Typography**: --type-body-2-strong-font, ...and 21 more

## Customization examples

**Adjust spacing:**

```css
.cart-cart-summary-grid {
  padding: var(--spacing-big);
  gap: var(--spacing-medium);
}
```

**Customize colors:**

```css
.cart-cart-summary-grid {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-900);
}
```

**Add responsive styles:**

```css
/* Mobile */
.cart-cart-summary-grid {
  padding: var(--spacing-small);
}

/* Desktop */
@media (min-width: 1024px) {
  .cart-cart-summary-grid {
    padding: var(--spacing-big);
  }
}
```
```

## Benefits

1. **Concise** - ~77 lines per drop-in (79% smaller than original approach)
2. **No Duplication** - Common content lives in universal guide
3. **Developer-Friendly** - Learn once, apply everywhere
4. **Accurate** - Documentation matches actual implementation
5. **Always Current** - Regenerate after CSS updates
6. **Maintainable** - Update design tokens in one place
7. **Fast to Read** - Busy developers can scan in 2 minutes

## Developer Experience

### First Time (10 minutes total)
1. **Read universal guide** (`dropins/all/styling.mdx`) - 7 minutes
   - Learn design token system
   - Understand BEM naming
   - See DevTools workflow
   - Review best practices

2. **Read specific drop-in** (`dropins/cart/styles.mdx`) - 2 minutes
   - See key component classes
   - Copy customization examples
   - Start coding

3. **Start customizing** - Immediate

### Subsequent Drop-ins (2 minutes)
1. ~~Read universal guide~~ (already know it)
2. **Scan specific drop-in** - 30 seconds
3. **Start customizing** - Immediate

### Total Content
- **Universal guide**: 164 lines (read once)
- **Per drop-in**: ~77 lines (read per drop-in)
- **10 drop-ins**: 164 + (10 × 77) = 934 lines total
- **Old approach**: 10 × 363 = 3,630 lines total
- **Savings**: 2,696 lines (74% reduction!)

## Integration

The generator:
- ✅ Added to `package.json` scripts
- ✅ Integrated into `generate-all-docs.js`
- ✅ Documented in `scripts/README.md`
- ✅ Follows the same patterns as other generators
- ✅ Uses the shared `runGenerator()` framework
- ✅ Auto-updates the sidebar

## Next Steps

1. **Test the generator** on a single drop-in:
   ```bash
   npm run generate-styles-docs cart
   ```

2. **Review output** at:
   ```
   src/content/docs/dropins/cart/styles.mdx
   ```

3. **Verify accuracy** by comparing with actual CSS files in:
   ```
   .temp-repos/cart/src/components/
   ```

4. **Generate for all** drop-ins:
   ```bash
   npm run generate-styles-docs
   ```

5. **Include in master generator**:
   ```bash
   npm run generate-all-docs
   ```

## Technical Details

### Dependencies
- `fs` - File system operations
- `path` - Path manipulation
- `lib/generator-core.js` - Framework for consistent execution
- `lib/sidebar.js` - Sidebar updates
- `lib/markdown.js` - Template processing
- `lib/logger.js` - Standardized logging

### Source Priority
1. **Actual CSS files** in drop-in repositories
2. **Boilerplate design tokens** from `styles/styles.css`
3. **Template guidance** for customization patterns

No enrichment files needed - everything is extracted from source!

## Verification Checklist

Before committing generated styles documentation:

- [ ] Run generator on at least one drop-in
- [ ] Verify CSS classes match actual component files
- [ ] Confirm design tokens are from boilerplate
- [ ] Check examples are real code, not hypothetical
- [ ] Test customization examples work
- [ ] Verify sidebar entry was added
- [ ] Review generated output for accuracy
- [ ] Test build with new styles documentation

## Summary

This generator provides **concise, practical CSS documentation** for all drop-ins by:

1. **Extracting real data** from actual CSS files
2. **Showing only essentials** (5 key classes, not 200)
3. **Eliminating duplication** (common content in universal guide)
4. **Providing copy-paste examples** (3 per drop-in)
5. **Linking to universal guide** (learn once, apply everywhere)

### File Sizes
- **Original approach**: 363 lines per drop-in
- **After optimization**: 142 lines per drop-in
- **After deduplication**: 77 lines per drop-in (79% reduction!)
- **Universal guide**: 164 lines (one-time investment)

### Architecture Benefits
✅ **DRY principle** - No repeated content  
✅ **Better maintenance** - Update tokens once  
✅ **Better UX** - Learn system once  
✅ **Faster generation** - Less content to process  
✅ **Accurate** - Extracted from actual source code  
✅ **Practical** - Focused on what busy developers need

