<template>
  <div class="progress-bar">
    <div class="title-time" v-show="!trickplayData.time">
      <h1 class="title">{{ event.title }}</h1>
      <div v-bind:class="{time: true, 'vod-time': type === 'vod'}">{{ formattedTimeSpan }}</div>
    </div>
    <div :class="progressClass">
      <div class="bar">
        <div class="completed" :style="barStyle"></div>
      </div>
        <div v-show="trickplayData.time" :class="trickplayClass" :style="trickplayStyle">
        <!--<img class="preview-image" src="assets/images/trickplay.jpg" />
        <div class="overlay"></div>
        <div :class="iconClass">
          <svg class="icon-image">
            <use :xlink:href="`#player-${trickplayData.skip ? 'skip-' : ''}${trickplayData.direction}`" />
          </svg>
          <div class="icon-text">
            <span>{{ formattedTrickplaySpeed }}</span>
          </div>
        </div>-->
        <div :class="trickPlayClass">
          {{ formattedTrickplayTime }}
          <span v-if="trickplayData.mouse" class="inner-circle"></span>
        </div>
      </div>
      <div :class="bubbleClass" :style="bubbleStyle" @mousedown="handleMouseDown($event)">{{ formattedCurrentTime }}</div>
    </div>
  </div>
</template>

<script>
import constants from './constants.json'
import { formatTime, formatTimeDot, timestampVODTimeToHuman } from 'helpers/time'

const PROGRESS_WIDTH = 1422

