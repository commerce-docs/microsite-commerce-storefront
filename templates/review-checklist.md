# Documentation review checklist

Use this checklist for a topic, documentation edit, or pull request. Review for a beginning developer who is new to Commerce storefronts, front-end projects, and Adobe tooling.

## How to use this checklist

Record the files or diff being reviewed. Apply only the relevant checks. Current [repository instructions](../.github/copilot-instructions.md) and applicable skills take precedence if this checklist conflicts with them. The MDX requirements below apply to published pages under `src/content/docs/`, not to internal Markdown files such as this checklist.

- Mark `[x]` only when a check passes and you have supporting evidence.
- Leave `[ ]` for an unresolved finding or a check that has not been performed.
- Append `N/A: reason` when a check does not apply. Do not count it as passed.
- Append `Unverified: reason` when source access, credentials, tooling, or the environment prevents verification. Do not infer a pass from the absence of errors.
- For edit-and-review requests, fix issues within the requested scope and rerun the affected checks. For report-only reviews, do not edit files.

For a branch review, combine and deduplicate these file lists. Skip deleted files. Use a different comparison branch if the request specifies one.

```bash
git diff --name-only --diff-filter=ACMR release...HEAD -- '*.md' '*.mdx'
git diff --name-only --diff-filter=ACMR HEAD -- '*.md' '*.mdx'
```

### Review scope

- [ ] Record the target files, comparison branch or commit, and whether edits are authorized.
- [ ] Read the relevant contribution rules, skills, and nearest related page or template.
- [ ] Review changed content and the dependencies needed to validate it without making unrelated changes.
- [ ] Identify the topic's reader goal, audience, content type, and target product version.
- [ ] Record findings with severity, file and line, reader impact, evidence, and a suggested correction.

## Content Review

### Technical Accuracy

- [ ] Verify APIs, props, events, file paths, defaults, and behavior against live stable source listed in `.cursor/data/code-sources.json`; record the source URL, ref, and relevant lines.
- [ ] Use the matching version tag for release-specific claims; do not verify against local clones, installed packages, or README text alone.
- [ ] Verify product and concept claims against exact published pages from `.cursor/data/documentation-sources.json`; do not invent supporting URLs.
- [ ] Distinguish documented defaults from optional customization, backend compatibility, licensing, and pre-release features.
- [ ] Do not add installation instructions for standard drop-ins already included and wired into the storefront.
- [ ] Test executable examples in the intended environment; label illustrative or partial examples and record anything untested.
- [ ] State limitations when product behavior is unresolved; do not present speculative workarounds as established solutions.
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
- [ ] The opening states the concrete result rather than describing the page structure or starting with a warning.
- [ ] Explain unfamiliar terms and spell out acronyms on first use; do not require implementation knowledge to understand the reader goal.
- [ ] Explain why a procedure matters, what success looks like, and the most likely failure.

### Writing & Language

- [ ] Uses consistent tone and voice
- [ ] Language is clear and concise
- [ ] Consult the Adobe Style Guide through the style-access skill; record unavailable guidance rather than claiming it was verified.
- [ ] Use sentence case for titles and headings, except exact product names and code identifiers.
- [ ] Published MDX uses the frontmatter title as its H1, has no body H1, and does not skip heading levels (H2, H3, H4).
- [ ] Lists and tables are properly formatted
- [ ] Code blocks specify language for syntax highlighting

### Plain language

