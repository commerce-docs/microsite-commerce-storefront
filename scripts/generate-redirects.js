import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const CONTENT_DIR = 'src/content/docs';
const PAGES_DIR = 'src/pages';
const REDIRECTS_CACHE = '.astro/redirects-cache.json';
const CONFIG_FILE = 'astro.config.mjs';

/**
 * Generate URL from file path
 */
function filePathToUrl(filePath) {
  return filePath
    .replace(/\.(astro|md|mdx)$/, '')
    .replace(/\/index$/, '')
    .replace(/\\/g, '/');
}

/**
 * Get all content files and their URLs
 */
async function getCurrentStructure() {
  const files = await glob('**/*.{astro,md,mdx}', {
    cwd: CONTENT_DIR,
    ignore: ['**/node_modules/**']
  });

  const structure = {};
  for (const file of files) {
    const url = '/' + filePathToUrl(file);
    structure[url] = file;
  }

  return structure;
}

/**
 * Load previously cached structure
 */
function loadCachedStructure() {
  if (!fs.existsSync(REDIRECTS_CACHE)) {
    return {};
  }
  
  try {
    return JSON.parse(fs.readFileSync(REDIRECTS_CACHE, 'utf8'));
  } catch (error) {
    console.warn('Failed to load cached structure:', error.message);
    return {};
  }
}

/**
 * Save current structure to cache
 */
function saveCachedStructure(structure) {
  const cacheDir = path.dirname(REDIRECTS_CACHE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  fs.writeFileSync(REDIRECTS_CACHE, JSON.stringify(structure, null, 2));
}

/**
 * Detect potential redirects by comparing structures
 */
function detectRedirects(oldStructure, newStructure) {
  const redirects = {};
  const oldUrls = Object.keys(oldStructure);
  const newUrls = Object.keys(newStructure);
  
  // Find URLs that no longer exist
  const removedUrls = oldUrls.filter(url => !newUrls.includes(url));
  
  for (const removedUrl of removedUrls) {
    const oldFile = oldStructure[removedUrl];
    
    // Try to find similar files in new structure
    const potentialMatches = newUrls.filter(newUrl => {
      const newFile = newStructure[newUrl];
      const oldBasename = path.basename(oldFile, path.extname(oldFile));
      const newBasename = path.basename(newFile, path.extname(newFile));
      
      // Check if it's likely the same content moved
      return oldBasename === newBasename || 
             newFile.includes(oldBasename) ||
             oldFile.includes(newBasename);
    });
    
    if (potentialMatches.length === 1) {
      redirects[removedUrl] = potentialMatches[0];
    } else if (potentialMatches.length > 1) {
      console.warn(`Multiple potential matches for ${removedUrl}:`, potentialMatches);
      console.warn('Manual review required.');
    }
  }
  
  return redirects;
}

/**
 * Update astro.config.mjs with new redirects
 */
function updateAstroConfig(newRedirects) {
  if (Object.keys(newRedirects).length === 0) {
    console.log('No new redirects to add.');
    return;
  }

  let configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  
  // Find the redirects section
  const redirectsRegex = /redirects:\s*{([^}]*)}/s;
  const match = configContent.match(redirectsRegex);
  
  if (match) {
    // Parse existing redirects
    const existingRedirectsStr = match[1];
    const existingRedirects = {};
    
    // Simple parsing - in production, you might want to use a proper AST parser
    const lines = existingRedirectsStr.split('\n').map(line => line.trim()).filter(Boolean);
    for (const line of lines) {
      const redirectMatch = line.match(/['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]/);
      if (redirectMatch) {
        existingRedirects[redirectMatch[1]] = redirectMatch[2];
      }
    }
    
    // Merge with new redirects
    const allRedirects = { ...existingRedirects, ...newRedirects };
    
    // Generate new redirects string
    const redirectEntries = Object.entries(allRedirects)
      .map(([from, to]) => `      '${from}': '${to}'`)
      .join(',\n');
    
    const newRedirectsBlock = `redirects: {\n${redirectEntries}\n    }`;
    configContent = configContent.replace(redirectsRegex, newRedirectsBlock);
  } else {
    // Add redirects section if it doesn't exist
    console.warn('Redirects section not found in astro.config.mjs');
    console.log('New redirects to add:', newRedirects);
    return;
  }
  
  fs.writeFileSync(CONFIG_FILE, configContent);
  console.log(`Added ${Object.keys(newRedirects).length} new redirects to astro.config.mjs`);
  
  // Log the new redirects for review
  console.log('New redirects:');
  Object.entries(newRedirects).forEach(([from, to]) => {
    console.log(`  ${from} → ${to}`);
  });
}

/**
 * Main function
 */
async function generateRedirects() {
  console.log('Analyzing file structure for redirect generation...');
  
  const oldStructure = loadCachedStructure();
  const newStructure = await getCurrentStructure();
  
  if (Object.keys(oldStructure).length === 0) {
    console.log('No cached structure found. Saving current structure as baseline.');
    saveCachedStructure(newStructure);
    return;
  }
  
  const detectedRedirects = detectRedirects(oldStructure, newStructure);
  
  if (Object.keys(detectedRedirects).length > 0) {
    console.log('Detected potential redirects:');
    Object.entries(detectedRedirects).forEach(([from, to]) => {
      console.log(`  ${from} → ${to}`);
    });
    
    // In Git hook mode (non-interactive), auto-apply redirects
    if (!process.stdout.isTTY || process.env.GIT_HOOK_MODE) {
      console.log('🔄 Auto-applying redirects (Git hook mode)...');
      updateAstroConfig(detectedRedirects);
    } else {
      // Ask for confirmation in interactive mode
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Apply these redirects? (y/n): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        updateAstroConfig(detectedRedirects);
      } else {
        console.log('Redirects not applied.');
        console.log('💡 Tip: You can add them manually to astro.config.mjs:');
        Object.entries(detectedRedirects).forEach(([from, to]) => {
          console.log(`  '${from}': \`\${basePath}${to}\`,`);
        });
      }
    }
  } else {
    console.log('No redirects detected.');
  }
  
  // Update cache with current structure
  saveCachedStructure(newStructure);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRedirects().catch(console.error);
}

export { generateRedirects }; 