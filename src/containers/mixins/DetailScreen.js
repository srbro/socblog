import { mapActions } from 'vuex'

export default {
  data: () => ({
    activeCtaButton: 0,
    activeButtonLevel: 'cta'
  }),
  methods: {
    handleKeyCommon (key) {
      switch (key) {
        case 'BACK':
          this.doHistoryBack()
          break
        case 'LEFT':
        case 'RIGHT':
          return this.moveCtaButton(key)
        case 'UP':
        case 'DOWN':
          return this.changeButtonLevel(key)
        case 'OK':
          return this.pressActiveButton()
      }
    },
    moveCtaButton (direction) {
      if (this.activeButtonLevel !== 'cta') return

      const offset = direction === 'LEFT' ? -1 : 1
      if (this.activeCtaButton === 0 && offset === -1) {
        this.handleKeyCommon('BACK')
      } else {
        this.activeCtaButton = Math.min(Math.max(this.activeCtaButton + offset, 0), this.buttons.length - 1)
      }
    },
    changeButtonLevel (direction) {
      const offset = direction === 'UP' ? -1 : 1
      const currentLevelIndex = this.buttonLevels.indexOf(this.activeButtonLevel)
      this.activeButtonLevel = this.buttonLevels[Math.min(Math.max(currentLevelIndex + offset, 0), this.buttonLevels.length - 1)]
    },
    ...mapActions({
      togglePopup: 'popup/toggle'
    })
  }
}
