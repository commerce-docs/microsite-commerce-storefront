import type { AstroIntegration } from 'astro';
import fs from 'fs';
import path from 'path';

interface RedirectValidatorOptions {
  logLevel?: 'info' | 'warn' | 'error';
  failOnBrokenRedirects?: boolean;
  generateReport?: boolean;
}

export function redirectValidator(options: RedirectValidatorOptions = {}): AstroIntegration {
  const {
    logLevel = 'warn',
    failOnBrokenRedirects = false,
    generateReport = true
  } = options;

  return {
    name: 'redirect-validator',
    hooks: {
      'astro:build:start': ({ logger }) => {
        logger.info('Starting redirect validation...');
      },
      
      'astro:build:done': async ({ dir, pages, logger }) => {
        // Get all built pages
        const builtPages = new Set(pages.map(page => page.pathname));
        
        // Load redirects from config
        const redirects = await loadRedirectsFromConfig();
        
        const validationResults = {
          valid: [] as Array<{ from: string; to: string }>,
          broken: [] as Array<{ from: string; to: string; reason: string }>,
          loops: [] as Array<{ chain: string[] }>,
          warnings: [] as string[]
        };

        // Validate each redirect
        for (const [from, to] of Object.entries(redirects)) {
          const validation = validateRedirect(from, to, redirects, builtPages);
          
          if (validation.isValid) {
            validationResults.valid.push({ from, to });
          } else {
            validationResults.broken.push({ 
              from, 
              to, 
              reason: validation.reason || 'Unknown error' 
            });
          }
        }

        // Check for redirect loops
        const loops = detectRedirectLoops(redirects);
        validationResults.loops = loops;

        // Generate report
        if (generateReport) {
          await generateValidationReport(validationResults, dir);
        }

        // Log results
        logValidationResults(validationResults, logger, logLevel);

        // Fail build if requested and there are issues
        if (failOnBrokenRedirects && 
            (validationResults.broken.length > 0 || validationResults.loops.length > 0)) {
          throw new Error('Redirect validation failed. Check the validation report for details.');
        }
      }
    }
  };
}

async function loadRedirectsFromConfig(): Promise<Record<string, string>> {
  try {
    // This is a simplified approach - in a real implementation, 
    // you'd want to properly parse the Astro config
    const configContent = fs.readFileSync('astro.config.mjs', 'utf8');
    const redirectsMatch = configContent.match(/redirects:\s*{([^}]*)}/s);
    
    if (!redirectsMatch) {
      return {};
    }

    const redirectsStr = redirectsMatch[1];
    const redirects: Record<string, string> = {};
    
    // Simple regex parsing - for production, use a proper AST parser
    const redirectPattern = /['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = redirectPattern.exec(redirectsStr)) !== null) {
      redirects[match[1]] = match[2];
    }
    
    return redirects;
  } catch (error) {
    console.warn('Failed to load redirects from config:', error);
    return {};
  }
}

function validateRedirect(
  from: string, 
  to: string, 
  allRedirects: Record<string, string>, 
  builtPages: Set<string>
): { isValid: boolean; reason?: string } {
  // Check if target is external URL
  if (to.startsWith('http://') || to.startsWith('https://')) {
    return { isValid: true }; // Assume external URLs are valid
  }

  // Normalize the target path
  const normalizedTo = to.startsWith('/') ? to : `/${to}`;
  
  // Check if target page exists
  if (builtPages.has(normalizedTo) || builtPages.has(`${normalizedTo}/`)) {
    return { isValid: true };
  }

  // Check if target is another redirect
  if (allRedirects[normalizedTo]) {
    return { isValid: true }; // Chain will be validated separately
  }

  return { 
    isValid: false, 
    reason: `Target page '${to}' does not exist` 
  };
}

function detectRedirectLoops(redirects: Record<string, string>): Array<{ chain: string[] }> {
  const loops: Array<{ chain: string[] }> = [];
  
  for (const [startPath] of Object.entries(redirects)) {
    const visited = new Set<string>();
    const chain: string[] = [];
    let currentPath = startPath;
    
    while (currentPath && redirects[currentPath]) {
      if (visited.has(currentPath)) {
        // Found a loop
        const loopStart = chain.indexOf(currentPath);
        if (loopStart !== -1) {
          loops.push({ chain: chain.slice(loopStart) });
        }
        break;
      }
      
      visited.add(currentPath);
      chain.push(currentPath);
      currentPath = redirects[currentPath];
      
      // Prevent infinite loops during detection
      if (chain.length > 50) {
        loops.push({ chain: [...chain, 'Possible infinite loop detected'] });
        break;
      }
    }
  }
  
  return loops;
}

async function generateValidationReport(
  results: any, 
  buildDir: URL
): Promise<void> {
  const reportPath = path.join(buildDir.pathname, 'redirect-validation-report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.valid.length + results.broken.length,
      valid: results.valid.length,
      broken: results.broken.length,
      loops: results.loops.length
    },
    details: results
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Redirect validation report saved to: ${reportPath}`);
}

function logValidationResults(
  results: any, 
  logger: any, 
  logLevel: string
): void {
  const total = results.valid.length + results.broken.length;
  
  if (results.broken.length === 0 && results.loops.length === 0) {
    logger.info(`✅ All ${total} redirects are valid`);
    return;
  }

  if (results.broken.length > 0) {
    const message = `❌ Found ${results.broken.length} broken redirects:`;
    
    if (logLevel === 'error') {
      logger.error(message);
    } else {
      logger.warn(message);
    }
    
    results.broken.forEach((redirect: any) => {
      logger.warn(`  ${redirect.from} → ${redirect.to} (${redirect.reason})`);
    });
  }

  if (results.loops.length > 0) {
    logger.warn(`🔄 Found ${results.loops.length} redirect loops:`);
    results.loops.forEach((loop: any) => {
      logger.warn(`  ${loop.chain.join(' → ')}`);
    });
  }
}

export default redirectValidator; 