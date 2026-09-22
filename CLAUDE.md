# Storefront documentation — project memory

Adobe Commerce storefront docs repo (Starlight). Docs live in `src/content/docs/**/*.mdx`. Default reader: a **beginning developer** new to Commerce storefronts, front-end projects, and Adobe tooling.

## Writing docs

On any `.md`/`.mdx` doc, apply two skills (they auto-load on those files, or invoke with `/<name>`). They own separate, non-conflicting domains:

- `writing` — prose and language conventions.
- `markup` — MDX/Starlight formatting.

## Branch-scoped editorial pass

Scope a pass to files changed on the current branch. Union and dedupe both lists, skip deleted paths; if empty, report and stop.

```bash
git diff --name-only release...HEAD -- '*.md' '*.mdx'   # committed
git diff --name-only HEAD -- '*.md' '*.mdx'             # uncommitted
```

## Repo conventions

- Use `storefront` (not `boilerplate`) in merchant-facing content.
- Standard drop-ins (cart, checkout, PDP, mini cart, …) ship installed and wired up. Write steps only for customization beyond the default, not for installing what exists.
- External links use `<Link href="…" text="…" />`; notes use `<Aside type="note">` / `<Aside type="tip">`.
- Never abbreviate `Adobe Commerce as a Cloud Service` or `Adobe Commerce Optimizer` to `ACCS` / `ACO` — spell them out every time. Both differ from `Adobe Commerce on Cloud` (the PaaS offering).
- Starlight and contribution conventions: see `CONTRIBUTING.md`.

## Migration status

Skills and rules are migrating from `.cursor/` to `.claude/` (see `.claude/skills/CONVERSION-NOTES.md`). Commit `.claude/` so the team shares them; `.cursor/` is gitignored here.
