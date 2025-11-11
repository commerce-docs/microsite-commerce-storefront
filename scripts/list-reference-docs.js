#!/usr/bin/env node
/**
 * List Reference Documentation
 * 
 * Display or search available reference documentation topics.
 * 
 * Usage:
 *   npm run list-reference-docs
 *   npm run list-reference-docs -- search authoring
 *   npm run list-reference-docs -- list aem-live
 */

import {
    displayReferenceInfo,
    getAllTopics,
    searchTopics,
    listSources
} from './lib/reference-docs.js';

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

function displayTopics(source) {
    const topics = getAllTopics(source);

    console.log(`\n📖 Topics in '${source}':\n`);

    for (const [key, topic] of Object.entries(topics)) {
        console.log(`  ${key}`);
        console.log(`    Title: ${topic.title}`);
        console.log(`    URL: ${topic.url}`);
        console.log(`    Description: ${topic.description}\n`);
    }
}

function search(keyword) {
    const sources = listSources();
    let totalResults = 0;

    console.log(`\n🔍 Searching for "${keyword}"...\n`);

    for (const source of sources) {
        const results = searchTopics(source, keyword);

        if (results.length > 0) {
            console.log(`\n${source}:`);
            results.forEach(topic => {
                console.log(`  ✓ ${topic.key} - ${topic.title}`);
                console.log(`    ${topic.url}`);
            });
            totalResults += results.length;
        }
    }

    console.log(`\n${totalResults} result(s) found.\n`);
}

// Main execution
if (command === 'list' && param) {
    displayTopics(param);
} else if (command === 'search' && param) {
    search(param);
} else {
    displayReferenceInfo();
}

