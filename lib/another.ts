import * as math from 'mathjs'
import { calculateGaussianWeight } from './index'

interface BlurOptions {
  /**
   * 模糊半径
   */
  radius: number
}

export class Blur {
  radius: number
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  constructor(options: BlurOptions) {
    this.radius = options.radius || 3
  }

  initCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  gaussianBlur() {
    const radius = this.radius
    const canvas = this.canvas
    const ctx = this.ctx

    // 矩阵尺寸
    const mSize = radius * 2 + 1
    let gMatrix = math.matrix(math.ones(mSize, mSize))

    let sum = 0
    let sigma = 0.3 * (radius - 1) + 0.8
    const step = radius < 3 ? 1 : 2

    // 跳着计算出高斯权重（所以总和不一样）
    for (let y = -radius; y <= radius; y += step) {
      for (let x = -radius; x <= radius; x += step) {
        let weight = calculateGaussianWeight(x, y, sigma)
        gMatrix.set([x + radius, y + radius], weight)
        sum += weight
      }
    }

    // 绘制不同透明度的原图，并偏移不同位置，叠加到原图上。
    for (let y = -radius; y <= radius; y += step) {
      for (let x = -radius; x <= radius; x += step) {
        ctx.globalAlpha = (gMatrix.get([x + radius, y + radius]) / sum) * radius
        ctx.drawImage(canvas, x, y)
      }
    }

    ctx.globalAlpha = 1
  }
}
