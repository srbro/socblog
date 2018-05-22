import { fetchLandingPages } from 'helpers/api'
import { parseLandingPageData } from 'helpers/data'

export default {
  namespaced: true,
  state: {
    data: []
  },
  actions: {
    fetchLandingPageData: async ({ dispatch, commit, rootGetters, rootState }) => {
      return new Promise((resolve, reject) => {
        fetchLandingPages().then((response) => {
          let parsedData = parseLandingPageData({ data: response.data.stripes, vodOption: response.data.vodOption })
          commit('UPDATE_LANDING_PAGE', parsedData)
          commit('vod/UPDATE_VOD_POLICY', response.data.vodOption, { root: true })
          resolve()
        })
      })
    }
  },
  mutations: {
    UPDATE_LANDING_PAGE (state, newData) {
      state.data = Object.freeze(newData)
    }
  }
}
