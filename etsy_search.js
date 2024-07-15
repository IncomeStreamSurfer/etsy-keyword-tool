require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const { parse } = require('json2csv');

const JINA_API_KEY = process.env.JINA_API_KEY;
const REVIEW_NUMBERS = process.env.REVIEW_NUMBERS.split(',').map(Number);
const HREFLANG_TAGS = process.env.HREFLANG_TAGS.split(',');
const SEARCH_OBJECT = process.env.SEARCH_OBJECT;

async function searchEtsy(reviewCount, langTag = '', limit = 100) {
    const langSegment = langTag ? `/${langTag}` : '';
    const url = `https://s.jina.ai/site%3Aetsy.com${langSegment}%2Flisting%20intext%3A%22${reviewCount}%20reviews%22%20${SEARCH_OBJECT}`;
    
    console.log(`Requesting URL: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${JINA_API_KEY}`
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('API Response:', JSON.stringify(responseData, null, 2));

        if (!responseData.data || !Array.isArray(responseData.data)) {
            console.error('Unexpected API response structure');
            return [];
        }

        // Filter out results where the title contains the review count
        const filteredResults = responseData.data.filter(item => !item.title.toLowerCase().includes(reviewCount.toString()));
        return filteredResults.slice(0, limit).map(item => ({...item, reviewCount, langTag}));
    } catch (error) {
        console.error('Error in searchEtsy:', error);
        return [];
    }
}

async function main() {
    const results = [];
    
    for (const langTag of HREFLANG_TAGS) {
        for (const count of REVIEW_NUMBERS) {
            console.log(`Searching for listings with ${count} reviews in region "${langTag || 'default'}"...`);
            try {
                const searchResults = await searchEtsy(count, langTag);
                results.push(...searchResults);
                console.log(`Found ${searchResults.length} results (after filtering)`);
            } catch (error) {
                console.error(`Error searching for ${count} reviews in region "${langTag || 'default'}":`, error.message);
            }
        }
    }

    if (results.length > 0) {
        // Export results to CSV
        const csv = parse(results, { fields: ['url', 'title', 'description', 'content', 'reviewCount', 'langTag'] });
        fs.writeFileSync('etsy_results_filtered.csv', csv);
        console.log(`Total results: ${results.length}`);
        console.log('Results exported to etsy_results_filtered.csv');
    } else {
        console.log('No results found. CSV file not created.');
    }
}

main().catch(console.error);