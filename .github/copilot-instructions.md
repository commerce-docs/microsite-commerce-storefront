# Adobe Commerce storefront documentation

This is an Astro/Starlight documentation repository. Documentation pages live in `src/content/docs/**/*.mdx`. Write for a beginning developer who is new to Commerce storefronts, front-end projects, and Adobe tooling.

## Working principles

- Make the smallest focused change that satisfies the request. Preserve unrelated user changes and existing public APIs.
- Read `CONTRIBUTING.md` and the nearest relevant page, component, template, or source file before editing.
- Keep a topic focused on one reader goal. Do not add speculative solutions to unresolved product or platform behavior.
- Use `storefront` rather than `boilerplate` in merchant-facing content.
- The storefront boilerplate includes standard drop-ins and wires them through its blocks, subject to backend compatibility and licensing. Document customization beyond these defaults; do not add installation steps for components already included.
- For substantial documentation work, use `.github/skills/write-edit-docs/SKILL.md` to coordinate the editorial stages and validation.

## Beginner audience and plain language

- Write for a beginning developer. Prefer simple words, short connected sentences, and one idea per sentence.
- Define unfamiliar terms and spell out acronyms on first use. Keep product terms such as drop-in and Adobe Commerce consistent.
- Explain why a procedure matters before giving steps. Give each step one action, name the file for each code block, include required imports, and explain every placeholder.
- After non-trivial code, explain the important lines briefly. Show what success looks like and address the most likely error.
- Start tutorials and how-to pages with the concrete result the reader will have. Do not begin with a warning or a description of the page structure.
- Apply these rules to tutorials, references, overviews, diagrams, release notes, and review comments. For the detailed checklist, see `.github/skills/beginner-audience-plain-language/SKILL.md`.

## Verify documentation claims

- Do not invent checklist items or operational requirements. Before adding or changing a factual claim, record the exact live source URL and supporting passage or implementation lines in the review evidence. A plausible recommendation, a link, or a previous AI audit is not verification.
- Preserve the source's product, deployment, version, and applicability scope. Do not turn a scoped recommendation into a universal Adobe requirement.
- Keep unresolved claims out of published requirements. Report missing evidence to the user; do not replace an unsupported claim with an invented "confirm with Adobe" task.
- Never claim a fetch, edit, audit count, or validation command succeeded unless its actual tool result establishes that outcome. Distinguish documentation/build checks from merchant implementation certification.
- Verify API signatures, props, events, file paths, and behavior against live stable source listed in `.cursor/data/code-sources.json`. Follow `.claude/skills/source-repos/SKILL.md`; do not rely on README text or assumptions.
- Verify published product or concept claims against a deep link from `.cursor/data/documentation-sources.json`. Do not invent supporting URLs.
- For a full documentation fact check, use `.github/skills/verify-storefront-docs/SKILL.md` before editing factual claims.
- When source or product behavior is unresolved, state the limitation and scope instead of presenting a workaround as an established solution.
- For changed documentation, run a focused check first. The production validation command is `pnpm build:prod-fast`; confirm that it reports `All internal links are valid.`

## MDX conventions

- Follow `.github/skills/writing/SKILL.md`, `.claude/skills/markup/SKILL.md`, and `.claude/skills/commerce-storefront-docs/SKILL.md` for documentation edits.
- Include `title` and `description` frontmatter. Do not add an H1 in the body.
- Use `<Link href="..." text="..." />` for external URLs and Markdown links for internal documentation links.
- Wrap Markdown tables in `<TableWrapper>`, use `<Steps>` for procedures, and use `<Aside type="note|tip|caution|danger">` for callouts. Import every MDX component used.
- Use fenced code blocks with language tags. Use Starlight `<Code>` when a longer example needs a filename or title.
- Use sentence case, plain language, and defined terms. Keep examples self-contained and use real APIs and values verified from source.

## Product terminology

- Spell out `Adobe Commerce as a Cloud Service` and `Adobe Commerce Optimizer`; do not abbreviate them as `ACCS` or `ACO`. Both differ from `Adobe Commerce on Cloud`, the platform-as-a-service (PaaS) offering.
- Use the repository's existing terminology and navigation patterns before introducing new names or structures.

## Change review

When reviewing documentation, report accuracy, broken links, behavioral risks, terminology problems, and missing validation before summarizing the change. Scope editorial passes to changed Markdown and MDX files:

```bash
git diff --name-only release...HEAD -- '*.md' '*.mdx'
git diff --name-only HEAD -- '*.md' '*.mdx'
```
