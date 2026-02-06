const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Ollama API
    ollama: {
        checkStatus: () => ipcRenderer.invoke('ollama:status'),
        listModels: () => ipcRenderer.invoke('ollama:models'),
        chat: (model, messages) => ipcRenderer.invoke('ollama:chat', { model, messages }),
        generate: (model, prompt) => ipcRenderer.invoke('ollama:generate', { model, prompt })
    },

    // Search API
    search: {
        web: (query, apiKey) => ipcRenderer.invoke('search:web', { query, apiKey }),
        darkWeb: (query) => ipcRenderer.invoke('search:dark', { query })
    },

    // Tor API
    tor: {
        checkStatus: () => ipcRenderer.invoke('tor:status')
    },

    // ngrok API
    ngrok: {
        connect: (authToken, port) => ipcRenderer.invoke('ngrok:connect', { authToken, port }),
        disconnect: () => ipcRenderer.invoke('ngrok:disconnect'),
        getStatus: () => ipcRenderer.invoke('ngrok:status')
    },

    // Settings API
    settings: {
        save: (settings) => ipcRenderer.invoke('settings:save', settings)
    }
});

console.log('Preload script loaded - APIs exposed to renderer');
