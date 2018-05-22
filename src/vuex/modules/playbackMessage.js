export default {
  namespaced: true,
  state: {
    active: false,
    description: {
      title: '',
      text: '',
      textSub: ''
    }
  },
  actions: {
    toggle ({ state, commit }, { active, description }) {
      if (active) {
        commit('UPDATE_DESCRIPTION', description)
        commit('SET_ACTIVE_ON')
      } else {
        commit('SET_ACTIVE_OFF')
      }
    }
  },
  mutations: {
    SET_ACTIVE_ON (state) {
      state.active = true
    },
    SET_ACTIVE_OFF (state) {
      state.active = false
    },
    UPDATE_DESCRIPTION (state, newDescription) {
      state.description = Object.freeze(newDescription)
    }
  }
}
