import keyboardLayouts from 'helpers/keyboardLayouts'

export default {
  namespaced: true,
  state: {
    active: false,
    capsLock: false,
    currentText: '',
    cursorPosition: 0,
    placeholder: '',
    lastClicked: '',
    focusSection: 'keyboard',
    keyboardFor: 'search',
    keyboardLayouts: Object.freeze(keyboardLayouts)
  },
  actions: {
    show ({ state, commit }, { text = '', placeholder = '', keyboardFor = 'search', focusSection = 'keyboard' }) {
      commit('UPDATE_CURRENT_TEXT', text)
      commit('UPDATE_KEYBOARDFOR', keyboardFor)
      commit('UPDATE_CURSOR_POSITION', text.length)
      commit('UPDATE_PLACEHOLDER', placeholder)
      commit('UPDATE_FOCUS_SECTION', focusSection)
      commit('SHOW')
    },
    hide ({ state, commit }) {
      commit('HIDE')
    },
    moveCursor ({ state, commit }, direction) {
      let newPosition
      if (direction === 'end') {
        newPosition = state.currentText.length
      } else {
        newPosition = state.cursorPosition + (direction === 'left' ? -1 : 1)
      }
      commit('UPDATE_CURSOR_POSITION', Math.max(0, Math.min(state.currentText.length, newPosition)))
    },
    clearText ({ state, commit }) {
      commit('UPDATE_CURRENT_TEXT', '')
    }
  },
  getters: {
    getSplitText: state => [
      state.currentText.slice(0, state.cursorPosition),
      state.currentText.slice(state.cursorPosition)
    ]
  },
  mutations: {
    SHOW (state) { state.active = true },
    HIDE (state) { state.active = false },
    UPDATE_CAPS_LOCK (state, newValue) { state.capsLock = newValue },
    UPDATE_CURRENT_TEXT (state, newText) { state.currentText = newText },
    UPDATE_CURSOR_POSITION (state, newCursorPosition) { state.cursorPosition = newCursorPosition },
    UPDATE_KEYBOARDFOR (state, newKeyboardFor) { state.keyboardFor = newKeyboardFor },
    UPDATE_PLACEHOLDER (state, newPlaceholder) { state.placeholder = newPlaceholder },
    UPDATE_FOCUS_SECTION (state, newFocusSection) { state.focusSection = newFocusSection },
    UPDATE_LAST_CLICKED (state, newLastClicked) { state.lastClicked = newLastClicked }
  }
}
