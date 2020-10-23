/**
 * 读取图片
 * @param file
 */
export async function readImage(file: File | string) {
  // to base64
  // 如果是文件形式
  if (file instanceof File) {
    const reader = new FileReader()
    return new Promise((resolve) => {
      reader.onload = async (e) => {
        resolve(e.target?.result)
      }
      reader.readAsDataURL(file)
    })
  } else if (typeof file === 'string') {
    const objectURL = await fetch(new Request(file))
      .then((res) => {
        return res.blob()
      })
      .then((blob) => {
        return URL.createObjectURL(blob)
      })
    return objectURL
  }
}

interface DrawOptions {
  filter: string
}

/**
 * 绘制到 Canvas
 * @param image
 * @param canvas
 */
export function drawToCanvas(
  image: string,
  canvas: HTMLCanvasElement,
  options?: DrawOptions
) {
  const ctx = canvas.getContext('2d')
  const img = new Image()
  return new Promise((resolve) => {
    img.onload = () => {
      let imgWidth = img.width > canvas.width ? canvas.width : img.width
      let imgHeight = img.height > canvas.height ? canvas.height : img.height

      const widthScale = imgWidth / img.width
      const heightScale = imgHeight / img.height
      const scale = widthScale < heightScale ? widthScale : heightScale

      imgWidth = img.width * scale
      imgHeight = img.height * scale

      canvas.width = imgWidth
      canvas.height = imgHeight

      if (options && options.filter) {
        ctx.filter = options.filter
      }

      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, imgWidth, imgHeight)
      resolve()
    }
    img.src = image
    img.crossOrigin = 'anonymous'
  })
}

/**
 * 清空画布
 * @param canvas
 */
export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  canvas.height = 480
}
