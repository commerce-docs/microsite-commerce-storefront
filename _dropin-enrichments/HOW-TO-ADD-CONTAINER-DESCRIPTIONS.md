# How to Add Container Descriptions to Enrichment Files

This guide explains how to populate container descriptions in enrichment files for better documentation.

## Files to Update

The following B2B drop-ins have skeleton container enrichment files that need descriptions:

- `_dropin-enrichments/quote-management/containers.json` (15 containers)
- `_dropin-enrichments/requisition-list/containers.json` (5 containers)
- `_dropin-enrichments/company-management/containers.json` (7 containers)
- `_dropin-enrichments/company-switcher/containers.json` (1 container)

**Total:** 28 containers need descriptions

## Description Format

Each container should have a concise, informative description that:

1. **Starts with an action verb** (Displays, Manages, Provides, etc.)
2. **Explains what the container does** (not just repeating the name)
3. **Is 1-3 sentences maximum** (first sentence is used in overview tables)
4. **Focuses on user-facing functionality** (not technical implementation)

### Good Examples (from Purchase Order):

```json
{
  "ApprovalRuleDetails": {
    "description": "The ApprovalRuleDetails container displays a read-only view of a purchase order approval rule. When the approvalRuleID prop is provided, the container retrieves the approval rule details using a customer GraphQL query. Once the data is loaded, the container displays the approval rule details in a read-only format, including the rule name, status, description, applicable roles, conditions, and approvers."
  },
  
  "CompanyPurchaseOrders": {
    "description": "The CompanyPurchaseOrders container displays purchase orders placed by company users. It supports three views: Company Purchase Orders (all orders), My Purchase Orders (orders requiring approval from the current user), and Require My Approval (orders created by subordinates)."
  }
}
```

### Bad Examples (to avoid):

❌ `"The ItemsQuoted container component for the drop-in."` - Too generic, unhelpful

❌ `"Container that displays items quoted."` - Just repeats the name

❌ `"React component that renders quoted items using TypeScript."` - Too technical

✅ `"Displays line items included in a negotiable quote with pricing, quantities, and product details. Supports editing quantities and removing items when the quote is in a draft or review state."` - Good! Explains what it does and when.

## Workflow

### Step 1: Find the Container in Source Code

1. Open the container source file:
   ```
   .temp-repos/<dropin-name>/src/containers/<ContainerName>/<ContainerName>.tsx
   ```

2. Look for:
   - JSDoc comments above the component
   - Comments describing the props
   - The component's functionality

### Step 2: Understand What It Does

Ask yourself:
- What does this container display or manage?
- When would a developer use this?
- What key props control its behavior?
- What actions can users take?

### Step 3: Write the Description

1. Start with what it displays/manages
2. Add 1-2 sentences about key features or modes
3. Mention important props if relevant

### Step 4: Update the Enrichment File

Replace the `[ADD DESCRIPTION]` placeholder with your description:

```json
{
  "ItemsQuoted": {
    "description": "Displays line items included in a negotiable quote with pricing, quantities, and product details. Supports editing quantities and removing items when the quote is in a draft or review state."
  }
}
```

### Step 5: Test the Documentation

Regenerate the documentation to see your descriptions:

```bash
# Regenerate specific drop-in
npm run generate-container-docs quote-management

# Or regenerate all B2B drop-ins
npm run generate-b2b-docs
```

Check the generated `containers/index.mdx` file to see how your description appears in the table.

## Tips

### Tip 1: Use Existing Enrichments as Examples

Look at `_dropin-enrichments/purchase-order/containers.json` for well-written descriptions.

### Tip 2: First Sentence Matters Most

The first sentence appears in the overview table, so make it count:

```json
{
  "QuotesListTable": {
    "description": "Displays all negotiable quotes in a paginated table with filtering and sorting capabilities. Shows quote status, dates, totals, and provides actions like view details, duplicate, or delete based on quote state."
  }
}
```

In the table, users see:
> "Displays all negotiable quotes in a paginated table with filtering and sorting capabilities."

### Tip 3: Mention Key Modes or Views

If a container has multiple modes, mention them:

```json
{
  "CompanyPurchaseOrders": {
    "description": "Displays purchase orders placed by company users. Supports three views: Company Purchase Orders (all orders), My Purchase Orders (orders requiring approval), and Require My Approval (subordinate orders)."
  }
}
```

### Tip 4: Reference Other Containers

If containers work together, mention the relationship:

```json
{
  "ApprovalRuleDetails": {
    "description": "Displays a read-only view of a purchase order approval rule. The only available action is the Back to Rules List button, which redirects to the approval rules list page powered by the ApprovalRulesList container."
  }
}
```

## Bulk Editing Tips

Since you need to update 28 containers, consider:

1. **Work by drop-in** - Complete all containers for one drop-in before moving to the next
2. **Group similar containers** - List, Grid, and Table containers often have similar patterns
3. **Use AI assistance** - Provide source code and ask for descriptions following this guide
4. **Review generated docs** - Always regenerate and review the output

## Validation

After adding descriptions, verify:

✅ No `[ADD DESCRIPTION]` placeholders remain  
✅ No "Enrichment needed" messages in generated docs  
✅ Descriptions are helpful and informative  
✅ First sentences work well in tables (under 150 characters ideally)  
✅ Grammar and spelling are correct

## Questions?

If you're unsure about a description:
1. Look at similar containers in Purchase Order
2. Ask the team familiar with that drop-in
3. Write something reasonable and mark for review later
4. Remember: A good description is better than a placeholder!

