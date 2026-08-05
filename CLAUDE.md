# Storefront documentation — project memory

Adobe Commerce storefront docs repo (Starlight). Docs live in `src/content/docs/**/*.mdx`.
The default reader is a **beginning developer** new to Commerce storefronts, front-end
projects, and Adobe tooling.

## Writing docs

When writing or editing any doc, apply these two skills (they load automatically on
`.md`/`.mdx` files, or invoke with `/<name>`):

- `writing` — prose: audience, plain language, voice, tone, sentences, procedures,
  lists, headings content, grammar, inclusive language, product names.
- `markup` — format: Starlight/MDX components, code fences, heading markup,
  frontmatter, anchor IDs, bold/italic, screenshots.

The two skills cover different domains and do not conflict.

## Branch-scoped editorial pass

To scope a `writing` or `markup` pass to files changed on the current branch:

```bash
BASE=release
git diff --name-only "${BASE}"...HEAD -- '*.md' '*.mdx'
```

Include uncommitted changes:

```bash
git diff --name-only HEAD -- '*.md' '*.mdx'
```

Union and dedupe both lists. Skip deleted paths. If the list is empty, report that and stop.

## Repo conventions

- Use `storefront` (not `boilerplate`) in merchant-facing content.
- The boilerplate ships standard drop-ins (cart, checkout, PDP, mini cart, …)
  already installed and wired up. Write steps only for customization or features
  beyond the default — not for installing what already exists.
- MDX components: external links use `<Link href="…" text="…" />`; notes use
  `<Aside type="note">` / `<Aside type="tip">`.
- Never abbreviate `Adobe Commerce as a Cloud Service` or `Adobe Commerce Optimizer`
  to `ACCS` / `ACO`; spell them out at every mention. These differ from
  `Adobe Commerce on Cloud` (the PaaS offering).
- For Starlight and contribution conventions, see `CONTRIBUTING.md`.

## Migration status

These skills and rules are being migrated from `.cursor/` to `.claude/`. Conversion
conventions and remaining work are tracked in `.claude/skills/CONVERSION-NOTES.md`.
Commit `.claude/` to source control so the team shares the same skills and rules
(unlike `.cursor/`, which this repo gitignores).
