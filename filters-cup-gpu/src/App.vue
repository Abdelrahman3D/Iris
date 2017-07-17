<template>
  <div id="app">
    <div class="toolbox">
      <span class="toolbox-label">Use GPU</span>
      <input type="checkbox" v-model="isGPU" :value="true">
      <span class="toolbox-label">Image</span>
      <select v-model="image">
        <option v-for="image in images" :value="image">{{ image }}</option>
      </select>
      <span class="toolbox-label">Filter</span>
      <select v-model="filter">
        <option v-for="(filter, name) in filters" :value="filter">{{ name }}</option>
      </select>
      <span class="toolbox-label">Convolotion matrix</span>
      <div class="matrix">
        <input v-for="n in filterMatrix" type="number" v-model="n.value">
        <button @click="applyFilter" type="button" class="matrix-button">Apply</button>
      </div>
    </div>
    <canvas v-show="isGPU" ref="gpuCanvas" width="1920" height="1080" class="artboard">
      your browser doesn't support HTML5
    </canvas>
    <canvas v-show="! isGPU" ref="cpuCanvas" width="1920" height="1080" class="artboard">
      your browser doesn't support HTML5
    </canvas>
  </div>
</template>

<script>
import Iris from './Iris';
import IrisCPU from './IrisCPU';
import filters from './filters';

export default {
  data: () => ({
    benchmarks: [],
    filterMatrix: [
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 }
    ],
    image: 'img/image-01.jpg',
    filter: null,
    images: [
      'img/image-01.jpg',
      'img/image-02.jpg',
      'img/image-03.jpg',
      'img/image-04.png',
      'img/image-05.jpg'
    ],
    filters,
    isGPU: true
  }),
  watch: {
    filter(value) {
      if (! value) {
        return;
      }

      this.filterMatrix = value.map(c => ({ value: c }));
      this.render(value);
    },
    image(value) {
      if (! value) {
        return;
      }

      this.filter = this.filters.normal;
      this.render();
    },
    isGPU() {
      this.render();
    }
  },
  methods: {
    applyFilter() {
      this.render(this.filterMatrix.map(n => parseInt(n.value)));
    },
    render(value = this.filters.normal) {
      if (this.isGPU) {
        this.gpu.render(this.image, value);
        return;
      }

      this.cpu.render(this.image, value);
    }
  },
  created() {
    this.filter = this.filters.normal;
  },
  mounted() {
    this.gpu = new Iris(this.$refs.gpuCanvas);
    this.cpu = new IrisCPU(this.$refs.cpuCanvas);
    this.render();
  }
}
</script>

<style lang="css">
canvas {
  background-color: #ddd;
}
</style>
