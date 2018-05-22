<template>
  <div class="container" @click.prevent="handleClickContainer()">
    <clock :visible="visible" />
    <div id="tv-category" :class="[{ 'is-visible': visible }, { 'no-transition-animation': !this.uiMode.buttonsTransitionAnimation }]">{{currentCategoryName}}</div>
    <div id="bitrate" :class="[{ 'is-visible': visible }]">{{currentBitrate}}</div>
    <div :class="playerClass" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <button-icon
        v-if="visible && mouseEnabled"
        :has-image="true"
        :imgPath="imgPath"
        @click.native.prevent="goToGuide"
      />
      <div class="channels">
        <channels
          :active="activeSection === 'channels'"
          ref="channels"
        />
      </div>
      <div class="progress-controls">
        <controls
          :active="activeSection === 'controls'"
          :is-focused="playingChannelIsFocused"
          ref="controls"
        />
      </div>
      <div class="timeline">
        <events
          :active="activeSection === 'events'"
          :display="activeSection !== 'channels'"
          :channels-active="activeSection === 'channels'"
          :activate-events="activateEvents"
          ref="events"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { onEnterExitZap } from 'hal'
import ButtonIcon from 'components/Button'
import backToGuideImage from 'assets/images/back_to_guide_icon.png'
import { emitKeyPress } from 'helpers/keyHold'

import Controls from './Controls'
import Events from './Events'
import common from './_common'
import HistoryManager from 'mixins/HistoryManager'
import { EventBus } from 'helpers/eventBus'
// import { STREAM_STARTED, STREAM_PLAYING } from 'helpers/player/playerConst'

let oldPressedScroll = 0

