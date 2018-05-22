<template lang="html">
  <div class="poster-container">
    <img
    :src="imageUrl" alt="">
  </div>
</template>

<script>
export default {
  name: 'Poster',
  props: {
    imageUrl: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
  @import "variables";
  .poster-container {
    opacity: 0;
    width: 248rem;
    height: 366rem;
    background-color: $yellow;
    position: absolute;
    top: -137px;
    left: 92rem;
    transition: transform $transition;
    img {
      width: 100%;
      height: 100%;
    }
  }
</style>
