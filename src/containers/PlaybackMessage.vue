<template>
  <playback-message-overlay v-if="active"
    :title="description.title"
    :text="description.text"
    :text-sub="description.textSub"
  />
</template>

<script>
import { mapState } from 'vuex'
import PlaybackMessageOverlay from 'components/PlaybackMessageOverlay'

export default {
  name: 'PlaybackMessage',
  components: { PlaybackMessageOverlay },
  computed: {
    ...mapState({
      active: state => state.playbackMessage.active,
      description: state => state.playbackMessage.description
    })
  }
}
</script>
