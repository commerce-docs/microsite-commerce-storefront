import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

// Configuration
const CONTENT_DIRS = ['src/content/docs', 'src/pages'];
const CONFIG_FILE = 'astro.config.mjs';

/**
 * Convert file path to URL path
 */
function filePathToUrl(filePath) {
  // Remove file extension and convert to URL format
  return '/' + filePath
    .replace(/^src\/(content\/docs|pages)\//, '')
    .replace(/\.(mdx?|astro)$/, '')
    .replace(/\/index$/, '');
}

/**
 * Get moved/renamed files from Git
 */
function getMovedFilesFromGit() {
  try {
    // Check if we're in a Git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    
    // Get staged changes (for pre-commit hook)
    let gitCommand = 'git diff --cached --name-status --diff-filter=R';
    let output;
    
    try {
      output = execSync(gitCommand, { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      // If no staged changes, check working directory changes
      gitCommand = 'git diff --name-status --diff-filter=R';
      try {
        output = execSync(gitCommand, { encoding: 'utf8', stdio: 'pipe' });
      } catch (error2) {
        // If still no changes, check recent commits
        gitCommand = 'git diff HEAD~1 --name-status --diff-filter=R';
        try {
          output = execSync(gitCommand, { encoding: 'utf8', stdio: 'pipe' });
        } catch (error3) {
          return [];
        }
      }
    }
    
    const moves = [];
    const lines = output.trim().split('\n').filter(line => line);
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 3 && parts[0].startsWith('R')) {
        const oldPath = parts[1];
        const newPath = parts[2];
        
        // Only process content files
        const isContentFile = CONTENT_DIRS.some(dir => 
          oldPath.startsWith(dir) && newPath.startsWith(dir)
        );
        
        if (isContentFile) {
          moves.push({
            oldPath,
            newPath,
            oldUrl: filePathToUrl(oldPath),
            newUrl: filePathToUrl(newPath)
          });
        }
      }
    }
    
    return moves;
  } catch (error) {
    console.log('Not in a Git repository or no Git changes detected.');
    return [];
  }
}

/**
 * Get deleted files that might need redirects
 */
function getDeletedFilesFromGit() {
  try {
    // Check staged deletions first
    let gitCommand = 'git diff --cached --name-status --diff-filter=D';
    let output;
    
    try {
      output = execSync(gitCommand, { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      // Check working directory deletions
      gitCommand = 'git diff --name-status --diff-filter=D';
      try {
        output = execSync(gitCommand, { encoding: 'utf8', stdio: 'pipe' });
      } catch (error2) {
        return [];
      }
    }
    
    const deletions = [];
    const lines = output.trim().split('\n').filter(line => line);
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 2 && parts[0] === 'D') {
        const deletedPath = parts[1];
        
        // Only process content files
        const isContentFile = CONTENT_DIRS.some(dir => deletedPath.startsWith(dir));
        
        if (isContentFile) {
          deletions.push({
            deletedPath,
            deletedUrl: filePathToUrl(deletedPath)
          });
        }
      }
    }
    
    return deletions;
  } catch (error) {
    return [];
  }
}

/**
 * Find current content files
 */
function getCurrentFiles() {
  const files = [];
  
  for (const dir of CONTENT_DIRS) {
    if (fs.existsSync(dir)) {
      const findFiles = (currentDir) => {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            findFiles(fullPath);
          } else if (item.match(/\.(mdx?|astro)$/)) {
            files.push({
              path: fullPath.replace(/\\/g, '/'),
              url: filePathToUrl(fullPath.replace(/\\/g, '/'))
            });
          }
        }
      };
      
      findFiles(dir);
    }
  }
  
  return files;
}

/**
 * Generate redirects from Git changes
 */
function generateRedirectsFromGit() {
  const redirects = {};
  
  // Get moved/renamed files
  const moves = getMovedFilesFromGit();
  for (const move of moves) {
    redirects[move.oldUrl] = `\`\${basePath}${move.newUrl}\``;
    console.log(`📝 Detected move: ${move.oldUrl} → ${move.newUrl}`);
  }
  
  // Get deleted files (these might need manual attention)
  const deletions = getDeletedFilesFromGit();
  if (deletions.length > 0) {
    console.log('\n⚠️  Deleted files detected (may need manual redirect setup):');
    for (const deletion of deletions) {
      console.log(`   ${deletion.deletedUrl} (was: ${deletion.deletedPath})`);
    }
  }
  
  return redirects;
}

