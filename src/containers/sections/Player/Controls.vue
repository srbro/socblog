<template>
  <div>
    <progress-bar
      :event="currentEvent"
      :live-time="type === 'vod' ? (!paused ? liveTime - playbackStartTime : pausedVODProgress) : liveTime"
      :current-time="type === 'vod' ? (!paused ? liveTime - playbackStartTime : pausedVODProgress) : playbackTime"
      :active="activeSubSection === 'progress'"
      :trickplay-data="trickplayData"
      :type="type"
      :handle-mouse-down="handleMouseDown"
      @click.native.prevent="handleClickProgressBar"
      @mouseenter.native="handleMouseEnterProgressBar"
    />
    <buttons
      :buttons="adjustedButtons"
      :active-button-index="adjustedActiveButtonIndex"
      :oneButton="oneButton"
      :vodButtons='vodButtons'
      :handle-click="handleClickButtons"
    />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import constants from 'components/Player/constants.json'
import { emitKeyPress } from 'helpers/keyHold'

import Buttons from 'components/Player/Buttons'
import ProgressBar from 'components/Player/ProgressBar'

import { pause as pauseNativePlayer, resume as resumeNativePlayer, resumeVOD, pauseVOD } from 'helpers/player'
import { EventBus } from 'helpers/eventBus'

const getBlankTrickplayData = () => ({
  direction: '',
  skip: false,
  speed: -1
})