export default {
  name: 'PlayerProgressBar',
  props: {
    event: {
      type: Object,
      default: () => ({
        id: -1,
        title: '',
        startTime: Date.now(),
        endTime: Date.now(),
        channelId: -1,
        thumbnail: '',
        ageRating: '0'
      })
    },
    currentTime: {
      type: Number,
      required: true
    },
    liveTime: {
      type: Number,
      required: true
    },
    trickplayData: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    type: {
      type: String
    },
    handleMouseDown: {
      default: () => null,
      type: Function
    }
  },
  data () {
    return {
      translateMode: window.translateMode
    }
  },
  computed: {
    barStyle () {
      return { transform: `scale3d(${this.getCompleted(this.liveTime)}, 1, 1)` }
    },
    bubbleStyle () {
      let transform3d = `translate3d(${this.getCompleted(this.currentTime) * PROGRESS_WIDTH}rem, 0, 0)`
      let transform2d = `translate(${this.getCompleted(this.currentTime) * PROGRESS_WIDTH}rem, 0)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d
      }
    },
    bubbleClass () {
      return ['bubble', { 'hide-indicator': this.trickplayData.time }, { 'drag-drop': this.trickplayData.mouse }, { 'vod-bubble bubble-vod': this.type === 'vod' }]
    },
    trickPlayClass () {
      return ['trickplay-time', { 'vod-trickplay-time trickplay-time-vod': this.type === 'vod' }]
    },
    trickplayStyle () {
      let transform3d = `translate3d(${this.getCompleted(this.trickplayData.time) * PROGRESS_WIDTH}rem, 0, 0)`
      let transform2d = `translate(${this.getCompleted(this.trickplayData.time) * PROGRESS_WIDTH}rem, 0)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d
      }
    },
    trickplayClass () {
      return ['trickplay', { 'drag-drop': this.trickplayData.mouse, 'vod-trickplay': this.type === 'vod' }]
    },
    progressClass () {
      return ['progress', { 'is-expanded': this.active }]
    },
    iconClass () {
      return ['icon', (this.trickplayData.skip ? 'icon-skip' : 'icon-regular'), `icon-${this.trickplayData.direction}`]
    },
    formattedTimeSpan () {
      if (this.type === 'vod') {
        let duration = this.event.duration
        return `${timestampVODTimeToHuman(this.liveTime)} / ${timestampVODTimeToHuman(duration)}`
      } else {
        return `${formatTime(this.event.startTime)} - ${formatTime(this.event.endTime)}`
      }
    },
    formattedCurrentTime () {
      if (this.type === 'vod') {
        return timestampVODTimeToHuman(this.liveTime)
      } else {
        return formatTimeDot(this.currentTime)
      }
    },
    formattedTrickplayTime () {
      if (this.type === 'vod') {
        return timestampVODTimeToHuman(this.trickplayData.time)
      } else {
        return this.trickplayData.time ? formatTimeDot(this.trickplayData.time) : ''
      }
    },
    formattedTrickplaySpeed () { return this.trickplayData.skip ? constants.TRICKPLAY_SPEEDS[this.trickplayData.speed] / 1000 : '' }
  },
  methods: {
    getCompleted (time = this.liveTime) {
      return Math.min(1, Math.max(0, (time - this.event.startTime) / (this.event.endTime - this.event.startTime)))
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$bubble-width: 72rem;
$bubble-width-vod: 94rem;
$bubble-height: 30rem;
$arrow-size: 8rem;

%time-bubble {
  background: $white;
  border-radius: 6rem;
  font-family: $font-alternative;
  font-size: 24rem;
  height: $bubble-height;
  left: -$bubble-width/2;
  line-height: $bubble-height;
  position: absolute;
  text-align: center;
  top: 10rem;
  user-select: none;
  width: 72rem;
  &:before {
    border-left: $arrow-size solid transparent;
    border-right: $arrow-size solid transparent;
    content: '';
    left: $bubble-width/2 - $arrow-size;
    position: absolute;
  }
  &:after {
    background: $white;
    content: '';
    height: 10rem;
    left: calc(50% - 1rem);
    position: absolute;
    width: 2rem;
  }
}

%time-bubble-vod {
  background: $white;
  border-radius: 6rem;
  font-family: $font-alternative;
  font-size: 24rem;
  height: $bubble-height;
  left: -$bubble-width-vod/2;
  line-height: $bubble-height;
  position: absolute;
  text-align: center;
  top: 10rem;
  user-select: none;
  width: 72rem;
  &:before {
    border-left: $arrow-size solid transparent;
    border-right: $arrow-size solid transparent;
    content: '';
    left: $bubble-width-vod/2 - $arrow-size;
    position: absolute;
  }
  &:after {
    background: $white;
    content: '';
    height: 10rem;
    left: calc(50% - 1rem);
    position: absolute;
    width: 2rem;
  }
}

%indicator-big {
  border-radius: 2rem;
  background-image: linear-gradient( 90deg, rgb(165,165,165) 0%, rgb(243,243,243) 100%);
  box-shadow: 0rem 1rem 6rem 0rem rgba(0, 0, 0, 0.4);
  left: calc(50% - 3rem);
  position: absolute;
  width: 6rem;
  height: 36rem;
  z-index: -1;
}

%indicator-round {
  background-image: linear-gradient( 90deg, rgb(165,165,165) 18%, rgb(243,243,243) 100%);
  border-radius: 50%;
  height: 36rem;
  left: calc(50% - 18rem);
  position: absolute;
  width: 36rem;
}

.progress-bar {
  bottom: 0;
  height: 174rem;
  position: relative;
}

.vod {
  .bar {
    .completed {
      background: linear-gradient(to top, $yellow, lighten($yellow, 20));
    }
  }
}

  .title-time { display: flex; }

    .title {
      @include text-ellipsis;
      color: $white;
      flex: 1;
      font-size: 72rem;
      font-weight: 300;
      line-height: 86rem;
      padding-top: 22rem;
    }

    .time {
      color: $white;
      font-family: $font-alternative;
      font-size: 38rem;
      font-weight: 300;
      width: 234rem;
      line-height: 38rem;
      padding-top: 57rem;
      text-align: right;

      &.vod-time {
        width: 350rem;
      }
    }

  .progress {
    bottom: 55rem;
    height: 5rem;
    position: absolute;
    width: 100%;
    &.is-expanded {
      .bar { transform: scale3d(1, 3, 1); }
      .bubble {
        &:after { height: 15rem; }
        &:not(.hide-indicator) {
          &:after {
            @extend %indicator-big;
            bottom: 34rem;
            height: 22rem;
          }
          &.vod-bubble {
            &:after {
              left: calc(50% - 3rem);
            }
          }
        }
      }
      .trickplay-time {
        top: -42rem;
        &.vod-trickplay-time {
          width: 94rem;
          &:before {
            left: 39rem;
          }
        }
      }
      .trickplay-time:after {
        top: 39rem;
      }
      body:not(.disable-hover) .progress-bar:hover & {
        .bubble {
          font-size: 0;
          height: 0;
          width: 0;
          &:after {
            @extend %indicator-round;
            left: 18rem;
            bottom: -10rem;
          }
          &:before { display: none; }
          &.hide-indicator { display: none; }
        }
        .trickplay-time {
          top: -42rem;
          &:after {
            @extend %indicator-round;
          }
        }
      }
    }
  }

    .bar {
      $grey: #b1b1b1;
      background: linear-gradient(to top, $grey, lighten($grey, 20));
      .completed {
        background: $blue-gradient-vertical;
        height: 5rem;
        transform-origin: left center;
        width: 100%;
      }
    }

    .bubble {
      @extend %time-bubble;
      &:before {
        border-bottom: $arrow-size solid $white;
        top: -$arrow-size;
      }
      &:after {
        bottom: $bubble-height;
      }
      &.drag-drop { display: none; }
      &.vod-bubble {
        width: 94rem;
        &:after {
          left: calc(50% - 2rem);
        }
      }
    }

    .bubble-vod {
      @extend %time-bubble-vod;
      &:before {
        border-bottom: $arrow-size solid $white;
        top: -$arrow-size;
      }
      &:after {
        bottom: $bubble-height;
      }
      &.drag-drop { display: none; }
      &.vod-bubble {
        width: 94rem;
        &:after {
          left: calc(50% - 2rem);
        }
      }
    }

    .trickplay {
      $icon-shadow: 1.5rem 1.5rem 4rem rgba($black, .45);
      $image-width: 342rem;
      bottom: 18rem;
      left: -$image-width/2;
      position: absolute;
      &.vod-trickplay {
        left: -$image-width/1.879120879;
      }
      &.drag-drop {
        transition: none;
        .trickplay-time {
          top: -46rem;
          .inner-circle {
            border-radius: 50%;
            background-image: linear-gradient( 90deg, rgb(0,98,150) 0%, rgb(0,172,223) 100%);
            position: absolute;
            left: 26rem;
            top: 47rem;
            width: 20rem;
            height: 20rem;
            z-index: 1;
          }
          &:after {
            @extend %indicator-round;
          }
        }
      }

      .preview-image {
        height: 192rem;
        width: $image-width;
      }

      .overlay {
        background: linear-gradient(to top, rgba($black, .75), rgba($black, .50), rgba($black, .25), rgba($black, .05), transparent);
        bottom: 0;
        content: '';
        height: 100%;
        left: 0;
        position: absolute;
        width: 100%;
      }

      .icon {
        position: absolute;

        &.icon-regular {
          bottom: 15rem;
          height: 20rem;
          width: 29rem;
          &.icon-rewind { left: 13rem; }
          &.icon-fast-forward { right: 13rem; }
        }
        &.icon-skip {
          bottom: 6rem;
          height: 42rem;
          width: 38rem;
          &.icon-rewind { left: 10rem; }
          &.icon-fast-forward { right: 10rem; }
        }

        .icon-image {
          fill: $white;
          filter: drop-shadow($icon-shadow);
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .icon-text {
          align-items: center;
          color: $white;
          display: flex;
          font-family: $font-alternative;
          font-size: 24rem;
          height: 100%;
          justify-content: center;
          text-align: center;
          text-shadow: $icon-shadow;
          padding-top: 3rem;
        }
      }

      .trickplay-time {
        @extend %time-bubble;
        background-color: #3c3c3c;
        color: $white;
        left: ($image-width - $bubble-width) / 2;
        top: -36rem;
        &:before {
          border-top: $arrow-size solid #3c3c3c;
          bottom: -$arrow-size;
        }
        &:after {
          top: $bubble-height;
          @extend %indicator-big;
        }
      }

      .trickplay-time-vod {
        @extend %time-bubble;
        background-color: #3c3c3c;
        color: $white;
        left: ($image-width - $bubble-width) / 2;
        top: -36rem;
        &:before {
          border-top: $arrow-size solid #3c3c3c;
          bottom: -$arrow-size;
        }
        &:after {
          top: $bubble-height;
          @extend %indicator-big;
        }
      }
    }
</style>
