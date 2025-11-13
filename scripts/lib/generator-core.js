/**
 * Core Generator Framework
 * 
 * Provides a standardized execution framework for all documentation generators.
 * Handles CLI parsing, boilerplate setup, drop-in processing, and output generation.
 * 
 * This allows generators to focus on their unique scanning and generation logic
 * while sharing common infrastructure for consistency and maintainability.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { DROPIN_REPOS } from './dropin-config.js';
import {
    cloneOrUpdateBoilerplate,
    getBoilerplatePackageVersions,
    cloneDropinAtVersion
} from './repository.js';
import { ensureParentDirectoryExists, cleanVersion } from './utils.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

/**
 * Parse command-line arguments and filter drop-ins
 * 
 * @param {string} generatorName - Name for logging (e.g., 'Functions', 'Events')
 * @returns {Object} Filtered drop-ins to process
 */
function parseAndFilterDropins(generatorName) {
    const args = process.argv.slice(2);
    const targetDropin = args.find(arg => !arg.startsWith('--'));
    const typeFilter = args.find(arg => arg.startsWith('--type='))?.split('=')[1];

    logger.header(generatorName);

    // Filter by type if specified (e.g., --type=B2B or --type=B2C)
    let filteredDropins = DROPIN_REPOS;
    if (typeFilter) {
        const upperTypeFilter = typeFilter.toUpperCase();
        filteredDropins = Object.fromEntries(
            Object.entries(DROPIN_REPOS).filter(([_, config]) => config.type === upperTypeFilter)
        );
        console.log(`🔍 Filtering by type: ${upperTypeFilter}\n`);
    }

    if (targetDropin) {
        if (!filteredDropins[targetDropin]) {
            logger.errorNotFound(targetDropin);
            process.exit(1);
        }
        logger.processingSingle(targetDropin);
        return {
            dropins: { [targetDropin]: filteredDropins[targetDropin] },
            isSingleDropin: true
        };
    } else {
        const dropinCount = Object.keys(filteredDropins).length;
        logger.processingAll(dropinCount);
        return {
            dropins: filteredDropins,
            isSingleDropin: false
        };
    }
}

/**
 * Process a single drop-in through the generation pipeline
 * 
 * @param {Object} config - Processing configuration
 * @returns {Promise<void>}
 */
async function processSingleDropin(config) {
    const {
        repoName,
        repoConfig,
        packageVersions,
        loadEnrichments,
        scanRepo,
        generateContent,
        updateSidebar,
        outputFileName,
        writeOutput,
        isSingleDropin,
        itemType
    } = config;

    logger.processingDropin(repoConfig.displayName);

    // Get version from boilerplate
    const version = packageVersions[repoConfig.packageName];
    if (!version) {
        logger.skipping(
            repoConfig.packageName,
            'This drop-in may not be included in the current boilerplate version.'
        );
        return;
    }

    // Clone repository at version
    const cloneResult = cloneDropinAtVersion(repoName, repoConfig, version);
    const repoPath = cloneResult.path;
    const actualVersion = cloneResult.actualVersion;
    const isExactMatch = cloneResult.isExactMatch;

    // Warn if version mismatch
    if (!isExactMatch) {
        const cleanRequestedVersion = cleanVersion(version);
        logger.warn(
            `Documentation generated from ${actualVersion} instead of requested version ${cleanRequestedVersion}`,
            'Version mismatch may cause documentation inaccuracies'
        );
    }

    // Load enrichment data
    const enrichmentData = loadEnrichments(repoName);
    if (enrichmentData) {
        logger.enrichmentLoaded(Object.keys(enrichmentData).length, itemType);
    }

    // Scan repository
    logger.scanning(itemType);
    const scannedData = await scanRepo(repoPath, repoConfig);

    // Handle different return types from scanRepo
    let itemCount;
    if (typeof scannedData === 'object' && scannedData.count !== undefined) {
        // For event generator that returns { eventEmits, eventListeners, ..., count }
        itemCount = scannedData.count;
    } else if (Array.isArray(scannedData)) {
        // For function generator that returns array
        itemCount = scannedData.length;
    } else {
        // Fallback
        itemCount = 0;
    }

    if (itemCount > 0) {
        logger.found(itemCount, itemType);
    } else {
        logger.noneFound(itemType);
    }

    // Generate content - pass actual version info
    const versionInfo = {
        requested: version,
        actual: actualVersion,
        isExactMatch: isExactMatch
    };
    const mdxContent = await generateContent(repoName, repoConfig, scannedData, versionInfo, enrichmentData);

    // Check if generation was skipped (e.g., override_template)
    if (mdxContent === null) {
        logger.blank();
        return;
    }

    // Write output (use custom handler if provided, otherwise use default)
    if (writeOutput) {
        // Custom write handler (e.g., for multi-file output like containers)
        await writeOutput(repoName, repoConfig, mdxContent, versionInfo);
    } else {
        // Default single-file write
        const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
        const outputPath = join(projectRoot, 'src', 'content', 'docs', basePath, repoName, outputFileName);

        ensureParentDirectoryExists(outputPath);
        writeFileSync(outputPath, mdxContent, 'utf8');
        logger.generated(outputPath);

        // Show preview link for single drop-in
        if (isSingleDropin) {
            const fileNameWithoutExt = outputFileName.replace('.mdx', '');
            const urlPath = `/${basePath}/${repoName}/${fileNameWithoutExt}`;
            logger.viewAt(urlPath);
        }
    }

    // Update sidebar navigation
    await updateSidebar(repoName, repoConfig);
    logger.blank();
}