export default {
  name: 'PlayerControls',
  data: () => ({
    buttons: ['restart', 'PLAY_PAUSE', 'back-to-live'],
    activeButtonIndex: 1,
    activeSubSection: 'buttons',
    trickplayTimeout: 0,
    trickplayData: getBlankTrickplayData(),
    oneButton: false,
    vodButtons: false,
    isMouseDown: false,
    paused: false,
    pausedVODProgress: 0,
    pausedOnChannel: null
  }),
  components: {
    Buttons,
    ProgressBar
  },
  computed: {
    currentEvent () {
      return this.type !== 'vod' ? this.playerCurrentEvent : Object.assign({}, this.playerVODAsset, {
        startTime: 0,
        endTime: this.playerVODAsset.duration,
        title: this.isSerie ? this.episodeDetail.title : this.vodDetail.title
      })
    },
    adjustedActiveButtonIndex () {
      if (this.type === 'vod') {
        this.activeButtonIndex = 0
      }
      return this.active && this.activeSubSection === 'buttons' ? this.activeButtonIndex : -1
    },
    adjustedButtons () {
      if (this.type === 'vod') {
        const oppositePlayState = this.playState === 'play' ? 'pause' : 'play'
        this.oneButton = true
        this.vodButtons = true
        return [oppositePlayState]
      } else {
        if (!this.focusedChannelStartOverEnabled && this.buttons.indexOf('restart') >= 0) {
          this.oneButton = true
          return ['back-to-live']
        } else {
          const oppositePlayState = this.playState === 'play' && this.isFocused ? 'pause' : 'play'
          this.oneButton = false
          return this.buttons.map(button => button === 'PLAY_PAUSE' ? oppositePlayState : button)
        }
      }
    },
    ...mapState({
      playState: state => state.player.playState,
      currentChannelId: state => state.player.currentChannelId,
      focusedChannelStartOverEnabled: state => state.player.focusedChannelStartOverEnabled,
      focusedChannelCutvEnabled: state => state.player.focusedChannelCutvEnabled,
      playbackTimeUpdateInterval: state => state.player.playbackTimeUpdateInterval,
      playbackTime: state => state.player.playbackTime,
      liveTime: state => state.player.liveTime,
      playbackStartTime: state => state.player.playbackStartTime,
      pinActive: state => state.parentalRating.active,
      playerCurrentEvent: state => state.player.currentEvent,
      playerVODAsset: state => state.player.asset,
      vodDetail: state => state.vod.detail,
      episodeDetail: state => state.vod.episodeDetail
    }),
    ...mapGetters({
      getSelectedEvent: 'player/getSelectedEvent'
    }),
    eventPolicy () {
      if (Date.now() > this.currentEvent.endTime) {
        return this.focusedChannelCutvEnabled
      } else if (Date.now() > this.currentEvent.startTime && Date.now() < this.currentEvent.endTime) {
        return this.focusedChannelStartOverEnabled
      }
    }
  },
  methods: {
    handleKey (key) {
      return this[`${this.activeSubSection}Handler`](key)
    },
    handleClickButtons (index) {
      if (this.$parent.activeSection !== 'controls') {
        this.$parent.activeSection = 'controls'
      }
      if (this.activeSubSection !== 'buttons') {
        this.activeSubSection = 'buttons'
      }
      this.activeButtonIndex = index
      this.triggerAction(this.buttons[this.activeButtonIndex])
    },
    handleClickProgressBar (event) {
      if (this.eventPolicy) {
        if (this.$parent.activeSection !== 'controls') {
          this.$parent.activeSection = 'controls'
        }
        if (this.activeSubSection !== 'progress') {
          this.activeSubSection = 'progress'
        }
        this.trickplayData = {
          direction: '',
          time: this.mouseEventTime(event),
          skip: false,
          speed: -1
        }
        this.commitTrickplayTime()
      }
    },
    handleMouseDown (event) {
      if (this.eventPolicy) {
        this.mouseDown = true
        window.addEventListener('mousemove', this.handleMouseMove)
        window.addEventListener('mouseup', this.handleMouseUp)
      }
    },
    handleMouseUp (event) {
      if (this.eventPolicy) {
        this.mouseDown = false
        window.removeEventListener('mousemove', this.handleMouseMove)
        window.removeEventListener('mouseup', this.handleMouseUp)
        this.commitTrickplayTime()
      }
    },
    handleMouseMove (event) {
      if (this.mouseDown) {
        this.trickplayData = {
          direction: '',
          time: this.mouseEventTime(event),
          skip: false,
          speed: -1,
          mouse: true
        }
      }
    },
    handleMouseEnterProgressBar () {
      if (this.$parent.activeSection !== 'controls') {
        this.$parent.activeSection = 'controls'
      }
      if (this.activeSubSection !== 'progress') {
        this.activeSubSection = 'progress'
      }
    },
    mouseEventTime (event) {
      const PROGRESS_WIDTH = 1422
      const PROGRESS_LEFT_OFFSET = 432
      let delta = Math.min(Math.max(0, event.clientX - PROGRESS_LEFT_OFFSET), PROGRESS_WIDTH)
      let offset = Math.floor(delta * (this.currentEvent.endTime - this.currentEvent.startTime) / PROGRESS_WIDTH)

      return Math.min(
        Date.now(),
        this.currentEvent.endTime,
        Math.max(
          this.currentEvent.startTime + offset,
          this.currentEvent.startTime
        )
      )
    },
    progressHandler (key) {
      switch (key) {
        case 'LEFT_HOLD':
          // this.trickplay(-1000)
          if (this.eventPolicy) {
            if (emitKeyPress({ delay: 100 })) {
              this.trickplay(-1.5, true, true, Date.now() - this.$options.holdTimeStart)
              this.$parent.resetAutohiding()
            }
          }
          break
        case 'RIGHT_HOLD':
          // this.trickplay(1000)
          if (this.eventPolicy) {
            if (emitKeyPress({ delay: 100 })) {
              this.trickplay(1.5, true, true, Date.now() - this.$options.holdTimeStart)
              this.$parent.resetAutohiding()
            }
          }
          break
        case 'HOLD_STOP': // l for web
          break
        case 'RW_HOLD':
          if (emitKeyPress({ delay: 100 })) {
            this.trickplay(-1, true, true)
            this.$parent.resetAutohiding()
          }
          break
        case 'RW':
        case 'LEFT':
          if (this.eventPolicy) {
            this.$options.holdTimeStart = Date.now()
            this.trickplay(-1, true)
          }
          break
        case 'FF_HOLD':
          if (emitKeyPress({ delay: 100 })) {
            this.trickplay(1, true, true)
            this.$parent.resetAutohiding()
          }
          break
        case 'FF':
        case 'RIGHT':
          if (this.eventPolicy) {
            this.$options.holdTimeStart = Date.now()
            this.trickplay(1, true)
          }
          break
        case 'DOWN':
          this.activeSubSection = 'buttons'
          break
        case 'UP':
          this.$parent.hide()
          break
        case 'BACK':
          this.$parent.hide()
          break
        case 'OK':
          break
      }
    },
    buttonsHandler (key) {
      switch (key) {
        case 'BACK':
          this.$parent.hide()
          break
        case 'LEFT':
          // returnVideoData()
          if (this.activeButtonIndex === 0) {
            if (this.type !== 'vod') {
              this.$parent.activeSection = 'channels'
            }
          } else {
            this.activeButtonIndex = Math.max(this.activeButtonIndex - 1, 0)
          }
          break
        case 'RIGHT':
          // returnVideoData()
          this.activeButtonIndex = Math.min(this.activeButtonIndex + 1, this.adjustedButtons.length - 1)
          break
        case 'UP':
          this.activeSubSection = 'progress'
          break
        case 'DOWN':
          if (this.type !== 'vod') {
            this.$parent.activeSection = 'events'
          }
          break
        case 'OK':
          this.triggerAction(this.buttons[this.activeButtonIndex])
          break
      }
    },
    trickplay (amount, skip = false, increaseSpeed = false, holdTime = 0) {
      window.clearTimeout(this.trickplayTimeout)

      let speed
      if (increaseSpeed) {
        speed = skip ? Math.min(this.trickplayData.speed + 1, 3) : -1
      } else {
        speed = 1
      }
      let realAmount
      if (this.type === 'vod') {
        realAmount = holdTime < 3000 ? this.currentEvent.duration * 0.005 : this.currentEvent.duration * 0.03
        realAmount *= window.Math.sign(amount)
      } else {
        realAmount = skip ? amount * constants.TRICKPLAY_SPEEDS[speed] : amount
      }
      const direction = realAmount > 0 ? 'fast-forward' : 'rewind'
      const time = Math.min(
        Date.now(),
        this.currentEvent.endTime,
        this.type === 'vod' ? Math.max(
          (this.trickplayData.time || this.playbackTime - this.playbackStartTime) + realAmount,
          0
        ) : Math.max(
          (this.trickplayData.time || this.playbackTime) + realAmount,
          this.currentEvent.startTime
        )
      )

      this.trickplayData = { direction, time, skip, speed }
      this.trickplayTimeout = window.setTimeout(() => {
        this.commitTrickplayTime()
      }, 1000)
    },
    triggerAction (button) {
      switch (this.adjustedButtons[this.activeButtonIndex]) {
        case 'skip-back':
          this.trickplay(-10000)
          break
        case 'restart':
          // this.restartCurrentEvent()
          this.startOverChannelFocusedInList()
          break
        case 'pause':
          // this.changeChannelPlayer()
          // this.refocusChannel()
          this.pause()
          break
        case 'play':
          // this.refocusChannel()
          if (this.type === 'vod') {
            this.paused = false
            this.pausedOnChannel = null
            this.resume()
          } else {
            this.paused = this.pausedOnChannel === this.currentEvent.id ? this.paused : false
            this.changeChannelPlayer({ paused: this.paused })
            this.paused = false
            this.pausedOnChannel = null
            this.resume()
          }
          break
        case 'back-to-live':
          this.startLiveChannelFocusedInList()
          // this.backToLive()
          break
        case 'skip-forward':
          this.trickplay(10000)
          break
      }
    },
    commitTrickplayTime () {
      if (this.currentEvent && this.currentEvent.channelId !== this.currentChannelId) {
        this.showNewEvent({
          id: this.currentEvent.id,
          updateTime: true,
          live: 0
        })
      }
      if (this.type === 'vod') {
        this.scrubVOD({ startTime: this.trickplayData.time })
        this.pausedVODProgress = this.trickplayData.time
      } else {
        this.play({ startTime: this.trickplayData.time })
      }
      // this.playbackTime = this.trickplayData.time
      if (this.type !== 'vod') {
        this.setPlaybackTime(this.trickplayData.time)
      } else {
        this.setPlaybackTime(this.liveTime)
      }
      this.trickplayData = getBlankTrickplayData()
    },
    pause () {
      if (this.playState === 'pause') return
      if (this.type === 'vod') {
        this.pausedVODProgress = this.liveTime - this.playbackStartTime
        pauseVOD()
      } else {
        pauseNativePlayer()
      }
      this.paused = true
      this.pausedOnChannel = this.currentEvent.id
      this.togglePlayState()
      this.$parent.disableAutohiding()
    },
    resume () {
      if (this.playState === 'play') return
      if (this.type === 'vod') {
        this.setVODOffset(this.pausedVODProgress)
        resumeVOD()
      } else {
        resumeNativePlayer()
      }
      this.togglePlayState()
    },
    ...mapMutations({
      togglePlayState: 'player/TOGGLE_PLAY_STATE',
      setPlaybackTime: 'player/UPDATE_PLAYBACK_TIME'
    }),
    ...mapActions({
      restartCurrentEvent: 'player/restartCurrentEvent',
      scrubVOD: 'player/scrubVOD',
      play: 'player/play',
      updateEvent: 'player/updateEvent',
      showNewEvent: 'player/showNewEvent',
      refocusChannel: 'player/refocusChannel',
      updateCurrentEvent: 'player/updateCurrentEvent',
      backToLive: 'player/backToLive',
      clearPlaybackTimeUpdateInterval: 'player/clearPlaybackTimeUpdateInterval',
      updatePlaybackTimeUpdateInterval: 'player/updatePlaybackTimeUpdateInterval',
      updatePlaybackTime: 'player/updatePlaybackTime',
      startOverChannelFocusedInList: 'player/startOverChannelFocusedInList',
      startLiveChannelFocusedInList: 'player/startLiveChannelFocusedInList',
      changeChannelPlayer: 'player/changeChannelPlayer',
      setVODOffset: 'player/setVODOffset'
    })
  },
  props: {
    active: {
      type: Boolean,
      required: true
    },
    type: {
      type: String
    },
    isFocused: {
      type: Boolean
    },
    isSerie: {
      type: Boolean
    }
  },
  watch: {
    currentEvent (newCurrentEvent) {
      if (!this.pinActive) {
        this.clearPlaybackTimeUpdateInterval()
        this.updatePlaybackTime()
        this.updatePlaybackTimeUpdateInterval()
      }
    },
    focusedChannelStartOverEnabled (newValue) {
      if (!this.focusedChannelStartOverEnabled && this.buttons.indexOf('restart') >= 0) this.activeButtonIndex = 0
      else this.activeButtonIndex = 1
    }
  },
  created () {
    this.$options.holdTimeStart = 0
  },
  mounted () {
    EventBus.$on('controls', (obj) => {
      switch (obj.action) {
        case 'handleKey':
          this.handleKey(obj.value)
          break
        case 'resume':
          this.resume()
          break
        case 'pause':
          this.pause()
          break
        case 'hide':
          if (!this.focusedChannelStartOverEnabled && this.buttons.indexOf('restart') >= 0) this.activeButtonIndex = 0
          else this.activeButtonIndex = obj.value
          break
        default:
          break
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('controls')
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$player-height: 390rem;

.container {
  align-items: flex-end;
  display: flex;
  height: 100%;
  width: 100%;
}

.player {
  background-image: url('data:image/png;base64,#{$player-gradient}');
  background-repeat: no-repeat;
  background-position: top right;
  background-color: rgba($black, .7);
  display: flex;
  flex-wrap: wrap;
  height: $player-height;
  transition: transform $transition-fast;
  width: 100%;
  @include transform(translate3d(0, 0, 0));
  &.translate {
    @include transform(translate(0, 0));
  }

  .channel-logo {
    left: 0;
    margin: 113rem 65rem 109rem 44rem;
    position: relative;
  }

  .progress-controls {
    padding-right: 66rem;
    width: 1511rem;
  }
}
</style>
