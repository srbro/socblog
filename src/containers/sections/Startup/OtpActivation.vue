<template>
  <activation-serial v-if="provisioningMode === 'SERIAL'" key="activation-serial"
    bg-image-url = "../../static/uc/images/activation-blur.jpg"
    :title = "title"
    :activationText1 = "activationText1"
    :activationText2 = "activationText2"
    :activationText3 = "activationText3"
    :activationText4 = "activationText4"
    :activationCode = "activationCode"
    activationTextHtml = "<div>Go to<span class='blueText'>loremipsum.com/activate</span>on your computer or mobile device.</div>"
    :text = "text"
    :pin = "otp"
    :serialLabel = "serialLabel"
    :serial = "serial"
    :footer-text1 = "footertext1"
    :blackTheme = "isStbProvisioning"
  />
  <activation v-else key="activation-otp"
    bg-image-url = "../../static/uc/images/activation-blur.jpg"
    :title = "title"
    :activationText1 = "activationText1"
    :activationText2 = "activationText2"
    :activationText3 = "activationText3"
    :activationText4 = "activationText4"
    :activationCode = "activationCode"
    activationTextHtml = "<div>Go to<span class='blueText'>loremipsum.com/activate</span>on your computer or mobile device.</div>"
    :text = "text"
    :pin = "otp"
    :footer-text1 = "footertext1"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { getSerial, setProvisoningDone } from 'hal'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import Activation from 'components/Activation'
import ActivationSerial from 'components/ActivationSerial'
import { APP_MODE_STB_PROVISIONING, AUTH_DEVICE_SUCCESS, AUTH_DEVICE_FORBIDDEN } from 'helpers/consts.js'

const ADD_MILISCEONDS = 1000
const ADD_MILISCEONDS_DELAY = 2000
const CHACK_OTP_DELAY = 10000

