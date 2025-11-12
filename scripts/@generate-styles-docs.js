#!/usr/bin/env node

/**
 * Styles Documentation Generator
 *
 * This script generates styles documentation for drop-in components by:
 * 1. Scanning src/components and src/containers directories for .css files
 * 2. Extracting CSS class names and design token usage
 * 3. Analyzing responsive patterns and media queries
 * 4. Generating comprehensive styling documentation
 *
 * USAGE:
 * - Generate all drop-ins: npm run generate-styles-docs
 * - Generate single drop-in: npm run generate-styles-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, personalization
 *
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-styles.mdx
 * - Uses: Section text, imports, placeholders
 * - Generates independently: Component classes and custom CSS examples
 *
 * OUTPUT: Single consolidated styles.mdx file per drop-in
 */

import fs from 'fs';
import path from 'path';

const { readFileSync, readdirSync, statSync, existsSync, writeFileSync } = fs;
const { join, basename, dirname } = path;

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { insertSidebarEntry } from './lib/sidebar.js';
import { replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';
import { logger } from './lib/logger.js';

const projectRoot = getProjectRoot();

// ============================================================================
// CSS EXTRACTION LOGIC
// ============================================================================

/**
 * Extract CSS classes from a CSS file
 */
function extractCSSClasses(cssContent) {
    const classes = new Set();
    // Match CSS class selectors (must start with a letter, not a number)
    // This prevents matching things like "1fr" or "0.5" as class names
    const classRegex = /\.([a-z][a-z0-9_-]*(?:__[a-z0-9_-]+)?(?:--[a-z0-9_-]+)?)/gi;
    let match;

    while ((match = classRegex.exec(cssContent)) !== null) {
        const className = match[1];
        // Additional validation:
        // - Not pure numbers
        // - At least 3 characters (exclude false positives like .es, .or, .no)
        // - Valid BEM-style pattern or common class name
        if (!/^\d+$/.test(className) && className.length >= 3) {
            classes.add(className);
        }
    }

    return Array.from(classes).sort();
}

/**
 * Extract design tokens used in a CSS file
 */
function extractUsedTokens(cssContent) {
    const tokens = new Set();
    // Match CSS custom properties (design tokens)
    const tokenRegex = /var\((--[a-z0-9-]+)\)/gi;
    let match;

    while ((match = tokenRegex.exec(cssContent)) !== null) {
        tokens.add(match[1]);
    }

    return Array.from(tokens).sort();
}

/**
 * Extract media queries from a CSS file
 */
function extractMediaQueries(cssContent) {
    const queries = new Set();
    const mediaRegex = /@media[^{]+\{/gi;
    let match;

    while ((match = mediaRegex.exec(cssContent)) !== null) {
        queries.add(match[0].replace(/\{/g, '').trim());
    }

    return Array.from(queries);
}

/**
 * Get a meaningful CSS example from the file
 * Finds CSS rules with actual customizable properties
 */
function extractCSSExample(cssContent, componentName) {
    const lines = cssContent.split('\n');
    const examples = [];
    let currentExample = [];
    let inRule = false;
    let braceCount = 0;

    // First pass: collect all CSS rules
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Look for any class selector (including BEM elements/modifiers)
        // Match lines like: .cart-order-summary { or .cart-order-summary__primary {
        if (!inRule && /^\.[a-z][a-z0-9_-]+(__[a-z0-9_-]+)?(--[a-z0-9_-]+)?\s*\{/.test(line.trim())) {
            inRule = true;
            currentExample = [];
        }

        if (inRule) {
            currentExample.push(line);

            // Count braces to know when the rule ends
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }

            // Stop when we've closed all braces
            if (braceCount === 0 && line.includes('}')) {
                if (currentExample.length > 2) {  // Has actual content
                    examples.push(currentExample.join('\n'));
                }
                inRule = false;
                currentExample = [];
            }

            // Limit example length
            if (currentExample.length > 15) {
                currentExample.push('  /* ... additional styles ... */');
                currentExample.push('}');
                examples.push(currentExample.join('\n'));
                inRule = false;
                currentExample = [];
            }
        }
    }

    // Return the first non-empty example (prefer rules with more properties)
    return examples.length > 0 ? examples[0] : null;
}

/**
 * Analyze a CSS file and extract styling information
 */
function analyzeCSSFile(filePath, componentName) {
    try {
        const cssContent = readFileSync(filePath, 'utf-8');

        return {
            componentName,
            classes: extractCSSClasses(cssContent),
            tokens: extractUsedTokens(cssContent),
            mediaQueries: extractMediaQueries(cssContent),
            example: extractCSSExample(cssContent, componentName)
        };
    } catch (error) {
        logger.warn(`Failed to analyze CSS file ${filePath}: ${error.message}`);
        return null;
    }
}

/**
 * Scan a drop-in repository for CSS files
 */
function scanDropinStyles(repoPath) {
    const cssFiles = [];
    const srcPath = join(repoPath, 'src');

    if (!existsSync(srcPath)) {
        logger.warn(`No src directory found in ${repoPath}`);
        return cssFiles;
    }

    function scanDirectory(dir) {
        try {
            const entries = readdirSync(dir);

            for (const entry of entries) {
                const fullPath = join(dir, entry);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (entry.endsWith('.css')) {
                    // Get component name from directory or file name
                    const dirName = basename(dirname(fullPath));
                    cssFiles.push({
                        path: fullPath,
                        componentName: dirName
                    });
                }
            }
        } catch (error) {
            logger.warn(`Error scanning directory ${dir}: ${error.message}`);
        }
    }

    scanDirectory(srcPath);
    return cssFiles;
}

// ============================================================================
// DOCUMENTATION GENERATION
// ============================================================================

/**
 * Generate container classes section with comprehensive list
 */
function generateComponentClassesSection(stylesData, dropinName, repoConfig) {
    let output = `The ${dropinName} drop-in uses BEM-style class naming. Use the browser DevTools to inspect elements and find specific class names.\n\n`;

    // Generate comprehensive class list from scanned CSS
    if (stylesData && stylesData.length > 0) {
        // Create CSS-formatted content as direct code block
        const cssContent = generateCSSClassList(stylesData);

        // Convert escaped newlines to actual newlines for markdown code block
        const formattedCSS = cssContent.replace(/\\n/g, '\n');

        output += `\`\`\`css\n${formattedCSS}\n\`\`\`\n\n`;

        // Add link to source for public repos
        if (repoConfig.isPublic) {
            const repoUrl = repoConfig.gitUrl
                .replace('git@github.com:', 'https://github.com/')
                .replace('.git', '');
            const packageName = repoConfig.packageName.split('/')[1];
            output += `For the source CSS files, see the [${packageName} repository](${repoUrl}/tree/main/src).\n`;
        }
    }

    return output;
}

/**
 * Generate CSS-formatted class list for display
 */
function generateCSSClassList(stylesData) {
    const lines = [];

    stylesData.forEach((data, index) => {
        const componentName = formatComponentName(data.componentName);

        // Add container comment
        lines.push(`/* ${componentName} */`);

        if (data.classes.length > 0) {
            // Add each class as a CSS selector
            data.classes.forEach(cls => {
                lines.push(`.${cls} {}`);
            });
        } else {
            lines.push(`/* No custom classes (uses parent/token styles) */`);
        }

        // Add spacing between containers (except after the last one)
        if (index < stylesData.length - 1) {
            lines.push('');
        }
    });

    return lines.join('\\n');
}

/**
 * Format component name for display
 */
function formatComponentName(name) {
    return name
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Extract design tokens from boilerplate styles.css
 */
function extractDesignTokens(boilerplatePath) {
    const stylesPath = path.join(boilerplatePath, 'styles', 'styles.css');

    if (!fs.existsSync(stylesPath)) {
        logger.warn('Boilerplate styles.css not found');
        return {};
    }

    const cssContent = fs.readFileSync(stylesPath, 'utf-8');

    // Extract tokens from :root or .dropin-design selector
    const rootMatch = cssContent.match(/:root[^{]*\{([^}]+)\}/s);
    if (!rootMatch) {
        logger.warn('Could not find :root selector in styles.css');
        return {};
    }

    const tokensContent = rootMatch[1];
    const tokens = {
        colors: { brand: [], neutral: [], semantic: [], button: [], opacity: [] },
        spacing: [],
        typography: { fonts: [], sizes: [] },
        shapes: { radius: [], width: [], shadow: [], stroke: [] },
        grid: []
    };

    // Parse each line for CSS custom properties
    const lines = tokensContent.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('--') && trimmed.includes(':')) {
            const match = trimmed.match(/^(--[a-z0-9-]+)\s*:\s*([^;]+);?\s*$/);
            if (match) {
                const [, name, value] = match;
                categorizeToken(name, value, tokens);
            }
        }
    }

    return tokens;
}

/**
 * Categorize a design token
 */
function categorizeToken(name, value, tokens) {
    const cleanValue = value.trim();

    // Colors
    if (name.startsWith('--color-brand')) {
        tokens.colors.brand.push({ name, value: cleanValue });
    } else if (name.startsWith('--color-neutral')) {
        tokens.colors.neutral.push({ name, value: cleanValue });
    } else if (name.startsWith('--color-positive') || name.startsWith('--color-informational') ||
        name.startsWith('--color-warning') || name.startsWith('--color-alert')) {
        tokens.colors.semantic.push({ name, value: cleanValue });
    } else if (name.startsWith('--color-button') || name.startsWith('--color-action-button')) {
        tokens.colors.button.push({ name, value: cleanValue });
    } else if (name.startsWith('--color-opacity')) {
        tokens.colors.opacity.push({ name, value: cleanValue });
    }
    // Spacing
    else if (name.startsWith('--spacing-')) {
        tokens.spacing.push({ name, value: cleanValue });
    }
    // Typography
    else if (name === '--type-base-font-family' || name === '--type-fixed-font-family') {
        tokens.typography.fonts.push({ name, value: cleanValue });
    } else if (name.startsWith('--type-')) {
        tokens.typography.sizes.push({ name, value: cleanValue });
    }
    // Shapes
    else if (name.startsWith('--shape-border-radius')) {
        tokens.shapes.radius.push({ name, value: cleanValue });
    } else if (name.startsWith('--shape-border-width')) {
        tokens.shapes.width.push({ name, value: cleanValue });
    } else if (name.startsWith('--shape-shadow')) {
        tokens.shapes.shadow.push({ name, value: cleanValue });
    } else if (name.startsWith('--shape-icon-stroke')) {
        tokens.shapes.stroke.push({ name, value: cleanValue });
    }
    // Grid
    else if (name.startsWith('--grid-')) {
        tokens.grid.push({ name, value: cleanValue });
    }
}

/**
 * Generate design tokens reference markdown
 */
function generateDesignTokensReference(tokens) {
    const sections = [];
    let frontmatterExports = '';

    // Colors section with visual swatches
    if (tokens.colors.brand.length > 0 || tokens.colors.neutral.length > 0) {
        sections.push('### Colors');
        sections.push('');
        sections.push('Color tokens define the palette for branding, UI elements, semantic states, and interactive components.');
        sections.push('');

        // Helper function to resolve var() references to actual color values
        const resolveColorVar = (value, allTokens) => {
            if (!value.startsWith('var(')) {
                return value;
            }

            // Extract variable name from var(--color-brand-700)
            const match = value.match(/var\((--[^)]+)\)/);
            if (!match) {
                return null;
            }

            const varName = match[1];

            // Search through all color tokens to find the actual value
            for (const category of Object.values(allTokens.colors)) {
                if (Array.isArray(category)) {
                    const token = category.find(t => t.name === varName);
                    if (token) {
                        return token.value;
                    }
                }
            }

            return null;
        };

        // Helper function to prepare color tokens data for the component
        const prepareColorTokens = (colorTokens, allTokens) => {
            return colorTokens.map(({ name, value }) => {
                // Resolve var() references or use direct color values
                const resolvedColor = value.startsWith('var(') ? resolveColorVar(value, allTokens) : value;
                return { name, value, resolvedColor };
            });
        };

        const colorSections = [];

        if (tokens.colors.brand.length > 0) {
            const brandColors = prepareColorTokens(tokens.colors.brand, tokens);
            colorSections.push({ title: 'Brand Colors', varName: 'brandColors', data: brandColors });
        }

        if (tokens.colors.neutral.length > 0) {
            const neutralColors = prepareColorTokens(tokens.colors.neutral, tokens);
            colorSections.push({ title: 'Neutral Colors', varName: 'neutralColors', data: neutralColors });
        }

        if (tokens.colors.semantic.length > 0) {
            const semanticColors = prepareColorTokens(tokens.colors.semantic, tokens);
            colorSections.push({ title: 'Semantic Colors', varName: 'semanticColors', data: semanticColors });
        }

        if (tokens.colors.button.length > 0) {
            const buttonColors = prepareColorTokens(tokens.colors.button, tokens);
            colorSections.push({ title: 'Button Colors', varName: 'buttonColors', data: buttonColors });
        }

        if (tokens.colors.opacity.length > 0) {
            const opacityColors = prepareColorTokens(tokens.colors.opacity, tokens);
            colorSections.push({ title: 'Opacity', varName: 'opacityColors', data: opacityColors });
        }

        // Generate frontmatter exports
        frontmatterExports = colorSections.map(({ varName, data }) =>
            `export const ${varName} = ${JSON.stringify(data, null, 2)};`
        ).join('\n\n');

        // Generate component usage in sections
        colorSections.forEach(({ title, varName }) => {
            sections.push(`#### ${title}`);
            sections.push('');
            sections.push(`<ColorTokenList tokens={${varName}} />`);
            sections.push('');
        });
    }

    // Spacing section
    if (tokens.spacing.length > 0) {
        sections.push('### Spacing');
        sections.push('');
        sections.push('Spacing tokens provide consistent padding, margins, and gaps across all components.');
        sections.push('');
        sections.push('```css');
        tokens.spacing.forEach(({ name, value }) => {
            sections.push(`${name}: ${value}`);
        });
        sections.push('```');
        sections.push('');
    }

    // Typography section
    if (tokens.typography.fonts.length > 0 || tokens.typography.sizes.length > 0) {
        sections.push('### Typography');
        sections.push('');
        sections.push('Typography tokens define font families, sizes, weights, line heights, and letter spacing for text elements.');
        sections.push('');

        if (tokens.typography.fonts.length > 0) {
            sections.push('#### Font Families');
            sections.push('');
            sections.push('```css');
            tokens.typography.fonts.forEach(({ name, value }) => {
                sections.push(`${name}: ${value}`);
            });
            sections.push('```');
            sections.push('');
        }

        if (tokens.typography.sizes.length > 0) {
            sections.push('#### Type Scales');
            sections.push('');
            sections.push('```css');
            tokens.typography.sizes.forEach(({ name, value }) => {
                sections.push(`${name}: ${value}`);
            });
            sections.push('```');
            sections.push('');
        }
    }

    // Shapes section
    if (tokens.shapes.radius.length > 0 || tokens.shapes.width.length > 0 ||
        tokens.shapes.shadow.length > 0 || tokens.shapes.stroke.length > 0) {
        sections.push('### Shapes & Borders');
        sections.push('');
        sections.push('Shape tokens control the visual appearance of borders, shadows, and icon strokes.');
        sections.push('');

        if (tokens.shapes.radius.length > 0) {
            sections.push('#### Border Radius');
            sections.push('');
            sections.push('```css');
            tokens.shapes.radius.forEach(({ name, value }) => {
                sections.push(`${name}: ${value}`);
            });
            sections.push('```');
            sections.push('');
        }

        if (tokens.shapes.width.length > 0) {
            sections.push('#### Border Width');
            sections.push('');
            sections.push('```css');
            tokens.shapes.width.forEach(({ name, value }) => {
                sections.push(`${name}: ${value}`);
            });
            sections.push('```');
            sections.push('');
        }

        if (tokens.shapes.shadow.length > 0) {
            sections.push('#### Shadows');
            sections.push('');
            sections.push('```css');
            tokens.shapes.shadow.forEach(({ name, value }) => {
                sections.push(`${name}: ${value}`);
            });
            sections.push('```');
            sections.push('');
        }

        if (tokens.shapes.stroke.length > 0) {
            sections.push('#### Icon Stroke');
            sections.push('');
            sections.push('```css');
            tokens.shapes.stroke.forEach(({ name, value }) => {
                sections.push(`${name}: ${value}`);
            });
            sections.push('```');
            sections.push('');
        }
    }

    // Grid section
    if (tokens.grid.length > 0) {
        sections.push('### Grid System');
        sections.push('');
        sections.push('```css');
        tokens.grid.forEach(({ name, value }) => {
            sections.push(`${name}: ${value}`);
        });
        sections.push('```');
        sections.push('');
    }

    // Return frontmatter exports and content
    return {
        frontmatter: frontmatterExports || '',
        content: sections.join('\n')
    };
}

/**
 * Extract the CSS selector from a CSS example
 */
function extractCSSSelector(cssExample) {
    if (!cssExample) return null;

    const lines = cssExample.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        // Match CSS selector (starts with . and ends with {)
        if (trimmed.startsWith('.') && trimmed.includes('{')) {
            // Extract just the selector part (remove the opening brace)
            return trimmed.replace(/\s*\{.*$/, '').trim();
        }
    }

    return null;
}

/**
 * Parse CSS example to extract actual properties
 */
function parseCSSProperties(cssExample) {
    if (!cssExample) return [];

    const properties = [];
    const lines = cssExample.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        // Match CSS property declarations (property: value;)
        if (trimmed.includes(':') && !trimmed.startsWith('.') && !trimmed.startsWith('{') && !trimmed.startsWith('}')) {
            const match = trimmed.match(/([a-z-]+)\s*:\s*([^;]+)/i);
            if (match) {
                properties.push({ property: match[1], value: match[2].trim() });
            }
        }
    }

    return properties;
}

