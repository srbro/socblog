<template>
  <div :class="['channel-full-screen', { 'display-radio-bckg': !getRadioBackground }]">
    <div class="logo">
      <!-- {{ logo }} -->
      <img class="image" :src="logo" />
    </div>
    <div class="text">
      <div class="intro">You are listening to</div>
      <div class="title">{{ currentEvent.title }}</div>
      <div class="time">{{ fromToTime(currentEvent) }}</div>
      <div class="next">
        <span class="highlight">Next:</span>
        {{ nextEvent.title }}
        <span class="time">// {{ fromToTime(nextEvent) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatTime } from 'helpers/time'

import { mapGetters } from 'vuex'

export default {
  name: 'PlayerChannelFullScreen',
  computed: {
    getRadioBackground () {
      return this.playerGetRadioBackground()
    }
  },
  methods: {
    fromToTime: event => `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`,
    ...mapGetters({
      playerGetRadioBackground: 'player/getRadioBackground'
    })
  },
  props: {
    logo: {
      type: String,
      required: true
    },
    currentEvent: {
      type: Object,
      required: true
    },
    nextEvent: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

$size: 342rem;

.display-radio-bckg {
  visibility: hidden;
}

.channel-full-screen {
  background: url('../../../static/uc/images/rainbow-background.jpg');
  display: flex;
  height: 100%;
  left: 0;
  padding: 304rem 0 0 525rem;
  position: absolute;
  top: 0;
  width: 100%;
}

  .logo {
    background: $white-dirty;
    border-radius: 50%;
    box-shadow: $box-shadow-down-large;
    height: $size;
    padding-top: 75rem;
    width: $size;
  }

    .image { width: 100%; }

  .text {
    color: $white;
    flex: 1;
    font-size: 38rem;
    font-family: $font-alternative;
    height: $size;
    padding: 37rem 0 0 48rem;
    text-shadow: $text-shadow-default;
  }

    .intro, .highlight {
      color: $blue;
      text-transform: uppercase;
    }

    .title {
      font-size: 82rem;
      font-family: $font-default;
      font-weight: 300;
      line-height: 108rem;
      margin-bottom: 2rem;
    }

    .time { font-weight: 300; }

    .next { margin-top: 37rem; }

</style>
