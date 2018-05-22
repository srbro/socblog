<template>
<div>
  <mouse-arrows
    class="zapbanner-arrows"
    :selected-card="selectedIndex"
    :active-row="active"
    :items-number="events.length"
    :focused-rows="active"
    :handle-click="handleClick"
    :style-mouse="styleMouse"
  />
  <transition-group
    tag="ul"
    :class="[
      'events'
    ]"
    :css="false"
    >
    <event-card
      :class="[deviceClass(), { 'hide': event.hide }, { 'is-dimmed': !active }, { 'no-scale': !uiMode.cardRowCardScale }]"
      v-for="(event, index) in trimmedItems"
      :key="event.id"
      :event="event"
      :selected="active && index === trimmedIndex"
      :line-visible="active && liveVisible"
      :faster-animation="fasterAnimation"
      :cutv-enabled="cutvEnabled"
      :cutv-delay="currentCutvDelayTime"
      :handle-click-card-cta="handleClickCardCta"
      @click.native.prevent="handleClickCard(event.id)"
    />
  </transition-group>
  <img v-show="active && !liveVisible && liveIndex > selectedIndex" class="live-line right" src="~assets/images/live-arrow.png">
  <img v-show="active && !liveVisible && liveIndex < selectedIndex" class="live-line left" src="~assets/images/live-arrow.png">
</div>
</template>

<script>
import { mapState } from 'vuex'
import findIndex from 'lodash/fp/findIndex'
import EventCard from 'components/Player/EventCard'
import MouseArrows from 'components/MouseArrows'

import { deviceZapClass } from 'animations'

// const ITEM_WIDTH = 312
// const ITEMS_BEFORE_SELECTED = 4
// const ITEMS_AFTER_SELECTED = 4
// const INITIAL_ITEMS_OFFSET = 67

export default {
  name: 'PlayerEventList',
  components: { EventCard, MouseArrows },
  data: () => ({
    ITEMS_BEFORE_SELECTED: 6,
    ITEMS_AFTER_SELECTED: 6,
    displayItems: [],
    displayStyle: [],
    uiMode: window.uiMode
  }),
  computed: {
    ...mapState({
      cutvEnabled: state => state.player.focusedChannelCutvEnabled,
      cutvDelay: state => state.player.focusedChannelCutvDelay
    }),
    styleMouse () {
      return `left: ${1584}rem;`
    },
    currentCutvDelayTime () {
      return Date.now() - this.cutvDelay
    },
    trimmedIndex () {
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
    liveIndex () {
      const now = Date.now()
      let index = findIndex(event => (now > event.startTime && now < event.endTime), this.events)
      return index === -1 ? ((this.events[this.selectedIndex] && this.events[this.selectedIndex].endTime < now) ? 9999 : -9999) : index
    },
    liveVisible () {
      if (this.selectedIndex < 2) {
        return this.liveIndex < 6
      } else if (this.selectedIndex > this.events.length - 4) {
        return this.liveIndex >= this.events.length - 6
      } else {
        return this.liveIndex >= this.selectedIndex - 2 && this.liveIndex <= this.selectedIndex + 3
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
      if (this.selectedIndex === 5) return [{id: 'm', hide: true}].concat(this.events.slice(0, endPosition))
      if (this.selectedIndex === 4) return [{id: 'm', hide: true}, {id: 'i', hide: true}].concat(this.events.slice(0, endPosition + 1))
      if (this.selectedIndex === 3) return [{id: 'm', hide: true}, {id: 'i', hide: true}, {id: 'l', hide: true}].concat(this.events.slice(0, endPosition))
      if (this.selectedIndex <= 2) return [{id: 'm', hide: true}, {id: 'i', hide: true}, {id: 'l', hide: true}, {id: 'o', hide: true}].concat(this.events.slice(startPosition, endPosition))
      // for (let i = 0; i < 4)
      // if (this.selectedIndex > 5 && this.selectedIndex < 7) return [{id: 'l'}, {id: 'o'}].concat(this.events.slice(startPosition, endPosition))
      else return this.events.slice(startPosition, endPosition)
    }
  },
  props: {
    events: {
      type: Array,
      required: true
    },
    selectedIndex: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    channelsActive: {
      type: Boolean,
      required: true
    },
    fasterAnimation: Boolean,
    handleClickCard: Function,
    handleClickCardCta: Function,
    handleClick: Function
  },
  methods: {
    deviceClass () {
      return deviceZapClass()
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
  height: 100%;
  position: relative;
}

.card-catchup {
  position: absolute;
  top: 0;
  &.is-dimmed::after {
    background: rgba($black, 0.5);
    content: '';
    height: 100%;
    position: absolute;
    width: 100%;
    z-index: 1;
    top: 0;
    left: 0;
  }
}
.zapbanner-arrows {
  margin-left: 132rem;
  margin-top: 40rem;
  .arrows {
    .right {
      left: 1600rem;
    }
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
