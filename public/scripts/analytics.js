/**
 * Adobe Analytics implementation for Astro
 * Adapted from Gatsby analytics guidance for Customer Journey Analytics
 */

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize Adobe Analytics global objects
 * This ensures the required objects exist before the Adobe Launch script loads
 */
export function initializeAnalyticsObjects() {
    if (!isBrowser) return;

    // Initialize Adobe Analytics window objects
    window._satellite = window._satellite || {};
    window.alloy_all = window.alloy_all || {};
    window.alloy_all.data = window.alloy_all.data || {};
    window.alloy_all.data._adobe_corpnew = window.alloy_all.data._adobe_corpnew || {};
    window.alloy_all.data._adobe_corpnew.web = window.alloy_all.data._adobe_corpnew.web || {};
    window.alloy_all.data._adobe_corpnew.web.webPageDetails = window.alloy_all.data._adobe_corpnew.web.webPageDetails || {};
}

/**
 * Track page view with Adobe Analytics
 * @param {string} pageUrl - The URL of the page to track
 */
export function trackPageView(pageUrl) {
    if (!isBrowser) return;

    function watchAndFireAnalytics() {
        // Check if Adobe Launch (_satellite) is available
        if (typeof window._satellite !== 'undefined') {
            try {
                // Track the page view with Customer Journey Analytics structure
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

                console.log('Analytics: Page view tracked for', pageUrl);
                clearInterval(intervalId);
            } catch (error) {
                console.error('Analytics: Error tracking page view', error);
                clearInterval(intervalId);
            }
        }
    }

    // Watch for analytics to be online, then track page
    const intervalId = setInterval(watchAndFireAnalytics, 1000);

    // Clear interval after 30 seconds to prevent infinite polling
    setTimeout(() => {
        clearInterval(intervalId);
    }, 30000);
}

/**
 * Add link tracking attributes to elements
 * @param {string} selector - CSS selector for elements to track
 * @param {string} category - Category name for the tracking
 */
export function addLinkTracking(selector, category) {
    if (!isBrowser) return;

    try {
        document.querySelectorAll(selector).forEach((link) => {
            const linkText = link.textContent?.trim() || link.getAttribute('aria-label') || 'Unknown Link';
            link.setAttribute('daa-ll', `${category} | ${linkText}`);
        });
        console.log(`Analytics: Link tracking added for ${selector}`);
    } catch (error) {
        console.error('Analytics: Error adding link tracking', error);
    }
}

/**
 * Setup page-specific link tracking based on current URL
 */
export function setupPageLinkTracking() {
    if (!isBrowser) return;

    const pathname = window.location.pathname;

    // Add link tracking for different page types
    if (pathname.includes('/dropins/')) {
        addLinkTracking('.content a', 'Drop-ins Documentation');
    } else if (pathname.includes('/get-started/')) {
        addLinkTracking('.content a', 'Getting Started');
    } else if (pathname.includes('/setup/')) {
        addLinkTracking('.content a', 'Setup Guide');
    } else if (pathname.includes('/sdk/')) {
        addLinkTracking('.content a', 'SDK Documentation');
    } else if (pathname.includes('/merchants/')) {
        addLinkTracking('.content a', 'Merchant Documentation');
    } else {
        addLinkTracking('.content a', 'General Documentation');
    }

    // Track navigation links
    addLinkTracking('nav a', 'Navigation');
    addLinkTracking('.sidebar a', 'Sidebar Navigation');
    addLinkTracking('.breadcrumbs a', 'Breadcrumb Navigation');
}

/**
 * Initialize analytics for the current page
 */
export function initializePageAnalytics() {
    if (!isBrowser) return;

    // Initialize global objects
    initializeAnalyticsObjects();

    // Track initial page view
    trackPageView(window.location.href);

    // Setup link tracking
    setupPageLinkTracking();
}

/**
 * Handle Astro page navigation for analytics
 */
export function setupAstroAnalytics() {
    if (!isBrowser) return;

    // Initialize analytics on initial page load
    initializePageAnalytics();

    // Handle Astro page transitions
    document.addEventListener('astro:page-load', () => {
        // Small delay to ensure page content is rendered
        setTimeout(() => {
            trackPageView(window.location.href);
            setupPageLinkTracking();
        }, 100);
    });

    // Handle before page navigation (cleanup if needed)
    document.addEventListener('astro:before-preparation', () => {
        // Any cleanup logic can go here if needed
    });
}

// Auto-initialize when script loads
if (isBrowser) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAstroAnalytics);
    } else {
        setupAstroAnalytics();
    }
}
