<template>
  <transition name="pin-transition" appear>
    <div :class="['container', theme]">
      <div class="top">
        <custom-button
          :active="this.activeLevel === 'back'"
          round icon="back"
          :button-click="mkDoBack()" />
        <span class="title">{{ pageTitle }}</span>
      </div>
      <div class="main">
        <div class="title">
          <span>{{ txtTitle }}</span>
        </div>
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
          >
          </number-picker>
        </div>
      </div>
      <div class="footer">
        <span class="text">{{ footer }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
import toString from 'lodash/fp/toString'
import { mapActions, mapState } from 'vuex'
import common from './_common'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'

const PAGE_TITLE = ['PIN', 'settings_changepin_changepinsection', 'stb_ondemand_detailedscreen_transitionalscreen_purchasing_topright']
const TXT_TITLE = ['stb_settings_personal_pin_title', 'login_editprofile_changepin_enternew', 'stb_ondemand_detailedscreen_transitionalscreen_purchasing_guide']
const TRANSFORM_PIN = function (pin) {
  return toString(pin).replace(/[,]/g, '')
}

export default {
  name: 'Pin',
  mixins: [ common ],
  data () {
    return {
      pageTitle: 'PIN',
      txtTitle: this.loc('stb_settings_personal_pin_title'),
      txtFooter: this.loc('stb_ondemand_detailedscreen_transitionalscreen_purchasing_info')
    }
  },
  computed: {
    footer () {
      return this.$route.params.footer !== null ? this.$route.params.footer : this.txtFooter
    },
    redirectTo () {
      return this.$route.meta.fromRoute
    },
    ...mapState({
      settingsPin: state => state.settings.pin,
      validPin: state => state.settings.validPin,
      attempts: state => state.parentalRating.attempts,
      pinLocked: state => state.parentalRating.pinLocked,
      pinLockedTime: state => state.parentalRating.pinLockedTime
    })
  },
  methods: {
    async proceed () {
      // if (this.pageTitle === 'Change Your Pin') this.sendPin()
      if (this.pageTitle === this.loc('settings_changepin_changepinsection')) {
        this.sendPin()
        return
      }
      await this.checkPin(TRANSFORM_PIN(this.pin))
      // if (this.settingsPin === TRANSFORM_PIN(this.pin)) {
      if (this.validPin) {
        this.$route.params.purpose === 'check' ? this.finish(true) : this.openModal()
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
    sendPin () {
      this.updatePin(TRANSFORM_PIN(this.pin)) // send pin as plain string ex. '0000'
      return this.$router.push({
        name: this.redirectTo
      })
    },
    mkDoBack () {
      let doBack = function () { this.handleKey('BACK') }
      return doBack.bind(this)
    },
    finish (value) {
      return this.$router.push({
        name: this.redirectTo
      })
    },
    showLockMessage () {
      let retryIn = (this.pinLockedTime + 60000 - Date.now()) / 60000

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
          back: false
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
          back: false
        }
      })
    },
    cancel () {
      this.mkDoBack()
    },
    openModal () {
      const description = {
        title: this.loc('stb_settings_personal_pin'),
        titleAbove: this.loc('general_navigation_settings'),
        titleBelow: this.loc('stb_settings_personal_pin_description'),
        svgId: 'settings-pin'
      }
      initialiseSelectList({
        values: {
          items: [ {id: 0, label: this.loc('settings_changepin_changepinsection')} ],
          description: description
        },
        callback: (newValue) => {
          // set ENABLED / DISABLED
          if (newValue[0] === 0) {
            this.pageTitle = this.loc(PAGE_TITLE[1])
            this.txtTitle = this.loc(TXT_TITLE[1])
            this.pin = [null, null, null, null]
            this.position = 5
            this.pinPositions = [5, 5, 5, 5]
            this.currentSelection = 0
          }
        },
        clearText: this.loc('stb_settings_systempreferences_miscellaneous_zapbanner_rememberpin_cancel'),
        clearVisible: true,
        backVisible: true,
        theme: 'light'
      })
    },
    exit () {
      this.currentSelection = 0
      this.activeLevel = 'pin'
      this.$router.push({
        name: this.redirectTo,
        params: {
          setting: 'pin'
        }
      })

      // return 'exit'
    },
    ...mapActions({
      updatePinLocked: 'parentalRating/updatePinLocked',
      resetPinLocked: 'parentalRating/resetPinLocked',
      togglePopup: 'popup/toggle',
      updatePin: 'settings/updatePin',
      checkPin: 'settings/checkPin'
    })
  },
  created () {
    if (this.pinLockedTime < Date.now()) {
      this.resetPinLocked()
    }
    if (this.pinLocked) {
      this.showLockMessage()
    } else {
      // send as config params for dark theme (params: { footer: null, title: 2, purpose: 'check', theme: 'dark' })
      if (this.$route.params.theme) this.theme = this.$route.params.theme
      if (this.$route.params.title) {
        this.pageTitle = this.loc(PAGE_TITLE[this.$route.params.title]) // 2 for Purchasing
        this.txtTitle = this.loc(TXT_TITLE[this.$route.params.title]) // 2
      } else {
        this.pageTitle = this.loc(PAGE_TITLE[0])
        this.txtTitle = this.loc(TXT_TITLE[0])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

.container {
  height: 100%;
  width: 1920rem;
  color: #576567;
  background: rgba(251, 251, 251, 0.9);
}
.container.dark {
  color: #d2d2d2;
  background: rgba(61, 61, 61, 1);
  .main {
    background: #747474;
    color: white;
    box-shadow: 0px 6px 22px 3px rgba(0, 0, 0, 0.35);
  }
}
.top {
  display: flex;
  justify-content: space-between;
  height: 322rem;
  padding: 62rem 66rem 0 66rem;
  .title {
    font-size: 67rem;
    font-weight: 300;
  }
}
.main {
  width: 720rem;
  height: 438rem;
  margin: auto;
  background: white;
  box-shadow: 0px 6px 22px 3px rgba(189,185,189,1);
  .title {
    width: 100%;
    height: 82rem;
    font-size: 28rem;
    font-weight: 300;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
  .pin {
    display: flex;
    justify-content: center;
    height: 350rem;
    font-size: 72rem;
  }
}
.footer {
  position: absolute;
  bottom: 0;
  height: 75rem;
  width: 100%;
  .text {
    display: flex;
    justify-content: center;
    font-size: 28rem;
    font-weight: 200;
  }
}

.pin-transition {
  &-enter, &-leave-to { opacity: 0; }
  &-enter-to, &-leave { opacity: 1; }
  &-enter-active { transition: opacity .6s ease-in-out; }
  &-leave-active { transition: opacity .2s ease-in-out; }
}
</style>
