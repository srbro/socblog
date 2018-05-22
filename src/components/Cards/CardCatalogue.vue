<template>
  <div :class="cardClass()" :style="image"
    @click="doClick()"
  >
  </div>
</template>

<script>
export default {
  name: 'CardCatalogue',
  props: {
    upperImageUrl: String,
    selected: {
      type: Boolean,
      required: true
    },
    fasterAnimation: Boolean,
    clickFn: {
      default: null,
      required: false
    }
  },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    image () {
      return {
        backgroundImage: `url(${this.upperImageUrl})`
      }
    }
  },
  methods: {
    doClick: function () {
      typeof this.clickFn === 'function' && this.clickFn(this)
    },
    cardClass () {
      return [
        'card-container',
        {
          'is-selected': this.selected && !this.fasterAnimation,
          'no-transition-animation': !this.uiMode.cardRowCardTransitionAnimation,
          'no-scale': !this.uiMode.cardRowCardScale,
          'no-shadow': !this.uiMode.cardRowCardShadow
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";
@import "./_common.scss";

.card-container {
  width: 300rem;
  height: 168rem;
  background-color: $blue-medium;
  background-size: 300rem 168rem;
  box-sizing: border-box;
  &.is-selected.no-scale, body:not(.disable-hover) &:hover {
    border: solid 5rem #f4aa0b;
  }
  &.is-selected{
    transform: scale3d(1.2, 1.2, 1);
  }
}

</style>
