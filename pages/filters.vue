<template>
  <div class="app">
    <div class="toolbox">
      <select class="select" v-model="selectedImage">
        <option v-for="image in images" :value="image">{{ image }}</option>
      </select>
      <a class="button is-red is-block" @click="resetFilters">reset filters</a>
      <div class="filters">
        <a class="filters-item"
          v-for="kernel in kernels"
          @click="addFilter(kernel.matrix)">{{ kernel.name }}</a>
      </div>
      <div class="matrix">
        <input v-for="n in customMatrix" type="number" v-model="n.value">
        <button @click="customFilter" type="button" class="matrix-button">Apply</button>
      </div>      
    </div>
    <div class="artboard-wrapper">
      <nuxt-link class="artboard-back" to="/">
        <svg class="icon">
          <use xlink:href="/img/sprites.svg#icon-back"></use>
        </svg>
      </nuxt-link>
      <canvas ref="canvas" class="artboard">
        your browser doesn't support HTML5
      </canvas>
    </div>
  </div>
</template>

<script>
import Filters from '~assets/js/Filters';
import kernels from '~assets/js/kernels';


export default {
  data: () => ({
    customMatrix: [
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 1 },
      { value: 0 },
      { value: 0 },
      { value: 0 },
      { value: 0 }
    ],
    images: [
      './img/image-01.jpg',
      './img/image-02.jpg',
      './img/image-03.jpg'
    ],
    selectedImage: 'please an select image',
    kernels
  }),
  watch: {
    selectedImage(value) {
      if (!value) {
        return;
      }
      this.filters.loadImage(this.selectedImage);
    },
  },
  mounted() {
    this.filters = new Filters(this.$refs.canvas);
    // this.filters.loadImage('./img/image-01.jpg');
  },
  methods: {
    addFilter(kernel) {
      this.filters.addFilter(kernel);
    },
    resetFilters() {
      this.filters.resetFilters();
    },
    customFilter() {
      const kernel = this.customMatrix.map((el) => el.value);
      this.addFilter(kernel);
    }
  }
};
</script>