/**
 * Generate introductory context for the customization example
 */
function generateCustomizationIntro(dropinName) {
    const blockName = dropinName.toLowerCase().replace(/\s+/g, '-');
    const commerceBlock = `commerce-${blockName}`;
    const boilerplateUrl = 'https://github.com/hlxsites/aem-boilerplate-commerce/blob/main';

    // Map drop-ins to their actual commerce blocks (some have direct mappings, others don't)
    const dropinToBlockMap = {
        'cart': 'commerce-cart',
        'checkout': 'commerce-checkout',
        'wishlist': 'commerce-wishlist',
        'product-details': null, // Uses product-details block, not commerce-product-details
        'product-discovery': null, // Uses search/category blocks
        'recommendations': null, // Embedded in various blocks
        'order': null, // Multiple blocks (commerce-order-status, commerce-orders-list, etc.)
        'user-auth': null, // Multiple blocks (commerce-login, commerce-create-account, etc.)
        'user-account': null, // Multiple blocks (commerce-addresses, commerce-customer-information, etc.)
        'payment-services': null, // Embedded in checkout
        'personalization': null // No dedicated block
    };

    const actualBlock = dropinToBlockMap[blockName];
    const globalPath = `styles/styles.css`;

    if (actualBlock) {
        // Drop-in has a single corresponding block
        const blockPath = `blocks/${actualBlock}/${actualBlock}.css`;
        return `Add this to <Link href="${boilerplateUrl}/${blockPath}" text="${blockPath}" /> to customize the ${dropinName} drop-in.`;
    } else {
        // Drop-in is used across multiple blocks or has no dedicated block
        const blocksPath = `blocks/`;
        return `Add this to the CSS file of the specific <Link href="${boilerplateUrl}/${blocksPath}" text="commerce block" /> where you're using the ${dropinName} drop-in.`;
    }
}

