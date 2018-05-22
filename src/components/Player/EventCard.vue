<template lang="html">
  <zap-card
    :lower-image-url="event.imageUrl"
    :progress="progress"
    :selected="selected"
    :first-row-text="event.title"
    :second-row-text="formattedTime"
    type="catchup"
    :live-line="renderLiveLine"
    :displayCta="selectedEvent.ctaMode && selectedEvent.id === event.id"
    :ctaSelectedPosition="ctaPosition"
    :ctaButtons="selectedEvent.ctaButtons"
    :faster-animation="fasterAnimation"
    :cutv-enabled="blockedEvent"
    :handle-click-card-cta="handleClickCardCta"
  />
</template>

<script>
import ZapCard from 'components/Player/ZapCard'
import { formatTime, formatShortDate, isSameDay } from 'helpers/time'
import { mapState } from 'vuex'

export default {
  name: 'PlayerEventCard',
  components: {
    ZapCard
  },
  data: () => ({
    ctaPosition: 0
  }),
  computed: {
    progress () {
      if (isNaN(this.event.startTime) || isNaN(this.event.endTime)) return 0

      const now = Date.now()

      if (now > this.event.endTime) {
        return 1
      } else if (now < this.event.startTime) {
        return 0
      } else {
        return (now - this.event.startTime) / (this.event.endTime - this.event.startTime)
      }
    },
    formattedTime () {
      const now = Date.now()
      let date = isSameDay(now, this.event.startTime) ? 'TODAY' : formatShortDate(this.event.startTime)

      return `${date} // ${formatTime(this.event.startTime)} - ${formatTime(this.event.endTime)}`
    },
    renderLiveLine () {
      const now = Date.now()

      return now > this.event.startTime && now < this.event.endTime && this.lineVisible
    },
    blockedEvent () {
      return this.cutvEnabled && !(this.event.startTime < this.cutvDelay)
    },
    ...mapState({ selectedEvent: state => state.player.selectedEvent })
  },
  watch: {
    selectedEvent: {
      handler (data) {
        this.ctaPosition = this.selectedEvent.ctaSelectedPosition
      },
      deep: true
    }
  },
  props: {
    event: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      required: true
    },
    lineVisible: {
      type: Boolean,
      required: true
    },
    fasterAnimation: Boolean,
    cutvEnabled: {
      type: Boolean
    },
    cutvDelay: {
      type: Number
    },
    handleClickCardCta: Function
  }
}
</script>
