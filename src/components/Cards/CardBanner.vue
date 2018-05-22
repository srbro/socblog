<template>
  <div :class="cardClass()" :style="image"
    @click="doClick()"
  >
    <div v-if="showDetails" :class="detailClass()">
      <span class="first-row">{{ event.firstRowText }}</span>
      {{ event.secondRowText }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardBanner',
  props: {
    event: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    },
    showDetails: {
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
        backgroundImage: `url(${this.event.imageUrl})`
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
          'vod-banner': this.$route.name === 'VodLanding',
          'no-transition-animation': !this.uiMode.cardRowCardTransitionAnimation,
          'no-scale': !this.uiMode.cardRowCardScale,
          'no-shadow': !this.uiMode.cardRowCardShadow
        }
      ]
    },
    detailClass () {
      return [
        'description',
        {
          'faster-animation': this.selected && this.fasterAnimation,
          'no-shadow': !this.uiMode.cardRowCardProgressShadow
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
  height: 366rem;
  width: 650rem;
  background-size: auto 366rem;
  .description {
    width: 650rem;
    height: 102rem;
    bottom: -102rem;
    padding: 0 32rem;
    .first-row {
      margin-top: 14rem;
      margin-bottom: 2rem;
      color: $black;
    }
  }
  &.vod-banner {
    .description {
      font-size: 23rem;
      background-color: $blue-medium;
      color: rgba($white, .5);
      .first-row { color: $white; }
      &.faster-animation {
        background-color: $yellow;
        color: rgba($black, .5);
        .first-row { color: $black; }
      }
    }
  }
  &.is-selected, body:not(.disable-hover) &:hover {
    &.vod-banner {
      .description {
        color: rgba($black, .5);
        background-color: $yellow;
        .first-row { color: $black; }
      }
    }
  }
  body:not(.disable-hover) &:hover {
    &.vod-banner {
      .description {
        background-color: $yellow-hover;
      }
    }
  }
}

</style>
