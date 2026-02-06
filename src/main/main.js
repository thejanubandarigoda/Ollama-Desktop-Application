// Polyfill for undici compatibility with Electron
// undici expects File to be globally available but it's not in Node.js/Electron
if (typeof global.File === 'undefined') {
    global.File = class File extends Blob {
        constructor(bits, name, options) {
            super(bits, options);
            this.name = name;
            this.lastModified = options?.lastModified || Date.now();
        }
    };
}

if (typeof global.Blob === 'undefined') {
    global.Blob = class Blob {
        constructor(bits, options) {
            this.size = 0;
            this.type = options?.type || '';
        }
    };
}

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startServer, stopServer } = require('./server');
const ollamaService = require('./services/ollama');
const ngrokService = require('./services/ngrok');
const searchService = require('./services/search');
const torService = require('./services/tor');

let mainWindow;
let serverPort = 3000;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#1a1a1a',
        titleBarStyle: 'default',
        icon: path.join(__dirname, '../../assets/icon.png')
    });

    // Load the React app
    const htmlPath = path.join(__dirname, '../../src/renderer/index.html');
    mainWindow.loadFile(htmlPath);

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Start Express server
    startServer(serverPort).then(() => {
        console.log(`Express server started on port ${serverPort}`);
    }).catch(err => {
        console.error('Failed to start server:', err);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        stopServer();
        app.quit();
    }
});

app.on('before-quit', () => {
    stopServer();
    ngrokService.disconnect();
});

// ===== IPC Handlers for Ollama =====
ipcMain.handle('ollama:status', async () => {
    return await ollamaService.checkStatus();
});

ipcMain.handle('ollama:models', async () => {
    return await ollamaService.listModels();
});

ipcMain.handle('ollama:chat', async (event, { model, messages }) => {
    return await ollamaService.chat(model, messages);
});

ipcMain.handle('ollama:generate', async (event, { model, prompt }) => {
    return await ollamaService.generate(model, prompt);
});

// ===== IPC Handlers for Search =====
ipcMain.handle('search:web', async (event, { query, apiKey }) => {
    return await searchService.searchWeb(query, apiKey);
});

ipcMain.handle('search:dark', async (event, { query }) => {
    return await torService.searchDarkWeb(query);
});

// ===== IPC Handlers for Tor =====
ipcMain.handle('tor:status', async () => {
    return await torService.checkStatus();
});

// ===== IPC Handlers for ngrok =====
ipcMain.handle('ngrok:connect', async (event, { authToken, port }) => {
    return await ngrokService.connect(authToken, port || serverPort);
});

ipcMain.handle('ngrok:disconnect', async () => {
    return await ngrokService.disconnect();
});

ipcMain.handle('ngrok:status', async () => {
    return await ngrokService.getStatus();
});

// ===== IPC Handler for Settings =====
ipcMain.handle('settings:save', async (event, settings) => {
    // Settings are saved in renderer via localStorage
    // This handler can be used for main process settings if needed
    return { success: true };
});

console.log('Ollama Desktop App - Main process loaded');
