<template lang="html">
  <span :class="['arrows-container', arrowClass]" v-if="mouseEnabled">
    <div v-if="focusedRows && !navigationActive && activeRow && selectedCard !== 0"
         class="arrows left"
         @click.prevent="handleClick('LEFT')">
    </div>
    <div v-if="focusedRows && !navigationActive && activeRow && selectedCard < itemsNumber - 1"
         :class="arrowLeftClass"
         @click.prevent="handleClick('RIGHT')"
         :style="styleMouse">
    </div>
  </span>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'MouseArrows',
  props: {
    selectedCard: {
      type: Number,
      required: true
    },
    activeRow: {
      type: Boolean,
      required: true
    },
    itemsNumber: {
      type: Number,
      required: true
    },
    focusedRows: {
      type: Boolean,
      required: true
    },
    handleClick: {
      type: Function,
      default: () => null
    },
    styleMouse: {
      type: String
    },
    arrowClass: {
      type: String
    }
  },
  data () {
    return {
      uiMode: window.uiMode
    }
  },
  computed: {
    arrowLeftClass () {
      return [
        'arrows',
        'right',
        {
          'no-transition-animation': !this.uiMode.arrowsTransitionAnimation
        }
      ]
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      mouseEnabled: state => state.general.mouseEnabled
    })
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.arrows-container {
  position: absolute;
  width: 100%;
  height: 164rem;
  top: 50%;
  left: 0;
  margin-top: -82rem;

  &.season-arrows-container {
    margin-left: 132rem;
    margin-top: -40rem;
    .arrows {
      &.left {
        left: -160rem;
        margin-top: -70rem;
      }
      &.right {
        left: 1520rem;
        margin-top: -70rem;
      }
    }
  }
}
.arrows {
  position: absolute;
  top: 50%;
  margin-top: -82rem;
  width: 164rem;
  height: 164rem;
  z-index: 1000;
  opacity: 0.8;
  transition: opacity $transition;
  font-size: 30rem;
  background-size: 100%;
  body:not(.disable-hover) &:hover {
    opacity: 1;
  }
  &.left {
    left: -100rem;
    background-image: url('../../static/uc/images/arrow_left.png');
  }
  &.right {
    left: 1460rem;
    background-image: url('../../static/uc/images/arrow_right.png');
  }
}
</style>
