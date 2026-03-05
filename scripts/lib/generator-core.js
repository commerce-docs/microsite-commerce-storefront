/**
 * Generator Core
 * 
 * Core framework for all documentation generators.
 * Handles CLI parsing, boilerplate setup, and output generation.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { mergePreservingPreamble } from './preserve-preamble.js';
import { isPathPreserved } from './preserve-paths.js';
import { fileURLToPath } from 'url';
import { cloneDropinAtVersion, useExistingDropinRepo } from './repository.js';

/**
 * Determine which boilerplate branch to use based on drop-in types being processed
 * @param {Array<string>} dropinNames - Array of dropin names being processed
 * @param {Object} repoConfig - Repository configuration
 * @returns {string|null} - Branch name or null for latest release
 */
export function getBoilerplateBranch(dropinNames, repoConfig) {
    // Always use latest release tag for main boilerplate checkout.
    // B2B versions are loaded via git show origin/b2b in populateDropinVersions.
    return null;
}

/**
 * Setup boilerplate repository
 * @param {string} boilerplatePath - Path to boilerplate repo
 * @param {string|null} branch - Branch to checkout (null for latest release)
 * @returns {Promise<void>}
 */
export async function setupBoilerplate(boilerplatePath, branch = null) {
    const { execSync } = await import('child_process');

    if (!existsSync(boilerplatePath)) {
        console.log('📦 Cloning boilerplate repository...');
        execSync(
            'git clone https://github.com/hlxsites/aem-boilerplate-commerce.git boilerplate',
            { cwd: join(boilerplatePath, '..'), stdio: 'inherit' }
        );
    }

    // Fetch latest changes
    console.log('🔄 Fetching latest changes from boilerplate...');
    execSync('git fetch --all --tags', { cwd: boilerplatePath, stdio: 'inherit' });

    if (branch) {
        console.log(`📍 Checking out branch: ${branch}`);
        execSync(`git checkout ${branch}`, { cwd: boilerplatePath, stdio: 'inherit' });
        execSync('git pull origin ' + branch, { cwd: boilerplatePath, stdio: 'inherit' });
    } else {
        // Checkout latest release tag
        console.log('📍 Checking out latest release tag...');
        const latestTag = execSync('git describe --tags --abbrev=0', {
            cwd: boilerplatePath
        }).toString().trim();
        execSync(`git checkout ${latestTag}`, { cwd: boilerplatePath, stdio: 'inherit' });
    }
}

/**
 * Load package versions from boilerplate package.json
 * @param {string} boilerplatePath - Path to boilerplate repo
 * @param {string} branch - Branch to read package.json from
 * @returns {Object} - Package dependencies object
 */
export async function loadPackageVersions(boilerplatePath, branch) {
    const { readFileSync } = await import('fs');
    const { execSync } = await import('child_process');

    try {
        if (branch) {
            // Load from specific branch without checking it out
            console.log(`📦 Loading package versions from ${branch} branch...`);
            const packageJsonContent = execSync(
                `git show origin/${branch}:package.json`,
                { cwd: boilerplatePath, encoding: 'utf8', stdio: 'pipe' }
            );
            const packageJson = JSON.parse(packageJsonContent);
            return packageJson.dependencies || {};
        } else {
            // Load from current checkout
            const packageJsonPath = join(boilerplatePath, 'package.json');
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            return packageJson.dependencies || {};
        }
    } catch (error) {
        console.error(`  ⚠️  Warning: Could not load versions from ${branch || 'current branch'}: ${error.message}`);
        return {};
    }
}

/**
 * Load project package versions from package.json (dependencies + devDependencies)
 * @param {string} projectRoot - Path to project root
 * @returns {Object} - Package dependencies object
 */
