<template lang="pug">
  div
    .grid.is-center.top-bar
      .column.is-8.row
        .column.is-2
          label(for='exa' tooltip="Hi i'm tooltip" tooltip-position='right') Exgaration:
        .column.is-10
          .slider#exa
            input(type='range' ref="exa", min='0', max='5', step='0.01', @input='updateParams')

        .column.is-2
          label(for='alpha' tooltip="Hi" tooltip-position='right') Alpha:
        .column.is-10
          .slider#alpha
            input(type='range' ref="alpha", min='1', max='100', step='0.01', @input='updateParams')

        .column.is-2
          label(for='lambdac' tooltip="Hi" tooltip-position='right') Lambda:
        .column.is-10
          .slider#lambdac
            input(type='range' ref="lambdac", min='1', max='90', step='0.01', @input='updateParams')

        .column.is-2
          label(for='chroma' tooltip="Hi" tooltip-position='right') Chroma:
        .column.is-10
          .slider#chroma
            input(type='range', ref="chroma", min='0', max='10', step='0.01', @input='updateParams')

        .column.is-2
          label(for='r1' tooltip="Hi" tooltip-position='right') r1:
        .column.is-10
          .slider#r1
            input(type='range' ref="r1", min='0', max='1', step='0.01', @input='updateParams')

        .column.is-2
          label(for='r2' tooltip="Hi" tooltip-position='right') r2:
        .column.is-10
          .slider#r2
            input(type='range', ref="r2", min='0', max='1', step='0.01', @input='updateParams')
      .column.is-4
        .evm-wrapper
          canvas(ref="savnac")
        

    .workspace.grid.is-center
      nuxt-link.back(to="/")
        svg.icon
          use(xlink:href="/img/sprites.svg#icon-back")

      .column.is-6.is-center.source
        video(ref="video")
        a.upload
          | uploade your vedio
      .column.is-6.is-cetner
        canvas.output(ref="canvas")
      .column.is-6
        canvas.chart(ref="chart")
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
