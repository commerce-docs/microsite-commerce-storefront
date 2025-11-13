#!/usr/bin/env node

/**
 * Quick Start Documentation Generator
 *
 * Generates quick start reference pages for each drop-in by:
 * 1. Extracting package names and versions from source repositories
 * 2. Identifying available containers for import examples
 * 3. Creating accurate importmap and code examples
 *
 * USAGE:
 * - Generate all drop-ins: npm run generate-quick-start-docs
 * - Generate single drop-in: npm run generate-quick-start-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, company-management
 *
 * OUTPUT: Single quick-start.mdx file per drop-in
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadInstallationEnrichments } from './lib/enrichment.js';
import { updateSidebarForInstallation } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================

/**
 * Extract container names from repository
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of container names
 */
function extractContainerNames(repoPath) {
    const containersDir = join(repoPath, 'src', 'containers');

    if (!existsSync(containersDir)) {
        return [];
    }

    try {
        const entries = readdirSync(containersDir);
        const containers = [];

        for (const entry of entries) {
            const entryPath = join(containersDir, entry);
            const stat = statSync(entryPath);

            if (stat.isDirectory()) {
                const tsxPath = join(entryPath, `${entry}.tsx`);
                if (existsSync(tsxPath)) {
                    containers.push(entry);
                }
            }
        }

        return containers;
    } catch (error) {
        return [];
    }
}

/**
 * Get package information from package.json
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Object} Package info with name and version
 */
function getPackageInfo(repoPath) {
    const packageJsonPath = join(repoPath, 'package.json');

    if (!existsSync(packageJsonPath)) {
        return { name: '', version: '' };
    }

    try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        return {
            name: packageJson.name || '',
            version: packageJson.version || ''
        };
    } catch (error) {
        return { name: '', version: '' };
    }
}

/**
 * Scan repository for quick start data
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Object} Quick start data with containers and package info
 */
function scanForInstallation(repoPath) {
    const containers = extractContainerNames(repoPath);
    const packageInfo = getPackageInfo(repoPath);

    return {
        containers,
        packageInfo,
        count: containers.length // For logging
    };
}

// ============================================================================
// UNIQUE GENERATION LOGIC
// ============================================================================

/**
 * Generate quick start MDX documentation
 * 
 * @param {string} repoName - Drop-in name
 * @param {Object} repoConfig - Repository configuration
 * @param {Object|string} versionInfo - Version info object or version string
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string|null} Generated MDX content, or null if override_template is true
 */
function generateInstallationMDX(repoName, repoConfig, installationData, versionInfo, enrichmentData = null) {
    // Check if enrichment specifies template override
    if (enrichmentData && enrichmentData.override_template === true) {
        console.log(`  ⏭️  Skipping generation for ${repoName} (override_template: true)`);
        return null;
    }

    // Use simple template that links to shared guide
    const template = readTemplate('dropin-quick-start.mdx');

    const { containers, packageInfo } = installationData;
    const packageName = repoConfig.packageName;

    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;

    // Pick first container for example, or use a generic placeholder
    let containerExample = 'Container';
    if (containers && containers.length > 0) {
        containerExample = containers[0];
    }

    // Generate import example
    const importExample = `import { ${containerExample} } from '${packageName}';`;

    // Map drop-in names to initializer file names
    const initializerMap = {
        'cart': 'cart',
        'checkout': 'checkout',
        'order': 'order',
        'payment-services': 'payment-services',
        'pdp': 'pdp',
        'product-details': 'pdp',
        'product-discovery': 'search',
        'recommendations': 'recommendations',
        'user-account': 'account',
        'user-auth': 'auth',
        'wishlist': 'wishlist',
        'personalization': 'personalization'
    };
    const initializerName = initializerMap[repoName] || repoName;

    // Process enrichment data for custom sections
    let customIntro = '';
    let customSectionsBefore = '';
    let customSectionsAfter = '';

    if (enrichmentData) {
        // Custom intro
        if (enrichmentData.intro) {
            customIntro = enrichmentData.intro + '\n';
        }

        // Custom sections before steps
        if (enrichmentData.sections && enrichmentData.sections.before_steps && enrichmentData.sections.before_steps.length > 0) {
            customSectionsBefore = enrichmentData.sections.before_steps
                .map(section => `## ${section.title}\n\n${section.content}`)
                .join('\n\n') + '\n';
        }

        // Custom sections after steps
        if (enrichmentData.sections && enrichmentData.sections.after_steps && enrichmentData.sections.after_steps.length > 0) {
            customSectionsAfter = enrichmentData.sections.after_steps
                .map(section => `## ${section.title}\n\n${section.content}`)
                .join('\n\n') + '\n';
        }
    }

    // Replace placeholders
    let content = replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_SLUG': repoName,
        'DROPIN_PACKAGE': packageName,
        'DROPIN_VERSION': cleanVersion(versionInfo.requested),
        'CONTAINER_EXAMPLE': containerExample,
        'IMPORT_EXAMPLE': importExample,
        'INITIALIZER_NAME': initializerName,
        'REPO_URL': repoConfig.gitUrl.replace('.git', ''),
        'CONTAINER_COUNT': containers.length.toString(),
        'CUSTOM_INTRO': customIntro,
        'CUSTOM_SECTIONS_BEFORE': customSectionsBefore,
        'CUSTOM_SECTIONS_AFTER': customSectionsAfter
    });

    // Fix paths for B2B drop-ins: /dropins/ -> /dropins-b2b/
    // But keep /dropins/all/ as-is (shared documentation)
    if (repoConfig.type === 'B2B') {
        content = content.replace(/\/dropins\/(?!all\/)/g, '/dropins-b2b/');
    }

    return content;
}

// ============================================================================
// FRAMEWORK INTEGRATION
// ============================================================================

runGenerator({
    name: 'Quick Start',
    itemType: 'containers',
    loadEnrichments: loadInstallationEnrichments,
    scanRepo: scanForInstallation,
    generateContent: generateInstallationMDX,
    updateSidebar: updateSidebarForInstallation,
    outputFileName: 'quick-start.mdx'
});
