<template>
  <div :class="['card', { 'is-selected': this.selected && !fasterAnimation}]" :style="image">
    <div :class="['description', 'active', { 'faster-animation': selected && fasterAnimation }, {'cta-active': displayCta}]">
      <span class="first-row">{{ firstRowText }}</span>
      <span class="second-row">{{ secondRowText }}</span>
      <svg class="icon" v-if="check">
        <use :xlink:href="`#category-11`"></use>
      </svg>
    </div>
    <div v-if="displayCta" :class="['cta', 'active', {'display-cta': displayCta}]">
      <div class="items">
        <div class="item"
          v-for="(button, index) in ctaButtons"
          :key="index"
          @click.stop="handleClickCardCta(index)">
          <custom-button :cta="true" :active="ctaSelectedPosition === index" :icon="button.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomButton from 'components/Button'
// import fakeImage168 from 'assets/images/pre-loading/home-events-1x168.png'
import fakeImage168 from 'assets/images/placeholders/lending_page_logo_300x168.png'

export default {
  name: 'FavoriteCard',
  components: { CustomButton },
  data () {
    return {
      image: ''
    }
  },
  computed: {
    containerClass () {
      return [{ 'is-selected': this.selected && !this.fasterAnimation }]
    },
    check () {
      return this.isFavorite
    }
  },
  methods: {
    images () {
      if (this.upperImageUrl) {
        let img, that
        img = new window.Image()
        that = this
        img.onload = function () {
          setTimeout(function () {
            that.image = {
              'background-image': `url(${that.upperImageUrl})`
            }
          }, 1800)
        }
        img.src = this.upperImageUrl
      } else {
        this.image = {
          'background-image': `url(${fakeImage168})`,
          'background-repeat': 'repeat-x'
        }
      }
    },
    handleClickCardCta (index) {
      this.$emit('ctaClick', index)
    }
  },
  created () {
    this.images()
  },
  props: {
    selected: {
      type: Boolean,
      required: true
    },
    firstRowText: String,
    fasterAnimation: Boolean,
    secondRowText: String,
    upperImageUrl: String,
    isFavorite: Boolean,
    displayCta: Boolean,
    ctaButtons: Array,
    ctaSelectedPosition: {
      type: Number,
      default: 0
    }
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
  background-color: rgba($white, 1);
  // background-color: #475256;
  // background-color: rgba($white, 1);
  position: absolute;
  // background-position: top center;
  // background-repeat: no-repeat;
  background-size: 300rem;
  // will-change: transform;

  &:not(.is-selected) {
    box-shadow: 0 11rem 16rem 0 rgba($black, .18);
  }
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
      .icon { fill: $white; }
    }
  }
  &.active {
    display: block;
    width: 100%;
  }

  body:not(.disable-hover) &:hover {
    .description {
      background-color: $blue-hover;
      z-index: 2;
      .first-row { color: $white; }
      .second-row { color: rgba($white, .5); }
      // .second-row { fill: $white; }
      .icon { fill: $white; }
    }
  }

  .description {
    font-family: $font-alternative;
    font-weight: 400;
    height: 98rem;
    line-height: 1.1;
    padding: 17rem 35rem 12rem;
    width: 100%;
    box-shadow: 0 0 16rem 0 rgba(0, 0, 0, 0.15);
    position: absolute;
    bottom: 0;
    background-color: $white;

    &.cta-active {
      display: none;
    }

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
.icon {
  position: absolute;
  right: 15rem;
  bottom: 16rem;
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
