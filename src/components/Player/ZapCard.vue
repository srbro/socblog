<template>
  <li :class="['card', { 'is-selected': this.selected && !fasterAnimation}]" :style="image">
    <div v-if="elements.timeline" :class="timelineClass">
      <div :class="['completed', { 'blocked': cutvColor }]" :style="styleProgress"></div>
    </div>
    <div v-if="elements.description"
      :class="['description', 'active', { 'faster-animation': selected && fasterAnimation }]">
      <span class="first-row">{{ firstRowText }}</span>
      <span class="second-row">{{ secondRowText }}</span>
    </div>
    <div v-if="elements.cta && displayCta" :class="['cta', 'active', {'display-cta': displayCta}]">
      <div class="items">
        <div class="item"
          v-for="(button, index) in ctaButtons"
          :key="index"
          @click.stop.prevent="handleClickCardCta(index)">
          <custom-button :cta="true" :active="ctaSelectedPosition === index" :icon="button.id" />
        </div>
      </div>
    </div>
    <!-- </div> -->
    <img
      v-if="elements.liveLine && liveLine"
      class="live-line"
      :style="styleLiveLine"
      src="~assets/images/events-live-line.png"
    />
  </li>
</template>

<script>
import CustomButton from 'components/Button'
import fakeImage168 from 'assets/images/pre-loading/home-events-1x168.png'

export default {
  name: 'ZapCard',
  components: { CustomButton },
  data () {
    return {
      image: '',
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    elements () {
      switch (this.type) {
        case 'catchup':
          return {
            lowerImage: true,
            timeline: true,
            description: true,
            liveLine: true,
            cta: true,
            details: true
          }
      }
    },
    styleProgress () {
      return {
        // '-webkit-transform': `scale3d(${this.progress}, 1, 1)`
        'transform': `scaleX(${this.progress}) scaleY(1) scaleZ(1)`
      }
    },
    timelineClass () {
      return [
        'timeline progress',
        {
          'hidden': this.fasterAnimation,
          'no-shadow': !this.uiMode.cardZapProgressShadow
        }
      ]
    },
    containerClass () {
      return [{ 'is-selected': this.selected && !this.fasterAnimation }]
    },
    cutvColor () {
      return this.progress === 1 ? !this.cutvEnabled : false
    },
    styleLiveLine () {
      let liveLineOffset = this.progress * 300 - 32
      let transform3d = `translate3d(${liveLineOffset}rem, 0, 0)`
      let transform2d = `translate(${liveLineOffset}rem, 0)`
      return {
        'transform': !this.translateMode.translate ? transform3d : transform2d
      }
    }
  },
  created () {
    this.images()
  },
  methods: {
    images () {
      if (this.lowerImageUrl) {
        let img, that
        img = new window.Image()
        that = this
        img.onload = function () {
          setTimeout(function () {
            that.image = {
              'background-image': `url(${that.lowerImageUrl})`,
              animation: '0.2s ease fadein'
            }
          }, 1400)
        }
        img.src = this.lowerImageUrl
      } else {
        this.image = {
          'background-image': `url(${fakeImage168})`,
          'background-repeat': 'repeat-x'
        }
      }
    }
  },
  props: {
    seeAllText: String,
    type: {
      type: String,
      required: true,
      validator (type) {
        return ['catchup'].indexOf(type) > -1
      }
    },
    lowerImageUrl: String,
    progress: Number,
    selected: {
      type: Boolean,
      required: true
    },
    firstRowText: String,
    fasterAnimation: Boolean,
    secondRowText: String,
    liveLine: Boolean,
    displayCta: Boolean,
    ctaButtons: Array,
    ctaSelectedPosition: {
      type: Number,
      default: 0
    },
    theme: String,
    cutvEnabled: {
      type: Boolean,
      default: true
    },
    handleClickCardCta: Function
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$width: 300rem;
$spacing: 12rem;

.card {
  width: 300rem;
  height: 266rem;
  background-color: #475256;
  position: absolute;
  background-position: top center;
  background-repeat: no-repeat;
  background-size: 300rem 168rem;
  will-change: transform;
  &.is-selected {
    z-index: 3;
    box-shadow: 0 29rem 80rem 0 rgba(0, 0, 0, 0.35);
    // transform: scale3d(1.22556, 1.22556, 1);
    // transition: transform 0s;
    transform: scaleX(1.13) scaleY(1.13) scaleZ(1);
    // transition-delay: 0s;
    transform-origin: center center;

    .description {
      background-color: $blue;
      // box-shadow: 0 10rem 55rem 3rem rgba(0, 0, 0, 0.5);
      .first-row { color: $white; }
      .second-row { color: rgba($white, .5); }
    }
    .progress {
      box-shadow: 0 6rem 8rem -1rem rgba(0, 0, 0, 0.5);
    }
  }
  &.active {
    display: block;
    width: 100%;
  }
  body:not(.disable-hover) &:hover {
    .description {
      background-color: $blue-hover;
      .first-row { color: $white; }
      .second-row { color: rgba($white, .5); }
    }
  }

  .timeline {
    height: 8rem;
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 2;

    &.progress {
      // background-image: linear-gradient(to top, rgb(181 ,181 ,181) 0%, rgb(236, 236, 236) 100%);
      background-image: linear-gradient(to top, rgb(181 ,181 ,181) 0%, rgb(236, 236, 236) 100%);
      height: 8rem;
      bottom: 98rem;
    }

    .completed {
      background-image: $blue-gradient-vertical;
      background-color: #00689c;
      height: 8rem;
      transform-origin: left center;
      width: 100%;
      &.blocked {
        background-image: $grey-dark-gradient-vertical;
      }
    }
  }

  .description {
    font-family: $font-alternative;
    font-weight: 400;
    height: 98rem;
    line-height: 1.1;
    padding: 17rem 35rem 12rem;
    width: 100%;
    // box-shadow: 0 0 16rem 0 rgba(0, 0, 0, 0.15);
    position: absolute;
    bottom: 0;
    background-color: $white;

    .first-row {
      @include text-ellipsis;
      color: $black;
      display: block;
      font-size: 30rem;
    }
    .second-row {
      @include text-ellipsis;
      // color: rgba($black, .5);
      color: #7f7f7f;
      display: block;
      font-size: 24rem;
      line-height: 28rem;
      margin-top: 8rem;
    }
  }
  .cta {
    height: 98rem;
    line-height: 1.1;
    padding: 17rem 35rem 12rem;
    width: 100%;
    box-shadow: 0 0 16rem 0 rgba(0, 0, 0, 0.15);
    color: #576567; // gray
    position: absolute;
    background: #2c373a; // kind of black
    position: absolute;
    bottom: 0;
    .items {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      .item {
        display: inline-block;
      }
    }
  }

}
@keyframes fadein{
    0% { opacity: 0.5; }
    66% { opacity: 0.8; }
    100% { opacity: 1; }
}

@-webkit-keyframes fadein{
    0% { opacity: 0.5; }
    66% { opacity: 0.8; }
    100% { opacity:1; }
}

.live-line {
  height: 354rem;
  position: absolute;
  top: -30rem;
  width: 60rem;
  z-index: 2;
  pointer-events: none;
}

.icon {
  height: 23rem;
  fill: #56656a;
  width: 23rem;
}
// .hidden { visibility: hidden; }
.hidden { display: none; }
.faster-animation {
  background-color: $blue !important;
  .first-row { color: $white !important; }
  .second-row { color: #7dc9ed !important; }
}
</style>
