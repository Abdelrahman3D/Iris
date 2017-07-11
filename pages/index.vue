<template>

  <div class="intro-background" style="background-image: url('/img/background.jpg')">
    <div class="intro">
      <nuxt-link class="intro-item" to="filters">
        <svg class="icon">
          <use xlink:href="./img/sprites.svg#icon-filter"></use>
        </svg>
      </nuxt-link>
      <nuxt-link class="intro-item" to="mask">
        <svg class="icon">
          <use xlink:href="./img/sprites.svg#icon-mask"></use>
        </svg>
      </nuxt-link>
      <nuxt-link class="intro-item" to="magnification">
        <svg class="icon">
          <use xlink:href="./img/sprites.svg#icon-magnification"></use>
        </svg>
      </nuxt-link>
    <img class="intro-hero" src="/img/mona_lisa.png"/>
    </div>
  </div>

</template>
