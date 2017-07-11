<template>
  <div class="face-tracker">
    <video
      :class="{ video: true, 'mirror__horizontal': mirroredH, 'mirror__vertical': mirroredV }"
      ref="video"
      :width="width"
      :height="height"
      preload="auto"
      loop
    ></video>
    <canvas
      :class="{ overlay: true, 'mirror__horizontal': mirroredH, 'mirror__vertical': mirroredV }"
      :width="width"
      :height="height"
      ref="overlay"
    ></canvas>
    <canvas
      v-if="hasMasks"
      :class="{ overlay: true, 'mirror__horizontal': mirroredH, 'mirror__vertical': mirroredV }"
      :width="width"
      :height="height"
      ref="webgl"
    ></canvas>
    <div class="selectbox">
      <select v-if="hasMasks" v-model="currentMask">
        <option v-for="(mask, index) in masks" :key="index" :value="mask">{{ mask.name }}</option>
      </select>
      <div v-if="hasMasks" v-show="false">
        <img v-for="(mask, index) in masks" :key="index" :src="mask.img" :id="`${mask.name}`">
      </div>
    </div>
  </div>
</template>

<script>
import pModel from '~assets/data/model';
import { masks } from '~assets/data/masks.json';
import FaceDeformer from '~assets/js/face_deformer';
import clm from '~assets/js/clmtrackr.min';

export default {
  name: 'face-tracker',
  tracker: null,
  context: null,
  props: {
    width: [Number, String],
    height: [Number, String],
    mirror: String,
    isTracking: Boolean,
    hasMasks: Boolean
  },
  data: () => ({
    masks,
    currentMask: masks[0]
  }),
  computed: {
    mirroredH () {
      return this.mirror === 'horizontal';
    },
    mirroredV () {
      return this.mirror === 'vertical';
    }
  },
  watch: {
    isTracking (value) {
      if (value) {
        setTimeout(() => {
          this.start();
        }, 1500);
        return;
      }

      setTimeout(() => {
        this.stop();
      }, 1500);
    },
    currentMask (value) {
      this.switchMasks();
    }
  },
  methods: {
    drawLoop () {
      requestAnimationFrame(this.drawLoop);
      this.context.clearRect(0, 0, this.width, this.height);
      if (this.tracker.getCurrentPosition()) {
        this.tracker.draw(this.$refs.overlay);
      }
    },
    drawGridLoop () {
      // get position of face
      const positions = this.tracker.getCurrentPosition(this.$refs.video);
      this.context.clearRect(0, 0, 500, 375);
      if (positions) {
        // draw current grid
        this.tracker.draw(this.$refs.overlay);
      }
      // check whether mask has converged
      var pn = this.tracker.getConvergence();
      if (pn < 0.4) {
        this.switchMasks();
        requestAnimationFrame(this.drawMaskLoop.bind(this));
      } else {
        requestAnimationFrame(this.drawGridLoop.bind(this));
      }
    },
    drawMaskLoop () {
      // get position of face
      const positions = this.tracker.getCurrentPosition();
      this.context.clearRect(0, 0, 400, 300);
      if (positions) {
        // draw mask on top of face
        this.fd.draw(positions);
      }
      requestAnimationFrame(this.drawMaskLoop.bind(this));
    },
    switchMasks () {
      this.fd.load(document.getElementById(this.currentMask.name), this.currentMask.data, pModel);
    },
    start () {
      this.tracker.start(this.$refs.video);
      if (this.hasMasks) {
        this.drawGridLoop();
        return;
      }
      this.drawLoop();
    },
    startVideo () {
      this.$refs.video.play();
    },
    stopVideo () {
      this.$refs.video.stop();
    },
    stop () {
      this.tracker.stop();
    },
    initStream () {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
      if (navigator.getUserMedia) {
        // set up stream
        let videoSelector = { video: true };
        if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
          const chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
          if (chromeVersion < 20) {
            videoSelector = 'video';
          }
        }

        navigator.getUserMedia(videoSelector, (stream) => {
          if (this.$refs.video.mozCaptureStream) {
            this.$refs.video.mozSrcObject = stream;
          } else {
            this.$refs.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
          }
          this.$refs.video.play();
        }, () => {
          alert('webcam failed!');
        });

        return;
      }

      alert('Your browser does not seem to support getUserMedia, using a fallback video instead.');
    },
    init () {
      this.context = this.$refs.overlay.getContext('2d');
      // eslint-disable-next-line
      this.tracker = new clm.tracker({ useWebGL: true });
      this.tracker.init(pModel);
      this.initStream();
    }
  },
  mounted () {
    this.init();
    this.startVideo();
    if (this.isTracking) {
      this.start();
    }
    if (this.hasMasks) {
      this.fd = new FaceDeformer(); // eslint-disable-line
      this.fd.init(this.$refs.webgl);
    }
  }
};
</script>

<style lang="stylus" scoped>
.face-tracker
  display: flex
  align-items: center
  justify-content: center

.overlay
  position absolute
  -o-transform scaleX(-1)
  -webkit-transform scaleX(-1)
  transform scaleX(-1)

.video
	-o-transform scaleX(-1)
	-webkit-transform scaleX(-1)
	transform scaleX(-1)

.mirror__horizontal
  -o-transform scaleY(-1)
  -webkit-transform scaleY(-1)
  transform scaleY(-1)

.mirror__vertical
  -o-transform scaleX(1)
  -webkit-transform scaleX(1)
  transform scaleX(1)

.selectbox
  display: block;
  position: absolute;
  bottom: -40px;
</style>