/**
 * Read existing redirects from astro.config.mjs
 */
function getExistingRedirects() {
  try {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    
    // More robust regex to capture the entire redirects block
    const redirectsMatch = configContent.match(/redirects:\s*\{([\s\S]*?)\n\s{4}\}/);
    
    if (!redirectsMatch) {
      return {};
    }
    
    const redirectsSection = redirectsMatch[1];
    const redirects = {};
    
    // Parse existing redirects with better regex that handles multiline
    const redirectLines = redirectsSection.match(/'[^']+'\s*:\s*`[^`]*`/g) || [];
    
    for (const line of redirectLines) {
      const match = line.match(/'([^']+)'\s*:\s*`([^`]*)`/);
      if (match) {
        redirects[match[1]] = `\`${match[2]}\``;
      }
    }
    
    return redirects;
  } catch (error) {
    console.error('Error reading existing redirects:', error.message);
    return {};
  }
}

/**
 * Update astro.config.mjs with new redirects
 */
function updateAstroConfig(newRedirects) {
  try {
    let configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    const existingRedirects = getExistingRedirects();
    
    // Merge redirects
    const allRedirects = { ...existingRedirects, ...newRedirects };
    
    // Build redirects section
    const redirectEntries = Object.entries(allRedirects)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([from, to]) => `      '${from}': ${to}`)
      .join(',\n');
    
    const redirectsSection = `redirects: {\n${redirectEntries}\n    }`;
    
    // More robust regex to match the entire redirects block including nested braces
    const redirectsRegex = /redirects:\s*\{[\s\S]*?\n\s{4}\}/;
    
    if (redirectsRegex.test(configContent)) {
      configContent = configContent.replace(redirectsRegex, redirectsSection);
    } else {
      // If no redirects section exists, add it before integrations
      const insertPoint = configContent.indexOf('integrations:');
      if (insertPoint !== -1) {
        const beforeIntegrations = configContent.substring(0, insertPoint);
        const afterIntegrations = configContent.substring(insertPoint);
        configContent = beforeIntegrations + redirectsSection + ',\n    ' + afterIntegrations;
      }
    }
    
    fs.writeFileSync(CONFIG_FILE, configContent);
    console.log(`✅ Updated ${CONFIG_FILE} with ${Object.keys(newRedirects).length} new redirects`);
    
    return true;
  } catch (error) {
    console.error('Error updating astro.config.mjs:', error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Analyzing Git changes for redirect generation...');
  
  const newRedirects = generateRedirectsFromGit();
  
  if (Object.keys(newRedirects).length === 0) {
    console.log('No file moves detected. No redirects needed.');
    return;
  }
  
  console.log(`\n📋 Generated ${Object.keys(newRedirects).length} redirects:`);
  Object.entries(newRedirects).forEach(([from, to]) => {
    console.log(`   ${from} → ${to.replace('${basePath}', '[basePath]')}`);
  });
  
  // In Git hook mode, automatically apply
  if (process.env.GIT_HOOK_MODE === '1') {
    console.log('\n🔄 Applying redirects automatically (Git hook mode)...');
    if (updateAstroConfig(newRedirects)) {
      console.log('✅ Redirects applied successfully!');
      
      // Stage the updated config file
      try {
        execSync('git add astro.config.mjs', { stdio: 'ignore' });
        console.log('✅ astro.config.mjs staged for commit');
      } catch (error) {
        console.log('⚠️  Could not stage astro.config.mjs (not in Git hook?)');
      }
    }
  } else {
    // Interactive mode - ask for confirmation
    if (process.stdout.isTTY) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('\nApply these redirects? (y/n): ', (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          if (updateAstroConfig(newRedirects)) {
            console.log('✅ Redirects applied successfully!');
          }
        } else {
          console.log('Redirects not applied.');
        }
      });
    } else {
      // Non-interactive mode - just show suggestions
      console.log('\nSuggested redirects (review and apply manually):');
      Object.entries(newRedirects).forEach(([from, to]) => {
        console.log(`'${from}': ${to},`);
      });
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  generateRedirectsFromGit,
  updateAstroConfig,
  getMovedFilesFromGit,
  getDeletedFilesFromGit
}; 