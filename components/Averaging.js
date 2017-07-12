import Chart from 'chart.js';

export default class Averaging {
  constructor(ctx, chartCtx, width, height) {
    this.ctx = ctx;
    this.chartCtx = chartCtx;
    this.width = width;
    this.height = height;
    this.buffer = [];
    this.drawChart();
    this.start();
  }

  start() {
    this.buffer = [];
    setInterval(() => {
      const frameAverage = this.getImageAverage();
      if (this.buffer.length >= 20) this.buffer.shift();
      this.buffer.push(frameAverage);
      this.chart.data.datasets[0].data = this.buffer;
    }, 16);
  }

  drawChart() {
    this.chart = new Chart(this.chartCtx, {
      type: 'bar',
      data: {
        labels: new Array(20),
        datasets: [{
          label: 'average',
          data: [],
          borderWidth: 0.2
        }]
      }
    });
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
