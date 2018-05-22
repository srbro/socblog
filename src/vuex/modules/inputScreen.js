export default {
  namespaced: true,
  state: {
    active: false,
    icon: '',
    text: '',
    callback: () => {}
  },
  actions: {
    show ({ state, commit }, { text = '', icon, callback }) {
      if (callback === undefined || icon === undefined) throw new Error('You must define callback and icon parameter.')
      commit('UPDATE_ICON', icon)
      commit('UPDATE_TEXT', text)
      commit('UPDATE_CALLBACK', callback)
      commit('SHOW')
    },
    hide ({ state, commit }) {
      commit('HIDE')
    }
  },
  mutations: {
    SHOW (state) { state.active = true },
    HIDE (state) { state.active = false },
    UPDATE_ICON (state, newIcon) { state.icon = newIcon },
    UPDATE_TEXT (state, newText) { state.text = newText },
    UPDATE_CALLBACK (state, newCallback) { state.callback = newCallback }
  }
}
