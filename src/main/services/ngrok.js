const ngrok = require('ngrok');

class NgrokService {
    constructor() {
        this.url = null;
        this.connected = false;
    }

    // Connect to ngrok
    async connect(authToken, port = 3000) {
        try {
            if (this.connected) {
                return {
                    success: true,
                    url: this.url,
                    message: 'Already connected'
                };
            }

            // Set auth token if provided
            if (authToken) {
                await ngrok.authtoken(authToken);
            }

            // Create tunnel
            this.url = await ngrok.connect({
                proto: 'http',
                addr: port,
                region: 'us'
            });

            this.connected = true;

            return {
                success: true,
                url: this.url,
                port,
                message: 'ngrok tunnel created successfully'
            };
        } catch (error) {
            this.connected = false;
            return {
                success: false,
                error: error.message,
                hint: 'Make sure you have set your ngrok auth token in settings'
            };
        }
    }

    // Disconnect from ngrok
    async disconnect() {
        try {
            if (!this.connected) {
                return { success: true, message: 'Not connected' };
            }

            await ngrok.disconnect();
            await ngrok.kill();

            this.url = null;
            this.connected = false;

            return {
                success: true,
                message: 'ngrok tunnel closed'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get connection status
    async getStatus() {
        return {
            connected: this.connected,
            url: this.url,
            credentials: {
                username: 'ollama',
                password: 'secure-pass-2024'
            }
        };
    }

    // Get API URL
    getApiUrl() {
        if (!this.connected || !this.url) {
            return null;
        }
        return `${this.url}/api`;
    }
}

module.exports = new NgrokService();
