<template>
    <keyboard-overlay
      :caps-lock="capsLock"
      :confirm-text="keyboardFor === 'search' ? loc('general_search_searchcontent') : loc('stb_settings_personal_favorites_tvlists_newlist_button_ok')"
      :keys="keys"
      :language="keyboardLabel"
      :placeholder="placeholder"
      :selected-confirm="focusSection === 'confirm'"
      :selected-key="focusSection === 'keyboard' ? selectedKeyIndex : [-1, -1]"
      :selected-suggestion="focusSection === 'suggestions' ? selectedSuggestion : -1"
      :disable-submit="this.splitText[0].length + this.splitText[1].length < 3"
      :suggestions="suggestions"
      :text="splitText"
      :click-fn="clickFn"
      :hoverFn="hoverFn"
      :mouse-leave-fn="mouseLeaveFn"
    />
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
// import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import KeyboardOverlay from 'components/KeyboardOverlay'
import { EventBus } from 'helpers/eventBus'
import { emitKeyPress } from 'helpers/keyHold'

export default {
  name: 'Keyboard',
  // mixins: [ RegisterKeyHandler ],
  components: { KeyboardOverlay },
  data: () => ({
    selectedKeyIndex: [0, 0],
    suggestions: [],
    selectedSuggestion: 0,
    keysLang: ''
  }),
  computed: {
    selectedKey () {
      return this.keys[this.selectedKeyIndex[1]][this.selectedKeyIndex[0]]
    },
    keys () {
      return this.keyboardLayouts[this.keysLang] === undefined ? this.keyboardLayouts['eng'].keys : this.keyboardLayouts[this.keysLang].keys
    },
    keyboardLabel () {
      return this.keyboardLayouts[this.keysLang] === undefined ? this.keyboardLayouts['eng'].label : this.keyboardLayouts[this.keysLang].label
    },
    ...mapState({
      currentText: state => state.keyboard.currentText,
      capsLock: state => state.keyboard.capsLock,
      placeholder: state => state.keyboard.placeholder,
      keyboardFor: state => state.keyboard.keyboardFor,
      keyboardDefaultLanguage: state => state.settings.keyboardLanguage,
      keyboardLayouts: state => state.keyboard.keyboardLayouts,
      focusSection: state => state.keyboard.focusSection
    }),
    ...mapGetters({
      splitText: 'keyboard/getSplitText'
    })
  },
  created () {
    this.keysLang = this.keyboardDefaultLanguage
  },
  mounted () {
    EventBus.$on('keyboard', (obj) => {
      if (obj.action === 'handleKey') {
        this.handleKey(obj.value)
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('keyboard')
  },
  methods: {
    // attached in mixin RegisterKeyHandler
    clickFn (key, offsetX, offsetY) {
      if (key === 'SEARCH') {
        this.lastClicked('confirm')
      } else {
        this.inputCharacter(key)
      }
    },
    hoverFn (key, offsetX, offsetY) {
      if (this.focusSection !== 'keyboard') {
        this.updateFocusSection('keyboard')
      }
      this.selectedKeyIndex = [offsetX, offsetY]
    },
    mouseLeaveFn () {
      this.selectedKeyIndex = [-1, -1]
    },
    handleKey (key) {
      if (this.focusSection === 'confirm') {
        switch (key) {
          case 'HOLD_STOP': // l for web
          case 'RIGHT':
          case 'UP':
          case 'DOWN':
          case 'LEFT_HOLD': // j for web
          case 'RIGHT_HOLD': // k for web
          case 'UP_HOLD':
          case 'DOWN_HOLD':
          case 'SHIFT':
            break
          case 'OK':
            this.lastClicked('confirm')
            break
          case 'LEFT':
            this.updateFocusSection('keyboard')
            break
          case 'BACKSPACE':
            this.inputCharacter(key)
            break
          default:
            this.inputCharacter(key)
            break
        }
      } else if (this.focusSection === 'suggestions') {
        // Suggestions focused
        switch (key) {
          case 'UP':
            this.updateFocusSection('unfocused')
            break
          case 'DOWN':
            this.updateFocusSection('keyboard')
            break
          case 'LEFT':
          case 'RIGHT':
            this.moveSuggestionSelection(key)
            break
          case 'OK':
            this.updateCurrentText(this.suggestions[this.selectedSuggestion])
            // this.lastClicked(this.suggestions[this.selectedSuggestion]) // later
            this.moveCursor('end')
        }
      } else {
        // Keyboard focused
        if (key === 'UP' && this.selectedKeyIndex[1] === 0) {
          this.updateFocusSection(this.suggestions.length > 0 ? 'suggestions' : 'unfocused')
          return
        } else if (key === 'RIGHT' && this.selectedKeyIndex[0] === this.keys[this.selectedKeyIndex[1]].length - 1) {
          this.updateFocusSection('confirm')
          return
        }

        switch (key) {
          case 'HOLD_STOP': // l for web
            this.fasterAnimation = false
            break
          case 'LEFT':
          case 'RIGHT':
          case 'UP':
          case 'DOWN':
            this.moveKeySelection(key)
            break
          case 'LEFT_HOLD': // j for web
          case 'RIGHT_HOLD': // k for web
            if (emitKeyPress({ delay: 50 })) {
              this.moveKeySelection(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
              this.fasterAnimation = true
            }
            break
          case 'UP_HOLD':
          case 'DOWN_HOLD':
            if (emitKeyPress({ delay: 50 })) {
              this.moveKeySelection(key === 'UP_HOLD' ? 'UP' : 'DOWN')
              this.fasterAnimation = true
            }
            break
          case 'OK':
            this.inputCharacter()
            break
          case 'SHIFT':
            break
          case 'BACKSPACE':
            this.inputCharacter(key)
            break
          default:
            this.inputCharacter(key)
            this.updateFocusSection('confirm')
            break
        }
      }
    },
    moveSuggestionSelection (key) {
      const offset = key === 'LEFT' ? -1 : 1
      this.selectedSuggestion = Math.max(0, Math.min(this.suggestions.length - 1, this.selectedSuggestion + offset))
    },
    moveKeySelection (key) {
      const offset = {
        UP: [0, -1],
        DOWN: [0, 1],
        LEFT: [-1, 0],
        RIGHT: [1, 0]
      }[key]

      this.selectedKeyIndex = [
        Math.max(0, Math.min(this.keys[0].length - 1, this.selectedKeyIndex[0] + offset[0])),
        Math.max(0, Math.min(this.keys.length - 1, this.selectedKeyIndex[1] + offset[1]))
      ]

      if (typeof this.selectedKey === 'number') {
        this.selectedKeyIndex = [this.selectedKey, this.selectedKeyIndex[1]]
      }
    },
    inputCharacter (key) {
      let character = key || this.selectedKey
      if (character === 'SPACE') character = ' '
      if (this.capsLock) character = character.toUpperCase()
      this.lastClicked(character)

      switch (character) {
        case 'CAPSLOCK':
          this.updateCapsLock(!this.capsLock)
          break
        case 'BACKSPACE':
          this.updateCurrentText(this.splitText[0].slice(0, -1) + this.splitText[1])
          this.moveCursor('left')
          break
        case 'LEFT':
          this.moveCursor('left')
          break
        case 'RIGHT':
          this.moveCursor('right')
          break
        case 'LANGUAGE':
          let index = Object.keys(this.keyboardLayouts).indexOf(this.keysLang)
          index = index++ >= Object.keys(this.keyboardLayouts).length - 1 ? 0 : index++
          this.keysLang = Object.keys(this.keyboardLayouts)[index]
          break
        default:
          if (this.splitText[0].length + this.splitText[1].length < 20) {
            this.updateCurrentText(this.splitText[0] + character + this.splitText[1])
            this.moveCursor('right')
            this.updateCapsLock(false)
          }
          break
      }
    },
    ...mapMutations({
      updateCurrentText: 'keyboard/UPDATE_CURRENT_TEXT',
      updateCapsLock: 'keyboard/UPDATE_CAPS_LOCK',
      updateFocusSection: 'keyboard/UPDATE_FOCUS_SECTION',
      lastClicked: 'keyboard/UPDATE_LAST_CLICKED'
    }),
    ...mapActions({
      inputScreenHide: 'inputScreen/hide',
      hideKeyboard: 'keyboard/hide',
      moveCursor: 'keyboard/moveCursor'
    })
  }
}
</script>