export default {
  name: 'PlayerTv',
  mixins: [ common, HistoryManager ],
  data: () => ({
    activeSection: 'controls',
    icon: 'guide',
    uiMode: window.uiMode,
    playingChannelIsFocused: true
  }),
  components: {
    Controls,
    Events,
    ButtonIcon
  },
  computed: {
    imgPath () {
      this.playingChannelIsFocused = this.$refs.channels.checkFocusedChannelPlaying() // checkFocusedChannelPlaying treba da bude getter
      return backToGuideImage
    },
    ...mapState({
      playerState: state => state.player.playState,
      streamState: state => state.corePlayer.stream.status,
      eventDetail: state => state.epg.eventDetail,
      // Params requred for history save.
      currentChannelId: state => state.player.currentChannelId,
      currentTvCategoryId: state => state.player.currentTvCategoryId,
      currentTvCategoryType: state => state.player.currentTvCategoryType,
      parentalRatingRedirectToPin: state => state.parentalRating.redirectToPin,
      parentalRatingStreamBlocked: state => state.parentalRating.streamBlocked,
      defaultTVcategory: state => state.general.defaultTVcategory,
      parentalRatingActive: state => state.parentalRating.active,
      currentTvType: state => state.player.currentTvType
    }),
    ...mapGetters({
      currentChannel: 'player/getCurrentChannel',
      getCurrentEvent: 'player/getCurrentEvent',
      currentCategoryName: 'player/currentCategoryName',
      currentBitrate: 'corePlayer/getBitrate'
    })
  },
  methods: {
    holdKey (key) {
      switch (key) {
        case 'SCROLLUP_HOLD':
        case 'SCROLLDOWN_HOLD':
          this.nextPrevChannel({direction: key === 'SCROLLUP_HOLD' ? 'next' : 'prev', delayedPlay: true})
          this.resetAutohiding()
          this.show()
          break
      }
    },
    handleKey (key) {
      // Global keys
      switch (key) {
        case 'GUIDE':
          this.goToNowTv()
          break
        case 'SCROLLUP':
        case 'SCROLLDOWN':
          if (this.activeSection !== 'channels') {
            let newPressedScroll = new Date().getTime()
            let delayedPlay = newPressedScroll - oldPressedScroll < 500
            this.nextPrevChannel({direction: key === 'SCROLLUP' ? 'next' : 'prev', delayedPlay})
            this.show()
            oldPressedScroll = newPressedScroll
          }
          break
        case 'HOLD_STOP':
          this.fasterAnimation = false
          break
        case 'SCROLLUP_HOLD':
        case 'SCROLLDOWN_HOLD':
          if (this.activeSection !== 'channels') {
            if (emitKeyPress({ delay: 200 })) {
              this.resetAutohiding()
              this.nextPrevChannel({direction: key === 'SCROLLUP_HOLD' ? 'next' : 'prev', delayedPlay: true})
              this.show()
              this.fasterAnimation = true
            }
          }
          break
        case 'PAUSE':
        case 'STOP':
          this.show()
          EventBus.$emit('controls', {action: 'pause', value: 1})
          return
        case 'PLAY':
          EventBus.$emit('controls', {action: 'resume', value: 1})
          this.hide()
          return
        case 'PLAYPAUSE':
          if (this.playerState === 'play') {
            this.show()
            EventBus.$emit('controls', {action: 'pause', value: 1})
          } else if (this.playerState === 'pause') {
            EventBus.$emit('controls', {action: 'resume', value: 1})
            this.hide()
          }
          return
        case 'RW':
        case 'FF':
          this.activeSection = 'controls'
          this.$refs.controls.activeSubSection = 'progress' // treba da bude props
          this.show()
          break
        case 'PREVIOUS':
        case 'NEXT':
          this.activeSection = 'events'
          this.show()
          EventBus.$emit(this.activeSection, {action: 'handleKey', value: key === 'NEXT' ? 'RIGHT' : 'LEFT'})
          break
      }

      // Almost global keys
      if ((!this.visible || this.activeSection !== 'channels') && !isNaN(Number(key))) {
        this.$router.push({
          name: 'ChannelChange',
          params: { pressedKey: key }
        })
      }

      // Keys that depend on hidden/visible state§
      if (!this.visible) {
        switch (key) {
          case 'LEFT':
            this.goToGuide()
            break
          case 'BACK':
            this.doHistoryBack()
            break
          case 'RIGHT':
            this.goToDetail()
            break
          case 'HOLD_STOP':
            break
          case 'DOWN':
            this.activeSection = 'events'
            this.show()
            break
          case 'OK':
            this.activeSection = 'channels'
            this.show()
            break
          default:
            this.show()
            break
        }
      } else {
        // Send key to corresponding child component handler
        EventBus.$emit(this.activeSection, {action: 'handleKey', value: key})
      }
      this.resetAutohiding()
    },
    activateEvents () {
      this.activeSection = 'events'
    },
    goToGuide () {
      this.$router.push({
        name: 'Guide',
        params: { columnToFocus: 'CHANNELS' } // TODO: Change this parameter to whatever Guide needs
      })
    },
    async goToDetail () {
      await this.fetchEventDetail({
        eventId: this.getCurrentEvent.id,
        noInformationData: null
      })
      this.$router.push({
        name: 'EventDetail'
      })
    },
    goToNowTv () {
      this.$router.push({
        name: 'NowTv',
        params: {
          toggleNavigation: true,
          activeStripe: 'cardgrid'
        } // TODO: Change this parameter to whatever Guide needs
      })
    },
    hide (hideInAnyCase = false) {
      this.commonHide()
      this.refocusChannel()
      this.activeSection = 'controls'
      EventBus.$emit('controls', {action: 'hide', value: 1})
      this.$refs.controls.activeSubSection = 'buttons'
    },
    ...mapMutations({
      updatePlayerMode: 'player/UPDATE_MODE'
    }),
    ...mapActions({
      changeChannel: 'globalActions/changeChannel', // moved to global action from player/changeChannel
      nextPrevChannel: 'player/nextPrevChannel',
      updateCategory: 'player/updateCategory',
      updateCategoryType: 'player/updateCategoryType',
      fetchEventDetail: 'epg/fetchEventDetail',
      refocusChannel: 'player/refocusChannel',
      updatePlaybackTimeUpdateInterval: 'player/updatePlaybackTimeUpdateInterval'
    })
  },
  watch: {
    // streamState (newValue) {
    //   if (newValue === STREAM_PLAYING) {
    //     this.hideLoader()
    //   } else if (newValue === STREAM_STARTED) {
    //     this.initLoader()
    //   }
    // },
    parentalRatingActive (active) {
      if (!active) { this.resetAutohiding() }
    }
  },
  created () {
    this.type = 'TV'
    onEnterExitZap(false)
  },
  mounted () {
    setTimeout(() => {
      this.initialize()
    }, 100)
  },
  beforeUpdate () {
    if (this.parentalRatingStreamBlocked) {
      this.saveHistoryRecord = () => null
    }
  }
}
</script>

<style lang="scss" scoped src="./_common.scss" />
