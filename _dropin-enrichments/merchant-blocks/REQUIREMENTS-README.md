# Merchant Block Requirements - Documentation

## Overview

The Requirements section provides merchants with immediate actionable information about what customers can do with each block and what needs to be configured.

## Format

**Customer-capability first:**
```
[Customer capability]. Enable [feature] in your Adobe Commerce admin panel before using this block.
```

### Example:
```
Company administrators add team members, assign roles, and manage user access through this block. Enable company features in your Adobe Commerce admin panel before using this block.
```

## Priority System

The generator uses a 2-tier priority system:

1. **Priority 1**: Enriched requirements from `requirements.json` (ALWAYS used if present)
2. **Priority 2**: Auto-extracted from README files (fallback only)

## File: `requirements.json`

### Structure:
```json
{
  "metadata": {
    "description": "Merchant-focused requirements for B2B commerce blocks",
    "format": "[Customer capability]. Enable [feature] in your Adobe Commerce admin panel before using this block.",
    "last_updated": "2025-12-07",
    "verified": true
  },
  "requirements": {
    "block-name": "Requirement text following the format above..."
  }
}
```

### Maintenance:

When updating requirements:
1. Edit `requirements.json` with the new requirement text
2. Follow the customer-capability-first format
3. Update the `last_updated` date in metadata
4. Regenerate merchant documentation

Requirements in `requirements.json` will **never be overwritten** by README extraction.

## Writing Guidelines

### ✅ DO:
- Lead with what customers can do
- Use active voice
- Be specific about capabilities
- Keep the admin reference simple ("Enable X in your Adobe Commerce admin panel")
- Focus on merchant value

### ❌ DON'T:
- Use passive voice ("This block requires...")
- List technical prerequisites without context
- Provide complex admin paths
- Focus on technical details

## Example Transformations

### Before (Technical, Generic):
> Users must authenticate and have purchase order permissions to view purchase order history.

### After (Customer-Capability First):
> Users view audit trails showing who approved orders, when actions occurred, and status changes for compliance through this block. Enable purchase orders in your Adobe Commerce admin panel before using this block.

---

## Generator Integration

**File:** `scripts/@generate-merchant-block-docs.js`

**Function:** `generateRequirementsSection()` (lines 828-870)

The function:
1. Checks `requirements.json` first
2. If enriched requirement exists, uses it
3. Otherwise falls back to README extraction
4. Formats output for MDX

**This ensures requirements are never overwritten during regeneration.**

