<template>
  <div
    :class="className"
    @click="buttonClick()"
  >
    <svg v-if="icon" class="icon">
      <use :xlink:href="`#${icon}`"></use>
    </svg>
    <img v-if="imgPath" :src="imgPath" alt="">
    <div v-if="$slots.default" class="text">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ButtonIcon',
  data () {
    return {
      uiMode: window.uiMode
    }
  },
  computed: {
    className () {
      return [
        this.cta ? 'cta-button' : 'button',
        {
          'is-active': this.active,
          'is-dark': this.dark,
          'round': this.round,
          'hasImage': this.hasImage,
          'no-transition-animation': !this.uiMode.buttonsTransitionAnimation,
          'no-shadow': !this.uiMode.buttonsShadow,
          'no-scale': !this.uiMode.buttonsScale
        },
        this.$slots.default ? (this.icon ? 'icon-text' : 'text-only') : 'icon-only'
      ]
    }
  },
  props: {
    active: Boolean,
    cta: Boolean,
    dark: Boolean,
    icon: String,
    round: Boolean,
    hasImage: Boolean,
    imgPath: String,
    buttonClick: {
      required: false,
      default: () => null,
      type: Function
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.vod {
  .button {
    &.is-active {
      background-color: $yellow;
      color: $white;
    }
  }
}

.button {
  box-sizing: content-box;
  border-radius: 4rem;
  color: white;
  font-family: $font-alternative;
  font-size: 38rem;
  font-weight: 300;
  height: 50rem;
  line-height: 50rem;
  padding: 15rem;
  text-align: center;
  transition: background-color $transition-fast, color $transition-fast, transform $transition-fast;

  .icon {
    height: 100%;
    fill: white;
    filter: drop-shadow(2rem 2rem 4rem rgba($black, .45));
    width: 100%;
  }

  &.text-only {
    $button-size: 40rem;
    color: $blue-dark;
    font-size: 28rem;
    height: $button-size;
    line-height: $button-size + 1;
    padding: 0 15rem;
  }
  &.icon-only { width: 50rem; }
  &.icon-text {
    border-radius: 8rem;
    color: $blue-dark;
    display: flex;
    padding: 18rem 30rem 17rem 28rem;
    &.check {
      color: $blue;
      .icon { fill:#0094da; }
      &.is-active {
        color: #fff;
        .icon { fill: #fff; }
      }
    }

    .icon {
      fill: desaturate(lighten($blue-dark, 8%), 8%);
      filter: none;
      margin-right: 18rem;
      width: 50rem;
    }

    &.is-active { box-shadow: 0 11rem 16rem rgba($black, .18); }
  }
  &.round {
    $button-size: 105rem;
    background-color: $blue-medium;
    border-radius: 50%;
    box-shadow: 1.5rem 1.5rem 5rem rgba($black, .47);
    min-height: $button-size;
    padding: 0;
    min-width: $button-size;
    z-index: 2;
    &.is-active { transform: scale3d(1.2, 1.2, 1); }
  }
  &.is-active, body:not(.disable-hover) &:hover {
    background-color: $blue;
    color: $white;

    .icon { fill: $white; }
  }
  body:not(.disable-hover) &:hover {
    background-color: $blue-hover;
  }
  &.hasImage {
    width: 164rem;
    height: auto;
    body:not(.disable-hover) &:hover {
      background-color: transparent;
    }
    img {
      width: 164rem;
    }
  }
  &.is-dark {
    color: $white;
    &.icon-text {
      &.check {
        color: $yellow;
        .icon { fill: $yellow; }
      }
    }
    &.is-active {
      background-color: $yellow;
      &.check {
        color: $white;
        .icon { fill: $white; }
      }
    }
    .icon { fill: $white; }
    // color: $black;
    // .icon { fill: $black; }
    body:not(.disable-hover) &:hover {
      background-color: $yellow-hover;
    }
  }

}
.cta-button {
  box-sizing: content-box;
  display: flex;
  align-items: center;
  border-radius: 4rem;
  height: 40rem;
  width: 40rem;
  padding: 15rem;
  transition: background-color $transition-fast;
  .icon {
    fill: desaturate(#cacccd, 8%);
    filter: none;
    width: 30rem;
    height: 30rem;
    margin: auto;
  }
  &.is-active, body:not(.disable-hover) &:hover {
    background-color: $blue;
    color: $white;

    .icon { fill: $white; }
  }
  body:not(.disable-hover) &:hover {
    background-color: $blue-hover;
  }
}
</style>