/**
 * Generate common customizations section with practical examples
 * Uses REAL CSS properties from actual container classes
 */
function generateCustomCSSExamples(stylesData, dropinName) {
    if (!stylesData || stylesData.length === 0) {
        return `\`\`\`css title="styles/styles.css"\n/* Target ${dropinName} containers */\n.${dropinName.toLowerCase().replace(/\s+/g, '-')}-container {\n  /* Use the browser DevTools to find the specific classes you need */\n}\n\`\`\``;
    }

    // Find containers with good CSS examples (with actual properties)
    const componentsWithExamples = stylesData
        .filter(data => data.example && data.example.length > 0 && data.classes.length > 0)
        .slice(0, 10);

    if (componentsWithExamples.length === 0) {
        return `Use the browser DevTools to inspect the rendered containers and identify the classes and properties you want to customize.`;
    }

    // Properties that are commonly customized (prioritize these)
    const customizablePropertyPatterns = [
        'padding', 'margin', 'gap', 'spacing',
        'color', 'background', 'border',
        'font', 'text', 'line-height',
        'width', 'height', 'max-', 'min-'
    ];

    // Score all components by how many good customizable properties they have
    const scoredComponents = componentsWithExamples.map(component => {
        const realProps = parseCSSProperties(component.example);

        // Filter for meaningful and customizable properties
        const customizableProps = realProps.filter(p => {
            if (!p.property || !p.value) return false;
            if (p.value.includes('none') || p.value.includes('inherit')) return false;
            if (p.property.includes('container-') || p.property.includes('display') || p.property.includes('position')) return false;
            if (p.value.trim() === '0' || p.value.trim() === '100%') return false;
            if (p.value.trim().length === 0) return false;

            // Skip custom properties that aren't standard design tokens
            if (p.value.includes('var(--')) {
                const hasDesignToken = p.value.includes('--spacing-') ||
                    p.value.includes('--color-') ||
                    p.value.includes('--type-') ||
                    p.value.includes('--font-');
                if (!hasDesignToken) return false;
            }

            return customizablePropertyPatterns.some(pattern => p.property.includes(pattern));
        });

        return {
            component,
            props: customizableProps,
            score: customizableProps.length
        };
    }).filter(item => item.score > 0)  // Only keep components with customizable properties
        .sort((a, b) => b.score - a.score);  // Sort by score (best first)

    // Pick the best component (most customizable properties)
    let bestComponent = null;
    let bestProps = [];

    if (scoredComponents.length > 0) {
        bestComponent = scoredComponents[0].component;
        bestProps = scoredComponents[0].props;
    }

    // If no component with 3+ customizable properties, look for any with at least 1
    if (!bestComponent) {
        for (const component of componentsWithExamples) {
            const realProps = parseCSSProperties(component.example);
            const customizableProps = realProps.filter(p => {
                if (!p.property || !p.value) return false;
                if (p.value.includes('none') || p.value.includes('inherit')) return false;
                if (p.property.includes('container-') || p.property.includes('display') || p.property.includes('position')) return false;
                if (p.value.trim() === '0' || p.value.trim() === '100%') return false;
                if (p.value.trim().length === 0) return false;

                // Skip custom properties that aren't standard design tokens
                if (p.value.includes('var(--')) {
                    const hasDesignToken = p.value.includes('--spacing-') ||
                        p.value.includes('--color-') ||
                        p.value.includes('--type-') ||
                        p.value.includes('--font-');
                    if (!hasDesignToken) return false;
                }

                return customizablePropertyPatterns.some(pattern => p.property.includes(pattern));
            });

            if (customizableProps.length > 0) {
                bestComponent = component;
                bestProps = customizableProps;
                break;
            }
        }
    }

    // Last resort: use any component with any properties
    if (!bestComponent && componentsWithExamples.length > 0) {
        bestComponent = componentsWithExamples[0];
        bestProps = parseCSSProperties(bestComponent.example).filter(p =>
            p.property && p.value && p.value.trim().length > 0
        );
    }

    if (!bestComponent || bestProps.length === 0) {
        return `Use the browser DevTools to inspect the rendered containers and identify the classes and properties you want to customize.`;
    }

    // Extract the actual CSS selector from the example
    const actualSelector = extractCSSSelector(bestComponent.example);

    // If we can't extract a selector, fall back to the first class (shouldn't happen)
    const selectorToUse = actualSelector || `.${bestComponent.classes[0]}`;

    const examples = [];

    // Select up to 3 properties to show in the example
    const propsToShow = bestProps.slice(0, 3);

    examples.push(`\`\`\`css title="styles/styles.css" del={2-${1 + propsToShow.length}} ins={${2 + propsToShow.length}-${1 + propsToShow.length * 2}}`);
    examples.push(`${selectorToUse} {`);

    // Show original properties
    propsToShow.forEach(prop => {
        examples.push(`  ${prop.property}: ${prop.value};`);
    });

    // Show customized properties
    propsToShow.forEach(prop => {
        const customValue = getCustomValue(prop.property, prop.value);
        examples.push(`  ${prop.property}: ${customValue};`);
    });

    examples.push(`}`);
    examples.push(`\`\`\``);

    return examples.join('\n');
}

