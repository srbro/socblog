<template>
  <language-selection-list
    :items="languages"
    :active-index="currentLanguage"
    :handle-click="handleClick"
  />
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { save, getDisplayDisclaimer } from 'hal'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import { emitKeyPress } from 'helpers/keyHold'
import LanguageSelectionList from 'components/LanguageSelectionList'
// import { fetchLanguages } from 'helpers/api'

export default {
  name: 'LanguageSelection',
  mixins: [ RegisterKeyHandler ],
  data () {
    return {
      currentLanguage: 2
    }
  },

  components: { LanguageSelectionList },
  computed: {
    ...mapState({
      allLanguages: state => state.settings.values.languages,
      showTrainingScreens: state => state.general.gui.showTrainingScreens,
      accessToken: state => state.auth.accessToken
    }),
    languages () {
      return this.allLanguages.map(lang => { return lang.label })
    }
  },
  methods: {
    disclaimer (pushRoute) {
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
                  this.$router.push({ name: pushRoute })
                }
              }
            ],
            selectedButtonIndex: 0
          }
        })
      } else {
        this.$router.push({ name: pushRoute })
      }
    },
    ...mapActions({
      initAuth: 'auth/initAuth',
      fetchLanguage: 'settings/fetchLanguage',
      updateInterfaceLanguage: 'settings/updateInterfaceLanguage',
      setNewLanguage: 'auth/setNewLanguage',
      otpPassThrough: 'auth/otpPassThrough',
      exitApp: 'general/exitApp',
      togglePopup: 'popup/toggle'
    }),
    handleKey (key) {
      switch (key) {
        case 'OK':
          const lang = this.allLanguages[this.currentLanguage].id
          save('lang', lang)
          this.setNewLanguage()
          this.updateInterfaceLanguage({update: true, name: 'interfaceLanguage', value: lang}).then(response => {
            this.otpPassThrough().then(resp => {
              if (resp) {
                this.disclaimer('Loading')
              } else {
                this.disclaimer('OTPActivation')
              }
            }).catch(respose => {
              this.disclaimer('OTPActivation')
            })
          }).catch(response => {
            this.disclaimer('Loading')
          })
          break
        case 'UP':
          this.currentLanguage = Math.max(this.currentLanguage - 1, 0)
          break
        case 'DOWN':
          this.currentLanguage = Math.min(this.currentLanguage + 1, this.languages.length - 1)
          break
        case 'HOLD_STOP': // l for web
          break
        case 'UP_HOLD':
        case 'DOWN_HOLD':
          if (emitKeyPress({ delay: 150 })) {
            this.handleHoldKey(key)
          }
          break
        case 'BACK':
          this.exitApp()
          break
      }
    },
    handleHoldKey (key) {
      this.currentLanguage = key === 'UP_HOLD' ? Math.max(this.currentLanguage - 1, 0) : Math.min(this.currentLanguage + 1, this.languages.length - 1)
    },
    handleClick (index) {
      this.currentLanguage = index
      this.handleKey('OK')
    }
  }
}
</script>
