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
    setInterval(this.update.bind(this), 50);
  }

  update() {
    const frameAverage = this.getImageAverage();
    if (this.buffer.length >= 200) {
      this.buffer.shift();
    }
    this.buffer.push(frameAverage);
    this.chart.data.datasets[0].data = this.buffer;
    this.chart.update();
  }

  clear() {
    this.buffer = [];
  }
  drawChart() {
    this.chart = new Chart(this.chartCtx, {
      type: 'line',
      data: {
        labels: new Array(200),
        datasets: [{
          label: 'average',
          data: [],
          borderWidth: 1,
          borderColor: 'rgba(255, 240, 80, 1)',
          backgroundColor: 'rgba(0, 0, 0, 0)'
        }]
      },
      options: {
        elements: {
          line: {
            tension: 0
          }
        },
        animation: {
          duration: 0, // general animation time
        },
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resiz
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
