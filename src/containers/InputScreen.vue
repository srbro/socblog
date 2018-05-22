<template>
  <div class="container">
    <input-header
      :back-active="activeSection === 'back'"
      :icon="icon"
      :placeholder="placeholder"
      :text="splitText"
      :click-fn="handleClick"
    />
    <keyboard ref="keyboard" />
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import InputHeader from 'components/InputHeader'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import HistoryManager from 'mixins/HistoryManager'
import Keyboard from 'containers/Keyboard'
import { EventBus } from 'helpers/eventBus'

export default {
  name: 'InputScreen',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { InputHeader, Keyboard },
  data: () => ({
    activeSection: 'keyboard'
  }),
  computed: {
    ...mapState({
      icon: state => state.inputScreen.icon,
      text: state => state.inputScreen.text,
      callback: state => state.inputScreen.callback,
      keyboardLastClicked: state => state.keyboard.lastClicked,
      focusSection: state => state.keyboard.focusSection,
      placeholder: state => state.keyboard.placeholder
    }),
    ...mapGetters({
      splitText: 'keyboard/getSplitText'
    })
  },
  methods: {
    handleClick (parent) {
      switch (parent) {
        case 'BACK':
          this.hideInputScreen()
          this.doHistoryBack()
          break
        case 'FIELD':
          if (this.activeSection !== 'keyboard') {
            this.activeSection = 'keyboard'
            this.updateFocusSection('keyboard')
          }
      }
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.hideInputScreen()
        this.doHistoryBack()
      }
      if (this.activeSection === 'keyboard') {
        // this.$refs.keyboard.handleKey(key)
        EventBus.$emit('keyboard', {action: 'handleKey', value: key})
      } else if (this.activeSection === 'back') {
        // Button focused
        switch (key) {
          case 'DOWN':
          case 'RIGHT':
            this.activeSection = 'keyboard'
            this.updateFocusSection('keyboard')
            break
          case 'OK':
            // this.$router.push({name: 'Settings'})
            this.hideInputScreen()
            this.doHistoryBack()
        }
      }
    },
    ...mapActions({
      showKeyboard: 'keyboard/show',
      hideInputScreen: 'inputScreen/hide'
    }),
    ...mapMutations({
      updateFocusSection: 'keyboard/UPDATE_FOCUS_SECTION'
    })
  },
  watch: {
    focusSection (section) {
      if (section === 'unfocused') {
        this.activeSection = 'back'
      }
    },
    keyboardLastClicked (clicked) {
      if (clicked === 'confirm') {
        if (this.splitText[0].length > 0) {
          this.callback(this.splitText[0])
          this.hideInputScreen()
        }
      }
    }
  },
  created () {
    this.showKeyboard({
      placeholder: this.loc('stb_settings_personal_favorites_tvlists_newlist_section_newlist'),
      text: this.text,
      keyboardFor: 'inputScreen'
    })
  }
}
</script>

<style lang="scss" scoped>

.container {
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  background: #f1f2f2;
}

</style>
