<template>
  <channel-list
    :animated="animated"
    :channels="channels"
    :selected-index="focusedChannelIndex"
    :active="active"
    :faster-animation="fasterAnimation"
    :focus-on-fast="focusOnFast"
    :handle-click="handleClick"
  />
</template>

<script>
import findIndex from 'lodash/fp/findIndex'
import { mapActions, mapState, mapGetters } from 'vuex'
import { emitKeyPress } from 'helpers/keyHold'
import ChannelList from 'components/Player/ChannelList'
import { EventBus } from 'helpers/eventBus'

const KEY_SWITCHING_DELAY = 1000
const EPG_NUMBER_OF_DAYS = 7
const CHANNELS_NUMBER_PER_SCROLL = 5

export default {
  name: 'PlayerChannels',
  components: { ChannelList },
  data: () => ({
    numberSelectionTimeout: -1,
    currentNumberInput: '',
    fasterAnimation: false,
    focusOnFast: 0
  }),
  computed: {
    animated () {
      // return this.currentNumberInput === ''
      return this.active
    },
    ...mapState({
      focusedChannelIndex: state => state.player.focusedChannelIndex,
      currentChannelId: state => state.player.currentChannelId
    }),
    ...mapGetters({ channels: 'player/getChannelList' })
  },
  props: {
    active: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      default: 'tv',
      validator: value => ['tv', 'radio'].indexOf(value) > -1
    }
  },
  methods: {
    checkFocusedChannelPlaying () {
      return this.channels[this.focusedChannelIndex].id === this.currentChannelId
    },
    handleKey (key) {
      switch (key) {
        case 'SCROLLUP':
          if (this.type === 'tv') this.scrollUp()
          break
        case 'SCROLLDOWN':
          if (this.type === 'tv') this.scrollDown()
          break
        case 'SCROLLUP_HOLD':
        case 'SCROLLDOWN_HOLD':
          if (this.type === 'tv' && emitKeyPress({ delay: 50 })) {
            this.holdKeySCROLL(key)
            this.fasterAnimation = true
          }
          break
        case 'LEFT':
          this.$parent.hide(true)
          break
        case 'UP':
          let newFocusedChannelIndex = this.focusedChannelIndex <= 0 ? this.channels.length - 1 : this.focusedChannelIndex - 1
          this.focusChannel({
            newFocusedChannelIndex: newFocusedChannelIndex,
            channelId: this.channels[newFocusedChannelIndex].id
          })
          break
        case 'DOWN':
          newFocusedChannelIndex = this.focusedChannelIndex >= this.channels.length - 1 ? 0 : this.focusedChannelIndex + 1
          this.focusChannel({
            newFocusedChannelIndex: newFocusedChannelIndex,
            channelId: this.channels[newFocusedChannelIndex].id
          })
          break
        case 'HOLD_STOP': // l for web
          this.fasterAnimation = false
          this.focusOnFast = 0
          break
        case 'UP_HOLD':
        case 'DOWN_HOLD':
          if (emitKeyPress({ delay: 50 })) {
            this.holdKey(key)
            this.fasterAnimation = true
          }
          break
        case 'BACK':
          this.$parent.activeSection = 'controls'
          break
        case 'RIGHT':
          this.$parent.activeSection = 'controls'
          break
        case 'OK':
          if (this.channels[this.focusedChannelIndex].id !== this.currentChannelId) {
            this.changeChannel({ channelId: this.channels[this.focusedChannelIndex].id })
          } else {
            this.$parent.hide(true)
          }
          break
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.pressNumber(Number(key))
          break
      }
    },
    holdKey (side) {
      if (side === 'UP_HOLD') {
        this.focusOnFast = 1
        let newFocusedChannelIndex = this.focusedChannelIndex <= 0 ? this.channels.length - 1 : this.focusedChannelIndex - 1
        this.focusChannel({
          newFocusedChannelIndex: newFocusedChannelIndex,
          channelId: this.channels[newFocusedChannelIndex].id
        })
      } else {
        this.focusOnFast = -1
        let newFocusedChannelIndex = this.focusedChannelIndex >= this.channels.length - 1 ? 0 : this.focusedChannelIndex + 1
        this.focusChannel({
          newFocusedChannelIndex: newFocusedChannelIndex,
          channelId: this.channels[newFocusedChannelIndex].id
        })
      }
    },
    holdKeySCROLL (side) {
      if (side === 'SCROLLUP_HOLD') {
        this.focusOnFast = 1
        this.scrollUp()
      } else {
        this.focusOnFast = -1
        this.scrollDown()
      }
    },
    scrollUp () {
      let newFocusedChannelIndex = this.focusedChannelIndex - CHANNELS_NUMBER_PER_SCROLL
      if (newFocusedChannelIndex < 0) {
        while (newFocusedChannelIndex < 0) {
          newFocusedChannelIndex = this.channels.length + newFocusedChannelIndex
        }
      }
      this.focusChannel({
        newFocusedChannelIndex: newFocusedChannelIndex,
        channelId: this.channels[newFocusedChannelIndex].id
      })
    },
    scrollDown () {
      let newFocusedChannelIndex = this.focusedChannelIndex + CHANNELS_NUMBER_PER_SCROLL
      if (newFocusedChannelIndex > this.channels.length - 1) newFocusedChannelIndex = newFocusedChannelIndex - ((Math.floor(newFocusedChannelIndex / this.channels.length) * this.channels.length))
      this.focusChannel({
        newFocusedChannelIndex: newFocusedChannelIndex,
        channelId: this.channels[newFocusedChannelIndex].id
      })
    },
    handleClick (channelNumber) {
      if (this.$parent.activeSection !== 'channels') {
        this.$parent.activeSection = 'channels'
        if (this.$parent.$refs.controls) {
          this.$parent.$refs.controls.activeSubSection = 'buttons'
        }
      }
      this.focusChannelWithNumber(channelNumber)
      if (this.channels[this.focusedChannelIndex].id !== this.currentChannelId) {
        this.changeChannel({ channelId: this.channels[this.focusedChannelIndex].id })
      }
    },
    pressNumber (number) {
      window.clearTimeout(this.numberSelectionTimeout)

      let newNumber = this.currentNumberInput + number
      const focusAction = this.focusChannelWithNumber(newNumber)

      // If no channel matched 12+3, the number is too long, try just 3
      if (!focusAction) {
        newNumber = String(number)
        this.focusChannelWithNumber(newNumber)
      }

      this.currentNumberInput = newNumber

      this.numberSelectionTimeout = window.setTimeout(() => {
        this.currentNumberInput = ''
      }, KEY_SWITCHING_DELAY)
    },
    focusChannelWithNumber (number) {
      const newIndex = findIndex({ number: Number(number) }, this.channels)
      if (newIndex > -1) {
        this.focusChannel({newFocusedChannelIndex: newIndex, numberOfDays: EPG_NUMBER_OF_DAYS})
        return true
      } else {
        return false
      }
    },
    ...mapActions({
      changeChannel: 'globalActions/changeChannel',
      focusChannel: 'globalActions/focusChannel',
      fetchChannels: 'general/fetchChannels'
    })
  },
  watch: {
    active (data) {
      if (!data) {
        this.fasterAnimation = false
      }
    }
  },
  mounted () {
    if (this.channels.length === 0) {
      this.fetchChannels()
    }
    EventBus.$on('channels', (obj) => {
      if (obj.action === 'handleKey') {
        this.handleKey(obj.value)
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('channels')
  }
}
</script>
