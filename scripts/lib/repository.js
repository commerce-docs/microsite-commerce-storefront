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
 * Clone or update the boilerplate repository
 * 
 * @returns {string} Path to the boilerplate repository
 */
export function cloneOrUpdateBoilerplate() {
    const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');
    const boilerplateUrl = 'https://github.com/hlxsites/aem-boilerplate-commerce.git';

    console.log(`\n📦 Setting up boilerplate repository...`);

    if (!existsSync(boilerplatePath)) {
        console.log(`  Cloning boilerplate...`);
        mkdirSync(dirname(boilerplatePath), { recursive: true });
        execFileSync('git', ['clone', '--depth', '1', '--branch', 'main', boilerplateUrl, boilerplatePath], { stdio: 'inherit' });

        console.log(`  Installing boilerplate dependencies...`);
        execFileSync('npm', ['install'], { stdio: 'inherit', cwd: boilerplatePath });
    } else {
        console.log(`  Updating boilerplate...`);
        execFileSync('git', ['pull'], { stdio: 'inherit', cwd: boilerplatePath });

        console.log(`  Updating dependencies...`);
        execFileSync('npm', ['install'], { stdio: 'inherit', cwd: boilerplatePath });
    }

    return boilerplatePath;
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
 * @returns {string} Path to the cloned repository
 */
export function cloneDropinAtVersion(repoName, repoConfig, version) {
    const dropinPath = join(projectRoot, '.temp-repos', repoName);

    // Clean version string (remove ~ ^ etc)
    const cleanVersion = version.replace(/^[\^~]/, '');
    const tag = `v${cleanVersion}`;

    console.log(`  Using version: ${cleanVersion}`);

    if (!existsSync(dropinPath)) {
        console.log(`  Cloning repository at ${tag}...`);
        try {
            execFileSync('git', ['clone', '--depth', '1', '--branch', tag, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
        } catch (error) {
            // If tag doesn't exist, try without 'v' prefix
            console.log(`  Tag ${tag} not found, trying ${cleanVersion}...`);
            execFileSync('git', ['clone', '--depth', '1', '--branch', cleanVersion, repoConfig.gitUrl, dropinPath], { stdio: 'inherit' });
        }
    } else {
        console.log(`  Checking out ${tag}...`);
        try {
            // First fetch all tags
            execFileSync('git', ['fetch', '--tags'], { cwd: dropinPath, stdio: 'pipe' });
            // Then checkout the specific tag
            execFileSync('git', ['checkout', tag], { cwd: dropinPath, stdio: 'pipe' });
        } catch (error) {
            // If tag with 'v' doesn't exist, try without
            console.log(`  Tag ${tag} not found, trying ${cleanVersion}...`);
            execFileSync('git', ['checkout', cleanVersion], { cwd: dropinPath, stdio: 'pipe' });
        }
    }

    return dropinPath;
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