function loadProjectPackageVersions(projectRoot) {
    const packageJsonPath = join(projectRoot, 'package.json');
    try {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        return { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    } catch {
        return {};
    }
}

/**
 * Populate drop-in versions from boilerplate, preferring project package.json when available
 * @param {Array<Object>} dropins - Array of drop-in configurations
 * @param {string} boilerplatePath - Path to boilerplate repo
 * @param {string} [projectRoot] - Optional project root; when provided, project versions take precedence
 * @returns {Promise<Array<Object>>} - Drop-ins with version property added
 */
export async function populateDropinVersions(dropins, boilerplatePath, projectRoot = null) {
    // Load versions from both main branch (B2C) and b2b branch (B2B) via git show
    // so we don't depend on current checkout state
    const b2cVersions = await loadPackageVersions(boilerplatePath, 'main');
    const b2bVersions = await loadPackageVersions(boilerplatePath, 'b2b');

    // Merge both version sets (B2B versions take precedence)
    let allVersions = { ...b2cVersions, ...b2bVersions };

    // Prefer project package.json versions when available (project docs reflect installed versions)
    if (projectRoot) {
        const projectVersions = loadProjectPackageVersions(projectRoot);
        allVersions = { ...allVersions, ...projectVersions };
    }

    // Add version to each drop-in
    return dropins.map(dropin => {
        const version = allVersions[dropin.packageName];
        if (version) {
            // Clean version string (remove ~ ^ etc)
            const cleanVersion = version.replace(/[~^]/g, '');
            return { ...dropin, version: cleanVersion };
        }
        return { ...dropin, version: '0.0.0' };
    });
}

/**
 * Parse CLI arguments
 * @param {Array<string>} args - Process arguments
 * @returns {Object} - Parsed arguments { type: 'B2B'|'B2C'|'all', dropins: Array<string> }
 */
export function parseCliArgs(args) {
    const typeArg = args.find(arg => arg.startsWith('--type='));
    const dropinsArg = args.find(arg => arg.startsWith('--dropins='));

    const type = typeArg ? typeArg.split('=')[1] : 'all';
    const dropins = dropinsArg ? dropinsArg.split('=')[1].split(',') : [];

    return { type, dropins };
}

/**
 * Filter drop-ins by type
 * @param {Array<Object>} allDropins - All drop-ins from config
 * @param {string} type - Type filter: 'B2B', 'B2C', or 'all'
 * @param {Array<string>} specificDropins - Specific drop-in names to include
 * @returns {Array<Object>} - Filtered drop-ins
 */
export function filterDropinsByType(allDropins, type, specificDropins = []) {
    let filtered = allDropins;

    // Filter by type
    if (type !== 'all') {
        filtered = filtered.filter(d => d.type === type);
    }

    // Filter by specific names if provided
    if (specificDropins.length > 0) {
        filtered = filtered.filter(d => specificDropins.includes(d.name));
    }

    return filtered;
}

/**
 * Get drop-in repository path
 * @param {string} dropinName - Drop-in name (e.g., 'cart', 'purchase-order')
 * @param {string} tempReposDir - Base directory for temp repos
 * @returns {string} - Full path to drop-in repo
 */
export function getDropinRepoPath(dropinName, tempReposDir) {
    return join(tempReposDir, dropinName);
}

/**
 * Get drop-in output path
 * @param {string} dropinName - Drop-in name
 * @param {string} type - Drop-in type ('B2B' or 'B2C')
 * @param {string} contentDir - Base content directory
 * @returns {string} - Full path to output directory
 */
export function getDropinOutputPath(dropinName, type, contentDir) {
    const baseDir = type === 'B2B' ? 'dropins-b2b' : 'dropins';
    return join(contentDir, baseDir, dropinName);
}

/**
 * Log generation start
 * @param {string} generatorName - Name of the generator
 * @param {Array<Object>} dropins - Drop-ins being processed
 */
export function logGenerationStart(generatorName, dropins) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 ${generatorName} Generator`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Processing ${dropins.length} drop-in(s):`);
    dropins.forEach(d => {
        console.log(`  - ${d.name} (${d.type})`);
    });
    console.log('');
}

/**
 * Log generation complete
 * @param {string} generatorName - Name of the generator
 * @param {number} successCount - Number of successful generations
 * @param {number} totalCount - Total number of drop-ins processed
 */
export function logGenerationComplete(generatorName, successCount, totalCount) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ ${generatorName} Generator Complete`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Successfully processed: ${successCount}/${totalCount} drop-in(s)\n`);
}

/**
 * Log error during generation
 * @param {string} dropinName - Name of the drop-in that failed
 * @param {Error} error - Error object
 */
export function logGenerationError(dropinName, error) {
    console.error(`\n❌ Error processing ${dropinName}:`);
    console.error(error.message);
    if (error.stack) {
        console.error(error.stack);
    }
}

/**
 * Get the project root directory
 * @returns {string} Path to project root
 */
export function getProjectRoot() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // From scripts/lib/ go up two levels to project root
    return join(__dirname, '..', '..');
}

