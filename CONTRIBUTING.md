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

## File Conventions

### Naming Standards

- **Use kebab-case** for file and folder names: `checkout-configuration.mdx`
- **Be descriptive** but concise: `add-payment-method.mdx` not `payment.mdx`
- **Match URL structure** to file structure where possible

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

**Headings:**
```markdown
# Page Title (H1 - used once per page)
## Major Sections (H2)
### Subsections (H3)
#### Minor Sections (H4)
```

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
```markdown
[Internal Link](/get-started/create-storefront/)
[External Link](https://example.com)
```

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
