# Container Image Discovery Guide

## Overview

The container documentation generator now automatically discovers and includes images for **all drop-ins** (B2C and B2B).

## How It Works

### 1. Naming Convention

Images must follow kebab-case naming matching the container name:

**Examples:**
- `MiniCart` → `mini-cart.png`
- `OrderCostSummary` → `order-cost-summary.png`  
- `CustomerDetails` → `customer-details.png`
- `PurchaseOrderStatus` → `purchase-order-status.png`

### 2. Supported Formats

- `.png` (recommended)
- `.webp`
- `.jpg` / `.jpeg`

### 3. Directory Structure

```
src/content/docs/
├── dropins/
│   ├── cart/
│   │   ├── images/
│   │   │   ├── mini-cart.png ✅
│   │   │   └── cart-summary.png ✅
│   │   └── containers/
│   ├── order/
│   │   ├── images/
│   │   │   ├── customer-details.png ✅
│   │   │   └── shipping-status.png ✅
│   │   └── containers/
└── dropins-b2b/
    └── purchase-order/
        ├── images/
        │   ├── status.png ✅
        │   └── approval-flow.png ✅
        └── containers/
```

## Usage

### Step 1: Add Image

1. Create `images/` folder in your drop-in directory if it doesn't exist
2. Add your image with kebab-case container name
3. That's it! No configuration needed

### Step 2: Run Generator

```bash
# Generate containers for specific drop-in
npm run generate-container-docs cart

# Or generate all drop-ins
npm run generate-all-docs
```

### Step 3: Verify

The generator will:
- ✅ Auto-discover your image
- ✅ Add `Diagram` component import
- ✅ Insert image after Overview section
- ✅ Make it zoomable with Diagram wrapper

## What Gets Generated

### Before (No Image):
```markdown
## Overview

The MiniCart container displays a summary...

<div style="...">
<strong>Version: 1.2.0</strong>
</div>
```

### After (Image Found):
```markdown
import Diagram from '@components/Diagram.astro';

## Overview

The MiniCart container displays a summary...

<Diagram caption="MiniCart container">
  ![MiniCart container](../images/mini-cart.png)
</Diagram>

<div style="...">
<strong>Version: 1.2.0</strong>
</div>
```

## Improvements Applied to All Drop-ins

### ✅ Completed
1. **Function Docs** - Complex return types use code blocks
2. **Container Docs** - Automatic image discovery with Diagram component

### 📋 Available (Manual)
These improvements were built for Purchase Order but are manual:

3. **Rich Container Content** - Using enrichment files for:
   - Detailed descriptions
   - ACL permissions
   - Multiple integration examples
   - Admin panel requirements
   
4. **Manual Container Override** - Set `override_template: true` in enrichment to fully customize

## Tips

### For Best Results:
- Use PNG format (most compatible)
- Optimize images (< 500KB recommended)
- Use descriptive captions
- Test zoom functionality locally

### Naming Tips:
- Always use kebab-case
- Match exact container name
- Don't add prefixes (e.g., avoid `cart-mini-cart.png`)

## Examples

### Cart Drop-in
```
MiniCart → mini-cart.png
CartSummary → cart-summary.png
```

### Order Drop-in  
```
CustomerDetails → customer-details.png
OrderCostSummary → order-cost-summary.png
ShippingStatus → shipping-status.png
```

### Purchase Order (B2B)
```
PurchaseOrderStatus → status.png (or purchase-order-status.png)
ApprovalRuleForm → approval-rule-form.png
```

## Troubleshooting

### Image Not Showing?
1. ✅ Check filename matches container name in kebab-case
2. ✅ Ensure image is in `{dropin}/images/` folder
3. ✅ Verify file extension is supported
4. ✅ Re-run generator after adding image

### Wrong Path?
- Containers are in `containers/` subfolder
- Images are in `images/` folder (same level)
- Generator uses `../images/` relative path

## Future Enhancements

Consider adding:
- 🎯 Video support
- 🎯 Multiple images per container
- 🎯 Image variants (light/dark mode)
- 🎯 Auto-generate screenshots from storybook
