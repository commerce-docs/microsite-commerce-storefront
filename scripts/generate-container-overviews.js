#!/usr/bin/env node

/**
 * Generate Container Overview Files Only
 * 
 * This script generates ONLY the index.mdx overview files for container sections.
 * It's designed to run during the build process to ensure navigation works correctly.
 * 
 * These files are:
 * - Required by astro.config.mjs sidebar (prevent 404s)
 * - Ignored by git (in .gitignore)
 * - Preserved by rollback-docs
 * - Regenerated on each build (CI/CD, local builds)
 * 
 * USAGE:
 * - npm run generate-container-overviews
 * - Called automatically by prebuild hook
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Drop-ins with containers
const DROPINS_WITH_CONTAINERS = {
    'cart': { name: 'Cart', containers: 11 },
    'checkout': { name: 'Checkout', containers: 7 },
    'order': { name: 'Order', containers: 7 },
    'payment-services': { name: 'Payment Services', containers: 1 },
    'personalization': { name: 'Personalization', containers: 1 },
    'product-details': { name: 'Product Details', containers: 10 },
    'product-discovery': { name: 'Product Discovery', containers: 4 },
    'recommendations': { name: 'Recommendations', containers: 4 },
    'user-account': { name: 'User Account', containers: 5 },
    'user-auth': { name: 'User Auth', containers: 3 },
    'wishlist': { name: 'Wishlist', containers: 1 }
};

// Get version from boilerplate (simplified - just use placeholder)
function getVersion(dropinKey) {
    try {
        const boilerplatePath = join(projectRoot, '.temp-repos/boilerplate');
        if (!existsSync(boilerplatePath)) {
            return '1.0.0'; // Fallback
        }
        const packageJson = JSON.parse(
            readFileSync(join(boilerplatePath, 'package.json'), 'utf8')
        );
        const packageName = `@dropins/storefront-${dropinKey}`;
        const version = packageJson.dependencies?.[packageName] || '1.0.0';
        return version.replace(/[~^]/g, '');
    } catch {
        return '1.0.0';
    }
}

// Generate overview content
function generateOverviewContent(dropinKey, config) {
    const version = getVersion(dropinKey);

    return `---
title: ${config.name} Containers
description: Overview of containers available in the ${config.name} drop-in.
sidebar:
  label: Overview
  order: 1
---

import { Aside } from '@astrojs/starlight/components';

## Overview

The **${config.name}** drop-in provides **${config.containers}** pre-built container component${config.containers > 1 ? 's' : ''} for integrating into your storefront.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${version}</strong>
</div>

## What are Containers?

Containers are pre-built UI components that combine functionality, state management, and presentation. They provide a complete solution for specific features and can be customized through props, slots, and CSS.

## Available Containers

Refer to the sidebar for the complete list of ${config.containers} container${config.containers > 1 ? 's' : ''} available in this drop-in.

<Aside type="tip">
Each container is designed to work independently but can be composed together to create comprehensive user experiences.
</Aside>
`;
}

// Main function
console.log('\n📦 Generating container overview files...\n');

let generated = 0;
let skipped = 0;

for (const [key, config] of Object.entries(DROPINS_WITH_CONTAINERS)) {
    const outputDir = join(projectRoot, 'src/content/docs/dropins', key, 'containers');
    const outputPath = join(outputDir, 'index.mdx');

    // Create directory if it doesn't exist
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    // Generate content
    const content = generateOverviewContent(key, config);
    writeFileSync(outputPath, content, 'utf8');

    console.log(`  ✅ ${key}/containers/index.mdx`);
    generated++;
}

console.log(`\n✨ Generated ${generated} container overview file${generated !== 1 ? 's' : ''}!\n`);
console.log('💡 These files are in .gitignore and will be preserved by rollback-docs.\n');

