<template>
  <div class="loader"
   :style="addStyle"
  ></div>
</template>

<script>
const width = 100
const height = 100
const border = 15

export default {
  name: 'Loader',
  props: {
    top: Number,
    left: Number
  },
  computed: {
    addStyle () {
      if (this.top && this.left) {
        return {top: `${this.top - (height / 2 + border)}rem`, left: `${this.left - (width / 2 + border)}rem`}
      } else if (this.top) {
        return {top: `${this.top - (height / 2 + border)}rem`}
      } else if (this.left) {
        return {left: `${this.left - (width / 2 + border)}rem`}
      } else {
        return {}
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.loader {
  $width: 100rem;
  $height: 100rem;
  $border-width: 15rem;
  height: 145rem;
  width: 145rem;
  position: absolute;
  z-index: 10;
  left: calc(50% - #{$width / 2 + $border-width});
  top: calc(50% - #{$height / 2 + $border-width});
  &::after {
    animation: spin 1.5s ease infinite;
    border-top-color: #eee;
    border-left-color: #eee;
    border-right-color: #eee;
    border-bottom-color: $blue;
    border-radius: 50%;
    border-style: solid;
    border-width: $border-width;
    content: '';
    height: $height;
    position: absolute;
    width: $width;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
