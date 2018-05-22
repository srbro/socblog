<template>
  <div :class="['number-picker', { 'symbol': !selected }]">
    <transition-group tag="div" class="element" :css="false" v-if="selected">
      <span
        :key="'active'"
        :class="[ { 'active': active } ]">
      </span>
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="itemClass"
        :style="trimmedItemsStyle[index]"
      >
        {{ item }}
      </div>
    </transition-group>
    <div v-else>
      <span v-if="currentValue == null" class="dash">&mdash;</span>
      <span v-else :class="[theme === 'light' ? 'color-blue' : 'yellow']">&bull;</span>
    </div>
  </div>
</template>

<script>
const ITEM_HEIGHT = 96
const ITEMS = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
export default {
  name: 'NumberPicker',
  props: {
    currentValue: {
      required: true
    },
    selected: Boolean,
    direction: Number,
    position: Number,
    theme: String
  },
  data () {
    return {
      translateMode: window.translateMode
    }
  },
  computed: {
    active () {
      return this.selected
    },
    itemClass () {
      return [
        'item',
        {
          'translate': this.translateMode.translate
        }
      ]
    },
    trimmedItemsStyle () {
      return this.items.map((item, index) => {
        const crazyIndex = this.calcIndex(this.items, 4, index, this.position)
        const offset = 30
        let transformY = this.position >= 6 ? -1 * crazyIndex * ITEM_HEIGHT : crazyIndex * ITEM_HEIGHT
        let transform3d = `translate3d(0, ${(transformY) + offset}rem, 0)`
        let transform2d = `translate(0, ${(transformY) + offset}rem)`

        if (this.position === 6 && item === 0) transformY = 222 - 30
        if (transformY + 30 === 126) this.$emit('pinChange', item, this.position)

        return {
          transform: !this.translateMode.translate ? transform3d : transform2d, color: transformY + 30 === 126 ? '#FFF' : ''
        }
      })
    },
    items () {
      return ITEMS
    }
  },
  methods: {
    calcIndex (arr, additionalElems, index, selection) {
      var newIndex = index + selection - additionalElems
      if (newIndex >= arr.length) {
        newIndex = arr.length - newIndex
      }
      return newIndex
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";
.number-picker {
  height: 290rem;
  width: 96rem;
  overflow: hidden;
}
.element {
  font-size: 48rem;
  font-weight: 300;
  transition: transform $transition-fastest;
  position: relative;
  .item {
    @include transform(translate3d(0, 0, 0));
    &.translate {
      @include transform(translate(0, 0));
    }
    transition: transform $transition-fastest;
    width: 96rem;
    position: absolute;
    display: flex;
    justify-content: center;
  }
}
.active {
  position: absolute;
  top: 106rem;
  width: 96rem;
  height: 96rem !important;
  background: #00a5df;
  border-radius: 5px;
}
.symbol {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10rem;
  .dash {
    font-weight: 100;
  }
  .color-blue { color: #00a5df; }
  .yellow { color: $yellow; }
}

.dark {
  .active { background: $yellow; }
}
</style>
