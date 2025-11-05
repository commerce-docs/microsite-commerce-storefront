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
 * Clone or update the boilerplate repository at the latest release tag
 * 
 * @returns {Object} Object with path and tag
 */
export function cloneOrUpdateBoilerplate() {
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

    // Get and checkout the latest release tag
    const latestTag = getLatestBoilerplateTag(boilerplatePath);
    console.log(`  Using boilerplate release: ${latestTag}`);

    try {
        execFileSync('git', ['checkout', latestTag], { cwd: boilerplatePath, stdio: 'pipe' });
    } catch (error) {
        console.warn(`  ⚠️  Could not checkout ${latestTag}, staying on current branch`);
    }

    console.log(`  Installing boilerplate dependencies...`);
    execFileSync('npm', ['install'], { stdio: 'inherit', cwd: boilerplatePath });

    return { path: boilerplatePath, tag: latestTag };
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
    const cleanVersion = version.replace(/^[\^~]/, '');
    const tag = `v${cleanVersion}`;

    console.log(`  Using version: ${cleanVersion}`);

    let actualVersion = cleanVersion;
    let isExactMatch = false;

    if (!existsSync(dropinPath)) {
        console.log(`  Cloning repository at ${tag}...`);
        try {
            execFileSync('git', ['clone', '--depth', '1', '--branch', tag, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
            actualVersion = tag;
            isExactMatch = true;
        } catch (error) {
            // If tag doesn't exist, try without 'v' prefix
            console.log(`  Tag ${tag} not found, trying ${cleanVersion}...`);
            try {
                execFileSync('git', ['clone', '--depth', '1', '--branch', cleanVersion, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
                actualVersion = cleanVersion;
                isExactMatch = true;
            } catch (fallbackError) {
                // If neither tag exists, clone the default branch (no --branch flag)
                console.log(`  ⚠️  Tag ${cleanVersion} not found, cloning default branch...`);
                console.log(`  ⚠️  Documentation will be generated from default branch code, not version ${cleanVersion}`);
                execFileSync('git', ['clone', repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });

                // Determine what we actually checked out
                const currentRef = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'],
                    { cwd: dropinPath, encoding: 'utf8' }).trim();
                actualVersion = currentRef;
                isExactMatch = false;
            }
        }
    } else {
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
            console.log(`  Tag ${tag} not found, trying ${cleanVersion}...`);
            try {
                execFileSync('git', ['checkout', cleanVersion], { cwd: dropinPath, stdio: 'pipe' });
                actualVersion = cleanVersion;
                isExactMatch = true;
            } catch (fallbackError) {
                // If neither tag exists, fetch and checkout the default branch
                console.log(`  ⚠️  Tag ${cleanVersion} not found, fetching default branch...`);
                console.log(`  ⚠️  Documentation will be generated from default branch code, not version ${cleanVersion}`);
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

