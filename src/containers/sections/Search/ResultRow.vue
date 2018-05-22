<template>
<div
  :style="translate">
  <transition name="title-transition">
    <div v-if="title" class="title">
      {{ title }}
      <div class="count">{{ count }}</div>
    </div>
  </transition>
  <mouse-arrows
    :selected-card="selectedIndex"
    :active-row="activeRow"
    :items-number="events.length"
    :focused-rows="focusedRows"
    :handle-click="handleClick"
    :style-mouse="styleMouse"
  />
  <transition-group tag="ul" :style="rowTransformsX" class="events" :css="false">
    <template v-if="cardType ==='nowtv'">
      <card-now-tv
        :class="['card-result', deviceClass(), { 'hide': event.hide }]"
        v-for="(event, index) in trimmedItems"
        :key="event.id"
        :event="event"
        :selected="active && index === trimmedIndex"
        :faster-animation="fasterAnimation"
        :show-details="expanded"
        :click-fn="onResultClick(index - trimmedIndex + selectedIndex)"
      />
    </template>
    <template  v-if="cardType ==='vod'">
      <card-vod
        :class="['card-result', deviceClass(), { 'hide': event.hide }]"
        v-for="(event, index) in trimmedItems"
        :key="event.id"
        :event="event"
        :selected="active && index === trimmedIndex"
        :faster-animation="fasterAnimation"
        :show-details="expanded"
        :click-fn="onResultClick(index - trimmedIndex + selectedIndex)"
      />
    </template>
    <!-- <card
      :class="['card-result', deviceClass(), { 'hide': event.hide }]"
      v-for="event, index in trimmedItems"
      :key="event.id"
      :expanded="expanded"
      :selected="active && index === trimmedIndex"
      :faster-animation="fasterAnimation"
      :upper-image-url="event.imageUrl"
      :lower-image-url="event.logoUrl"
      :type="cardType"
      :progress="event.progress"
      :first-row-text="event.title"
      :second-row-text="event.subtitle"
      :show-details="expanded"
      :style="event.width ? `width: ${event.width}rem;` : ''"
      :click-fn="onResultClick(index - trimmedIndex + selectedIndex)"
    /> -->
  </transition-group>
</div>
</template>

<script>
// import findIndex from 'lodash/fp/findIndex'
import CardNowTv from 'components/Cards/CardNowTv'
import CardVod from 'components/Cards/CardVod'

import { deviceZapClass } from 'animations'
import MouseArrows from 'components/MouseArrows'

// const ITEM_WIDTH = 312
// const ITEMS_BEFORE_SELECTED = 4
// const ITEMS_AFTER_SELECTED = 4
// const INITIAL_ITEMS_OFFSET = 67