/**
 * Generate a customized value for a CSS property
 */
function getCustomValue(property, originalValue) {
    // Customize spacing design tokens
    if (originalValue.includes('--spacing-')) {
        if (originalValue.includes('xsmall')) return originalValue.replace('xsmall', 'small');
        if (originalValue.includes('small') && !originalValue.includes('xsmall')) return originalValue.replace('small', 'medium');
        if (originalValue.includes('medium')) return originalValue.replace('medium', 'large');
        if (originalValue.includes('large')) return originalValue.replace('large', 'xlarge');
    }

    // Customize color design tokens
    if (originalValue.includes('--color-')) {
        if (originalValue.includes('neutral')) return originalValue.replace('neutral', 'brand');
        if (originalValue.includes('gray')) return originalValue.replace('gray', 'blue');
        // Lighten or darken color variants
        if (originalValue.match(/(\d+)$/)) {
            const match = originalValue.match(/(\d+)$/);
            const num = parseInt(match[1]);
            if (num >= 500) return originalValue.replace(num.toString(), (num + 200).toString());
            if (num < 500) return originalValue.replace(num.toString(), (num - 100).toString());
        }
    }

    // Customize typography design tokens
    if (originalValue.includes('--type-')) {
        return originalValue; // Keep typography tokens as-is (they're semantic)
    }

    // Customize rem values
    if (originalValue.includes('rem')) {
        const match = originalValue.match(/([\d.]+)rem/);
        if (match) {
            const num = parseFloat(match[1]);
            return originalValue.replace(match[1], (num * 1.25).toFixed(3));
        }
    }

    // Customize px values
    if (/^\d+px$/.test(originalValue)) {
        const num = parseInt(originalValue);
        return `${Math.round(num * 1.5)}px`;
    }

    // Customize percentage values
    if (originalValue.includes('%') && originalValue !== '100%') {
        const match = originalValue.match(/(\d+)%/);
        if (match) {
            const num = parseInt(match[1]);
            return originalValue.replace(match[1], Math.min(100, num + 10).toString());
        }
    }

    // Keep 100% width as auto for responsive behavior
    if (originalValue === '100%' && property === 'width') {
        return 'auto';
    }

    // For specific keywords, provide semantic alternatives
    if (originalValue === 'flex') return 'grid';
    if (originalValue === 'column') return 'row';
    if (originalValue === 'start') return 'center';
    if (originalValue === 'space-between') return 'space-around';

    // Default: return original (structural properties shouldn't be changed)
    return originalValue;
}

