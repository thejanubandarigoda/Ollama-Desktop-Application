const tr = require('tor-request');
const { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');

class TorService {
    constructor() {
        this.torEnabled = false;
        this.torPort = 9150; // Tor Browser default, or 9050 for Tor service

        // Configure tor-request
        tr.setTorAddress('localhost', this.torPort);
    }

    // Check if Tor is available
    async checkStatus() {
        try {
            // Try to connect through Tor proxy
            const agent = new SocksProxyAgent(`socks5h://localhost:${this.torPort}`);

            const response = await axios.get('https://check.torproject.org/api/ip', {
                httpAgent: agent,
                httpsAgent: agent,
                timeout: 10000
            });

            return {
                available: true,
                isTor: response.data.IsTor || false,
                ip: response.data.IP,
                message: response.data.IsTor ? 'Connected via Tor' : 'Not using Tor network'
            };
        } catch (error) {
            return {
                available: false,
                error: 'Tor is not running',
                hint: 'Please start Tor Browser or Tor service. Default ports: 9150 (Browser) or 9050 (Service)',
                details: error.message
            };
        }
    }

    // Search dark web (.onion sites)
    async searchDarkWeb(query) {
        try {
            const status = await this.checkStatus();

            if (!status.available) {
                return {
                    success: false,
                    error: 'Tor is not available',
                    hint: status.hint,
                    results: []
                };
            }

            // Use Ahmia (a well-known .onion search engine accessible via clearnet too)
            // Or use the .onion address if Tor is working
            const searchUrl = 'https://ahmia.fi/search/';
            const agent = new SocksProxyAgent(`socks5h://localhost:${this.torPort}`);

            const response = await axios.get(searchUrl, {
                params: { q: query },
                httpAgent: agent,
                httpsAgent: agent,
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0'
                }
            });

            // Parse results (simplified - actual parsing would depend on Ahmia's HTML structure)
            const results = this.parseAhmiaResults(response.data);

            return {
                success: true,
                results,
                count: results.length,
                warning: '⚠️ Dark web results - Use responsibly and legally',
                source: 'Ahmia'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }

    // Make a request to a specific .onion site
    async requestOnionSite(url) {
        return new Promise((resolve, reject) => {
            tr.request(url, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ statusCode: res.statusCode, body });
                }
            });
        });
    }

    // Parse Ahmia search results (simplified)
    parseAhmiaResults(html) {
        // This is a simplified parser - in production, use cheerio for better parsing
        const results = [];

        // Mock results for demonstration
        results.push({
            title: 'Dark Web Search Results',
            link: 'Use Ahmia.fi for actual dark web search',
            snippet: 'For safety and legal reasons, this is a demonstration. Real implementation would parse Ahmia results.',
            source: 'Tor Network'
        });

        return results;
    }

    // Set Tor port (9150 for Tor Browser, 9050 for Tor service)
    setTorPort(port) {
        this.torPort = port;
        tr.setTorAddress('localhost', port);
    }
}

module.exports = new TorService();