export default {
  name: 'ResultRow',
  components: { CardNowTv, CardVod, MouseArrows },
  data: () => ({
    ITEMS_BEFORE_SELECTED: 6,
    ITEMS_AFTER_SELECTED: 6,
    displayItems: [],
    displayStyle: []
  }),
  computed: {
    styleMouse () {
      return `left: ${1630}rem;`
    },
    trimmedIndex () {
      if (this.events.length <= 6) return this.selectedIndex + 4
      if (this.selectedIndex >= this.ITEMS_BEFORE_SELECTED - 2 && this.selectedIndex <= this.ITEMS_BEFORE_SELECTED) {
        return 6
      } else if (this.selectedIndex < this.ITEMS_BEFORE_SELECTED - 3) {
        // If we are near the beginning, directly return selectedIndex
        return this.selectedIndex + 4
      } else if (this.selectedIndex > this.events.length - this.ITEMS_AFTER_SELECTED) {
        // If we are near the end, return middle position + distance to the end
        return this.ITEMS_BEFORE_SELECTED + (4 - (this.events.length - this.selectedIndex))
      } else {
        // Normally, just return middle position
        return this.ITEMS_BEFORE_SELECTED
      }
    },
    trimmedItems () {
      let startPosition
      let endPosition
      if (this.selectedIndex < this.ITEMS_BEFORE_SELECTED - 1) {
        // If we are near the beginning, take the first 7 items
        startPosition = 0
        endPosition = this.ITEMS_BEFORE_SELECTED + 4
      } else if (this.selectedIndex > this.events.length - this.ITEMS_AFTER_SELECTED) {
        // If we are near the end, take the last 7 items
        startPosition = this.events.length - (this.ITEMS_BEFORE_SELECTED + 4)
        endPosition = this.events.length
      } else if (this.selectedIndex > this.events.length - this.ITEMS_AFTER_SELECTED + 1) {
        // If we are near the end, take the last 7 items
        startPosition = this.events.length - (this.ITEMS_BEFORE_SELECTED + 2)
        endPosition = this.events.length
      } else {
        // Normally, take selected item + 5 before + 3 after
        startPosition = this.selectedIndex - (this.ITEMS_BEFORE_SELECTED)
        endPosition = this.selectedIndex + (this.ITEMS_AFTER_SELECTED + 1)
      }
      let slice = this.events.slice(startPosition, endPosition)
      if (this.selectedIndex === 5) slice = [{id: 'm', hide: true}].concat(this.events.slice(0, endPosition))
      if (this.selectedIndex === 4) slice = [{id: 'm', hide: true}, {id: 'i', hide: true}].concat(this.events.slice(0, endPosition))
      if (this.selectedIndex === 3) slice = [{id: 'm', hide: true}, {id: 'i', hide: true}, {id: 'l', hide: true}].concat(this.events.slice(0, endPosition))
      if (this.selectedIndex <= 2 || this.events.length <= 6) slice = [{id: 'm', hide: true}, {id: 'i', hide: true}, {id: 'l', hide: true}, {id: 'o', hide: true}].concat(this.events.slice(0, endPosition))

      if (this.selectedIndex === this.events.length - 1) slice = slice.concat([{id: 'v', hide: true}, {id: 'l', hide: true}, {id: 'a', hide: true}, {id: 'd', hide: true}])
      if (this.selectedIndex === this.events.length - 2) slice = slice.concat([{id: 'v', hide: true}, {id: 'l', hide: true}, {id: 'a', hide: true}])
      if (this.selectedIndex === this.events.length - 3) slice = slice.concat([{id: 'v', hide: true}, {id: 'l', hide: true}, {id: 'a', hide: true}])
      if (this.selectedIndex === this.events.length - 4) slice = slice.concat([{id: 'v', hide: true}, {id: 'l', hide: true}, {id: 'a', hide: true}])
      // for (let i = 0; i < 4)
      // if (this.selectedIndex > 5 && this.selectedIndex < 7) return [{id: 'l'}, {id: 'o'}].concat(this.events.slice(startPosition, endPosition))
      return slice
    }
  },
  props: {
    active: {
      type: Boolean,
      required: true
    },
    count: Number,
    cardType: String,
    events: {
      type: Array,
      required: true
    },
    expanded: Boolean,
    selectedIndex: {
      type: Number,
      required: true
    },
    rowTransformsX: Object,
    title: String,
    fasterAnimation: Boolean,
    translate: Object,
    handleClick: Function,
    focusedRows: Boolean,
    activeRow: Boolean,
    onResultClick: Function
  },
  methods: {
    deviceClass () {
      return deviceZapClass()
    }
  },
  watch: {
    fasterAnimation (data) {
      // this.ITEMS_BEFORE_SELECTED = data ? 6 : 4
      // this.ITEMS_AFTER_SELECTED = data ? 6 : 4
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$elements: 15;
@for $i from 0 to $elements {
  .cell:nth-child(#{$i}) {
    left: ($i - 5)*312 + 45rem; //67rem
    transition: transform .150s;
  }
}

@for $i from 0 to $elements {
  .samsung-cell:nth-child(#{$i}) {
    left: ($i - 5)*312 + 45rem; //67rem
    transition: transform .200s;
  }
}
.events {
  position: relative;
}
.arrows-container {
  margin-top: 135rem;
}

.card-result {
  position: absolute;
  top: 0;
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

.live-line {
  position: absolute;
  bottom: 294rem;
  &.left {
    left: 0;
    transform: rotate(180deg);
  }
  &.right { right: 0; }
}
.hide {
  visibility: hidden;
}
</style>
