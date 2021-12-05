
const { contextBridge } = require('electron')
const { ipcRenderer } = require('electron')

let callback = null

ipcRenderer.on('asynchronous-reply', (event, arg) => {
    // console.log('receive', arg) // prints "pong"
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

// function onsubmit(event) {
//     console.log(event)
//     sendBackend({id: 1, data: 'ping'})
// }

contextBridge.exposeInMainWorld('setCallback', setCallback)
contextBridge.exposeInMainWorld('sendBackend', sendBackend)
