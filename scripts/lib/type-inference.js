/**
 * Comprehensive Type Inference System
 * 
 * This module provides a systematic checklist for finding type information
 * when TypeScript definitions are missing or incomplete.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Type Inference Checklist
 * Tries multiple strategies to find type information
 */
export class TypeInferenceChecklist {
    constructor(dropinName, dropinPath) {
        this.dropinName = dropinName;
        this.dropinPath = dropinPath;
        this.log = [];
    }

    /**
     * Main entry point - runs through all inference strategies
     * @param {string} eventName - Event name to find type for
     * @returns {Object} { type: string|null, source: string, confidence: string, log: string[] }
     */
    inferEventPayloadType(eventName) {
        this.log = [];
        this.addLog(`🔍 Starting type inference for event: ${eventName}`);

        // Run through checklist in priority order
        const strategies = [
            () => this.strategy1_TypeScriptDefinition(eventName),
            () => this.strategy2_SameVariableInference(eventName),
            () => this.strategy3_EventListenerAnalysis(eventName),
            () => this.strategy4_TestFileAnalysis(eventName),
            () => this.strategy5_JSDocComments(eventName),
            () => this.strategy6_GraphQLResponseType(eventName),
            () => this.strategy7_TransformFunctionReturn(eventName),
            () => this.strategy8_StateManagementType(eventName),
            () => this.strategy9_SimilarEventPattern(eventName),
            () => this.strategy10_FunctionReturnType(eventName),
        ];

        for (let i = 0; i < strategies.length; i++) {
            const result = strategies[i]();
            if (result) {
                this.addLog(`✅ SUCCESS: Found type using strategy ${i + 1}`);
                return {
                    ...result,
                    log: this.log
                };
            }
        }

        this.addLog(`❌ EXHAUSTED: All strategies failed`);
        return { type: null, source: 'none', confidence: 'none', log: this.log };
    }

    addLog(message) {
        this.log.push(message);
    }

    // ============================================================================
    // STRATEGY 1: TypeScript Definition (Primary Source)
    // ============================================================================
    strategy1_TypeScriptDefinition(eventName) {
        this.addLog(`📋 Strategy 1: Checking TypeScript definitions`);

        const eventsTypePath = join(this.dropinPath, 'src/types/events.d.ts');
        if (!existsSync(eventsTypePath)) {
            this.addLog(`  ⚠️  events.d.ts not found`);
            return null;
        }

        const content = readFileSync(eventsTypePath, 'utf-8');
        const pattern = new RegExp(`['"\`]${this.escapeRegExp(eventName)}['"\`]\\s*:\\s*([^;,}]+[^;,}\\n]*)`);
        const match = content.match(pattern);

        if (match) {
            this.addLog(`  ✅ Found in events.d.ts`);
            return {
                type: match[1].trim(),
                source: 'typescript-definition',
                confidence: 'high'
            };
        }

        this.addLog(`  ❌ Not found in events.d.ts`);
        return null;
    }

