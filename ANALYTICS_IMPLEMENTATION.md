# Adobe Analytics Implementation for Astro Project

This document explains the Adobe Analytics implementation that has been added to fix analytics tracking issues with the move to Customer Journey Analytics.

## Overview

The implementation follows the guidance provided for ensuring accurate data reporting with Customer Journey Analytics. It has been adapted from the original Gatsby-specific solution to work with Astro's architecture and client-side routing.

## Files Modified/Created

### 1. `public/scripts/analytics.js`
**New file** - Contains the main analytics implementation with the following features:

- **Global Object Initialization**: Sets up required Adobe Analytics window objects (`_satellite`, `alloy_all`, etc.)
- **Page View Tracking**: Tracks page views with Customer Journey Analytics data structure
- **Link Tracking**: Automatically adds `daa-ll` attributes to links for enhanced tracking
- **Astro Integration**: Handles Astro's client-side navigation events

### 2. `astro.config.mjs`
**Modified** - Added the analytics script to the head configuration:

```javascript
{
  tag: 'script',
  attrs: {
    src: `${basePath}/scripts/analytics.js`,
    type: 'module'
  }
}
```

## How It Works

### Initialization
The script automatically initializes when the page loads and sets up the required Adobe Analytics global objects:

```javascript
window._satellite = window._satellite || {};
window.alloy_all = window.alloy_all || {};
window.alloy_all.data = window.alloy_all.data || {};
// ... additional nested object initialization
```

### Page Tracking
Page views are tracked using the Customer Journey Analytics structure:

```javascript
window._satellite.track('state', {
  xdm: {},
  data: {
    _adobe_corpnew: {
      web: {
        webPageDetails: {
          customPageName: pageUrl
        }
      }
    }
  }
});
```

### Link Tracking
Links are automatically tagged with `daa-ll` attributes based on:
- Page type (Drop-ins, Getting Started, Setup, etc.)
- Link location (Navigation, Sidebar, Breadcrumbs, Content)

Example: `daa-ll="Drop-ins Documentation | Installation Guide"`

### Astro Navigation Handling
The implementation listens for Astro's navigation events:
- `astro:page-load` - Triggers analytics for new page loads
- `astro:before-preparation` - Handles cleanup before navigation

## Key Features

1. **Automatic Initialization**: No manual setup required, works automatically when pages load
2. **Route Change Detection**: Tracks page views on client-side navigation
3. **Link Tracking**: Automatically adds tracking attributes to all relevant links
4. **Error Handling**: Includes error handling and timeout mechanisms
5. **Console Logging**: Provides debugging information in development

## Testing

To verify the implementation is working:

1. **Open Browser Developer Tools**
2. **Navigate to the Console tab**
3. **Load any page** - You should see: `Analytics: Page view tracked for [URL]`
4. **Navigate to another page** - Should see tracking for the new page
5. **Check Network tab** for Adobe Analytics requests
6. **Inspect links** - Should have `daa-ll` attributes added

## Troubleshooting

### Common Issues

1. **Script not loading**: Check that `public/scripts/analytics.js` exists and is accessible
2. **No tracking events**: Verify Adobe Launch script is loading first
3. **Console errors**: Check browser console for JavaScript errors

### Debug Information

The script provides console logging for:
- Page view tracking: `Analytics: Page view tracked for [URL]`
- Link tracking setup: `Analytics: Link tracking added for [selector]`
- Errors: `Analytics: Error [description]`

## Customization

### Adding New Link Categories
To add tracking for specific page types, modify the `setupPageLinkTracking()` function:

```javascript
if (pathname.includes('/your-section/')) {
  addLinkTracking('.content a', 'Your Section Name');
}
```

### Modifying Tracking Data
To change the data structure sent to Adobe Analytics, modify the `trackPageView()` function's `_satellite.track()` call.

## Production Deployment

The implementation is production-ready and will:
1. Only run in browser environments
2. Handle cases where Adobe Launch script hasn't loaded yet
3. Automatically clean up intervals to prevent memory leaks
4. Work with your existing Adobe Launch configuration

## Support

For questions or issues related to this implementation, refer to:
- Adobe Analytics documentation
- Customer Journey Analytics guides
- The original Slack channel mentioned in the guidance
