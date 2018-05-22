import { search } from 'helpers/api'

export default {
  namespaced: true,
  state: {
    data: {}
  },
  actions: {
    fetchSearchData: async ({ dispatch, commit, rootGetters }, q = '') => {
      return new Promise((resolve, reject) => {
        search(q).then((response) => {
          commit('UPDATE_SEARCH', response.data)
          resolve()
        })
      })
    },
    clearSearchData ({ state, commit }) {
      commit('UPDATE_SEARCH', {})
    }
  },
  mutations: {
    UPDATE_SEARCH (state, newData) { state.data = newData }
  }
}
