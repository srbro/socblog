export default {
  namespaced: true,
  state: {
    lastClick: {
      id: null,
      className: null,
      params: null
    }
  },
  actions: {
    click ({ commit }, { id, className, params }) {
      commit('UPDATE_CLICK', {
        id,
        className: !!className === true ? className : null,
        params: !!params === true ? params : null
      })
    }
  },
  mutations: {
    UPDATE_CLICK (state, newLastClick) {
      state.lastClick = Object.freeze(newLastClick)
    }
  }
}