    // ============================================================================
    // STRATEGY 2: Same Variable Inference (Implementation Analysis)
    // ============================================================================
    strategy2_SameVariableInference(eventName) {
        this.addLog(`📋 Strategy 2: Analyzing emit statements for same variable`);

        try {
            const srcDir = join(this.dropinPath, 'src');
            if (!existsSync(srcDir)) return null;

            const files = this.findSourceFiles(srcDir);

            for (const filePath of files) {
                const content = readFileSync(filePath, 'utf-8');

                // Find where our event is emitted
                const emitPattern = new RegExp(`emit\\(['"\`]${eventName.replace(/\//g, '\\/')}['"\`],\\s*([\\w]+)\\)`, 'g');
                const match = emitPattern.exec(content);

                if (match) {
                    const emittedVariable = match[1];
                    this.addLog(`  📝 Found emit with variable: ${emittedVariable}`);

                    // NEW: Check if the variable is assigned from a ternary operator
                    const ternaryType = this.inferTypeFromTernary(emittedVariable, content, filePath);
                    if (ternaryType) {
                        return ternaryType;
                    }

                    // Look for other events with same variable
                    const allEmitsPattern = /emit\(['"]([\w/]+)['"],\s*([\w]+)\)/g;
                    let otherMatch;

                    while ((otherMatch = allEmitsPattern.exec(content)) !== null) {
                        const otherEventName = otherMatch[1];
                        const otherVariable = otherMatch[2];

                        if (otherVariable === emittedVariable && otherEventName !== eventName) {
                            this.addLog(`  🔗 Found related event: ${otherEventName}`);

                            // Check if other event has a type
                            const eventsTypePath = join(this.dropinPath, 'src/types/events.d.ts');
                            if (existsSync(eventsTypePath)) {
                                const eventsContent = readFileSync(eventsTypePath, 'utf-8');
                                const typePattern = new RegExp(`['"\`]${this.escapeRegExp(otherEventName)}['"\`]\\s*:\\s*([^;,}]+[^;,}\\n]*)`);
                                const typeMatch = eventsContent.match(typePattern);

                                if (typeMatch) {
                                    this.addLog(`  ✅ Inferred from ${otherEventName}`);
                                    return {
                                        type: typeMatch[1].trim(),
                                        source: `inferred-from-${otherEventName}`,
                                        confidence: 'high'
                                    };
                                }
                            }
                        }
                    }
                }
            }

            this.addLog(`  ❌ No same-variable inference possible`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 3: Event Listener Analysis
    // ============================================================================
    strategy3_EventListenerAnalysis(eventName) {
        this.addLog(`📋 Strategy 3: Analyzing event listeners`);

        try {
            const srcDir = join(this.dropinPath, 'src');
            if (!existsSync(srcDir)) return null;

            const files = this.findSourceFiles(srcDir);

            for (const filePath of files) {
                const content = readFileSync(filePath, 'utf-8');

                // Find event.on() calls for this event
                const listenerPattern = new RegExp(`on\\(['"\`]${eventName.replace(/\//g, '\\/')}['"\`],\\s*\\(([^)]+)\\)\\s*=>`, 'g');
                const match = listenerPattern.exec(content);

                if (match) {
                    const paramName = match[1].trim();
                    this.addLog(`  📝 Found listener with parameter: ${paramName}`);

                    // Look for type annotation or usage
                    // Check if there's a type cast or assertion nearby
                    const contextStart = Math.max(0, match.index - 200);
                    const contextEnd = Math.min(content.length, match.index + 500);
                    const context = content.substring(contextStart, contextEnd);

                    // Look for: (data: SomeType)
                    const typeAnnotationPattern = new RegExp(`\\(${paramName}:\\s*([^)]+)\\)`, 'g');
                    const typeMatch = typeAnnotationPattern.exec(context);

                    if (typeMatch) {
                        this.addLog(`  ✅ Found type annotation in listener`);
                        return {
                            type: typeMatch[1].trim(),
                            source: 'listener-type-annotation',
                            confidence: 'medium'
                        };
                    }
                }
            }

            this.addLog(`  ❌ No type found in listeners`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 4: Test File Analysis
    // ============================================================================
    strategy4_TestFileAnalysis(eventName) {
        this.addLog(`📋 Strategy 4: Checking test files for example payloads`);

        try {
            const srcDir = join(this.dropinPath, 'src');
            if (!existsSync(srcDir)) return null;

            const testFiles = this.findTestFiles(srcDir);

            for (const filePath of testFiles) {
                const content = readFileSync(filePath, 'utf-8');

                // Look for emit calls in tests with example data
                const emitPattern = new RegExp(`emit\\(['"\`]${eventName.replace(/\//g, '\\/')}['"\`],\\s*\\{([^}]+)\\}\\)`, 'g');
                const match = emitPattern.exec(content);

                if (match) {
                    this.addLog(`  📝 Found test emit with inline object`);
                    // Could analyze structure but this is complex
                    // For now, just note that tests exist
                }

                // Look for type assertions in tests
                const assertPattern = new RegExp(`expect\\(events\\.emit\\).*['"\`]${eventName.replace(/\//g, '\\/')}['"\`]`, 'g');
                if (assertPattern.test(content)) {
                    this.addLog(`  📝 Found test assertions for this event`);
                }
            }

            this.addLog(`  ❌ No definitive type from tests`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 5: JSDoc Comments
    // ============================================================================
    strategy5_JSDocComments(eventName) {
        this.addLog(`📋 Strategy 5: Looking for JSDoc comments`);

        try {
            const srcDir = join(this.dropinPath, 'src');
            if (!existsSync(srcDir)) return null;

            const files = this.findSourceFiles(srcDir);

            for (const filePath of files) {
                const content = readFileSync(filePath, 'utf-8');

                // Look for function that emits this event with JSDoc
                const emitIndex = content.indexOf(`emit('${eventName}'`);
                if (emitIndex > -1) {
                    // Look backwards for JSDoc comment
                    const beforeEmit = content.substring(Math.max(0, emitIndex - 1000), emitIndex);
                    const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
                    const jsdocs = [...beforeEmit.matchAll(jsdocPattern)];

                    if (jsdocs.length > 0) {
                        const lastJsdoc = jsdocs[jsdocs.length - 1][0];
                        this.addLog(`  📝 Found JSDoc near emit`);

                        // Look for @returns or @emits tags
                        const returnsMatch = lastJsdoc.match(/@returns?\s*\{([^}]+)\}/);
                        if (returnsMatch) {
                            this.addLog(`  ✅ Found @returns type in JSDoc`);
                            return {
                                type: returnsMatch[1].trim(),
                                source: 'jsdoc-comment',
                                confidence: 'medium'
                            };
                        }
                    }
                }
            }

            this.addLog(`  ❌ No JSDoc type found`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 6: GraphQL Response Type
    // ============================================================================
    strategy6_GraphQLResponseType(eventName) {
        this.addLog(`📋 Strategy 6: Checking GraphQL query/mutation responses`);

        try {
            const srcDir = join(this.dropinPath, 'src');
            if (!existsSync(srcDir)) return null;

            const files = this.findSourceFiles(srcDir);

            for (const filePath of files) {
                const content = readFileSync(filePath, 'utf-8');

                // Find emit for this event
                const emitPattern = new RegExp(`emit\\(['"\`]${eventName.replace(/\//g, '\\/')}['"\`],\\s*([\\w]+)\\)`, 'g');
                const match = emitPattern.exec(content);

                if (match) {
                    const variable = match[1];

                    // Look backwards for GraphQL query/mutation
                    const beforeEmit = content.substring(0, match.index);

                    // Look for transform functions (common pattern)
                    const transformPattern = new RegExp(`${variable}\\s*=\\s*transform(\\w+)\\(`, 'g');
                    const transformMatch = transformPattern.exec(beforeEmit);

                    if (transformMatch) {
                        const transformName = transformMatch[1];
                        this.addLog(`  📝 Found transform function: transform${transformName}`);

                        // Look for transform function return type
                        const transformFuncPattern = new RegExp(`function\\s+transform${transformName}[^:]+:\\s*([^{]+)\\{`, 'g');
                        const typeMatch = transformFuncPattern.exec(content);

                        if (typeMatch) {
                            this.addLog(`  ✅ Found transform return type`);
                            return {
                                type: typeMatch[1].trim(),
                                source: 'graphql-transform-function',
                                confidence: 'high'
                            };
                        }
                    }
                }
            }

            this.addLog(`  ❌ No GraphQL response type found`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 7: Transform Function Return Type
    // ============================================================================
    strategy7_TransformFunctionReturn(eventName) {
        this.addLog(`📋 Strategy 7: Analyzing transform function returns`);

        try {
            const transformsDir = join(this.dropinPath, 'src/data/transforms');
            if (!existsSync(transformsDir)) {
                this.addLog(`  ⚠️  No transforms directory`);
                return null;
            }

            // This is covered by strategy 6 but could be expanded
            this.addLog(`  ❌ No additional transform info`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 8: State Management Type
    // ============================================================================
    strategy8_StateManagementType(eventName) {
        this.addLog(`📋 Strategy 8: Checking state management types`);

        try {
            const statePath = join(this.dropinPath, 'src/lib/state.ts');
            if (!existsSync(statePath)) {
                this.addLog(`  ⚠️  No state.ts file`);
                return null;
            }

            const content = readFileSync(statePath, 'utf-8');

            // Look for state properties that might relate to event
            // Extract event type (cart/data -> cart)
            const eventType = eventName.split('/')[0];

            // Look for properties like: cart: CartModel
            const statePattern = new RegExp(`${eventType}\\s*:\\s*([^;,\\n]+)`, 'g');
            const match = statePattern.exec(content);

            if (match) {
                this.addLog(`  ✅ Found state property type`);
                return {
                    type: match[1].trim(),
                    source: 'state-management',
                    confidence: 'low'
                };
            }

            this.addLog(`  ❌ No matching state type`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 9: Similar Event Pattern
    // ============================================================================
    strategy9_SimilarEventPattern(eventName) {
        this.addLog(`📋 Strategy 9: Looking for similar event patterns`);

        try {
            const eventsTypePath = join(this.dropinPath, 'src/types/events.d.ts');
            if (!existsSync(eventsTypePath)) return null;

            const content = readFileSync(eventsTypePath, 'utf-8');

            // Extract namespace (e.g., 'cart' from 'cart/data')
            const namespace = eventName.split('/')[0];

            // Find all events with same namespace
            const namespacePattern = new RegExp(`['"\`]${namespace}/([^'"]+)['"\`]\\s*:\\s*([^;,}]+)`, 'g');
            let match;
            const similarEvents = [];

            while ((match = namespacePattern.exec(content)) !== null) {
                similarEvents.push({
                    name: `${namespace}/${match[1]}`,
                    type: match[2].trim()
                });
            }

            if (similarEvents.length > 0) {
                this.addLog(`  📝 Found ${similarEvents.length} events in same namespace`);

                // Check if they all have the same type
                const types = [...new Set(similarEvents.map(e => e.type))];
                if (types.length === 1) {
                    this.addLog(`  ✅ All similar events use same type`);
                    return {
                        type: types[0],
                        source: 'similar-event-pattern',
                        confidence: 'low'
                    };
                }
            }

            this.addLog(`  ❌ No consistent pattern`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // STRATEGY 10: Function Return Type
    // ============================================================================
    strategy10_FunctionReturnType(eventName) {
        this.addLog(`📋 Strategy 10: Checking function return types`);

        try {
            const apiDir = join(this.dropinPath, 'src/api');
            if (!existsSync(apiDir)) return null;

            const files = this.findSourceFiles(apiDir);

            for (const filePath of files) {
                const content = readFileSync(filePath, 'utf-8');

                // Find if event is emitted in this file
                const emitPattern = new RegExp(`emit\\(['"\`]${eventName.replace(/\//g, '\\/')}['"\`]`, 'g');
                if (!emitPattern.test(content)) continue;

                // Look for function signature with return type
                const funcPattern = /export\s+(?:async\s+)?function\s+\w+[^:]+:\s*Promise<([^>]+)>/g;
                const match = funcPattern.exec(content);

                if (match) {
                    this.addLog(`  ✅ Found function return type`);
                    return {
                        type: match[1].trim(),
                        source: 'function-return-type',
                        confidence: 'medium'
                    };
                }
            }

            this.addLog(`  ❌ No function return type found`);
            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Error: ${error.message}`);
            return null;
        }
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    findSourceFiles(dir) {
        const files = [];
        const items = readdirSync(dir, { recursive: true, withFileTypes: false });

        for (const item of items) {
            const fullPath = join(dir, item);
            if (item.endsWith('.ts') && !item.endsWith('.d.ts') && !item.endsWith('.test.ts')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    findTestFiles(dir) {
        const files = [];
        const items = readdirSync(dir, { recursive: true, withFileTypes: false });

        for (const item of items) {
            const fullPath = join(dir, item);
            if (item.endsWith('.test.ts') || item.endsWith('.spec.ts')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Infer type from a ternary operator assignment
     * Example: const data = condition ? varA : varB;
     * @param {string} variableName - The variable to look for
     * @param {string} content - File content to search
     * @param {string} filePath - Current file path for logging
     * @returns {object|null} Type result or null
     */
    inferTypeFromTernary(variableName, content, filePath) {
        try {
            // Match: const varName = condition ? varA : varB;
            const ternaryPattern = new RegExp(
                `(?:const|let|var)\\s+${variableName}\\s*=\\s*[^?]+\\?\\s*(\\w+)\\s*:\\s*(\\w+)`,
                'g'
            );
            const match = ternaryPattern.exec(content);

            if (match) {
                const varA = match[1];
                const varB = match[2];
                this.addLog(`  🔀 Found ternary: ${varA} ? ${varA} : ${varB}`);

                // Look for type annotations for these variables
                const types = [];

                // Check function parameters with type annotations
                const paramPattern = new RegExp(`(${varA}|${varB})\\?\\s*:\\s*([^;,){}=]+)`, 'g');
                let paramMatch;

                while ((paramMatch = paramPattern.exec(content)) !== null) {
                    const varName = paramMatch[1];
                    const varType = paramMatch[2].trim();
                    this.addLog(`  📝 Found type for ${varName}: ${varType}`);

                    if (!types.includes(varType)) {
                        types.push(varType);
                    }
                }

                if (types.length > 0) {
                    // Create union type
                    const unionType = types.join(' | ');
                    this.addLog(`  ✅ Inferred from ternary operator`);
                    return {
                        type: unionType,
                        source: 'ternary-operator-inference',
                        confidence: 'high'
                    };
                }
            }

            return null;
        } catch (error) {
            this.addLog(`  ⚠️  Ternary inference error: ${error.message}`);
            return null;
        }
    }
    /**
     * Escape string for use in RegExp constructor
     * (escapes all regex special characters)
     * @param {string} s
     * @returns {string}
     */
    escapeRegExp(s) {
        // From MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

