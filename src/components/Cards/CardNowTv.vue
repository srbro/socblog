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
          <div :class="['completed', {'blocked': blocked}]" :style="style.progress"></div>
        </div>
        <span class="first-row">{{ event.firstRowText }}</span>
        {{ event.secondRowText }}
      </div>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'CardNowTv',
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
      },
      blocked: Boolean
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
          backgroundImage: `url(${this.event.logoUrl}), url(${this.event.imageUrl})`
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
            'no-scale': this.selected && !this.uiMode.cardRowCardScale,
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
  height: 336rem;
  background-size: 300rem 168rem;
  background-color: $white;
  
  .description {
    width: 300rem;
    font-size: 24rem;
    height: 104rem;
    bottom: -94rem;
    padding: 0 31rem;
    color: rgba($black, 0.5);
    .first-row {
      font-size: 29rem;
      margin-top: 24rem;
      margin-bottom: 5rem;
      color: $black;
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
      &.hidden { display: none; }
      .completed {
        width: 100%;
        height: 8rem;
        background-image: $blue-gradient-vertical;
        background-color: #00689c;
        transform-origin: left center;
        &.blocked {
          background: $grey-dark-gradient-vertical;
        }
      }
    }
  }
  &.see-all {
    height: 440rem;
    font-weight: 300;
    &.is-closed {height: 336rem; }
    &.faster-animation {
      background-color: $blue;
      color: $white;
      .subtitle { color: rgba($white, 0.5); }
    }
  }
}

</style>
