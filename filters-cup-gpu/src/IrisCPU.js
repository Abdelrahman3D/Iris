export default class IrisCPU
{
  constructor(el) {
    this._resolveContext(el);
  }

  _resolveContext(el) {
    let canvas = el;
    if (typeof el === 'string') {
      canvas = document.querySelector(el);
    }

    if (! canvas) {
      throw new TypeError('No canvas provided!');
    }

    this.context = canvas.getContext('2d');
    this.canvas = canvas;
  }

  convolute(weights, opaque) {
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side/2);
    const src = this.imgData.data;
    const sw = this.imgData.width;
    const sh = this.imgData.height;
    // pad output by the convolution matrix
    const w = sw;
    const h = sh;
    const output = this.context.createImageData(this.canvas.width, this.canvas.height);
    const dst = output.data;
    // go through the destination image pixels
    const alphaFac = opaque ? 1 : 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sy = y;
        const sx = x;
        const dstOff = (y * w + x) * 4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        let r = 0, g = 0, b = 0, a = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = sy + cy - halfSide;
            const scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              const srcOff = (scy * sw + scx) * 4;
              const wt = weights[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
              a += src[srcOff + 3] * wt;
            }
          }
        }
        dst[dstOff] = r;
        dst[dstOff + 1] = g;
        dst[dstOff + 2] = b;
        dst[dstOff + 3] = a + alphaFac * (255 - a);
      }
    }
    this.context.putImageData(output, 0, 0);
  }

  getPixels() {
    return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  render(src, filter = [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0
  ]) {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      this.context.drawImage(image, 0, 0);
      this.imgData = this.getPixels();
      this.convolute(filter, image);
    }
  }
}
