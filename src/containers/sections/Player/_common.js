import { mapState, mapMutations } from 'vuex'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'

import Clock from 'components/Clock'
import Channels from './Channels'
const FOCUSED_TIMEOUT_MINIMUM = 10000
const FOCUSED_TIMEOUT_MAXIMUM = 86400000
let MODIFIED_TIMEOUT = 0

export default {
  components: {
    Clock,
    Channels
  },
  mixins: [ RegisterKeyHandler ],
  data: () => ({
    type: '',
    visible: false,
    hidingTimeout: -1,
    lockedAutohiding: false,
    uiMode: window.uiMode,
    translateMode: window.translateMode
  }),
  computed: {
    playerClass () {
      return [
        'player',
        {
          'is-expanded': this.activeSection === 'events',
          'is-visible': this.visible,
          'no-transition-animation': !this.uiMode.playerTransitionAnimation,
          'no-shadow': !this.uiMode.playerShadow,
          'translate': this.translateMode.translate
        }
      ]
    },
    ...mapState({
      hidingDelay: state => state.settings.zapBannerTimeout,
      currentChannelId: state => state.player.currentChannelId,
      currentEventId: state => state.player.currentEvent.id,
      mouseEnabled: state => state.general.mouseEnabled,
      playState: state => state.player.playState
    })
  },
  methods: {
    initialize () {
      this.updatePlayerMode(this.type)
      this.updateParentalPlayerMode(this.type)

      if (this.$route.params.categoryId) {
        this.updateCategory({newCategoryId: this.$route.params.categoryId})
        this.updateCategoryType({newCategoryType: this.$route.params.categoryType})
      } else if (this.type === 'TV') {
        this.updateCategory({newCategoryId: this.defaultTVcategory})
        this.updateCategoryType({newCategoryType: 'CATEGORY'})
      }
      if (
        this.$route.params.channelId &&
          (!this.$route.params.historyBackPerformed || (this.currentChannelId !== this.$route.params.channelId)) &&
          (
            (
              this.type === 'TV' &&
              (
                this.$route.params.eventId !== this.currentEventId ||
                this.$route.params.startTime ||
                (this.currentTvType === 'CUTV' && !this.$route.params.startTime)
              )
            ) ||
            this.type === 'RADIO'
          )
      ) {
        this.changeChannel({
          channelId: this.$route.params.channelId,
          startTime: this.$route.params.startTime,
          updateFocused: true,
          eventId: this.$route.params.eventId,
          checkAgeRating: this.$route.params.checkAgeRating,
          forcePlay: this.$route.params.forcePlay
        })
      } else if (!this.$route.params.assetId) {
        this.updatePlaybackTimeUpdateInterval()
      }

      if (this.$route.params.assetId) {
        this.playAsset({
          assetId: this.$route.params.assetId,
          publishingPoint: this.$route.params.publishingPoint,
          startTime: this.$route.params.startTime,
          drmRequired: this.$route.params.drmRequired,
          duration: this.$route.params.duration
        })
      }

      this.show()
    },
    show () {
      if (this.visible) return
      this.resetAutohiding()
      this.visible = true
    },
    commonHide () {
      if (!this.visible) return
      this.visible = false
    },
    resetAutohiding () {
      if (!this.lockedAutohiding && this.hidingDelay !== null) { // this change hide timeout when fokus is on channels or progress bar
        if (this.type !== 'RADIO') {
          if ((this.activeSection === 'channels' || (this.$refs.controls && this.$refs.controls.activeSubSection === 'progress')) && this.hidingDelay < FOCUSED_TIMEOUT_MINIMUM) {
            MODIFIED_TIMEOUT = FOCUSED_TIMEOUT_MINIMUM
          } else if (this.playState === 'pause' && this.activeSection !== 'events') {
            MODIFIED_TIMEOUT = FOCUSED_TIMEOUT_MAXIMUM
          } else {
            MODIFIED_TIMEOUT = this.hidingDelay
          }
          window.clearTimeout(this.hidingTimeout)
          this.hidingTimeout = window.setTimeout(() => {
            this.hide()
          }, MODIFIED_TIMEOUT)
        } else {
          window.clearTimeout(this.hidingTimeout)
          this.hidingTimeout = window.setTimeout(() => {
            this.hide()
          }, this.hidingDelay)
        }
      }
    },
    disableAutohiding () {
      window.clearTimeout(this.hidingTimeout)
    },
    handleClickContainer () {
      this.show()
    },
    handleClickBack () {
      this.doHistoryBack()
    },
    handleMouseEnter () {
      this.lockedAutohiding = true
      this.disableAutohiding()
    },
    handleMouseLeave () {
      this.lockedAutohiding = false
      this.resetAutohiding()
    },
    ...mapMutations({
      updateParentalPlayerMode: 'parentalRating/UPDATE_PLAYER_MODE'
    })
  },
  watch: {
    mouseEnabled: function (newState) {
      if (!newState && this.lockedAutohiding) {
        this.lockedAutohiding = false
        this.resetAutohiding()
        // this.hide(true)
      }
    }
  },
  destroyed () {
    this.updateParentalPlayerMode(this.type)
    window.clearTimeout(this.hidingTimeout)
  }
}
