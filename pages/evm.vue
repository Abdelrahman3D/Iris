<template lang="pug">
  div
    label(for='exa') Exgaration Factor:
    input(type='range' ref="exa" style='width: 700px', min='0', max='5', step='0.01', @input='updateParams')
    br
    label(for='alpha') Alpha:
    input(type='range' ref="alpha" style='width: 700px', min='1', max='100', step='0.01', @input='updateParams')
    br
    label(for='lambdac') Lambda:
    input(type='range' ref="lambdac" style='width: 700px', min='1', max='90', step='0.01', @input='updateParams')
    br
    label(for='chroma') Chroma:
    input(type='range', ref="chroma" style='width: 700px', min='0', max='10', step='0.01', @input='updateParams')
    br
    label(for='r1') r1:
    input(type='range' ref="r1" style='width: 700px', min='0', max='1', step='0.01', @input='updateParams')
    br
    label(for='r2') r2:
    input(type='range', ref="r2" style='width: 700px', min='0', max='1', step='0.01', @input='updateParams')
    br
    video(ref="video")
    canvas(ref="canvas")
    canvas(ref="savnac")
    canvas(ref="chart")
</template>

<script>
import EVM from '~assets/js/EVM';
import Averaging from '~assets/js/Averaging';


export default {
  head() {
    return {
      title: 'Eulerian Video Magnification',
      meta: [
        { hid: 'description', name: 'description', content: 'Eulerian Video Magnification Demo' },
        { hid: 'og:description', name: 'og:description', content: 'Eulerian Video Magnification Demo' },
        { hid: 'og:title', name: 'og:title', content: 'Eulerian Video Magnification' }
      ]
    };
  },
  data: () => ({
    attempts: 0,
    params: {
      alpha: 10,
      lambda_c: 16,
      r1: 0.4,
      r2: 0.05,
      chromAttenuation: 1,
      exaggeration_factor: 2
    }
  }),
  methods: {
    prepare(width, height) {
      const s = Math.min(640 / width, 480 / height);
      // eslint-disable-next-line
      width = Math.floor(width * s >> 3) << 3;
      height = Math.floor(height * s >> 3) << 3; // eslint-disable-line
      this.$refs.video.style.width = `${width}px`;
      width = Math.max(480, width);
      this.$refs.savnac.width = width;
      this.$refs.canvas.width = width;
      this.$refs.savnac.height = height;
      this.$refs.canvas.height = height;

      this.ctx = this.$refs.canvas.getContext('2d');
      this.xtc = this.$refs.savnac.getContext('2d');
      this.chartCtx = this.$refs.chart.getContext('2d');
      this.$evm = new EVM(this.ctx, this.xtc, width, height, 5);
      this.$average = new Averaging(this.ctx, this.chartCtx, width, height);
      this.render();
    },
    listen() {
      const onLoad = () => {
        if (this.$refs.video.videoWidth > 0 && this.$refs.video.videoHeight > 0) {
          this.$refs.video.removeEventListener('loadeddata', onLoad);
          this.prepare(this.$refs.video.videoWidth, this.$refs.video.videoHeight);
          return;
        }

        if (this.attempts < 10) {
          this.attempts++;
          setTimeout(this.listen, 200);
        } else {
          this.prepare(640, 480);
        }
      };
      this.$refs.video.addEventListener('loadeddata', onLoad);
      navigator.getUserMedia({ video: true }, stream => {
        try {
          this.$refs.video.src = URL.createObjectURL(stream);
        } catch (error) {
          this.$refs.video.src = stream;
        }
        // wait 0.5 sec
        setTimeout(() => {
          this.$refs.video.play();
        }, 500);
      }, err => console.log(err));
    },
    render() {
      requestAnimationFrame(this.render.bind(this));
      if (this.$refs.video.readyState !== this.$refs.video.HAVE_ENOUGH_DATA) return;

      this.ctx.fillRect(0, 0, 640, 480);
      const s = Math.min(640 / this.$refs.video.videoWidth, 480 / this.$refs.video.videoHeight);
      this.ctx.drawImage(
        this.$refs.video, 0, 0, this.$refs.video.videoWidth * s, this.$refs.video.videoHeight * s
      );
      this.$evm.run(this.params);
    },
    updateParams() {
      this.params.alpha = +this.$refs.alpha.value;
      this.params.exaggeration_factor = +this.$refs.exa.value;
      this.params.chromAttenuation = +this.$refs.chroma.value;
      this.params.r1 = +this.$refs.r1.value;
      this.params.r2 = +this.$refs.r2.value;
      this.params.lambda_c = +this.$refs.lambdac.value;
    },
    sync() {
      this.$refs.alpha.value = this.params.alpha;
      this.$refs.exa.value = this.params.exaggeration_factor;
      this.$refs.chroma.value = this.params.chromAttenuation;
      this.$refs.r1.value = this.params.r1;
      this.$refs.r2.value = this.params.r2;
      this.$refs.lambdac.value = this.params.lambda_c;
    }
  },
  mounted() {
    this.$evm = null;
    this.sync();
    this.listen();
  }
};
</script>
