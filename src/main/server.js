const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const basicAuth = require('express-basic-auth');
const axios = require('axios');

const app = express();
let server = null;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

// Basic authentication for public access
const authMiddleware = basicAuth({
    users: { 'ollama': 'secure-pass-2024' },
    challenge: true,
    realm: 'Ollama Desktop API'
});

// Health check endpoint (no auth needed)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Protected API Endpoints =====

// List available models (read-only)
app.get('/api/models', authMiddleware, limiter, async (req, res) => {
    try {
        const response = await axios.get('http://localhost:11434/api/tags');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch models',
            message: error.message
        });
    }
});

// Generate completion (read-only interaction)
app.post('/api/generate', authMiddleware, limiter, async (req, res) => {
    try {
        const { model, prompt } = req.body;

        if (!model || !prompt) {
            return res.status(400).json({ error: 'Model and prompt are required' });
        }

        const response = await axios.post('http://localhost:11434/api/generate', {
            model,
            prompt,
            stream: false
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate response',
            message: error.message
        });
    }
});

// Chat endpoint (read-only interaction)
app.post('/api/chat', authMiddleware, limiter, async (req, res) => {
    try {
        const { model, messages } = req.body;

        if (!model || !messages) {
            return res.status(400).json({ error: 'Model and messages are required' });
        }

        const response = await axios.post('http://localhost:11434/api/chat', {
            model,
            messages,
            stream: false
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to chat',
            message: error.message
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
function startServer(port) {
    return new Promise((resolve, reject) => {
        try {
            server = app.listen(port, () => {
                console.log(`Express server running on port ${port}`);
                console.log(`Public API endpoints available at http://localhost:${port}/api`);
                console.log('Default credentials - Username: ollama, Password: secure-pass-2024');
                resolve(server);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Stop server
function stopServer() {
    if (server) {
        server.close(() => {
            console.log('Express server stopped');
        });
    }
}

module.exports = { startServer, stopServer, app };
