<template>
  <face-tracker
    :is-tracking="true"
    width="600"
    height="400"
    type="mask"
    :has-masks="true"
  ></face-tracker>
</template>

<script>
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
};
</script>
