<template>
  <div class="two-events">
    <div
      v-for="(event, label) in events"
      :key="label"
      :class="['event', label]"
    >
      <span class="prefix">{{ label }}:</span>
      <span class="title">{{ event.title }}</span>
      <span class="time">// {{ fromToTime(event.startTime) }} - {{ fromToTime(event.endTime) }}</span>
    </div>
  </div>
</template>

<script>
import { formatTime } from 'helpers/time'

export default {
  name: 'PlayerTwoEvents',
  props: {
    events: {
      type: Object,
      required: true
    }
  },
  methods: {
    fromToTime: time => time ? formatTime(time) : ''
  }
}
</script>

<style lang="scss" scoped>
@import 'variables';

.two-events { padding: 75rem 0 0 4rem; }

  .event {
    font-family: $font-alternative;
    font-size: 38rem;
    line-height: 72rem;
    &.now { color: $white; }
    &.next { color: rgba($white, 0.5); }
  }

    .prefix {
      color: $blue;
      text-transform: uppercase;
    }

    .time { font-weight: 300; }
</style>
