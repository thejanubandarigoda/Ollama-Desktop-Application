# Ollama Desktop Application

A powerful Electron desktop application that provides a beautiful interface for interacting with local Ollama AI models, with public web access via ngrok and advanced web/dark web search capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-28.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)

## ✨ Features

- 🤖 **Ollama Integration** - Chat with local AI models (llama2, mistral, etc.)
- 🌍 **Public Web Access** - Expose your Ollama instance via ngrok with authentication
- 🔍 **Web Search** - Search the clear web using SerpAPI, Google CSE, or DuckDuckGo
- 🕵️ **Dark Web Search** - Tor integration for ethical dark web research
- 🎨 **Beautiful UI** - Modern React interface with Ant Design
- 🔒 **Secure** - Basic auth, rate limiting, and read-only public API
- 📱 **QR Code** - Easy mobile access to public API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Ollama** - [Download](https://ollama.ai/)
   - Run: `ollama serve` to start the Ollama server
   - Download a model: `ollama pull llama2`

### Optional (for additional features):

3. **Tor Browser** (for dark web search) - [Download](https://www.torproject.org/)
4. **ngrok Account** (for public access) - [Sign up](https://ngrok.com/signup) - Free tier available
5. **Search API Key** (optional, for better web search):
   - [SerpAPI](https://serpapi.com/) OR
   - [Google Custom Search](https://developers.google.com/custom-search)

## 🚀 Installation

### Step 1: Clone or Download

Navigate to the project directory:

```bash
cd ollama-desktop-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Electron, React, Ant Design
- Express, ngrok, axios
- tor-request, socks-proxy-agent
- And more...

### Step 3: Build the Application

```bash
npm run build
```

## 🎯 Usage

### Starting the Application

**Development Mode** (with hot reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

### First-Time Setup

1. **Launch the app** - The application will open in a new window

2. **Configure Settings** - Click on "Settings" in the sidebar and configure:
   - **Ollama URL**: Default is `http://localhost:11434`
   - **Default Model**: Enter your preferred model (e.g., `llama2`)
   - **ngrok Auth Token**: (Optional) Paste your ngrok auth token for public access
   - **Search API Key**: (Optional) Add SerpAPI or Google CSE key for better search
   - **Tor Port**: 9150 for Tor Browser, 9050 for Tor service

3. **Save Settings** - Click "Save Settings"

### Using the Features

#### 💬 Chat with Ollama

1. Click "Chat" in the sidebar
2. Select your model from the dropdown
3. Type your message and press Enter or click Send
4. Enjoy AI-powered conversations!

#### 🔍 Web Search

1. Click "Search" in the sidebar
2. Select "Clear Web" mode
3. Enter your search query
4. Click "Search"
5. Click "Analyze with AI" on any result to get AI-powered insights

#### 🕵️ Dark Web Search (Use Responsibly)

**⚠️ LEGAL WARNING**: Only use for legitimate research purposes. Ensure compliance with local laws.

1. Start Tor Browser (it will open on port 9150 by default)
2. Click "Search" in the sidebar
3. Select "Dark Web (Tor)" mode
4. Read and accept the warning
5. Enter your search query
6. Results will be fetched via Tor network

#### 🌐 Public Web Access

1. Make sure you have set your ngrok auth token in Settings
2. Click "Public URL" in the sidebar
3. Click "Create Public Tunnel"
4. Your public URL will be displayed
5. Share the URL and credentials with remote users
6. Default credentials: Username: `ollama`, Password: `secure-pass-2024`

**API Endpoints:**
- `GET /api/health` - Health check (no auth)
- `GET /api/models` - List available models
- `POST /api/chat` - Chat with model
- `POST /api/generate` - Generate text

## 📦 Building for Distribution

### Windows

```bash
npm run package
```

This will create an installer in the `release/` directory.

### Additional Platforms

Update `package.json` build section for macOS or Linux targets.

## ⚙️ Configuration

Settings are stored in localStorage and include:

- **ollamaUrl**: Ollama server URL (default: `http://localhost:11434`)
- **defaultModel**: Model to use (default: `llama2`)
- **serverPort**: Express server port (default: `3000`)
- **ngrokAuthToken**: Your ngrok auth token
- **searchApiKey**: API key for search services
- **torPort**: Tor SOCKS proxy port (default: `9150`)
- **torEnabled**: Enable/disable Tor integration

## 🔒 Security Considerations

1. **Public API is Read-Only** - No model management or dangerous operations
2. **Basic Authentication** - Username/password required for public access
3. **Rate Limiting** - 100 requests per 15 minutes
4. **CORS Enabled** - Allows cross-origin requests
5. **Change Default Credentials** - For production, modify credentials in `src/main/server.js`

## 🐛 Troubleshooting

### Ollama Connection Failed

**Problem**: "Ollama is not running"

**Solution**:
```bash
# Start Ollama server
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### ngrok Tunnel Failed

**Problem**: "Failed to create tunnel"

**Solutions**:
- Ensure you have set your ngrok auth token in Settings
- Sign up at [ngrok.com](https://ngrok.com/) for a free token
- Check firewall settings

### Tor Connection Failed

**Problem**: "Tor is not available"

**Solutions**:
- **Option 1**: Download and run [Tor Browser](https://www.torproject.org/) (easiest)
- **Option 2**: Install Tor service on your system
- Verify Tor is running on port 9150 (Browser) or 9050 (Service)
- Check Settings > Tor Port configuration

### Build Errors

**Problem**: Dependencies not installing

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Sample Usage: Complete Workflow

### Scenario: Search and Analyze Web Results with AI

1. **Start Ollama**:
   ```bash
   ollama serve
   ollama pull llama2
   ```

2. **Launch App**:
   ```bash
   cd ollama-desktop-app
   npm run dev
   ```

3. **Search the Web**:
   - Navigate to Search tab
   - Enter: "latest developments in quantum computing"
   - Click Search

4. **Analyze Results**:
   - Click "Analyze with AI" on interesting results
   - Get AI-powered summaries and insights

5. **Chat with AI**:
   - Switch to Chat tab
   - Ask follow-up questions based on search results

6. **Share Publicly** (Optional):
   - Go to Public URL tab
   - Create tunnel
   - Share URL with colleagues

## 🌐 API Usage Example

Once you have a public URL, you can access it programmatically:

```javascript
// Example: Chat with Ollama via public API
const axios = require('axios');

const publicUrl = 'https://your-ngrok-url.ngrok.io';
const auth = {
  username: 'ollama',
  password: 'secure-pass-2024'
};

async function chat() {
  const response = await axios.post(
    `${publicUrl}/api/chat`,
    {
      model: 'llama2',
      messages: [
        { role: 'user', content: 'Hello, how are you?' }
      ]
    },
    { auth }
  );
  
  console.log(response.data);
}

chat();
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Legal Disclaimer

**Dark Web Access**: This application includes Tor integration for accessing .onion sites. Users are solely responsible for:
- Ensuring compliance with local laws and regulations
- Using this feature only for legitimate, legal research purposes
- Not accessing illegal content or engaging in illegal activities

The developers assume no liability for misuse of this software.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local AI models
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [Ant Design](https://ant.design/) - UI components
- [ngrok](https://ngrok.com/) - Public tunneling
- [Tor Project](https://www.torproject.org/) - Anonymous networking

## 📞 Support

For issues and questions:
- Check the Troubleshooting section above
- Review Ollama documentation: [ollama.ai/docs](https://ollama.ai/docs)
- Open an issue on GitHub

---

**Made with ❤️ for the AI community**
#   O l l a m a - D e s k t o p - A p p l i c a t i o n  
 