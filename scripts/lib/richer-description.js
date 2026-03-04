/**
 * Richer Description Heuristic
 *
 * Implements the Richer Description Rule (GENERATOR-RULES.md):
 * Prefer existing (human-edited) descriptions over generated ones, unless the
 * existing content is clearly junk. This conservative approach avoids overwriting
 * good manual improvements.
 *
 * Strategy: Prefer existing unless junk. No scoring—only a short list of
 * known-bad patterns that indicate content safe to overwrite.
 */

/**
 * Patterns that indicate the existing description is junk and safe to overwrite.
 * Only descriptions that match these patterns will be replaced by generated content.
 * Be conservative: when in doubt, prefer existing.
 */
const KNOWN_JUNK = [
    /^\s*$/,                                    // Empty or whitespace-only
    /^\*Enrichment needed\b/i,                   // Placeholder text
    /^Configuration object for \w+\.\s*$/i,     // Generator template phrase
    /^ADOBE CONFIDENTIAL\.?\s*$/i,              // Placeholder/confidential text
    /^Configure the [`]?\w+[`]? container for the .+ drop-in component\.\s*$/i,  // Generic template phrase (handles backticks)
];

/**
 * Check if a description is known junk (safe to overwrite with generated).
 *
 * @param {string} text - Description to check
 * @returns {boolean} True if text is junk and should be replaced
 */
export function isJunk(text) {
    if (!text || typeof text !== 'string') return true;
    const trimmed = text.trim();
    if (trimmed.length === 0) return true;
    return KNOWN_JUNK.some(pattern => pattern.test(trimmed));
}

/**
 * Determine if the existing description should be preferred over the generated one.
 *
 * Prefers existing by default. Only uses generated when existing is empty or
 * matches known junk patterns. This avoids overwriting good human content with
 * generic generator output.
 *
 * @param {string} existing - Description from existing/original content
 * @param {string} generated - Description from generator
 * @returns {boolean} True if existing should be preferred
 */
export function isRicherDescription(existing, generated) {
    if (!existing || existing.trim().length === 0) return false;
    if (!generated || generated.trim().length === 0) return true;

    if (isJunk(existing)) return false;

    return true;
}
