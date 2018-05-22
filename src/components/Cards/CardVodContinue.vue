<template>
  <div :class="this.seeAllText ? this.cardSeeAll() : this.cardClass()" :style="image"
    @click="doClick()"
  >
    <template v-if="seeAllText">
      {{ loc('general_seeall') }}
      <span class="subtitle">{{ seeAllText }}</span>
    </template>
    <template v-else>
        <div v-if="showDetails" :class="detailClass()">
          <div :class="timelineClass()">
            <div class="completed" :style="style.progress"></div>
          </div>
          <span class="first-row">{{ event.title }}</span>
          <span class="second-row">{{ secondRowText() }}</span>
        </div>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'CardVodContinue',
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
      seeAllText: String,
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
      style () {
        return {
          progress: `-webkit-transform: scaleX(${this.event.progress})`
        }
      },
      image () {
        if (this.event.id === 'SEE_ALL') {
          return
        }
        return {
          backgroundImage: `url(${this.event.imageUrl})`
        }
      }
    },
    methods: {
      doClick: function () {
        typeof this.clickFn === 'function' && this.clickFn(this)
      },
      secondRowText () {
        const title = this.event.subtitle || this.event.secondRowText
        return this.event && title ? title : ''
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
      },
      cardSeeAll () {
        return [
          'card-container',
          'see-all',
          {
            'is-selected': this.selected && !this.fasterAnimation,
            'is-closed': !this.showDetails,
            'no-transition-animation': !this.uiMode.cardRowCardTransitionAnimation,
            'no-scale': !this.uiMode.cardRowCardScale,
            'no-shadow': !this.uiMode.cardRowCardShadow,
            'faster-animation': this.selected && this.fasterAnimation
          }
        ]
      },
      timelineClass () {
        return [
          'timeline progress',
          {
            'hidden': this.fasterAnimation || !this.showDetails,
            'no-shadow': !this.uiMode.cardRowCardProgressShadow
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
  width: 300rem;
  height: 156rem;
  background-size: 300rem 156rem;
  color: $white;
  .description {
    width: 300rem;
    height: 104rem;
    bottom: -104rem;
    padding: 0 33rem;
    font-size: 22rem;
    background-color: $blue-medium;
    color: rgba($white, 0.5);
    .first-row {
      color: $white;
      margin-top: 29rem;
      margin-bottom: 4rem;
      font-size: 27rem;
    }
    .timeline {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      &.progress {
        height: 8rem;
        background-image: linear-gradient(to top, #b5b5b5 0%, #ececec 100%);
      }
      .completed {
        width: 100%;
        height: 8rem;
        background-image: $yellow-gradient-vertical;
        background-color: #fcb00f;
        transform-origin: left center;
      }
      &.hidden { display: none; }
    }
    &.faster-animation {
      color: rgba($black, .5);
      background-color: $yellow;
      .first-row { color: $black; }
    }
  }
  &.see-all {
    font-weight: 300;
    height: 260rem;
    font-size: 52rem;
    &.is-closed { height: 168rem; }
    &.faster-animation {
      color: $black;
      background-color: $yellow;
      .subtitle { color: rgba($black, .5); }
    }
     &.is-selected, body:not(.disable-hover) &:hover {
      color: $black;
      background-color: $yellow;
      .subtitle { color: rgba($black, .5); }
    }
    body:not(.disable-hover) &:hover {
      background-color: $yellow-hover;
    }
  }
  &.is-selected {
    transform: scale3d(1.25, 1.25, 1);
  }
  &.is-selected, body:not(.disable-hover) &:hover {
    .description {
      color: rgba($black, .5);
      background-color: $yellow;
      .first-row { color: $black; }
    }
  }
  body:not(.disable-hover) &:hover {
    .description {
      background-color: $yellow-hover;
    }
  }
}

</style>
