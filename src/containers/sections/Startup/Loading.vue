<template>
  <logo-message 
    :message="message"
    :logoAnimation="firstLoad"
    :display="true"
    :blackTheme="isStbProvisioning"
    v-on:end="animationEnd"/>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'

import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import LogoMessage from 'components/LogoMessage'
import { getPlatform, getDisplayDisclaimer } from 'hal'
import isEmpty from 'lodash/fp/isEmpty'
// import store from 'src/vuex/store'
import { loadData } from 'src/helpers/data'
// import { sleep } from 'helpers/oneliners'
import { APP_MODE_STB_PROVISIONING } from 'helpers/consts'

export default {
  name: 'Loading',
  mixins: [ RegisterKeyHandler ],
  data () {
    return {
      message: '',
      logoAnimationEnd: false
    }
  },
  components: { LogoMessage },
  computed: {
    ...mapState({
      showLanguageSelection: state => state.general.gui.showLanguageSelection,
      showTrainingScreens: state => state.general.gui.showTrainingScreens,
      loadingRedirectRoute: state => state.auth.loadingRedirectRoute,
      toggleLoadingMessage: state => state.auth.toggleLoadingMessage,
      forceFirstPage: state => state.auth.forceFirstPage,
      forceFirstPageParams: state => state.auth.forceFirstPageParams,
      signed: state => state.auth.signed,
      displayError: state => state.auth.displayError,
      firstLoad: state => state.auth.firstLoad,
      isStbProvisioning: state => state.general.appMode === APP_MODE_STB_PROVISIONING
    }),
    displayLogo () {
      return getPlatform() !== 'android_tv'
    }
  },
  watch: {
    toggleLoadingMessage: function (newState) {
      if (newState) {
        this.message = this.loc('login_loading')
      } else {
        this.message = ''
      }
    },
    loadingRedirectRoute: function (newState) {
      if (this.signed) {
        if (getDisplayDisclaimer()) {
          this.togglePopup({
            active: true,
            data: {
              type: 'disclaimer',
              title: this.loc('loading_disclaimer_title'),
              text: this.loc('loading_disclaimer'),
              priority: 1,
              back: false,
              buttons: [
                {
                  id: 'view',
                  label: this.loc('loading_disclaimer_button'),
                  callback: (newValue) => {
                    this.fetchData(newState)
                  }
                }
              ],
              selectedButtonIndex: 0
            }
          })
        } else {
          this.fetchData(newState)
        }
      } else {
        this.finish(newState)
      }
    },
    displayError: function (newState) {
      this.errorDisplay(newState)
    }
  },
  methods: {
    ...mapActions({
      loadApp: 'general/loadApp',
      exitApp: 'general/exitApp',
      togglePopup: 'popup/toggle',
      resetForceFirstPage: 'auth/resetForceFirstPage'
    }),
    ...mapMutations({
      mouseEnabled: 'general/SET_MOUSE_ENABLED'
    }),
    handleKey (key) {
      if (key === 'BACK') {
        this.exitApp()
      }
    },
    async fetchData (route) {
      let response = await loadData()
      if (response === 'ok') {
        this.finish(route || 'Home')
      } else {
        this.errorFetchDataDisplay()
      }
    },
    animationEnd () {
      this.logoAnimationEnd = true
    },
    finish (route) {
      if (this.logoAnimationEnd || !this.firstLoad) {
        if (isEmpty(this.forceFirstPageParams)) {
          this.$router.push({name: route})
        } else {
          this.$router.push({name: route, params: this.forceFirstPageParams})
          this.resetForceFirstPage()
        }
      } else {
        setTimeout(function () {
          this.finish(route)
        }.bind(this), 200)
      }
    },
    errorFetchDataDisplay () {
      this.togglePopup({
        active: true,
        data: {
          type: 'reminder',
          title: this.loc('message_server_error_title'),
          text: this.loc('message_server_error_description'),
          priority: 1,
          back: false,
          buttons: [
            {
              id: 'view',
              label: this.loc('message_server_error_tryagain'),
              callback () {
                window.location.reload()
              }
            }
          ],
          selectedButtonIndex: 0
        }
      })
    },
    errorDisplay (response) {
      this.togglePopup({
        active: true,
        data: {
          type: 'reminder',
          title: this.loc('stb_login_activation_errormessage_title'),
          text: String(response),
          priority: 1,
          back: false,
          buttons: [
            {
              id: 'view',
              label: this.loc('stb_login_activation_errormessage_action_retry'),
              callback () {
                window.location.reload()
              }
            }
          ],
          selectedButtonIndex: 0
        }
      })
    }
  },
  async created () {
    console.log('PLATFORM', getPlatform())
    // console.log('QUERY PARAM', this.$route.query.mouse)
    // if (getPlatform() === 'lg_web_os' || getPlatform() === 'stb_kaon') {
    if (getPlatform() === 'stb_thc') {
      this.mouseEnabled(true)
      if (this.$route.query.mouse === 'false') { // localhost:8080/#/no-nav/loading?mouse=false
        this.mouseEnabled(false)
      }
    }
    if (this.signed) {
      const pageRoute = this.forceFirstPage
      if (pageRoute) this.resetForceFirstPage()
      this.fetchData(pageRoute)
    }
    if (this.toggleLoadingMessage) {
      this.message = this.loc('login_loading')
    } else {
      this.message = ''
    }
  }
}
</script>
