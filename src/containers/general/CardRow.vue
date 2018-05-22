<template>
  <div
    :style="translateY"
    :class="calcClasses()">
    <div
      v-if="backgroundVisible"
      class="row-background"
      :style="backgroundStyle">
      <transition name="show">
        <div v-show="selected === 0">
          <div class="title-small">{{ subTitle }}</div>
          <div class="title-large">{{ longTitle }}</div>
        </div>
      </transition>
    </div>
    <transition name="title-transition">
      {{ title }}
      <div v-if="shortTitle && expanded && !backgroundVisible" :class="titleClass">
        {{ shortTitle }}
        <div class="count" v-if="displayCount">{{ totalElements() }}</div>
      </div>
    </transition>
    <mouse-arrows
      :selected-card="selected"
      :active-row="activeRow"
      :items-number="items.length"
      :focused-rows="focused"
      :handle-click="handleClick"
      :arrow-class="arrowClass"
    />
    <div :class="[
        'card-row',
        { 'no-transition-animation': !this.uiMode.settingsTransitionAnimation }
      ]"
      :style="translateX"
      v-if="!scrollable"
    >
      <template v-if="cardType === 'banner'">
        <card-banner
          v-for="(item, index) in items"
          :event="item"
          :see-all-text="item.id === 'SEE_ALL' ? shortTitle : null"
          :key="'banner-' + item.externalId"
          :selected="focused ? index === selected : false"
          :faster-animation="fasterAnimation"
          :show-details="expanded"
          :click-fn="item.doClick"
        />
      </template>
      <template v-else-if="cardType === 'catalogue'">
        <card-catalogue
          v-for="(item, index) in items"
          :event="item"
          :key="'catalogue-' + item.id"
          :upperImageUrl="item.imageUrl"
          :selected="focused ? index === selected : false"
          :faster-animation="fasterAnimation"
          :click-fn="item.doClick"
        />
      </template>
      <template v-else-if="cardType === 'catchup'">
        <card-vod-continue
          v-for="(item, index) in items"
          :event="item"
          :see-all-text="item.id === 'SEE_ALL' ? shortTitle : null"
          :key="'continue-' + item.id"
          :selected="focused ? index === selected : false"
          :faster-animation="fasterAnimation"
          :show-details="expanded"
          :click-fn="item.doClick"
        />
      </template>
      <template v-else-if="cardType === 'nowtv'">
        <card-now-tv
          v-for="(item, index) in items"
          :event="item"
          :see-all-text="item.id === 'SEE_ALL' ? shortTitle : null"
          :key="'now-tv-' + item.id"
          :selected="focused ? index === selected : false"
          :faster-animation="fasterAnimation"
          :show-details="expanded"
          :click-fn="item.doClick"
        />
      </template>
      <template v-else-if="cardType === 'radio'">
        <card-radio
          v-for="(item, index) in items"
          :event="item"
          :see-all-text="item.id === 'SEE_ALL' ? shortTitle : null"
          :key="'radio-' + item.id"
          :firstRowText="item.firstRowText"
          :secondRowText="item.secondRowText"
          :upperImageUrl="item.imageUrl"
          :selected="focused ? index === selected : false"
          :faster-animation="fasterAnimation"
          :show-details="expanded"
          :click-fn="item.doClick"
        />
      </template>
      <template v-else-if="cardType === 'vod'">
        <card-vod
          v-for="(item, index) in items"
          :event="item"
          :see-all-text="item.id === 'SEE_ALL' ? shortTitle : null"
          :key="'vod-' + item.id"
          :selected="focused ? index === selected : false"
          :faster-animation="fasterAnimation"
          :show-details="expanded"
          :click-fn="item.doClick"
          :series="series"
          :episodesInSeason="item.episodesNumber"
        />
      </template>
    </div>

  </div>
</template>

<script>
import CardNowTv from 'components/Cards/CardNowTv'
import CardRadio from 'components/Cards/CardRadio'
import CardBanner from 'components/Cards/CardBanner'
import CardVod from 'components/Cards/CardVod'
import CardCatalogue from 'components/Cards/CardCatalogue'
import CardVodContinue from 'components/Cards/CardVodContinue'
import MouseArrows from 'components/MouseArrows.vue'
import { mapState } from 'vuex'

const ROW_WIDTH = 1548
const CARD_SPACING = 12
const addWidths = (sum, item) => sum + item.width + CARD_SPACING

const ITEMS_LEFT_SELECTED = 5
const ITEMS_RIGHT_SELECTED = 5

