<template>
  <full-screen-overlay v-if="popupData"
    :back="showBackButton"
    :back-active="activeButtonLevel === 'back'"
    :title="popupData.title"
    :text="popupData.text"
    :text-sub="popupData.textSub"
    :buttons="popupData.buttons"
    :selected-button-index="activeButtonLevel === 'cta' ? activeCtaButton : -1"
    :theme="popupData.theme || 'light'"
    :type="popupData.type"
    :handle-click-button="handleClickButton"
    :handle-click-back="handleClickBack"
  />
</template>

<script>
import { mapState, mapActions } from 'vuex'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import FullScreenOverlay from 'components/FullScreenOverlay'
// import { exitApp } from 'hal'

export default {
  name: 'Popup',
  mixins: [ RegisterKeyHandler ],
  components: { FullScreenOverlay },
  data: () => ({
    activeButtonLevel: 'cta',
    activeCtaButton: 0
  }),
  computed: {
    ...mapState({
      allData: state => state.popup.data
    }),
    popupData () {
      if (this.allData.length !== 0) {
        return this.allData[0]
      }
    },
    showBackButton () {
      return !(this.popupData.back !== undefined && this.popupData.back === false)
    }
  },
  methods: {
    handleKey (key) {
      switch (key) {
        case 'BACK':
          // if (this.popupData.exitApp) { exitApp() }
          this.togglePopup({ active: false })
          break
        case 'OK':
          if (this.activeButtonLevel === 'cta') {
            this.popupData.buttons[this.activeCtaButton].callback()
            this.togglePopup({ active: false, deleteAll: true })
          } else {
            this.togglePopup({ active: false })
          }
          break
        case 'UP':
        case 'DOWN':
          this.changeButtonLevel(key)
          break
        case 'LEFT':
        case 'RIGHT':
          this.moveCtaButton(key)
          break
      }
    },
    handleClickButton (index) {
      this.popupData.buttons[index].callback()
      this.togglePopup({ active: false, deleteAll: true })
    },
    handleClickBack () {
      this.togglePopup({ active: false })
    },
    changeButtonLevel (direction) {
      if (this.activeButtonLevel === 'back' && direction === 'DOWN' && this.popupData.buttons) {
        this.activeButtonLevel = 'cta'
      } else if (this.activeButtonLevel === 'cta' && direction === 'UP' && this.showBackButton) {
        this.activeButtonLevel = 'back'
      }
    },
    moveCtaButton (direction) {
      if (this.activeButtonLevel !== 'cta') return

      const offset = direction === 'LEFT' ? -1 : 1
      this.activeCtaButton = Math.min(Math.max(this.activeCtaButton + offset, 0), this.popupData.buttons.length - 1)
    },
    ...mapActions({
      togglePopup: 'popup/toggle',
      exitApp: 'general/exitApp'
    })
  },
  created () {
    this.activeButtonLevel = this.popupData.buttons ? 'cta' : 'back'
    this.activeCtaButton = this.popupData.selectedButtonIndex
  },
  watch: {
    popupData () {
      this.activeButtonLevel = this.popupData.buttons ? 'cta' : 'back'
      this.activeCtaButton = this.popupData.selectedButtonIndex
    }
  }
}
</script>
