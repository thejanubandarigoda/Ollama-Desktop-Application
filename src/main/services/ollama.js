const axios = require('axios');

const OLLAMA_BASE_URL = 'http://localhost:11434';

class OllamaService {
    constructor(baseUrl = OLLAMA_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    // Check if Ollama is running
    async checkStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 3000 });
            return {
                online: true,
                models: response.data.models || []
            };
        } catch (error) {
            return {
                online: false,
                error: 'Ollama is not running. Please start Ollama first.'
            };
        }
    }

    // List available models
    async listModels() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`);
            return {
                success: true,
                models: response.data.models || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                models: []
            };
        }
    }

    // Chat with a model
    async chat(model, messages) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/chat`, {
                model,
                messages,
                stream: false
            });

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    // Generate text
    async generate(model, prompt) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model,
                prompt,
                stream: false
            });

            return {
                success: true,
                response: response.data.response
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message
            };
        }
    }

    // Stream chat (for future streaming support)
    async streamChat(model, messages, onChunk) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/chat`, {
                model,
                messages,
                stream: true
            }, {
                responseType: 'stream'
            });

            response.data.on('data', (chunk) => {
                const text = chunk.toString();
                const lines = text.split('\n').filter(line => line.trim());

                lines.forEach(line => {
                    try {
                        const data = JSON.parse(line);
                        if (data.message) {
                            onChunk(data.message.content);
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                });
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new OllamaService();
