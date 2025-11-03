#!/usr/bin/env node

/**
 * Parameter Pattern Validation Script
 * 
 * This script validates existing enrichment files against parameter patterns:
 * 1. Identifies parameters that could use patterns instead of manual descriptions
 * 2. Compares manual descriptions with pattern-generated descriptions
 * 3. Reports inconsistencies and suggests cleanups
 * 4. Generates a report of pattern coverage
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { applyParameterPattern, loadParameterPatterns } from './lib/parameter-patterns.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
};

const { green, yellow, blue, cyan, red, gray, reset, bright } = colors;

/**
 * Load all enrichment files
 */
function loadEnrichmentFiles() {
    const enrichmentDir = join(projectRoot, '_dropin-enrichments');
    const dropins = readdirSync(enrichmentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !name.startsWith('.') && !name.startsWith('_'));

    const enrichments = {};

    for (const dropin of dropins) {
        const functionsPath = join(enrichmentDir, dropin, 'functions.json');
        try {
            const content = readFileSync(functionsPath, 'utf-8');
            enrichments[dropin] = JSON.parse(content);
        } catch (error) {
            // Skip if file doesn't exist or can't be parsed
        }
    }

    return enrichments;
}

/**
 * Normalize strings for comparison (ignore formatting differences)
 */
