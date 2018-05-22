<template>
  <div :class="this.seeAllText ? this.cardSeeAll() : this.cardClass()" :style="image"
    @click="doClick()"
  >
    <template v-if="seeAllText">
      {{ loc('general_seeall') }}
      <span class="subtitle">{{ seeAllText }}</span>
    </template>
    <template v-else>
        <img v-if="event.watched" class="watched-marker" src="../../../static/uc/images/dog-ear.png" alt="">
        <img src="../../../static/uc/images/vod_poster_shadow_big.png" v-if="selected" class="img-shadow">
        <div v-if="showDetails" :class="detailClass()">
          <div v-if="event.watchProgress !== undefined && event.watchProgress > 5000 && !event.watched" :class="timelineClass()">
            <div class="completed" :style="style.progress"></div>
          </div>
          <div class="first-row">
            <div v-if="event.subscribed" class="green-circle"></div>
            <span class="first-row-text">{{ firstRowText }}</span>
          </div>
          {{ secondRowText }}
        </div>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'CardVod',
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
      series: Boolean,
      episodesInSeason: Number
    },
    data () {
      return {
        uiMode: window.uiMode,
        translateMode: window.translateMode
      }
    },
    computed: {
      style () {
        let duration = this.event.duration
        let watchProgress = this.event.watchProgress
        let watchedInPrecent = watchProgress / (duration / 100)
        return {
          progress: `-webkit-transform: scaleX(${watchedInPrecent / 100})`
        }
      },
      firstRowText () {
        let seriesSeason = `${this.loc('gui_VOD_SEASON')} ${this.event.seasonNumber}`
        return this.series ? seriesSeason : this.event.firstRowText
      },
      secondRowText () {
        let episodes = `${this.episodesInSeason} ${this.loc('general_episode_number_format_2').toUpperCase()}`
        return this.episodesInSeason ? episodes : this.event.secondRowText
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
      detailClass () {
        return [
          'description',
          {
            'faster-animation': this.selected && this.fasterAnimation,
            'no-shadow': !this.uiMode.cardRowCardProgressShadow
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
      }
    }
  }
</script>

<style scoped lang="scss">
@import "variables";
@import "./_common.scss";


.card-container {
  width: 248rem;
  height: 366rem;
  background-size: 248rem 366rem;
  box-shadow: none;
  .description {
    width: 248rem;
    height: 98rem;
    bottom: -97rem;
    padding: 0 32rem;
    font-size: 23rem;
    background-color: $blue-medium;
    color: rgba($white, 0.5);
    box-shadow: none;
    .first-row {
      font-size: 29rem;
      margin-top: 15rem;
      margin-bottom: 6rem;
      color: $white;
      .green-circle {
        display: inline-block;
        margin: 0 13rem 2rem 0;
        height: 16rem;
        width: 16rem;
        background: #186923;
        box-shadow: 2rem 2rem 1rem 0 #2a3333, inset 6rem 6rem 23rem 0 #44d060;
        border-radius: 100%;
      }
    }
    &.faster-animation {
      color: rgba($black, .5);
      background-color: $yellow;
      .first-row { color: $black; }
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
        background-image: $yellow-gradient-horizontal;
        background-color: #fcb00f;
        transform-origin: left center;
      }
      &.hidden { display: none; }
    }
  }
  &.see-all {
    font-weight: 300;
    height: 464rem;
    .main { font-size: 52rem; }
    &.is-closed { height: 366rem; }
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
  &.is-selected, body:not(.disable-hover) &:hover {
    .timeline {
      box-shadow: 0 6rem 8rem -1rem rgba($black, 0.5);
    }
    .description {
      color: rgba($black, .5);
      background-color: $yellow;
      box-shadow: none;
      .first-row { color: $black; }
    }
    box-shadow: none;  
  }
  body:not(.disable-hover) &:hover {
    .description {
      background-color: $yellow-hover;
    }
  }
  .watched-marker {
    position: absolute;
    top: -4px;
    right: -4px;
  }
  .img-shadow {
    position: absolute;
    top: -16rem;
    left: -37rem;
    height: 148%;
    width: 130%;
  }
}

</style>
