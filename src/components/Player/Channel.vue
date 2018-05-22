<template>
  <div :class="channelClass" :style="`background-image: url(${imgUrl})`">
    <span class="channel-number-container">{{ number }}</span>
    <!-- <img class="channel-logo" :src="imgUrl" alt=""> -->
  </div>
</template>

<script>
export default {
  name: 'PlayerChannel',
  data () {
    return {
      uiMode: window.uiMode
    }
  },
  computed: {
    channelClass () {
      return [
        'channel',
        { 'is-selected': this.selected },
        { 'focused': this.selected && !this.fasterAnimation },
        { 'no-transition-animation': !this.uiMode.channelTransitionAnimation },
        { 'no-shadow': !this.uiMode.channelShadow },
        { 'fast-animation': this.fasterAnimation }
      ]
    }
  },
  props: {
    number: {
      type: Number
    },
    imgUrl: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    },
    fasterAnimation: Boolean
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.channel {
  background-color: $white;
  // background-color: rgba($white, 0.45);
  display: flex;
  height: 168rem;
  justify-content: center;
  margin: 0 0 12rem 66rem;
  position: relative;
  visibility: hidden;
  width: 300rem;
  background-size: 300rem;
  transform: scale3d(1, 1, 1);  // adds a layer, less repainting

  &.is-selected {
    background-color: rgba($white, 1);
    visibility: visible;
    &.fast-animation { background-color: rgba($white, 1); }
  }

  &.focused {
    transform: scale3d(1.14, 1.14, 1);
    background-color: rgba($white, 1);
    box-shadow: $box-shadow-down-large;
    z-index: 1;
  }

  .channel-number-container {
    color: rgba($black, 0.7);
    font-family: $font-alternative;
    font-size: 25rem;
    left: 12rem;
    position: absolute;
    top: 12rem;
  }
  // .channel-logo {
  //   margin: auto;
  //   width: 300rem;
  // }

  body:not(.disable-hover) &:hover {
    &:after {
      $border-width: 5rem;
      border: $border-width solid $blue-hover;
      content: '';
      height: calc(100% - 10rem);
      left: 0;
      position: absolute;
      top: 0;
      width: calc(100% - 10rem);
    }
  }
}
</style>
