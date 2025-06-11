import type { MiddlewareHandler } from 'astro';
import { getCollection } from 'astro:content';

// Cache for content collection data
let contentCache: Array<{ slug: string; url: string; title?: string; data?: any }> = [];
let cacheLastUpdated = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize content cache
 */
async function initializeContentCache() {
  const now = Date.now();
  if (contentCache.length > 0 && now - cacheLastUpdated < CACHE_TTL) {
    return contentCache;
  }

  try {
    const docs = await getCollection('docs');
    contentCache = docs.map(doc => ({
      slug: doc.slug,
      url: `/developer/commerce/storefront/${doc.slug}`,
      title: doc.data.title,
      data: doc.data
    }));
    cacheLastUpdated = now;
  } catch (error) {
    console.warn('Failed to load content collection:', error);
  }

  return contentCache;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  const maxLength = Math.max(str1.length, str2.length);
  return (maxLength - matrix[str2.length][str1.length]) / maxLength;
}

/**
 * Find the best redirect candidate for a missing URL
 */
function findBestRedirect(requestedPath: string, availableUrls: Array<{ url: string; title?: string }>): string | null {
  const normalizedPath = requestedPath.toLowerCase().replace(/\/+$/, '');
  
  // First, try exact prefix matches
  for (const item of availableUrls) {
    const normalizedUrl = item.url.toLowerCase().replace(/\/+$/, '');
    if (normalizedUrl.includes(normalizedPath) || normalizedPath.includes(normalizedUrl)) {
      return item.url;
    }
  }

  // Then try path segment matching
  const requestedSegments = normalizedPath.split('/').filter(Boolean);
  const candidates = availableUrls.map(item => {
    const urlSegments = item.url.toLowerCase().split('/').filter(Boolean);
    const commonSegments = requestedSegments.filter(segment => 
      urlSegments.some(urlSegment => urlSegment.includes(segment) || segment.includes(urlSegment))
    );
    
    return {
      url: item.url,
      score: commonSegments.length / Math.max(requestedSegments.length, urlSegments.length),
      similarity: calculateSimilarity(normalizedPath, item.url.toLowerCase())
    };
  });

  // Sort by combined score
  candidates.sort((a, b) => (b.score + b.similarity) - (a.score + a.similarity));
  
  const bestCandidate = candidates[0];
  
  // Only redirect if similarity is above threshold
  if (bestCandidate && (bestCandidate.score > 0.3 || bestCandidate.similarity > 0.6)) {
    return bestCandidate.url;
  }

  return null;
}

/**
 * Handle legacy URL patterns with automatic mapping
 */
function handleLegacyPatterns(url: string): string | null {
  const legacyPatterns = [
    // Pattern: /old-prefix/* -> /new-prefix/*
    {
      from: /^\/customize\/(.*)/,
      to: '/developer/commerce/storefront/dropins/all/$1'
    },
    {
      from: /^\/get-started\/(.*)/,
      to: '/developer/commerce/storefront/$1'
    },
    {
      from: /^\/dropins\/([^/]+)\/([^/]+)-introduction$/,
      to: '/developer/commerce/storefront/dropins/$1'
    },
    {
      from: /^\/config\/(.*)/,
      to: '/developer/commerce/storefront/setup/configuration/$1'
    }
  ];

  for (const pattern of legacyPatterns) {
    const match = url.match(pattern.from);
    if (match) {
      return pattern.to.replace(/\$(\d+)/g, (_, num) => match[parseInt(num)] || '');
    }
  }

  return null;
}

/**
 * Smart redirects middleware
 */
export const smartRedirects: MiddlewareHandler = async (context, next) => {
  const { request, redirect, url } = context;
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return next();
  }

  const response = await next();

  // If the response is successful, continue normally
  if (response.status === 200) {
    return response;
  }

  // Handle 404s with intelligent redirects
  if (response.status === 404) {
    const requestedPath = url.pathname;
    
    // First, try legacy pattern matching
    const legacyRedirect = handleLegacyPatterns(requestedPath);
    if (legacyRedirect) {
      console.log(`Legacy pattern redirect: ${requestedPath} -> ${legacyRedirect}`);
      return redirect(legacyRedirect, 301);
    }

    // Then try content-based matching
    const content = await initializeContentCache();
    const bestMatch = findBestRedirect(requestedPath, content);
    
    if (bestMatch) {
      console.log(`Smart redirect: ${requestedPath} -> ${bestMatch}`);
      return redirect(bestMatch, 301);
    }

    // If no smart redirect found, try to suggest alternatives
    const suggestions = content
      .map(item => ({
        url: item.url,
        similarity: calculateSimilarity(requestedPath.toLowerCase(), item.url.toLowerCase())
      }))
      .filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(item => item.url);

    if (suggestions.length > 0) {
      // You could create a custom 404 page with suggestions
      console.log(`No exact match for ${requestedPath}, suggestions:`, suggestions);
    }
  }

  return response;
};

// Export for use in astro.config.mjs
export default smartRedirects; 