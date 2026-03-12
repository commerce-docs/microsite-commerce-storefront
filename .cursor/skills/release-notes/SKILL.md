---
name: release-notes
description: Generate release notes and changelog from code commits between tagged versions. Use the previous release as a structural template only; scan commits in boilerplate, drop-ins, SDK, tools, and SCP between previous and new tags; summarize external public-facing changes. Use when the user asks to update release notes, add a new release suite, or create changelog entries. Requires gh auth for private repos.
---

# Release notes skill

Generates release note and changelog content by scanning **code commits** (not documentation) between **tagged versions** for each relevant repo (boilerplate, drop-ins, SDK, tools, SCP). Uses the **previous release** as a **structural template only**; never edit the previous release's section. Focus on **external, public-facing changes**; ignore internal or refactor-only changes.

## Authentication (required for private repos)

All source repos except some B2B drop-ins are private. You must authenticate before cloning or reading from GitHub.

1. **Use GitHub CLI:** Run `gh auth login` and complete the flow (browser or token). Use default host `github.com` unless the org uses a different host.
2. **When to run:** Before any step that clones, pulls, or uses `gh api` / `gh release` against the repos in [repos.json](repos.json). If the user has not run `gh auth login` recently, remind them to run it and retry.
3. **Do not store tokens or passwords** in this skill or in the repo. The skill only instructs the user to use `gh auth login`.

## Source repositories

Repo list: **[repos.json](repos.json)** (canonical for scripting; use `repos.repos` array). Human-readable summary: [repos.md](repos.md).

