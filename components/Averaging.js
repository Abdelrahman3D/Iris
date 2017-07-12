export default class Averaging {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.buffer = [];
    this.start();
  }

  start() {
    this.buffer = [];
    setInterval(() => {
      const frameAverage = this.getImageAverage();
      if (this.buffer.length >= 20) this.buffer.shift();
      this.buffer.push(frameAverage);
    }, 1000);
  }
  getImageAverage() {
    const frameDate = this.ctx.getImageData(0, 0, this.width, this.height).data;
    let sum = 0;
    frameDate.forEach((pixel) => {
      sum += pixel;
    });
    const average = sum / frameDate.length;
    return average;
  }
}
