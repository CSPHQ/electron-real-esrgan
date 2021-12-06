const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const ort = require('onnxruntime-node')

// ort.env.wasm.numThreads = 8
// ort.env.wasm.proxy = true

async function loadModel() {
    console.log('loading model')
    const sessionOption = {
        // executionProviders: ['wasm'],
    }
    const session = await ort.InferenceSession.create(
        path.join(__dirname, './RealESRGAN_x4plus_int8.onnx'),
        sessionOption,
    )
    console.log('model loaded')
    return session
}

let MODEL = null


ipcMain.on('asynchronous-message', async (event, image) => {
    if (image.save) {
        let filename = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
            title: 'Download to File…',
            filters: [
                { name: 'All Files', extensions: [image.ext] }
            ]
        });
        if (filename && filename.filePath) {
            fs.writeFile(filename.filePath, image.save, 'base64', console.error)
            // fs.writeFile(filename.filePath, toBuffer(image.save))
        }
        return
    }
    const imageData = Float32Array.from(image.data)
    const tensor = new ort.Tensor('float32', imageData, [1, 3, image.height, image.width])
    const feeds = { inputs: tensor }
    if (!MODEL) {
        MODEL = await loadModel()
    }
    const results = await MODEL.run(feeds)
    event.reply('asynchronous-reply', {
        data: results.outputs.data,
        height: image.height,
        width: image.width,
    })
})


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    // win.webContents.openDevTools()

    win.loadFile('index.html')

}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
