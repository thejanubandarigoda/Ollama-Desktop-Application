const axios = require('axios');
const cheerio = require('cheerio');

class SearchService {
    // Search using Google Custom Search API or SerpAPI
    async searchWeb(query, apiKey = null) {
        try {
            // If API key is provided, try to use it (you can add Google CSE or SerpAPI here)
            if (apiKey && apiKey.includes('serpapi')) {
                return await this.searchWithSerpApi(query, apiKey);
            } else if (apiKey) {
                return await this.searchWithGoogleCSE(query, apiKey);
            }

            // Fallback to web scraping (DuckDuckGo HTML)
            return await this.searchWithScraping(query);
        } catch (error) {
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    // Search with SerpAPI (if user has API key)
    async searchWithSerpApi(query, apiKey) {
        try {
            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    q: query,
                    api_key: apiKey,
                    engine: 'google'
                }
            });

            const results = (response.data.organic_results || []).map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: 'SerpAPI'
            }));

            return {
                success: true,
                results,
                count: results.length
            };
        } catch (error) {
            throw new Error(`SerpAPI error: ${error.message}`);
        }
    }

    // Search with Google Custom Search Engine
    async searchWithGoogleCSE(query, apiKey) {
        try {
            // Format: apiKey:searchEngineId
            const [key, cx] = apiKey.split(':');

            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key,
                    cx,
                    q: query
                }
            });

            const results = (response.data.items || []).map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet,
                source: 'Google CSE'
            }));

            return {
                success: true,
                results,
                count: results.length
            };
        } catch (error) {
            throw new Error(`Google CSE error: ${error.message}`);
        }
    }

    // Fallback: Simple web scraping
    async searchWithScraping(query) {
        try {
            // Use DuckDuckGo HTML (simple scraping)
            const response = await axios.get('https://html.duckduckgo.com/html/', {
                params: { q: query },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const results = [];

            $('.result').each((i, elem) => {
                if (i >= 10) return false; // Limit to 10 results

                const title = $(elem).find('.result__title').text().trim();
                const link = $(elem).find('.result__url').attr('href');
                const snippet = $(elem).find('.result__snippet').text().trim();

                if (title && link) {
                    results.push({
                        title,
                        link: link.startsWith('http') ? link : `https://${link}`,
                        snippet: snippet || 'No description available',
                        source: 'DuckDuckGo'
                    });
                }
            });

            return {
                success: true,
                results,
                count: results.length,
                note: 'Using fallback web scraping. Add API key for better results.'
            };
        } catch (error) {
            throw new Error(`Web scraping error: ${error.message}`);
        }
    }
}

module.exports = new SearchService();