export default {
  name: 'CardRow',
  components: { CardNowTv, CardRadio, CardBanner, CardVod, CardCatalogue, CardVodContinue, MouseArrows },
  props: {
    background: String,
    cardTheme: String,
    cardType: String,
    cardWidth: Number,
    count: Number,
    displayCount: Boolean,
    expanded: Boolean,
    focused: Boolean,
    fasterAnimation: Boolean,
    height: Object,
    items: Array,
    longTitle: String,
    customRowWidth: Number,
    selected: Number,
    title: String,
    shortTitle: String,
    subTitle: String,
    translateY: Object,
    activeRow: {
      type: Boolean,
      required: true
    },
    handleClick: {
      type: Function
    },
    scrollable: Boolean,
    blockSlide: Boolean, // Dragan: Block focused row slidig to the right if background present.
    arrowClass: String,
    series: Boolean
  },
  data: () => ({
    uiMode: window.uiMode,
    translateMode: window.translateMode
  }),
  computed: {
    rowWidth () {
      return this.customRowWidth || ROW_WIDTH
    },
    titleClass () {
      return ['title', this.cardTheme]
    },
    backgroundStyle () {
      return {
        background: this.background,
        height: `${this.height.open - (160 + 22)}rem`
      }
    },
    episodesInSeason () {
      return this.items.length
    },
    translateX () {
      let finalPosition = 0
      if (this.items) {
        if (this.cardType === 'banner') {
          const currentCard = this.items[this.selected]
          const desiredRowPosition = (this.rowWidth / 2) - (currentCard.width / 2)
          const allWidths = this.items.reduce(addWidths, 0) - CARD_SPACING
          const widthsUpToSelected = this.items.slice(0, this.selected).reduce(addWidths, 0)
          finalPosition = Math.min(Math.max(0, widthsUpToSelected - desiredRowPosition), allWidths - this.rowWidth > 0 ? allWidths - this.rowWidth : 0)
        } else if (this.backgroundVisible && this.selected === 0) {
          finalPosition = -620
        } else {
          const desiredRowPosition = (this.rowWidth - this.cardWidth) / 2
          const allWidths = this.items.length * (this.cardWidth + CARD_SPACING) - CARD_SPACING
          const widthsUpToSelected = this.items.slice(0, this.selected).length * (this.cardWidth + CARD_SPACING)
          finalPosition = Math.max(0, Math.min(widthsUpToSelected - desiredRowPosition, allWidths - this.rowWidth))
        }
      }
      let transform3d = `translate3d(${-finalPosition}rem, 0, 0)`
      let transform2d = `translate(${-finalPosition}rem, 0)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d,
        'transition-duration': this.uiMode.cardRowTransitionAnimation ? false : '0s'
      }
    },
    translateXTrimmed () {
      if (this.uiMode.cardRowTransitionAnimation) {
        let finalPosition = 0
        if (this.items) {
          if (this.cardType === 'banner') {
            const currentCard = this.items[this.selected]
            const desiredRowPosition = (this.rowWidth / 2) - (currentCard.width / 2)
            const allWidths = this.items.reduce(addWidths, 0) - CARD_SPACING
            const widthsUpToSelected = this.items.slice(0, this.selected).reduce(addWidths, 0)
            finalPosition = Math.min(Math.max(0, widthsUpToSelected - desiredRowPosition), allWidths - this.rowWidth)
          } else if (this.backgroundVisible && this.selected === 0) {
            finalPosition = -620
          } else {
            const desiredRowPosition = (this.rowWidth - this.cardWidth) / 2
            const allWidths = this.items.length * (this.cardWidth + CARD_SPACING) - CARD_SPACING
            const widthsUpToSelected = this.items.slice(0, this.trimmedIndex).length * (this.cardWidth + CARD_SPACING)
            finalPosition = Math.max(0, Math.min(widthsUpToSelected - desiredRowPosition, allWidths - this.rowWidth))
          }
        }
        let transform3dTrimmed = `translate3d(${-finalPosition}rem, 0, 0)`
        let transform2dTrimmed = `translate(${-finalPosition}rem, 0)`
        return {
          transform: !this.translateMode.translate ? transform3dTrimmed : transform2dTrimmed
        }
      }
    },
    backgroundVisible () {
      return this.background && this.focused && this.expanded && !this.blockSlide
    },
    trimmedItems () {
      const startPosition = Math.max(0, this.selected - ITEMS_LEFT_SELECTED)
      const endPosition = this.selected + ITEMS_RIGHT_SELECTED + 1
      let slice = this.items.slice(startPosition, endPosition)
      return slice
    },
    trimmedIndex () {
      return Math.min(this.selected, ITEMS_LEFT_SELECTED)
    },
    ...mapState({
      vodTotalElements: state => state.vod.totalElements
    })
  },
  methods: {
    calcClasses () {
      return [
        'card-row-container',
        { 'no-transition-animation': !this.uiMode.cardRowTransitionAnimation }
      ]
    },
    totalElements () {
      return this.cardTheme === 'vod-light ' ? this.vodTotalElements : this.count
    }
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

.row-background {
  $left-offset: 106rem;
  align-items: left;
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 300rem;
  left: -$left-offset;
  padding-left: $left-offset;
  position: absolute;
  top: -93rem;
  width: 1920rem;
  .title-small {
    color: rgba($white, 0.5);
    font-family: $font-alternative;
    font-size: 28rem;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .title-large {
    width: 620rem;
    color: white;
    font-size: 52rem;
    font-family: $font-alternative;
  }
}

.card-row-container {
  position: absolute;
  transform-origin: left top;
  transition: transform $transition;
  will-change: transform;
}

.card-row {
  display: flex;
  transition: transform $transition;
  will-change: transform;
  .card-container {
    margin-left: 12rem;
  }
}

.title {
  color: $black;
  display: flex;
  font-family: $font-alternative;
  font-size: 40rem;
  font-weight: 400;
  min-width: 600rem;
  position: absolute;
  text-transform: uppercase;
  top: -74rem;
  &.dark { color: $white; }
  .count {
    $size: 44rem;
    background: $blue-medium;
    border-radius: 4rem;
    font-size: 24rem;
    height: $size;
    line-height: $size + 4rem;
    margin-left: 20rem;
    text-align: center;
    width: $size;
    color: $white;
  }
}
.container-light {
  .title.dark { color: $black; }
}
</style>