- [ ] Uses active voice ("The system processes requests")
- [ ] Puts statements in positive form (say what is, not what isn't)
- [ ] Uses definite, specific, concrete language (avoid vague terms)
- [ ] Omits needless words (every word tells)
- [ ] Keeps related words together (subject near verb)
- [ ] Expresses parallel ideas in parallel form
- [ ] Uses same form for coordinate ideas (consistent list structure)
- [ ] Put the important result or action where a reader can find it quickly.
- [ ] Avoids succession of loose sentences (varies sentence structure)
- [ ] Makes paragraph the unit of composition (one topic per paragraph)
- [ ] Uses orthodox spelling and grammar
- [ ] Does not overwrite or overstate (direct and factual)
- [ ] Remove unsupported claims and unnecessary qualifiers while preserving meaningful conditions and limitations.
- [ ] Is clear and direct (simple over complex)
- [ ] Prefers standard to offbeat (conventional language)

### Grammar & Style Rules

- [ ] Adds articles where needed ("the", "a", "an")
- [ ] Use natural, clear phrasing; do not apply blanket grammatical bans that conflict with repository writing guidance.
- [ ] Never uses Latin abbreviations (writes "for example" not "e.g.")
- [ ] Uses parallel construction in lists
- [ ] Ends complete sentences in lists with periods
- [ ] Use real headings instead of bold text as substitute headings; choose the next level without skipping levels.
- [ ] Use `<Steps>` for step-by-step procedures in published MDX; use bullets for nonsequential summaries or requirements.
- [ ] Always uses `1.` for every list item in Steps (auto-numbered by markdown)

## Technical Review

### Product Terminology

- [ ] When naming the source project, use "Adobe Commerce boilerplate," not "AEM Commerce boilerplate."
- [ ] Use "storefront" in merchant-facing content; use "Adobe Commerce boilerplate" only when referring specifically to the source project.
- [ ] After introducing "Adobe Commerce," use "Commerce" where unambiguous; keep the distinct product names below in full.
- [ ] Always write "Adobe Commerce as a Cloud Service" and "Adobe Commerce Optimizer" in full; never abbreviate them as ACCS or ACO.
- [ ] Distinguish those products from "Adobe Commerce on Cloud," the platform-as-a-service (PaaS) offering.
- [ ] Use "shopper" for the person shopping, and use "block," "drop-in," and "container" for their distinct roles rather than as synonyms.
- [ ] Consistent terminology throughout the page

### File Naming & Conventions

- [ ] Uses kebab-case for file and folder names (checkout-configuration.mdx)
- [ ] File names are descriptive but concise
- [ ] Preserve existing public URLs when reorganizing discovery; validate explicit slugs and add redirects when a URL must change.
- [ ] Frontmatter includes minimum: title and description
- [ ] Optional frontmatter used appropriately (tableOfContents, time, prerequisites)

### Markup & Structure

- [ ] Frontmatter is complete and valid (title and description minimum), with unquoted YAML scalars where valid.
- [ ] MDX components are used properly
- [ ] Images have descriptive alt text
- [ ] Published MDX internal links use Markdown with site-root paths and valid generated heading anchors; internal authoring files use appropriate repository-relative links.
- [ ] All external links in published MDX use `<Link href="..." text="..." />`, including GitHub, npm, and product documentation links.
- [ ] All Markdown tables in published MDX use `<TableWrapper>`; `nowrap` is optional and used only for short labels or links, not long sentences.
- [ ] Step-by-step procedures in published MDX use `<Steps>` and `1.` for each item; complete-sentence steps end with periods.
- [ ] Table of contents is enabled when needed

### Navigation & Discoverability

- [ ] Page is linked from relevant overview/index pages
- [ ] New how-tos appear in `src/content/docs/tutorials/index.mdx` under an outcome-based topic, with a clear link title and one-sentence result.
- [ ] How-to sidebar navigation points to the catalog and its topic sections, not an expanding list of individual articles.
- [ ] Unlisted pages are associated with the correct Starlight topic; catalog shortcuts match the generated heading anchors.
- [ ] Page appears in site search results
- [ ] Related pages are cross-linked appropriately
- [ ] Page fits logically in information architecture

### Component Usage Requirements

- [ ] In published MDX, import and use `<Link>` for external links, `<TableWrapper>` for Markdown tables, and `<Steps>` for procedures.
- [ ] Use `<Aside type="note|tip|caution|danger">` for callouts, not Experience League preprocessor syntax; use a title when it adds useful context.
- [ ] Use `CardGrid` and `LinkCard` for navigation on landing pages, not as substitutes for task instructions.
- [ ] If `<Term>` is used, the glossary entry exists and the first meaningful mention is tagged without unnecessary repetition.
- [ ] All component imports are correct and at top of file

### Security and privacy

- [ ] Examples, screenshots, logs, and links do not expose secrets, credentials, tokens, personal data, or internal hostnames.
- [ ] Reader-supplied values are clearly explained placeholders, not real credentials or private customer data.
- [ ] Public documentation does not depend on inaccessible internal tickets, private repository links, or unpublished product details without an approved public alternative.
- [ ] Examples do not encourage bypassing authentication, disabling security controls, or placing secrets in browser code.
- [ ] Record suspected exposure without reproducing the secret in a review comment; follow the repository's security reporting process when applicable.

### Code Quality

- [ ] All code examples are tested and functional
- [ ] Code examples follow project conventions
- [ ] Imports and dependencies are correct
- [ ] Error handling is included where appropriate
- [ ] Code is properly formatted and indented with 2 spaces for indents
- [ ] Comments explain complex logic
- [ ] Examples include required imports, identify the file to change, explain placeholders, and briefly explain important lines.
- [ ] Provide self-contained working examples when appropriate; do not imply that partial reference snippets are complete integrations.
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

- [ ] Images use an existing repository asset convention; referenced files resolve from the published page.
- [ ] Images have descriptive alt text for accessibility
- [ ] Images optimized for web (prefer WebP, < 1MB for screenshots)
- [ ] Screenshots are readable at their rendered size without unnecessarily large downloads.
- [ ] Important areas highlighted with arrows or borders where needed
- [ ] Light and dark mode versions provided when possible

## SEO & Metadata

### Page Metadata

- [ ] Title is descriptive and unique
- [ ] Description is an accurate, concise sentence that explains the result or topic; do not pad it to meet an arbitrary character count.
- [ ] Keywords are naturally integrated
- [ ] Social sharing metadata is appropriate
- [ ] Canonical URL is correct
- [ ] For performance-sensitive changes, measure loading under stated conditions and report the result rather than asserting an unmeasured time limit.

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
- [ ] Early sections explain the result, prerequisites, and verified files or components the reader will change.
- [ ] Technical implementation details support the reader goal rather than determine the primary tutorial category.

### For Reference Documentation

- [ ] Props, signatures, required fields, defaults, and behavior match the live interface and implementation for the target version.
- [ ] Return values clearly specified
- [ ] Examples cover common use cases
- [ ] Error conditions explained
- [ ] Related functions cross-referenced
- [ ] Version compatibility noted

### For Overview Pages

- [ ] The opening helps readers choose a next step without requiring them to know the implementation architecture.
- [ ] Key features highlighted
- [ ] Links to getting started resources
- [ ] Architecture/concepts explained
- [ ] Use cases and benefits described
- [ ] Navigation to detailed docs provided

## Publishing Checklist

### Pre-publish validation

- [ ] Run the cheapest relevant content, markup, or behavior check first and record its result.
- [ ] For changed published documentation or navigation, run `pnpm build:prod-fast` and confirm it reports `All internal links are valid.`
- [ ] Record build failures and unavailable checks; do not claim full validation when the build stops before link validation.
- [ ] Check the diff for whitespace errors and unintended changes with `git diff --check`; preserve unrelated user changes.
- [ ] All reviewer feedback addressed
- [ ] Changes tested on staging environment
- [ ] Navigation updates tested
- [ ] Mobile responsiveness verified
- [ ] Check keyboard interaction, mobile layout, and affected browsers when the change affects navigation, components, or rendering.

### Post-Publish

- [ ] Published page displays correctly
- [ ] All links function as expected
- [ ] Navigation reflects new content
- [ ] Search indexing working properly
- [ ] Analytics/tracking configured
- [ ] Team notified of publication

## Review record

Record results in the PR description, review comment, or a separate review note. Do not mark this shared checklist as passed for every future review.

### Findings

List findings before the change summary, ordered by severity:

- **High:** Incorrect or unsafe instructions, exposed credentials, or a broken required workflow.
- **Medium:** Missing prerequisites, misleading behavior claims, broken links, or navigation problems that impede the task.
- **Low:** Wording, consistency, or formatting problems that do not block the task.

For each finding, provide the file and line, the problem, its impact on the reader, supporting evidence, and a suggested fix. If there are no findings, say so and still list validation gaps.

### Review summary

- **Scope:** [Files, diff, target version, and content type]
- **Reviewer and date:** [Name or assistant role, and date]
- **Findings:** [Remaining high, medium, and low findings]
- **Validation:** [Commands, source references, and results]
- **Not applicable:** [Checks and reasons]
- **Unverified:** [Checks, blockers, and any follow-up needed]
- **Recommendation:** [Ready for human approval, needs changes, or blocked]

An assistant review does not substitute for technical, editorial, or final approval by the assigned human reviewers.

### Reusable review request

```text
Review the specified topic or diff against templates/review-checklist.md.
Use current repository instructions when they conflict with the checklist.
Do not edit files. Report findings by severity with file and line references.
Identify checks that are not applicable or could not be verified, and record
the validation commands and results.
```

For an edit-and-review request, replace "Do not edit files" with "Fix applicable issues within the requested scope, then rerun the affected checks."

---

## Common Issues to Watch For

### Frequent problems

- Outdated screenshots or UI references
- Code examples that don't match current API
- Missing prerequisites or setup steps
- Broken internal or external links
- Inconsistent terminology or naming
- Missing error handling in code examples
- Poor image alt text or missing descriptions
- Unclear or missing next steps
- Using "AEM Commerce boilerplate" instead of "Adobe Commerce boilerplate"
- Abbreviating Adobe Commerce as a Cloud Service or Adobe Commerce Optimizer, or confusing either with Adobe Commerce on Cloud
- External links not using Link component
- Tables not using TableWrapper component
- Ordered lists not using Steps component
- Using Latin abbreviations (e.g., i.e., etc.) instead of English equivalents
- Assuming a source claim or code example is verified without checking or testing it
- Missing periods on complete sentences in lists
- Bold text used as headings instead of proper H4 tags
- Missing articles (a, an, the) where grammatically needed
- Inconsistent code indentation (should use 2 spaces for indents)
- Overuse of jargon or abbreviations without explanation
- Missing alt text for images or descriptive captions
- Usage of em dashes instead of proper punctuation
- Usage of semicolons instead of proper punctuation
- Inconsistent use of quotation marks (single vs double)
- Choppy or fragmented sentences.
- Lack of smooth transitions between sentences and sections

### Quality indicators

- Readers have the prerequisites, instructions, and links needed to complete the task
- Content answers "why" as well as "how"
- Examples are copy-pasteable and work
- Troubleshooting prevents support tickets
- Related content is easy to discover
- Page loads quickly and displays properly
- All external links have the external icon (Link component used)
- All tables are properly formatted with TableWrapper
- Step-by-step procedures in published MDX use the Steps or Task components for visual hierarchy
- Product terminology is consistent (Adobe Commerce boilerplate)
- Writing follows The Elements of Style principles
- Grammar rules applied consistently without sacrificing natural, clear wording
- Code examples are consistently formatted with 2-space indentation
