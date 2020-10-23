<template>
  <div class="container">
    <div class="canvas-container one">
      <canvas id="originCanvas" ref="originCanvas" height="250"></canvas>
      <div>
        <sub>原图</sub>
      </div>
    </div>
    <div class="canvas-container two">
      <canvas id="blurCanvas" ref="blurCanvas" height="250"></canvas>
      <div>
        <sub>高斯模糊（原始算法）1px</sub>
      </div>
    </div>
    <div class="canvas-container three">
      <canvas id="fastBlurCanvas" ref="fastBlurCanvas" height="250"></canvas>
      <div>
        <sub>高斯模糊（快速算法）6px</sub>
      </div>
    </div>
    <div class="canvas-container four">
      <canvas
        id="filterBlurCanvas"
        ref="filterBlurCanvas"
        height="250"
      ></canvas>
      <div>
        <sub>高斯模糊（Canvas Filter）6px</sub>
      </div>
    </div>
  </div>
  <hr style="margin: 1rem 0; border-color: rgba(0, 0, 0, 0.1)" />
  <div class="tooltip">
    <span class="tooltip-text"
      >Original Blur Time:
      {{ originalBlur.endTime - originalBlur.startTime }}ms</span
    >
    <span class="tooltip-text"
      >Fast Blur Time: {{ fastBlur.endTime - fastBlur.startTime }}ms</span
    >
  </div>
</template>

<script>
import { readImage, drawToCanvas, clearCanvas } from '../assets/utils/index'
import { blur } from '../../lib/index'
import { Blur } from '../../lib/another'
export default {
  props: {
    msg: String,
  },
  data() {
    return {
      count: 0,
      url: '/test.jpg',
      originalBlur: {
        startTime: 0,
        endTime: 0,
      },
      fastBlur: {
        startTime: 0,
        endTime: 0,
      },
    }
  },
  async mounted() {
    this.resizeCanvas(this.$refs.originCanvas)
    this.resizeCanvas(this.$refs.blurCanvas)
    this.resizeCanvas(this.$refs.fastBlurCanvas)
    this.resizeCanvas(this.$refs.filterBlurCanvas)
    await this.handleFileChange()

    this.doOriginalBlur()
    this.doFastBlur()
  },
  methods: {
    async handleFileChange() {
      const image = await readImage(this.url)
      await drawToCanvas(image, this.$refs.originCanvas)
      await drawToCanvas(image, this.$refs.blurCanvas)
      await drawToCanvas(image, this.$refs.fastBlurCanvas)
      await drawToCanvas(image, this.$refs.filterBlurCanvas, {
        filter: 'blur(6px)',
      })
    },
    resizeCanvas(canvas) {
      const parent = canvas.parentNode
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    },
    drawToBlurCanvas(bluredImageData, width, height) {
      const canvas = this.$refs.blurCanvas
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.putImageData(bluredImageData, 0, 0)
    },
    doOriginalBlur() {
      const canvas = this.$refs.originCanvas
      const ctx = canvas.getContext('2d')
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      this.originalBlur.startTime = new Date()

      const bluredImageData = blur(imageData, canvas.width, canvas.height, {
        radius: 1,
      })
      clearCanvas(this.$refs.blurCanvas)
      this.drawToBlurCanvas(bluredImageData, canvas.width, canvas.height)

      this.originalBlur.endTime = new Date()
    },
    doFastBlur() {
      this.fastBlur.startTime = new Date()
      const blur = new Blur({ radius: 6 })
      blur.initCanvas(this.$refs.fastBlurCanvas)
      blur.gaussianBlur()
      this.fastBlur.endTime = new Date()
    },
  },
}
</script>

<style lang="scss">
.container {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: minmax(250px, auto);
}

.canvas-container {
  box-sizing: border-box;

  display: flex;
  justify-content: center;
  align-items: center;

  flex-direction: column;

  .one {
    grid-column: 1;
    grid-row: 1;
  }
  .two {
    grid-column: 2;
    grid-row: 1;
  }

  .three {
    grid-column: 1;
    grid-row: 2;
  }

  .four {
    grid-column: 2;
    grid-row: 2;
  }
}

canvas {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  // border: 4px solid red;
}

.tooltip {
  display: flex;
  justify-content: space-between;
  &-text {
    background-color: dodgerblue;
    color: white;
    padding: 0.5rem 0.8rem;

    border-radius: 0.2rem;
  }
}
</style>
