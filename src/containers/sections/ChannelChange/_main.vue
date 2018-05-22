<template>
  <channel-number
    :channel-name="channelName"
    :channel-no="channelNo"
  />
</template>

<script>
import find from 'lodash/fp/find'
import { mapState, mapGetters, mapActions } from 'vuex'

import ChannelNumber from 'components/ChannelNumber'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'

const CHANNEL_SWITCH_TIMEOUT = 1500
const HIDE_GUI_TIMEOUT = 3000

export default {
  name: 'ChannelChange',
  mixins: [ RegisterKeyHandler ],
  components: { ChannelNumber },
  data: () => ({
    channelNo: '',
    channelSwitchTimeoutId: -1,
    hideGUITimeoutId: -1
  }),
  computed: {
    channelName () {
      return this.findChannel() ? this.findChannel().shortName : ''
    },
    ...mapState({
      currentChannelId: state => state.player.currentChannelId,
      currentTvCategoryId: state => state.player.currentTvCategoryId,
      currentTvCategoryType: state => state.player.currentTvCategoryType
    }),
    ...mapGetters({
      channels: 'player/getAllChannels',
      playerRoute: 'player/getRouteName'
    })
  },
  methods: {
    handleKey (key) {
      if (!isNaN(Number(key))) {
        this.keyPressed(key)
      } else if (key === 'BACK') {
        this.$router.push({
          name: this.playerRoute,
          params: {
            categoryId: this.currentTvCategoryId,
            categoryType: this.currentTvCategoryType
          }
        })
      } else if (key === 'SCROLLUP' || key === 'SCROLLDOWN') {
        this.nextPrevChannel({direction: key === 'SCROLLUP' ? 'next' : 'prev'})
        this.$router.push({
          name: this.playerRoute,
          params: {
            categoryId: this.currentTvCategoryId,
            categoryType: this.currentTvCategoryType
          }
        })
      }
    },
    processDigit (digit) {
      let channelNo = `${this.channelNo + digit}`
      return channelNo.length <= 3 ? channelNo : digit
    },
    keyPressed (key) {
      this.channelNo = this.processDigit(key)
      this.hideGUI()
    },
    switchChannel () {
      let newChannel = this.findChannel()
      let newChannelId = newChannel ? newChannel.id : 1

      clearTimeout(this.channelSwitchTimeoutId)
      if (newChannel && newChannelId !== this.currentChannelId && this.channelName !== '') {
        this.channelSwitchTimeoutId = setTimeout(() => {
          this.changeChannel({
            channelId: newChannelId,
            updateFocused: true
          })
        }, CHANNEL_SWITCH_TIMEOUT)
      }
    },
    findChannel () {
      if (this.channels && this.channelNo) {
        return find({ position: parseInt(this.channelNo) }, this.channels)
      }
    },
    hideGUI () {
      clearTimeout(this.hideGUITimeoutId)
      this.hideGUITimeoutId = setTimeout(() => {
        this.$router.push({
          name: this.playerRoute,
          params: {
            categoryId: this.currentTvCategoryId,
            categoryType: this.currentTvCategoryType
          }
        })
      }, HIDE_GUI_TIMEOUT)
    },
    initFromRouteParams () {
      this.handleKey(this.$route.params.pressedKey)
    },
    ...mapActions({
      fetchChannels: 'general/fetchChannels',
      changeChannel: 'globalActions/changeChannel',
      nextPrevChannel: 'player/nextPrevChannel'
    })
  },
  watch: {
    channelNo () {
      this.switchChannel()
    }
  },
  async created () {
    if (!this.channels || this.channels.length === 0) {
      await this.fetchChannels()
    }
    if (Object.keys(this.$route.params).length > 0) {
      this.initFromRouteParams()
    }
  },
  destroyed () {
    clearTimeout(this.hideGUITimeoutId)
    clearTimeout(this.channelSwitchTimeoutId)
  }
}
</script>
