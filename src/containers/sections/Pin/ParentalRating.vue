<template>
  <div :class="['container', theme]">
    <custom-button
      :active="this.activeLevel === 'back'"
      round
      :dark="this.playerMode === 'VOD'"
      icon="back"
      class="button-back"
      @click.native.prevent="handleClickBack" />
    <h1 class="title">{{ loc('message_lockedchannel_locked_title') }}</h1>
    <div class="rainbow"></div>
    <div class="sub-title">{{ subTitle() }}</div>
    <div class="pin">
      <number-picker
        v-for="(currentValue, index) in numbers"
        :key="index"
        :theme="theme"
        :selected = "index === currentSelection"
        :current-value = "currentValue"
        :direction = "index === currentSelection ? direction : null"
        :position = "index === currentSelection ? position : 0"
        @pinChange="onPinChange"
        @click.native.prevent="handleClickNumberPicker(index)"
      >
      </number-picker>
    </div>
  </div>
</template>

<script>
import toString from 'lodash/fp/toString'
import { mapMutations, mapActions, mapState, mapGetters } from 'vuex'
import common from './_common'

const TRANSFORM_PIN = function (pin) {
  return toString(pin).replace(/[,]/g, '')
}

export default {
  name: 'ParentalRating',
  mixins: [ common ],
  computed: {
    ...mapState({
      parentalRatingActive: state => state.parentalRating.active,
      pinValid: state => state.settings.validPin,
      pinLocked: state => state.parentalRating.pinLocked,
      pinLockedTime: state => state.parentalRating.pinLockedTime,
      attempts: state => state.parentalRating.attempts,
      currentEventParams: state => state.parentalRating.currentEventParams,
      previousEventParams: state => state.parentalRating.previousEventParams,
      playerRedirectParams: state => state.parentalRating.playerRedirectParams,
      playerMode: state => state.parentalRating.playerMode,
      playbackMessageDescription: state => state.playbackMessage.description,
      playingEvent: state => state.player.playingEvent,
      asset: state => state.vod.detail,
      episode: state => state.vod.episodeDetail
    }),
    ...mapGetters({
      getCategoryId: 'player/getCategoryId'
    })
  },
  methods: {
    ...mapMutations({
      updateStreamBlocked: 'parentalRating/UPDATE_STREAM_BLOCKED',
      updateRedirectToPin: 'parentalRating/UPDATE_REDIRECT_TO_PIN',
      updateAllowedEventId: 'parentalRating/UPDATE_ALLOWED_EVENT_ID',
      updateCurrentEventParams: 'parentalRating/UPDATE_CURRENT_EVENT_PARAMS'
    }),
    ...mapActions({
      togglePopup: 'popup/toggle',
      updatePinLocked: 'parentalRating/updatePinLocked',
      resetPinLocked: 'parentalRating/resetPinLocked',
      togglePlaybackMessage: 'playbackMessage/toggle',
      nextPrevChannel: 'player/nextPrevChannel',
      changeChannel: 'globalActions/changeChannel',
      updateCategory: 'player/updateCategory',
      toggleParentalRating: 'parentalRating/toggle',
      clearPlaybackTimeUpdateInterval: 'player/clearPlaybackTimeUpdateInterval',
      showEventOnPinOk: 'player/showEventOnPinOk'
    }),
    subTitle () {
      return this.loc(this.playerMode === 'VOD' ? 'message_guide_description_enterpincode' : 'message_lockedchannel_locked_description')
    },
    handleClickBack () {
      this.currentSelection = -1
      this.cancel()
    },
    pressOk () {
      if (this.activeLevel === 'back') {
        this.currentSelection = -1
        this.cancel()
      } else if (this.activeLevel === 'pin') {
        this.currentSelection < 3 ? this.moveSelection('RIGHT') : this.proceed()
      } else {
        let buttonPressed = this.numbers.length > 0 ? this.numbers[this.currentSelection] : null
        if (buttonPressed) this.proceed()
        return this.exit()
      }
    },
    async proceed () {
      await this.checkPin(TRANSFORM_PIN(this.pin))
      if (this.pinValid) {
        this.resetPinLocked()
        this.exit(true)
      } else {
        this.updatePinLocked()
        this.showTryAgainMessage()
        this.resetPinData()
        if (this.pinLocked) {
          this.showLockMessage()
        }
      }
    },
    resetPinData () {
      this.currentSelection = 0
      this.pin = [null, null, null, null]
      this.direction = null
      this.position = 5
      this.pinPositions = [5, 5, 5, 5]
    },
    exitTV () {
      this.updateCurrentEventParams({ live: Date.now() > this.playingEvent.endTime ? this.playingEvent.startTime : 0 }, { root: true })
      this.updateStreamBlocked(false)
      this.togglePlaybackMessage({ active: false })
      this.toggleParentalRating({ active: false })
      this.updateRedirectToPin(true)

      if (this.$route.name === 'PlayerTv' || this.$route.name === 'PlayerRadio') {
        this.updateAllowedEventId(this.playingEvent.id)
        this.showEventOnPinOk({
          id: this.playingEvent.id,
          live: this.currentEventParams.live === 0
        })
      } else {
        this.clearPlaybackTimeUpdateInterval()
        this.updateAllowedEventId(this.playerRedirectParams.eventId)
        this.$router.push({
          name: 'PlayerTv',
          params: {
            ...this.playerRedirectParams,
            checkAgeRating: false,
            forcePlay: false
          }
        })
      }
    },
    exitVOD () {
      this.toggleParentalRating({ active: false })
      this.clearPlaybackTimeUpdateInterval()
      let asset = this.$route.name === 'VodDetail' ? this.asset : this.episode

      this.$router.push({
        name: 'PlayerVod',
        params: {
          assetId: asset.id,
          publishingPoint: asset.publishingPoint,
          imageUrl: this.$route.params.asset.imageUrl,
          startTime: 0,
          drmRequired: asset.drmRequired,
          duration: asset.duration
        }
      })
    },
    exit (pinValid = false) {
      if (pinValid) {
        if (this.playerMode === 'VOD') {
          this.exitVOD()
        } else {
          this.exitTV()
        }
      } else {
        this.toggleParentalRating({ active: false })
        this.cancel()
      }
    },
    cancel () {
      if (this.playerMode === 'VOD') {
        this.toggleParentalRating({ active: false })
      } else {
        this.updateCategory({ newCategoryId: this.previousEventParams.categoryId })
        this.updateStreamBlocked(false)

        this.changeChannel({
          ...this.previousEventParams,
          checkAgeRating: false,
          forcePlay: !(this.$route.name === 'PlayerTv' || this.$route.name === 'PlayerRadio'),
          updateFocused: true
        })
        this.toggleParentalRating({ active: false })

        if (this.playbackMessageDescription.title === this.loc('message_guide_title_lockedchannel')) {
          this.togglePlaybackMessage({ active: false })
        }
      }
    },
    showLockMessage () {
      let retryIn = Math.floor((this.pinLockedTime + 60000 - Date.now()) / 60000)

      this.togglePopup({
        active: true,
        data: {
          type: 'reminder',
          title: this.loc('message_lockedchannel_locked_wrongpin_noattempts_title'),
          text: this.locReplace('10', retryIn, this.loc('message_lockedchannel_locked_wrongpin_noattempts_description')),
          priority: 1,
          buttons: [
            {
              id: 'ok',
              label: this.loc('message_lockedchannel_locked_wrongpin_noattempts_ok'),
              callback: (newValue) => { this.exit() }
            }
          ],
          selectedButtonIndex: 0,
          back: false,
          theme: this.playerMode === 'VOD' ? 'dark' : 'light'
        }
      })
    },
    showTryAgainMessage () {
      let attempts = 3 - this.attempts

      this.togglePopup({
        active: true,
        data: {
          type: 'reminder',
          title: 'Wrong PIN',
          text: this.locReplace('2', attempts, this.loc('message_lockedchannel_locked_wrongpin')),
          priority: 1,
          buttons: [
            {
              id: 'tryAgain',
              label: this.loc('message_server_error_tryagain'),
              callback: (newValue) => {}
            },
            {
              id: 'cancel',
              label: this.loc('message_server_error_cancel'),
              callback: (newValue) => { this.cancel() }
            }
          ],
          selectedButtonIndex: 0,
          back: false,
          theme: this.playerMode === 'VOD' ? 'dark' : 'light'
        }
      })
    }
  },
  created () {
    this.clearPlaybackTimeUpdateInterval()
    if (this.pinLockedTime < Date.now()) {
      this.resetPinLocked()
    }
    if (this.pinLocked) {
      this.showLockMessage()
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.container {
  align-items: center;
  background: rgba($white, 0.98);
  color: $blue-dark;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: flex-start;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 3;
  &.dark {
    background: rgba($blue-dark-2, .98);
    color: $white;
  }
}
.button-back {
  left: 66rem;
  position: absolute;
  top: 62rem;
}
.title {
  @include text-ellipsis;
  font-size: 82rem;
  font-weight: 300;
  margin-top: 340rem;
  text-align: center;
  width: 1600rem;
}
.rainbow {
  background-image: url('data:image/png;base64,#{$messages-rainbow-gradient}');
  background-position: top center;
  background-repeat: no-repeat;
  height: 4rem;
  margin-top: 14rem;
  width: 1440rem;
}
.sub-title {
  @include text-ellipsis;
  align-items: flex-end;
  font-size: 40rem;
  font-weight: 300;
  display: flex;
  justify-content: center;
  margin-top: 82rem;
  width: 100%;
}
.pin {
  display: flex;
  height: 350rem;
  font-size: 72rem;
  justify-content: center;
  margin-top: 12rem;
}
</style>