/**
 * Scan for CSS files in a drop-in repository
 */
function scanForStyles(repoPath) {
    const cssFiles = scanDropinStyles(repoPath);
    return cssFiles;
}

/**
 * Generate styles documentation MDX content
 */
function generateStylesMDX(repoName, repoConfig, cssFiles, versionInfo, enrichmentData) {
    // Analyze CSS files
    const stylesData = cssFiles
        .map(file => analyzeCSSFile(file.path, file.componentName))
        .filter(data => data !== null);

    logger.found(stylesData.length, 'analyzed CSS files');

    // Read template
    const templatePath = join(projectRoot, '_dropin-templates', 'dropin-styles.mdx');
    let content = readFileSync(templatePath, 'utf-8');

    // Generate sections
    const componentClassesSection = generateComponentClassesSection(stylesData, repoConfig.displayName, repoConfig);
    const customizationIntro = generateCustomizationIntro(repoConfig.displayName);
    const customCSSExamples = generateCustomCSSExamples(stylesData, repoConfig.displayName);

    // Replace placeholders
    // Remove 'v' prefix from version if present to match events page format
    const versionNumber = versionInfo.actual.replace(/^v/, '');

    content = replacePlaceholders(content, {
        DROPIN_NAME: repoConfig.displayName,
        VERSION: versionNumber,
        CUSTOMIZATION_INTRO: customizationIntro,
        COMPONENT_CLASSES_SECTION: componentClassesSection,
        CUSTOM_CSS_EXAMPLES: customCSSExamples
    });

    return content;
}