/**
 * Main generator framework function
 * Handles CLI parsing, repository scanning, content generation, and file writing
 * 
 * @param {Object} config - Generator configuration
 * @param {string} config.name - Generator name (e.g., 'Dictionary')
 * @param {string} config.itemType - Type of items being generated (e.g., 'dictionary keys')
 * @param {Function} config.loadEnrichments - Function to load enrichment data
 * @param {Function} config.scanRepo - Function to scan repository for data
 * @param {Function} config.generateContent - Function to generate MDX content
 * @param {Function} config.updateSidebar - Function to update sidebar
 * @param {string} config.outputFileName - Output filename (e.g., 'dictionary.mdx')
 * @param {{ anchorHeading?: string }} [config.mergeOptions] - When set, mergePreservingPreamble
 *   preserves everything before ## anchorHeading in existing files (e.g. 'Quick example' for quick-start).
 */
export async function runGenerator(config) {
    const { DROPIN_REPOS } = await import('./dropin-config.js');

    const args = parseCliArgs(process.argv.slice(2));
    const projectRoot = getProjectRoot();
    const tempReposDir = join(projectRoot, '.temp-repos');
    const contentDir = join(projectRoot, 'src', 'content', 'docs');

    // Convert DROPIN_REPOS to array format
    const dropins = Object.entries(DROPIN_REPOS).map(([name, info]) => ({
        name,
        ...info
    }));

    // Determine boilerplate branch
    const allDropinNames = dropins.map(d => d.name);
    const repoConfig = { dropins };
    const boilerplateBranch = getBoilerplateBranch(allDropinNames, repoConfig);
    const boilerplatePath = join(tempReposDir, 'boilerplate');

    // Setup boilerplate
    await setupBoilerplate(boilerplatePath, boilerplateBranch);

    // Populate drop-in versions from boilerplate (project package.json takes precedence)
    const dropinsWithVersions = await populateDropinVersions(dropins, boilerplatePath, projectRoot);
    repoConfig.dropins = dropinsWithVersions;

    // Filter dropins
    let targetDropins = filterDropinsByType(
        repoConfig.dropins,
        args.type,
        args.dropins
    );

    // Exclude drop-ins that this generator should skip
    if (config.skipDropins && config.skipDropins.length > 0) {
        const skipSet = new Set(config.skipDropins);
        targetDropins = targetDropins.filter(d => !skipSet.has(d.name));
    }

    logGenerationStart(config.name, targetDropins);

    let successCount = 0;

    for (const dropin of targetDropins) {
        try {
            // Ensure drop-in repo exists at correct version (boilerplate-aligned) before scanning
            const { path: repoPath } = (dropin.version && dropin.version !== '0.0.0')
                ? cloneDropinAtVersion(dropin.name, dropin, dropin.version)
                : useExistingDropinRepo(dropin.name, dropin);

            // Scan repository
            const data = config.scanRepo(repoPath);

            // Load enrichments if provided
            const enrichmentData = config.loadEnrichments ? config.loadEnrichments(dropin.name) : null;

            // Get version info
            const versionInfo = {
                actual: dropin.version || '0.0.0',
                clean: (dropin.version || '0.0.0').replace(/[^0-9.]/g, '')
            };

            // Generate content
            const content = config.generateContent(
                dropin.name,
                dropin,
                data,
                versionInfo,
                enrichmentData
            );

            // Write output - use custom handler if provided, otherwise default
            if (config.writeOutput) {
                // Custom write handler (e.g., for multi-file generators like containers)
                // Pass parameters that match the expected signature
                config.writeOutput(dropin.name, dropin, content, versionInfo);
            } else {
                // Default single-file write
                const outputDir = getDropinOutputPath(dropin.name, dropin.type, contentDir);
                const outputPath = join(outputDir, config.outputFileName);
                if (isPathPreserved(outputPath)) {
                    console.log(`   ⏭️  Skipped (preserve-paths): ${dropin.name}/${config.outputFileName}`);
                } else {
                    mkdirSync(outputDir, { recursive: true });
                    const mergeOptions = config.mergeOptions || {};
                    const finalContent = (outputPath.endsWith('.mdx') || outputPath.endsWith('.md'))
                        ? mergePreservingPreamble(outputPath, content, mergeOptions)
                        : content;
                    writeFileSync(outputPath, finalContent, 'utf8');
                }
            }

            successCount++;

        } catch (error) {
            logGenerationError(dropin.name, error);
        }
    }

    // Update sidebar
    if (config.updateSidebar) {
        config.updateSidebar(projectRoot, targetDropins);
    }

    logGenerationComplete(config.name, successCount, targetDropins.length);
}

export default {
    getBoilerplateBranch,
    setupBoilerplate,
    loadPackageVersions,
    populateDropinVersions,
    parseCliArgs,
    filterDropinsByType,
    getDropinRepoPath,
    getDropinOutputPath,
    logGenerationStart,
    logGenerationComplete,
    logGenerationError,
    getProjectRoot,
    runGenerator,
};

