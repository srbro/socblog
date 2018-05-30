<template>
  <transition-group
  :css="false"
  tag="ul"
  name="move-class"
  :class="listClasses"
  >
    <template v-if="column === 'categories'">
      <category-guide
        v-for="(item, index) in trimmedItems"
        :click="clickFn"
        :clickId="index - trimmedIndex + selectedItemIndex"
        :key="item.id"
        :item="item"
        :is-selected="index === trimmedIndex && !fasterAnimation"
      />
    </template>

    <template v-if="column === 'channels'">
      <channel-guide
        v-for="(item, index) in trimmedItems"
        :click="clickFn"
        :clickId="index - trimmedIndex + selectedItemIndex"
        :key="item.id"
        :item="item"
        :is-selected="index === trimmedIndex && !fasterAnimation"
        :id="automatedTestsIds(index)"
      />
    </template>

    <template v-if="column === 'dates'">
      <date-guide
        v-for="(item, index) in trimmedItems"
        :click="clickFn"
        :clickId="index - trimmedIndex + selectedItemIndex"
        :key="item.id"
        :item="item"
        :is-selected="index === trimmedIndex && !fasterAnimation"
      />
   </template>

   <template v-if="column === 'events'">
     <event-guide
      v-for="(item, index) in trimmedItems"
     :click="clickFn"
        :clickId="index - trimmedIndex + selectedItemIndex"
      :key="item.id"
      :item="item"
      :is-selected="index === trimmedIndex && !fasterAnimation"
      :trimmedStyle="trimmedItemsEventNameStyle[index]"
     />
   </template>
  </transition-group>
</template>

<script>
import { measureWidth } from 'helpers/text'
import { deviceEPGClass } from 'animations'
import CategoryGuide from 'components/Guide/Category'
import ChannelGuide from 'components/Guide/Channel'
import DateGuide from 'components/Guide/Date'
import EventGuide from 'components/Guide/Event'

const EVENT_NAME_MAX_WIDTH = 507
const EVENT_NAME_LIVE_WIDTH = 407
// actually, 4 items are visible above and 6 below the current selection,
// but we need two additional ones for animation purposes.
const ITEMS_ABOVE_SELECTED = 7
const ITEMS_BELOW_SELECTED = 9

export default {
  name: 'ScrollableList',
  components: { CategoryGuide, ChannelGuide, DateGuide, EventGuide },
  props: {
    items: {
      type: Array,
      required: true
    },
    selectedItemIndex: {
      type: Number,
      required: true
    },
    focused: {
      type: Boolean,
      required: true
    },
    fasterAnimation: Boolean,
    clickFn: {
      required: false
    },
    column: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    listClasses () {
      return [
        'grouped-items',
        {
          'no-transition-animation': this.uiMode.guideColnumItemsTransitionAnimation,
          'no-shadow': this.uiMode.guideColnumItemsTransitionAnimation,
          'is-focused': this.focused
        }
      ]
    },
    trimmedItemsEventNameStyle () {
      return this.trimmedItems.map((item, index) => {
        if (this.focused && index === this.trimmedIndex && item.type === 'event') {
          const width = measureWidth(item.label, 40, 'condensed')

          let maxWidth = item.live ? EVENT_NAME_LIVE_WIDTH : EVENT_NAME_MAX_WIDTH
          let calcParam = item.live ? 400 : 500

          if (width > maxWidth) {
            const offset = width - calcParam
            let transform3d = `translate3d(${-1 * offset}rem, 0, 0)`
            let transform2d = `translate(${-1 * offset}rem, 0)`
            let marquee = `marquee ${offset / 100}s 1s linear backwards, marquee ${offset / 100}s ${offset / 100 + 1}s linear forwards reverse`
            let marqueeSecond = `marqueeSecond ${offset / 100}s 1s linear backwards, marqueeSecond ${offset / 100}s ${offset / 100 + 1}s linear forwards reverse`
            return {
              'transform': !this.translateMode.translate ? transform3d : transform2d,
              'animation': !this.translateMode.translate ? marquee : marqueeSecond
            }
          }
        }
        return { animation: 'none' }
      })
    },
    trimmedItems () {
      let fakeItemsBefore = []
      let fakeItemsAfter = []
      const topCase = this.selectedItemIndex - ITEMS_ABOVE_SELECTED
      const itemsLength = this.items.length
      const startPosition = Math.max(0, topCase)
      const endPosition = this.selectedItemIndex + ITEMS_BELOW_SELECTED + 1
      let slice = this.items.slice(startPosition, endPosition)

      if (topCase <= 0) { // top case
        for (let i = 0; i < Math.abs(topCase); i++) {
          fakeItemsBefore.push({ id: 'fake-top-' + i, hide: true, type: 'channel' })
        }
        slice = fakeItemsBefore.concat(slice)
      }
      if (ITEMS_BELOW_SELECTED > itemsLength - this.selectedItemIndex) { // bottom case
        const n = ITEMS_BELOW_SELECTED - (itemsLength - this.selectedItemIndex)
        for (let i = 0; i < n; i++) {
          fakeItemsAfter.push({ id: 'fake-bottom-' + i, hide: true, type: 'channel' })
        }
        slice = slice.concat(fakeItemsAfter)
      }
      return slice
    },
    trimmedIndex () {
      const topCase = this.selectedItemIndex - ITEMS_ABOVE_SELECTED
      const finalIndex = this.selectedItemIndex < 7 ? this.selectedItemIndex - topCase : this.selectedItemIndex
      return Math.min(finalIndex, ITEMS_ABOVE_SELECTED)
    }
  },
  methods: {
    deviceClass () {
      return deviceEPGClass()
    },
    automatedTestsIds (index) {
      return index === this.trimmedIndex && !this.fasterAnimation ? 'firstChannel' : ''
    }
  }
}
</script>

<style lang="scss">
@import "variables";

@keyframes marquee {
  0% {
    @include transform(translate3d(0, 0, 0))
  }
}

@keyframes marqueeSecond {
  0% {
    @include transform(translate(0, 0))
  }
}

.grouped-items {
  position: relative;
  font-family: $font-alternative;
}
</style>
