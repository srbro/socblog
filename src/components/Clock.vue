<template>
  <div :class="clockClass">{{ currentTime }}</div>
</template>

<script>
import { formatTime } from 'helpers/time'

export default {
  name: 'Clock',
  data: () => ({
    currentTime: formatTime(Date.now()),
    currentTimeUpdateTimeoutId: -1,
    uiMode: window.uiMode
  }),
  computed: {
    clockClass () {
      return ['clock', { 'is-visible': this.visible }, { 'no-transition-animation': !this.uiMode.buttonsTransitionAnimation }]
    }
  },
  methods: {
    updateCurrentTime () {
      window.clearTimeout(this.currentTimeUpdateTimeoutId)
      this.currentTime = formatTime(Date.now())
      this.currentTimeUpdateTimeoutId = window.setTimeout(this.updateCurrentTime, 15000)
    }
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  created () {
    this.updateCurrentTime()
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.clock {
  color: $white;
  font-size: 82rem;
  font-weight: 300;
  line-height: 1em;
  position: absolute;
  right: 66rem;
  text-shadow: 2rem 2rem 4rem $black;
  top: 75rem;
  transform: scale3d(0, 0, 1);
  transition: transform $transition-fast;
  text-align: right;
  &.is-visible { transform: scale3d(1, 1, 1);}
}
</style>
