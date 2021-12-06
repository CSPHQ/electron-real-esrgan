

importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.10.0-dev.20211124-a3ebc5e08/dist/ort.min.js')

async function loadModel() {
    const sessionOption = {
        executionProviders: ['wasm'],
    }
    const session = await ort.InferenceSession.create('RealESRGAN_x4plus_int8.onnx', sessionOption)
    return session
}

let MODEL = null


self.addEventListener('message', async function(e) {
    // self.postMessage(e.data);
    const event = e.data
    console.log('receive', event)
    // self.postMessage('hello')
    const imageData = Float32Array.from(event.data)
    const tensor = new ort.Tensor('float32', imageData, [1, 3, event.height, event.width])
    const feeds = { inputs: tensor }
    if (!MODEL) {
        MODEL = await loadModel()
    }
    const results = await MODEL.run(feeds)
    const image = {
        data: Array.from(results.outputs.data),
        height: event.height,
        width: event.width,
    }
}, false)