/**
 * Run a documentation generator with standardized workflow
 * 
 * This is the main entry point for all generators. It handles:
 * - CLI argument parsing
 * - Boilerplate setup
 * - Iterating through drop-ins
 * - Calling generator-specific functions
 * - Error handling and logging
 * 
 * @param {Object} options - Generator configuration
 * @param {string} options.name - Generator name (e.g., 'Functions', 'Events')
 * @param {string} options.itemType - Type of items being generated (e.g., 'functions', 'events')
 * @param {Function} options.loadEnrichments - Function to load enrichment data (repoName) => enrichmentData
 * @param {Function} options.scanRepo - Function to scan repository (repoPath) => scannedData
 * @param {Function} options.generateContent - Function to generate MDX (repoName, repoConfig, scannedData, version, enrichmentData) => mdxContent
 * @param {Function} options.updateSidebar - Function to update sidebar (repoName, repoConfig) => void
 * @param {string} options.outputFileName - Output file name (e.g., 'functions.mdx', 'events.mdx')
 * 
 * @example
 * await runGenerator({
 *   name: 'Functions',
 *   itemType: 'functions',
 *   loadEnrichments: loadFunctionEnrichments,
 *   scanRepo: scanForFunctions,
 *   generateContent: generateFunctionsMDX,
 *   updateSidebar: updateSidebarForFunctions,
 *   outputFileName: 'functions.mdx'
 * });
 */
export async function runGenerator(options) {
    const {
        name,
        itemType,
        loadEnrichments,
        scanRepo,
        generateContent,
        updateSidebar,
        outputFileName,
        writeOutput  // Optional custom write handler
    } = options;

    // Validate required options
    if (!name || !itemType || !loadEnrichments || !scanRepo || !generateContent || !updateSidebar) {
        throw new Error('Missing required generator options. Core fields (name, itemType, loadEnrichments, scanRepo, generateContent, updateSidebar) are required.');
    }

    // Either outputFileName or writeOutput must be provided
    if (!outputFileName && !writeOutput) {
        throw new Error('Either outputFileName or writeOutput must be provided.');
    }

    // Parse CLI and filter drop-ins
    const { dropins, isSingleDropin } = parseAndFilterDropins(name);

    // Setup boilerplate (once for all drop-ins)
    const { path: boilerplatePath, tag: boilerplateTag } = cloneOrUpdateBoilerplate();
    const packageVersions = getBoilerplatePackageVersions(boilerplatePath);
    logger.boilerplateLoaded();

    // Process each drop-in
    for (const [repoName, repoConfig] of Object.entries(dropins)) {
        try {
            await processSingleDropin({
                repoName,
                repoConfig,
                packageVersions,
                loadEnrichments,
                scanRepo,
                generateContent,
                updateSidebar,
                outputFileName,
                writeOutput,
                isSingleDropin,
                itemType
            });
        } catch (error) {
            logger.error(repoName, error.message);
        }
    }

    logger.complete(name);
}

/**
 * Get project root path
 * @returns {string} Project root directory
 */
export function getProjectRoot() {
    return projectRoot;
}

