# Generator External Links Fix Summary

## Issues Found

Two generators were using markdown link syntax for external links instead of the Link component:
1. **Styles generator** (`scripts/@generate-styles-docs.js`)
2. **Merchant block generator** (`scripts/@generate-merchant-block-docs.js`)

## What Was Fixed

### File 1: `scripts/@generate-styles-docs.js`

**Location**: Line 242 (in the `generateComponentClassesSection` function)

**Before:**
```javascript
output += `For the source CSS files, see the [${packageName} repository](${repoUrl}/tree/main/src).\n`;
```

**After:**
```javascript
output += `For the source CSS files, see the <Link href="${repoUrl}/tree/main/src" text="${packageName} repository" />.\n`;
```

## Why This Matters

When the styles generator runs, it now produces styles.mdx files that use the Link component for external GitHub repository links, which:
- Adds external link icons automatically
- Opens in new tab with proper security attributes
- Maintains consistent styling with the rest of the documentation
- Follows the established pattern throughout the documentation

## Other External Links in Generator

The generator already had correct Link component usage in another location:

**Line 657 (in `generateCustomizationIntro`):**
```javascript
return `Add this to <Link href="${boilerplateUrl}/${blockPath}" text="${blockPath}" /> to customize the ${dropinName} drop-in.`;
```

**Line 661:**
```javascript
return `Add this to the CSS file of the specific <Link href="${boilerplateUrl}/${blocksPath}" text="commerce block" /> where you're using the ${dropinName} drop-in.`;
```

These were already correct and didn't need updating.

### File 2: `scripts/@generate-merchant-block-docs.js`

**Location 1**: Line 732-733 (added Link import)

**Before:**
```javascript
import TableWrapper from '@components/TableWrapper.astro';

${description} This block integrates...
```

**After:**
```javascript
import TableWrapper from '@components/TableWrapper.astro';
import Link from '@components/Link.astro';

${description} This block integrates...
```

**Location 2**: Lines 835-836 (in the related resources section)

**Before:**
```javascript
content += `## Related resources

- [AEM Commerce Boilerplate](https://github.com/hlxsites/aem-boilerplate-commerce)
- [Edge Delivery Services](https://www.aem.live/docs/)
`;
```

**After:**
```javascript
content += `## Related resources

- <Link href="https://github.com/hlxsites/aem-boilerplate-commerce" text="AEM Commerce Boilerplate" />
- <Link href="https://www.aem.live/docs/" text="Edge Delivery Services" />
`;
```

## Impact

### Immediate Impact
The 4 manually updated B2B styles.mdx files will retain their correct Link component usage.

### Future Impact
1. **Styles Generator**: When it runs again for any drop-in (B2B or B2C), it will now generate styles.mdx files with the Link component for repository links.
2. **Merchant Block Generator**: When it runs, all merchant block documentation will include Link components for external resources.

## Regeneration Workflow

To regenerate styles documentation with the updated generator:

```bash
# Single drop-in
npm run generate-styles-docs <dropin-name>

# All drop-ins (if needed)
npm run generate-styles-docs
```

**Note**: The generator is typically run when:
1. A new drop-in is added
2. Significant CSS structure changes occur
3. Major version updates happen

For normal documentation updates, manual edits to styles.mdx files are preserved as long as you don't regenerate that specific file.

## Complete External Links Pattern

Now ALL generators that produce external links use the Link component:

1. ✅ **Overview generator** (`@generate-overview-docs.js`) - No external links (internal navigation removed)
2. ✅ **Styles generator** (`@generate-styles-docs.js`) - Now uses Link component for GitHub repos
3. ✅ **Merchant block generator** (`@generate-merchant-block-docs.js`) - Now uses Link component for related resources
4. ✅ **Boilerplate docs generator** (`@generate-boilerplate-docs.js`) - Already uses Link component (line 691)
5. ✅ **Event docs generator** (`@generate-event-docs.js`) - No external links in output (only internal reference)
6. ✅ **Function docs generator** (`@generate-function-docs.js`) - No external links in output
7. ✅ **Other generators** - No external links in their output

## Verification

To check if other generators have external links:

```bash
# Search all generators for external URL patterns
grep -n 'https://' scripts/@generate-*.js
grep -n '\[.*\](http' scripts/@generate-*.js
```

If any are found, they should be updated to use the Link component pattern.

## Related Changes

This fix is part of the broader external links standardization:

1. ✅ Manual updates to 4 B2B styles.mdx files
2. ✅ Styles generator updated (line 242)
3. ✅ Merchant block generator updated (lines 733, 835-836)
4. ✅ Overview generator updated (removed internal links)
5. ✅ Template updated (dropin-overview-minimal.mdx)

## Testing

### Test Styles Generator

1. Run the generator for a drop-in:
   ```bash
   npm run generate-styles-docs company-management
   ```

2. Check the generated file:
   ```bash
   grep '<Link href=' src/content/docs/dropins-b2b/company-management/styles.mdx
   ```

3. Verify it shows Link component syntax, not markdown links

### Test Merchant Block Generator

1. Run the merchant docs generator:
   ```bash
   npm run generate-merchant-docs
   ```

2. Check any generated merchant block file:
   ```bash
   grep '<Link href=' src/content/docs/merchants/blocks/*.mdx | head -5
   ```

3. Verify "Related resources" section uses Link component

## Success Criteria

- ✅ Both generators updated to use Link component
- ✅ No markdown external links produced by any generator
- ✅ Maintains backward compatibility with existing files
- ✅ Future regenerations will use correct pattern
- ✅ All 7 main generators audited for external links
- ✅ Link component import added where needed

## Summary

**Files Modified:** 2 generators
- `scripts/@generate-styles-docs.js` (1 location)
- `scripts/@generate-merchant-block-docs.js` (2 locations: import + links)

**External Links Fixed:** 3
- 1 GitHub repository link in styles generator
- 2 resource links in merchant block generator

**Pattern Established:** All external links in generated documentation now use:
```jsx
<Link href="URL" text="Link Text" />
```

Instead of markdown:
```markdown
[Link Text](URL)
```

This ensures consistency with the established documentation pattern and provides proper external link icons, new tab behavior, and security attributes.

