# Contributing to Commerce Storefront Documentation

Welcome! This guide will help you contribute effectively to the Adobe Commerce Storefront documentation. Whether you're writing new content, updating existing docs, or reviewing contributions, this guide covers everything you need to know.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Content Types](#content-types)
- [Writing Standards](#writing-standards)
- [File Conventions](#file-conventions)
- [Markdown & Components](#markdown--components)
- [Assets & Media](#assets--media)
- [Review Process](#review-process)
- [Publishing Workflow](#publishing-workflow)
- [Common Tasks](#common-tasks)
- [Getting Help](#getting-help)

## Getting Started

### Prerequisites

- **Node.js**: Version specified in `.nvmrc` (currently Node 20.x)
- **Package Manager**: pnpm (preferred) or npm
- **Git**: For version control and collaboration
- **Code Editor**: VS Code recommended with MDX extension

### Local Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd microsite-commerce-storefront
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:4321` to see your local documentation site.

### Quick Start Checklist

- [ ] Repository cloned and dependencies installed
- [ ] Development server running successfully
- [ ] Can navigate to different documentation sections
- [ ] Editor configured with MDX syntax highlighting

## Project Structure

Understanding the project structure is crucial for knowing where to place new content:

```
src/
├── content/
│   └── docs/                 # All documentation content
│       ├── index.mdx         # Homepage
│       ├── get-started/      # Getting started guides
│       ├── dropins/          # Drop-in component docs
│       │   ├── cart/         # Cart-specific documentation
│       │   ├── checkout/     # Checkout documentation
│       │   └── ...
│       ├── sdk/              # SDK documentation
│       │   ├── components/   # UI component docs
│       │   ├── design/       # Design system docs
│       │   ├── reference/    # API reference
│       │   └── utilities/    # Utility function docs
│       ├── setup/            # Setup and configuration
│       └── merchants/        # Merchant-focused content
├── components/               # Astro components for docs
└── assets/                   # Images, icons, media files
```

### Navigation Configuration

The site navigation is configured in `astro.config.mjs`. When adding new pages, you may need to update the sidebar configuration to ensure proper navigation.

## Content Types

Choose the right content type for your documentation:

### 1. **Tutorials** (`/tutorials/` or `/dropins/[component]/tutorials/`)
**When to use:** Step-by-step instructions for completing a specific task
**Structure:**
- Clear objective statement
- Prerequisites listed
- Numbered steps with screenshots
- Expected outcomes
- Next steps or related tutorials

### 2. **Guides** (`/get-started/`, `/setup/`)
**When to use:** Comprehensive explanations of concepts or processes
**Structure:**
- Overview of the topic
- Detailed explanations with examples
- Best practices and recommendations
- Troubleshooting common issues

### 3. **Reference** (`/sdk/reference/`, `/dropins/[component]/functions/`)
**When to use:** API documentation, function references, configuration options
**Structure:**
- Brief description
- Parameters/options table
- Code examples
- Return values or outputs
- Related references

### 4. **Overview Pages** (`/dropins/[component]/index.mdx`)
**When to use:** Introduction to a major feature or component
**Structure:**
- What it is and why it's useful
- Key features and capabilities
- Quick start or installation
- Links to detailed documentation

## Writing Standards

### Tone and Voice

- **Be clear and concise**: Use simple, direct language
- **Be helpful**: Anticipate user questions and provide context
- **Be consistent**: Follow established patterns and terminology
- **Be inclusive**: Use accessible language and avoid jargon when possible

### Technical Accuracy

- **Test all code examples** before publishing
- **Verify links and references** work correctly
- **Use current syntax and APIs** - no deprecated examples
- **Include error handling** in code samples where appropriate

### Content Guidelines

1. **Start with the user's goal** - what are they trying to accomplish?
2. **Provide context** - explain why something matters before explaining how to do it
3. **Use active voice** - "Configure the settings" not "Settings can be configured"
4. **Write scannable content** - use headings, lists, and short paragraphs
5. **Include examples** - show, don't just tell

### The Elements of Style Principles

All documentation writing must follow "The Elements of Style" by William Strunk Jr. and E.B. White. These principles ensure clear, concise, and effective technical writing:

1. **Use the active voice**
   - ✅ "The system processes requests"
   - ❌ "Requests are processed by the system"

2. **Put statements in positive form**
   - Say what is, not what isn't
   - ✅ "Use the Link component for external links"
   - ❌ "Don't use standard markdown for external links"

3. **Use definite, specific, concrete language**
   - Avoid vague terms
   - ✅ "Run `npm install` to install dependencies"
   - ❌ "Install the necessary packages"

4. **Omit needless words**
   - Make every word tell
   - ✅ "Configure the endpoint"
   - ❌ "You can configure the endpoint if you want to"

5. **Keep related words together**
   - Subject near verb, modifiers near what they modify
   - ✅ "The function returns a promise that resolves when complete"
   - ❌ "The function, when the operation completes, returns a promise"

6. **Express parallel ideas in parallel form**
   - Maintain consistent grammatical structure
   - ✅ "The component loads data, processes it, and renders the UI"
   - ❌ "The component loads data, processes it, and then the UI is rendered"

7. **Use the same form for coordinate ideas**
   - Maintain grammatical consistency
   - Lists should use the same structure for all items

8. **Place emphatic words at the end of sentences**
   - ✅ "For better performance, use the Link component"
   - ❌ "Use the Link component for better performance" (less emphasis)

9. **Avoid a succession of loose sentences**
   - Vary sentence structure
   - Mix simple, compound, and complex sentences

10. **Make the paragraph the unit of composition**
    - One topic per paragraph
    - Begin each paragraph with a topic sentence

11. **Use orthodox spelling and grammar**
    - Follow standard American English conventions
    - Use consistent terminology throughout

12. **Do not overwrite or overstate**
    - Be direct and factual
    - ✅ "This improves performance"
    - ❌ "This dramatically revolutionizes and transforms performance"

13. **Avoid qualifiers**
    - Use sparingly: very, rather, quite, pretty, little, somewhat
    - ✅ "The build is fast"
    - ❌ "The build is quite fast"

14. **Be clear and direct**
    - Favor simple over complex constructions
    - Technical writing should be immediately understandable

15. **Prefer the standard to the offbeat**
    - Use conventional language and structure
    - Avoid trendy or informal expressions in technical documentation

### Grammar Rules

Follow these specific grammar rules for consistency and clarity:

1. **Add articles where needed**
   - Use "a", "an", "the" appropriately
   - ✅ "Import the initializer"
   - ❌ "Import initializer"

2. **Avoid possessives for objects** - Use "in/of" constructions instead
   - ✅ "The styles in the Cart"
   - ❌ "The Cart's styles"
   - ✅ "The initializer for the drop-in"
   - ❌ "The drop-in's initializer"

3. **Never use Latin abbreviations** - Write out the English equivalent
   - ✅ "for example" not ❌ "e.g."
   - ✅ "and so on" not ❌ "etc."
   - ✅ "that is" not ❌ "i.e."

4. **Omit needless words** (Strunk & White)
   - Make every word tell
   - Remove redundant phrases
   - ✅ "Configure the endpoint"
   - ❌ "You can configure the endpoint"

5. **Use parallel construction**
   - Keep list items in the same grammatical form
   - All bullet points should follow the same structure

6. **Always end complete sentences in lists with periods**
   - ALWAYS end ordered and unordered list items with periods if they are complete sentences
   - Fragments do not need periods
   - ✅ "The boilerplate includes all drop-in packages." (complete sentence with period)
   - ✅ "All drop-in packages" (fragment, no period)
   - ❌ "The boilerplate includes all drop-in packages" (missing period on complete sentence)
   - Be consistent within each list - all complete sentences or all fragments
   - This applies to ALL lists: bulleted, numbered, nested, and lists within Steps components

7. **No bold text after H3 headings** - Use H4 headings instead
   - Use proper heading hierarchy for structure
   - ✅ `#### Configuration options` (H4 heading)
   - ❌ `**Configuration options**` (bold text after H3)
   - This ensures proper document outline and accessibility

8. **Use Steps component for ordered lists** - Always use the Steps component for step-by-step instructions
   - Import from `@astrojs/starlight/components`
   - ✅ `<Steps>` wrapping numbered list items (proper component)
   - ❌ Standard markdown without Steps component (less visually distinct)
   - Steps component provides enhanced styling and visual hierarchy
   - **Always use `1.` for every list item** - Markdown automatically numbers them sequentially
   - Example:
     ```jsx
     import { Steps } from '@astrojs/starlight/components';
     
     <Steps>
     
     1. First step description
     1. Second step description
     1. Third step description
     
     </Steps>
     ```

## File Conventions

### Naming Standards

- **Use kebab-case** for file and folder names: `checkout-configuration.mdx`
- **Be descriptive** but concise: `add-payment-method.mdx` not `payment.mdx`
- **Match URL structure** to file structure where possible

### Product Terminology

Use the correct Adobe product terminology consistently throughout all documentation:

- ✅ **Adobe Commerce boilerplate** - The official name for the boilerplate
- ✅ **Edge Delivery Services + Adobe Commerce Boilerplate** - The full official name (from the repository)
- ❌ ~~AEM Commerce boilerplate~~ - Incorrect; never use this term
- ℹ️  The repository is named `aem-boilerplate-commerce`, but the product name is "Adobe Commerce boilerplate"

**Terminology Progression Within a Page:**

Use natural shorthand after introducing the full term:
1. **First mention**: "Adobe Commerce boilerplate" or "Edge Delivery Services + Adobe Commerce Boilerplate"
2. **Second mention**: "Commerce boilerplate" (shorthand)
3. **Subsequent mentions**: "boilerplate"

Example:
> The **Adobe Commerce boilerplate** provides a complete foundation... Why use the Commerce boilerplate? The boilerplate eliminates complexity by...

**Shortening "Adobe Commerce" Within Sections:**

After introducing "Adobe Commerce" in a section, subsequent mentions within that section should use "Commerce" as shorthand:

- ✅ "The **Adobe Commerce boilerplate** applies to building Commerce storefronts..." (second mention shortened)
- ✅ "Adobe Commerce provides... Commerce also supports..." (subsequent mentions shortened)
- ❌ "The Adobe Commerce boilerplate applies to Adobe Commerce storefronts..." (repetitive, should shorten second mention)

This rule applies within the scope of a section (between H2/H3 headings) to avoid repetition and improve readability.

This terminology applies to:
- Page titles and descriptions
- Body content and examples
- Code comments and documentation
- All references to the boilerplate project

### Frontmatter Requirements

Every `.mdx` file should include frontmatter with at minimum:

```yaml
---
title: Page Title (used in navigation and SEO)
description: Brief description of the page content (used for SEO)
---
```

### Optional Frontmatter

```yaml
---
title: Advanced Cart Configuration
description: Learn how to configure cart settings for your storefront
tableOfContents: true          # Show/hide table of contents
prerequisites:                 # List of prerequisites
  html: true
  css: false
  js: true
  commerce: true
time: "15 minutes"            # Estimated reading/completion time
---
```

## Markdown & Components

### Basic Markdown

Standard Markdown is supported, plus MDX extensions for interactive components.

**Important:** Always use the Steps component for all ordered lists.

**Headings:**
```markdown
# Page Title (H1 - used once per page)
## Major Sections (H2)
### Subsections (H3)
#### Minor Sections (H4)
```

**Important:** Always use H4 headings for subsections under H3. Never use bold text as a substitute for headings.
- ✅ `#### Configuration options` (correct - H4 heading)
- ❌ `**Configuration options**` (incorrect - bold text)
- Proper heading hierarchy ensures accessibility and proper document structure

**Code Blocks:**
````markdown
```javascript
// Always specify the language for syntax highlighting
function initializeCart() {
  // Include comments to explain complex logic
  return new Cart();
}
```
````

**Links:**

**Internal Links** (within the documentation site):
```markdown
[Internal Link](/get-started/create-storefront/)
```

**External Links** (REQUIRED - use Link component for ALL external links):

All external links (to websites outside this documentation) MUST use the Link component:
```jsx
import Link from '@components/Link.astro';

<Link href="https://example.com" text="External Link" />
```

**Why this is required:**
- Automatically adds an external link icon for visual consistency
- Opens in a new tab to preserve user's place in documentation
- Provides consistent styling across all external links
- Makes it clear to users when they're leaving the documentation

**Examples of external links that require the Link component:**
- GitHub repositories and files
- NPM packages
- External documentation sites (aem.live, da.live, etc.)
- API documentation
- Any URL starting with `http://` or `https://` that's not this documentation

### Available Components

Import and use these components for enhanced documentation:

#### LinkCard Component
```jsx
import LinkCard from '@components/LinkCard.astro';

<LinkCard
  title="Card Title"
  description="Brief description of what this links to"
  link="/path/to/page/"
  icon="seti:json"
/>
```

#### CardGrid for Multiple Cards
```jsx
import { CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <LinkCard ... />
  <LinkCard ... />
</CardGrid>
```

#### Code Examples with Language
```jsx
import { Code } from '@astrojs/starlight/components';

<Code code={`
// Your code example here
function example() {
  return 'hello world';
}
`} lang="js" title="example.js" />
```

#### Callouts and Alerts
```jsx
import { Aside } from '@astrojs/starlight/components';

<Aside type="tip" title="Pro Tip">
This is a helpful tip for users.
</Aside>

<Aside type="caution">
This is something users should be careful about.
</Aside>
```

### Component Usage Guidelines

1. **Use components consistently** across similar content types
2. **Don't overuse callouts** - reserve for truly important information
3. **Test components** in the browser to ensure they render correctly
4. **Keep accessibility in mind** - use proper alt text for images, meaningful link text

### Tables

**Standard Table Format:** All tables should use the TableWrapper component with consistent formatting.

**Required Pattern:**
1. Import TableWrapper component at the top of your file
2. Wrap markdown tables in `<TableWrapper nowrap={[0]}>`
3. Make first column items into links to relevant reference pages
4. Use standard markdown table syntax inside the wrapper

**Example:**
```jsx
import TableWrapper from '@components/TableWrapper.astro';

<TableWrapper nowrap={[0]}>

| Component | Description |
|-----------|-------------|
| [Cart](/dropins/cart/) | Shopping cart functionality |
| [Checkout](/dropins/checkout/) | Complete checkout flow |

</TableWrapper>
```

**Benefits:**
- `nowrap={[0]}` prevents the first column from wrapping, keeping names clean
- First column links provide quick navigation to detailed documentation
- Consistent formatting across all documentation
- Responsive table behavior on mobile devices

**When to Use Tables:**
- Comparing features or options
- Listing components with descriptions
- Directory or file structure references
- Configuration option references

## Assets & Media

### Images

**Location:** Store images in `/public/images/` with organized subdirectories:
```
/public/images/
├── dropins/
│   ├── cart/
│   └── checkout/
├── sdk/
└── setup/
```

**Usage in Markdown:**
```markdown
![Alt text describing the image](/images/dropins/cart/example-screenshot.png)
```

**Guidelines:**
- Use descriptive alt text for accessibility
- Optimize images for web (prefer WebP format)
- Include both light and dark mode versions when possible
- Keep file sizes reasonable (< 1MB for screenshots)

### Screenshots

**Best Practices:**
- Capture at 2x resolution for crisp display
- Include browser chrome when showing UI interactions
- Highlight important areas with arrows or borders
- Use consistent browser/OS for visual consistency
- Update screenshots when UI changes

### Code Samples

**File Organization:**
- Store longer code examples in `/src/content/docs/[section]/files/`
- Use the `CodeInclude` component to embed file contents
- Keep inline code samples short and focused

## Review Process

### Before Submitting

**Self-Review Checklist:**
- [ ] Content is technically accurate and tested
- [ ] All links work and point to correct destinations
- [ ] Code examples run without errors
- [ ] Screenshots are current and properly cropped
- [ ] Spelling and grammar checked
- [ ] Frontmatter is complete and correct
- [ ] Navigation updates made if adding new pages

### Pull Request Guidelines

**PR Title Format:**
```
docs: Add checkout payment method tutorial
docs: Update cart configuration reference
docs: Fix broken links in SDK guide
```

**PR Description Should Include:**
- Summary of changes made
- Type of content (new tutorial, update, fix)
- Any navigation or structural changes
- Screenshots of new content (if applicable)
- Testing notes or special considerations

### Review Types

1. **Technical Review:** Accuracy of code, processes, and technical details
2. **Editorial Review:** Language, clarity, consistency with style guide
3. **Accessibility Review:** Alt text, heading structure, inclusive language

## Publishing Workflow

### Development Process

1. **Create a feature branch**
   ```bash
   git checkout -b docs/add-payment-tutorial
   ```

2. **Make your changes**
   - Write/edit content
   - Test locally
   - Update navigation if needed

3. **Test thoroughly**
   ```bash
   pnpm dev          # Test in development
   pnpm build        # Test production build
   pnpm preview      # Test production preview
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "docs: Add payment method integration tutorial"
   git push origin docs/add-payment-tutorial
   ```

5. **Create pull request**
   - Include comprehensive description
   - Add reviewers
   - Address feedback promptly

### Deployment

- **Staging:** Automatic deployment on PR creation
- **Production:** Automatic deployment after PR merge to main branch
- **Rollback:** Contact DevOps team if issues arise

### B2B Merchant Block Documentation Workflow

The B2B merchant block documentation follows a specialized workflow to ensure clean, reviewable PRs for each B2B dropin team.

**Branch Structure:**
- **`releases/b2b-nov-release`**: Base branch for infrastructure changes
- **Feature branches**: One per B2B dropin for generated files
  - `feature/merchant-blocks-company-management`
  - `feature/merchant-blocks-purchase-order`
  - `feature/merchant-blocks-quote-management`
  - `feature/merchant-blocks-requisition-list`
  - `feature/merchant-blocks-checkout-account`
- **`b2b-documentation`**: Preview branch combining all changes

**Three-Step Workflow:**

**Step 1: Infrastructure → `releases/b2b-nov-release`**
1. Commit infrastructure changes directly to `releases/b2b-nov-release`
2. Infrastructure includes:
   - Generator scripts (`scripts/@generate-*.js`)
   - Enrichment files (`_dropin-enrichments/merchant-blocks/*.json`)
   - Package configuration (`package.json`)
   - Sidebar configuration (`astro.config.mjs` - B2C blocks only, no B2B section)
3. Push to GitHub

**Important:** Feature branches do NOT receive infrastructure updates via merge. They remain independent with only their generated files.

**Step 2: Generated Files → Feature Branches**
1. Generate or update merchant block MDX files
2. Commit files to their appropriate feature branch (one branch per dropin)
3. Each feature branch includes:
   - Only the merchant block files for that specific dropin
   - Its own "B2B commerce blocks" section in `astro.config.mjs`
4. Push each feature branch to GitHub

**Step 3: Everything → `b2b-documentation`**
1. Merge all feature branches into `b2b-documentation`
2. This creates a complete preview with:
   - All infrastructure from `releases/b2b-nov-release`
   - All B2B merchant blocks from all feature branches
3. Purpose: Test the complete B2B documentation before creating PRs

**Example Commands:**
```bash
# Step 1: Infrastructure
git checkout releases/b2b-nov-release
git add scripts/_dropin-enrichments/merchant-blocks/
git commit -m "Update merchant block generator infrastructure"
git push origin releases/b2b-nov-release

# Step 2: Generated files for one dropin
git checkout feature/merchant-blocks-company-management
# Generate or manually update merchant block files
git add src/content/docs/merchants/blocks/commerce-company-*.mdx
git commit -m "Update company management merchant blocks"
git push origin feature/merchant-blocks-company-management

# Step 3: Preview
git checkout b2b-documentation
git merge feature/merchant-blocks-company-management --no-edit
git merge feature/merchant-blocks-purchase-order --no-edit
# ... merge other feature branches
git push origin b2b-documentation
```

**Why This Workflow?**
- **Clean PRs**: Each B2B dropin team reviews only their specific files
- **Independent Development**: Teams can work on their blocks without merge conflicts
- **Infrastructure Separation**: Generator updates don't clutter feature branch PRs
- **Complete Preview**: `b2b-documentation` shows the final integrated result

**When to Use:**
- Use this workflow when working on B2B merchant block documentation
- For B2C merchant blocks, commit directly to `develop` branch
- For developer dropin docs, use the standard development workflow

## Common Tasks

### Adding a New Tutorial

1. **Choose the right location** (e.g., `/src/content/docs/dropins/cart/tutorials/`)
2. **Create the file** with descriptive name
3. **Add required frontmatter**
4. **Write the tutorial** following the tutorial structure
5. **Update navigation** in `astro.config.mjs` if needed
6. **Test locally** and create PR

### Updating Existing Content

1. **Create feature branch** for your changes
2. **Update the content** while preserving existing structure
3. **Check for broken links** or outdated information
4. **Test all code examples** still work
5. **Update screenshots** if UI has changed
6. **Submit PR** with clear description of changes

### Adding New Component Documentation

1. **Create component page** in `/src/content/docs/sdk/components/`
2. **Follow reference documentation structure**
3. **Include interactive examples** when possible
4. **Add to navigation** in the SDK Components section
5. **Link from overview page** if appropriate

## Working with Generated Documentation

### Critical Principle: Always Update Generators

**IMPORTANT:** Most documentation in this project is auto-generated from scripts. When you edit generated documentation files, you MUST also update the corresponding generator scripts, or your changes will be overwritten the next time the generator runs.

### Understanding the Generation System

This project uses a sophisticated documentation generation system:

```
Documentation Sources:
├── scripts/                     # Generator scripts
│   ├── @generate-styles-docs.js
│   ├── @generate-overview-docs.js
│   ├── @generate-function-docs.js
│   ├── @generate-event-docs.js
│   ├── @generate-container-docs.js
│   ├── @generate-slot-docs.js
│   ├── @generate-dictionary-docs.js
│   ├── @generate-initialization-docs.js
│   └── @generate-quick-start-docs.js
├── _dropin-templates/           # MDX templates
│   ├── dropin-styles.mdx
│   ├── dropin-overview-minimal.mdx
│   └── ...
└── _dropin-enrichments/         # Human-written context
    ├── cart/
    │   ├── overview.json
    │   ├── containers.json
    │   ├── functions.json
    │   └── events.json
    └── ...
```

### The Generator + Files Workflow

When making changes to generated documentation, follow this systematic workflow:

**1. Find and fix the existing files** (manual edits)
- Edit the MDX files in `src/content/docs/`
- Test your changes locally

**2. Identify which generator produces those files**
- Check the file type to determine the generator:
  - `styles.mdx` → `@generate-styles-docs.js`
  - `index.mdx` (overview) → `@generate-overview-docs.js`
  - `functions.mdx` → `@generate-function-docs.js`
  - `events.mdx` → `@generate-event-docs.js`
  - `containers/*.mdx` → `@generate-container-docs.js`
  - `slots.mdx` → `@generate-slot-docs.js`
  - `dictionary.mdx` → `@generate-dictionary-docs.js`
  - `initialization.mdx` → `@generate-initialization-docs.js`
  - `quick-start.mdx` → `@generate-quick-start-docs.js`

**3. Update the generator to prevent regression**
- Open the corresponding generator script
- Update the code generation logic
- Test the generator locally

**4. Update templates if they exist**
- Check `_dropin-templates/` for relevant templates
- Update template structure or placeholders
- Ensure consistency across all generated files

**5. Update enrichment files if needed**
- Check `_dropin-enrichments/[dropin-name]/`
- Add or update human-written descriptions
- Enrichment files are the source of truth for editorial content

**6. Document both manual and generator changes**
- Explain what was changed in both places
- Provide context for why both were updated
- Include testing notes for regeneration

### Example: Updating External Links

**Incorrect approach** (only fixes files):
```bash
# ❌ Only fixes existing files
# Changes will be lost when generator runs again
```

**Correct approach** (fixes files AND generator):
```bash
# ✅ Fix existing files manually
# ✅ Update generator script
# ✅ Update template if exists
# ✅ Test regeneration
# ✅ Document both changes
```

### Testing Generators

After updating a generator, always test it:

```bash
# Test single drop-in regeneration
npm run generate-styles-docs cart

# Test B2B drop-in generation
npm run generate-b2b-docs

# Test all documentation generation
npm run generate-all-docs
```

**Verify:**
- Generated files include your changes
- No manual edits were lost
- Templates are applied correctly
- Enrichment data is preserved

### Common Generator Patterns

**Adding imports to generated files:**
```javascript
// In generator script
content = `import Component from '@components/Component.astro';\n` + content;
```

**Using Link component for external links:**
```javascript
// ✅ Correct - use Link component
output += `<Link href="${url}" text="${linkText}" />`;

// ❌ Incorrect - markdown link
output += `[${linkText}](${url})`;
```

**Respecting enrichment data:**
```javascript
// Always prefer enrichment over generated content
const description = enrichmentData?.description || generatedDescription;
```

### Generator File Mapping

| File Type | Generator Script | Template | Enrichment |
|-----------|-----------------|----------|------------|
| `styles.mdx` | `@generate-styles-docs.js` | `dropin-styles.mdx` | None |
| `index.mdx` | `@generate-overview-docs.js` | `dropin-overview-minimal.mdx` | `overview.json` |
| `functions.mdx` | `@generate-function-docs.js` | `dropin-functions.mdx` | `functions.json` |
| `events.mdx` | `@generate-event-docs.js` | `dropin-events.mdx` | `events.json` |
| `containers/*.mdx` | `@generate-container-docs.js` | `dropin-container.mdx` | `containers.json` |
| `slots.mdx` | `@generate-slot-docs.js` | `dropin-slots.mdx` | None |
| `dictionary.mdx` | `@generate-dictionary-docs.js` | `dropin-dictionary.mdx` | None |

### When to Update Generators vs Files

**Update generators when:**
- The change applies to all drop-ins (structural, formatting)
- Adding new components (imports, TableWrapper, Link, etc.)
- Changing code generation patterns
- Fixing bugs in generation logic

**Update enrichment files when:**
- Adding human-written descriptions
- Providing usage examples
- Adding contextual information
- Documenting parameters or configuration

**Update both when:**
- Fixing existing files AND preventing future issues
- Changing external link patterns
- Updating table formats
- Modifying component usage

### Red Flags

Watch for these signs you might need to update a generator:

🚩 You're making the same edit across multiple files
🚩 You're changing structural elements (tables, headings, imports)
🚩 You're adding components (Link, TableWrapper, Aside)
🚩 You're fixing formatting or layout issues
🚩 You're updating patterns that appear in all docs

### Regeneration Safety

**Before regenerating:**
- ✅ Commit all manual changes to git
- ✅ Verify generator updates are complete
- ✅ Test generator on a single file first
- ✅ Review diffs before committing

**After regenerating:**
- ✅ Check that manual edits are preserved (if in enrichment files)
- ✅ Verify new patterns are applied consistently
- ✅ Test the site builds successfully
- ✅ Review all changed files in git diff

## Getting Help

### Documentation Team

- **Technical Writer:** [Name] - Content strategy, editorial review
- **Developer Advocate:** [Name] - Technical accuracy, developer experience
- **UX Writer:** [Name] - User experience, interface copy

### Communication Channels

- **Slack:** #docs-team (daily questions and updates)
- **GitHub:** Use issues for bug reports and feature requests
- **Weekly Meeting:** Tuesdays 2PM PT - planning and review
- **Office Hours:** Fridays 1-2PM PT - open Q&A

### Resources

- **Style Guide:** [Internal link to style guide]
- **Brand Guidelines:** [Link to brand assets and guidelines]
- **Component Library:** [Link to Storybook or component docs]
- **Content Calendar:** [Link to editorial calendar]

### FAQ

**Q: How do I know if my content needs a technical review?**
A: Any content with code examples, API references, or configuration instructions should have a technical review.

**Q: Can I use AI tools to help write documentation?**
A: AI tools can help with drafting and editing, but all content must be human-reviewed for accuracy and brand consistency.

**Q: How often should we update existing documentation?**
A: Review and update documentation whenever the underlying features change, or at minimum quarterly.

**Q: What if I find outdated or incorrect documentation?**
A: Create a GitHub issue or submit a quick PR to fix it. Don't let broken docs persist.

---

## Quick Reference

### Essential Commands
```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm preview       # Preview production build
pnpm lint          # Check for linting errors
```

### File Templates
- **Tutorial:** [Link to tutorial template]
- **Reference:** [Link to reference template]
- **Overview:** [Link to overview template]

### Contact Information
For questions about this guide or documentation processes, contact:
- Email: docs-team@company.com
- Slack: #docs-team

---

*Last updated: [Current Date]*
*Version: 1.0*
