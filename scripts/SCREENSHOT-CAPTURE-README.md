# B2B Block Screenshot Capture - Quick Start

## Installation

```bash
npm install playwright sharp
npx playwright install chromium
```

## Usage

### Capture All Blocks

```bash
node scripts/capture-b2b-screenshots.js
```

### Capture Specific Block

```bash
node scripts/capture-b2b-screenshots.js --block commerce-b2b-negotiable-quote
```

## Features

✅ **2x Retina Resolution**: 3840x2160 (renders as 1920x1080 @ 2x)  
✅ **WebP Format**: Optimized file size with 90% quality  
✅ **Individual Block Targeting**: Each block gets its own screenshot  
✅ **Automatic Login**: Handles authentication automatically  
✅ **Fallback System**: Uses related screenshots when selectors aren't found  
✅ **Auto-Update MDX**: Updates documentation files with new screenshots  

## Configuration

Edit `scripts/capture-b2b-screenshots.js` to customize:

- **Base URL**: Change `CONFIG.baseUrl`
- **Credentials**: Set via environment variables or update `CONFIG.credentials`
- **Viewport**: Adjust `CONFIG.viewport` for different resolutions
- **Block Selectors**: Update `BLOCKS` object with CSS selectors

### Environment Variables

```bash
export B2B_USERNAME="your-username"
export B2B_PASSWORD="your-password"
node scripts/capture-b2b-screenshots.js
```

## Block Configuration

Each block is defined with:

```javascript
'commerce-b2b-negotiable-quote': {
  url: '/customer/negotiable-quote',           // Page URL
  selector: 'table[role="grid"], .quote-grid', // CSS selectors (tries each)
  waitFor: 'table',                            // Wait for this element
  description: 'Negotiable quotes listing',    // Human description
  fallback: 'other-block-name'                 // Optional: use another block's screenshot
}
```

## Troubleshooting

### Block Not Found

If a selector isn't found, the script:
1. Tries all comma-separated selectors
2. Falls back to `fallback` block if specified
3. Screenshots main content area as last resort

### Update Selectors

Inspect the B2B site to find correct CSS selectors:

```bash
# In browser DevTools, find the block container element
# Update BLOCKS in capture-b2b-screenshots.js with the selector
```

### Test Single Block

```bash
node scripts/capture-b2b-screenshots.js --block commerce-b2b-negotiable-quote
```

Check `public/images/commerce-b2b-negotiable-quote.webp` to verify.

## Output

- **Screenshots**: `public/images/commerce-b2b-*.webp`
- **MDX Updates**: Auto-updates image paths in block documentation files
- **Logs**: Shows progress and any issues during capture

## Integration

Add to `package.json` scripts:

```json
{
  "scripts": {
    "screenshots": "node scripts/capture-b2b-screenshots.js",
    "screenshot": "node scripts/capture-b2b-screenshots.js --block"
  }
}
```

Then run:

```bash
npm run screenshots                              # All blocks
npm run screenshot commerce-b2b-negotiable-quote # Single block
```

## Technical Details

- **Browser**: Chromium (Playwright)
- **Resolution**: 3840x2160 @ 2x device scale factor
- **Format**: WebP with 90% quality
- **Process**: PNG capture → WebP conversion → MDX update
- **Cleanup**: Temporary PNG files are deleted after conversion

## Maintenance

### Adding New Blocks

1. Add entry to `BLOCKS` object in `capture-b2b-screenshots.js`
2. Include URL, selector, and description
3. Run script to capture

### Updating Existing Screenshots

Just run the script again - it overwrites existing screenshots:

```bash
node scripts/capture-b2b-screenshots.js
```

### Batch Updates

To update screenshots for a specific category:

```bash
# Update all PO blocks
for block in commerce-b2b-po-*; do
  node scripts/capture-b2b-screenshots.js --block $block
done
```

