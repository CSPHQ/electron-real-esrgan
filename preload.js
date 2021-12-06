
const { contextBridge, ipcRenderer, shell } = require('electron')

let callback = null

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    if (callback) {
        callback(arg)
    }
})

function sendBackend(msg) {
    ipcRenderer.send('asynchronous-message', msg)
}

function setCallback(cb) {
    callback = cb
}
contextBridge.exposeInMainWorld('setCallback', setCallback)
contextBridge.exposeInMainWorld('sendBackend', sendBackend)
contextBridge.exposeInMainWorld('openurl', url => {
    shell.openExternal(url)
})
