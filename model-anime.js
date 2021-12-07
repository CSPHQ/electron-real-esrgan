
let MODEL = null

async function loadModel() {
    if (!MODEL) {
        const session = await ort.InferenceSession.create('RealESRGAN_x4plus_anime_6B_int8.onnx')
        MODEL = session
    }
    return MODEL
}
