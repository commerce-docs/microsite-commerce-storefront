# Merchant Block Descriptions - Quick Reference

## 🆕 Automated Update Detection

The system now tracks changes automatically!

```bash
# Check if boilerplate has updates
node scripts/@check-for-updates.js
```

**Result:**
- ✅ No changes = No action needed
- ⚠️ Changes detected = Follow recommendations in output

## 🚀 Quick Workflow (3 Minutes)

```bash
# 1. Check for boilerplate updates (NEW!)
node scripts/@check-for-updates.js

# 2. Verify descriptions (if changes detected)
node scripts/@verify-merchant-block-descriptions.js

# 3. Verify configurations (if source code changed)
node scripts/@verify-block-configs-source-code.js

# 4. Update enrichment if needed
nano _dropin-enrichments/merchant-blocks/descriptions.json

# 5. Regenerate documentation (auto-updates metadata)
node scripts/@generate-merchant-block-docs.js

# 6. Verify output
cat src/content/docs/merchants/blocks/commerce-[block-name].mdx | head -10
```

## 📋 Checklist

- [ ] Check for boilerplate updates (`@check-for-updates.js`)
- [ ] Run verification script (if changes detected)
- [ ] Review any blocks marked "NEEDS REVIEW"
- [ ] Update `descriptions.json` with accurate descriptions
- [ ] Set `"verified": true` for reviewed blocks
- [ ] Regenerate merchant block docs (auto-updates commit hash)
- [ ] Spot-check generated pages
- [ ] Commit changes to git

## 📝 Description Template

```json
"block-name": {
  "description": "Action verb + what merchants can do/see.",
  "verified": true,
  "source": "README: brief note from Overview section"
}
```

## ✅ Good Description Examples

| Block | Description |
|-------|-------------|
| cart | Configure the shopping cart page to display product details, pricing, and checkout options. |
| mini-cart | Display a compact cart dropdown with product management and checkout options. |
| checkout | Provide a comprehensive one-page checkout with payment processing and order placement. |
| wishlist | Manage product wishlist with authentication and cart integration. |
| b2b-po-status | Display purchase order status with approval actions and real-time updates. |

## 📂 Key Files

| File | Purpose |
|------|---------|
| `descriptions.json` | Verified merchant-friendly descriptions |
| `README.md` | Full maintenance workflow documentation |
| `QUICK-REFERENCE.md` | This file - quick lookup guide |
| `ENHANCEMENTS-SUMMARY.md` | Details on enhanced property descriptions, common configs, and important notes |
| `EXPANDED-ENHANCEMENTS-REPORT.md` | Complete expansion details with before/after comparisons |
| `INTEGRATION-CONFIRMATION.md` | Proof that all enhancements are permanently integrated into the generator |

## 🔍 Source of Truth

- **Location**: `.temp-repos/boilerplate/blocks/[block-name]/README.md`
- **Branch**: `b2b-suite-release1`
- **Section**: `## Overview` (first paragraph)

## ⚡ Common Commands

```bash
# Verify all blocks
node scripts/@verify-merchant-block-descriptions.js

# Verify specific block README
cat .temp-repos/boilerplate/blocks/commerce-cart/README.md

# Regenerate all merchant docs
node scripts/@generate-merchant-block-docs.js

# Check generated page
cat src/content/docs/merchants/blocks/commerce-cart.mdx | head -10

# Update boilerplate repository
cd .temp-repos/boilerplate
git fetch origin
git checkout b2b-suite-release1
git pull origin b2b-suite-release1
```

## 🎯 Priority System

The generator uses this priority order:

1. **Priority 1** (BEST): Verified descriptions in `descriptions.json`
2. **Priority 2**: Auto-extracted from README files
3. **Priority 3**: Fallback generic template

**Always aim for Priority 1** by setting `"verified": true` after review.

## 📐 Description Rules

**Start with these action verbs:**
- Display, Manage, Provide, Handle, Create, Show, Configure, Enable, Set up

**Length:**
- Aim for under 100 characters
- Be specific and actionable

**Avoid:**
- Technical jargon (dropin names, container names)
- Vague phrases ("Configure the block")
- Developer terminology

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Wrong description in docs | Set `"verified": true` in `descriptions.json` |
| Block not found | Update boilerplate repo: `cd .temp-repos/boilerplate && git pull` |
| No README Overview | Add verified description manually with note |
| Technical description | Override with merchant-friendly version in `descriptions.json` |

## 📅 When to Update

- ✅ New blocks added to boilerplate
- ✅ Block functionality changes
- ✅ Before major doc releases
- ✅ Quarterly reviews
- ✅ User-reported inaccuracies

## 🎓 Full Documentation

For complete details, see: `_dropin-enrichments/merchant-blocks/README.md`

