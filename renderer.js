
/**
 * 处理图片，把包含alpha通道的HWC图片，转换为1CHW且去掉alpha通道
 * @param {*} data 图片内容数组
 * @param {*} width 宽度
 * @param {*} height 高度
 * @returns 经过转换的图片
 */
function composeImage(data, width, height) {
    let t = tf.tensor(Array.from(data))
    t = tf.reshape(t, [1, height, width, 4])
    t = tf.transpose(t, [0, 3, 1, 2])
    t = tf.slice(t, [0, 0, 0, 0], [1, 3, height, width])
    t = tf.div(t, 255.0)
    return t
}

/**
 * 把图片提交到后台预测，并将预测结果返回
 * @param {*} event 要处理的图片的数据
 * @returns 处理好的Tensor
 */
function predictImage(event, tilePad) {
    return new Promise(resolve => {
        sendBackend(event)
        window.setCallback(async image => {
            window.setCallback(null)

            let t = tf.tensor(Array.from(image.data))
            t = tf.reshape(t, [3, image.height * 4, image.width * 4])
            // console.log('cut', [0, tilePad, tilePad], [3, image.height * 4 - tilePad, image.width * 4 - tilePad])
            t = tf.slice(t, [0, tilePad * 4, tilePad * 4], [3, image.height * 4 - tilePad * 8, image.width * 4 - tilePad * 8])
            t = tf.mul(t, 255)
            console.log('t', t)
            t = tf.transpose(t, [1, 2, 0])
            t = Array.from(t.dataSync())

            let arr = []
            for (let i = 0; i < t.length; i ++) {
                arr.push(t[i])
                if (((i + 1) % 3) === 0) {
                    arr.push(255)
                }
            }
            arr = new Uint8ClampedArray(arr)
            const imageData = new ImageData(arr, image.width * 4 - tilePad * 8, image.height * 4 - tilePad * 8)
            resolve(imageData)
        })
    })
}

document.querySelector('input#file').addEventListener('change', loadFile)

document.querySelector('button#save').addEventListener('click', () => {
    // 输出画布
    const outputCanvas = document.getElementById('outputCanvas')
    const url = outputCanvas.toDataURL('image/jpg', 0.9);
    // remove Base64 stuff from the Image
    const base64Data = url.replace(/^data:image\/png;base64,/, "")
    if (base64Data) {
        sendBackend({
            save: base64Data,
        })
    }
})

async function loadFile(event) {
    const image = document.getElementById('output')
    image.src = URL.createObjectURL(event.target.files[0])
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d');
    image.addEventListener('load', async () => {
        const width = image.width
        const height = image.height
        console.log(width, height)
        canvas.width = width
        canvas.height = height
        ctx.drawImage(image, 0, 0)
        const data = ctx.getImageData(0, 0, width, height)

        // 输出画布
        const outputCanvas = document.getElementById('outputCanvas')
        outputCanvas.width = width * 4
        outputCanvas.height = height * 4
        // outputCanvas.style.transform = 'scale(0.25, 0.25)'
        // outputCanvas.style.transformOrigin = 'left top'
        const ctxOutput = outputCanvas.getContext('2d')
        const tilePad = 10

        let outImage = composeImage(data.data, width, height)
        outImage = tf.pad(outImage, [[0, 0], [0, 0], [tilePad, tilePad], [tilePad, tilePad]])
        
        const tileSize = 60
        const countWidth = Math.ceil(width / tileSize)
        const countHeight = Math.ceil(height / tileSize)

        for (let i = 0; i < countHeight; i++) {
            for (let j = 0; j < countWidth; j++) {
                const partX = Math.min(width, j * tileSize)
                const partY = Math.min(height, i * tileSize)
                let partWidth = tileSize + tilePad * 2
                let partHeight = tileSize + tilePad * 2
                if (partWidth + partX > outImage.shape[3]) {
                    partWidth -= partWidth + partX - outImage.shape[3]
                }
                if (partHeight + partY > outImage.shape[2]) {
                    partHeight -= partHeight + partY - outImage.shape[2]
                }
                const partImage = tf.slice(
                    outImage,
                    [0, 0, partY, partX],
                    [1, 3, partHeight, partWidth]
                )
                // console.log(partX, partY, partWidth, partHeight, partImage)
                const partOutImage = await predictImage({
                    data: Array.from(partImage.dataSync()),
                    width: partWidth,
                    height: partHeight,
                }, tilePad)
                // console.log('partOutImage', partOutImage, partX, partY)
                ctxOutput.putImageData(partOutImage, partX * 4, partY * 4)
                // return
            }
        }
    })
}
