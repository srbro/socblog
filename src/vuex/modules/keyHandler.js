export default {
  namespaced: true,
  state: {
    registeredHandlers: new Map()
  },
  actions: {
    registerComponentHandler ({ state, commit }, { name, handler }) {
      if (!state.registeredHandlers.has(name)) {
        commit('SET_REGISTERED_HANDLERS', { name, handler })
      }
    },
    unregisterComponentHandler ({ state, commit }, name) {
      if (state.registeredHandlers.has(name)) {
        commit('REMOVE_REGISTERED_HANDLERS', name)
      }
    }
  },
  mutations: {
    SET_REGISTERED_HANDLERS (state, { name, handler }) { state.registeredHandlers.set(name, handler) },
    REMOVE_REGISTERED_HANDLERS (state, name) { state.registeredHandlers.delete(name) }
  }
}