export default {
  name: 'OTPActivation',
  mixins: [ RegisterKeyHandler ],
  components: { Activation, ActivationSerial },
  data () {
    return {
      text: '.......',
      title: this.loc('stb_login_activation_title'),
      activationText1: this.loc('stb_login_activation_instructions_item1_goto_location'),
      activationText2: this.loc('stb_login_activation_instructions_item1_url'),
      activationText3: this.loc('stb_login_activation_instructions_item1_computer_mobiledevice'),
      activationText4: this.loc('stb_login_activation_instructions_item2'),
      activationCode: this.loc('stb_login_activation_activationcode'),
      activationTextHtml: this.loc('stb_login_activation_title'),
      footertext1: this.loc('stb_login_activation_updateinfo'),
      footertext2: this.loc('stb_login_activation_title'),
      serial: getSerial(),
      serialLabel: this.loc('stb_settings_systempreferences_about_serialnumber')
    }
  },
  computed: {
    ...mapState({
      otp: state => state.auth.otp,
      device_number: state => state.auth.deviceNumber,
      accessToken: state => state.auth.accessToken,
      appState: state => state.general.appState,
      provisioningMode: state => state.auth.provisioningMode,
      stbMode: state => state.auth.stbMode,
      isStbProvisioning: state => state.general.appMode === APP_MODE_STB_PROVISIONING
    })
  },
  methods: {
    ...mapActions({
      getOtp: 'auth/getOtp',
      checkOtpGrant: 'auth/checkOtpGrant',
      popuptToggle: 'popup/toggle',
      onResumePauseActivity: 'general/onResumePauseActivity',
      exitApp: 'general/exitApp',
      fetchChannels: 'general/fetchChannels'
    }),
    handleKey (key) {
      switch (key) {
        case 'BACK':
          this.exitApp()
          break
        case 'OK':
          // secret button for reload otp
          this.relaodOtp()
          break
      }
    },
    checkValid () {
      clearTimeout(this.checkTimeout)
      this.checkOtpGrant().then(result => {
        if (result === AUTH_DEVICE_SUCCESS) {
          clearTimeout(this.otpTimeout)
          if (this.isStbProvisioning) {
            this.doStbProvisioning()
          } else {
            this.$router.push({ name: 'Loading', params: {toRoute: 'Home'} })
          }
        } else if (result === AUTH_DEVICE_FORBIDDEN) {
          this.displayAuthError({
            title: this.loc('stb_login_activation_errormessage_title'),
            text: this.loc('message_devicemanagement'),
            label: this.loc('stb_login_activation_errormessage_action_retry')
          })
        } else {
          this.checkTimeout = setTimeout(this.checkValid, CHACK_OTP_DELAY)
        }
      }).catch(result => {
        this.checkTimeout = setTimeout(this.checkValid, CHACK_OTP_DELAY)
      })
    },
    doStbProvisioning () {
      console.log('OTPACTIVATION STB PROVISIONING')
      setProvisoningDone(this.stbMode)
      if (this.stbMode === 'HYBRID') {
        console.log('OTPACTIVATION HYBRID MODE')
        this.footertext1 = this.loc('stb_login_activation_updateinfo') + ' Hybrid ...'
        this.fetchChannels()
      } else {
        console.log('OTPACTIVATION OTT MODE')
        this.footertext1 = this.loc('stb_login_activation_updateinfo') + '..'
      }
    },
    relaodOtp () {
      clearTimeout(this.otpTimeout)
      this.getOtp().then(result => {
        this.otpTimeout = setTimeout(this.relaodOtp, result * ADD_MILISCEONDS + ADD_MILISCEONDS_DELAY)
      }).catch(result => {
        this.displayError(result)
        // this.otpTimeout = setTimeout(this.relaodOtp, result * ADD_MILISCEONDS + ADD_MILISCEONDS_DELAY)
      })
    },
    displayError (result) {
      // const _this = this
      this.popuptToggle({
        active: true,
        data: {
          type: 'reminder',
          title: this.loc('stb_login_activation_errormessage_title'),
          text: result.message,
          priority: 1,
          back: false,
          buttons: [
            {
              id: 'view',
              label: this.loc('stb_login_activation_errormessage_action_retry'),
              callback (newValue) {
                // _this.$router.go(_this.$router.currentRoute)
                window.location.reload()
              }
            }
          ],
          selectedButtonIndex: 0
        }
      })
    },
    displayAuthError ({title, text, label}) {
      const _this = this
      this.popuptToggle({
        active: true,
        data: {
          type: 'reminder',
          title,
          text,
          priority: 1,
          back: false,
          buttons: [
            {
              id: 'view',
              label,
              callback (newValue) {
                // _this.$router.go(_this.$router.currentRoute)
                _this.relaodOtp()
              }
            }
          ],
          selectedButtonIndex: 0
        }
      })
    }
  },
  watch: {
    appState: function (newState) {
      if (newState) {
        this.getOtp().then(result => {
          this.otpTimeout = setTimeout(this.relaodOtp, result * ADD_MILISCEONDS + ADD_MILISCEONDS_DELAY)
          this.checkValid()
        }).catch(result => {
          this.displayError(result)
        })
      } else {
        clearTimeout(this.otpTimeout)
        clearTimeout(this.checkTimeout)
      }
    }
  },
  async created () {
    if (this.accessToken && this.device_number) {
      this.getOtp().then(result => {
        if (result !== 0) {
          this.otpTimeout = setTimeout(this.relaodOtp, result * ADD_MILISCEONDS + ADD_MILISCEONDS_DELAY)
          this.checkValid()
        } else {
          this.displayError(result)
        }
      }).catch(result => {
        this.displayError(result)
      })
    } else {
      this.$router.push({ name: 'Loading' })
    }
  },
  destroyed () {
    clearTimeout(this.otpTimeout)
    clearTimeout(this.checkTimeout)
  }
}
</script>
