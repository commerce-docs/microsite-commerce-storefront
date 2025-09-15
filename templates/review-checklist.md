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
- [ ] Headings follow proper hierarchy (H1 → H2 → H3)
- [ ] Lists and tables are properly formatted
- [ ] Code blocks specify language for syntax highlighting

## Technical Review

### Markup & Structure
- [ ] Frontmatter is complete and correct
- [ ] MDX components are used properly
- [ ] Images have descriptive alt text
- [ ] Internal links use relative paths
- [ ] External links open in new tabs where appropriate
- [ ] Table of contents is enabled when needed

### Navigation & Discoverability  
- [ ] Page is linked from relevant overview/index pages
- [ ] Navigation sidebar updated (if new page)
- [ ] Page appears in site search results
- [ ] Related pages are cross-linked appropriately
- [ ] Page fits logically in information architecture

### Code Quality
- [ ] Code examples follow project conventions
- [ ] Imports and dependencies are correct
- [ ] Error handling is included where appropriate
- [ ] Code is properly formatted and indented
- [ ] Comments explain complex logic
- [ ] Full working examples are provided

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
**Name:** ________________  
**Date:** ________________  
**Approved:** ☐ Yes ☐ No ☐ Needs Changes  
**Notes:**

### Editorial Reviewer  
**Name:** ________________  
**Date:** ________________  
**Approved:** ☐ Yes ☐ No ☐ Needs Changes  
**Notes:**

### Final Approver
**Name:** ________________  
**Date:** ________________  
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

💡 **Quality Indicators:**
- User can complete the task without additional resources
- Content answers "why" as well as "how"
- Examples are copy-pasteable and work
- Troubleshooting prevents support tickets
- Related content is easy to discover
- Page loads quickly and displays properly
