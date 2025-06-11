#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Detect the current environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isGitHub = NODE_ENV === 'github';

// Determine base path (matching astro.config.mjs logic)
const basePath = isProduction
  ? '/developer/commerce/storefront'
  : isGitHub
    ? process.env.VITE_GITHUB_BASE_PATH || '/microsite-commerce-storefront'
    : '/microsite-commerce-storefront';

// Sample of your redirects to test (with dynamic base paths)
const redirectsToTest = [
  ['/customize', `${basePath}/dropins/all/introduction`],
  ['/customize/design-tokens', `${basePath}/dropins/all/branding`],
  ['/faq', `${basePath}/troubleshooting/faq`],
  ['/get-started/requirements', `${basePath}/setup/discovery/architecture`],
  ['/product-details/pdp-installation', `${basePath}/dropins/product-details/installation`],
  ['/config/commerce-configuration', `${basePath}/setup/configuration/commerce-configuration`],
  ['/discovery/architecture', `${basePath}/setup/discovery/architecture`],
  ['/merchants/multistore', `${basePath}/merchants/get-started/multistore`]
];

// Try common development ports (include more ports and prioritize recently used ones)
const PORTS_TO_TRY = [4325, 4324, 4323, 4321, 4322, 4326, 4327];

// Function to find active dev server (not production preview)
async function findActiveServer() {
  for (const port of PORTS_TO_TRY) {
    try {
      const testUrl = `http://localhost:${port}`;
      const { stdout } = await execAsync(`curl -s -I ${testUrl} --max-time 2`);
      
      // Check if server is responding
      if (stdout.includes('200') || stdout.includes('404')) {
        // Test if this server has redirects configured
        try {
          const redirectTest = await execAsync(`curl -s -I ${testUrl}/customize --max-time 2`);
          if (redirectTest.stdout.includes('308') || redirectTest.stdout.includes('301')) {
            return testUrl; // This server has redirects working
          }
        } catch (redirectError) {
          // If redirect test fails, continue to next port
        }
        
        // If no redirects found but server is responding, still consider it
        // (might be a server without redirects configured)
        if (!stdout.includes('404')) {
          return testUrl;
        }
      }
    } catch (error) {
      // Port not available, try next
      continue;
    }
  }
  throw new Error(`No development server found on ports: ${PORTS_TO_TRY.join(', ')}. Please start your dev server with: pnpm dev`);
}

async function testRedirects() {
  console.log(`🔍 Testing redirects for environment: ${NODE_ENV}`);
  console.log(`📁 Base path: ${basePath}`);
  
  let BASE_URL;
  try {
    BASE_URL = await findActiveServer();
    console.log(`🌐 Found dev server at: ${BASE_URL}\n`);
  } catch (error) {
    console.log(`❌ ${error.message}`);
    process.exit(1);
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const [from, expectedTo] of redirectsToTest) {
    try {
      const { stdout } = await execAsync(`curl -s -I "${BASE_URL}${from}"`);
      
      if (stdout.includes('308 Permanent Redirect') || stdout.includes('301 Moved Permanently')) {
        const locationMatch = stdout.match(/location: (.+)/i);
        const actualTo = locationMatch ? locationMatch[1].trim() : 'unknown';
        
        if (actualTo === expectedTo) {
          console.log(`✅ ${from} → ${actualTo}`);
          passed++;
        } else {
          console.log(`❌ ${from} → ${actualTo} (expected: ${expectedTo})`);
          failed++;
        }
      } else {
        console.log(`❌ ${from} → No redirect found`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${from} → Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All redirects working perfectly!');
  } else {
    console.log('⚠️  Some redirects need attention.');
  }
}

testRedirects().catch(console.error); 