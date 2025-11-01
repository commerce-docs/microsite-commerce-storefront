/**
 * Return Type Analyzer
 * 
 * Analyzes function implementations to extract ACCURATE return type information
 * when TypeScript signatures are unhelpful (any, unknown).
 * 
 * This ensures documentation is verified against actual source code.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Analyze a function's actual return value from implementation
 * @param {string} repoPath - Path to the repository
 * @param {string} functionName - Name of the function
 * @returns {Object|null} Analysis result with type info and verification links
 */
export function analyzeFunctionReturnType(repoPath, functionName) {
    try {
        // Find the function implementation file
        const functionPath = join(repoPath, 'src', 'api', functionName, `${functionName}.ts`);

        if (!existsSync(functionPath)) {
            return null;
        }

        const content = readFileSync(functionPath, 'utf-8');

        const analysis = {
            functionName,
            returnsRawGraphQL: false,
            graphQLQuery: null,
            graphQLFields: [],
            actualReturnType: null,
            verificationLinks: [],
            confidence: 'low'
        };

        // Check if function returns raw GraphQL data
        const returnMatch = content.match(/return\s+(?:await\s+)?fetchGraphQl\([^)]+\)\.then\([^}]+return\s+([^;]+);/s);
        if (returnMatch) {
            const returnedValue = returnMatch[1].trim();

            // Check if it returns raw data (not transformed)
            if (!returnedValue.includes('transform')) {
                analysis.returnsRawGraphQL = true;
                analysis.confidence = 'medium';

                // Try to find the GraphQL query/mutation
                const graphQLImportMatch = content.match(/import.*from\s+['"](.+graphql.+)['"]/);
                if (graphQLImportMatch) {
                    const graphQLPath = graphQLImportMatch[1].replace(/^@\/cart\/api/, 'src/api');
                    const fullGraphQLPath = join(repoPath, graphQLPath + '.ts');

                    if (existsSync(fullGraphQLPath)) {
                        analysis.graphQLQuery = graphQLPath;

                        // Extract GraphQL fields
                        const graphQLContent = readFileSync(fullGraphQLPath, 'utf-8');
                        analysis.graphQLFields = extractGraphQLFields(graphQLContent);

                        if (analysis.graphQLFields.length > 0) {
                            analysis.confidence = 'high';
                        }
                    }
                }
            }
        }

        // Add verification link
        const relativePath = functionPath.replace(repoPath + '/', '');
        analysis.verificationLinks.push({
            type: 'implementation',
            path: relativePath,
            description: 'Function implementation'
        });

        if (analysis.graphQLQuery) {
            analysis.verificationLinks.push({
                type: 'graphql',
                path: analysis.graphQLQuery + '.ts',
                description: 'GraphQL query/mutation definition'
            });
        }

        return analysis;

    } catch (error) {
        console.warn(`Failed to analyze return type for ${functionName}:`, error.message);
        return null;
    }
}

/**
 * Extract field structure from GraphQL query/mutation
 * @param {string} graphQLContent - GraphQL file content
 * @returns {Array} Array of field objects
 */
function extractGraphQLFields(graphQLContent) {
    const fields = [];

    // Extract the query/mutation body
    const queryMatch = graphQLContent.match(/(?:query|mutation)\s+\w+[^{]*\{(.+)\}/s);
    if (!queryMatch) {
        return fields;
    }

    const queryBody = queryMatch[1];

    // Parse fields recursively
    parseGraphQLFields(queryBody, fields);

    return fields;
}

/**
 * Parse GraphQL fields recursively
 * @param {string} content - GraphQL content to parse
 * @param {Array} fields - Array to populate with fields
 * @param {number} depth - Current depth level
 */
function parseGraphQLFields(content, fields, depth = 0) {
    // Remove comments and clean up
    const cleaned = content.replace(/\s*#[^\n]*/g, '');

    // Match field definitions
    const fieldRegex = /(\w+)\s*(?:\([^)]*\))?\s*(\{[^}]*\})?/g;
    let match;

    while ((match = fieldRegex.exec(cleaned)) !== null) {
        const fieldName = match[1];
        const fieldBody = match[2];

        // Skip GraphQL keywords
        if (['query', 'mutation', 'fragment', 'on'].includes(fieldName)) {
            continue;
        }

        const field = {
            name: fieldName,
            depth,
            children: []
        };

        if (fieldBody) {
            // Has nested fields
            parseGraphQLFields(fieldBody, field.children, depth + 1);
        }

        fields.push(field);
    }
}

/**
 * Generate JSON example from GraphQL fields
 * @param {Array} fields - GraphQL fields array
 * @returns {string} JSON example string
 */
export function generateJSONExample(fields) {
    if (!fields || fields.length === 0) {
        return '{}';
    }

    const obj = buildObjectFromFields(fields);
    return JSON.stringify(obj, null, 2);
}

/**
 * Build JavaScript object from GraphQL fields
 * @param {Array} fields - GraphQL fields
 * @returns {Object} JavaScript object
 */
function buildObjectFromFields(fields) {
    const obj = {};

    for (const field of fields) {
        if (field.children && field.children.length > 0) {
            obj[field.name] = buildObjectFromFields(field.children);
        } else {
            // Add example values based on common field names
            obj[field.name] = getExampleValue(field.name);
        }
    }

    return obj;
}

/**
 * Get example value for a field based on its name
 * @param {string} fieldName - Name of the field
 * @returns {*} Example value
 */
function getExampleValue(fieldName) {
    const name = fieldName.toLowerCase();

    // Common patterns
    if (name.includes('currency')) return 'USD';
    if (name.includes('value') || name.includes('amount') || name.includes('price')) return 10.00;
    if (name.includes('code')) return 'example_code';
    if (name.includes('message')) return null;
    if (name.includes('id')) return '12345';
    if (name.includes('count')) return 1;
    if (name.includes('enabled') || name.includes('is_')) return true;

    // Default to string
    return 'string_value';
}

/**
 * Generate verification note with source links
 * @param {Object} analysis - Analysis result
 * @param {string} repoName - Repository name
 * @returns {string} Markdown note with links
 */
export function generateVerificationNote(analysis, repoName) {
    if (!analysis || !analysis.verificationLinks || analysis.verificationLinks.length === 0) {
        return '';
    }

    const links = analysis.verificationLinks
        .map(link => `[${link.description}](https://github.com/adobe-commerce/storefront-${repoName}/blob/main/${link.path})`)
        .join(' • ');

    return `\n\n*Verified from source: ${links}*`;
}

