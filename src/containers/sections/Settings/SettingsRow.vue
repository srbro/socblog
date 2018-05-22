<template>
  <div :class="rowClass">
    <transition name="title-transition">
      <h1 v-if="focused" :class="titleClass">{{ title }}</h1>
    </transition>
    <ul :class="cardRowClass" :style="[transformX]">
      <card-settings v-for="(item, index) in items"
        :key="item.id"
        :icon="`settings-${item.id}`"
        :text="item.label"
        :selected="selectedIndex === index"
        :card-index="index"
        :row-index="rowIndex"
        :handle-click="handleClick"
        :enable-hover="focused"
      />
    </ul>
  </div>
</template>

<script>
import CardSettings from 'components/CardSettings'

const CARD_WIDTH = 248
const CARD_SPACING = 12
const ROW_WIDTH = 1510

export default {
  name: 'SettingsRow',
  components: { CardSettings },
  data: () => ({
    uiMode: window.uiMode,
    translateMode: window.translateMode
  }),
  computed: {
    titleClass () {
      return [
        'title',
        {
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation
        }
      ]
    },
    cardRowClass () {
      return [
        'card-row',
        {
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation
        }
      ]
    },
    rowClass () {
      return [
        'row',
        {
          'is-selected': this.selected,
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation
        }
      ]
    },
    transformX () {
      const rowWidth = this.items.length > 5 ? ROW_WIDTH : this.itemsWidth()
      const desiredRowPosition = (rowWidth / 2) - (CARD_WIDTH / 2)
      const allWidths = (this.items.length * (CARD_WIDTH + CARD_SPACING)) - CARD_SPACING
      const widthsUpToSelected = this.selectedIndex * (CARD_WIDTH + CARD_SPACING)
      let finalPosition = Math.min(Math.max(0, widthsUpToSelected - desiredRowPosition), allWidths - rowWidth)
      let transform3d = `translate3d(${-finalPosition}rem, 0, 0)`
      let transform2d = `translate(${-finalPosition}rem, 0)`

      return {
        transform: !this.translateMode.translate ? transform3d : transform2d
      }
    }
  },
  methods: {
    itemsWidth () {
      return this.items.length * CARD_WIDTH + (this.items.length - 1) * CARD_SPACING
    }
  },
  props: {
    items: Array,
    selectedIndex: Number,
    title: String,
    selected: Boolean,
    focused: Boolean,
    rowIndex: Number,
    handleClick: Function
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.row {
  margin-bottom: 26rem;
  position: relative;
  transition: opacity $transition, transform $transition;
  .title {
    color: $black;
    font-family: $font-alternative;
    font-size: 40rem;
    font-weight: 400;
    position: absolute;
    top: -74rem;
  }
  .card-row {
    display: flex;
    flex-flow: row nowrap;
    position: relative;
    transform-origin: left top;
    transition: transform $transition;
    width: 100%;
  }
}
</style>
