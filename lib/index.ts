import * as math from 'mathjs'

/**
 * 计算高斯权重数值
 * @param x X坐标
 * @param y Y坐标
 * @param sigma
 */
export function calculateGaussianWeight(x: number, y: number, sigma: number) {
  const PI = Math.PI
  // 方差
  const variance = sigma * sigma
  const weight =
    (1 / (2 * PI * variance)) * Math.exp(-(x * x + y * y) / (2 * variance))
  return weight
}

/**
 * 归一化
 * @param matrix
 * @param sum 总和
 */
function normalization(matrix: math.Matrix, sum: number) {
  return math.divide(matrix, sum) as math.Matrix
}

/**
 * 生成高斯矩阵
 * @param radius 模糊半径
 * @param sigma σ 0.3*(radius - 1)+0.8
 * @param normal 是否归一化
 */
export function generateGaussianMatrix(
  radius: number,
  sigma?: number,
  normal?: boolean
) {
  if (!sigma) {
    sigma = 0.3 * (radius - 1) + 0.8
  }

  // 矩阵尺寸
  const mSize = radius * 2 + 1
  let gMatrix = math.matrix(math.ones(mSize, mSize))

  let sum = 0
  gMatrix.forEach((val, index) => {
    const x = index[0] - radius
    const y = index[1] - radius
    const weight = calculateGaussianWeight(x, y, sigma)
    gMatrix.set(index as any, weight)
    sum += weight
  })

  if (normal) {
    gMatrix = normalization(gMatrix, sum)
  }
  return gMatrix
}

interface BlurOptions {
  radius: number
  sigma?: number
}

export function blur(
  imageData: ImageData,
  width: number,
  height: number,
  options: BlurOptions
) {
  const data = imageData.data
  const originData = new Uint8ClampedArray(imageData.data)

  /**
   * 获取像素
   * @param x
   * @param y
   */
  function getPixel(x: number, y: number) {
    if (x < 0 || x >= height || y < 0 || y >= width) {
      return [0, 0, 0, 0]
    } else {
      const p = (x * width + y) * 4
      return originData.subarray(p, p + 4)
    }
  }

  const gMatrix = generateGaussianMatrix(
    options.radius,
    options.sigma ? options.sigma : null,
    true
  )

  const radius = options.radius

  let i = 0
  for (let x = 0; x < height; x++) {
    for (let y = 0; y < width; y++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      gMatrix.forEach((val, index) => {
        const dx = index[0] - radius
        const dy = index[1] - radius

        const pixel = getPixel(x + dx, y + dy)
        r += val * pixel[0]
        g += val * pixel[1]
        b += val * pixel[2]
        a += val * pixel[3]
      })
      data.set([r, g, b, a], i)
      i += 4
    }
  }
  return imageData
}
