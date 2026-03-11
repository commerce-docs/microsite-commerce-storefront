# Release notes source repositories

**Canonical list for scripting:** [repos.json](repos.json) — use this in scripts (e.g. `require('./repos.json')` or `gh release list --repo <orgRepo>`). Fields: `type`, `folder`, `displayName`, `url`, `orgRepo`. Optional `branch`: use for clone/checkout (e.g. boilerplate = `main`, boilerplate-b2b = `b2b`; see [main](https://github.com/hlxsites/aem-boilerplate-commerce/tree/main), [b2b](https://github.com/hlxsites/aem-boilerplate-commerce/tree/b2b)).

Local clones live in `.temp-repos/<folder>`.

**Authentication:** All private repos require `gh auth login` before `gh` or git operations. See [SKILL.md](SKILL.md).

## Repo types

| Type       | Purpose |
|-----------|---------|
| boilerplate | Commerce boilerplate (and B2B variant) |
| sdk       | Drop-in SDK (StorefrontSDK) |
| b2b-lib   | B2B shared library |
| tools     | Storefront tools (`@dropins/tools`) — [adobe-commerce/storefront-tools](https://github.com/adobe-commerce/storefront-tools) |
| scp       | Storefront Compatibility Package (B2C) — magento-commerce/storefront-compatibility |
| scp-b2b   | Storefront Compatibility B2B Package — magento-commerce/storefront-compatibility-b2b |
| dropin    | Individual B2C/B2B drop-in components |

## Canonical source for URLs

- Drop-ins and SDK: `scripts/lib/dropin-config.js` (DROPIN_REPOS, REFERENCE_REPOS).
- Boilerplate: `scripts/lib/generator-core.js` / `scripts/lib/repository.js`.

When adding or changing repos, update **repos.json** first; keep this file in sync if you maintain a human-readable summary here.