function normalizeForComparison(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[`*_]/g, '')  // Remove markdown formatting
        .replace(/\s*\.\s*$/, '')  // Remove trailing period
        .trim();
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(str1, str2) {
    const normalized1 = normalizeForComparison(str1);
    const normalized2 = normalizeForComparison(str2);

    if (normalized1 === normalized2) return 1.0;

    // Calculate Levenshtein distance ratio
    const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
    const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;

    if (longer.length === 0) return 1.0;

    // Simple containment check
    if (longer.includes(shorter)) return 0.8;

    // Check for significant overlap
    const words1 = new Set(normalized1.split(' '));
    const words2 = new Set(normalized2.split(' '));
    const intersection = [...words1].filter(word => words2.has(word)).length;
    const union = new Set([...words1, ...words2]).size;

    return intersection / union;
}

/**
 * Validate enrichments against patterns
 */
function validateEnrichments() {
    console.log(`${bright}${blue}📊 Parameter Pattern Validation Report${reset}`);
    console.log(`${'='.repeat(70)}\n`);

    const enrichments = loadEnrichmentFiles();
    const patterns = loadParameterPatterns();
    const availablePatterns = Object.keys(patterns.patterns || {});

    const stats = {
        totalParameters: 0,
        patternAvailable: 0,
        usingPattern: 0,
        redundant: 0,
        inconsistent: 0,
        missing: 0,
    };

    const issues = [];
    const suggestions = [];

    // Process each dropin
    for (const [dropinName, functions] of Object.entries(enrichments)) {
        console.log(`${bright}${cyan}Drop-in: ${dropinName}${reset}`);

        for (const [functionName, functionData] of Object.entries(functions)) {
            if (!functionData.parameters) continue;

            for (const [paramName, paramData] of Object.entries(functionData.parameters)) {
                stats.totalParameters++;

                // Check if a pattern exists for this parameter
                const hasPattern = availablePatterns.includes(paramName);

                if (hasPattern) {
                    stats.patternAvailable++;

                    // Generate description using pattern
                    const patternDescription = applyParameterPattern(paramName, dropinName, functionName);

                    if (!paramData.description) {
                        stats.missing++;
                        issues.push({
                            type: 'missing',
                            dropin: dropinName,
                            function: functionName,
                            param: paramName,
                            message: 'No description in enrichment (pattern available)',
                        });
                    } else {
                        // Compare manual description with pattern
                        const similarity = calculateSimilarity(paramData.description, patternDescription);

                        if (similarity > 0.9) {
                            // Very similar - redundant enrichment
                            stats.redundant++;
                            suggestions.push({
                                type: 'redundant',
                                dropin: dropinName,
                                function: functionName,
                                param: paramName,
                                manual: paramData.description,
                                pattern: patternDescription,
                                similarity: similarity,
                            });
                        } else if (similarity < 0.5) {
                            // Very different - might be intentionally custom
                            stats.inconsistent++;
                            issues.push({
                                type: 'inconsistent',
                                dropin: dropinName,
                                function: functionName,
                                param: paramName,
                                manual: paramData.description,
                                pattern: patternDescription,
                                similarity: similarity,
                            });
                        }
                    }
                } else {
                    // No pattern available
                    if (!paramData.description) {
                        stats.missing++;
                        issues.push({
                            type: 'missing_no_pattern',
                            dropin: dropinName,
                            function: functionName,
                            param: paramName,
                            message: 'No description and no pattern available',
                        });
                    }
                }
            }
        }
    }

    // Print statistics
    console.log(`\n${bright}Statistics:${reset}`);
    console.log(`  Total parameters:           ${stats.totalParameters}`);
    console.log(`  Patterns available:         ${green}${stats.patternAvailable}${reset} (${((stats.patternAvailable / stats.totalParameters) * 100).toFixed(1)}%)`);
    console.log(`  Redundant enrichments:      ${yellow}${stats.redundant}${reset} (can be removed)`);
    console.log(`  Inconsistent descriptions:  ${red}${stats.inconsistent}${reset} (may need review)`);
    console.log(`  Missing descriptions:       ${red}${stats.missing}${reset}`);

    // Print cleanup suggestions
    if (suggestions.length > 0) {
        console.log(`\n${bright}${yellow}✨ Cleanup Suggestions:${reset}`);
        console.log(`${gray}The following enrichments are redundant and can be removed:${reset}\n`);

        for (const suggestion of suggestions.slice(0, 10)) {  // Show top 10
            console.log(`  ${cyan}${suggestion.dropin}/${suggestion.function}/${suggestion.param}${reset}`);
            console.log(`    ${gray}Manual:  ${suggestion.manual.substring(0, 80)}...${reset}`);
            console.log(`    ${gray}Pattern: ${suggestion.pattern.substring(0, 80)}...${reset}`);
            console.log(`    ${gray}Similarity: ${(suggestion.similarity * 100).toFixed(1)}%${reset}\n`);
        }

        if (suggestions.length > 10) {
            console.log(`  ${gray}... and ${suggestions.length - 10} more${reset}\n`);
        }
    }

    // Print issues
    if (issues.length > 0) {
        console.log(`\n${bright}${red}⚠️  Issues Found:${reset}\n`);

        const inconsistentIssues = issues.filter(i => i.type === 'inconsistent');
        if (inconsistentIssues.length > 0) {
            console.log(`${bright}Inconsistent Descriptions:${reset}`);
            console.log(`${gray}These parameters have manual descriptions that differ significantly from patterns:${reset}\n`);

            for (const issue of inconsistentIssues.slice(0, 5)) {  // Show top 5
                console.log(`  ${cyan}${issue.dropin}/${issue.function}/${issue.param}${reset}`);
                console.log(`    ${gray}Manual:  ${issue.manual.substring(0, 80)}...${reset}`);
                console.log(`    ${gray}Pattern: ${issue.pattern.substring(0, 80)}...${reset}`);
                console.log(`    ${gray}Similarity: ${(issue.similarity * 100).toFixed(1)}%${reset}\n`);
            }
        }

        const missingIssues = issues.filter(i => i.type === 'missing' || i.type === 'missing_no_pattern');
        if (missingIssues.length > 0) {
            console.log(`${bright}Missing Descriptions:${reset}`);
            for (const issue of missingIssues.slice(0, 5)) {
                console.log(`  ${cyan}${issue.dropin}/${issue.function}/${issue.param}${reset} - ${issue.message}`);
            }
            console.log();
        }
    }

    // Print coverage report
    console.log(`\n${bright}${green}📈 Pattern Coverage:${reset}`);
    const coverage = (stats.patternAvailable / stats.totalParameters) * 100;
    const barLength = 50;
    const filledLength = Math.round((coverage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    console.log(`  ${bar} ${coverage.toFixed(1)}%\n`);

    // Available patterns
    console.log(`${bright}Available Patterns (${availablePatterns.length}):${reset}`);
    const patternColumns = 4;
    const patternRows = Math.ceil(availablePatterns.length / patternColumns);
    for (let i = 0; i < patternRows; i++) {
        const row = [];
        for (let j = 0; j < patternColumns; j++) {
            const index = i + j * patternRows;
            if (index < availablePatterns.length) {
                row.push(availablePatterns[index].padEnd(20));
            }
        }
        console.log(`  ${gray}${row.join('')}${reset}`);
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`${bright}Summary:${reset} ${green}${stats.redundant} cleanups possible${reset}, ${yellow}${stats.inconsistent} to review${reset}`);
    console.log();
}

// Run validation
validateEnrichments();

