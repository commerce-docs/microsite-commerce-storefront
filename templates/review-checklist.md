# Documentation Review Checklist

Use this checklist when reviewing documentation pull requests to ensure consistent quality and completeness.

## Content Review

### Technical Accuracy

- [ ] All code examples are tested and functional
- [ ] API references match current implementation
- [ ] Configuration options are correct and up-to-date
- [ ] Screenshots reflect current UI (if applicable)
- [ ] Links work and point to correct destinations
- [ ] Prerequisites are accurate and complete

### Content Quality

- [ ] Content serves a clear user goal/need
- [ ] Information is organized logically
- [ ] Steps are in correct order and complete
- [ ] Examples are relevant and helpful
- [ ] Troubleshooting covers common issues
- [ ] Content matches the appropriate template structure

### Writing & Language

- [ ] Uses consistent tone and voice
- [ ] Language is clear and concise
- [ ] Terminology is consistent with style guide
- [ ] Headings follow proper hierarchy (H1 → H2 → H3 → H4)
- [ ] Lists and tables are properly formatted
- [ ] Code blocks specify language for syntax highlighting

### The Elements of Style Principles

- [ ] Uses active voice ("The system processes requests")
- [ ] Puts statements in positive form (say what is, not what isn't)
- [ ] Uses definite, specific, concrete language (avoid vague terms)
- [ ] Omits needless words (every word tells)
- [ ] Keeps related words together (subject near verb)
- [ ] Expresses parallel ideas in parallel form
- [ ] Uses same form for coordinate ideas (consistent list structure)
- [ ] Places emphatic words at end of sentences
- [ ] Avoids succession of loose sentences (varies sentence structure)
- [ ] Makes paragraph the unit of composition (one topic per paragraph)
- [ ] Uses orthodox spelling and grammar
- [ ] Does not overwrite or overstate (direct and factual)
- [ ] Avoids qualifiers (very, rather, quite, pretty, little, somewhat)
- [ ] Is clear and direct (simple over complex)
- [ ] Prefers standard to offbeat (conventional language)

### Grammar & Style Rules

- [ ] Adds articles where needed ("the", "a", "an")
- [ ] Avoids possessives for objects (uses "of/in" constructions instead)
- [ ] Never uses Latin abbreviations (writes "for example" not "e.g.")
- [ ] Uses parallel construction in lists
- [ ] Ends complete sentences in lists with periods
- [ ] Uses H4 headings instead of bold text after H3 headings
- [ ] Uses Steps component for all ordered lists (not standard markdown)
- [ ] Always uses `1.` for every list item in Steps (auto-numbered by markdown)

## Technical Review

### Product Terminology

- [ ] Uses "Adobe Commerce boilerplate" (not "AEM Commerce boilerplate")
- [ ] First mention: "Adobe Commerce boilerplate" or full official name
- [ ] Second mention: "Commerce boilerplate" (shorthand)
- [ ] Subsequent mentions: "boilerplate"
- [ ] Shortens "Adobe Commerce" to "Commerce" within sections after first mention
- [ ] Spells out ACCS and ACO on first use with abbreviation in parentheses
- [ ] Example: "Adobe Commerce on Cloud (ACCS)" or "Adobe Commerce Optimizer (ACO)"
- [ ] Consistent terminology throughout the page

### File Naming & Conventions

- [ ] Uses kebab-case for file and folder names (checkout-configuration.mdx)
- [ ] File names are descriptive but concise
- [ ] File structure matches URL structure where possible
- [ ] Frontmatter includes minimum: title and description
- [ ] Optional frontmatter used appropriately (tableOfContents, time, prerequisites)

### Markup & Structure

- [ ] Frontmatter is complete and correct (title, description minimum)
- [ ] MDX components are used properly
- [ ] Images have descriptive alt text
- [ ] Internal links use relative paths
- [ ] ALL external links use Link component (required for GitHub, NPM, external sites)
- [ ] All tables use TableWrapper component with nowrap attribute
- [ ] All ordered lists use Steps component (not standard markdown)
- [ ] Table of contents is enabled when needed

### Navigation & Discoverability

- [ ] Page is linked from relevant overview/index pages
- [ ] Navigation sidebar updated (if new page)
- [ ] Page appears in site search results
- [ ] Related pages are cross-linked appropriately
- [ ] Page fits logically in information architecture

### Component Usage Requirements

- [ ] Link component imported and used for ALL external links
- [ ] TableWrapper component imported and used for all tables
- [ ] Steps component imported and used for all ordered lists
- [ ] Aside component uses title attribute (not bold text in content)
- [ ] Badge component used appropriately with tooltip and href where needed
- [ ] All component imports are correct and at top of file

### Code Quality

- [ ] All code examples are tested and functional
- [ ] Code examples follow project conventions
- [ ] Imports and dependencies are correct
- [ ] Error handling is included where appropriate
- [ ] Code is properly formatted and indented with 2 spaces for indents
- [ ] Comments explain complex logic
- [ ] Full working examples are provided
- [ ] Code blocks specify language for syntax highlighting

## Accessibility Review

### Content Accessibility

- [ ] Images have meaningful alt text
- [ ] Links have descriptive text (not "click here")
- [ ] Color is not the only way information is conveyed
- [ ] Text has sufficient contrast ratio
- [ ] Heading structure is logical and sequential
- [ ] Tables have proper headers

### Technical Accessibility

- [ ] Page structure uses semantic HTML
- [ ] Interactive elements are keyboard accessible
- [ ] Screen reader friendly markup is used
- [ ] Skip links provided for long content
- [ ] Language is specified in HTML
- [ ] Focus indicators are visible

### Images & Assets

- [ ] Images stored in `/public/images/` with organized subdirectories
- [ ] Images have descriptive alt text for accessibility
- [ ] Images optimized for web (prefer WebP, < 1MB for screenshots)
- [ ] Screenshots captured at 2x resolution for crisp display
- [ ] Important areas highlighted with arrows or borders where needed
- [ ] Light and dark mode versions provided when possible

## SEO & Metadata

### Page Metadata

- [ ] Title is descriptive and unique
- [ ] Description summarizes page content (150-160 chars)
- [ ] Keywords are naturally integrated
- [ ] Social sharing metadata is appropriate
- [ ] Canonical URL is correct
- [ ] Page loads quickly (< 3 seconds)

### Content Structure

- [ ] URL is clean and descriptive
- [ ] Headings create clear content outline
- [ ] Internal linking supports site hierarchy
- [ ] Content length is appropriate for topic
- [ ] Related content is linked appropriately

## User Experience

### Information Design

- [ ] Content answers user questions efficiently
- [ ] Information flows logically from general to specific
- [ ] Examples are practical and realistic
- [ ] Next steps are clear and actionable
- [ ] Content can be easily scanned/skimmed

### Visual Design

- [ ] Content is well-formatted and readable
- [ ] Code blocks are syntax highlighted
- [ ] Images enhance understanding
- [ ] White space improves readability
- [ ] Callouts highlight important information appropriately

## Content Type-Specific Checks

### For Tutorials

- [ ] Clear learning objective stated upfront
- [ ] Prerequisites are listed and linked
- [ ] Steps are numbered and sequential
- [ ] Expected outcomes are described
- [ ] Troubleshooting section included
- [ ] Estimated completion time provided

### For Reference Documentation

- [ ] All parameters/options documented
- [ ] Return values clearly specified
- [ ] Examples cover common use cases
- [ ] Error conditions explained
- [ ] Related functions cross-referenced
- [ ] Version compatibility noted

### For Overview Pages

- [ ] Value proposition clearly communicated
- [ ] Key features highlighted
- [ ] Links to getting started resources
- [ ] Architecture/concepts explained
- [ ] Use cases and benefits described
- [ ] Navigation to detailed docs provided

## Publishing Checklist

### Pre-Publish

- [ ] Content builds without errors locally
- [ ] All reviewer feedback addressed
- [ ] Changes tested on staging environment
- [ ] Navigation updates tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

### Post-Publish

- [ ] Published page displays correctly
- [ ] All links function as expected
- [ ] Navigation reflects new content
- [ ] Search indexing working properly
- [ ] Analytics/tracking configured
- [ ] Team notified of publication

## Review Sign-Off

### Technical Reviewer

**Name:** **\*\***\_\_\_\_**\*\***  
**Date:** **\*\***\_\_\_\_**\*\***  
**Approved:** ☐ Yes ☐ No ☐ Needs Changes  
**Notes:**

### Editorial Reviewer

**Name:** **\*\***\_\_\_\_**\*\***  
**Date:** **\*\***\_\_\_\_**\*\***  
**Approved:** ☐ Yes ☐ No ☐ Needs Changes  
**Notes:**

### Final Approver

**Name:** **\*\***\_\_\_\_**\*\***  
**Date:** **\*\***\_\_\_\_**\*\***  
**Approved:** ☐ Yes ☐ No ☐ Needs Changes  
**Notes:**

---

## Common Issues to Watch For

⚠️ **Frequent Problems:**

- Outdated screenshots or UI references
- Code examples that don't match current API
- Missing prerequisites or setup steps
- Broken internal or external links
- Inconsistent terminology or naming
- Missing error handling in code examples
- Poor image alt text or missing descriptions
- Unclear or missing next steps
- Using "AEM Commerce boilerplate" instead of "Adobe Commerce boilerplate"
- Using ACCS or ACO abbreviations without spelling out on first use
- External links not using Link component
- Tables not using TableWrapper component
- Ordered lists not using Steps component
- Using Latin abbreviations (e.g., i.e., etc.) instead of English equivalents
- Using possessives with apostrophe-s ('s) for objects/components
- Missing periods on complete sentences in lists
- Bold text used as headings instead of proper H4 tags
- Missing articles (a, an, the) where grammatically needed
- Inconsistent code indentation (should use 2 spaces for indents)

💡 **Quality Indicators:**

- User can complete the task without additional resources
- Content answers "why" as well as "how"
- Examples are copy-pasteable and work
- Troubleshooting prevents support tickets
- Related content is easy to discover
- Page loads quickly and displays properly
- All external links have the external icon (Link component used)
- All tables are properly formatted with TableWrapper
- All ordered lists use the Steps component for visual hierarchy
- Product terminology is consistent (Adobe Commerce boilerplate)
- Writing follows The Elements of Style principles
- Grammar rules applied consistently (articles, no possessives, no Latin abbreviations)
- Code examples are consistently formatted with 2-space indentation