/**
 * Update sidebar for styles documentation
 */
function updateSidebarForStyles(dropinName, repoConfig) {
    insertSidebarEntry(
        dropinName,
        repoConfig,
        'Styles',
        'Slots'  // Insert after Slots
    );
}

// ============================================================================
// UNIVERSAL STYLING GUIDE UPDATE
// ============================================================================

/**
 * Update the universal styling guide with design tokens reference
 */
async function updateUniversalStylingGuide() {
    console.log('\n🎨 Updating universal styling guide with design tokens...');

    const boilerplatePath = join(process.cwd(), '.temp-repos', 'boilerplate');
    const stylingGuidePath = join(process.cwd(), 'src', 'content', 'docs', 'dropins', 'all', 'styling.mdx');

    if (!existsSync(stylingGuidePath)) {
        logger.warn('Universal styling guide not found', stylingGuidePath);
        return;
    }

    // Extract design tokens from boilerplate
    const tokens = extractDesignTokens(boilerplatePath);

    // Generate the reference markdown and frontmatter
    const { frontmatter, content } = generateDesignTokensReference(tokens);

    // Read the existing guide
    let guideContent = readFileSync(stylingGuidePath, 'utf-8');

    // Add the ColorTokenList import after the existing imports
    if (!guideContent.includes('ColorTokenList')) {
        guideContent = guideContent.replace(
            'import Callouts from \'@components/Callouts.astro\';',
            'import Callouts from \'@components/Callouts.astro\';\nimport ColorTokenList from \'@components/ColorTokenList.astro\';'
        );
    }

    // Inject the frontmatter exports after the imports
    if (frontmatter && !guideContent.includes('export const brandColors')) {
        const importsEndMatch = guideContent.match(/import[^;]+;\n\n/g);
        if (importsEndMatch) {
            const lastImport = importsEndMatch[importsEndMatch.length - 1];
            const insertionPoint = guideContent.lastIndexOf(lastImport) + lastImport.length;
            guideContent = guideContent.slice(0, insertionPoint) + frontmatter + '\n\n' + guideContent.slice(insertionPoint);
        }
    }

    // Replace the content placeholder with the generated reference
    if (guideContent.includes('{/* DESIGN_TOKENS_REFERENCE */}')) {
        guideContent = guideContent.replace(
            '{/* DESIGN_TOKENS_REFERENCE */}',
            content
        );

        writeFileSync(stylingGuidePath, guideContent);
        console.log('  ✅ Updated universal styling guide with design tokens reference\n');
    } else {
        logger.warn('Could not find DESIGN_TOKENS_REFERENCE placeholder in styling guide');
    }
}

// Update universal styling guide first
await updateUniversalStylingGuide();

// ============================================================================
// MAIN EXECUTION
// ============================================================================

await runGenerator({
    name: 'Styles',
    itemType: 'styles',
    loadEnrichments: () => null,  // No enrichments needed for styles
    scanRepo: scanForStyles,
    generateContent: generateStylesMDX,
    updateSidebar: updateSidebarForStyles,
    outputFileName: 'styles.mdx'
});