- **Local clones:** `.temp-repos/<folder>` (for example `.temp-repos/boilerplate`, `.temp-repos/StorefrontSDK`, `.temp-repos/cart`). Match `folder` from repos.json.
- **For gh/scripts:** Use `orgRepo` (for example `adobe-commerce/StorefrontSDK`) for `gh release list --repo <orgRepo>`, `gh pr list --repo <orgRepo>`, `git log` between tags. Use `url` for clone or API when needed.
- **Tags:** Use GitHub tags to define version ranges, for example [StorefrontSDK tags](https://github.com/adobe-commerce/StorefrontSDK/tags). Each drop-in, SDK, tools, and boilerplate (when tagged) has tags for versions; use the **previous release's tag** and the **new release's tag** to scope commits.

## User-supplied comparison URLs (preferred when provided)

The user may supply **exact code comparison URLs** that define which changes to analyze. Use these as the primary source when provided. **You do not need to supply a comparison URL for every repo.**

- **When the user supplies one or more comparison URLs:** Use the **Files changed** (diff) from each supplied URL. For **repos where no URL was supplied**, derive the comparison: get the **previous** version from the previous release's Component compatibility in `index.mdx`, and the **new** version from the consolidation PRs' package.json; then look up the corresponding refs (tags or branches) in that repo and fetch the diff via GitHub Compare API or `git diff base...head`. Many drop-ins and the SDK use tags that match the package version (for example `v3.0.0`..`v3.1.0`, `v1.6.0`..`v1.7.0`), so the skill can construct the comparison without a URL.
- **When the user supplies no comparison URLs:** Derive version ranges for **all** repos from the previous suite's Component compatibility and the consolidation PRs' package.json; then for each repo, resolve tags and fetch the compare/diff. **Boilerplate** often uses suite-named refs (for example `january-2026`, `b2c-february-2026`) that are not in package.json—if no boilerplate compare URL is provided, ask the user for the exact base and compare refs, or try common patterns if the repo has those tags.
- **When a comparison cannot be found or derived:** If for any repo you cannot resolve the refs (for example no matching tag, ambiguous version, or Compare API fails), **tell the user** and ask them to supply the comparison URL or the exact base and compare refs manually for that repo. Do not guess or skip the repo silently; list which repos need manual comparison input so the user can provide it.
- **Format (when supplying URLs):** GitHub compare URLs, for example `https://github.com/hlxsites/aem-boilerplate-commerce/compare/january-2026...b2c-february-2026`. One URL may cover only boilerplate B2C; you can supply separate URLs for B2B boilerplate, SDK, drop-ins, or tools. For any repo left without a URL, the skill derives the comparison as above. **Release-branch compares** use branch names instead of tags (for example `https://github.com/adobe-commerce/storefront-wishlist/compare/release/3.1.0...release/3.2.0`). When the user or a PR supplies such a URL, use it as the source of truth; these links often appear in "Release X.Y.Z" or "Cut release" PRs, in the boilerplate consolidation PR body, or in release notes drafts.
- **What to analyze:** Use the **Files changed** view (the diff) for each comparison (supplied or derived). Review the actual **code changes** (additions and deletions in the diff), not only commit messages. Summarize external, public-facing changes into bullets and rich descriptions. Large comparisons can be fetched via GitHub Compare API or `git diff base...head`; focus on customer-facing or API-affecting changes when summarizing.
- **How to use:** Assemble the new release suite and changelog entries using the **template structures** from the previous release (index.mdx and changelog.mdx). Do not edit the previous release; only add the new suite and new changelog entries filled from this analysis.

## Workflow: template + commits between tags

Follow this workflow when adding a new release suite (for example March 2026) and its changelog entries.

### 1. Use the previous release as a structural template only

- **Template:** Use the **most recent** release section in `src/content/docs/releases/index.mdx` (for example February 2026) as the **structural template** for the new release (for example March 2026). Copy only **section order, headings, table layout, and formatting** — do not copy the previous release's content into the new section.
- **Do not edit the previous release.** Never change the existing February (or January, and so on) section when adding March. Only **add** the new suite and new changelog entries.

### 2. Determine version ranges (previous → new) for each component

- **When the user supplies comparison URLs:** Use those URLs as the source of truth for which code to analyze (for example [boilerplate B2C: january-2026...b2c-february-2026](https://github.com/hlxsites/aem-boilerplate-commerce/compare/january-2026...b2c-february-2026)). Analyze the **Files changed** (diff) for each URL and use that to build release notes and changelog. Skip inferring tags if the user has given exact compare links.
- **When no comparison URL is provided:** Proceed as below.
- **New versions:** Get the new release's versions from **package.json (or lockfile)** in the **boilerplate consolidation PRs** for this release (B2C PR → main, B2B PR → b2b). The consolidation PRs pin `@dropins/storefront-*`, `@dropins/tools`, and `@dropins/build-tools`; use those as the **new** tagged versions (or equivalent tags in each repo). See [Primary source: consolidation PRs for versions](#primary-source-consolidation-prs-for-versions) below.
- **Previous versions:** Read the **previous** release suite's **Component compatibility** section in `index.mdx` (for example January 2026) for `@dropins/storefront-*`, `@dropins/tools`, and boilerplate/SCP as applicable. Or use GitHub tags in each repo: for example for StorefrontSDK, previous 1.6 and new 1.7 (from [StorefrontSDK tags](https://github.com/adobe-commerce/StorefrontSDK/tags)); for each drop-in, previous 3.0.0 and new 3.1.0 from that drop-in's tags.
- **Boilerplate:** For the boilerplate repo, use commits between the previous suite's tag or branch point and the new suite's tag or branch point (for example `january-2026` and `b2c-february-2026`, or `b2b-january-2026` and `b2b-february-2026` if the user supplies those). If the user provides a compare URL, use that exact base...head range.

#### Release version and package tags (pre-release suffixes)

- **Release version** (what we document in the changelog and index): Always the **version number without** any suffix. Example: `3.1.0`. This is the "release version" readers see.
- **Packages in code:** The consolidation PR's package.json may list versions **with** a suffix (for example `3.1.0-beta6`, `3.2.0-beta.1`). In the docs we still write the release version **without** the suffix (for example 3.1.0, 3.2.0) per the [Conventions](#conventions) rule to remove `-beta` in release notes.
- **For the comparison diff** in each drop-in/SDK repo:
  - **Previous ref:** The **last stable** (released) version — **no** suffix. Example: `v3.0.0`.
  - **New ref:** The **latest beta** tag in that version line. Example: `v3.0.2-beta.1`, `v3.1.0-beta6`. **Do not** use the highest tag overall (for example do not use `v3.0.2-alpha2` when `v3.0.2-beta.1` exists). List tags for that version line and pick the **latest beta** (for example `v3.0.2-beta.1`); if no beta **tag** exists, try the same version **without** the leading `v` as a branch (for example `3.0.2-beta.1`), since some repos use a branch for the beta rather than a tag; if neither exists, use the highest tag (for example alpha or rc).
- So the compare is **always** `previousStable...latestBetaInNewLine`, for example `v3.0.1...v3.0.2-beta.1` or `v3.0.1...3.0.2-beta.1` (head with or without `v` depending on how the repo names the ref). The content of that diff is what we summarize; we document the release as **3.1.0** (or **3.0.2**) with no suffix.

### 3. Scan code changes (Files changed / diff)

- **When the user supplied comparison URLs:** Use the **Files changed** (diff) from each of those URLs. Fetch the comparison via GitHub Compare API (`GET /repos/{owner}/{repo}/compare/{base}...{head}`) or by opening the URL and reading the diff. Analyze the actual file changes (additions/deletions) and summarize external, public-facing changes. Large diffs (for example 180 files, 7,600+ additions): process in chunks or by directory (for example blocks, scripts, workflows) and focus on customer- or implementer-facing changes when writing bullets.
- **When no comparison URL was provided:** For each component (boilerplate, each drop-in, SDK, tools, SCP), examine **all code commits** between the **previously tagged version** and the **new release's tagged version**. Use `git log previousTag..newTag` (and optionally `git diff`) or `gh api repos/<org>/<repo>/compare/previousTag...newTag` to get commits and changed files; then read commit messages and diffs.
- **Scope:** Ignore documentation-only changes; focus on **actual code changes** in the repo.
- **Focus:** Summarize only **external, public-facing changes** (API changes, new slots, new props, behavior changes visible to implementers or users). Ignore internal refactors, lint fixes, and non-customer-facing changes when writing bullets and descriptions. **Do not include test-only or internal fixes** (for example flaky test fixes, Cypress/E2E tests, test infrastructure, CI test workflows) in the release notes index or changelog.

#### Getting detailed descriptions (compare, changesets, CHANGELOG)

To write **rich, detailed** changelog and release-index descriptions (like the February 2026 entries), extract content from each drop-in, SDK, and related repo as follows. Apply this method for every component that has user-facing or implementer-facing changes so the release notes match the detail level of the previous suite.

1. **GitHub Compare for each repo** — For each component, use the version range from the previous suite and the new suite. **Base (previous):** the last **stable** tag, no suffix (for example `v3.0.0`, `v3.0.1`). **Head (new):** the **latest beta** tag in the new version line (for example `v3.0.2-beta.1`, `v3.1.0-beta6`). **Do not** use the highest tag overall—use the latest **beta** so the compare matches the release. So the compare is for example `v3.0.1...v3.0.2-beta.1` or `v3.0.0...v3.1.0-beta6`; document the release as **3.0.2** or **3.1.0** (no suffix). Open or fetch:
   - **Compare URL:** `https://github.com/<org>/<repo>/compare/<previousStable>...<newRef>`  
     Example: `https://github.com/adobe-commerce/storefront-pdp/compare/v3.0.1...v3.0.2-beta.1`  
   - Use `gh api "repos/<org>/<repo>/compare/<previousStable>...<newRef>"` to get `commits` and `files` (and patch content if needed). Resolve `<newRef>` by listing tags and taking the **latest beta** in that version line (for example `v3.0.2-beta.1`); if no beta tag exists, try the ref **without** the leading `v` (for example `3.0.2-beta.1`) in case the repo uses a branch for the beta; if the compare returns 404, try the other form.

2. **Commits** — From the compare, read commit messages. Filter to **user-facing or implementer-facing** changes (new features, config props, API changes, bug fixes). Ignore chore/ci/docs-only commits. Use merge commit messages (for example "Merge pull request #73 from …") to find the **PR number** in that repo for linking.

3. **PR descriptions (primary source for accuracy)** — For each user-facing PR identified from the compare, **fetch the PR description** and use it as a direct source for changelog and index text. Run `gh pr view <N> --repo <org>/<repo> --json title,body` (or use the GitHub API `GET /repos/{owner}/{repo}/pulls/{pull_number}`) to get `title` and `body`. PR bodies usually contain a **Summary**, **What changed**, **API** or **Usage** section, and **Backward compatibility** notes that are written for reviewers and translate well into benefit-focused bullets. Prefer this over inferring from commit messages alone; it yields more accurate, consistent descriptions. Combine with [Writing rules](#writing-rules) when adapting the text.

4. **Changeset files** — If the repo uses [Changesets](https://github.com/changesets/changesets), the `.changeset/*.md` files in the diff often contain the **exact human-readable summary** of what changed (for example "Add multistore support …", "Accept an optional `storeCode` config prop …"). Prefer these for accurate, benefit-focused bullets.

5. **CHANGELOG.md** — If the repo has a CHANGELOG (or similar) in the compare range, read the new version’s section. It usually lists Minor/Patch changes in a form you can adapt for the storefront changelog and index.

6. **Source diff** — For the actual behavior, read the **code diff** of relevant files (for example `src/` or `api/`), not just workflows or config. Focus on new props, storage/API behavior, and backward compatibility (for example "single-store and 'default' continue using unscoped keys"). Turn that into short, benefit-focused bullets with **links to the drop-in (or SDK) repo PR**, not only the boilerplate PR.

7. **Boilerplate PRs** — For integration steps (for example "boilerplate passes storeCode from config into the drop-in"), use the boilerplate PR (for example [#1139](https://github.com/hlxsites/aem-boilerplate-commerce/pull/1139)). In the changelog, **link to both** the drop-in PR (where the feature is implemented) and the boilerplate PR (where it is wired up) when both apply.

**Changelog placement by component ownership (avoid wrong-component bullets):**  
Not every commit in a repo’s compare belongs in **that** component’s changelog entry. A fix may be implemented in repo A because shared code lives there, but the **user story or ticket** is about another component (for example “Wishlist not working in ACO + PaaS”). Use the **PR title and ticket/description** to decide which component **owns** the change. Only add a bullet to the **current** component’s entry when the change is **primarily about that component** (its features, its API, its UX). If the PR/ticket is about another component (for example Wishlist, Cart), do **not** add it to the current component’s entry—add or document it in that other component’s changelog instead. This avoids listing a “Wishlist” fix under Product details page just because the patch landed in the PDP repo.

**Output:** Use the above to write changelog and index text that matches the previous release’s level of detail: clear **bold** subheadings, one or two sentences per bullet explaining what changed and why it matters to implementers or users, and correct PR links to the repo where each change lives. **Using PR descriptions (step 3) as a primary source improves accuracy** because they often already contain summaries, API notes, and backward-compatibility wording that fit release notes.

### 4. Create changelog entries from code changes

- **Changelog:** Create **all** changelog entries from the detailed code changes between those tagged versions. **Do not add only a single Boilerplate entry.** Add one `<ChangelogEntry>` for **Boilerplate** and one for **each drop-in and supporting area that had changes** in the release (see [Changelog components list](#changelog-components-list) below). **Evaluate importance first:** Only add an entry when the component has **user-facing or implementer-facing changes** (new APIs, slots, props, behavior, bug fixes that affect users). **Do not** add an entry when the only change is version alignment or dependency updates with no such impact; omit the entry and in the index use "No user-facing changes in this release" for that component. **Component ownership:** When pulling commits from a repo compare, include in that component’s entry only changes that are **primarily about that component**; use PR title and ticket to decide. If a commit/PR is about another component (for example “Wishlist not working”), do not add it to the current component’s entry—see [Changelog placement by component ownership](#changelog-placement-by-component-ownership-avoid-wrong-component-bullets).
- **Placement:** Insert each entry at the **top of its component section** in `changelog.mdx` (right after the section comment, for example `**Cart**`); do **not** add a single block of all new entries at the top of the file. Use the existing structure of `changelog.mdx` (date, title, components, markdown body with intro sentence, **bold** subheadings/bullets, and PR links). Match the `components` prop to the ChangelogFilter taxonomy so entries are filterable. When writing changelog prose, apply the [Writing rules](#writing-rules).
- **Example:** For product-recommendations drop-in, if the previous release was 3.0.0 and the new release is 3.1.0, examine commits between the 3.0.0 tag and 3.1.0 tag in that repo; summarize into a changelog entry. For SDK 1.6 → 1.7, examine commits between those tags in StorefrontSDK and summarize. For boilerplate B2B, commits between for example `b2b-january-2026` and `b2b-february-2026` (or the equivalent range) get summarized into the Boilerplate changelog entry.
- **Changelog coverage check:** Before finishing, verify that **every component** listed in the new release's index (Updated B2C drop-in components table, Updated B2B drop-in components table), plus **Boilerplate** and **Drop-in SDK** (if that suite had SDK changes), has at least one `<ChangelogEntry>` **only if** that component had user-facing or implementer-facing changes. Components with version-alignment-only or no user-facing changes should **not** get a changelog entry; list them in the index table with "No user-facing changes in this release." See the previous release's changelog (for example February 2026) for the pattern of one entry per component **when there are meaningful changes**. **Also verify:** After adding the new suite's entries, each component section still has **all previous suite entries** (for example February, January) with correct dates; no existing entry should have been removed or given the wrong date.

### 5. Fill the new release suite in the index

- **New suite:** Add a new `## YYYY Month suite` section in `index.mdx` **after** the first `## Release suites` intro and **before** the previous suite (newest first). Use the **structure** of the previous suite (headings, subsections, tables) and **fill** every section with content derived from the commit scans and summaries above. Do not copy-paste the previous suite's prose; write new bullets and descriptions from the code changes. **Writing:** Apply the [Writing rules](#writing-rules) to all index prose (full sentences, no Latin abbreviations, active voice, Elements of Style).
- **Sections to fill:** Intro paragraph, Breaking changes (if any), Highlights, Updated boilerplate, Updated Drop-in SDK, Updated storefront tools (if applicable), Updated drop-in components (table: versions from package.json, Improvements from commit summaries), Updated/New B2B drop-in components, Known issues (manual or "There are no known issues…"), Component compatibility (versions from package.json; Commerce Foundation — **run [SCP version finder](#scp-version-finder-run-when-filling-component-compatibility)** for latest SCP package versions).

## Primary source: consolidation PRs for versions

Use the **boilerplate consolidation PRs** (B2C → main, B2B → b2b) for the **new** release to get the exact versions that define the release:

- **B2C (main):** One PR that merges the suite's B2C changes into `main`. Example: [PR #1096](https://github.com/hlxsites/aem-boilerplate-commerce/pull/1096).
- **B2B (b2b):** One PR that merges the suite's B2B changes into `b2b`. Example: [PR #1107](https://github.com/hlxsites/aem-boilerplate-commerce/pull/1107).

**What to do:**

1. **When the user provides PR links** for the new release (for example "B2C PR #12xx, B2B PR #12yy"), use those PRs: read **package.json (or lockfile)** at the PR merge commit to get `@dropins/storefront-*`, `@dropins/tools`, and `@dropins/build-tools` versions for the new release. Use these versions in the "Updated drop-in components" / "Updated B2B drop-in components" tables and in the "Component compatibility" section.
2. **When the user does not provide links,** find the consolidation PRs via `gh pr list --repo hlxsites/aem-boilerplate-commerce --state merged --base main` and `--base b2b`, or ask the user for the PR numbers.
3. **Version ranges:** Use the **previous** suite's Component compatibility in `index.mdx` for "previous" versions (stable, no suffix), and the consolidation PRs' package.json for "new" versions (which may include `-beta` in the package). For each drop-in/SDK repo, run the **compare** using previous stable tag and **latest beta tag in the new version line** (for example `v3.0.1...v3.0.2-beta.1` or `v3.0.0...v3.1.0-beta6`) to generate bullets and changelog content. Document the release version **without** the suffix (for example 3.0.2, 3.1.0). See [Release version and package tags](#release-version-and-package-tags-pre-release-suffixes).

## Target files

**Isolation:** When adding or updating release note **content** (suite sections, changelog entries), modify **only** these files:

- `src/content/docs/releases/changelog.mdx`
- `src/content/docs/releases/index.mdx`
- `README.md` (release notes instructions for the team)

**Optional scope (index only or changelog only):** When the user asks to update **only the changelog** or **only the index** (for example "regenerate just the March changelog entries" or "update only the release index for March"), run the **same workflow** (template, comparison URLs or derived ranges, scan Files changed, summarize changes) but **write only to the requested file**: only add or edit content in `changelog.mdx`, or only add or edit the new suite in `index.mdx`. Do not modify the other file. Use the same analysis so that if the user later updates the other file, content stays consistent.

Release notes **instructions** for the team live in `README.md` (this repo root). The skill does not edit drop-in index pages, feature status tables, or any other documentation. Do not add or change Feature Status tables on drop-in pages; those are maintained manually.

**Structure and formatting:** Use the **existing** content in `src/content/docs/releases/changelog.mdx` and `src/content/docs/releases/index.mdx` as the reference for **structure only** (section order, heading levels, table format, PR link style, Aside usage). When adding a new release suite, copy that **structure** from the most recent suite and fill with content from the commit-based workflow above. Do not copy the previous suite's wording into the new suite.

**Release suite structure and detail (match previous release):**

- **Breaking changes:** Always include a **Breaking changes** section. When there are breaking changes, use `<Aside type="caution" title="Breaking changes">` with bullet points. When there are **no** breaking changes, still include the section with a single sentence: "There are no breaking changes in this release suite" (in the Aside or as a short paragraph).
- **Updated boilerplate structure:** Use the **same subsection structure** as the previous release. Typical subsections: `#### Infrastructure` (workflow, Sidekick, SDK upgrade), `#### Document Authoring` (when applicable: UE, block definitions, field naming), `#### Fixes and improvements` (block fixes, accessibility, B2B handling). When the release has separate B2C and B2B PRs, group bullets **by theme** under these headings and tag items with (B2C) or (B2B) where helpful, rather than splitting only by PR (for example avoid "#### B2C (PR #N)" and "#### B2B (PR #M)" as the only subsections). This keeps scannability and matches the February-style structure.
- **Updated Drop-in SDK:** Always include the **Updated Drop-in SDK** subsection. When the StorefrontSDK (or equivalent) has changes between tags, list them as bullets with PR links. When there are **no** SDK changes in the release, add one line: "No Drop-in SDK changes in this release suite." so the section still appears and matches the template.
- **Drop-in component table (Improvements column):** Write **benefit/feature-focused** text for implementers and users (for example "New `RowTotalFooter` slot for custom content after item row totals", "`apiErrorMessageOverride` prop; Adobe Commerce Optimizer support"). Do **not** use only technical file or chunk names (for example avoid "Render and CartSummaryList updates"). Describe what's new or what improved from the user/integrator perspective.
- **Highlights:** Use **one bullet per major area** (Cart, Checkout, User Account, Product Details Page, Wishlist, and so on) for consistent tone and scannability. Do not collapse everything into one or two long bullets (for example avoid a single "B2C (Suite7): …" and "B2B (Suite3): …" with many clauses). Split into separate bullets per component or theme, like the February release.
- **Section header alignment:** Before finishing, **check that the new suite’s section headers mirror the previous release.** Use the same `###` and `####` headings in the same order and with the same wording (for example `### Updated boilerplate` with `#### Infrastructure`, `#### Document Authoring`, `#### Fixes and improvements`; `### Updated B2B drop-in components` not "New B2B drop-in (Suite3)"). When the suite includes both B2C and B2B drop-in tables, use **Updated B2C drop-in components** for the B2C table (not "Updated drop-in components") so it mirrors **Updated B2B drop-in components**. If a subsection has no content (for example no Document Authoring changes), include the heading and a one-line note (for example "No Document Authoring changes in this release suite."). Suite identifiers (for example "B2C drop-ins (Suite7)", "B2B drop-ins (Suite3)") in Component compatibility are optional and may be kept for clarity.

**Test files (valid test run):** When creating or updating **test** release files (`test-index.mdx`, `test-changelog.mdx`) in `src/content/docs/releases/` for skill testing, do **not** use any content from the existing release docs for that same release. Derive all test content from consolidation PRs, package.json at merge, and **commits between tags** in each repo. Use existing files only for **structure and formatting**.

### 1. Changelog entries: `src/content/docs/releases/changelog.mdx`

- **Structure:** The changelog is organized **by component**, not by release. There is **one section per component** (Boilerplate, Cart, Checkout, Order, Product details page, Product Discovery, User account, User authentication, Wishlist, Requisition List, and so on). Each section starts with a comment like `{/****** **Cart** ********/}`. **Do not** add a standalone release-level block at the top (for example no "March 2026 – Boilerplate" or "March 2026 – Drop-ins" block above the component sections). The file goes straight from `<div class="changelog-entries">` to the **Boilerplate** component section, then other component sections in order.
- **Within each section:** Entries are listed **newest first** (for example March 2026, then February 2026, then older). Use `<ChangelogEntry date="YYYY-MM-DD" title="..." components={['Boilerplate'|'Cart'|...]}>` with markdown body.
- **Required props (build-breaking):** Every `<ChangelogEntry>` **must** include all three props: `date="YYYY-MM-DD"`, `title="..."`, and `components={[...]}`. The build uses `date.split('-')` in ChangelogEntry.astro; if `date` is missing, the build fails with "Cannot read properties of undefined (reading 'split')". **Never** emit a ChangelogEntry without `date`, `title`, and `components`. Use the correct suite date for each release (for example March 2026 → `2026-03-11`, February 2026 → `2026-02-17`, January 2026 → `2026-01-08`).
- **Preserve existing suite entries:** When adding a new release (for example March 2026), **do not remove, merge, or re-date existing entries** for previous suites (for example February 2026, January 2026). Each suite must remain a separate `<ChangelogEntry>` with its own correct date. If you add only the new suite's entries at the top of each component section, leave all existing entries below them unchanged. Do not merge two suites into one date (for example do not give February content a January date); that effectively removes the February entry from the changelog.
- **Where to add new release entries:** Insert each new release's `<ChangelogEntry>` at the **top of its component section** — that is, right **after** the section comment (for example after `**Cart**`), **before** the current first entry in that section. **Do not** add all new release entries in one block at the top of the file after `<div class="changelog-entries">`. For example: March Cart entry goes at the top of the Cart section; March Boilerplate entry goes at the top of the Boilerplate section; March Checkout at the top of the Checkout section; and so on for every component that had changes.
- **Entry format:** Each entry should have an intro sentence (for example "The Cart drop-in has been updated with the following changes:") and **bold**, benefit-focused bullets. Include PR links `([#N](https://github.com/org/repo/pull/N))` to the drop-in or boilerplate repo when applicable. Match the style of existing entries in that component (for example Cart, Checkout).
- **Components:** Use `components={['Boilerplate']}`, `components={['Cart']}`, and so on. One entry per logical unit (for example one Boilerplate update, one per drop-in or SDK version with notable changes). **Match the `components` prop to the ChangelogFilter taxonomy** used in the changelog page so entries are filterable.
- **Quick Order / new B2B drop-ins:** When there is no separate "Quick Order" section, add the Quick Order entry at the top of the **Requisition List** section and use `components={['Requisition List']}` (or the closest existing component until the filter is updated).

**Changelog components list (ChangelogFilter taxonomy):**  
Use these exact component names for the `components` prop so the filter works. For each release, add a ChangelogEntry for **every** component that had changes (Boilerplate + each changed drop-in/supporting area).

- All components
- Boilerplate
- Cart
- Checkout
- Company Management
- Company Switcher
- Drop-in SDK
- Order
- Payment Services
- Personalization
- Product details page
- Product Discovery
- Product Recommendations
- Purchase Order
- Quote Management
- Requisition List
- Storefront Compatibility Package
- Storefront Compatibility B2B Package
- User account
- User authentication
- Wishlist

(If a new drop-in is added to the release but not yet in the filter—for example Quick Order—add an entry and use the closest existing component or add the new name once the filter is updated.)

### 2. Release index: `src/content/docs/releases/index.mdx`

- **Structure:** One `## YYYY Month suite` per release. Copy **section order and heading level** from the **most recent** suite (for example February 2026). Sections typically include:
  - Short intro paragraph and link to [changelog](/releases/changelog/).
  - `<Aside type="caution" title="Breaking changes">` when applicable (omit if none).
  - **Highlights** (`### Highlights`, bullets from commit summaries).
  - **Updated boilerplate** (`### Updated boilerplate`) with subsections (for example `#### Infrastructure`, `#### Document Authoring`, `#### Fixes and improvements`) — content from boilerplate commits between tags.
  - **Updated Drop-in SDK** — content from StorefrontSDK commits between previous and new SDK tags. Optionally `<Aside type="note" title="Internal Links">` when linking to private StorefrontSDK.
  - **Updated storefront tools** (when applicable) — from storefront-tools commits between tags.
  - **Updated drop-in components** — table **Component** | **Improvements**; when the suite has both B2C and B2B drop-in tables, use **Updated B2C drop-in components** for the B2C table (so it mirrors **Updated B2B drop-in components**). Versions from consolidation PR package.json, Improvement text from each drop-in's commits between tags.
  - **Updated B2B drop-in components** (or **New B2B drop-in components**) — same idea for B2B drop-ins.
  - **Known issues** — manual or "There are no known issues for this release suite."
  - **Component compatibility** — Commerce Foundation tables (manual/release spec), Drop-in SDK bullets and B2C/B2B drop-in lists from package.json in consolidation PRs.
- **Add new suite:** Add the new `## YYYY Month suite` **after** the first `## Release suites` intro and **before** the previous suite. **Fill** every section with content derived from the workflow (commits between tags); do not copy the previous suite's content.

**Source coverage (where to get content for each section):**

| Section | Primary source | Notes |
|---------|----------------|--------|
| Intro paragraph | Release theme or consolidation PR summary | One sentence + link to changelog. |
| Breaking changes | Boilerplate/drop-in commits between tags | Omit Aside if none. |
| Highlights | Summaries from commits (all repos) between tags | External, public-facing only. |
| Updated boilerplate | Boilerplate repo: commits between previous and new suite tags/branch points | [repos.json](repos.json): boilerplate (main, b2b). |
| Updated Drop-in SDK | StorefrontSDK: commits between previous and new SDK tags (for example 1.6..1.7) | [repos.json](repos.json): StorefrontSDK; [tags](https://github.com/adobe-commerce/StorefrontSDK/tags). |
| Updated storefront tools | storefront-tools: commits between tags | [repos.json](repos.json): storefront-tools. |
| Updated drop-in components | Each B2C drop-in repo: commits between previous and new version tags | **Versions:** package.json in **B2C consolidation PR**. **Improvements:** commit summaries from each drop-in's tag range. |
| Updated/New B2B drop-in components | Each B2B drop-in repo: commits between previous and new version tags | **Versions:** package.json in **B2B consolidation PR**. **Improvements:** commit summaries. |
| Known issues | **No automated source** | Manual or "There are no known issues for this release suite." |
| Component compatibility — Commerce Foundation | **SCP version finder** + product version list (manual) | **Run the [SCP version finder](#scp-version-finder-run-when-filling-component-compatibility)** to get latest Storefront Compatibility Package versions. Adobe Commerce / B2B product versions from release spec (manual). |
| Component compatibility — Drop-in SDK / B2C / B2B | **package.json in consolidation PRs** | Use versions from B2C and B2B PR package.json (or lockfile). |

### 3. SCP (Storefront Compatibility Package)

- **Where SCP appears:** In each release suite's **Component compatibility** section in `index.mdx`. Two tables: (1) Adobe Commerce | Storefront Compatibility Package (B2C); (2) Adobe Commerce B2B | Storefront Compatibility B2B Package (B2B).
- **Source of truth for SCP versions:** Both SCP repos use **branch names** as versions (they do not use GitHub Releases/tags for the package version).

#### SCP version finder (run when filling Component compatibility)

When adding or updating a release suite's **Component compatibility** section, run this version check to populate the Commerce Foundation tables with the latest Storefront Compatibility Package versions.

**When to run:** Every time you fill or update the "Component compatibility" block for a new suite (step 5 of the workflow), or when the user asks to "find latest SCP versions" or "update compatibility package versions."

**Steps:**

1. **B2C — Storefront Compatibility Package**  
   List version branches and take the latest **4.7.x** (for Adobe Commerce 2.4.7) and latest **4.8.x** (for Adobe Commerce 2.4.8):
   ```bash
   gh api "repos/magento-commerce/storefront-compatibility/branches?per_page=100" --jq '.[].name' | grep -E '^4\.(7|8)\.' | sort -V
   ```
   Use the **highest 4.7.x** and **highest 4.8.x** in the output (for example `4.7.11`, `4.8.17`). Write these into the first Commerce Foundation table (Adobe Commerce | Storefront Compatibility Package).

2. **B2B — Storefront Compatibility B2B Package**  
   List version branches and take the latest **1.0.x**:
   ```bash
   gh api "repos/magento-commerce/storefront-compatibility-b2b/branches?per_page=100" --jq '.[].name' | grep -E '^1\.0\.' | sort -V
   ```
   Use the **highest 1.0.x** in the output (for example `1.0.18`). Write it into the second Commerce Foundation table (Adobe Commerce B2B | Storefront Compatibility B2B Package).

3. **Adobe Commerce / B2B product versions** (left column of each table) are **not** from this check — confirm from release/product spec or team (for example `2.4.7`, `2.4.8`, `1.5.2`).

**Compare branches (optional):** To see changes between two SCP versions, use GitHub Compare, for example `https://github.com/magento-commerce/storefront-compatibility/compare/4.8.16...4.8.17`.

- **Gathering SCP content:** When SCP versions change, use commits between branch refs (for example `4.8.16...4.8.17`) in the SCP repos to summarize changes. Use `gh api repos/.../compare/base...head` or `git log base..head`.
- **Changelog:** Add `<ChangelogEntry>` for SCP when there are notable updates. Match ChangelogFilter taxonomy.

## Conventions

- **PR links:** Use `([#N](https://github.com/org/repo/pull/N))` with the correct org/repo from [repos.json](repos.json). For private repos, links may not resolve for public readers; use Internal Links Aside where needed.
- **Versions:** Use the version format already in the file (for example `~3.1.0`). **New** versions from consolidation PR package.json; **previous** versions from the previous suite's Component compatibility or from tags in each repo. When writing version numbers in release notes or changelog, **always remove the `-beta` suffixes** (for example write `~3.2.0` or `3.0.2.1`, not `~3.2.0-beta` or `3.0.2-beta.1`). The **release version** we document is the number without suffix; the **compare diff** uses the **latest beta** tag in that version line (for example `v3.0.2-beta.1`, `v3.1.0-beta6`) — see [Release version and package tags](#release-version-and-package-tags-pre-release-suffixes).
- **Preserve frontmatter and preamble:** Do not change the frontmatter or the first paragraph of `index.mdx` or `changelog.mdx`; only add or edit content in the body (new release sections and changelog entries).
- **External, public-facing only:** When summarizing commits, include only changes that affect implementers or end users (APIs, slots, props, behavior). Omit internal refactors, lint, and non-customer-facing work.
- **No internal fixes in release notes:** Do **not** add internal or developer-only fixes to the release notes index or changelog. Exclude: test fixes (for example flaky tests, test stability), testing infrastructure, Cypress/E2E tests, unit test coverage, CI/test workflow changes, and anything you evaluate as internal. The release notes and changelog are public-facing; keep them focused on customer- and implementer-visible changes only.
- **Evaluate importance — skip version-alignment-only entries:** Before adding a **changelog entry** or a **detailed Improvements bullet** in the release index for a component, evaluate whether the change is meaningful to implementers or users. **Do not** add a `<ChangelogEntry>` for a component when the only change is version alignment, dependency bumps, or internal fixes with no user-facing or implementer-facing impact (for example "version alignment and dependency updates" with no new APIs, slots, props, or behavior). For such components: (1) **Changelog:** omit the entry entirely. (2) **Index:** keep the component and version in the drop-in table and Component compatibility, but use "No user-facing changes in this release" (or similar) in the Improvements column; do not link to the boilerplate consolidation PR as if it were the "change." Only add changelog entries and improvement bullets for changes that are external, public-facing, or implementer-visible.

## Writing rules

Apply these rules to **all prose** in the release index (`index.mdx`) and changelog (`changelog.mdx`): Highlights, Improvements column, changelog entry bodies, and any other narrative text. **When creating or editing release note or changelog content, always apply this section** so that bullets, summaries, and descriptions follow these rules.

### Full sentences, not fragments

- Write **complete sentences** for bullets and list items. Do not use chopped or fragment-style phrases that depend on a missing subject or verb.
- **Avoid:** "Pathname fix when store code in URL;" or "Video support for PDP."
- **Prefer:** "Pathname handling is fixed when the store code appears in the URL." / "The Product Gallery now supports video when the store code is in the URL."

### User-editable rules (add or change as needed)

- **Avoid all Latin abbreviations.** In release notes and changelog prose, do not use Latin abbreviations; spell them out or rephrase. Common ones: **e.g.** → "for example"; **i.e.** → "that is"; **etc.** → "and so on" or "and others"; **et al.** → "and others" or list the names; **cf.** → "compare" or "see"; **viz.** → "namely" or "that is"; **vs.** → "versus" (or "and" / "or" where appropriate). Do not use e.g., i.e., etc., et al., cf., viz., or similar in the index or changelog.
- **Avoid the passive voice.** Prefer the active voice so the doer is clear (for example: "The drop-in validates the input" rather than "The input is validated by the drop-in" when the subject matters).
- **Lead with "what's in it for me."** Frame each change in terms of what the implementer or user gains. Prefer benefit-focused phrasing (for example: "Correct 404 responses for non-existent pages so crawlers and tools get the right HTTP status" or "Page size configurable via block config so you can control results per page") over purely technical descriptions (for example: "404 handling fix" or "Added page size setting"). Apply this to Highlights, Improvements column, and changelog bullets.

<!-- Add more writing rules below as needed. -->

### Elements of Style (Strunk & White) — principles for release notes

- **Use the active voice.** Prefer "X does Y" over "Y is done by X."
- **Omit needless words.** Every word should tell; cut filler and redundancy.
- **Put statements in positive form.** Prefer "X is enabled when …" over "X is not disabled when …" where it reads more clearly.
- **Use definite, specific, concrete language.** Name the feature, prop, or behavior instead of vague terms.
- **Keep related words together.** Place modifiers next to what they modify; keep subject and verb close.
- **Express coordinate ideas in similar form (parallel structure).** In a list or series, use the same grammatical form for each item.
- **Avoid a succession of loose sentences.** Vary sentence structure; use subordination when one idea depends on another.
- **Place emphatic words at the end.** Put the most important idea at the end of the sentence when it helps clarity.
- **In summaries, keep to one tense.** Use present or past consistently within a section or bullet list.

## Sections that cannot be confirmed from code (manual updates required)

| Section | Location | Manual action |
|--------|----------|----------------|
| **Known issues** | `### Known issues` per suite | Add from release notes or team, or use "There are no known issues for this release suite." |
| **Commerce Foundation — Adobe Commerce version(s)** | Component compatibility → first table, left column | Confirm from release/product spec; add one row per version (for example 2.4.7, 2.4.8). |
| **Commerce Foundation — Adobe Commerce B2B version** | Component compatibility → second table, left column | Confirm from release/product spec (for example 1.5.2). |
| **Commerce Foundation — SCP package versions** (right columns) | Component compatibility → first and second tables | **Use the [SCP version finder](#scp-version-finder-run-when-filling-component-compatibility)** — run the `gh api` branch-list commands; do not guess or copy from the previous suite without re-checking. |

After generating a new suite or changelog entries, review these sections and fill or correct them before publishing.

## Quick reference

| Step | Action |
|------|--------|
| Auth | User runs `gh auth login` before using private repos. |
| Comparison URLs | When the user supplies comparison URLs, use the **Files changed** (diff) from those URLs. For repos without a URL, derive the comparison from previous suite + package.json and resolve tags. **If any repo’s comparison cannot be found or derived, tell the user and ask for the comparison URL or refs.** |
| Template | Use **previous** release (for example January) in index.mdx as **structural template only**; never edit the previous release. |
| Version ranges | If no URLs given: **New** from package.json in consolidation PRs; **Previous** from previous suite's Component compatibility or tags. For compare head, use **latest beta** tag in that version line (for example `v3.0.2-beta.1`), not highest tag (for example not alpha). |
| **SCP version finder** | When filling **Component compatibility**, run the [SCP version finder](#scp-version-finder-run-when-filling-component-compatibility): `gh api` on `magento-commerce/storefront-compatibility` and `storefront-compatibility-b2b` branches; use latest 4.7.x, 4.8.x, and 1.0.x as the Storefront Compatibility Package versions in the Commerce Foundation tables. |
| Scan changes | Analyze **Files changed** (diffs) from user-supplied compare URLs, or run `git log previousTag..newTag` / Compare API. Focus on **code** and **external, public-facing** changes. |
| Changelog | Create `<ChangelogEntry>` blocks from change summaries **only for components with user-facing or implementer-facing changes**; omit entries for version-alignment-only or internal-only updates. **Every entry must have `date`, `title`, and `components`** (missing `date` breaks the build). **Insert each entry** at the top of its component section in `changelog.mdx` (do not add one block at the top of the file). **Do not remove or re-date existing suite entries** when adding the new suite. Apply [Writing rules](#writing-rules) to all prose. |
| Index | Add new `## YYYY Month suite` in `index.mdx`; fill from change summaries and package.json; do not copy previous suite content. Apply [Writing rules](#writing-rules) to all prose. |
| Scope | Default: update **both** index and changelog. If the user asks for **only changelog** or **only index**, run the same workflow but **write only** to the requested file so content stays consistent when the other is updated later. |
