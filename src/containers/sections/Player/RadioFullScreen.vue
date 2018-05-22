<template>
  <channel-full-screen
    :logo="generateImagePath({ imageProperty: currentChannel.images, index: 2 })"
    :current-event="currentEvent"
    :next-event="nextEvent"
  />
</template>

<script>
import ChannelFullScreen from 'components/Player/ChannelFullScreen'
import { generatePath as generateImagePath } from 'helpers/image'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'PlayerRadioFullScreen',
  components: { ChannelFullScreen },
  computed: {
    ...mapState({
      currentEvent: state => state.player.currentEvent,
      nextEvent: state => state.player.nextEvent
    }),
    ...mapGetters({ currentChannel: 'player/getCurrentChannel' })
  },
  methods: { generateImagePath }
}
</script>
