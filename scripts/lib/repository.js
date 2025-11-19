/**
 * Repository Management Module
 * 
 * Provides utilities for managing git repositories including:
 * - Cloning and updating the boilerplate repository
 * - Extracting package versions from boilerplate
 * - Cloning drop-in repositories at specific versions
 * 
 * All repositories are stored in .temp-repos/ directory
 */

import { readFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { cleanVersion } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

/**
 * Get the latest release tag from the boilerplate repository
 * 
 * @param {string} boilerplatePath - Path to the boilerplate repository
 * @returns {string} Latest tag name
 */
function getLatestBoilerplateTag(boilerplatePath) {
    try {
        // Fetch all tags
        execFileSync('git', ['fetch', '--tags'], { cwd: boilerplatePath, stdio: 'pipe' });

        // Get the latest tag (sorted by version)
        const latestTag = execFileSync('git', ['describe', '--tags', '--abbrev=0'],
            { cwd: boilerplatePath, encoding: 'utf8' }).trim();

        return latestTag;
    } catch (error) {
        console.warn(`  ⚠️  Could not determine latest tag, falling back to main branch`);
        return 'main';
    }
}

/**
 * Clone or update the boilerplate repository at the latest release tag or specific branch
 * 
 * @param {string} [branch] - Optional branch name (e.g., 'b2b-integration'). If not provided, uses latest release tag.
 * @returns {Object} Object with path and tag/branch
 */
export function cloneOrUpdateBoilerplate(branch = null) {
    const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');
    const boilerplateUrl = 'https://github.com/hlxsites/aem-boilerplate-commerce.git';

    console.log(`\n📦 Setting up boilerplate repository...`);

    if (!existsSync(boilerplatePath)) {
        console.log(`  Cloning boilerplate...`);
        mkdirSync(dirname(boilerplatePath), { recursive: true });
        // Clone without specifying a branch to get all tags
        execFileSync('git', ['clone', boilerplateUrl, boilerplatePath], { stdio: 'pipe' });
    } else {
        console.log(`  Fetching latest boilerplate changes...`);
        execFileSync('git', ['fetch', '--all', '--tags'], { cwd: boilerplatePath, stdio: 'pipe' });
    }

    // Clean working directory before checkout (discard uncommitted changes from npm install)
    try {
        execFileSync('git', ['reset', '--hard'], { cwd: boilerplatePath, stdio: 'pipe' });
    } catch (error) {
        console.warn(`  ⚠️  Could not reset working directory: ${error.message}`);
    }

    let targetRef;
    if (branch) {
        // Use specific branch (for B2B integration)
        targetRef = branch;
        console.log(`  Using boilerplate branch: ${branch}`);

        try {
            execFileSync('git', ['checkout', branch], { cwd: boilerplatePath, stdio: 'pipe' });
            execFileSync('git', ['pull', 'origin', branch], { cwd: boilerplatePath, stdio: 'pipe' });
            console.log(`  ✓ Checked out and updated ${branch}`);
        } catch (error) {
            console.warn(`  ⚠️  Could not checkout ${branch}, staying on current branch`);
            console.warn(`     Reason: ${error.message}`);
        }
    } else {
        // Use latest release tag (for B2C drop-ins)
        targetRef = getLatestBoilerplateTag(boilerplatePath);
        console.log(`  Using boilerplate release: ${targetRef}`);

        try {
            execFileSync('git', ['checkout', targetRef], { cwd: boilerplatePath, stdio: 'pipe' });
            console.log(`  ✓ Checked out ${targetRef}`);
        } catch (error) {
            console.warn(`  ⚠️  Could not checkout ${targetRef}, staying on current branch`);
            console.warn(`     Reason: ${error.message}`);
        }
    }

    console.log(`  Installing boilerplate dependencies...`);
    execFileSync('npm', ['install'], { stdio: 'inherit', cwd: boilerplatePath });

    return { path: boilerplatePath, tag: targetRef };
}

/**
 * Get package versions from boilerplate's package.json
 * 
 * @param {string} boilerplatePath - Path to the boilerplate repository
 * @returns {Object} Object mapping package names to versions
 */
export function getBoilerplatePackageVersions(boilerplatePath) {
    const packageJsonPath = join(boilerplatePath, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return packageJson.dependencies || {};
}

/**
 * Use existing drop-in repository without version constraints
 * This is used for B2B drop-ins that aren't in the boilerplate
 * 
 * Reads the version from the package.json for the drop-in to ensure accurate version display
 * 
 * @param {string} repoName - Name of the drop-in (e.g., 'purchase-order', 'company-management')
 * @param {Object} repoConfig - Repository configuration object with gitUrl
 * @returns {Object} Object with { path: string, actualVersion: string, isExactMatch: boolean }
 */
export function useExistingDropinRepo(repoName, repoConfig) {
    const dropinPath = join(projectRoot, '.temp-repos', repoName);

    if (!existsSync(dropinPath)) {
        console.log(`  Repository not found at ${dropinPath}`);
        console.log(`  Cloning from default branch...`);
        try {
            execFileSync('git', ['clone', repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
        } catch (error) {
            throw new Error(`Failed to clone repository ${repoConfig.gitUrl}: ${error.message}`);
        }
    }

    // Read version from package.json for the drop-in
    let actualVersion;
    try {
        const packageJsonPath = join(dropinPath, 'package.json');
        if (existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
            actualVersion = packageJson.version || 'unknown';
            console.log(`  Using version: ${actualVersion} (from package.json)`);
            return { path: dropinPath, actualVersion, isExactMatch: true };
        }
    } catch (error) {
        console.log(`  ⚠️  Could not read package.json: ${error.message}`);
    }

    // Fallback to git information if package.json is not available
    try {
        actualVersion = execFileSync('git', ['describe', '--tags', '--exact-match'],
            { cwd: dropinPath, encoding: 'utf8', stdio: 'pipe' }).trim();
        console.log(`  Using version: ${actualVersion} (from git tag)`);
        return { path: dropinPath, actualVersion, isExactMatch: true };
    } catch {
        try {
            actualVersion = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'],
                { cwd: dropinPath, encoding: 'utf8', stdio: 'pipe' }).trim();
            console.log(`  Using branch: ${actualVersion} (fallback)`);
        } catch {
            try {
                actualVersion = execFileSync('git', ['rev-parse', '--short', 'HEAD'],
                    { cwd: dropinPath, encoding: 'utf8', stdio: 'pipe' }).trim();
                console.log(`  Using commit: ${actualVersion} (fallback)`);
            } catch {
                // All git commands failed - repository might be in bad state
                console.log(`  ⚠️  Warning: Could not determine version from git, using 'unknown'`);
                actualVersion = 'unknown';
            }
        }
        return { path: dropinPath, actualVersion, isExactMatch: false };
    }
}

/**
 * Clone or checkout a drop-in repository at a specific version
 * 
 * @param {string} repoName - Name of the drop-in (e.g., 'cart', 'checkout')
 * @param {Object} repoConfig - Repository configuration object with gitUrl
 * @param {string} version - Version to checkout (e.g., '1.0.0', '^1.2.3')
 * @returns {Object} Object with { path: string, actualVersion: string, isExactMatch: boolean }
 */
export function cloneDropinAtVersion(repoName, repoConfig, version) {
    const dropinPath = join(projectRoot, '.temp-repos', repoName);

    // Clean version string (remove ~ ^ etc)
    const cleanVersionStr = cleanVersion(version);
    const tag = `v${cleanVersionStr}`;

    console.log(`  Using version: ${cleanVersionStr}`);

    let actualVersion = cleanVersionStr;
    let isExactMatch = false;

    if (!existsSync(dropinPath)) {
        console.log(`  Cloning repository at ${tag}...`);
        try {
            execFileSync('git', ['clone', '--depth', '1', '--branch', tag, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
            actualVersion = tag;
            isExactMatch = true;
        } catch (error) {
            // If tag doesn't exist, try without 'v' prefix
            console.log(`  Tag ${tag} not found, trying ${cleanVersionStr}...`);
            try {
                execFileSync('git', ['clone', '--depth', '1', '--branch', cleanVersionStr, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
                actualVersion = cleanVersionStr;
                isExactMatch = true;
            } catch (fallbackError) {
                // If neither tag exists, clone the default branch (no --branch flag)
                console.log(`  ⚠️  Tag ${cleanVersionStr} not found, cloning default branch...`);
                console.log(`  ⚠️  Documentation will be generated from default branch code, not version ${cleanVersionStr}`);
                execFileSync('git', ['clone', repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });

                // Determine what we actually checked out
                const currentRef = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'],
                    { cwd: dropinPath, encoding: 'utf8' }).trim();
                actualVersion = currentRef;
                isExactMatch = false;
            }
        }
    } else {
        // Check if we're already at the correct version
        try {
            const currentRef = execFileSync('git', ['describe', '--tags', '--exact-match'],
                { cwd: dropinPath, encoding: 'utf8', stdio: 'pipe' }).trim();
            if (currentRef === tag || currentRef === cleanVersion) {
                console.log(`  Already at ${currentRef}`);
                actualVersion = currentRef;
                isExactMatch = true;
                return { path: dropinPath, actualVersion, isExactMatch };
            }
        } catch {
            // Not at an exact tag, continue with checkout
        }

        console.log(`  Checking out ${tag}...`);
        try {
            // First fetch all tags
            execFileSync('git', ['fetch', '--tags'], { cwd: dropinPath, stdio: 'pipe' });
            // Then checkout the specific tag
            execFileSync('git', ['checkout', tag], { cwd: dropinPath, stdio: 'pipe' });
            actualVersion = tag;
            isExactMatch = true;
        } catch (error) {
            // If tag with 'v' doesn't exist, try without
            console.log(`  Tag ${tag} not found, trying ${cleanVersionStr}...`);
            try {
                execFileSync('git', ['checkout', cleanVersionStr], { cwd: dropinPath, stdio: 'pipe' });
                actualVersion = cleanVersionStr;
                isExactMatch = true;
            } catch (fallbackError) {
                // If neither tag exists, fetch and checkout the default branch
                console.log(`  ⚠️  Tag ${cleanVersionStr} not found, fetching default branch...`);
                console.log(`  ⚠️  Documentation will be generated from default branch code, not version ${cleanVersionStr}`);
                try {
                    // Fetch the default branch
                    execFileSync('git', ['fetch', 'origin'], { cwd: dropinPath, stdio: 'pipe' });
                    // Get the default branch name from the remote
                    const defaultBranch = execFileSync('git', ['symbolic-ref', 'refs/remotes/origin/HEAD'],
                        { cwd: dropinPath, encoding: 'utf8' }).trim().replace('refs/remotes/origin/', '');
                    console.log(`  Checking out default branch: ${defaultBranch}...`);
                    execFileSync('git', ['checkout', defaultBranch], { cwd: dropinPath, stdio: 'pipe' });
                    actualVersion = defaultBranch;
                    isExactMatch = false;
                } catch (fetchError) {
                    console.warn(`  ⚠️  Could not determine or checkout default branch, staying on current ref`);
                    // Try to get the current ref
                    try {
                        const currentRef = execFileSync('git', ['rev-parse', '--short', 'HEAD'],
                            { cwd: dropinPath, encoding: 'utf8' }).trim();
                        actualVersion = `commit-${currentRef}`;
                        isExactMatch = false;
                    } catch {
                        actualVersion = 'unknown';
                        isExactMatch = false;
                    }
                }
            }
        }
    }

    return { path: dropinPath, actualVersion, isExactMatch };
}

/**
 * Find directories in a path
 * 
 * @param {string} path - Path to search
 * @returns {Array} Array of directory names
 */
export function findDirectories(path) {
    if (!existsSync(path)) {
        return [];
    }

    return readdirSync(path, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
}

