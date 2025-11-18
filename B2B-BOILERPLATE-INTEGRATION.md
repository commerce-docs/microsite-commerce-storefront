# B2B Boilerplate Integration Configuration

## Overview

B2B drop-in documentation now automatically uses the `b2b-integration` branch from the boilerplate repository to extract real-world usage examples. This ensures B2B documentation includes accurate block implementations and initializer patterns specific to B2B features.

## Changes Made

### 1. Updated `scripts/lib/repository.js`

Modified `cloneOrUpdateBoilerplate()` to accept an optional branch parameter:

```javascript
export function cloneOrUpdateBoilerplate(branch = null)
```

**Behavior:**
- **No branch parameter** → Uses latest release tag (for B2C drop-ins)
- **With branch parameter** → Checks out and updates the specified branch (for B2B drop-ins)

### 2. Updated `scripts/lib/generator-core.js`

Added logic to detect B2B drop-ins and use the appropriate boilerplate branch:

```javascript
// Determine if we're processing B2B drop-ins
const hasB2BDropins = Object.values(dropins).some(config => config.type === 'B2B');
const hasB2CDropins = Object.values(dropins).some(config => config.type !== 'B2B');

// Use b2b-integration branch if processing B2B drop-ins only
const boilerplateBranch = hasB2BDropins && !hasB2CDropins ? 'b2b-integration' : null;
const { path: boilerplatePath, tag: boilerplateTag } = cloneOrUpdateBoilerplate(boilerplateBranch);
```

## Behavior by Command

### B2B Documentation Generation

**Command:** `npm run generate-b2b-docs`

**Boilerplate:** Uses `b2b-integration` branch

**What gets extracted:**
- B2B block implementations from `blocks/commerce-b2b-*`
- B2B drop-in initializers from `scripts/initializers/`
- Purchase Order, Company Management, Quote Management, etc. examples

### B2C Documentation Generation

**Command:** `npm run generate-all-docs` (without `--type=B2B`)

**Boilerplate:** Uses latest release tag (e.g., `v1.2.1-alpha1`)

**What gets extracted:**
- Standard Commerce blocks (cart, checkout, product-details, etc.)
- B2C drop-in initializers

### Individual Drop-in Generation

**Command:** `npm run generate-function-docs purchase-order`

**Boilerplate:** Uses `b2b-integration` branch (because purchase-order is type B2B)

**Command:** `npm run generate-function-docs cart`

**Boilerplate:** Uses latest release tag (because cart is type B2C)

## Source Priority Order

For all documentation generation, examples are extracted in this priority:

1. **JSDoc @example tags** (in drop-in source code)
2. **Drop-in HTML examples** (`examples/html-host/index.html`)
3. **Boilerplate blocks** (`blocks/*/`) - **NOW USES b2b-integration FOR B2B**
4. **Enrichment files** (fallback only)

## B2B Blocks Available in b2b-integration Branch

The following B2B blocks are available for example extraction:

### Purchase Order
- `commerce-b2b-po-company-purchase-orders`
- `commerce-b2b-po-customer-purchase-orders`
- `commerce-b2b-po-require-approval-purchase-orders`

### Company Management
- `commerce-company-create`
- `commerce-company-credit`
- `commerce-company-profile`
- `commerce-company-roles-permissions`
- `commerce-company-structure`
- `commerce-company-users`
- `commerce-customer-company`

### Quote Management
- `commerce-b2b-negotiable-quote`
- `commerce-b2b-negotiable-quote-template`
- `commerce-b2b-quote-checkout`

### Requisition List
- `commerce-b2b-requisition-list`
- `commerce-b2b-requisition-list-view`

## B2B Initializers Available

- `scripts/initializers/company.js`
- `scripts/initializers/company-switcher.js`
- `scripts/initializers/purchase-order.js`
- `scripts/initializers/quote-management.js`
- `scripts/initializers/requisition-list.js`

## Testing

To verify the changes work correctly:

```bash
# Test B2B documentation generation
npm run generate-b2b-docs -- --dry-run

# Check boilerplate branch output (should say "b2b-integration")
npm run generate-function-docs purchase-order

# Test B2C documentation generation (should still use release tag)
npm run generate-function-docs cart
```

## Repository Location

The boilerplate repository is cloned to:
```
.temp-repos/boilerplate/
```

When processing B2B drop-ins, it will be on the `b2b-integration` branch.
When processing B2C drop-ins, it will be on the latest release tag.

## Benefits

1. **Accurate B2B Examples:** Documentation now shows real B2B implementations
2. **Automatic Updates:** When b2b-integration branch updates, docs can be regenerated
3. **Separation of Concerns:** B2B and B2C examples don't conflict
4. **Real-World Patterns:** Examples come from actual production boilerplate code

## Notes

- The `b2b-integration` branch in the boilerplate repository must be kept up-to-date with B2B drop-in implementations
- Mixed B2B/B2C generation (if it ever happens) falls back to release tag to be safe
- Enrichment files remain the primary source for descriptions and contextual information

