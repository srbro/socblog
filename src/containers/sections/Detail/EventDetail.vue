<template>
  <detail
    :channel-id="currentChannel ? currentChannel.id : 0"
    :event="eventDetail ? eventDetail : {}"
    :active="true"
    :current-event-cutv="currentEventCutv"
    :current-cutv-delay="currentCutvDelay"
    :current-start-over-enabled="currentChannel.startOverEnabled ? currentChannel.startOverEnabled : false"
    :selected-event="eventDetail"
    :progress="progress"
    show-progress
    :go-back="doBack"
  />
</template>

<script>
import { mapState } from 'vuex'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'mixins/HistoryManager'
import Detail from 'containers/sections/Guide/Detail'
import { adjustedMoment, currentEventProgress } from 'helpers/time'
import { EventBus } from 'helpers/eventBus'

export default {
  name: 'EventDetail',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { Detail },
  computed: {
    currentChannel () {
      if (this.tvChannelsMap && this.tvChannelsMap.length === 0) return {}
      return this.tvChannelsMap[this.eventDetail.channelId]
    },
    currentEventCutv () {
      if (Object.keys(this.eventDetail).length === 0) return false
      return this.progress === 1 ? this.currentChannel.cutvEnabled : true
    },
    currentCutvDelayTime () {
      return adjustedMoment() - this.currentChannel.cutvDelay
    },
    currentCutvDelay () {
      return this.eventDetail.startTime > this.currentCutvDelayTime
    },
    progress () {
      return currentEventProgress(this.eventDetail.startTime, this.eventDetail.endTime)
    },
    ...mapState({
      eventDetail: state => state.epg.eventDetail,
      tvChannelsMap: state => state.general.tvChannelsMap
    })
  },
  methods: {
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
      }
      EventBus.$emit('detail', { action: 'handleKey', value: key })
    },
    doBack () {
      this.handleKey('BACK')
    }
  }
}
</script>
